/**
 * K.A.G Unity Church – Toll Ruiru | script.js (v6 – Blue & Pure Gold)
 * ──────────────────────────────────────────────────────────────────
 * Preserved: Formspree contact form + validation, share, toast,
 * mobile menu, header state, scroll reveal, auto-calculated "next
 * service" dates, optional verified special events, sermon click-to-play,
 * ministries interactive stage & preview, accessible gallery lightbox.
 */
'use strict';

/* ══════════════════════════════
   CONSTANTS
══════════════════════════════ */
const FORMSPREE_URL = 'https://formspree.io/f/xnjlrape';

/**
 * SPECIAL EVENTS — add only verified, dated events here.
 * Past events are hidden automatically. Example:
 *   { title: 'Worship Night Kesha', start: '2027-02-05T21:00:00+03:00',
 *     time: '9:00 PM – 4:00 AM', place: 'Main Sanctuary', note: 'All welcome', cta: '#contact' }
 */
const SPECIAL_EVENTS = [];

/* Weekly rhythm (East Africa Time, UTC+3, no DST) */
const SCHEDULE = [
  { dow: 0, h: 9,  m: 0,  title: 'Main Service',     label: '9:00 AM', main: true },
  { dow: 2, h: 18, m: 0,  title: 'Bible Study',      label: '6:00 PM' },
  { dow: 3, h: 18, m: 30, title: 'Prayer Night',     label: '6:30 PM' },
  { dow: 5, h: 17, m: 30, title: 'Youth Fellowship', label: '5:30 PM' }
];

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ══════════════════════════════
   HELPERS
══════════════════════════════ */
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email); }

/** Next occurrence (as a UTC timestamp) of a weekly slot in Nairobi time. */
function nextOccurrence(dow, h, m, now = Date.now()) {
  const eat = new Date(now + 3 * 3600000);
  for (let k = 0; k < 8; k++) {
    const t = Date.UTC(eat.getUTCFullYear(), eat.getUTCMonth(), eat.getUTCDate() + k, h - 3, m);
    const d = new Date(t + 3 * 3600000).getUTCDay();
    if (d === dow && t > now) return t;
  }
  return null;
}
const fmtDate = (ts, opts) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Nairobi', ...opts }).format(ts);

/* ══════════════════════════════
   HEADER + MOBILE MENU
══════════════════════════════ */
const navbar    = $('#navbar');
const hamburger = $('#hamburger');
const nav       = $('#primaryNav');
const backToTop = $('#backToTop');
const mqMobile  = window.matchMedia('(max-width: 1080px)');

function setMenu(open) {
  nav.classList.toggle('open', open);
  navbar.classList.toggle('menu-on', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  $('.menu-toggle-label', hamburger).textContent = open ? 'Close' : 'Menu';
  document.body.classList.toggle('menu-open', open);
  if (mqMobile.matches) nav.toggleAttribute('inert', !open);
}
function syncNavMode() { nav.toggleAttribute('inert', mqMobile.matches && !nav.classList.contains('open')); if (!mqMobile.matches) setMenu(false); }
syncNavMode();
mqMobile.addEventListener('change', syncNavMode);

hamburger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
$$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); hamburger.focus(); }
});

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('visible', window.scrollY > 600);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* Active nav highlight */
const navLinks = $$('.nav-link');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => sectionObserver.observe(s));

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
backToTop.addEventListener('click', scrollToTop);

