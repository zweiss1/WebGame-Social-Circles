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
    characterImages: [ // Dynamically populate these arrays with the paths to every file in characters and GameUI
      //"./images/characters/deadPeter.webp",
      "./images/characters/chet.png",
      "./images/characters/howard.png",
      "./images/characters/harold.png",
      "./images/characters/melissa.png",
      "./images/characters/valerie.png",
      "./images/characters/sharon.png",
      "./images/characters/tyler.png",
      "./images/characters/margot.png",
      "./images/characters/henry.png"
    ],
    uiImages: [
      //"./images/GameUI/melon.webp",
      "./images/GameUI/blueCircle.png"
    ]
  });
});

module.exports = router;