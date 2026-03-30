// ─── STATE ───────────────────────────────────────────────
let lang = 'en';
let conversationHistory = [];
 
// ─── KNOWLEDGE BASE ──────────────────────────────────────
const KB = {
  greeting: {
    keywords: ['hello','hi','hey','assalamu','salam','greetings','good morning','good afternoon','good evening','হ্যালো','হাই','আস্সালামু','নমস্কার'],
    en: () => `<strong>Welcome to Uniguide!</strong> 🎓<br><br>I'm your virtual admission assistant for <strong>State University of Bangladesh</strong>. I can help you with:<br><ul>
      <li>Admission requirements & eligibility</li>
      <li>GPA & academic criteria</li>
      <li>Tuition fees & payment</li>
      <li>Scholarships & financial aid</li>
      <li>Application deadlines</li>
      <li>Required documents</li>
      <li>How to apply</li>
    </ul><br>What would you like to know?`,
    bn: () => `<strong>ইউনিগাইডে স্বাগতম!</strong> 🎓<br><br>আমি <strong>স্টেট ইউনিভার্সিটি অব বাংলাদেশ</strong>-এর ভার্চুয়াল ভর্তি সহকারী। আমি আপনাকে সাহায্য করতে পারি:<br><ul>
      <li>ভর্তির যোগ্যতা ও শর্তাবলী</li>
      <li>জিপিএ ও একাডেমিক মানদণ্ড</li>
      <li>টিউশন ফি ও পেমেন্ট</li>
      <li>বৃত্তি ও আর্থিক সহায়তা</li>
      <li>আবেদনের শেষ তারিখ</li>
      <li>প্রয়োজনীয় কাগজপত্র</li>
    </ul><br>আপনি কী জানতে চান?`
  },
 
  requirements: {
    keywords: ['requirement','eligibility','qualify','eligible','admission','criteria','who can','apply','minimum','ভর্তি','যোগ্যতা','শর্ত','কে আবেদন'],
    en: () => `<strong>Admission Requirements</strong> 📋<br><br>To be eligible for admission at SUB, you must meet the following general criteria:<br>
      <div class="info-card"><div class="label">For Undergraduate (BSc/BA/BBA)</div>
        <ul>
          <li>SSC + HSC minimum GPA of <strong>6.00 combined</strong> (no individual grade below 2.50)</li>
          <li>Must have Science/Business/Arts background from a recognized board</li>
          <li>O-Level / A-Level equivalents accepted</li>
          <li>No third division in any public exam</li>
        </ul>
      </div>
      <div class="info-card"><div class="label">For CSE / Engineering</div>
        <ul>
          <li>SSC + HSC combined GPA ≥ 7.00</li>
          <li>Must have Physics and Mathematics at HSC</li>
          <li>Minimum GPA 3.00 in both SSC and HSC separately</li>
        </ul>
      </div>
      <br>Would you like to know more about a specific department?`,
    bn: () => `<strong>ভর্তির যোগ্যতা</strong> 📋<br><br>SUB-তে ভর্তির জন্য সাধারণ শর্তাবলী:<br>
      <div class="info-card"><div class="label">স্নাতক (BSc/BA/BBA)</div>
        <ul>
          <li>SSC ও HSC মিলিয়ে ন্যূনতম GPA <strong>৬.০০</strong> (কোনো বিষয়ে ২.৫০-এর নিচে নয়)</li>
          <li>যেকোনো স্বীকৃত বোর্ড থেকে বিজ্ঞান/বাণিজ্য/কলা বিভাগ</li>
          <li>O-Level / A-Level সমতুল্য গ্রহণযোগ্য</li>
        </ul>
      </div>
      <div class="info-card"><div class="label">CSE / ইঞ্জিনিয়ারিং</div>
        <ul>
          <li>SSC + HSC মিলিয়ে GPA ≥ ৭.০০</li>
          <li>HSC-তে পদার্থবিজ্ঞান ও গণিত থাকতে হবে</li>
          <li>SSC ও HSC প্রতিটিতে ন্যূনতম GPA ৩.০০</li>
        </ul>
      </div>`
  },
 
  gpa: {
    keywords: ['gpa','grade','point','average','result','marks','score','জিপিএ','গ্রেড','নম্বর','ফলাফল'],
    en: () => `<strong>GPA Requirements</strong> 📊<br><br>
      <div class="info-card"><div class="label">Minimum GPA by Department</div>
        <ul>
          <li><strong>CSE / EEE:</strong> SSC+HSC combined ≥ 7.00 (min 3.00 each)</li>
          <li><strong>BBA / MBA:</strong> SSC+HSC combined ≥ 6.50</li>
          <li><strong>English / Social Science:</strong> SSC+HSC combined ≥ 6.00</li>
          <li><strong>Law:</strong> SSC+HSC combined ≥ 6.50</li>
          <li><strong>Architecture:</strong> Combined ≥ 7.50 + portfolio</li>
        </ul>
      </div>
      <br>💡 <em>Note: Meeting minimum GPA doesn't guarantee admission — seats are limited and merit-based.</em>`,
    bn: () => `<strong>জিপিএ প্রয়োজনীয়তা</strong> 📊<br><br>
      <div class="info-card"><div class="label">বিভাগ অনুযায়ী ন্যূনতম জিপিএ</div>
        <ul>
          <li><strong>CSE / EEE:</strong> SSC+HSC মিলিয়ে ≥ ৭.০০</li>
          <li><strong>BBA / MBA:</strong> ≥ ৬.৫০</li>
          <li><strong>ইংরেজি / সামাজিক বিজ্ঞান:</strong> ≥ ৬.০০</li>
          <li><strong>আইন:</strong> ≥ ৬.৫০</li>
        </ul>
      </div>
      <br>💡 <em>ন্যূনতম জিপিএ পূরণ করলেই ভর্তি নিশ্চিত নয় — আসন সীমিত, মেধার ভিত্তিতে বাছাই হয়।</em>`
  },
 
  fees: {
    keywords: ['fee','cost','tuition','payment','charge','price','money','semester','credit','ফি','খরচ','টাকা','বেতন','টিউশন'],
    en: () => `<strong>Tuition Fees & Costs</strong> 💰<br><br>
      <div class="info-card"><div class="label">Approximate Per Semester Fees</div>
        <ul>
          <li><strong>CSE / EEE:</strong> BDT 22,000–28,000</li>
          <li><strong>BBA:</strong> BDT 18,000–24,000</li>
          <li><strong>English / Arts:</strong> BDT 14,000–18,000</li>
          <li><strong>Law:</strong> BDT 16,000–20,000</li>
        </ul>
      </div>
      <div class="info-card"><div class="label">One-Time Admission Fees</div>
        <ul>
          <li>Registration fee: BDT 5,000</li>
          <li>Library fee: BDT 1,000</li>
          <li>Lab fee (CSE/EEE): BDT 3,000/semester</li>
        </ul>
      </div>
      <br>💡 Fee waivers and installment payment options available for eligible students.`,
    bn: () => `<strong>টিউশন ফি ও খরচ</strong> 💰<br><br>
      <div class="info-card"><div class="label">প্রতি সেমিস্টার আনুমানিক ফি</div>
        <ul>
          <li><strong>CSE / EEE:</strong> ২২,০০০–২৮,০০০ টাকা</li>
          <li><strong>BBA:</strong> ১৮,০০০–২৪,০০০ টাকা</li>
          <li><strong>ইংরেজি / আর্টস:</strong> ১৪,০০০–১৮,০০০ টাকা</li>
          <li><strong>আইন:</strong> ১৬,০০০–২০,০০০ টাকা</li>
        </ul>
      </div>
      <br>💡 যোগ্য শিক্ষার্থীদের জন্য ফি ছাড় ও কিস্তিতে পেমেন্টের সুযোগ রয়েছে।`
  },
 
  scholarship: {
    keywords: ['scholarship','financial','aid','waiver','free','discount','bursary','grant','stipend','বৃত্তি','ফি মওকুফ','আর্থিক সহায়তা'],
    en: () => `<strong>Scholarships & Financial Aid</strong> 🏆<br><br>SUB offers several scholarship programs:<br>
      <div class="info-card"><div class="label">Merit-Based Scholarships</div>
        <ul>
          <li><strong>Golden GPA Scholarship:</strong> 100% tuition waiver for GPA 5.00 in both SSC & HSC</li>
          <li><strong>Merit Scholarship:</strong> 50% waiver for combined GPA ≥ 9.00</li>
          <li><strong>Academic Excellence:</strong> 25% waiver for combined GPA ≥ 8.00</li>
        </ul>
      </div>
      <div class="info-card"><div class="label">Other Financial Aid</div>
        <ul>
          <li>Freedom Fighter descendants: 50% tuition waiver</li>
          <li>Sibling discount: 10% for two or more siblings enrolled</li>
          <li>Need-based financial assistance (application required)</li>
          <li>University Grants Commission (UGC) stipends</li>
        </ul>
      </div>`,
    bn: () => `<strong>বৃত্তি ও আর্থিক সহায়তা</strong> 🏆<br><br>SUB বিভিন্ন বৃত্তি প্রদান করে:<br>
      <div class="info-card"><div class="label">মেধাভিত্তিক বৃত্তি</div>
        <ul>
          <li><strong>গোল্ডেন জিপিএ:</strong> SSC ও HSC উভয়তে ৫.০০ হলে ১০০% ফি মওকুফ</li>
          <li><strong>মেধা বৃত্তি:</strong> মিলিয়ে GPA ≥ ৯.০০ হলে ৫০% মওকুফ</li>
          <li><strong>একাডেমিক উৎকর্ষ:</strong> GPA ≥ ৮.০০ হলে ২৫% মওকুফ</li>
        </ul>
      </div>
      <div class="info-card"><div class="label">অন্যান্য সহায়তা</div>
        <ul>
          <li>মুক্তিযোদ্ধার সন্তান: ৫০% টিউশন ফি মওকুফ</li>
          <li>ভাই-বোন ডিসকাউন্ট: ১০%</li>
          <li>আর্থিক সংকট ভাতা (আবেদন প্রয়োজন)</li>
        </ul>
      </div>`
  },
 
  deadline: {
    keywords: ['deadline','last date','when','date','schedule','session','intake','semester start','spring','fall','summer','শেষ তারিখ','কবে','সময়সীমা'],
    en: () => `<strong>Application Deadlines & Schedule</strong> 📅<br><br>
      <div class="info-card"><div class="label">Current Academic Year (2025–2026)</div>
        <ul>
          <li><strong>Spring Semester:</strong> Application: Nov 1 – Dec 31 | Classes: Jan 2026</li>
          <li><strong>Summer Semester:</strong> Application: Mar 1 – Apr 30 | Classes: May 2026</li>
          <li><strong>Fall Semester:</strong> Application: Jul 1 – Aug 31 | Classes: Sep 2026</li>
        </ul>
      </div>
      <br>⚠️ <em>Applications submitted after the deadline will not be considered. Apply early to avoid last-minute issues.</em>`,
    bn: () => `<strong>আবেদনের শেষ তারিখ ও সময়সূচী</strong> 📅<br><br>
      <div class="info-card"><div class="label">চলতি শিক্ষাবর্ষ (২০২৫–২০২৬)</div>
        <ul>
          <li><strong>স্প্রিং সেমিস্টার:</strong> আবেদন: নভেম্বর–ডিসেম্বর | ক্লাস শুরু: জানুয়ারি</li>
          <li><strong>সামার সেমিস্টার:</strong> আবেদন: মার্চ–এপ্রিল | ক্লাস শুরু: মে</li>
          <li><strong>ফল সেমিস্টার:</strong> আবেদন: জুলাই–আগস্ট | ক্লাস শুরু: সেপ্টেম্বর</li>
        </ul>
      </div>
      <br>⚠️ <em>নির্ধারিত সময়ের পরে আবেদন গ্রহণযোগ্য হবে না।</em>`
  },
 
  documents: {
    keywords: ['document','paper','certificate','photocopy','photo','passport','nid','transcript','mark sheet','কাগজ','সার্টিফিকেট','ফটোকপি','ছবি'],
    en: () => `<strong>Required Documents</strong> 📄<br><br>Please prepare the following for your admission application:<br>
      <div class="info-card"><div class="label">Mandatory Documents</div>
        <ul>
          <li>✅ Completed admission form (online + printed)</li>
          <li>✅ SSC original marksheet & certificate</li>
          <li>✅ HSC original marksheet & certificate</li>
          <li>✅ 4 recent passport-size photographs</li>
          <li>✅ National ID card or birth certificate (photocopy)</li>
          <li>✅ Guardian's NID photocopy</li>
          <li>✅ Admission test admit card (if applicable)</li>
        </ul>
      </div>
      <div class="info-card"><div class="label">For Transfer Students</div>
        <ul>
          <li>Transcript from previous institution</li>
          <li>No Objection Certificate (NOC)</li>
          <li>Migration certificate</li>
        </ul>
      </div>`,
    bn: () => `<strong>প্রয়োজনীয় কাগজপত্র</strong> 📄<br><br>
      <div class="info-card"><div class="label">বাধ্যতামূলক কাগজপত্র</div>
        <ul>
          <li>✅ পূরণকৃত ভর্তি ফর্ম (অনলাইন + প্রিন্ট)</li>
          <li>✅ SSC মূল মার্কশিট ও সার্টিফিকেট</li>
          <li>✅ HSC মূল মার্কশিট ও সার্টিফিকেট</li>
          <li>✅ ৪ কপি সাম্প্রতিক পাসপোর্ট সাইজ ছবি</li>
          <li>✅ জাতীয় পরিচয়পত্র বা জন্মনিবন্ধন (ফটোকপি)</li>
          <li>✅ অভিভাবকের NID ফটোকপি</li>
        </ul>
      </div>`
  },
 
  howToApply: {
    keywords: ['how to apply','process','procedure','step','register','online','form','application process','কীভাবে','প্রক্রিয়া','ধাপ','ফর্ম','আবেদন'],
    en: () => `<strong>How to Apply</strong> ✍️<br><br>Follow these simple steps to apply:<br>
      <div class="info-card"><div class="label">Application Steps</div>
        <ul>
          <li><strong>Step 1:</strong> Visit <em>sub.edu.bd/admission</em> and create an account</li>
          <li><strong>Step 2:</strong> Fill in the online admission form with your personal & academic details</li>
          <li><strong>Step 3:</strong> Upload scanned copies of all required documents</li>
          <li><strong>Step 4:</strong> Pay the application fee (BDT 500) via bKash, Rocket, or bank</li>
          <li><strong>Step 5:</strong> Submit your application and download the confirmation slip</li>
          <li><strong>Step 6:</strong> Attend the admission test/interview if notified</li>
          <li><strong>Step 7:</strong> Check results on the university portal and complete enrollment</li>
        </ul>
      </div>
      <br>💡 Keep your login credentials safe — you'll need them to track your application status.`,
    bn: () => `<strong>কীভাবে আবেদন করবেন</strong> ✍️<br><br>
      <div class="info-card"><div class="label">আবেদনের ধাপসমূহ</div>
        <ul>
          <li><strong>ধাপ ১:</strong> sub.edu.bd/admission-এ গিয়ে অ্যাকাউন্ট তৈরি করুন</li>
          <li><strong>ধাপ ২:</strong> অনলাইন ফর্ম পূরণ করুন</li>
          <li><strong>ধাপ ৩:</strong> প্রয়োজনীয় কাগজপত্রের স্ক্যান কপি আপলোড করুন</li>
          <li><strong>ধাপ ৪:</strong> আবেদন ফি (৫০০ টাকা) bKash/Rocket/ব্যাংকে পরিশোধ করুন</li>
          <li><strong>ধাপ ৫:</strong> আবেদন জমা দিন এবং কনফার্মেশন স্লিপ সংরক্ষণ করুন</li>
          <li><strong>ধাপ ৬:</strong> প্রবেশপত্র পেলে ভর্তি পরীক্ষায় অংশ নিন</li>
          <li><strong>ধাপ ৭:</strong> ফলাফল দেখে ভর্তি সম্পন্ন করুন</li>
        </ul>
      </div>`
  },
 
  contact: {
    keywords: ['contact','phone','email','address','office','location','reach','helpline','যোগাযোগ','ফোন','ঠিকানা','অফিস'],
    en: () => `<strong>Contact Us</strong> 📞<br><br>
      <div class="info-card"><div class="label">Admission Office</div>
        <ul>
          <li>📍 77 Satmasjid Road, Dhanmondi, Dhaka-1207</li>
          <li>📞 +880-2-9671183–4</li>
          <li>📧 admission@sub.edu.bd</li>
          <li>🌐 www.sub.edu.bd</li>
          <li>⏰ Sun–Thu: 9:00 AM – 5:00 PM</li>
        </ul>
      </div>
      <div class="info-card"><div class="label">CSE Department</div>
        <ul>
          <li>📧 cse@sub.edu.bd</li>
          <li>📞 Ext. 215</li>
        </ul>
      </div>`,
    bn: () => `<strong>যোগাযোগ করুন</strong> 📞<br><br>
      <div class="info-card"><div class="label">ভর্তি অফিস</div>
        <ul>
          <li>📍 ৭৭ সাতমসজিদ রোড, ধানমন্ডি, ঢাকা-১২০৭</li>
          <li>📞 +৮৮০-২-৯৬৭১১৮৩–৪</li>
          <li>📧 admission@sub.edu.bd</li>
          <li>⏰ রবি–বৃহস্পতি: সকাল ৯টা – বিকাল ৫টা</li>
        </ul>
      </div>`
  },
 
  departments: {
    keywords: ['department','program','course','subject','faculty','cse','eee','bba','mba','english','law','department','বিভাগ','প্রোগ্রাম','কোর্স'],
    en: () => `<strong>Available Departments & Programs</strong> 🏛️<br><br>
      <div class="info-card"><div class="label">Faculty of Science & Engineering</div>
        <ul>
          <li>BSc in Computer Science & Engineering (CSE)</li>
          <li>BSc in Electrical & Electronic Engineering (EEE)</li>
          <li>BSc in Architecture</li>
        </ul>
      </div>
      <div class="info-card"><div class="label">Faculty of Business</div>
        <ul>
          <li>BBA (Bachelor of Business Administration)</li>
          <li>MBA (Master of Business Administration)</li>
        </ul>
      </div>
      <div class="info-card"><div class="label">Faculty of Arts & Social Science</div>
        <ul>
          <li>BA in English</li>
          <li>LLB / LLM (Law)</li>
        </ul>
      </div>`,
    bn: () => `<strong>বিভাগ ও প্রোগ্রামসমূহ</strong> 🏛️<br><br>
      <div class="info-card"><div class="label">বিজ্ঞান ও প্রকৌশল অনুষদ</div>
        <ul>
          <li>BSc in Computer Science & Engineering (CSE)</li>
          <li>BSc in Electrical & Electronic Engineering (EEE)</li>
          <li>BSc in Architecture</li>
        </ul>
      </div>
      <div class="info-card"><div class="label">ব্যবসায় অনুষদ</div>
        <ul><li>BBA</li><li>MBA</li></ul>
      </div>
      <div class="info-card"><div class="label">কলা ও সামাজিক বিজ্ঞান</div>
        <ul><li>BA in English</li><li>LLB / LLM</li></ul>
      </div>`
  },
 
  thanks: {
    keywords: ['thank','thanks','thank you','thnx','thx','ধন্যবাদ','শুক্রিয়া'],
    en: () => `You're most welcome! 😊 <br><br>Feel free to ask anytime — I'm always here to help. Best of luck with your admission to <strong>State University of Bangladesh!</strong> 🎓`,
    bn: () => `আপনাকে স্বাগত জানাই! 😊<br><br>যেকোনো প্রশ্নে আবার জিজ্ঞেস করুন। <strong>স্টেট ইউনিভার্সিটি অব বাংলাদেশ</strong>-এ ভর্তিতে শুভকামনা! 🎓`
  },
 
  fallback: {
    en: (q) => `I'm sorry, I didn't quite understand "<em>${q}</em>". 🤔<br><br>I can help you with:<br><ul>
      <li>Admission requirements & eligibility</li>
      <li>GPA criteria</li>
      <li>Tuition fees</li>
      <li>Scholarships</li>
      <li>Application deadlines</li>
      <li>Required documents</li>
      <li>How to apply</li>
      <li>Departments & programs</li>
      <li>Contact information</li>
    </ul>Try rephrasing your question or tap a topic chip above!`,
    bn: (q) => `দুঃখিত, আমি "<em>${q}</em>" বুঝতে পারিনি। 🤔<br><br>আমি সাহায্য করতে পারি:<br><ul>
      <li>ভর্তির যোগ্যতা</li>
      <li>জিপিএ মানদণ্ড</li>
      <li>টিউশন ফি</li>
      <li>বৃত্তি</li>
      <li>আবেদনের তারিখ</li>
      <li>প্রয়োজনীয় কাগজপত্র</li>
      <li>আবেদনের প্রক্রিয়া</li>
    </ul>প্রশ্নটি আবার একটু ভিন্নভাবে লিখুন বা উপরের টপিক চিপে ট্যাপ করুন!`
  }
};
 
