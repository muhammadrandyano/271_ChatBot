const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();
const PORT = 3000;

// Inisialisasi Google Gen AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body; 

        if (!message || !Array.isArray(message)) {
            return res.status(400).json({ error: "Message harus berupa array" });
        }

        // Setup Header SSE (Server-Sent Events) buat streaming ke frontend
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        // Format pesan ke format Gemini
        const contents = message.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Panggil Gemini dengan streaming menggunakan model yang valid
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-3.8-flash', // Sesuai instruksi error terakhir
            contents: contents,
            config: {
                systemInstruction: "Kamu adalah asisten AI yang ramah. Jawab dengan bahasa Indonesia yang santai dan mudah dimengerti."
            }
        });

        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
                // Perbaikan: pakai backtick (``) untuk template literal
                res.write(`data: ${JSON.stringify(chunkText)}\n\n`);
            }
        }

        // Tanda streaming selesai
        res.write("data: [DONE]\n\n");
        res.end();

    } catch (error) {
        console.error("Server Error:", error);
        
        if (!res.headersSent) {
            res.status(500).json({ error: "Terjadi kesalahan pada server" });
        } else {
            // Perbaikan: pakai backtick (``) untuk template literal
            res.write(`data: ${JSON.stringify("Maaf, terjadi kesalahan pada server.")}\n\n`);
            res.end();
        }
    }
});

app.listen(PORT, () => {
    // Perbaikan: pakai backtick (``) untuk template literal
    console.log(`Server berjalan di http://localhost:${PORT}`);
});