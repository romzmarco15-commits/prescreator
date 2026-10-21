# PresCreator v33 — Design Studio UI Audit

- Theme preview button in all creators with reference image for AI themes and live example layouts for Native themes.
- Blank Slide hides all text/event fields; only design name, size, and Native visual controls remain. AI blank-slide prompt explicitly requests no lettering.
- Canva AI designs remain 16:9 originals. The portrait/square preview fits the whole image inside the selected dimensions; users can download an adapted 1080×1350/1080×1080 PNG, or create a custom-size flattened Canva design using the existing Worker. This is **not** AI-generated portrait reflow; Canva may require upload permissions and the browser may restrict export of the Canva preview URL.
- Preview tool actions consolidated: save, download and Canva commands appear in appropriate locations; removed duplicate Native download and copy buttons from sidebar and unrelated version/project lists from Theme Studio.
- Scoped AI version history to creator and retained Native snapshots.
- Existing IndexedDB local projects and Canva sessions unchanged; no Cloudflare Worker change.

Deployment: replace frontend sources, retain your existing package-lock.json. Run npm ci && npm run build and confirm GitHub Actions deployment. Live Canva export and browser UI tests are still required.
