const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
   
// Signup
router.post('/signup', (req, res) => {
    const { username, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).send(err);
        
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hash], (err, result) => {
            if (err) return res.status(500).send(err);
            res.send({ message: 'User registered successfully' });
        });
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(400).send({ message: 'User not found' });

        bcrypt.compare(password, results[0].password, (err, match) => {
            if (!match) return res.status(401).send({ message: 'Incorrect password' });

            const token = jwt.sign({ id: results[0].id }, 'secretkey', { expiresIn: '1h' });
            res.send({ token });
        });
    });
});

module.exports = router;
