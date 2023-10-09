import { VolumeSample } from "../volumes/index.js";
import { Surface } from "../surfaces/index.js";
import { IndicesTypedArray } from "../utils/indices-array.js";
import { FieldPointVector, FieldPointVectorContainer } from "../fields/vectorized/index.js";
import { NumberTypedArray } from "../utils/typed-array.js";

export interface Solid<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeSampleElementType extends VolumeSample = VolumeSample,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>
    > {
    surface: SurfaceT
}