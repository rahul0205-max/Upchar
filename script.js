// Application Central State Management
const AppState = {
  currentUser: {
    email: "admin@upchar.com",
    city: "Patna, Bihar",
    pincode: "800001"
  },
  activeCategory: "All",
  // My Own Posted Queries
  userQueries: [
    {
      id: "q101",
      title: "Streetlight not working in Boring Road",
      category: "Civic",
      desc: "The street light in front of house #42 has been non-functional for 3 days causing safety issues at night.",
      status: "open",
      date: "10 mins ago",
      saved: true,
      locality: "Patna, Bihar",
      author: "Me",
      comments: [
        { author: "Municipal Support", text: "Ticket assigned to Ward 12 supervisor.", time: "5 mins ago" }
      ]
    },
    {
      id: "q103",
      title: "Hospital appointment delayed response",
      category: "Medical",
      desc: "Requested urgent appointment confirmation for OP card verification at PMCH.",
      status: "resolved",
      date: "Yesterday",
      saved: true,
      locality: "Patna, Bihar",
      author: "Me",
      comments: [
        { author: "Dr. Sharma", text: "Token #14 verified. Please visit Counter 2.", time: "Yesterday" }
      ]
    }
  ],
  // Queries Posted by Other Citizens in Community / Locality
  citizenQueries: [
    {
      id: "c201",
      title: "Water pipeline leakage near Kankarbagh Main Road",
      category: "Utility",
      desc: "Clean drinking water leaking heavily from main pipeline near Auto Stand.",
      status: "pending",
      date: "15 mins ago",
      saved: false,
      locality: "Patna, Bihar",
      author: "Ravi S.",
      comments: [
        { author: "Water Board", text: "Maintenance team dispatched.", time: "8 mins ago" }
      ]
    },
    {
      id: "c202",
      title: "High voltage fluctuation in Bailey Road area",
      category: "Utility",
      desc: "Frequent voltage drops causing damage to electrical home equipment since morning.",
      status: "open",
      date: "1 hour ago",
      saved: false,
      locality: "Patna, Bihar",
      author: "Anita Verma",
      comments: []
    },
    {
      id: "c203",
      title: "Garbage collection missed in Sector 3",
      category: "Civic",
      desc: "Waste pick-up truck has not visited our street for two days straight.",
      status: "resolved",
      date: "3 hours ago",
      saved: false,
      locality: "Patna, Bihar",
      author: "Prakash Kumar",
      comments: [
        { author: "Sanitation Supervisor", text: "Cleaned at 11:30 AM.", time: "2 hours ago" }
      ]
    },
    {
      id: "c204",
      title: "Broadband fiber cut near Exhibition Road",
      category: "Telecom",
      desc: "Underground cable snapped during drainage construction works.",
      status: "open",
      date: "4 hours ago",
      saved: false,
      locality: "Patna, Bihar",
      author: "Rahul M.",
      comments: []
    }
  ],
  drafts: [
    {
      id: "d1",
      category: "Telecom",
      title: "Fiber optical cable broken line",
      desc: "High speed line disconnected during tree pruning."
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  initLoginAndNavigation();
  initHeroSlider();
  initCategories();
  initDrawerAndProfile();
  initModalsAndPopups();
  initQueryPostingAndInteraction();
});

/* -------------------------------------------------------------
   1. LOGIN & NAVIGATION
------------------------------------------------------------- */
function initLoginAndNavigation() {
  const loginScreen = document.getElementById('screen-login');
  const dashboardScreen = document.getElementById('screen-dashboard');
  const btnLogin = document.getElementById('btn-login');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');

  if (btnLogin) {
    btnLogin.addEventListener('click', function () {
      const username = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        alert("Please enter both username/email and password.");
        return;
      }

      // Default Admin Auth Check
      if (username === "admin" && password === "admin") {
        AppState.currentUser.email = "admin@upchar.com";
      } else {
        AppState.currentUser.email = username;
      }

      updateUserProfileUI();

      loginScreen.classList.add('swipe-out-left');
      setTimeout(() => {
        loginScreen.classList.remove('active', 'swipe-out-left');
        dashboardScreen.classList.add('active', 'swipe-in-right');
        setTimeout(() => dashboardScreen.classList.remove('swipe-in-right'), 350);
      }, 300);
    });
  }
}

