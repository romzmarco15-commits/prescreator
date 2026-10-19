# PresCreator – Native + Canva AI Creation Studio

A local-first React application published with GitHub Pages.

## Deployment (two parts, in this order)

1. Back up your existing Cloudflare Worker. Replace its code with `prescreator-worker-github-integration-v13.mjs` from the separate Worker download. Keep the existing `CANVA_CLIENT_ID`, `CANVA_CLIENT_SECRET` and `SESSIONS` bindings. Deploy the Worker. In Canva Developers, the authorized redirect must be `https://prescreator-api.romz-marco15.workers.dev/oauth/redirect`. Do not put secrets in GitHub.
2. Copy the **contents** of this app folder to `romzmarco15-commits/prescreator`, commit and push. GitHub Pages → Source: GitHub Actions. The workflow builds and publishes the Vite app automatically.
3. Visit https://romzmarco15-commits.github.io/prescreator/ → Creation Studio → Canva AI → Connect Canva. OAuth uses a popup, then the Studio can generate and review the PNG slide exports on the right.

## Local development

```sh
npm install
npm run dev
```

Use the URL printed by Vite, not `index.html` as a local file. If a manually created, empty `package-lock.json` exists, remove it before `npm install`, then commit the real generated lock file. The GitHub Actions workflow does not require a lockfile at setup-node.

## Design notes

- Native slides, local projects, custom images and backups use browser storage; no cloud project database.
- The Cloudflare Worker stores only authentication session state and brief job metadata in its existing KV, and proxies requests to Canva.
- Canva designs are saved in the **connected user's** Canva account.
- Canva AI generations may consume account credits and are subject to Canva app approval and the user's feature availability.
- AI slide images are read-only; editing the actual design still happens in Canva. The version selector keeps PNG URLs in the current tab session, and these URLs may expire.
- The Canvas integration is still a developer/draft integration; public use with new Canva accounts requires Canva's review and supported API permissions.

## Known limitations

This version provides the integrated Canva AI workflow but not a fully tested public multi-user Canva OAuth rollout. The Worker and front-end still require a live integration test against your Canva account. Native saving to Canva is not yet integrated into the React frontend.
