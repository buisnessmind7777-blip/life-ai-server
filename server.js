const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

app.use(express.json({ limit: "1mb" }));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Главная
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Life AI server is working 🚀"
  });
});

// Статус сервера
app.get("/api/status", (req, res) => {
  res.json({
    ok: true,
    service: "life-ai-server",
    openai: Boolean(OPENAI_API_KEY),
    model: OPENAI_MODEL
  });
});

// Конфигурация
app.get("/api/config", (req, res) => {
  res.json({
    ok: true,
    support: {
      amounts: [5000, 10000, 20000, 50000]
    }
  });
});

// Курс USD → UZS
let cachedRate = null;
let cachedRateTime = 0;

app.get("/api/rate/usd", async (req, res) => {
  try {
    const now = Date.now();

    if (cachedRate && now - cachedRateTime < 5 * 60 * 1000) {
      return res.json(cachedRate);
    }

    const response = await fetch(
      "https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/"
    );

    if (!response.ok) {
      throw new Error(`CBU HTTP ${response.status}`);
    }

    const data = await response.json();

    const item = Array.isArray(data) ? data[0] : data;

    if (!item || !item.Rate) {
      throw new Error("Курс USD не найден");
    }

    const nominal = Number(item.Nominal) || 1;
    const rate =
      Number(String(item.Rate).replace(",", ".")) / nominal;

    cachedRate = {
      ok: true,
      currency: "USD",
      rate,
      date: item.Date || null
    };

    cachedRateTime = now;

    res.json(cachedRate);
  } catch (error) {
    console.error("Currency error:", error);

    res.status(500).json({
      ok: false,
      error: "Не удалось получить курс USD/UZS"
    });
  }
});

// Извлечение текста из Responses API
function getOutputText(data) {
  if (data.output_text) {
    return data.output_text.trim();
  }

  let result = "";

  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      if (!Array.isArray(item.content)) continue;

      for (const content of item.content) {
        if (content.type === "output_text" && content.text) {
          result += content.text;
        }
      }
    }
  }

  return result.trim();
}

// OpenAI
async function askOpenAI(input, instructions) {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY не настроен в Render Environment Variables"
    );
  }

  const response = await fetch(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions,
        input
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenAI error:", data);

    throw new Error(
      data?.error?.message ||
      `OpenAI HTTP ${response.status}`
    );
  }

  const text = getOutputText(data);

  if (!text) {
    throw new Error("OpenAI не вернул текст");
  }

  return text;
}

// AI Chat
app.post("/api/chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body.messages)
      ? req.body.messages
      : [];

    if (!messages.length) {
      return res.status(400).json({
        ok: false,
        error: "Сообщение отсутствует"
      });
    }

    const conversation = messages
      .slice(-12)
      .map((message) => {
        const role = message.role || "user";
        const content = String(message.content || "");
        return `${role}: ${content}`;
      })
      .join("\n");

    const answer = await askOpenAI(
      conversation,
      `
Ты — Life AI, туристический AI-помощник по Узбекистану.

Отвечай понятно, дружелюбно и кратко.
Помогай туристам с городами Узбекистана,
маршрутами, достопримечательностями,
отелями, ресторанами, покупками,
переводом, безопасностью и путешествиями.

Если пользователь пишет на русском — отвечай на русском.
Если пишет на английском — отвечай на английском.
Если пишет на узбекском — отвечай на узбекском.
Если пишет на китайском — отвечай на китайском.
Если пишет на арабском — отвечай на арабском.
      `,
    );

    res.json({
      ok: true,
      answer
    });
  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// Переводчик
app.post("/api/translate", async (req, res) => {
  try {
    const text = String(req.body.text || "").trim();
    const language = String(req.body.language || "ru");

    if (!text) {
      return res.status(400).json({
        ok: false,
        error: "Введите текст"
      });
    }

    const languageNames = {
      ru: "русский",
      en: "английский",
      uz: "узбекский",
      zh: "китайский",
      ar: "арабский"
    };

    const targetLanguage =
      languageNames[language] || "русский";

    const answer = await askOpenAI(
      text,
      `
Переведи следующий текст на ${targetLanguage}.

Сохрани смысл.
Не добавляй объяснений.
Верни только перевод.
      `
    );

    res.json({
      ok: true,
      translation: answer
    });
  } catch (error) {
    console.error("Translation error:", error);

    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// Ошибки
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    ok: false,
    error: "Ошибка сервера"
  });
});

app.listen(PORT, () => {
  console.log(`Life AI server running on port ${PORT}`);
});
