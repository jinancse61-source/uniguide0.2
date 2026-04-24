/* ══════════════════════════════════════════════════════
   UNIGUIDE — script.js  (UPDATED with NEW FEATURES)
   Added: Voice Input, Typing Effect, PDF Download, Dark Mode, Search
══════════════════════════════════════════════════════ */

/* ── Safe Storage ── */
const _mem = {};
const store = {
  get(k)    { try { return localStorage.getItem(k); }    catch(e) { return _mem[k] != null ? _mem[k] : null; } },
  set(k, v) { try { localStorage.setItem(k, v); }        catch(e) { _mem[k] = v; } },
  del(k)    { try { localStorage.removeItem(k); }        catch(e) { delete _mem[k]; } }
};

/* ── Keys ── */
const AK = 'ug_auth';
const CK = 'ug_chats';
const VK = 'ug_active';
const WK = 'ug_welcome_seen';
const DK = 'ug_dark_mode';

const getAuth   = () => { try { return JSON.parse(store.get(AK)) || null; } catch(e) { return null; } };
const setAuth   = d  => store.set(AK, JSON.stringify(d));
const clearAuth = () => store.del(AK);
const getChats  = () => { try { return JSON.parse(store.get(CK)) || []; } catch(e) { return []; } };
const saveChats = c  => store.set(CK, JSON.stringify(c));
const getActId  = () => store.get(VK) || null;
const setActId  = id => store.set(VK, id);

/* ── Language state ── */
var lang = 'en';

/* ══════════════════════════════════════
   UI STRINGS — all translatable text
══════════════════════════════════════ */
const UI = {
  en: {
    placeholder:    'Ask anything about admissions…',
    statusText:     'Available 24/7',
    topbarSub:      '· State University of Bangladesh',
    welcomeSubtitle:'How can UniGuide help you today?',
    emptyState:     'I’m UniGuide, your admission assistant.Just type your question below!',
    qaMenuHeader:   'Quick Topics',
    newChatEmpty:   'No chats yet.\nStart a new conversation!',
    clearTitle:     'Clear chat',
    sendTitle:      'Send',
    listening:      'Listening...',
    downloadTitle:  'Download Chat',
    searchPlaceholder: '🔍 Search chats...',
    darkMode:       'Dark Mode',
    lightMode:      'Light Mode'
  },
  bn: {
    placeholder:    'ভর্তি সম্পর্কে যেকোনো প্রশ্ন করুন…',
    statusText:     '২৪/৭ উপলব্ধ',
    topbarSub:      '· স্টেট ইউনিভার্সিটি অব বাংলাদেশ',
    welcomeSubtitle:'আজ UniGuide আপনাকে কীভাবে সাহায্য করতে পারে?',
    emptyState:     'আমি UniGuide, আপনার ভর্তি সহকারী। নিচে আপনার প্রশ্নটি টাইপ করুন! ',
    qaMenuHeader:   'দ্রুত বিষয়সমূহ',
    newChatEmpty:   'এখনো কোনো চ্যাট নেই।\nনতুন কথোপকথন শুরু করুন!',
    clearTitle:     'চ্যাট মুছুন',
    sendTitle:      'পাঠান',
    listening:      'শুনছি...',
    downloadTitle:  'চ্যাট ডাউনলোড',
    searchPlaceholder: '🔍 চ্যাট খুঁজুন...',
    darkMode:       'ডার্ক মোড',
    lightMode:      'লাইট মোড'
  }
};

/* ── Auto page init ── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('login-page')) {
    initLoginPage();
  } else if (document.body.classList.contains('chat-page')) {
    initChatPage();
    initNewFeatures();
  }
});

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function toast(msg, type) {
  type = type || '';
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  setTimeout(function(){ t.classList.add('show'); }, 10);
  setTimeout(function(){ t.classList.remove('show'); }, 2800);
}

/* ══════════════════════════════════════
   NEW FEATURES INITIALIZATION
══════════════════════════════════════ */
function initNewFeatures() {
  initDarkMode();
  initVoiceInput();
  initChatSearch();
  initDownloadButton();
  initSmartSuggestions();
}

