import Groq from "groq-sdk";

// Groq client-ийг үүсгэх
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ⭐ Ашиглах загвар (model)
// "llama-3.3-70b-versatile" — хамгийн сайн, хурдан
// "llama-3.1-8b-instant" — хамгийн хурдан, хөнгөн
// "mixtral-8x7b-32768" — урт хариулт
export const GROQ_MODEL = "llama-3.3-70b-versatile";

export default groq;