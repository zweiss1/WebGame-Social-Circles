require('dotenv').config(); //loads enviroment variables from the .env file
const mysql = require('mysql2/promise'); //imports mysql2 library 

const pool = mysql.createPool({ //handles mySQL connections
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool; //makes pool avaible to rest of project