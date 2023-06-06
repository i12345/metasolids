import { Vec2 } from "playcanvas-extended";
import { MeshData } from "../meshing/types.js";
import { IndiciesArray } from "../../utils/indices-array.js";

export interface SurfaceUVUnwrapping {
    /**
     * Indices of vertices that are duplicated, in the order they're duplicated
     * 
     * Final vertices are made from surface mesh vertices concat'd with
     * surface mesh vertices indexed by each one of these indices. 
     */
    duplicatedVerts: IndiciesArray

    /**
     * Final indices; same length as surface mesh indices except some
     * indices are replaced with duplicated vertex indices.
     */
    finalIndices: IndiciesArray

    /**
     * UVs, per final vertices
     */
    UVs: Vec2[]
}

export interface SurfaceUVUnwrappingAlgorithm {
    init(): void
    unwrap(mesh: MeshData): SurfaceUVUnwrapping
}