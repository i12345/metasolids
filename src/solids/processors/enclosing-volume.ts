import { Vec2 } from "playcanvas-extended";
import { Triangles2DMesh, Triangles2DMeshCollider, Triangles2DMeshInterpolator } from "../../fields/index.js";
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer } from "../../processor/index.js";
import { Surface, SurfaceProcessingContext } from "../../surfaces/index.js";
import { VolumeLocation, VolumeSample, VolumeSamplingKey } from "../../volumes/index.js";
import { SolidProcessingContext, VolumeSolidProcessingContext, VolumeSolidProcessor } from "../processor.js";
import { Solid } from "../solid.js";
import { PROPERTYKEY_ALL } from "../../utils/property-path.js";

export interface SolidWithEnclosingVolume<
        Sample extends VolumeSample = VolumeSample,
        SurfaceT extends Surface<Sample> = Surface<Sample>
    >
    extends Solid<Sample, SurfaceT> {
    voxels: Sample[]
    totalVolume: number
}

export class SolidWithEnclosingVolumeProcessor<
        Location extends VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        SolidT extends
            SolidWithEnclosingVolume<Sample, SurfaceT> =
            SolidWithEnclosingVolume<Sample, SurfaceT>
    > implements
    VolumeSolidProcessor<
            Location,
            Sample,
            SampleContextTemplate,
            SurfaceT,
            SurfaceProcessingContextT,
            SolidT
        > {
    init(context: VolumeSolidProcessingContext<
            Location,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT
        >): void {
    }

    readonly dependencies = [
        ['surface', 'mesh']
    ]

    readonly connections = {
        inputs: [
            ['surface', 'mesh']
        ],
        outputs: [
            ['voxels'],
            ['totalVolume']
        ]
    }

    process(
            solid: SolidT,
            context: VolumeSolidProcessingContext<
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT
            >
        ): void {
        // from StackOverflow comment https://stackoverflow.com/a/6576840

        // This algorithm will index the triangles into 2D cells (a triangle
        // can be in more than one cell), and then it can quickly find the
        // number of intersecting triangles to determine if a point is
        // inside or outside the solid.

        const mesh = solid.surface.mesh

        solid.voxels = []

        const xy = mesh.vertices.map(v => new Vec2(v.x, v.y))
        const z = mesh.vertices.map(v => v.z)

        const z_interpolator = new Triangles2DMeshInterpolator(z, mesh.triangles)
        const triangles_mesh = Triangles2DMesh.build(xy, mesh.triangles)
        const triangles_meshCollider = new Triangles2DMeshCollider(triangles_mesh)

        const sampling = context[ParallelizedContextParallelInfo].item![VolumeSamplingKey]

        const local_space_offset_3d = sampling.boundingBox.getMin()
        const local_space_offset = new Vec2(
            local_space_offset_3d.x,
            local_space_offset_3d.y
        )

        const local_space_size = new Vec2(
            sampling.boundingBox.halfExtents.x,
            sampling.boundingBox.halfExtents.y,
        ).mulScalar(2)

        const voxels_size = new Vec2(
            sampling.size.x,
            sampling.size.y,
        )

        let total_z_inside = 0
        
        for (let x = 0; x < sampling.size.x; x++) {
            for (let y = 0; y < sampling.size.y; y++) {
                const local_space = new Vec2(x, y)
                    .div(voxels_size)
                    .mul(local_space_size)
                    .add(local_space_offset)

                let z_intercepts: number[] = []

                triangles_meshCollider.collide(
                    local_space,
                    (tri, w1, w2) => {
                        const z = z_interpolator.interpolate(tri, w1, w2)
                        z_intercepts.push(z)
                    }
                )

                if (z_intercepts.length === 0)
                    continue

                if ((z_intercepts.length % 2) === 1) {
                    console.warn('solid surface might not be closed')
                    continue
                }
                
                z_intercepts.sort((a, b) => a - b)
                // The Z intercepts are now in ascending order
                
                for (let i = 0; i < z_intercepts.length; i += 2)
                    total_z_inside += z_intercepts[i + 1] - z_intercepts[i]

                let inside = false
                let z_intercept_next_index = 0,
                    z_intercept_next_value = z_intercepts[0]
                
                for (let z = 0; z < sampling.size.z; z++) {
                    const local_z = z * sampling.boundingBox.halfExtents.z * 2 / sampling.size.z
                    
                    if ((inside && local_z >= z_intercept_next_value) ||
                        (!inside && local_z > z_intercept_next_value)) {
                        inside = !inside
                        z_intercept_next_value = z_intercepts[z_intercept_next_index++]
                    }
                    
                    if (inside)
                        solid.voxels.push(sampling.voxels[x][y][z])
                }
            }
        }

        solid.totalVolume = total_z_inside *
            (local_space_size.x * local_space_size.y) /
            (sampling.size.x * sampling.size.y)
    }
}

