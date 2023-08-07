import { IndicesTypedArray } from "../../utils/indices-array.js";
import { MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsMapped, MultiObjectsGroupsOmitted, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, groupKinds, mapGroups } from "../trees/index.js";
import { ProcessingPair, Processor, ProcessorInitialization } from "../processing/processor.js";
import { GraphProcessor } from "../processing/processors/graph.js";
import { OctTree } from "./octtree.js";
import { OctTreeSubdivisionSettings, SubdivisionAdviceGroups, SubdivisionAdviceLayer, SubdivisionAdviceLayerConstructor, SubdivisionAdviceOctTrees, SubdivisionAdviceT, SubdivisionReferences } from "./subdivision.js";
import { ArrayLikeTemplated, OctTreesTemplated } from "./templated.js";
import { TypedArrayOctTree } from "./typed-array.js";
import { MultiObjectsGroupsOverwritten, groupsProxyOverwritten } from "../trees/groups-proxy.js";
import { groupsFromPaths } from "../trees/index.js";

export const OctTreeSubdividingGroupsKindKey = Symbol('group-kind:octtree-subdividing')
export type OctTreeSubdividingGroupsKind = {
    [OctTreeSubdividingGroupsKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const OctTreeSubdividingGroupsKindTemplate: OctTreeSubdividingGroupsKind = {
    [OctTreeSubdividingGroupsKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const SubdivisionKey = Symbol("subdivision")

export type OctTreeSubdivisionProcessing<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
        Layer extends ArrayLike<T> = ArrayLike<T>,
        LayersGrouped extends
            ArrayLikeTemplated<Groups, T, TGrouped> = //& ArrayLikeTemplated<Groups, T, TGrouped> =
            ArrayLikeTemplated<Groups, T, TGrouped> //& ArrayLikeTemplated<Groups, T, TGrouped>
    > = {
        [SubdivisionKey]: SubdivisionAdviceOctTrees
    } &
    LayersGrouped

// type OctTreeGroups1 = { a1: MultiObjectsGroupsTemplateLeaf }
// type OctTreeT1 = string
// type OctTreeTGrouped1 = { a1: string }
// type OctTreeLayer1 = string[]
// type OctTreeLayersGrouped1 = { a1: string[] }
// type A = OctTreeSubdivisionProcessing<
//         OctTreeGroups1,
//         OctTreeT1,
//         OctTreeTGrouped1,
//         OctTreeLayer1,
//         OctTreeLayersGrouped1
//     >

export type OctTreeSubdivisionProcessingContext<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
        Layer extends ArrayLike<T> = ArrayLike<T>,
        LayersGrouped extends
            ArrayLikeTemplated<Groups, T, TGrouped> = //& ArrayLikeTemplated<Groups, T, TGrouped> =
            ArrayLikeTemplated<Groups, T, TGrouped>, //& ArrayLikeTemplated<Groups, T, TGrouped>,
        OctTreesGrouped extends
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped> =
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped>
    > =
    OctTreeSubdividingProcessing<IndicesT, Groups, T, TGrouped, Layer, LayersGrouped, OctTreesGrouped> &
    MultiObjectsGroupsProcessingContext<Groups, OctTreeSubdividingGroupsKind>

export interface OctTreeSubdivisionProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
        Layer extends ArrayLike<T> = ArrayLike<T>,
        LayersGrouped extends
            ArrayLikeTemplated<Groups, T, TGrouped> = // & ArrayLikeTemplated<Groups, T, TGrouped> =
            ArrayLikeTemplated<Groups, T, TGrouped>, // & ArrayLikeTemplated<Groups, T, TGrouped>,
        OctTreesGrouped extends
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped> =
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped>,
        SubdivisionProcessingT extends
            OctTreeSubdivisionProcessing<
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped
                > =
            OctTreeSubdivisionProcessing<
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped
                >,
        SubdivisionProcessingContextT extends
            OctTreeSubdivisionProcessingContext<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped
                > =
            OctTreeSubdivisionProcessingContext<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped
                >
    > extends
    Processor<
        SubdivisionProcessingT,
        SubdivisionProcessingContextT
    > { }

export type OctTreeSubdividingProcessing<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
        Layer extends ArrayLike<T> = ArrayLike<T>,
        LayersGrouped extends
            ArrayLikeTemplated<Groups, T, TGrouped> = //& ArrayLikeTemplated<Groups, T, TGrouped> =
            ArrayLikeTemplated<Groups, T, TGrouped>, //& ArrayLikeTemplated<Groups, T, TGrouped>,
        OctTreesGrouped extends
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped> =
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped>
    > = {
        [SubdivisionKey]: SubdivisionReferences<IndicesT>
    } &
    OctTreesGrouped

export interface OctTreeSubdividingProcessingContext<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    > extends
    MultiObjectsGroupsProcessingContext<Groups, OctTreeSubdividingGroupsKind> {
    [SubdivisionKey]: OctTreeSubdivisionSettings<IndicesT>
}

export type OctTreeSubdivisionProcessingForSubdividingProcessing<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
        Layer extends ArrayLike<T> = ArrayLike<T>,
        LayersGrouped extends
            ArrayLikeTemplated<Groups, T, TGrouped> = // & ArrayLikeTemplated<Groups, T, TGrouped> =
            ArrayLikeTemplated<Groups, T, TGrouped>, // & ArrayLikeTemplated<Groups, T, TGrouped>,
        OctTreesGrouped extends
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped> =
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped>,
        SubdividingProcessingT extends
            OctTreeSubdividingProcessing<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped
                > =
            OctTreeSubdividingProcessing<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped
                >
    > =
    MultiObjectsGroupsOverwritten<
        Groups & { [SubdivisionKey]: MultiObjectsGroupsTemplateLeaf },
        SubdividingProcessingT,
        OctTreeSubdivisionProcessing<Groups, T, TGrouped, Layer, LayersGrouped>
    >

// type SubdividingP1 = OctTreeSubdividingProcessing<
//     Uint32Array,
//     {
//         a: MultiObjectsGroupsTemplateLeaf,
//         b: MultiObjectsGroupsTemplateLeaf,
//     },
//     number,
//     {
//         a: number,
//         b: number,
//     },
//     Float32Array | Float64Array,
//     {
//         a: Float32Array,
//         b: Float64Array,
//     },
//     {
//         a: OctTree<number, Float32Array>,
//         b: OctTree<number, Float64Array>,
//     }
// >

// type SubdividingSubdivisionP1 = OctTreeSubdivisionProcessingForSubdividingProcessing<
//     Uint32Array,
//     {
//         a: MultiObjectsGroupsTemplateLeaf,
//         b: MultiObjectsGroupsTemplateLeaf,
//     },
//     number,
//     {
//         a: number,
//         b: number,
//     },
//     Float32Array | Float64Array,
//     {
//         a: Float32Array,
//         b: Float64Array,
//     },
//     {
//         a: OctTree<number, Float32Array>,
//         b: OctTree<number, Float64Array>,
//     },
//     SubdividingP1
// >

// type SubdivisionP1 = OctTreeSubdivisionProcessing<
//     {
//         a: MultiObjectsGroupsTemplateLeaf,
//         b: MultiObjectsGroupsTemplateLeaf,
//     },
//     number,
//     {
//         a: number,
//         b: number,
//     },
//     Float32Array | Float64Array,
//     {
//         a: Float32Array,
//         b: Float64Array,
//     }
// >

// let a1!: SubdividingP1
// let a2!: SubdivisionP1
// let a3!: SubdividingSubdivisionP1

// let c1 = a2[SubdivisionKey]
// c1.recommendation
// let c2 = a3[SubdivisionKey]
// c2.recommendation

export type OctTreeSubdividingProcessingForSubdivisionProcessing<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
        Layer extends ArrayLike<T> = ArrayLike<T>,
        LayersGrouped extends
            ArrayLikeTemplated<Groups, T, TGrouped> = // & ArrayLikeTemplated<Groups, T, TGrouped> =
            ArrayLikeTemplated<Groups, T, TGrouped>, // & ArrayLikeTemplated<Groups, T, TGrouped>,
        OctTreesGrouped extends
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped> =
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped>,
        SubdivisionProcessingT extends
            OctTreeSubdivisionProcessing<
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped
                > =
            OctTreeSubdivisionProcessing<
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped
                >
    > =
    MultiObjectsGroupsOverwritten<
        Groups & { [SubdivisionKey]: SubdivisionAdviceGroups },
        SubdivisionProcessingT,
        OctTreeSubdividingProcessing<IndicesT, Groups, T, TGrouped, Layer, LayersGrouped, OctTreesGrouped>
    >

export type OctTreeSubdivisionProcessingContextForSubdividingProcessing<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
        Layer extends ArrayLike<T> = ArrayLike<T>,
        LayersGrouped extends
            ArrayLikeTemplated<Groups, T, TGrouped> = // & ArrayLikeTemplated<Groups, T, TGrouped> =
            ArrayLikeTemplated<Groups, T, TGrouped>, // & ArrayLikeTemplated<Groups, T, TGrouped>,
        OctTreesGrouped extends
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped> =
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped>,
        SubdividingProcessingContextT extends
            OctTreeSubdividingProcessingContext<
                    IndicesT,
                    Groups
                > =
            OctTreeSubdividingProcessingContext<
                    IndicesT,
                    Groups
                >
    > =
    SubdividingProcessingContextT &
    OctTreeSubdivisionProcessingContext<
            IndicesT,
            Groups,
            T,
            TGrouped,
            Layer,
            LayersGrouped,
            OctTreesGrouped
        >

export type OctTreeSubdividingProcessingContextForSubdivisionProcessingContext<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
        Layer extends ArrayLike<T> = ArrayLike<T>,
        LayersGrouped extends
            ArrayLikeTemplated<Groups, T, TGrouped> = // & ArrayLikeTemplated<Groups, T, TGrouped> =
            ArrayLikeTemplated<Groups, T, TGrouped>, // & ArrayLikeTemplated<Groups, T, TGrouped>,
        OctTreesGrouped extends
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped> =
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped>,
        SubdivisionProcessingContextT extends
            OctTreeSubdivisionProcessingContext<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped
                > =
            OctTreeSubdivisionProcessingContext<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped
                >
    > =
    MultiObjectsGroupsOverwritten<
            { [SubdivisionKey]: MultiObjectsGroupsTemplateLeaf },
            MultiObjectsGroupsOmitted<
                    Groups,
                    SubdivisionProcessingContextT
                >,
            OctTreeSubdividingProcessingContext<
                    IndicesT,
                    Groups
                >
        >

//TODO: local and global IndicesT could be distinguished for small memory saved

const OctTreeSubdividingProcessorPrivateKey = Symbol("octtree-subdividing-processor")
interface OctTreeSubdividingProcessingContextPrivate<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
        Layer extends ArrayLike<T> = ArrayLike<T>,
        LayersGrouped extends
            ArrayLikeTemplated<Groups, T, TGrouped> = // & ArrayLikeTemplated<Groups, T, TGrouped> =
            ArrayLikeTemplated<Groups, T, TGrouped>, // & ArrayLikeTemplated<Groups, T, TGrouped>,
        OctTreesGrouped extends
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped> =
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped>,
        SubdividingProcessingT extends
            OctTreeSubdividingProcessing<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped
                > =
            OctTreeSubdividingProcessing<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped
                >,
        SubdividingProcessingContextT extends
            OctTreeSubdividingProcessingContext<
                    IndicesT,
                    Groups
                > =
            OctTreeSubdividingProcessingContext<
                    IndicesT,
                    Groups
                >
    > {
    [OctTreeSubdividingProcessorPrivateKey]: {
        graph: GraphProcessor<
            OctTreeSubdivisionProcessingForSubdividingProcessing<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped,
                    SubdividingProcessingT
                >,
            OctTreeSubdividingProcessingContext<
                    IndicesT,
                    Groups
                >
        >
    }
}

export class OctTreeSubdividingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
        Layer extends ArrayLike<T> = ArrayLike<T>,
        LayersGrouped extends
            ArrayLikeTemplated<Groups, T, TGrouped> = // & ArrayLikeTemplated<Groups, T, TGrouped> =
            ArrayLikeTemplated<Groups, T, TGrouped>, // & ArrayLikeTemplated<Groups, T, TGrouped>,
        OctTreesGrouped extends
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped> =
            OctTreesTemplated<Groups, T, TGrouped, Layer, LayersGrouped>,
        SubdividingProcessingT extends
            OctTreeSubdividingProcessing<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped
                > =
            OctTreeSubdividingProcessing<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped
                >,
        SubdividingProcessingContextT extends
            OctTreeSubdividingProcessingContext<
                    IndicesT,
                    Groups
                > =
            OctTreeSubdividingProcessingContext<
                    IndicesT,
                    Groups
                >,
        SubdivisionProcessingT extends
            OctTreeSubdivisionProcessingForSubdividingProcessing<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped,
                    SubdividingProcessingT
                > =
            OctTreeSubdivisionProcessingForSubdividingProcessing<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped,
                    SubdividingProcessingT
                >,
        SubdivisionProcessingContextT extends
            OctTreeSubdivisionProcessingContextForSubdividingProcessing<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped,
                    SubdividingProcessingContextT
                > =
            OctTreeSubdivisionProcessingContextForSubdividingProcessing<
                    IndicesT,
                    Groups,
                    T,
                    TGrouped,
                    Layer,
                    LayersGrouped,
                    OctTreesGrouped,
                    SubdividingProcessingContextT
                >
    > implements
    Processor<SubdividingProcessingT, SubdividingProcessingContextT> {
    constructor(
        public readonly processors: OctTreeSubdivisionProcessor<
                IndicesT,
                Groups,
                T,
                TGrouped,
                Layer,
                LayersGrouped,
                OctTreesGrouped,
                SubdivisionProcessingT,
                SubdivisionProcessingContextT
            >[],
        //TODO: change to protected method
        public readonly subdivision_preprocessor: (
                subdivision: ProcessingPair<
                    OctTreeSubdivisionProcessingForSubdividingProcessing<
                            IndicesT,
                            Groups,
                            T,
                            TGrouped,
                            Layer,
                            LayersGrouped,
                            OctTreesGrouped,
                            SubdividingProcessingT
                        >,
                    OctTreeSubdivisionProcessingContextForSubdividingProcessing<
                            IndicesT,
                            Groups,
                            T,
                            TGrouped,
                            Layer,
                            LayersGrouped,
                            OctTreesGrouped,
                            SubdividingProcessingContextT
                        >
                >
            ) => ProcessingPair<SubdivisionProcessingT, SubdivisionProcessingContextT> =
            subdivision => subdivision as ProcessingPair<SubdivisionProcessingT, SubdivisionProcessingContextT> 
    ) { }
    
    init(context: SubdividingProcessingContextT): ProcessorInitialization {
        type ContextPrivateT = OctTreeSubdividingProcessingContextPrivate<
            IndicesT,
            Groups,
            T,
            TGrouped,
            Layer,
            LayersGrouped,
            OctTreesGrouped,
            SubdividingProcessingT,
            SubdividingProcessingContextT
        >
            
        const context_private = context as unknown as ContextPrivateT

        const graph = new GraphProcessor(this.processors)

        context_private[OctTreeSubdividingProcessorPrivateKey] = {
            graph
        }

        const initialization = graph.init(context)
        
        return {
            ...initialization,
            connections: {
                inputs: initialization.connections.inputs,
                outputs: [
                    ...initialization.connections.outputs,
                    [SubdivisionKey]
                ]
            }
        }
    }

    process(item: SubdividingProcessingT, context: SubdividingProcessingContextT): void {
        type ContextPrivateT = OctTreeSubdividingProcessingContextPrivate<
            IndicesT,
            Groups,
            T,
            TGrouped,
            Layer,
            LayersGrouped,
            OctTreesGrouped,
            SubdividingProcessingT,
            SubdividingProcessingContextT
        >

        const context_private = context as unknown as ContextPrivateT
        const graph = context_private[OctTreeSubdividingProcessorPrivateKey].graph
        
        const settings = context[SubdivisionKey]

        const octtree_groups = [...groupKinds(context, OctTreeSubdividingGroupsKindTemplate)].map(({ group }) => group)
        
        const subdivision_advice_recommendation = new TypedArrayOctTree<SubdivisionAdviceT, SubdivisionAdviceLayer>(SubdivisionAdviceLayerConstructor)

        const subdivision_advice: SubdivisionAdviceOctTrees = {
            recommendation: subdivision_advice_recommendation,
            // regret: new TypedArrayOctTree(Uint8Array),
        }

        const subdivision_references = new SubdivisionReferences<IndicesT>(settings.indicesType as any)
        item[SubdivisionKey] = subdivision_references

        type PreSubdivisionProcessingT = OctTreeSubdivisionProcessingForSubdividingProcessing<
                IndicesT,
                Groups,
                T,
                TGrouped,
                Layer,
                LayersGrouped,
                OctTreesGrouped,
                SubdividingProcessingT
            >
        
        type PreSubdivisionProcessingContextT = OctTreeSubdivisionProcessingContextForSubdividingProcessing<
                IndicesT,
                Groups,
                T,
                TGrouped,
                Layer,
                LayersGrouped,
                OctTreesGrouped,
                SubdividingProcessingContextT
            >

        type ProxyGroups = {
            [SubdivisionKey]: MultiObjectsGroupsTemplateLeaf
        } & Groups
        
        const proxyGroupsTemplate = groupsFromPaths<ProxyGroups>([
            [SubdivisionKey],
            ...octtree_groups.map(({ path }) => path)
        ])

        const subdivision_context_pre = groupsProxyOverwritten(
            proxyGroupsTemplate,
            context as any,
            item
        ) as any as PreSubdivisionProcessingContextT
        
        const subdivision_processing_overwriting = {
            [SubdivisionKey]: subdivision_advice
        } as OctTreeSubdivisionProcessing<Groups, T, TGrouped, Layer, LayersGrouped>

        const subdivision_processing_pre = groupsProxyOverwritten(
            proxyGroupsTemplate,
            item,
            subdivision_processing_overwriting
        ) as PreSubdivisionProcessingT

        const { item: subdivision_processing, context: subdivision_context } = this.subdivision_preprocessor({ item: subdivision_processing_pre, context: subdivision_context_pre })

        // each processor is expected to update the processing for its new layer
        // each time it process()'s
        // It should also add its oct tree to the context during its first update

        for (let depth = 0; depth < settings.max_depth; depth++) {
            for (const octtree_group of octtree_groups)
                octtree_group.delete(subdivision_processing)

            //@ts-ignore
            graph.process(subdivision_processing, subdivision_context)

            if (subdivision_references.subdivide(subdivision_advice, settings) === 0)
                break
            
            subdivision_advice_recommendation.subdivide(subdivision_references.layer_sizes.at(-1)!)
        }

        for (const octtree_group of octtree_groups) {
            const octtree = octtree_group.get(subdivision_context) as OctTree
            octtree_group.set(item, octtree)
        }

        item[SubdivisionKey] = subdivision_references
    }
}