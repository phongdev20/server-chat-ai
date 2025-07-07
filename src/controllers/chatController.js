const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatController = async (req, res) => {
  const {
    conversationHistory = [],
    conversationSummary,
    userChat,
    user,
  } = req.body;

  if (!userChat) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const stringHistory = conversationHistory
    .map(
      (msg) =>
        `${msg.role === "user" ? "Tôi" : `${user.relationship}`}: ${
          msg.content
        }`
    )
    .join("\n");

  let finalPrompt = userChat;
  if (user) {
    finalPrompt += `
      Bạn là một người tên là ${user.name}. Dưới đây là thông tin chi tiết của bạn:

      - Tên: ${user.name}
      - Số điện thoại: ${user.phone}
      - Biệt danh: ${user.nickname}
      - Giới tính: ${user.gender}
      - Ngày sinh: ${user.birthday}
      - Ngôn ngữ: ${user.languages}
      - Ghi chú: ${user.notes}
      - Mối quan hệ với tôi: ${user.relationship}

      Bạn hãy trả lời tin nhắn sau đây của tôi một cách tự nhiên nhất có thể với các thông tin trên, giống như cách mà ${user.nickname} sẽ trả lời nhé. Với mối quan hệ của chúng ta, bạn có thể sử dụng các từ ngữ thân mật và gần gũi hơn. Chúng ta đã có những đoạn trò chuyện trước đó như sau:
      ${stringHistory}
      Dưới đây là tin nhắn của tôi:
      ${userChat}
    `;
  }

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: finalPrompt }],
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      console.log("content", content, "\n");

      if (content) {
        res.write(`${content}`);
      }
    }
    res.end();
  } catch (err) {
    console.error(
      "Error from OpenAI:",
      err?.response?.data || err.message || err
    );
    res.status(500).json({ error: "OpenAI API error" });
  }
};

module.exports = {
  chatController,
};
