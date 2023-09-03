// import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/index.js";
// import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "../texture.js";
// import { Texturer } from "../texturer.js";

// type InputsT = {
//     value: MultiObjectsGroupsTemplateLeaf
// }

// type InputTexelTypesGrouped<
//         TextureLocationT extends TextureLocation = TextureLocation,
//         TextureSampleT extends TextureSample = TextureSample,
//         TexelTypeT extends TextureSample = TextureSample,
//     > = {
//     value: TexelTypeT
// }

// type OutputsT = {
//     value: MultiObjectsGroupsTemplateLeaf
// }

// const InputsTemplate: InputsT = {
//     value: MultiObjectsGroupsTemplate_Leaf
// }

// const OutputsTemplate: OutputsT = {
//     value: MultiObjectsGroupsTemplate_Leaf
// }

// const template = {
//     inputs: InputsTemplate,
//     outputs: OutputsTemplate
// }

// export class CopyTexturer<
//         TextureableT = any,
//         TextureLocationT extends TextureLocation = TextureLocation,
//         TextureSampleT extends TextureSample = TextureSample,
//         TextureLocationElementType extends TextureLocation = TextureLocationT,
//         TextureLocationFuseMode extends TextureLocation = TextureLocationT,
//         TextureSampleElementType extends TextureSample = TextureSampleT,
//         TextureSampleFuseMode extends TextureSample = TextureSampleT,
//         TextureSamplingContextT extends
//             TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
//             TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
//         TexelTypeT extends TextureSampleT = TextureSampleT
//     >
//     extends Texturer<
//         TextureableT,
//         TextureLocationT,
//         TextureSampleT,
//         TextureLocationElementType,
//         TextureLocationFuseMode,
//         TextureSampleElementType,
//         TextureSampleFuseMode,
//         TextureSamplingContextT,
//         OutputsT,
//         InputsT,
//         TextureSampleT,
//         InputTexelTypesGrouped<TextureLocationT, TextureSampleT, TexelTypeT>
//     > {
//     constructor() {
//         super(template)
//     }

//     protected factory(
//         { }: TexturesTemplated<
//                 InputsT,
//                 TextureSampleT,
//                 InputTexelTypesGrouped<TextureLocationT, TextureSampleT, TexelTypeT>,
//                 TextureLocationT,
//                 TextureSamplingContextT
//             >
//     ): MultiObjectsGroupsMapped<
//             OutputsT,
//             Texture<
//                 TextureLocationT, TextureSampleT,
//                 TextureLocationElementType,
//                 TextureLocationFuseMode,
//                 TextureSampleElementType,
//                 TextureSampleFuseMode,
//                 TextureSamplingContextT
//             >
//         > {
//         return { value }
//     }
// }
export { }