const jwt = require('jsonwebtoken');

const SECRET = process.env.SESSION_SECRET || 'CONFIGURA_SESSION_SECRET_EN_ENV';

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return null;
  }
  
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = { verifyToken, SECRET };