/* -------------------------------------------------------------
   2. HERO SLIDER DYNAMICS
------------------------------------------------------------- */
function initHeroSlider() {
  const slides = [
    {
      tag: "YOUR QUESTIONS. OUR SUPPORT.",
      title: "Post a query.<br>Get real help.",
      desc: "Upchar is a community-driven platform where you can ask questions, get expert and public support, and find solutions."
    },
    {
      tag: "AI & COMMUNITY POWERED",
      title: "Instant Guidance.<br>Verified Results.",
      desc: "Smart routing forwards your queries directly to relevant community leaders and automated resolution tools."
    },
    {
      tag: "LOCALITY FOCUS",
      title: "Real Problems.<br>Neighbourhood Solutions.",
      desc: "Connect directly with local services and civic bodies specific to your pincode."
    }
  ];

  let currentSlide = 0;
  const tagEl = document.getElementById('hero-tag');
  const titleEl = document.getElementById('hero-title');
  const descEl = document.getElementById('hero-desc');
  const dots = document.querySelectorAll('.hero-dots .dot');

  function renderSlide(index) {
    currentSlide = index;
    tagEl.innerText = slides[index].tag;
    titleEl.innerHTML = slides[index].title;
    descEl.innerText = slides[index].desc;
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => renderSlide(index));
  });

  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    renderSlide(currentSlide);
  }, 5000);
}

/* -------------------------------------------------------------
   3. CATEGORY SELECTION & FILTERING
------------------------------------------------------------- */
function initCategories() {
  const catButtons = document.querySelectorAll('.cat-btn');
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.activeCategory = btn.getAttribute('data-cat');
      
      if (AppState.activeCategory !== "All") {
        openQueriesModal();
      }
    });
  });
}

/* -------------------------------------------------------------
   4. DRAWER PANEL & PROFILE SYSTEM
------------------------------------------------------------- */
function initDrawerAndProfile() {
  const btnOpenProfile = document.getElementById('btn-open-profile');
  const btnCloseProfile = document.getElementById('btn-close-profile');
  const profileDrawer = document.getElementById('profile-drawer');
  const profileOverlay = document.getElementById('profile-overlay');
  const btnLogout = document.getElementById('btn-drawer-logout');

  function openDrawer() {
    profileOverlay.classList.add('active');
    profileDrawer.classList.add('active');
  }

  function closeDrawer() {
    profileOverlay.classList.remove('active');
    profileDrawer.classList.remove('active');
  }

  if (btnOpenProfile) btnOpenProfile.addEventListener('click', openDrawer);
  if (btnCloseProfile) btnCloseProfile.addEventListener('click', closeDrawer);
  if (profileOverlay) profileOverlay.addEventListener('click', closeDrawer);

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      closeDrawer();
      document.getElementById('screen-dashboard').classList.remove('active');
      document.getElementById('screen-login').classList.add('active');
    });
  }
}

function updateUserProfileUI() {
  const avatar = document.getElementById('drawer-avatar');
  const emailTxt = document.getElementById('drawer-email');
  const email = AppState.currentUser.email;

  if (avatar) avatar.innerText = email.charAt(0).toUpperCase();
  if (emailTxt) emailTxt.innerText = email;
}