/* ── NEW FEATURE 1: DARK MODE ── */
function initDarkMode() {
  const savedDark = store.get(DK);
  if (savedDark === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  const topbarRight = document.querySelector('.topbar-right');
  if (topbarRight && !document.querySelector('.dark-mode-btn')) {
    const darkBtn = document.createElement('button');
    darkBtn.className = 'ibtn dark-mode-btn';
    darkBtn.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    darkBtn.title = UI[lang].darkMode;
    darkBtn.onclick = toggleDarkMode;
    topbarRight.appendChild(darkBtn);
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  store.set(DK, isDark);
  const darkBtn = document.querySelector('.dark-mode-btn');
  if (darkBtn) {
    darkBtn.innerHTML = isDark ? '☀️' : '🌙';
    darkBtn.title = isDark ? UI[lang].lightMode : UI[lang].darkMode;
  }
  toast(isDark ? 'Dark Mode 🌙' : 'Light Mode ☀️', 'ok');
}

/* ── NEW FEATURE 2: VOICE INPUT ── */
function initVoiceInput() {
  const inputRow = document.querySelector('.input-row');
  if (!inputRow || document.querySelector('.voice-btn')) return;
  
  const voiceBtn = document.createElement('button');
  voiceBtn.className = 'ibtn voice-btn';
  voiceBtn.innerHTML = '🎤';
  voiceBtn.title = 'Voice Input';
  voiceBtn.onclick = startVoiceInput;
  
  const sendBtn = inputRow.querySelector('.send-btn');
  if (sendBtn) {
    inputRow.insertBefore(voiceBtn, sendBtn);
  } else {
    inputRow.appendChild(voiceBtn);
  }
}

function startVoiceInput() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    toast('Voice input not supported in this browser', 'bad');
    return;
  }
  
  const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  toast(UI[lang].listening, 'ok');
  
  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    const input = document.getElementById('userInput');
    if (input) {
      input.value = text;
      autoResize(input);
      sendMessage();
    }
  };
  
  recognition.onerror = (event) => {
    console.error('Voice error:', event.error);
    toast('Voice input error. Please try again.', 'bad');
  };
  
  recognition.start();
}

/* ── NEW FEATURE 3: CHAT SEARCH ── */
function initChatSearch() {
  const sbMid = document.getElementById('sbMid');
  if (!sbMid || document.querySelector('.search-chats')) return;
  
  const searchDiv = document.createElement('div');
  searchDiv.className = 'search-chats';
  searchDiv.innerHTML = `<input type="text" id="searchChatsInput" placeholder="${UI[lang].searchPlaceholder}" class="search-input">`;
  sbMid.insertBefore(searchDiv, sbMid.firstChild);
  
  const searchInput = document.getElementById('searchChatsInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const allChats = getChats();
      let filtered = allChats;
      
      if (term) {
        filtered = allChats.filter(c => 
          c.title.toLowerCase().includes(term) || 
          (c.messages || []).some(m => m.html.toLowerCase().includes(term))
        );
      }
      renderFilteredChatList(filtered, term);
    });
  }
}

function renderFilteredChatList(chats, searchTerm) {
  const actId = getActId();
  const list = document.getElementById('chatList');
  if (!list) return;
  
  list.innerHTML = '';
  if (!chats.length) {
    list.innerHTML = '<div class="sb-empty">No matching chats found.</div>';
    return;
  }
  
  chats.forEach(function(c) {
    const btn = document.createElement('button');
    btn.className = 'chat-item has-tip' + (c.id === actId ? ' active' : '');
    btn.dataset.id = c.id;
    
    let title = c.title;
    if (searchTerm && title.toLowerCase().includes(searchTerm)) {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      title = title.replace(regex, '<mark class="search-highlight">$1</mark>');
    }
    
    btn.innerHTML = '<span class="ci-ico">💬</span>' +
      '<span class="ci-title">' + title + '</span>' +
      '<span class="tip">' + escapeHtml(c.title) + '</span>';
    btn.addEventListener('click', function(){ loadChat(c.id); });
    list.appendChild(btn);
  });
}

/* ── NEW FEATURE 4: PDF DOWNLOAD ── */
function initDownloadButton() {
  const topbarRight = document.querySelector('.topbar-right');
  if (!topbarRight || document.querySelector('.download-chat-btn')) return;
  
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'ibtn download-chat-btn';
  downloadBtn.innerHTML = '📄';
  downloadBtn.title = UI[lang].downloadTitle;
  downloadBtn.onclick = downloadChatPDF;
  
  const langToggle = topbarRight.querySelector('.lang-toggle');
  if (langToggle) {
    topbarRight.insertBefore(downloadBtn, langToggle);
  } else {
    topbarRight.appendChild(downloadBtn);
  }
}

