const mongoose = require('mongoose');

const transcriptionSchema = new mongoose.Schema({
    audioUrl: String,
    transcript: String,
    summary: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transcription', transcriptionSchema);