/* -------------------------------------------------------------
   5. MODAL SYSTEM & POPUPS
------------------------------------------------------------- */
function initModalsAndPopups() {
  const triggers = [
    { btnId: 'btn-post-query', modalId: 'modal-post-query' },
    { btnId: 'menu-queries', modalId: 'modal-queries', action: () => renderQueriesList() },
    { btnId: 'btn-dashboard-activities', modalId: 'modal-queries', action: () => renderQueriesList() },
    { btnId: 'btn-dashboard-recent', modalId: 'modal-recent-activities', action: () => renderRecentCitizenActivities() },
    { btnId: 'btn-dashboard-locality', modalId: 'modal-locality-issues', action: () => renderLocalityIssues() },
    { btnId: 'menu-saved', modalId: 'modal-saved', action: () => renderSavedList() },
    { btnId: 'menu-drafts', modalId: 'modal-drafts', action: () => renderDraftsList() },
    { btnId: 'menu-location', modalId: 'modal-location' },
    { btnId: 'menu-notifications', modalId: 'modal-notifications' },
    { btnId: 'menu-language', modalId: 'modal-language' },
    { btnId: 'menu-security', modalId: 'modal-security' },
    { btnId: 'menu-help', modalId: 'modal-help' },
    { btnId: 'menu-support', modalId: 'modal-support' },
    { btnId: 'open-signup-modal', modalId: 'signup-modal' }
  ];

  triggers.forEach(t => {
    const btn = document.getElementById(t.btnId);
    if (btn) {
      btn.addEventListener('click', () => {
        closeAllModals();
        closeDrawer();
        if (t.action) t.action();
        openModal(t.modalId);
      });
    }
  });

  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // Direct Locality Update Button Handler
  document.getElementById('btn-update-locality-direct')?.addEventListener('click', () => {
    const city = document.getElementById('locality-city-input').value.trim();
    const pincode = document.getElementById('locality-pincode-input').value.trim();
    
    if (!city) {
      alert("Please enter a valid City or Locality Name.");
      return;
    }

    AppState.currentUser.city = city;
    AppState.currentUser.pincode = pincode;

    document.getElementById('dash-locality-text').innerText = city;
    document.getElementById('input-city').value = city;
    document.getElementById('input-pincode').value = pincode;

    alert(`Locality updated to ${city}! Loading active queries...`);
    renderLocalityIssues();
  });

  // Settings Locality Save Handler
  document.getElementById('btn-save-locality')?.addEventListener('click', () => {
    const city = document.getElementById('input-city').value.trim();
    const pincode = document.getElementById('input-pincode').value.trim();
    AppState.currentUser.city = city;
    AppState.currentUser.pincode = pincode;

    document.getElementById('dash-locality-text').innerText = city;
    document.getElementById('locality-city-input').value = city;
    document.getElementById('locality-pincode-input').value = pincode;

    alert("Locality updated successfully!");
    closeAllModals();
  });

  document.getElementById('btn-save-notif')?.addEventListener('click', () => {
    alert("Notification preferences saved!");
    closeAllModals();
  });

  document.getElementById('btn-save-lang')?.addEventListener('click', () => {
    const lang = document.getElementById('select-language').value;
    alert(`Language switched to ${lang}!`);
    closeAllModals();
  });

  document.getElementById('btn-save-security')?.addEventListener('click', () => {
    alert("Password updated successfully!");
    closeAllModals();
  });

  document.getElementById('btn-submit-report')?.addEventListener('click', () => {
    const report = document.getElementById('report-text').value;
    if (!report.trim()) return alert("Please enter issue details.");
    alert("Thank you! Your issue report has been submitted.");
    document.getElementById('report-text').value = "";
    closeAllModals();
  });

  // Send OTP Integration via Server Endpoint
  document.getElementById('btn-request-otp')?.addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value.trim();
    if (!email) return alert("Please enter email to receive OTP.");

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (data.success) {
        document.getElementById('otp-group').style.display = 'flex';
        alert(data.message);
      } else {
        alert("Failed to send OTP: " + data.message);
      }
    } catch (err) {
      alert("Error sending OTP request. Ensure the backend server is running.");
    }
  });

  // Submit Registration & Verify OTP
  document.getElementById('btn-submit-signup')?.addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value.trim();
    const otp = document.getElementById('signup-otp').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (!email || !otp || !password) {
      return alert("Please fill in all fields including the OTP.");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match.");
    }

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();

      if (data.success) {
        alert("OTP Verified! Account created successfully.");
        closeAllModals();
        document.getElementById('email-input').value = email;
        document.getElementById('password-input').value = password;
        document.getElementById('btn-login').click();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Verification failed. Please try again.");
    }
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function closeDrawer() {
  document.getElementById('profile-overlay')?.classList.remove('active');
  document.getElementById('profile-drawer')?.classList.remove('active');
}

/* -------------------------------------------------------------
   6. DYNAMIC CREATION & CONTENT RENDERERS
------------------------------------------------------------- */
function initQueryPostingAndInteraction() {
  const btnSubmit = document.getElementById('btn-submit-query');
  const btnDraft = document.getElementById('btn-save-draft');

  btnSubmit?.addEventListener('click', () => {
    const title = document.getElementById('post-title-input').value.trim();
    const desc = document.getElementById('post-desc-input').value.trim();
    const cat = document.getElementById('post-cat-select').value;

    if (!title || !desc) {
      alert("Please fill in both title and description.");
      return;
    }

    const newQuery = {
      id: "q" + (Date.now() % 10000),
      title: title,
      category: cat,
      desc: desc,
      status: "open",
      date: "Just now",
      saved: false,
      locality: AppState.currentUser.city,
      author: "Me",
      comments: [
        { author: "Upchar Bot", text: "Query submitted directly to local area authorities.", time: "Just now" }
      ]
    };

    AppState.userQueries.unshift(newQuery);
    document.getElementById('post-title-input').value = "";
    document.getElementById('post-desc-input').value = "";

    alert("Query posted successfully!");
    closeAllModals();
    openQueriesModal();
  });

  btnDraft?.addEventListener('click', () => {
    const title = document.getElementById('post-title-input').value.trim();
    const desc = document.getElementById('post-desc-input').value.trim();
    const cat = document.getElementById('post-cat-select').value;

    if (!title) return alert("Please add a title to save draft.");

    AppState.drafts.push({ id: "d" + Date.now(), title, desc, category: cat });
    document.getElementById('post-title-input').value = "";
    document.getElementById('post-desc-input').value = "";

    alert("Draft saved!");
    closeAllModals();
  });
}

