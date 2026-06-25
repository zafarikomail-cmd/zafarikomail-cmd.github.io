/* ============================================================
   AHMAD KOMAIL ZAFARI — Portfolio JS
   Fixed: counter observer, dark mode, mobile menu, scroll reveal
   ============================================================ */

'use strict';


/* ── DARK MODE ─────────────────────────────────────────────── */

const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  try { localStorage.setItem('portfolio-theme', theme) } catch(e) {}
}

// Restore saved preference or use system preference
(function initTheme() {
  let saved;
  try { saved = localStorage.getItem('portfolio-theme') } catch(e) {}
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
})();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// Respect system changes if no manual override
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  try {
    if (!localStorage.getItem('portfolio-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  } catch(ex) {}
});


/* ── LOADER ────────────────────────────────────────────────── */

const loaderNameEl = document.getElementById('loaderName');
const loader = document.getElementById('loader');

if (loaderNameEl) {
  'AHMAD KOMAIL ZAFARI'.split('').forEach((ch, i) => {
    const s = document.createElement('span');
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    s.style.animationDelay = (i * 0.04 + 0.3) + 's';
    loaderNameEl.appendChild(s);
  });
}

function revealHero() {
  document.querySelectorAll('.he').forEach((el, i) => {
    setTimeout(() => el.classList.add('go'), i * 70 + 80);
  });
}

if (loader) {
  // Check if page is already loaded (e.g. fast cached)
  const loaderDelay = document.readyState === 'complete' ? 600 : 2600;
  setTimeout(() => {
    loader.classList.add('done');
    revealHero();
  }, loaderDelay);
} else {
  revealHero();
}


/* ── NAV SCROLL BEHAVIOUR ──────────────────────────────────── */

const nav = document.getElementById('nav');
const progress = document.getElementById('progress');

let lastScrollY = 0;
let ticking = false;

function onScroll() {
  const sy = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;

  if (nav) nav.classList.toggle('scrolled', sy > 40);

  if (progress && maxScroll > 0) {
    const p = Math.min(sy / maxScroll, 1) * 100;
    progress.style.width = p + '%';
  }

  lastScrollY = sy;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });


/* ── MOBILE MENU ───────────────────────────────────────────── */

const mobileMenu = document.getElementById('mobileMenu');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const menuClose = document.getElementById('menuClose');

function toggleMenu() {
  const isOpen = mobileMenu && mobileMenu.classList.toggle('open');
  if (hamburgerBtn) {
    hamburgerBtn.classList.toggle('active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
  // Prevent body scroll when menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

// Open via hamburger button
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', toggleMenu);
}

// Close via the X button inside the menu
if (menuClose) {
  menuClose.addEventListener('click', toggleMenu);
}

// Close when any mobile nav link is clicked
if (mobileMenu) {
  mobileMenu.querySelectorAll('.mob-nav a').forEach(link => {
    link.addEventListener('click', toggleMenu);
  });
}

// Close on backdrop click
if (mobileMenu) {
  mobileMenu.addEventListener('click', e => {
    if (e.target === mobileMenu) toggleMenu();
  });
}

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
    toggleMenu();
  }
});


/* ── SCROLL REVEAL ─────────────────────────────────────────── */

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


/* ── COUNTERS ──────────────────────────────────────────────── */

function animCounter(el) {
  const target = +el.dataset.target;
  if (!target) return;
  const duration = 1200;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }

  requestAnimationFrame(step);
}

const heroStats = document.getElementById('heroStats');
if (heroStats) {
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.counter').forEach(animCounter);
        counterObs.disconnect();
      }
    });
  }, { threshold: 0.4 });
  counterObs.observe(heroStats);
}


/* ── ACTIVE NAV LINK ON SCROLL ─────────────────────────────── */

