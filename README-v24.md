# PresCreator v24 — Canva AI Design Studio

Native Theme Picker, Title, Section, Announcement, Poster and E-Invite remain available without Canva.

## New

- Canva AI single-slide 16:9 concept generation in Design Studio, with previews and session versions.
- Save native design to Canva as a custom-size design containing a **flat PNG image layer**. Text remains editable in PresCreator, not separately editable in Canva via this path.
- Connection 1/2 account selection inherited from the host app.

## Limitations

Canva Design Generation API currently supports presentation/doc types; the Design Studio's Canva AI concepts are 16:9 presentations. For exact portrait/square formats, use Native mode. AI may not honor all text and slide-count requests. Each regeneration may consume AI credits.

The Native Canva upload feature requires `asset:write`, `asset:read`, and `design:content:write` scopes enabled and approved for the connected account. If these scopes are enabled in the Canva Developer integration, click **Authorize image upload** in Design Studio to reconnect with the additional permissions. This is optional for Native designs that are not being saved to Canva.

Keep all four existing Canva Client ID/Secret bindings and SESSIONS KV. Deploy the Worker before the GitHub app.
