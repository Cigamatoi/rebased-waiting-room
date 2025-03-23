const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// In-memory storage (replace with a database in production)
let rankings = [];

app.post('/api/save-score', (req, res) => {
    const { nickname, gameType, score } = req.body;

    // Remove existing entry for this nickname and gameType
    rankings = rankings.filter(entry => !(entry.nickname === nickname && entry.gameType === gameType));

    // Add new score
    rankings.push({ nickname, gameType, score });

    // Sort rankings (memory sorts ascending, others descending)
    rankings.sort((a, b) => {
        if (a.gameType === "memory" && b.gameType === "memory") return a.score - b.score;
        return b.score - a.score;
    });

    res.status(200).send({ message: 'Score saved successfully' });
});

app.get('/api/top10', (req, res) => {
    const { gameType } = req.query;
    const filteredRankings = rankings.filter(entry => entry.gameType === gameType);
    const top10 = filteredRankings.slice(0, 10);
    res.json(top10);
});

app.get('/api/full-ranking', (req, res) => {
    res.json(rankings);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});