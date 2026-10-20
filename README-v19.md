# PresCreator v19 — Native background fixes

Native background choices now work independently. Choose an existing preset (Forest green, Warm beige, Dark navy, etc.), a custom solid color, a two-color gradient with angle, or Image. Uploading an image automatically selects Image; selecting a preset disables the image without deleting it. Image is rendered once at the center using cover/no-repeat in Studio, thumbnails, and exported HTML. Image/background selection is also honored in Native PowerPoint import to Canva. Existing Canva integration, accounts and secrets are unchanged.

## Install
Copy the contents of this ZIP to the root of your GitHub repository, preserve package-lock.json, run `npm run build`, commit and push. Cloudflare Worker does not require an update.

Note: If an older saved project used an image under a color preset, choose Image from the Background type menu to show the stored image again.
