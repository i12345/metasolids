import { OctTreeReferencesOctTreeLayersGrouped } from "../paradigm/octtree/references.js"
import { IndicesTypedArray } from "../utils/indices-array.js"

/**
 * Data for mesh creation
 */
export interface MeshData<IndicesT extends IndicesTypedArray = IndicesTypedArray> {
    readonly triangles: IndicesTypedArray
    // should float64 array be used?
    // or should an integeral type be supported?
    readonly vertices: Float32Array
    readonly dualCellReferences: OctTreeReferencesOctTreeLayersGrouped<IndicesT>
}

export interface MeshDataWithNormals<IndicesT extends IndicesTypedArray = IndicesTypedArray>
    extends MeshData<IndicesT> {
    // should float64 array be used?
    // or should an integeral type be supported?
    normals: Float32Array
}