function openQueriesModal() {
  renderQueriesList();
  openModal('modal-queries');
}

// 1. Render User's Own Queries
function renderQueriesList() {
  const container = document.getElementById('queries-list-container');
  if (!container) return;

  let list = AppState.userQueries;
  if (AppState.activeCategory !== "All") {
    list = list.filter(q => q.category.toLowerCase() === AppState.activeCategory.toLowerCase());
  }

  if (list.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 20px; font-size:12px; color:#64748b;">No queries found in this category.</div>`;
    return;
  }

  container.innerHTML = list.map(q => `
    <div class="modal-item-card" onclick="openQueryDetail('${q.id}')">
      <div class="modal-item-header">
        <span class="item-title">${escapeHtml(q.title)}</span>
        <span class="item-badge badge-${q.status}">${q.status}</span>
      </div>
      <p class="item-desc">${escapeHtml(q.desc)}</p>
      <div class="item-footer">
        <span><i class="fa-solid fa-tag"></i> ${q.category}</span>
        <span>${q.date} &bull; ${q.comments.length} responses</span>
      </div>
    </div>
  `).join('');
}

// 2. Render Recent Citizen Activities
function renderRecentCitizenActivities() {
  const container = document.getElementById('recent-activities-list');
  if (!container) return;

  const list = AppState.citizenQueries;
  if (list.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 20px; font-size:12px; color:#64748b;">No recent community activity.</div>`;
    return;
  }

  container.innerHTML = list.map(q => `
    <div class="modal-item-card" onclick="openQueryDetail('${q.id}')">
      <div class="modal-item-header">
        <span class="item-title">${escapeHtml(q.title)}</span>
        <span class="item-badge badge-${q.status}">${q.status}</span>
      </div>
      <p class="item-desc">${escapeHtml(q.desc)}</p>
      <div class="item-footer">
        <span><i class="fa-solid fa-user"></i> Posted by: ${escapeHtml(q.author)}</span>
        <span>${q.date}</span>
      </div>
    </div>
  `).join('');
}

// 3. Render Locality Queries & Problems
function renderLocalityIssues() {
  const container = document.getElementById('locality-issues-list');
  if (!container) return;

  const currentCityQuery = AppState.currentUser.city.split(',')[0].trim().toLowerCase();

  const filteredLocalityItems = [...AppState.userQueries, ...AppState.citizenQueries].filter(
    q => q.locality.toLowerCase().includes(currentCityQuery) || currentCityQuery.includes(q.locality.toLowerCase())
  );

  if (filteredLocalityItems.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 20px; font-size:12px; color:#64748b;">No active problems reported in <b>${escapeHtml(AppState.currentUser.city)}</b> yet.<br><br>Be the first to post a query in this area!</div>`;
    return;
  }

  container.innerHTML = filteredLocalityItems.map(q => `
    <div class="modal-item-card" onclick="openQueryDetail('${q.id}')">
      <div class="modal-item-header">
        <span class="item-title">${escapeHtml(q.title)}</span>
        <span class="item-badge badge-${q.status}">${q.status}</span>
      </div>
      <p class="item-desc">${escapeHtml(q.desc)}</p>
      <div class="item-footer">
        <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(q.locality)}</span>
        <span>${q.comments.length} responses</span>
      </div>
    </div>
  `).join('');
}

// 4. Render Saved List
function renderSavedList() {
  const container = document.getElementById('saved-list-container');
  if (!container) return;

  const allQueries = [...AppState.userQueries, ...AppState.citizenQueries];
  const savedList = allQueries.filter(q => q.saved);

  if (savedList.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 20px; font-size:12px; color:#64748b;">No saved items yet.</div>`;
    return;
  }

  container.innerHTML = savedList.map(q => `
    <div class="modal-item-card" onclick="openQueryDetail('${q.id}')">
      <div class="modal-item-header">
        <span class="item-title">${escapeHtml(q.title)}</span>
        <span class="item-badge badge-${q.status}">${q.status}</span>
      </div>
      <p class="item-desc">${escapeHtml(q.desc)}</p>
      <div class="item-footer">
        <span><i class="fa-solid fa-bookmark"></i> Saved</span>
        <span>Tap to view detail</span>
      </div>
    </div>
  `).join('');
}

