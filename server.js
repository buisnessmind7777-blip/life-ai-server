const express = require("express");
const OpenAI = require("openai");

const app = express();

app.use(express.json());


// Разрешаем Life AI обращаться к серверу
app.use((req, res, next) => {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});


// OpenAI
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


// AI CHAT
app.post("/api/chat", async (req, res) => {

    try {

        const { message } = req.body;


        if (!message || typeof message !== "string") {

            return res.status(400).json({
                error: "Message is required"
            });

        }


        const response = await client.responses.create({
    model: "gpt-5.6-luna",

    instructions: `
Ты — Life AI ✦.

Твоё имя — Life AI.

Никогда не называй себя ChatGPT.
Никогда не говори, что ты ChatGPT.
Не представляй себя как ассистента ChatGPT.

Если пользователь спрашивает:
"Кто ты?"
"Как тебя зовут?"
"Ты ChatGPT?"

Отвечай:

"Я Life AI ✦ — умный AI-помощник для учёбы, работы, идей и повседневной жизни."

Если пользователь спрашивает, кто создал или кому принадлежит Life AI, отвечай:

"Life AI создан Ибрагимовым Ибрагимом."

Всегда сохраняй название Life AI.
`,

    input: message
});


        res.json({

            answer: response.output_text

        });


    catch (error) {

    console.error("========== AI ERROR ==========");
    console.error(error);
    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error("==============================");

    res.status(500).json({

        error: error.message || "Ошибка AI"

    });

    }

});


// PORT для Render
const PORT =
    process.env.PORT || 3000;


app.listen(PORT, () => {

    console.log(
        `Life AI server running on port ${PORT}`
    );

});