function downloadChatPDF() {
  const chatArea = document.getElementById('chatArea');
  const messages = Array.from(chatArea.querySelectorAll('.msg:not(.typing-indicator)'));
  const auth = getAuth();
  const userName = auth?.name || 'User';
  
  let htmlContent = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Uniguide Chat Report</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; background: #f5f5f5; }
      .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #c9a84c; }
      .logo { font-size: 32px; }
      h1 { color: #0d1b2a; margin: 10px 0; }
      .date { color: #666; font-size: 12px; }
      .msg { margin: 20px 0; display: flex; gap: 12px; }
      .bot-msg { background: white; border-left: 4px solid #c9a84c; padding: 12px 16px; border-radius: 12px; }
      .user-msg { background: #e8c87a20; border-left: 4px solid #0d1b2a; padding: 12px 16px; border-radius: 12px; }
      .role { font-weight: bold; margin-bottom: 6px; font-size: 12px; color: #666; }
      .time { font-size: 10px; color: #999; margin-top: 6px; text-align: right; }
      .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">🎓</div>
      <h1>Uniguide Conversation</h1>
      <p>${userName}</p>
      <div class="date">${new Date().toLocaleString()}</div>
    </div>
  `;
  
  messages.forEach(msg => {
    const isBot = msg.classList.contains('bot');
    const role = isBot ? '🤖 UniGuide' : '👤 You';
    const bubble = msg.querySelector('.msg-bubble');
    const text = bubble?.innerHTML || bubble?.innerText || '';
    const timeEl = msg.querySelector('.msg-time');
    const time = timeEl?.textContent || '';
    
    htmlContent += `
      <div class="msg">
        <div class="${isBot ? 'bot-msg' : 'user-msg'}" style="flex:1">
          <div class="role">${role}</div>
          <div>${text}</div>
          <div class="time">${time}</div>
        </div>
      </div>
    `;
  });
  
  htmlContent += `
    <div class="footer">
      <p>Generated by Uniguide — State University of Bangladesh Admission Help Desk</p>
    </div>
  </body>
  </html>`;
  
  const blob = new Blob([htmlContent], {type: 'text/html'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `uniguide-chat-${Date.now()}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
  
  toast(lang === 'en' ? 'Chat downloaded! 📄' : 'চ্যাট ডাউনলোড হয়েছে! 📄', 'ok');
}

/* ── NEW FEATURE 5: SMART SUGGESTIONS ── */
function initSmartSuggestions() {
  const userInput = document.getElementById('userInput');
  if (!userInput) return;
  
  const inputWrap = document.querySelector('.input-wrap-outer');
  if (!inputWrap || document.querySelector('#suggestionsBar')) return;
  
  const suggDiv = document.createElement('div');
  suggDiv.id = 'suggestionsBar';
  suggDiv.className = 'suggestions-bar';
  inputWrap.insertBefore(suggDiv, inputWrap.firstChild);
  
  const suggestionMap = {
    'fee': ['tuition fees', 'scholarship', 'payment methods'],
    'fees': ['tuition fees', 'scholarship', 'payment methods'],
    'gpa': ['GPA requirement for CSE', 'minimum GPA', 'combined GPA requirement'],
    'deadline': ['application deadline Spring', 'Summer deadline', 'Fall deadline'],
    'apply': ['how to apply online', 'application steps', 'required documents'],
    'requirement': ['admission requirements', 'eligibility criteria', 'document requirements'],
    'scholarship': ['merit scholarship', 'financial aid', 'tuition waiver'],
    'contact': ['admission office phone', 'university email', 'office address']
  };
  
  let suggestionTimeout;
  userInput.addEventListener('input', (e) => {
    clearTimeout(suggestionTimeout);
    suggestionTimeout = setTimeout(() => {
      const text = e.target.value.toLowerCase().trim();
      if (text.length < 2) {
        document.getElementById('suggestionsBar').innerHTML = '';
        return;
      }
      
      let suggestions = [];
      for (let [key, vals] of Object.entries(suggestionMap)) {
        if (text.includes(key)) {
          suggestions.push(...vals);
        }
      }
      
      if (suggestions.length > 0) {
        showSuggestions(suggestions.slice(0, 3));
      } else {
        document.getElementById('suggestionsBar').innerHTML = '';
      }
    }, 300);
  });
}

function showSuggestions(suggestions) {
  const suggDiv = document.getElementById('suggestionsBar');
  if (!suggDiv) return;
  
  suggDiv.innerHTML = suggestions.map(s => 
    `<button class="sugg-chip" onclick="quickAsk('${s.replace(/'/g, "\\'")}')">💡 ${escapeHtml(s)}</button>`
  ).join('');
}

/* ══════════════════════════════════════
   LOGIN PAGE 
══════════════════════════════════════ */
function initLoginPage() {
  var auth = getAuth();
  if (auth && auth.isLoggedIn) { window.location.href = 'index.html'; return; }

  var loginBtn = document.getElementById('loginBtn');
  if (!loginBtn) return;
  loginBtn.addEventListener('click', handleLogin);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleLogin();
  });

  ['lName','lEmail','lPass'].forEach(function(id) {
    var map = { lName:'name', lEmail:'email', lPass:'pass' };
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function(){ setFW(map[id], false); });
  });
}

function setFW(field, hasError) {
  var fw = document.getElementById('fw-' + field);
  var fe = document.getElementById('fe-' + field);
  if (fw) fw.classList.toggle('err', hasError);
  if (fe) fe.classList.toggle('show', hasError);
}

function handleLogin() {
  var nameEl  = document.getElementById('lName');
  var emailEl = document.getElementById('lEmail');
  var passEl  = document.getElementById('lPass');
  var name  = (nameEl  ? nameEl.value  : '').trim();
  var email = (emailEl ? emailEl.value : '').trim();
  var pass  = (passEl  ? passEl.value  : '').trim();

  var ok = true;
  if (!name)                                             { setFW('name',  true); ok = false; } else setFW('name',  false);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))       { setFW('email', true); ok = false; } else setFW('email', false);
  if (!pass || pass.length < 6)                         { setFW('pass',  true); ok = false; } else setFW('pass',  false);

  if (!ok) { toast('Fix the errors above.', 'bad'); return; }

  var btn = document.getElementById('loginBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }

  store.del(WK);
  setAuth({ isLoggedIn: true, name: name, email: email });
  toast('Welcome, ' + name + '!', 'ok');
  setTimeout(function() { window.location.href = 'index.html'; }, 900);
}

/* ══════════════════════════════════════
   CHAT PAGE INIT
══════════════════════════════════════ */
var currentMsgs = [];

function initChatPage() {
  var auth = getAuth();
  if (!auth || !auth.isLoggedIn) { window.location.href = 'login.html'; return; }

  var name = auth.name || 'User';
  var nameEl   = document.getElementById('sbName');
  var avatarEl = document.getElementById('sbAvatar');
  var emailEl  = document.getElementById('ddEmail');
  if (nameEl)   nameEl.textContent   = name;
  if (avatarEl) avatarEl.textContent = name[0].toUpperCase();
  if (emailEl)  emailEl.textContent  = auth.email || '';

  var hasSeenWelcome = store.get(WK);
  if (!hasSeenWelcome) {
    renderWelcomePanel(name);
    store.set(WK, 'true');
  } else {
    var actId = getActId();
    var chats = getChats();
    if (actId && chats.find(function(c){ return c.id === actId; })) {
      loadChat(actId);
    } else {
      renderEmptyState();
    }
  }

  renderChatList();
  bindChatPageEvents();
  initQuickActions();
}

/* ══════════════════════════════════════
   LANGUAGE — switches ALL UI text
══════════════════════════════════════ */
function setLang(l) {
  lang = l;
  var s = UI[l];

  var enBtn = document.getElementById('btn-en');
  var bnBtn = document.getElementById('btn-bn');
  if (enBtn) enBtn.classList.toggle('active', l === 'en');
  if (bnBtn) bnBtn.classList.toggle('active', l === 'bn');

  var input = document.getElementById('userInput');
  if (input) input.placeholder = s.placeholder;

  var statusText = document.getElementById('statusText');
  if (statusText) statusText.textContent = s.statusText;

  var topbarSub = document.getElementById('topbarSub');
  if (topbarSub) topbarSub.textContent = s.topbarSub;

  var qaHeader = document.getElementById('qaMenuHeader');
  if (qaHeader) qaHeader.textContent = s.qaMenuHeader;

  document.querySelectorAll('.qa-label').forEach(function(el) {
    el.textContent = el.getAttribute('data-' + l) || el.textContent;
  });

  var wpSub = document.getElementById('wpSubtitle');
  if (wpSub) wpSub.textContent = s.welcomeSubtitle;

  document.querySelectorAll('.wp-chip').forEach(function(el) {
    var key = el.getAttribute('data-' + l);
    if (key) el.innerHTML = el.querySelector('.wp-chip-ico') ? el.querySelector('.wp-chip-ico').outerHTML + key : key;
  });

  var clearBtn = document.getElementById('clearBtn');
  if (clearBtn) clearBtn.title = s.clearTitle;

  var es = document.getElementById('emptyStateText');
  if (es) es.textContent = s.emptyState;
  
  var downloadBtn = document.querySelector('.download-chat-btn');
  if (downloadBtn) downloadBtn.title = s.downloadTitle;
  
  var searchInput = document.getElementById('searchChatsInput');
  if (searchInput) searchInput.placeholder = s.searchPlaceholder;
}

/* ══════════════════════════════════════
   WELCOME PANEL 
══════════════════════════════════════ */
function renderWelcomePanel(name) {
  var area = document.getElementById('chatArea');
  if (!area) return;
  area.innerHTML = '';
  var s = UI[lang];
  var initial = name ? name[0].toUpperCase() : '?';

  var panel = document.createElement('div');
  panel.className = 'welcome-panel';
  panel.id = 'welcomePanel';
  panel.innerHTML =
    '<div class="wp-avatar">' + initial + '</div>' +
    '<div class="wp-greeting">Hello, <span>' + escHtml(name) + '</span> 👋</div>' +
    '<div class="wp-rule"></div>' +
    '<div class="wp-subtitle" id="wpSubtitle">' + s.welcomeSubtitle + '</div>';

  area.appendChild(panel);
}

function makeChip(ico, topic, enLabel, bnLabel) {
  var label = lang === 'bn' ? bnLabel : enLabel;
  return '<button class="wp-chip" data-topic="' + topic + '" data-en="' + enLabel + '" data-bn="' + bnLabel + '" onclick="quickAsk(\'' + topic + '\')">' +
    '<span class="wp-chip-ico">' + ico + '</span>' + label +
    '</button>';
}

function hideWelcomePanel(callback) {
  var panel = document.getElementById('welcomePanel');
  if (!panel) { if (callback) callback(); return; }
  panel.classList.add('wp-fade-out');
  setTimeout(function() {
    if (panel.parentElement) panel.parentElement.removeChild(panel);
    if (callback) callback();
  }, 340);
}

function renderEmptyState() {
  var area = document.getElementById('chatArea');
  if (!area) return;
  var s = UI[lang];
  area.innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-state-icon">🎓</div>' +
      '<p id="emptyStateText">' + s.emptyState + '</p>' +
    '</div>';
}

/* ══════════════════════════════════════
   QUICK ACTIONS MENU 
══════════════════════════════════════ */
function initQuickActions() {
  var qaBtn  = document.getElementById('qaBtn');
  var qaMenu = document.getElementById('qaMenu');
  if (!qaBtn || !qaMenu) return;

  qaBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = qaMenu.classList.contains('qa-open');
    if (isOpen) { closeQaMenu(); } else { openQaMenu(); }
  });

  document.addEventListener('click', function() { closeQaMenu(); });
  qaMenu.addEventListener('click', function(e) { e.stopPropagation(); });

  document.querySelectorAll('.qa-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var topic = btn.getAttribute('data-topic');
      if (topic) quickAsk(topic);
      closeQaMenu();
    });
  });
}

