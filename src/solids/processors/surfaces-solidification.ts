import { PROPERTYKEY_ALL } from "../../paradigm/trees/path.js"
import { SurfaceProcessingContext } from "../../surfaces/processing.js"
import { Surface } from "../../surfaces/surface.js"
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext, VolumeSurfacesKey } from "../../surfaces/volume-surfaces.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { VolumeProcessor } from "../../volumes/processor.js"
import { VolumeLocation, VolumeSample, VolumeSamplingContext, Volume } from "../../volumes/volume.js"
import { SolidProcessingContext } from "../processor.js"
import { VolumeProcessingWithSolids, VolumeProcessingWithSolidsContext, VolumeSolidsKey } from "../volume-solids.js"

export class VolumeSurfaceSolidificationProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            Volume<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        SurfaceT extends Surface<IndicesT, VolumeSampleT> = Surface<IndicesT, VolumeSampleT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        SolidProcessingContextT extends
            SolidProcessingContext<VolumeSampleProcessingContextT, SurfaceProcessingContextT> =
            SolidProcessingContext<VolumeSampleProcessingContextT, SurfaceProcessingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > &
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > &
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > &
            VolumeProcessingWithSolidsContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT,
                    SolidProcessingContextT
                > =
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > &
            VolumeProcessingWithSolidsContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT,
                    SolidProcessingContextT
                >
    > implements
    VolumeProcessor<
        VolumeLocation,
        VolumeSample,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        VolumeProcessingT,
        VolumeProcessingContextT
    > {
    init() {
        const connections = {
            inputs: [[VolumeSurfacesKey, PROPERTYKEY_ALL, 'mesh']],
            outputs: [[VolumeSolidsKey, PROPERTYKEY_ALL, 'surface']]
        }

        return { connections }
    }

    process(volume: VolumeProcessingT): void {
        for (const surface of volume[VolumeSurfacesKey])
            if (surface.isClosed)
                if (!volume[VolumeSolidsKey].some(solid => solid.surface === surface))
                    volume[VolumeSolidsKey].push({ surface })
    }

    private constructor() { }

    static readonly instance = new this()
}