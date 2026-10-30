# Feature Specification: French Translations

**Feature Branch**: `002-french-translations`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "can you add french translations"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use the whole app in French (Priority: P1)

A French-speaking maker opens the app and sees every screen, label, button, message, error and
confirmation in natural French, using the terms a French knitter or crocheter would use
(rang / tour, mailles, taille d'aiguille, taille de crochet).

**Why this priority**: The app is for two friends; French is the language one or both use for their
craft ("rank", "mailles" in the original brief).

**Independent Test**: Switch the language to French, then go through the overview, a project, the
part editor, the materials form, the new-project form and the settings page; no English text remains.

**Acceptance Scenarios**:

1. **Given** the language is French, **When** the maker opens a knitting project, **Then** counters
   read "Rangs" or "Tours" and "Mailles", and the tool field reads "Taille d'aiguille".
2. **Given** a crochet project in French, **When** a part is edited, **Then** the tool field reads
   "Taille de crochet"; for sewing it reads "Aiguille / outil".
3. **Given** French, **When** counts are shown or entered, **Then** pluralisation follows French
   rules (0 and 1 are singular) and validation messages are in French.
4. **Given** French, **When** the needle-size field is opened, **Then** suggestions use metric sizes
   with a decimal comma (e.g. "4,5 mm").

---

### User Story 2 - Choose and remember the language (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a browser whose preferred language is French, **When** the app is opened for the first
   time, **Then** it appears in French; otherwise in English.
2. **Given** any screen, **When** the maker uses the language switch in the header or in Settings,
   **Then** the interface changes language immediately, with no data lost or changed.
3. **Given** a chosen language, **When** the app is closed and reopened, **Then** the same language is used.

---

### User Story 3 - French sample projects (Priority: P3)

**Acceptance Scenarios**:

1. **Given** a first launch in French, **When** sample projects are created, **Then** their names,
   parts, notes and materials are in French.

### Edge Cases

- Switching language never alters stored project data (statuses and crafts are stored as codes).
- User-entered text (project names, notes) is never translated.
- Samples created in one language stay in that language after switching.
- Technical storage details (raw browser error text) may stay untranslated, under a translated
  explanation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST offer English and French for all interface text, including accessible
  names, placeholders, toasts, dialogs and validation messages.
- **FR-002**: The French translation MUST be complete; a missing translation MUST be caught before
  release.
- **FR-003**: The initial language MUST follow the browser's preferred language (French if it starts
  with "fr", else English); the user's explicit choice MUST be remembered on that device.
- **FR-004**: The page's language attribute MUST match the chosen language so screen readers
  pronounce text correctly.
- **FR-005**: Plural forms MUST follow each language's rules.
- **FR-006**: Craft-specific suggestions (tool sizes, quick-add part names) MUST be localised.
- **FR-007**: Sample projects MUST be created in the language active at first launch.

## Success Criteria *(mandatory)*

- **SC-001**: 100% of interface strings are available in French (checked automatically).
- **SC-002**: Switching language takes one tap from any screen.
- **SC-003**: All existing behaviour and tests keep passing in English.

## Assumptions

- Two languages only (English, French); the structure allows adding more.
- French uses standard typography (non-breaking space before ":" "?", guillemets « »).
- Metric sizes only in French suggestions; free text still accepts any system.
