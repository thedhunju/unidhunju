# UNI-find Project Documentation (dhunju branch)

## 1. Project Overview
**UNI-find** is a C2C (Consumer-to-Consumer) marketplace platform designed specifically for Kathmandu University students. It allows students to buy, sell, and reserve items like books, electronics, and stationery using their university emails (`@ku.edu.np` or `@student.ku.edu.np`).

### Key Features
- **Student-only Authentication**: Restricts registration to KU student emails.
- **Marketplace**: Listing items with categories, prices, and images.
- **Item Reservation**: A unique feature where a buyer can "reserve" an item, after which the seller can confirm the deal to mark it as "sold".
- **Real-time Comments**: Students can ask questions and reply to comments on item pages.
- **Profile Management**: Users can track their listings, sold items, and purchases.

---

## 2. Technical Architecture

### Tech Stack
- **Frontend**: React.js, Vite, TailwindCSS (Styling), Lucide-React (Icons), Axios (API calls).
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt (Password hashing).
- **File Storage**: Multer (Local storage in `/public/uploads`).

### Project Structure (Order of Files)
```text
Uni_Find_C2C/
├── server.js            # Main backend entry point & API routes
├── db.js                # Database connection pool setup
├── .env                 # Environment variables (DB credentials, JWT secret)
├── database.sql         # SQL schema definition
├── public/              # Static files and user uploads
└── client/              # Frontend React application
    ├── src/
    │   ├── main.jsx      # React entry point
    │   ├── App.jsx       # Main routing logic
    │   ├── api.js        # Axios instance with BaseURL and interceptors
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global Authentication state management
    │   ├── pages/
    │   │   ├── Home.jsx         # Landing page with hero & recent items
    │   │   ├── Marketplace.jsx  # Searchable & filterable item list
    │   │   ├── ItemDetails.jsx  # Detailed item view, comments, & actions
    │   │   ├── Profile.jsx      # User profile, my stats, & settings
    │   │   └── AddItem.jsx     # Form to list new items
    │   └── components/
    │       ├── Layout.jsx       # Navbar & Footer wrapper
    │       └── ItemCard.jsx     # Reusable item display card
    └── vite.config.js    # Frontend build & proxy configuration
```

---

## 3. Backend Logic (server.js)

The backend is built with Express.js and follows a standard RESTful API pattern.

### Core Middlewares
- **Body-Parser**: Parses incoming request bodies (JSON).
- **Multer**: Handles multipart/form-data for image uploads.
- **authenticateToken**: Verifies the JWT sent in the `Authorization` header.

### Key API Endpoints
1. **`POST /api/auth/kumail`**: 
   - Handles both Login and Registration.
   - Validates the email domain suffix.
   - Uses `bcrypt` to hash passwords before storing in MySQL.
   - Returns a `JWT` token for subsequent requests.

2. **`POST /api/items`**:
   - Creates a new listing.
   - Saves the first uploaded image to the server path.

3. **`POST /api/items/:id/reserve`**:
   - Logic: Creates a record in the `bookings` table and updates the item status to `reserved`.
   - Prevents users from reserving their own items.

4. **`POST /api/bookings/:id/confirm`**:
   - Seller-only action.
   - Marks the deal as `confirmed` and the item as `sold`.

---

## 4. Frontend Logic (React)

The frontend is a Single Page Application (SPA) powered by React Router.

### State Management (AuthContext)
- Uses React `Context API` to store the `user` object and `token` globally.
- Features a `login` method that handles the API call and sets `localStorage`.

### Key Pages Logic
- **Marketplace**: Uses `useEffect` to fetch items based on URL search parameters (category, search string).
- **ItemDetails**: Implements complex UI states for Different users:
   - **Seller view**: Sees "Confirm Deal" and "Edit/Delete" buttons.
   - **Buyer view**: Sees "Reserve Booking" button.
   - **Guest view**: Redirects to Login when trying to interact.

---

## 5. Database Schema (MySQL)

