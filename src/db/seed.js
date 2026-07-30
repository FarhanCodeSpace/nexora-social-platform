const bcrypt = require('bcryptjs');
const { dbAsync, initDatabase } = require('./database');

async function seedData() {
  console.log('🌱 Starting database seed script...');
  await initDatabase();

  // Clear existing tables
  await dbAsync.exec(`
    DELETE FROM bookmarks;
    DELETE FROM comment_likes;
    DELETE FROM comments;
    DELETE FROM likes;
    DELETE FROM follows;
    DELETE FROM posts;
    DELETE FROM users;
  `);

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const usersData = [
    {
      username: 'alex_dev',
      email: 'alex@nexora.app',
      full_name: 'Alex Rivera',
      bio: 'Senior Full Stack Engineer & Open Source Advocate. Building high-performance web systems with Node.js & React 🚀',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      location: 'San Francisco, CA',
      website: 'https://alexrivera.dev'
    },
    {
      username: 'sophia_designer',
      email: 'sophia@nexora.app',
      full_name: 'Sophia Chen',
      bio: 'Product Designer & UI/UX Specialist. Passionate about glassmorphism, micro-interactions, and dark mode aesthetics ✨',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
      location: 'Vancouver, Canada',
      website: 'https://sophiachen.design'
    },
    {
      username: 'cyber_sam',
      email: 'sam@nexora.app',
      full_name: 'Samir Patel',
      bio: 'Cybersecurity Researcher & Ethical Hacker. Deep diving into API security, zero-trust architectures, and cryptography 🔒',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      location: 'London, UK',
      website: 'https://samirpatel.sec'
    },
    {
      username: 'elena_ai',
      email: 'elena@nexora.app',
      full_name: 'Elena Rostova',
      bio: 'AI Researcher & Data Scientist. Exploring LLM fine-tuning, neural networks, and automated code generation 🤖🧠',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
      location: 'Berlin, Germany',
      website: 'https://elenarostova.ai'
    },
    {
      username: 'marcus_tech',
      email: 'marcus@nexora.app',
      full_name: 'Marcus Thorne',
      bio: 'DevOps & Cloud Architect. Kubernetes, Docker, Terraform, and continuous delivery pipelines ☁️⚡',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      location: 'Austin, TX',
      website: 'https://marcusthorne.io'
    },
    {
      username: 'lucas_product',
      email: 'lucas@nexora.app',
      full_name: 'Lucas Vance',
      bio: 'Tech Founder & Product Lead. Building the next generation of real-time collaborative social tools ⚡💡',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
      location: 'Seattle, WA',
      website: 'https://lucasvance.com'
    }
  ];

  const userIds = {};
  for (const u of usersData) {
    const res = await dbAsync.run(
      `INSERT INTO users (username, email, password_hash, full_name, bio, avatar_url, cover_url, location, website)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.username, u.email, defaultPasswordHash, u.full_name, u.bio, u.avatar_url, u.cover_url, u.location, u.website]
    );
    userIds[u.username] = res.lastID;
  }

  // 2. Create Follow Connections
  const followsList = [
    [userIds.alex_dev, userIds.sophia_designer],
    [userIds.alex_dev, userIds.elena_ai],
    [userIds.alex_dev, userIds.cyber_sam],
    [userIds.sophia_designer, userIds.alex_dev],
    [userIds.sophia_designer, userIds.lucas_product],
    [userIds.cyber_sam, userIds.alex_dev],
    [userIds.cyber_sam, userIds.marcus_tech],
    [userIds.elena_ai, userIds.alex_dev],
    [userIds.elena_ai, userIds.sophia_designer],
    [userIds.marcus_tech, userIds.cyber_sam],
    [userIds.marcus_tech, userIds.alex_dev],
    [userIds.lucas_product, userIds.sophia_designer],
    [userIds.lucas_product, userIds.alex_dev]
  ];

  for (const [follower, following] of followsList) {
    await dbAsync.run(
      'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
      [follower, following]
    );
  }

  // 3. Create Rich Posts
  const postsData = [
    {
      username: 'alex_dev',
      content: 'Just launched our new Express.js microservice architecture! Handled 50,000 requests/sec with SQLite WAL mode and custom connection pooling. 🚀💻 What DB drivers are you using for high concurrency?',
      image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
      tags: '#backend #nodejs #express #performance #webdev',
      poll_data: JSON.stringify({
        options: [
          { text: 'SQLite (WAL Mode)', votes: 142 },
          { text: 'PostgreSQL', votes: 230 },
          { text: 'MongoDB', votes: 89 },
          { text: 'Redis / In-Memory', votes: 64 }
        ],
        voted_users: [userIds.sophia_designer, userIds.cyber_sam]
      })
    },
    {
      username: 'sophia_designer',
      content: 'Redesigned our mobile navigation drawer using obsidian dark glassmorphism and subtle neon backdrop filters! Check out this interactive prototype preview ✨ What do you think of this aesthetic?',
      image_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=80',
      tags: '#uiux #design #glassmorphism #darkmode #frontend'
    },
    {
      username: 'cyber_sam',
      content: '⚠️ Friendly Reminder: Always validate and sanitize user inputs before passing them into query parameters or database execution contexts. Parameterized queries in SQLite & SQL completely block injection attacks! Stay safe out there 🔒',
      image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80',
      tags: '#cybersecurity #infosec #coding #websecurity'
    },
    {
      username: 'elena_ai',
      content: 'Exploring multi-agent LLM systems for automated code reviews and security analysis. The speed at which agents reason over codebases is truly mind-blowing! 🤖✨',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      tags: '#artificialintelligence #machinelearning #tech #future'
    },
    {
      username: 'marcus_tech',
      content: 'Automated our deployment pipelines with Zero-Downtime rolling updates. Monitoring logs & system memory using Grafana dashboards. Smooth operations make happy engineers! ☁️⚡',
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
      tags: '#devops #cloud #kubernetes #systemdesign'
    },
    {
      username: 'lucas_product',
      content: 'What feature matters most to you in a modern Social Media Platform?',
      image_url: '',
      tags: '#product #poll #community #features',
      poll_data: JSON.stringify({
        options: [
          { text: 'Lightning fast feed & zero latency', votes: 310 },
          { text: 'Privacy & Data Encryption', votes: 245 },
          { text: 'Customizable Themes & Clean UI', votes: 190 },
          { text: 'Rich media & code syntax highlighting', votes: 120 }
        ],
        voted_users: [userIds.alex_dev, userIds.elena_ai]
      })
    },
    {
      username: 'alex_dev',
      content: 'Tip of the day: Use optimistic UI updates for instant interaction feedback! Users love immediate responses when clicking Like or Bookmark buttons while background network requests complete. ⚡🔥',
      image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1000&auto=format&fit=crop&q=80',
      tags: '#frontend #javascript #ux #webdev'
    }
  ];

  const postIds = [];
  for (const p of postsData) {
    const res = await dbAsync.run(
      `INSERT INTO posts (user_id, content, image_url, tags, poll_data) VALUES (?, ?, ?, ?, ?)`,
      [userIds[p.username], p.content, p.image_url, p.tags, p.poll_data || null]
    );
    postIds.push(res.lastID);
  }

  // 4. Add Sample Likes
  const sampleLikes = [
    [userIds.sophia_designer, postIds[0]],
    [userIds.cyber_sam, postIds[0]],
    [userIds.elena_ai, postIds[0]],
    [userIds.marcus_tech, postIds[0]],
    [userIds.alex_dev, postIds[1]],
    [userIds.elena_ai, postIds[1]],
    [userIds.lucas_product, postIds[1]],
    [userIds.alex_dev, postIds[2]],
    [userIds.marcus_tech, postIds[2]],
    [userIds.alex_dev, postIds[3]],
    [userIds.sophia_designer, postIds[3]],
    [userIds.alex_dev, postIds[5]],
    [userIds.sophia_designer, postIds[5]]
  ];

  for (const [uId, pId] of sampleLikes) {
    await dbAsync.run('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [uId, pId]);
  }

  // 5. Add Sample Bookmarks
  await dbAsync.run('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)', [userIds.alex_dev, postIds[1]]);
  await dbAsync.run('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)', [userIds.alex_dev, postIds[2]]);
  await dbAsync.run('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)', [userIds.sophia_designer, postIds[0]]);

  // 6. Add Sample Comments
  const commentsData = [
    { post_id: postIds[0], user_id: userIds.sophia_designer, content: 'Awesome architecture Alex! SQLite in WAL mode is remarkably fast for reads and concurrent writes.' },
    { post_id: postIds[0], user_id: userIds.cyber_sam, content: 'Spot on! Make sure to keep connection timeouts properly tuned for edge cases.' },
    { post_id: postIds[1], user_id: userIds.alex_dev, content: 'The glassmorphic blur effect looks stunning Sophia! Loving the glowing borders.' },
    { post_id: postIds[1], user_id: userIds.lucas_product, content: 'Super clean design! Fits perfectly into our design system.' },
    { post_id: postIds[2], user_id: userIds.alex_dev, content: 'Crucial advice Samir. Prepared statements are standard in all our endpoint handlers.' },
    { post_id: postIds[3], user_id: userIds.alex_dev, content: 'The agentic workflow capability is revolutionizing modern software engineering!' }
  ];

  for (const c of commentsData) {
    await dbAsync.run(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [c.post_id, c.user_id, c.content]
    );
  }

  console.log('✅ Database seeded successfully with test users, posts, comments, likes & follows!');
}

if (require.main === module) {
  seedData().then(() => process.exit(0)).catch(err => {
    console.error('Seed Failed:', err);
    process.exit(1);
  });
}

module.exports = seedData;