/* ══════════════════════════════
   CONTACT FORM → FORMSPREE
══════════════════════════════ */
(function initForm() {
  const form = $('#contactForm');
  const statusMsg = $('#statusMsg');
  if (!form) return;
  const phoneInput = $('#phone');

  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 10);
    });
  }
  ['name', 'email', 'phone', 'message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => el.classList.remove('input-error'));
  });

  const say = (msg, ok) => { statusMsg.style.color = ok ? '#166534' : '#a32626'; statusMsg.textContent = msg; };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const message = $('#message').value.trim();

    $$('.input-error', form).forEach(el => el.classList.remove('input-error'));
    const bad = [];
    if (!name) bad.push('name');
    if (!isValidEmail(email)) bad.push('email');
    if (phoneInput && !/^[0-9]{10}$/.test(phone)) bad.push('phone');
    if (!message) bad.push('message');
    if (bad.length) {
      bad.forEach(id => document.getElementById(id).classList.add('input-error'));
      document.getElementById(bad[0]).focus();
      say(bad.includes('phone') && bad.length === 1
        ? 'Please enter a 10-digit phone number.'
        : 'Please fill in all fields correctly.', false);
      return;
    }

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    say('Sending…', true);
    try {
      const response = await fetch(form.action || FORMSPREE_URL, {
        method: form.method,
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) { say('Thank you! Your message has been sent successfully.', true); form.reset(); }
      else say('Oops! Something went wrong. Please try again.', false);
    } catch (err) {
      say('Network error. Please check your connection.', false);
    } finally { btn.disabled = false; }
  });
})();

/* ══════════════════════════════
   SHARE + TOAST
══════════════════════════════ */
async function shareWebsite() {
  const shareData = {
    title: 'K.A.G Unity Church – Toll Ruiru',
    text: "Visit K.A.G Unity Church in Ruiru – a place of spiritual nourishment and God's presence.",
    url: window.location.href
  };
  try {
    if (navigator.share) await navigator.share(shareData);
    else { await navigator.clipboard.writeText(window.location.href); showToast('Link copied to clipboard'); }
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    showToast('Link: ' + window.location.href);
  }
}
$('#shareBtn')?.addEventListener('click', shareWebsite);

function showToast(message) {
  $('.toast-notification')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.setAttribute('role', 'status');
  toast.textContent = message; // textContent only (XSS-safe)
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 450); }, 4000);
}

/* ══════════════════════════════
   NEXT SERVICE + UPCOMING
══════════════════════════════ */
(function initUpcoming() {
  const now = Date.now();

  /* Hero: next main service */
  const hero = $('#nextService strong');
  const next = nextOccurrence(0, 9, 0, now);
  if (hero && next) hero.textContent = fmtDate(next, { weekday: 'long', day: 'numeric', month: 'long' }) + ' · 9:00 AM';

  /* Upcoming list, auto-dated */
  const list = $('#upcomingList');
  if (list) {
    const rows = SCHEDULE.map(s => ({ ...s, ts: nextOccurrence(s.dow, s.h, s.m, now) }))
      .filter(s => s.ts).sort((a, b) => a.ts - b.ts);
    const html = rows.map(s => {
      const li = document.createElement('li');
      li.className = 'upcoming-item reveal' + (s.main ? ' is-main' : '');
      const date = document.createElement('div'); date.className = 'up-date';
      const day = document.createElement('span'); day.className = 'up-day'; day.textContent = fmtDate(s.ts, { weekday: 'long' });
      const num = document.createElement('span'); num.className = 'up-num'; num.textContent = fmtDate(s.ts, { day: 'numeric' });
      const mon = document.createElement('span'); mon.className = 'up-mon'; mon.textContent = fmtDate(s.ts, { month: 'long' });
      date.append(day, num, mon);
      const body = document.createElement('div'); body.className = 'up-body';
      const h3 = document.createElement('h3'); h3.textContent = s.title;
      const p = document.createElement('p'); p.textContent = s.label;
      body.append(h3, p);
      li.append(date, body);
      return li;
    });
    list.replaceChildren(...html);
  }

  /* Verified special events (future only) */
  const box = $('#specialEvents');
  if (box) {
    const future = SPECIAL_EVENTS.filter(ev => Date.parse(ev.start) > now).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
    if (future.length) {
      box.hidden = false;
      box.replaceChildren(...future.map(ev => {
        const t = Date.parse(ev.start);
        const art = document.createElement('article'); art.className = 'special';
        const date = document.createElement('div'); date.className = 'sp-date';
        const b = document.createElement('b'); b.textContent = fmtDate(t, { day: 'numeric' });
        const sp = document.createElement('span'); sp.textContent = fmtDate(t, { month: 'short', year: 'numeric' });
        date.append(b, sp);
        const info = document.createElement('div');
        const h3 = document.createElement('h3'); h3.textContent = ev.title;
        const p = document.createElement('p');
        p.textContent = [fmtDate(t, { weekday: 'long' }), ev.time, ev.place, ev.note].filter(Boolean).join(' · ');
        info.append(h3, p);
        const a = document.createElement('a'); a.className = 'btn btn-gold'; a.href = ev.cta || '#contact'; a.textContent = 'Register interest';
        art.append(date, info, a);
        return art;
      }));
    }
  }
})();

