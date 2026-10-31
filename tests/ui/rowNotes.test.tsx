import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { setCount } from '../../src/domain/counters';
import { setRowNote } from '../../src/domain/rowNotes';
import { goTo, makeProject, renderApp, seededRepo } from '../helpers';

beforeEach(() => {
  window.location.hash = '';
});

const rowNames = (log: HTMLElement) =>
  within(log)
    .getAllByRole('listitem')
    .map((li) => li.querySelector('.logrow__name')?.firstChild?.textContent);

describe('row log on a part', () => {
  it('keeps earlier rows visible as new ones are added, each with its own note', async () => {
    const user = userEvent.setup();
    let project = makeProject('Sweater', ['Sleeve']);
    const id = project.components[0].id;
    project = setCount(project, id, 'rows', 2);
    project = setRowNote(project, id, 1, 'Cast on 60');
    const repo = await seededRepo([project]);
    renderApp(repo);
    goTo(`#/project/${project.id}`);

    const card = within((await screen.findByRole('heading', { name: 'Sleeve' })).closest('article')!);
    const log = card.getByRole('region', { name: 'Row by row' });
    expect(rowNames(log)).toEqual(['Row 3', 'Row 2', 'Row 1']);
    expect(within(log).getByText('On the needles')).toBeInTheDocument();
    expect(within(log).getByText('Cast on 60')).toBeInTheDocument();

    await user.click(within(log).getByRole('button', { name: /^Row 3/ }));
    await user.type(within(log).getByLabelText('Note for row 3'), 'Start the stripe{Enter}');

    await user.click(card.getByRole('button', { name: 'Increase rows' }));
    expect(rowNames(log)).toEqual(['Row 4', 'Row 3', 'Row 2', 'Row 1']);
    expect(within(log).getByText('Start the stripe')).toBeInTheDocument();
    expect(within(log).getByText('Cast on 60')).toBeInTheDocument();

    await user.click(within(log).getByRole('button', { name: /^Row 1/ }));
    await user.click(within(log).getByRole('button', { name: 'Remove note' }));
    expect(screen.getByText('Note for row 1 removed.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(within(log).getByText('Cast on 60')).toBeInTheDocument();

    await waitFor(async () => {
      const [saved] = await repo.loadAll();
      expect(saved.components[0].rows).toBe(3);
      expect(saved.components[0].rowNotes).toEqual([
        { row: 1, text: 'Cast on 60' },
        { row: 3, text: 'Start the stripe' },
      ]);
    });
  });

  it('plans a note for a later row and shows it above the current one', async () => {
    const user = userEvent.setup();
    const project = makeProject('Sweater', ['Sleeve']);
    const repo = await seededRepo([project]);
    renderApp(repo);
    goTo(`#/project/${project.id}`);

    const log = await screen.findByRole('region', { name: 'Row by row' });
    await user.click(within(log).getByRole('button', { name: '+ Note for a later row' }));
    const which = within(log).getByLabelText('Which row?');
    await user.clear(which);
    await user.type(which, '0');
    await user.type(within(log).getByLabelText('Note'), 'Decrease');
    await user.click(within(log).getByRole('button', { name: 'Save' }));
    expect(within(log).getByText('Enter a row number from 1 to 99,999.')).toBeInTheDocument();

    await user.clear(which);
    await user.type(which, '12');
    await user.click(within(log).getByRole('button', { name: 'Save' }));
    expect(rowNames(log)).toEqual(['Row 12', 'Row 1']);
    expect(within(within(log).getByRole('list', { name: 'Planned' })).getByText('Decrease')).toBeInTheDocument();
  });

  it('counts a pair of socks side by side', async () => {
    const user = userEvent.setup();
    let project = makeProject('Socks', ['Leg']);
    project = setCount(project, project.components[0].id, 'rows', 2);
    const repo = await seededRepo([project]);
    renderApp(repo);
    goTo(`#/project/${project.id}`);

    await user.click(await screen.findByRole('button', { name: 'Edit Leg' }));
    await user.click(screen.getByLabelText('Work two at once, e.g. a pair of socks'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const card = within(screen.getByRole('heading', { name: 'Leg' }).closest('article')!);
    expect(card.getByRole('group', { name: 'Left rows' })).toHaveTextContent('2');
    expect(card.getByRole('group', { name: 'Right rows' })).toHaveTextContent('2');

    await user.click(card.getByRole('button', { name: 'Increase left rows' }));
    const log = card.getByRole('region', { name: 'Row by row' });
    expect(rowNames(log)).toEqual(['Row 4', 'Row 3', 'Row 2', 'Row 1']);
    const [row4, row3] = within(log).getAllByRole('listitem');
    expect(row4).toHaveTextContent('Left: up next');
    expect(row4).toHaveTextContent('Right: not yet');
    expect(row3).toHaveTextContent('Left: done');
    expect(row3).toHaveTextContent('Right: up next');

    await user.click(card.getByRole('button', { name: 'Increase right rows' }));
    expect(within(log).getAllByRole('listitem')[1]).toHaveTextContent('Right: done');

    await waitFor(async () => {
      const [saved] = await repo.loadAll();
      expect(saved.components[0]).toMatchObject({ rows: 3, pairRows: 3 });
    });
  });

  it('works in French', async () => {
    let project = makeProject('Pull', ['Manche']);
    const id = project.components[0].id;
    project = setCount(project, id, 'rows', 1);
    project = setRowNote(project, id, 1, 'Montage');
    const repo = await seededRepo([project]);
    renderApp(repo, 'fr');
    goTo(`#/project/${project.id}`);

    const log = await screen.findByRole('region', { name: 'Rang par rang' });
    const items = within(log).getAllByRole('listitem');
    expect(within(items[0]).getByText('Sur les aiguilles')).toBeInTheDocument();
    expect(within(items[1]).getByText('fait')).toBeInTheDocument();
    expect(within(items[1]).getByText('Montage')).toBeInTheDocument();
  });
});
