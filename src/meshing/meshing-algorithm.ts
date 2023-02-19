import { MeshData } from "./types";
import { VolumeSample, VolumeSamplingResult } from "../volumes";

export interface MeshingAlgorithm {
    mesh<Sample extends VolumeSample = VolumeSample>(volume: VolumeSamplingResult<Sample>): MeshData<Sample>
}