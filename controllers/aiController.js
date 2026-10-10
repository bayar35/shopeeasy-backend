import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import genAI, { GEMINI_MODEL } from "../utils/geminiClient.js";

const SYSTEM_PROMPT = `Та "ShopEasy" онлайн дэлгүүрийн найрсаг туслах AI юм.
Таны үүрэг:
1. Хэрэглэгчдэд бүтээгдэхүүн хайх, захиалга хийх, хүргэлт, төлбөрийн талаар туслах.
2. Монгол хэлээр хариулах.
3. Товч, тодорхой, найрсаг хариулах.
4. Хэзээ ч хувийн мэдээлэл асуухгүй байх.`;

export const chatWithAI = handleAsyncError(async (req, res, next) => {
  const { message, history = [] } = req.body;

  console.log("=== AI CHAT START ===");
  console.log("Message:", message);
  console.log("History length:", history.length);

  if (!message || message.trim() === "") {
    return next(new HandleError("Message is required", 400));
  }

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
    });

    // ⭐ ЗӨВ FORMAT: эхлээд "user" (SYSTEM_PROMPT), дараа нь "model"
    const chatHistory = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [{ text: "Ойлголоо. Би ShopEasy-ийн AI туслах. Танд хэрхэн туслах вэ?" }],
      },
    ];

    // ⭐ Хуучин мессежүүдийг нэмэх — зөвхөн "user" → "model" дарааллаар
    // Хамгийн сүүлийн 10 мессежийг авах
    const recentHistory = history.slice(-10);

    // ⭐ Эхний мессеж нь "user" эсэхийг шалгах
    let startIndex = 0;
    if (recentHistory.length > 0 && recentHistory[0].role === "assistant") {
      startIndex = 1; // Эхний "assistant" мессежийг алгасах
    }

    for (let i = startIndex; i < recentHistory.length; i++) {
      const msg = recentHistory[i];
      chatHistory.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    console.log("Chat history length:", chatHistory.length);
    console.log("First role:", chatHistory[0].role);
    console.log("Last role:", chatHistory[chatHistory.length - 1].role);

    const chat = model.startChat({ history: chatHistory });

    console.log("Sending message to Gemini...");
    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    console.log("✅ AI response:", aiResponse.substring(0, 100));

    res.status(200).json({
      success: true,
      message: aiResponse,
    });
  } catch (error) {
    console.error("❌ Gemini API error:", error.message);
    return next(
      new HandleError(
        `AI service error: ${error.message || "Unknown error"}`,
        500
      )
    );
  }
});