function openQaMenu() {
  var qaBtn  = document.getElementById('qaBtn');
  var qaMenu = document.getElementById('qaMenu');
  if (qaBtn)  qaBtn.classList.add('qa-active');
  if (qaMenu) qaMenu.classList.add('qa-open');
}

function closeQaMenu() {
  var qaBtn  = document.getElementById('qaBtn');
  var qaMenu = document.getElementById('qaMenu');
  if (qaBtn)  qaBtn.classList.remove('qa-active');
  if (qaMenu) qaMenu.classList.remove('qa-open');
}

/* ══════════════════════════════════════
   CHAT DATA HELPERS
══════════════════════════════════════ */
function createChat(title) {
  var id = 'c_' + Date.now();
  var chats = getChats();
  chats.unshift({ id: id, title: title || 'New Chat', messages: [], createdAt: Date.now() });
  saveChats(chats);
  setActId(id);
  return id;
}
function getChatById(id) {
  return getChats().find(function(c){ return c.id === id; }) || null;
}
function saveMsgs(id, msgs) {
  var chats = getChats();
  var i = chats.findIndex(function(c){ return c.id === id; });
  if (i >= 0) { chats[i].messages = msgs; saveChats(chats); }
}
function saveTitle(id, title) {
  var chats = getChats();
  var i = chats.findIndex(function(c){ return c.id === id; });
  if (i >= 0) { chats[i].title = title; saveChats(chats); }
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function esc(s) { return escHtml(s); }

/* ── Chat List ── */
function renderChatList() {
  var chats = getChats();
  var actId = getActId();
  var list  = document.getElementById('chatList');
  if (!list) return;
  list.innerHTML = '';
  if (!chats.length) {
    list.innerHTML = '<div class="sb-empty">No chats yet.<br>Start a new conversation!</div>';
    return;
  }
  chats.forEach(function(c) {
    var btn = document.createElement('button');
    btn.className = 'chat-item has-tip' + (c.id === actId ? ' active' : '');
    btn.dataset.id = c.id;
    btn.innerHTML =
      '<span class="ci-ico">💬</span>' +
      '<span class="ci-title">' + esc(c.title) + '</span>' +
      '<span class="tip">' + esc(c.title) + '</span>';
    btn.addEventListener('click', function(){ loadChat(c.id); });
    list.appendChild(btn);
  });
}

/* ── Load / Rebuild ── */
function loadChat(id) {
  setActId(id);
  var chat = getChatById(id);
  if (!chat) return;
  currentMsgs = (chat.messages || []).slice();
  renderChatList();
  rebuildArea();
  closeMob();
}

function rebuildArea() {
  var area = document.getElementById('chatArea');
  if (!area) return;
  area.innerHTML = '';
  if (!currentMsgs.length) { renderEmptyState(); return; }
  currentMsgs.forEach(function(m){ addMsgEl(m.html, m.role, false); });
}

/* ── Add Message ── */
function addMsgEl(html, role, animate) {
  if (animate === undefined) animate = true;
  var area = document.getElementById('chatArea');
  if (!area) return;

  var panel = document.getElementById('welcomePanel');
  if (panel) {
    hideWelcomePanel(function() { _appendMsg(area, html, role, animate); });
    return;
  }

  var es = area.querySelector('.empty-state');
  if (es) area.removeChild(es);

  _appendMsg(area, html, role, animate);
}

function _appendMsg(area, html, role, animate) {
  var d = document.createElement('div');
  d.className = 'msg ' + role;
  if (!animate) d.style.animation = 'none';

  var av = document.createElement('div');
  av.className = 'msg-av ' + (role === 'bot' ? 'bot-av' : 'user-av');
  av.textContent = role === 'bot' ? '🤖' : '👤';

  var inner  = document.createElement('div'); inner.className = 'msg-inner';
  var bubble = document.createElement('div'); bubble.className = 'msg-bubble'; bubble.innerHTML = html;
  var time   = document.createElement('div'); time.className = 'msg-time';
  time.textContent = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });

  inner.appendChild(bubble);
  inner.appendChild(time);
  d.appendChild(av);
  d.appendChild(inner);
  area.appendChild(d);
  area.scrollTop = area.scrollHeight;
}

