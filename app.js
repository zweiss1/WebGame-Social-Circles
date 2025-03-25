require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');

app.set('view engine', 'ejs');
app.set('views', './views'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
// }));


const indexRouter = require('./routes/index');
const homeRouter = require('./routes/home');

app.use('/', indexRouter);
app.use('/home', homeRouter);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});