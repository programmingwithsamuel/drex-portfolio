# Drex Portfolio — Render deployment notes

This bundle excludes the original `.env`, `.git`, `node_modules`, `dist`, and existing admin/inbox JSON files.
It preserves the current public settings, projects, and media files.

## Render Blueprint
Connect this repository to Render and create a Blueprint using `render.yaml`.
The Blueprint creates a free Node web service, builds with `npm ci && npm run build`,
starts with `npm start`, sets `NODE_ENV=production`, and generates `SESSION_SECRET`.

## Important free-tier limitation
The current app stores editable settings, projects, uploaded files, and contact messages
on the server filesystem. Render Free uses an ephemeral filesystem and can discard those
changes on restarts, redeploys, and spin-down. Treat this first deployment as a public
portfolio preview. Before relying on the admin editor or contact inbox, migrate writable
content and uploads to persistent managed services (for example, Supabase Postgres/Storage).

The Express app now trusts Render's reverse proxy so secure session cookies work behind HTTPS.
Create the first administrator through `/admin` after deployment. Use a unique username and
a strong password; do not reuse credentials from the original local copy.
