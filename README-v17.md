# PresCreator v17 — Canva AI and Native import

- Upload Worker v17 to Cloudflare first. Keep CANVA_CLIENT_ID, CANVA_CLIENT_SECRET, CANVA_CLIENT_ID2, CANVA_CLIENT_SECRET2, SESSIONS.
- Copy all files from this folder into the GitHub repository root, keeping the existing valid package-lock.json. Commit and push.
- Long Canva AI generation requests now use a compact brief while keeping an explicit slide outline. This is a compatibility attempt, not a guarantee. If Canva rejects the job, detailed error code is surfaced.
- Successful AI designs are retained in the Studio even if thumbnail PNG export fails. Retry Preview does not regenerate.
- Native → Save to Canva creates a transient editable PPTX on Cloudflare, uploads it using Canva Import API, and shows Edit in Canva when complete. Slides and background are not persistently stored on Cloudflare.
- Download PPTX requires a connected Canva account in this version because the PPTX converter uses the authenticated Worker route. HTML export still works entirely offline.
- Import can fail depending on Canva compatibility; manual PPTX upload is an alternative.
- Cloudflare API features depend on an authorized Canva account. For public rollout, Canva's review and preview-API restrictions still apply.
