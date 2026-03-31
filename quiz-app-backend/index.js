const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

const API_KEY = process.env.GEMINI_API_KEY;

console.log(process.env.GEMINI_API_KEY);
if (!API_KEY) {
    console.error('GEMINI_API_KEY environment variable is not set.');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

const corsOptions = {
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.options('/generate', cors(corsOptions));
app.use(express.json());

app.post('/generate', async (req, res) => {
    const { topic, queNo } = req.body;
    console.log(topic + queNo);
    const prompt1 = `you have to generate quiz based on the topic of ${topic}.
If the topic is inappropriate, incomprehensible or out of your imagination generate following JSON object:
{
    "error":
            "appropriate small response for not being able to generate quiz"
}

Generate ${queNo} of questions based on the ${topic} and 4 options for it.
Make sure to use creative, compitative, exciting questions about ${topic} .
and stick to the topic while generating questions .
one of them being the right one.
send a JSON object in return which will have array of ${queNo} of questions in following format:
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

    //     const prompt = `You are an expert quiz creator. Your task is to generate a high-quality, engaging quiz based on the given topic.

    // **Topic:** ${topic}
    // **Number of questions:** ${queNo}

    // ### Rules:
    // - If the topic is inappropriate, harmful, illegal, incomprehensible, too vague, or impossible to create a meaningful quiz for, respond **only** with the following JSON (and nothing else):

    // {
    //   "error": "A short, polite reason why you cannot generate the quiz."
    // }

    // - Otherwise, generate exactly ${queNo} creative, competitive, exciting, and thought-provoking questions strictly related to the topic.
    // - Questions should test knowledge, understanding, or clever application of the topic. Make them engaging and challenging where possible.
    // - Each question must have **exactly 4 options**.
    // - Only **one** option should be correct.
    // - Questions can be in the form of:
    //   - "What / Who / When / Where / Why / How...?"
    //   - Fill-in-the-blank (using ...... or "_____")
    //   - Scenario-based or application-based questions

    // ### Output Format:
    // Return **only** a valid JSON object in this exact structure (no extra text, no markdown, no explanations):

    // {
    //   "questions": [
    //     {
    //       "question": "Full question text ending with ? or having ......",
    //       "options": ["Option A", "Option B", "Option C", "Option D"],
    //       "answer": "Exact text of the correct option (must match one of the options exactly, including case and spaces)"
    //     },
    //     ... (repeat for all {queNo} questions)
    //   ]
    // }

    // ### Additional Guidelines:
    // - Make questions creative and exciting rather than dry or rote.
    // - Keep all content strictly on-topic.
    // - Ensure options are plausible and competitive (good distractors).
    // - Do not add any extra fields or text outside the JSON.
    // - Maintain consistent formatting and proper grammar.
    // - do not include any //n


    //     `;

    try {
        if (!topic || queNo === undefined || queNo === null) {
            return res.status(400).json({ error: 'Topic and queNo are required.' });
        }

        if (typeof queNo !== 'number' || queNo <= 0) {
            return res.status(400).json({ error: 'queNo must be a positive number.' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        console.log(prompt)
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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
