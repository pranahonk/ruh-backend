require('dotenv').config();


const authenticateApiKey = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'API key is missing' });
  }


  const apiKey = authHeader.split(' ')[1];


  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }


  next();
};

module.exports = { authenticateApiKey };
