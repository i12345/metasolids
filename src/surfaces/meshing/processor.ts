import { calculateNormals, Vec3 } from "playcanvas-extended"
import { VolumeProcessor, VolumeSamplingKey } from "../../volumes/processor.js"
import { VolumeSample, VolumeLocation } from "../../volumes/volume.js"
import { VolumeSurfacesProcessing, SurfaceProcessingContext, VolumeSurfacesProcessingContext, VolumeSurfacesKey } from "../processor.js"
import { MeshDataWithNormals } from "../surface.js"
import { MeshingAlgorithm, MeshingSettings } from "./meshing-algorithm.js"

export const VolumeSurfaceMeshingKey = Symbol("volume.surface-meshing")

export interface VolumeSurfaceMeshingProcessing<
        Sample extends VolumeSample = VolumeSample
    > extends VolumeSurfacesProcessing<Sample> {
}

export interface VolumeSurfaceMeshingProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
    > extends
    VolumeSurfacesProcessingContext<
        Location,
        Sample,
        SampleContextTemplate,
        SurfaceProcessingContextT
    > {
    [VolumeSurfaceMeshingKey]: {
        algorithm: MeshingAlgorithm,
        settings: MeshingSettings
    }
}

export class VolumeSurfaceMeshingProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
    > implements
    VolumeProcessor<
        Location,
        Sample,
        SampleContextTemplate,
        VolumeSurfaceMeshingProcessing<Sample>,
        VolumeSurfaceMeshingProcessingContext<Location, Sample, SampleContextTemplate>
    > {
    readonly connections = {
        inputs: [
            [VolumeSamplingKey]
        ],
        outputs: [
            [VolumeSurfacesKey]
        ]
    }

    constructor() { }

    init(): void {
    }

    process(
            volume: VolumeSurfaceMeshingProcessing<Sample>,
            context: VolumeSurfaceMeshingProcessingContext<
                Location,
                Sample,
                SampleContextTemplate
            >
        ): void {
        const sampling = volume[VolumeSamplingKey]
        const algorithm = context[VolumeSurfaceMeshingKey].algorithm
        const mesh = algorithm.mesh(
            sampling,
            context[VolumeSurfaceMeshingKey].settings
        )

        const vertices = new Float32Array(3 * mesh.vertices.length)
        for (let i = 0; i < mesh.vertices.length; i++) {
            vertices[(3 * i) + 0] = mesh.vertices[i].x
            vertices[(3 * i) + 1] = mesh.vertices[i].y
            vertices[(3 * i) + 2] = mesh.vertices[i].z
        }

        const normals = new Float32Array(calculateNormals(
            vertices as ArrayLike<number> as number[],
            mesh.triangles as ArrayLike<number> as number[]
        ))

        const meshWithNormals: MeshDataWithNormals = {
            ...mesh,
            normals
        }

        const box_min = sampling.boundingBox.getMin()
        const box_size = sampling.boundingBox.halfExtents.clone().mulScalar(2)
        const voxels = sampling.voxels
        const voxels_size = sampling.size

        function interpolateSample(p: Vec3) {
            const voxel_p = p.clone().sub(box_min).mul(voxels_size).div(box_size)
            const voxel_000 = voxel_p.clone().floor()
            // if (((voxel_p.x - voxel_000.x) +
            //     (voxel_p.x - voxel_000.x) +
            //     (voxel_p.x - voxel_000.x)) < 0.01)

            //TODO: implement interpolation

            return voxels[voxel_000.x][voxel_000.y][voxel_000.z]
        }

        const samples = mesh.vertices.map(v => interpolateSample(v))
        volume[VolumeSurfacesKey].push({
            mesh: meshWithNormals,
            samples
        })
    }
}