/* ══════════════════════════════════════════════════════
   UNIGUIDE — script.js  (fixed)
══════════════════════════════════════════════════════ */
 
/* ──────────────────────────────────────
   SAFE STORAGE — works on file:// AND http://
────────────────────────────────────── */
const _mem = {};
const store = {
  get(k)    { try { return localStorage.getItem(k); }    catch(e) { return _mem[k] != null ? _mem[k] : null; } },
  set(k, v) { try { localStorage.setItem(k, v); }        catch(e) { _mem[k] = v; } },
  del(k)    { try { localStorage.removeItem(k); }        catch(e) { delete _mem[k]; } }
};
 
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('login-page')) {
    initLoginPage();
  } else if (document.body.classList.contains('chat-page')) {
    initChatPage();
  }
});
 
/* ── Storage helpers ── */
const AK = 'ug_auth';
const CK = 'ug_chats';
const VK = 'ug_active';
 
const getAuth   = () => { try { return JSON.parse(store.get(AK)) || null; } catch(e) { return null; } };
const setAuth   = d  => store.set(AK, JSON.stringify(d));
const clearAuth = () => store.del(AK);
const getChats  = () => { try { return JSON.parse(store.get(CK)) || []; } catch(e) { return []; } };
const saveChats = c  => store.set(CK, JSON.stringify(c));
const getActId  = () => store.get(VK) || null;
const setActId  = id => store.set(VK, id);
 
/* ── Toast ── */
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
 
  setAuth({ isLoggedIn: true, name: name, email: email });
  toast('Welcome, ' + name + '!', 'ok');
  setTimeout(function() { window.location.href = 'index.html'; }, 900);
  console.log("clicked");
}
 
/* ══════════════════════════════════════
   CHAT PAGE
══════════════════════════════════════ */
var currentMsgs = [];
var lang = 'en';
 
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
 
  renderWelcomeScreen();
 
  var actId = getActId();
  var chats = getChats();
  if (actId && chats.find(function(c){ return c.id === actId; })) {
    loadChat(actId);
  }
 
  renderChatList();
  bindChatPageEvents();
}
 
/* ── Welcome Screen ── */
function renderWelcomeScreen() {
  var area = document.getElementById('chatArea');
  if (!area) return;
  if (currentMsgs.length) return;
  area.innerHTML = '';
  var ws = document.createElement('div');
  ws.className = 'welcome-screen';
  ws.id = 'welcomeScreen';
  ws.innerHTML =
    '<div class="wico">🎓</div>' +
    '<h2><span>Uni</span>guide</h2>' +
    '<p>Your AI-powered admission assistant for <strong>State University of Bangladesh</strong>.<br>' +
    'Ask anything about admissions, fees, deadlines, and more!</p>' +
    '<div class="welcome-hint">' +
    '<button class="welcome-chip" onclick="quickAsk(\'admission requirements\')">📋 Requirements</button>' +
    '<button class="welcome-chip" onclick="quickAsk(\'GPA requirement\')">📊 GPA</button>' +
    '<button class="welcome-chip" onclick="quickAsk(\'tuition fees\')">💰 Fees</button>' +
    '<button class="welcome-chip" onclick="quickAsk(\'scholarship\')">🏆 Scholarships</button>' +
    '<button class="welcome-chip" onclick="quickAsk(\'application deadline\')">📅 Deadlines</button>' +
    '<button class="welcome-chip" onclick="quickAsk(\'required documents\')">📄 Documents</button>' +
    '<button class="welcome-chip" onclick="quickAsk(\'how to apply\')">✍️ How to Apply</button>' +
    '<button class="welcome-chip" onclick="quickAsk(\'contact\')">📞 Contact</button>' +
    '</div>';
  area.appendChild(ws);
}
 
/* ── Chat Data Helpers ── */
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
 
function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
 
/* ── Render Chat List ── */
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
 
/* ── Load / Rebuild Chat ── */
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
  if (!currentMsgs.length) { renderWelcomeScreen(); return; }
  currentMsgs.forEach(function(m){ addMsgEl(m.html, m.role, false); });
}
 
