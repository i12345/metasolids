import { AdjacentDirection, Axis, Direction, octTreeAddressPrecedes, OctTreeCell, octTreeCellsByDirection, OctTreeCellsMask, OctTreeCellsMaskOctTree, OctTreeReferences, OctTreeReferencesOctTreeGroups, OctTreeReferencesOctTreeGroupsTemplate as OctTreeReferencesOctTreeGroupsTemplate, OctTreeReferencesOctTreeLayer as OctTreeReferencesOctTreeLayer, OctTreeReferencesOctTreeLayersGrouped as OctTreeReferencesOctTreeLayersGrouped, OctTreeReferencesOctTreesGrouped, OctTreeReferencesOctTreeValue as OctTreeReferencesOctTreeValue, OctTreeReferencesOctTreeValuesGrouped as OctTreeReferencesOctTreeValuesGrouped, OctTreesTemplated, octTreeSubcell, octTreeSubcellOpposite, OctTreeSubdivisionProcessing, OctTreeSubdivisionProcessingContext, OctTreeSubdivisionProcessor, SubdivisionKey, TypedArrayOctTree } from "./index.js";
import { ProcessorInitialization } from "../processing/processor.js";
import { allocNewFilledInvalid, IndicesTypedArray, TypedArrayConstructor } from "../../utils/index.js";
import { groupPaths } from "../trees/multi-objects-groups.js";
import { arrayCopy } from "../trees/index.js";

export const DualKey = Symbol("dual")

export type OctTreeWithDualGroups = {
    [DualKey]: {
        cells: {
            /**
             * references to sample oct tree
             * 8 elements per one dual cell
             * There will be many duplicates, but the dual graph
             * has even fewer elements than the samples oct tree.
             */
            vertices: OctTreeReferencesOctTreeGroups

            /**
             * references to dual cells from dual cells, grouped 6 elements at a time
             * TODO: optimize group size for last indices to not even pack invalid (-1) references
             */
            neighbors: OctTreeReferencesOctTreeGroups

            lookup: {
                /**
                 * references to dual cells from vertices, grouped 8 elements at a time
                 * references to dual cell with the vertex being a given corner
                 */
                corners: OctTreeReferencesOctTreeGroups
            }
        }
    }
}

export const OctTreeWithDualGroupsTemplate: OctTreeWithDualGroups = {
    [DualKey]: {
        cells: {
            /**
             * references to sample oct tree
             * 8 elements per one dual cell
             * There will be many duplicates, but the dual graph
             * has even fewer elements than the samples oct tree.
             */
            vertices: OctTreeReferencesOctTreeGroupsTemplate,

            /**
             * references to dual cells from dual cells, grouped 6 elements at a time
             */
            neighbors: OctTreeReferencesOctTreeGroupsTemplate,

            lookup: {
                /**
                 * references to dual cells from vertices, grouped 8 elements at a time
                 * references to dual cell with the vertex being a given corner
                 */
                corners: OctTreeReferencesOctTreeGroupsTemplate,
            }
        }
    }
}

export type OctTreeWithDualValue = OctTreeReferencesOctTreeValue
export type OctTreeWithDualValuesGrouped = {
    [DualKey]: {
        cells: {
            /**
             * references to sample oct tree
             * 8 elements per one dual cell
             * There will be many duplicates, but the dual graph
             * has even fewer elements than the samples oct tree.
             */
            vertices: OctTreeReferencesOctTreeValuesGrouped

            /**
             * references to dual cells from dual cells, grouped 6 elements at a time
             */
            neighbors: OctTreeReferencesOctTreeValuesGrouped

            lookup: {
                /**
                 * references to dual cells from vertices, grouped 8 elements at a time
                 * references to dual cell with the vertex being a given corner
                 */
                corners: OctTreeReferencesOctTreeValuesGrouped
            }
        }
    }
}

export type OctTreeWithDualLayer<IndicesT extends IndicesTypedArray = IndicesTypedArray> = OctTreeReferencesOctTreeLayer<IndicesT>
export type OctTreeWithDualLayersGrouped<IndicesT extends IndicesTypedArray = IndicesTypedArray> = {
    [DualKey]: {
        cells: {
            /**
             * references to sample oct tree
             * 8 elements per one dual cell
             * There will be many duplicates, but the dual graph
             * has even fewer elements than the samples oct tree.
             */
            vertices: OctTreeReferencesOctTreeLayersGrouped<IndicesT>

            /**
             * references to dual cells from dual cells, grouped 6 elements at a time
             */
            neighbors: OctTreeReferencesOctTreeLayersGrouped<IndicesT>

            lookup: {
                /**
                 * references to dual cells from vertices, grouped 8 elements at a time
                 * references to dual cell with the vertex being a given corner
                 */
                corners: OctTreeReferencesOctTreeLayersGrouped<IndicesT>
            }
        }
    }
}

export type OctTreeWithDualOctTreesGrouped<IndicesT extends IndicesTypedArray = IndicesTypedArray> = {
    [DualKey]: {
        cells: {
            /**
             * references to sample oct tree
             * 8 elements per one dual cell
             * There will be many duplicates, but the dual graph
             * has even fewer elements than the samples oct tree.
             */
            vertices: OctTreeReferences<IndicesT>

            /**
             * references to dual cells from dual cells, grouped 6 elements at a time
             */
            neighbors: OctTreeReferences<IndicesT>

            lookup: {
                /**
                 * references to dual cells from vertices, grouped 8 elements at a time
                 * references to dual cell with the vertex being a given corner
                 */
                corners: OctTreeReferences<IndicesT>
            }
        }
    }
}

