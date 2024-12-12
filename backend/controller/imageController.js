const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

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

const uploadToPinata = async (req, res) => {
    try {
        const { imageBase64, name } = req.body;

        if (!imageBase64 || !name) {
            return res.status(400).json({ error: 'Image and name are required.' });
        }

        const buffer = Buffer.from(imageBase64, 'base64');
        const filePath = `./temp/${name}.png`;
        fs.writeFileSync(filePath, buffer);

        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        const metadata = JSON.stringify({
            name,
            keyvalues: {
                uploadedBy: 'AIBL',
            },
        });
        formData.append('pinataMetadata', metadata);

        const options = JSON.stringify({
            cidVersion: 0,
        });
        formData.append('pinataOptions', options);

        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            maxBodyLength: 'Infinity',
            headers: {
                ...formData.getHeaders(),
                pinata_api_key: process.env.PINATA_API_KEY,
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
            },
        });

        fs.unlinkSync(filePath);

        res.status(200).json({ ipfsUrl: `https://ipfs.io/ipfs/${response.data.IpfsHash}` });
    } catch (error) {
        console.error('Pinata Upload Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const fetchImage = async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        res.setHeader('Content-Type', response.headers.get('Content-Type'));
        response.body.pipe(res);
    } catch (error) {
        console.error('Fetch Image Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { generateImage, uploadToPinata, fetchImage };
