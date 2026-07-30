/* ==========================================================================
   NEXORA SOCIAL PLATFORM - FRONTEND ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    currentUser: null,
    token: localStorage.getItem('nexora_token') || null,
    currentFeed: 'for_you',
    currentProfileUsername: null,
    searchQuery: '',
    selectedTag: '',
    activePostForComments: null,
    attachedImageFile: null,
    pollActive: false
  };

  // DOM Elements Selection
  const elements = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    brandLogo: document.getElementById('brandLogo'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileSearchToggleBtn: document.getElementById('mobileSearchToggleBtn'),
    headerSearchContainer: document.getElementById('headerSearchContainer'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    headerNewPostBtn: document.getElementById('headerNewPostBtn'),
    headerAuthSection: document.getElementById('headerAuthSection'),
    navItems: document.querySelectorAll('.nav-item'),
    navMyProfileLink: document.getElementById('navMyProfileLink'),
    
    // Mobile Drawer & Bottom Navigation
    mobileDrawer: document.getElementById('mobileDrawer'),
    mobileDrawerOverlay: document.getElementById('mobileDrawerOverlay'),
    closeMobileDrawerBtn: document.getElementById('closeMobileDrawerBtn'),
    drawerUserProfile: document.getElementById('drawerUserProfile'),
    drawerNavItems: document.querySelectorAll('.drawer-nav-item'),
    drawerMyProfileLink: document.getElementById('drawerMyProfileLink'),
    bottomNav: document.getElementById('bottomNav'),
    bottomNavItems: document.querySelectorAll('.bottom-nav-item'),
    bottomNavProfileLink: document.getElementById('bottomNavProfileLink'),
    bottomNavPostBtn: document.getElementById('bottomNavPostBtn'),
    mobileFabBtn: document.getElementById('mobileFabBtn'),

    // Post Composer
    postComposerCard: document.getElementById('postComposerCard'),
    composerUserAvatar: document.getElementById('composerUserAvatar'),
    composerTextarea: document.getElementById('composerTextarea'),
    charCounter: document.getElementById('charCounter'),
    imageFileInput: document.getElementById('imageFileInput'),
    videoFileInput: document.getElementById('videoFileInput'),
    documentFileInput: document.getElementById('documentFileInput'),
    composerMediaPreview: document.getElementById('composerMediaPreview'),
    togglePollBtn: document.getElementById('togglePollBtn'),
    closePollBtn: document.getElementById('closePollBtn'),
    composerPollContainer: document.getElementById('composerPollContainer'),
    insertTagBtn: document.getElementById('insertTagBtn'),
    publishPostBtn: document.getElementById('publishPostBtn'),

    // Mobile Full-Screen Compose Modal
    mobileComposeModal: document.getElementById('mobileComposeModal'),
    closeMobileComposeBtn: document.getElementById('closeMobileComposeBtn'),
    mobilePublishPostBtn: document.getElementById('mobilePublishPostBtn'),
    mobileComposerUserAvatar: document.getElementById('mobileComposerUserAvatar'),
    mobileComposerUserName: document.getElementById('mobileComposerUserName'),
    mobileComposerTextarea: document.getElementById('mobileComposerTextarea'),
    mobileComposerPreviewArea: document.getElementById('mobileComposerPreviewArea'),
    mobileImageFileInput: document.getElementById('mobileImageFileInput'),
    mobileVideoFileInput: document.getElementById('mobileVideoFileInput'),
    mobileDocumentFileInput: document.getElementById('mobileDocumentFileInput'),
    mobileTogglePollBtn: document.getElementById('mobileTogglePollBtn'),
    mobileInsertTagBtn: document.getElementById('mobileInsertTagBtn'),
    mobileCharCounter: document.getElementById('mobileCharCounter'),

    // Feed & Containers
    feedTabsContainer: document.getElementById('feedTabsContainer'),
    feedTabs: document.querySelectorAll('.feed-tab'),
    postsFeedContainer: document.getElementById('postsFeedContainer'),
    profileHeaderContainer: document.getElementById('profileHeaderContainer'),
    suggestedUsersList: document.getElementById('suggestedUsersList'),

    // Modals & Overlay
    authModal: document.getElementById('authModal'),
    closeAuthModalBtn: document.getElementById('closeAuthModalBtn'),
    authTabLogin: document.getElementById('authTabLogin'),
    authTabRegister: document.getElementById('authTabRegister'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),

    editProfileModal: document.getElementById('editProfileModal'),
    closeEditProfileBtn: document.getElementById('closeEditProfileBtn'),
    cancelEditProfileBtn: document.getElementById('cancelEditProfileBtn'),
    editProfileForm: document.getElementById('editProfileForm'),

    commentsModal: document.getElementById('commentsModal'),
    closeCommentsBtn: document.getElementById('closeCommentsBtn'),
    commentsTargetPost: document.getElementById('commentsTargetPost'),
    addCommentForm: document.getElementById('addCommentForm'),
    commentInput: document.getElementById('commentInput'),
    commentsList: document.getElementById('commentsList'),

    imageLightboxModal: document.getElementById('imageLightboxModal'),
    closeLightboxBtn: document.getElementById('closeLightboxBtn'),
    lightboxImg: document.getElementById('lightboxImg'),

    toastContainer: document.getElementById('toastContainer'),

    // Search Dropdown & Results
    searchDropdown: document.getElementById('searchDropdown'),
    searchDropdownContent: document.getElementById('searchDropdownContent'),
    searchResultsHeader: document.getElementById('searchResultsHeader'),
    searchResultsTitle: document.getElementById('searchResultsTitle'),
    searchResultsSubtitle: document.getElementById('searchResultsSubtitle'),
    searchUsersSection: document.getElementById('searchUsersSection'),
    searchUsersList: document.getElementById('searchUsersList')
  };

  // --- INITIALIZATION ---
  initApp();

  async function initApp() {
    setupTheme();
    setupEventListeners();
    await checkAuth();
    loadSuggestedUsers();
    loadFeed();
  }

  // --- API HELPER FUNCTION ---
  async function apiFetch(endpoint, method = 'GET', body = null, isFormData = false) {
    const headers = {};
    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }
    if (!isFormData && body) {
      headers['Content-Type'] = 'application/json';
    }

    const options = {
      method,
      headers
    };

    if (body) {
      options.body = isFormData ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(`/api${endpoint}`, options);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'API Request failed');
      }
      return data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }

  // --- AUTHENTICATION ENGINE ---
  async function checkAuth() {
    if (!state.token) {
      renderHeaderAuth();
      return;
    }

    try {
      const res = await apiFetch('/auth/me');
      state.currentUser = res.user;
      renderHeaderAuth();
      updateComposerAvatar();
    } catch (err) {
      console.warn('Auth token expired or invalid');
      logout();
    }
  }

  function renderHeaderAuth() {
    if (state.currentUser) {
      elements.headerAuthSection.innerHTML = `
        <div class="user-menu-wrapper" style="display: flex; align-items: center; gap: 10px;">
          <img src="${state.currentUser.avatar_url}" class="user-avatar-btn" id="headerProfileAvatar" title="@${state.currentUser.username}">
          <button id="logoutBtn" class="icon-btn-sm" title="Sign Out"><i class="fa-solid fa-right-from-bracket"></i></button>
        </div>
      `;
      document.getElementById('headerProfileAvatar')?.addEventListener('click', () => openProfile(state.currentUser.username));
      document.getElementById('logoutBtn')?.addEventListener('click', logout);
    } else {
      elements.headerAuthSection.innerHTML = `
        <button id="headerLoginBtn" class="btn btn-outline btn-sm">Sign In</button>
      `;
      document.getElementById('headerLoginBtn')?.addEventListener('click', () => openAuthModal('login'));
    }
    renderDrawerUserProfile();
  }

  // --- MOBILE DRAWER & NAV HELPERS ---
  function openMobileDrawer() {
    elements.mobileDrawer?.classList.add('open');
    elements.mobileDrawerOverlay?.classList.add('active');
    renderDrawerUserProfile();
  }

  function closeMobileDrawer() {
    elements.mobileDrawer?.classList.remove('open');
    elements.mobileDrawerOverlay?.classList.remove('active');
  }

  function renderDrawerUserProfile() {
    if (!elements.drawerUserProfile) return;
    if (state.currentUser) {
      elements.drawerUserProfile.innerHTML = `
        <div class="drawer-user-card" id="drawerUserCard" style="cursor: pointer;">
          <img src="${state.currentUser.avatar_url}" class="drawer-user-avatar" alt="${escapeHTML(state.currentUser.full_name)}">
          <div class="drawer-user-info">
            <span class="drawer-user-name">${escapeHTML(state.currentUser.full_name)}</span>
            <span class="drawer-user-handle">@${escapeHTML(state.currentUser.username)}</span>
          </div>
        </div>
      `;
      document.getElementById('drawerUserCard')?.addEventListener('click', () => {
        closeMobileDrawer();
        openProfile(state.currentUser.username);
      });
    } else {
      elements.drawerUserProfile.innerHTML = `
        <div class="drawer-user-card">
          <button id="drawerSignInBtn" class="btn btn-primary btn-block btn-sm">Sign In / Register</button>
        </div>
      `;
      document.getElementById('drawerSignInBtn')?.addEventListener('click', () => {
        closeMobileDrawer();
        openAuthModal('login');
      });
    }
  }

  function syncActiveNav(viewType, feedType = null) {
    // Left sidebar items
    elements.navItems.forEach(n => {
      n.classList.remove('active');
      if (viewType === 'feed' && n.getAttribute('data-feed') === feedType) n.classList.add('active');
      if (viewType === 'bookmarks' && n.getAttribute('data-view') === 'bookmarks') n.classList.add('active');
      if (viewType === 'profile' && n.id === 'navMyProfileLink') n.classList.add('active');
    });

    // Drawer items
    elements.drawerNavItems?.forEach(d => {
      d.classList.remove('active');
      if (viewType === 'feed' && d.getAttribute('data-feed') === feedType) d.classList.add('active');
      if (viewType === 'bookmarks' && d.getAttribute('data-view') === 'bookmarks') d.classList.add('active');
      if (viewType === 'profile' && d.id === 'drawerMyProfileLink') d.classList.add('active');
    });

    // Bottom nav items
    elements.bottomNavItems?.forEach(b => {
      b.classList.remove('active');
      if (viewType === 'feed' && b.getAttribute('data-feed') === feedType) b.classList.add('active');
      if (viewType === 'bookmarks' && b.getAttribute('data-view') === 'bookmarks') b.classList.add('active');
      if (viewType === 'profile' && b.id === 'bottomNavProfileLink') b.classList.add('active');
    });
  }

  function logout() {
    state.currentUser = null;
    state.token = null;
    localStorage.removeItem('nexora_token');
    renderHeaderAuth();
    updateComposerAvatar();
    showToast('Logged out successfully');
    loadFeed();
  }

  function updateComposerAvatar() {
    if (state.currentUser) {
      elements.composerUserAvatar.src = state.currentUser.avatar_url;
    } else {
      elements.composerUserAvatar.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';
    }
  }

  // --- THEME ENGINE ---
  function setupTheme() {
    const savedTheme = localStorage.getItem('nexora_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('nexora_theme', newTheme);
    updateThemeIcon(newTheme);
  }

  function updateThemeIcon(theme) {
    elements.themeToggleBtn.innerHTML = theme === 'dark'
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }

  // --- FEED & POST RENDERING ENGINE ---
  async function loadFeed() {
    renderSkeletons();
    
    let endpoint = `/posts?limit=30`;

    if (state.currentFeed === 'profile' && state.currentProfileUsername) {
      endpoint += `&type=user&username=${encodeURIComponent(state.currentProfileUsername)}`;
    } else if (state.currentFeed === 'bookmarked') {
      endpoint += `&type=bookmarked`;
    } else if (state.currentFeed === 'following') {
      endpoint += `&type=following`;
    } else if (state.currentFeed === 'trending') {
      endpoint += `&type=trending`;
    } else {
      endpoint += `&type=for_you`;
    }

    if (state.searchQuery) {
      endpoint += `&search=${encodeURIComponent(state.searchQuery)}`;
    }
    if (state.selectedTag) {
      endpoint += `&tag=${encodeURIComponent(state.selectedTag)}`;
    }

    try {
      const res = await apiFetch(endpoint);

      // If a search is active, also fetch matching users and show the results UI
      if (state.searchQuery) {
        elements.searchResultsHeader?.classList.remove('hidden');
        elements.feedTabsContainer?.classList.add('hidden');

        let matchingUsers = [];
        try {
          const userRes = await fetch(`/api/users/search?q=${encodeURIComponent(state.searchQuery)}`, {
            headers: state.token ? { 'Authorization': `Bearer ${state.token}` } : {}
          });
          if (userRes.ok) {
            const ud = await userRes.json();
            matchingUsers = ud.users || [];
          }
        } catch (_) {}

        // Update header text
        const totalCount = (matchingUsers.length) + (res.posts?.length || 0);
        if (elements.searchResultsTitle) {
          elements.searchResultsTitle.textContent = `Results for "${state.searchQuery}"`;
        }
        if (elements.searchResultsSubtitle) {
          elements.searchResultsSubtitle.textContent = `${totalCount} result${totalCount !== 1 ? 's' : ''} found`;
        }

        // Render users section
        if (matchingUsers.length > 0) {
          elements.searchUsersSection?.classList.remove('hidden');
          renderSearchUsers(matchingUsers);
        } else {
          elements.searchUsersSection?.classList.add('hidden');
        }
      } else {
        elements.searchResultsHeader?.classList.add('hidden');
        elements.searchUsersSection?.classList.add('hidden');
        if (!state.currentProfileUsername) {
          elements.feedTabsContainer?.classList.remove('hidden');
        }
      }

      renderPosts(res.posts);
    } catch (err) {
      elements.postsFeedContainer.innerHTML = `
        <div class="empty-feed-card">
          <div class="empty-feed-icon" style="background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05)); color: var(--danger);">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h3>Connection Error</h3>
          <p>Failed to load posts. Please make sure the server is running.</p>
        </div>
      `;
    }
  }

  function renderSearchUsers(users) {
    if (!elements.searchUsersList) return;
    elements.searchUsersList.innerHTML = users.map(u => `
      <div class="search-user-card" data-username="${u.username}">
        <img src="${u.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.username}" alt="${escapeHTML(u.full_name)}">
        <div class="search-user-info">
          <div class="search-user-name">${escapeHTML(u.full_name)}</div>
          <div class="search-user-handle">@${u.username}</div>
          ${u.bio ? `<div class="search-user-bio">${escapeHTML(u.bio)}</div>` : ''}
        </div>
        <div class="search-user-follow-btn">
          <button class="btn ${u.is_following ? 'btn-secondary' : 'btn-outline'} btn-sm search-follow-btn" data-user-id="${u.id}">
            ${u.is_following ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>
    `).join('');

    elements.searchUsersList.querySelectorAll('.search-user-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.search-follow-btn')) return; // handled separately
        openProfile(card.getAttribute('data-username'));
      });
    });

    elements.searchUsersList.querySelectorAll('.search-follow-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!requireAuth()) return;
        const uId = btn.getAttribute('data-user-id');
        const res = await apiFetch(`/users/${uId}/follow`, 'POST');
        if (res.is_following) {
          btn.className = 'btn btn-secondary btn-sm search-follow-btn';
          btn.textContent = 'Following';
        } else {
          btn.className = 'btn btn-outline btn-sm search-follow-btn';
          btn.textContent = 'Follow';
        }
      });
    });
  }



  function renderSkeletons() {
    elements.postsFeedContainer.innerHTML = Array(3).fill(0).map(() => `
      <div class="post-card">
        <div class="post-header">
          <div style="display:flex; gap:12px; align-items:center;">
            <div class="skeleton" style="width:44px; height:44px; border-radius:50%;"></div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <div class="skeleton" style="width:120px; height:14px;"></div>
              <div class="skeleton" style="width:80px; height:10px;"></div>
            </div>
          </div>
        </div>
        <div class="skeleton" style="width:100%; height:60px; margin:10px 0;"></div>
      </div>
    `).join('');
  }

  function renderPosts(posts) {
    // Inject feed-specific hero banner
    const heroHTML = getFeedHeroHTML();

    if (!posts || posts.length === 0) {
      elements.postsFeedContainer.innerHTML = heroHTML + getEmptyStateHTML();
      return;
    }

    const isTrending = state.currentFeed === 'trending';
    elements.postsFeedContainer.innerHTML = heroHTML + posts.map((post, idx) => renderSinglePostHTML(post, isTrending ? idx + 1 : null)).join('');
    attachPostCardEventListeners();
  }

  function getFeedHeroHTML() {
    if (state.currentFeed === 'following') {
      return `
        <div class="feed-hero hero-following">
          <div class="feed-hero-icon"><i class="fa-solid fa-user-group"></i></div>
          <div class="feed-hero-text">
            <h3>Following Feed</h3>
            <p>Posts from people you follow, curated just for you.</p>
          </div>
        </div>
      `;
    } else if (state.currentFeed === 'trending') {
      return `
        <div class="feed-hero hero-trending">
          <div class="feed-hero-icon"><i class="fa-solid fa-fire-flame-curved"></i></div>
          <div class="feed-hero-text">
            <h3>Trending Now</h3>
            <p>Top-performing posts ranked by real-time engagement, likes &amp; comments.</p>
          </div>
        </div>
      `;
    }
    return '';
  }

  function getEmptyStateHTML() {
    if (state.currentFeed === 'following') {
      return `
        <div class="empty-feed-card">
          <div class="empty-feed-icon" style="background: linear-gradient(135deg, rgba(13,211,197,0.12), rgba(124,58,237,0.08)); color: var(--accent-primary);">
            <i class="fa-solid fa-user-plus"></i>
          </div>
          <h3>Your feed is empty</h3>
          <p>Follow people you're interested in to see their posts here.</p>
          <button class="btn btn-primary btn-sm" onclick="document.querySelector('[data-feed-type=for_you]').click()">
            <i class="fa-solid fa-compass"></i> Explore Posts
          </button>
        </div>
      `;
    } else if (state.currentFeed === 'trending') {
      return `
        <div class="empty-feed-card">
          <div class="empty-feed-icon" style="background: linear-gradient(135deg, rgba(249,115,22,0.15), rgba(239,68,68,0.1)); color: #f97316;">
            <i class="fa-solid fa-fire-flame-curved"></i>
          </div>
          <h3>No trending posts yet</h3>
          <p>Be the first to share engaging content and spark conversations!</p>
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('composerTextarea')?.focus(); window.scrollTo({top:0,behavior:'smooth'});">
            <i class="fa-solid fa-pen-to-square"></i> Create a Post
          </button>
        </div>
      `;
    } else if (state.currentFeed === 'bookmarked') {
      return `
        <div class="empty-feed-card">
          <div class="empty-feed-icon" style="background: linear-gradient(135deg, rgba(13,211,197,0.12), rgba(124,58,237,0.08)); color: var(--accent-primary);">
            <i class="fa-solid fa-bookmark"></i>
          </div>
          <h3>No bookmarks yet</h3>
          <p>Save posts you love by clicking the bookmark icon on any post.</p>
        </div>
      `;
    }
    return `
      <div class="empty-feed-card">
        <div class="empty-feed-icon" style="background: linear-gradient(135deg, rgba(13,211,197,0.12), rgba(124,58,237,0.08)); color: var(--accent-primary);">
          <i class="fa-regular fa-folder-open"></i>
        </div>
        <h3>${state.searchQuery ? `No posts found for "${escapeHTML(state.searchQuery)}"` : 'No posts found'}</h3>
        <p>${state.searchQuery ? 'Try different keywords, a hashtag, or a username.' : 'Be the first to share something with the community!'}</p>
      </div>
    `;
  }

  function renderSinglePostHTML(post, trendingRank = null) {
    const formattedDate = formatRelativeTime(post.created_at);
    
    // Parse hashtag formatting in post content
    const parsedContent = escapeHTML(post.content).replace(/#([\w\d_]+)/g, '<span class="post-tag" data-tag="#$1">#$1</span>');

    // Render Poll Options if poll exists
    let pollHTML = '';
    if (post.poll_data && post.poll_data.options) {
      const totalVotes = post.poll_data.options.reduce((sum, opt) => sum + opt.votes, 0);
      const isVoted = state.currentUser && post.poll_data.voted_users && post.poll_data.voted_users.includes(state.currentUser.id);

      pollHTML = `
        <div class="post-poll-box" data-post-id="${post.id}">
          ${post.poll_data.options.map((opt, idx) => {
            const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            return `
              <button class="poll-option-btn" data-poll-idx="${idx}" ${isVoted ? 'disabled' : ''}>
                <div class="poll-progress-bar" style="width: ${percent}%;"></div>
                <span class="poll-option-text">${escapeHTML(opt.text)}</span>
                <span class="poll-percent">${percent}%</span>
              </button>
            `;
          }).join('')}
          <div style="font-size: 0.75rem; color: var(--text-dim); text-align: right; margin-top: 4px;">
            ${totalVotes} votes total
          </div>
        </div>
      `;
    }

    // Media / Video / Document attachment HTML
    let mediaHTML = '';
    if (post.image_url) {
      const url = post.image_url;
      const lower = url.toLowerCase();
      
      if (/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/i.test(lower)) {
        mediaHTML = `
          <div class="post-video-container">
            <video src="${url}" controls class="post-media-video" preload="metadata"></video>
          </div>
        `;
      } else if (/\.(pdf|doc|docx|txt|csv|zip|rar|ppt|pptx|xls|xlsx)(\?.*)?$/i.test(lower)) {
        const rawName = url.split('/').pop().replace(/^file-\d+-/, '');
        const filename = rawName || 'Document Attachment';
        let icon = 'fa-file-lines';
        if (/\.pdf$/i.test(lower)) icon = 'fa-file-pdf';
        else if (/\.(doc|docx)$/i.test(lower)) icon = 'fa-file-word';
        else if (/\.(xls|xlsx|csv)$/i.test(lower)) icon = 'fa-file-excel';
        else if (/\.(ppt|pptx)$/i.test(lower)) icon = 'fa-file-powerpoint';
        else if (/\.(zip|rar)$/i.test(lower)) icon = 'fa-file-zipper';

        mediaHTML = `
          <a href="${url}" download="${filename}" class="post-document-card" target="_blank" rel="noopener">
            <div class="doc-icon-box"><i class="fa-solid ${icon}"></i></div>
            <div class="doc-info-meta">
              <span class="doc-filename">${escapeHTML(filename)}</span>
              <span class="doc-filesize"><i class="fa-solid fa-download"></i> Click to view & download document</span>
            </div>
            <i class="fa-solid fa-download doc-action-icon"></i>
          </a>
        `;
      } else {
        mediaHTML = `
          <div class="post-image-container">
            <img src="${url}" alt="Post attachment" class="lightbox-trigger">
          </div>
        `;
      }
    }

    // Trending rank badge
    const rankBadge = trendingRank ? `
      <div class="trending-rank-badge">
        <i class="fa-solid fa-fire-flame-curved"></i>
        #${trendingRank} Trending
      </div>
    ` : '';

    const isOwner = state.currentUser && state.currentUser.id === post.user_id;

    return `
      <article class="post-card" data-post-id="${post.id}">
        ${rankBadge}
        <div class="post-header">
          <div class="post-user-info" data-username="${post.username}">
            <img src="${post.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + post.username}" alt="${post.full_name}">
            <div class="user-names">
              <span class="full-name">${escapeHTML(post.full_name)}</span>
              <span class="username-date">@${post.username} • ${formattedDate}</span>
            </div>
          </div>

          ${isOwner ? `
            <button class="icon-btn-sm delete-post-btn" title="Delete Post"><i class="fa-regular fa-trash-can"></i></button>
          ` : ''}
        </div>

        <div class="post-content">${parsedContent}</div>

        ${mediaHTML}
        ${pollHTML}

        <div class="post-footer-actions">
          <button class="action-item like-btn ${post.is_liked ? 'liked' : ''}">
            <i class="${post.is_liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            <span class="like-count">${post.likes_count}</span>
          </button>

          <button class="action-item comment-btn">
            <i class="fa-regular fa-comment"></i>
            <span>${post.comments_count}</span>
          </button>

          <button class="action-item bookmark-btn ${post.is_bookmarked ? 'bookmarked' : ''}">
            <i class="${post.is_bookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
          </button>

          <button class="action-item share-btn" title="Share Post">
            <i class="fa-regular fa-paper-plane"></i>
          </button>
        </div>
      </article>
    `;
  }

  function attachPostCardEventListeners() {
    // User profile click
    document.querySelectorAll('.post-user-info').forEach(el => {
      el.addEventListener('click', (e) => {
        const username = el.getAttribute('data-username');
        if (username) openProfile(username);
      });
    });

    // Hashtag click
    document.querySelectorAll('.post-tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        const tagName = tag.getAttribute('data-tag');
        filterByTag(tagName);
      });
    });

    // Image Lightbox
    document.querySelectorAll('.lightbox-trigger').forEach(img => {
      img.addEventListener('click', () => {
        elements.lightboxImg.src = img.src;
        elements.imageLightboxModal.classList.remove('hidden');
      });
    });

    // Like Button Toggle
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!requireAuth()) return;
        const postCard = btn.closest('.post-card');
        const postId = postCard.getAttribute('data-post-id');
        const icon = btn.querySelector('i');
        const countSpan = btn.querySelector('.like-count');

        // Optimistic UI update
        const isCurrentlyLiked = btn.classList.contains('liked');
        let count = parseInt(countSpan.textContent) || 0;

        if (isCurrentlyLiked) {
          btn.classList.remove('liked');
          icon.className = 'fa-regular fa-heart';
          countSpan.textContent = Math.max(0, count - 1);
        } else {
          btn.classList.add('liked');
          icon.className = 'fa-solid fa-heart';
          countSpan.textContent = count + 1;
        }

        try {
          const res = await apiFetch(`/posts/${postId}/like`, 'POST');
          countSpan.textContent = res.likes_count;
        } catch (err) {
          // Rollback on error
          loadFeed();
        }
      });
    });

    // Bookmark Button Toggle
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!requireAuth()) return;
        const postCard = btn.closest('.post-card');
        const postId = postCard.getAttribute('data-post-id');
        const icon = btn.querySelector('i');

        const isCurrentlyBookmarked = btn.classList.contains('bookmarked');
        if (isCurrentlyBookmarked) {
          btn.classList.remove('bookmarked');
          icon.className = 'fa-regular fa-bookmark';
          showToast('Removed from Bookmarks');
        } else {
          btn.classList.add('bookmarked');
          icon.className = 'fa-solid fa-bookmark';
          showToast('Added to Bookmarks');
        }

        await apiFetch(`/posts/${postId}/bookmark`, 'POST');
      });
    });

    // Comment Button Click
    document.querySelectorAll('.comment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const postCard = btn.closest('.post-card');
        const postId = postCard.getAttribute('data-post-id');
        openCommentsModal(postId);
      });
    });

    // Delete Post Click
    document.querySelectorAll('.delete-post-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const postCard = btn.closest('.post-card');
        const postId = postCard.getAttribute('data-post-id');
        if (confirm('Are you sure you want to delete this post?')) {
          await apiFetch(`/posts/${postId}`, 'DELETE');
          showToast('Post deleted');
          postCard.remove();
        }
      });
    });

    // Poll Vote Option Click
    document.querySelectorAll('.poll-option-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!requireAuth()) return;
        const pollBox = btn.closest('.post-poll-box');
        const postId = pollBox.getAttribute('data-post-id');
        const optionIdx = parseInt(btn.getAttribute('data-poll-idx'));

        try {
          await apiFetch(`/posts/${postId}/vote`, 'POST', { option_index: optionIdx });
          showToast('Vote recorded!');
          loadFeed();
        } catch (err) {
          // Already voted error handled by toast
        }
      });
    });

    // Share Post Button
    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
      });
    });
  }

  // --- MEDIA ATTACHMENT & PREVIEW HELPERS ---
  function getDocIconClass(filename) {
    const lower = filename.toLowerCase();
    if (/\.pdf$/i.test(lower)) return 'fa-file-pdf';
    if (/\.(doc|docx)$/i.test(lower)) return 'fa-file-word';
    if (/\.(xls|xlsx|csv)$/i.test(lower)) return 'fa-file-excel';
    if (/\.(ppt|pptx)$/i.test(lower)) return 'fa-file-powerpoint';
    if (/\.(zip|rar)$/i.test(lower)) return 'fa-file-zipper';
    return 'fa-file-lines';
  }

  function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function handleFileSelected(file, previewContainer) {
    if (!file) return;
    state.attachedFile = file;

    const fileType = file.type;
    const isImage = fileType.startsWith('image/');
    const isVideo = fileType.startsWith('video/');

    previewContainer.innerHTML = '';
    previewContainer.classList.remove('hidden');

    if (isImage) {
      state.attachedFileType = 'image';
      const reader = new FileReader();
      reader.onload = (evt) => {
        previewContainer.innerHTML = `
          <div class="preview-media-wrapper">
            <img src="${evt.target.result}" class="preview-media-img" alt="Selected image preview">
            <button type="button" class="preview-remove-btn" title="Remove attachment"><i class="fa-solid fa-xmark"></i></button>
          </div>
        `;
        previewContainer.querySelector('.preview-remove-btn').addEventListener('click', clearMediaPreview);
      };
      reader.readAsDataURL(file);
    } else if (isVideo) {
      state.attachedFileType = 'video';
      const videoUrl = URL.createObjectURL(file);
      previewContainer.innerHTML = `
        <div class="preview-media-wrapper">
          <video src="${videoUrl}" controls class="preview-media-video"></video>
          <button type="button" class="preview-remove-btn" title="Remove attachment"><i class="fa-solid fa-xmark"></i></button>
        </div>
      `;
      previewContainer.querySelector('.preview-remove-btn').addEventListener('click', clearMediaPreview);
    } else {
      state.attachedFileType = 'document';
      const icon = getDocIconClass(file.name);
      const formattedSize = formatFileSize(file.size);
      previewContainer.innerHTML = `
        <div class="preview-doc-card">
          <div class="doc-icon-box"><i class="fa-solid ${icon}"></i></div>
          <div class="doc-info-meta">
            <span class="doc-filename">${escapeHTML(file.name)}</span>
            <span class="doc-filesize">${formattedSize}</span>
          </div>
          <button type="button" class="preview-remove-btn" style="position:static; margin-left:auto;" title="Remove attachment"><i class="fa-solid fa-xmark"></i></button>
        </div>
      `;
      previewContainer.querySelector('.preview-remove-btn').addEventListener('click', clearMediaPreview);
    }
  }

  function clearMediaPreview() {
    state.attachedFile = null;
    state.attachedFileType = null;

    if (elements.imageFileInput) elements.imageFileInput.value = '';
    if (elements.videoFileInput) elements.videoFileInput.value = '';
    if (elements.documentFileInput) elements.documentFileInput.value = '';
    if (elements.mobileImageFileInput) elements.mobileImageFileInput.value = '';
    if (elements.mobileVideoFileInput) elements.mobileVideoFileInput.value = '';
    if (elements.mobileDocumentFileInput) elements.mobileDocumentFileInput.value = '';

    if (elements.composerMediaPreview) {
      elements.composerMediaPreview.innerHTML = '';
      elements.composerMediaPreview.classList.add('hidden');
    }
    if (elements.mobileComposerPreviewArea) {
      elements.mobileComposerPreviewArea.innerHTML = '';
      elements.mobileComposerPreviewArea.classList.add('hidden');
    }
  }

  // --- POST COMPOSER ENGINE ---
  async function createPost(isMobile = false) {
    if (!requireAuth()) return;

    const textarea = isMobile ? elements.mobileComposerTextarea : elements.composerTextarea;
    const submitBtn = isMobile ? elements.mobilePublishPostBtn : elements.publishPostBtn;

    const content = textarea ? textarea.value.trim() : '';
    if (!content && !state.attachedFile) {
      showToast('Please add text or an attachment to post', 'error');
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    let fileUrl = '';

    if (state.attachedFile) {
      const formData = new FormData();
      formData.append('file', state.attachedFile);
      try {
        const uploadRes = await apiFetch('/upload/file', 'POST', formData, true);
        fileUrl = uploadRes.url;
      } catch (err) {
        showToast('Failed to upload file attachment', 'error');
        if (submitBtn) submitBtn.disabled = false;
        return;
      }
    }

    let pollOptions = null;
    if (state.pollActive) {
      const container = isMobile ? elements.mobileComposeModal : elements.composerPollContainer;
      const inputs = container.querySelectorAll('.poll-option-input');
      pollOptions = Array.from(inputs).map(inp => inp.value.trim()).filter(v => v.length > 0);
    }

    try {
      await apiFetch('/posts', 'POST', {
        content: content || (state.attachedFileType === 'document' ? 'Shared document attachment' : 'Shared media attachment'),
        image_url: fileUrl,
        poll_options: pollOptions
      });

      if (textarea) textarea.value = '';
      clearMediaPreview();
      closePollCreator();

      if (isMobile) {
        closeMobileComposeModal();
      }

      showToast('Post published successfully!', 'success');
      loadFeed();
    } catch (err) {
      showToast('Failed to publish post', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function closePollCreator() {
    state.pollActive = false;
    elements.composerPollContainer?.classList.add('hidden');
  }

  // --- MOBILE FULL-SCREEN CREATE POST PAGE ---
  function openMobileComposeModal() {
    if (!requireAuth()) return;
    if (elements.mobileComposeModal) {
      elements.mobileComposeModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

      if (state.currentUser) {
        if (elements.mobileComposerUserAvatar) {
          elements.mobileComposerUserAvatar.src = state.currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${state.currentUser.username}`;
        }
        if (elements.mobileComposerUserName) {
          elements.mobileComposerUserName.textContent = state.currentUser.full_name || state.currentUser.username;
        }
      }

      setTimeout(() => {
        elements.mobileComposerTextarea?.focus();
      }, 120);
    }
  }

  function closeMobileComposeModal() {
    if (elements.mobileComposeModal) {
      elements.mobileComposeModal.classList.add('hidden');
      document.body.style.overflow = '';
      if (elements.mobileComposerTextarea) elements.mobileComposerTextarea.value = '';
      clearMediaPreview();
    }
  }

  // --- USER PROFILE VIEW ---
  async function openProfile(username) {
    state.currentFeed = 'profile';
    state.currentProfileUsername = username;

    // Highlight nav item if it's my profile
    if (state.currentUser && state.currentUser.username === username) {
      syncActiveNav('profile');
    } else {
      syncActiveNav('other');
    }

    elements.feedTabsContainer.classList.add('hidden');
    elements.profileHeaderContainer.classList.remove('hidden');

    try {
      const res = await apiFetch(`/users/${username}`);
      renderProfileHeader(res.user);
      loadFeed();
    } catch (err) {
      showToast('Could not load profile', 'error');
    }
  }

  function renderProfileHeader(user) {
    const isMe = state.currentUser && state.currentUser.id === user.id;

    elements.profileHeaderContainer.innerHTML = `
      <div class="profile-header-card">
        <img src="${user.cover_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'}" class="profile-cover-img" alt="Cover">
        
        <div class="profile-info-bar">
          <div class="profile-avatar-row">
            <img src="${user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.username}" class="profile-avatar-large" alt="${user.full_name}">
            
            ${isMe ? `
              <button id="editProfileBtn" class="btn btn-outline btn-sm">Edit Profile</button>
            ` : `
              <button id="followUserBtn" class="btn ${user.is_following ? 'btn-secondary' : 'btn-primary'} btn-sm">
                ${user.is_following ? 'Following' : 'Follow'}
              </button>
            `}
          </div>

          <div class="profile-details">
            <h2>${escapeHTML(user.full_name)}</h2>
            <div class="profile-handle">@${user.username}</div>
            ${user.bio ? `<p class="profile-bio-text">${escapeHTML(user.bio)}</p>` : ''}

            <div class="profile-meta-row">
              ${user.location ? `<span><i class="fa-solid fa-location-dot"></i> ${escapeHTML(user.location)}</span>` : ''}
              ${user.website ? `<span><i class="fa-solid fa-link"></i> <a href="${escapeHTML(user.website)}" target="_blank" style="color:var(--accent-primary); text-decoration:none;">${escapeHTML(user.website.replace('https://',''))}</a></span>` : ''}
              <span><i class="fa-regular fa-calendar"></i> Joined ${new Date(user.created_at).toLocaleDateString(undefined, {month:'short', year:'numeric'})}</span>
            </div>

            <div class="profile-stats-row">
              <div class="stat-item"><span class="stat-val">${user.posts_count}</span> <span class="stat-lbl">Posts</span></div>
              <div class="stat-item"><span class="stat-val" id="profileFollowersCount">${user.followers_count}</span> <span class="stat-lbl">Followers</span></div>
              <div class="stat-item"><span class="stat-val">${user.following_count}</span> <span class="stat-lbl">Following</span></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach profile action listeners
    document.getElementById('editProfileBtn')?.addEventListener('click', openEditProfileModal);
    
    document.getElementById('followUserBtn')?.addEventListener('click', async () => {
      if (!requireAuth()) return;
      const followBtn = document.getElementById('followUserBtn');
      const followersCountSpan = document.getElementById('profileFollowersCount');

      const res = await apiFetch(`/users/${user.id}/follow`, 'POST');
      if (res.is_following) {
        followBtn.className = 'btn btn-secondary btn-sm';
        followBtn.textContent = 'Following';
      } else {
        followBtn.className = 'btn btn-primary btn-sm';
        followBtn.textContent = 'Follow';
      }
      if (followersCountSpan) followersCountSpan.textContent = res.followers_count;
      loadSuggestedUsers();
    });
  }

  // --- SUGGESTED USERS SIDEBAR ---
  async function loadSuggestedUsers() {
    try {
      const res = await apiFetch('/users/suggested');
      renderSuggestedUsers(res.users);
    } catch (err) {
      console.warn('Failed to load suggested users');
    }
  }

  function renderSuggestedUsers(users) {
    if (!users || users.length === 0) {
      elements.suggestedUsersList.innerHTML = '<p style="font-size:0.8rem; color:var(--text-dim);">No user suggestions right now.</p>';
      return;
    }

    elements.suggestedUsersList.innerHTML = users.map(u => `
      <div class="suggested-user-card">
        <div class="suggested-user-left" data-username="${u.username}">
          <img src="${u.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.username}" alt="${u.full_name}">
          <div style="display:flex; flex-direction:column;">
            <span style="font-size:0.85rem; font-weight:700;">${escapeHTML(u.full_name)}</span>
            <span style="font-size:0.75rem; color:var(--text-dim);">@${u.username}</span>
          </div>
        </div>
        <button class="btn ${u.is_following ? 'btn-secondary' : 'btn-outline'} btn-sm sidebar-follow-btn" data-user-id="${u.id}">
          ${u.is_following ? 'Following' : 'Follow'}
        </button>
      </div>
    `).join('');

    elements.suggestedUsersList.querySelectorAll('.suggested-user-left').forEach(el => {
      el.addEventListener('click', () => openProfile(el.getAttribute('data-username')));
    });

    elements.suggestedUsersList.querySelectorAll('.sidebar-follow-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!requireAuth()) return;
        const uId = btn.getAttribute('data-user-id');
        const res = await apiFetch(`/users/${uId}/follow`, 'POST');
        if (res.is_following) {
          btn.className = 'btn btn-secondary btn-sm sidebar-follow-btn';
          btn.textContent = 'Following';
        } else {
          btn.className = 'btn btn-outline btn-sm sidebar-follow-btn';
          btn.textContent = 'Follow';
        }
      });
    });
  }

  // --- COMMENTS DRAWER ENGINE ---
  async function openCommentsModal(postId) {
    state.activePostForComments = postId;
    elements.commentsModal.classList.remove('hidden');
    elements.commentsList.innerHTML = '<div class="skeleton" style="height:100px; width:100%;"></div>';

    try {
      // Load post preview snippet
      const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
      if (postCard) {
        elements.commentsTargetPost.innerHTML = postCard.querySelector('.post-content').innerHTML;
      }

      const res = await apiFetch(`/posts/${postId}/comments`);
      renderCommentsList(res.comments);
    } catch (err) {
      showToast('Failed to load comments', 'error');
    }
  }

  function renderCommentsList(comments) {
    if (!comments || comments.length === 0) {
      elements.commentsList.innerHTML = '<p style="text-align:center; color:var(--text-dim); padding:20px 0; font-size:0.9rem;">No comments yet. Start the conversation!</p>';
      return;
    }

    elements.commentsList.innerHTML = comments.map(c => `
      <div class="comment-item">
        <img src="${c.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + c.username}" alt="${c.username}">
        <div class="comment-body">
          <div>
            <span class="comment-author">${escapeHTML(c.full_name)}</span>
            <span style="font-size:0.75rem; color:var(--text-dim);">@${c.username} • ${formatRelativeTime(c.created_at)}</span>
          </div>
          <p style="margin-top:4px;">${escapeHTML(c.content)}</p>
        </div>
      </div>
    `).join('');
  }

  async function addComment() {
    if (!requireAuth()) return;
    const content = elements.commentInput.value.trim();
    if (!content || !state.activePostForComments) return;

    try {
      await apiFetch(`/posts/${state.activePostForComments}/comments`, 'POST', { content });
      elements.commentInput.value = '';
      showToast('Comment posted!');
      openCommentsModal(state.activePostForComments);
      loadFeed();
    } catch (err) {
      showToast('Failed to post comment', 'error');
    }
  }

  // --- EDIT PROFILE MODAL ---
  function openEditProfileModal() {
    if (!state.currentUser) return;
    document.getElementById('editFullName').value = state.currentUser.full_name || '';
    document.getElementById('editBio').value = state.currentUser.bio || '';
    document.getElementById('editLocation').value = state.currentUser.location || '';
    document.getElementById('editWebsite').value = state.currentUser.website || '';
    document.getElementById('editAvatarUrl').value = state.currentUser.avatar_url || '';
    document.getElementById('editCoverUrl').value = state.currentUser.cover_url || '';
    elements.editProfileModal.classList.remove('hidden');
  }

  async function saveEditProfile(e) {
    e.preventDefault();
    try {
      const res = await apiFetch('/auth/profile', 'PUT', {
        full_name: document.getElementById('editFullName').value.trim(),
        bio: document.getElementById('editBio').value.trim(),
        location: document.getElementById('editLocation').value.trim(),
        website: document.getElementById('editWebsite').value.trim(),
        avatar_url: document.getElementById('editAvatarUrl').value.trim(),
        cover_url: document.getElementById('editCoverUrl').value.trim()
      });

      state.currentUser = res.user;
      renderHeaderAuth();
      updateComposerAvatar();
      elements.editProfileModal.classList.add('hidden');
      showToast('Profile updated!', 'success');
      openProfile(state.currentUser.username);
    } catch (err) {
      showToast('Failed to update profile', 'error');
    }
  }

  // --- SEARCH & FILTER HELPERS ---
  function filterByTag(tag) {
    state.selectedTag = tag;
    state.currentFeed = 'for_you';
    state.searchQuery = '';
    elements.searchInput.value = tag;
    elements.searchClearBtn.classList.remove('hidden');
    closeSearchDropdown();
    loadFeed();
  }

  function closeSearchDropdown() {
    elements.searchDropdown?.classList.add('hidden');
  }

  function showSearchDropdownLoading() {
    elements.searchDropdown?.classList.remove('hidden');
    if (elements.searchDropdownContent) {
      elements.searchDropdownContent.innerHTML = `
        <div class="search-dropdown-loading">
          <div class="search-spinner"></div>
          <span>Searching...</span>
        </div>
      `;
    }
  }

  // Live search: fires on every keystroke, shows dropdown with users + a few posts
  async function liveSearch(query) {
    if (!query || query.trim().length < 2) {
      closeSearchDropdown();
      return;
    }
    showSearchDropdownLoading();

    try {
      // Fetch users and posts in parallel
      const [userRes, postRes] = await Promise.all([
        fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
          headers: state.token ? { 'Authorization': `Bearer ${state.token}` } : {}
        }).then(r => r.ok ? r.json() : { users: [] }),
        fetch(`/api/posts?limit=4&type=for_you&search=${encodeURIComponent(query)}`, {
          headers: state.token ? { 'Authorization': `Bearer ${state.token}` } : {}
        }).then(r => r.ok ? r.json() : { posts: [] })
      ]);

      const users = userRes.users || [];
      const posts = postRes.posts || [];

      if (users.length === 0 && posts.length === 0) {
        elements.searchDropdownContent.innerHTML = `
          <div class="search-dropdown-empty">
            <i class="fa-solid fa-face-meh" style="font-size:1.4rem; display:block; margin-bottom:8px;"></i>
            No results for "${escapeHTML(query)}"
          </div>
        `;
        return;
      }

      let html = '';

      if (users.length > 0) {
        html += `<div class="search-dropdown-section-title"><i class="fa-solid fa-users"></i> People</div>`;
        html += users.slice(0, 4).map(u => `
          <div class="search-dropdown-user" data-username="${u.username}">
            <img src="${u.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.username}" alt="${escapeHTML(u.full_name)}">
            <div class="search-dropdown-user-info">
              <div class="name">${escapeHTML(u.full_name)}</div>
              <div class="handle">@${u.username}</div>
            </div>
            <div class="search-dropdown-user-meta">${u.followers_count} followers</div>
          </div>
        `).join('');
      }

      if (posts.length > 0) {
        html += `<div class="search-dropdown-section-title"><i class="fa-solid fa-newspaper"></i> Posts</div>`;
        html += posts.slice(0, 3).map(p => `
          <div class="search-dropdown-post" data-post-id="${p.id}" data-username="${p.username}">
            <div class="search-dropdown-post-meta">
              <img src="${p.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + p.username}" alt="">
              <span class="author">${escapeHTML(p.full_name)} <span style="color:var(--text-dim)">@${p.username}</span></span>
            </div>
            <div class="search-dropdown-post-text">${escapeHTML(p.content)}</div>
          </div>
        `).join('');
      }

      html += `<div class="search-dropdown-view-all" id="dropdownViewAllBtn"><i class="fa-solid fa-arrow-right"></i> View all results for "${escapeHTML(query)}"</div>`;

      elements.searchDropdownContent.innerHTML = html;

      // Attach user click events
      elements.searchDropdownContent.querySelectorAll('.search-dropdown-user').forEach(el => {
        el.addEventListener('click', () => {
          closeSearchDropdown();
          elements.searchInput.value = '';
          elements.searchClearBtn.classList.add('hidden');
          state.searchQuery = '';
          openProfile(el.getAttribute('data-username'));
        });
      });

      // Attach post click events (open comments, jump to profile, or show search)
      elements.searchDropdownContent.querySelectorAll('.search-dropdown-post').forEach(el => {
        el.addEventListener('click', () => {
          closeSearchDropdown();
          commitSearch(query);
        });
      });

      // View all button
      document.getElementById('dropdownViewAllBtn')?.addEventListener('click', () => {
        closeSearchDropdown();
        commitSearch(query);
      });

    } catch (err) {
      closeSearchDropdown();
    }
  }

  // commitSearch: sets the search state and loads the full results view
  function commitSearch(query) {
    if (!query || !query.trim()) return;
    state.searchQuery = query.trim();
    state.selectedTag = '';
    state.currentFeed = 'for_you';
    state.currentProfileUsername = null;
    elements.profileHeaderContainer.classList.add('hidden');
    elements.feedTabsContainer.classList.add('hidden');
    elements.searchInput.value = query.trim();
    elements.searchClearBtn.classList.remove('hidden');
    closeSearchDropdown();
    loadFeed();
  }

  // --- AUTH MODAL SYSTEM ---
  function openAuthModal(tab = 'login') {
    elements.authModal.classList.remove('hidden');
    switchAuthTab(tab);
  }

  function switchAuthTab(tab) {
    if (tab === 'login') {
      elements.authTabLogin.classList.add('active');
      elements.authTabRegister.classList.remove('active');
      elements.loginForm.classList.remove('hidden');
      elements.registerForm.classList.add('hidden');
    } else {
      elements.authTabRegister.classList.add('active');
      elements.authTabLogin.classList.remove('active');
      elements.registerForm.classList.remove('hidden');
      elements.loginForm.classList.add('hidden');
    }
  }

  function requireAuth() {
    if (!state.currentUser) {
      openAuthModal('login');
      showToast('Please sign in to perform this action');
      return false;
    }
    return true;
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Theme toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // Mobile Drawer & Mobile Search Triggers
    elements.mobileMenuBtn?.addEventListener('click', openMobileDrawer);
    elements.closeMobileDrawerBtn?.addEventListener('click', closeMobileDrawer);
    elements.mobileDrawerOverlay?.addEventListener('click', closeMobileDrawer);

    elements.mobileSearchToggleBtn?.addEventListener('click', () => {
      const headerContainer = document.querySelector('.header-container');
      headerContainer?.classList.toggle('search-expanded');
      if (headerContainer?.classList.contains('search-expanded')) {
        elements.searchInput?.focus();
      }
    });

    // Brand logo reset
    elements.brandLogo.addEventListener('click', () => {
      state.currentFeed = 'for_you';
      state.currentProfileUsername = null;
      state.searchQuery = '';
      state.selectedTag = '';
      elements.searchInput.value = '';
      elements.searchClearBtn.classList.add('hidden');
      closeSearchDropdown();
      elements.searchResultsHeader?.classList.add('hidden');
      elements.searchUsersSection?.classList.add('hidden');
      elements.profileHeaderContainer.classList.add('hidden');
      elements.feedTabsContainer.classList.remove('hidden');
      syncActiveNav('feed', 'for_you');
      loadFeed();
    });

    // Search bar input: live dropdown on type, full results on Enter
    let searchTimeout;
    elements.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const val = e.target.value.trim();
      if (val) {
        elements.searchClearBtn.classList.remove('hidden');
      } else {
        elements.searchClearBtn.classList.add('hidden');
        closeSearchDropdown();
        // If search was active, return to normal feed
        if (state.searchQuery) {
          state.searchQuery = '';
          state.selectedTag = '';
          elements.feedTabsContainer.classList.remove('hidden');
          elements.searchResultsHeader?.classList.add('hidden');
          elements.searchUsersSection?.classList.add('hidden');
          loadFeed();
        }
        return;
      }

      // Trigger live dropdown after brief debounce
      searchTimeout = setTimeout(() => {
        liveSearch(val);
      }, 280);
    });

    // Submit search on Enter
    elements.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(searchTimeout);
        const val = elements.searchInput.value.trim();
        if (val) commitSearch(val);
      }
      // Close dropdown on Escape
      if (e.key === 'Escape') {
        closeSearchDropdown();
        elements.searchInput.blur();
      }
    });

    elements.searchClearBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchQuery = '';
      state.selectedTag = '';
      elements.searchClearBtn.classList.add('hidden');
      closeSearchDropdown();
      elements.searchResultsHeader?.classList.add('hidden');
      elements.searchUsersSection?.classList.add('hidden');
      elements.feedTabsContainer.classList.remove('hidden');
      const headerContainer = document.querySelector('.header-container');
      if (headerContainer?.classList.contains('search-expanded')) {
        headerContainer.classList.remove('search-expanded');
      }
      loadFeed();
    });

    document.addEventListener('click', (e) => {
      const headerContainer = document.querySelector('.header-container');
      if (headerContainer?.classList.contains('search-expanded')) {
        if (!e.target.closest('#headerSearchContainer') && !e.target.closest('#mobileSearchToggleBtn')) {
          headerContainer.classList.remove('search-expanded');
        }
      }
      // Close dropdown when clicking outside search
      if (!e.target.closest('#headerSearchContainer')) {
        closeSearchDropdown();
      }
    });

    // Left Navigation items
    elements.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const feedType = item.getAttribute('data-feed');
        if (item.id === 'navMyProfileLink') {
          if (!requireAuth()) return;
          openProfile(state.currentUser.username);
        } else {
          state.currentFeed = feedType;
          state.currentProfileUsername = null;
          state.searchQuery = '';
          state.selectedTag = '';
          elements.searchInput.value = '';
          elements.searchClearBtn.classList.add('hidden');
          closeSearchDropdown();
          elements.searchResultsHeader?.classList.add('hidden');
          elements.searchUsersSection?.classList.add('hidden');
          elements.profileHeaderContainer.classList.add('hidden');
          elements.feedTabsContainer.classList.remove('hidden');
          elements.feedTabs.forEach(t => t.classList.remove('active'));
          const matchingTab = document.querySelector(`.feed-tab[data-feed-type="${feedType}"]`);
          if (matchingTab) matchingTab.classList.add('active');
          syncActiveNav('feed', feedType);
          loadFeed();
        }
      });
    });

    // Mobile Drawer Nav items
    elements.drawerNavItems?.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        closeMobileDrawer();
        const feedType = item.getAttribute('data-feed');
        if (item.id === 'drawerMyProfileLink') {
          if (!requireAuth()) return;
          openProfile(state.currentUser.username);
        } else {
          state.currentFeed = feedType;
          state.currentProfileUsername = null;
          state.searchQuery = '';
          state.selectedTag = '';
          elements.searchInput.value = '';
          elements.searchClearBtn.classList.add('hidden');
          closeSearchDropdown();
          elements.searchResultsHeader?.classList.add('hidden');
          elements.searchUsersSection?.classList.add('hidden');
          elements.profileHeaderContainer.classList.add('hidden');
          elements.feedTabsContainer.classList.remove('hidden');
          elements.feedTabs.forEach(t => t.classList.remove('active'));
          const matchingTab = document.querySelector(`.feed-tab[data-feed-type="${feedType}"]`);
          if (matchingTab) matchingTab.classList.add('active');
          syncActiveNav('feed', feedType);
          loadFeed();
        }
      });
    });

    // Fixed Bottom Nav items
    elements.bottomNavItems?.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const feedType = item.getAttribute('data-feed');
        if (item.id === 'bottomNavProfileLink') {
          if (!requireAuth()) return;
          openProfile(state.currentUser.username);
        } else {
          state.currentFeed = feedType;
          state.currentProfileUsername = null;
          elements.profileHeaderContainer.classList.add('hidden');
          elements.feedTabsContainer.classList.remove('hidden');
          elements.feedTabs.forEach(t => t.classList.remove('active'));
          const matchingTab = document.querySelector(`.feed-tab[data-feed-type="${feedType}"]`);
          if (matchingTab) matchingTab.classList.add('active');
          syncActiveNav('feed', feedType);
          loadFeed();
        }
      });
    });

    // Post Compose Trigger (Mobile vs Desktop)
    const triggerPostCompose = () => {
      if (window.innerWidth < 768) {
        openMobileComposeModal();
      } else {
        state.currentFeed = 'for_you';
        state.currentProfileUsername = null;
        elements.profileHeaderContainer?.classList.add('hidden');
        elements.feedTabsContainer?.classList.remove('hidden');
        syncActiveNav('feed', 'for_you');
        elements.composerTextarea?.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    elements.bottomNavPostBtn?.addEventListener('click', triggerPostCompose);
    elements.mobileFabBtn?.addEventListener('click', triggerPostCompose);
    elements.headerNewPostBtn?.addEventListener('click', triggerPostCompose);

    // Mobile Compose Page Modal Close & Submit
    elements.closeMobileComposeBtn?.addEventListener('click', closeMobileComposeModal);
    elements.mobilePublishPostBtn?.addEventListener('click', () => createPost(true));

    elements.mobileComposerTextarea?.addEventListener('input', (e) => {
      const len = e.target.value.length;
      if (elements.mobileCharCounter) elements.mobileCharCounter.textContent = `${len} / 500`;
    });

    // File Input Event Listeners (Desktop & Mobile)
    const bindFileInput = (inputEl, previewContainer) => {
      if (!inputEl) return;
      inputEl.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          handleFileSelected(file, previewContainer);
        }
      });
    };

    bindFileInput(elements.imageFileInput, elements.composerMediaPreview);
    bindFileInput(elements.videoFileInput, elements.composerMediaPreview);
    bindFileInput(elements.documentFileInput, elements.composerMediaPreview);

    bindFileInput(elements.mobileImageFileInput, elements.mobileComposerPreviewArea);
    bindFileInput(elements.mobileVideoFileInput, elements.mobileComposerPreviewArea);
    bindFileInput(elements.mobileDocumentFileInput, elements.mobileComposerPreviewArea);

    // Feed Tabs
    elements.feedTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.feedTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.currentFeed = tab.getAttribute('data-feed-type');
        loadFeed();
      });
    });

    // Composer Input Events
    elements.composerTextarea?.addEventListener('input', (e) => {
      const len = e.target.value.length;
      if (elements.charCounter) elements.charCounter.textContent = `${len} / 500`;
    });

    elements.togglePollBtn?.addEventListener('click', () => {
      state.pollActive = !state.pollActive;
      if (state.pollActive) {
        elements.composerPollContainer?.classList.remove('hidden');
      } else {
        elements.composerPollContainer?.classList.add('hidden');
      }
    });

    elements.closePollBtn?.addEventListener('click', closePollCreator);

    elements.insertTagBtn?.addEventListener('click', () => {
      if (elements.composerTextarea) {
        elements.composerTextarea.value += ' #webdev';
        elements.composerTextarea.focus();
      }
    });

    elements.publishPostBtn?.addEventListener('click', () => createPost(false));

    // Auth Modal Triggers
    elements.closeAuthModalBtn.addEventListener('click', () => elements.authModal.classList.add('hidden'));
    elements.authTabLogin.addEventListener('click', () => switchAuthTab('login'));
    elements.authTabRegister.addEventListener('click', () => switchAuthTab('register'));

    // Login Form Submit
    elements.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await apiFetch('/auth/login', 'POST', {
          login: document.getElementById('loginInput').value,
          password: document.getElementById('loginPassword').value
        });
        state.token = res.token;
        state.currentUser = res.user;
        localStorage.setItem('nexora_token', res.token);
        renderHeaderAuth();
        updateComposerAvatar();
        elements.authModal.classList.add('hidden');
        showToast('Logged in successfully', 'success');
        loadFeed();
      } catch (err) {
        // Managed by apiFetch toast
      }
    });

    // Register Form Submit
    elements.registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await apiFetch('/auth/register', 'POST', {
          full_name: document.getElementById('regFullName').value,
          username: document.getElementById('regUsername').value,
          email: document.getElementById('regEmail').value,
          password: document.getElementById('regPassword').value
        });
        state.token = res.token;
        state.currentUser = res.user;
        localStorage.setItem('nexora_token', res.token);
        renderHeaderAuth();
        updateComposerAvatar();
        elements.authModal.classList.add('hidden');
        showToast('Account created successfully!', 'success');
        loadFeed();
      } catch (err) {
        // Managed by apiFetch toast
      }
    });

    // Edit Profile Modal Close/Submit
    elements.closeEditProfileBtn.addEventListener('click', () => elements.editProfileModal.classList.add('hidden'));
    elements.cancelEditProfileBtn.addEventListener('click', () => elements.editProfileModal.classList.add('hidden'));
    elements.editProfileForm.addEventListener('submit', saveEditProfile);

    // Comments Modal Close/Submit
    elements.closeCommentsBtn.addEventListener('click', () => elements.commentsModal.classList.add('hidden'));
    elements.addCommentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addComment();
    });

    // Lightbox Close
    elements.closeLightboxBtn.addEventListener('click', () => elements.imageLightboxModal.classList.add('hidden'));

    // Trending hashtags sidebar click
    document.querySelectorAll('.trending-item').forEach(item => {
      item.addEventListener('click', () => {
        const tag = item.getAttribute('data-tag');
        filterByTag(tag);
      });
    });
  }

  // --- TOAST ENGINE ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info');
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHTML(message)}</span>`;

    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- UTILITY HELPERS ---
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
});
