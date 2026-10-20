# PresCreator v20 — Teaching / Sermon Creator

New dashboard Teaching / Sermon action and sidebar entry. Native Teaching uses `Heading | Detail` lines; blank lines are ignored and no content is auto-invented. Scripture references are never treated as verified verse text. Per-slide speaker notes stay in locally saved IndexedDB projects and backup files. Native teaching slides reuse existing style, presenter, HTML export, and optional Canva PPTX import. Canva AI Teaching uses `/app/teaching-generate`, the existing Canva job polling and PNG preview, with topic, passage reference, audience, target slide count, outline and contextual instructions. AI slide count and Scripture accuracy cannot be guaranteed; review AI results before presenting.

Deploy the provided Worker v20 first, then GitHub frontend files. Preserve `package-lock.json` if it already exists in the repository.
