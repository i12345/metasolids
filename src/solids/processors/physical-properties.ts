import { FieldPoint, FieldsPoint, fields_point_add_inplace, field_point_divide, field_point_multiply, fields_point_add_inplace_weighted } from "../../fields/point.js"
import { Surface, SurfaceProcessingContext } from "../../surfaces/index.js"
import { makeExtractor, iterTreeByLeavesValues, TreeByValue, TreeByValueMapped, leavesByValues, EncapsulatingKey } from "../../paradigm/trees/index.js"
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/index.js"
import { SolidProcessingContext, SolidProcessor } from "../processor.js"
import { SolidWithEnclosingVolume, TotalVolumeKey, VolumeVoxelsKey } from "./enclosing-volume.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { VolumeProcessingWithSolids, VolumeProcessingWithSolidsContext, VolumeSolidProcessing, VolumeSolidProcessor } from "../volume-solids.js"
import { SamplingKey, SpaceKey, VolumeProcessingWithSampling } from "../../volumes/sampling/types.js"
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js"

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
        VolumeSampleT extends VolumeSample = VolumeSample,
        SurfaceT extends Surface<IndicesT, VolumeSampleT> = Surface<IndicesT, VolumeSampleT>
    > =
    SolidWithEnclosingVolume<IndicesT, VolumeSampleT, SurfaceT> &
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
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        SurfaceT extends Surface<IndicesT, VolumeSampleT> = Surface<IndicesT, VolumeSampleT>,
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
                    VolumeSampleT,
                    SurfaceT
                > =
            SolidWithPhysicalProperties<
                    PhysicalPropertiesTemplateT,
                    PhysicalPropertiesValueT,
                    IndicesT,
                    VolumeSampleT,
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
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    {},
                    any,
                    {},
                    any,
                    {},
                    {},
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    {},
                    any,
                    {},
                    any,
                    {},
                    {},
                    VolumeLocationT,
                    VolumeSampleT,
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
            VolumeSampleT,
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
            public physicalPropertiesTemplate: PhysicalPropertiesTemplateT
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

    process(solid: VolumeSolidProcessing<
            IndicesT,
            VolumeLocationT,
            VolumeSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            SurfaceT,
            SolidT,
            VolumeProcessingT
        >): void {
        const sampling = solid[EncapsulatingKey][SamplingKey]
        const samples = sampling.samples.layers
        const voxelSizes = new Float64Array(samples.length).fill(0).map((_, layer) => 8 ** (samples.length - layer))

        iterTreeByLeavesValues(
            solid,
            this.physicalPropertiesTemplate,
            [PhysicalPropertiesTemplate_Leaf_Extensive, PhysicalPropertiesTemplate_Leaf_Intensive],
            (value, key, fullpath, propertyKind) => {
                const extractor = makeExtractor(fullpath)
                
                const { layers, localIndices } = solid[VolumeVoxelsKey]
                let totalSize = 0

                for (let i = 0; i < layers.length; i++) {
                    const layer = layers[i]
                    const localIndex = localIndices[i]
                    const sample = samples[layer][localIndex]
                    const value = extractor(sample) as PhysicalPropertiesValueT
                    const size = voxelSizes[layer]
                    
                    totalSize += size

                    fields_point_add_inplace_weighted<any, PhysicalPropertiesValueT>(
                        value,
                        key,
                        value,
                        size
                    )
                }

                switch (propertyKind) {
                    case PhysicalPropertiesTemplate_Leaf_Intensive:
                        value[key] = field_point_divide(value[key], totalSize)
                        break
                    
                    case PhysicalPropertiesTemplate_Leaf_Extensive:
                        value[key] = field_point_divide(value[key], totalSize / solid[TotalVolumeKey])
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
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        SurfaceT extends Surface<IndicesT, VolumeSampleT> = Surface<IndicesT, VolumeSampleT>,
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
                    VolumeSampleT,
                    SurfaceT
                > =
            SolidWithPhysicalProperties<
                    StandardPhysicalPropertiesTemplate,
                    number,
                    IndicesT,
                    VolumeSampleT,
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
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    {},
                    any,
                    {},
                    any,
                    {},
                    {},
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    {},
                    any,
                    {},
                    any,
                    {},
                    {},
                    VolumeLocationT,
                    VolumeSampleT,
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
        VolumeSampleT,
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
        super({
            density: PhysicalPropertiesTemplate_Leaf_Intensive,
            pressure: PhysicalPropertiesTemplate_Leaf_Intensive,
            specificHeatCapacity: PhysicalPropertiesTemplate_Leaf_Intensive,
            heat: PhysicalPropertiesTemplate_Leaf_Extensive
        } as StandardPhysicalPropertiesTemplate)
    }

    override process(solid: VolumeSolidProcessing<IndicesT, VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT, VolumeT, SurfaceT, SolidT, VolumeProcessingT>): void {
        super.process(solid)

        solid.mass = solid.totalVolume * solid.density
        //TODO: specificHeatCapacity should be an intensive property with weighted average by density
        solid.temperature = solid.heat / (solid.mass * solid.specificHeatCapacity)
        solid.amount = solid.pressure / (IdealGasConstant * solid.temperature)
    }
}