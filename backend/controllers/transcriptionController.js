const Transcription = require('../models/Transcription');
const { transcribeAudio } = require('../services/whisperService');
const multer = require('multer');
const OpenAI = require('openai');
const { pipeline } = require('@xenova/transformers');


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configure multer for audio files
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    }
});

const handleTranscription = async (req, res) => {
    try {
        console.log('Received audio file request');
        
        if (!req.file) {
            console.error('No file received');
            return res.status(400).json({ error: 'No audio file provided' });
        }


        console.log('File details:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        const transcript = await transcribeAudio(req.file.buffer);
        console.log('Transcription completed:', transcript);
        
        
         // Summarize the transcript
         const summarizer = await pipeline('summarization');
         const summary = await summarizer(transcript, { max_length: 150, min_length: 30, do_sample: false });
         console.log('Summary:', summary[0].summary_text);

        // Save to database
        const newTranscription = new Transcription({
            transcript,
            createdAt: new Date(),
            summary: summary[0].summary_text
        });
        await newTranscription.save();

        res.json({ transcript });
    } catch (error) {
        console.error('Error in handleTranscription:', error);
        res.status(500).json({ 
            error: 'Error processing transcription', 
            details: error.message 
        });
    }
};

module.exports = { handleTranscription, upload };
