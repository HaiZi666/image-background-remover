# Image Background Remover

Remove image backgrounds with one click. Built with Cloudflare Workers and Remove.bg API.

## Features

- 🖼️ Upload or drag & drop images
- ✂️ One-click background removal
- ⬇️ Download result as PNG
- 🚀 Fast processing via Cloudflare Workers
- 💾 No data stored - all in memory

## Setup

### 1. Configure Remove.bg API Key

Edit `wrangler.toml` and add your Remove.bg API key:

```toml
[vars]
REMOVE_BG_API_KEY = "your-api-key-here"
```

Get your API key at: https://www.remove.bg/api

### 2. Deploy Cloudflare Worker

```bash
npm install
npx wrangler deploy
```

Note the Worker URL after deployment.

### 3. Update Frontend

Edit `public/app.js` and replace the `API_URL` with your Worker URL:

```javascript
const API_URL = 'https://your-worker.workers.dev/api/remove-bg';
```

### 4. Deploy Frontend

Deploy the `public/` folder to Cloudflare Pages:

```bash
# Using Cloudflare Pages dashboard
# Or CLI: npx wrangler pages deploy public
```

Or simply open `public/index.html` directly in a browser for local testing.

## Tech Stack

- **Frontend**: Vanilla HTML/JS + TailwindCSS
- **Backend**: Cloudflare Worker
- **API**: Remove.bg

## Cost

- **Remove.bg**: 50 free requests/month, then $0.20/request
- **Cloudflare Pages**: Free
- **Cloudflare Worker**: Free (100,000 requests/day)

## License

MIT
