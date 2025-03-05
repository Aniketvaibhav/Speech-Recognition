const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const transcriptionRoutes = require('./routes/transcriptionRoutes');

const { pipeline } = require('@xenova/transformers');


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', transcriptionRoutes);

app.post('/api/summarize', async (req, res) => {
    const transcript = req.body.transcript;

    try {
        const summarizer = await pipeline('summarization');
        const summary = await summarizer(transcript, { max_length: 150, min_length: 30, do_sample: false });
        console.log('Summary:', summary[0].summary_text);
        res.json({ summary: summary[0].summary_text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to summarize transcript' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
