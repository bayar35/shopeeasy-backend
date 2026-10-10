import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import openrouter, { OPENROUTER_MODEL } from "../utils/openrouterClient.js";

// ============================================
// SYSTEM PROMPT
// ============================================
const SYSTEM_PROMPT = `Та "ShopEasy" онлайн дэлгүүрийн найрсаг туслах AI юм.

Таны үүрэг:
1. Хэрэглэгчдэд бүтээгдэхүүн хайх, захиалга хийх, хүргэлт, төлбөрийн талаар туслах.
2. Монгол хэлээр хариулах (хэрэглэгч англиар асуувал англиар хариул).
3. Товч, тодорхой, найрсаг хариулах.
4. Хэзээ ч хувийн мэдээлэл (нууц үг, картын дугаар) асуухгүй байх.

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

  console.log("=== AI CHAT (OpenRouter) ===");
  console.log("Message:", message);
  console.log("History length:", history.length);
  console.log("OPENROUTER_API_KEY exists:", !!process.env.OPENROUTER_API_KEY);
  console.log("OPENROUTER_MODEL:", OPENROUTER_MODEL);

  if (!message || message.trim() === "") {
    return next(new HandleError("Message is required", 400));
  }

  try {
    // Мессежүүдийг бэлтгэх (OpenAI format)
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10).map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    console.log("Total messages:", messages.length);
    console.log("Sending to OpenRouter...");

    // OpenRouter API руу хандах
    const completion = await openrouter.chat.completions.create({
      model: OPENROUTER_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    });

    const aiResponse =
      completion.choices[0]?.message?.content ||
      "Уучлаарай, хариу үүсгэх боломжгүй байна.";

    console.log("✅ AI response:", aiResponse.substring(0, 100));

    res.status(200).json({
      success: true,
      message: aiResponse,
      usage: completion.usage,
    });
  } catch (error) {
    console.error("❌ OpenRouter error:", error.message);
    console.error("Full error:", error);

    if (error.status === 401) {
      return next(new HandleError("AI service authentication failed", 500));
    }
    if (error.status === 429) {
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