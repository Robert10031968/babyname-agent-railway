const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const allowedOrigins = [
  "https://baby-name-generator-lime.vercel.app",
  "https://baby-name-generator-cutb1xmop-roberts-projects-798ae72d.vercel.app",
  "https://baby-name-generator-92shr2mxo-roberts-projects-798ae72d.vercel.app"
];

app.use(
  cors({
    origin: "*",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  })
);
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  })
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/webhook/babyname", async (req, res) => {
  const { theme, gender, count } = req.body;

  console.log("📥 Incoming request:");
  console.log("  Theme:", theme);
  console.log("  Gender:", gender);
  console.log("  Count:", count);

  if (!theme || !gender) {
    console.error("❌ Missing required parameters");
    return res.status(400).json({ error: "Missing theme or gender" });
  }

  const prompt = `
Generate a list of ${count || 10} unique ${gender} baby names based on the theme "${theme}".
Each name should include a short description (1–2 sentences) about its origin and meaning.
Return only JSON in this format:
[
  { "name": "Aveline", "summary": "A French name from the 11th century, symbolizing strength and light." },
  ...
]
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.choices[0]?.message?.content || "";
    console.log("🧠 OpenAI raw response:", rawText); // ✅ log surowej odpowiedzi

    let json;
    try {
      json = JSON.parse(rawText);
    } catch (parseError) {
      console.error("❌ JSON parsing failed:", parseError.message);
      return res.status(500).json({ error: "Failed to parse response from OpenAI" });
    }

    console.log("✅ Parsed names:", json);
    res.json({ namesWithMeanings: json });
  } catch (error) {
    console.error("❌ OpenAI API error:", error.message);
    res.status(500).json({ error: "AI generation failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Baby Name Agent is running on port ${PORT}`);
});

setInterval(() => {}, 1000 * 60 * 5);
