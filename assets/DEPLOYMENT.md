# K.A.G Unity Church Website — Deployment Guide
## Netlify (Recommended) · Production Ready

---

## 1. What's Included in This Package

| File | Purpose |
|---|---|
| `index.html` | Main website (fully audited & improved) |
| `style.css` | All styles (uniform images, responsive, security) |
| `script.js` | All JS (secure form handler, validation, XSS-safe) |
| `netlify.toml` | Netlify config (security headers, HTTPS, caching) |
| `*.jpg / *.webp / *.avif / *.jpeg / *.png` | All image assets |
| `favicon.ico`, `*.png`, `site.webmanifest` | Favicon & PWA assets |

---

## 2. Deploy to Netlify (Step-by-Step)

### Option A — Drag & Drop (Fastest)
1. Go to [netlify.com](https://netlify.com) and sign in (or create a free account).
2. On your **Sites** dashboard, click **"Add new site" → "Deploy manually"**.
3. Drag and drop **the entire folder** (all files at once) into the upload box.
4. Netlify will deploy instantly. You'll get a URL like `random-name.netlify.app`.
5. Rename it under **Site settings → General → Change site name**.

### Option B — Git (Recommended for updates)
1. Push all files to a GitHub repository.
2. On Netlify: **"Add new site" → "Import an existing project" → GitHub**.
3. Select your repo. Leave **Build command** blank and **Publish directory** as `.` (dot).
4. Click **Deploy site**.

---

## 3. Set Up Form Email Notifications (mwangifr@gmail.com)

Netlify Forms captures all contact submissions automatically. To receive them by email:

1. In the Netlify dashboard, go to **Site → Forms**.
2. After the first test submission the `contact` form will appear.
3. Click on the form → **"Form notifications"** → **"Add notification" → "Email notification"**.
4. Enter: `mwangifr@gmail.com`
5. Click **Save**.

> ✅ Every contact form submission will now be emailed directly to mwangifr@gmail.com.
> You can also view all submissions under **Netlify → Forms → contact**.

**Spam protection already active:**
- **Honeypot field** (`bot-field`) is hidden from humans but traps bots.
- Netlify's own bot detection runs server-side automatically.
- All inputs are validated client-side (length, format, required).

---

## 4. Custom Domain (Optional)

1. Go to **Site settings → Domain management → Add custom domain**.
2. Enter your domain (e.g. `kagunitychurch.co.ke`).
3. Update your DNS with the records Netlify provides.
4. Netlify provisions a **free SSL certificate (HTTPS)** automatically via Let's Encrypt.

> The `netlify.toml` already enforces HTTPS with `Strict-Transport-Security` headers.

---

## 5. Security Features Applied

| Feature | Implementation |
|---|---|
| HTTPS enforcement | `Strict-Transport-Security` header + redirect rule in `netlify.toml` |
| XSS protection | All user content rendered as `textContent` (never `innerHTML`) |
| Input sanitisation | Client-side: trim, minlength, maxlength, email/phone regex |
| Spam protection | Honeypot field (`bot-field`) + Netlify's server-side detection |
| No secrets in frontend | Form processing done entirely server-side by Netlify |
| Clickjacking protection | `X-Frame-Options: SAMEORIGIN` |
| Content-Security-Policy | Restrictive CSP in `netlify.toml` — no inline XSS vectors |
| MIME sniffing prevention | `X-Content-Type-Options: nosniff` |
| Referrer control | `Referrer-Policy: strict-origin-when-cross-origin` |
| Permissions policy | Camera, mic, geolocation, payment all disabled |

---

## 6. Changes Made to the Website

### Contact Form
- Converted to **Netlify Forms** (no backend code required, email delivered server-side)
- Added **honeypot** anti-spam field
- Added full **client-side validation** (name, email, phone, message)
- Real **AJAX submission** with loading state, success, and error messages
- All form values handled as plain text — no `innerHTML` injection possible

### Homepage — Share Button
- **"Send to Phone" button removed** across all screen sizes
- **Share button is now centred** horizontally on both desktop and mobile

### Events Section
- All **duplicate cards removed** — each category now has **2 unique events**:
  - **Prayer**: All-Night Vigil (May 2) + Monthly Prayer Breakfast (May 16)
  - **Youth**: Youth Ignite Night (May 9) + Youth Leadership Forum (May 30)
  - **Special**: Women's Ministry Tea (May 17) + Men of Purpose Summit (May 24)
  - **Outreach**: Community Outreach Day (Jun 7) + Hospital & Prison Ministry (Jun 28)

### Icons
- All decorative emoji icons replaced with **Font Awesome 5 Free** classic icons
- Only **YouTube, Facebook, WhatsApp, Instagram** social icons retained
- **Rating stars** kept as Unicode `★` characters (semantic)
- Location, phone, clock, pin icons use FA solid set

### Services Section Images
- All service images are now **uniform**: `width: 100%; height: 160px; object-fit: cover`
- Consistent `border-radius: 10px` applied to all service images
- Same treatment applied to About section value card images

### Security & Code Quality
- `rel="noopener noreferrer"` added to all `target="_blank"` links
- `aria-*` attributes added throughout for accessibility
- `loading="lazy"` added to all below-fold images
- `sanitise()` helper added to script.js to prevent XSS via textContent
- Removed `sendToPhone()` function entirely

---

## 7. Testing After Deployment

After deploying, verify:

- [ ] Site loads over **HTTPS** (padlock in browser)
- [ ] Contact form submits and you receive email at `mwangifr@gmail.com`
- [ ] Honeypot field is not visible to users
- [ ] Events filter works (All / Prayer / Youth / Special / Outreach)
- [ ] Countdown timer shows correct days to May 2
- [ ] Share button is centred and works
- [ ] Site is responsive on mobile (375px width)
- [ ] YouTube sermon embeds load correctly
- [ ] Google Maps embed loads

---

## 8. Support

Built by **CODE WITH FRED** — [codewithfred.netlify.app](https://codewithfred.netlify.app/)

For form-related questions: Netlify dashboard → Forms → contact
