const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createNotification } = require('../utils/notificationHelper');

// Create Item
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, price, category } = req.body;
        const userId = req.user.id;
        const imageUrl = req.files.length > 0 ? `/uploads/${req.files[0].filename}` : null;

        const [result] = await db.execute(
            'INSERT INTO items (uploaded_by, title, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, title, description, price, category.toLowerCase(), imageUrl]
        );

        res.status(201).json({ id: result.insertId, message: 'Item listed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating item listing');
    }
});

// Update Item
router.put('/:id', authenticateToken, upload.array('images', 1), async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user.id;
        const { title, description, price, category } = req.body;
        const imageUrl = req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : null;

        const [items] = await db.execute('SELECT * FROM items WHERE id = ?', [itemId]);
        if (items.length === 0) return res.status(404).json({ error: 'Item not found' });

        if (items[0].uploaded_by !== userId) {
            return res.status(403).json({ error: 'You are not authorized to edit this item.' });
        }

        let query = 'UPDATE items SET title = ?, description = ?, price = ?, category = ?';
        let params = [title, description, price, category.toLowerCase()];

        if (imageUrl) {
            query += ', image_url = ?';
            params.push(imageUrl);
        }

        query += ' WHERE id = ?';
        params.push(itemId);

        await db.execute(query, params);

        res.json({ message: 'Item updated successfully', image_url: imageUrl || items[0].image_url });
    } catch (err) {
        console.error('Update item error:', err);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Get All Items
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = 'SELECT items.*, users.name as seller_name, users.picture as seller_picture FROM items JOIN users ON items.uploaded_by = users.id WHERE items.status IN ("available", "pending", "reserved")';
        const params = [];

        if (category && category.toLowerCase() !== 'all') {
            query += ' AND LOWER(category) = ?';
            params.push(category.toLowerCase());
        }
        if (search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const [items] = await db.execute(query, params);
        res.json(items);
    } catch (err) {
        res.status(500).send('Error fetching items');
    }
});

// Get Item Details
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT items.*, users.name as seller_name, users.email as seller_email, users.picture as seller_picture,
              bookings.id as booking_id, bookings.user_id as buyer_id, buyer.name as buyer_name, buyer.picture as buyer_picture, bookings.status as booking_status
         FROM items 
         JOIN users ON items.uploaded_by = users.id 
         LEFT JOIN bookings ON items.id = bookings.item_id AND (bookings.status = 'pending' OR bookings.status = 'reserved' OR bookings.status = 'confirmed')
         LEFT JOIN users as buyer ON bookings.user_id = buyer.id
         WHERE items.id = ?
         ORDER BY bookings.created_at DESC LIMIT 1`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).send('Item not found');
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching item details');
    }
});

// Reserve Item
router.post('/:id/reserve', authenticateToken, async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user.id;

        const [items] = await db.execute('SELECT * FROM items WHERE id = ?', [itemId]);
        if (items.length === 0) return res.status(404).json({ error: 'Item not found' });

        const item = items[0];
        if (item.status !== 'available') {
            return res.status(400).json({ error: 'Item is not available for reservation.' });
        }

        if (item.uploaded_by === userId) {
            return res.status(400).json({ error: 'You cannot reserve your own item.' });
        }

        await db.execute(
            'INSERT INTO bookings (item_id, user_id, booked_quantity, status) VALUES (?, ?, ?, ?)',
            [itemId, userId, 1, 'pending']
        );

        await db.execute('UPDATE items SET status = ? WHERE id = ?', ['pending', itemId]);

        // Notify the seller
        await createNotification(
            item.uploaded_by,
            'reservation_request',
            `You have a new reservation request for "${item.title}".`,
            itemId
        );

        res.json({ message: 'Item reserved successfully!', itemId: itemId });
    } catch (err) {
        console.error('Reserve Item error:', err);
        res.status(500).json({ error: 'Failed to reserve item.' });
    }
});

// Mark Item as Sold (Directly by Seller)
router.post('/:id/sold', authenticateToken, async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user.id;

        const [items] = await db.execute('SELECT * FROM items WHERE id = ?', [itemId]);
        if (items.length === 0) return res.status(404).json({ error: 'Item not found' });

        const item = items[0];
        if (item.uploaded_by !== userId) {
            return res.status(403).json({ error: 'Only the seller can mark this item as sold.' });
        }

        if (item.status === 'sold') {
            return res.status(400).json({ error: 'Item is already marked as sold.' });
        }

        // Update item status to sold
        await db.execute('UPDATE items SET status = "sold" WHERE id = ?', [itemId]);

        res.json({ message: 'Item marked as sold successfully!' });
    } catch (err) {
        console.error('Mark Sold error:', err);
        res.status(500).json({ error: 'Failed to mark item as sold.' });
    }
});

// Get comments for an item
router.get('/:id/comments', async (req, res) => {
    try {
        const itemId = req.params.id;
        const [comments] = await db.execute(
            `SELECT comments.*, users.name as user_name, users.picture as user_picture 
       FROM comments 
       JOIN users ON comments.user_id = users.id 
       WHERE item_id = ? 
       ORDER BY created_at ASC`,
            [itemId]
        );
        res.json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

module.exports = router;
