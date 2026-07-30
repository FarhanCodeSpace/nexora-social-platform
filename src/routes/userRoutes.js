const express = require('express');
const { dbAsync } = require('../db/database');
const { authenticateToken, optionalAuthenticateToken } = require('../middleware/auth');

const router = express.Router();

// Search Users by username, full_name, or bio
router.get('/search', optionalAuthenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({ users: [] });
    }

    const currentUserId = req.user ? req.user.id : 0;
    const searchParam = `%${q.trim()}%`;

    const users = await dbAsync.all(
      `SELECT u.id, u.username, u.full_name, u.avatar_url, u.bio,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
              (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_count,
              EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
       FROM users u
       WHERE (u.username LIKE ? OR u.full_name LIKE ? OR u.bio LIKE ?)
         AND u.id != ?
       ORDER BY followers_count DESC
       LIMIT 8`,
      [currentUserId, searchParam, searchParam, searchParam, currentUserId]
    );

    res.json({
      users: users.map(u => ({ ...u, is_following: Boolean(u.is_following) }))
    });
  } catch (err) {
    console.error('Search Users Error:', err);
    res.status(500).json({ error: 'Failed to search users.' });
  }
});

// Get Suggested Accounts to Follow
router.get('/suggested', optionalAuthenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : 0;

    const users = await dbAsync.all(
      `SELECT u.id, u.username, u.full_name, u.avatar_url, u.bio,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
              EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
       FROM users u
       WHERE u.id != ?
       ORDER BY followers_count DESC, RANDOM()
       LIMIT 5`,
      [currentUserId, currentUserId]
    );

    const formattedUsers = users.map(user => ({
      ...user,
      is_following: Boolean(user.is_following)
    }));

    res.json({ users: formattedUsers });
  } catch (err) {
    console.error('Fetch Suggested Users Error:', err);
    res.status(500).json({ error: 'Failed to fetch user suggestions.' });
  }
});

// Get User Profile by Username
router.get('/:username', optionalAuthenticateToken, async (req, res) => {
  try {
    const username = req.params.username.toLowerCase().trim();
    const currentUserId = req.user ? req.user.id : 0;

    const user = await dbAsync.get(
      `SELECT u.id, u.username, u.full_name, u.bio, u.avatar_url, u.cover_url, u.location, u.website, u.created_at,
              (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_count,
              (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
              EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
       FROM users u
       WHERE u.username = ?`,
      [currentUserId, username]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        ...user,
        is_following: Boolean(user.is_following),
        is_me: currentUserId === user.id
      }
    });
  } catch (err) {
    console.error('Fetch User Profile Error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// Toggle Follow / Unfollow User
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const followerId = req.user.id;

    if (targetUserId === followerId) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    const targetUser = await dbAsync.get('SELECT id FROM users WHERE id = ?', [targetUserId]);
    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    const existing = await dbAsync.get(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, targetUserId]
    );

    let isFollowing = false;
    if (existing) {
      await dbAsync.run('DELETE FROM follows WHERE id = ?', [existing.id]);
      isFollowing = false;
    } else {
      await dbAsync.run('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [followerId, targetUserId]);
      isFollowing = true;
    }

    const followersCountRow = await dbAsync.get(
      'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
      [targetUserId]
    );

    res.json({
      is_following: isFollowing,
      followers_count: followersCountRow.count
    });
  } catch (err) {
    console.error('Follow Error:', err);
    res.status(500).json({ error: 'Failed to update follow status.' });
  }
});

// Get User Followers List
router.get('/:id/followers', optionalAuthenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user ? req.user.id : 0;

    const followers = await dbAsync.all(
      `SELECT u.id, u.username, u.full_name, u.avatar_url, u.bio,
              EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ?`,
      [currentUserId, userId]
    );

    res.json({
      followers: followers.map(u => ({ ...u, is_following: Boolean(u.is_following) }))
    });
  } catch (err) {
    console.error('Fetch Followers Error:', err);
    res.status(500).json({ error: 'Failed to fetch followers.' });
  }
});

// Get User Following List
router.get('/:id/following', optionalAuthenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user ? req.user.id : 0;

    const following = await dbAsync.all(
      `SELECT u.id, u.username, u.full_name, u.avatar_url, u.bio,
              EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
       FROM follows f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ?`,
      [currentUserId, userId]
    );

    res.json({
      following: following.map(u => ({ ...u, is_following: Boolean(u.is_following) }))
    });
  } catch (err) {
    console.error('Fetch Following Error:', err);
    res.status(500).json({ error: 'Failed to fetch following users.' });
  }
});

module.exports = router;
