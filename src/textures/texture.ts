import { Vec2 } from "playcanvas-extended";
import { MultiObjectsGrouped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsTemplate } from "../paradigm/trees/index.js";
import { FieldPoint, SampleDomain, SamplingContext, fields, tensor } from "../fields/index.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../fields/vectorized/point.js";
import { VectorSampleDomain, VectorSampleFunction, VectorSamplingContext } from "../fields/domains/vector.js";
import { NumberTypedArray } from "../utils/typed-array.js";
import { IndicesTypedArray } from "../utils/indices-array.js";

export type TextureUV = Vec2

export type TextureLocation = {
    /**
     * UV coordinates to sample at
     */
    uv: TextureUV
}

export type TextureSample = FieldPoint

export const defaultTextureLocationField = new fields.FieldsField<TextureLocation>({
    uv: fields.Vec2Field.instance
})

export interface TextureSamplingContext<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
    > extends
    SamplingContext<Location, LocationElementType, LocationFuseMode> {
}

export interface Texture<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Context extends
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        VectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                >
    > extends
    SampleDomain<
        Location, Sample,
        LocationElementType,
        LocationFuseMode,
        SampleElementType,
        SampleFuseMode,
        Context
    >,
    VectorSampleDomain<
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        Context,
        LocationVector,
        SampleVector,
        VectorContext
    > {
    render(
        resolution: Vec2,
        context: VectorContext
    ): tensor.FieldPointTensor2D<SampleElementType>
}

export function textureSampleLocationsGridVector(resolution: Vec2): FieldPointVector<TextureLocation, FieldPointVectorContainerStatic> {
    const uv = new Float64Array(2 * resolution.x * resolution.y)

    let n_x = resolution.x
    let n_y = resolution.y

    let scaled_y: number

    let i_uv = 0

    for (let y = 0; y < n_y; y++) {
        scaled_y = y / n_y
        for (let x = 0; x < n_x; x++) {
            uv[i_uv++] = x / n_x
            uv[i_uv++] = scaled_y
        }
    }

    return { uv }
}

export function textureTensorSampleUsingVectorSample<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Context extends
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        VectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                >
    >(
        texture: Texture<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Sample,
            SampleElementType,
            SampleFuseMode,
            SampleContainer,
            Context,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LocationVector,
            SampleVector,
            VectorContext
        >,
        resolution: Vec2,
        context: VectorContext
    ): tensor.FieldPointTensor2D<SampleElementType> {
    const locations = <LocationVector>textureSampleLocationsGridVector(resolution)
    const samples = <SampleVector>context[VectorSampleFunction](texture, locations, context)
    return tensor.field_point_tensor_encode(texture.field.elementType, [resolution.y, resolution.x], undefined, samples)
}

