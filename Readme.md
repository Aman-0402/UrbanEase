<div align="center">

<img src="frontend/src/Image/UrbanEase.png" alt="UrbanEase Logo" height="80"/>

# UrbanEase

### Smart Local Services Marketplace

**Discover · Book · Pay · Review — all in one place**

A full-stack hyperlocal platform connecting customers with trusted service professionals — plumbers, electricians, cleaners, AC technicians, tutors, and more.

[![Django](https://img.shields.io/badge/Django-5.0-092E20?style=flat-square&logo=django&logoColor=white)](https://djangoproject.com)
[![DRF](https://img.shields.io/badge/DRF-3.15-ff1709?style=flat-square&logo=django&logoColor=white)](https://www.django-rest-framework.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-black?style=flat-square&logo=jsonwebtokens)](https://jwt.io)

</div>

---

## ✨ What's Built

### 🔐 Authentication & Users
| Feature | Detail |
|---|---|
| JWT login & register | Phone number as username, access + refresh tokens with auto-refresh interceptor |
| Three roles | **Customer · Provider · Admin** — each with a dedicated dashboard and route guards |
| Profile editing | Full name, email editable from navbar dropdown; session rehydrated on refresh |

---

### 🔍 Service Discovery
| Feature | Detail |
|---|---|
| Hero search | Search from the landing page — navigates to `/services?q=...` with popular search chips |
| Category filter | Browse by category with emoji icon mapping |
| Provider listing | Per-service provider page with city filter, sort by rating / price / jobs |
| 📍 Near me | Browser geolocation + Haversine formula — shows distance badges, sorts by proximity |
| Provider profile | Public page with About / Services / Reviews tabs, rating breakdown, sticky booking CTA |

---

### 📅 Booking System
| Feature | Detail |
|---|---|
| Booking form | Service selector, date/time picker, address, city, pincode, notes |
| Status lifecycle | `pending → confirmed → in_progress → completed → cancelled` with server-side validation |
| Status timeline | Visual audit log — who changed what, when, with notes |
| 🔁 Rebooking | "Book Again" on completed bookings pre-fills address details; shows rebooking banner |
| My Bookings | Tab filter + actions: Pay Now, Leave Review, Cancel, View Details, Book Again |
| Booking Detail | Full receipt view with timeline, inline payment, review modal, and actions sidebar |

---

### 💳 Payments (Mock)
> Structured to swap in real Razorpay keys — just add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env`

| Card | Result |
|---|---|
| `4242 4242 4242 4242` | ✅ Payment success |
| `4000 0000 0000 0002` | ❌ Payment declined |

Custom card UI with live card preview (number, name, expiry animate as you type).

---

### ⭐ Ratings & Reviews
- One review per completed booking with 1–5 star picker (Terrible → Excellent labels)
- `avg_rating` and `total_reviews` auto-recalculated via DB aggregate on every save/delete
- Rating breakdown bar chart on provider public profile

---

### 🔔 Notifications
- In-app bell with unread count badge, polls every 30 s
- Django **signals** fire on: booking created · status changes · review received
- Mark individual or all as read; click navigates to `/bookings`

---

### 🏠 Dashboards

| Dashboard | Highlights |
|---|---|
| **Customer** `/dashboard` | Recent bookings, quick links |
| **Provider** `/provider` | Availability toggle (live pulse dot), booking management, profile editor |
| **Provider Earnings** `/provider/earnings` | Total earned, this month vs last month (% trend), animated 6-month bar chart, recent jobs table |
| **Admin** `/admin-panel` | Platform stats, 7-day bar chart, user/booking/provider management tables |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 8, Framer Motion, Lucide React, Zustand |
| **Backend** | Django 5, Django REST Framework 3.15, SimpleJWT |
| **Database** | MySQL 8 (mysqlclient) |
| **Auth** | JWT — access + refresh with silent auto-refresh on 401 |
| **Styling** | Inline styles system-wide (Tailwind v4 incompatibility) |
| **Payments** | Mock card UI — Razorpay-ready (add keys to go live) |
| **Notifications** | Django signals + REST polling (WebSocket-ready upgrade path) |

---

## 📁 Project Structure

```
UrbanEase/
├── backend/
│   ├── apps/
│   │   ├── users/           # Custom AbstractBaseUser, JWT auth, /api/users/me/
│   │   ├── services/        # Categories, Services, ProviderProfile, Haversine geo search
│   │   ├── bookings/        # Full lifecycle, status logs, cancel, earnings endpoint
│   │   ├── reviews/         # Reviews with auto provider stat recalculation
│   │   ├── notifications/   # Signal-based notification system
│   │   ├── payments/        # Mock payment (Razorpay-structured)
│   │   └── adminpanel/      # Platform stats and management views
│   ├── core/settings/       # base / dev / prod split settings
│   └── .env
│
└── frontend/src/
    ├── api/                 # Axios modules per domain
    ├── components/layout/   # Navbar (dropdown + profile modal), NotificationBell, Logo
    ├── pages/               # All 12 route-level pages
    └── store/               # Zustand auth store
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8 running locally

### Backend

```bash
cd backend

# Create and activate virtualenv
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements/dev.txt

# Configure environment
cp .env.example .env
# → Edit .env: set DB_NAME, DB_USER, DB_PASSWORD

# Run migrations and start server
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://127.0.0.1:8000/api/ |
| Django Admin | http://127.0.0.1:8000/admin/ |

---

## 🔑 API Reference

| Endpoint prefix | Responsibility |
|---|---|
| `POST /api/token/` | Login — returns access + refresh JWT |
| `/api/users/` | Register, profile (`/me/`) |
| `/api/services/` | Categories, services, providers (with geo params `?lat=&lng=`) |
| `/api/bookings/` | Create, list, detail, status update, cancel, earnings |
| `/api/reviews/` | Submit and list reviews |
| `/api/notifications/` | List, unread count, mark read |
| `/api/payments/` | Create order, verify, payment status |
| `/api/admin-api/` | Platform stats, user / booking / provider management |

---

## 🗺 Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing | Public |
| `/services` | Service catalogue | Public |
| `/services/:slug/providers` | Provider listing | Public |
| `/providers/:id` | Provider public profile | Public |
| `/login` · `/register` | Auth pages | Guest only |
| `/dashboard` | Customer dashboard | Customer |
| `/bookings` | My bookings list | Customer |
| `/bookings/:id` | Booking detail + receipt | Customer |
| `/book/:providerId` | Booking flow | Customer |
| `/provider` | Provider dashboard | Provider |
| `/provider/earnings` | Earnings analytics | Provider |
| `/admin-panel` | Admin panel | Admin |

---

## 🔮 Planned Features

### ⚡ Quick Wins
- [ ] **Search suggestions** — live autocomplete dropdown under hero search bar
- [ ] **Booking receipt** — printable/downloadable receipt modal after booking confirmed
- [ ] **Provider response time** — "Usually responds in < 1 hr" badge from avg confirm time
- [ ] **Category landing pages** — `/categories/:slug` with hero, services grid, top providers

### 🧩 Medium Features
- [ ] **Customer address book** — save multiple addresses, pick in BookingFlow
- [ ] **Coupon / promo codes** — flat or percent discount validated at checkout
- [ ] **Provider availability calendar** — block dates; BookingFlow hides unavailable days
- [ ] **Wishlist / saved providers** — heart icon on cards, saved list in dashboard
- [ ] **Service packages** — Basic / Standard / Premium tiers per provider
- [ ] **OTP login** — 6-digit code flow (mockable, same pattern as payments)

### 🏗 Bigger Features
- [ ] **Real-time notifications** — Django Channels + Redis WebSocket (replaces 30 s polling)
- [ ] **In-booking chat** — customer ↔ provider messaging thread per booking
- [ ] **Provider onboarding wizard** — add services → set rate → upload ID → go live
- [ ] **Loyalty points** — earn per completed booking, redeem as discount
- [ ] **Referral system** — unique codes, bonus credit on successful referral
- [ ] **Real Razorpay** — add keys to `.env`; backend is already structured for it

### 🎨 Polish & Production
- [ ] **Mobile responsive layout** — current UI is desktop-first; needs phone breakpoints
- [ ] **Dark mode** — system-preference toggle
- [ ] **SEO / meta tags** — per-page titles, OG tags via React Helmet
- [ ] **Image uploads** — avatars, provider photos, service images (S3 / Cloudinary)
- [ ] **Email / SMS notifications** — Twilio or SendGrid for booking confirmations
- [ ] **Multi-city config** — admin controls which cities are active on the platform

---

<div align="center">

Built with ❤️ as a production-grade prototype · Full-stack · Django + React

</div>
