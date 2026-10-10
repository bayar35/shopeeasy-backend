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

// ⭐ Үнэгүй model-ууд:
// "meta-llama/llama-3.3-70b-instruct:free" — хамгийн сайн
// "meta-llama/llama-3.1-8b-instruct:free" — хамгийн хурдан
// "qwen/qwen-2.5-72b-instruct:free" — Qwen
// "google/gemini-flash-1.5:free" — Gemini
export const OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

export default openrouter;