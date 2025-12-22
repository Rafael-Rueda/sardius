import { Either, Right } from "@/domain/@shared/either";
import { User } from "../../enterprise/entities/user.entity";
import { UsersRepository } from "../repositories/users.repository";

interface GetAllUsersRequest {
    page: number;
    limit: number;
}

type GetAllUsersResponse = Either<never, { users: User[] }>;

export class GetAllUsersUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute(request: GetAllUsersRequest): Promise<GetAllUsersResponse> {
        const { page, limit } = request;

        const users = await this.usersRepository.list(page, limit);

        return Right.call({ users });
    }
}
