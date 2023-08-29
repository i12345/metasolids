import { IndicesTypedArray } from "../../utils/indices-array.js"
import { TypedArrayConstructor } from "../../utils/typed-array.js"
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplateLeaf } from "../trees/index.js"
import { Processor } from "../processing/processor.js"
import { Axis, Direction, OctTreeAddress, OctTreeCell, octTreeSubcell } from "./address.js"
import { LayerLocalIndex } from "./octtree.js"
import { OctTreesTemplated } from "./templated.js"
import { TypedArrayOctTree } from "./typed-array.js"


export interface SubdivisionProcessor<
        ItemT = any,
        ContextT = any
    > extends Processor<ItemT, ContextT> {    
}

export type SubdivisionAdviceGroups = {
    recommendation: MultiObjectsGroupsTemplateLeaf
    // regret: MultiObjectsGroupsTemplateLeaf
}

export type SubdivisionAdviceT = number
export type SubdivisionAdviceTGrouped = MultiObjectsGroupsMapped<SubdivisionAdviceGroups, SubdivisionAdviceT>
export type SubdivisionAdviceLayer = Uint8Array
export const SubdivisionAdviceLayerConstructor: TypedArrayConstructor<number, SubdivisionAdviceLayer> = Uint8Array
export type SubdivisionAdviceLayersGrouped = MultiObjectsGroupsMapped<SubdivisionAdviceGroups, SubdivisionAdviceLayer>
export type SubdivisionAdviceOctTrees = OctTreesTemplated<
        SubdivisionAdviceGroups,
        SubdivisionAdviceTGrouped,
        SubdivisionAdviceLayersGrouped
    >

// let a!: SubdivisionAdviceOctTrees
// a.recommendation

export interface OctTreeSubdivisionSettings<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
    > {
    indicesType: TypedArrayConstructor<number, IndicesT>
    max_depth: number
    // regret_dismissed: number
    recommendation_threshold: number
}

export const defaultOctTreeSubdivisionSettings: OctTreeSubdivisionSettings<Uint32Array> = {
    indicesType: Uint32Array,
    max_depth: 8,
    // regret_dismissed: 1,
    recommendation_threshold: 1,
}

export class SubdivisionReferences<IndicesT extends IndicesTypedArray = Uint32Array> {
    private _voxelsCount = 1

    /**
     * {@link depth_offsets} and {@link layer_sizes} are ahead one iteration
     * from references.global and  they do not get new layers added under subdivide()
     */
    
    readonly depth_offsets: number[] = [0]
    readonly layer_sizes: number[] = [1]
    
    /**
     * Total number of layers, including the children made from subdivision
     * though not subdivided or having any children themselves
     */
    get depth() {
        // this.references.global is one layer behind because it is only used
        // when indexing a next layer
        return this.references.global.depth + 1
    }

    /**
     * These trees stores references to the indices in the next layers where
     * voxels' children can be found; they are found 8 elements at a time,
     * for the indices (0, 0, 0), (1, 0, 0), (0, 1, 0), (1, 1, 0), ... (1, 1, 1).
     * 
     * Each value is either -1 if the cell has not been subdivided
     * or the index of the subdivided cell. To find the value for -1,
     * see {@link this.invalid}.
     * 
     * `references.local` bases 0 for the first voxel in the next layer;
     * `references.global` bases 0 for the first voxel at the first layer;
     * `references.parents` gives local index of voxel in previous layer that 
     * each voxel came from, with first layer having [-1].
     */
    readonly references: {
        /**
         * local[layer][local_index] = local voxel index in next layer where
         * this voxel's 8 children start; -1 if no children
         */
        readonly local: TypedArrayOctTree<number, IndicesT>

        /**
         * global[layer][local_index] = global voxel index where this voxel's
         * 8 children start; -1 if no children
         */
        readonly global: TypedArrayOctTree<number, IndicesT>

        /**
         * parents[layer - 1][local_index / 8] = local index in previous layer
         * (layer - 1) of any voxel in this layer with index [local_index + 0,
         * local_index + 1, ... local_index + 7]
         */
        readonly parents: TypedArrayOctTree<number, IndicesT>
    }

    readonly invalid: number

    get voxelsCount() {
        return this._voxelsCount
    }