// type OctTreeWithDualsTemplated<IndicesT extends IndicesTypedArray = IndicesTypedArray> =
//     OctTreesTemplated<
//             OctTreeWithDualGroups,
//             OctTreeWithDualValue,
//             OctTreeWithDualValuesGrouped,
//             OctTreeWithDualLayer<IndicesT>,
//             OctTreeWithDualLayersGrouped<IndicesT>
//         >

// let a!: OctTreeWithDualsTemplated<Uint32Array>
// let b!: OctTreeWithDualsGrouped<Uint32Array>
// a = b // ok
// b = a // err, expected

// let c: typeof b extends typeof a ? true : false = true

export type OctTreeWithDualSubdivisionProcessing<IndicesT extends IndicesTypedArray = IndicesTypedArray> =
    OctTreeSubdivisionProcessing<
            OctTreeWithDualGroups,
            OctTreeWithDualValuesGrouped,
            OctTreeWithDualLayersGrouped<IndicesT>
        >

export type OctTreeWithDualSubdivisionProcessingContext<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
    > =
    OctTreeSubdivisionProcessingContext<
            IndicesT,
            OctTreeWithDualGroups,
            OctTreeWithDualValuesGrouped,
            OctTreeWithDualLayersGrouped, //<IndicesT>,
            OctTreeWithDualOctTreesGrouped //<IndicesT>
        >

export class OctTreeWithDualSubdivisionProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
    > implements
    OctTreeSubdivisionProcessor<
            IndicesT,
            OctTreeWithDualGroups,
            OctTreeWithDualValuesGrouped,
            OctTreeWithDualLayersGrouped, /// <IndicesT>,
            OctTreeWithDualOctTreesGrouped // <IndicesT>
        > {
    init(context: OctTreeWithDualSubdivisionProcessingContext): ProcessorInitialization {
        return {
            connections: {
                inputs: [],
                outputs: [...groupPaths(OctTreeWithDualGroupsTemplate)]
            }
        }
    }

    process(
        item: OctTreeWithDualSubdivisionProcessing,
        context: OctTreeWithDualSubdivisionProcessingContext
    ): void {
        const subdivision = context[SubdivisionKey]
        const layer = subdivision.depth
        const parent_layer = layer - 1

        const invalid_layer = 255
        const invalid_localIndex = subdivision.invalid

        if (parent_layer === -1) {
            context[DualKey] = {
                cells: {
                    neighbors: new OctTreeReferences(subdivision.typedArray),
                    vertices: new OctTreeReferences(subdivision.typedArray),
                    lookup: {
                        corners: new OctTreeReferences(subdivision.typedArray),
                    }
                },
            }

            item[DualKey] = {
                cells: {
                    neighbors: context[DualKey].cells.neighbors.subdivide(0),
                    vertices: context[DualKey].cells.vertices.subdivide(0),
                    lookup: {
                        corners: context[DualKey].cells.lookup.corners.subdivide(8),
                    }
                },
            }
        }
        else if (parent_layer === 0) {
            const vertices = context[DualKey].cells.vertices.subdivide(8)
            const neighbors = context[DualKey].cells.neighbors.subdivide(6)
            const lookup_corners = context[DualKey].cells.lookup.corners.subdivide(64)

            for (let corner = 0; corner < 8; corner++) {
                vertices.layers[corner] = 1
                vertices.localIndices[corner] = corner

                const corner_opposite = octTreeSubcellOpposite.triagonal(<OctTreeCell>corner)
                lookup_corners.layers[(8 * corner) | corner_opposite] = 1
                lookup_corners.localIndices[(8 * corner) | corner_opposite] = 0
            }

            item[DualKey] = {
                cells: {
                    neighbors,
                    vertices,
                    lookup: {
                        corners: lookup_corners
                    }
                }
            }
        }
        else {
            // determine number of new dual cells

            const references_parents = subdivision.references.parents.layers[parent_layer]

            const number_subdivided_primary_cells = subdivision.layer_sizes.at(-1)! / 8

            const dual_cells = context[DualKey].cells
            const dual_cells_vertices_layers = dual_cells.vertices.layers.layers
            const dual_cells_vertices_localIndices = dual_cells.vertices.localIndices.layers
            const dual_cells_neighbors_layers = dual_cells.neighbors.layers.layers
            const dual_cells_neighbors_localIndices = dual_cells.neighbors.localIndices.layers

            let number_new_dual_cells = 0

            // 1 interior cell + 6 adjacent cells + (4 diagonal cells/plane * 3 planes) = 19 cells
            const max_number_new_dual_cells = 19 * number_subdivided_primary_cells

            const new_dual_cells_vertices: OctTreeReferencesOctTreeLayersGrouped<IndicesT> = {
                layers: allocNewFilledInvalid(Uint8Array, 8 * max_number_new_dual_cells),
                localIndices: allocNewFilledInvalid(<TypedArrayConstructor<number, IndicesT>>subdivision.typedArray, 8 * max_number_new_dual_cells) as IndicesT
            }

            const new_dual_cells_neighbors: OctTreeReferencesOctTreeLayersGrouped<IndicesT> = {
                layers: allocNewFilledInvalid(Uint8Array, 8 * max_number_new_dual_cells),
                localIndices: allocNewFilledInvalid(<TypedArrayConstructor<number, IndicesT>>subdivision.typedArray, 8 * max_number_new_dual_cells) as IndicesT
            }

            const {
                layers: new_dual_cells_vertices_layers,
                localIndices: new_dual_cells_vertices_localIndices
            } = new_dual_cells_vertices

            const {
                layers: new_dual_cells_neighbors_layers,
                localIndices: new_dual_cells_neighbors_localIndices
            } = new_dual_cells_neighbors

            const new_dual_cells_lookup_corners = dual_cells.lookup.corners.subdivide(64 * number_subdivided_primary_cells)
            const {
                layers: new_dual_cells_lookup_corners_layers,
                localIndices: new_dual_cells_lookup_corners_localIndices
            } = new_dual_cells_lookup_corners

            const lookup_corners_parents_layers = dual_cells.lookup.corners.layers.layers[parent_layer]
            const lookup_corners_parents_localIndices = dual_cells.lookup.corners.localIndices.layers[parent_layer]

            // all new dual cells for adjacent neighbors must be on layer `layer`
            // const interior_dual_cells_neighbors_adjacent_layers = new subdivision.typedArray(6)
            const interior_dual_cells_neighbors_adjacent_localIndices = new subdivision.typedArray(6)

            // const primary_vertices_subdivided_pyramid_localIndices = new subdivision.typedArray(6 * number_subdivided_primary_cells)

            const primary_parent_neighbors_adjacent_localIndices = new subdivision.typedArray(6)
            const primary_parent_neighbors_adjacent_layers = new subdivision.typedArray(6)

            const primary_parent_address = new Uint8Array(parent_layer)
            const primary_parent_neighbor_address = new Uint8Array(parent_layer)

            /**
             * tmp_lookup_adjacent[(6 * (primary local_index on parent_layer)) + face] = local index of dual cell in new layer
             * Is this only needed for new pyramid dual cells?
             * face = (2 * axis) + direction = index in [x-, x+, y-, y+, z-, z+]
             */
            const tmp_lookup_adjacent = <IndicesT>allocNewFilledInvalid(<TypedArrayConstructor<number, IndicesT>>subdivision.typedArray, 6 * subdivision.layer_sizes.at(-2)!)

            /**
             * tmp_lookup_diagonal[(12 * (local_index on parent_layer)) + direction_diagonal] = 1 + local index of dual cell in new layer
             * 0 = invalid
             * diagonal_direction = (4 * plane) + quadrant
             */
            const tmp_lookup_diagonal = new subdivision.typedArray(12 * number_subdivided_primary_cells)

            for (let primary_local_index_group = 0; primary_local_index_group < number_subdivided_primary_cells; primary_local_index_group++) {
                //TODO: OctTreeNeighbors class can optimize this

                const primary_layer = layer
                const primary_local_index_offset = 8 * primary_local_index_group

                const primary_parent_local_index = references_parents[primary_local_index_group]
                subdivision.address(parent_layer, primary_parent_local_index, primary_parent_address)

                // const new_dual_cell_interior_layer = layer
                const new_dual_cell_interior_localIndex = number_new_dual_cells++

                for (let corner = 0; corner < 8; corner++) {
                    new_dual_cells_vertices_layers[(8 * new_dual_cell_interior_localIndex) + corner] = layer
                    new_dual_cells_vertices_localIndices[(8 * new_dual_cell_interior_localIndex) + corner] = primary_local_index_offset | corner

                    const primary_child_localIndex = primary_local_index_offset | corner
                    const corner_opposite = 0b111 ^ corner
                    new_dual_cells_lookup_corners_layers[(8 * primary_child_localIndex) | corner_opposite] = layer // new_dual_cell_interior_layer
                    new_dual_cells_lookup_corners_localIndices[(8 * primary_child_localIndex) | corner_opposite] = new_dual_cell_interior_localIndex
                }

                primary_parent_neighbors_adjacent_layers[0] = primary_parent_neighbors_adjacent_layers[1] = primary_parent_neighbors_adjacent_layers[2] = primary_parent_neighbors_adjacent_layers[3] = primary_parent_neighbors_adjacent_layers[4] = primary_parent_neighbors_adjacent_layers[5] = 0xFF
                primary_parent_neighbors_adjacent_localIndices[0] = primary_parent_neighbors_adjacent_localIndices[1] = primary_parent_neighbors_adjacent_localIndices[2] = primary_parent_neighbors_adjacent_localIndices[3] = primary_parent_neighbors_adjacent_localIndices[4] = primary_parent_neighbors_adjacent_localIndices[5] = 0xFFFFFFFF

                // make/update adjacent dual cells
                for (let adjacent_direction = 0; adjacent_direction < 6; adjacent_direction++) {
                    const axis = <Axis>(adjacent_direction >> 1)
                    const axis_direction = <Direction>(adjacent_direction & 1)

                    // focus = the primary cell that was subdivided

                    const primary_focus_boundary_subcells = octTreeCellsByDirection[axis][axis_direction]

                    //TODO: optimize for only finding real layer and local index
                    const primary_parent_neighbor = subdivision.neighbor_adjacent(primary_parent_address, axis, axis_direction, parent_layer)
                    if (primary_parent_neighbor) {
                        const primary_parent_neighbor_local_index = primary_parent_neighbor.layerLocalIndex.local_index
                        const primary_parent_neighbor_layer = primary_parent_neighbor.layerLocalIndex.layer

                        primary_parent_neighbors_adjacent_localIndices[adjacent_direction] = primary_parent_neighbor_local_index
                        primary_parent_neighbors_adjacent_layers[adjacent_direction] = primary_parent_neighbor_layer

                        const primary_parent_neighbor_children_localIndex_offset = subdivision.references.local.layers[primary_parent_neighbor_layer][primary_parent_neighbor_local_index]
                        const primary_parent_neighbor_children_layer = primary_parent_neighbor_layer + 1
                        const primary_parent_neighbor_didSubdivide = primary_parent_neighbor_children_localIndex_offset !== invalid_localIndex

                        // dual_neighbor_layer must equal layer (the new layer being added in the dual cells)
                        // const dual_neighbor_layer = layer
                        let dual_neighbor_localIndex: number

                        if (!primary_parent_neighbor_didSubdivide) {
                            // makes triangular pyramid if the primary_neighbor cell did not subdivide

                            // dual_neighbor_layer = parent_layer
                            dual_neighbor_localIndex = number_new_dual_cells++

                            for (let i_subcell_focus = 0; i_subcell_focus < 4; i_subcell_focus++) {
                                const primary_subcell_focus = primary_focus_boundary_subcells[i_subcell_focus]
                                const primary_subcell_neighbor = octTreeSubcellOpposite.adjacent(primary_subcell_focus, axis)
                                const dual_cell_vertex_focus = primary_subcell_neighbor
                                const dual_cell_vertex_neighbor = primary_subcell_focus

                                new_dual_cells_vertices_layers[(8 * dual_neighbor_localIndex) | dual_cell_vertex_focus] = primary_layer
                                new_dual_cells_vertices_layers[(8 * dual_neighbor_localIndex) | dual_cell_vertex_neighbor] = primary_parent_neighbor_layer
                                new_dual_cells_vertices_localIndices[(8 * dual_neighbor_localIndex) | dual_cell_vertex_focus] = primary_local_index_offset | primary_subcell_focus
                                new_dual_cells_vertices_localIndices[(8 * dual_neighbor_localIndex) | dual_cell_vertex_neighbor] = primary_parent_neighbor_local_index
                            }
                        }
                        else {
                            subdivision.address(primary_parent_neighbor_layer, primary_parent_neighbor_local_index, primary_parent_neighbor_address)

                            if (octTreeAddressPrecedes(primary_parent_address, primary_parent_neighbor_address)) {
                                // makes a cube if both this primary cell and the neighbor cell subdivded
                                // and if this cell comes earlier

                                // dual_neighbor_layer = layer
                                dual_neighbor_localIndex = number_new_dual_cells++

                                if (primary_parent_neighbor_layer === parent_layer)
                                    tmp_lookup_adjacent[(6 * primary_parent_neighbor_local_index) + (adjacent_direction ^ 1)] = dual_neighbor_localIndex

                                for (let i_subcell_focus = 0; i_subcell_focus < 4; i_subcell_focus++) {
                                    const primary_subcell_focus = primary_focus_boundary_subcells[i_subcell_focus]
                                    const primary_subcell_neighbor = octTreeSubcellOpposite.adjacent(primary_subcell_focus, axis)
                                    const dual_cell_vertex_focus = primary_subcell_neighbor
                                    const dual_cell_vertex_neighbor = primary_subcell_focus

                                    new_dual_cells_vertices_layers[(8 * dual_neighbor_localIndex) | dual_cell_vertex_focus] = primary_layer
                                    new_dual_cells_vertices_layers[(8 * dual_neighbor_localIndex) | dual_cell_vertex_neighbor] = primary_parent_neighbor_children_layer
                                    new_dual_cells_vertices_localIndices[(8 * dual_neighbor_localIndex) | dual_cell_vertex_focus] = primary_local_index_offset | primary_subcell_focus
                                    new_dual_cells_vertices_localIndices[(8 * dual_neighbor_localIndex) | dual_cell_vertex_neighbor] = primary_parent_neighbor_children_localIndex_offset | primary_subcell_neighbor
                                }
                            }
                            else {
                                // if both subdivided but this primary cell comes after that one, then simply record
                                // the new dual cell that was already made

                                // the new dual cell's neighbor must be updated with this new interior cell

                                dual_neighbor_localIndex = tmp_lookup_adjacent[(6 * primary_parent_local_index) + adjacent_direction]

                                for (let i_subcell_focus = 0; i_subcell_focus < 4; i_subcell_focus++) {
                                    const primary_subcell_focus = primary_focus_boundary_subcells[i_subcell_focus]
                                    const primary_subcell_neighbor = octTreeSubcellOpposite.adjacent(primary_subcell_focus, axis)
                                    const dual_cell_vertex_focus = primary_subcell_neighbor
                                    // const dual_cell_vertex_neighbor = primary_subcell_focus

                                    new_dual_cells_vertices_layers[(8 * dual_neighbor_localIndex) | dual_cell_vertex_focus] = primary_layer
                                    // new_dual_cells_vertices_layers[(8 * dual_neighbor_localIndex) | dual_cell_vertex_neighbor] = primary_neighbor_children_layer
                                    new_dual_cells_vertices_localIndices[(8 * dual_neighbor_localIndex) | dual_cell_vertex_focus] = primary_local_index_offset | primary_subcell_focus
                                    // new_dual_cells_vertices_localIndices[(8 * dual_neighbor_localIndex) | dual_cell_vertex_neighbor] = primary_neighbor_children_localIndex_offset | primary_subcell_neighbor
                                }
                            }
                        }

                        const adjacent_direction_opposite: AdjacentDirection = adjacent_direction ^ 1

                        // interior_dual_cells_neighbors_adjacent_layers[adjacent_direction] = dual_neighbor_layer // must be on `layer`
                        interior_dual_cells_neighbors_adjacent_localIndices[adjacent_direction] = dual_neighbor_localIndex

                        new_dual_cells_neighbors_layers[(6 * new_dual_cell_interior_localIndex) + adjacent_direction] = layer // dual_neighbor_layer
                        new_dual_cells_neighbors_localIndices[(6 * new_dual_cell_interior_localIndex) + adjacent_direction] = dual_neighbor_localIndex

                        new_dual_cells_neighbors_layers[(6 * dual_neighbor_localIndex) + adjacent_direction_opposite] = layer // new_dual_cell_interior_layer
                        new_dual_cells_neighbors_localIndices[(6 * dual_neighbor_localIndex) + adjacent_direction_opposite] = new_dual_cell_interior_localIndex

                        // update corners of the newly-subdivided primary children
                        const cell_mask_0 = 1 << axis
                        const cell_0 = axis_direction === 0 ? 0 : cell_mask_0

                        const cell_mask_1 = 1 << ((axis + 1) % 3)
                        const cell_mask_2 = 1 << ((axis + 2) % 3)
                        const cell_mask_12 = cell_mask_1 | cell_mask_2

                        for (let direction_1 = 0; direction_1 < 2; direction_1++) {
                            for (let direction_2 = 0; direction_2 < 2; direction_2++) {
                                const primary_child_subcell = (
                                    (direction_1 === 0 ? 0 : cell_mask_1) |
                                    (direction_2 === 0 ? 0 : cell_mask_2) |
                                    cell_0
                                )

                                const primary_child_localIndex = primary_local_index_offset | primary_child_subcell

                                // the corners pointing to the interior and to the adjacent cells
                                const dual_corner_interior = primary_child_subcell ^ 0b111 // triagonal opposite of primary_child_subcell
                                const dual_corner_adjacent = primary_child_subcell ^ cell_mask_12 // diagonal opposite on the plane

                                const eight_times_primary_child_localIndex = 8 * primary_child_localIndex

                                new_dual_cells_lookup_corners_layers[eight_times_primary_child_localIndex | dual_corner_interior] = layer // new_dual_cell_adjacent_layer
                                new_dual_cells_lookup_corners_layers[eight_times_primary_child_localIndex | dual_corner_adjacent] = layer // dual_neighbor_layer
                                new_dual_cells_lookup_corners_localIndices[eight_times_primary_child_localIndex | dual_corner_interior] = new_dual_cell_interior_localIndex
                                new_dual_cells_lookup_corners_localIndices[eight_times_primary_child_localIndex | dual_corner_adjacent] = dual_neighbor_localIndex
                            }
                        }
                    }
                    else {
                        interior_dual_cells_neighbors_adjacent_localIndices[adjacent_direction] = invalid_localIndex
                        new_dual_cells_neighbors_layers[(6 * new_dual_cell_interior_localIndex) + adjacent_direction] = invalid_layer
                        new_dual_cells_neighbors_localIndices[(6 * new_dual_cell_interior_localIndex) + adjacent_direction] = invalid_localIndex
                    }
                }

                // make/update diagonal cells
                for (let plane = 0; plane < 3; plane++) {
                    // this orders planes: YZ, ZX, XY

                    const axis0 = <Axis>((plane + 1) % 3)
                    const axis1 = <Axis>((plane + 2) % 3)
                    const cell_mask_0: OctTreeCell = <OctTreeCell>(1 << axis0)
                    const cell_mask_1: OctTreeCell = <OctTreeCell>(1 << axis1)

                    // `a` and `b` denote when a variable is different for the third axis
                    const cell_mask_2: OctTreeCell = <OctTreeCell>(0b111 ^ (cell_mask_0 | cell_mask_1))
                    const face_2a: AdjacentDirection = (2 * plane)
                    const face_2b: AdjacentDirection = face_2a | 1

                    for (let quadrant = 0; quadrant < 4; quadrant++) {
                        const diagonal_direction = (plane * 4) | quadrant

                        // must be on layer `layer` because the diagonal cell must either be formed here
                        // or have been formed by the subdivision of another primary parent cell
                        let diagonal_neighbor_dual_cell_layer = layer
                        let diagonal_neighbor_dual_cell_localIndex = invalid_localIndex

                        const direction0: Direction = (quadrant >> 0) & 1
                        const direction1: Direction = (quadrant >> 1) & 1

                        const cell_mask_next_0 = (direction0 === 0) ? 0 : cell_mask_0
                        const cell_mask_prev_0 = (direction0 === 1) ? 0 : cell_mask_0
                        const cell_mask_next_1 = (direction1 === 0) ? 0 : cell_mask_1
                        const cell_mask_prev_1 = (direction1 === 1) ? 0 : cell_mask_1

                        const face0: AdjacentDirection = (2 * axis0) | direction0
                        const face1: AdjacentDirection = (2 * axis1) | direction1

                        const dual_neighbor_adjacent_localIndex_0 = interior_dual_cells_neighbors_adjacent_localIndices[face0]
                        const dual_neighbor_adjacent_localIndex_1 = interior_dual_cells_neighbors_adjacent_localIndices[face1]

                        if (dual_neighbor_adjacent_localIndex_0 === invalid_localIndex || invalid_localIndex === (diagonal_neighbor_dual_cell_localIndex = new_dual_cells_neighbors_localIndices[(6 * dual_neighbor_adjacent_localIndex_0) + face1])) {
                            if (dual_neighbor_adjacent_localIndex_1 === invalid_localIndex || invalid_localIndex === (diagonal_neighbor_dual_cell_localIndex = new_dual_cells_neighbors_localIndices[(6 * dual_neighbor_adjacent_localIndex_1) + face0])) {
                                const primary_parent_diagonal = subdivision.neighbor_diagonal(primary_parent_address, axis0, direction0, axis1, direction1, parent_layer)
                                if (primary_parent_diagonal) {
                                    // there must then exist adjacent neighbors to primary_parent

                                    const primary_parent_diagonal_children_local_index_offset = subdivision.references.local.layers[primary_parent_diagonal.layerLocalIndex.layer][primary_parent_diagonal.layerLocalIndex.local_index]

                                    if (primary_parent_diagonal_children_local_index_offset === invalid_localIndex ||
                                        octTreeAddressPrecedes(primary_parent_address, primary_parent_diagonal.address)) {
                                        // form new dual cell

                                        // either the diagonal cell did not subdivide or this cell comes before it whether or not it will subdivide

                                        // we can be sure that neither of the adjacent primary cells nor the diagonal primary cell
                                        // have yet subdivided their dual cells, if they even subdivided at all
                                        // because that would have been handled by the previous if(...)'s

                                        diagonal_neighbor_dual_cell_localIndex = number_new_dual_cells++

                                        // from the primary_parent cell, looking in the direction of axis0 and axis1,
                                        // there are two corners for the diagonal neighbor dual cell for each axis

                                        const primary_parent_neighbor_adjacent_layer_0 = primary_parent_neighbors_adjacent_layers[face0]
                                        const primary_parent_neighbor_adjacent_layer_1 = primary_parent_neighbors_adjacent_layers[face1]

                                        const primary_parent_neighbor_adjacent_local_index_0 = primary_parent_neighbors_adjacent_localIndices[face0]
                                        const primary_parent_neighbor_adjacent_local_index_1 = primary_parent_neighbors_adjacent_localIndices[face1]

                                        // the corners for the diagonal dual cell that are for the primary cell(s) in the adjacent direction of axis0
                                        const corner_subcell_0a = cell_mask_next_0 | cell_mask_prev_1
                                        const corner_subcell_0b = corner_subcell_0a | cell_mask_2

                                        new_dual_cells_vertices_layers[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_0a] = primary_parent_neighbor_adjacent_layer_0
                                        new_dual_cells_vertices_layers[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_0b] = primary_parent_neighbor_adjacent_layer_0
                                        new_dual_cells_vertices_localIndices[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_0a] = primary_parent_neighbor_adjacent_local_index_0
                                        new_dual_cells_vertices_localIndices[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_0b] = primary_parent_neighbor_adjacent_local_index_0

                                        // the corners for the diagonal dual cell that are for the primary cell(s) in the adjacent direction of axis1
                                        const corner_subcell_1a = cell_mask_next_1 | cell_mask_prev_0
                                        const corner_subcell_1b = corner_subcell_1a | cell_mask_2

                                        new_dual_cells_vertices_layers[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_1a] = primary_parent_neighbor_adjacent_layer_1
                                        new_dual_cells_vertices_layers[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_1b] = primary_parent_neighbor_adjacent_layer_1
                                        new_dual_cells_vertices_localIndices[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_1a] = primary_parent_neighbor_adjacent_local_index_1
                                        new_dual_cells_vertices_localIndices[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_1b] = primary_parent_neighbor_adjacent_local_index_1

                                        // the corners for the diagonal dual cell for the primary cell(s) in the diagonal direction
                                        const corner_subcell_2a = cell_mask_next_0 | cell_mask_next_1
                                        const corner_subcell_2b = corner_subcell_2a | cell_mask_2

                                        new_dual_cells_vertices_layers[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_2a] = primary_parent_diagonal.layerLocalIndex.layer
                                        new_dual_cells_vertices_layers[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_2b] = primary_parent_diagonal.layerLocalIndex.layer
                                        new_dual_cells_vertices_localIndices[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_2a] = primary_parent_diagonal.layerLocalIndex.local_index
                                        new_dual_cells_vertices_localIndices[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_2b] = primary_parent_diagonal.layerLocalIndex.local_index

                                        // the primary_parent's triagonal corner dual cells are neighbors for this diagonal dual cell
                                        const primary_subcell_a = cell_mask_next_0 | cell_mask_next_1
                                        const primary_subcell_b = primary_subcell_a | cell_mask_2

                                        new_dual_cells_neighbors_layers[(6 * diagonal_neighbor_dual_cell_localIndex) + face_2a] = lookup_corners_parents_layers[(8 * primary_parent_local_index) | primary_subcell_a]
                                        new_dual_cells_neighbors_layers[(6 * diagonal_neighbor_dual_cell_localIndex) + face_2b] = lookup_corners_parents_layers[(8 * primary_parent_local_index) | primary_subcell_b]
                                        new_dual_cells_neighbors_localIndices[(6 * diagonal_neighbor_dual_cell_localIndex) + face_2a] = lookup_corners_parents_localIndices[(8 * primary_parent_local_index) | primary_subcell_a]
                                        new_dual_cells_neighbors_localIndices[(6 * diagonal_neighbor_dual_cell_localIndex) + face_2b] = lookup_corners_parents_localIndices[(8 * primary_parent_local_index) | primary_subcell_b]
                                    }
                                    else {
                                        // use diagonal dual cell that was just made at this layer

                                        // if there was a diagonal cell already made, a cell this primary_parent should update,
                                        // the diagonal cell must have been made in this layer
                                        // next layer of processing would consider that cell a triagonal neighbor

                                        // tmp_lookup_diagonal[(12 * (local_index on parent_layer)) + diagonal_direction] = local index of dual cell in new layer

                                        const diagonal_direction_opposite = 0b11 ^ diagonal_direction
                                        diagonal_neighbor_dual_cell_localIndex = tmp_lookup_diagonal[(12 * primary_parent_diagonal.layerLocalIndex.local_index) + diagonal_direction_opposite]
                                        if (diagonal_neighbor_dual_cell_localIndex === 0) diagonal_neighbor_dual_cell_localIndex = 0xFFFFFFFF
                                        else diagonal_neighbor_dual_cell_localIndex--
                                    }
                                }
                                else {
                                    // there can be no diagonal dual cell with no diagonal primary cell
                                }
                            }
                        }

                        if (diagonal_neighbor_dual_cell_localIndex !== invalid_localIndex) {
                            // now diagonal_neighbor_dual_cell_localIndex is definitely assigned

                            const face_opposite_0 = face0 ^ 1
                            const face_opposite_1 = face1 ^ 1

                            // the interior dual cell's adjacent neighbors are adjacent neighbors for the diagonal dual cell
                            new_dual_cells_neighbors_layers[(6 * diagonal_neighbor_dual_cell_localIndex) + face_opposite_1] = layer // new adjacent cell exists in this layer
                            new_dual_cells_neighbors_layers[(6 * diagonal_neighbor_dual_cell_localIndex) + face_opposite_0] = layer // new adjacent cell exists in this layer
                            new_dual_cells_neighbors_localIndices[(6 * diagonal_neighbor_dual_cell_localIndex) + face_opposite_1] = dual_neighbor_adjacent_localIndex_0
                            new_dual_cells_neighbors_localIndices[(6 * diagonal_neighbor_dual_cell_localIndex) + face_opposite_0] = dual_neighbor_adjacent_localIndex_1

                            new_dual_cells_neighbors_layers[(6 * dual_neighbor_adjacent_localIndex_0) + face1] = layer // new diagonal cell must exist here
                            new_dual_cells_neighbors_layers[(6 * dual_neighbor_adjacent_localIndex_1) + face0] = layer // new diagonal cell must exist here
                            new_dual_cells_neighbors_localIndices[(6 * dual_neighbor_adjacent_localIndex_0) + face1] = diagonal_neighbor_dual_cell_localIndex
                            new_dual_cells_neighbors_localIndices[(6 * dual_neighbor_adjacent_localIndex_1) + face0] = diagonal_neighbor_dual_cell_localIndex

                            tmp_lookup_diagonal[(12 * primary_parent_local_index) + diagonal_direction] = 1 + diagonal_neighbor_dual_cell_localIndex

                            // update diagonal dual cell's corners just for this primary_parent's children
                            const corner_subcell_a = <OctTreeCell>(cell_mask_prev_0 | cell_mask_prev_1)
                            const corner_subcell_b = <OctTreeCell>(corner_subcell_a | cell_mask_2)

                            new_dual_cells_vertices_layers[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_a] = layer
                            new_dual_cells_vertices_layers[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_b] = layer
                            new_dual_cells_vertices_localIndices[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_a] = primary_local_index_offset | (octTreeSubcellOpposite.triagonal(corner_subcell_b))
                            new_dual_cells_vertices_localIndices[(8 * diagonal_neighbor_dual_cell_localIndex) | corner_subcell_b] = primary_local_index_offset | (octTreeSubcellOpposite.triagonal(corner_subcell_a))

                            // update triagonal neighbors of the interior cell
                            const triagonal_corner_a = <OctTreeCell>(cell_mask_next_0 | cell_mask_next_1)
                            const triagonal_corner_b = <OctTreeCell>(triagonal_corner_a | cell_mask_2)

                            const face_2b = 2 * plane
                            const face_2a = face_2b | 1

                            const triagonal_dual_neighbor_layer_a = lookup_corners_parents_layers[(8 * primary_parent_local_index) | triagonal_corner_a]
                            const triagonal_dual_neighbor_layer_b = lookup_corners_parents_layers[(8 * primary_parent_local_index) | triagonal_corner_b]

                            if (triagonal_dual_neighbor_layer_a !== invalid_layer) {
                                const triagonal_dual_neighbor_localIndex_a = lookup_corners_parents_localIndices[(8 * primary_parent_local_index) | triagonal_corner_a]

                                dual_cells_neighbors_layers[triagonal_dual_neighbor_layer_a][(6 * triagonal_dual_neighbor_localIndex_a) + face_2a] = layer // diagonal_neighbor_dual_cell_layer
                                dual_cells_neighbors_localIndices[triagonal_dual_neighbor_layer_a][(6 * triagonal_dual_neighbor_localIndex_a) + face_2a] = diagonal_neighbor_dual_cell_localIndex
                            }

                            if (triagonal_dual_neighbor_layer_b !== invalid_layer) {
                                const triagonal_dual_neighbor_localIndex_b = lookup_corners_parents_localIndices[(8 * primary_parent_local_index) | triagonal_corner_b]

                                dual_cells_neighbors_layers[triagonal_dual_neighbor_layer_b][(6 * triagonal_dual_neighbor_localIndex_b) + face_2b] = layer // diagonal_neighbor_dual_cell_layer
                                dual_cells_neighbors_localIndices[triagonal_dual_neighbor_layer_b][(6 * triagonal_dual_neighbor_localIndex_b) + face_2b] = diagonal_neighbor_dual_cell_localIndex
                            }

                            // update corners of two of primary_parent's children for this diagonal dual cell
                            const primary_child_local_index_a = primary_local_index_offset | triagonal_corner_a
                            const primary_child_local_index_b = primary_local_index_offset | triagonal_corner_b

                            new_dual_cells_lookup_corners_layers[(8 * primary_child_local_index_a) | triagonal_corner_b] = diagonal_neighbor_dual_cell_layer
                            new_dual_cells_lookup_corners_layers[(8 * primary_child_local_index_b) | triagonal_corner_a] = diagonal_neighbor_dual_cell_layer
                            new_dual_cells_lookup_corners_localIndices[(8 * primary_child_local_index_a) | triagonal_corner_b] = diagonal_neighbor_dual_cell_localIndex
                            new_dual_cells_lookup_corners_localIndices[(8 * primary_child_local_index_b) | triagonal_corner_a] = diagonal_neighbor_dual_cell_localIndex
                        }
                    }
                }

                // update triagonal corner references (these are not tmp) for the new interior vertices

                // Now, the interior dual cell has been made,
                // the adjacent dual cells have been made/updated,
                // and the diagonal dual cells also;
                // tmp_lookup_diagonal[12 * primary_parent_local_index + diagonal_direction] is filled for all valid diagonal_directions in [0, 12)
                // and the adjacent neighbors are updated for all the dual cells

                // Now the triagonal dual cells vertices will be updated

                for (let triagonal_corner: OctTreeCell = 0; triagonal_corner < 8; triagonal_corner++) {
                    const dual_cell_neighbor_triagonal_layer = lookup_corners_parents_layers[(8 * primary_parent_local_index) | triagonal_corner]
                    if (dual_cell_neighbor_triagonal_layer !== invalid_layer) {
                        const dual_cell_neighbor_triagonal_localIndex = lookup_corners_parents_localIndices[(8 * primary_parent_local_index) | triagonal_corner]
                        const dual_cell_corner = octTreeSubcellOpposite.triagonal(<OctTreeCell>triagonal_corner)
                        const primary_subcell = triagonal_corner
                        const primary_child_localIndex = primary_local_index_offset | primary_subcell

                        dual_cells_vertices_layers[dual_cell_neighbor_triagonal_layer][(8 * dual_cell_neighbor_triagonal_localIndex) | dual_cell_corner] = layer
                        dual_cells_vertices_localIndices[dual_cell_neighbor_triagonal_layer][(8 * dual_cell_neighbor_triagonal_localIndex) | dual_cell_corner] = primary_local_index_offset | primary_subcell

                        new_dual_cells_lookup_corners_layers[(8 * primary_child_localIndex) | primary_subcell] = lookup_corners_parents_layers[(8 * primary_parent_local_index) | primary_subcell]
                        new_dual_cells_lookup_corners_localIndices[(8 * primary_child_localIndex) | primary_subcell] = lookup_corners_parents_localIndices[(8 * primary_parent_local_index) | primary_subcell]
                    }
                }
            }

            item[DualKey] = {
                cells: {
                    vertices: arrayCopy(new_dual_cells_vertices, dual_cells.vertices.subdivide(8 * number_new_dual_cells)),
                    neighbors: arrayCopy(new_dual_cells_neighbors, dual_cells.neighbors.subdivide(6 * number_new_dual_cells)),
                    lookup: {
                        corners: new_dual_cells_lookup_corners,
                    }
                }
            }
        }
    }

    private constructor() { }
    public static readonly instance = new this()
}