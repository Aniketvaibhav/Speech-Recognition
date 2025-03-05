const express = require('express');
const { handleTranscription, upload } = require('../controllers/transcriptionController');
const Transcription = require('../models/Transcription');
const axios = require('axios');

const router = express.Router();

router.post('/transcribe', upload.single('audio'), handleTranscription);
router.get('/history', async (req, res) => {
    try {
        const transcriptions = await Transcription.find().sort({ createdAt: -1 });
        res.json(transcriptions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transcription history' });
    }
});

router.get('/test-openai', async (req, res) => {
    try {
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
        res.json({ status: 'OpenAI API connection successful', models: response.data });
    } catch (error) {
        res.status(500).json({ 
            error: 'OpenAI API connection failed', 
            details: error.response?.data || error.message 
        });
    }
});

module.exports = router;
