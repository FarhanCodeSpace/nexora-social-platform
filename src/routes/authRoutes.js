const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbAsync } = require('../db/database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register New User
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, full_name, bio, avatar_url } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ error: 'Please provide username, email, password, and full name.' });
    }

    // Check if user or email already exists
    const existingUser = await dbAsync.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username.toLowerCase().trim(), email.toLowerCase().trim()]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already taken.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const defaultAvatar = avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
    const defaultCover = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';

    const result = await dbAsync.run(
      `INSERT INTO users (username, email, password_hash, full_name, bio, avatar_url, cover_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username.toLowerCase().trim(), email.toLowerCase().trim(), password_hash, full_name.trim(), bio || '', defaultAvatar, defaultCover]
    );

    const newUser = await dbAsync.get(
      'SELECT id, username, email, full_name, bio, avatar_url, cover_url, location, website, created_at FROM users WHERE id = ?',
      [result.lastID]
    );

    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body; // login can be email or username

    if (!login || !password) {
      return res.status(400).json({ error: 'Please enter your username/email and password.' });
    }

    const user = await dbAsync.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [login.toLowerCase().trim(), login.toLowerCase().trim()]
    );

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    const { password_hash, ...userProfile } = user;

    res.json({
      message: 'Logged in successfully!',
      token,
      user: userProfile
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Get Current Logged-in User
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbAsync.get(
      `SELECT u.id, u.username, u.email, u.full_name, u.bio, u.avatar_url, u.cover_url, u.location, u.website, u.created_at,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count
       FROM users u WHERE u.id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Fetch Me Error:', err);
    res.status(500).json({ error: 'Failed to fetch user data.' });
  }
});

// Update Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { full_name, bio, location, website, avatar_url, cover_url } = req.body;

    await dbAsync.run(
      `UPDATE users SET 
        full_name = COALESCE(?, full_name),
        bio = COALESCE(?, bio),
        location = COALESCE(?, location),
        website = COALESCE(?, website),
        avatar_url = COALESCE(?, avatar_url),
        cover_url = COALESCE(?, cover_url)
       WHERE id = ?`,
      [full_name, bio, location, website, avatar_url, cover_url, req.user.id]
    );

    const updatedUser = await dbAsync.get(
      'SELECT id, username, email, full_name, bio, avatar_url, cover_url, location, website, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Profile updated successfully!', user: updatedUser });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
