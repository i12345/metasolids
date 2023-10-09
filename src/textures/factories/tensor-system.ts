import { VectorSamplingContext } from "../../fields/domains/vector.js";
import { FieldPoint } from "../../fields/point.js";
import { FieldPointTensorFactory } from "../../fields/tensor/factory.js";
import { FieldPointTensorSystem, FieldPointTensorSystemParameters } from "../../fields/tensor/system.js";
import { FieldPointTensorVariable } from "../../fields/tensor/variable.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../../fields/vectorized/point.js";
import { FactoryMappings, FactoryProcessor } from "../../paradigm/processing/processors/factory.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplate_Leaf, MultiObjectsTemplate, mapGroups } from "../../paradigm/trees/index.js";
import { Reflect_fromEntries } from "../../utils/reflect-entries.js";
import { TensorTexture } from "../index.js";
import { TextureTensorFactory } from "../tensor-factory.js";
import { Texture, TextureLocation, TextureSamplingContext } from "../texture.js";
import * as tf from "@tensorflow/tfjs"

function variablesTemplate(system: FieldPointTensorSystem): MultiObjectsGroupsTemplate {
    return Reflect_fromEntries<MultiObjectsGroupsTemplate>(system.variables.filter(variable => variable.name).map(variable => [variable.name!, MultiObjectsGroupsTemplate_Leaf]))
}

export class TensorSystemTextureFactory<Item = any, Context = any>
    extends FactoryProcessor<
        MultiObjectsGroupsTemplate,
        MultiObjectsGroupsTemplate,
        MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, Texture>,
        MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, Texture>,
        Item,
        Context
    > {
    constructor(
            public system: FieldPointTensorSystem,
            public parameters: FieldPointTensorSystemParameters,
            mappings: FactoryMappings
        ) {
        super(
            {
                inputs: variablesTemplate(system),
                outputs: variablesTemplate(system)
            },
            mappings
        )
    }

    init() {
        const variables = variablesTemplate(this.system)
        
        this.template = {
            inputs: variables,
            outputs: variables,
        }

        return super.init()
    }

    protected factory(inputs: MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, Texture<TextureLocation, TextureLocation, TextureLocation, Float64Array, FieldPoint, FieldPoint, FieldPoint, Float64Array, TextureSamplingContext<TextureLocation, TextureLocation, TextureLocation>, MultiObjectsTemplate, Uint32Array, Uint32Array, FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>, FieldPointVector<FieldPoint, FieldPointVectorContainerStatic>, VectorSamplingContext<TextureLocation, TextureLocation, TextureLocation, FieldPointVectorContainerStatic, FieldPoint, FieldPoint, FieldPoint, Float64Array, MultiObjectsTemplate, Uint32Array, Uint32Array, TextureSamplingContext<TextureLocation, TextureLocation, TextureLocation>, FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>, FieldPointVector<FieldPoint, FieldPointVectorContainerStatic>>>>, item: Item, context: Context): MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, Texture<TextureLocation, TextureLocation, TextureLocation, FieldPointVectorContainerStatic, FieldPoint, FieldPoint, FieldPoint, FieldPointVectorContainerStatic, TextureSamplingContext<TextureLocation, TextureLocation, TextureLocation>, MultiObjectsTemplate, Uint32Array, Uint32Array, FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>, FieldPointVector<FieldPoint, FieldPointVectorContainerStatic>, VectorSamplingContext<TextureLocation, TextureLocation, TextureLocation, FieldPointVectorContainerStatic, FieldPoint, FieldPoint, FieldPoint, FieldPointVectorContainerStatic, MultiObjectsTemplate, Uint32Array, Uint32Array, TextureSamplingContext<TextureLocation, TextureLocation, TextureLocation>, FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>, FieldPointVector<FieldPoint, FieldPointVectorContainerStatic>>>> {
        const inputs_mapped = new Map<FieldPointTensorVariable, FieldPointTensorFactory>()
        for (const key of Reflect.ownKeys(inputs))
            inputs_mapped.set(this.system.variables.find(variable => variable.name === key)!, new TextureTensorFactory(<Texture>inputs[key]))

        const instance = this.system.instance(this.parameters, inputs_mapped)

        return mapGroups(
            this.template.outputs,
            ([name]) => new TensorTexture(instance, <FieldPointTensorVariable<FieldPoint, tf.Rank.R0 | tf.Rank.R2>>this.system.variables.find(variable => variable.name === name)!)
        )
    }
}