/* ── Send ── */
function sendMessage() {
  var input = document.getElementById('userInput');
  if (!input) return;
  var text = input.value.trim();
  if (!text) return;

  var actId = getActId();
  if (!actId || !getChatById(actId)) {
    actId = createChat(text.substring(0, 38) + (text.length > 38 ? '…' : ''));
    renderChatList();
  } else if (!currentMsgs.length) {
    saveTitle(actId, text.substring(0, 38) + (text.length > 38 ? '…' : ''));
    renderChatList();
  }

  var uMsg = { role:'user', html: esc(text) };
  currentMsgs.push(uMsg);
  saveMsgs(actId, currentMsgs);
  addMsgEl(esc(text), 'user');
  input.value = '';
  input.style.height = 'auto';

  showTyping();
  setTimeout(function() {
    removeTyping();
    var intent = classify(text);
    var html   = intent === 'fallback' ? KB.fallback[lang](esc(text)) : KB[intent][lang]();
    var bMsg   = { role:'bot', html: html };
    currentMsgs.push(bMsg);
    saveMsgs(actId, currentMsgs);
    addMsgEl(html, 'bot');
  }, 600 + Math.random() * 600);
}

function showTyping() {
  var area = document.getElementById('chatArea');
  if (!area) return;
  var es = area.querySelector('.empty-state');
  if (es) area.removeChild(es);
  var d    = document.createElement('div'); d.className = 'typing-indicator'; d.id = 'tEl';
  var av   = document.createElement('div'); av.className = 'msg-av bot-av'; av.textContent = '🤖';
  var dots = document.createElement('div'); dots.className = 'typing-dots';
  dots.innerHTML = '<span></span><span></span><span></span>';
  d.appendChild(av); d.appendChild(dots);
  area.appendChild(d);
  area.scrollTop = area.scrollHeight;
}
function removeTyping() { var t = document.getElementById('tEl'); if (t) t.remove(); }

