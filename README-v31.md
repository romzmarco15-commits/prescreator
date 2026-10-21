# PresCreator v31 – Canva edit actions

- Design Studio (Theme Studio, Slide Maker, E-Invite Maker, Announcement Maker) has an explicit Canva action beside the preview.
- Selected Canva AI version opens its original Canva editor.
- Native live canvas or selected Native snapshot uploads that particular artwork at its native dimensions, then attempts to open the resulting Canva design.
- When the popup is blocked, the last successful upload can be opened using 'Open last Canva upload'.
- Canva reference themes open the original design when an original edit URL was captured. Older records without edit URLs require reopening the original design from 'My Canva Designs' or generating a new AI version.
- Lyric Studio and Teaching Studio 'Save & Edit in Canva' uploads PPTX, then opens Canva when import completes. PPTX import may fail depending on Canva's import API.
- Native Design Studio uploads are flattened PNGs: individual text/shapes remain editable in PresCreator but not as layers in Canva.
- No Worker modifications. Existing Canva image upload permissions required (asset:read, asset:write, design:content:write).
- TypeScript syntax/transpile validated; npm production build unavailable because package dependencies were not cached.
