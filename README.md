# Tudu Backend

A robust backend API for a journal management system built with TypeScript, Express, and Prisma.

## Description

Tudu Backend is a RESTful API that provides a comprehensive solution for managing journals, categories, and tags. It features user authentication, authorization, and push notification capabilities.

## Main Features

- **User Authentication**: Register, login, logout, and token refresh functionality
- **Journal Management**: Create, read, update, and delete journals
- **Category Management**: Organize journals with customizable categories
- **Tag Management**: Add tags to journals for better organization and searchability
- **Push Notifications**: Firebase Cloud Messaging (FCM) integration for real-time notifications

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Logging**: Winston
- **Testing**: Jest
- **Containerization**: Docker
- **Push Notifications**: Firebase Admin SDK

## Installation Guide

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Firebase project (for push notifications)

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/arrazyfathan/tudu-backend.git
   cd tudu-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy the `.env.sample` file to `.env`
   - Fill in the required values:
     ```
     DATABASE_URL=postgresql://username:password@localhost:5432/tudu
     PORT=3000
     JWT_ACCESS_SECRET=your_secret_key
     ```

4. Set up the database:

   ```bash
   npx prisma migrate dev
   ```

5. Generate Prisma client:

   ```bash
   npx prisma generate
   ```

6. Seed the database (optional):
   ```bash
   npm run seed
   ```

## Usage Instructions

### Starting the Server

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm run build
npm start
```

### API Endpoints

#### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh_token` - Refresh access token
- `POST /api/auth/logout` - Logout (requires authentication)

#### User Management

- `GET /api/user` - Get current user profile
- `PATCH /api/user` - Update user profile
- `DELETE /api/user` - Delete user account
- `POST /api/user/fcm-token` - Store FCM token for notifications

#### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `PATCH /api/categories/:categoryId` - Update a category
- `DELETE /api/categories/:categoryId` - Delete a category

#### Tags

- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create a new tag
- `PATCH /api/tags/:tagId` - Update a tag
- `DELETE /api/tags/:tagId` - Delete a tag

#### Journals

- `GET /api/journals` - Get all journals
- `POST /api/journals` - Create a new journal
- `PUT /api/journals/:journalId` - Update a journal
- `DELETE /api/journals/:journalId` - Delete a journal
- `DELETE /api/journals` - Delete multiple journals

#### Notifications

- `POST /api/notification/send-notification` - Send a notification

## Project Structure

```
tudu-backend/
├── dist/                  # Compiled JavaScript files
├── docs/                  # Documentation
├── logs/                  # Application logs
├── prisma/                # Prisma schema and migrations
├── src/                   # Source code
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middlewares/       # Express middlewares
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
├── test/                  # Test files
├── .env                   # Environment variables
├── .env.sample            # Sample environment variables
├── docker-compose.yaml    # Docker Compose configuration
├── Dockerfile             # Docker configuration
├── package.json           # Project dependencies
└── tsconfig.json          # TypeScript configuration
```

## Contributing Guidelines

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run tests to ensure everything works (`npm test`)
5. Commit your changes (`git commit -m 'Add some feature'`)
6. Push to the branch (`git push origin feature/your-feature`)
7. Open a Pull Request

### Code Style

This project uses ESLint and Prettier for code formatting. Before submitting a PR, please ensure your code follows the style guidelines by running:

```bash
npm run lint
npm run format
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact/Author Info

- **Author**: Ar Razy Fathan Rabbani
- **GitHub**: [Your GitHub Profile](https://github.com/arrazyfathan)
- **Email**: [Your Email](mailto:razywrk@gmail.com)

## Acknowledgements

- Express.js team for the excellent web framework
- Prisma team for the powerful ORM
- All contributors who have helped improve this project
