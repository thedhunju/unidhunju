const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Update Profile
router.put('/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;
        let picture = null;

        if (req.file) {
            picture = `/uploads/${req.file.filename}`;
        }

        try {
            await db.execute('UPDATE users SET name = ?' + (picture ? ', picture = ?' : '') + ' WHERE id = ?',
                picture ? [name, picture, userId] : [name, userId]
            );
        } catch (sqlErr) {
            if (sqlErr.code === 'ER_BAD_FIELD_ERROR' || sqlErr.code === 'ER_UNKNOWN_COLUMN') {
                await db.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
            } else {
                throw sqlErr;
            }
        }

        const [rows] = await db.execute('SELECT id, name, email, picture FROM users WHERE id = ?', [userId]);
        const updatedUser = { ...rows[0], picture: picture || rows[0].picture };

        res.json({ message: 'Profile updated', user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating profile');
    }
});

// Get User Items (My Listings)
router.get('/my-items', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [items] = await db.execute(
            'SELECT * FROM items WHERE uploaded_by = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user items');
    }
});


// Get Dashboard Data
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, name, email, picture FROM users WHERE id = ?',
            [req.user.id]
        );
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