const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}`
          ? 'var(--text)' : '';
      });
    }
  });
}, { rootMargin: '-50% 0px -40% 0px' });

sections.forEach(s => sectionObs.observe(s));


/* ── SMOOTH SCROLL OFFSET (fixed nav) ─────────────────────── */

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ── CV BUTTON GUARD ───────────────────────────────────────── */
/* Hides the CV download button entirely when data-cv-status="pending".
   No visible labels or indicators — the button simply does not render
   until the PDF is deployed. Once assets/cv/Ahmad_Komail_Zafari_CV.pdf
   exists, change data-cv-status to "live" and the button reappears
   automatically with no other code change needed. */

(function initCvGuard() {
  const cvBtn = document.querySelector('a[data-cv-status]');
  if (!cvBtn) return;
  if (cvBtn.dataset.cvStatus === 'pending') {
    cvBtn.style.display = 'none';
    cvBtn.setAttribute('aria-hidden', 'true');
    cvBtn.setAttribute('tabindex', '-1');
  }
})();

/* ============================================================
   PHASE A — PREMIUM UI/UX INTERACTIONS
   All effects respect prefers-reduced-motion.
   No existing code modified.
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = window.matchMedia('(hover: none)').matches;


/* ── ACTIVE NAV LINK INDICATOR ─────────────────────────────── */
/* Adds .nav-active class to the nav link matching the current
   visible section — driven by the existing sectionObs logic.
   We extend it without rewriting the original observer.        */

(function initNavActiveIndicator() {
  const navLinks = document.querySelectorAll('.nav-links a');

  const activeObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(a => {
          const isActive = a.getAttribute('href') === `#${id}`;
          a.classList.toggle('nav-active', isActive);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  document.querySelectorAll('section[id], div[id]').forEach(s => activeObs.observe(s));
})();


/* ── SCROLL CUE — fade out on first scroll ──────────────────── */

(function initScrollCue() {
  const cue = document.getElementById('scrollCue');
  if (!cue) return;
  let dismissed = false;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    cue.classList.add('hidden');
    window.removeEventListener('scroll', onScroll, { passive: true });
  }

  function onScroll() {
    if (window.scrollY > 80) dismiss();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // Also auto-dismiss after 6s if user hasn't scrolled
  setTimeout(dismiss, 6000);
})();


/* ── STATS BAR — animate in when visible ────────────────────── */

(function initStatsReveal() {
  const statsBar = document.getElementById('heroStats');
  if (!statsBar) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        statsBar.classList.add('stats-visible');
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });

  obs.observe(statsBar);
})();


/* ── HERO PHOTO 3D TILT ─────────────────────────────────────── */
/* Updates CSS custom properties on .hero-photo-placeholder so
   the CSS perspective/rotateX/Y does the actual rendering.
   Max tilt: 4 degrees. Disabled on touch and reduced-motion.  */

(function initPhotoTilt() {
  if (prefersReducedMotion || isTouchDevice) return;

  const col = document.querySelector('.hero-photo-col');
  const card = document.querySelector('.hero-photo-placeholder');
  if (!col || !card) return;

  let rafId = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  col.addEventListener('mousemove', e => {
    const rect = col.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    targetY =  ((e.clientX - cx) / (rect.width  / 2)) * 4;  // ±4deg
    targetX = -((e.clientY - cy) / (rect.height / 2)) * 4;

    if (!rafId) rafId = requestAnimationFrame(animateTilt);
  }, { passive: true });

  col.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
    if (!rafId) rafId = requestAnimationFrame(animateTilt);
  }, { passive: true });

  function animateTilt() {
    rafId = null;
    // Lerp toward target
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;

    card.style.setProperty('--tilt-x', currentX.toFixed(3) + 'deg');
    card.style.setProperty('--tilt-y', currentY.toFixed(3) + 'deg');

    // Keep animating until settled
    if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
      rafId = requestAnimationFrame(animateTilt);
    }
  }
})();


/* ── PROJECT CARD MOUSE-TRACKING GLOW ──────────────────────── */
/* Updates --card-glow-x / --card-glow-y on each .proj-card so
   the radial-gradient ::before follows the cursor.              */

(function initCardGlow() {
  if (prefersReducedMotion || isTouchDevice) return;

  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      card.style.setProperty('--card-glow-x', x);
      card.style.setProperty('--card-glow-y', y);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--card-glow-x', '50%');
      card.style.setProperty('--card-glow-y', '50%');
    }, { passive: true });
  });
})();


/* ── PRIMARY BUTTON MAGNETIC EFFECT ────────────────────────── */
/* Gives the hero "View My Work" button a subtle magnetic pull.
   Max offset: ±5px.                                            */

