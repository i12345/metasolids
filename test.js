import { Vec2 } from 'playcanvas-extended'
import { fields, volumes, metashapes, ProcessorGraph, surfaces, meshing } from './dist/index.js'
import { plot } from 'nodeplotlib'

const shape = new metashapes.MetaSphere()
const texture = new fields.KeypointsSampleDomain(
    [
        [
            {
                uv: new Vec2(0, 0)
            },
            {
                unit: {
                    height: 0.2,
                    length: 1,
                },
                falloff: {
                    bias: 0,
                    rate: 1
                }
            }
        ],

        [
            {
                uv: new Vec2(1, 0)
            },
            {
                unit: {
                    height: 0.1,
                    length: 1,
                },
                falloff: {
                    bias: 0,
                    rate: 1
                }
            }
        ],

        [
            {
                uv: new Vec2(1, 0.7)
            },
            {
                unit: {
                    height: 0.15,
                    length: 1,
                },
                falloff: {
                    bias: 0,
                    rate: 1
                }
            }
        ],

        [
            {
                uv: new Vec2(0, 0.8)
            },
            {
                unit: {
                    height: 0.2,
                    length: 1,
                },
                falloff: {
                    bias: 0,
                    rate: 1
                }
            }
        ]
    ],
    metashapes.MetaShapeVolume.defaultFields.parametersIn,
    new fields.ConvexPolygonInterpolationType()
)

const volume = new metashapes.MetaShapeVolume(shape, texture)

const processors = new ProcessorGraph([
    new volumes.VolumeSamplingProcessor(),
    new surfaces.VolumeSurfaceMeshingProcessor(),
])

/**
 * @type {volumes.VolumeSamplingProcessing & surfaces.VolumeSurfaceMeshingProcessing}
 */
const processing = {}

/**
 * @type {volumes.VolumeProcessingContext & surfaces.VolumeSurfaceMeshingProcessingContext}
 */
const context = {
    samples: {},
    [volumes.VolumeSamplingKey]: {
        volume,
        settings: {
            margin: 1,
            resolution: 3
        }
    },
    [surfaces.VolumeSurfaceMeshingKey]: {
        // algorithm: new meshing.MarchingCubesAlgorithm()
        // algorithm: new meshing.DualContouringUniformAlgorithm(),
        algorithm: new meshing.SurfaceNetsMeshingAlgorithm(),
        settings: {
            surfaceLevel: 0.5
        }
    },
}

processors.init(context)
processors.process(processing, context)

const mesh = context[surfaces.VolumeSurfaceMeshingKey].algorithm.mesh(
    processing[volumes.VolumeSamplingKey],
    context[surfaces.VolumeSurfaceMeshingKey].settings
)

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

    // https://plotly.com/javascript/3d-mesh/
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
