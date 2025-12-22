```typescript
// src/domain/identity/enterprise/entities/user.entity.ts
import { Entity } from "@/domain/@shared/entities/entity";
import { UniqueEntityId } from "@/domain/@shared/value-objects/unique-entity-id";

interface UserProps {
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}

export class User extends Entity<UserProps> {
    get username() {
        return this.props.username;
    }
    get email() {
        return this.props.email;
    }
    // ... outros getters

    static create(props: Omit<UserProps, "createdAt">, id?: UniqueEntityId) {
        return new User({ ...props, createdAt: new Date() }, id);
    }
}
```

### Value Objects

```typescript
// src/domain/identity/enterprise/value-objects/email.vo.ts
import { ValueObject } from "@/domain/@shared/value-objects/value-object";

interface EmailProps {
    value: string;
}

export class Email extends ValueObject<EmailProps> {
    get value() {
        return this.props.value;
    }

    private static validate(email: string): boolean {
        // validacao
    }

    static create(email: string): Email {
        if (!this.validate(email)) {
            throw new InvalidEmailError(email);
        }
        return new Email({ value: email });
    }
}
```

### Use Cases

```typescript
// src/domain/identity/application/use-cases/create-account.use-case.ts
import { Either, left, right } from "@/domain/@shared/either";
import { User } from "@/domain/identity/enterprise/entities/user.entity";
import { UsersRepository } from "@/domain/identity/application/repositories/users.repository";
import { HashGenerator } from "@/domain/identity/application/cryptography/hash-generator";
import { AccountAlreadyExistsError } from "@/domain/identity/errors/account-already-exists.error";

interface CreateAccountRequest {
    username: string;
    email: string;
    password: string;
}

type CreateAccountResponse = Either<AccountAlreadyExistsError, { user: User }>;

export class CreateAccountUseCase {
    constructor(
        private usersRepository: UsersRepository,
        private hashGenerator: HashGenerator,
    ) {}

    async execute(request: CreateAccountRequest): Promise<CreateAccountResponse> {
        const existingUser = await this.usersRepository.findByEmail(request.email);

        if (existingUser) {
            return left(new AccountAlreadyExistsError(request.email));
        }

        const passwordHash = await this.hashGenerator.hash(request.password);

        const user = User.create({
            username: request.username,
            email: request.email,
            passwordHash,
        });

        await this.usersRepository.create(user);

        return right({ user });
    }
}
```

### Repository Interface (Contrato)

```typescript
// src/domain/identity/application/repositories/users.repository.ts
import { User } from "@/domain/identity/enterprise/entities/user.entity";

export abstract class UsersRepository {
    abstract findByEmail(email: string): Promise<User | null>;
    abstract findById(id: string): Promise<User | null>;
    abstract create(user: User): Promise<void>;
}
```

### Repository Implementation (Infra)

```typescript
// src/infra/database/repositories/prisma-users.repository.ts
import { UsersRepository } from "@/domain/identity/application/repositories/users.repository";
import { User } from "@/domain/identity/enterprise/entities/user.entity";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { PrismaUserMapper } from "@/infra/database/mappers/prisma-user.mapper";

export class PrismaUsersRepository implements UsersRepository {
    constructor(private prisma: PrismaService) {}

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        return PrismaUserMapper.toDomain(user);
    }

    async create(user: User): Promise<void> {
        const data = PrismaUserMapper.toPrisma(user);
        await this.prisma.user.create({ data });
    }
}
```

### NestJS Service (chama o Use Case)

```typescript
// src/http/auth/services/auth.service.ts
import { Injectable } from "@nestjs/common";
import { CreateAccountUseCase } from "@/domain/identity/application/use-cases/create-account.use-case";

@Injectable()
export class AuthService {
    constructor(private createAccountUseCase: CreateAccountUseCase) {}

    async createAccount(data: { username: string; email: string; password: string }) {
        return this.createAccountUseCase.execute(data);
    }
}
```

### NestJS Controller

```typescript
// src/http/auth/controllers/auth.controller.ts
import { Controller, Post, Body, UsePipes, BadRequestException } from "@nestjs/common";
import { ZodValidationPipe } from "@/http/auth/pipes/zod-validation.pipe";
import { createAccountBodySchema, CreateAccountBodySchemaType } from "@/http/auth/schemas/auth.controller.schema";
import { AuthService } from "@/http/auth/services/auth.service";
import { UserPresenter } from "@/http/auth/presenters/user.presenter";

@Controller("/auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("/register")
    @UsePipes(new ZodValidationPipe(createAccountBodySchema))
    async register(@Body() body: CreateAccountBodySchemaType) {
        const result = await this.authService.createAccount(body);

        if (result.isLeft()) {
            throw new BadRequestException(result.value.message);
        }

        return UserPresenter.toHTTP(result.value.user);
    }
}
```

### Presenter

```typescript
// src/http/auth/presenters/user.presenter.ts
import { User } from "@/domain/identity/enterprise/entities/user.entity";

export class UserPresenter {
    static toHTTP(user: User) {
        return {
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
        };
    }
}
```

## Either Pattern

Usar Either para tratamento de erros sem exceptions no dominio:

```typescript
// src/domain/@shared/either.ts
export type Either<L, R> = Left<L, R> | Right<L, R>;

export class Left<L, R> {
    readonly value: L;
    constructor(value: L) {
        this.value = value;
    }
    isLeft(): this is Left<L, R> {
        return true;
    }
    isRight(): this is Right<L, R> {
        return false;
    }
}

export class Right<L, R> {
    readonly value: R;
    constructor(value: R) {
        this.value = value;
    }
    isLeft(): this is Left<L, R> {
        return false;
    }
    isRight(): this is Right<L, R> {
        return true;
    }
}

export const left = <L, R>(value: L): Either<L, R> => new Left(value);
export const right = <L, R>(value: R): Either<L, R> => new Right(value);
```

## Injecao de Dependencia no NestJS

No module, registrar os use-cases e repositorios:

```typescript
// src/http/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { CreateAccountUseCase } from "@/domain/identity/application/use-cases/create-account.use-case";
import { UsersRepository } from "@/domain/identity/application/repositories/users.repository";
import { PrismaUsersRepository } from "@/infra/database/repositories/prisma-users.repository";
import { HashGenerator } from "@/domain/identity/application/cryptography/hash-generator";
import { BcryptHasher } from "@/infra/cryptography/bcrypt-hasher";

@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        CreateAccountUseCase,
        { provide: UsersRepository, useClass: PrismaUsersRepository },
        { provide: HashGenerator, useClass: BcryptHasher },
    ],
})
export class AuthModule {}
```
