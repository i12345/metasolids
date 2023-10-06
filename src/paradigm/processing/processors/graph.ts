import { pathExists, pathSubsumes } from "../../trees/index.js";
import { Processor, ProcessorConnections, ProcessorInitialization } from "../processor.js";

interface GraphProcessorDetails {
    processors_connections: Map<Processor, ProcessorConnections>
}

export const ExtraProcessorsKey = Symbol("extra-processors")
export type GraphProcessorContext<
        Object = any,
        Context = any,
        ProcessorInitializationT extends ProcessorInitialization = ProcessorInitialization,
        ProcessorT extends
            Processor<Object, Context, ProcessorInitializationT> =
            Processor<Object, Context, ProcessorInitializationT>
    > = {
    [ExtraProcessorsKey]: ProcessorT[]
}

//TODO: use single [private] context section
const GraphProcessorContextKey = Symbol("processor:graph")
type GraphProcessorContextPrivate<
        Object = any,
        Context = any,
        ProcessorInitializationT extends ProcessorInitialization = ProcessorInitialization,
        ProcessorT extends
            Processor<Object, Context, ProcessorInitializationT> =
            Processor<Object, Context, ProcessorInitializationT>
    > =
    GraphProcessorContext<
        Object,
        Context,
        ProcessorInitializationT,
        ProcessorT
    > & {
    [GraphProcessorContextKey]?: Map<
        GraphProcessor<Object, Context, ProcessorInitializationT, ProcessorT>,
        GraphProcessorDetails
    >
}

export interface GraphProcessorInitialization<
        Object = any,
        Context = any,
        ProcessorInitializationT extends ProcessorInitialization = ProcessorInitialization,
        ProcessorT extends
            Processor<Object, Context, ProcessorInitializationT> =
            Processor<Object, Context, ProcessorInitializationT>
    > extends ProcessorInitialization {
    processors_initializations: [ProcessorT, ProcessorInitializationT][]
}

export class GraphProcessor<
        Object = any,
        Context = any,
        // Context extends any | Partial<GraphProcessorContext> = Partial<GraphProcessorContext>,
        ProcessorInitializationT extends ProcessorInitialization = ProcessorInitialization,
        ProcessorT extends
            Processor<Object, Context, ProcessorInitializationT> =
            Processor<Object, Context, ProcessorInitializationT>
    >
    implements
    Processor<
        Object,
        Context,
        GraphProcessorInitialization<
                Object,
                Context,
                ProcessorInitializationT,
                ProcessorT
            >
    > {
    constructor(public processors: ProcessorT[] = []) { }

    init(context: Context) {
        const context_private = context as GraphProcessorContextPrivate

        const processors = [...this.processors, ...((<Partial<GraphProcessorContext>>context)[ExtraProcessorsKey] ?? [])]
        const processors_initializations = processors.map(processor => [processor, processor.init(context)] as [ProcessorT, ProcessorInitializationT])
        const processors_connections = new Map(processors_initializations.map(([processor, { connections }]) => [processor, connections] as [ProcessorT, ProcessorConnections]))

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

        return {
            connections,
            processors_initializations
        }
    }

    process(object: Object, context: Context): void {
        const context_private = context as GraphProcessorContextPrivate<Object, Context, ProcessorInitializationT, ProcessorT>

        const processors = [...this.processors, ...((<Partial<GraphProcessorContext>>context)[ExtraProcessorsKey] ?? [])]
        const toProcess = processors
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