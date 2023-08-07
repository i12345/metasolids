import { ExtraFields } from "../../fields/index.js"
import { ArrayLikeTemplated, OctTree, OctTreeSpace, OctTreesTemplated } from "../../paradigm/octtree/index.js"
import { OctTreeSubdividingProcessing, OctTreeSubdividingProcessingContextForSubdivisionProcessingContext, OctTreeSubdivisionProcessing, OctTreeSubdivisionProcessingContext, OctTreeSubdivisionProcessor, SubdivisionKey } from "../../paradigm/octtree/processor.js"
import { EncapsulatingKey, WithEncapsulating } from "../../paradigm/trees/encapsulating.js"
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/multi-objects-groups.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { RemoveEmptyStructs } from "../../utils/remove-empty-structs.js"
import { VolumeProcessing, VolumeProcessingContext } from "../processor.js"
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../volume.js"
import { VolumeWithBoundingBox } from "../volumes/bounded.js"

export const SamplingKey = Symbol("volume.sampling")
export const SpaceKey = Symbol("space")
export const VolumeSamplingContextKey = Symbol("volume.sampling-context")

/**
 * These types can be made generic if individual fields of a sample are directly put in distinct storage oct trees
 * E.g., then it would be
 * 
 * ```typescript
 * type Processing = {
 *  samples: {
 *    presence: OctTree<number>
 *    uv: OctTree<Vec2> // or { x: OctTree<number>, y: OctTree<number> }
 *  }
 * }
 * ```
 */
export type VolumeSamplingSubdivisionSamplesGroups<
        VolumeSampleT extends VolumeSample = VolumeSample
    > = {
    samples: MultiObjectsGroupsTemplateLeaf
}

export const VolumeSamplingSubdivisionSamplesGroupsTemplate = <
        VolumeSampleT extends VolumeSample = VolumeSample
    >(): VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT> => ({
    samples: MultiObjectsGroupsTemplate_Leaf
})

export type VolumeSamplingSubdivisionSamplesValue<VolumeSampleT extends VolumeSample = VolumeSample> = VolumeSampleT
export type VolumeSamplingSubdivisionSamplesValuesGrouped<VolumeSampleT extends VolumeSample = VolumeSample> =
    MultiObjectsGroupsMapped<VolumeSamplingSubdivisionSamplesGroups, VolumeSampleT>

export type VolumeSamplingSubdivisionSamplesLayer<VolumeSampleT extends VolumeSample = VolumeSample> = VolumeSampleT[]
export type VolumeSamplingSubdivisionSamplesLayersGrouped<VolumeSampleT extends VolumeSample = VolumeSample> =
    MultiObjectsGroupsMapped<VolumeSamplingSubdivisionSamplesGroups, VolumeSampleT[]>

export type VolumeSamplingSubdivisionSamplesOctTreesGrouped<VolumeSampleT extends VolumeSample = VolumeSample> =
    OctTreesTemplated<
            VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesValue<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesValuesGrouped<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesLayer<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesLayersGrouped<VolumeSampleT>
        >

