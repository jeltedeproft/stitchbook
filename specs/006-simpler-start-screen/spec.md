# Feature Specification: Simpler Start Screen

**Feature Branch**: `006-simpler-start-screen`

**Created**: 2026-10-31

**Status**: Implemented

**Input**: User description: "for the main startscreen, lets simplify a bit, you can get rid of the search functionality, i dont think a person is gonna have so many uinfinished works they need to search them, keep the good morning and the your projects, but remove the 3 projects on the go line, remove the continue where you left off widget, make the different projects the main focus of this screen"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Projects first (Priority: P1)

**Acceptance Scenarios**:

1. The start screen shows the greeting, "Your projects", the New project button, then the project
   cards, most recently worked on first. The sample-projects notice stays while samples exist.
2. There is no search box, craft filter, status chips, "N projects on the go" line or
   "Pick up where you left off" card.
3. When archived projects exist, a quiet "Archived projects (N)" link under the cards shows them;
   "← Back to your projects" returns.

## Requirements

- **FR-001**: Remove `src/domain/search.ts`, `continueCandidate`, their strings, styles and tests.
- **FR-002**: English and French.

### Follow-up - Calmer new-project form (2026-10-31)

User: "the new project screen is also a bit cluttered, remove the words color tag and the line under
it ..., also remove the text on top of the colour buttons ..., keep just the add photo button".

- The colour swatches stand alone: no "Colour tag" heading or hint. Names stay for screen readers
  only, as `aria-label`s on the radios rather than hidden text that some browsers showed.
- Photo and backup import use a single button that opens a `hidden` file input, so no browser can
  draw its own "Choose file" control next to it.

### Follow-up - No example text in fields (2026-10-31)

User: "can you get rid of all the prefilled example text in the text fields? it clutters a bit".
Every "e.g. …" placeholder is gone. Two fields without a visible label keep a plain placeholder that
names them: a part colour's "Where it's used" and the planned-row "Note".
