var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken'); 

const verifyToken=require('../verifyToken');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Admin' });
});



// Example of a protected route
router.get('/protected', verifyToken, (req, res) => {
  res.status(200).json({ message: `Welcome ${req.username}, this is a protected route!` });
});

module.exports = router;
