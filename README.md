<p align="center">
  <img src="Sardius.png" alt="Sardius Logo" width="400"/>
</p>

<h1 align="center">Sardius</h1>

<p align="center">
  <strong>A Production-Ready Domain-Driven Design Backend Template</strong>
</p>

<p align="center">
  <em>Build scalable, maintainable, and testable backends with true DDD architecture</em>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node Version"/>
  <img src="https://img.shields.io/badge/typescript-5.7-blue" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/nestjs-11.0-red" alt="NestJS"/>
  <img src="https://img.shields.io/badge/prisma-7.1-purple" alt="Prisma"/>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License"/>
</p>

---

## Why Sardius?

Most "DDD" templates are just layered architectures with fancy folder names. **Sardius is different.**

We built Sardius with one core principle: **your business logic should never depend on your framework**. NestJS is powerful, but what happens when you need to migrate? What happens when the framework evolves?

With Sardius, your domain layer is **100% framework-agnostic**. Pure TypeScript. Zero dependencies. Fully testable. Always portable.

### The Problem with Traditional Backends

```
❌ Business logic scattered across controllers
❌ Framework lock-in making migrations painful
❌ Testing requires spinning up the entire application
❌ Try-catch spaghetti making error handling unpredictable
❌ Authentication bolted on as an afterthought
```

### The Sardius Solution

```
✅ Business logic isolated in the domain layer
✅ NestJS used only as an HTTP adapter
✅ Unit tests run in milliseconds with zero dependencies
✅ Functional error handling with Either pattern
✅ Complete authentication system out of the box
```

---

## Quick Start

### Using the CLI (Recommended)

```bash
npx "@rueda.dev/gems-sardius" my-awesome-project
cd my-awesome-project
npm install
```

### Manual Installation

```bash
git clone https://github.com/rafael-rueda/sardius.git my-project
cd my-project
npm install
cp .env.example .env
docker-compose up -d
npm run prisma:migrate
npm run start:dev
```

Your API is now running at `http://localhost:3333`

---

## Features

### True Domain-Driven Design

Not just layers—**real DDD** with bounded contexts, entities, value objects, and use cases. Your domain speaks the language of your business.

```typescript
// Pure domain logic - no framework, no dependencies
const result = await createUserUseCase.execute({
    email: "john@example.com",
    username: "john_doe",
    password: "secure123",
    role: "USER",
});

if (result.isLeft()) {
    // Type-safe error handling
    return handleError(result.value);
}

return result.value; // Type-safe user entity
```

### Either Pattern for Error Handling

Say goodbye to try-catch chaos. Sardius uses functional programming principles for predictable, type-safe error handling.

```typescript
// No exceptions thrown - ever
type AuthResult = Either<InvalidCredentialsError | UserNotFoundError, { user: User; token: string }>;
```

### Complete Authentication System

**Password Authentication** and **Google OAuth 2.0** work out of the box. RS256 JWT tokens. Automatic user creation on first OAuth login.

```typescript
// POST /auth/login - Password authentication
// GET /auth/google - Google OAuth redirect
// GET /auth/google/callback - OAuth callback

// Protected routes with decorators
@Admin()
@Get('admin/dashboard')
getAdminDashboard() { }

@Roles(Role.USER, Role.ADMIN)
@Get('profile')
getProfile() { }
```

### Role-Based Access Control

Built-in RBAC with `USER` and `ADMIN` roles. Easily extensible for your needs.

```typescript
@Public()  // No authentication required
@Admin()   // Only admins allowed
@Roles(Role.USER, Role.ADMIN)  // Multiple roles
```

### Value Objects with Auto-Validation

Immutable, self-validating domain primitives that protect your business invariants.

```typescript
// Username: 3-32 chars, lowercase, auto-slugified
const username = Username.create("John Doe");
// Result: "john_doe"

// Auto-generate unique usernames
const unique = Username.generateUniqueFrom("john_doe");
// Result: "john_doe_a7x9k2"
```

### Testing-First Architecture

Unit tests run in milliseconds because they don't need the framework. E2E tests validate your HTTP contracts.

```bash
npm run test:unit   # Domain logic tests (fast!)
npm run test:e2e    # HTTP endpoint tests
npm run test:cov    # Coverage report
```

### Enterprise-Grade Security

- **RS256 JWT** tokens (asymmetric encryption)
- **bcrypt** password hashing
- **Zod** runtime validation
- **Environment validation** at startup

---

## Architecture

Sardius enforces strict layer separation through clear dependency rules:

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Controllers │──│  Services   │──│ Guards & Decorators     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │               │                     │                  │
│         └───────────────┴─────────────────────┘                  │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │ imports
┌─────────────────────────▼────────────────────────────────────────┐
│                       Domain Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Use Cases  │──│  Entities   │──│    Value Objects        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐                                │
│  │ Repository  │  │  Provider   │  ← Abstract interfaces        │
│  │ Interfaces  │  │ Interfaces  │                                │
│  └─────────────┘  └─────────────┘                                │
└──────────────────────────────────────────────────────────────────┘
                          ▲ implements
┌─────────────────────────┴────────────────────────────────────────┐
│                    Infrastructure Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Prisma    │──│  Bcrypt     │──│    Google OAuth         │  │
│  │ Repository  │  │  Provider   │  │      Provider           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Layer Rules

| Layer              | Can Import From          | Cannot Import From   |
| ------------------ | ------------------------ | -------------------- |
| **Domain**         | Nothing external         | HTTP, Infrastructure |
| **HTTP**           | Domain, Infrastructure   | -                    |
| **Infrastructure** | Domain (interfaces only) | HTTP                 |

