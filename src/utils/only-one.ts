export function onlyOne<T>(generator: Generator<T>): T {
    let retval: T | undefined = undefined
    for (const item of generator) {
        if (retval === undefined)
            retval = item
        else throw new Error("more than one")
    }

    return retval!
}