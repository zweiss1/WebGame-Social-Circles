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

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).send('Could not log out.');
    }
    res.redirect('/login');
  });
});


router.get('/characters', (req, res) =>{
  const user = req.session.user;
  res.render('pages/characters', {user: user});
});

router.get('/leaderboard', (req, res) =>{
  const user = req.session.user;
  // Querying all scores
  const leaderboardSql = `
    SELECT username AS name, highscore AS score
    FROM user_information
    WHERE is_active = 1
    ORDER BY highscore DESC
  `;
  connection.query(leaderboardSql, (err, leaderboardResults) => {
    if (err) {
      console.error('Error fetching leaderboard data:', err);
      return res.status(500).send('Internal Server Error');
    }
    if (!user) {
      return res.render('pages/leaderboard', {allScores: leaderboardResults, user: user});
    }
    

    // Querying friend scores
    connection.query(
      `SELECT f.* 
      FROM friendships f
      JOIN user_information u1 ON f.username = u1.username AND u1.is_active = 1
      JOIN user_information u2 ON f.friend_username = u2.username AND u2.is_active = 1
      WHERE f.status = 'accepted' 
        AND (f.username = ? OR f.friend_username = ?)`,
      [user, user],
      (err, friendsList) => {
        if (err) return res.status(500).send(err);
        if(friendsList.length===0){
          return res.render('pages/leaderboard', {allScores: leaderboardResults, friendScores: [], user: user});
        }
      const friendUsernames = friendsList.map(f => (f.username === user ? f.friend_username : f.username));
      connection.query(
        `SELECT username AS name, highscore AS score 
        FROM user_information
        WHERE username IN (?) OR username=?
        ORDER BY highscore DESC`,
        [friendUsernames, user],
        (err, friendResults) => {
          res.render('pages/leaderboard', {allScores: leaderboardResults, friendScores: friendResults, user: user});
        });
    });
  });
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

router.get('/account', checkActive, (req, res) => {
  const username = req.session.user; 
  if (!username) {
    return res.redirect('/login');
  }

  // Modified accepted friends query
  connection.query(
    `SELECT f.* 
     FROM friendships f
     JOIN user_information u1 ON f.username = u1.username AND u1.is_active = 1
     JOIN user_information u2 ON f.friend_username = u2.username AND u2.is_active = 1
     WHERE f.status = 'accepted' 
       AND (f.username = ? OR f.friend_username = ?)`,
    [username, username],
    (err, friends) => {
      if (err) return res.status(500).send(err);
      
      // Modified pending requests query
      connection.query(
        `SELECT f.* 
         FROM friendships f
         JOIN user_information u ON f.username = u.username AND u.is_active = 1
         WHERE f.status = 'pending' 
           AND f.friend_username = ?`,
        [username],
        (err, pending) => {
          if (err) return res.status(500).send(err);
          res.render('pages/account', { friends, pending, user: username });
        }
      );
    }
  );
});


router.get('/deactivated', (req, res) => {
  const username = req.session.user;
  if (!username) {
    return res.redirect('/login');
  }
  res.render('pages/deactivate');
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
    const user = result[0];
    req.session.user = result[0].username; // Store only the username string
    req.session.isAdmin  = (user.is_admin === 1);
    req.session.save();
    if (user.is_active !== 1){ 
      return res.render('pages/deactivate');
    }
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

router.get('/home', checkActive, (req, res) => {
  const user = req.session.user; 

  // Get leaderboard data regardless of user login status
  const leaderboardSql = `
    SELECT username AS name, highscore AS score
    FROM user_information
    WHERE is_active = 1
    ORDER BY highscore DESC
    LIMIT 10
  `;

  // Send the game images in the ejs so home.js can grab them
  const characterImages = [ // Dynamically populate these arrays with the paths to every file in characters and GameUI
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
  ];
  const uiImages = [
    //"./images/GameUI/melon.webp",
    "./images/GameUI/blueCircle.png", // social circle
    "./images/GameUI/purpleCircle.png", // social circle highlight
    "./images/GameUI/partybtn.png", //buttons
    "./images/GameUI/rizzbtn.png",
    "./images/GameUI/coalminebtn.png",
    "./images/GameUI/startbtn.png",
    "./images/GameUI/partybtnselect.png", // Highlighting for clicked buttons
    "./images/GameUI/rizzbtnselect.png",
    "./images/GameUI/coalminebtnselect.png",
    "./images/GameUI/gray.webp", // gray filter for when buttons can't be clicked
    "./images/GameUI/orange.png" // Orange filter, used the same way as gray
  ];



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
        user: null,

        // Render UI images
        characterImages: characterImages,
        uiImages: uiImages
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
      //your rank query
      let yourRank = null, yourScore = null;
      if (userResult && userResult.length > 0) {
        yourRank = userResult[0].userRank;
        yourScore = (userResult[0].score != null) ? userResult[0].score.toString() : 'Not available';
      }
      // friend leaderboard query 
      const friendLeaderboardSql = `
      SELECT u.username AS name, u.highscore AS score
      FROM user_information u
      WHERE u.is_active = 1 AND u.username IN (
        SELECT CASE 
          WHEN f.username = ? THEN f.friend_username 
          ELSE f.username 
        END
        FROM friendships f
        WHERE f.status = 'accepted'
          AND (f.username = ? OR f.friend_username = ?)
      )
      ORDER BY u.highscore DESC
      LIMIT 10`;

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
          friendLeaderboard: friendLeaderboardResults,

          // Send game images
          characterImages: characterImages,
          uiImages: uiImages
        });
      });
    });
  });
});