/* ── Add Message Element ── */
function addMsgEl(html, role, animate) {
  if (animate === undefined) animate = true;
  var area = document.getElementById('chatArea');
  if (!area) return;
  var ws = document.getElementById('welcomeScreen');
  if (ws && ws.parentElement === area) area.removeChild(ws);
 
  var d    = document.createElement('div'); d.className = 'msg ' + role;
  if (!animate) d.style.animation = 'none';
  var av   = document.createElement('div');
  av.className = 'msg-av ' + (role === 'bot' ? 'bot-av' : 'user-av');
  av.textContent = role === 'bot' ? '🤖' : '👤';
  var inner  = document.createElement('div'); inner.className = 'msg-inner';
  var bubble = document.createElement('div'); bubble.className = 'msg-bubble'; bubble.innerHTML = html;
  var time   = document.createElement('div'); time.className = 'msg-time';
  time.textContent = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  inner.appendChild(bubble); inner.appendChild(time);
  d.appendChild(av); d.appendChild(inner);
  area.appendChild(d);
  area.scrollTop = area.scrollHeight;
}
 
/* ── Send Message ── */
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
  var ws = document.getElementById('welcomeScreen');
  if (ws && ws.parentElement === area) area.removeChild(ws);
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
  var input = document.getElementById('userInput');
  if (input) { input.value = topic; sendMessage(); }
}
 
function clearCurrentChat() {
  var actId = getActId();
  if (actId) saveMsgs(actId, []);
  currentMsgs = [];
  var area = document.getElementById('chatArea');
  if (area) { area.innerHTML = ''; renderWelcomeScreen(); }
}
 
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}
 
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}
 
/* ── Language ── */
function setLang(l) {
  lang = l;
  var enBtn = document.getElementById('btn-en');
  var bnBtn = document.getElementById('btn-bn');
  if (enBtn) enBtn.classList.toggle('active', l === 'en');
  if (bnBtn) bnBtn.classList.toggle('active', l === 'bn');
  var input = document.getElementById('userInput');
  if (input) input.placeholder = l === 'en' ? 'Ask anything about admissions…' : 'ভর্তি সম্পর্কে যেকোনো প্রশ্ন করুন…';
}
 
/* ── Sidebar Controls ── */
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
      var area = document.getElementById('chatArea');
      if (area) { area.innerHTML = ''; renderWelcomeScreen(); }
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
 
