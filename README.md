# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Task Manager

A modern task management application built with Next.js, TypeScript, and Prisma.

## Features

- Task creation and management
- User authentication
- Responsive design
- Real-time updates

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Prisma ORM
- NextAuth.js
- Tailwind CSS
- ESLint & Prettier

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (for database)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### Database

The project uses PostgreSQL as its database. You can start the database using:

```bash
./start-database.sh
```

### Running Tests

```bash
npm run test
# or
yarn test
```

### Formatting & Linting

```bash
# Format code
npm run format
# or
yarn format

# Lint code
npm run lint
# or
yarn lint
```

## Project Structure

```
src/
├── app/             # Next.js app directory
├── components/      # Reusable React components
├── lib/            # Utility functions and shared logic
├── server/         # Server-side code and API routes
└── types/          # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
