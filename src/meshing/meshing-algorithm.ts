import { MeshData } from "./types.js";
import { VolumeSamplingResult } from "../volumes/sampling.js";

export interface MeshingSettings {
    surfaceLevel: number
}

export interface MeshingAlgorithm {
    mesh(volume: VolumeSamplingResult, settings: MeshingSettings): MeshData
}