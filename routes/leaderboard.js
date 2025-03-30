const express = require('express');
const router = express.Router();

router.get('/', (req, res) =>{
    res.render('pages/leaderboard', {
        leaderboardPlayers: [
            {name: "paul_GOAT", score: 1500},
            {name: "jack_GOAT", score: 1499},
            {name: "melissa_GOAT", score: 1493},
            {name: "harold_from_accounting", score: 5}
          ]
    });
});

router.get('/to_home',(req,res) =>{
    res.render('pages/home', {
        leaderboardPlayers: [
            {name: "paul_GOAT", score: 1500},
            {name: "jack_GOAT", score: 1499},
            {name: "melissa_GOAT", score: 1493},
            {name: "harold_from_accounting", score: 5}
          ]
    });
})

module.exports = router;