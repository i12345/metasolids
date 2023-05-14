export function Reflect_entries<T = any>(o: T) {
    const result: [key: keyof T, value: T[keyof T]][] = []
    for (const key of Reflect.ownKeys(o as object))
        result.push([key as keyof T, o[key as keyof T]])
    
    return result
}

export function Reflect_fromEntries<T = any>(entries: [keyof T, T[keyof T]][]) {
    const result = {} as T
    for (const [key, value] of entries)
        result[key] = value
    return result
}