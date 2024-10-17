var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var connection = require('../connection');


// Create users table if it doesn't exist
const createUsersTable = () => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  
    connection.query(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('Users table is ready');
      }
    });
  };

  createUsersTable();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Auth' });
});

router.post('/login',  (req, res) => {
  const { username, password } = req.body;
  const JWT_SECRET='locate';
 if(!username || !password){
    res.status(400).json({ message: "Invalid username or password" });
  }

  try{
    const query="Select username,password from users where username=?";
    connection.query(query,[username],async(err,results)=>{
        if(err) throw err;

        if(results.length===0){
            return res.status(400).json({message:"No user found"})
        }

        const user=results[0];
        const isMatch=await bcrypt.compare(password,user.password);

        if(isMatch){
            const token=jwt.sign({username:user.username},JWT_SECRET,{
                expiresIn:'1h'
            });
            res.status(200).json({message:"Logged in Succesfull!",token:token});
        }else{
            res.status(400).json({message:"Invalid username or password"});
        }
    });
  }catch(e){
    console.log(e)
    res.status(500).json({message:e});
  }
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email, and password are required" });
  }

  try {
    const query = "SELECT * FROM users WHERE email = ?";
    connection.query(query, [email], async (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        connection.query(insertQuery, [username, email, hashedPassword], (err, results) => {
          if (err) {
            return res.status(500).json({ message: err });
          }
          return res.status(201).json({ message: "Registered successfully" });
        });
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
