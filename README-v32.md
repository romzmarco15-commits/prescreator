# PresCreator v32 — creator workflow corrections

- Native editor and Canva AI editor are explicit in all three creators. Switching to Native with an AI reference selected automatically restores the last Native theme without clearing content.
- Theme dropdowns are filtered by mode: Native themes only for Native editing; both Native and AI references for Canva AI.
- Announcement Maker is now text-first, with an optional checkbox for event details. E-Invite remains event-focused, with date, time and location.
- AI additional instructions are always visible; heading and layout guidance selectors are available for Canva AI.
- The Canvas design-generation API produces 16:9 presentations: choosing portrait does not create a portrait Canva AI document. Native outputs do honor selected formats. This build does not claim to fix unsupported portrait Canva AI generation.
- Does not require a Cloudflare Worker update.
