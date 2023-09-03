// import { IndicesTypedArray } from "../../utils/indices-array.js";
// import { OctTreeReferences, OctTreeReferencesOctTreeGroups, OctTreeReferencesOctTreeLayer, OctTreeReferencesOctTreeLayersGrouped, OctTreeReferencesOctTreeValue, OctTreeReferencesOctTreeValuesGrouped, OctTreeReferencesOctTreesGrouped } from "./references.js";
// import { AdjacentDirection, DiagonalDirection, TriagonalDirection, Axis, Direction, Quadrant, OctTreeCell } from "./address.js";
// import { Subdividable, SubdivisionReferences } from "./subdivision.js";
// import { LayerLocalIndex } from "./octtree.js";

// export type OctTreeNeighborsOctTreeGroups = {
//     /** grouped 6 elements at a time, by {@link AdjacentDirection} = (2 * adjacent {@link Axis}) + ({@link Direction}) */
//     adjacent: OctTreeReferencesOctTreeGroups

//     /** grouped 12 elements at time, by {@link DiagonalDirection} = (4 * plane {@link Axis}) + quadrant ({@link Quadrant}) */
//     diagonal: OctTreeReferencesOctTreeGroups

//     /** grouped 8 elements at time, by {@link TriagonalDirection} = {@link OctTreeCell} */
//     triagonal: OctTreeReferencesOctTreeGroups
// }

// export type OctTreeNeighborsOctTreeValue = OctTreeReferencesOctTreeValue
// export type OctTreeNeighborsOctTreeValuesGrouped = {
//     /** grouped 6 elements at a time, by adjacent direction = (2 * adjacent {@link Axis}) + ({@link Direction}) */
//     adjacent: OctTreeReferencesOctTreeValuesGrouped

//     /** grouped 12 elements at time, by diagonal direction = (4 * plane {@link Axis}) + quadrant ({@link Quadrant}) */
//     diagonal: OctTreeReferencesOctTreeValuesGrouped

//     /** grouped 8 elements at time, by triagonal direction = {@link OctTreeCell} */
//     triagonal: OctTreeReferencesOctTreeValuesGrouped
// }

// export type OctTreeNeighborsOctTreeLayer<IndicesT extends IndicesTypedArray = IndicesTypedArray> = OctTreeReferencesOctTreeLayer<IndicesT>
// export type OctTreeNeighborsOctTreeLayersGrouped<IndicesT extends IndicesTypedArray = IndicesTypedArray> = {
//     /** grouped 6 elements at a time, by adjacent direction = (2 * adjacent {@link Axis}) + ({@link Direction}) */
//     adjacent: OctTreeReferencesOctTreeLayersGrouped<IndicesT>

//     /** grouped 12 elements at time, by diagonal direction = (4 * plane {@link Axis}) + quadrant ({@link Quadrant}) */
//     diagonal: OctTreeReferencesOctTreeLayersGrouped<IndicesT>

//     /** grouped 8 elements at time, by triagonal direction = {@link OctTreeCell} */
//     triagonal: OctTreeReferencesOctTreeLayersGrouped<IndicesT>
// }

// export type OctTreeNeighborsOctTreesGrouped<IndicesT extends IndicesTypedArray = IndicesTypedArray> = {
//     /** grouped 6 elements at a time, by adjacent direction = (2 * adjacent {@link Axis}) + ({@link Direction}) */
//     adjacent: OctTreeReferencesOctTreesGrouped<IndicesT>

//     /** grouped 12 elements at time, by diagonal direction = (4 * plane {@link Axis}) + quadrant ({@link Quadrant}) */
//     diagonal: OctTreeReferencesOctTreesGrouped<IndicesT>

//     /** grouped 8 elements at time, by triagonal direction = {@link OctTreeCell} */
//     triagonal: OctTreeReferencesOctTreesGrouped<IndicesT>
// }

// export class OctTreeNeighbors<IndicesT extends IndicesTypedArray = IndicesTypedArray>
//     implements Subdividable<
//         OctTreeNeighborsOctTreeGroups,
//         OctTreeNeighborsOctTreeValue,
//         OctTreeNeighborsOctTreeValuesGrouped,
//         OctTreeNeighborsOctTreeLayer<IndicesT>,
//         OctTreeNeighborsOctTreeLayersGrouped<IndicesT>
//     > {
//     readonly data = {
//         adjacent: new OctTreeReferences(this.subdivision.typedArray),
//         diagonal: new OctTreeReferences(this.subdivision.typedArray),
//         triagonal: new OctTreeReferences(this.subdivision.typedArray)
//     }

//     constructor(public readonly subdivision: SubdivisionReferences<IndicesT>) {

//     }

//     adjacent(adjacent_direction: AdjacentDirection): LayerLocalIndex {

//     }

//     diagonal(
//             axis0: Axis, axis1: Axis,
//             direction0: Direction, direction1: Direction
//         ): LayerLocalIndex {

//     }

//     subdivide(newVoxels: number): OctTreeNeighborsOctTreeLayersGrouped<IndicesT> {

//     }
// }
export { }