import { MeshDataWithNormals } from "./mesh-data.js";
import { VolumeSample } from "../volumes/volume.js";
import { Instance } from "../paradigm/processing/instance.js";
import { IndicesTypedArray } from "../paradigm/arrays/indices-array.js";
import { FieldPointVector, FieldPointVectorContainer } from "../fields/vectorized/point.js";
import { NumberTypedArray } from "../paradigm/arrays/typed-array.js";

export type SurfaceSample = VolumeSample

export interface Surface<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceSampleElementType extends SurfaceSample = SurfaceSample,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>
    > {
    readonly mesh: MeshDataWithNormals<IndicesT>

    /**
     * These might not be directly from the volume samples, but derived
     * from them.
     */
    readonly samples: SurfaceSampleVector

    /**
     * whether this surface encloses a space or not
     */
    readonly isClosed: boolean
}

export interface SurfaceInstance<SurfaceT extends Surface = Surface>
    extends Instance<SurfaceT> {
}