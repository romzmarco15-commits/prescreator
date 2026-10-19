# PresCreator — local-first worship presentation studio

React + TypeScript + Vite app. GitHub Pages hosts **only the app code**. User-created presentations, lyrics, images, and versions live in the user's browser via IndexedDB. Canva AI remains optional, accessed through the existing Cloudflare Worker.

## First deployment

1. Unzip this package on your computer. Make sure `package.json`, `index.html`, `src/`, `public/`, and `.github/` are at the **repository root**.
2. Use GitHub Desktop: **File → Add local repository** (or clone your `prescreator` repository first), copy the files into the cloned repository, and commit and push to `main`.
3. In the repository: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Open **Actions** and wait for "Publish PresCreator" to finish.
5. Visit `https://romzmarco15-commits.github.io/prescreator/`.

If GitHub Pages says this is not a recognized repo or the workflow does not start, check that the file is at `.github/workflows/pages.yml` in `main` (not nested under an extra folder).

## Run locally

Requirements: Node.js 22 (or a compatible current version).

```bash
npm install
npm run dev
```

Open Vite's printed localhost URL.

## Current implementation

- Exact Native splitting: ignores blank lines, configurable 1–10 lyrics per slide
- Custom uploaded backgrounds stored on-device, plus bundled background gradients
- Slide previews, current-slide text editing, browser fullscreen presentation
- Multiple generation snapshots; restore a previous version
- Local IndexedDB project library, backup and restore JSON, standalone HTML export
- Canva login and AI workspace links to the existing Cloudflare Worker

## Deliberate limitations

- This release does **not** embed Canva AI generation into the React app or establish shared OAuth status across GitHub Pages and Cloudflare. Those require a secure redirect/CORS/session bridge in the backend.
- Native "Save directly to Canva" is not wired up in this release. Standalone HTML export is available; PPTX/Canva import requires further work.
- Local browser data can be erased by the browser. Use the full-library Backup action regularly.
- No cloud project data storage or online account is used.
- CDN-hosted frontend source is publicly visible. Never put Canva client secrets or tokens into any frontend file, GitHub repository, or Vite environment variable.

## Security

The Cloudflare Worker must authenticate individual Canva users and protect their OAuth tokens server-side. The frontend intentionally does not store access tokens. Only open the Canva login link or workspace in a separate tab until an audited cross-origin integration is implemented.
