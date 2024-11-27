const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const register = (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    User.insertUser(username, hashedPassword, role, (err) => {
        if (err) return res.status(500).send("Error registering user.");
        res.status(201).send("User registered successfully.");
    });
};

const login = (req, res) => {
    const { username, password } = req.body;

    User.findUserByUsername(username, (err, result) => {
        if (err || result.length === 0) return res.status(400).send("User not found.");

        const user = result[0];
        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(400).send("Invalid credentials.");

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
};

module.exports = { register, login };
