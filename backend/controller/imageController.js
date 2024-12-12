const OpenAI = require('openai');

// Initialize OpenAI API with the provided API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generateImage = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            return res.status(400).json({ error: 'Invalid or empty prompt provided.' });
        }

        const response = await openai.images.generate({
            model: 'dall-e-2',
            prompt,
            n: 1,
            size: '256x256',
        });

        const image_url = response.data[0].url;

        res.status(200).json({ image_url });
    } catch (error) {
        console.error('OpenAI API Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { generateImage };
