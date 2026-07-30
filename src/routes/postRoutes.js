const express = require('express');
const { dbAsync } = require('../db/database');
const { authenticateToken, optionalAuthenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get Feed Posts (Supports filter types: for_you, following, user, bookmarked, search, tag)
router.get('/', optionalAuthenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : 0;
    const { type = 'for_you', username, search, tag, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT p.id, p.content, p.image_url, p.tags, p.poll_data, p.created_at, p.updated_at,
             u.id as user_id, u.username, u.full_name, u.avatar_url, u.bio,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
             EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
             EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked,
             EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
      FROM posts p
      JOIN users u ON p.user_id = u.id
    `;

    const params = [currentUserId, currentUserId, currentUserId];
    const whereConditions = [];

    if (type === 'following' && currentUserId) {
      whereConditions.push(`p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)`);
      params.push(currentUserId);
    } else if (type === 'user' && username) {
      whereConditions.push(`u.username = ?`);
      params.push(username.toLowerCase().trim());
    } else if (type === 'bookmarked' && currentUserId) {
      whereConditions.push(`p.id IN (SELECT post_id FROM bookmarks WHERE user_id = ?)`);
      params.push(currentUserId);
    } else if (type === 'liked' && currentUserId) {
      whereConditions.push(`p.id IN (SELECT post_id FROM likes WHERE user_id = ?)`);
      params.push(currentUserId);
    }
    // Trending: filter to recent posts (last 30 days)
    if (type === 'trending') {
      whereConditions.push(`p.created_at >= datetime('now', '-30 days')`);
    }

    if (search) {
      whereConditions.push(`(p.content LIKE ? OR u.username LIKE ? OR u.full_name LIKE ? OR p.tags LIKE ?)`);
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (tag) {
      whereConditions.push(`p.tags LIKE ?`);
      params.push(`%${tag.trim()}%`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ` + whereConditions.join(' AND ');
    }

    // Trending: order by engagement score (likes + comments) descending
    if (type === 'trending') {
      query += ` ORDER BY (likes_count + comments_count) DESC, p.created_at DESC LIMIT ? OFFSET ?`;
    } else {
      query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    }
    params.push(parseInt(limit), parseInt(offset));

    const posts = await dbAsync.all(query, params);

    // Format boolean fields and parse poll_data JSON if available
    const formattedPosts = posts.map(post => ({
      ...post,
      is_liked: Boolean(post.is_liked),
      is_bookmarked: Boolean(post.is_bookmarked),
      is_following: Boolean(post.is_following),
      poll_data: post.poll_data ? JSON.parse(post.poll_data) : null
    }));

    res.json({ posts: formattedPosts });
  } catch (err) {
    console.error('Fetch Posts Error:', err);
    res.status(500).json({ error: 'Failed to retrieve posts.' });
  }
});

// Create New Post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, image_url, tags, poll_options } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content cannot be empty.' });
    }

    // Auto extract hashtags if not explicitly provided
    let extractedTags = tags || '';
    if (!extractedTags) {
      const hashtags = content.match(/#[\w\d_]+/g);
      if (hashtags) {
        extractedTags = hashtags.join(' ');
      }
    }

    let poll_data = null;
    if (poll_options && Array.isArray(poll_options) && poll_options.length > 1) {
      poll_data = JSON.stringify({
        options: poll_options.map(opt => ({ text: opt, votes: 0 })),
        voted_users: []
      });
    }

    const result = await dbAsync.run(
      `INSERT INTO posts (user_id, content, image_url, tags, poll_data) VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, content.trim(), image_url || '', extractedTags, poll_data]
    );

    const newPost = await dbAsync.get(
      `SELECT p.id, p.content, p.image_url, p.tags, p.poll_data, p.created_at, p.updated_at,
              u.id as user_id, u.username, u.full_name, u.avatar_url, u.bio,
              0 as likes_count, 0 as comments_count, 0 as is_liked, 0 as is_bookmarked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      message: 'Post created successfully!',
      post: {
        ...newPost,
        is_liked: false,
        is_bookmarked: false,
        poll_data: newPost.poll_data ? JSON.parse(newPost.poll_data) : null
      }
    });
  } catch (err) {
    console.error('Create Post Error:', err);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

// Vote in Post Poll
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { option_index } = req.body;

    const post = await dbAsync.get('SELECT poll_data FROM posts WHERE id = ?', [postId]);
    if (!post || !post.poll_data) {
      return res.status(404).json({ error: 'Poll not found.' });
    }

    const poll = JSON.parse(post.poll_data);

    if (poll.voted_users && poll.voted_users.includes(req.user.id)) {
      return res.status(400).json({ error: 'You have already voted in this poll.' });
    }

    if (option_index === undefined || !poll.options[option_index]) {
      return res.status(400).json({ error: 'Invalid poll option.' });
    }

    poll.options[option_index].votes += 1;
    if (!poll.voted_users) poll.voted_users = [];
    poll.voted_users.push(req.user.id);

    await dbAsync.run('UPDATE posts SET poll_data = ? WHERE id = ?', [JSON.stringify(poll), postId]);

    res.json({ message: 'Vote recorded!', poll_data: poll });
  } catch (err) {
    console.error('Poll Vote Error:', err);
    res.status(500).json({ error: 'Failed to record vote.' });
  }
});

