# PresCreator v21 — Separate studios and teaching outline cards

## Changes
- Sidebar now has **Lyric Studio** and **Teaching Studio** as distinct navigation destinations. Switching preserves each studio's current draft within the open app session.
- The top **New presentation** button starts a new project of the current studio type.
- Teaching Studio has structured outline cards: slide type, heading, content, speaker notes, reorder by dragging or up/down, delete and add.
- The outline saves with projects in local IndexedDB; existing `Heading | Detail` teaching projects are automatically interpreted as cards.
- Native teaching slides and Canva AI teaching prompts are both generated from the card data.
- Existing lyric editor, background settings, Canva accounts, Native exports and Project Library are retained.

## Install
Copy the **contents** of `prescreator-studio-v21` into your cloned GitHub repository, retain `package-lock.json`, commit and push. No Cloudflare Worker changes are required.

## Test
1. Open Lyric Studio, enter a sample song.
2. Open Teaching Studio; edit/add/reorder an outline card.
3. Switch back to Lyric Studio: the lyric draft should still be present.
4. Switch back to Teaching Studio: your outline edits should still be present.
5. Generate Native teaching slides, save project, reload and open it from Project Library.

Drafts survive navigation within the app session. To preserve them after reloading or clearing the page, click Save project; local browser storage is not a replacement for an exported backup.

## Verification
TypeScript and TSX syntax were checked with TypeScript's parser. A complete npm production build could not be verified in the execution environment because dependency installation timed out. GitHub Actions will perform the production build.
