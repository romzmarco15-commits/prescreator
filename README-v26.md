# PresCreator v26 — Unified Creation

The existing Design Studio now has three visible creators: Slide Maker, E-Invite Maker, and Announcement Maker, plus Theme Studio. All three editors share their current theme and fields between Native and Canva AI. Each creator has a collapsible extra AI prompt, separate Generate Native and Generate with Canva AI actions, and a right-side version selector.

The original Native draft stays editable after AI generation. Native versions are session snapshots; use Save locally to store editable projects in IndexedDB. AI designs live in the connected Canva account; preview URLs can expire. Existing saved designs, including posters and sections, remain in the local library.

Deploy only the frontend files. This release reuses the v25 Cloudflare Worker.
