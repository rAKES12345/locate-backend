const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
  
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
  
    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(500).json({ message: "Failed to authenticate token" });
      }
      
      // If everything is good, save to request for use in other routes
      req.username = decoded.username; // Save the decoded username to the request object
      next(); // Call the next middleware or route handler
    });
  };

  module.exports=verifyToken;
  