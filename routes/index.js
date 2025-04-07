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
    res.redirect('/home'); // Let the /home route handle rendering
  });
});


router.get('/add_friend', (req, res) => {
  res.render('pages/add_friend');
});

router.get('/account', (req, res) => {
  const username = req.session.user; 
  if (!username) {
    return res.redirect('/login');
  }

  connection.query(
    "SELECT * FROM friendships WHERE status = 'accepted' AND (username = ? OR friend_username = ?)",
    [username, username], // Pass the username string twice
    (err, friends) => {
      if (err) return res.status(500).send(err);
      
      connection.query(
        "SELECT * FROM friendships WHERE status = 'pending' AND friend_username = ?",
        [username],
        (err, pending) => {
          if (err) return res.status(500).send(err);
          res.render('pages/account', { friends, pending, user: username });
        }
      );
    }
  );
});


router.post("/accept", function(req, res) {
  // Get current user's username (receiver) from session
  const receiverUsername = req.session.user; 
  const senderUsername = req.body.friend; 
  if (!receiverUsername) {
    return res.redirect("/login");
  }

  connection.query(
    "UPDATE friendships SET status = 'accepted' " +
    "WHERE friend_username = ? AND username = ?", // Match receiver & sender
    [receiverUsername, senderUsername], 
    function(err, result) {
      if (err) {
        console.error("Accept error:", err);
        return res.status(500).send("Database error");
      }
      res.redirect("/account");
    }
  );
});


router.post("/block", function(req, res) {
  // Get current user's username (receiver) from session
  const receiverUsername = req.session.user; 
  const senderUsername = req.body.friend; 

  if (!receiverUsername) {
    return res.redirect("/login");
  }

  connection.query(
    "UPDATE friendships SET status = 'blocked' " +
    "WHERE friend_username = ? AND username = ?", // Match receiver & sender
    [receiverUsername, senderUsername], 
    function(err, result) {
      if (err) {
        console.error("Block error:", err);
        return res.status(500).send("Database error");
      }
      res.redirect("/account");
    }
  );
});


router.post("/remove", function(req, res) {
  // Get current user's username (receiver) from session
  const receiverUsername = req.session.user; 
  const senderUsername = req.body.friend; 
  
  if (!receiverUsername) {
    return res.redirect("/login");
  }
  connection.query(
    "DELETE FROM friendships WHERE (friend_username = ? AND username = ?) OR (friend_username = ? AND username = ?)",
    [receiverUsername, senderUsername, senderUsername, receiverUsername],
    (err, insertResult) => {
      if (err) {
        console.error("Error inserting friendship:", err);
        return res.status(500).send("Database error");
      }
      res.redirect("/account");
    }
  );
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
    req.session.user = result[0].username; // Store only the username string
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
      connection.query(checkUser, [username], (err, result) => {
        if (err) throw err;
        req.session.user = result[0].username; // Store only the username string
        req.session.save();
        res.redirect('/home');
      });
    });
  });
});

router.get('/home', (req, res) => {
  const user = req.session.user; 

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

    // If no user is logged in, render with default values and no user data.
    if (!user) {
      return res.render('pages/home', {
        leaderboardPlayers: leaderboardResults,
        yourRank: 'Not available',
        yourScore: 'Not available',
        user: null  
      });
    }
    
    // If user is logged in, get their rank and score.
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
    
    connection.query(userRankSql, [user], (err, userResult) => {
      if (err) {
        console.error('Error fetching user rank:', err);
        return res.status(500).send('Internal Server Error');
      }
    
      let yourRank = null, yourScore = null;
      if (userResult && userResult.length > 0) {
        yourRank = userResult[0].userRank;
        yourScore = (userResult[0].score != null) ? userResult[0].score.toString() : 'Not available';
      }
      // friend leaderboard query 
      const friendLeaderboardSql = `
        SELECT u.username AS name, u.highscore AS score
        FROM user_information u
        WHERE u.username IN (
          SELECT CASE 
            WHEN f.username = ? THEN f.friend_username 
            ELSE f.username 
          END AS friend
          FROM friendships f
          WHERE f.status = 'accepted' 
            AND (f.username = ? OR f.friend_username = ?)
        )
        ORDER BY u.highscore DESC
        LIMIT 10
      `;

      connection.query(friendLeaderboardSql, [user, user, user], (err, friendLeaderboardResults) => {
        if (err) {
          console.error('Error fetching friend leaderboard:', err);
          return res.status(500).send('Internal Server Error');
        }      
        
        res.render('pages/home', {
          leaderboardPlayers: leaderboardResults,
          yourRank: yourRank || 'Not available',
          yourScore: yourScore || 'Not available',
          user: user,
          friendLeaderboard: friendLeaderboardResults
        });
      });
    });
  });
});



router.post("/add_friend", (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }

  const sender = req.session.user; 
  const receiver = (req.body.username || "").trim();

  if (!receiver) {
    return res.status(400).send("Please enter a username.");
  }

  if (sender === receiver) {
    return res.status(400).send("You cannot add yourself.");
  }

  // Check if receiver exists
  connection.query(
    "SELECT * FROM user_information WHERE username = ?",
    [receiver],
    (err, userResult) => {
      if (err) {
        console.error("Error checking user:", err);
        return res.status(500).send("Database error");
      }
      if (userResult.length === 0) {
        return res.status(404).send("User not found.");
      }

      // Check for existing friendship in either direction
      connection.query(
        "SELECT * FROM friendships WHERE (username = ? AND friend_username = ?) OR (username = ? AND friend_username = ?)",
        [sender, receiver, receiver, sender],
        (err, friendshipResult) => {
          if (err) {
            console.error("Error checking friendship:", err);
            return res.status(500).send("Database error");
          }
          if (friendshipResult.length !== 0) {
            return res.status(409).send("Request already exists.");
          }

          // Insert with sender as username and receiver as friend_username
          connection.query(
            "INSERT INTO friendships (username, friend_username, status) VALUES (?, ?, ?)",
            [sender, receiver, "pending"],
            (err, insertResult) => {
              if (err) {
                console.error("Error inserting friendship:", err);
                return res.status(500).send("Database error");
              }
              res.redirect("/account");
            }
          );
        }
      );
    }
  );
});


module.exports = router;
