import type { Project } from './types';

/**
 * Example projects shown on a first launch. Ids are fixed so they can never collide with real
 * projects, and `isSample` lets the user remove them all at once.
 */
export function sampleProjects(nowMs: number = Date.now()): Project[] {
  const hour = 3_600_000;
  return [
    {
      id: 'sample-harvest-sweater',
      name: 'Harvest sweater',
      craft: 'knitting',
      status: 'in_progress',
      notes: 'Top-down raglan with a relaxed fit. Knitting the sleeves two at a time so they match.',
      swatch: '#c2643c',
      archived: false,
      isSample: true,
      createdAt: nowMs - 30 * 24 * hour,
      updatedAt: nowMs - hour,
      lastComponentId: 'sample-hs-left-sleeve',
      materials: [
        { id: 'sample-hs-oat', name: 'Highland worsted', brand: 'Drops', fiber: '100% merino', colorName: 'Oat', colorHex: '#d9c8a9', weight: 'Worsted', notes: '6 skeins, dye lot 4471' },
        { id: 'sample-hs-rust', name: 'Highland worsted', brand: 'Drops', fiber: '100% merino', colorName: 'Rust', colorHex: '#a0522d', weight: 'Worsted' },
      ],
      components: [
        { id: 'sample-hs-body', name: 'Body', status: 'complete', countUnit: 'round', rows: 112, targetRows: 112, stitches: 196, toolSize: '5.0 mm (US 8)', countersEnabled: true, notes: 'Finished with 2×2 rib, 14 rounds.', colors: [{ id: 'sample-hs-c1', materialId: 'sample-hs-oat', note: 'Main colour' }] },
        { id: 'sample-hs-left-sleeve', name: 'Left sleeve', status: 'in_progress', countUnit: 'round', rows: 34, targetRows: 96, stitches: 58, toolSize: '4.5 mm (US 7)', countersEnabled: true, notes: 'Decrease 2 sts every 8th round.', colors: [{ id: 'sample-hs-c2', materialId: 'sample-hs-oat', note: 'Main colour' }, { id: 'sample-hs-c3', materialId: 'sample-hs-rust', note: 'Two-round stripe every 10 rounds' }] },
        { id: 'sample-hs-right-sleeve', name: 'Right sleeve', status: 'in_progress', countUnit: 'round', rows: 30, targetRows: 96, stitches: 58, toolSize: '4.5 mm (US 7)', countersEnabled: true, colors: [{ id: 'sample-hs-c4', materialId: 'sample-hs-oat' }, { id: 'sample-hs-c5', materialId: 'sample-hs-rust', note: 'Match left sleeve stripes' }] },
        { id: 'sample-hs-collar', name: 'Collar', status: 'not_started', countUnit: 'round', rows: 0, targetRows: 12, stitches: 0, toolSize: '4.0 mm (US 6)', countersEnabled: true, notes: 'Pick up 96 sts, 1×1 rib.', colors: [{ id: 'sample-hs-c6', materialId: 'sample-hs-rust' }] },
      ],
    },
    {
      id: 'sample-granny-blanket',
      name: 'Granny square blanket',
      craft: 'crochet',
      status: 'paused',
      notes: '48 squares in a 6 × 8 layout. Join as you go.',
      swatch: '#8a9a5b',
      archived: false,
      isSample: true,
      createdAt: nowMs - 60 * 24 * hour,
      updatedAt: nowMs - 5 * 24 * hour,
      lastComponentId: 'sample-gb-squares',
      materials: [
        { id: 'sample-gb-sage', name: 'Cotton blend DK', brand: 'Scheepjes', fiber: 'Cotton / acrylic', colorName: 'Sage', colorHex: '#8a9a5b' },
        { id: 'sample-gb-cream', name: 'Cotton blend DK', brand: 'Scheepjes', fiber: 'Cotton / acrylic', colorName: 'Cream', colorHex: '#f1e9da' },
        { id: 'sample-gb-mustard', name: 'Cotton blend DK', brand: 'Scheepjes', fiber: 'Cotton / acrylic', colorName: 'Mustard', colorHex: '#d4a35a' },
      ],
      components: [
        { id: 'sample-gb-squares', name: 'Squares', status: 'in_progress', countUnit: 'round', rows: 29, targetRows: 48, stitches: 0, toolSize: '4.0 mm (G-6)', countersEnabled: true, notes: 'Row counter = squares finished.', colors: [{ id: 'sample-gb-c1', materialId: 'sample-gb-mustard', note: 'Round 1' }, { id: 'sample-gb-c2', materialId: 'sample-gb-sage', note: 'Rounds 2–3' }, { id: 'sample-gb-c3', materialId: 'sample-gb-cream', note: 'Round 4 + joins' }] },
        { id: 'sample-gb-border', name: 'Border', status: 'not_started', countUnit: 'round', rows: 0, targetRows: 4, stitches: 0, toolSize: '4.5 mm (7)', countersEnabled: true, colors: [{ id: 'sample-gb-c4', materialId: 'sample-gb-sage' }] },
      ],
    },
    {
      id: 'sample-linen-dress',
      name: 'Linen summer dress',
      craft: 'sewing',
      status: 'planned',
      notes: 'Pre-wash the linen twice. Size M bodice, lengthen skirt by 5 cm.',
      swatch: '#5c7c8a',
      archived: false,
      isSample: true,
      createdAt: nowMs - 3 * 24 * hour,
      updatedAt: nowMs - 2 * 24 * hour,
      materials: [
        { id: 'sample-ld-linen', name: 'Washed linen', fiber: '100% linen', colorName: 'Dusty blue', colorHex: '#5c7c8a', weight: '2.5 m × 140 cm' },
        { id: 'sample-ld-thread', name: 'All-purpose thread', brand: 'Gütermann', colorName: 'Slate' },
      ],
      components: [
        { id: 'sample-ld-bodice', name: 'Bodice', status: 'not_started', countUnit: 'row', rows: 0, stitches: 0, toolSize: 'Machine 80/12', countersEnabled: false, notes: 'Stay-stitch the neckline first.', colors: [{ id: 'sample-ld-c1', materialId: 'sample-ld-linen' }] },
        { id: 'sample-ld-skirt', name: 'Skirt', status: 'not_started', countUnit: 'row', rows: 0, stitches: 0, toolSize: 'Machine 80/12', countersEnabled: false, colors: [{ id: 'sample-ld-c2', materialId: 'sample-ld-linen' }] },
        { id: 'sample-ld-pockets', name: 'Pockets', status: 'not_started', countUnit: 'row', rows: 0, stitches: 0, countersEnabled: false, colors: [] },
      ],
    },
  ];
}