router.post('/add_friend', checkActive, (req, res) => {
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

router.post('/deactivated', checkActive, (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }
  const user = req.session.user; 
  connection.query(
    "UPDATE user_information SET is_active = 0 " +
    "WHERE username = ?",
    [user], 
    function(err, result) {
      if (err) {
        console.error("Block error:", err);
        return res.status(500).send("Database error");
      }
      res.redirect("/deactivated");
    }
  );
});

router.post('/reactivate', (req, res) => {
  const username = req.session.user; 
  if (!username) {
    return res.status(401).send("Unauthorized");
  }
  connection.query(
    "UPDATE user_information SET is_active = 1 WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        console.error("Reactivate error:", err);
        return res.status(500).send("Database error");
      }
      res.redirect('/home'); 
    }
  );
});

function checkActive(req, res, next) {
  if (!req.session.user) return next();
  connection.query('SELECT is_active FROM user_information WHERE username = ?', 
    [req.session.user], 
    (err, results) => {
      if (err || !results.length || results[0].is_active !== 1) {
        req.session.destroy(() => res.redirect('/deactivated'));
      } else {
        next();
      }
  });
}

//Recieves scores from clients every time they finish a game. If the new score is higher than their high score, their high score is updated.
router.post('/score', (req, res) => {
  if (!req.session.user) {
    //return res.status(401).send("Unauthorized");
    return res.json({}); // Send back nothing because they aren't signed in. Ideally, if a user wasn't signed in, the client wouldn't be sending scores at all. Maintenance team, you can fix this if you want.
  }
  // Update the user's high score if the new score is higher
  connection.query(`UPDATE user_information SET highscore = ${req.body.score} WHERE username = "${req.session.user}" AND highscore < ${req.body.score}`, (err, result) => {
    
    if (err){
      console.log(err);
    }

    else{
      // Send the client a json that stores the new high score if it was updated and is empty if otherwise
      responseJSON = {}

      if (result.affectedRows > 0){
        responseJSON["newHighScore"] = req.body.score;
      }

      res.json(responseJSON); // I'm sending back the new high score, but currently the client doesn't update its leaderboard when it recieves a new high score. This is because the organization of the leaderboard is done when rendering home.ejs, and it would be annoying to reload the page or write a bunch of code to manually reorder the leaderboard. Maintenance team, you guys can implement this if you want.
    }
  });
});





module.exports = router;
