import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini client-ийг үүсгэх
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ⭐ Ашиглах загвар
// "gemini-1.5-flash" — хамгийн хурдан, үнэгүй
// "gemini-1.5-pro" — илүү ухаалаг, үнэгүй (хязгаартай)
export const GEMINI_MODEL = "gemini-1.5-flash";

export default genAI;