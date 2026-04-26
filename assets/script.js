/**
 * K.A.G Unity Church – Toll Ruiru | script.js (v3 – Formspree)
 * ─────────────────────────────────────────────────────────────
 * Features : sticky nav · hamburger · scroll-reveal · Formspree
 *            AJAX handler · input validation & sanitisation ·
 *            XSS-safe toast · back-to-top · share API ·
 *            countdown · events filter · active-nav highlight.
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
   CONTACT FORM  →  FORMSPREE
══════════════════════════════ */
const contactForm = document.getElementById('contactForm');

if (contactForm) {

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn  = document.getElementById('submitBtn');
    const successBox = document.getElementById('formSuccess');
    const errorBox   = document.getElementById('formError');

    /* Reset previous feedback */
    clearFormErrors();
    successBox.style.display = 'none';
    errorBox.style.display   = 'none';

    /* ── Collect & trim values ── */
    const nameEl    = document.getElementById('name');
    const emailEl   = document.getElementById('email');
    const phoneEl   = document.getElementById('phone');
    const messageEl = document.getElementById('message');

    const name    = nameEl.value.trim();
    const email   = emailEl.value.trim();
    const phone   = phoneEl.value.trim();
    const message = messageEl.value.trim();

    /* ── Client-side validation ── */
    let hasErrors = false;

    if (name.length < 2) {
      setFieldError('name', 'Please enter your full name (at least 2 characters).');
      hasErrors = true;
    }
    if (!isValidEmail(email)) {
      setFieldError('email', 'Please enter a valid email address.');
      hasErrors = true;
    }
    if (!isValidPhone(phone)) {
      setFieldError('phone', 'Please enter a valid phone number, or leave it blank.');
      hasErrors = true;
    }
    if (message.length < 10) {
      setFieldError('message', 'Please write at least 10 characters in your message.');
      hasErrors = true;
    }

    if (hasErrors) return;

    /* ── Honeypot check (client-side guard) ── */
    const honeypot = contactForm.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return; // silently abort – bot detected

    /* ── Loading state ── */
    submitBtn.disabled     = true;
    submitBtn.textContent  = 'Sending…';

    /* ── POST to Formspree ── */
    try {
      const res = await fetch(FORMSPREE_URL, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    new FormData(contactForm)
      });

      const data = await res.json();

      if (res.ok) {
        /* Success */
        contactForm.reset();
        successBox.style.display = 'flex';
        showToast('🙏 Message sent! We will get back to you soon.', 'success');
        setTimeout(() => { successBox.style.display = 'none'; }, 8000);
      } else {
        /* Formspree returned an error (e.g. validation, rate-limit) */
        const msg = data?.errors?.map(err => err.message).join(', ')
          || 'Submission failed. Please try again.';
        throw new Error(msg);
      }

    } catch (err) {
      console.error('Form submission error:', err.message);
      errorBox.style.display = 'block';
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send Message ✝';
    }
  });

}

/* Field-level error helpers */
function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById(fieldId + 'Error');
  if (field) field.classList.add('input-error');
  if (errEl) errEl.textContent = message;
}

function clearFormErrors() {
  document.querySelectorAll('.field-error').forEach(el  => { el.textContent = ''; });
  document.querySelectorAll('.input-error').forEach(el  => el.classList.remove('input-error'));
}

/* Clear individual field error on input */
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
   TOAST NOTIFICATIONS  (XSS-safe)
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
  toast.className = 'toast-notification';
  toast.textContent = message; // textContent – never innerHTML – prevents XSS

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
   INIT
══════════════════════════════ */
console.log('✝ K.A.G Unity Church – Toll Ruiru | Built bt CODE_WITH_FRED in Kenya.');
