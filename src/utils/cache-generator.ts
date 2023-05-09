export function cacheGenerator<T = unknown, TReturn = any, TNext = unknown>(generator: Generator<T, TReturn, TNext>) {
    const cache = []

    return function* () {
        for (let i = 0; i < cache.length; i++)
            yield cache[i]
        
        while (generator) {
            const { value, done } = generator.next()
            if (done) generator = undefined
            cache.push(value)
            yield value
        }
    }
}