export type VolumeSamplingSubdivisionProcessing<
            IndicesT extends IndicesTypedArray = IndicesTypedArray,
            OctTreeGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            OctTreeT = any,
            OctTreeTGrouped extends
                MultiObjectsGroupsMapped<
                        OctTreeGroups,
                        OctTreeT
                    > =
                MultiObjectsGroupsMapped<
                        OctTreeGroups,
                        OctTreeT
                    >,
            OctTreeLayer extends ArrayLike<OctTreeT> = ArrayLike<OctTreeT>,
            OctTreeLayersGrouped extends
                // MultiObjectsGroupsMapped<
                //         OctTreeGroups,
                //         OctTreeLayer
                //     > &
                ArrayLikeTemplated<
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped
                    > =
                // MultiObjectsGroupsMapped<
                //         OctTreeGroups,
                //         OctTreeLayer
                //     > &
                ArrayLikeTemplated<
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped
                    >,
            OctTreesGrouped extends
                OctTreesTemplated<
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped,
                        OctTreeLayer,
                        OctTreeLayersGrouped
                    > =
                OctTreesTemplated<
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped,
                        OctTreeLayer,
                        OctTreeLayersGrouped
                    >,
            VolumeLocationT extends VolumeLocation = VolumeLocation,
            VolumeSampleT extends VolumeSample = VolumeSample,
            VolumeSampleProcessingContextT = any,
            VolumeSamplingContextT extends
                VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
                VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
            VolumeT extends
                VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
                VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
            VolumeProcessingT extends
                // VolumeWithSamplingProcessing<
                //         IndicesT,
                //         OctTreeGroups,
                //         OctTreeT,
                //         OctTreeTGrouped,
                //         OctTreeLayer,
                //         OctTreeLayersGrouped,
                //         OctTreesGrouped,
                //         VolumeLocationT,
                //         VolumeSampleT,
                //         VolumeSamplingContextT,
                //         VolumeT
                //     > =
                // VolumeWithSamplingProcessing<
                //         IndicesT,
                //         OctTreeGroups,
                //         OctTreeT,
                //         OctTreeTGrouped,
                //         OctTreeLayer,
                //         OctTreeLayersGrouped,
                //         OctTreesGrouped,
                //         VolumeLocationT,
                //         VolumeSampleT,
                //         VolumeSamplingContextT,
                //         VolumeT
                //     >
                VolumeProcessing<
                        VolumeLocationT,
                        VolumeSampleT,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT,
                        VolumeT
                    > =
                VolumeProcessing<
                        VolumeLocationT,
                        VolumeSampleT,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT,
                        VolumeT
                    >
        > =
    WithEncapsulating<VolumeProcessingT> &
    OctTreeSubdivisionProcessing<
            OctTreeGroups,
            OctTreeT,
            OctTreeTGrouped,
            OctTreeLayer,
            OctTreeLayersGrouped
        > &
    OctTreeSubdivisionProcessing<
            VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesValue<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesValuesGrouped<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesLayer<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesLayersGrouped<VolumeSampleT>
        >
    // OctTreeSubdivisionProcessing<
    //         OctTreeGroups & VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT>,
    //         OctTreeT | VolumeSamplingSubdivisionSamplesValue<VolumeSampleT>,
    //         OctTreeTGrouped & VolumeSamplingSubdivisionSamplesValuesGrouped<VolumeSampleT>,
    //         OctTreeLayer | VolumeSamplingSubdivisionSamplesLayer<VolumeSampleT>,
    //         OctTreeLayersGrouped & VolumeSamplingSubdivisionSamplesLayersGrouped<VolumeSampleT>
    //     >

// type OctTreeGroups1 = { a1: MultiObjectsGroupsTemplateLeaf }
// type OctTreeT1 = string
// type OctTreeTGrouped1 = { a1: string }
// type OctTreeLayer1 = string[]
// type OctTreeLayersGrouped1 = { a1: string[] }
// type VolumeSampleT1 = VolumeSample & { x: number, y: number }

// type Groups2 = OctTreeGroups1 & { b: MultiObjectsGroupsTemplateLeaf }
// type T2 = OctTreeT1 | boolean
// type TGrouped2 = OctTreeTGrouped1 & { b: boolean }
// type Layer2 = OctTreeLayer1 | boolean[]
// type Layer2Grouped = OctTreeLayersGrouped1 & { b: boolean[] }
// type A2 = ArrayLikeTemplated<Groups2, T2, TGrouped2>
// type A2i = OctTreeLayersGrouped1 & { b: boolean[] }
// type X<AX> = AX extends A2 ? true : false
// type X2 = X<A2i>
// const x2: X2 = true

// type A = OctTreeLayersGrouped1 &
//     MultiObjectsGroupsMapped<
//         VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT1>,
//         VolumeSampleT1[]
//     >

// let a!: A
// a.samples
// /**
//  * ArrayLikeTemplated<
//  *      OctTreeGroups & VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT>,
//  *      OctTreeT | VolumeSampleT,
//  *      OctTreeTGrouped & MultiObjectsGroupsMapped<...>
//  * >
//  */
// type B = ArrayLikeTemplated<
//     OctTreeGroups1 & VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT1>,
//     OctTreeT1 | VolumeSampleT1,
//     OctTreeTGrouped1 & MultiObjectsGroupsMapped<
//         VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT1>,
//         VolumeSampleT1
//     >
// >
// let b!: B

