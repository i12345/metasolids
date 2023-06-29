import { PropertyPath, pathExists, pathSubsumes } from "../../paradigm/property-path.js";
import { Processor, ProcessorConnections, ProcessorInitialization } from "../processor.js";

interface GraphProcessorDetails {
    processors_connections: Map<Processor, ProcessorConnections>
}

export const GraphProcessorContextKey = Symbol("processor:graph")
interface GraphProcessorContextPrivate {
    [GraphProcessorContextKey]?: Map<GraphProcessor, GraphProcessorDetails>
}

export class GraphProcessor<
        Object = any,
        Context = any
    >
    implements
    Processor<Object, Context> {
    constructor(
        public processors: Processor<Object, Context>[] = [],
        public readonly dependencies: PropertyPath[] = []
    ) { }

    init(context: Context): ProcessorInitialization {
        const context_private = context as GraphProcessorContextPrivate

        const processors_initializations = this.processors.map(processor => [processor, processor.init(context)] as [Processor, ProcessorInitialization])
        const processors_connections = new Map(processors_initializations.map(([processor, { connections }]) => [processor, connections] as [Processor, ProcessorConnections]))
        
        const connections: ProcessorConnections = {
            inputs: [],
            outputs: []
        }

        const map = context_private[GraphProcessorContextKey] ??= new Map()
        console.assert(!map.has(this))
        map.set(this, { processors_connections })
        
        //TODO: this algorithm doesn't detect cyclic dependencies

        for (const processor_connections of processors_connections.values()) {
            for (const input_new of processor_connections.inputs) {
                let input_new_already_handled = false

                for (let i = 0; i < connections.inputs.length; i++) {
                    const input_existing = connections.inputs[i]
                    
                    if (pathSubsumes(input_existing, input_new)) {
                        input_new_already_handled = true
                        break
                    }

                    else if (pathSubsumes(input_new, input_existing)) {
                        connections.inputs.splice(i, 1)
                        i--
                        continue
                    }
                }

                for (let i = 0; i < connections.outputs.length; i++) {
                    const output_existing = connections.outputs[i]

                    if (pathSubsumes(output_existing, input_new)) {
                        input_new_already_handled = true
                        break
                    }
                }

                if (!input_new_already_handled)
                    connections.inputs.push(input_new)
            }
            
            for (const output_new of processor_connections.outputs) {
                let output_new_already_handled = false

                for (let i = 0; i < connections.outputs.length; i++) {
                    const output_existing = connections.outputs[i]

                    if (pathSubsumes(output_existing, output_new)) {
                        output_new_already_handled = true
                        break
                    }

                    else if (pathSubsumes(output_new, output_existing)) {
                        connections.outputs.splice(i, 1)
                        i--
                        continue
                    }
                }

                for (let i = 0; i < connections.inputs.length; i++) {
                    const input_existing = connections.inputs[i]

                    if (pathSubsumes(output_new, input_existing)) {
                        connections.inputs.splice(i, 1)
                        i--
                        continue
                    }
                }

                if (!output_new_already_handled)
                    connections.outputs.push(output_new)
            }
        }

        return { connections }
    }

    process(object: Object, context: Context): void {
        const context_private = context as GraphProcessorContextPrivate

        const toProcess = [...this.processors]
        let lastLength = 0
        
        const { processors_connections } = context_private[GraphProcessorContextKey]!.get(this)!

        do {
            lastLength = toProcess.length
            for (let i = 0; i < toProcess.length; i++) {
                const processor = toProcess[i]
                const processor_connections = processors_connections.get(processor)!

                if (processor_connections.inputs.every(input => pathExists(object, input))) {
                    processor.process(object, context)
                    toProcess.splice(i, 1)
                    i--
                }
            }
        } while (toProcess.length !== lastLength)

        if (toProcess.length > 0) {
            console.warn(`Some processors never had dependencies met:`)
            console.warn(toProcess)
        }
    }
}