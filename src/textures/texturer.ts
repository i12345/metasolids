import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, groupPaths, groups, mapGroups } from "../fields/multi-objects-fields-point.js";
import { ProcessorGraph } from "../processor/graph.js";
import { Processor } from "../processor/processor.js";
import { PropertyPath } from "../utils/property-path.js";
import { extract, intract } from "../utils/tree.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "./texture.js";

export const TexturersKey = Symbol('texturers')
export interface TextureableProcessingContext<
        Textureable = any,
        Location extends TextureLocation = TextureLocation,
        Sample extends TextureSample = TextureSample,
        Context extends TextureSamplingContext<Location> = TextureSamplingContext<Location>
    > {
    [TexturersKey]: Texturer<Textureable, Location, Sample, Context>[]
}

export class TextureableProcessor<
        TextureableT = any,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureContextT extends
            TextureSamplingContext<TextureLocationT> =
            TextureSamplingContext<TextureLocationT>
    > implements
    Processor<
        TextureableT,
        TextureableProcessingContext<
            TextureableT,
            TextureLocationT,
            TextureSampleT,
            TextureContextT
        >
    > {
    get connections() {
        return this.graph.connections
    }
    
    private graph!: ProcessorGraph<
        TextureableT,
        TextureableProcessingContext<
            TextureableT,
            TextureLocationT,
            TextureSampleT,
            TextureContextT
        >
    >
    
    process(
            textureable: TextureableT,
            context: TextureableProcessingContext<
                TextureableT,
                TextureLocationT,
                TextureSampleT,
                TextureContextT
                >
        ): void {
        this.graph.process(textureable, context)
    }

    init(
            context: TextureableProcessingContext<
                    TextureableT,
                    TextureLocationT,
                    TextureSampleT,
                    TextureContextT
                >
        ): void {
        this.graph = new ProcessorGraph(context[TexturersKey])
        this.graph.init(context)
    }
}

export abstract class Texturer<
        TextureableT = any,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureContextT extends
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
                    TextureContextT
                > =
            TexturesTemplated<
                    Inputs,
                    InputsTexelTypeT,
                    InputsTexelTypesGrouped,
                    TextureLocationT,
                    TextureContextT
                >
    >
    implements
    Processor<
        TextureableT,
        TextureableProcessingContext<
                TextureableT,
                TextureLocationT,
                TextureSampleT,
                TextureContextT
            >
    > {
    connections!: {
        readonly inputs: PropertyPath[]
        readonly outputs: PropertyPath[]
    }

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

    protected abstract factory(inputs: InputsTextures): MultiObjectsGroupsMapped<Outputs, Texture<TextureLocationT, TextureSampleT, TextureContextT>>

    process(textureable: TextureableT): void {
        const inputs = {} as InputsTextures
        for (const input of groups(this.templates.inputs))
            input.set(inputs, extract(textureable, input.get<PropertyPath>(this.mappings.inputs)))
        
        const outputs = this.factory(inputs)
        for (const output of groups(this.templates.outputs))
            intract(textureable, output.get<PropertyPath>(this.mappings.outputs), output.get(outputs))
    }

    init(): void {
        this.connections = {
            inputs: [...groups(this.templates.inputs)].map(input => input.get<PropertyPath>(this.mappings.inputs)),
            outputs: [...groups(this.templates.outputs)].map(output => output.get<PropertyPath>(this.mappings.outputs)),
        }
    }
}