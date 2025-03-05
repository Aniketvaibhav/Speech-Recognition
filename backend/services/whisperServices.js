const axios = require('axios');
require('dotenv').config();

const transcribeAudio = async (audioBuffer) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', audioBuffer, {
            headers: {
                'Authorization': `Bearer ${process.env.WHISPER_API_KEY}`,
                'Content-Type': 'audio/mpeg'
            }
        });
        return response.data.text;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
};

module.exports = { transcribeAudio };
