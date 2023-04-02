import { BoundingBox, Vec2, Vec3 } from "playcanvas-extended";
import { Field, FieldsField, FieldsPointMapped, FieldsPointOptional, SignField } from "../fields/index.js";
import { defaultMeshingSettings } from "../meshing/meshing-algorithm.js";
import { VolumeSurfaceMeshingKey, VolumeSurfaceMeshingProcessingContext } from "../surfaces/processor.js";
import { TextureLocation, TextureSamplingContext } from "../textures/texture.js";
import { Sign } from "../utils/sign.js";
import { MetaShape, MetaShapeLocation, MetaShapeParametersIn, MetaShapeSample, MetaShapeSamplingContext, MetaShapeSamplingContext_Texture, MetaShapeSamplingContext_Volume, MetaShapeTxLocation, MetaShapeTxSample, MetaShapeVolume, MetaShapeVolumeSamplingContext } from "./metashape.js";

export type MetaPlaneSample = MetaShapeSample & {
    side: Sign
}

export class MetaPlane<
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaShapeTxSample = MetaShapeTxSample,
        Location extends MetaShapeLocation = MetaShapeLocation,
        Sample extends MetaPlaneSample = MetaPlaneSample,
        TextureContext extends
            TextureSamplingContext<MetaShapeTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaShapeTxLocation<Location, TxLocation>>,
        VolumeContext extends
            MetaShapeVolumeSamplingContext<TxLocation, Location, TextureContext> =
            MetaShapeVolumeSamplingContext<TxLocation, Location, TextureContext>,
        Context extends
            MetaShapeSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext> =
            MetaShapeSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext>,
    > implements
    MetaShape<
        TxLocation,
        TxSample,
        Location,
        Sample,
        TextureContext,
        VolumeContext,
        Context
    > {
    boundingBox: BoundingBox
    field = FieldsField.merge<Sample>(
        MetaShapeVolume.defaultFields.sample as FieldsField<Sample>,
        new FieldsField({
            side: new SignField(),
        } as FieldsPointMapped<Sample, Field>)
    )

    constructor(
        public maxDomain: {
                offset: Vec2,
                size: Vec2
            } = {
                offset: new Vec2(-1, -1),
                size: new Vec2(2, 2)
            }
        ) { }
    
    init(context: Context): void {
        const texture = context[MetaShapeSamplingContext_Texture].item

        const xy_offset = this.maxDomain.offset
        const xy_size = this.maxDomain.size
        
        const boundingBox = {
            max: new Vec3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
            min: new Vec3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
        }

        const meshingSettings = (context[MetaShapeSamplingContext_Volume] as unknown as VolumeSurfaceMeshingProcessingContext)[VolumeSurfaceMeshingKey].settings ?? defaultMeshingSettings

        const resolution = 32
        for (let x = 0; x < resolution; x++) {
            for (let y = 0; y < resolution; y++) {
                const uv = new Vec2(x, y).divScalar(resolution)
                const p = uv.mul(xy_size).add(xy_offset)
                
                const texture_sample = texture?.sample({ uv } as MetaShapeTxLocation<Location, TxLocation>, context[MetaShapeSamplingContext_Texture].context)
                const parameters = MetaShapeVolume.combineParameters((texture_sample ?? MetaShapeVolume.defaultParameters) as FieldsPointOptional<MetaShapeParametersIn>)
                const parameters_valid = MetaShapeVolume.parametersValid(parameters)

                if (parameters_valid) {
                    boundingBox.max.x = Math.max(boundingBox.max.x, p.x)
                    boundingBox.min.x = Math.min(boundingBox.min.x, p.x)

                    boundingBox.max.y = Math.max(boundingBox.max.y, p.y)
                    boundingBox.min.y = Math.min(boundingBox.min.y, p.y)

                    boundingBox.max.z = Math.max(
                        boundingBox.max.z,
                        +1 *
                        MetaShapeVolume.boundingLength(
                            parameters,
                            meshingSettings
                        )
                    )
                
                    boundingBox.min.z = Math.min(
                        boundingBox.min.z,
                        -1 *
                        MetaShapeVolume.boundingLength(
                            parameters,
                            meshingSettings
                        )
                    )
                }
            }
        }
        
        this.boundingBox = new BoundingBox(
            new Vec3().add2(boundingBox.max, boundingBox.min).divScalar(2),
            new Vec3().sub2(boundingBox.max, boundingBox.min).divScalar(2)
        )
    }

    sample(location: Location, context: Context): Sample {
        const side = Math.sign(location.p.z) as Sign
        const gradient = new Vec3(0, 0, side)
        const distance = Math.abs(location.p.z)
        
        const uv = new Vec2(
            ((location.p.x - this.boundingBox.center.x) / this.boundingBox.halfExtents.x) + 0.5,
            ((location.p.y - this.boundingBox.center.y) / this.boundingBox.halfExtents.y) + 0.5
        )

        return {
            distance,
            gradient,
            uv
        } as unknown as Sample
    }
}