import { MeshData } from "./types.js";
import { VolumeSamplingResult } from "../volumes/sampling.js";

export interface MeshingAlgorithm {
    mesh(volume: VolumeSamplingResult): MeshData
}