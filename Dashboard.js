import React, { useState, useRef } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [recording, setRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                console.log('Audio data available:', event.data.size);
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.start();
            setRecording(true);
            console.log('Recording started');
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Error starting recording. Please make sure you have granted microphone permissions.');
        }
    };

    const stopRecording = async () => {
        try {
            if (!mediaRecorderRef.current) {
                console.error('No media recorder found');
                return;
            }

            mediaRecorderRef.current.stop();
            setRecording(false);

            await new Promise(resolve => {
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    console.log('Audio blob size:', audioBlob.size);

                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.wav');

                    try {
                        setTranscription('Processing audio... This may take a few moments.');
                        const response = await axios.post('http://localhost:5000/api/transcribe', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                            timeout: 300000, // 5 minutes timeout since local processing might take longer
                        });
                        console.log('Server response:', response.data);
                        setTranscription(response.data.transcript || 'No transcription returned');
                    } catch (error) {
                        console.error('Error details:', error.response?.data || error.message);
                        setTranscription('Error processing audio. Please try again.');
                    }
                    resolve();
                };
            });

            // Stop all tracks in the stream
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('Error stopping recording:', error);
            setTranscription('Error stopping recording. Please try again.');
        }
    };

    return (
        <div className="transcription-container">
            <h2>Audio Transcription App</h2>
            <div className="button-container">
                <button 
                    onClick={startRecording} 
                    disabled={recording}
                    className={recording ? 'button-disabled' : 'button-primary'}
                >
                    {recording ? 'Recording...' : 'Start Recording'}
                </button>
                <button 
                    onClick={stopRecording} 
                    disabled={!recording}
                    className={!recording ? 'button-disabled' : 'button-stop'}
                >
                    Stop Recording
                </button>
            </div>
            {transcription && (
                <div className="transcription-result">
                    <h3>Transcription:</h3>
                    <p>{transcription}</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
