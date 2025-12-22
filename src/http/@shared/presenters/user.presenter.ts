import { User } from "@/domain/identity/enterprise/entities/user.entity";

export class UserPresenter {
    static toHTTP(user: User) {
        return {
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            roles: user.roles,
        };
    }
}
