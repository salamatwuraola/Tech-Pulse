import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GetHeadlinesQueryParams,
  SummarizeArticleBody,
} from "@workspace/api-zod";

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

router.get("/news/headlines", async (req, res) => {
  const parsed = GetHeadlinesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { category, q, country = "us", pageSize = 20 } = parsed.data;

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "NEWS_API_KEY is not configured" });
    return;
  }

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
    if (!response.ok) {
      const body = await response.text();
      req.log.error({ status: response.status, body }, "NewsAPI error");
      res.status(502).json({ error: "Failed to fetch news" });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "NewsAPI fetch failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/news/summarize", async (req, res) => {
  const parsed = SummarizeArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    return;
  }

  const { title, description, content, url } = parsed.data;

  const articleText = [
    `Title: ${title}`,
    description ? `Description: ${description}` : null,
    content ? `Content: ${content}` : null,
    `URL: ${url}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "You are a concise news summarizer. Summarize the article in 2-4 clear, informative sentences. Focus on the key facts and avoid filler phrases.",
    });

    const result = await model.generateContent(
      `Please summarize this news article:\n\n${articleText}`
    );
    const summary = result.response.text() || "Summary unavailable.";
    res.json({ summary });
  } catch (err) {
    req.log.error({ err }, "Gemini summarize failed");
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

export default router;
