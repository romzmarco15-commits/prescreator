PresCreator Dual Canva v14

GitHub: Copy these app files over the existing repository and push.
Cloudflare: Deploy prescreator-worker-dual-canva-v14.txt separately.
Expected Worker secrets: CANVA_CLIENT_ID, CANVA_CLIENT_SECRET, CANVA_CLIENT_ID2, CANVA_CLIENT_SECRET2.
Existing KV: SESSIONS.
Both Canva Developer integrations must register identical OAuth redirect URI: https://prescreator-api.romz-marco15.workers.dev/oauth/redirect
The UI provides Connection 1 and Connection 2 selection in Settings and Canva AI Studio. Sessions are separate and tab-scoped.
Do not store Canva secrets in the GitHub repository. Draft integrations are not intended for arbitrary public users.
