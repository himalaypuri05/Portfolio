/* ==========================================================================
   HIMALAY PURI - FULL STACK DEVELOPER PORTFOLIO LOGIC
   ========================================================================== */

let soundEnabled = false;
let audioCtx = null;

document.addEventListener('DOMContentLoaded', () => {
  initSavedTheme();
  initParticleCanvas();
  initTypingEffect();
  initNavbarScroll();
  init3DTilt();
  initTerminal();
  initContactForm();
});

/* --------------------------------------------------------------------------
   Interactive Particle Canvas Background
   -------------------------------------------------------------------------- */
function getThemeParticleColor() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  if (theme === 'dark') {
    return { r: 99, g: 102, b: 241, lineAlpha: 0.14, starAlpha: 0.35 };
  }
  return { r: 37, g: 99, b: 235, lineAlpha: 0.1, starAlpha: 0.25 };
}

function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mouse = { x: null, y: null, radius: 140 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const numParticles = Math.min(Math.floor(width * 0.045), 65);
  const particles = [];

  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 1.8 + 0.8,
      baseAlpha: Math.random() * 0.5 + 0.2
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const pColor = getThemeParticleColor();

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${pColor.r}, ${pColor.g}, ${pColor.b}, ${pColor.lineAlpha * (1 - dist / 120)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 2.5;
          p.y -= (dy / dist) * force * 2.5;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pColor.r}, ${pColor.g}, ${pColor.b}, ${p.baseAlpha * pColor.starAlpha})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   Web Audio API Synth Sound Generator
   -------------------------------------------------------------------------- */
function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-btn');
  const icon = document.getElementById('sound-icon');

  if (soundEnabled) {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    btn.classList.add('active');
    icon.className = 'fa-solid fa-volume-high';
    playSynthSound(523.25, 0.08, 'sine');
    showToast('Sound FX Enabled 🔊');
  } else {
    btn.classList.remove('active');
    icon.className = 'fa-solid fa-volume-xmark';
    showToast('Sound FX Muted 🔇');
  }
}

function playSynthSound(freq = 440, duration = 0.05, type = 'sine') {
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

/* --------------------------------------------------------------------------
   2-Theme Controller (Light Default & Dark Toggle)
   -------------------------------------------------------------------------- */
function initSavedTheme() {
  try {
    const saved = localStorage.getItem('portfolio-theme');
    const currentTheme = saved === 'dark' ? 'dark' : 'light';
    applyTheme(currentTheme, false);
  } catch (e) {
    applyTheme('light', false);
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next, true);
}

function applyTheme(theme, notify = true) {
  const isDark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

  try {
    localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
  } catch (e) {}

  const icon = document.getElementById('theme-toggle-icon');
  const label = document.getElementById('theme-toggle-label');
  const toggleBtn = document.getElementById('theme-toggle');

  if (icon) {
    icon.className = isDark ? 'fa-solid fa-sun theme-toggle-icon' : 'fa-solid fa-moon theme-toggle-icon';
  }
  if (label) {
    label.textContent = isDark ? 'Light' : 'Dark';
  }
  if (toggleBtn) {
    toggleBtn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    toggleBtn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }

  if (notify) {
    if (soundEnabled) playSynthSound(isDark ? 520 : 680, 0.08, 'sine');
    showToast(isDark ? '🌙 Dark Mode Activated' : '☀️ Light Mode Activated');
  }
}

/* --------------------------------------------------------------------------
   3D Tilt Card Perspective Rotation
   -------------------------------------------------------------------------- */
function init3DTilt() {
  const cards = document.querySelectorAll('.tilt-element');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* --------------------------------------------------------------------------
   Typing Effect in Hero Header
   -------------------------------------------------------------------------- */
function initTypingEffect() {
  const words = [
    'Full Stack Developer',
    'Software Engineer',
    'React & Node.js Developer',
    'REST API Architect'
  ];
  
  const element = document.getElementById('typing-element');
  if (!element) return;

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingDelay = 100;

  function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      element.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingDelay = 40;
    } else {
      element.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingDelay = 90;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      typingDelay = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingDelay = 400;
    }

    setTimeout(type, typingDelay);
  }

  type();
}

/* --------------------------------------------------------------------------
   Navbar Scroll & Active Highlighting
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 130;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Interactive Developer CLI Terminal
   -------------------------------------------------------------------------- */
