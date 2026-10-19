# PresCreator v15 — Canva account names and invalid_scope diagnostics

Deploy `prescreator-worker-dual-canva-v15.txt` to Cloudflare first. Preserve existing bindings and secrets.

Connection 2 must have the **same enabled OAuth scopes** as the Worker requests: `profile:read`, `design:meta:read`, `design:content:read`, `design:content:write`. Enable them in the second Canva Developer app, and confirm the callback matches. Saving the scopes is required even if the Worker code has been updated.

The app displays the actual Canva **display name** after successful login; Canva's standard profile endpoint does not provide an email address. Until then it displays `Canva account 1` / `Canva account 2`.

Copy the ZIP contents into the GitHub repository, preserving the existing `package-lock.json`. Commit and push.
