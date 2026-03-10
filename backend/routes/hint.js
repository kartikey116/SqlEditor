const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

router.post('/', async (req, res) => {
    const { question, schema, userSql } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        return res.json({ hint: '💡 Add GEMINI_API_KEY to backend .env to enable AI hints.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // gemini-2.0-flash is the current fast model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `You are a friendly SQL tutor helping a student practice SQL.

The problem they are solving:
"${question}"

Available table schema:
${schema || '(not provided)'}

Their current SQL attempt:
${userSql?.trim() || '(nothing written yet)'}

Give a short, helpful hint in 2-3 sentences that guides them toward the right approach WITHOUT giving away the full solution. Focus on which SQL concept or clause to use next.`;

        const result = await model.generateContent(prompt);
        const hint = result.response.text();
        return res.json({ hint });

    } catch (err) {
        console.error('Gemini error details:', err?.message, err?.status);
        // Try fallback model if primary fails
        try {
            const genAI2 = new GoogleGenerativeAI(apiKey);
            const model2 = genAI2.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt2 = `SQL tutor hint for: "${question}". Student wrote: ${userSql || 'nothing'}. Give a 2-sentence directional hint without revealing the answer.`;
            const r2 = await model2.generateContent(prompt2);
            return res.json({ hint: r2.response.text() });
        } catch (err2) {
            console.error('Fallback Gemini error:', err2?.message);
            return res.json({
                hint: '💡 Think about which SQL clause helps you filter rows based on a condition. Look at the WHERE clause and comparison operators.',
            });
        }
    }
});

module.exports = router;