---

## Project Structure

```
sardius/
├── src/
│   ├── domain/                    # Pure business logic
│   │   ├── @shared/               # Primitives (Either, Entity, ValueObject)
│   │   └── identity/              # User management bounded context
│   │       ├── application/       # Use cases & repository interfaces
│   │       ├── enterprise/        # Entities & value objects
│   │       └── errors/            # Domain-specific errors
│   │
│   ├── http/                      # NestJS HTTP adapter
│   │   ├── @shared/               # Decorators, pipes, presenters
│   │   ├── auth/                  # Authentication endpoints
│   │   └── users/                 # User management endpoints
│   │
│   ├── infra/                     # External implementations
│   │   ├── auth/                  # OAuth & password providers
│   │   ├── cryptography/          # Bcrypt implementation
│   │   └── database/              # Prisma setup & repositories
│   │
│   └── env/                       # Environment validation
│
├── prisma/                        # Database schema & migrations
├── docker-compose.yml             # PostgreSQL for development
└── .env.example                   # Environment template
```

---

## Available Use Cases

Sardius comes with a complete **Identity** bounded context:

| Use Case              | Description                                        |
| --------------------- | -------------------------------------------------- |
| `CreateUserUseCase`   | Register new users with automatic password hashing |
| `AuthenticateUseCase` | Multi-method auth (password + Google OAuth)        |
| `GetUserByIdUseCase`  | Fetch user by ID                                   |
| `GetAllUsersUseCase`  | Paginated user listing                             |
| `UpdateUserUseCase`   | Update user profiles                               |
| `DeleteUserUseCase`   | Remove users                                       |

---

## API Endpoints

### Authentication

| Method | Endpoint                | Description           | Auth   |
| ------ | ----------------------- | --------------------- | ------ |
| `POST` | `/auth/login`           | Password login        | Public |
| `GET`  | `/auth/google`          | Google OAuth redirect | Public |
| `GET`  | `/auth/google/callback` | OAuth callback        | Public |

### Users

| Method   | Endpoint     | Description    | Auth     |
| -------- | ------------ | -------------- | -------- |
| `GET`    | `/users`     | List all users | Required |
| `GET`    | `/users/:id` | Get user by ID | Required |
| `PUT`    | `/users/:id` | Update user    | Required |
| `DELETE` | `/users/:id` | Delete user    | Admin    |

---

## Configuration

### Environment Variables

```env
# Server
PORT=3333

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sardius

# JWT (RS256 - Base64 encoded)
JWT_PRIVATE_KEY=<base64-encoded-private-key>
JWT_PUBLIC_KEY=<base64-encoded-public-key>

# Google OAuth 2.0
GOOGLE_OAUTH2_CLIENT_ID=<your-client-id>
GOOGLE_OAUTH2_CLIENT_SECRET=<your-client-secret>
GOOGLE_OAUTH2_REDIRECT_URL=http://localhost:3333/auth/google/callback
```

### Generate RS256 Keys

```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Generate public key
openssl rsa -in private.pem -pubout -out public.pem

# Encode to base64 for .env
cat private.pem | base64 -w 0
cat public.pem | base64 -w 0
```

---

## Commands

```bash
# Development
npm run start:dev        # Start with hot reload
npm run start:prod       # Production mode

# Building
npm run build            # Compile TypeScript

# Testing
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:cov         # Coverage report
npm run test:watch       # Watch mode

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio

# Code Quality
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting
```

---

## Tech Stack

| Technology         | Purpose                       |
| ------------------ | ----------------------------- |
| **Node.js 18+**    | Runtime environment           |
| **TypeScript 5.7** | Type-safe development         |
| **NestJS 11**      | HTTP framework (adapter only) |
| **Prisma 7**       | Type-safe ORM                 |
| **PostgreSQL**     | Database                      |
| **Zod**            | Runtime validation            |
| **Jest**           | Testing framework             |
| **bcrypt**         | Password hashing              |
| **googleapis**     | Google OAuth 2.0              |

---

## Extending Sardius

### Adding a New Bounded Context

1. Create the domain structure:

```
src/domain/your-context/
├── application/
│   ├── use-cases/
│   └── repositories/
├── enterprise/
│   ├── entities/
│   └── value-objects/
└── errors/
```

2. Define your entities and use cases (pure TypeScript)

3. Create repository interfaces in domain

4. Implement repositories in `src/infra/database/`

5. Create HTTP controllers in `src/http/your-context/`

6. Wire everything in the module

---

## Philosophy

> _"The domain layer is the heart of your application. Protect it at all costs."_

Sardius is built on these principles:

1. **Domain First** - Write business logic before choosing frameworks
2. **Explicit Over Implicit** - No magic, no hidden behavior
3. **Errors as Values** - Use Either, not exceptions
4. **Testability** - If it's hard to test, it's wrong
5. **Simplicity** - Only add what you need

---

## Who is This For?

Sardius is perfect for:

- **Enterprise teams** building scalable microservices
- **Startups** that want a solid foundation without technical debt
- **Developers** learning proper DDD implementation
- **Projects** that might need to change frameworks later

---

## Support & Community

- [Report Issues](https://github.com/rafael-rueda/sardius/issues)
- [Discussions](https://github.com/rafael-rueda/sardius/discussions)

---

## License

MIT © [rueda.dev](https://rueda.dev)

---

<p align="center">
  <sub>Built with love by <a href="https://rueda.dev">rueda.dev</a></sub>
</p>

<p align="center">
  <sub>Star us on GitHub — it motivates us a lot!</sub>
</p>