// b = a

export interface VolumeProcessingWithSampling<
            IndicesT extends IndicesTypedArray = IndicesTypedArray,
            OctTreeGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            OctTreeT = any,
            OctTreeTGrouped extends
                MultiObjectsGroupsMapped<
                        OctTreeGroups,
                        OctTreeT
                    > =
                MultiObjectsGroupsMapped<
                        OctTreeGroups,
                        OctTreeT
                    >,
            OctTreeLayer extends ArrayLike<OctTreeT> = ArrayLike<OctTreeT>,
            OctTreeLayersGrouped extends
                // MultiObjectsGroupsMapped<
                //         OctTreeGroups,
                //         OctTreeLayer
                //     > &
                ArrayLikeTemplated<
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped
                    > =
                // MultiObjectsGroupsMapped<
                //         OctTreeGroups,
                //         OctTreeLayer
                //     > &
                ArrayLikeTemplated<
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped
                    >,
            OctTreesGrouped extends
                OctTreesTemplated<
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped,
                        OctTreeLayer,
                        OctTreeLayersGrouped
                    > =
                OctTreesTemplated<
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped,
                        OctTreeLayer,
                        OctTreeLayersGrouped
                    >,
            VolumeLocationT extends VolumeLocation = VolumeLocation,
            VolumeSampleT extends VolumeSample = VolumeSample,
            VolumeSampleProcessingContextT = any,
            VolumeSamplingContextT extends
                VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
                VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
            VolumeT extends
                VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
                VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>
        > extends
    VolumeProcessing<
            VolumeLocationT,
            VolumeSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT
        > {
    [SamplingKey]: (
        {
            [SpaceKey]: OctTreeSpace<IndicesT>
            extraLocationParameters: ExtraFields<VolumeLocationT, VolumeLocation>
        } &
        // OctTreeSubdividingProcessing<
        //     IndicesT,
        //     OctTreeGroups & VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT>,
        //     OctTreeT | VolumeSamplingSubdivisionSamplesValue<VolumeSampleT>,
        //     OctTreeTGrouped & VolumeSamplingSubdivisionSamplesValuesGrouped<VolumeSampleT>,
        //     OctTreeLayer | VolumeSamplingSubdivisionSamplesLayer<VolumeSampleT>,
        //     OctTreeLayersGrouped & VolumeSamplingSubdivisionSamplesLayersGrouped<VolumeSampleT>,
        //     OctTreesGrouped & VolumeSamplingSubdivisionSamplesOctTreesGrouped<VolumeSampleT>
        // >
        OctTreeSubdividingProcessing<
                IndicesT,
                OctTreeGroups,
                OctTreeT,
                OctTreeTGrouped,
                OctTreeLayer,
                OctTreeLayersGrouped,
                OctTreesGrouped
            > &
        OctTreeSubdividingProcessing<
                IndicesT,
                VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT>,
                VolumeSamplingSubdivisionSamplesValue<VolumeSampleT>,
                VolumeSamplingSubdivisionSamplesValuesGrouped<VolumeSampleT>,
                VolumeSamplingSubdivisionSamplesLayer<VolumeSampleT>,
                VolumeSamplingSubdivisionSamplesLayersGrouped<VolumeSampleT>,
                VolumeSamplingSubdivisionSamplesOctTreesGrouped<VolumeSampleT>
            >
    )
}

// type OctTreeGroups1 = { a1: MultiObjectsGroupsTemplateLeaf }
// type OctTreeT1 = string
// type OctTreeTGrouped1 = { a1: string }
// type OctTreeLayer1 = string[]
// type OctTreeLayersGrouped1 = { a1: string[] }
// type OctTreesGrouped1 = OctTreesTemplated<OctTreeGroups1, OctTreeT1, OctTreeTGrouped1, OctTreeLayer1, OctTreeLayersGrouped1>
// type VolumeSampleT1 = VolumeSample
// type VolumeSampleOctTreesGrouped1 = VolumeSamplingSubdivisionSamplesOctTreesGrouped<VolumeSampleT1>
// type Constraint1 = OctTreesTemplated<
//     OctTreeGroups1 & VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT1>,
//     OctTreeT1 | VolumeSamplingSubdivisionSamplesValue<VolumeSampleT1>,
//     OctTreeTGrouped1 & VolumeSamplingSubdivisionSamplesValuesGrouped<VolumeSampleT1>,
//     OctTreeLayer1 | VolumeSamplingSubdivisionSamplesLayer<VolumeSampleT1>,
//     OctTreeLayersGrouped1 & VolumeSamplingSubdivisionSamplesLayersGrouped<VolumeSampleT1>
// >
// let c!: Constraint1
// c.samples.layers[0][0].gradient