// Toggle Like on Post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const existingLike = await dbAsync.get(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    let isLiked = false;
    if (existingLike) {
      await dbAsync.run('DELETE FROM likes WHERE id = ?', [existingLike.id]);
      isLiked = false;
    } else {
      await dbAsync.run('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId]);
      isLiked = true;
    }

    const likesCountRow = await dbAsync.get('SELECT COUNT(*) as count FROM likes WHERE post_id = ?', [postId]);

    res.json({
      is_liked: isLiked,
      likes_count: likesCountRow.count
    });
  } catch (err) {
    console.error('Like Post Error:', err);
    res.status(500).json({ error: 'Failed to update like.' });
  }
});

// Toggle Bookmark on Post
router.post('/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const existingBookmark = await dbAsync.get(
      'SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    let isBookmarked = false;
    if (existingBookmark) {
      await dbAsync.run('DELETE FROM bookmarks WHERE id = ?', [existingBookmark.id]);
      isBookmarked = false;
    } else {
      await dbAsync.run('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)', [userId, postId]);
      isBookmarked = true;
    }

    res.json({ is_bookmarked: isBookmarked });
  } catch (err) {
    console.error('Bookmark Error:', err);
    res.status(500).json({ error: 'Failed to update bookmark.' });
  }
});

// Delete Post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await dbAsync.get('SELECT user_id FROM posts WHERE id = ?', [postId]);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this post.' });
    }

    await dbAsync.run('DELETE FROM posts WHERE id = ?', [postId]);
    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('Delete Post Error:', err);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

// Get Comments for a Post
router.get('/:id/comments', optionalAuthenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const currentUserId = req.user ? req.user.id : 0;

    const comments = await dbAsync.all(
      `SELECT c.id, c.content, c.created_at,
              u.id as user_id, u.username, u.full_name, u.avatar_url,
              (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as likes_count,
              EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.id AND user_id = ?) as is_liked
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [currentUserId, postId]
    );

    const formattedComments = comments.map(c => ({
      ...c,
      is_liked: Boolean(c.is_liked)
    }));

    res.json({ comments: formattedComments });
  } catch (err) {
    console.error('Fetch Comments Error:', err);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// Add Comment to Post
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    const result = await dbAsync.run(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, req.user.id, content.trim()]
    );

    const newComment = await dbAsync.get(
      `SELECT c.id, c.content, c.created_at,
              u.id as user_id, u.username, u.full_name, u.avatar_url,
              0 as likes_count, 0 as is_liked
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      message: 'Comment added successfully!',
      comment: {
        ...newComment,
        is_liked: false
      }
    });
  } catch (err) {
    console.error('Add Comment Error:', err);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// Toggle Like on Comment
router.post('/comments/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    const existing = await dbAsync.get(
      'SELECT id FROM comment_likes WHERE user_id = ? AND comment_id = ?',
      [userId, commentId]
    );

    let isLiked = false;
    if (existing) {
      await dbAsync.run('DELETE FROM comment_likes WHERE id = ?', [existing.id]);
      isLiked = false;
    } else {
      await dbAsync.run('INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)', [userId, commentId]);
      isLiked = true;
    }

    const likesRow = await dbAsync.get('SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?', [commentId]);

    res.json({ is_liked: isLiked, likes_count: likesRow.count });
  } catch (err) {
    console.error('Comment Like Error:', err);
    res.status(500).json({ error: 'Failed to like comment.' });
  }
});

// Delete Comment
router.delete('/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const comment = await dbAsync.get('SELECT user_id FROM comments WHERE id = ?', [commentId]);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment.' });
    }

    await dbAsync.run('DELETE FROM comments WHERE id = ?', [commentId]);
    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    console.error('Delete Comment Error:', err);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

module.exports = router;
