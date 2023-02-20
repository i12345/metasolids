import { Processor } from "./processor.js";

export class ProcessorGraph<Object, Context> implements Processor<Object, Context> {
    dependencies: Function[]

    constructor(public processors: Processor<Object, Context>[] = []) {
        this.order_processors()
    }

    private order_processors() {
        const processors_ordered: Processor<Object, Context>[] = []
        const processors_waiting = [...this.processors]
        const processors_applied: Processor<Object, Context>[] = []
        
        this.dependencies = []

        function processor_next() {
            for (let i = 0; i < processors_waiting.length; i++) {
                const processor = processors_waiting[i]
                if (processor.dependencies.every(dependency_prototype => processors_applied.some(processor_applied => processor_applied instanceof dependency_prototype))) {
                    processors_waiting.splice(i, 1)
                    return { processor }
                }
            }


            const processor = processors_waiting.splice(0, 1)[0]
            const dependencies = processor.dependencies.filter(dependency_prototype =>
                !processors_applied.some(processor_applied =>
                    processor_applied instanceof dependency_prototype))

            return { processor, dependencies }
        }

        while (processors_waiting.length > 0) {
            const { processor, dependencies } = processor_next()
            processors_ordered.push(processor)
            this.dependencies.push(...(dependencies ?? []))
        }

        this.processors.splice(0, this.processors.length, ...processors_ordered)
    }

    init(context: Context): void {
        this.order_processors()
        
        for (const processor of this.processors)
            processor.init(context)
    }

    process(object: Object, context: Context): void {
        for (const processor of this.processors)
            processor.process(object, context)
    }
}