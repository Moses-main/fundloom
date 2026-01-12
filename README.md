# FundLoom Frontend (Vite + React)

A modern single-page application that showcases charity campaigns, accepts donations, displays leaderboards and comments, and provides a polished UX with modals and theming. The current frontend uses localStorage as its data source but is designed to work with a REST backend.

## 🌟 Features

- **Campaign Browsing**: Grid/list of campaigns with stats, progress bars, days left, and templates.
- **Campaign Details**: View description, funds usage breakdown, donor list, and comments.
- **Donations**: Donation modal with amount, message, and payment method selection (crypto/card/bank/mobile).
- **Create Campaign**: Modal to create a new campaign with title, description, target, category, template, and optional image.
- **Comments**: Add comments on campaigns and view existing discussion.
- **Leaderboard**: Aggregated donor totals and counts.
- **Wallet Mock**: Simulated wallet connect/disconnect for demo UX.
- **Deep-links**: Auto-open donation modal via `?campaign=<id>` query param.
- **Responsive UI**: Built with modern UI components and Tailwind CSS.

## 🧰 Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- React Router DOM 7
- Radix UI primitives

See `package.json` for full dependency list.

## 🗂️ Project Structure

```
frontend/
└── src/
    ├── App.tsx, entireApp.tsx         # App shells and alternate layout
    ├── components/                    # UI components and modals
    ├── pages/                         # Views (Dashboard, Auth, etc.)
    ├── context/AppContext.tsx         # Global state (campaigns, donations, comments)
    ├── styles/, assets/, utils/       # Styling, assets, helpers
    ├── main.tsx, layout.tsx           # Vite/React bootstrap
    └── global.css, index.css          # Global styles
```

## 🔢 Data Model (Frontend)

Types used across the UI (see `src/context/AppContext.tsx`):

```ts
type PaymentMethod = 'crypto' | 'card' | 'bank' | 'mobile';

interface Campaign {
  id: number;
  charity_address: string;
  title: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  deadline: number; // epoch ms
  is_active: boolean;
  created_at: number; // epoch ms
  total_donors: number;
  image?: string | null;
  category?: string;
  template?: 'default' | 'impact' | 'medical' | 'creative';
  funds_used?: Record<string, number>;
}

interface Donation {
  id: number;
  donor_address: string;
  donor_name?: string;
  campaign_id: number;
  amount: number;
  timestamp: number; // epoch ms
  donor_message: string;
  payment_method: PaymentMethod;
}

interface Comment {
  id: number;
  campaign_id: number;
  author: string;
  message: string;
  timestamp: number; // epoch ms
}
```

Note: In production, IDs will be strings (MongoDB ObjectIds). The UI handles numeric IDs today due to localStorage seed data.

## 💾 State Management & Persistence

- Global state is managed in `src/context/AppContext.tsx`.
- Seed data arrays are loaded on first run and then persisted to `localStorage` under keys:
  - `cc_campaigns_v1`
  - `cc_donations_v1`
  - `cc_comments_v1`

## 🔀 Routing & Deep Links

- Main navigation tabs: campaigns, donate, charity, profile.
- If the URL contains `?campaign=<id>`, the Donation modal auto-opens on mount.

## 🧪 UX Flows

- Create Campaign: Opens modal, preview image, basic client-side validation, stores to localStorage.
- Donate: Opens modal, capture amount/message/method, simulates processing for non-crypto, updates state + shows thank-you.
- Comment: Adds a comment to the selected campaign and persists to localStorage.

## 🔗 Intended Backend API Contract

When connected to a backend, the UI expects REST endpoints to support these flows. Base URL example: `http://localhost:5000/api/v1`.

### Auth
- POST `/auth/register`
- POST `/auth/login`
- GET `/auth/me`
- POST `/auth/logout`
- POST `/auth/forgot-password`
- POST `/auth/reset-password`
- POST `/auth/connect-wallet`
- POST `/auth/disconnect-wallet`

### Campaigns
- GET `/campaigns` — list with filters and pagination
- GET `/campaigns/:id`
- POST `/campaigns` — create (auth required)
- PUT `/campaigns/:id` — update (creator only)
- DELETE `/campaigns/:id` — delete (creator only)
- GET `/campaigns/user/:userId` — campaigns by user
- POST `/campaigns/:id/updates` — add update (creator)
- GET `/campaigns/stats/overview`

### Donations
- POST `/donations` — create (auth required)
- GET `/donations/campaign/:campaignId`
- GET `/donations/my-donations` — current user
- GET `/donations/:id`
- GET `/donations/stats/overview`
- GET `/donations/leaderboard`

### Comments
- GET `/comments/campaign/:campaignId`
- POST `/comments/campaign/:campaignId` — create (auth required)
- PUT `/comments/:id` — update (author)
- DELETE `/comments/:id` — delete (author)
- POST `/comments/:id/like` — like/unlike
- POST `/comments/:id/report` — report
- GET `/comments/my-comments`

### Users
- GET `/users/:id`
- PUT `/users/profile`
- POST `/users/avatar`
- GET `/users/dashboard`
- GET `/users` — admin
- PUT `/users/:id/role` — admin
- PUT `/users/:id/verify` — admin
- DELETE `/users/account`

## 🛠️ Development

### Prerequisites
- Node.js 18+

### Install & Run

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on Vite’s default port (usually 5173).

## 🎨 Theming

- Theme provider and Radix UI used across components.
- Tailwind CSS for utility-first styling.

## ✅ Roadmap

- Replace localStorage with real API calls.
- Add API service layer with fetch/axios.
- Hook wallet connect to backend `/auth/connect-wallet`.
- File uploads for campaign images and user avatars.

---

Built with ❤️ using React, Vite, and Tailwind.