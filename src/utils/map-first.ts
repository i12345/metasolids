export function mapFirst<T, R>(items: Iterable<T>, map: (item: T) => R | undefined): [T, R] | undefined {
    let result: R | undefined
    for (const item of items)
        if ((result = map(item)) !== undefined)
            return [item, result]
    return undefined
}

export function mapFirstValue<T, R>(items: Iterable<T>, map: (item: T) => R | undefined): R | undefined {
    let result: R | undefined
    for (const item of items)
        if ((result = map(item)) !== undefined)
            return result
    return undefined
}