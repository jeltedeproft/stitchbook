# Feature Specification: Simpler Part Editor and Size Dropdown

**Feature Branch**: `007-part-editor-sizes`

**Created**: 2026-10-31

**Status**: Implemented

**Input**: User description: "next the editing a part screen, for needle size can you remove the text that says pick a comon size or a type of your own, and then in stead of a text field can you make it a dropdown? ... maybe in the settings we can choose the metric system, we live in belgium so i think for us you can default to meters. also i think we can remove the boolean that says track rows/stitches for this part ... at the section where we can choose the target rows or round, i would put them both at the same time on top of each other, in stead of toggling between the 2 also remove the text that comes after the description in parentheses, also remove the explaining text under work two at once"

## Acceptance Scenarios

1. Needle/hook size is a dropdown ("No size", then the standard sizes); the hint is gone.
   Sewing keeps its machine/hand needle list.
2. Settings has "Needle and hook sizes: Metric (mm) | US", metric by default. US shows
   "US 7 (4.5 mm)" (crochet "US G-6 (4 mm)"); sizes without a US name stay metric.
3. Sizes are stored as "4.5 mm", so switching system or language relabels them. Older free text
   such as "4,5 mm (US 7)" is understood; anything else is kept and offered in the dropdown.
4. Every part has counters; the "Track rows/rounds and stitches" switch and the sewing hint are gone.
5. "Count in" lists Rows and Rounds stacked as radio options; the target follows ("Target rows" /
   "Target rounds", no "(optional)", no "(flat)" / "(in the round)").
6. "Work two at once" has no explanation underneath.
