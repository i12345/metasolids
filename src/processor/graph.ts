import { PropertyPath, pathExists, pathSubsumes } from "../utils/property-path.js";
import { Processor } from "./processor.js";

export class ProcessorGraph<Object, Context> implements Processor<Object, Context> {
    readonly connections: Processor<Object, Context>["connections"] = {
        inputs: [],
        outputs: []
    }

    constructor(
        public processors: Processor<Object, Context>[] = [],
        public readonly dependencies: PropertyPath[] = []
    ) { }

    init(context: Context): void {
        for (const processor of this.processors)
            processor.init(context)
        
        this.connections.inputs.splice(0, this.connections.inputs.length)
        this.connections.outputs.splice(0, this.connections.outputs.length)

        //TODO: this algorithm doesn't detect cyclic dependencies

        for (const processor of this.processors) {
            for (const input_new of processor.connections.inputs) {
                let input_new_already_handled = false

                for (let i = 0; i < this.connections.inputs.length; i++) {
                    const input_existing = this.connections.inputs[i]
                    
                    if (pathSubsumes(input_existing, input_new)) {
                        input_new_already_handled = true
                        break
                    }

                    else if (pathSubsumes(input_new, input_existing)) {
                        this.connections.inputs.splice(i, 1)
                        i--
                        continue
                    }
                }

                for (let i = 0; i < this.connections.outputs.length; i++) {
                    const output_existing = this.connections.outputs[i]

                    if (pathSubsumes(output_existing, input_new)) {
                        input_new_already_handled = true
                        break
                    }
                }

                if (!input_new_already_handled)
                    this.connections.inputs.push(input_new)
            }
            
            for (const output_new of processor.connections.outputs) {
                let output_new_already_handled = false

                for (let i = 0; i < this.connections.outputs.length; i++) {
                    const output_existing = this.connections.outputs[i]

                    if (pathSubsumes(output_existing, output_new)) {
                        output_new_already_handled = true
                        break
                    }

                    else if (pathSubsumes(output_new, output_existing)) {
                        this.connections.outputs.splice(i, 1)
                        i--
                        continue
                    }
                }

                for (let i = 0; i < this.connections.inputs.length; i++) {
                    const input_existing = this.connections.inputs[i]

                    if (pathSubsumes(output_new, input_existing)) {
                        this.connections.inputs.splice(i, 1)
                        i--
                        continue
                    }
                }

                if (!output_new_already_handled)
                    this.connections.outputs.push(output_new)
            }
        }
    }

    process(object: Object, context: Context): void {
        const toProcess = [...this.processors]
        for (let lastLength = 0;
            toProcess.length > 0 &&
            toProcess.length !== lastLength;
            lastLength = toProcess.length) {
            for (let i = 0; i < toProcess.length; i++) {
                const processor = toProcess[i]

                if (processor.connections.inputs.every(input => pathExists(object, input))) {
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