import { MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplateLeaf } from "../trees/index.js"
import { OctTree } from "./octtree.js"

export type ArrayLikeTemplated<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
    > = {
        [K in keyof Groups]:
            Groups[K] extends MultiObjectsGroupsTemplate ?
                TGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], T> ?
                    ArrayLikeTemplated<Groups[K], T, TGrouped[K]> :
                    never :
                ArrayLike<TGrouped[K]>
    }

export type OctTreesTemplated<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
        Layer extends ArrayLike<T> = ArrayLike<T>,
        LayersGrouped extends
            ArrayLikeTemplated<Groups, T, TGrouped> = // & ArrayLikeTemplated<Groups, T, TGrouped> =
            ArrayLikeTemplated<Groups, T, TGrouped> // & ArrayLikeTemplated<Groups, T, TGrouped>
    > = {
        [K in keyof Groups]:
            Groups[K] extends MultiObjectsGroupsTemplate ?
                TGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], T> ?
                    LayersGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], Layer> & ArrayLikeTemplated<Groups[K], T, TGrouped[K]> ?
                        OctTreesTemplated<Groups[K], T, TGrouped[K], Layer, LayersGrouped[K]> :
                        never :
                    never :
                TGrouped[K] extends T ?
                    LayersGrouped[K] extends Layer & ArrayLike<TGrouped[K]> ?
                        OctTree<TGrouped[K], LayersGrouped[K]> :
                        never :
                    never
    }

// type Template1 = {
//     a: MultiObjectsGroupsTemplateLeaf
//     b: {
//         x: MultiObjectsGroupsTemplateLeaf
//         y: MultiObjectsGroupsTemplateLeaf
//     }
// }

// let trees!: OctTreesTemplated<
//         Template1,
//         number | string,
//         {
//             a: string,
//             b: {
//                 x: number,
//                 y: number
//             }
//         },
//         ArrayLike<number> | string[],
//         {
//             a: string[],
//             b: {
//                 x: Uint8Array,
//                 y: Float32Array
//             }
//         }
//     >
// trees.b.y