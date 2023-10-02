import { Generator, GeneratorContext, GeneratorResult } from "../generator.js";

export class ParallelGenerator implements Generator {
    constructor(public readonly children: Generator[]) { }
    
    init(context: GeneratorContext): void {
        for (const child of this.children)
            child.init(context)
    }
    
    update(context: GeneratorContext): GeneratorResult {
        const childResults = this.children.map(child => child.update(context))

        const result: GeneratorResult = {
            differentials: new Map(),
            values: new Map()
        }

        for (const { differentials, values } of childResults) {
            if (differentials) {
                for (const [key, values] of differentials.entries()) {
                    if (result.differentials!.has(key))
                        result.differentials!.set(key, values)
                    else result.differentials!.get(key)!.push(...values)
                }
            }

            if (values) {
                for (const [key, value] of values) {
                    if (result.values!.has(key))
                        throw new Error()

                    result.values!.set(key, value)
                }
            }
        }

        return result
    }
}