    constructor(public readonly typedArray: TypedArrayConstructor<number, IndicesT> = Uint32Array as TypedArrayConstructor<number, IndicesT>) {
        this.invalid = new (typedArray as TypedArrayConstructor<number>)([-1])[0]

        this.references = {
            local: new TypedArrayOctTree<number, IndicesT>(this.typedArray, [], this.invalid),
            global: new TypedArrayOctTree<number, IndicesT>(this.typedArray, [], this.invalid),
            parents: new TypedArrayOctTree<number, IndicesT>(this.typedArray)
        }
    }

    subdivide(advice?: SubdivisionAdviceOctTrees, settings?: OctTreeSubdivisionSettings<IndicesT>) {
        const last_layer_size = this.layer_sizes.at(-1)!
        this.depth_offsets.push(this.voxelsCount)
        const { invalid } = this

        const references_active = {
            local: this.references.local.subdivide(last_layer_size),
            global: this.references.global.subdivide(last_layer_size)
        }

        let next_layer_voxel_count = 0

        if (advice) {
            if (advice.recommendation.depth !== this.references.global.depth)
                throw new Error(`subdivision advice depth should equal subdivision references depth"`)
            
            const recommendation = advice.recommendation.layers.at(-1)!
            // const regret = advice.regret.layers.at(-1)!

            const recommendation_threshold = settings?.recommendation_threshold ?? 1

            for (let i = 0; i < last_layer_size; i++) {
                if (recommendation[i] >= recommendation_threshold) {
                    references_active.global[i] = this._voxelsCount
                    references_active.local[i] = next_layer_voxel_count
                    
                    this._voxelsCount += 8
                    next_layer_voxel_count += 8
                }
            }
        }
        else {
            for (let i = 0; i < last_layer_size; i++) {
                references_active.global[i] = this._voxelsCount
                references_active.local[i] = next_layer_voxel_count

                this._voxelsCount += 8
                next_layer_voxel_count += 8
            }
        }

        const next_layer_parents = this.references.parents.subdivide(next_layer_voxel_count / 8)
        let next_localIndex_group = 0
        for (let i_parent = 0; i_parent < last_layer_size; i_parent++) {
            const next_layer_local = references_active.local[i_parent]
            if (next_layer_local !== invalid)
                next_layer_parents[next_localIndex_group++] = i_parent
        }

        this.layer_sizes.push(next_layer_voxel_count)

        return next_layer_voxel_count
    }

    find_cell(index_global: number): LayerLocalIndex {
        let layer = 0
        while (this.depth_offsets[layer] < index_global)
            layer++
        
        layer--

        return {
            layer,
            local_index: index_global - this.depth_offsets[layer]
        }
    }

    address(layer: number, localIndex: number, result: OctTreeAddress = new Array(layer + 1)) {
        if (layer > result.length)
            throw new Error("result.length must be >= layer")
        
        const references_parents = this.references.parents.layers
        while (layer > 0) {
            layer--
            result[layer] = octTreeSubcell(localIndex)
            localIndex = references_parents[layer][localIndex >> 3]
        }

        return result
    }

    realLayer(address: OctTreeAddress): number {
        const references_local = this.references.local.layers
        const invalid = this.invalid
        
        let local_index = 0
        let layer: number
        
        for (layer = 0; layer < address.length && layer < references_local.length; layer++) {
            const next_local_index_base = references_local[layer][local_index]
            if (next_local_index_base === invalid) break
            local_index = next_local_index_base | address[layer]
        }
        
        return layer
    }

    realLayerlocalIndex(address: OctTreeAddress): LayerLocalIndex {
        const references_local = this.references.local.layers
        const invalid = this.invalid
        
        let local_index = 0
        let layer: number
        
        for (layer = 0; layer < address.length && layer < references_local.length; layer++) {
            const next_local_index_base = references_local[layer][local_index]
            if (next_local_index_base === invalid) break
            local_index = next_local_index_base | address[layer]
        }
        
        return { layer, local_index }
    }

