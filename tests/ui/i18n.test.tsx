import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryProjectRepository } from '../../src/storage/memoryRepository';
import { goTo, makeProject, renderApp, seededRepo } from '../helpers';

beforeEach(() => {
  window.location.hash = '';
});

describe('French interface', () => {
  it('switches language from the header, remembers it, and sets <html lang>', async () => {
    const user = userEvent.setup();
    const first = renderApp(await seededRepo([makeProject('Bonnet', ['Bord'])]));

    expect(await screen.findByRole('heading', { name: 'Your projects' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Passer en français' }));
    expect(screen.getByRole('heading', { name: 'Vos projets' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('fr');
    expect(screen.getByRole('button', { name: 'Switch to English' })).toBeInTheDocument();

    first.unmount();
    renderApp(await seededRepo([]));
    expect(await screen.findByRole('heading', { name: 'Vos projets' })).toBeInTheDocument();
  });

  it('uses French craft terms and counts in French', async () => {
    const user = userEvent.setup();
    const knit = makeProject('Pull', ['Manche']);
    const hook = makeProject('Bonnet', ['Calotte'], 'crochet');
    renderApp(await seededRepo([knit, hook]), 'fr');

    goTo(`#/project/${knit.id}`);
    const card = within((await screen.findByRole('heading', { name: 'Manche', level: 3 })).closest('article')!);
    const down = card.getByRole('button', { name: 'Rangs : moins 1' });
    expect(down).toBeDisabled();
    await user.click(card.getByRole('button', { name: 'Rangs : plus 1' }));
    await user.click(card.getByRole('button', { name: 'Mailles : plus 1' }));
    expect(card.getByRole('button', { name: /^Rangs : 1\./ })).toBeInTheDocument();
    expect(card.getByText('En cours')).toBeInTheDocument();

    // Typed value validation is French.
    await user.click(card.getByRole('button', { name: /^Rangs : 1\./ }));
    const input = card.getByRole('textbox');
    expect(input).toHaveAccessibleName(/saisir une valeur/);
    await user.clear(input);
    await user.type(input, 'abc{Enter}');
    expect(card.getByRole('alert')).toHaveTextContent('Saisissez un nombre entier');

    // Editor labels and validation.
    await user.click(screen.getByRole('button', { name: 'Modifier Manche' }));
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByLabelText("Taille d'aiguille")).toBeInTheDocument();
    expect(dialog.getByLabelText('Tours')).toBeInTheDocument();
    await user.clear(dialog.getByLabelText('Nom'));
    await user.click(dialog.getByRole('button', { name: 'Enregistrer' }));
    expect(dialog.getByText('Le nom de la partie est obligatoire.')).toBeInTheDocument();
    await user.click(dialog.getByRole('button', { name: 'Annuler' }));

    goTo(`#/project/${hook.id}`);
    await user.click(await screen.findByRole('button', { name: 'Modifier Calotte' }));
    expect(within(screen.getByRole('dialog')).getByLabelText('Taille de crochet')).toBeInTheDocument();
  });

  it('shows the overview and archived projects in French', async () => {
    const user = userEvent.setup();
    const old = { ...makeProject('Vieille écharpe'), archived: true };
    renderApp(await seededRepo([{ ...makeProject('Chaussettes'), status: 'in_progress' }, old]), 'fr');

    expect(await screen.findByRole('heading', { name: 'Vos projets', level: 1 })).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Projets' })).getByText('Chaussettes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Projets archivés (1)' }));
    expect(within(screen.getByRole('list', { name: 'Projets archivés' })).getByText('Vieille écharpe')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Retour à vos projets' }));
    expect(screen.getByText('Chaussettes')).toBeInTheDocument();
  });

  it('creates French sample projects on a first launch in French', async () => {
    renderApp(new MemoryProjectRepository(), 'fr');
    expect(await screen.findByRole('heading', { name: "Pull d'automne", level: 3 })).toBeInTheDocument();
    expect(screen.getAllByText('Exemple')).toHaveLength(3);
  });

  it('can switch language from Settings without changing data', async () => {
    const user = userEvent.setup();
    const repo = await seededRepo([makeProject('Écharpe', ['Corps'])]);
    renderApp(repo);
    goTo('#/settings');
    await user.click(await screen.findByLabelText('Français'));
    expect(screen.getByRole('heading', { name: 'Vos données', level: 1 })).toBeInTheDocument();
    await user.click(screen.getByLabelText('English'));
    expect(screen.getByRole('heading', { name: 'Your data', level: 1 })).toBeInTheDocument();
    await waitFor(async () => {
      const [p] = await repo.loadAll();
      expect(p).toMatchObject({ name: 'Écharpe', craft: 'knitting', status: 'planned' });
    });
  });
});
