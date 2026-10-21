# v27 — Proper theme packs and optional presets

- Saving a theme now stores its color palette, font, style notes, and **separate layout configuration** for title, section, blank, announcement and invite. Text is supplied by each creator; it is not stored as part of a theme image.
- Canva designs / AI concepts are saved **only as reference images** and linked Canva design IDs. The finished Canva slide is **never reused as the Native background**. Canva cannot reliably provide separable background art or fonts using the current connected integration; set desired Native font and palette in Theme Studio before saving.
- Existing local Canva themes created by older versions are automatically **treated as references when used**, so their baked-in text is no longer rendered beneath Native content. Old stored records are not deleted.
- Theme Studio has editable colors/fonts and layout controls; the six native concept cards are behind an **optional collapsible section**.
- Theme Studio AI requests now ask for text-free visual studies and do not include event-specific details. Canva may still produce wording; AI imagery is only a reference.
- No Cloudflare Worker changes are required. Existing Worker v25/v26 compatible.
