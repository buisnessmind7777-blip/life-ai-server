const express = require("express");
const OpenAI = require("openai");

const app = express();

app.use(express.json());

// Разрешаем запросы от сайта Life AI
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    next();
});

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Проверка сервера
app.get("/", (req, res) => {
    res.json({
        status: "online",
        message: "Life AI server is working 🚀"
    });
});

// AI чат
app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const response = await client.responses.create({
            model: "gpt-5.6",
            input: message
        });

        res.json({
            answer: response.output_text
        });

    } catch (error) {
        console.error("AI ERROR:", error);

        res.status(500).json({
            error: "AI request failed"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Life AI server running on port ${PORT}`);
});
