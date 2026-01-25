const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Update Profile
router.put('/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        const { name, removePicture } = req.body;
        const userId = req.user.id;
        let picture = undefined; // Use undefined to distinguish between null (remove) and not provided

        if (req.file) {
            picture = `/uploads/${req.file.filename}`;
        } else if (removePicture === 'true' || removePicture === true) {
            picture = null;
        }

        // Basic validation
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Update name and picture if provided or explicitly removed
        let query = 'UPDATE users SET name = ?';
        let params = [name];

        if (picture !== undefined) {
            query += ', picture = ?';
            params.push(picture);
        }

        query += ' WHERE id = ?';
        params.push(userId);

        await db.execute(query, params);

        const [rows] = await db.execute('SELECT id, name, email, picture FROM users WHERE id = ?', [userId]);

        res.json({ message: 'Profile updated', user: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating profile');
    }
});

// Get User Items (My Listings)
router.get('/my-items', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        console.time(`my-items-${userId}`);
        const [items] = await db.execute(
            `SELECT items.*, users.name as seller_name, users.picture as seller_picture 
             FROM items 
             JOIN users ON items.uploaded_by = users.id 
             WHERE items.uploaded_by = ? 
             ORDER BY items.created_at DESC`,
            [userId]
        );
        console.timeEnd(`my-items-${userId}`);
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user items');
    }
});


// Get Dashboard Data
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        console.time(`dashboard-${req.user.id}`);
        const [users] = await db.execute(
            'SELECT id, name, email, picture FROM users WHERE id = ?',
            [req.user.id]
        );
        console.timeEnd(`dashboard-${req.user.id}`);
        if (users.length > 0) {
            res.json({ message: `Welcome ${req.user.name}`, user: users[0] });
        } else {
            res.json({ message: `Welcome ${req.user.name}`, user: req.user });
        }
    } catch (err) {
        console.error('Dashboard error:', err);
        res.json({ message: `Welcome ${req.user.name}`, user: req.user });
    }
});

module.exports = router;
