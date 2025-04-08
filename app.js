require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

const pool = require('./database');

app.set('view engine', 'ejs');
app.set('views', './views'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 

//Setting up a session to get user data
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// expose a global `darkMode` to all renders, but only for logged‑in users
app.use((req, res, next) => {
  if (req.session.user) {
    // Always fetch the current darkMode value from the database
    pool.query(
      'SELECT darkMode FROM user_information WHERE username = ?',
      [req.session.user],
      (err, rows) => {
        if (err) return next(err);
        // Update session and locals with the fresh value
        req.session.darkMode = rows[0].darkMode === 1;
        res.locals.darkMode = req.session.darkMode;
        next();
      }
    );
  } else {
    // Guests never get dark mode
    res.locals.darkMode = false;
    next();
  }
});


app.post('/toggle-theme', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/home');

  pool.query(
    'UPDATE user_information SET darkMode = NOT darkMode WHERE username = ?',
    [user],
    (err) => {
      if (err) {
        console.error('Toggle theme error:', err);
        return res.status(500).send('Error updating theme');
      }
      // Redirect immediately; the middleware will fetch the new value on the next request
      res.redirect('/account');
    }
  );
});

const indexRouter = require('./routes/index');
app.use('/', indexRouter);



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});