# Image Background Remover

Remove image backgrounds with one click. Built with Next.js, Tailwind CSS, and Remove.bg API.

## Features

- 🖼️ Upload or drag & drop images
- ✂️ One-click background removal
- ⬇️ Download result as PNG
- 💾 No data stored - all in memory

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/HaiZi666/image-background-remover.git
cd image-background-remover
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Remove.bg API Key

Create a `.env.local` file in the root directory:

```env
REMOVE_BG_API_KEY=your-api-key-here
NEXT_PUBLIC_API_URL=http://localhost:3000/api/remove-bg
```

Get your API key at: https://www.remove.bg/api

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Using Vercel (Recommended)

1. Push your code to GitHub
2. Import project on Vercel
3. Add environment variable `REMOVE_BG_API_KEY`
4. Deploy!

### Using Docker

```bash
docker build -t image-bg-remover .
docker run -p 3000:3000 --env-file .env.local image-bg-remover
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **API**: Remove.bg

## Cost

- **Remove.bg**: 50 free requests/month, then $0.20/request

## License

MIT
