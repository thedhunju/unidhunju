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

// ==================== MIDDLEWARE ====================

// CORS - Restrict to frontend only
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== FILE UPLOAD SETUP ====================

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const PORT = process.env.PORT || 3000;

// ==================== VALIDATION HELPERS ====================

const validateEmail = (email) => {
  return email && email.endsWith('.ku.edu.np');
};

const validatePhone = (phone) => {
  return !phone || /^[0-9]{10}$/.test(phone);
};

const validatePrice = (price) => {
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice >= 0 && numPrice <= 1000000;
};

// ==================== AUTH MIDDLEWARE ====================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ==================== API ROUTES ====================

app.get('/', (req, res) => {
  res.json({ 
    message: 'Uni-Find API is running!', 
    version: '1.0.0',
    endpoints: {
      auth: ['/api/register', '/api/login'],
      items: ['/api/items', '/api/my-items'],
      lostFound: ['/api/lost-found']
    }
  });
});

// ==================== AUTH ROUTES ====================

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Registration restricted to .ku.edu.np emails only' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [rows] = await db.execute(
      'SELECT id, email, password, name FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error logging in' });
  }
});

app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}`, user: req.user });
});

app.put('/api/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    await db.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);

    const [rows] = await db.execute('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Profile updated successfully', user: rows[0] });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// ==================== ITEMS ROUTES ====================

app.get('/api/my-items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [items] = await db.execute(
      'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(items);
  } catch (err) {
    console.error('Fetch user items error:', err);
    res.status(500).json({ error: 'Error fetching user items' });
  }
});

// ✅ FIXED: Create Item with all new fields
app.post('/api/items', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      price, 
      category,
      condition,           // NEW
      seller_phone,        // NEW
      seller_social_platform,  // NEW
      seller_social_handle     // NEW
    } = req.body;

    const userId = req.user.id;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!validatePrice(price)) {
      return res.status(400).json({ error: 'Price must be between 0 and 1,000,000' });
    }

    if (!validatePhone(seller_phone)) {
      return res.status(400).json({ error: 'Phone must be 10 digits (e.g., 9841234567)' });
    }

    const imageUrl = req.files && req.files.length > 0 
      ? `/uploads/${req.files[0].filename}` 
      : null;

    // ✅ FIXED: Insert with all new fields
    const [result] = await db.execute(
      `INSERT INTO items (
        user_id, title, description, price, category, 
        condition, seller_phone, seller_social_platform, seller_social_handle, 
        image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, title, description, price, category,
        condition, seller_phone, seller_social_platform, seller_social_handle,
        imageUrl
      ]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Item listed successfully' 
    });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ error: 'Error creating item listing' });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const { category, search, maxPrice } = req.query;
    
    let query = `
      SELECT items.*, users.name as seller_name, users.email as seller_email 
      FROM items 
      JOIN users ON items.user_id = users.id 
      WHERE items.status = "Available"
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ' AND items.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (items.title LIKE ? OR items.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (maxPrice) {
      query += ' AND items.price <= ?';
      params.push(maxPrice);
    }

    query += ' ORDER BY items.created_at DESC';

    const [items] = await db.execute(query, params);
    res.json(items);
  } catch (err) {
    console.error('Fetch items error:', err);
    res.status(500).json({ error: 'Error fetching items' });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT items.*, users.name as seller_name, users.email as seller_email 
       FROM items 
       JOIN users ON items.user_id = users.id 
       WHERE items.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Fetch item error:', err);
    res.status(500).json({ error: 'Error fetching item details' });
  }
});

// ==================== LOST & FOUND ROUTES ====================

app.post('/api/lost-found', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { type, title, description, location, date_lost_found, contact_info } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.execute(
      `INSERT INTO lost_found (
        user_id, type, title, description, location, 
        date_lost_found, image_url, contact_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, type, title, description, location, date_lost_found, imageUrl, contact_info]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Post created successfully' 
    });
  } catch (err) {
    console.error('Create lost/found error:', err);
    res.status(500).json({ error: 'Error creating lost/found post' });
  }
});

app.get('/api/lost-found', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = `
      SELECT lost_found.*, users.name as user_name 
      FROM lost_found 
      JOIN users ON lost_found.user_id = users.id 
      WHERE lost_found.status = "Open"
    `;
    const params = [];

    if (type) {
      query += ' AND lost_found.type = ?';
      params.push(type);
    }

    query += ' ORDER BY lost_found.created_at DESC';

    const [posts] = await db.execute(query, params);
    res.json(posts);
  } catch (err) {
    console.error('Fetch lost/found error:', err);
    res.status(500).json({ error: 'Error fetching lost/found posts' });
  }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving uploads from: ${uploadDir}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: http://localhost:5173`);
});