function initTerminal() {
  const input = document.getElementById('term-input');
  const body = document.getElementById('terminal-body');

  if (!input || !body) return;

  const commands = {
    help: `Available CLI Commands:
  - skills       : View organized technical skills & stack
  - experience   : View work experience (Botivate Services LLP & IIIT Naya Raipur)
  - projects     : List projects (FIFA ALL STARS, iNotebook, NewsMonkey)
  - hackathon    : View HackIndia Hackathon Web3 project details
  - education    : View CSVTU B.Tech CSE degree information
  - contact      : Show email, phone, GitHub & LinkedIn channels
  - clear        : Clear terminal display`,

    skills: `Technical Skills:
  [Languages]            JavaScript, Python, PHP
  [Frontend]             HTML5, CSS3, Bootstrap, Tailwind CSS, React.js, React Router
  [Backend]              Node.js, Express.js, Flask
  [Databases]            MySQL, MongoDB, Supabase
  [Web / Backend Concepts] RESTful APIs, JWT Authentication, Authorization, RBAC, CRUD, API Integration, MVC
  [Developer Tools]      Git, GitHub, Postman, VS Code, Vercel, Render, Google Antigravity
  [AI Development Tools] GitHub Copilot, OpenAI Codex, Google Gemini`,

    experience: `Work Experience:
  1. Botivate Services LLP | Full Stack Developer (Jul 2026 – Present)
     - Develop full-stack business applications (Sapid System, Bhatia Enterprises) using React.js, Node.js, Express.js, MySQL, RESTful APIs.
     - Integrate Meta API and eSSL biometric systems.
     - Develop CRUD workflows, authentication, database operations, API integrations, and responsive interfaces.
     - Debug application issues, resolve functional bugs, improve workflows.
     - Use Git and GitHub for version control and team collaboration.

  2. IIIT Naya Raipur | Project Trainee (Jun 2025 – Jul 2025)
     - Developed a resume analysis web application supporting PDF, DOCX, and TXT processing.
     - Built Flask APIs and integrated frontend components for resume data processing.
     - Performed debugging, testing, and application workflow improvements.`,

    projects: `Featured Projects:
  1. FIFA ALL STARS  : Grassroots Footy Match Hub (React.js, Node.js, Express.js, REST APIs, RBAC)
                       Live: https://turf-nation-pi.vercel.app/login
  2. iNotebook       : Note Management System (React.js, Node.js, Express.js, MongoDB, JWT)
                       GitHub: https://github.com/himalaypuri05/iNoteBook
                       Live: https://i-note-book-pi.vercel.app/signup
  3. NewsMonkey      : News Aggregator (React.js, JavaScript, REST APIs)
                       GitHub: https://github.com/himalaypuri05/NewsMonkey
                       Live: https://news-monkey-two-theta.vercel.app/`,

    hackathon: `Hackathon Experience:
  - HackIndia Hackathon | Participant
  - Contributed to a team-based Web3 Digital Art Marketplace concept involving frontend development, UI/UX, Ethereum, and NFTs.`,

    education: `Education:
  - Bachelor of Technology (B.Tech) in Computer Science Engineering (2022 – 2026)
  - Chhattisgarh Swami Vivekanand Technical University (CSVTU)
  - Result: First Division`,

    contact: `Contact Details:
  - Email    : himalaypuri05@gmail.com
  - Phone    : +91 6260764761
  - LinkedIn : https://www.linkedin.com/in/himalaypuri05
  - GitHub   : https://github.com/himalaypuri05`,

    whoami: `Himalay Puri — Full Stack Developer & Software Engineer.`
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const commandText = input.value.trim().toLowerCase();
      input.value = '';

      if (commandText === '') return;

      playSynthSound(440, 0.04, 'square');

      const promptLine = document.createElement('div');
      promptLine.className = 'term-line';
      promptLine.innerHTML = `<span class="term-prompt">himalay@dev:~$</span> <span class="term-cmd">${escapeHtml(commandText)}</span>`;
      body.appendChild(promptLine);

      if (commandText === 'clear') {
        body.innerHTML = '';
        return;
      }

      const outputLine = document.createElement('div');
      outputLine.className = 'term-output';

      if (commands[commandText]) {
        outputLine.textContent = commands[commandText];
      } else {
        outputLine.textContent = `Command not found: '${commandText}'. Type 'help' for options.`;
        outputLine.style.color = '#ff6b6b';
      }

      body.appendChild(outputLine);
      body.scrollTop = body.scrollHeight;
    }
  });
}