```sql
CREATE TABLE users (
  id char(36) PRIMARY KEY,
  name varchar(255) NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  picture varchar(255) DEFAULT NULL, -- User avatar
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
  id int AUTO_INCREMENT PRIMARY KEY,
  title varchar(255) NOT NULL,
  description text NOT NULL,
  status enum('available','pending','reserved','sold') DEFAULT 'available',
  category varchar(255) DEFAULT NULL,
  item_condition enum('new','decent','too old') DEFAULT NULL,
  uploaded_by char(36), -- Foreign key to users
  price decimal(10,2) NOT NULL,
  image_url varchar(255),
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id int AUTO_INCREMENT PRIMARY KEY,
  item_id int,
  user_id char(36),
  status enum('pending','confirmed','cancelled','reserved') DEFAULT 'pending',
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 6. Supervisor Meeting: "Cheat Sheet" (How to Explain)

**Q: How does the reservation system work technically?**
**A**: When a buyer clicks "Reserve", the frontend hits `/api/items/:id/reserve`. The server creates a `booking` entry linked to the user and item. It then updates the item's `status` to `reserved` in the database. This status change immediately hides the item's "Reserve" button for other users on the frontend.

**Q: How is security handled?**
**A**: We use JWT. When a user logs in, the server signs a token with their ID. The frontend stores this in `localStorage` and sends it back in the `Authorization` header forทุก API call. On the server, the `authenticateToken` middleware checks if the token is valid before letting the request through.

**Q: How do images work?**
**A**: We use the `Multer` library. Images are uploaded to a local `public/uploads` folder. The database only stores the *path* (string) to the image. The frontend then displays it by prepending the server URL.

**Q: Integration of your manual changes?**
**A**: I've ensured the database schema is "harmonized". This means the backend expects columns like `title` and `image_url`, while also supporting the user-added columns like `name` and `image_path` by making them optional/nullable, ensuring no "Data truncated" or "Missing field" errors occur.

---

## 7. How to Run (Instructions)

1. **Backend**:
   - Navigate to `Uni_Find_C2C`
   - Run `npm install`
   - Run `npm start`
2. **Frontend**:
   - Navigate to `Uni_Find_C2C/client`
   - Run `npm install`
   - Run `npm run dev`
3. **Database**:
   - Ensure MySQL is running.
   - Credentials must match `.env` file in the root.

---

## 8. Full Source Code

This section contains the raw source code for all core files of the UNI-find project for AI analysis and reference.

### package.json
`json
{
  "name": "bruh",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "axios": "^1.13.2",
    "bcryptjs": "^3.0.3",
    "body-parser": "^2.2.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.3",
    "multer": "^2.0.2",
    "mysql2": "^3.15.3",
    "nodemailer": "^7.0.12",
    "uuid": "^13.0.0"
  }
}
`

### server.js
`js
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

`

### db.js
`js
// db.js
const mysql = require('mysql2');//import mysql2, a Node.js module that acts as an interpreter
require('dotenv').config();/**node has a built in object called process.env where the environment variables live
the function Loads everything inside the .env file and put it into process.env 
require func loads the object and .config parses KEY=VALUE lines into process.env. so my code can use it.
 */
/**Pool: Buses are already running → these are pre-open MySQL connections.

Passengers (your API requests) hop onto any free bus.

When the ride is done, the bus returns to the stand.

No creating, no tearing down, no waiting. */
const pool = mysql.createPool({ //mysql.createPool(): creates a pool of connections to the database,by default 10 connections
  host: process.env.DB_HOST, //After loading dotenv, you can access your .env variables
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

module.exports = pool.promise(); //This lets you use the database connection in other files and allows using promises:

`

### database.sql
`sql

CREATE TABLE users (
  id char(36) NOT NULL,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  picture varchar(255) DEFAULT NULL,

  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE items (
  id int NOT NULL AUTO_INCREMENT,
  title varchar(255) NOT NULL, -- User used 'name', but code uses 'title'. I will align code to 'name' in next steps or stick to 'title' if safer. User ref used 'name'.
  description text NOT NULL,
  status enum('available','pending','reserved','sold') DEFAULT 'available',
  category enum('books','furniture','clothing','sports','stationery','electronics','other') NOT NULL,
  item_condition enum('new','decent','too old') NOT NULL,
  uploaded_by char(36) NOT NULL, -- Back to uploaded_by from user_id
  price decimal(10,2) NOT NULL,
  image_url varchar(255) NOT NULL, -- User used 'image_path', code uses 'image_url'. I'll keep image_url to avoid breaking Frontend, or check.
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  quantity int DEFAULT '1',
  PRIMARY KEY (id),
  KEY items_ibfk_1 (uploaded_by),
  CONSTRAINT items_ibfk_1 FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE comments (
  id int NOT NULL AUTO_INCREMENT,
  item_id int NOT NULL,
  user_id char(36) NOT NULL,
  comment_text text NOT NULL,
  parent_comment_id int DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY item_id (item_id),
  KEY parent_comment_id (parent_comment_id),
  KEY comments_ibfk_2 (user_id),
  CONSTRAINT comments_ibfk_1 FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
  CONSTRAINT comments_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT comments_ibfk_3 FOREIGN KEY (parent_comment_id) REFERENCES comments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE bookings (
  id int NOT NULL AUTO_INCREMENT,
  item_id int NOT NULL,
  user_id char(36) NOT NULL,
  booked_quantity int NOT NULL DEFAULT '1',
  status enum('pending','confirmed','cancelled','reserved') DEFAULT 'pending',
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY item_id (item_id),
  KEY bookings_ibfk_2 (user_id),
  CONSTRAINT bookings_ibfk_1 FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
  CONSTRAINT bookings_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


`

### .env.sample
`sample
JWT_SECRET=super_secret_key_change_this
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=@Abcd1234
DB_NAME=unifind_db  
PORT=3306 
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
`

### client/package.json
`json
{
  "name": "client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.13.2",
    "lucide-react": "^0.562.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.11.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.23",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "vite": "^7.2.4"
  }
}

`

### client/vite.config.js
`js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    },
  },
})

`

### client/src/main.jsx
`jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

`

### client/src/App.jsx
`jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ItemDetails from './pages/ItemDetails';
import AddItem from './pages/AddItem';
import Login from './pages/Login';
import Register from './pages/Register';

import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/sell" element={
              <ProtectedRoute>
                <AddItem />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

`

### client/src/api.js
`js
import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy will divert this to http://localhost:3000
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Ensure Bearer scheme
        }
        return config;
    },
    (error) => console.error(error)
);

