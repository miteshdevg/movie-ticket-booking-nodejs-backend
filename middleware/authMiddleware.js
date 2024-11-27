const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    // const token = req.headers['authorization'];
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) return res.status(401).send('Access Denied');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        console.log("user--->>", user);
        if (err) return res.status(403).send('Invalid Token');
        req.user = user;
        next();
    });
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).send('Admin access required');
    next();
};

module.exports = { authenticateToken, authorizeAdmin };
