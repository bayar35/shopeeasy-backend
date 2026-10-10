import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import openrouter, {
  OPENROUTER_MODELS,
} from "../utils/openrouterClient.js";

// ============================================
// SYSTEM PROMPT
// ============================================
const SYSTEM_PROMPT = `Та "ShopEasy" онлайн дэлгүүрийн найрсаг туслах AI юм.

Таны үүрэг:
1. Хэрэглэгчдэд бүтээгдэхүүн хайх, захиалга хийх, хүргэлт, төлбөрийн талаар туслах.
2. Монгол хэлээр хариулах.
3. Товч, тодорхой, найрсаг хариулах.
4. Хэзээ ч хувийн мэдээлэл асуухгүй байх.

ShopEasy-ийн тухай:
- Бүтээгдэхүүн: Electronics, Fashion, Home, Sports, Books, Toys
- Хүргэлт: 50,000₮-с дээш захиалгад үнэгүй
- Төлбөр: Карт, QPay (удахгүй)
- Ажлын цаг: 24/7
- Утас: +1234455
- Имэйл: ub35@gmail.com`;

// ============================================
// CHAT — AI-тай харилцах (fallback логик)
// ============================================
export const chatWithAI = handleAsyncError(async (req, res, next) => {
  const { message, history = [] } = req.body;

  console.log("=== AI CHAT (OpenRouter) ===");
  console.log("Message:", message);
  console.log("History length:", history.length);
  console.log("OPENROUTER_API_KEY exists:", !!process.env.OPENROUTER_API_KEY);
  console.log("Available models:", OPENROUTER_MODELS.length);

  if (!message || message.trim() === "") {
    return next(new HandleError("Message is required", 400));
  }

  // Мессежүүдийг бэлтгэх
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-10).map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    })),
    { role: "user", content: message },
  ];

  console.log("Total messages:", messages.length);

  // ⭐ Fallback логик: Model-уудыг нэг нэгээр турших
  let lastError = null;

  for (const model of OPENROUTER_MODELS) {
    try {
      console.log(`Trying model: ${model}...`);

      const completion = await openrouter.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const aiResponse =
        completion.choices[0]?.message?.content ||
        "Уучлаарай, хариу үүсгэх боломжгүй байна.";

      console.log(`✅ SUCCESS with model: ${model}`);
      console.log("AI response:", aiResponse.substring(0, 100));

      return res.status(200).json({
        success: true,
        message: aiResponse,
        model,
        usage: completion.usage,
      });
    } catch (error) {
      console.error(`❌ Failed with model: ${model}`);
      console.error("Error:", error.message);
      lastError = error;
      // Дараагийн model руу үргэлжлүүлэх
    }
  }

  // Бүх model-ууд ажиллахгүй болсон
  console.error("❌ All models failed. Last error:", lastError?.message);

  return next(
    new HandleError(
      `AI service error: ${lastError?.message || "All models failed"}`,
      500
    )
  );
});