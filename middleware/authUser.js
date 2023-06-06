const { User } = require("../Models/user");
const jwt = require("jsonwebtoken");

const TokenBlacklist = require('../Models/TokenBlocklist');

const verifyToken = async (req, res, next) => {
  try {
    let token = req.header('Authorization');
    if (!token) {
      return res.status(403).send('Access Denied');
    }
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

   
    let bToken = 'Bearer '+token;
    const isBlacklisted = await TokenBlacklist.findOne({ token: bToken });
    if (isBlacklisted) {
      return res.status(401).send('Invalid Token');
    }

    const verified = jwt.verify(token, process.env.JWTPRIVATEKEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = verifyToken;