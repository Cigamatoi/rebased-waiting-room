const express = require('express');
const fs = require('fs').promises; // Für Dateioperationen
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

let rankings = [];

async function loadRankings() {
    try {
        const data = await fs.readFile('highscores.json', 'utf8');
        rankings = JSON.parse(data);
    } catch (err) {
        console.log('No highscores file found, starting fresh.');
        rankings = [];
    }
}

async function saveRankings() {
    try {
        await fs.writeFile('highscores.json', JSON.stringify(rankings, null, 2));
    } catch (err) {
        console.error('Error saving rankings:', err);
    }
}

// Lade Rankings beim Serverstart
loadRankings();

app.post('/api/save-score', async (req, res) => {
    const { nickname, gameType, score } = req.body;

    // Debugging: Logge den eingehenden Request
    console.log('Received score:', { nickname, gameType, score });

    // Remove existing entry for this nickname and gameType
    rankings = rankings.filter(entry => !(entry.nickname === nickname && entry.gameType === gameType));

    // Add new score
    rankings.push({ nickname, gameType, score });

    // Sort rankings
    rankings.sort((a, b) => {
        if (a.gameType === "memory" && b.gameType === "memory") return a.score - b.score;
        return b.score - a.score;
    });

    // Speichere in highscores.json
    await saveRankings();

    res.status(200).send({ message: 'Score saved successfully' });
});

app.get('/api/top10', (req, res) => {
    const {