function runTermCmd(cmdName) {
  const input = document.getElementById('term-input');
  if (input) {
    input.value = cmdName;
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    input.dispatchEvent(event);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

/* --------------------------------------------------------------------------
   Project Detail Glass Overlay Modal
   -------------------------------------------------------------------------- */
const projectData = {
  fifaallstars: {
    title: "FIFA ALL STARS — Grassroots Footy Match Hub",
    subtitle: "React.js | Node.js | Express.js | REST APIs | Authentication | RBAC",
    thumb: "assets/fifa_all_stars_thumb.jpg",
    desc: "Grassroots Footy Match Hub web application featuring authentication, authorization, and role-based access control (RBAC) for secure feature access.",
    features: [
      "Implemented authentication, authorization, and role-based access control (RBAC) for secure feature access.",
      "Developed CRUD workflows, protected routes, RESTful APIs, and responsive interfaces for application data."
    ],
    live: "https://turf-nation-pi.vercel.app/login"
  },
  inotebook: {
    title: "iNotebook — Note Management System",
    subtitle: "React.js | Node.js | Express.js | MongoDB | JWT",
    thumb: "assets/inotebook_thumb.jpg",
    desc: "Full-stack cloud note management application featuring secure user authentication, bcrypt password hashing, and user-isolated notes storage.",
    features: [
      "Implemented JWT authentication, protected routes, authorization, and CRUD operations for user-specific notes.",
      "Built RESTful APIs with Express.js and MongoDB for secure user data and note management."
    ],
    github: "https://github.com/himalaypuri05/iNoteBook",
    live: "https://i-note-book-pi.vercel.app/signup"
  },
  newsmonkey: {
    title: "NewsMonkey — News Aggregator",
    subtitle: "React.js | JavaScript | REST APIs",
    thumb: "assets/newsmonkey_thumb.jpg",
    desc: "Single Page Application delivering real-time top headlines across global categories with dynamic infinite scrolling.",
    features: [
      "Integrated REST APIs with React.js for dynamic news retrieval, category filtering, and asynchronous data handling.",
      "Implemented infinite scrolling and responsive UI for efficient content loading."
    ],
    github: "https://github.com/himalaypuri05/NewsMonkey",
    live: "https://news-monkey-two-theta.vercel.app/"
  }
};

function openProjectModal(projectId) {
  const modal = document.getElementById('project-modal');
  const body = document.getElementById('modal-content-body');

  const p = projectData[projectId];
  if (!p || !modal || !body) return;

  playSynthSound(587.33, 0.08, 'sine');

  let linksHtml = '';
  if (p.github) {
    linksHtml += `<a href="${p.github}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
      View GitHub Code <i class="fa-brands fa-github"></i>
    </a>`;
  }
  if (p.live) {
    linksHtml += `<a href="${p.live}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="background: var(--accent-green); border-color: var(--accent-green);">
      Live Demo <i class="fa-solid fa-arrow-up-right-from-square"></i>
    </a>`;
  }
  linksHtml += `<button class="btn btn-outline btn-sm" onclick="closeProjectModal()">Close</button>`;

  body.innerHTML = `
    <div style="width:100%; height:200px; border-radius: var(--radius-sm); overflow:hidden; margin-bottom: 20px; border: 1px solid var(--border-glass);">
      <img src="${p.thumb}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;">
    </div>
    <h3 style="font-size: 1.6rem; color: #fff; margin-bottom: 6px;">${p.title}</h3>
    <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent-primary); margin-bottom: 16px;">${p.subtitle}</div>
    <p style="color: var(--text-muted); font-size: 0.98rem; line-height: 1.6; margin-bottom: 20px;">${p.desc}</p>
    
    <h4 style="color: #fff; font-size: 1.1rem; margin-bottom: 12px;">Technical Highlights:</h4>
    <ul style="list-style: none; margin-bottom: 24px;">
      ${p.features.map(f => `<li style="position: relative; padding-left: 20px; color: var(--text-muted); margin-bottom: 8px;"><span style="position: absolute; left: 0; color: var(--accent-primary);">▹</span>${f}</li>`).join('')}
    </ul>

    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      ${linksHtml}
    </div>
  `;

  modal.classList.add('show');
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (modal) modal.classList.remove('show');
}

/* --------------------------------------------------------------------------
   Copy Text Helper & Toast Notification
   -------------------------------------------------------------------------- */
function copyText(text, successMsg) {
  playSynthSound(783.99, 0.06, 'triangle');
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg);
  }).catch(() => {
    showToast('Failed to copy text.');
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const msgElement = document.getElementById('toast-message');
  if (!toast || !msgElement) return;

  msgElement.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* --------------------------------------------------------------------------
   Contact Form Handling
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    playSynthSound(880, 0.1, 'sine');
    showToast(`Thank you ${name}! Message received.`);
    form.reset();
  });
}
