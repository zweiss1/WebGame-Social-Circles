const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/login');
});

router.get('/signup', (req, res) => {
  res.render('pages/signup');
})

router.get('/home', (req, res) => {
  res.render('pages/home', { 
    //THIS WILL EVENTUALLY BE DATA FROM THE DB, THIS IS A PLACEHOLDER OBJ
    leaderboardPlayers: [
      {name: "paul_GOAT", score: 1500},
      {name: "jack_GOAT", score: 1499},
      {name: "melissa_GOAT", score: 1493},
      {name: "harold_from_accounting", score: 5}
    ],
    characterImages: [
      "./images/characters/deadPeter.webp"
    ]
  });
});

module.exports = router;