    /**
     * Neighbor calculations using addresses
     * 
     * With depth=3
     * position  8/16 is [+1]
     * position 12/16 is [+1 +1]
     * position  4/16 is [+1 -1]
     * position  6/16 is [+1 -1 +1]
     * position  5/16 is [+1 -1 +1 -1]
     * 
     * To find the right of 0.25 (4/16), simply change the least-significant indices to +1 followed by -1's
     * [+1 -1] + [+1 -1 -1 -1 -1 ...] = [+1 -1 +1 -1]
     * 
     * Similarly, to find the diagonal corner from (4/16, 4/16),
     * add ([+1 -1 -1 -1...], [+1 -1 -1 -1...]) to the address
     * 
     * Though actually this does not find real adjacent neighbor, because if there is a 4/16 voxel in use
     * then there will be no 5/16 voxel; otherwise 4/16 would have been subdivided.
     * 
     * The neighbor of 5/16 [+1 -1 +1 -1] is 7/16 [+1 -1 +1 +1]. This is because the direction can be
     * taken in the last cell.
     * 
     * The neighbor of 7/16 [+1 -1 +1 +1] is 9/16 [+1 +1 -1 -1] or 10/16 [+1 +1 -1] or 12/16 [+1 +1]
     * The neighbor is found by setting the least-significant bit that's going in the opposite direction
     * to go in the right direction, then finding a real address from there.
     * 
     * The least significant bit must be at or after the real layer for this address.
     * 
     * For di/triagonal neighbors, the least significant bit is found when,
     * counting from lesser- to greater-significant bits, both or all three
     * directions have been found in the wrong direction
     * 
     * These commented-out code could be used for dense (interior) pooling neighbors,
     * though I would like to verify it gives the right results.
     */

    neighbor_adjacent(
            cell: OctTreeAddress,
            axis: Axis,
            direction: Direction,
            layer: number = this.realLayer(cell)
        ) {
        const address = SubdivisionReferences.address_adjacent(cell, axis, direction, layer)
        if (!address) return undefined
        const layerLocalIndex = this.realLayerlocalIndex(address)
        return { address, layerLocalIndex }
    }

    static address_adjacent(
            cell: OctTreeAddress,
            axis: Axis,
            direction: Direction,
            layer: number
        ) {
        const address = new Array<OctTreeCell>(cell.length)
        for (let i = 0; i < cell.length; i++)
            address[i] = <OctTreeCell>cell[i]
        
        const mask = <OctTreeCell>(1 << axis)
        const other = <OctTreeCell>(0x7 ^ mask)
        const next = direction === 1 ? mask : 0
        const prev = direction === 0 ? mask : 0
        
        let leastSignificantBit: number
        for (leastSignificantBit = layer - 1; leastSignificantBit >= 0; leastSignificantBit--)
            if ((address[leastSignificantBit] & mask) === prev)
                break
        
        if (leastSignificantBit === -1)
            return undefined
        
        address[leastSignificantBit] = <OctTreeCell>((address[leastSignificantBit] & other) | next)
        for (let i = leastSignificantBit + 1; i < address.length; i++)
            address[i] = <OctTreeCell>((address[i] & other) | prev)

        return address
    }

    neighbor_diagonal(
            cell: OctTreeAddress,
            axis1: Axis, direction1: Direction,
            axis2: Axis, direction2: Direction,
            layer: number = this.realLayer(cell)
        ) {
        const address = SubdivisionReferences.address_diagonal(cell, axis1, direction1, axis2, direction2, layer)
        if (!address) return undefined
        const layerLocalIndex = this.realLayerlocalIndex(address)
        return { address, layerLocalIndex }
    }

