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


        const response =
            await client.responses.create({

                model: "gpt-5.6-luna",

                input: message

            });


        res.json({

            answer: response.output_text

        });


    } catch (error) {

        console.error(
            "AI ERROR:",
            error
        );

        res.status(500).json({

            error:
                "Не удалось получить ответ от AI"

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
