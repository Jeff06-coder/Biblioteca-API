require('dotenv').config();

module.exports = {
  port: process.env.NODE_WEB_PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
};
