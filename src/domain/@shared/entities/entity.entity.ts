import { UniqueEntityId } from "./unique-entity-id.entity";

export abstract class Entity<T> {
    private _id: UniqueEntityId;
    public createdAt: Date;
    public updatedAt: Date;
    protected props: T;

    get id() {
        return this._id;
    }

    protected constructor(props: T, id?: string) {
        this._id = UniqueEntityId.create(id);
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.props = props;
    }
}
