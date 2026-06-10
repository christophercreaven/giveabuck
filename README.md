# GiveABuck.org

A non-profit web platform that pools small donations from individual donors into tuition scholarships for students attending accredited U.S. colleges, universities, and community colleges.

## What it does

- **Donors** create scholarships targeted at a school or field of study, set a funding goal, and share them on social media
- **Anyone** can contribute — even $1 — and watch the pool grow toward the goal
- **Students** submit applications with a personal essay
- **Donors** review applications and vote for recipients
- **Leaderboards** track friendly competition between schools and fields of study

Free to use. No ads required. Non-profit.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | Prisma ORM + SQLite (dev) |
| Auth | JWT (DONOR / STUDENT / ADMIN roles) |

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
git clone https://github.com/christophercreaven/giveabuck.git
cd giveabuck
npm install
```

### Set up the database

```bash
cd server
cp .env.example .env        # edit DATABASE_URL and JWT_SECRET if needed
npx prisma migrate dev
npx ts-node prisma/seed.ts  # optional: load demo data
cd ..
```

### Run

```bash
# from the repo root — starts both servers concurrently
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

## Demo accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Donor | jane@example.com | donor123 |
| Student | alex@example.com | student123 |
| Admin | admin@giveabuck.org | admin123 |

## Project structure

```
giveabuck/
├── client/               # React frontend
│   └── src/
│       ├── components/   # Navbar, ScholarshipCard
│       ├── context/      # AuthContext (JWT)
│       ├── lib/          # Axios client, TypeScript types
│       └── pages/        # Home, Scholarships, Dashboard, Leaderboard, …
└── server/               # Express API
    ├── prisma/           # Schema, migrations, seed
    └── src/
        ├── middleware/   # JWT auth, role guards
        └── routes/       # auth, scholarships, donations, applications, users
```

## API routes

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Current user |
| GET | `/api/scholarships` | List (filterable by school, field, status, search) |
| POST | `/api/scholarships` | Create scholarship (DONOR) |
| GET | `/api/scholarships/:id` | Detail with donations, applications, comments |
| POST | `/api/scholarships/:id/comments` | Add comment |
| GET | `/api/scholarships/leaderboard` | Top schools and fields by amount raised |
| POST | `/api/donations` | Donate to a scholarship |
| GET | `/api/donations/my` | My donation history |
| POST | `/api/applications` | Apply for a scholarship (STUDENT) |
| POST | `/api/applications/:id/vote` | Vote / unvote (DONOR, during VOTING status) |
| GET | `/api/applications/my` | My applications |
| GET | `/api/users/stats` | Site-wide totals |

## Scholarship lifecycle

```
OPEN → VOTING → FUNDED | CLOSED
```

Admins advance status via `PATCH /api/scholarships/:id/status`.

## License

MIT
