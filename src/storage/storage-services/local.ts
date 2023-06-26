import { StorageService } from "../storage-service.js";

export class LocalStorageService<ID = string> implements StorageService<ID> {
    constructor(public readonly directory: FileSystemDirectoryHandle) {
    }

    private async open(id: ID, create: boolean = false) {
        const filename = String(id)
        const entry = await this.directory.getFileHandle(filename, { create })
        return entry
    }

    async load(id: ID): Promise<ArrayBuffer> {
        const entry = await this.open(id, false)
        const file = await entry.getFile()
        return await file.arrayBuffer()
    }

    async save(id: ID, value: ArrayBuffer): Promise<void> {
        const entry = await this.open(id, true)
        const writable = await entry.createWritable()
        await writable.write(value)
        await writable.close()
    }

    static async opfs(prefix?: string) {
        const root = await navigator.storage.getDirectory()
        const directory = prefix ?
            await root.getDirectoryHandle(prefix, { create: true }) :
            root
        
        return new LocalStorageService(directory)
    }
}