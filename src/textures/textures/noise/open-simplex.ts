import { Field } from "../../../fields/field.js";
import { openSimplex } from "../../../fields/domains/noise/open-simplex.js";
import { FusedVectorSamplingContext, SeededSamplingContext, TransformingSampleDomain } from "../../../fields/domains/index.js";
import { MultiObjectsTemplate } from "../../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../../paradigm/arrays/indices-array.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects } from "../../../fields/vectorized/index.js";
import { Cloneable, clone } from "../../../utils/cloneable.js";
import { Texture, TextureLocation, TextureRenderContext, TextureSamplingContext, textureTensorSampleUsingVectorSample } from "../../texture.js";
import { Vec2 } from "playcanvas-extended";
import { ScalarField } from "../../../fields/fields/scalar.js";
import { Vec2Field } from "../../../fields/fields/vec2.js";
import { vectorized } from "vectorized-functions";
import { FieldPointTensor2D } from "../../../fields/tensor/tensor.js";
import { NumberTypedArray } from "../../../paradigm/arrays/typed-array.js";

export type OpenSimplexNoiseTextureVersion = keyof typeof openSimplex[2]

export class OpenSimplexNoiseTexture<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureLocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        TextureSampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        ContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        LocationVector extends
            FieldPointVector<TextureLocationElementType, TextureLocationContainer> =
            FieldPointVector<TextureLocationElementType, TextureLocationContainer>,
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                number,
                TextureSampleContainer,
                ObjIDsT,
                ObjIDsContainer
            > =
            FieldPointVectorWithMultiObjects<
                number,
                TextureSampleContainer,
                ObjIDsT,
                ObjIDsContainer
            >,
        VectorContext extends
            FusedVectorSamplingContext<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureLocationContainer,
                    number,
                    number,
                    number,
                    TextureSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    ContextT,
                    LocationVector,
                    SampleVector
                > =
            FusedVectorSamplingContext<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureLocationContainer,
                    number,
                    number,
                    number,
                    TextureSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    ContextT,
                    LocationVector,
                    SampleVector
                >,
    >
    extends TransformingSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,

        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureLocationContainer,
        number,
        number,
        number,
        TextureSampleContainer,
        ContextT,
        LocationVector,
        SampleVector,
        VectorContext,

        Vec2,
        Vec2,
        Vec2,
        TextureLocationContainer,
        number,
        number,
        number,
        TextureSampleContainer,
        SeededSamplingContext<Vec2>
    >
    implements Texture<
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            number,
            number,
            number,
            TextureSampleContainer,
            ContextT,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LocationVector,
            SampleVector,
            VectorContext
        >,
    Cloneable<OpenSimplexNoiseTexture<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureLocationContainer,
        TextureSampleContainer,
        ContextT,
        LocationVector,
        SampleVector,
        VectorContext
    >> {
    private _version!: keyof typeof openSimplex[2]

    protected readonly transformsLocation = true
    protected readonly transformsSample = true

    get version() {
        return this._version
    }

    set version(version) {
        this._version = version
        this.inner = openSimplex[2][version]
    }

    constructor(
        version: OpenSimplexNoiseTextureVersion = "plain",
    ) {
        super(undefined!)
        this.version = version
    }
    
    [clone]() {
        return new OpenSimplexNoiseTexture<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureLocationContainer,
                TextureSampleContainer,
                ContextT,
                LocationVector,
                SampleVector,
                VectorContext
            >(
                this._version,
            )
    }

    readonly field = ScalarField.instance

    protected init_location_field(context: ContextT): Field<Vec2> {
        return Vec2Field.instance
    }

    protected init_make_field(innerField: Field<number>): Field<number> {
        return ScalarField.instance
    }

    render(
            resolution: Vec2,
            context: TextureRenderContext<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureLocationContainer,
                    number,
                    number,
                    number,
                    TextureSampleContainer,
                    ContextT,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    LocationVector,
                    SampleVector,
                    VectorContext
                >
        ): FieldPointTensor2D<number> {
        return textureTensorSampleUsingVectorSample<
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureLocationContainer,
                number,
                number,
                number,
                TextureSampleContainer,
                ContextT,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LocationVector,
                SampleVector,
                VectorContext
            >(this, resolution, context)
    }

    @vectorized(OpenSimplexNoiseTexture.transformLocation_vectorized)
    protected transformLocation(location: TextureLocation): Vec2 {
        return location.uv
    }

    private static transformLocation_vectorized<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureLocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        TextureSampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        ContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        LocationVector extends
            FieldPointVector<TextureLocationElementType, TextureLocationContainer> =
            FieldPointVector<TextureLocationElementType, TextureLocationContainer>,
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                number,
                TextureSampleContainer,
                ObjIDsT,
                ObjIDsContainer
            > =
            FieldPointVectorWithMultiObjects<
                number,
                TextureSampleContainer,
                ObjIDsT,
                ObjIDsContainer
            >,
        VectorContext extends
            FusedVectorSamplingContext<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureLocationContainer,
                    number,
                    number,
                    number,
                    TextureSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    ContextT,
                    LocationVector,
                    SampleVector
                > =
            FusedVectorSamplingContext<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureLocationContainer,
                    number,
                    number,
                    number,
                    TextureSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    ContextT,
                    LocationVector,
                    SampleVector
                >,
        >(
            locations: LocationVector,
        ): FieldPointVector<Vec2, TextureLocationContainer> {
        return locations.uv
    }
}