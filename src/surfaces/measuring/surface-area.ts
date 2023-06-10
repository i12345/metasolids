import { Vec3 } from "playcanvas-extended"
import { VolumeSample } from "../../volumes/volume.js"
import { SurfaceProcessingContext, SurfaceProcessor } from "../surface-samples.js"
import { Surface } from "../surface.js"

export interface SurfaceWithSurfaceArea<
        Sample extends VolumeSample = VolumeSample
    >
    extends Surface<Sample> {
    surfaceArea: number
}

export class SurfaceWithSurfaceAreaProcessor<
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        SurfaceT extends SurfaceWithSurfaceArea<Sample> = SurfaceWithSurfaceArea<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    >
    implements SurfaceProcessor<
        Sample,
        SampleProcessingContextT,
        SurfaceT,
        SurfaceProcessingContextT
    > {
    init() {
        const connections = {
            inputs: [
                ['mesh']
            ],
            outputs: [
                ['surfaceArea']
            ]
        }
        
        return { connections}
    }
    
    process(surface: SurfaceWithSurfaceArea<Sample>): void {
        let surfaceArea = 0

        for (let i = 0; i < surface.mesh.triangles.length; i += 3) {
            const v0 = surface.mesh.vertices[surface.mesh.triangles[i + 0]]
            const v1 = surface.mesh.vertices[surface.mesh.triangles[i + 1]]
            const v2 = surface.mesh.vertices[surface.mesh.triangles[i + 2]]

            const v01 = new Vec3().sub2(v1, v0)
            const v02 = new Vec3().sub2(v2, v0)
            const area = new Vec3().cross(v01, v02).length()
            
            surfaceArea += area
        }

        surface.surfaceArea = surfaceArea / 2
    }

    private constructor() { }

    static readonly instance = new this()
}