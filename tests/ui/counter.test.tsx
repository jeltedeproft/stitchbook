import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { goTo, makeProject, renderApp, seededRepo } from '../helpers';

beforeEach(() => {
  window.location.hash = '';
});

async function openPart(projectName: string, partName: string) {
  const list = await screen.findByRole('list', { name: 'Projects' });
  await userEvent.click(within(list).getByRole('link', { name: new RegExp(projectName) }));
  const card = (await screen.findByRole('heading', { name: partName, level: 3 })).closest('article')!;
  return within(card as HTMLElement);
}

describe('counters in the UI', () => {
  it('counts up and down, cannot go negative, and persists across a restart', async () => {
    const user = userEvent.setup();
    const repo = await seededRepo([makeProject('Autumn socks', ['Cuff'])]);
    const first = renderApp(repo);

    const part = await openPart('Autumn socks', 'Cuff');
    const down = part.getByRole('button', { name: 'Decrease rows' });
    expect(down).toBeDisabled();

    const up = part.getByRole('button', { name: 'Increase rows' });
    await user.click(up);
    await user.click(up);
    await user.click(up);
    await user.click(part.getByRole('button', { name: 'Decrease rows' }));
    await user.click(part.getByRole('button', { name: 'Increase stitches' }));
    expect(part.getByRole('button', { name: /^Rows: 2\./ })).toBeInTheDocument();
    expect(part.getByRole('button', { name: /^Stitches: 1\./ })).toBeInTheDocument();
    // Counting started the part.
    expect(part.getByText('In progress')).toBeInTheDocument();

    await waitFor(async () => {
      const [saved] = await repo.loadAll();
      expect(saved.components[0]).toMatchObject({ rows: 2, stitches: 1 });
    });

    first.unmount();
    goTo('');
    renderApp(repo);
    const again = await openPart('Autumn socks', 'Cuff');
    expect(again.getByRole('button', { name: /^Rows: 2\./ })).toBeInTheDocument();
  });

  it('accepts typed values and rejects invalid ones', async () => {
    const user = userEvent.setup();
    renderApp(await seededRepo([makeProject('Hat', ['Brim'])]));
    const part = await openPart('Hat', 'Brim');

    await user.click(part.getByRole('button', { name: /^Rows: 0\./ }));
    const input = part.getByLabelText('Set rows');
    await user.clear(input);
    await user.type(input, '-4');
    await user.click(part.getByRole('button', { name: 'Set' }));
    expect(part.getByRole('alert')).toHaveTextContent('whole number');

    await user.clear(input);
    await user.type(input, '40{Enter}');
    expect(await part.findByRole('button', { name: /^Rows: 40\./ })).toBeInTheDocument();
  });

  it('resets a counter with an undo', async () => {
    const user = userEvent.setup();
    renderApp(await seededRepo([makeProject('Hat', ['Brim'])]));
    const part = await openPart('Hat', 'Brim');
    for (let i = 0; i < 3; i++) await user.click(part.getByRole('button', { name: 'Increase rows' }));

    await user.click(part.getByRole('button', { name: 'Reset rows to 0' }));
    expect(part.getByRole('button', { name: /^Rows: 0\./ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(part.getByRole('button', { name: /^Rows: 3\./ })).toBeInTheDocument();
  });
});
