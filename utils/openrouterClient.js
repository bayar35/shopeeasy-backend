import OpenAI from "openai";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://shopeeasy-frontend.vercel.app",
    "X-Title": "ShopEasy AI",
  },
});

// ⭐ Үнэгүй model-уудын жагсаалт (fallback)
export const OPENROUTER_MODELS = [
  "qwen/qwen-2.5-72b-instruct:free",
  "google/gemini-flash-1.5:free",
  "mistralai/mistral-7b-instruct:free",
  "deepseek/deepseek-chat:free",
];

// ⭐ Анхдагч model (эхний нь)
export const OPENROUTER_MODEL = OPENROUTER_MODELS[0];

export default openrouter;