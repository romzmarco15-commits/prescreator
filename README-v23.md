# PresCreator v23 — Design Studio

## New navigation
- **Lyric Studio** (unchanged)
- **Teaching Studio** (unchanged)
- **Design Studio** (new)

## Design Studio, Phase 1
- Choose from six native theme families, or enter theme keywords and generate six offline variants.
- Reuse one theme to create a title page, section divider, church announcement, poster, or event invitation.
- Native text fields, orientation (landscape, portrait, square), uploaded background, gradient or solid colors, accent colors, and font/layout controls.
- Right-side live preview and local PNG download.
- Save and reopen designs in IndexedDB, isolated from the worship and teaching drafts.

## Current limitations
- The concepts are generated locally from reusable design presets. They are **not Canva AI-generated concepts**. Canva AI concept generation is planned for a later phase.
- PNG exports are raster images, not editable Canva designs. Native design text remains editable inside PresCreator until exported; Canva import is not wired to the new Design Studio yet.
- Saved Design Studio designs are in a separate browser-local IndexedDB store. Existing project backup does not currently include Design Studio entries. Download exported PNG copies.
- A full `npm run build` was not verified in this environment because npm package installation timed out. GitHub Actions will run the build after you push.

## Install
1. Back up your current repository.
2. Copy the *contents* of `prescreator-studio-v23/` to the root of your GitHub repository (next to package.json).
3. Keep your existing package-lock.json if present.
4. Commit and push to main. GitHub Actions deploys to GitHub Pages.
5. No changes required to the Cloudflare Worker or Canva credentials.
