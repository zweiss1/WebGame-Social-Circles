const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('../database');

// Render login page for both "/" and "/login"
router.get('/', (req, res) => {
  res.render('pages/login');
});

router.get('/login', (req, res) => {
  res.render('pages/login');
});

router.get('/register', (req, res) => {
  res.render('pages/signup');
});

router.get('/guest', (req, res) => {
  req.session.user = null;

  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
      return res.status(500).send('Server error');
    }
    res.render('pages/home');
  }); 
}); 

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Checks if user has an account
  let sql = 'SELECT * FROM user_information WHERE username=?';
  connection.query(sql, [username], async (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.status(401).send('Invalid username');
    }
    const isValid = await bcrypt.compare(password, result[0].hash_password);
    if (!isValid) {
      return res.status(401).send('Invalid password');
    }
    req.session.user = result[0];
    req.session.save();
    res.redirect('/home');
  });
});

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 13);
  // Checks if username is taken
  let checkUser = 'SELECT * FROM user_information WHERE username=?';
  connection.query(checkUser, [username], (err, result) => {
    if (err) throw err;
    if (result.length != 0) {
      return res.status(401).send('Username is already taken');
    }
    // Adds user to database
    let sql = 'INSERT INTO user_information(username, hash_password) VALUES(?,?)';
    connection.query(sql, [username, hash], (err, result) => {
      if (err) throw err;
      // Querying user that was just added
      connection.query(checkUser, [username], (err, result) => {
        if (err) throw err;
        req.session.user = result[0];
        req.session.save();
        res.redirect('/home');
      });
    });
  });
});

router.get('/home', (req, res) => {
  const user = req.session.user; // logged in user info
  
  // Get leaderboard data regardless of user login status
  const leaderboardSql = `
    SELECT username AS name, highscore AS score
    FROM user_information
    WHERE is_active = 1
    ORDER BY highscore DESC
    LIMIT 10
  `;

  connection.query(leaderboardSql, (err, leaderboardResults) => {
    if (err) {
      console.error('Error fetching leaderboard data:', err);
      return res.status(500).send('Internal Server Error');
    }

    // If user is not logged in (guest), render the home page with default values
    if (!user) {
      return res.render('pages/home', {
        leaderboardPlayers: leaderboardResults,
        yourRank: 'Not available',
        yourScore: 'Not available'
      });
    }
    
    // If user is logged in, get their rank and score
    const userRankSql = `
      SELECT userRank, score FROM (
        SELECT username, highscore AS score,
               (@row_number := @row_number + 1) AS userRank
        FROM user_information, (SELECT @row_number := 0) AS rn
        WHERE is_active = 1
        ORDER BY highscore DESC
      ) AS ranking
      WHERE username = ?
    `;
    
    connection.query(userRankSql, [user.username], (err, userResult) => {
      if (err) {
        console.error('Error fetching user rank:', err);
        return res.status(500).send('Internal Server Error');
      }
    
      let yourRank = null, yourScore = null;
      if (userResult && userResult.length > 0) {
        yourRank = userResult[0].userRank;
        yourScore = (userResult[0].score != null) ? userResult[0].score.toString() : 'Not available';
      }
    
      res.render('pages/home', {
        leaderboardPlayers: leaderboardResults,
        yourRank: yourRank || 'Not available',
        yourScore: yourScore || 'Not available'
      });
    });
  });
});

module.exports = router;
