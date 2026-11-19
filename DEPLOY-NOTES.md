# Drex Portfolio — Render deployment notes

This bundle excludes the original `.env`, `.git`, `node_modules`, `dist`, and existing admin/inbox JSON files.
It preserves the current public settings, projects, and media files.

## Render Blueprint
Connect this repository to Render and create a Blueprint using `render.yaml`.
The Blueprint creates a free Node web service, builds with `npm ci && npm run build`,
starts with `npm start`, sets `NODE_ENV=production`, and generates `SESSION_SECRET`.
Before the first deploy, set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in the Render
service's Environment settings. Use a unique username and a strong password of at
least 10 characters. These values are not stored in the repository or on the app's
filesystem; the password is hashed in memory when the server starts.

To change the username or password later, update the corresponding Render environment
variable and redeploy. The credentials remain set across restarts and spin-downs. Do
not send them in chat or commit them to the repository. The public `/admin` page only
accepts a login; there is no public account-setup endpoint.

## Important free-tier limitation
The current app stores editable settings, projects, uploaded files, and contact messages
on the server filesystem. Render Free uses an ephemeral filesystem and can discard those
changes on restarts, redeploys, and spin-down. Treat this first deployment as a public
portfolio preview. Before relying on the admin editor or contact inbox, migrate writable
content and uploads to persistent managed services (for example, Supabase Postgres/Storage).

The Express app now trusts Render's reverse proxy so secure session cookies work behind HTTPS.
For local development, copy `.env.example` to `.env` and set `SESSION_SECRET`,
`ADMIN_USERNAME`, and `ADMIN_PASSWORD` to private values before starting the server.
