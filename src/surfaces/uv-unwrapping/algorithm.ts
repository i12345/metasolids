import { Vec2 } from "playcanvas-extended";
import { IndicesArray } from "../../utils/indices-array.js";
import { MeshData } from "../mesh-data.js";

export interface SurfaceUVUnwrapping {
    /**
     * Indices of vertices that are duplicated, in the order they're duplicated
     * 
     * Final vertices are made from surface mesh vertices concat'd with
     * surface mesh vertices indexed by each one of these indices. 
     */
    duplicatedVerts: IndicesArray

    /**
     * Final indices; same length as surface mesh indices except some
     * indices are replaced with duplicated vertex indices.
     */
    finalIndices: IndicesArray

    /**
     * UVs (packed xy) per final vertices
     */
    UVs: Float32Array
}

export interface SurfaceUVUnwrappingAlgorithm {
    init(): void
    unwrap(mesh: MeshData): SurfaceUVUnwrapping
}