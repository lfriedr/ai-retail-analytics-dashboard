# AI Retail Analytics Dashboard
Website Link: https://ai-retail-analytics-dashboard-gzdz7dfuz-lfriedr1.vercel.app/dashboard

A full-stack analytics platform where retailers can upload sales data and receive AI-generated business insights.

> Click **Upload Data** → **Load Demo Data** to populate the dashboard instantly.

---

## Features

- Upload sales CSVs or load sample surf shop data with one click
- Live dashboard charts — Revenue by Month, Top Products, Revenue by Brand
- Streaming AI insights powered by the Claude API
- Natural language Q&A — ask questions like "What brands did well in March?"

## Tech Stack

- **Next.js** + **TypeScript**
- **Supabase** (PostgreSQL)
- **Claude API** (Anthropic)
- **Recharts**
- **Tailwind CSS**
- Deployed on **Vercel**

## Getting Started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with your keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ANTHROPIC_API_KEY=your-anthropic-api-key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
