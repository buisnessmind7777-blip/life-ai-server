// ======================================================
// LIFE AI SERVER
// ======================================================

const express = require("express");
const cors = require("cors");

const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());


// ======================================================
// SERVER CHECK
// ======================================================

app.get("/", (req, res) => {
    res.json({
        status: "online",
        message: "Life AI server is working 🚀"
    });
});


// ======================================================
// AI CHAT
// ======================================================

app.post("/api/chat", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        // Пока тестируем соединение
        res.json({
            answer: "Life AI получил твой вопрос: " + message
        });

    } catch (error) {

        console.error("CHAT ERROR:", error);

        res.status(500).json({
            error: "Internal server error"
        });

    }

});


// ======================================================
// PORT FOR RENDER
// ======================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Life AI server running on port ${PORT}`);
});