/* ══════════════════════════════
   SCROLL REVEAL (runs after dynamic upcoming items are mounted)
══════════════════════════════ */
(function initReveal() {
  const items = $$('.reveal');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const siblings = el.parentElement ? $$(':scope > .reveal', el.parentElement) : [];
      const idx = Math.max(0, siblings.indexOf(el));
      el.style.transitionDelay = Math.min(idx, 6) * 75 + 'ms';
      el.classList.add('visible');
      obs.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => obs.observe(el));
})();

/* ══════════════════════════════
   SERMONS — click-to-play
══════════════════════════════ */
(function initSermons() {
  const players = $$('.yt-player');
  players.forEach(player => {
    const btn = $('.yt-play-btn', player);
    if (!btn) return;
    btn.addEventListener('click', () => {
      players.forEach(p => {
        if (p !== player) { $('iframe', p)?.remove(); p.classList.remove('playing'); }
      });
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(player.dataset.videoId)}?autoplay=1&rel=0&modestbranding=1`;
      iframe.title = player.dataset.title || 'Sermon video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      player.appendChild(iframe);
      player.classList.add('playing');
      iframe.focus();
    });
  });
})();

/* ══════════════════════════════
   MINISTRIES — interactive stage & image preview
══════════════════════════════ */
(function initMinistries() {
  const list  = $('#ministryList');
  const img   = $('#ministryImg');
  const pill  = $('#ministryStagePill');
  const title = $('#ministryStageTitle');
  const desc  = $('#ministryStageDesc');
  if (!list || !img) return;

  const buttons = $$('.ministry-btn', list);
  const set = btn => {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    if (pill && btn.dataset.pill) pill.textContent = btn.dataset.pill;
    if (title) title.textContent = btn.dataset.title || $('.m-name', btn)?.textContent || '';
    if (desc) {
      const d = $('.m-desc', btn)?.textContent;
      if (d) desc.textContent = d;
    }
    const src = `assets/img/${btn.dataset.img}.webp`;
    if (img.getAttribute('src') === src) return;
    img.classList.remove('is-active');
    setTimeout(() => {
      img.src = src;
      img.onload = () => img.classList.add('is-active');
      if (img.complete) img.classList.add('is-active');
    }, 200);
  };
  buttons.forEach(b => {
    b.addEventListener('click', () => set(b));
    b.addEventListener('mouseenter', () => { if (window.matchMedia('(hover: hover)').matches) set(b); });
    b.addEventListener('focus', () => set(b));
  });
  const warm = () => buttons.forEach(b => { const i = new Image(); i.src = `assets/img/${b.dataset.img}.webp`; });
  ('requestIdleCallback' in window) ? requestIdleCallback(warm) : setTimeout(warm, 2500);
})();

/* ══════════════════════════════
   GALLERY — lightbox
══════════════════════════════ */
(function initLightbox() {
  const dlg = $('#lightbox');
  const tiles = $$('#mosaic .tile');
  if (!dlg || !tiles.length) return;
  const img = $('#lbImg'), cap = $('#lbCap');
  let idx = 0, opener = null;

  const show = i => {
    idx = (i + tiles.length) % tiles.length;
    const t = tiles[idx];
    img.src = t.dataset.full;
    img.alt = $('img', t).alt;
    cap.textContent = t.dataset.cap || '';
  };
  tiles.forEach((t, i) => t.addEventListener('click', () => { opener = t; show(i); dlg.showModal(); }));
  $('#lbClose').addEventListener('click', () => dlg.close());
  $('#lbPrev').addEventListener('click', () => show(idx - 1));
  $('#lbNext').addEventListener('click', () => show(idx + 1));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => opener?.focus());
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();

/* ══════════════════════════════
   FOOTER YEAR
══════════════════════════════ */
(function () { const y = $('#year'); if (y) y.textContent = new Date().getFullYear(); })();

/* ══════════════════════════════
   HERO INTERACTIONS (Spotlight, 3D Arch Tilt & Rising Motes)
══════════════════════════════ */
(function initHero() {
  const hero = $('#hero');
  const hl = $('.hl', hero);
  const arch = $('#arch');
  const cv = $('#motes');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!hero) return;

  /* Spotlight on headline + 3D Arch tilt */
  if (hl && arch) {
    let active = false;
    const setSpot = (x, y) => {
      const r = hl.getBoundingClientRect();
      hl.style.setProperty('--mx', (x - r.left) + 'px');
      hl.style.setProperty('--my', (y - r.top) + 'px');
    };

    hero.addEventListener('pointermove', e => {
      active = true;
      setSpot(e.clientX, e.clientY);
      const r = arch.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      arch.style.setProperty('--ry', (dx * 14) + 'deg');
      arch.style.setProperty('--rx', (-dy * 10) + 'deg');
    });

    hero.addEventListener('pointerleave', () => {
      active = false;
      arch.style.setProperty('--ry', '0deg');
      arch.style.setProperty('--rx', '0deg');
    });

    /* Idle animated spotlight sweep */
    (function idle(t) {
      if (!active && !reduce) {
        const r = hl.getBoundingClientRect();
        hl.style.setProperty('--mx', (r.width * (0.5 + 0.4 * Math.sin(t / 1800))) + 'px');
        hl.style.setProperty('--my', (r.height * (0.5 + 0.4 * Math.cos(t / 2300))) + 'px');
      }
      requestAnimationFrame(idle);
    })(0);
  }

  /* Rising celestial light motes */
  if (cv && cv.getContext) {
    const cx = cv.getContext('2d');
    let W = 0, H = 0;
    const P = [];
    const mouse = { x: -999, y: -999 };

    function size() {
      W = cv.width = hero.clientWidth;
      H = cv.height = hero.clientHeight;
    }
    size();
    window.addEventListener('resize', size);

    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });

    hero.addEventListener('pointerleave', () => {
      mouse.x = -999;
      mouse.y = -999;
    });

    const count = window.innerWidth < 700 ? 40 : 90;
    for (let i = 0; i < count; i++) {
      P.push({
        x: Math.random() * (W || 2000),
        y: Math.random() * (H || 1200),
        r: Math.random() * 2.4 + 0.6,
        v: Math.random() * 0.5 + 0.15,
        a: Math.random() * 0.6 + 0.2,
        p: Math.random() * 6
      });
    }

    function draw(t) {
      cx.clearRect(0, 0, W, H);
      P.forEach(p => {
        p.y -= p.v;
        p.x += Math.sin(t / 1500 + p.p) * 0.3;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 140) {
          p.x += (dx / d) * 1.6;
          p.y += (dy / d) * 1.6;
        }
        if (p.y < -10) {
          p.y = H + 10;
          p.x = Math.random() * W;
        }
        if (p.x > W) p.x = 0;
        if (p.x < 0) p.x = W;

        const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, 'rgba(255, 235, 170, ' + p.a + ')');
        g.addColorStop(0.45, 'rgba(56, 189, 248, ' + (p.a * 0.65) + ')');
        g.addColorStop(1, 'rgba(56, 189, 248, 0)');
        cx.fillStyle = g;
        cx.beginPath();
        cx.arc(p.x, p.y, p.r * 5, 0, 6.3);
        cx.fill();
      });
      if (!reduce) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
})();

/* ══════════════════════════════
   VERSES RIBBON MARQUEE
══════════════════════════════ */
(function initVerses() {
  const el = $('#verses');
  if (!el) return;
  const verses = [
    ['The Lord is my light and my salvation', 'Psalm 27:1'],
    ['Be still, and know that I am God', 'Psalm 46:10'],
    ['I can do all things through Christ', 'Philippians 4:13'],
    ['Where two or three are gathered in my name', 'Matthew 18:20'],
    ['Taste and see that the Lord is good', 'Psalm 34:8']
  ];
  const items = verses.map(v => '<span>' + v[0] + '<em>' + v[1] + '</em></span>').join('');
  el.innerHTML = items + items;
})();
