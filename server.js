const jwt = require('jsonwebtoken');
const JWT_SECRET = 'super_secret_key_change_this';
const express = require('express'); //import express framework
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const db = require('./db'); //A module is just a file that returns a value.

const app = express(); //express creates a server object that listens to HTTP requests. 
//.use means to Register this function so I can run it on every request
app.use(bodyParser.json()); //middleware:parses json
//checks Content-Type: application/json and parses JSON string body into a JS object. 
//It then sets req.body = { name, email, password }. Without it, req.body would be undefined.
app.use(bodyParser.urlencoded({ extended: true }));//decodes html form submissions and parses the data
//extended:true allows for rich(nested) objects and arrays to be encoded into the URL-encoded format, allowing for a JSON-like experience with URL-encoded.
  
const PORT = process.env.PORT || 3000;
app.use(express.static('public')); //static files in public folder dont change per user
//**A route = a specific address + action on your server
// Address → /, /login, /items/5, /messages
// Method → GET, POST, PUT, DELETE */
// Test route
app.get('/', (req, res) => { // / is the root route
  res.send('Server is running!');
});

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

// Register route
app.post('/register', async (req, res) => { //res and req are objects
  try {
    const { name, email, password } = req.body;//object destructuring 
    //db.execute returns [rows, metadata] we dont care bout metadata
    //[email] → wraps it in an array because db.execute needs an array of query parameters.
    const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);//[email] makes an array with the variable email inside it
    //db.execute returns an array
    // which then Takes the first element of the array (rows) and assign it to the variable existing.
    if (existing.length > 0) { //existing is an array of rows returned from the database query.
      return res.status(400).send('Email already registered!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);//await pauses the function until the password is hashed.
    await db.execute( //.execute returns a Promise that resolves to an array containing the results and fields
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    res.send('User registered!'); //sends a response back to the client
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    /**email = req.body.email
     password = req.body.password
 */
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).send('User not found');

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send('Incorrect password');

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});

app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
