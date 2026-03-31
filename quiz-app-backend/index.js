const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = Number(process.env.PORT) || 3000;

const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        if (!origin || configuredOrigins.length === 0 || configuredOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS. Add the origin to CORS_ORIGINS.'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.options('/generate', cors(corsOptions));
app.use(express.json());

app.get('/', (_req, res) => {
    res.json({
        status: 'ok',
        message: 'Quiz API is running.'
    });
});

app.post('/generate', async (req, res) => {
    const { topic, queNo } = req.body;
    const totalQuestions = Number(queNo);

    const prompt1 = `you have to generate quiz based on the topic of ${topic}.
If the topic is inappropriate, incomprehensible or out of your imagination generate following JSON object:
{
    "error":
            "appropriate small response for not being able to generate quiz"
}

Generate ${totalQuestions} of questions based on the ${topic} and 4 options for it.
Make sure to use creative, compitative, exciting questions about ${topic} .
and stick to the topic while generating questions .
one of them being the right one.
send a JSON object in return which will have array of ${totalQuestions} of questions in following format:
{
    "questions"<object[]>:
        [
            {
                "question"<string>: "question ending with ? or having ......(fill in the blank)",
                "options" <string[]>: [],
                "answer": "answer from one of the options with matching case and spaces"
            },
            ..... and so on
        ]
}

    Return only valid JSON.
    Do not wrap the response in markdown or code fences.
    `;

    const prompt = prompt1.replace(/\s+/g, ' ').trim();

    try {
        if (!topic || queNo === undefined || queNo === null) {
            return res.status(400).json({ error: 'Topic and queNo are required.' });
        }

        if (!Number.isInteger(totalQuestions) || totalQuestions <= 0) {
            return res.status(400).json({ error: 'queNo must be a positive integer.' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY is not configured on the server.'
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ generatedText: text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Failed to generate content.' });
    }
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'Invalid JSON body. Check for missing commas, quotes, or braces.'
        });
    }

    next(err);
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
}

module.exports = app;

