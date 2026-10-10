import OpenAI from "openai";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://shopeeasy-frontend.vercel.app",
    "X-Title": "ShopEasy AI",
  },
});

// ⭐ Qwen 2.5 72B — үнэгүй, Монгол хэл сайн
export const OPENROUTER_MODEL = "qwen/qwen-2.5-72b-instruct:free";

export default openrouter;