// 5. Render Drafts
function renderDraftsList() {
  const container = document.getElementById('drafts-list-container');
  if (!container) return;

  if (AppState.drafts.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 20px; font-size:12px; color:#64748b;">No drafts found.</div>`;
    return;
  }

  container.innerHTML = AppState.drafts.map(d => `
    <div class="modal-item-card" onclick="loadDraftToPost('${d.id}')">
      <div class="modal-item-header">
        <span class="item-title">${escapeHtml(d.title)}</span>
        <span class="item-badge badge-pending">Draft</span>
      </div>
      <p class="item-desc">${escapeHtml(d.desc || 'No description added')}</p>
      <div class="item-footer">
        <span><i class="fa-solid fa-pen"></i> Tap to edit & post</span>
      </div>
    </div>
  `).join('');
}

function loadDraftToPost(draftId) {
  const draft = AppState.drafts.find(d => d.id === draftId);
  if (!draft) return;

  document.getElementById('post-title-input').value = draft.title;
  document.getElementById('post-desc-input').value = draft.desc;
  document.getElementById('post-cat-select').value = draft.category;

  AppState.drafts = AppState.drafts.filter(d => d.id !== draftId);

  closeAllModals();
  openModal('modal-post-query');
}

/* -------------------------------------------------------------
   7. QUERY DETAIL VIEW & INTERACTION
------------------------------------------------------------- */
function openQueryDetail(queryId) {
  const allQueries = [...AppState.userQueries, ...AppState.citizenQueries];
  const query = allQueries.find(q => q.id === queryId);
  if (!query) return;

  const detailBody = document.getElementById('detail-content-body');
  if (!detailBody) return;

  detailBody.innerHTML = `
    <div style="display:flex; justify-between; align-items:center;">
      <span class="item-badge badge-${query.status}" style="font-size:11px;">STATUS: ${query.status.toUpperCase()}</span>
      <button onclick="toggleSaveQuery('${query.id}')" style="font-size: 13px; color: ${query.saved ? '#0d8a8a' : '#64748b'};">
        <i class="${query.saved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i> ${query.saved ? 'Saved' : 'Save Post'}
      </button>
    </div>

    <div style="font-size:16px; font-weight:800; color:#0e2938;">${escapeHtml(query.title)}</div>
    <div style="font-size:12px; color:#4a6369; line-height:1.4;">${escapeHtml(query.desc)}</div>
    
    <div style="font-size:10px; color:#0d8a8a; font-weight:700;">
      Location: ${escapeHtml(query.locality)} &bull; Posted by: ${escapeHtml(query.author)}
    </div>

    <hr style="border:none; border-top:1px solid #f0f4f8; margin: 4px 0;">

    <div style="font-size:12px; font-weight:700; color:#0b7070;">Responses & Updates (${query.comments.length})</div>

    <div id="comments-container" style="display:flex; flex-direction:column; gap:8px;">
      ${query.comments.map(c => `
        <div class="comment-item">
          <span class="comment-time">${c.time}</span>
          <div class="comment-author">${escapeHtml(c.author)}</div>
          <div>${escapeHtml(c.text)}</div>
        </div>
      `).join('')}
    </div>

    <div class="form-group" style="margin-top: 10px;">
      <label>Add a Response / Update</label>
      <div class="input-wrapper" style="gap:6px; padding-right:6px;">
        <input type="text" id="input-new-comment" placeholder="Write a comment...">
        <button onclick="addCommentToQuery('${query.id}')" style="background:#0d8a8a; color:white; padding:6px 12px; border-radius:6px; font-weight:700; font-size:12px;">Reply</button>
      </div>
    </div>
  `;

  closeAllModals();
  openModal('modal-query-detail');
}

function toggleSaveQuery(queryId) {
  const allQueries = [...AppState.userQueries, ...AppState.citizenQueries];
  const query = allQueries.find(q => q.id === queryId);
  if (query) {
    query.saved = !query.saved;
    openQueryDetail(queryId);
  }
}

function addCommentToQuery(queryId) {
  const input = document.getElementById('input-new-comment');
  const commentText = input?.value.trim();
  if (!commentText) return;

  const allQueries = [...AppState.userQueries, ...AppState.citizenQueries];
  const query = allQueries.find(q => q.id === queryId);
  if (query) {
    query.comments.push({
      author: AppState.currentUser.email.split('@')[0],
      text: commentText,
      time: "Just now"
    });
    openQueryDetail(queryId);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}