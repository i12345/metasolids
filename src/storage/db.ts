export interface DB<T, ID = string> {
    load(id: ID): Promise<T>
    save(id: ID, value: T): Promise<void>
}