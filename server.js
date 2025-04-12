require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { OpenAI } = require('openai');
const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Image Analysis Endpoint
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Convert the image buffer to base64
        const base64Image = req.file.buffer.toString('base64');

        const completion = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in animal breed identification. Analyze the provided image and identify the animal breed. Provide detailed information about the breed's characteristics, history, and any other relevant information."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Please identify the animal breed in this image and provide detailed information about it."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000
        });

        res.json({ 
            message: completion.choices[0].message.content 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
