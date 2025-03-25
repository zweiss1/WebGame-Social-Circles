const express = require('express');
const router = express.Router();
const session = require('express-session');
//need to add connection for database

router.get('/', (req, res) => {
  res.render('pages/login');
});

router.get('/signup', (req, res) => {
  res.render('pages/signup');
})

router.post('/user_login', (req, res) =>{
  const {username, password} = req.body;
  //UNCOMMENT THIS ONCE WE HAVE DB
  //Checks if user has an account 
  // let sql = 'SELECT * FROM users WHERE username=?'; we will this work with db 
  // connection.query(sql, [username], async (err, result) => {
  //     if (err) throw err;
  //     if (result.length === 0 || result.password!=password) {
  //         return res.status(401).send('Invalid username or password');
  //     }
  //     req.session.user = result[0];
  //     req.session.save();
  //     res.redirect('/home');
  // });
  res.redirect('/home');
});

module.exports = router;