// let a!: VolumeSampleOctTreesGrouped1
// let b!: OctTreesGrouped1
// a = c
// b = c

// let d!: OctTreesGrouped1 & VolumeSampleOctTreesGrouped1
// d = c
// c = d

export type VolumeSamplingSubdivisionProcessingContext<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        OctTreeGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        OctTreeT = any,
        OctTreeTGrouped extends
            MultiObjectsGroupsMapped<
                    OctTreeGroups,
                    OctTreeT
                > =
            MultiObjectsGroupsMapped<
                    OctTreeGroups,
                    OctTreeT
                >,
        OctTreeLayer extends ArrayLike<OctTreeT> = ArrayLike<OctTreeT>,
        OctTreeLayersGrouped extends
            // MultiObjectsGroupsMapped<
            //         OctTreeGroups,
            //         OctTreeLayer
            //     > &
            ArrayLikeTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped
                > =
            // MultiObjectsGroupsMapped<
            //         OctTreeGroups,
            //         OctTreeLayer
            //     > &
            ArrayLikeTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped
                >,
        OctTreesGrouped extends
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped
                > =
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped
                >,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<VolumeSampleProcessingContextT> =
            VolumeProcessingContext<VolumeSampleProcessingContextT>
    > =
    WithEncapsulating<VolumeProcessingContextT> & {
        [SpaceKey]: OctTreeSpace<IndicesT>
        [VolumeSamplingContextKey]: VolumeSamplingContextT
    } &
    // OctTreeSubdivisionProcessingContext<
    //         IndicesT,
    //         OctTreeGroups & VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT>,
    //         OctTreeT | VolumeSamplingSubdivisionSamplesValue<VolumeSampleT>,
    //         OctTreeTGrouped & VolumeSamplingSubdivisionSamplesValuesGrouped<VolumeSampleT>,
    //         OctTreeLayer | VolumeSamplingSubdivisionSamplesLayer<VolumeSampleT>,
    //         OctTreeLayersGrouped & VolumeSamplingSubdivisionSamplesLayersGrouped<VolumeSampleT>,
    //         OctTreesGrouped & VolumeSamplingSubdivisionSamplesOctTreesGrouped<VolumeSampleT>
    //     >
    OctTreeSubdivisionProcessingContext<
            IndicesT,
            OctTreeGroups,
            OctTreeT,
            OctTreeTGrouped,
            OctTreeLayer,
            OctTreeLayersGrouped,
            OctTreesGrouped
        > &
    OctTreeSubdivisionProcessingContext<
            IndicesT,
            VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesValue<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesValuesGrouped<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesLayer<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesLayersGrouped<VolumeSampleT>,
            VolumeSamplingSubdivisionSamplesOctTreesGrouped<VolumeSampleT>
        >

// type A5 = VolumeSamplingSubdivisionProcessingContext<
//     Uint32Array,
//     { a: MultiObjectsGroupsTemplateLeaf },
//     string,
//     { a: string },
//     string[],
//     {a : string[]},
//     { a: OctTree<string, string[]> },
//     VolumeLocation,
//     VolumeSample
//     // VolumeSamplingContextT,
//     // VolumeSampleProcessingContextT
//     // VolumeProcessingContextT
// >

// let a5!: A5
// let a6 = a5[SubdivisionKey]

// let b2!: VolumeSamplingSubdivisionProcessingContext
// b2[VolumeSamplingContextKey]

