import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { SWATCHES } from '../../src/domain/craft';
import { MemoryProjectRepository } from '../../src/storage/memoryRepository';
import type { ProjectRepository } from '../../src/storage/repository';
import { makeProject, renderApp, seededRepo } from '../helpers';

beforeEach(() => {
  window.location.hash = '';
});

const cardTitles = () =>
  within(screen.getByRole('list', { name: /projects/i }))
    .queryAllByRole('heading', { level: 3 })
    .map((h) => h.textContent);

describe('project overview', () => {
  it('shows sample projects on first launch', async () => {
    renderApp(new MemoryProjectRepository());
    expect(await screen.findByRole('heading', { name: 'Harvest sweater', level: 3 })).toBeInTheDocument();
    expect(screen.getAllByText('Sample')).toHaveLength(3);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('shows a welcoming empty state when there are no projects', async () => {
    renderApp(await seededRepo([]));
    expect(await screen.findByText('Cast on your first project')).toBeInTheDocument();
  });

  it('creates a project, validating the name', async () => {
    const user = userEvent.setup();
    const repo = await seededRepo([]);
    renderApp(repo);
    await user.click((await screen.findAllByRole('link', { name: /New project/ }))[0]);

    await user.click(await screen.findByRole('button', { name: 'Create project' }));
    expect(screen.getByText('Project name is required.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Project name'), 'Autumn socks');
    await user.click(screen.getByLabelText('Crochet'));
    expect(screen.queryByText(/Shown on the card/)).not.toBeInTheDocument();
    await user.click(within(screen.getByRole('radiogroup', { name: 'Colour tag' })).getByRole('radio', { name: 'Colour 3' }));
    // One way to add a photo: the button opens the hidden file input.
    const fileInput = document.querySelector<HTMLInputElement>('input[type=file]')!;
    expect(fileInput.hidden).toBe(true);
    let opened = false;
    fileInput.addEventListener('click', (e) => { opened = true; e.preventDefault(); });
    await user.click(screen.getByRole('button', { name: 'Add photo' }));
    expect(opened).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    expect(await screen.findByRole('heading', { name: 'Autumn socks', level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText('Project status')).toHaveValue('planned');
    await waitFor(async () => {
      const [saved] = await repo.loadAll();
      expect(saved).toMatchObject({ name: 'Autumn socks', craft: 'crochet' });
      expect(saved.swatch).toBe(SWATCHES[2]);
    });
  });

  it('lists the most recently worked project first', async () => {
    const older = { ...makeProject('Harvest sweater'), updatedAt: 10 };
    const newer = { ...makeProject('Autumn socks'), updatedAt: 20 };
    renderApp(await seededRepo([older, newer]));
    await screen.findByRole('heading', { name: 'Autumn socks', level: 3 });
    expect(cardTitles()).toEqual(['Autumn socks', 'Harvest sweater']);
  });

  it('archives with undo, restores, and deletes only after confirmation', async () => {
    const user = userEvent.setup();
    const repo: ProjectRepository = await seededRepo([makeProject('Old scarf'), makeProject('Keep me')]);
    renderApp(repo);

    await user.click(await screen.findByRole('link', { name: /Old scarf/ }));
    await user.click(await screen.findByRole('button', { name: 'Archive project' }));
    await screen.findByRole('heading', { name: 'Your projects' });
    expect(cardTitles()).toEqual(['Keep me']);

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(cardTitles()).toContain('Old scarf');

    // Archive again and find it under Archived projects.
    await user.click(screen.getByRole('link', { name: /Old scarf/ }));
    await user.click(await screen.findByRole('button', { name: 'Archive project' }));
    await user.click(await screen.findByRole('button', { name: 'Archived projects (1)' }));
    expect(cardTitles()).toEqual(['Old scarf']);

    await user.click(screen.getByRole('link', { name: /Old scarf/ }));
    await user.click(await screen.findByRole('button', { name: 'Delete forever' }));
    const dialog = within(screen.getByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Old scarf', level: 1 })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete forever' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete forever' }));
    await waitFor(async () => {
      expect((await repo.loadAll()).map((p) => p.name)).toEqual(['Keep me']);
    });
  });

  it('shows an error state when storage cannot be read', async () => {
    const broken = new MemoryProjectRepository();
    broken.loadAll = () => Promise.reject(new Error('Disk on fire'));
    renderApp(broken);
    expect(await screen.findByText("We couldn't open your projects")).toBeInTheDocument();
    expect(screen.getByText(/Disk on fire/)).toBeInTheDocument();
  });

  it('warns when a change could not be saved', async () => {
    const user = userEvent.setup();
    const p = makeProject('Hat', ['Brim']);
    const repo = await seededRepo([p]);
    repo.save = () => Promise.reject(new Error('Storage is full.'));
    renderApp(repo);
    await user.click(await screen.findByRole('link', { name: /Hat/ }));
    await user.click(await screen.findByRole('button', { name: 'Increase rows' }));
    expect(await screen.findByText(/Storage is full\./)).toBeInTheDocument();
    // The change is kept on screen.
    expect(screen.getByRole('button', { name: /^Rows: 1\./ })).toBeInTheDocument();
  });
});
