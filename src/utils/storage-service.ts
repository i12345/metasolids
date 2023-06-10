export interface StorageService<ID = string> {
    read(id: ID): Buffer
    write(id: ID, value: Buffer): void
}