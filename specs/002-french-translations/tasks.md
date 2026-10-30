---
description: "Task list for French Translations"
---

# Tasks: French Translations

**Input**: Design documents from `/specs/002-french-translations/`

## Phase 1: Foundational

- [x] T001 Create Lang type, browser detection, remembered choice and plural rule in src/i18n/lang.ts
- [x] T002 Create typed `en` and `fr` catalogues (fr typed `Record<MessageKey, string>`) in src/i18n/messages.ts
- [x] T003 Create I18nProvider with `t`, `tp`, `setLang`, updating `<html lang>` in src/i18n/I18nProvider.tsx
- [x] T004 [P] Localised tool-size suggestions (fr: metric, decimal comma) and part presets in src/i18n/craftData.ts
- [x] T005 Domain returns codes instead of English: validateName → 'required' | 'tooLong', parseCount → 'notWhole' | 'tooBig' in src/domain/validation.ts; remove label maps from src/domain/craft.ts and progressSummary from src/domain/progress.ts
- [x] T006 [P] Backup errors carry a code (notJson | notBackup | wrongVersion) in src/storage/backup.ts; photo errors carry a code in src/ui/PhotoPicker.tsx

## Phase 2: User Story 1 — whole app in French (P1)

- [x] T007 [US1] Translate shell, banners, loading/error states in src/App.tsx and src/main.tsx
- [x] T008 [US1] Translate src/ui/bits.tsx, src/ui/Sheet.tsx, src/state/toast.tsx, src/ui/ProjectCard.tsx
- [x] T009 [US1] Translate src/ui/Counter.tsx and src/ui/ComponentCard.tsx
- [x] T010 [US1] Translate src/ui/ComponentEditor.tsx and src/ui/MaterialsSection.tsx and src/ui/PhotoPicker.tsx
- [x] T011 [US1] Translate src/screens/OverviewScreen.tsx, ProjectScreen.tsx, ProjectFormScreen.tsx, SettingsScreen.tsx

## Phase 3: User Story 2 — choose and remember (P1)

- [x] T012 [US2] Header language toggle in src/App.tsx; Language section in src/screens/SettingsScreen.tsx

## Phase 4: User Story 3 — French samples (P3)

- [x] T013 [US3] French sample projects in src/domain/sampleData.ts; seed with active language in src/state/bootstrap.ts and src/state/store.tsx

## Phase 5: Tests & polish

- [x] T014 [P] Catalogue parity + plural tests in tests/i18n/messages.test.ts
- [x] T015 [P] French UI flow (switch, labels, counter, validation, persistence of choice) and French samples in tests/ui/i18n.test.tsx
- [x] T016 Update existing tests for code-based validation; reset language between tests in tests/setup.ts
- [x] T017 Update README; run `npm run check` and `npm run build`; screenshot French UI at phone width
