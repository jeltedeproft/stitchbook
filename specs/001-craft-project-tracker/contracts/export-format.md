# Contract: Backup / Sharing File

File name: `knit-backup-YYYY-MM-DD.json`, UTF-8 JSON.

```json
{
  "app": "knit",
  "version": 1,
  "exportedAt": 1793000000000,
  "projects": [ /* Project objects as in data-model.md */ ]
}
```

Import rules:

1. Reject (no changes) unless `app === "knit"`, `version === 1` and `projects` is an array.
2. Each project is validated/normalised (missing optional fields defaulted, counts clamped);
   projects without an id or a valid name are skipped and counted in the result.
3. Merge by `id`: new ids are added; for existing ids the one with the greater `updatedAt` wins.
4. Result reports `{ added, updated, skipped }`.
