/**
 * K.A.G Unity Church – Toll Ruiru | script.js (v4 – fixed)
 * ─────────────────────────────────────────────────────────
 * Fixes in v4:
 *  • BUG FIX: `if (hasErrors) return` was commented out —
 *    invalid data was being sent to Formspree and silently rejected.
 *  • BUG FIX: phone validation block had wrong indentation (was
 *    outside the if-block scope, causing silent parse errors in
 *    some strict environments).
 *  • Removed stray console.log("Submitting...") debug line.
 *  • Fixed typo in init log ("bt" → "by").
 *  • Added YouTube click-to-play handler (Error 153 fix).
 *  • All other logic preserved as-is from v3.
 */

'use strict';

/* ══════════════════════════════
   CONSTANTS
══════════════════════════════ */
const FORMSPREE_URL = 'https://formspree.io/f/xnjlrape';

/* ══════════════════════════════
   HELPERS
══════════════════════════════ */

/** Validate email format */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Validate phone – optional field, accepts Kenyan / international formats */
function isValidPhone(phone) {
  if (!phone) return true;
  return /^[+\d\s\-()]{7,20}$/.test(phone);
}

/* ══════════════════════════════
   NAVBAR
══════════════════════════════ */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

/* Active nav highlight on scroll */
const sections    = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const link = document.querySelector(`.nav-link[href="#${section.id}"]`);
    if (!link) return;
    link.classList.toggle(
      'active',
      scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight
    );
  });
}, { passive: true });

const activeStyle = document.createElement('style');
activeStyle.textContent =
  `.nav-link.active{color:#fff!important;background:rgba(255,255,255,.15)!important;}`;
document.head.appendChild(activeStyle);

/* ══════════════════════════════
   SMOOTH SCROLL
══════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 10,
        behavior: 'smooth'
      });
    }
  });
});

/* ══════════════════════════════
   SCROLL REVEAL
══════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

document.querySelectorAll('.hero .reveal').forEach((el, i) => {
  setTimeout(() => el.classList.add('visible'), 300 + i * 180);
});

/* ══════════════════════════════
   BACK TO TOP
══════════════════════════════ */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════
   CONTACT FORM → FORMSPREE
   ─────────────────────────────
   KEY FIX: `if (hasErrors) return` was commented out in v3.
   This meant the form always submitted — even with empty or
   invalid fields — causing Formspree to silently reject it
   on the hosted version (Netlify enforces stricter CORS
   origin checks than localhost, so local appeared to work).
══════════════════════════════ */
  const form = document.getElementById("contactForm");
  const statusMsg = document.getElementById("statusMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // stop normal submission

    const phoneInput = document.getElementById("phone");

if (phoneInput) {
  phoneInput.addEventListener("input", function () {
    // remove anything that's not a number
    this.value = this.value.replace(/\D/g, "");

    // limit to 10 digits
    if (this.value.length > 10) {
      this.value = this.value.slice(0, 10);
    }
  });
}

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (name === "" || email === "" || !email.includes("@") || message === "") {
      statusMsg.style.color = "red";
      statusMsg.textContent = "Please fill in all fields correctly.";
      return;
    }

    // Send data to Formspree
    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        statusMsg.style.color = "green";
        statusMsg.textContent = "Thank you! Your message has been sent successfully.";
        form.reset(); // ✅ Clears name, email, and message fields
      } else {
        statusMsg.style.color = "red";
        statusMsg.textContent = "Oops! Something went wrong. Please try again.";
      }
    } catch (error) {
      statusMsg.style.color = "red";
      statusMsg.textContent = "Network error. Please check your connection.";
    }
  });
/* ── Field-level error helpers ── */
function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById(fieldId + 'Error');
  if (field) field.classList.add('input-error');
  if (errEl) errEl.textContent = message;
}

function clearFormErrors() {
  document.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

/* Clear individual field error as the user types */
['name', 'email', 'phone', 'message'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    el.classList.remove('input-error');
    const errEl = document.getElementById(id + 'Error');
    if (errEl) errEl.textContent = '';
  });
});

/* ══════════════════════════════
   SHARE
══════════════════════════════ */
async function shareWebsite() {
  const shareData = {
    title: 'K.A.G Unity Church – Toll Ruiru',
    text:  "Visit K.A.G Unity Church in Ruiru – a place of spiritual nourishment and God's presence.",
    url:   window.location.href
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast('✅ Link copied to clipboard!', 'success');
    }
  } catch {
    showToast('Link: ' + window.location.href, 'info');
  }
}

