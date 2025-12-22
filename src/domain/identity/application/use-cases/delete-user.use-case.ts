import { Either, Left, Right } from "@/domain/@shared/either";
import { User } from "../../enterprise/entities/user.entity";
import { UserNotFoundError } from "../../errors/user-not-found.error";
import { UsersRepository } from "../repositories/users.repository";

interface DeleteUserRequest {
    userId: string;
}

type DeleteUserError = UserNotFoundError;

type DeleteUserResponse = Either<DeleteUserError, { user: User }>;

export class DeleteUserUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute(request: DeleteUserRequest): Promise<DeleteUserResponse> {
        const { userId } = request;

        const user = await this.usersRepository.delete(userId);

        if (!user) {
            return Left.call(new UserNotFoundError());
        }

        return Right.call({ user });
    }
}
