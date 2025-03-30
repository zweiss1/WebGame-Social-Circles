require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const pool = require('./database');

app.set('view engine', 'ejs');
app.set('views', './views'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 


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