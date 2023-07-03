import { MeshData } from "./types.js";
import { VolumeSamplingResult } from "../../volumes/sampling.js";

export const defaultMeshingSettings: MeshingSettings = {
    surfaceLevel: Math.exp(-1) //MetaShapeVolume.idealSurfaceLevel(MetaShapeVolume.defaultParameters)
}

export interface MeshingSettings {
    surfaceLevel: number
}

export interface MeshingAlgorithm {
    mesh(volume: VolumeSamplingResult, settings: MeshingSettings): MeshData
}