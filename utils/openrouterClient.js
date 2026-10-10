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
// Ажиллаж байгаа model-ийг эхэнд тавих
export const OPENROUTER_MODELS = [
  "qwen/qwen-2.5-72b-instruct:free",       // ⭐ 1-р ээлжид
  "google/gemini-flash-1.5:free",          // 2-р ээлжид
  "mistralai/mistral-7b-instruct:free",    // 3-р ээлжид
  "microsoft/phi-3-medium-128k-instruct:free", // 4-р ээлжид
];

export default openrouter;