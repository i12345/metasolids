import { FieldPoint, FieldsPoint, field_point_divide, fields_point_add_inplace_weighted, field_point_map, FieldPointPrimitive } from "../../fields/point.js"
import { Surface, SurfaceProcessingContext } from "../../surfaces/index.js"
import { iterTreeByLeavesValues, TreeByValue, TreeByValueMapped, leavesByValues, EncapsulatingKey, extract, MultiObjectsGroupedObjectsKey, intract, WithEncapsulating, WithMultiObjectsIDs, MultiObjectsIDsKey } from "../../paradigm/trees/index.js"
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/index.js"
import { SolidProcessingContext } from "../processor.js"
import { SolidWithEnclosingVolume, TotalVolumeKey, VolumeVoxelsKey } from "./enclosing-volume.js"
import { IndicesTypedArray } from "../../paradigm/arrays/indices-array.js"
import { VolumeProcessingWithSolids, VolumeProcessingWithSolidsContext, VolumeSolidProcessing, VolumeSolidProcessingContext, VolumeSolidProcessor } from "../volume-solids.js"
import { SamplesKey, SamplingKey, VolumeProcessingWithSampling, VolumeSamplingSubdivisionSamplesOctTreesGrouped } from "../../volumes/sampling/types.js"
import { NumberTypedArray } from "../../utils/index.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorStatic, ItemObjIDsKey, ItemObjValuesOffsetsKey } from "../../fields/vectorized/point.js"
import { FieldPointType, field_point_new } from "../../fields/type.js"
import { TypedArrayOctTree } from "../../paradigm/octtree/typed-array.js"
import { vectorizedIteratorGetSetLengthCurried } from "../../fields/vectorized/iterators/factory.js"

export const PhysicalPropertiesTemplate_Leaf_Intensive = Symbol('physical-property:intensive')
export const PhysicalPropertiesTemplate_Leaf_Extensive = Symbol('physical-property:extensive')
export type PhysicalPropertiesTemplate_Leaf_Intensive_T = typeof PhysicalPropertiesTemplate_Leaf_Intensive
export type PhysicalPropertiesTemplate_Leaf_Extensive_T = typeof PhysicalPropertiesTemplate_Leaf_Extensive
export type PhysicalPropertiesTemplate_Leaf_T =
    PhysicalPropertiesTemplate_Leaf_Intensive_T |
    PhysicalPropertiesTemplate_Leaf_Extensive_T

export interface PhysicalPropertiesTemplate<
        Self extends PhysicalPropertiesTemplate<Self>
    > extends
    TreeByValue<
        PhysicalPropertiesTemplate_Leaf_T,
        Self
    > { }

export type IntensivePropertiesVolumeSample<Properties extends FieldsPoint> =
    VolumeSample & Properties

/**
 * This will contain averaged intensive properties and extensive properties finally accumulated by volume
 */
export type SolidWithPhysicalProperties<
        PhysicalPropertiesTemplateT extends PhysicalPropertiesTemplate<PhysicalPropertiesTemplateT>,
        PhysicalPropertiesValueT extends FieldPoint = FieldPoint,
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeSampleElementType extends VolumeSample = VolumeSample,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>
    > =
    SolidWithEnclosingVolume<
        IndicesT,
        VolumeSampleElementType,
        VolumeSampleContainer,
        VolumeSampleVector,
        SurfaceT
    > &
    TreeByValueMapped<
        PhysicalPropertiesTemplate_Leaf_T,
        PhysicalPropertiesTemplateT,
        PhysicalPropertiesValueT
    >

// type IndicesT1 = Uint32Array
// type VolumeSampleT1 = VolumeSample & { a: number }
// type SurfaceT1 = Surface<IndicesT1, VolumeSampleT1>
// let a!: SolidWithEnclosingVolume<IndicesT1, VolumeSampleT1, SurfaceT1>
// let b!: SolidWithPhysicalProperties<{}, FieldPoint, IndicesT1, VolumeSampleT1, SurfaceT1>
// let c!: Solid<IndicesT1, VolumeSampleT1, SurfaceT1>
// a = b
// b = a
// c = a
// c = b

