import OpenAI from "openai";

// OpenRouter API нь OpenAI-compatible
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://shopeeasy-frontend.vercel.app",
    "X-Title": "ShopEasy AI",
  },
});

// ⭐ Үнэгүй model — Llama 3.1 8B (хамгийн тогтвортой)
export const OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct:free";

export default openrouter;