export type SolidEnclosingVolumeSampleProcessingContext<
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
        SurfaceProcessingContext<SampleContextTemplate>,
        SolidT extends
            SolidWithEnclosingVolume<
                    Sample,
                    SurfaceT
                > =
            SolidWithEnclosingVolume<
                    Sample,
                    SurfaceT
        >,
        SolidProcessingContextT extends
            SolidProcessingContext<
                    SampleContextTemplate,
                    SurfaceProcessingContextT
            > =
            SolidProcessingContext<
                    SampleContextTemplate,
                    SurfaceProcessingContextT
                >
    > =
    SampleContextTemplate &
    ParallelizedContext<
            SolidT,
            SolidProcessingContextT
        >

export interface SolidEnclosingVolumeSampleProcessor<
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        SolidT extends
            SolidWithEnclosingVolume<Sample, SurfaceT> =
            SolidWithEnclosingVolume<Sample, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<
                SampleContextTemplate,
                SurfaceProcessingContextT
            > =
            SolidProcessingContext<
                SampleContextTemplate,
                SurfaceProcessingContextT
            >
    > extends
    ParallelizedProcessor<
        SolidT,
        SolidProcessingContextT,
        Sample,
        SolidEnclosingVolumeSampleProcessingContext<
            Sample,
            SampleContextTemplate,
            SurfaceT,
            SurfaceProcessingContextT,
            SolidT,
            SolidProcessingContextT
        >
    > { }

export class SolidEnclosingVolumeSampleParallelizer<
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        SolidT extends
            SolidWithEnclosingVolume<Sample, SurfaceT> =
            SolidWithEnclosingVolume<Sample, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<
                SampleContextTemplate,
                SurfaceProcessingContextT
            > =
            SolidProcessingContext<
                SampleContextTemplate,
                SurfaceProcessingContextT
            >
    > implements
    Parallelizer<
        SolidT,
        SolidProcessingContextT,
        Sample,
        SolidEnclosingVolumeSampleProcessingContext<
            Sample,
            SampleContextTemplate,
            SurfaceT,
            SurfaceProcessingContextT,
            SolidT,
            SolidProcessingContextT
        >
    > {
    readonly parallelizedPath = ['voxels', PROPERTYKEY_ALL]
    
    init(
            context: SolidProcessingContextT,
            parallelizedItemProcessor: ParallelizedProcessor<
                SolidT,
                SolidProcessingContextT,
                Sample,
                SolidEnclosingVolumeSampleProcessingContext<
                    Sample,
                    SampleContextTemplate,
                    SurfaceT,
                    SurfaceProcessingContextT,
                    SolidT,
                    SolidProcessingContextT
                >
        >): void {
        type SampleContext = SolidEnclosingVolumeSampleProcessingContext<
            Sample,
            SampleContextTemplate,
            SurfaceT,
            SurfaceProcessingContextT,
            SolidT,
            SolidProcessingContextT
        >
        
        const parallelizedContext: SampleContext = {
            ...context.sample,
            [ParallelizedContextParallelInfo]: { item: undefined, context }
        }

        parallelizedItemProcessor.init(parallelizedContext)
    }
    
    parallelize(
            solid: SolidT,
            context: SolidProcessingContextT,
            sampleProcessor: ParallelizedProcessor<
                SolidT,
                SolidProcessingContextT,
                Sample,
                SolidEnclosingVolumeSampleProcessingContext<
                    Sample,
                    SampleContextTemplate,
                    SurfaceT,
                    SurfaceProcessingContextT,
                    SolidT,
                    SolidProcessingContextT
                >
            >
        ): void {
        type SampleContext = SolidEnclosingVolumeSampleProcessingContext<
            Sample,
            SampleContextTemplate,
            SurfaceT,
            SurfaceProcessingContextT,
            SolidT,
            SolidProcessingContextT
        >
        
        const parallelizedContext: SampleContext = {
            ...context.sample,
            [ParallelizedContextParallelInfo]: { item: solid, context }
        }

        for (const sample of solid.voxels)
            sampleProcessor.process(sample, parallelizedContext)
    }
}