import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, groups, mapGroups } from "../paradigm/index.js";
import { Processor, ProcessorInitialization } from "../processing/index.js";
import { GraphProcessor, GraphProcessorContext } from "../processing/processors/graph.js";
import { PropertyPath } from "../paradigm/property-path.js";
import { extract, intract } from "../paradigm/tree.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "./texture.js";

export const TexturersKey = Symbol('texturers')
export interface TextureableProcessingContext<
        TextureableT = any,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT> =
            TextureSamplingContext<TextureLocationT>
    > extends GraphProcessorContext {
    [TexturersKey]: {
        texturers: Texturer<
            TextureableT,
            TextureLocationT,
            TextureSampleT,
            TextureSamplingContextT
        >[]

        outputs?: PropertyPath[]

        graph?: GraphProcessor<
            TextureableT,
            TextureableProcessingContext<
                TextureableT,
                TextureLocationT,
                TextureSampleT,
                TextureSamplingContextT
            >
        >
    }
}

export class TextureableProcessor<
        TextureableT = any,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT> =
            TextureSamplingContext<TextureLocationT>
    > implements
    Processor<
        TextureableT,
        TextureableProcessingContext<
            TextureableT,
            TextureLocationT,
            TextureSampleT,
            TextureSamplingContextT
        >
    > {
    process(
            textureable: TextureableT,
            context: TextureableProcessingContext<
                TextureableT,
                TextureLocationT,
                TextureSampleT,
                TextureSamplingContextT
                >
        ): void {
        context[TexturersKey].graph!.process(textureable, context)
    }

    init(
            context: TextureableProcessingContext<
                    TextureableT,
                    TextureLocationT,
                    TextureSampleT,
                    TextureSamplingContextT
                >
        ): ProcessorInitialization {
        context[TexturersKey].graph = new GraphProcessor(context[TexturersKey].texturers)
        const initialization = context[TexturersKey].graph.init(context)

        return {
            ...initialization,
            connections: {
                inputs: initialization.connections.inputs,
                outputs: [
                    ...initialization.connections.outputs,
                    ...(context[TexturersKey].outputs ?? [])
                ]
            }
        }
    }

    private constructor() { }

    static readonly instance = new this()
}

export abstract class Texturer<
        TextureableT = any,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT> =
            TextureSamplingContext<TextureLocationT>,
        Outputs extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Inputs extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InputsTexelTypeT extends TextureSampleT = TextureSampleT,
        InputsTexelTypesGrouped extends
            MultiObjectsGroupsMapped<Inputs, InputsTexelTypeT> =
            MultiObjectsGroupsMapped<Inputs, InputsTexelTypeT>,
        InputsTextures extends
            TexturesTemplated<
                    Inputs,
                    InputsTexelTypeT,
                    InputsTexelTypesGrouped,
                    TextureLocationT,
                    TextureSamplingContextT
                > =
            TexturesTemplated<
                    Inputs,
                    InputsTexelTypeT,
                    InputsTexelTypesGrouped,
                    TextureLocationT,
                    TextureSamplingContextT
                >
    >
    implements
    Processor<
        TextureableT,
        TextureableProcessingContext<
                TextureableT,
                TextureLocationT,
                TextureSampleT,
                TextureSamplingContextT
            >
    > {
    readonly mappings: {
        inputs: MultiObjectsGroupsMapped<Inputs, PropertyPath>,
        outputs: MultiObjectsGroupsMapped<Outputs, PropertyPath>,
    }

    constructor(
        public readonly templates: {
            inputs: Inputs,
            outputs: Outputs,
        }
    ) {
        this.mappings = {
            inputs: mapGroups(templates.inputs, () => undefined!),
            outputs: mapGroups(templates.outputs, () => undefined!),
        }
    }

    protected abstract factory(inputs: InputsTextures): MultiObjectsGroupsMapped<Outputs, Texture<TextureLocationT, TextureSampleT, TextureSamplingContextT>>

    process(textureable: TextureableT): void {
        const inputs = {} as InputsTextures
        for (const input of groups(this.templates.inputs))
            input.set(inputs, extract(textureable, input.get<PropertyPath>(this.mappings.inputs)))
        
        const outputs = this.factory(inputs)
        for (const output of groups(this.templates.outputs))
            intract(textureable, output.get<PropertyPath>(this.mappings.outputs), output.get(outputs))
    }

    init() {
        const connections = {
            inputs: [...groups(this.templates.inputs)].map(input => input.get<PropertyPath>(this.mappings.inputs)),
            outputs: [...groups(this.templates.outputs)].map(output => output.get<PropertyPath>(this.mappings.outputs)),
        }

        return { connections }
    }
}