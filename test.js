import { fields, volumes, metashapes, ProcessorGraph, surfaces, meshing } from './dist/index.js'
import { plot } from 'nodeplotlib'
import { BoundingBox, Vec3 } from 'playcanvas-extended'

const volume = new metashapes.MetaShapeVolume(new metashapes.MetaSphere())

/**
 * @implements {volumes.Volume}
 */
class SolidBoxVolume {
    boundingBox = new BoundingBox(Vec3.ZERO, Vec3.ONE)

    init() { }

    /**
     * @param {{p: Vec3}} location
     */
    sample({ p }) {
        const presence = (
            (Math.abs(p.x) < 0.5 ? 1 : 0) +
            (Math.abs(p.y) < 0.2 ? 1 : 0) +
            (Math.abs(p.z) < 0.3 ? 1 : 0)
        ) / 3

        return { presence }
    }
}

/**
 * @type {volumes.Volume}
 */
// const volume = new SolidBoxVolume()

const processors = new ProcessorGraph([
    new volumes.VolumeSamplingProcessor(),
    // new surfaces.VolumeSurfaceMeshingProcessor(),
])

/**
 * @type {volumes.VolumeSamplingProcessing & surfaces.VolumeSurfaceMeshingProcessing}
 */
const processing = {
    [volumes.VolumeSamplingProcessing_SamplerSettings]: {
        margin: 2,
        resolution: 4
    },
    [surfaces.VolumeSurfaceMeshingProcessing_Settings]: {
        surfaceLevel: 0.5
    }
}

/**
 * @type {volumes.VolumeProcessingContext & surfaces.VolumeSurfaceMeshingProcessingContext}
 */
const context = {
    samples: {},
    sampling: {
        volume
    },
    [surfaces.VolumeSurfaceMeshingProcessing_Settings]: {
        // algorithm: new meshing.MarchingCubesAlgorithm()
        algorithm: new meshing.SurfaceNetsMeshingAlgorithm()
        // algorithm: new meshing.DualContouringUniformAlgorithm()
    }
}

processors.init(context)
processors.process(processing, context)

const mesh = context[surfaces.VolumeSurfaceMeshingProcessing_Settings].algorithm.mesh(
    processing.sampling,
    processing[surfaces.VolumeSurfaceMeshingProcessing_Settings]
)

// https://plotly.com/javascript/3d-mesh/
plot([
    // {
    //     z: processing.sampling.voxels[1 /*Math.floor(processing.sampling.size.x / 2)*/].map(yz => yz.map(z => z.presence)),
    //     type: 'heatmap'
    // },
    // {
    //     type: 'scatter3d',
    //     x: mesh.vertices.map(v => v.x),
    //     y: mesh.vertices.map(v => v.y),
    //     z: mesh.vertices.map(v => v.z),
    // }
    {
        type: 'mesh3d',
        x: mesh.vertices.map(v => v.x),
        y: mesh.vertices.map(v => v.y),
        z: mesh.vertices.map(v => v.z),
        i: new Array(mesh.triangles.length / 3).fill(0).map((_, i) => mesh.triangles[(3 * i) + 0]),
        j: new Array(mesh.triangles.length / 3).fill(0).map((_, i) => mesh.triangles[(3 * i) + 1]),
        k: new Array(mesh.triangles.length / 3).fill(0).map((_, i) => mesh.triangles[(3 * i) + 2]),
    }
])
