import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { setCount } from '../../src/domain/counters';
import { setRowNote } from '../../src/domain/rowNotes';
import { goTo, makeProject, renderApp, seededRepo } from '../helpers';

beforeEach(() => {
  window.location.hash = '';
});

describe('row notes on a part', () => {
  it('adds a note to the working row, follows the counter, and removes with undo', async () => {
    const user = userEvent.setup();
    let project = makeProject('Sweater', ['Sleeve']);
    const id = project.components[0].id;
    project = setCount(project, id, 'rows', 2);
    project = setRowNote(project, id, 4, 'Decrease both ends');
    const repo = await seededRepo([project]);
    renderApp(repo);
    goTo(`#/project/${project.id}`);

    const card = within((await screen.findByRole('heading', { name: 'Sleeve' })).closest('article')!);
    expect(card.getByText('Row 3')).toBeInTheDocument();
    expect(card.getByText('Coming up')).toBeInTheDocument();

    await user.click(card.getByRole('button', { name: '+ Note for this row' }));
    const dialog = within(await screen.findByRole('dialog'));
    await user.type(dialog.getByLabelText('Note for row 3'), 'Start the stripe{Enter}');
    expect(dialog.getByText('Start the stripe')).toBeInTheDocument();
    await user.click(dialog.getByRole('button', { name: 'Close' }));

    expect(card.getByText('Start the stripe')).toBeInTheDocument();
    await user.click(card.getByRole('button', { name: 'Increase rows' }));
    expect(card.getByText('Row 4')).toBeInTheDocument();
    expect(card.getByText('Decrease both ends')).toBeInTheDocument();

    await user.click(card.getByRole('button', { name: 'Edit note' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove note' }));
    expect(screen.getByText('Note for row 4 removed.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }));
    expect(card.getByText('Decrease both ends')).toBeInTheDocument();

    await waitFor(async () => {
      const [saved] = await repo.loadAll();
      expect(saved.components[0].rowNotes).toEqual([
        { row: 3, text: 'Start the stripe' },
        { row: 4, text: 'Decrease both ends' },
      ]);
    });
  });

  it('lists every row with its state in French', async () => {
    const user = userEvent.setup();
    let project = makeProject('Pull', ['Manche']);
    const id = project.components[0].id;
    project = setCount(project, id, 'rows', 1);
    project = setRowNote(project, id, 1, 'Montage');
    const repo = await seededRepo([project]);
    renderApp(repo, 'fr');
    goTo(`#/project/${project.id}`);

    await user.click(await screen.findByRole('button', { name: /^Tous les rangs/ }));
    const dialog = within(screen.getByRole('dialog'));
    const items = dialog.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(within(items[0]).getByText('fait')).toBeInTheDocument();
    expect(within(items[0]).getByText('Montage')).toBeInTheDocument();
    expect(within(items[1]).getByText('en cours')).toBeInTheDocument();
  });
});
