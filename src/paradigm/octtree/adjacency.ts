import { IndicesTypedArray } from "../../utils/indices-array.js";
import { AdjacentDirection, Axis, Direction, OctTreeAddress, OctTreeCell, octTreeCellsByDirection } from "./address.js";
import { LayerLocalIndex } from "./octtree.js";
import { OctTreeReferences, OctTreeReferencesOctTreeLayersGrouped } from "./references.js";
import { SubdivisionReferences } from "./subdivision.js";
import { TypedArrayOctTree } from "./typed-array.js";

export class SubdivisionAdjacency<IndicesT extends IndicesTypedArray = IndicesTypedArray> {
    /**
     * references to adjacent cells
     */
    readonly references = new OctTreeReferences<IndicesT>(this.subdivision.typedArray)

    /**
     * layout for indices in {@link references}, grouped 6 elements at a time,
     * one per adjacent direction
     */
    readonly layout: {
        readonly offset: TypedArrayOctTree<number, IndicesT>
        readonly count: TypedArrayOctTree<number, Uint16Array | Uint32Array>
    }

    readonly layers_count: ReturnType<SubdivisionAdjacency<IndicesT>["layer_count_adjacent"]>[]

    constructor(
            public readonly subdivision: SubdivisionReferences<IndicesT>
        ) {
        this.layers_count = new Array(subdivision.depth).fill(0).map((_, layer) => this.layer_count_adjacent(layer + 1))
        const max_adjacent = Math.max(...this.layers_count.map(({ max_adjacent }) => max_adjacent))

        this.layout = {
            offset: new TypedArrayOctTree<number, IndicesT>(subdivision.typedArray),
            count: new TypedArrayOctTree(max_adjacent < (2 ** 16) ? Uint16Array : Uint32Array)
        }

        this.compute_references()
    }

    private compute_references() {
        this.references.subdivide(0)
        this.layout.offset.subdivide(0)
        this.layout.count.subdivide(0)

        for (let layer = 1; layer <= this.subdivision.depth; layer++)
            this.layer_identify_adjacent(layer)
    }

    private layer_count_adjacent(layer: number) {
        const references_parents_layer = this.subdivision.references.parents.layers[layer - 1]
        const address: OctTreeAddress = new Array(layer)

        let neighbors = 0
        let max_adjacent = 0

        for (let familyIndex = 0; familyIndex < references_parents_layer.length; familyIndex++) {
            const parent_localIndex = references_parents_layer[familyIndex]
            this.subdivision.address(layer - 1, parent_localIndex, address)

            for (let subcell = 0; subcell < 8; subcell++) {
                address[layer - 1] = <OctTreeCell>subcell

                const adjacent = this.count_adjacent_cells(address)
                if (adjacent > max_adjacent)
                    max_adjacent = adjacent

                neighbors += adjacent
            }
        }

        return { neighbors, max_adjacent }
    }

    private layer_identify_adjacent(layer: number) {
        const { neighbors } = this.layers_count[layer - 1]

        const cell_count = this.subdivision.layer_sizes[layer]

        const result = this.references.subdivide(neighbors)

        const layout = {
            offset: this.layout.offset.subdivide(cell_count),
            count: this.layout.count.subdivide(cell_count)
        }

        const references_parents_layer = this.subdivision.references.parents.layers[layer - 1]
        const address: OctTreeAddress = new Array(layer)

        let offset = 0

        for (let familyIndex = 0; familyIndex < references_parents_layer.length; familyIndex++) {
            const parent_localIndex = references_parents_layer[familyIndex]
            this.subdivision.address(layer - 1, parent_localIndex, address)
            const localIndex_offset = 8 * familyIndex

            for (let subcell = 0; subcell < 8; subcell++) {
                address[layer - 1] = <OctTreeCell>subcell
                const localIndex = localIndex_offset | subcell

                for (let adjacent_direction = 0; adjacent_direction < 6; adjacent_direction++) {
                    const newOffset = this.identify_adjacent_cells(address, result, offset, adjacent_direction)
                    const count = newOffset - offset

                    layout.offset[(6 * localIndex) + adjacent_direction] = offset
                    layout.count[(6 * localIndex) + adjacent_direction] = count

                    offset = newOffset
                }
            }
        }
    }

