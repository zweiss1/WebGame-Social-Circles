const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('../database');

router.get('/', (req, res) => {
  res.render('pages/login');
});

router.get('/register', (req, res) =>{
  res.render('pages/signup');
})


router.post('/login', (req, res) => {
  const { username, password } = req.body;
  //Checks if user has an account
  let sql = 'SELECT * FROM user_information WHERE username=?';
  connection.query(sql, [username], async (err, result) => {
      if (err) throw err;
      if (result.length === 0 ) {
          return res.status(401).send('Invalid username');
      }
      const isValid = await bcrypt.compare(password, result[0].hash_password); 
      if(!isValid){
          return res.status(401).send('Invalid password');
      }
      req.session.user = result[0];
      req.session.save();
      res.render('pages/home');
  });

});


router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 13);
  //Checks if username is taken
  console.log(username);
  console.log(password);
  console.log(hash);
  let checkUser = 'SELECT * FROM user_information WHERE username=?';
  connection.query(checkUser, [username], (err, result) => {
      if (err) throw err;
      if (result.length != 0) {
          return res.status(401).send('Username is already taken');
      }
      console.log('hello');

      //Adds user to database
      let sql = 'INSERT INTO user_information(username, hash_password) VALUES(?,?)';
      connection.query(sql, [username, hash], (err, result) => {
          if (err) throw err;
          const getUser = result.insertId;
          //Querying user that was just added
          let sql2 = 'SELECT * FROM user_information WHERE username=?';
          connection.query(sql2, [getUser], (err, result) => {
              if (err) throw err;
              req.session.user = result[0];
              req.session.save();
              res.redirect('/');
          });
      });
  });
});

router.get('/home', (req, res) => {
  res.render('pages/home', { 
    //THIS WILL EVENTUALLY BE DATA FROM THE DB, THIS IS A PLACEHOLDER OBJ
    leaderboardPlayers: [
      {name: "paul_GOAT", score: 1500},
      {name: "jack_GOAT", score: 1499},
      {name: "melissa_GOAT", score: 1493},
      {name: "harold_from_accounting", score: 5}
    ]
  });
});

module.exports = router;