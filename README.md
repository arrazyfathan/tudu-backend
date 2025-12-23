# Tudu Backend

Backend API for a journal management system. Built with TypeScript, Express, Prisma, PostgreSQL, and Firebase Cloud Messaging (FCM) for push notifications.

## Table of Contents

- Overview
- Features
- Tech Stack
- Architecture Notes
- Getting Started
- Environment Variables
- Database and Prisma
- Firebase (Push Notifications)
- API Documentation
- Response Format and Errors
- Scripts
- Project Structure
- Contributing
- License

## Overview

Tudu Backend is a REST API that manages users, journals, categories, tags, and device tokens. It provides JWT-based authentication with refresh tokens stored in the database.

## Features

- User registration, login, logout, and refresh token rotation
- Journal CRUD with pagination and search
- Category and tag management (global defaults + user-specific)
- Firebase Cloud Messaging support for push notifications
- Validation with Zod and centralized error handling
- Structured logging with Winston

## Tech Stack

- Node.js + TypeScript
- Express 5
- PostgreSQL + Prisma (driver adapter for pg)
- JWT for auth (access + refresh token)
- Zod validation
- Jest for testing
- Winston logging

## Architecture Notes

- Auth is required for all `/api/*` routes except register/login/refresh and send-notification.
- Refresh tokens are hashed and stored in the database with a 30-day expiry.
- Journals support soft delete via `deletedAt`.
- Categories and tags support global (userId null) and user-specific entries.
- Redis is currently disabled in `src/config/redis.config.ts`; the code uses a no-op client.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- (Optional) Firebase project for notifications

### Install

```bash
npm install
```

### Configure environment

```bash
cp .env.sample .env
```

Fill in the required values; see the Environment Variables section below.

### Setup database

```bash
npx prisma migrate dev
npx prisma generate
```

### (Optional) Seed data

```bash
npm run seed
```

### Run the API

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Environment Variables

Create `.env` based on `.env.sample`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/tudu
PORT=3000
JWT_ACCESS_SECRET=your-secret
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

Notes:

- `JWT_ACCESS_SECRET` is required for auth middleware and token generation.
- Redis values are optional while Redis is disabled.

## Database and Prisma

- Prisma schema: `prisma/schema.prisma`
- Prisma client output: `generated/prisma`
- Migrations: `prisma/migrations`

Useful commands:

```bash
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

## Firebase (Push Notifications)

The API uses `service-account.json` at the project root.

Steps:

1. Copy the example file:

   ```bash
   cp service-account.example.json service-account.json
   ```

2. Fill in values from your Firebase Admin SDK service account.

This is required for `POST /api/notification/send-notification`.

## API Documentation

Base URL: `http://localhost:3000`

### Auth

- `POST /api/auth/register`
  - Body: `{ email, username, name, password }`
  - Response: user object

- `POST /api/auth/login`
  - Body: `{ username, password }`
  - Response: user object + `token.access_token` and `token.refresh_token`
  - Access token expires in 1 hour; refresh token expires in 30 days

- `POST /api/auth/refresh_token`
  - Body: `{ refresh_token }`
  - Response: user object + new tokens

- `POST /api/auth/logout`
  - Auth: Bearer token
  - Body: `{ refresh_token }`

### User

All routes require `Authorization: Bearer <access_token>`.

- `GET /api/user`
  - Response: current user

- `PATCH /api/user`
  - Body (any of): `{ name, email, password }`

- `DELETE /api/user`
  - Soft deletes the user and revokes tokens

- `POST /api/user/fcm-token`
  - Body: `{ fcmToken }`

### Categories

All routes require auth.

- `GET /api/categories`
  - Returns global + user categories

- `POST /api/categories`
  - Body: `{ name }`

- `PATCH /api/categories/:categoryId`
  - Body: `{ name }`

- `DELETE /api/categories/:categoryId`

### Tags

All routes require auth.

- `GET /api/tags`
  - Returns global + user tags

- `POST /api/tags`
  - Body: `{ name }` (no spaces allowed)

- `PATCH /api/tags/:tagId`
  - Body: `{ name }` (no spaces allowed)

- `DELETE /api/tags/:tagId`

### Journals

All routes require auth.

- `POST /api/journals`
  - Body: `{ title, content, date, categoryId?, tagIds }`
  - `date` should be an ISO date string
  - `tagIds` should be an array (use `[]` if none)

- `GET /api/journals`
  - Query: `search`, `page`, `size`
  - Defaults: `page=1`, `size=10`
  - `search` matches title or content (case-insensitive)

- `PUT /api/journals/:journalId`
  - Body: `{ title, content, date, categoryId?, tagIds }`

- `DELETE /api/journals/:journalId`
  - Soft delete

- `DELETE /api/journals`
  - Body: `{ ids: ["id1", "id2"] }`

Notes:

- `categoryId` must exist and belong to the user or be global.
- `tagIds` must exist; missing tags return 404.
- Update requires full fields (title, content, date).

### Notifications

- `POST /api/notification/send-notification`
  - Body: `{ title, body, token }`
  - No auth required

## Response Format and Errors

Successful response:

```json
{
  "status": "success",
  "message": "...",
  "data": {}
}
```

Paginated response:

```json
{
  "status": "success",
  "message": "...",
  "data": [],
  "paging": {
    "current_page": 1,
    "total_page": 5,
    "total_items": 50,
    "size": 10
  }
}
```

Error response:

```json
{
  "status": "error",
  "message": "...",
  "errors": {
    "field": "message"
  }
}
```

Common status codes:

- 400: validation errors
- 401: unauthorized
- 403: missing/invalid auth token
- 404: not found
- 409: conflict (duplicate)
- 500: unexpected server error

## Scripts

```bash
npm run dev
npm run build
npm start
npm run type-check
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm test
npm run seed
```

## Project Structure

```
.
├── dist/                 # Compiled output
├── generated/            # Prisma client output
├── logs/                 # Winston logs (rotating)
├── prisma/               # Prisma schema + migrations + seed
├── src/                  # Application source
│   ├── config/           # Database and Redis config
│   ├── controllers/      # Route handlers
│   ├── errors/           # Custom error types
│   ├── firebase/         # Firebase admin setup
│   ├── middlewares/      # Auth, error handling
│   ├── models/           # Request/response models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Logger, helpers
│   ├── validations/      # Zod schemas
│   ├── app.ts            # Express app
│   └── server.ts         # Server entry point
├── README.md
├── package.json
└── tsconfig.json
```

## Contributing

1. Fork and create a feature branch.
2. Run tests and lint checks before opening a PR.
3. Keep changes focused and documented.

## License

MIT
