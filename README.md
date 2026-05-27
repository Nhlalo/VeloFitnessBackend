# Vélo Fitness API

REST backend for the Vélo Fitness class booking platform. Built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

**Live API:** `https://velofitnessbackend.onrender.com`

---

## 🛠️ Tech Stack

- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT (access + refresh tokens)
- Stripe SDK
- Resend (email)

---

## 📁 Project Structure

```text
src/
├── controllers/     # Request handlers
├── middleware/      # Auth, validation, error handling
├── routes/          # API endpoints
├── services/        # Business logic
├── utils/           # Helpers (email, Stripe, logger)
└── index.ts         # Entry point
```

## 🚀 Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (test mode)
- Resend API key

### Installation

```bash
git clone git@github.com:Nhlalo/VeloFitnessBackend.git
cd VeloFitnessBackend
npm install
```

### Environment Variables

```
NODE_ENV=node_environment
PORT=app_port
APP_URL=your_app_url
CORS_ORIGIN=apps_allowed_to_call_your_backend
DATABASE_URL=your_database_url
SESSION_SECRET=your_session_secret_key
JWT_SECRET = your_token_scret_key
REFRESH_SECRET_KEY=your_refresh_token_secret_key
RESEND_API_KEY=re_your_resend_api_key
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
```

## Run migration and seed database

```
npx prisma migrate dev --name init
npx prisma db seed
```

### Run Backend

**Run Backend**

```
npm run dev
```

## 📬 Contact

Email – nhlalonkosi@gmail.com

Frontend Repo: https://github.com/Nhlalo/VeloFitness
Backend Repo: https://github.com/Nhlalo/VeloFitnessBackend