/* ══════════════════════════════════════════════════════
   KNOWLEDGE BASE
══════════════════════════════════════════════════════ */
var KB = {
  greeting: {
    keywords: ['hello','hi','hey','salam','greetings','হ্যালো','হাই'],
    en: function(){ return '<strong>Hello! Welcome to Uniguide!</strong> 🎓<br><br>I\'m your virtual admission assistant for <strong>State University of Bangladesh</strong>. I can help with:<br><ul><li>Admission requirements &amp; eligibility</li><li>GPA criteria by department</li><li>Tuition fees &amp; payment</li><li>Scholarships &amp; financial aid</li><li>Application deadlines</li><li>Required documents</li></ul><br>What would you like to know?'; },
    bn: function(){ return '<strong>ইউনিগাইডে স্বাগতম!</strong> 🎓<br><br>আমি <strong>স্টেট ইউনিভার্সিটি অব বাংলাদেশ</strong>-এর ভার্চুয়াল ভর্তি সহকারী।<br><ul><li>ভর্তির যোগ্যতা ও শর্তাবলী</li><li>জিপিএ মানদণ্ড</li><li>টিউশন ফি</li><li>বৃত্তি ও আর্থিক সহায়তা</li><li>আবেদনের শেষ তারিখ</li></ul><br>আপনি কী জানতে চান?'; }
  },
  requirements: {
    keywords: ['requirement','eligibility','qualify','eligible','admission','criteria','apply','minimum','ভর্তি','যোগ্যতা','শর্ত'],
    en: function(){ return '<strong>Admission Requirements</strong> 📋<br><br><div class="info-card"><div class="label">Undergraduate (BSc/BA/BBA)</div><ul><li>SSC + HSC minimum GPA of <strong>6.00 combined</strong></li><li>No individual grade below 2.50</li><li>O-Level / A-Level equivalents accepted</li></ul></div><div class="info-card"><div class="label">CSE / Engineering</div><ul><li>SSC + HSC combined GPA ≥ 7.00</li><li>Physics and Mathematics at HSC required</li><li>Minimum GPA 3.00 in both SSC and HSC separately</li></ul></div>'; },
    bn: function(){ return '<strong>ভর্তির যোগ্যতা</strong> 📋<br><br><div class="info-card"><div class="label">স্নাতক (BSc/BA/BBA)</div><ul><li>SSC ও HSC মিলিয়ে ন্যূনতম GPA <strong>৬.০০</strong></li><li>O-Level / A-Level সমতুল্য গ্রহণযোগ্য</li></ul></div><div class="info-card"><div class="label">CSE / ইঞ্জিনিয়ারিং</div><ul><li>GPA ≥ ৭.০০ | HSC-তে পদার্থবিজ্ঞান ও গণিত আবশ্যক</li></ul></div>'; }
  },
  gpa: {
    keywords: ['gpa','grade','point','average','result','marks','score','জিপিএ','গ্রেড','নম্বর'],
    en: function(){ return '<strong>GPA Requirements</strong> 📊<br><br><div class="info-card"><div class="label">Minimum GPA (SSC+HSC Combined)</div><ul><li><strong>CSE / EEE:</strong> ≥ 7.00 (min 3.00 each)</li><li><strong>BBA / MBA:</strong> ≥ 6.50</li><li><strong>English / Social Science:</strong> ≥ 6.00</li><li><strong>Law:</strong> ≥ 6.50</li><li><strong>Architecture:</strong> ≥ 7.50 + portfolio</li></ul></div><br>💡 <em>Merit-based selection — minimum GPA alone doesn\'t guarantee admission.</em>'; },
    bn: function(){ return '<strong>জিপিএ প্রয়োজনীয়তা</strong> 📊<br><br><div class="info-card"><div class="label">বিভাগ অনুযায়ী ন্যূনতম জিপিএ</div><ul><li><strong>CSE / EEE:</strong> ≥ ৭.০০</li><li><strong>BBA / MBA:</strong> ≥ ৬.৫০</li><li><strong>ইংরেজি:</strong> ≥ ৬.০০</li><li><strong>আইন:</strong> ≥ ৬.৫০</li></ul></div>'; }
  },
  fees: {
    keywords: ['fee','cost','tuition','payment','charge','price','money','semester','ফি','খরচ','টাকা','বেতন'],
    en: function(){ return '<strong>Tuition Fees &amp; Costs</strong> 💰<br><br><div class="info-card"><div class="label">Per Semester (Approx.)</div><ul><li><strong>CSE / EEE:</strong> BDT 22,000–28,000</li><li><strong>BBA:</strong> BDT 18,000–24,000</li><li><strong>English / Arts:</strong> BDT 14,000–18,000</li><li><strong>Law:</strong> BDT 16,000–20,000</li></ul></div><div class="info-card"><div class="label">One-Time Admission Fees</div><ul><li>Registration: BDT 5,000 | Library: BDT 1,000</li><li>Lab (CSE/EEE): BDT 3,000/semester</li></ul></div>'; },
    bn: function(){ return '<strong>টিউশন ফি</strong> 💰<br><br><div class="info-card"><div class="label">প্রতি সেমিস্টার</div><ul><li><strong>CSE/EEE:</strong> ২২,০০০–২৮,০০০ টাকা</li><li><strong>BBA:</strong> ১৮,০০০–২৪,০০০ টাকা</li><li><strong>আর্টস:</strong> ১৪,০০০–১৮,০০০ টাকা</li></ul></div>'; }
  },
  scholarship: {
    keywords: ['scholarship','financial','aid','waiver','free','discount','grant','বৃত্তি','ফি মওকুফ','আর্থিক'],
    en: function(){ return '<strong>Scholarships &amp; Financial Aid</strong> 🏆<br><br><div class="info-card"><div class="label">Merit-Based</div><ul><li><strong>Golden GPA:</strong> 100% waiver (GPA 5.00 in both SSC &amp; HSC)</li><li><strong>Merit:</strong> 50% waiver (combined ≥ 9.00)</li><li><strong>Academic Excellence:</strong> 25% waiver (combined ≥ 8.00)</li></ul></div><div class="info-card"><div class="label">Other Aid</div><ul><li>Freedom Fighter descendants: 50% waiver</li><li>Sibling discount: 10% | Need-based assistance available</li></ul></div>'; },
    bn: function(){ return '<strong>বৃত্তি ও সহায়তা</strong> 🏆<br><br><div class="info-card"><div class="label">মেধাভিত্তিক বৃত্তি</div><ul><li><strong>গোল্ডেন জিপিএ:</strong> ১০০% ফি মওকুফ</li><li><strong>মেধা বৃত্তি:</strong> GPA ≥ ৯.০০ → ৫০%</li><li><strong>একাডেমিক উৎকর্ষ:</strong> GPA ≥ ৮.০০ → ২৫%</li></ul></div>'; }
  },
  deadline: {
    keywords: ['deadline','last date','when','date','schedule','intake','spring','fall','summer','শেষ তারিখ','কবে'],
    en: function(){ return '<strong>Application Deadlines</strong> 📅<br><br><div class="info-card"><div class="label">Academic Year 2025–2026</div><ul><li><strong>Spring:</strong> Apply Nov 1 – Dec 31 | Classes: Jan 2026</li><li><strong>Summer:</strong> Apply Mar 1 – Apr 30 | Classes: May 2026</li><li><strong>Fall:</strong> Apply Jul 1 – Aug 31 | Classes: Sep 2026</li></ul></div><br>⚠️ <em>Late applications will not be considered.</em>'; },
    bn: function(){ return '<strong>আবেদনের শেষ তারিখ</strong> 📅<br><br><div class="info-card"><div class="label">শিক্ষাবর্ষ ২০২৫–২০২৬</div><ul><li><strong>স্প্রিং:</strong> নভেম্বর–ডিসেম্বর</li><li><strong>সামার:</strong> মার্চ–এপ্রিল</li><li><strong>ফল:</strong> জুলাই–আগস্ট</li></ul></div>'; }
  },
  documents: {
    keywords: ['document','paper','certificate','photo','nid','transcript','mark sheet','কাগজ','সার্টিফিকেট','ছবি'],
    en: function(){ return '<strong>Required Documents</strong> 📄<br><br><div class="info-card"><div class="label">Mandatory</div><ul><li>✅ Completed admission form (online + printed)</li><li>✅ SSC + HSC original marksheets &amp; certificates</li><li>✅ 4 passport-size photographs</li><li>✅ National ID / birth certificate (photocopy)</li><li>✅ Guardian\'s NID photocopy</li></ul></div><div class="info-card"><div class="label">Transfer Students</div><ul><li>Transcript, NOC, and migration certificate</li></ul></div>'; },
    bn: function(){ return '<strong>প্রয়োজনীয় কাগজপত্র</strong> 📄<br><br><div class="info-card"><div class="label">বাধ্যতামূলক</div><ul><li>✅ SSC ও HSC মার্কশিট ও সার্টিফিকেট</li><li>✅ ৪ কপি পাসপোর্ট সাইজ ছবি</li><li>✅ জাতীয় পরিচয়পত্র বা জন্মনিবন্ধন</li></ul></div>'; }
  },
  howToApply: {
    keywords: ['how to apply','process','procedure','step','register','form','কীভাবে','প্রক্রিয়া','ধাপ','আবেদন'],
    en: function(){ return '<strong>How to Apply</strong> ✍️<br><br><div class="info-card"><div class="label">Application Steps</div><ul><li><strong>1.</strong> Visit <em>sub.edu.bd/admission</em> and create an account</li><li><strong>2.</strong> Fill in the online admission form</li><li><strong>3.</strong> Upload scanned copies of documents</li><li><strong>4.</strong> Pay BDT 500 fee (bKash / Rocket / bank)</li><li><strong>5.</strong> Submit and download confirmation slip</li><li><strong>6.</strong> Attend admission test/interview if notified</li><li><strong>7.</strong> Check results and complete enrollment</li></ul></div>'; },
    bn: function(){ return '<strong>কীভাবে আবেদন করবেন</strong> ✍️<br><br><div class="info-card"><div class="label">আবেদনের ধাপসমূহ</div><ul><li><strong>১.</strong> sub.edu.bd/admission-এ অ্যাকাউন্ট তৈরি করুন</li><li><strong>২.</strong> অনলাইন ফর্ম পূরণ করুন</li><li><strong>৩.</strong> কাগজপত্র আপলোড করুন</li><li><strong>৪.</strong> ৫০০ টাকা ফি পরিশোধ করুন</li><li><strong>৫.</strong> আবেদন জমা দিন ও ফলাফল দেখুন</li></ul></div>'; }
  },
  contact: {
    keywords: ['contact','phone','email','address','office','helpline','যোগাযোগ','ফোন','ঠিকানা'],
    en: function(){ return '<strong>Contact Us</strong> 📞<br><br><div class="info-card"><div class="label">Admission Office</div><ul><li>📍 77 Satmasjid Road, Dhanmondi, Dhaka-1207</li><li>📞 +880-2-9671183–4</li><li>📧 admission@sub.edu.bd</li><li>🌐 www.sub.edu.bd</li><li>⏰ Sun–Thu: 9:00 AM – 5:00 PM</li></ul></div>'; },
    bn: function(){ return '<strong>যোগাযোগ করুন</strong> 📞<br><br><div class="info-card"><div class="label">ভর্তি অফিস</div><ul><li>📍 ৭৭ সাতমসজিদ রোড, ধানমন্ডি, ঢাকা-১২০৭</li><li>📞 +৮৮০-২-৯৬৭১১৮৩–৪ | 📧 admission@sub.edu.bd</li><li>⏰ রবি–বৃহস্পতি: সকাল ৯টা – বিকাল ৫টা</li></ul></div>'; }
  },
  thanks: {
    keywords: ['thank','thanks','thank you','thnx','ধন্যবাদ','শুক্রিয়া'],
    en: function(){ return 'You\'re most welcome! 😊<br><br>Best of luck with your admission to <strong>State University of Bangladesh!</strong> 🎓'; },
    bn: function(){ return 'আপনাকে স্বাগত! 😊 <strong>স্টেট ইউনিভার্সিটি অব বাংলাদেশ</strong>-এ ভর্তিতে শুভকামনা! 🎓'; }
  },
  fallback: {
    en: function(q){ return 'I didn\'t quite understand "<em>' + q + '</em>". 🤔<br><br>Try asking about:<br><ul><li>Admission requirements</li><li>GPA criteria</li><li>Tuition fees</li><li>Scholarships</li><li>Deadlines</li><li>Documents</li><li>How to apply</li></ul>'; },
    bn: function(q){ return '"<em>' + q + '</em>" বুঝতে পারিনি। 🤔<br>উপরের বিষয়গুলো সম্পর্কে জিজ্ঞেস করুন।'; }
  }
};
 
/* ── NLP ── */
function lev(a, b) {
  var dp = [];
  for (var i = 0; i <= a.length; i++) {
    dp[i] = [];
    for (var j = 0; j <= b.length; j++) {
      dp[i][j] = i === 0 ? j : j === 0 ? i : 0;
    }
  }
  for (var i = 1; i <= a.length; i++)
    for (var j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
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
    var data = KB[intent];
    var s = 0;
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