# @rueda.dev/gems-sardius

Sardius - DDD NestJS Backend Template by Rueda.dev

A production-ready NestJS template following Domain-Driven Design (DDD) principles with clean architecture.

## Quick Start

```bash
npx "@rueda.dev/gems-sardius" my-project
cd my-project
npm install
```

## Features

- **Domain-Driven Design** - Clean separation between Domain, HTTP, and Infrastructure layers
- **NestJS** - Only used as HTTP layer, keeping your domain pure
- **TypeScript** - Full type safety with ES2023
- **Prisma** - Type-safe ORM with PostgreSQL
- **Zod** - Runtime validation
- **JWT Auth** - Built-in authentication with Google OAuth support
- **RBAC** - Role-based access control
- **Either Pattern** - Functional error handling without exceptions
- **Testing** - Jest configured for unit and E2E tests

## Architecture

```
src/
├── domain/          # Business logic (pure TypeScript, no frameworks)
│   ├── @shared/     # Shared primitives (Entity, ValueObject, Either)
│   └── identity/    # Identity bounded context (User management)
│
├── http/            # HTTP layer (NestJS)
│   ├── @shared/     # Shared HTTP utilities
│   ├── auth/        # Authentication endpoints
│   └── users/       # User management endpoints
│
└── infra/           # Infrastructure implementations
    ├── auth/        # Auth providers (Google, Password)
    ├── cryptography/# Bcrypt implementation
    └── database/    # Prisma & repositories
```

## Layer Rules

- **domain/** CANNOT import from **http/** or **infra/**
- **http/** can import from **domain/** and **infra/**
- **infra/** implements interfaces defined in **domain/**

## Getting Started

After creating your project:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start PostgreSQL
docker-compose up -d

# 4. Run migrations
npm run prisma:migrate

# 5. Start development server
npm run start:dev
```

## Available Scripts

```bash
npm run start:dev      # Development with hot reload
npm run build          # Build for production
npm run test:unit      # Run unit tests
npm run test:e2e       # Run E2E tests
npm run prisma:studio  # Open Prisma Studio
```

## License

MIT

## Author

[Rueda.dev](https://rueda.dev)
