# PresCreator v25 — Unified Theme Workflow

- Theme Library stored locally using IndexedDB.
- Browse accessible Canva account designs and import their thumbnail artwork as background for a reusable local theme. Existing Canva elements are NOT editable in PresCreator.
- Save current Native theme or AI result as a reusable theme.
- Choose saved themes across title slides, section slides, announcements, posters and invites.
- Date and time pickers; values stored as ISO local date and 24h time and displayed in a friendly format.
- Switch to AI redesign without discarding the current Native content or theme; previously generated Canva versions stay available during current session.

Deploy Worker v25 before frontend v25. Canva theme listing requires `design:meta:read`. Imported theme images are local; deleting browser site data can remove them. Canva thumbnails can contain baked-in text or be cropped.
