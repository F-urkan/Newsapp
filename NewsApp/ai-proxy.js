const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/ai-description', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });

  const prompt = `Write a short, clear description and a recent update for this news headline: "${title}". Format: Description: ... Update: ...`;

  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 120
      })
    });
    const data = await openaiRes.json();
    console.log("OpenAI response:", data); // Log full OpenAI response
    if (data.choices && data.choices[0]) {
      res.json({ aiText: data.choices[0].message.content });
    } else {
      // If OpenAI returned an error, send it to the frontend and log it
      if (data.error) {
        console.error("OpenAI error:", data.error);
        res.status(500).json({ error: data.error.message || JSON.stringify(data.error) });
      } else {
        res.status(500).json({ error: "No AI response" });
      }
    }
  } catch (err) {
    console.error("Backend error:", err); // Log backend error details
    res.status(500).json({ error: err.message || err });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`AI proxy running on port ${PORT}`));