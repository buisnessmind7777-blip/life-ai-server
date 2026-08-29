const express = require("express");

const app = express();

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

app.post("/api/chat", (req, res) => {

    const { message } = req.body;

    if (!message || typeof message !== "string") {

        return res.status(400).json({
            error: "Message is required"
        });

    }

    res.json({
        answer:
            "Life AI получил твой вопрос: " + message
    });

});


// ======================================================
// PORT FOR RENDER
// ======================================================

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Life AI server running on port ${PORT}`
    );

});