    static address_diagonal(
            cell: OctTreeAddress,
            axis1: Axis, direction1: Direction,
            axis2: Axis, direction2: Direction,
            layer: number
        ) {
        const address = new Array<OctTreeCell>(cell.length)
        for (let i = 0; i < cell.length; i++)
            address[i] = <OctTreeCell>cell[i]
        
        const mask1 = <OctTreeCell>(1 << axis1)
        const mask2 = <OctTreeCell>(1 << axis2)
        const other1 = <OctTreeCell>(0x7 ^ mask1)
        const other2 = <OctTreeCell>(0x7 ^ mask2)
        const next1 = direction1 === 1 ? mask1 : 0
        const prev1 = direction1 === 0 ? mask1 : 0
        const next2 = direction2 === 1 ? mask2 : 0
        const prev2 = direction2 === 0 ? mask2 : 0
        
        let leastSignificantBit1: number
        let leastSignificantBit2: number

        for (leastSignificantBit1 = layer - 1; leastSignificantBit1 >= 0; leastSignificantBit1--)
            if ((address[leastSignificantBit1] & mask1) === prev1)
                break
        
        for (leastSignificantBit2 = layer - 1; leastSignificantBit2 >= 0; leastSignificantBit2--)
            if ((address[leastSignificantBit2] & mask2) === prev2)
                break
        
        if (leastSignificantBit1 === -1 ||
            leastSignificantBit2 === -1)
            return undefined
        
        address[leastSignificantBit1] = <OctTreeCell>((address[leastSignificantBit1] & other1) | next1)
        for (let i = leastSignificantBit1 + 1; i < address.length; i++)
            address[i] = <OctTreeCell>((address[i] & other1) | prev1)

        address[leastSignificantBit2] = <OctTreeCell>((address[leastSignificantBit2] & other2) | next2)
        for (let i = leastSignificantBit2 + 1; i < address.length; i++)
            address[i] = <OctTreeCell>((address[i] & other2) | prev2)

        return address
    }

    neighbor_triagonal(
            cell: OctTreeAddress,
            directionX: Direction,
            directionY: Direction,
            directionZ: Direction,
            layer: number = this.realLayer(cell)
        ) {
        const address = SubdivisionReferences.address_triagonal(cell, directionX, directionY, directionZ, layer)
        if (!address) return undefined
        const layerLocalIndex = this.realLayerlocalIndex(address)
        return { address, layerLocalIndex }
    }

    static address_triagonal(
            cell: OctTreeAddress,
            directionX: Direction,
            directionY: Direction,
            directionZ: Direction,
            layer: number
        ) {
        const address = new Array<OctTreeCell>(cell.length)
        for (let i = 0; i < cell.length; i++)
            address[i] = <OctTreeCell>cell[i]
        
        const maskX = <OctTreeCell>(1 << 0)
        const maskY = <OctTreeCell>(1 << 1)
        const maskZ = <OctTreeCell>(1 << 2)
        const otherX = <OctTreeCell>0b110
        const otherY = <OctTreeCell>0b101
        const otherZ = <OctTreeCell>0b011
        const nextX = directionX === 1 ? maskX : 0
        const prevX = directionX === 0 ? maskX : 0
        const nextY = directionY === 1 ? maskY : 0
        const prevY = directionY === 0 ? maskY : 0
        const nextZ = directionZ === 1 ? maskZ : 0
        const prevZ = directionZ === 0 ? maskZ : 0
        
        let leastSignificantBitX: number
        let leastSignificantBitY: number
        let leastSignificantBitZ: number

        for (leastSignificantBitX = layer - 1; leastSignificantBitX >= 0; leastSignificantBitX--)
            if ((address[leastSignificantBitX] & maskX) === prevX)
                break
        
        for (leastSignificantBitY = layer - 1; leastSignificantBitY >= 0; leastSignificantBitY--)
            if ((address[leastSignificantBitY] & maskY) === prevY)
                break

        for (leastSignificantBitZ = layer - 1; leastSignificantBitZ >= 0; leastSignificantBitZ--)
            if ((address[leastSignificantBitZ] & maskZ) === prevZ)
                break
        
        if (leastSignificantBitX === -1 ||
            leastSignificantBitY === -1 ||
            leastSignificantBitZ === -1)
            return undefined
        
        address[leastSignificantBitX] = <OctTreeCell>((address[leastSignificantBitX] & otherX) | nextX)
        for (let i = leastSignificantBitX + 1; i < address.length; i++)
            address[i] = <OctTreeCell>((address[i] & otherX) | prevX)

        address[leastSignificantBitY] = <OctTreeCell>((address[leastSignificantBitY] & otherY) | nextY)
        for (let i = leastSignificantBitY + 1; i < address.length; i++)
            address[i] = <OctTreeCell>((address[i] & otherY) | prevY)

        address[leastSignificantBitZ] = <OctTreeCell>((address[leastSignificantBitZ] & otherZ) | nextZ)
        for (let i = leastSignificantBitZ + 1; i < address.length; i++)
            address[i] = <OctTreeCell>((address[i] & otherZ) | prevZ)
        
        return address
    }
}