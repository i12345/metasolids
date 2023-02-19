export function onlyOne<T>(generator: Generator<T>): T {
    let retval: T
    for (const item of generator) {
        if (!retval)
            retval = item
        else return undefined
    }

    return retval
}