function quickAsk(topic) {
  closeQaMenu();
  
  // Topic অনুযায়ী পেজ রিডাইরেক্ট করুন
  const topicLinks = {
    'admission requirements': 'requirement.html',
    'GPA requirement': 'gpa.html',
    'tuition fees': 'fees.html',
    'scholarship': 'scholarship.html',
    'application deadline': 'deadline.html',
    'how to apply': 'howtoapply.html',
  };
  
  // চেক করুন topic টি লিংকে আছে কিনা
  if (topicLinks[topic]) {
    window.location.href = topicLinks[topic];
  } else {
    // Fallback: চ্যাটে মেসেজ পাঠান
    var input = document.getElementById('userInput');
    if (input) { 
      input.value = topic; 
      sendMessage(); 
    }
  }
}
function clearCurrentChat() {
  var actId = getActId();
  if (actId) saveMsgs(actId, []);
  currentMsgs = [];
  renderEmptyState();
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

/* ── Page Events ── */
function bindChatPageEvents() {
  var collapseBtn = document.getElementById('collapseBtn');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', function() {
      var sb = document.getElementById('sidebar');
      if (!sb) return;
      var collapsed = sb.classList.toggle('collapsed');
      var lbl = collapsed ? 'Open sidebar' : 'Close sidebar';
      var labelEl = collapseBtn.querySelector('.sb-label');
      var tipEl   = collapseBtn.querySelector('.tip');
      if (labelEl) labelEl.textContent = lbl;
      if (tipEl)   tipEl.textContent   = lbl;
    });
  }

  var mobToggle = document.getElementById('mobToggle');
  if (mobToggle) {
    mobToggle.addEventListener('click', function() {
      var sb = document.getElementById('sidebar');
      var ov = document.getElementById('sbOverlay');
      if (sb) sb.classList.add('mob-open');
      if (ov) ov.classList.add('show');
    });
  }

  var sbOverlay = document.getElementById('sbOverlay');
  if (sbOverlay) sbOverlay.addEventListener('click', closeMob);

  var newChatBtn = document.getElementById('newChatBtn');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', function() {
      createChat('New Chat');
      currentMsgs = [];
      renderChatList();
      renderEmptyState();
      closeMob();
    });
  }

  var profileBtn = document.getElementById('profileBtn');
  var pdrop      = document.getElementById('pdrop');
  if (profileBtn && pdrop) {
    profileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      pdrop.classList.toggle('open');
    });
    pdrop.addEventListener('click', function(e){ e.stopPropagation(); });
    document.addEventListener('click', function(){ pdrop.classList.remove('open'); });
  }

  var ddLang = document.getElementById('ddLang');
  if (ddLang) {
    ddLang.addEventListener('click', function() {
      var newLang = lang === 'en' ? 'bn' : 'en';
      setLang(newLang);
      toast(newLang === 'en' ? 'Switched to English' : 'বাংলায় পরিবর্তিত', 'ok');
    });
  }

  var ddLogout = document.getElementById('ddLogout');
  if (ddLogout) {
    ddLogout.addEventListener('click', function() {
      clearAuth();
      store.del(VK);
      store.del(WK);
      currentMsgs = [];
      toast('Logged out.');
      setTimeout(function(){ window.location.href = 'login.html'; }, 700);
    });
  }
}

