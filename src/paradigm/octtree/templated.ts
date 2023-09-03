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
        TGrouped extends any = any,
        LayersGrouped extends any = any
    > = {
    [K in keyof Groups]:
        K extends keyof TGrouped ? K extends keyof LayersGrouped ?
            Groups[K] extends MultiObjectsGroupsTemplate ?
                OctTreesTemplated<Groups[K], TGrouped[K], LayersGrouped[K]> :
                LayersGrouped[K] extends ArrayLike<TGrouped[K]> ?
                    OctTree<TGrouped[K], LayersGrouped[K]> :
                    never :
            never : never
}

// export type OctTreesTemplated<
//         Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         T = any,
//         TGrouped extends any = any,
//             // MultiObjectsGroupsMapped<Groups, T> =
//             // MultiObjectsGroupsMapped<Groups, T>,
//         Layer extends ArrayLike<T> = ArrayLike<T>,
//         LayersGrouped extends any = any
//             // ArrayLikeTemplated<Groups, T, TGrouped> =
//             // ArrayLikeTemplated<Groups, T, TGrouped>
//     > = {
//         [K in keyof Groups]:
//             Groups[K] extends MultiObjectsGroupsTemplate ?
//                 K extends keyof TGrouped ? K extends keyof LayersGrouped ? (
//                     TGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], T> ?
//                         LayersGrouped[K] extends (MultiObjectsGroupsMapped<Groups[K], Layer> & ArrayLikeTemplated<Groups[K], T, TGrouped[K]>) ?
//                             OctTreesTemplated<Groups[K], T, TGrouped[K], Layer, LayersGrouped[K]> :
//                             never :
//                         never :
//                     TGrouped[K] extends T ?
//                         LayersGrouped[K] extends Layer & ArrayLike<TGrouped[K]> ?
//                             OctTree<TGrouped[K], LayersGrouped[K]> :
//                             never :
//                         never
//                 ) :
//                 never : never
//     }

type Template1 = {
    a: MultiObjectsGroupsTemplateLeaf
    b: {
        w: MultiObjectsGroupsTemplateLeaf
        x: MultiObjectsGroupsTemplateLeaf
        y: MultiObjectsGroupsTemplateLeaf
    }
}

// let trees!: OctTreesTemplated<
//         Template1,
//         {
//             a: string,
//             b: {
//                 w: number
//                 x: number
//                 y: number
//             }
//         },
//         {
//             a: string[],
//             b: {
//                 w: number[]
//                 x: Uint8Array
//                 y: Float32Array
//             }
//         }
//     >

// // trees.b.
// trees.b.y