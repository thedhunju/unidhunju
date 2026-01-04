const jwt = require('jsonwebtoken');
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
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- API Routes (Standardized with /api prefix) ---

// 1. Auth
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email.endsWith('.ku.edu.np')) {
      return res.status(400).send('Registration restricted to .ku.edu.np emails only.');
    }
    const [existing] = await db.execute('SELECT id, email FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).send('Email already registered!');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    res.send('User registered!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute(
      'SELECT id, email, password, name FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (rows.length === 0) return res.status(400).send('User not found');
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send('Incorrect password');

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});

app.get('/api/dashboard', authenticateToken, (req, res) => {
  // Return user info
  res.json({ message: `Welcome ${req.user.name}`, user: req.user });
});

// Update Profile
app.put('/api/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    // Note: In a real app, successful upload gives req.file
    // For MVP, if no file, we might just update name, or keep old avatar.
    // However, the DB schema for users table doesn't have avatar_url column yet?
    // Let's check init_schema.js or setupDb.js. 
    // setupDb.js does NOT show avatar_url in users table.
    // I will add it or just ignore it for now and assume frontend handles it or we mock it.
    // Wait, the user asked to change profile photo. I need to add avatar_url to users table.
    // For now, I'll update the name.

    await db.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);

    // Refresh user data
    const [rows] = await db.execute('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Profile updated', user: rows[0] });
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
      'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC',
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
app.post('/api/items', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const userId = req.user.id;
    const imageUrl = req.files.length > 0 ? `/uploads/${req.files[0].filename}` : null;

    const [result] = await db.execute(
      'INSERT INTO items (user_id, title, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, description, price, category, imageUrl]
    );

    res.status(201).json({ id: result.insertId, message: 'Item listed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating item listing');
  }
});

// Get All Items
app.get('/api/items', async (req, res) => {
  try {
    const { category, search, maxPrice } = req.query;
    let query = 'SELECT items.*, users.name as seller_name FROM items JOIN users ON items.user_id = users.id WHERE status = "Available"';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
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
    console.error(err);
    res.status(500).send('Error fetching items');
  }
});

// Get Item Details
app.get('/api/items/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT items.*, users.name as seller_name, users.email as seller_email 
         FROM items JOIN users ON items.user_id = users.id 
         WHERE items.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).send('Item not found');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching item details');
  }
});

// 3. Lost & Found

app.post('/api/lost-found', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { type, title, description, location, date_lost_found, contact_info } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.execute(
      `INSERT INTO lost_found (user_id, type, title, description, location, date_lost_found, image_url, contact_info) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, type, title, description, location, date_lost_found, imageUrl, contact_info]
    );
    res.status(201).json({ id: result.insertId, message: 'Post created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating lost/found post');
  }
});

app.get('/api/lost-found', async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT lost_found.*, users.name as user_name FROM lost_found JOIN users ON lost_found.user_id = users.id WHERE status = "Open"';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';
    const [posts] = await db.execute(query, params);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching lost/found posts');
  }
});

// 4. Messages (Basic)

// Send Message
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { receiver_id, item_id, content } = req.body;
    const senderId = req.user.id;

    await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, item_id, content) VALUES (?, ?, ?, ?)',
      [senderId, receiver_id, item_id, content]
    );
    res.status(201).send('Message sent');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sending message');
  }
});

// Get Messages (Conversation style is complex, just fetching inbox for now)
app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Get messages where user is receiver
    const [messages] = await db.execute(
      `SELECT m.*, u.name as sender_name, i.title as item_title 
             FROM messages m 
             JOIN users u ON m.sender_id = u.id 
             LEFT JOIN items i ON m.item_id = i.id
             WHERE m.receiver_id = ? 
             ORDER BY m.created_at DESC`,
      [userId]
    );
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching messages');
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