(function initMagneticBtn() {
  if (prefersReducedMotion || isTouchDevice) return;

  const btn = document.querySelector('.hero-btns .btn-primary');
  if (!btn) return;

  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = ((e.clientX - cx) / (rect.width  / 2)) * 5;
    const dy = ((e.clientY - cy) / (rect.height / 2)) * 5;
    btn.style.setProperty('--btn-dx', dx.toFixed(2) + 'px');
    btn.style.setProperty('--btn-dy', dy.toFixed(2) + 'px');
    btn.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) translateY(-2px)`;
  }, { passive: true });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  }, { passive: true });
})();


/* ── STACK CLUSTERS — scroll-triggered stagger reveal ──────── */
/* Adds .in to each .stack-cluster as it enters the viewport.
   CSS handles the stagger via transition-delay on each cluster. */

(function initStackReveal() {
  const clusters = document.querySelectorAll('.stack-cluster');
  const intro    = document.querySelector('.stack-intro');
  if (!clusters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  clusters.forEach(c => obs.observe(c));
  if (intro) obs.observe(intro);
})();


/* ── CONTACT SECTION — in-class for em underline ───────────── */

(function initContactReveal() {
  const section = document.querySelector('.contact-section');
  if (!section) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        section.classList.add('in');
        obs.disconnect();
      }
    });
  }, { threshold: 0.2 });

  obs.observe(section);
})();


/* ── NAV CTA: nav-active highlight on hero ──────────────────── */
/* When user is at the very top (#home), deactivate all nav links */

(function initHomeReset() {
  const homeSection = document.getElementById('home');
  if (!homeSection) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.nav-links a').forEach(a => {
          a.classList.remove('nav-active');
        });
      }
    });
  }, { threshold: 0.6 });

  obs.observe(homeSection);
})();/* ============================================================
   PHASE B — PREMIUM MOTION JS
   Append this entire block to the END of script.js.
   All additions are self-contained IIFEs.
   Zero existing functions modified.
   ============================================================ */

'use strict';

const prefersReducedMotionB = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDeviceB        = window.matchMedia('(hover: none)').matches;


/* ── B-01. DIVIDER REVEAL ─────────────────────────────────────── */
/* Fades .divider elements in as they enter the viewport.
   Supplements the existing revealObs which only watches .reveal. */

(function initDividerReveal() {
  const dividers = document.querySelectorAll('.divider');
  if (!dividers.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  dividers.forEach(d => obs.observe(d));
})();


/* ── B-02. HERO NAME — letter-by-letter split on reveal ──────── */
/* When .hero-name-line / .hero-name-italic receive .go, each
   visible character gets its own stagger delay so the name
   appears letter by letter rather than as a single block.
   Existing .he/.go system drives timing; we only add delays.
   Skipped on reduced-motion. */

(function initNameLetterStagger() {
  if (prefersReducedMotionB) return;

  document.querySelectorAll('.hero-name-line, .hero-name-italic').forEach((el, lineIdx) => {
    // Wrap each character in a <span> with a stagger delay
    const text = el.childNodes;
    const frag = document.createDocumentFragment();

    text.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split('').forEach((ch, i) => {
          const span = document.createElement('span');
          span.textContent = ch === ' ' ? '\u00A0' : ch;
          span.style.display = 'inline-block';
          // stagger: first line starts after loader, second slightly after
          const base = lineIdx === 0 ? 2.6 : 2.85;
          span.style.transitionDelay = (base + i * 0.03) + 's';
          frag.appendChild(span);
        });
      } else {
        // preserve child elements (e.g. <em>)
        frag.appendChild(node.cloneNode(true));
      }
    });

    // Only replace text content if we actually parsed something
    if (frag.childNodes.length) {
      el.innerHTML = '';
      el.appendChild(frag);
    }
  });
})();


/* ── B-03. SNAP CARD STAGGER ─────────────────────────────────── */
/* When the hero snap column enters (.go), each .snap-card gets a
   small stagger delay applied inline — CSS handles the animation. */

(function initSnapStagger() {
  if (prefersReducedMotionB) return;

  const snapCol = document.querySelector('.hero-snap');
  if (!snapCol) return;

  const cards = snapCol.querySelectorAll('.snap-card');

  // Watch for .go being added by the loader logic
  const mo = new MutationObserver(() => {
    if (snapCol.classList.contains('go')) {
      cards.forEach((card, i) => {
        card.style.transitionDelay = (0.3 + i * 0.07) + 's';
        card.style.opacity = '0';
        card.style.transform = 'translateX(12px)';
        card.style.transition = 'opacity 0.5s var(--ease), transform 0.5s var(--ease)';
        // Trigger
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
          });
        });
      });
      mo.disconnect();
    }
  });

  mo.observe(snapCol, { attributes: true, attributeFilter: ['class'] });
})();


/* ── B-04. PROJECT CARD — tilt on mouse (grid cards only) ────── */
/* Each .proj-card gets a subtle perspective tilt following the
   cursor — max ±3 degrees. Complements the existing glow tracking.
   Disabled on touch and reduced-motion. */

(function initCardTilt() {
  if (prefersReducedMotionB || isTouchDeviceB) return;

  document.querySelectorAll('.proj-card').forEach(card => {
    let rafId = null;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      tx =  ((e.clientX - r.left  - r.width  / 2) / (r.width  / 2)) *  3;
      ty = -((e.clientY - r.top   - r.height / 2) / (r.height / 2)) *  3;
      if (!rafId) rafId = requestAnimationFrame(step);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      tx = 0; ty = 0;
      if (!rafId) rafId = requestAnimationFrame(step);
    }, { passive: true });

    function step() {
      rafId = null;
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      card.style.transform =
        `translateX(4px) perspective(900px) rotateX(${(cy * 0.5).toFixed(2)}deg) rotateY(${(cx * 0.5).toFixed(2)}deg)`;
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        rafId = requestAnimationFrame(step);
      }
    }
  });
})();


/* ── B-05. FEATURED PROJECT — parallax image on scroll ──────── */
/* The featured project image scrolls slightly slower than the
   page, giving a depth effect. Max offset: 24px.
   Disabled on touch and reduced-motion. */

(function initFeaturedParallax() {
  if (prefersReducedMotionB || isTouchDeviceB) return;

  const featImg = document.querySelector('.proj-feat-img img');
  if (!featImg) return;

  const featCard = document.querySelector('.proj-featured');
  let rafId = null;

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const rect = featCard.getBoundingClientRect();
      const viewH = window.innerHeight;
      // progress: 0 when bottom enters, 1 when top leaves
      const progress = 1 - Math.min(Math.max(rect.bottom / (viewH + rect.height), 0), 1);
      const offset = (progress - 0.5) * 48; // ±24px
      featImg.style.transform = `scale(1.06) translateY(${offset}px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ── B-06. NAV — entrance animation on first load ─────────────── */
/* The nav slides down from above after the loader hides.
   One-shot animation; respects reduced-motion. */

(function initNavEntrance() {
  if (prefersReducedMotionB) return;

  const nav = document.getElementById('nav');
  if (!nav) return;

  // Start hidden above viewport
  nav.style.transform  = 'translateY(-100%)';
  nav.style.opacity    = '0';
  nav.style.transition = 'none';

  // Delay until after loader (~2.8s for cold, 700ms for cached)
  const delay = document.readyState === 'complete' ? 700 : 2900;

  setTimeout(() => {
    nav.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease';
    nav.style.transform  = 'translateY(0)';
    nav.style.opacity    = '1';

    // Clean up inline styles after animation settles
    setTimeout(() => {
      nav.style.transform  = '';
      nav.style.opacity    = '';
      nav.style.transition = '';
    }, 700);
  }, delay);
})();


/* ── B-07. SECTION TITLES — word-by-word reveal ──────────────── */
/* Each .section-title word gets a short stagger so the heading
   appears word by word as the section scrolls in.
   Works by injecting <span> wrappers; the existing .reveal.in
   system triggers the parent, and each child word has a delay.
   Skipped on reduced-motion. */

(function initTitleWordSplit() {
  if (prefersReducedMotionB) return;

  document.querySelectorAll('.section-title').forEach(title => {
    // Skip contact heading — its em has a CSS underline animation that must stay intact
    if (title.id === 'contact-heading') return;
    // Only process direct text / simple inline children
    // Preserve <br> and <em> elements; only split bare text nodes
    const nodes = Array.from(title.childNodes);
    title.innerHTML = '';

    let wordIndex = 0;
    const allWordSpans = [];

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/(\s+)/);
        words.forEach(word => {
          if (/^\s+$/.test(word) || word === '') {
            title.appendChild(document.createTextNode(word));
          } else {
            const span = document.createElement('span');
            span.textContent = word;
            span.style.cssText = `
              display: inline-block;
              opacity: 0;
              transform: translateY(16px);
              transition: opacity 0.55s var(--ease), transform 0.55s var(--ease);
              transition-delay: ${wordIndex * 0.06}s;
            `;
            title.appendChild(span);
            allWordSpans.push(span);
            wordIndex++;
          }
        });
      } else if (node.tagName === 'BR') {
        title.appendChild(document.createElement('br'));
      } else if (node.tagName === 'EM') {
        const em = node.cloneNode(true);
        em.style.cssText = `
          display: inline-block;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.55s var(--ease), transform 0.55s var(--ease);
          transition-delay: ${wordIndex * 0.06}s;
        `;
        title.appendChild(em);
        allWordSpans.push(em);
        wordIndex++;
      } else {
        title.appendChild(node.cloneNode(true));
      }
    });

    // Watch for the parent .reveal gaining .in
    if (allWordSpans.length) {
      const parent = title.closest('.reveal') || title;
      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          allWordSpans.forEach(span => {
            span.style.opacity   = '1';
            span.style.transform = 'translateY(0)';
          });
          obs.disconnect();
        }
      }, { threshold: 0.15 });
      obs.observe(parent);
    }
  });
})();


