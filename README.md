# Drex Developer Portfolio

A React + Express portfolio with a private admin area. The admin can update profile text, skills, services, profile photo, CV, projects, project images and contact-form messages without editing source code.

## Requirements
- Node.js 20 LTS or newer
- npm

## Run on Windows 10
1. Extract the ZIP file.
2. Open the extracted `drex-portfolio` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run `npm install` and wait for it to finish.
5. Run `npm run dev`.
6. Open `http://localhost:5173` in your browser.
7. Open `http://localhost:5173/admin` to create your private admin account on first visit. Use a username of at least 3 characters and a password of at least 10 characters. Keep these credentials private.

The public portfolio is at `/`. Admin is at `/admin`.

## Production build
1. Run `npm install`
2. Run `npm run build`
3. Run `npm start`
4. Open `http://localhost:4000`

Before deploying publicly, create a `.env` file from `.env.example`, set a long unique `SESSION_SECRET`, set `NODE_ENV=production`, and use HTTPS. The included JSON storage and Express in-memory session store are intended for a small single-instance starter deployment, not a multi-server production environment. For a public production deployment, move content to a managed database and sessions to a persistent session store, and configure persistent file storage/backups.

## Content and uploads
Initial sample project cards are included for Dabby Hair Sensation and EduCore. Check their descriptions, links and screenshots in the admin area before publishing. Uploads are stored in `server/uploads`; content is stored in `server/data`. Back up both folders. The first admin account is created through the one-time setup screen; there is no default password.

## Notes
- The site uses Google Fonts from the web; if offline, it falls back to system fonts.
- Uploaded images/PDFs have a 5 MB limit.
- Contact messages are stored locally in `server/data/messages.json` and can be read in the admin inbox.
- This starter does not send email notifications; check the admin inbox for submissions.