export type TexturesTemplated<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TexelT extends TextureSample = TextureSample,
        TexelElementType extends TextureSample = TexelT,
        TexelFuseMode extends TextureSample = TexelT,
        TexelTGrouped extends
            MultiObjectsGroupsMapped<Groups, TexelT> =
            MultiObjectsGroupsMapped<Groups, TexelT>,
        TexelElementTypeGrouped extends
            MultiObjectsGroupsMapped<Groups, TexelElementType> =
            MultiObjectsGroupsMapped<Groups, TexelElementType>,
        TexelFuseModeGrouped extends
            MultiObjectsGroupsMapped<Groups, TexelFuseMode> =
            MultiObjectsGroupsMapped<Groups, TexelFuseMode>,
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        Context extends
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        SampleContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        // SampleVector extends
        //     FieldPointVector<SampleElementType, SampleContainer> =
        //     FieldPointVector<SampleElementType, SampleContainer>,
        // VectorContext extends
        //     VectorSamplingContext<
        //             Location,
        //             LocationElementType,
        //             LocationFuseMode,
        //             LocationContainer,
        //             Sample,
        //             SampleElementType,
        //             SampleFuseMode,
        //             SampleContainer,
        //             Objects,
        //             ObjIDsT,
        //             ObjIDsContainer,
        //             Context,
        //             LocationVector,
        //             SampleVector
        //         > =
        //     VectorSamplingContext<
        //             Location,
        //             LocationElementType,
        //             LocationFuseMode,
        //             LocationContainer,
        //             Sample,
        //             SampleElementType,
        //             SampleFuseMode,
        //             SampleContainer,
        //             Objects,
        //             ObjIDsT,
        //             ObjIDsContainer,
        //             Context,
        //             LocationVector,
        //             SampleVector
        //         >
    > = {
    [K in keyof Groups]:
        K extends keyof TexelTGrouped ? K extends keyof TexelElementTypeGrouped ? K extends keyof TexelFuseModeGrouped ?
            Groups[K] extends MultiObjectsGroupsTemplate ?
                TexelTGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TexelT> ? TexelElementTypeGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TexelElementType> ? TexelFuseModeGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TexelFuseMode> ?
                    TexturesTemplated<
                            Groups[K],
                            TexelT,
                            TexelElementType,
                            TexelFuseMode,
                            TexelTGrouped[K],
                            TexelElementTypeGrouped[K],
                            TexelFuseModeGrouped[K],
                            Location,
                            LocationElementType,
                            LocationFuseMode,
                            Context,
                            LocationContainer,
                            SampleContainer,
                            Objects,
                            ObjIDsT,
                            ObjIDsContainer,
                            LocationVector
                        > :
                    never : never : never :
                Texture<
                    Location, LocationElementType, LocationFuseMode, LocationContainer,
                    TexelTGrouped[K], TexelElementTypeGrouped[K], TexelFuseModeGrouped[K], SampleContainer,
                    Context,
                    Objects, ObjIDsT, ObjIDsContainer,
                    LocationVector
                > :
            never : never : never
    }

export type TexturesTemplatedWithObjects<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends
            MultiObjectsGrouped<Objects, Groups> =
            MultiObjectsGrouped<Objects, Groups>,
        TexelT extends TextureSample = TextureSample,
        TexelElementType extends TextureSample = TexelT,
        TexelFuseMode extends TextureSample = TexelT,
        TexelTGrouped extends
            MultiObjectsGroupsMapped<Groups, TexelT> =
            MultiObjectsGroupsMapped<Groups, TexelT>,
        TexelElementTypeGrouped extends
            MultiObjectsGroupsMapped<Groups, TexelElementType> =
            MultiObjectsGroupsMapped<Groups, TexelElementType>,
        TexelFuseModeGrouped extends
            MultiObjectsGroupsMapped<Groups, TexelFuseMode> =
            MultiObjectsGroupsMapped<Groups, TexelFuseMode>,
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        Context extends
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        SampleContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        // SampleVector extends
        //     FieldPointVector<SampleElementType, SampleContainer> =
        //     FieldPointVector<SampleElementType, SampleContainer>,
        // VectorContext extends
        //     VectorSamplingContext<
        //             Location,
        //             LocationElementType,
        //             LocationFuseMode,
        //             LocationContainer,
        //             Sample,
        //             SampleElementType,
        //             SampleFuseMode,
        //             SampleContainer,
        //             Objects,
        //             ObjIDsT,
        //             ObjIDsContainer,
        //             Context,
        //             LocationVector,
        //             SampleVector
        //         > =
        //     VectorSamplingContext<
        //             Location,
        //             LocationElementType,
        //             LocationFuseMode,
        //             LocationContainer,
        //             Sample,
        //             SampleElementType,
        //             SampleFuseMode,
        //             SampleContainer,
        //             Objects,
        //             ObjIDsT,
        //             ObjIDsContainer,
        //             Context,
        //             LocationVector,
        //             SampleVector
        //         >
    > = {
    [K in keyof Groups]:
        K extends keyof TexelTGrouped ? K extends keyof TexelElementTypeGrouped ? K extends keyof TexelFuseModeGrouped ?
            Groups[K] extends MultiObjectsGroupsTemplate ?
                TexelTGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TexelT> ? TexelElementTypeGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TexelElementType> ? TexelFuseModeGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TexelFuseMode> ? ObjectsGrouped[K] extends MultiObjectsGrouped<Objects, Groups[K]> ?
                    TexturesTemplatedWithObjects<
                            Objects,
                            Groups[K],
                            ObjectsGrouped[K],
                            TexelT,
                            TexelElementType,
                            TexelFuseMode,
                            TexelTGrouped[K],
                            TexelElementTypeGrouped[K],
                            TexelFuseModeGrouped[K],
                            Location,
                            LocationElementType,
                            LocationFuseMode,
                            Context
                        > :
                    never : never : never : never :
                MultiObjectsMapped<
                    Objects,
                    Texture<
                        Location, LocationElementType, LocationFuseMode, LocationContainer,
                        TexelTGrouped[K], TexelElementTypeGrouped[K], TexelFuseModeGrouped[K], SampleContainer,
                        Context,
                        Objects, ObjIDsT, ObjIDsContainer,
                        LocationVector
                    >
                > :
            never : never : never
    }

