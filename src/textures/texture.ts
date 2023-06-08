import { Vec2 } from "playcanvas-extended";
import { MultiObjectsGrouped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsMappedGrouped, MultiObjectsTemplate } from "../paradigm/index.js";
import { FieldPoint, SampleDomain, SamplingContext } from "../fields/index.js";

export type TextureUV = Vec2

export type TextureLocation = {
    /**
     * UV coordinates to sample at
     */
    uv: TextureUV
}

export type TextureSample = FieldPoint

export interface TextureSamplingContext
    <Location extends TextureLocation = TextureLocation> extends
    SamplingContext<Location> {
}

export interface Texture<
        Location extends TextureLocation = TextureLocation,
        Sample extends TextureSample = TextureSample,
        Context extends
            TextureSamplingContext<Location> =
            TextureSamplingContext<Location>
    > extends
    SampleDomain<Location, Sample, Context> {
}

export type ObjectsTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Location extends TextureLocation = TextureLocation,
        Sample extends TextureSample = TextureSample,
        TextureT extends Texture<Location, Sample> = Texture<Location, Sample>
    > =
    MultiObjectsMapped<Objects, TextureT>

export type ObjectsTexturesGrouped<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Location extends TextureLocation = TextureLocation,
        Sample extends TextureSample = TextureSample,
        TextureT extends Texture<Location, Sample> = Texture<Location, Sample>
    > =
    MultiObjectsMappedGrouped<Objects, Groups, TextureT>

export type TexturesTemplated<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TexelType extends TextureSample = TextureSample,
        TexelTypesGrouped extends
            MultiObjectsGroupsMapped<Groups, TexelType> =
            MultiObjectsGroupsMapped<Groups, TexelType>,
        Location extends TextureLocation = TextureLocation,
        Context extends
            TextureSamplingContext<Location> =
            TextureSamplingContext<Location>,
    > = {
    [K in keyof TexelTypesGrouped]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            TexelTypesGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TexelType> ?
                TexturesTemplated<Groups[K], TexelType, TexelTypesGrouped[K], Location, Context> :
                never :
            Texture<Location, TexelTypesGrouped[K], Context>
    }

export type TexturesTemplatedWithObjects<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends
            MultiObjectsGrouped<Objects, Groups> =
            MultiObjectsGrouped<Objects, Groups>,
        TexelType extends TextureSample = TextureSample,
        TexelTypesGrouped extends
            MultiObjectsGroupsMapped<Groups, TexelType> =
            MultiObjectsGroupsMapped<Groups, TexelType>,
        Location extends TextureLocation = TextureLocation,
        Context extends
            TextureSamplingContext<Location> =
            TextureSamplingContext<Location>,
    > = {
    [K in keyof TexelTypesGrouped]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            TexelTypesGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TexelType> ?
                ObjectsGrouped[K] extends MultiObjectsGrouped<Objects, Groups[K]> ?
                    TexturesTemplatedWithObjects<Objects, Groups[K], ObjectsGrouped[K], TexelType, TexelTypesGrouped[K], Location, Context> :
                    never :
                never :
            MultiObjectsMapped<Objects, Texture<Location, TexelTypesGrouped[K], Context>>
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
        TexturesGrouped[K] extends Texture<infer Location, infer Sample, infer Context> ?
            Sample :
            never
    }

export type TextureSamplesExtracted1<
    TexturesGrouped extends
        MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, Texture> =
        MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, Texture>
    > = {
        [K in keyof TexturesGrouped]:
        TexturesGrouped[K] extends Texture<infer L, infer Sample, infer C> ?
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