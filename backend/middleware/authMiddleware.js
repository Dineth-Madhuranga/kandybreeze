const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'kandy-breeze-secret';

module.exports = (req, res, next) => {
  const token = req.cookies && req.cookies['kb_token'];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.admin) {
      req.admin = decoded;
      return next();
    }
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
