# 📰 News Summarizer

An AI-powered news application that aggregates top headlines across multiple categories and generates concise summaries powered by **Google Gemini AI**.

---

## ✨ Features

- 🌐 **Latest News Headlines**: Browse top news across categories (Business, Technology, Entertainment, Health, Science, Sports, General).
- 🤖 **AI Summarization**: Instant 2–4 sentence article summaries powered by **Google Gemini AI** (`gemini-1.5-flash`).
- ⚡ **Modern Stack**: Express backend + React (Vite) + Tailwind CSS + TypeScript + Google Generative AI SDK.
- 🚀 **Portfolio Ready**: Configured for seamless deployment on **Vercel** and GitHub.

---

## 🛠️ Environment Setup & Configuration

> [!IMPORTANT]  
> Secret API keys should **never** be committed to GitHub. Your `.env` file is excluded from Git tracking via `.gitignore`.

### 1. Create Local `.env` File
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 2. Add Your API Keys
Open `.env` and set your secret credentials:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NEWS_API_KEY=your_news_api_key_here
```

- **Gemini API Key**: Get your key from [Google AI Studio](https://aistudio.google.com/).
- **News API Key**: Get your key from [NewsAPI.org](https://newsapi.org/).

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
pnpm install

# 2. Run dev server (backend API + frontend app)
pnpm dev
```

---

## ☁️ Deploying to Vercel

1. Push your repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import your `News-Summarizer` repository.
4. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `NEWS_API_KEY`: *(Your NewsAPI Key)*
5. Click **Deploy**. Vercel will automatically build the React frontend and deploy the serverless API routes (`/api/*`).

---

## 📁 Repository Structure

```
.
├── api/                    # Vercel Serverless Function entry point
├── artifacts/
│   ├── api-server/         # Express backend (News API & Gemini AI integration)
│   └── news-app/           # React + Vite frontend UI
├── lib/
│   ├── api-spec/           # OpenAPI specifications
│   └── api-zod/            # Shared Zod schemas
├── .env.example            # Environment variable template
├── vercel.json             # Vercel deployment configuration
├── package.json            # Root workspace configuration
└── README.md
```

---

## 📄 License

[MIT](LICENSE)