export class SolidWithPhysicalPropertiesProcessor<
        PhysicalPropertiesTemplateT extends PhysicalPropertiesTemplate<PhysicalPropertiesTemplateT>,
        PhysicalPropertiesValueT extends FieldPoint = FieldPoint,
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                > =
            VolumeSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                >,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            > =
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            >,
        SolidT extends
            SolidWithPhysicalProperties<
                    PhysicalPropertiesTemplateT,
                    PhysicalPropertiesValueT,
                    IndicesT,
                    VolumeSampleElementType,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    SurfaceT
                > =
            SolidWithPhysicalProperties<
                    PhysicalPropertiesTemplateT,
                    PhysicalPropertiesValueT,
                    IndicesT,
                    VolumeSampleElementType,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    SurfaceT
                >,
        SolidProcessingContextT extends
            SolidProcessingContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            SolidProcessingContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
        VolumeProcessingT extends
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    {},
                    {},
                    {},
                    {},
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    {},
                    {},
                    {},
                    {},
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSolidsContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeProcessingWithSolidsContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            >
    >
    implements VolumeSolidProcessor<
            IndicesT,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleContainer,
            VolumeSampleVector,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            SurfaceT,
            SurfaceProcessingContextT,
            SolidT,
            SolidProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        > {
    constructor(
            public readonly physicalPropertiesTemplate: PhysicalPropertiesTemplateT,
            public readonly physicalPropertiesTypes: TreeByValueMapped<PhysicalPropertiesTemplate_Leaf_T, PhysicalPropertiesTemplateT, FieldPointType<PhysicalPropertiesValueT>>
        ) { }

    init(context: SolidProcessingContextT) {
        const properties = [...leavesByValues(
            this.physicalPropertiesTemplate,
            [PhysicalPropertiesTemplate_Leaf_Extensive, PhysicalPropertiesTemplate_Leaf_Intensive]
        )]

        const connections = {
            inputs: properties.map(({ path }) => ['voxels', ...path]),
            outputs: properties.map(({ path }) => path),
        }

        return { connections }
    }

    process(
            solid: VolumeSolidProcessing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT,
                    VolumeProcessingT
                >,
            context: WithEncapsulating<VolumeProcessingContextT>
        ): void {
        const sampling = solid[EncapsulatingKey][SamplingKey]
        const sampling_depth_plus_1 = (<VolumeSamplingSubdivisionSamplesOctTreesGrouped><unknown>solid[EncapsulatingKey])[SamplesKey].alpha.layers.length
        const voxelSizes = new Float64Array(sampling_depth_plus_1).fill(0).map((_, layer) => 8 ** (sampling_depth_plus_1 - layer))

        const multiObjectsIDs = (<WithMultiObjectsIDs><unknown>context[EncapsulatingKey])[MultiObjectsIDsKey]

        type ObjIDsT = Uint32Array

        const sampling_objIDs = <TypedArrayOctTree<number, ObjIDsT>>(<any>sampling)[ItemObjIDsKey]
        const sampling_objOffsets = <TypedArrayOctTree<number, Uint32Array>>(<any>sampling)[ItemObjValuesOffsetsKey]

        iterTreeByLeavesValues(
            solid,
            this.physicalPropertiesTemplate,
            [PhysicalPropertiesTemplate_Leaf_Extensive, PhysicalPropertiesTemplate_Leaf_Intensive],
            (solid_value, solid_key, fullpath, propertyKind) => {
                const sample_type = extract<FieldPointType>(this.physicalPropertiesTypes, fullpath)
                const sample_octtrees = extract<FieldPointVectorStatic>(sampling, fullpath)

                const sample_layers_results: { result: PhysicalPropertiesValueT }[] = []
                const sample_layer_getters: ((index: number) => void)[][] = []

                field_point_map(
                    sample_type,
                    type => type instanceof Function,
                    (primitive_type, path) => {
                        const result_path = ['result', ...path]
                        const result_subpath = result_path.slice(0, -1)
                        const result_key = result_path.at(-1)!

                        const multiObjIndex = path.indexOf(MultiObjectsGroupedObjectsKey)
                        const isMultiObj = !(multiObjIndex === -1)
                        const nonMultiObjPath = !isMultiObj ? path : [...path.slice(0, multiObjIndex), ...path.slice(multiObjIndex + 1)]
                        const primitive_octtree = extract<TypedArrayOctTree<number, FieldPointVectorContainerStatic>>(sample_octtrees, nonMultiObjPath)

                        const elementType_nonMultiObj = { [result_key]: <FieldPointType<FieldPointPrimitive>>primitive_type }
                        const elementType = !isMultiObj ? elementType_nonMultiObj : { [MultiObjectsGroupedObjectsKey]: elementType_nonMultiObj }

                        return primitive_octtree.layers.map((layer, layer_index) => {
                            const primitive_sample_result = sample_layers_results[layer_index] ??= { result: undefined! }
                            intract(primitive_sample_result, result_path, field_point_new(primitive_type))
                            const primitive_obj = extract<FieldsPoint>(primitive_sample_result, result_subpath)

                            const { get } = vectorizedIteratorGetSetLengthCurried<FieldsPoint, FieldPointVectorContainerStatic>(
                                elementType,
                                <any>(!isMultiObj ?
                                    { [result_key]: layer } :
                                    {
                                        [result_key]: layer,
                                        [ItemObjIDsKey]: sampling_objIDs?.layers[layer_index],
                                        [ItemObjValuesOffsetsKey]: sampling_objOffsets?.layers[layer_index]
                                    }
                                ),
                                {
                                    obj: primitive_obj,
                                    property: result_key
                                },
                                multiObjectsIDs
                            )

                            const layer_getters = sample_layer_getters[layer_index] ??= []
                            layer_getters.push(get)
                        })
                    }
                )

                const { layers, localIndices } = solid[VolumeVoxelsKey]
                let totalSize = 0

                for (let i = 0; i < layers.length; i++) {
                    const layer = layers[i]
                    const localIndex = localIndices[i]

                    for (const getter of sample_layer_getters[layer])
                        getter(localIndex)

                    const value = sample_layers_results[layer].result
                    const size = voxelSizes[layer]

                    totalSize += size

                    fields_point_add_inplace_weighted<any, PhysicalPropertiesValueT>(
                        solid_value,
                        solid_key,
                        value,
                        size
                    )
                }

                switch (propertyKind) {
                    case PhysicalPropertiesTemplate_Leaf_Intensive:
                        solid_value[solid_key] = field_point_divide(solid_value[solid_key], totalSize)
                        break

                    case PhysicalPropertiesTemplate_Leaf_Extensive:
                        solid_value[solid_key] = field_point_divide(solid_value[solid_key], totalSize / solid[TotalVolumeKey])
                        break
                }
            })
    }
}

