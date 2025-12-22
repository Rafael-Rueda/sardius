import { ROLES, User } from "../../../enterprise/entities/user.entity";
import { Username } from "../../../enterprise/value-objects/username.vo";
import { UserNotFoundError } from "../../../errors/user-not-found.error";
import { UsersRepository } from "../../repositories/users.repository";
import { DeleteUserUseCase } from "../../use-cases/delete-user.use-case";

const makeUser = (overrides: Partial<{ username: string; email: string; id: string }> = {}): User => {
    return User.create(
        {
            username: Username.create(overrides.username ?? "testuser"),
            email: overrides.email ?? "test@example.com",
            passwordHash: "hashed_password",
            roles: [ROLES.USER],
        },
        overrides.id ?? "user-123",
    );
};

const makeUsersRepository = (): jest.Mocked<UsersRepository> => ({
    list: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
});

describe("DeleteUserUseCase", () => {
    let sut: DeleteUserUseCase;
    let usersRepository: jest.Mocked<UsersRepository>;

    beforeEach(() => {
        usersRepository = makeUsersRepository();
        sut = new DeleteUserUseCase(usersRepository);
    });

    it("should delete a user successfully", async () => {
        const user = makeUser({ id: "user-to-delete" });
        usersRepository.delete.mockResolvedValue(user);

        const result = await sut.execute({ userId: "user-to-delete" });

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value.user.id.toString()).toBe(user.id.toString());
        }
        expect(usersRepository.delete).toHaveBeenCalledWith("user-to-delete");
    });

    it("should return UserNotFoundError when user does not exist", async () => {
        usersRepository.delete.mockResolvedValue(null);

        const result = await sut.execute({ userId: "non-existent-id" });

        expect(result.isLeft()).toBe(true);
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(UserNotFoundError);
        }
    });

    it("should call repository delete with correct userId", async () => {
        usersRepository.delete.mockResolvedValue(null);

        await sut.execute({ userId: "specific-user-id" });

        expect(usersRepository.delete).toHaveBeenCalledWith("specific-user-id");
        expect(usersRepository.delete).toHaveBeenCalledTimes(1);
    });

    it("should return the deleted user data", async () => {
        const user = makeUser({
            username: "deleteduser",
            email: "deleted@example.com",
            id: "deleted-123",
        });
        usersRepository.delete.mockResolvedValue(user);

        const result = await sut.execute({ userId: "deleted-123" });

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value.user.username).toBe("deleteduser");
            expect(result.value.user.email).toBe("deleted@example.com");
        }
    });
});
