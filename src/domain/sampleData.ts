import type { Lang } from '../i18n/lang';
import type { Project } from './types';

const TEXT = {
  en: {
    sweater: 'Harvest sweater',
    sweaterNotes: 'Top-down raglan with a relaxed fit. Knitting the sleeves two at a time so they match.',
    highland: 'Highland worsted', merino: '100% merino', oat: 'Oat', rust: 'Rust', skeins: '6 skeins, dye lot 4471',
    body: 'Body', bodyNotes: 'Finished with 2×2 rib, 14 rounds.', main: 'Main colour',
    leftSleeve: 'Left sleeve', rightSleeve: 'Right sleeve', collar: 'Collar',
    sleeveNotes: 'Decrease 2 sts every 8th round.', stripe: 'Two-round stripe every 10 rounds',
    matchStripes: 'Match left sleeve stripes', collarNotes: 'Pick up 96 sts, 1×1 rib.',
    mm50: '5.0 mm (US 8)', mm45: '4.5 mm (US 7)', mm40: '4.0 mm (US 6)', hook40: '4.0 mm (G-6)', hook45: '4.5 mm (7)',
    blanket: 'Granny square blanket', blanketNotes: '48 squares in a 6 × 8 layout. Join as you go.',
    cotton: 'Cotton blend DK', cottonFiber: 'Cotton / acrylic', sage: 'Sage', cream: 'Cream', mustard: 'Mustard',
    squares: 'Squares', squaresNotes: 'Row counter = squares finished.',
    round1: 'Round 1', rounds23: 'Rounds 2–3', round4: 'Round 4 + joins', border: 'Border',
    dress: 'Linen summer dress', dressNotes: 'Pre-wash the linen twice. Size M bodice, lengthen skirt by 5 cm.',
    linen: 'Washed linen', linenFiber: '100% linen', dustyBlue: 'Dusty blue', linenWeight: '2.5 m × 140 cm',
    thread: 'All-purpose thread', slate: 'Slate',
    bodice: 'Bodice', bodiceNotes: 'Stay-stitch the neckline first.', skirt: 'Skirt', pockets: 'Pockets',
    rn24: 'Tried it on: length is right so far.', rn35: 'Rust stripe, rounds 35–36. Carry the oat up the inside.',
    rn40: 'Decrease round: k1, k2tog, knit to last 3, ssk, k1.', rn84: 'Switch to 4.0 mm and start the 2×2 cuff.',
  },
  fr: {
    sweater: "Pull d'automne",
    sweaterNotes: 'Raglan tricoté du haut vers le bas, coupe ample. Les deux manches en même temps pour qu’elles soient identiques.',
    highland: 'Laine Highland', merino: '100 % mérinos', oat: 'Avoine', rust: 'Rouille', skeins: '6 pelotes, bain 4471',
    body: 'Corps', bodyNotes: 'Terminé par 14 tours de côtes 2/2.', main: 'Couleur principale',
    leftSleeve: 'Manche gauche', rightSleeve: 'Manche droite', collar: 'Col',
    sleeveNotes: 'Diminuer 2 m. tous les 8 tours.', stripe: 'Rayure de 2 tours tous les 10 tours',
    matchStripes: 'Mêmes rayures que la manche gauche', collarNotes: 'Relever 96 m., côtes 1/1.',
    mm50: '5 mm', mm45: '4,5 mm', mm40: '4 mm', hook40: '4 mm', hook45: '4,5 mm',
    blanket: 'Plaid en granny squares', blanketNotes: '48 carrés disposés en 6 × 8. Assemblage au fur et à mesure.',
    cotton: 'Coton mélangé DK', cottonFiber: 'Coton / acrylique', sage: 'Sauge', cream: 'Crème', mustard: 'Moutarde',
    squares: 'Carrés', squaresNotes: 'Compteur de tours = carrés terminés.',
    round1: 'Tour 1', rounds23: 'Tours 2–3', round4: 'Tour 4 + assemblage', border: 'Bordure',
    dress: "Robe d'été en lin", dressNotes: 'Laver le lin deux fois avant de couper. Corsage taille M, rallonger la jupe de 5 cm.',
    linen: 'Lin lavé', linenFiber: '100 % lin', dustyBlue: 'Bleu poudré', linenWeight: '2,5 m × 140 cm',
    thread: 'Fil tout usage', slate: 'Ardoise',
    bodice: 'Corsage', bodiceNotes: "Faire d'abord une piqûre de soutien sur l'encolure.", skirt: 'Jupe', pockets: 'Poches',
    rn24: 'Essayé : la longueur est bonne pour l’instant.', rn35: 'Rayure rouille, tours 35–36. Remonter le fil avoine à l’intérieur.',
    rn40: 'Tour de diminution : 1 m. end., 2 m. ens., tricoter jusqu’aux 3 dernières, 1 surjet, 1 m. end.', rn84: 'Passer aux aiguilles 4 mm et commencer les côtes 2/2 du poignet.',
  },
} satisfies Record<Lang, Record<string, string>>;

/**
 * Example projects shown on a first launch, in the language active at that moment. Ids are fixed
 * so they can never collide with real projects, and `isSample` lets the user remove them at once.
 */
