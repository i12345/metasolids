import { FieldPoint, FieldsPoint, fields_point_add_inplace, field_point_divide, field_point_multiply } from "../../fields/point.js"
import { Surface, SurfaceProcessingContext } from "../../surfaces/index.js"
import { makeExtractor, mapTreeByLeavesValues, TreeByValue, TreeByValueMapped } from "../../utils/tree.js"
import { VolumeSample } from "../../volumes/index.js"
import { SolidProcessingContext, SolidProcessor } from "../processor.js"
import { SolidWithEnclosingVolume, SolidWithEnclosingVolumeProcessor } from "./enclosing-volume.js"

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
        Sample extends VolumeSample = VolumeSample,
        SurfaceT extends Surface<Sample> = Surface<Sample>
    > =
    SolidWithEnclosingVolume<Sample, SurfaceT> &
    TreeByValueMapped<
        PhysicalPropertiesTemplate_Leaf_T,
        PhysicalPropertiesTemplateT,
        PhysicalPropertiesValueT
    >

export class SolidWithPhysicalPropertiesProcessor<
        PhysicalPropertiesTemplateT extends PhysicalPropertiesTemplate<PhysicalPropertiesTemplateT>,
        PhysicalPropertiesValueT extends FieldPoint = FieldPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        SolidT extends
            SolidWithPhysicalProperties<
                    PhysicalPropertiesTemplateT,
                    PhysicalPropertiesValueT,
                    Sample,
                    SurfaceT
                > =
            SolidWithPhysicalProperties<
                    PhysicalPropertiesTemplateT,
                    PhysicalPropertiesValueT,
                    Sample,
                    SurfaceT
                >,
        SolidProcessingContextT extends
            SolidProcessingContext<
                    SampleContextTemplate,
                    SurfaceProcessingContextT
                > =
            SolidProcessingContext<
                    SampleContextTemplate,
                    SurfaceProcessingContextT
                >
    >
    implements SolidProcessor<
            Sample,
            SampleContextTemplate,
            SurfaceT,
            SurfaceProcessingContextT,
            SolidT,
            SolidProcessingContextT
        > {
    get dependencies(): Function[] {
        return [SolidWithEnclosingVolumeProcessor]
    }

    constructor(
            public physicalPropertiesTemplate: PhysicalPropertiesTemplateT
        ) { }
    init(context: SolidProcessingContextT): void {
    }

    process(solid: SolidT): void {
        mapTreeByLeavesValues(
            solid,
            this.physicalPropertiesTemplate,
            [PhysicalPropertiesTemplate_Leaf_Extensive, PhysicalPropertiesTemplate_Leaf_Intensive],
            (value, key, fullpath, propertyKind) => {
                const extractor = makeExtractor(fullpath)
                
                for (const voxel of solid.voxels)
                    fields_point_add_inplace(
                        value,
                        key as keyof typeof value,
                        extractor(voxel) as PhysicalPropertiesValueT
                    )

                switch (propertyKind) {
                    case PhysicalPropertiesTemplate_Leaf_Intensive:
                        value[key] = field_point_divide(value[key], solid.voxels.length)
                        break
                    
                    case PhysicalPropertiesTemplate_Leaf_Extensive:
                        value[key] = field_point_multiply(value[key], solid.totalVolume)
                        break
                }
            })
    }
}

export interface StandardIntensiveProperties extends FieldsPoint {
    density: number
    temperature: number
    specificHeatCapacity: number
    pressure: number
}

export interface StandardExtensiveProperties extends FieldsPoint {
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
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        SolidT extends
            SolidWithPhysicalProperties<
                    StandardPhysicalPropertiesTemplate,
                    number,
                    Sample,
                    SurfaceT
                > =
            SolidWithPhysicalProperties<
                    StandardPhysicalPropertiesTemplate,
                    number,
                    Sample,
                    SurfaceT
                >,
        SolidProcessingContextT extends
            SolidProcessingContext<
                    SampleContextTemplate,
                    SurfaceProcessingContextT
                > =
            SolidProcessingContext<
                    SampleContextTemplate,
                    SurfaceProcessingContextT
                >
    >
    extends SolidWithPhysicalPropertiesProcessor<
        StandardPhysicalPropertiesTemplate,
        number,
        Sample,
        SampleContextTemplate,
        SurfaceT,
        SurfaceProcessingContextT,
        SolidT,
        SolidProcessingContextT
    > {
    constructor() {
        super({
            density: PhysicalPropertiesTemplate_Leaf_Intensive,
            pressure: PhysicalPropertiesTemplate_Leaf_Intensive,
            specificHeatCapacity: PhysicalPropertiesTemplate_Leaf_Intensive,
            heat: PhysicalPropertiesTemplate_Leaf_Extensive
        } as StandardPhysicalPropertiesTemplate)
    }

    override process(solid: SolidT): void {
        super.process(solid)

        solid.mass = solid.totalVolume * solid.density
        //TODO: specificHeatCapacity should be an intensive property with weighted average by density
        solid.temperature = solid.heat / (solid.mass * solid.specificHeatCapacity)
        solid.amount = solid.pressure / (IdealGasConstant * solid.temperature)
    }
}