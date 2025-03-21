require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Database connection
const pool = require('./database');

// EJS Configuration
app.set('view engine', 'ejs');
app.set('views', './views'); 

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 

// Title middleware
app.use((req, res, next) => {
    res.locals.getTitle = (pageTitle) => {
      return pageTitle ? `${pageTitle} | Chase's Recipe Site` : "Chase's Recipe Site";
    };
    next();
});

// Routes
const indexRouter = require('./routes/index');

app.use('/', indexRouter);


// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});