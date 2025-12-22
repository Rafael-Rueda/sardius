import { CreateUserUseCase } from "@/domain/identity/application/use-cases/create-user.use-case";
import { DeleteUserUseCase } from "@/domain/identity/application/use-cases/delete-user.use-case";
import { GetAllUsersUseCase } from "@/domain/identity/application/use-cases/get-all-users.use-case";
import { GetUserByIdUseCase } from "@/domain/identity/application/use-cases/get-user-by-id.use-case";
import { UpdateUserUseCase } from "@/domain/identity/application/use-cases/update-user.use-case";
import { ROLES, Roles } from "@/domain/identity/enterprise/entities/user.entity";
import { UserPresenter } from "@/http/@shared/presenters/user.presenter";
import {
    CreateUserDTO,
    ListUsersQueryDTO,
    UpdateUserDTO,
} from "@/http/users/schemas/users.schema";
import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

@Injectable()
export class UsersService {
    constructor(
        @Inject("CreateUserUseCase")
        private createUserUseCase: CreateUserUseCase,
        @Inject("GetUserUseCase")
        private getUserByIdUseCase: GetUserByIdUseCase,
        @Inject("GetAllUsersUseCase")
        private getAllUsersUseCase: GetAllUsersUseCase,
        @Inject("UpdateUserUseCase")
        private updateUserUseCase: UpdateUserUseCase,
        @Inject("DeleteUserUseCase")
        private deleteUserUseCase: DeleteUserUseCase,
    ) {}

    async create(dto: CreateUserDTO) {
        const result = await this.createUserUseCase.execute({
            username: dto.username,
            email: dto.email,
            passwordHash: dto.password,
            roles: [ROLES.USER],
        });

        if (result.isLeft()) {
            const error = result.value;
            if (error.name === "UserAlreadyExistsError") {
                throw new ConflictException(error.message);
            }
            throw new BadRequestException(error.message);
        }

        return {
            user: UserPresenter.toHTTP(result.value.user),
        };
    }

    async findAll(query: ListUsersQueryDTO) {
        const result = await this.getAllUsersUseCase.execute({
            page: query.page,
            limit: query.limit,
        });

        const users = result.value.users;

        return {
            users: users.map(UserPresenter.toHTTP),
            page: query.page,
            limit: query.limit,
        };
    }

    async findOne(userId: string) {
        const result = await this.getUserByIdUseCase.execute({ userId });

        if (result.isLeft()) {
            const error = result.value;
            if (error.name === "UserNotFoundError") {
                throw new NotFoundException(error.message);
            }
            throw new BadRequestException(error.message);
        }

        return {
            user: UserPresenter.toHTTP(result.value.user),
        };
    }

    async update(userId: string, dto: UpdateUserDTO) {
        const result = await this.updateUserUseCase.execute({
            userId,
            username: dto.username,
            email: dto.email,
            password: dto.password,
            roles: dto.roles as Roles[] | undefined,
        });

        if (result.isLeft()) {
            const error = result.value;
            if (error.name === "UserNotFoundError") {
                throw new NotFoundException(error.message);
            }
            if (error.name === "UserAlreadyExistsError") {
                throw new ConflictException(error.message);
            }
            throw new BadRequestException(error.message);
        }

        return {
            user: UserPresenter.toHTTP(result.value.user),
        };
    }

    async remove(userId: string) {
        const result = await this.deleteUserUseCase.execute({ userId });

        if (result.isLeft()) {
            const error = result.value;
            if (error.name === "UserNotFoundError") {
                throw new NotFoundException(error.message);
            }
            throw new BadRequestException(error.message);
        }

        return {
            user: UserPresenter.toHTTP(result.value.user),
        };
    }
}
