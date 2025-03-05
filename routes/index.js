const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/home', { 
    title: 'Chase Cooking',
    description: "Chef Gordon Ramsey won't know what hit him!"
  });
});

module.exports = router;