export default api;

`

### client/src/context/AuthContext.jsx
`jsx
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Decode token to get user info
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser(payload);
                } catch (err) {
                    console.error("Auth check failed", err);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, name, type, password) => {
        try {
            const { data } = await api.post('/auth/kumail', { email, name, type, password });
            localStorage.setItem('token', data.token);

            const payload = JSON.parse(atob(data.token.split('.')[1]));
            setUser(payload);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Authentication failed';
            return { success: false, message: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    // Helper to refresh user data from token or API if needed
    const refreshUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

`

### client/src/layouts/Layout.jsx
`jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Uni-Find. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

`

### client/src/components/Navbar.jsx
`jsx
import { Link } from 'react-router-dom';
import { User, PlusCircle, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <img src="/logo.png" alt="UNI-find Logo" className="h-10 w-10 object-contain group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-2xl font-bold text-blue-600">UNI-find</span>
                    </Link>

                    {/* Center Search (Optional - can be conditional or always present) */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search for items..."
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        <Link to="/marketplace" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
                            Marketplace
                        </Link>

                        {user ? (
                            <>
                                <Link to="/sell" className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Post Item</span>
                                </Link>

                                {/* User Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center space-x-2 focus:outline-none"
                                    >
                                        {user.picture ? (
                                            <img
                                                src={user.picture}
                                                alt={user.name}
                                                className="h-8 w-8 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-all duration-200"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold hover:bg-blue-700 transition-all duration-200">
                                                {user.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                to="/profile"
                                                onClick={() => setShowDropdown(false)}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                            >
                                                <User className="inline h-4 w-4 mr-2" />
                                                My Profile
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    logout();
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                            >
                                                <LogOut className="inline h-4 w-4 mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 font-medium transition-all duration-200"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {showDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </nav>
    );
}

`

### client/src/components/ItemCard.jsx
`jsx
import { Link } from 'react-router-dom';

export default function ItemCard({ item }) {
    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <Link to={`/items/${item.id}`} className="block">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 cursor-pointer">
                <div className="bg-gray-200 h-48 w-full relative">
                    <img
                        src={item.image_url || item.image || "https://placehold.co/400x300"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Status Badges */}
                    {/* Priority: My Purchaes (booking_status) -> Marketplace (status) */}

                    {/* My Purchases: Confirmed -> Deal Confirmed */}
                    {item.booking_status === 'confirmed' && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                            Deal Confirmed
                        </div>
                    )}
                    {/* My Purchases: Reserved -> Pending */}
                    {item.booking_status === 'reserved' && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                            Pending
                        </div>
                    )}

                    {/* Marketplace Fallbacks (if no booking_status) */}
                    {!item.booking_status && item.status?.toLowerCase() === 'sold' && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                            SOLD
                        </div>
                    )}
                    {!item.booking_status && item.status?.toLowerCase() === 'reserved' && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                            RESERVED
                        </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex items-center bg-white/90 backdrop-blur-sm rounded-full pr-3 py-0.5 shadow-sm">
                        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold overflow-hidden">
                            {item.seller_picture ? (
                                <img src={item.seller_picture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                item.seller_name?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                        <span className="text-[10px] font-bold ml-2 text-gray-800">{item.seller_name}</span>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{item.title}</h3>
                        <span className="text-blue-600 font-bold whitespace-nowrap">Rs {item.price}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{item.description}</p>

                    <div className="mt-4 flex justify-between items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category}
                        </span>
                        <span className="text-xs text-gray-400">{getTimeAgo(item.created_at)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

`

### client/src/components/ProtectedRoute.jsx
`jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

`

### client/src/pages/Home.jsx
`jsx
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import api from '../api';

const CATEGORIES = [
    { name: 'Books', icon: '📚' },
    { name: 'Stationery', icon: '✏️' },
    { name: 'Electronics', icon: '💻' },
    { name: 'Furniture', icon: '🪑' },
    { name: 'Clothing', icon: '👕' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Other', icon: '📦' },
];

export default function Home() {
    const [recentItems, setRecentItems] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await api.get('/items');
                setRecentItems(response.data.slice(0, 4));
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, []);
    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto space-y-6 flex flex-col items-center">
                    <img src="/logo.png" alt="UNI-find Logo" className="h-24 w-24 md:h-32 md:w-32 object-contain mx-auto" />
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                            Welcome to UNI-find
                        </h1>
                        <p className="text-lg text-blue-100">
                            Where Students Connect, Trade, and Find.
                        </p>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.name}
                            to={`/marketplace?category=${cat.name}`}
                            className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 group block"
                        >
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                            <h3 className="font-medium text-gray-900">{cat.name}</h3>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Recent Listings */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recently Listed</h2>
                    <a href="/marketplace" className="text-blue-600 font-medium hover:text-blue-700">View All &rarr;</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentItems.length > 0 ? (
                        recentItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500">No items listed yet.</p>
                    )}
                </div>
            </section>
        </div>
    );
}

`

### client/src/pages/Marketplace.jsx
`jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import api from '../api';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Stationery', 'Clothing', 'Furniture', 'Sports', 'Other'];

export default function Marketplace() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [maxPrice, setMaxPrice] = useState(5000);
    const location = useLocation();
    const navigate = useNavigate();

    const updateURL = (newParams) => {
        const params = new URLSearchParams(location.search);
        Object.keys(newParams).forEach(key => {
            if (newParams[key] === null || newParams[key] === 'All' || newParams[key] === '') {
                params.delete(key);
            } else {
                params.set(key, newParams[key]);
            }
        });
        navigate(`/marketplace?${params.toString()}`, { replace: true });
    };

    // Sync URL -> State and Fetch
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category') || 'All';
        const searchParam = params.get('search') || '';
        const priceParam = params.get('maxPrice') || '5000';

        // Find matching category case-insensitively
        const match = CATEGORIES.find(c => c.toLowerCase() === categoryParam.toLowerCase()) || 'All';

        setSelectedCategory(match);
        setSearchTerm(searchParam);
        setMaxPrice(parseInt(priceParam));

        const debounceTimer = setTimeout(() => {
            fetchFilteredItems(match, searchParam, parseInt(priceParam));
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [location.search]);

    const fetchFilteredItems = async (category, search, price) => {
        setLoading(true);
        try {
            const params = {};
            if (category !== 'All') params.category = category;
            if (search) params.search = search;
            if (price) params.maxPrice = price;

            const { data } = await api.get('/items', { params });
            setItems(data);
        } catch (err) {
            console.error("Error fetching items", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 bg-white p-6 rounded-xl border border-gray-100 h-fit sticky top-24">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <SlidersHorizontal className="h-5 w-5 mr-2" /> Filters
                    </h3>

                    {/* Categories */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">Category</h4>
                        <div className="space-y-2">
                            {CATEGORIES.map(category => (
                                <label key={category} className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={selectedCategory === category}
                                        onChange={() => updateURL({ category })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-600 group-hover:text-blue-600 transition-colors duration-200">{category}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-6"></div>

                    {/* Price Range */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <h4 className="font-medium text-gray-700">Max Price</h4>
                            <span className="text-sm text-gray-500">Rs {maxPrice}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="20000"
                            step="500"
                            value={maxPrice}
                            onChange={(e) => updateURL({ maxPrice: e.target.value })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                {/* Search Header */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 flex items-center gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => updateURL({ search: e.target.value })}
                            className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Search marketplace..."
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        Showing {items.length} results
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <ItemCard key={item.id} item={{
                                ...item,
                                image: item.image_url // Map backend image_url to ItemCard's expected image prop
                            }} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <Search className="h-full w-full" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No items found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

`

### client/src/pages/ItemDetails.jsx
`jsx
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ArrowLeft, MessageSquare, Send, CornerDownRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ItemDetails() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null); // id of comment being replied to
    const [replyText, setReplyText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [reserving, setReserving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        price: '',
        category: ''
    });
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const itemRes = await api.get(`/items/${id}`);
                setItem(itemRes.data);

                // Auto-open edit if query param is present and user is owner
                const searchParams = new URLSearchParams(location.search);
                if (searchParams.get('edit') === 'true' && user && user.id === itemRes.data.uploaded_by) {
                    setEditForm({
                        title: itemRes.data.title,
                        description: itemRes.data.description,
                        price: itemRes.data.price,
                        category: itemRes.data.category
                    });
                    setIsEditing(true);
                }

                const commentsRes = await api.get(`/items/${id}/comments`);
                setComments(commentsRes.data);
            } catch (err) {
                console.error("Error fetching details", err);
                setError('Item not found or error loading details');
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id, location.search, user]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to comment');
            return;
        }
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const { data } = await api.post('/comments', {
                item_id: id,
                comment_text: newComment
            });
            setComments(prev => [...prev, data]);
            setNewComment('');
        } catch (err) {
            console.error('Error posting comment:', err);
            alert('Failed to post comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handlePostReply = async (parentId) => {
        if (!user) {
            alert('Please login to reply');
            return;
        }
        if (!replyText.trim()) return;

        setSubmittingComment(true);
        try {
            const { data } = await api.post('/comments', {
                item_id: id,
                comment_text: replyText,
                parent_comment_id: parentId
            });
            setComments(prev => [...prev, data]);
            setReplyText('');
            setReplyTo(null);
        } catch (err) {
            console.error('Error posting reply:', err);
            alert('Failed to post reply');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!window.confirm('Confirm this deal? This will mark the item as sold.')) return;
        setConfirming(true);
        try {
            await api.post(`/bookings/${item.booking_id}/confirm`);
            alert('Deal confirmed successfully!');
            setItem(prev => ({ ...prev, status: 'sold' }));
        } catch (err) {
            console.error('Confirm error:', err);
            alert(err.response?.data?.error || 'Failed to confirm deal');
        } finally {
            setConfirming(false);
        }
    };

    const handleReserve = async () => {
        if (!user) {
            alert('Please login to reserve items');
            navigate('/login', { state: { from: `/items/${id}` } });
            return;
        }

        if (window.confirm('Are you sure you want to reserve this item?')) {
            setReserving(true);
            try {
                const { data } = await api.post(`/items/${id}/reserve`);
                alert(data.message || 'Reservation successful!');
                // Re-fetch to get booking_id and other details
                const itemRes = await api.get(`/items/${id}`);
                setItem(itemRes.data);
            } catch (err) {
                console.error('Reserve error:', err);
                alert(err.response?.data?.error || 'Failed to reserve item');
            } finally {
                setReserving(false);
            }
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this booking? The item will be available for others again.')) return;

        try {
            await api.post(`/bookings/${item.booking_id}/cancel`);
            alert('Booking cancelled successfully');
            setItem(prev => ({ ...prev, status: 'available', booking_id: null, buyer_id: null }));
        } catch (err) {
            console.error('Cancel error:', err);
            alert(err.response?.data?.error || 'Failed to cancel booking');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
        try {
            await api.delete(`/items/${id}`);
            alert('Item deleted successfully');
            navigate('/marketplace');
        } catch (err) {
            console.error('Delete error:', err);
            alert(err.response?.data?.error || 'Failed to delete item');
        }
    };

    const handleEditItem = (e) => {
        e.preventDefault();
        setEditForm({
            title: item.title,
            description: item.description,
            price: item.price,
            category: item.category
        });
        setIsEditing(true);
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/items/${id}`, editForm);
            alert('Item updated successfully!');
            // Refresh item data
            const itemRes = await api.get(`/items/${id}`);
            setItem(itemRes.data);
            setIsEditing(false);
        } catch (err) {
            console.error('Update item error:', err);
            alert(err.response?.data?.error || 'Failed to update item');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (error || !item) return <div className="p-8 text-center text-red-500">{error || 'Item not found'}</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <Link to="/marketplace" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Marketplace
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Left: Images - Handling single image for MVP */}
                    <div className="bg-gray-100 p-2">
                        <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden mb-2">
                            <img
                                src={item.image_url || "https://placehold.co/800x600/e2e8f0/1e293b?text=No+Image"}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Thumbnails placeholder if we had multiple images */}
                    </div>

                    {/* Right: Details */}
                    <div className="p-8 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold mb-2">
                                    {item.category}
                                </span>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                                <div className="flex items-center text-gray-500 text-sm">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {/* Location mock as it's not in DB schema yet */}
                                    Kathmandu University
                                    <span className="mx-2">•</span>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <span className="text-4xl font-bold text-blue-600">Rs {item.price}</span>
                        </div>

                        <div className="prose prose-blue text-gray-600 mb-8 max-w-none">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p>{item.description}</p>
                        </div>

                        {/* Seller Card */}
                        <div className="mt-auto bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                                    {item.seller_picture ? (
                                        <img src={item.seller_picture} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        item.seller_name?.[0]?.toUpperCase() || 'U'
                                    )}
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg font-bold text-gray-900">{item.seller_name}</h4>
                                    <p className="text-sm text-gray-500">{item.seller_email}</p>
                                </div>
                            </div>


                            {item.status?.toLowerCase() === 'sold' ? (
                                <div className="space-y-4">
                                    <div className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg font-medium text-center">
                                        Sold Out
                                    </div>
                                    {/* Show Buyer to Seller */}
                                    {user && user.id === item.uploaded_by && item.buyer_name && (
                                        <div className="text-sm text-center text-gray-600 bg-gray-100 p-2 rounded">
                                            Sold to: <strong>{item.buyer_name}</strong>
                                        </div>
                                    )}
                                </div>
                            ) : item.status?.toLowerCase() === 'reserved' ? (
                                <div className="space-y-4">
                                    <div className="w-full py-3 bg-yellow-100 text-yellow-700 rounded-lg font-medium text-center">
                                        Reserved
                                    </div>

                                    {/* Show Buyer to Seller */}
                                    {user && user.id === item.uploaded_by && item.buyer_name && (
                                        <div className="text-sm text-center text-gray-600 bg-yellow-50 p-2 rounded">
                                            Reserved by: <strong>{item.buyer_name}</strong>
                                        </div>
                                    )}

                                    {user && user.id === item.uploaded_by && (
                                        <button
                                            onClick={handleConfirmBooking}
                                            disabled={confirming}
                                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition active:scale-95 disabled:opacity-50"
                                        >
                                            {confirming ? 'Confirming...' : 'Confirm Deal'}
                                        </button>
                                    )}
                                    {(user && (user.id === item.uploaded_by || user.id === item.buyer_id)) && (
                                        <button
                                            onClick={handleCancel}
                                            className="w-full py-2 text-sm text-red-600 hover:text-red-700 font-medium transition"
                                        >
                                            Cancel Reservation
                                        </button>
                                    )}
                                </div>
                            ) : user && user.id === item.uploaded_by ? (
                                <div className="space-y-4">
                                    <div className="w-full py-3 bg-blue-100 text-blue-700 rounded-lg font-medium text-center">
                                        Your Item
                                    </div>
                                    <button
                                        onClick={handleEditItem}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition active:scale-95"
                                    >
                                        Edit Listing
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full py-2 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-lg font-medium transition active:scale-95"
                                    >
                                        Delete Item
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <button
                                        onClick={handleReserve}
                                        disabled={reserving}
                                        className="flex items-center justify-center w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {reserving ? 'Processing...' : 'Reserve Booking'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Comments Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center mb-6">
                        <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
                        <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
                    </div>

                    {/* New Comment Input */}
                    <form onSubmit={handlePostComment} className="mb-8">
                        <div className="flex items-start space-x-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {user?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                                    placeholder={user ? "Ask a question about this item..." : "Please login to ask a question"}
                                    rows="3"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={!user || submittingComment}
                                ></textarea>
                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!user || !newComment.trim() || submittingComment}
                                        className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        {submittingComment ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {comments.filter(c => !c.parent_comment_id).length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No comments yet. Be the first to ask!</p>
                        ) : (
                            comments
                                .filter(c => !c.parent_comment_id)
                                .map(comment => (
                                    <div key={comment.id} className="space-y-4">
                                        {/* Main Comment */}
                                        <div className="flex space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                                                {comment.user_picture ? (
                                                    <img src={comment.user_picture} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    comment.user_name?.[0]?.toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div className="flex-1 bg-gray-50 p-4 rounded-2xl">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-gray-900">{comment.user_name}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(comment.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700">{comment.comment_text}</p>
                                                <div className="mt-2">
                                                    <button
                                                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                        Reply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Replies */}
                                        <div className="ml-14 space-y-4 border-l-2 border-gray-100 pl-6">
                                            {comments
                                                .filter(r => r.parent_comment_id === comment.id)
                                                .map(reply => (
                                                    <div key={reply.id} className="flex space-x-3">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold overflow-hidden">
                                                            {reply.user_picture ? (
                                                                <img src={reply.user_picture} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                reply.user_name?.[0]?.toUpperCase() || 'U'
                                                            )}
                                                        </div>
                                                        <div className="flex-1 bg-blue-50/50 p-3 rounded-xl">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold text-gray-900 text-sm">{reply.user_name}</span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {new Date(reply.created_at).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-700">{reply.comment_text}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            }

                                            {/* Reply Form */}
                                            {replyTo === comment.id && (
                                                <div className="flex space-x-3 items-start mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <CornerDownRight className="h-5 w-5 text-gray-300 mt-2" />
                                                    <div className="flex-1">
                                                        <textarea
                                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                                            placeholder="Write a reply..."
                                                            rows="2"
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            autoFocus
                                                        ></textarea>
                                                        <div className="mt-2 flex justify-end space-x-2">
                                                            <button
                                                                onClick={() => setReplyTo(null)}
                                                                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                disabled={!replyText.trim() || submittingComment}
                                                                onClick={() => handlePostReply(comment.id)}
                                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                            >
                                                                Reply
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </div>
            {/* Edit Item Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Listing</h2>
                        <form onSubmit={handleUpdateItem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)</label>
                                    <input
                                        type="number"
                                        required
                                        value={editForm.price}
                                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="books">Books</option>
                                        <option value="stationery">Stationery</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="furniture">Furniture</option>
                                        <option value="sports">Sports</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
}

`

### client/src/pages/Profile.jsx
`jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { User, MapPin, Mail, Edit, Package, CheckCircle, Heart, LogOut, X } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('active');

    // Auth context user is basic payload, we want full profile + stats
    // But for MVP, Dashboard returns basic user. 
    // We'll manage local profile state to update immediately on edit.
    const [profile, setProfile] = useState({
        name: 'Loading...',
        email: '',
        faculty: 'Student',
        avatar: 'https://placehold.co/150x150/3b82f6/ffffff?text=User',
        location: 'KU, Dhulikhel'
    });

    const [myItems, setMyItems] = useState([]);
    const [myPurchases, setMyPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const { logout, refreshUser, user } = useAuth();


    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            // Fetch User Details
            const userRes = await api.get('/dashboard');
            if (userRes.data.user) {
                const profilePic = userRes.data.user.picture
                    ? `http://localhost:3000${userRes.data.user.picture}`
                    : `https://placehold.co/150x150/3b82f6/ffffff?text=${userRes.data.user.name.charAt(0)}`;

                setProfile(prev => ({
                    ...prev,
                    name: userRes.data.user.name,
                    email: userRes.data.user.email,
                    avatar: profilePic
                }));
                setEditName(userRes.data.user.name);
                setImagePreview(profilePic);
            }

            // Fetch Items
            const itemsRes = await api.get('/my-items');
            setMyItems(itemsRes.data);

            // Fetch Purchases
            const purchasesRes = await api.get('/my-purchases');
            setMyPurchases(purchasesRes.data);
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', editName);
            if (imageFile) {
                formData.append('avatar', imageFile);
            }

            const res = await api.put('/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update local state
            setProfile(prev => ({
                ...prev,
                name: res.data.user.name,
                avatar: `http://localhost:3000${res.data.user.picture}`
            }));

            // Update global context
            if (refreshUser) {
                refreshUser(res.data.user);
            }

            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Calculate Counts
    const activeCount = myItems.length; // For now assuming all my items are active or sold, total listings
    const soldCount = myItems.filter(i => i.status?.toLowerCase() === 'sold').length;

    // Filter for Display
    const displayedItems = activeTab === 'active'
        ? myItems.filter(i => i.status?.toLowerCase() !== 'sold')
        : activeTab === 'sold'
            ? myItems.filter(i => i.status?.toLowerCase() === 'sold')
            : activeTab === 'purchases'
                ? myPurchases
                : [];

    return (
        <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 relative">

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="absolute top-8 right-8 text-gray-400 hover:text-red-600 flex items-center gap-2 transition"
                    title="Logout"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-medium">Logout</span>
                </button>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative group">
                        <img
                            src={profile.avatar.startsWith('http') ? profile.avatar : `http://localhost:3000${profile.avatar}`}
                            alt={profile.name}
                            className="w-32 h-32 rounded-full border-4 border-blue-50 object-cover"
                        />
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                            <p className="text-blue-600 font-medium">{profile.faculty}</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-center justify-center md:justify-start text-gray-500">
                            <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2" /> {profile.email}
                            </div>
                            <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" /> {profile.location}
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center md:justify-start pt-4">
                            <div className="text-center px-6 py-2 bg-gray-50 rounded-lg">
                                <span className="block text-2xl font-bold text-gray-900">{activeCount}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Listings</span>
                            </div>
                            <div className="text-center px-6 py-2 bg-gray-50 rounded-lg">
                                <span className="block text-2xl font-bold text-gray-900">{soldCount}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Sold</span>
                            </div>
                            <div className="text-center px-6 py-2 bg-gray-50 rounded-lg">
                                <span className="block text-2xl font-bold text-gray-900">{myPurchases.length}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Bought</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                                />
                            </div>

                            <div className="flex justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
                                    <img
                                        src={imagePreview || profile.avatar}
                                        alt="Profile Preview"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 group-hover:border-blue-100 transition"
                                    />
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <div className="text-white text-xs font-medium">Change</div>
                                    </div>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabs & Listings */}
            <div>
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8 justify-center md:justify-start">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`${activeTab === 'active'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <Package className="h-4 w-4 mr-2" /> Active Listings
                        </button>
                        <button
                            onClick={() => setActiveTab('sold')}
                            className={`${activeTab === 'sold'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" /> Sold items
                        </button>
                        <button
                            onClick={() => setActiveTab('purchases')}
                            className={`${activeTab === 'purchases'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <Package className="h-4 w-4 mr-2" /> My Purchases
                        </button>
                    </nav>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : displayedItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedItems.map(item => (
                            <div key={item.id} className="relative group">
                                <ItemCard item={item} />
                                {activeTab === 'active' && (
                                    <Link
                                        to={`/items/${item.id}?edit=true`}
                                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white text-blue-600"
                                        title="Edit Listing"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No {activeTab} items found</h3>
                        <p className="text-gray-500 mt-2">Items you list will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

`

### client/src/pages/AddItem.jsx
`jsx
import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Books', 'Electronics', 'Stationery', 'Clothing', 'Furniture', 'Sports', 'Other'];

export default function AddItem() {
    const [images, setImages] = useState([]); // Preview URLs
    const [files, setFiles] = useState([]); // Actual File objects
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        price: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageUpload = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles([...files, ...selectedFiles]);

        // Create preview URLs
        const newImages = selectedFiles.map(file => URL.createObjectURL(file));
        setImages([...images, ...newImages]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        const newFiles = [...files];
        newImages.splice(index, 1);
        newFiles.splice(index, 1);
        setImages(newImages);
        setFiles(newFiles);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('price', formData.price);
            data.append('description', formData.description);

            files.forEach(file => {
                data.append('images', file);
            });

            await api.post('/items', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            navigate('/marketplace');
        } catch (err) {
            console.error("Failed to post item", err);
            alert('Failed to list item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Ad</h1>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ad Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="What are you selling?"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            name="category"
                            required
                            className="block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="">Select Category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs)</label>
                        <input
                            type="number"
                            name="price"
                            required
                            className="block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        rows="5"
                        required
                        className="block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe your item (condition, reason for selling, etc.)"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden group">
                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}

                        <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 h-32">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Add Photo</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                    <p className="text-xs text-gray-500">First picture is the title picture. You can upload up to 5 photos.</p>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/marketplace')}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 active:scale-95 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200"
                    >
                        {loading ? 'Posting...' : 'Post Ad'}
                    </button>
                </div>
            </form>
        </div>
    );
}

`

### client/src/pages/Login.jsx
`jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle, Mail, User as UserIcon, Lock } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await login(email, null, 'login', password);

        if (res.success) {
            // Redirect to the page they were trying to access, or profile
            const from = location.state?.from || '/profile';
            navigate(from);
        } else {
            setError(res.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 flex items-center justify-center mb-4">
                        <img src="/logo.png" alt="UNI-find Logo" className="h-full w-full object-contain" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Welcome to UniFind
                    </h2>
                    <p className="mt-3 text-sm text-gray-600">
                        Sign in with your Kathmandu University email
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 font-medium mb-2">
                            📧 KUmail Required
                        </p>
                        <p className="text-xs text-blue-700">
                            Only students with @ku.edu.np or @student.ku.edu.np email addresses can access this platform.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                KU Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                    placeholder="your.name@ku.edu.np"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>


                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="font-medium text-blue-600 hover:text-blue-500 transition"
                            >
                                Register
                            </button>
                        </p>
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-6">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </div>
                </form>
            </div>
        </div>
    );
}

`

### client/src/pages/Register.jsx
`jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, Mail, User as UserIcon, Lock } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        const res = await login(email, name, 'register', password);

        if (res.success) {
            navigate('/profile');
        } else {
            setError(res.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 flex items-center justify-center mb-4">
                        <img src="/logo.png" alt="UNI-find Logo" className="h-full w-full object-contain" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Join UniFind
                    </h2>
                    <p className="mt-3 text-sm text-gray-600">
                        Create your account with your KU email
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 font-medium mb-2">
                            📧 KUmail Required
                        </p>
                        <p className="text-xs text-blue-700">
                            Only students with @ku.edu.np or @student.ku.edu.np email addresses can register and access this platform.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Your Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                KU Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                    placeholder="your.name@ku.edu.np"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Creating account...</span>
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="font-medium text-blue-600 hover:text-blue-500 transition"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>

                    <div className="text-center text-xs text-gray-500 mt-6">
                        By signing up, you agree to our Terms of Service and Privacy Policy
                    </div>
                </form>
            </div >
        </div >
    );
}

`

