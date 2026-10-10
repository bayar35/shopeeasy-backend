import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ⭐ ШИНЭ MODEL — Gemini 3.8 (2026 он)
// "gemini-3.8-flash" — хамгийн шинэ, хурдан, үнэгүй
export const GEMINI_MODEL = "gemini-3.8-flash";

export default genAI;