import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, groups, mapGroups } from "../paradigm/trees/index.js";
import { Processor, ProcessorInitialization } from "../paradigm/processing/index.js";
import { GraphProcessor } from "../paradigm/processing/processors/graph.js";
import { PropertyPath, extract, intract } from "../paradigm/trees/index.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "./texture.js";

export const TexturersKey = Symbol('texturers')
export interface TextureableProcessingContext<
        TextureableT = any,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
    > {
    [TexturersKey]: {
        texturers: Texturer<
            TextureableT,
            TextureLocationT,
            TextureSampleT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSamplingContextT
        >[]

        outputs?: PropertyPath[]

        graph?: GraphProcessor<
            TextureableT,
            TextureableProcessingContext<
                TextureableT,
                TextureLocationT,
                TextureSampleT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSamplingContextT
            >
        >
    }
}

export class TextureableProcessor<
        TextureableT = any,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
    > implements
    Processor<
        TextureableT,
        TextureableProcessingContext<
            TextureableT,
            TextureLocationT,
            TextureSampleT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSamplingContextT
        >
    > {
    process(
            textureable: TextureableT,
            context: TextureableProcessingContext<
                    TextureableT,
                    TextureLocationT,
                    TextureSampleT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
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
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
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
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        Outputs extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Inputs extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InputTexelT extends TextureSample = TextureSample,
        InputTexelElementType extends TextureSample = InputTexelT,
        InputTexelFuseMode extends TextureSample = InputTexelT,
        InputTexelTGrouped extends
            MultiObjectsGroupsMapped<Inputs, InputTexelT> =
            MultiObjectsGroupsMapped<Inputs, InputTexelT>,
        InputTexelElementTypeGrouped extends
            MultiObjectsGroupsMapped<Inputs, InputTexelElementType> =
            MultiObjectsGroupsMapped<Inputs, InputTexelElementType>,
        InputTexelFuseModeGrouped extends
            MultiObjectsGroupsMapped<Inputs, InputTexelFuseMode> =
            MultiObjectsGroupsMapped<Inputs, InputTexelFuseMode>,
        InputsTextures extends
            TexturesTemplated<
                    Inputs,
                    InputTexelT,
                    InputTexelElementType,
                    InputTexelFuseMode,
                    InputTexelTGrouped,
                    InputTexelElementTypeGrouped,
                    InputTexelFuseModeGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSamplingContextT
                > =
            TexturesTemplated<
                    Inputs,
                    InputTexelT,
                    InputTexelElementType,
                    InputTexelFuseMode,
                    InputTexelTGrouped,
                    InputTexelElementTypeGrouped,
                    InputTexelFuseModeGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
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
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSamplingContextT
            >
    > {
    constructor(
        public readonly templates: {
            inputs: Inputs,
            outputs: Outputs,
        },
        public readonly mappings: {
            inputs: MultiObjectsGroupsMapped<Inputs, PropertyPath>,
            outputs: MultiObjectsGroupsMapped<Outputs, PropertyPath>,
        } = {
            inputs: mapGroups(templates.inputs, () => undefined!),
            outputs: mapGroups(templates.outputs, () => undefined!),
        }
    ) {
    }

    //TODO: replace with texturetemplated<> it will be major refactoring
    protected abstract factory(inputs: InputsTextures):
        MultiObjectsGroupsMapped<
            Outputs,
            Texture<
                TextureLocationT, TextureSampleT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSamplingContextT
            >
        >

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