/* ── B-08. ABOUT CHAPTERS — sequential reveal ────────────────── */
/* .chapter elements inside .about-right stagger in as the
   section becomes visible — independent of the global .reveal. */

(function initChapterReveal() {
  const aboutRight = document.querySelector('.about-right');
  if (!aboutRight) return;

  const chapters = aboutRight.querySelectorAll('.chapter');
  if (!chapters.length) return;

  if (!prefersReducedMotionB) {
    chapters.forEach((ch, i) => {
      ch.style.opacity   = '0';
      ch.style.transform = 'translateX(16px)';
      ch.style.transition = `opacity 0.6s var(--ease) ${i * 0.1}s, transform 0.6s var(--ease) ${i * 0.1}s`;
    });
  }

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      chapters.forEach(ch => {
        ch.style.opacity   = '1';
        ch.style.transform = 'translateX(0)';
      });
      obs.disconnect();
    }
  }, { threshold: 0.15 });

  obs.observe(aboutRight);
})();


/* ── B-09. STAT ITEMS — number flip on hover ─────────────────── */
/* When the user hovers a .stat-item, the number briefly scales up
   with a spring bounce, drawing attention to the metric.
   Purely CSS-class driven for performance. */

(function initStatHover() {
  document.querySelectorAll('.stat-item').forEach(item => {
    const num = item.querySelector('.stat-num');
    if (!num) return;

    item.addEventListener('mouseenter', () => {
      if (prefersReducedMotionB) return;
      num.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      num.style.transform  = 'scale(1.12)';
    });
    item.addEventListener('mouseleave', () => {
      num.style.transform = 'scale(1)';
    });
  });
})();


