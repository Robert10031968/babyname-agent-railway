const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*", // lub wpisz dokładnie: "https://baby-name-generator-lime.vercel.app"
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Upewnij się, że masz klucz w .env jako OPENAI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/webhook/babyname", async (req, res) => {
  try {
    const { theme, gender, count } = req.body;

    const prompt = `
Generate a list of ${
      count || 10
    } unique ${gender} baby names based on the theme "${theme}".
Each name should include a short description (1–2 sentences) about its origin and meaning.
Return only JSON in this format:
[
  { "name": "Aveline", "summary": "A French name from the 11th century, symbolizing strength and light." },
  ...
]
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.choices[0]?.message?.content || "";

    const json = JSON.parse(rawText);

    res.json({ namesWithMeanings: json });
  } catch (error) {
    console.error("❌ AI ERROR:", error.message);
    res.status(500).json({ error: "AI generation failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Baby Name Agent is running on port ${PORT}`);
});

setInterval(() => {}, 1000 * 60 * 5);
