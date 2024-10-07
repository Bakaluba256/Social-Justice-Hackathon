const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',     
    user: 'root',          
    password: '',   //insert the MySQL password       
    database: 'voice_up'   
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// ===============================
// ROUTES FOR USER REGISTRATION AND LOGIN
// ===============================

// User Registration Route
app.post('/api/register', 
    [
        body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Check if the username already exists
        const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
        db.query(checkUserQuery, [username], (err, results) => {
            if (err) return res.status(500).json({ error: 'Database query error' });
            if (results.length > 0) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Hash the password
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) return res.status(500).json({ error: 'Password hashing error' });

                // Insert the new user into the database
                const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
                db.query(insertUserQuery, [username, hashedPassword], (err, results) => {
                    if (err) return res.status(500).json({ error: 'Database insert error' });
                    res.status(201).json({ message: 'User registered successfully' });
                });
            });
        });
    }
);

// User Login Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the username exists
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query error' });
        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        // Compare the provided password with the stored hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: 'Password comparison error' });

            if (isMatch) {
                // Generate JWT token
                const token = jwt.sign(
                    { id: user.id, username: user.username },
                    'your_jwt_secret', // Use a strong secret key in production
                    { expiresIn: '1h' }
                );
                res.json({ token });
            } else {
                res.status(400).json({ message: 'Invalid username or password' });
            }
        });
    });
});

// ===============================
// JWT AUTHENTICATION MIDDLEWARE
// ===============================

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Token is required' });

    jwt.verify(token.split(' ')[1], 'your_jwt_secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// ===============================
// ROUTES FOR ISSUES SUBMISSION AND RETRIEVAL
// ===============================

// Route to handle issue submissions (Requires JWT authentication)
// Route to handle issue submissions
app.post('/api/issues', (req, res) => {
    const { title, description, anonymous } = req.body;

    // Check if required fields are present
    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
    }

    const crmNumber = 'CRM-' + Math.floor(Math.random() * 100000); // Generate CRM number

    // Insert the new issue into the MySQL database
    const query = `INSERT INTO issues (title, description, anonymous, crmNumber) VALUES (?, ?, ?, ?)`;
    db.query(query, [title, description, anonymous, crmNumber], (err, results) => {
        if (err) {
            console.error('Error occurred while submitting the issue:', err); // Log the error to the console
            return res.status(500).json({ error: "Failed to submit the issue" });
        }
        res.status(201).json({ message: "Issue submitted successfully", crmNumber });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        // Compare the hashed password with the provided password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
                // Generate JWT token
                const token = jwt.sign(
                    { id: user.id, username: user.username, role: user.role },
                    'your_jwt_secret',
                    { expiresIn: '1h' }
                );

                // Send back the token and username
                res.json({ token, username: user.username });
            } else {
                res.status(400).json({ message: 'Invalid username or password' });
            }
        });
    });
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});



// Route to retrieve all issues
app.get('/api/issues', (req, res) => {
    const query = `SELECT * FROM issues`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch issues" });
        res.json(results);
    });
});

// ===============================
// START SERVER
// ===============================

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