export function sampleProjects(lang: Lang = 'en', nowMs: number = Date.now()): Project[] {
  const x = TEXT[lang];
  const hour = 3_600_000;
  return [
    {
      id: 'sample-harvest-sweater',
      name: x.sweater,
      craft: 'knitting',
      status: 'in_progress',
      notes: x.sweaterNotes,
      swatch: '#c2643c',
      archived: false,
      isSample: true,
      createdAt: nowMs - 30 * 24 * hour,
      updatedAt: nowMs - hour,
      lastComponentId: 'sample-hs-left-sleeve',
      materials: [
        { id: 'sample-hs-oat', name: x.highland, brand: 'Drops', fiber: x.merino, colorName: x.oat, colorHex: '#d9c8a9', weight: 'Worsted', notes: x.skeins },
        { id: 'sample-hs-rust', name: x.highland, brand: 'Drops', fiber: x.merino, colorName: x.rust, colorHex: '#a0522d', weight: 'Worsted' },
      ],
      components: [
        { id: 'sample-hs-body', name: x.body, status: 'complete', countUnit: 'round', rows: 112, targetRows: 112, stitches: 196, toolSize: x.mm50, countersEnabled: true, notes: x.bodyNotes, colors: [{ id: 'sample-hs-c1', materialId: 'sample-hs-oat', note: x.main }] },
        { id: 'sample-hs-left-sleeve', name: x.leftSleeve, status: 'in_progress', countUnit: 'round', rows: 34, targetRows: 96, stitches: 58, toolSize: x.mm45, countersEnabled: true, notes: x.sleeveNotes, rowNotes: [{ row: 24, text: x.rn24 }, { row: 35, text: x.rn35 }, { row: 40, text: x.rn40 }, { row: 84, text: x.rn84 }], colors: [{ id: 'sample-hs-c2', materialId: 'sample-hs-oat', note: x.main }, { id: 'sample-hs-c3', materialId: 'sample-hs-rust', note: x.stripe }] },
        { id: 'sample-hs-right-sleeve', name: x.rightSleeve, status: 'in_progress', countUnit: 'round', rows: 30, targetRows: 96, stitches: 58, toolSize: x.mm45, countersEnabled: true, colors: [{ id: 'sample-hs-c4', materialId: 'sample-hs-oat' }, { id: 'sample-hs-c5', materialId: 'sample-hs-rust', note: x.matchStripes }] },
        { id: 'sample-hs-collar', name: x.collar, status: 'not_started', countUnit: 'round', rows: 0, targetRows: 12, stitches: 0, toolSize: x.mm40, countersEnabled: true, notes: x.collarNotes, colors: [{ id: 'sample-hs-c6', materialId: 'sample-hs-rust' }] },
      ],
    },
    {
      id: 'sample-granny-blanket',
      name: x.blanket,
      craft: 'crochet',
      status: 'paused',
      notes: x.blanketNotes,
      swatch: '#8a9a5b',
      archived: false,
      isSample: true,
      createdAt: nowMs - 60 * 24 * hour,
      updatedAt: nowMs - 5 * 24 * hour,
      lastComponentId: 'sample-gb-squares',
      materials: [
        { id: 'sample-gb-sage', name: x.cotton, brand: 'Scheepjes', fiber: x.cottonFiber, colorName: x.sage, colorHex: '#8a9a5b' },
        { id: 'sample-gb-cream', name: x.cotton, brand: 'Scheepjes', fiber: x.cottonFiber, colorName: x.cream, colorHex: '#f1e9da' },
        { id: 'sample-gb-mustard', name: x.cotton, brand: 'Scheepjes', fiber: x.cottonFiber, colorName: x.mustard, colorHex: '#d4a35a' },
      ],
      components: [
        { id: 'sample-gb-squares', name: x.squares, status: 'in_progress', countUnit: 'round', rows: 29, targetRows: 48, stitches: 0, toolSize: x.hook40, countersEnabled: true, notes: x.squaresNotes, colors: [{ id: 'sample-gb-c1', materialId: 'sample-gb-mustard', note: x.round1 }, { id: 'sample-gb-c2', materialId: 'sample-gb-sage', note: x.rounds23 }, { id: 'sample-gb-c3', materialId: 'sample-gb-cream', note: x.round4 }] },
        { id: 'sample-gb-border', name: x.border, status: 'not_started', countUnit: 'round', rows: 0, targetRows: 4, stitches: 0, toolSize: x.hook45, countersEnabled: true, colors: [{ id: 'sample-gb-c4', materialId: 'sample-gb-sage' }] },
      ],
    },
    {
      id: 'sample-linen-dress',
      name: x.dress,
      craft: 'sewing',
      status: 'planned',
      notes: x.dressNotes,
      swatch: '#5c7c8a',
      archived: false,
      isSample: true,
      createdAt: nowMs - 3 * 24 * hour,
      updatedAt: nowMs - 2 * 24 * hour,
      materials: [
        { id: 'sample-ld-linen', name: x.linen, fiber: x.linenFiber, colorName: x.dustyBlue, colorHex: '#5c7c8a', weight: x.linenWeight },
        { id: 'sample-ld-thread', name: x.thread, brand: 'Gütermann', colorName: x.slate },
      ],
      components: [
        { id: 'sample-ld-bodice', name: x.bodice, status: 'not_started', countUnit: 'row', rows: 0, stitches: 0, toolSize: 'Machine 80/12', countersEnabled: false, notes: x.bodiceNotes, colors: [{ id: 'sample-ld-c1', materialId: 'sample-ld-linen' }] },
        { id: 'sample-ld-skirt', name: x.skirt, status: 'not_started', countUnit: 'row', rows: 0, stitches: 0, toolSize: 'Machine 80/12', countersEnabled: false, colors: [{ id: 'sample-ld-c2', materialId: 'sample-ld-linen' }] },
        { id: 'sample-ld-pockets', name: x.pockets, status: 'not_started', countUnit: 'row', rows: 0, stitches: 0, countersEnabled: false, colors: [] },
      ],
    },
  ];
}
