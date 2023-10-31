import { Vec2 } from "playcanvas-extended";
import { VectorSamplingContext } from "../../fields/domains/index.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../../fields/vectorized/index.js";
import { MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../paradigm/arrays/indices-array.js";
import { NumberTypedArray } from "../../paradigm/arrays/typed-array.js";
import { Texture, TextureLocation, TextureRenderContext, TextureSample, TextureSamplingContext } from "../texture.js";
import { tensor } from "../../fields/index.js";

export class CachedTexture<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Context extends
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        VectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                >
    > implements
    Texture<
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        Context,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        LocationVector,
        SampleVector,
        VectorContext
    > {
    private cache: Sample[] = new Array(0)

    get field() {
        return this.inner.field
    }

    constructor(
        public readonly inner: Texture<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                Sample,
                SampleElementType,
                SampleFuseMode,
                SampleContainer,
                Context,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LocationVector,
                SampleVector,
                VectorContext
            >,
        public readonly resolution: number
    ) { }

    render(resolution: Vec2, context: TextureRenderContext<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Sample,
            SampleElementType,
            SampleFuseMode,
            SampleContainer,
            Context,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LocationVector,
            SampleVector,
            VectorContext
        >): tensor.FieldPointTensor2D<SampleElementType> {
        throw new Error("Method not implemented.")
    }

    init(context: Context): void {
        this.inner.init(context)

        this.cache = new Array(this.resolution ** 2)
    }

    sample(location: Location, context: Context): Sample {
        const coords = [
            Math.min(this.resolution - 1, Math.floor(location.uv.x * this.resolution)),
            Math.min(this.resolution - 1, Math.floor(location.uv.y * this.resolution))
        ]
        const cache_index = coords[0] + (coords[1] * this.resolution)
        const cached = this.cache[cache_index]

        if (cached !== undefined) return cached
        else return this.cache[cache_index] = this.inner.sample(location, context)
    }
}