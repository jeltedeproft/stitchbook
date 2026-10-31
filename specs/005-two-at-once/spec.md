# Feature Specification: Two at Once

**Feature Branch**: `005-two-at-once`

**Created**: 2026-10-31

**Status**: Implemented

**Input**: User description: "another problem my friend had was that for socks he is doing sort of 2 rows at once, right now there is no way to keep track of 2 rows at once in the app, can you add that feature?"

Socks and sleeves are often knitted two at a time: row 12 on the left sock, then row 12 on the right.
A part can now be marked as a pair so each piece gets its own row counter.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Count a pair side by side (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a part's editor, **When** "Work two at once, e.g. a pair of socks" is ticked and saved,
   **Then** the part shows a Left and a Right row counter (side by side on wide screens, stacked on
   phones), both starting at the part's current count, plus the stitch counter.
2. **When** + is pressed on one side, **Then** only that side's count changes.
3. The row log shows each row with a Left and Right marker: done (✓), up next, or not yet. A row
   only counts as done, and gets the check in its circle, once both pieces have it.
4. Both pieces share the target, the progress bar (average of the two) and the row notes; the part is
   finished when both reach the target.
5. Unticking returns the part to a single counter (the left count is kept).

## Requirements

- **FR-001**: `ProjectComponent.pairRows` (optional) holds the second piece's finished rows; absent
  means a single piece. Imports and older data without it stay single.
- **FR-002**: Screen readers hear each marker as e.g. "Left: done", "Right: up next".
- **FR-003**: English and French.