function closeMob() {
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sbOverlay');
  if (sb) sb.classList.remove('mob-open');
  if (ov) ov.classList.remove('show');
}

/* ══════════════════════════════════════
   KNOWLEDGE BASE
══════════════════════════════════════ */
var KB = {
  greeting: {
    keywords: ['hello','hi','hey','salam','greetings','হ্যালো','হাই'],
    en: function(){ return '<strong>Hello! Welcome to Uniguide!</strong> 🎓<br><br>I\'m your virtual admission assistant for <strong>State University of Bangladesh</strong>.'; },
    bn: function(){ return '<strong>ইউনিগাইডে স্বাগতম!</strong> 🎓<br><br>আমি <strong>স্টেট ইউনিভার্সিটি অব বাংলাদেশ</strong>-এর ভার্চুয়াল ভর্তি সহকারী।'; }
  },
  requirements: {
    keywords: ['requirement','eligibility','qualify','eligible','admission','criteria','apply','minimum'],
    en: function(){ return '<strong>Admission Requirements</strong> 📋<br><br><div class="info-card">SSC + HSC minimum combined GPA of 6.00.</div>'; },
    bn: function(){ return '<strong>ভর্তির যোগ্যতা</strong> 📋<br><br><div class="info-card">SSC ও HSC মিলিয়ে ন্যূনতম GPA ৬.০০।</div>'; }
  },
  gpa: {
    keywords: ['gpa','grade','point','average','result','marks','score'],
    en: function(){ return '<strong>GPA Requirements</strong> 📊<br><br>CSE: 7.00, BBA: 6.50'; },
    bn: function(){ return '<strong>জিপিএ প্রয়োজনীয়তা</strong> 📊<br><br>CSE: ৭.০০, BBA: ৬.৫০'; }
  },
  fees: {
    keywords: ['fee','cost','tuition','payment','charge','price','money','semester'],
    en: function(){ return '<strong>Tuition Fees</strong> 💰<br><br>CSE: 22,000-28,000 BDT/semester'; },
    bn: function(){ return '<strong>টিউশন ফি</strong> 💰<br><br>CSE: ২২,০০০-২৮,০০০ টাকা/সেমিস্টার'; }
  },
  scholarship: {
    keywords: ['scholarship','financial','aid','waiver','free','discount','grant'],
    en: function(){ return '<strong>Scholarships</strong> 🏆<br><br>Golden GPA: 100% waiver'; },
    bn: function(){ return '<strong>বৃত্তি</strong> 🏆<br><br>গোল্ডেন জিপিএ: ১০০% মওকুফ'; }
  },
  deadline: {
    keywords: ['deadline','last date','when','date','schedule','intake','spring','fall','summer'],
    en: function(){ return '<strong>Deadlines</strong> 📅<br><br>Spring: Nov 1 - Dec 31'; },
    bn: function(){ return '<strong>শেষ তারিখ</strong> 📅<br><br>স্প্রিং: নভেম্বর ১ - ডিসেম্বর ৩১'; }
  },
  howToApply: {
    keywords: ['how to apply','process','procedure','step','register','form'],
    en: function(){ return '<strong>How to Apply</strong> ✍️<br><br>Visit sub.edu.bd/admission'; },
    bn: function(){ return '<strong>কীভাবে আবেদন করবেন</strong> ✍️<br><br>sub.edu.bd/admission-এ যান'; }
  },
  contact: {
    keywords: ['contact','phone','email','address','office','helpline'],
    en: function(){ return '<strong>Contact</strong> 📞<br><br>admission@sub.edu.bd | +880-2-9671183'; },
    bn: function(){ return '<strong>যোগাযোগ</strong> 📞<br><br>admission@sub.edu.bd | +৮৮০-২-৯৬৭১১৮৩'; }
  },
  thanks: {
    keywords: ['thank','thanks','thank you','thnx','ধন্যবাদ','শুক্রিয়া'],
    en: function(){ return 'You\'re welcome! 😊 Best of luck!'; },
    bn: function(){ return 'আপনাকে স্বাগতম! 😊 শুভকামনা!'; }
  },
  fallback: {
    en: function(q){ return 'I didn\'t understand "' + q + '". Try asking about requirements, GPA, fees, scholarships, deadlines, or how to apply.'; },
    bn: function(q){ return '"' + q + '" বুঝতে পারিনি। ভর্তির যোগ্যতা, জিপিএ, ফি, বৃত্তি, শেষ তারিখ সম্পর্কে জিজ্ঞেস করুন।'; }
  }
};

