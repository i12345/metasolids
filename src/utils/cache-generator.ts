export function cacheGenerator<T = unknown, TReturn = any, TNext = unknown>(generator: Generator<T, TReturn, TNext>) {
    const cache: ReturnType<typeof generator["next"]>["value"][] = []
    let currentGenerator: typeof generator | undefined = generator

    return function* () {
        for (let i = 0; i < cache.length; i++)
            yield cache[i]
        
        while (currentGenerator) {
            const { value, done } = generator.next()
            if (done) currentGenerator = undefined
            cache.push(value)
            yield value
        }
    }
}