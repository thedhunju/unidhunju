const jwt = require('jsonwebtoken');
const { v7: uuidv7 } = require('uuid');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_this';
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); // Allow all CORS for dev
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({ storage: storage });

// Serve Static Files
// Note: In production, frontend might be served differently or built into 'dist'
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Uni-Find API is running!');
});

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('[DEBUG] authenticateToken - Token received:', token ? 'Yes' : 'No');

  if (!token) {
    console.log('[DEBUG] authenticateToken - No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('[DEBUG] authenticateToken - Token verification failed:', err.message);
      return res.sendStatus(403);
    }
    console.log('[DEBUG] authenticateToken - Token verified for user:', user.email);
    req.user = user;
    next();
  });
}

// --- API Routes (Standardized with /api prefix) ---

// 1. Auth - Simple REST API (KUmail only)

app.post('/api/auth/kumail', async (req, res) => {
  try {
    const { email, name, type, password } = req.body; // type: 'login' or 'register'

    // Validate KUmail domain - accept both @ku.edu.np and @student.ku.edu.np
    const isValidKUmail = email.endsWith('@ku.edu.np') || email.endsWith('@student.ku.edu.np');

    if (!isValidKUmail) {
      return res.status(403).json({
        error: 'Access restricted to verified Kathmandu University students only.'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user exists
    const [existingUsers] = await db.execute(
      'SELECT id, email, name, password FROM users WHERE email = ?',
      [email]
    );

    let user;

    if (type === 'login') {
      if (existingUsers.length === 0) {
        return res.status(404).json({ error: 'Account not found. Please register first.' });
      }
      user = existingUsers[0];

      const validPassword = await bcrypt.compare(password, user.password || '');
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

    } else if (type === 'register') {
      if (existingUsers.length > 0) {
        return res.status(409).json({ error: 'User already exists. Please login.' });
      }
      // Create new user
      const userName = name || email.split('@')[0];
      const userId = uuidv7();

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.execute(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
        [userId, userName, email, hashedPassword]
      );
      user = { id: userId, name: userName, email };
    } else {
      return res.status(400).json({ error: 'Invalid auth type' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user without password
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});



app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    // Fetch full user data including picture
    const [users] = await db.execute(
      'SELECT id, name, email, picture FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length > 0) {
      res.json({ message: `Welcome ${req.user.name}`, user: users[0] });
    } else {
      // Fallback to token data if user not found
      res.json({ message: `Welcome ${req.user.name}`, user: req.user });
    }
  } catch (err) {
    console.error('Dashboard error:', err);
    // Fallback to token data on error
    res.json({ message: `Welcome ${req.user.name}`, user: req.user });
  }
});

// Update Profile
// Update Profile
// Update Profile
// Update Profile
app.put('/api/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    let picture = null;

    // If new avatar uploaded, update picture URL
    if (req.file) {
      picture = `/uploads/${req.file.filename}`;
    }

    try {
      await db.execute('UPDATE users SET name = ?' + (picture ? ', picture = ?' : '') + ' WHERE id = ?',
        picture ? [name, picture, userId] : [name, userId]
      );
    } catch (sqlErr) {
      // If 'picture' column doesn't exist (ER_BAD_FIELD_ERROR), fallback to name only
      if (sqlErr.code === 'ER_BAD_FIELD_ERROR' || sqlErr.code === 'ER_UNKNOWN_COLUMN') {
        await db.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
      } else {
        throw sqlErr;
      }
    }

    // Refresh user data
    const [rows] = await db.execute('SELECT id, name, email, picture FROM users WHERE id = ?', [userId]);
    // Merge the picture (either new upload or existing from DB if valid) into the response
    const updatedUser = { ...rows[0], picture: picture || rows[0].picture };

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating profile');
  }
});

// Get User Items (My Listings)
app.get('/api/my-items', authenticateToken, async (req, res) => {
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

// 2. Marketplace Items

// Create Item
// Create Item
app.post('/api/items', authenticateToken, upload.array('images', 5), async (req, res) => {
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
app.put('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;
    const { title, description, price, category } = req.body;
    console.log(`[DEBUG] Update Item Request - ID: ${itemId}, User: ${userId}`);
    console.log('[DEBUG] Form data:', { title, description, price, category });

    // 1. Check ownership
    const [items] = await db.execute('SELECT * FROM items WHERE id = ?', [itemId]);
    if (items.length === 0) {
      console.log('[DEBUG] Update Failed: Item not found');
      return res.status(404).json({ error: 'Item not found' });
    }

    console.log(`[DEBUG] Item uploader: ${items[0].uploaded_by}`);
    if (items[0].uploaded_by !== userId) {
      console.log('[DEBUG] Update Failed: Unauthorized');
      return res.status(403).json({ error: 'You are not authorized to edit this item.' });
    }

    // 2. Update item
    await db.execute(
      'UPDATE items SET title = ?, description = ?, price = ?, category = ? WHERE id = ?',
      [title, description, price, category.toLowerCase(), itemId]
    );

    console.log('[DEBUG] Item updated successfully');
    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Get All Items
// Get All Items
app.get('/api/items', async (req, res) => {
  try {
    const { category, search, maxPrice } = req.query;
    let query = 'SELECT items.*, users.name as seller_name, users.picture as seller_picture FROM items JOIN users ON items.uploaded_by = users.id WHERE items.status IN ("available", "reserved")';
    const params = [];

    if (category && category.toLowerCase() !== 'all') {
      query += ' AND LOWER(category) = ?';
      params.push(category.toLowerCase());
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }

    query += ' ORDER BY created_at DESC';

    const [items] = await db.execute(query, params);
    res.json(items);
  } catch (err) {
    res.status(500).send('Error fetching items');
  }
});

// Get Item Details
app.get('/api/items/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT items.*, 
              seller.name as seller_name, seller.email as seller_email, seller.picture as seller_picture,
              bookings.id as booking_id, bookings.user_id as buyer_id,
              buyer.name as buyer_name, buyer.email as buyer_email
         FROM items 
         JOIN users as seller ON items.uploaded_by = seller.id 
         LEFT JOIN bookings ON items.id = bookings.item_id AND (bookings.status = 'reserved' OR bookings.status = 'confirmed')
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

// Delete Item
app.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;

    // Check ownership
    const [items] = await db.execute('SELECT * FROM items WHERE id = ?', [itemId]);
    if (items.length === 0) return res.status(404).json({ error: 'Item not found' });

    if (items[0].uploaded_by !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this item.' });
    }

    // Delete item (foreign key ON DELETE CASCADE usually handles bookings/comments if set up, 
    // but just in case, we might need to delete bookings manually if strict constraints exist. 
    // Assuming simple DB or constraints set. If not, catching error).
    // Let's assume we can just delete the item.
    await db.execute('DELETE FROM items WHERE id = ?', [itemId]);

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Confirm Reservation (Seller Only)
app.post('/api/bookings/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    // Fetch booking and item info
    const [bookings] = await db.execute(
      'SELECT b.*, i.uploaded_by as seller_id, i.id as item_id FROM bookings b JOIN items i ON b.item_id = i.id WHERE b.id = ?',
      [bookingId]
    );

    if (bookings.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const booking = bookings[0];

    // Only seller can confirm
    if (booking.seller_id !== userId) {
      return res.status(403).json({ error: 'Only the seller can confirm this deal.' });
    }

    if (booking.status !== 'reserved') {
      return res.status(400).json({ error: 'Booking is not in reserved state.' });
    }

    // Update booking status
    await db.execute('UPDATE bookings SET status = "confirmed" WHERE id = ?', [bookingId]);

    // Update item status
    await db.execute('UPDATE items SET status = "sold" WHERE id = ?', [booking.item_id]);

    res.json({ message: 'Deal confirmed! Item marks as sold.' });
  } catch (err) {
    console.error('Confirm Booking error:', err);
    res.status(500).json({ error: 'Failed to confirm deal.' });
  }
});

// 4. Comments

// Get comments for an item
app.get('/api/items/:id/comments', async (req, res) => {
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

// Post a comment or reply
app.post('/api/comments', authenticateToken, async (req, res) => {
  try {
    console.log('[DEBUG] Post comment request received:', req.body);
    console.log('[DEBUG] User ID from token:', req.user.id);

    const { item_id, comment_text, parent_comment_id } = req.body;
    const userId = req.user.id;

    if (!comment_text || comment_text.trim() === '') {
      console.log('[DEBUG] Comment text empty');
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const [result] = await db.execute(
      'INSERT INTO comments (item_id, user_id, comment_text, parent_comment_id) VALUES (?, ?, ?, ?)',
      [item_id, userId, comment_text, parent_comment_id || null]
    );

    console.log('[DEBUG] Comment inserted, ID:', result.insertId);

    // Fetch the inserted comment with user data to return
    const [newCommentRows] = await db.execute(
      `SELECT comments.*, users.name as user_name, users.picture as user_picture 
       FROM comments 
       JOIN users ON comments.user_id = users.id 
       WHERE comments.id = ?`,
      [result.insertId]
    );

    if (newCommentRows.length === 0) {
      console.log('[DEBUG] Failed to fetch back the inserted comment');
      return res.status(500).json({ error: 'Failed to retrieve record after insertion' });
    }

    console.log('[DEBUG] Success, returning:', newCommentRows[0]);
    res.status(201).json(newCommentRows[0]);
  } catch (err) {
    console.error('[DEBUG] Error posting comment:', err);
    res.status(500).json({ error: 'Failed to post comment', details: err.message });
  }
});


// --- Reservation & Purchases Routes ---

// Reserve Item
app.post('/api/items/:id/reserve', authenticateToken, async (req, res) => {
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

    // 1. Create Booking
    await db.execute(
      'INSERT INTO bookings (item_id, user_id, booked_quantity, status) VALUES (?, ?, ?, ?)',
      [itemId, userId, 1, 'reserved']
    );

    // 2. Update Item Status
    await db.execute('UPDATE items SET status = ? WHERE id = ?', ['reserved', itemId]);

    res.json({ message: 'Item reserved successfully!', itemId: itemId });
  } catch (err) {
    console.error('Reserve Item error:', err);
    res.status(500).json({ error: 'Failed to reserve item.' });
  }
});

// Cancel Reservation/Booking
app.post('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    // Fetch booking and item info
    const [bookings] = await db.execute(
      'SELECT b.*, i.uploaded_by as seller_id FROM bookings b JOIN items i ON b.item_id = i.id WHERE b.id = ?',
      [bookingId]
    );

    if (bookings.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const booking = bookings[0];

    // Only buyer or seller can cancel
    if (booking.user_id !== userId && booking.seller_id !== userId) {
      return res.status(403).json({ error: 'You are not authorized to cancel this booking.' });
    }

    // Update booking status
    await db.execute('UPDATE bookings SET status = "cancelled" WHERE id = ?', [bookingId]);

    // Set item back to available
    await db.execute('UPDATE items SET status = "available" WHERE id = ?', [booking.item_id]);

    res.json({ message: 'Booking cancelled and item is now available.' });
  } catch (err) {
    console.error('Cancel Booking error:', err);
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
});

// Get My Purchases
app.get('/api/my-purchases', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[DEBUG] Fetching purchases for user: ${userId}`);
    const [purchases] = await db.execute(
      `SELECT items.*, bookings.status as booking_status, bookings.id as booking_id 
       FROM bookings 
       JOIN items ON bookings.item_id = items.id 
       WHERE bookings.user_id = ? 
         AND bookings.status IN ('confirmed', 'reserved') 
         AND items.status != 'available'
       ORDER BY bookings.created_at DESC`,
      [userId]
    );
    console.log(`[DEBUG] Found ${purchases.length} active purchases/reservations`);
    res.json(purchases);
  } catch (err) {
    console.error('Error fetching purchases:', err);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
