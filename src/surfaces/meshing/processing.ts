import { OctTreeWithDualGroups, OctTreeWithDualValue, OctTreeWithDualValuesGrouped, OctTreeWithDualLayer, OctTreeWithDualLayersGrouped, OctTreeWithDualOctTreesGrouped } from "../../paradigm/octtree/dual.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { VolumeProcessingContextWithSampling, VolumeProcessingWithSampling } from "../../volumes/sampling/types.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/volume.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";
import { SurfaceProcessingContext } from "../processing.js";
import { SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValue, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayer, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped } from "../sampling/surface-net.js";
import { Surface } from "../surface.js";
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext } from "../volume-surfaces.js";

export type VolumeProcessingWithMeshing<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            VolumeWithBoundingBox<
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
            Surface<IndicesT, VolumeSampleElementType> =
            Surface<IndicesT, VolumeSampleElementType>,
    > =
        VolumeProcessingWithSurfaces<
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
                SurfaceT
            > &
        VolumeProcessingWithSampling<
                IndicesT,
                OctTreeWithDualGroups,
                OctTreeWithDualValuesGrouped,
                OctTreeWithDualLayersGrouped, // <IndicesT>,
                OctTreeWithDualOctTreesGrouped, // <IndicesT>,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT
            > &
        VolumeProcessingWithSampling<
                IndicesT,
                SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
                SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
                SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped, // <IndicesT>,
                SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped, // <IndicesT>,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT
            >

export type VolumeProcessingContextWithMeshing<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>
    > =
    VolumeProcessingWithSurfacesContext<
            VolumeSampleProcessingContextT,
            SurfaceProcessingContextT
        > &
    VolumeProcessingContextWithSampling<
            IndicesT,
            OctTreeWithDualGroups,
            OctTreeWithDualValuesGrouped,
            OctTreeWithDualLayersGrouped, // <IndicesT>,
            OctTreeWithDualOctTreesGrouped, // <IndicesT>,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT//,
        > &
    VolumeProcessingContextWithSampling<
            IndicesT,
            SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
            SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
            SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped, // <IndicesT>,
            SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped, // <IndicesT>,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT//,
        >