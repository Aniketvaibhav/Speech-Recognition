import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TranscriptionHistory = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/history').then(response => setHistory(response.data));
    }, []);

    return (
        <div>
            <h2>Transcription History</h2>
            {history.map((item, index) => (
                <div key={index}>
                    <p><strong>Transcript:</strong> {item.transcript}</p>
                    <p><strong>Summary:</strong> {item.summary}</p>
                </div>
            ))}
        </div>
    );
};

export default TranscriptionHistory;
