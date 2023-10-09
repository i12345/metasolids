import { FieldPointVector, FieldPointVectorContainer } from "../../fields/vectorized/index.js"
import { PROPERTYKEY_ALL } from "../../paradigm/trees/path.js"
import { SurfaceProcessingContext } from "../../surfaces/processing.js"
import { Surface } from "../../surfaces/surface.js"
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext, VolumeSurfacesKey } from "../../surfaces/volume-surfaces.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { NumberTypedArray } from "../../utils/typed-array.js"
import { VolumeProcessor } from "../../volumes/processor.js"
import { VolumeLocation, VolumeSample, VolumeSamplingContext, Volume } from "../../volumes/volume.js"
import { SolidProcessingContext } from "../processor.js"
import { VolumeProcessingWithSolids, VolumeProcessingWithSolidsContext, VolumeSolidsKey } from "../volume-solids.js"

export class VolumeSurfaceSolidificationProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                > =
            VolumeSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                >,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
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
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > &
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > &
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
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
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
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