export interface VolumeProcessingContextWithSampling<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        OctTreeGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        OctTreeT = any,
        OctTreeTGrouped extends
            MultiObjectsGroupsMapped<
                    OctTreeGroups,
                    OctTreeT
                > =
            MultiObjectsGroupsMapped<
                    OctTreeGroups,
                    OctTreeT
                >,
        OctTreeLayer extends ArrayLike<OctTreeT> = ArrayLike<OctTreeT>,
        OctTreeLayersGrouped extends
            // MultiObjectsGroupsMapped<
            //         OctTreeGroups,
            //         OctTreeLayer
            //     > &
            ArrayLikeTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped
                > =
            // MultiObjectsGroupsMapped<
            //         OctTreeGroups,
            //         OctTreeLayer
            //     > &
            ArrayLikeTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped
                >,
        OctTreesGrouped extends
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped
                > =
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped
                >,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        // VolumeProcessingContextEncapsulatingT extends
        //     VolumeProcessingContext<VolumeSampleProcessingContextT> =
        //     VolumeProcessingContext<VolumeSampleProcessingContextT>,
        VolumeSamplingSubdivisionProcessingContextT extends
            VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT//,
                    // VolumeProcessingContextEncapsulatingT
                > =
            VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT//,
                    // VolumeProcessingContextEncapsulatingT
                >
    > extends
    VolumeProcessingContext<VolumeSampleProcessingContextT> {
    [SamplingKey]: /*RemoveEmptyStructs<*/Omit<
        OctTreeSubdividingProcessingContextForSubdivisionProcessingContext<
            IndicesT,
            OctTreeGroups,
            OctTreeT,
            OctTreeTGrouped,
            OctTreeLayer,
            OctTreeLayersGrouped,
            OctTreesGrouped,
            VolumeSamplingSubdivisionProcessingContextT
            // MultiObjectsGroupsOmitted<
            //     VolumeSamplingSubdivisionSamplesGroups<VolumeSampleT>,
            //     VolumeSamplingSubdivisionProcessingContextT
            // >
        >,
        typeof EncapsulatingKey | typeof SpaceKey
    >//>
}

// let b!: VolumeProcessingContextWithSampling<Uint32Array, { a: MultiObjectsGroupsTemplateLeaf }>
// let c = b[SamplingKey]
// let b2!: VolumeProcessingWithSampling<Uint32Array>
// b2[SamplingKey].extraLocationParameters

// type MyOctContext<Groups extends MultiObjectsGroupsTemplate> =
//     Omit<
//         VolumeSamplingSubdivisionProcessingContext<
//             Uint32Array,
//             Groups
//         >,
//         typeof EncapsulatingKey
//     >

// type Groups1 = { a: MultiObjectsGroupsTemplateLeaf }
// let a!: MyOctContext<Groups1>
// let b: OctTreesTemplated<Groups1> = a

export interface VolumeSamplingSubdivisionProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        OctTreeGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        OctTreeT = any,
        OctTreeTGrouped extends
            MultiObjectsGroupsMapped<
                    OctTreeGroups,
                    OctTreeT
                > =
            MultiObjectsGroupsMapped<
                    OctTreeGroups,
                    OctTreeT
                >,
        OctTreeLayer extends ArrayLike<OctTreeT> = ArrayLike<OctTreeT>,
        OctTreeLayersGrouped extends
            // MultiObjectsGroupsMapped<
            //         OctTreeGroups,
            //         OctTreeLayer
            //     > &
            ArrayLikeTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped
                > =
            // MultiObjectsGroupsMapped<
            //         OctTreeGroups,
            //         OctTreeLayer
            //     > &
            ArrayLikeTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped
                >,
        OctTreesGrouped extends
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped
                > =
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped
                >,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > =
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                >,
        SubdivisionProcessingT extends
            VolumeSamplingSubdivisionProcessing<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT
                > =
            VolumeSamplingSubdivisionProcessing<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT
                >,
        SubdivisionProcessingContextT extends
            VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                > =
            VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                >
    > extends
    OctTreeSubdivisionProcessor<
        IndicesT,
        OctTreeGroups,
        OctTreeT,
        OctTreeTGrouped,
        OctTreeLayer,
        OctTreeLayersGrouped,
        OctTreesGrouped,
        SubdivisionProcessingT,
        SubdivisionProcessingContextT
    > {
}