export type StandardIntensiveProperties = {
    density: number
    temperature: number
    specificHeatCapacity: number
    pressure: number
}

export type StandardExtensiveProperties = {
    /**
     * density = mass / volume
     */
    mass: number

    /**
     * heat = mass * specific heat * temperature
     */
    heat: number

    /**
     * PV = nRT
     */
    amount: number

    // /**
    //  * U = C_v * n * T
    //  * C_v (molar heat capacity) = c / d
    //  */
    // internalEnergy: number
}

export interface StandardPhysicalPropertiesTemplate extends PhysicalPropertiesTemplate<StandardPhysicalPropertiesTemplate> {
    density: PhysicalPropertiesTemplate_Leaf_Intensive_T
    mass: PhysicalPropertiesTemplate_Leaf_Extensive_T
    pressure: PhysicalPropertiesTemplate_Leaf_Intensive_T
    amount: PhysicalPropertiesTemplate_Leaf_Extensive_T
    temperature: PhysicalPropertiesTemplate_Leaf_Intensive_T
    specificHeatCapacity: PhysicalPropertiesTemplate_Leaf_Intensive_T
    heat: PhysicalPropertiesTemplate_Leaf_Extensive_T
    // internalEnergy: PhysicalPropertiesTemplate_Leaf_Extensive_T
}

export const IdealGasConstant = 8.31446261815324

export class StandardPhysicalPropertiesSolidProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                > =
            VolumeSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                >,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            > =
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            >,
        SolidT extends
            SolidWithPhysicalProperties<
                    StandardPhysicalPropertiesTemplate,
                    number,
                    IndicesT,
                    VolumeSampleElementType,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    SurfaceT
                > =
            SolidWithPhysicalProperties<
                    StandardPhysicalPropertiesTemplate,
                    number,
                    IndicesT,
                    VolumeSampleElementType,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    SurfaceT
                >,
        SolidProcessingContextT extends
            SolidProcessingContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            SolidProcessingContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
        VolumeProcessingT extends
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    {},
                    {},
                    {},
                    {},
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    {},
                    {},
                    {},
                    {},
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSolidsContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeProcessingWithSolidsContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            >
    >
    extends SolidWithPhysicalPropertiesProcessor<
        StandardPhysicalPropertiesTemplate,
        number,
        IndicesT,
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
        VolumeSampleContainer,
        VolumeSampleVector,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        SurfaceT,
        SurfaceProcessingContextT,
        SolidT,
        SolidProcessingContextT,
        VolumeProcessingT,
        VolumeProcessingContextT
    > {
    constructor() {
        super(
            {
                density: PhysicalPropertiesTemplate_Leaf_Intensive,
                pressure: PhysicalPropertiesTemplate_Leaf_Intensive,
                specificHeatCapacity: PhysicalPropertiesTemplate_Leaf_Intensive,
                heat: PhysicalPropertiesTemplate_Leaf_Extensive
            } as StandardPhysicalPropertiesTemplate,
            {
                density: Number,
                pressure: Number,
                specificHeatCapacity: Number,
                heat: Number,
            } as TreeByValueMapped<PhysicalPropertiesTemplate_Leaf_T, StandardPhysicalPropertiesTemplate, FieldPointType<number>>
        )
    }

    override process(
            solid: VolumeSolidProcessing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT,
                    VolumeProcessingT
                >,
            context: VolumeSolidProcessingContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT,
                    SolidProcessingContextT,
                    VolumeProcessingContextT
                >
        ): void {
        super.process(solid, context)

        solid.mass = solid.totalVolume * solid.density
        //TODO: specificHeatCapacity should be an intensive property with weighted average by density
        solid.temperature = solid.heat / (solid.mass * solid.specificHeatCapacity)
        solid.amount = solid.pressure / (IdealGasConstant * solid.temperature)
    }
}