// type ABC_groups = {
//     a: MultiObjectsGroupsTemplateLeaf
//     b: MultiObjectsGroupsTemplateLeaf
//     c: MultiObjectsGroupsTemplateLeaf
//     d: {
//         uv: MultiObjectsGroupsTemplateLeaf
//         xyz: MultiObjectsGroupsTemplateLeaf
//     }
// }

// type ABC_texels = {
//     a: number
//     b: Color
//     c: {
//         field1: number
//         field2: number
//     }
//     d: {
//         uv: Vec2
//         xyz: Vec3
//     }
// }

// type ABC_templated = TexturesTemplated<ABC_groups, FieldPoint, ABC_texels>
// let abc1: ABC_templated = {
//     a: undefined as Texture<TextureLocation, number>,
//     b: undefined as Texture<TextureLocation, Color>,
//     c: undefined as Texture<TextureLocation, ABC_texels["c"]>,
//     d: {
//         uv: undefined as Texture<TextureLocation, Vec2>,
//         xyz: undefined as Texture<TextureLocation, Vec3>,
//     }
// }
// let abc2: ABC_templated
// abc2.c.sample
// abc2.d.uv
// abc2.d.xyz
// abc2 = abc1

export type TextureSamplesExtracted<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureT extends Texture = Texture,
        TexturesGrouped extends
            MultiObjectsGroupsMapped<Groups, TextureT> =
            MultiObjectsGroupsMapped<Groups, TextureT>
    > = {
    [K in keyof TexturesGrouped]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            TexturesGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TextureT> ?
                TextureSamplesExtracted<Groups[K], TextureT, TexturesGrouped[K]> :
                never :
        TexturesGrouped[K] extends Texture<any, any, any, any, infer Sample, infer Context> ?
            Sample :
            never
    }

export type TextureSamplesExtracted1<
    TexturesGrouped extends
        MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, Texture> =
        MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, Texture>
    > = {
        [K in keyof TexturesGrouped]:
        TexturesGrouped[K] extends Texture<any, any, any, any, infer Sample> ?
            Sample :
            (TexturesGrouped[K] extends MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, Texture>?
                TextureSamplesExtracted1<TexturesGrouped[K]> :
                never)
}

// type ABC_inferred = TextureSamplesExtracted<ABC_groups, Texture, ABC_templated>
// let abc_inferred: ABC_inferred
// abc_inferred.a = 23
// abc_inferred.b.set(1, 1, 0, 1)
// abc_inferred.c.field1 = 10
// abc_inferred.c.field1 = 20
// abc_inferred.d.uv = new Vec2()
// abc_inferred.d.xyz.cross(Vec3.FORWARD, Vec3.RIGHT)