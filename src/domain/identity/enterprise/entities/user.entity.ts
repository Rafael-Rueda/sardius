import { Entity } from "@/domain/@shared/entities/entity.entity";
import { Username } from "../value-objects/username.vo";

export const ROLES = {
    USER: "USER",
    ADMIN: "ADMIN",
} as const;

export type Roles = (typeof ROLES)[keyof typeof ROLES];

export interface UserProps {
    username: Username;
    email: string;
    passwordHash?: string;
    roles: Roles[];
}

export class User extends Entity<UserProps> {
    private constructor(props: UserProps, id?: string) {
        super(props, id);
    }

    static create(props: UserProps, id?: string) {
        const user = new User(props, id);
        return user;
    }

    get username() {
        return this.props.username.value;
    }

    get email() {
        return this.props.email;
    }

    get passwordHash() {
        return this.props.passwordHash ?? undefined;
    }

    get roles() {
        return this.props.roles;
    }

    set username(username: string) {
        this.props.username = Username.create(username);
        this.touch();
    }

    set email(email: string) {
        this.props.email = email;
        this.touch();
    }

    set passwordHash(passwordHash: string | undefined) {
        this.props.passwordHash = passwordHash;
        this.touch();
    }

    set roles(roles: Roles[]) {
        this.props.roles = roles;
        this.touch();
    }

    private touch() {
        this.updatedAt = new Date();
    }
}
