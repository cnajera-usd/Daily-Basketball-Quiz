const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Endpoint to get quiz data for the current date

app.get('/api/quiz', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const quizFilePath = path.join(__dirname, 'src', 'data', 'quizData.json');


    fs.readFile(quizFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading quiz data file:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const quizData = JSON.parse(data);

        if (quizData[today]) {
            res.json(quizData[today]);
        } else {
            res.status(404).json({ error: 'No quiz available for today' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});