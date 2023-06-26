import { DB } from "./db.js";

export interface StorageService<ID = string> extends DB<ArrayBuffer, ID> { }