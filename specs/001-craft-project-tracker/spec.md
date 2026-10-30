# Feature Specification: Craft Project Tracker

**Feature Branch**: `001-craft-project-tracker`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "A beautiful, intuitive app for two friends to manage knitting, crochet and
sewing projects: an overview of all projects, project details with materials, and per-project
components (e.g. body, sleeves, collar) that each track colour, row/round, stitches, needle/hook
size, notes and status. Easy counter updates on a phone, no negative counts, undo/confirm for
destructive actions, sample data on first launch, persistent storage."

## Terminology

| User term | App term | Notes |
|-----------|----------|-------|
| rank | **Row / Round** | Each component chooses "row" (flat) or "round" (in the round). |
| mailles | **Stitches** | Current stitch count. |
| needle / hook | **Tool size** | Labelled "Needle size" for knitting, "Hook size" for crochet, "Needle / tool" for sewing and other crafts. |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pick up where I left off and update counters (Priority: P1)

A maker opens the app mid-project, sees their in-progress project at the top, opens it, finds the
"Left sleeve" component and taps + to add a row and adjusts the stitch count after a decrease.

**Why this priority**: This is the reason the app exists: counting while working. Without it, the
rest is just a list.

**Independent Test**: With a project containing components, open it, increment/decrement row and
stitch counters, close and reopen the app, and confirm the counts are unchanged.

**Acceptance Scenarios**:

1. **Given** a project with components, **When** the maker taps "+" on a component's row counter,
   **Then** the row count increases by one immediately and is still there after reloading the app.
2. **Given** a row counter at 0, **When** the maker taps "−", **Then** the count stays at 0 and the
   "−" control is disabled.
3. **Given** a counter at 34, **When** the maker taps the number and types 40, **Then** the count
   becomes 40; typing a negative or non-numeric value is rejected with a clear message.
4. **Given** a counter at 34, **When** the maker resets it, **Then** they are offered an undo that
   restores 34.
5. **Given** an in-progress project was last updated, **When** the maker opens the app, **Then** a
   "Continue" card shows that project and the component last worked on, reachable in one tap.

---

### User Story 2 - Overview, create, edit, archive and find projects (Priority: P1)

A maker sees all projects as cards with photo or colour swatch, name, craft, status and progress;
creates a new project; edits it; archives a finished one; and searches by name or yarn.

**Why this priority**: Needed to create the projects that Story 1 works on.

**Independent Test**: Create a project, see it on the overview, edit its status, search for it,
archive it and confirm it disappears from the default view but is visible under "Archived".

**Acceptance Scenarios**:

1. **Given** the overview, **When** the maker creates a project named "Autumn socks" with craft
   Knitting, **Then** it appears on the overview with status "Planned" and 0% progress.
2. **Given** a project name left empty, **When** the maker tries to save, **Then** saving is
   blocked and the name field explains that a name is required.
3. **Given** several projects, **When** the maker types "merino" in search, **Then** only projects
   whose name, notes or materials match are shown.
4. **Given** a project, **When** the maker archives it, **Then** it is hidden from the default view,
   an undo is offered, and it is listed under the "Archived" filter where it can be restored.
5. **Given** an archived project, **When** the maker deletes it permanently, **Then** a confirmation
   dialog is shown before deletion.
6. **Given** status filter chips, **When** the maker selects "In progress", **Then** only in-progress
   projects are shown.

---

### User Story 3 - Manage components (Priority: P1)

A maker adds components "Body", "Sleeve" ×2 and "Collar" to a sweater, renames one, reorders them,
sets each component's tool size, colours, notes and status, and removes one with undo.

**Why this priority**: Components are what hold the counters; they are core to Story 1.

**Independent Test**: In one project, add, rename, reorder, edit and remove components and confirm
every change survives a reload.

**Acceptance Scenarios**:

1. **Given** a project, **When** the maker adds a component named "Left sleeve", **Then** it appears
   at the end of the list with status "Not started" and counters at 0.
2. **Given** components A, B, C, **When** the maker moves C up, **Then** the order is A, C, B and it
   persists.
3. **Given** a component, **When** the maker removes it, **Then** it disappears and an undo is
   offered that restores it in its original position with its counts.
4. **Given** two components, **When** the maker sets 4.5 mm on one and 3.5 mm on the other,
   **Then** each keeps its own tool size.
5. **Given** a project with yarns "Oat" and "Rust", **When** the maker assigns "Rust" to a component
   with the note "stripes every 4 rows", **Then** the component shows a Rust swatch with that note.
6. **Given** a component whose counters reach its optional target rows, **When** viewed, **Then**
   its progress shows complete for rows, and the maker can mark the component Complete.
7. **Given** a sewing project, **When** the maker adds a component, **Then** row/stitch counters are
   hidden by default and can be turned on.

---

### User Story 4 - Project details and materials (Priority: P2)

A maker records notes, a photo and several yarns/materials with name, brand, fiber, colour and notes.

**Why this priority**: Valuable context, but counting works without it.

**Independent Test**: Add two materials and a photo to a project, reload, confirm they're intact.

**Acceptance Scenarios**:

1. **Given** a project, **When** the maker adds a material with only a name, **Then** it is saved
   (all other material fields are optional).
2. **Given** a material used by a component's colour, **When** the material is removed, **Then** the
   maker is offered an undo, and the component's colour falls back to showing "removed material".
3. **Given** a photo is chosen, **When** saved, **Then** it is shown on the project card and detail
   page; a non-image file is rejected with a message.

---

### User Story 5 - First-launch sample data and backup (Priority: P3)

On first launch the app shows a few clearly labelled sample projects. The maker can remove them all
in one action. The maker can export all data to a file and import it on another device.

