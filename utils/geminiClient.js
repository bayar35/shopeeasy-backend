import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ⭐ ШИНЭ MODEL — Gemini 2.5 (2026 он)
// "gemini-2.5-flash" — хамгийн хурдан, үнэгүй
// "gemini-2.5-pro" — илүү ухаалаг, үнэгүй (хязгаартай)
export const GEMINI_MODEL = "gemini-2.5-flash";

export default genAI;