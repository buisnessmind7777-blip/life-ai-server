const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "online",
        message: "Life AI server is working 🚀"
    });
});

app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({
            error: "Message is required"
        });
    }

    // Пока тестовый ответ.
    // Настоящий AI подключим следующим этапом.
    res.json({
        answer: `Life AI получил твоё сообщение: ${message}`
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Life AI server running on port ${PORT}`);
});
