import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { updateComponent } from '../../src/domain/components';
import { beforeEach, describe, expect, it } from 'vitest';
import { addMaterial } from '../../src/domain/materials';
import { goTo, makeProject, renderApp, seededRepo } from '../helpers';

beforeEach(() => {
  window.location.hash = '';
});

const partNames = () =>
  screen.queryAllByRole('heading', { level: 3 }).map((h) => h.textContent);

describe('managing components', () => {
  it('adds, reorders and removes parts with undo, and persists', async () => {
    const user = userEvent.setup();
    const project = makeProject('Sweater');
    const repo = await seededRepo([project]);
    renderApp(repo);
    goTo(`#/project/${project.id}`);

    expect(await screen.findByText('Break it into parts')).toBeInTheDocument();
    const input = screen.getByLabelText('Add a part');

    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Part name is required.')).toBeInTheDocument();

    await user.type(input, 'Body{Enter}');
    await user.type(input, 'Left sleeve{Enter}');
    await user.click(screen.getByRole('button', { name: '+ Collar' }));
    expect(partNames()).toEqual(['Body', 'Left sleeve', 'Collar']);

    await user.click(screen.getByRole('button', { name: 'Move Collar up' }));
    expect(partNames()).toEqual(['Body', 'Collar', 'Left sleeve']);
    expect(screen.getByRole('button', { name: 'Move Body up' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Edit Collar' }));
    const dialog = within(await screen.findByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: /Remove/ }));
    expect(partNames()).toEqual(['Body', 'Left sleeve']);

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(partNames()).toEqual(['Body', 'Collar', 'Left sleeve']);

    await waitFor(async () => {
      const [saved] = await repo.loadAll();
      expect(saved.components.map((c) => c.name)).toEqual(['Body', 'Collar', 'Left sleeve']);
    });
  });

  it('edits name, tool size, unit, target, colours and notes', async () => {
    const user = userEvent.setup();
    let project = makeProject('Sweater', ['Sleeve']);
    project = addMaterial(project, { name: 'Highland', colorName: 'Rust', colorHex: '#a0522d' });
    const repo = await seededRepo([project]);
    renderApp(repo);
    goTo(`#/project/${project.id}`);

    await user.click(await screen.findByRole('button', { name: 'Edit Sleeve' }));
    const dialog = within(screen.getByRole('dialog'));
    const name = dialog.getByLabelText('Name');
    await user.clear(name);
    await user.click(dialog.getByRole('button', { name: 'Save' }));
    expect(dialog.getByText('Part name is required.')).toBeInTheDocument();

    await user.type(name, 'Left sleeve');
    expect(dialog.queryByText(/Pick a common size/)).not.toBeInTheDocument();
    await user.selectOptions(dialog.getByLabelText('Needle size'), '4.5 mm');
    await user.click(dialog.getByLabelText('Rows'));
    await user.click(dialog.getByLabelText('Rounds'));
    await user.type(dialog.getByLabelText('Target rounds'), '96');
    await user.click(dialog.getByRole('button', { name: 'Add colour' }));
    await user.type(dialog.getByLabelText('Where is colour 1 used?'), 'Stripes every 10 rounds');
    await user.type(dialog.getByLabelText('Notes'), 'Decrease every 8th round');
    await user.click(dialog.getByRole('button', { name: 'Save' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const card = within(screen.getByRole('heading', { name: 'Left sleeve' }).closest('article')!);
    expect(card.getByText('4.5 mm')).toBeInTheDocument();
    expect(card.getByText('Rust')).toBeInTheDocument();
    expect(card.getByText(/Stripes every 10 rounds/)).toBeInTheDocument();
    expect(card.getByRole('button', { name: /^Rounds: 0 of 96\./ })).toBeInTheDocument();

    await waitFor(async () => {
      const [saved] = await repo.loadAll();
      expect(saved.components[0]).toMatchObject({
        name: 'Left sleeve',
        toolSize: '4.5 mm',
        countUnit: 'round',
        targetRows: 96,
        notes: 'Decrease every 8th round',
        colors: [expect.objectContaining({ materialId: project.materials[0].id, note: 'Stripes every 10 rounds' })],
      });
    });
  });

  it('shows sizes in metric by default and in US when chosen in Settings', async () => {
    const user = userEvent.setup();
    let project = makeProject('Sweater', ['Sleeve']);
    project = updateComponent(project, project.components[0].id, { toolSize: '4.5 mm (US 7)' });
    renderApp(await seededRepo([project]));
    goTo(`#/project/${project.id}`);
    const card = within((await screen.findByRole('heading', { name: 'Sleeve' })).closest('article')!);
    expect(card.getByText('4.5 mm')).toBeInTheDocument();

    goTo('#/settings');
    await user.click(await screen.findByLabelText('US'));
    goTo(`#/project/${project.id}`);
    expect(await screen.findByText('US 7 (4.5 mm)')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit Sleeve' }));
    const size = within(screen.getByRole('dialog')).getByLabelText('Needle size');
    expect(size).toHaveValue('4.5 mm');
    expect(within(size).getByRole('option', { name: 'US 8 (5 mm)' })).toBeInTheDocument();
  });

  it('uses craft-appropriate labels and counts every part, sewing too', async () => {
    const user = userEvent.setup();
    const dress = makeProject('Dress', ['Bodice'], 'sewing');
    const hat = makeProject('Hat', ['Crown'], 'crochet');
    renderApp(await seededRepo([dress, hat]));

    goTo(`#/project/${dress.id}`);
    expect(await screen.findByRole('button', { name: 'Increase rows' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit Bodice' }));
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByLabelText('Needle / tool')).toBeInTheDocument();
    expect(dialog.queryByRole('checkbox', { name: /Track/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    goTo(`#/project/${hat.id}`);
    await user.click(await screen.findByRole('button', { name: 'Edit Crown' }));
    expect(within(screen.getByRole('dialog')).getByLabelText('Hook size')).toBeInTheDocument();
  });

  it('marks a part complete with one tap', async () => {
    const user = userEvent.setup();
    const p = makeProject('Hat', ['Crown']);
    renderApp(await seededRepo([p]));
    goTo(`#/project/${p.id}`);
    const toggle = await screen.findByRole('button', { name: 'Mark Crown complete' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });
});
