import { Router } from "express";
import OpenAI from "openai";
import {
  GetHeadlinesQueryParams,
  SummarizeArticleBody,
} from "@workspace/api-zod";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "You are a concise news summarizer. Summarize the article in 2-4 clear, informative sentences. Focus on the key facts and avoid filler phrases.",
        },
        {
          role: "user",
          content: `Please summarize this news article:\n\n${articleText}`,
        },
      ],
    });

    const summary =
      completion.choices[0]?.message?.content ?? "Summary unavailable.";
    res.json({ summary });
  } catch (err) {
    req.log.error({ err }, "OpenAI summarize failed");
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

export default router;
