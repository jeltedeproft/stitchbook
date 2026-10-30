# Feature Specification: Row Log and a Cleaner Interface

**Feature Branch**: `004-row-log-clean-ui`

**Created**: 2026-10-30

**Status**: Implemented

**Input**: User description: "the whole gui feels a bit messy, can you try to use GUI design principles to make it a clean sleak GUI, and my friend also wanted to see all the rows at once and when you press new row the next row should appear but the old one should still be visible"

Revises feature 003: the row-notes sheet becomes an always-visible row log, and the wool decoration
is replaced by a restrained design system.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See every row at once (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a part at row 2, **Then** the part shows Row 3 (on the needles), Row 2 and Row 1, newest on top.
2. **When** the maker presses + on the row counter, **Then** Row 4 appears on top and Rows 3, 2, 1 stay listed.
3. **When** a row is tapped, **Then** its note can be written, edited or removed in place (removal can be undone).
4. **Given** more than six rows, **Then** the log scrolls inside the card; "Show all" expands it fully.
5. Notes planned for rows not reached yet are listed under the log header as one-line "Planned" items,
   and "+ Note for a later row" adds one by row number.

### User Story 2 - A clean, sleek interface (Priority: P1)

Design principles applied:

- **One accent**: rust marks actions and the current row; moss marks only "done".
- **Hierarchy through type and space, not boxes**: a 4/8 px spacing scale, display serif only for
  page and project titles, uppercase micro-labels for sections; part notes are a quiet quoted line.
- **Fewer borders and effects**: flat white cards, one light shadow level, no textures, gradients or
  decorative outlines; dashed borders only where something can still be added.
- **Consistent controls**: round counter buttons, pill buttons and chips, one radius scale.
- Light and dark mode keep WCAG AA contrast; no horizontal scrolling at 360 px.

### Follow-up - Keep the wool look (2026-10-30)

User: "it seems you lost the wooly knitty grandma GUI style, you can keep that". The clean layout and
spacing stay; the knitted finish returns as one layer in `src/styles/wool.css` with a fixed set of
motifs: stockinette texture, Fair Isle header band, yarn-strand divider, running-stitch felt cards
(large surfaces only), felt coat-button counters, plied-yarn progress, handwritten paper-tag notes.
No stitching on buttons, chips or toasts.