    private count_adjacent_cells(address: OctTreeAddress) {
        const layer = address.length - 1

        let count = 0
        for (let axis = 0; axis < 3; axis++) {
            for (let direction = 0; direction < 2; direction++) {
                const neighbor = this.subdivision.neighbor_adjacent(address, <Axis>axis, <Direction>direction, layer)
                if (neighbor) {
                    const subcells = octTreeCellsByDirection[axis][direction]
                    count += this.count_cells_with_subcell(
                        subcells[0],
                        subcells[1],
                        subcells[2],
                        subcells[3],
                        neighbor.layerLocalIndex
                    )
                }
            }
        }

        return count
    }

    private identify_adjacent_cells(
            address: OctTreeAddress,
            result: OctTreeReferencesOctTreeLayersGrouped<IndicesT>,
            offset: number,
            adjacent_direction: AdjacentDirection
        ): number {
        const layer = address.length - 1

        const axis = <Axis>(adjacent_direction >> 1)
        const direction = <Direction>(adjacent_direction & 1)

        const neighbor = this.subdivision.neighbor_adjacent(address, <Axis>axis, <Direction>direction, layer)
        if (neighbor) {
            const subcells = octTreeCellsByDirection[axis][direction]
            offset = this.identify_cells_with_subcell(
                subcells[0],
                subcells[1],
                subcells[2],
                subcells[3],
                result,
                offset,
                neighbor.layerLocalIndex
            )
        }

        return offset
    }

    private count_cells_with_subcell(
            subcell_0: OctTreeCell,
            subcell_1: OctTreeCell,
            subcell_2: OctTreeCell,
            subcell_3: OctTreeCell,
            cell: LayerLocalIndex,
        ): number {
        const subdivision_references_local_layers = this.subdivision.references.local.layers
        const subdivision_depth = this.subdivision.depth
        const subdivision_invalid = this.subdivision.invalid

        function recurse(layer: number, local_index: number): number {
            if (layer >= subdivision_depth)
                return 1
            else {
                const children_localIndex = subdivision_references_local_layers[layer][local_index]
                if (children_localIndex !== subdivision_invalid) {
                    const children_layer = layer + 1
                    return (
                        recurse(children_layer, children_localIndex + subcell_0) +
                        recurse(children_layer, children_localIndex + subcell_1) +
                        recurse(children_layer, children_localIndex + subcell_2) +
                        recurse(children_layer, children_localIndex + subcell_3)
                    )
                }
                else return 1
            }
        }

        return recurse(cell.layer, cell.local_index)
    }

    private identify_cells_with_subcell(
            subcell_0: OctTreeCell,
            subcell_1: OctTreeCell,
            subcell_2: OctTreeCell,
            subcell_3: OctTreeCell,
            result: OctTreeReferencesOctTreeLayersGrouped<IndicesT>,
            offset: number,
            cell: LayerLocalIndex,
        ): number {
        const subdivision_references_local_layers = this.subdivision.references.local.layers
        const subdivision_depth = this.subdivision.depth
        const subdivision_invalid = this.subdivision.invalid

        const result_layer = result.layers
        const result_localIndex = result.localIndices

        function recurse(layer: number, local_index: number) {
            if (layer >= subdivision_depth) {
                result_layer[offset] = layer
                result_localIndex[offset] = local_index
                offset++
            }
            else {
                const children_localIndex = subdivision_references_local_layers[layer][local_index]
                if (children_localIndex !== subdivision_invalid) {
                    const children_layer = layer + 1
                    recurse(children_layer, children_localIndex + subcell_0)
                    recurse(children_layer, children_localIndex + subcell_1)
                    recurse(children_layer, children_localIndex + subcell_2)
                    recurse(children_layer, children_localIndex + subcell_3)
                }
                else {
                    result_layer[offset] = layer
                    result_localIndex[offset] = local_index
                    offset++
                }
            }
        }

        recurse(cell.layer, cell.local_index)

        return offset
    }
}