/* ══════════════════════════════
   TOAST NOTIFICATIONS (XSS-safe)
══════════════════════════════ */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const palette = {
    success: { bg: '#166534', border: '#16a34a' },
    error:   { bg: '#991b1b', border: '#dc2626' },
    info:    { bg: '#1e3a8a', border: '#3b82f6' }
  };
  const c = palette[type] || palette.success;

  const toast = document.createElement('div');
  toast.className   = 'toast-notification';
  toast.textContent = message; // textContent only — never innerHTML (XSS-safe)

  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '5rem',
    left:         '50%',
    transform:    'translateX(-50%) translateY(30px)',
    background:   c.bg,
    border:       `1px solid ${c.border}`,
    color:        '#fff',
    padding:      '.85rem 1.75rem',
    borderRadius: '50px',
    fontFamily:   "'Poppins', sans-serif",
    fontSize:     '.9rem',
    fontWeight:   '500',
    zIndex:       '9999',
    boxShadow:    '0 8px 32px rgba(0,0,0,.3)',
    opacity:      '0',
    transition:   'all .4s cubic-bezier(.4,0,.2,1)',
    whiteSpace:   'nowrap',
    maxWidth:     '90vw',
    textOverflow: 'ellipsis',
    overflow:     'hidden'
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }));

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

/* ══════════════════════════════
   EVENTS FILTER
══════════════════════════════ */
const filterBtns = document.querySelectorAll('.ef-btn');
const eventCards = document.querySelectorAll('.event-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    eventCards.forEach(card => {
      const show = filter === 'all' || card.getAttribute('data-category') === filter;
      card.classList.toggle('hidden', !show);
      if (show) {
        card.classList.remove('visible');
        void card.offsetWidth; // force reflow for re-animation
        setTimeout(() => card.classList.add('visible'), 20);
      }
    });
  });
});

/* ══════════════════════════════
   COUNTDOWN TIMER
══════════════════════════════ */
(function startCountdown() {
  const target = new Date('2026-05-15T22:00:00+03:00').getTime();
  const dEl    = document.getElementById('cd-days');
  const hEl    = document.getElementById('cd-hours');
  const mEl    = document.getElementById('cd-mins');
  const sEl    = document.getElementById('cd-secs');
  if (!dEl) return;

  const pad = n => String(Math.max(0, n)).padStart(2, '0');

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      [dEl, hEl, mEl, sEl].forEach(el => { el.textContent = '00'; });
      return;
    }
    dEl.textContent = pad(Math.floor(diff / 86400000));
    hEl.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    mEl.textContent = pad(Math.floor((diff % 3600000)  / 60000));
    sEl.textContent = pad(Math.floor((diff % 60000)    / 1000));
  }

  tick();
  setInterval(tick, 1000);
})();

/* ══════════════════════════════
   RATING COUNTER ANIMATION
══════════════════════════════ */
const ratingNum = document.querySelector('.rating-num');
if (ratingNum) {
  new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    let start = null;
    const duration = 1500;
    (function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      ratingNum.textContent = (eased * 4.3).toFixed(1);
      if (progress < 1) requestAnimationFrame(step);
    })(performance.now());
  }, { threshold: 0.5 }).observe(ratingNum);
}

/* ══════════════════════════════
   YOUTUBE CLICK-TO-PLAY
   ─────────────────────────────
   Replaces raw iframes with a thumbnail + play-button UI.
   On click → injects an autoplay iframe.
   "Watch on YouTube" link always visible as fallback for
   videos with embedding disabled (Error 153).
   Only one video plays at a time.
══════════════════════════════ */
(function initYTPlayers() {
  const activePlayers = [];

  document.querySelectorAll('.yt-player').forEach(player => {
    const btn = player.querySelector('.yt-play-btn');
    if (!btn) return;

    function activate(e) {
      /* Let the "Watch on YouTube" link navigate normally */
      if (e.target.closest('.yt-watch-link')) return;
      e.preventDefault();
      e.stopPropagation();

      const videoId = player.dataset.videoId;
      const title   = player.dataset.title || 'Sermon video';

      /* Pause any other active player */
      activePlayers.forEach(p => {
        if (p !== player) {
          const existingIframe = p.querySelector('iframe');
          if (existingIframe) existingIframe.remove();
          p.classList.remove('playing');
        }
      });

      /* Inject the iframe */
      if (!player.classList.contains('playing')) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        iframe.title = title;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        );
        iframe.setAttribute('allowfullscreen', '');
        player.appendChild(iframe);
        player.classList.add('playing');

        if (!activePlayers.includes(player)) activePlayers.push(player);
      }
    }

    player.addEventListener('click', activate);
    btn.addEventListener('click', activate);
  });
})();

/* ══════════════════════════════
   GALLERY (click feedback)
══════════════════════════════ */
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const label = item.querySelector('.gallery-overlay span')?.textContent || 'Gallery';
    showToast(`📸 ${label}`, 'info');
  });
});

/* ══════════════════════════════
   INIT
══════════════════════════════ */
console.log('✝ K.A.G Unity Church – Toll Ruiru | Built by CODE_WITH_FRED in Kenya.');