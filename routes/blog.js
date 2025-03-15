const express = require('express');
const db = require('../db');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to protect routes
function authenticateToken(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).send({ message: 'Access Denied' });

    const token = authHeader.split(' ')[1];  // Extract the actual token
    if (!token) return res.status(403).send({ message: 'Invalid Token Format' });

    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) {
            console.log("JWT Verification Error:", err.message);  // Debugging
            return res.status(403).send({ message: 'Invalid Token' });
        }
        req.user = user;
        next();
    });
}


// Create a Blog Post (Protected Route)
router.post('/create', authenticateToken, (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;

    const sql = 'INSERT INTO blogs (user_id, title, content) VALUES (?, ?, ?)';
    db.query(sql, [userId, title, content], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Blog created successfully' });
    });
});

// Fetch All Blog Posts
router.get('/all', (req, res) => {
    db.query('SELECT blogs.*, users.username FROM blogs JOIN users ON blogs.user_id = users.id', (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});
router.put('/update/:blogId', authenticateToken, (req, res) => {
    const { title, content } = req.body;
    const blogId = req.params.blogId;
    const userId = req.user.id;

    const sql = 'UPDATE blogs SET title = ?, content = ? WHERE id = ? AND user_id = ?';
    db.query(sql, [title, content, blogId, userId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Blog updated successfully' });
    });
});
router.delete('/delete/:blogId', authenticateToken, (req, res) => {
    const blogId = req.params.blogId;
    const userId = req.user.id;

    const sql = 'DELETE FROM blogs WHERE id = ? AND user_id = ?';
    db.query(sql, [blogId, userId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Blog deleted successfully' });
    });
});

// Add a Comment to a Blog Post (Protected Route)
router.post('/:blogId/comment', authenticateToken, (req, res) => {
    const { comment } = req.body;
    const blogId = req.params.blogId;
    const userId = req.user.id;

    const sql = 'INSERT INTO comments (blog_id, user_id, comment) VALUES (?, ?, ?)';
    db.query(sql, [blogId, userId, comment], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Comment added successfully' });
    });
});

// Fetch Comments for a Blog Post
router.get('/:blogId/comments', (req, res) => {
    const blogId = req.params.blogId;
    db.query('SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE blog_id = ?', 
    [blogId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

module.exports = router;
