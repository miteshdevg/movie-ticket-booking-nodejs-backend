

// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const db = require('../config/db');

// // Register
// router.post('/register', async (req, res) => {
//     const { username, email, password, role } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     db.query('INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, role], (err, results) => {
//         if (err) return res.status(500).send(err);
//         res.json({ message: 'User registered successfully!' });
//     });
// });

// // Login
// router.post('/login', (req, res) => {
//     const { email, password } = req.body;
//     db.query('SELECT * FROM Users WHERE email = ?', [email], async (err, results) => {
//         if (err) return res.status(500).send(err);
//         if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
//             return res.status(401).json({ message: 'Invalid credentials' });
//         }
//         const token = jwt.sign({ id: results[0].id, role: results[0].role }, process.env.JWT_SECRET);
//         res.json({ token });
//     });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// // Register
// router.post('/register', async (req, res) => {
//     // try {
//     //     console.log("req.body-->>", req.body);

//     //     const { username, email, password, role = 'user' } = req.body; // default role to 'user'
//     //     const hashedPassword = await bcrypt.hash(password, 10);

//     //     db.query('INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)',
//     //         [username, email, hashedPassword, role], (err, results) => {
//     //             if (err) return res.status(500).json({ error: 'Database error during registration.' });
//     //             res.json({ message: 'User registered successfully!' });
//     //         });
//     // } catch (error) {
//     //     res.status(500).json({ error: 'An error occurred during registration.' });
//     // }
//     db.query(
//         'INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)',
//         [username, email, hashedPassword, role],
//         (err, results) => {
//             if (err) return res.status(500).json({ error: 'Database error during registration.' });
//             res.json({ message: 'User registered successfully!' });
//         }
//     );

// });

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role = 'user' } = req.body; // default role to 'user'

        // Ensure that all required fields are present
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Log the parameters to ensure they are defined
        console.log("Parameters:", username, email, hashedPassword, role);

        db.query(
            'INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role],
            (err, results) => {
                if (err) {
                    console.log("Error--?>", err);
                    if (err.code == "ER_DUP_ENTRY") {
                        return res.json({ message: 'UserName already existing' });
                    }
                    return res.status(500).json({ error: 'Database error during registration.' });
                }
                res.json({ message: 'User registered successfully!' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during registration.' });
    }
});

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM Users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error during login.' });
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Token with expiration
        const token = jwt.sign(
            { id: results[0].id, role: results[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token valid for 1 hour
        );

        res.json({ token, role: results[0].role });
    });
});

module.exports = router;
