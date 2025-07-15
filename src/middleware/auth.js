require('dotenv').config();

// API Key authentication middleware
const authenticateApiKey = (req, res, next) => {
  // Get API key from request header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'API key is missing' });
  }
  
  // Extract API key from header
  const apiKey = authHeader.split(' ')[1];
  
  // Validate API key
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  // API key is valid, proceed to next middleware
  next();
};

module.exports = { authenticateApiKey };
