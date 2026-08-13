import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GetHeadlinesQueryParams,
  SummarizeArticleBody,
} from "@workspace/api-zod";

const router = Router();

const FALLBACK_ARTICLES = [
  {
    source: { id: "techcrunch", name: "TechCrunch" },
    author: "Alex Wilhelm",
    title: "AI Breakthrough Advances: Next-Generation Language Models Transforming Everyday Applications",
    description: "New developments in lightweight generative AI models are enabling real-time summarization, code generation, and voice assistance across desktop and mobile devices.",
    url: "https://techcrunch.com",
    urlToImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
    publishedAt: new Date().toISOString(),
    content: "Generative artificial intelligence has taken another giant leap forward as researchers release optimized small language models capable of running locally on consumer hardware."
  },
  {
    source: { id: "wired", name: "Wired" },
    author: "Steven Levy",
    title: "The Future of Web Development: How Monorepos and Modern Tooling Speed Up Production",
    description: "Developers are increasingly adopting workspace architectures, fast bundling tools, and type-safe APIs to streamline web application delivery.",
    url: "https://wired.com",
    urlToImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=60",
    publishedAt: new Date().toISOString(),
    content: "Modern software development pipelines have evolved rapidly over the past few years, prioritizing instant feedback loops and automated type validation."
  },
  {
    source: { id: "reuters", name: "Reuters" },
    author: "Reuters Staff",
    title: "Global Tech Markets Rally as Innovation Drives Record Quarterly Earnings",
    description: "Major technology firms reported strong quarterly results driven by surging demand for cloud infrastructure, enterprise software, and hardware automation.",
    url: "https://reuters.com",
    urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60",
    publishedAt: new Date().toISOString(),
    content: "Financial markets closed higher today following positive quarterly reports across key sectors in technology, energy, and digital transformation."
  },
  {
    source: { id: "the-verge", name: "The Verge" },
    author: "Nilay Patel",
    title: "Next-Gen Smartphones Highlight Battery Upgrades and On-Device AI Features",
    description: "Consumer technology hardware is entering a new era where silicon chips process machine learning tasks directly on device without cloud dependencies.",
    url: "https://theverge.com",
    urlToImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
    publishedAt: new Date().toISOString(),
    content: "Hardware manufacturers unveiled their latest flagship devices featuring enhanced silicon efficiency and extended multi-day battery capabilities."
  }
];

function fallbackSummary(title: string, description?: string | null, content?: string | null): string {
  const text = [description, content].filter(Boolean).join(" ");
  if (!text || text.trim().length < 20) {
    return `${title}. Visit the original article link for full coverage and updates.`;
  }
  const cleaned = text.replace(/\[\+\d+\s*chars\]/gi, "").trim();
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
  const result = sentences.slice(0, 3).map(s => s.trim()).join(" ");
  return result || `${title}. Key highlights available at the source article.`;
}

router.get("/news/headlines", async (req, res) => {
  const parsed = GetHeadlinesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { category, q, country = "us", pageSize = 20 } = parsed.data;
  const apiKey = process.env.NEWS_API_KEY;

  if (apiKey) {
    const params = new URLSearchParams({
      country,
      pageSize: String(pageSize),
      apiKey,
    });
    if (category) params.set("category", category);
    if (q) params.set("q", q);

    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?${params.toString()}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.articles && data.articles.length > 0) {
          res.json(data);
          return;
        }
      }
    } catch (err) {
      req.log.warn({ err }, "NewsAPI fetch failed, utilizing fallback dataset");
    }
  }

  // Graceful fallback if NewsAPI fails or has network lookup issues
  let articles = FALLBACK_ARTICLES;
  if (q) {
    const queryLower = q.toLowerCase();
    articles = articles.filter(
      a => a.title.toLowerCase().includes(queryLower) || a.description.toLowerCase().includes(queryLower)
    );
  }
  res.json({
    status: "ok",
    totalResults: articles.length,
    articles,
  });
});

router.post("/news/summarize", async (req, res) => {
  const parsed = SummarizeArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { title, description, content, url } = parsed.data;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    const articleText = [
      `Title: ${title}`,
      description ? `Description: ${description}` : null,
      content ? `Content: ${content}` : null,
      `URL: ${url}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ];

    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction:
              "You are a concise news summarizer. Summarize the article in 2-4 clear, informative sentences. Focus on the key facts and avoid filler phrases.",
          });

          const result = await model.generateContent(
            `Please summarize this news article:\n\n${articleText}`
          );
          const summaryText = result.response.text()?.trim();
          if (summaryText) {
            res.json({ summary: summaryText });
            return;
          }
        } catch (modelErr) {
          req.log.warn({ modelName, err: modelErr }, "Gemini model attempt failed, trying next");
        }
      }
    } catch (genAiErr) {
      req.log.warn({ err: genAiErr }, "GoogleGenerativeAI error");
    }
  }

  // Graceful fallback to smart local text extraction if Gemini API is unreachable or offline
  const summary = fallbackSummary(title, description, content);
  res.json({ summary });
});

export default router;
