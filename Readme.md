# UrbanEase — Smart Local Services Marketplace

A full-stack hyperlocal service booking platform where customers can discover, book, and pay for nearby service professionals — plumbers, electricians, cleaners, AC technicians, tutors, and more.

Built as a production-grade prototype with Django REST Framework + React (Vite), featuring role-based access, a complete booking lifecycle, mock payments, geo-based provider search, and real-time-style notifications.

---

## Live Features

### Authentication & Users
- JWT-based login and registration (phone number as username)
- Three roles: **Customer**, **Provider**, **Admin** — each with a dedicated dashboard
- Role-based route guards on both frontend and backend
- Edit profile (full name, email) from the navbar dropdown
- User session rehydrated on page refresh via `/api/users/me/`

### Service Discovery
- Browse all service categories with icon mapping
- Search services by name/description from the **Landing hero** (popular search chips included)
- Filter services by category
- Provider listing page per service with city filter, sort by rating/price/jobs
- **Geo-based "Near me"** — uses browser geolocation + Haversine formula to compute distances and sort providers by proximity
- Distance badge shown on each provider card when location is active

### Provider Public Profile (`/providers/:id`)
- Hero section with avatar, verified badge, star rating, stats
- Three tabs: **About**, **Services** (with Book button per service), **Reviews** (with rating breakdown bars)
- Sticky booking sidebar with hourly rate and Book Now CTA

### Booking System
- Full booking form: service selector, date/time picker, address, city, pincode, notes
- Complete status lifecycle: `pending → confirmed → in_progress → completed → cancelled`
- Strict server-side transition validation
- Status audit log (who changed what, when, with notes)
- **Rebooking** — "Book Again" on completed bookings pre-fills address/city/pincode/notes; shows a rebooking banner

### My Bookings (`/bookings`)
- Tab filter: All / Pending / Confirmed / In Progress / Completed / Cancelled
- Actions per card: Pay Now (inline), Leave Review, Cancel, View Details, Book Again
- Links to full Booking Detail page

### Booking Detail (`/bookings/:id`)
- Full booking info: service, provider link, date/time, address
- Visual status timeline with connector lines, actor names, timestamps
- Inline payment panel
- Leave a Review modal
- Book Again + Cancel actions

### Payments (Mock)
- Custom card UI with live card preview (number, name, expiry)
- Test cards: `4242 4242 4242 4242` → Success · `4000 0000 0000 0002` → Decline
- Backend validates card and marks payment as captured/failed
- Structured to swap in real Razorpay keys when going live

### Ratings & Reviews
- One review per completed booking
- 1–5 star picker with label (Terrible → Excellent)
- Provider `avg_rating` and `total_reviews` auto-recalculated via DB aggregate on every save/delete
- Rating breakdown bar chart on provider profile

### Notifications
- In-app notification bell in navbar with unread count badge
- Polling every 30 seconds for new notifications
- Django signals fire notifications on: booking created, status changes, review received
- Mark individual or all as read; click navigates to `/bookings`

### Customer Dashboard (`/dashboard`)
- Quick stats: recent bookings, quick links to services and bookings

### Provider Dashboard (`/provider`)
- Availability toggle (live green pulse dot)
- Booking management with per-status action buttons (Confirm, Start, Complete, Decline, Cancel)
- Profile editor: bio, experience, hourly rate, city, services offered
- **Earnings page** (`/provider/earnings`): total earned, this month vs last month with % trend, animated 6-month bar chart, recent completed jobs table

### Admin Panel (`/admin-panel`)
- Platform overview: total users, bookings, revenue, 7-day bookings bar chart
- User management: search, filter by role, block/unblock
- Booking management: search, filter by status
- Provider management: verify/revoke verification

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Framer Motion, Lucide React, Zustand |
| **Backend** | Django 5, Django REST Framework 3.15, SimpleJWT |
| **Database** | MySQL (mysqlclient) |
| **Auth** | JWT (access + refresh tokens with auto-refresh interceptor) |
| **Styling** | Inline styles (no Tailwind — v4 incompatibility resolved this way) |
| **Payments** | Mock card UI (structured for Razorpay swap) |

