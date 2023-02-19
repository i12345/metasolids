// Based off file by theSoenke
// https://github.com/theSoenke/ProceduralTerrain/blob/master/Assets/ProceduralTerrain/Core/Scripts/Voxel/Meshing/MeshData.cs

import { Vec3 } from "playcanvas-extended"
import { VolumeSample } from "../volumes/volume"

/**
 * Data for mesh creation
 */
export interface MeshData<Sample extends VolumeSample = VolumeSample> {
    readonly triangles: number[]
    readonly vertices: Vec3[]
    readonly vertecies_samples: Sample[]
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
    public static sizeX: number
    public static sizeZ: number
    public pos: Vec3
    public readonly points: Voxel[] = new Array(Row.sizeX * Row.sizeZ)
    public readonly vertices: Vertex[] = new Array(Row.sizeX * Row.sizeZ)
}