**Why this priority**: Makes the app easy to explore and gives a manual sharing path.

**Independent Test**: Clear storage, open the app, see samples; remove samples; reopen and confirm
samples do not return; export and import a file and confirm projects match.

**Acceptance Scenarios**:

1. **Given** a brand-new store, **When** the app opens, **Then** 3 sample projects labelled "Sample"
   are shown.
2. **Given** a store that already has user projects (or whose samples were removed), **When** the
   app opens, **Then** no samples are added.
3. **Given** an exported file, **When** imported on another device, **Then** projects are merged:
   new ones are added and, for the same project, the most recently updated version is kept.
4. **Given** an invalid file, **When** imported, **Then** nothing changes and an error is shown.

### Edge Cases

- Storage unavailable (e.g. blocked by private browsing): the app still works for the session and
  shows a persistent warning that changes will not be kept.
- A save fails (e.g. storage full): the user sees an error message; in-memory state is kept.
- Very large photos: downscaled before saving; files that cannot be read are rejected.
- Very large counts: counts are capped at 99,999.
- Duplicate component names (two "Sleeve"s) are allowed.
- Long project names wrap gracefully without breaking the layout.
- Search with no matches shows a friendly empty state with a "clear search" action.
- Two tabs open at once: the last write wins (acceptable for two casual users on separate devices).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create a project with a required name (1–80 characters) and a
  craft type (Knitting, Crochet, Sewing, Other).
- **FR-002**: Projects MUST have a status: Planned, In progress, Paused, Completed (default Planned).
- **FR-003**: Projects MUST support optional notes, an optional photo, and a colour swatch used as a
  visual identifier when no photo is set.
- **FR-004**: The overview MUST show each non-archived project's name, craft, status, photo/swatch
  and a progress indicator, sorted by most recently updated, and open the detail page on selection.
- **FR-005**: Users MUST be able to search projects by name, notes and material text, and filter by
  status and by archived state.
- **FR-006**: Users MUST be able to archive and unarchive projects, with undo after archiving, and
  permanently delete a project after confirmation.
- **FR-007**: Projects MUST support zero or more materials, each with a required name and optional
  brand, fiber, colour name, colour swatch, weight and notes.
- **FR-008**: Projects MUST support zero or more components, which users can create, rename, edit,
  reorder (move up/down) and remove (with undo).
- **FR-009**: Each component MUST track: colours (zero or more, each optionally linked to a project
  material, with a placement note), current row/round count, current stitch count, tool size,
  notes, and status (Not started, In progress, Complete).
- **FR-010**: Counters MUST provide increment and decrement controls, direct numeric entry, and a
  reset with undo; counts MUST be whole numbers between 0 and 99,999.
- **FR-011**: Each component MUST let the user choose whether it counts rows or rounds, and MAY have
  an optional target row/round count used for progress.
- **FR-012**: Incrementing a counter on a "Not started" component MUST automatically set it to
  "In progress"; likewise a "Planned" project becomes "In progress".
- **FR-013**: The tool size field MUST offer common sizes appropriate to the craft (metric with US
  equivalents) and accept free text.
- **FR-014**: Labels MUST adapt to craft: "Needle size" (knitting), "Hook size" (crochet),
  "Needle / tool" (sewing, other).
- **FR-015**: For sewing projects, counters MUST be hidden by default per component and can be
  enabled; no component field is required except its name.
- **FR-016**: All changes MUST persist automatically and survive closing and reopening the app.
- **FR-017**: The app MUST show a loading state while data is read, an error state if it cannot be
  read, and a warning if changes cannot be saved.
- **FR-018**: On first launch with an empty store the app MUST create labelled sample projects
  once; users MUST be able to remove all samples in one action; samples MUST never be re-added.
- **FR-019**: Users MUST be able to export all projects to a file and import such a file, merging by
  project identity with the most recently updated version winning.
- **FR-020**: The overview MUST highlight the most recently worked-on in-progress project with a
  one-tap "Continue" action that opens that project at its last-used component.
- **FR-021**: All interactive elements MUST be keyboard operable with visible focus, and counter
  changes MUST be announced to assistive technology.

### Key Entities

- **Project**: a craft piece. Name, craft, status, notes, photo, swatch colour, archived flag,
  sample flag, last-worked component, created/updated times. Owns materials and components.
- **Material**: a yarn, fabric, thread or notion used in a project. Name, brand, fiber, colour
  name, colour swatch, weight, notes.
- **Component**: a part of a project (e.g. "Left sleeve"). Name, status, row-or-round mode, row
  count, optional target, stitch count, tool size, colour assignments, notes, counters-enabled flag.
- **Colour assignment**: links a component to a project material (or a free colour) with a note on
  where it is used.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From the overview, a maker can change a component's row count in at most 3 taps
  (Continue/open project → +).
- **SC-002**: 100% of changes made are still present after closing and reopening the app.
- **SC-003**: A new user can create a project with two components in under 2 minutes.
- **SC-004**: All screens are usable at 360px width without horizontal scrolling.
- **SC-005**: All text and controls meet WCAG AA contrast; all features are reachable by keyboard.
- **SC-006**: No counter can be put into a negative state through any control.

## Assumptions

- Two people use the app, each on their own device(s). Real-time sync is out of scope for v1; data
  is stored locally on each device, and the export/import file is the sharing path. The storage is
  designed so shared sync can be added later.
- No user accounts or authentication in v1 (nothing is sent to a server).
- Metric tool sizes with US equivalents are shown; free text covers UK and other systems.
- Reordering uses move up/down controls (reliable on touch and keyboard) rather than drag-and-drop.
- English UI.
