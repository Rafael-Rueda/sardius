# @rueda.dev/gems-sardius

<p align="center">
  <img src="https://raw.githubusercontent.com/Rafael-Rueda/sardius/main/Sardius.png" alt="Sardius Logo" width="400"/>
</p>

<h3 align="center">A Backend Template That Won't Lock You Into a Framework</h3>

<p align="center">
  Build scalable Node.js backends with pure business logic that lives independently from NestJS
</p>

---

## What is Sardius?

Sardius is a **production-ready backend template** that puts your business logic first. Unlike typical NestJS projects where everything depends on the framework, Sardius keeps your core domain **100% pure TypeScript** with zero external dependencies.

**The result?** Your business logic can be tested in milliseconds, migrated to any framework, and maintained without framework expertise.

## Quick Start

```bash
npx "@rueda.dev/gems-sardius" my-project
cd my-project
npm install
cp .env.example .env
docker-compose up -d
npm run prisma:migrate
npm run start:dev
```

Your API is now running at `http://localhost:3333`

## What's Included

| Feature | Description |
|---------|-------------|
| **User Management** | Complete CRUD with email/username authentication |
| **Google OAuth** | Sign in with Google out of the box |
| **Role-Based Access** | `@Admin()`, `@Public()`, `@Roles()` decorators |
| **File Storage** | GCP Cloud Storage with auto image optimization |
| **RS256 JWT** | Asymmetric encryption for secure tokens |
| **Either Pattern** | Type-safe error handling without try-catch |

## Why Sardius?

### Traditional Approach
```typescript
// Business logic mixed with framework code
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    // What if you need to change ORMs?
    // What if NestJS changes its patterns?
  }
}
```

### Sardius Approach
```typescript
// Pure TypeScript - no framework, no dependencies
export class CreateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(request: CreateUserRequest): Promise<Either<Error, User>> {
    // Your business logic stays the same forever
    // NestJS is just the HTTP adapter
  }
}
```

## Project Structure

```
src/
├── domain/           # Pure business logic (no imports from http/ or infra/)
│   ├── @shared/      # Entity, ValueObject, Either pattern
│   ├── identity/     # User management bounded context
│   └── storage/      # File storage bounded context
│
├── http/             # NestJS (just an HTTP adapter)
│   ├── auth/         # POST /auth/login, GET /auth/google
│   ├── users/        # CRUD endpoints
│   └── storage/      # File upload/download
│
└── infra/            # External implementations
    ├── database/     # Prisma repositories
    ├── cryptography/ # Bcrypt, JWT
    └── storage/      # GCP Storage, Sharp
```

## Available Commands

```bash
npm run start:dev      # Development server with hot reload
npm run build          # Build for production
npm run test:unit      # Fast unit tests (domain only)
npm run test:e2e       # Integration tests
npm run prisma:studio  # Visual database editor
```

## Learn More

See the full documentation at the [Sardius GitHub repository](https://github.com/rafael-rueda/sardius).

## License

MIT - [Rueda.dev](https://rueda.dev)
