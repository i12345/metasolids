import { Vec3 } from "playcanvas-extended"
import { LayerLocalIndex } from "./octtree.js"
import { SubdivisionReferences } from "./subdivision.js"
import { OctTreeAddress, OctTreeCell, octTreeSubcell } from "./address.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { MultiObjectsGroupsTemplateLeaf } from "../trees/multi-objects-groups.js"
import { TypedArrayOctTree } from "./typed-array.js"
import { Subdividable } from "./subdividable.js"
import { FieldPointVectorFunction } from "../../fields/vectorized/function.js"
import { FieldPointVectorContainerStatic } from "../../fields/vectorized/point.js"

export interface OctTreeAddressWithOffset {
    address: OctTreeAddress
    offset: Vec3
}

export type OctTreeSpaceGroups = {
    positions: MultiObjectsGroupsTemplateLeaf
}
export type OctTreeSpaceValue = number
export type OctTreeSpaceValuesGrouped = {
    positions: number
}
export type OctTreeSpaceLayer = Float64Array
export type OctTreeSpaceLayersGrouped = {
    positions: Float64Array
}
export type OctTreeSpaceOctTreesGrouped = {
    positions: TypedArrayOctTree<number, Float64Array>
}

export class OctTreeSpace<IndicesT extends IndicesTypedArray = IndicesTypedArray>
    implements Subdividable<
            OctTreeSpaceGroups,
            OctTreeSpaceValue,
            OctTreeSpaceValuesGrouped,
            OctTreeSpaceLayer,
            OctTreeSpaceLayersGrouped
        > {
    readonly halfExtent: number
    
    readonly positions = new TypedArrayOctTree<OctTreeSpaceValue, OctTreeSpaceLayer>(Float64Array)
    
    private _voxelVolumes: Float64Array

    get voxelVolumes() {
        return this._voxelVolumes
    }

    constructor(
        public readonly subdivisions: SubdivisionReferences<IndicesT>,
        public readonly exponentOfTwoHalfExtent: number
    ) {
        this.halfExtent = 2 ** exponentOfTwoHalfExtent
        this._voxelVolumes = new Float64Array([this.halfExtent ** 3])
    }

    subdivide(newVoxels: number): OctTreeSpaceLayersGrouped {
        this._voxelVolumes = new Float64Array(this.subdivisions.depth + 1)
        for (let layer = 0; layer < this._voxelVolumes.length; layer++)
            this._voxelVolumes[layer] = ((2 * this.halfExtent) ** 3) / (8 ** layer)

        const positions = this.positions.subdivide(3 * newVoxels)

        if (newVoxels !== 1) {
            let positions_offset = 0

            const primary_child_000_position = new Vec3()
            const new_layer = this.subdivisions.depth
            const parent_layer = new_layer - 1
            const references_parents_newLayer = this.subdivisions.references.parents.layers[parent_layer]
            const references_local_newLayer = this.subdivisions.references.local.layers[parent_layer]
            
            // the distance from one child to its adjacent neighbors
            const position_delta = 2 ** -new_layer

            for (let primary_parent_i = 0; primary_parent_i < newVoxels / 8; primary_parent_i++) {
                const primary_child_000_localIndex = references_local_newLayer[references_parents_newLayer[primary_parent_i]]
                this.positionOfVoxel(new_layer, primary_child_000_localIndex, primary_child_000_position)

                for (let primary_child_subcell = 0; primary_child_subcell < 8; primary_child_subcell++) {
                    positions[positions_offset++] = primary_child_000_position.x + ((primary_child_subcell & (1 << 0)) === 0 ? 0 : position_delta)
                    positions[positions_offset++] = primary_child_000_position.y + ((primary_child_subcell & (1 << 1)) === 0 ? 0 : position_delta)
                    positions[positions_offset++] = primary_child_000_position.z + ((primary_child_subcell & (1 << 2)) === 0 ? 0 : position_delta)
                }
            }
        }
        
        return {
            positions
        }
    }

    positionInfo(
            p: Vec3,
            limitToRealSubdivisions: boolean = false,
            max_depth: number = this.subdivisions.depth
        ): LayerLocalIndex & OctTreeAddressWithOffset {
        //TODO: test that this function works inverse to indexOfPosition()

        /**
         * If p = (p - center) / halfExtents
         * p in (-1, +1)
         * 0 = []
         * 0.75 = [+1 +1]
         * 0.375 = [+1 -1 +1]
         *
         * 0     = 0.
         * 0.75  = 0.11
         * 0.375 = 0.101
         *
         * This could be considered further
         */

        p = p.clone()
        
        p.divScalar(this.halfExtent)
        // p \in (-1, +1)

        let subdivision_layer = -1
        let local_index = 0
        let isLastLayerReached = false
        //TODO: store cell choices bitwise in three numbers, for x, y, and z
        const address: OctTreeAddress = new Array<OctTreeCell>(max_depth + 1)

        const references_local = this.subdivisions.references.local.layers
        const invalid = this.subdivisions.invalid

        for (let address_layer = 0; address_layer <= max_depth; address_layer++) {
            let cell: OctTreeCell = 0
            p.mulScalar(2)

            if (p.x > 0) {
                p.x--
                cell |= 0x1
            }
            else p.x++

            if (p.y > 0) {
                p.y--
                cell |= 0x2
            }
            else p.y++

            if (p.z > 0) {
                p.z--
                cell |= 0x4
            }
            else p.z++

            address[address_layer] = <OctTreeCell>cell

            if (!isLastLayerReached) {
                if (address_layer === this.subdivisions.depth)
                    isLastLayerReached = true
                else {
                    const next_local_index_base = references_local[address_layer][local_index]
                    if (next_local_index_base === invalid)
                        isLastLayerReached = true
                    else {
                        local_index = next_local_index_base + cell
                    }
                }

                subdivision_layer = address_layer
                
                if (limitToRealSubdivisions && isLastLayerReached)
                    break
            }
        }

        const offset = p.divScalar(2 ** address.length)

        return {
            layer: subdivision_layer,
            local_index,
            address,
            offset
        }
    }

    indexOfPosition(p: Vec3): LayerLocalIndex {
        return this.positionInfo(p, true)
    }

    positionOfVoxel(layer: number, local_index: number, result: Vec3 = new Vec3()): Vec3 {
        result.x = result.y = result.z = 0
        
        const references_parents = this.subdivisions.references.parents.layers

        while(layer > 0) {
            const i_subcell = octTreeSubcell(local_index)
            
            result.x /= 2
            result.y /= 2
            result.z /= 2
            
            if ((i_subcell & 0x1) === 0) result.x += 1
            else result.x -= 1

            if ((i_subcell & 0x2) === 0) result.y += 1
            else result.y -= 1

            if ((i_subcell & 0x4) === 0) result.z += 1
            else result.z -= 1

            layer--
            local_index = references_parents[layer][local_index >> 3]
        }
        if (local_index !== 0)
            throw new Error()
        
        result.x *= (this.halfExtent / 2)
        result.y *= (this.halfExtent / 2)
        result.z *= (this.halfExtent / 2)
        
        return result
    }

    static readonly vectorized = {
        indexOfPosition: new FieldPointVectorFunction<
                {
                    indexOfPosition(p: Vec3): LayerLocalIndex
                },
                "indexOfPosition",
                (p: Vec3) => LayerLocalIndex,
                [typeof Vec3],
                [FieldPointVectorContainerStatic<Float64Array>],
                FieldPointVectorContainerStatic<IndicesTypedArray>
            >("indexOfPosition", [Vec3], { layer: Number, local_index: Number }),
        
        positionOfVoxel: {
            layers_same: new FieldPointVectorFunction<
                {
                    positionOfVoxel(layer: number, local_index: number): Vec3
                },
                "positionOfVoxel",
                (layer: number, local_index: number) => Vec3,
                [undefined, typeof Number],
                [undefined, FieldPointVectorContainerStatic<IndicesTypedArray>],
                FieldPointVectorContainerStatic<Float64Array>
            >("positionOfVoxel", [undefined, Number], Vec3),
            
            layers_individual: new FieldPointVectorFunction<
                {
                    positionOfVoxel(layer: number, local_index: number): Vec3
                },
                "positionOfVoxel",
                (layer: number, local_index: number) => Vec3,
                [typeof Number, typeof Number],
                [FieldPointVectorContainerStatic<IndicesTypedArray>, FieldPointVectorContainerStatic<IndicesTypedArray>],
                FieldPointVectorContainerStatic<Float64Array>
            >("positionOfVoxel", [Number, Number], Vec3)
        }
    }
}