/* ══════════════════════════════════════
   NLP
══════════════════════════════════════ */
function lev(a, b) {
  var dp = [], i, j;
  for (i = 0; i <= a.length; i++) {
    dp[i] = [];
    for (j = 0; j <= b.length; j++) dp[i][j] = i===0 ? j : j===0 ? i : 0;
  }
  for (i = 1; i <= a.length; i++)
    for (j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[a.length][b.length];
}
function fuzzy(w, k) {
  if (k.indexOf(w) !== -1 || w.indexOf(k) !== -1) return true;
  return lev(w.toLowerCase(), k.toLowerCase()) <= Math.max(1, Math.floor(k.length * 0.3));
}
function classify(input) {
  var lower = input.toLowerCase().trim();
  var words = lower.split(/\s+/);
  var best = null, score = 0;
  for (var intent in KB) {
    if (intent === 'fallback') continue;
    var data = KB[intent], s = 0;
    for (var ki = 0; ki < data.keywords.length; ki++) {
      var kw = data.keywords[ki];
      if (lower.indexOf(kw) !== -1) { s += kw.split(' ').length * 2; continue; }
      for (var wi = 0; wi < words.length; wi++) {
        if (words[wi].length >= 3 && fuzzy(words[wi], kw)) s += 0.8;
      }
    }
    if (s > score) { score = s; best = intent; }
  }
  return score > 0.5 ? best : 'fallback';
}