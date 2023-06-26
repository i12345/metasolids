import { DataViewByteReader, DataViewByteWriterChunkedDynamic } from "byte-rw"
import { defaultDeserializationContext, defaultSerializationContext } from "simple-typed-serialization"
import { DB } from "./db.js"
import { StorageService } from "./storage-service.js"

export class StoredDB<
        T = any,
        ID = String
    > implements DB<T, ID> {
    readonly cache = new Map<ID, T>()
    
    constructor(
        public readonly storage: StorageService<ID>
    ) { }

    async load(id: ID): Promise<T> {
        const cached = this.cache.get(id)
        if (cached !== undefined)
            return cached

        const buffer = await this.storage.load(id)
        const reader = new DataViewByteReader(new DataView(buffer))
        const context = defaultDeserializationContext(reader)
        const deserialized = context.deserialize() as T
        this.cache.set(id, deserialized)
        return deserialized
    }

    async save(id: ID, shared: T): Promise<void> {
        const writer = new DataViewByteWriterChunkedDynamic()
        const context = defaultSerializationContext(writer)
        context.serialize(shared)
        const buffer = writer.combineChunks()
        this.cache.set(id, shared)
        await this.storage.save(id, buffer)
    }
}