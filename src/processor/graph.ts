import { PropertyPath, pathExists } from "../utils/property-path.js";
import { Processor } from "./processor.js";

export class ProcessorGraph<Object, Context> implements Processor<Object, Context> {
    constructor(
        public processors: Processor<Object, Context>[] = [],
        public readonly dependencies: PropertyPath[] = []
    ) { }

    init(context: Context): void {
        for (const processor of this.processors)
            processor.init(context)
    }

    process(object: Object, context: Context): void {
        const toProcess = [...this.processors]
        for (let lastLength = 0;
            toProcess.length > 0 &&
            toProcess.length !== lastLength;
            lastLength = toProcess.length) {
            for (let i = 0; i < toProcess.length; i++) {
                const processor = toProcess[i]

                if (processor.dependencies.every(dependency => pathExists(object, dependency))) {
                    processor.process(object, context)
                    toProcess.splice(i, 1)
                    i--
                }
            }
        }

        if (toProcess.length > 0) {
            console.warn(`Some processors never had dependencies met:`)
            console.warn(toProcess)
        }
    }
}