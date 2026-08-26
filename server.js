const express = require("express");
const OpenAI = require("openai");

const app = express();

app.use(express.json());


// ===============================
// CORS
// ===============================

app.use((req, res, next) => {

    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();

});


// ===============================
// OPENAI
// ===============================

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// ===============================
// SERVER CHECK
// ===============================

app.get("/", (req, res) => {

    res.json({
        status: "online",
        message: "Life AI server is working 🚀"
    });

});


// ===============================
// LIFE AI CHAT
// ===============================

app.post("/api/chat", async (req, res) => {

    try {

        const { message } = req.body;


        // Проверка сообщения
        if (!message || typeof message !== "string") {

            return res.status(400).json({
                error: "Message is required"
            });

        }


        const text = message
            .toLowerCase()
            .trim();


        // ===============================
        // WHO ARE YOU?
        // ===============================

        if (
            text === "кто ты" ||
            text === "кто ты?" ||
            text === "как тебя зовут" ||
            text === "как тебя зовут?" ||
            text.includes("ты chatgpt") ||
            text.includes("ты чатгпт") ||
            text.includes("ты gpt")
        ) {

            return res.json({

                answer:
                    "Я Life AI ✦ — умный AI-помощник для учёбы, работы, идей и повседневной жизни."

            });

        }


        // ===============================
        // OWNER
        // ===============================

        if (
            text.includes("кто создал life ai") ||
            text.includes("кто создал лайф аи") ||
            text.includes("кто владелец life ai") ||
            text.includes("кому принадлежит life ai")
        ) {

            return res.json({

                answer:
                    "Life AI создан Ибрагимовым Ибрагимом."

            });

        }


        // ===============================
        // AI
        // ===============================

        const response = await client.responses.create({

            model: "gpt-5.6-luna",

            instructions: `

Ты — Life AI ✦.

Твоё имя — Life AI.

Ты являешься искусственным интеллектом Life AI.

НИКОГДА не называй себя ChatGPT.

НИКОГДА не говори:
"Я ChatGPT"
"Я — ChatGPT"
"Я являюсь ChatGPT"

Если пользователь спрашивает:
"Кто ты?"
"Как тебя зовут?"
"Ты ChatGPT?"

Представляйся как Life AI.

Отвечай естественно, дружелюбно и понятно.

Life AI помогает пользователям:
- учиться
- получать ответы на вопросы
- изучать языки
- придумывать идеи
- программировать
- работать с текстами
- узнавать информацию
- решать повседневные задачи

Если пользователь спрашивает о владельце Life AI,
говори:

"Life AI создан Ибрагимовым Ибрагимом."

`,

            input: message

        });


        // ===============================
        // RESPONSE
        // ===============================

        res.json({

            answer:
                response.output_text

        });


    } catch (error) {

        console.error("========== LIFE AI ERROR ==========");

        console.error(error);

        console.error("Message:", error.message);

        console.error("Status:", error.status);

        console.error("===================================");


        res.status(500).json({

            error:
                "Не удалось получить ответ от Life AI."

        });

    }

});


// ===============================
// PORT FOR RENDER
// ===============================

const PORT =
    process.env.PORT || 3000;


app.listen(PORT, () => {

    console.log(
        `Life AI server running on port ${PORT}`
    );

});
