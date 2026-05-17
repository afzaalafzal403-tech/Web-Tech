const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // Extract token from Authorization header
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Access Denied. No token provided.' });
  }

  const tokenParts = authHeader.split(' ');
  
  // Format should be "Bearer <token>"
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Access Denied. Invalid token format. Use "Bearer <token>".' });
  }

  const token = tokenParts[1];

  try {
    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Append decoded user info to the req object
    req.apiUser = decoded;
    
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = {
  verifyToken
};
