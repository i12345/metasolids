import { Vec3 } from "playcanvas-extended"
import { VolumeSample } from "../../volumes/volume.js"
import { SurfaceProcessingContext, SurfaceProcessor } from "../processing.js"
import { Surface } from "../surface.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"

export interface SurfaceWithSurfaceArea<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeSampleT extends VolumeSample = VolumeSample
    >
    extends Surface<IndicesT, VolumeSampleT> {
    surfaceArea: number
}

export class SurfaceWithSurfaceAreaProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceSampleT extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        SurfaceT extends
            SurfaceWithSurfaceArea<IndicesT, SurfaceSampleT> =
            SurfaceWithSurfaceArea<IndicesT, SurfaceSampleT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    >
    implements SurfaceProcessor<
        IndicesT,
        SurfaceSampleT,
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
    
    process(surface: SurfaceWithSurfaceArea<IndicesT, SurfaceSampleT>): void {
        let surfaceArea = 0

        const { vertices, triangles } = surface.mesh

        for (let i = 0; i < /* surface.mesh. */triangles.length; i += 3) {
            const v0i = triangles[i + 0]
            const v0x = vertices[(3 * v0i) + 0]
            const v0y = vertices[(3 * v0i) + 1]
            const v0z = vertices[(3 * v0i) + 2]
            
            const v1i = triangles[i + 1]
            const v1x = vertices[(3 * v1i) + 0]
            const v1y = vertices[(3 * v1i) + 1]
            const v1z = vertices[(3 * v1i) + 2]

            const v2i = triangles[i + 2]
            const v2x = vertices[(3 * v2i) + 0]
            const v2y = vertices[(3 * v2i) + 1]
            const v2z = vertices[(3 * v2i) + 2]

            const v01x = v1x - v0x
            const v01y = v1y - v0y
            const v01z = v1z - v0z

            const v02x = v2x - v0x
            const v02y = v2y - v0y
            const v02z = v2z - v0z

            const area = Math.sqrt(
                (((v01y * v02z) - (v01z * v02y)) ** 2) +
                (((v01z * v02x) - (v01x * v02z)) ** 2) +
                (((v01x * v02y) - (v01y * v02x)) ** 2)
            )
            
            surfaceArea += area
        }

        surface.surfaceArea = surfaceArea / 2
    }

    private constructor() { }

    static readonly instance = new this()
}