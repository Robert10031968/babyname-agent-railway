const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();

app.use(bodyParser.json());

app.post("/webhook/babyname", async (req, res) => {
  const { theme, gender, count } = req.body;

  let prompt = "";

  if (theme.toLowerCase().includes("mix of")) {
    prompt = `Create ${count || 10} unique baby names that blend or creatively combine the names: ${theme}.
Return them as JSON:
[
  { "name": "Ancin", "summary": "A mix of Anna and Marcin..." },
  ...
]
Only return raw JSON. No explanation.`;
  } else {
    prompt = `Generate a list of ${count || 10} unique ${gender || "neutral"} baby names inspired by the theme "${theme}".
Each name should include a short summary with origin and meaning.
Return a valid JSON like:
[
  { "name": "Nova", "summary": "Inspired by stars..." },
  ...
]
No explanation, only raw JSON.`;
  }

  try {
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const content = openaiResponse.data.choices[0].message.content;
    console.log("📬 OpenAI response content:\n", content);
    const json = JSON.parse(content);

    res.json({ namesWithMeanings: json });
  } catch (error) {
    console.error("❌ AI ERROR:", error.message);
    res.status(500).json({ error: "AI generation failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Baby Name Agent is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
