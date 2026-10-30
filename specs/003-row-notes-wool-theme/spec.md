# Feature Specification: Row Notes and a Cozy Wool Look

**Feature Branch**: `003-row-notes-wool-theme`

**Created**: 2026-10-30

**Status**: Implemented

**Input**: User description: "every row in a part of a clothing item shouldnt just be a number that go up it should be a editable object where you can add notes to, and secondly for the design of the website its a bit bland, try to make it a cozy wooly style"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pin notes to rows (Priority: P1)

A knitter follows a pattern that says "round 40: decrease", "rounds 35–36: rust stripe". Each row or
round of a part is its own item: she can open it, write a note, change it or remove it. When the
counter reaches a row that has a note, the note is right there on the part.

**Independent Test**: On a part at round 34, add a note to round 35 and to round 40. The part shows
round 35 "on the needles" with its note and round 40 under "Coming up". Count up once: the round-35
note is no longer the current one.

**Acceptance Scenarios**:

1. **Given** a part with counters, **When** the maker taps "+ Note for this row", **Then** a note can
   be written for the row being worked (count + 1) and is shown on the part card.
2. **Given** notes on later rows, **When** the part is shown, **Then** the next two noted rows are
   listed under "Coming up", and tapping one opens it for editing.
3. **Given** the full row list, **When** it opens, **Then** every row from 1 to the target (or the
   last note, or the working row) is listed, done rows are ticked, the working row is marked "now",
   and more rows can be revealed.
4. **Given** a note is removed, **Then** a toast offers Undo, which restores it.
5. **Given** a target is reached, **Then** the part says all rows are done instead of a working row.

### User Story 2 - A cozy, woolly look (Priority: P2)

The app should feel like a knitting basket, not a spreadsheet: knitted textures, sewn-on felt cards,
yarn, tags, buttons that look like buttons.

**Acceptance Scenarios**:

1. The page background is a faint stockinette texture; the header has a Fair Isle band.
2. Cards look like felt patches with a running stitch; main buttons and counter "+" look like felt
   coat buttons with stitching.
3. Progress bars look like plied yarn; row notes look like handwritten paper tags.
4. Light and dark mode both keep WCAG AA contrast, focus rings stay visible, and nothing scrolls
   sideways at 360 px.

## Requirements *(mandatory)*

- **FR-001**: A part stores row notes as `{ row, text }`, rows numbered from 1, at most one per row,
  sorted; text trimmed and capped at 500 characters; empty text removes the note.
- **FR-002**: The working row is the counter value + 1 (the counter holds rows finished).
- **FR-003**: Row notes are persisted, exported and imported; invalid entries are dropped on load.
  Older data and backups without row notes still load (backup format stays version 1).
- **FR-004**: Row notes are included in project search.
- **FR-005**: All new text exists in English and French.
- **FR-006**: The theme adds no runtime dependencies; one handwriting web font (Caveat) is loaded
  from Google Fonts alongside the existing ones.
