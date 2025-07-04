const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatController = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
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
