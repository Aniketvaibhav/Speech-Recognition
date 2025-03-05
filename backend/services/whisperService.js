const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

const transcribeAudio = async (audioBuffer) => {
    try {
        console.log('Starting transcription process');
        
        // Create a temporary file path
        const tempDir = path.join(__dirname, '../temp');
        const audioPath = path.join(tempDir, `audio-${Date.now()}.wav`);
        
        // Ensure the temp directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Write buffer to temporary file
        fs.writeFileSync(audioPath, audioBuffer);
        console.log('Temporary audio file created:', audioPath);

        try {
            // Run whisper command
            const command = `whisper "${audioPath}" --model base --language English --output_dir "${tempDir}" --output_format txt`;
            console.log('Running command:', command);
            
            const { stdout, stderr } = await execPromise(command);
            console.log('Whisper stdout:', stdout);
            if (stderr) console.error('Whisper stderr:', stderr);

            // Get the transcript from stdout directly
            // Remove timestamps and clean up the text
            const transcript = stdout
                .split('\n')
                .map(line => {
                    // Remove timestamp pattern [00:00.000 --> 00:00.000]
                    return line.replace(/\[\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}\.\d{3}\]\s*/, '').trim();
                })
                .filter(line => line.length > 0) // Remove empty lines
                .join(' ');

            console.log('Processed transcript:', transcript);
            return transcript;

        } catch (error) {
            console.error('Transcription Error:', error);
            throw error;
        } finally {
            // Clean up: delete temporary files
            try {
                if (fs.existsSync(audioPath)) {
                    fs.unlinkSync(audioPath);
                    console.log('Temporary audio file deleted');
                }
                
                // Clean up any other files Whisper might have created
                const baseFileName = path.basename(audioPath, '.wav');
                const possibleOutputFiles = [
                    path.join(tempDir, `${baseFileName}.txt`),
                    path.join(tempDir, `${baseFileName}.json`),
                    path.join(tempDir, `${baseFileName}.vtt`),
                    path.join(tempDir, `${baseFileName}.srt`)
                ];
                
                possibleOutputFiles.forEach(file => {
                    if (fs.existsSync(file)) {
                        fs.unlinkSync(file);
                        console.log(`Deleted output file: ${file}`);
                    }
                });
            } catch (cleanupError) {
                console.error('Error cleaning up temporary files:', cleanupError);
            }
        }
    } catch (error) {
        console.error('Error in transcribeAudio:', error);
        throw error;
    }
};

module.exports = { transcribeAudio }; 