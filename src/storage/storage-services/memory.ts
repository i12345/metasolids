import { StorageService } from "../storage-service.js";

export class MemoryStorageService<ID = string> implements StorageService<ID> {
    private values = new Map<ID, ArrayBuffer>()
    
    async load(id: ID): Promise<ArrayBuffer> {
        return this.values.get(id)!
    }

    async save(id: ID, value: ArrayBuffer): Promise<void> {
        this.values.set(id, value)
    }
}