// ─── FUZZY MATCH ──────────────────────────────────────────
function levenshtein(a, b) {
  const dp = Array.from({length: a.length+1}, (_,i) => 
    Array.from({length: b.length+1}, (_,j) => i===0?j:j===0?i:0)
  );
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++) {
    dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  }
  return dp[a.length][b.length];
}
 
function fuzzyMatch(word, keyword) {
  if (keyword.includes(word) || word.includes(keyword)) return true;
  const dist = levenshtein(word.toLowerCase(), keyword.toLowerCase());
  return dist <= Math.max(1, Math.floor(keyword.length * 0.3));
}
 
// ─── INTENT CLASSIFICATION ───────────────────────────────
function classifyIntent(input) {
  const lower = input.toLowerCase().trim();
  const words = lower.split(/\s+/);
  
  let bestIntent = null;
  let bestScore = 0;
 
  for (const [intent, data] of Object.entries(KB)) {
    if (intent === 'fallback') continue;
    let score = 0;
    for (const kw of data.keywords) {
      if (lower.includes(kw)) {
        score += kw.split(' ').length * 2; // longer keyword = higher score
        continue;
      }
      for (const w of words) {
        if (w.length >= 3 && fuzzyMatch(w, kw)) {
          score += 0.8;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }
 
  return bestScore > 0.5 ? bestIntent : 'fallback';
}
 
// ─── CHAT FUNCTIONS ──────────────────────────────────────
function getTime() {
  return new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
 
function addMessage(html, role) {
  const area = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  
  const avatar = document.createElement('div');
  avatar.className = `msg-avatar ${role === 'bot' ? 'bot-avatar' : 'user-avatar'}`;
  avatar.textContent = role === 'bot' ? '🤖' : '👤';
 
  const inner = document.createElement('div');
  inner.className = 'msg-inner';
 
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = html;
 
  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = getTime();
 
  inner.appendChild(bubble);
  inner.appendChild(time);
  div.appendChild(avatar);
  div.appendChild(inner);
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}
 
function showTyping() {
  const area = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = 'typing-indicator';
  div.id = 'typingIndicator';
 
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar bot-avatar';
  avatar.textContent = '🤖';
 
  const dots = document.createElement('div');
  dots.className = 'typing-dots';
  dots.innerHTML = '<span></span><span></span><span></span>';
 
  div.appendChild(avatar);
  div.appendChild(dots);
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}
 
function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}
 
function getBotResponse(input) {
  const intent = classifyIntent(input);
  const data = KB[intent];
  if (intent === 'fallback') return data[lang](input);
  return data[lang]();
}
 
function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text) return;
 
  addMessage(text, 'user');
  input.value = '';
  input.style.height = 'auto';
 
  showTyping();
  const delay = 600 + Math.random() * 600;
  setTimeout(() => {
    removeTyping();
    const response = getBotResponse(text);
    addMessage(response, 'bot');
  }, delay);
}
 
function quickAsk(topic) {
  document.getElementById('userInput').value = topic;
  sendMessage();
}
 
function clearChat() {
  const area = document.getElementById('chatArea');
  area.innerHTML = '';
  setTimeout(() => {
    addMessage(KB.greeting[lang](), 'bot');
  }, 100);
}
 
function setLang(l) {
  lang = l;
  document.getElementById('btn-en').classList.toggle('active', l === 'en');
  document.getElementById('btn-bn').classList.toggle('active', l === 'bn');
  document.getElementById('userInput').placeholder = l === 'en' ? 'Ask anything about admissions…' : 'ভর্তি সম্পর্কে যেকোনো প্রশ্ন করুন…';
  clearChat();
}
 
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}
 
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}
 
// ─── INIT ─────────────────────────────────────────────────
window.onload = () => {
  setTimeout(() => {
    addMessage(KB.greeting[lang](), 'bot');
  }, 400);
};