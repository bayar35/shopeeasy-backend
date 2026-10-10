import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import genAI, { GEMINI_MODEL } from "../utils/geminiClient.js";

// ============================================
// SYSTEM PROMPT — AI-ийн зан чанар
// ============================================
const SYSTEM_PROMPT = `Та "ShopEasy" онлайн дэлгүүрийн найрсаг туслах AI юм.

Таны үүрэг:
1. Хэрэглэгчдэд бүтээгдэхүүн хайх, захиалга хийх, хүргэлт, төлбөрийн талаар туслах.
2. Монгол хэлээр хариулах (хэрэглэгч англиар асуувал англиар хариул).
3. Товч, тодорхой, найрсаг хариулах.
4. Хэрэв та мэдэхгүй зүйл байвал "Мэдээлэл байхгүй байна" гэж хэлэх.
5. Хэзээ ч хувийн мэдээлэл (нууц үг, картын дугаар) асуухгүй байх.

ShopEasy-ийн тухай:
- Бүтээгдэхүүн: Electronics, Fashion, Home, Sports, Books, Toys
- Хүргэлт: 50,000₮-с дээш захиалгад үнэгүй
- Төлбөр: Карт, QPay (удахгүй)
- Ажлын цаг: 24/7
- Утас: +1234455
- Имэйл: ub35@gmail.com`;

// ============================================
// CHAT — AI-тай харилцах
// ============================================
export const chatWithAI = handleAsyncError(async (req, res, next) => {
  const { message, history = [] } = req.body;

  if (!message || message.trim() === "") {
    return next(new HandleError("Message is required", 400));
  }

  console.log("=== AI CHAT (Gemini) ===");
  console.log("User message:", message);
  console.log("History length:", history.length);

  try {
    // Gemini model үүсгэх
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 1,
      },
    });

    // Хуучин мессежүүдийг бэлтгэх (Gemini-ийн формат)
    const chatHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Chat session эхлүүлэх
    const chat = model.startChat({
      history: chatHistory,
    });

    // Мессеж илгээх
    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    console.log("AI response:", aiResponse.substring(0, 100) + "...");

    res.status(200).json({
      success: true,
      message: aiResponse,
    });
  } catch (error) {
    console.error("❌ Gemini API error:", error.message);
    console.error("Full error:", error);

    if (error.message?.includes("API_KEY")) {
      return next(new HandleError("AI service authentication failed", 500));
    }
    if (error.message?.includes("quota") || error.message?.includes("429")) {
      return next(
        new HandleError(
          "AI service rate limit exceeded. Please try again later.",
          429
        )
      );
    }

    return next(
      new HandleError(
        `AI service error: ${error.message || "Unknown error"}`,
        500
      )
    );
  }
});