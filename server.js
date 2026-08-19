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

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        const stream = await client.responses.create({
            model: "gpt-5.6",
            input: message,
            stream: true
        });

        for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
                res.write(`data: ${JSON.stringify(event.delta)}\n\n`);
            }

            if (event.type === "response.completed") {
                res.write("data: [DONE]\n\n");
            }
        }

        res.end();

    } catch (error) {
        console.error("AI ERROR:", error);

        if (!res.headersSent) {
            res.status(500).json({
                error: "AI request failed"
            });
        } else {
            res.write(`data: ${JSON.stringify({
                error: "AI request failed"
            })}\n\n`);
            res.end();
        }
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Life AI server running on port ${PORT}`);
});
