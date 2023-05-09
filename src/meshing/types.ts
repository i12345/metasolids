// Based off file by theSoenke
// https://github.com/theSoenke/ProceduralTerrain/blob/master/Assets/ProceduralTerrain/Core/Scripts/Voxel/Meshing/MeshData.cs

import { Vec3 } from "playcanvas-extended"
import { IndiciesArray } from "../utils/indices-array.js"

/**
 * Data for mesh creation
 */
export interface MeshData {
    readonly triangles: IndiciesArray
    readonly vertices: Vec3[]
}

/**
 * Hermite data structure
 */
export interface HermiteData {
    readonly intersectionPoints: Vec3[]
    readonly gradientVectors: Vec3[]
}

/**
 * Voxel data
 */
export interface Voxel {
    pos: Vec3
    density: number
}

/**
 * Vertex data
 */
export interface Vertex {
    index: number
    edgeFlags: number
    pos: Vec3
    normal: Vec3
}

/**
 * Y-axis cut of hermite data
 */
export class Row {
    public readonly points: Voxel[]
    public readonly vertices: Vertex[]

    constructor(
            public pos: Vec3,
            public size: Vec3,
        ) {
        this.points = new Array(this.size.x * this.size.z)
        this.vertices = new Array(this.size.x * this.size.z)
    }
}
