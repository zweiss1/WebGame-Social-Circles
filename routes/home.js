const express = require('express');
const router = express.Router();
const session = require('express-session');
//need to add connection for database

router.get('/', (req, res) => {
    // const user = req.session.user; use this to get user info
    res.render('pages/home', { 
        leaderboardPlayers: [
          {name: "paul_GOAT", score: 1500},
          {name: "jack_GOAT", score: 1499},
          {name: "melissa_GOAT", score: 1493},
          {name: "harold_from_accounting", score: 5}
        ]
        //user: user (how we can access the info of the logged in user)
      });
});


module.exports = router;