/* ── B-10. SMOOTH SECTION TRANSITIONS ────────────────────────── */
/* Adds a data-visible attribute to each section as it enters and
   leaves the viewport. CSS can use this for ambient transitions. */

(function initSectionVisibility() {
  const sects = document.querySelectorAll('section[id]');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      e.target.setAttribute('data-visible', e.isIntersecting ? 'true' : 'false');
    });
  }, { threshold: 0.05 });

  sects.forEach(s => obs.observe(s));
})();


/* ── HERO PHOTO ROTATION ──────────────────────────────────────── */
/* Cycles through all 5 photos every 4 seconds with a crossfade.
   First photo shows immediately on load. */

(function initPhotoRotation() {
  const container = document.querySelector('.hero-photo-placeholder');
  if (!container) return;

  const imgs = Array.from(container.querySelectorAll('img'));
  if (!imgs.length) return;

  let current = 0;

  function showPhoto(index) {
    imgs.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
  }

  // Activate first photo as soon as it loads (or immediately if cached)
  function activateFirst() {
    showPhoto(0);
    // Hide the AKZ initials once real photo is showing
    const init = container.querySelector('.photo-init');
    if (init) init.style.display = 'none';
  }

  if (imgs[0].complete && imgs[0].naturalWidth > 0) {
    activateFirst();
  } else {
    imgs[0].addEventListener('load', activateFirst, { once: true });
    imgs[0].addEventListener('error', () => {
      // Try next photo if first fails
      current = 1;
      imgs[1] && (imgs[1].onload = () => showPhoto(1));
    }, { once: true });
  }

  // Rotate every 4 seconds
  setInterval(() => {
    current = (current + 1) % imgs.length;
    showPhoto(current);
  }, 4000);
})();