---

## Project Structure

```
UrbanEase/
├── backend/
│   ├── apps/
│   │   ├── users/          # Custom user model, JWT auth, /api/users/me/
│   │   ├── services/       # Categories, Services, ProviderProfile, geo search
│   │   ├── bookings/       # Booking lifecycle, status logs, earnings endpoint
│   │   ├── reviews/        # Reviews, provider stat recalculation
│   │   ├── notifications/  # Signals-based notification system
│   │   ├── payments/       # Mock payment flow (Razorpay-ready)
│   │   └── adminpanel/     # Platform stats and management views
│   ├── core/
│   │   └── settings/       # base / dev / prod split settings
│   └── .env
│
└── frontend/
    └── src/
        ├── api/            # Axios modules: auth, services, bookings, payments, etc.
        ├── components/
        │   └── layout/     # Navbar, NotificationBell, Logo
        ├── pages/          # All route-level pages
        └── store/          # Zustand auth store
```

---

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements/dev.txt
cp .env.example .env           # fill in DB credentials
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

Frontend runs on `http://localhost:5173`, backend on `http://127.0.0.1:8000`.

### Test Accounts (after seeding)
| Role | How to create |
|---|---|
| Admin | `python manage.py createsuperuser` |
| Provider | Register with role = `provider` |
| Customer | Register with role = `customer` |

### Mock Payment Cards
| Card Number | Result |
|---|---|
| `4242 4242 4242 4242` | Payment success |
| `4000 0000 0000 0002` | Payment declined |

---

## API Overview

| Prefix | App |
|---|---|
| `/api/users/` | Auth, registration, profile |
| `/api/services/` | Categories, services, providers |
| `/api/bookings/` | Booking CRUD, status updates, earnings |
| `/api/reviews/` | Create and list reviews |
| `/api/notifications/` | List, mark read, unread count |
| `/api/payments/` | Create order, verify, status |
| `/api/admin-api/` | Admin stats and management |

---

## Planned / Future Features

### Quick Wins
- [ ] **Search suggestions** — live dropdown under hero search showing matching service names as you type
- [ ] **Booking confirmation receipt** — printable/downloadable receipt modal after booking
- [ ] **Provider response time badge** — "Usually responds in < 1 hr" based on avg confirm time from status logs
- [ ] **Category landing pages** — `/categories/:slug` with hero, services grid, top providers

### Medium Features
- [ ] **Customer address book** — save multiple addresses, pick from them in BookingFlow
- [ ] **Coupon / promo codes** — backend validates code, applies flat or percent discount at checkout
- [ ] **Provider availability calendar** — block specific dates; BookingFlow hides unavailable dates
- [ ] **Wishlist / Saved providers** — heart icon on provider cards, saved list in customer dashboard
- [ ] **Service packages** — providers offer Basic / Standard / Premium tiers with different prices
- [ ] **OTP login** — 6-digit code flow replacing password (mockable with same pattern as payments)

### Bigger Features
- [ ] **Real-time notifications** — replace 30 s polling with Django Channels + Redis WebSocket
- [ ] **In-booking chat** — customer ↔ provider messaging thread per booking
- [ ] **Provider onboarding wizard** — step-by-step: add services → set rate → upload ID → go live
- [ ] **Customer loyalty points** — earn points per completed booking, redeem as discount
- [ ] **Referral system** — unique codes, bonus credit on successful referral
- [ ] **Real Razorpay integration** — swap mock keys; backend already structured for it

### Polish & Production
- [ ] **Responsive / mobile layout** — current UI is desktop-first; add breakpoints for phones
- [ ] **Dark mode** — system-preference toggle
- [ ] **SEO meta tags** — per-page titles, descriptions, Open Graph tags via React Helmet
- [ ] **Image uploads** — provider portfolio photos, service images, user avatars (S3/Cloudinary)
- [ ] **Multi-city configuration** — admin controls which cities are active
- [ ] **Email / SMS notifications** — Twilio or SendGrid for booking confirmations
