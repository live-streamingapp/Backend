# Static data export/import (no users, no orders, no progress)

This project now uses a static export/import flow for reseeding content. Dynamic entities like users, orders, student progress and notifications are intentionally excluded.

What is included:

- Services (including consultations/packages)
- Podcasts
- Courses
- CourseSessions (sanitized; no attendance/chat/token)
- Blogs
- Books
- Banners
- Events
- Testimonials
- AboutUs

What is excluded:

- Users
- Orders
- StudentProgress
- Notifications

## Prerequisites

- Set `MONGO_URI` in `Server/.env` to the target database before running import.
- For export, `MONGO_URI` should point to the source database.

## Export static data from the current DB

Optional one-liner (generates a file in `Server/static-export.json`):

```
# optional
npm run export:static
```

Or get the raw JSON to stdout for piping:

```
# optional
node scripts/exportStaticData.js > static-export.json
```

## Import static data into a new/empty DB

1. Point `Server/.env` `MONGO_URI` to the destination database.
2. Optionally clear existing static collections by setting `TRUNCATE_STATIC=true` in env.
3. Run import:

```
# optional
npm run import:static
```

Alternatively, import from any JSON file:

```
# optional
node scripts/importStaticData.js path/to/export.json
```

You can also pipe JSON via stdin:

```
# optional
node scripts/exportStaticData.js | TRUNCATE_STATIC=true node scripts/importStaticData.js
```

## Notes

- CourseSessions are scrubbed to remove: `enrolledStudents`, `attendedStudents`, `chatMessages`, `questionsAsked`, and any Agora `token`, `tokenExpiry`, and `appId`.
- Some creator references like `createdBy` are omitted to avoid coupling to user IDs in a new DB.
- `Server/.gitignore` excludes `static-export.json` to prevent accidental commits.

## Troubleshooting

- If you see `[DEPRECATED] ... is disabled` when running old seeders, that is expected. Use the export/import scripts instead. Legacy seed scripts have been guarded to prevent accidental use. If you must run them temporarily, set `ALLOW_LEGACY_SEED=true` in the environment (not recommended).

### Courses, Books, or Events not importing?

Your destination schemas require `createdBy` on Course/Book/Event. The export intentionally omits `createdBy` to avoid coupling to source user IDs. During import, we auto-fill `createdBy` using `IMPORT_CREATED_BY` from `.env` if set; otherwise a neutral ObjectId `000000000000000000000000` is used. If you didn’t set `IMPORT_CREATED_BY`, inserts might fail depending on validators or middleware.

Fix:

1. Find the ObjectId of your admin/creator user in the destination DB.
2. Set it in Server/.env as:

```
IMPORT_CREATED_BY=<your_admin_objectid>
```

3. Re-run the import (optionally with `TRUNCATE_STATIC=true`).
