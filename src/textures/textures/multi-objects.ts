import { iterObjects, MultiObjectsGroup, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsTemplate, objectValues } from "../../paradigm/trees/index.js";
import { Field, FieldPoint, FieldPointCombiner, FieldsPoint, SampleDomainLocationFieldKey, tensor } from "../../fields/index.js";
import { extract, intract } from "../../paradigm/trees/index.js";
import { Texture, TextureLocation, TextureRenderContext, TextureSample, TextureSamplingContext } from "../texture.js";
import { FieldsField } from "../../fields/fields/fields.js";
import { FieldPointVectorContainerStatic } from "../../fields/vectorized/point.js";
import { NumberTypedArray } from "../../paradigm/arrays/typed-array.js";
import { Vec2 } from "playcanvas-extended";

export type ObjectsCombiningTexturesTemplated<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        SampledTextureLocationT extends TextureLocation = TextureLocation,
        SampledTextureLocationElementType extends TextureLocation = SampledTextureLocationT,
        SampledTextureLocationFuseMode extends TextureLocation = SampledTextureLocationT,
        TextureSampleT extends FieldPoint = FieldPoint,
        TextureSampleElementType extends FieldPoint = TextureSampleT,
        TextureSampleFuseMode extends FieldPoint = TextureSampleT,
        TextureSampleTGrouped extends
            MultiObjectsGroupsMapped<Groups, TextureSampleT> =
            MultiObjectsGroupsMapped<Groups, TextureSampleT>,
        TextureSampleElementTypeGrouped extends
            MultiObjectsGroupsMapped<Groups, TextureSampleElementType> =
            MultiObjectsGroupsMapped<Groups, TextureSampleElementType>,
        TextureSampleFuseModeGrouped extends
            MultiObjectsGroupsMapped<Groups, TextureSampleFuseMode> =
            MultiObjectsGroupsMapped<Groups, TextureSampleFuseMode>,
        TextureSamplingContextT extends
            TextureSamplingContext<
                    TextureLocationT & SampledTextureLocationT,
                    TextureLocationElementType & SampledTextureLocationElementType,
                    TextureLocationFuseMode & SampledTextureLocationFuseMode
                > =
            TextureSamplingContext<
                    TextureLocationT & SampledTextureLocationT,
                    TextureLocationElementType & SampledTextureLocationElementType,
                    TextureLocationFuseMode & SampledTextureLocationFuseMode
                >,
        TextureLocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        ValueTextureT extends
            Texture<
                    TextureLocationT & SampledTextureLocationT,
                    TextureLocationElementType & SampledTextureLocationElementType,
                    TextureLocationFuseMode & SampledTextureLocationFuseMode,
                    TextureLocationContainer,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSampleContainer,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT & SampledTextureLocationT,
                    TextureLocationElementType & SampledTextureLocationElementType,
                    TextureLocationFuseMode & SampledTextureLocationFuseMode,
                    TextureLocationContainer,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSampleContainer,
                    TextureSamplingContextT
                >,
        ValueTexturesGrouped extends
            MultiObjectsGroupsMapped<Groups, ValueTextureT> =
            MultiObjectsGroupsMapped<Groups, ValueTextureT>
    > = {
        [K in keyof Groups]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
        (TextureSampleTGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TextureSampleT> ? TextureSampleElementTypeGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TextureSampleElementType> ? TextureSampleFuseModeGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TextureSampleFuseMode> ?
            ValueTexturesGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], ValueTextureT> ?
            ObjectsCombiningTexturesTemplated<
                Objects,
                Groups[K],
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                SampledTextureLocationT,
                SampledTextureLocationElementType,
                SampledTextureLocationFuseMode,
                TextureSampleT,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSampleTGrouped[K],
                TextureSampleElementTypeGrouped[K],
                TextureSampleFuseModeGrouped[K],
                TextureSamplingContextT,
                TextureLocationContainer,
                TextureSampleContainer,
                ValueTextureT,
                ValueTexturesGrouped[K]
            > :
            never : never : never : never) :
        (TextureSampleTGrouped[K] extends TextureSampleT ?
            ValueTexturesGrouped[K] extends Texture<
                    TextureLocationT & SampledTextureLocationT,
                    TextureLocationElementType & SampledTextureLocationElementType,
                    TextureLocationFuseMode & SampledTextureLocationFuseMode,
                    TextureLocationContainer,
                    TextureSampleTGrouped[K],
                    TextureSampleElementTypeGrouped[K],
                    TextureSampleFuseModeGrouped[K],
                    TextureSampleContainer,
                    TextureSamplingContextT
                > ?
            ObjectsCombiningTexture<
                Objects,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                SampledTextureLocationT,
                SampledTextureLocationElementType,
                SampledTextureLocationFuseMode,
                TextureLocationContainer,
                TextureSampleTGrouped[K],
                TextureSampleElementTypeGrouped[K],
                TextureSampleFuseModeGrouped[K],
                TextureSampleContainer,
                TextureSamplingContextT,
                ValueTexturesGrouped[K]
            > :
            never : never)
    }

export type ObjectsInfluencesTextureSample<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
    > =
    MultiObjectsMapped<Objects, number>

export type ObjectsInfluencesTextureSampleElementType<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
    > =
    MultiObjectsGroup<number>

export type ObjectsInfluencesTextureSampleFuseMode<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
    > =
    number

export type ObjectsTextureLocationsTextureSample<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation
    > =
    MultiObjectsMapped<Objects, TextureLocationT>

export type ObjectsTextureLocationsTextureSampleElementType<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureLocationElementType extends TextureLocation = TextureLocation
    > =
    MultiObjectsGroup<TextureLocationElementType>

export type ObjectsTextureLocationsTextureSampleFuseMode<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureLocationFuseMode extends TextureLocation = TextureLocation
    > =
    TextureLocationFuseMode

export class ObjectsCombiningTexture<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        SampledTextureLocationT extends TextureLocation = TextureLocation,
        SampledTextureLocationElementType extends TextureLocation = SampledTextureLocationT,
        SampledTextureLocationFuseMode extends TextureLocation = SampledTextureLocationT,
        TextureLocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        ValueTextureSampleT extends TextureSample = TextureSample,
        ValueTextureSampleElementType extends TextureSample = ValueTextureSampleT,
        ValueTextureSampleFuseMode extends TextureSample = ValueTextureSampleT,
        ValueTextureSampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        ValueTextureT extends
            Texture<
                    TextureLocationT & SampledTextureLocationT,
                    TextureLocationElementType & SampledTextureLocationElementType,
                    TextureLocationFuseMode & SampledTextureLocationFuseMode,
                    TextureLocationContainer,
                    ValueTextureSampleT,
                    ValueTextureSampleElementType,
                    ValueTextureSampleFuseMode,
                    ValueTextureSampleContainer,
                    TextureSamplingContextT &
                    TextureSamplingContext<
                            TextureLocationT & SampledTextureLocationT,
                            TextureLocationElementType & SampledTextureLocationElementType,
                            TextureLocationFuseMode & SampledTextureLocationFuseMode
                        >
                > =
            Texture<
                    TextureLocationT & SampledTextureLocationT,
                    TextureLocationElementType & SampledTextureLocationElementType,
                    TextureLocationFuseMode & SampledTextureLocationFuseMode,
                    TextureLocationContainer,
                    ValueTextureSampleT,
                    ValueTextureSampleElementType,
                    ValueTextureSampleFuseMode,
                    ValueTextureSampleContainer,
                    TextureSamplingContextT &
                    TextureSamplingContext<
                            TextureLocationT & SampledTextureLocationT,
                            TextureLocationElementType & SampledTextureLocationElementType,
                            TextureLocationFuseMode & SampledTextureLocationFuseMode
                        >
                >,
    > implements
    Texture<
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureLocationContainer,
        ValueTextureSampleT,
        ValueTextureSampleElementType,
        ValueTextureSampleFuseMode,
        ValueTextureSampleContainer,
        TextureSamplingContextT
    > {
    field!: Field<ValueTextureSampleT, ValueTextureSampleElementType, ValueTextureSampleFuseMode>

    private location_fields!: MultiObjectsMapped<
        Objects,
        Field<
            TextureLocationT & SampledTextureLocationT,
            TextureLocationElementType & SampledTextureLocationElementType,
            TextureLocationFuseMode & SampledTextureLocationFuseMode
        >
    >

    constructor(
        public template: Objects,
        public influences: Texture<
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureLocationContainer,
                ObjectsInfluencesTextureSample<Objects>,
                ObjectsInfluencesTextureSampleElementType<Objects>,
                ObjectsInfluencesTextureSampleFuseMode<Objects>,
                ValueTextureSampleContainer,
                TextureSamplingContextT
            >,
        public locations: Texture<
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            ObjectsTextureLocationsTextureSample<Objects, SampledTextureLocationT>,
            ObjectsTextureLocationsTextureSampleElementType<Objects, SampledTextureLocationElementType>,
            ObjectsTextureLocationsTextureSampleFuseMode<Objects, SampledTextureLocationFuseMode>,
            ValueTextureSampleContainer,
            TextureSamplingContextT
        >,
        public values: MultiObjectsMapped<Objects, ValueTextureT>
    ) { }

    init(context: TextureSamplingContextT): void {
        this.locations.init(context)
        this.influences.init(context)

        type ValueTextureLocationField = FieldsField<
            TextureLocationT & SampledTextureLocationT,
            TextureLocationElementType & SampledTextureLocationElementType,
            TextureLocationFuseMode & SampledTextureLocationFuseMode
        >

        this.location_fields = {} as MultiObjectsMapped<Objects, ValueTextureLocationField>
        for (const { get, set } of objectValues(this.template)) {
            const value = get<ValueTextureT>(this.values)

            if (value) {
                set(this.location_fields, FieldsField.merge<
                        TextureLocationT & SampledTextureLocationT,
                        TextureLocationElementType & SampledTextureLocationElementType,
                        TextureLocationFuseMode & SampledTextureLocationFuseMode
                    >(
                    get<ValueTextureLocationField>((this.locations.field as FieldsField<
                        ObjectsTextureLocationsTextureSample<Objects, SampledTextureLocationT>,
                        ObjectsTextureLocationsTextureSampleElementType<Objects, SampledTextureLocationElementType>,
                        ObjectsTextureLocationsTextureSampleFuseMode<Objects, SampledTextureLocationFuseMode>
                    >).fields),
                    context[SampleDomainLocationFieldKey] as ValueTextureLocationField
                ))

                value.init({
                    ...context,
                    [SampleDomainLocationFieldKey]: get<ValueTextureLocationField>(this.location_fields)
                })
            }
        }

        const objFields: ValueTextureT["field"][] = []
        iterObjects(this.values, this.template, (values, key, path) =>
            objFields.push(extract<ValueTextureT>(this.values, path).field))
        if (objFields[0] instanceof FieldsField)
            this.field = FieldsField.merge<
                    FieldsPoint & ValueTextureSampleT,
                    FieldsPoint & ValueTextureSampleElementType,
                    FieldsPoint & ValueTextureSampleFuseMode
                >(...(<FieldsField<
                    FieldsPoint & ValueTextureSampleT,
                    FieldsPoint & ValueTextureSampleElementType,
                    FieldsPoint & ValueTextureSampleFuseMode
                >[]>objFields))
        else this.field = objFields[0]
    }

    sample(location: TextureLocationT, context: TextureSamplingContextT): ValueTextureSampleT {
        const influences = this.influences.sample(location, context)
        const locations = this.locations.sample(location, context)
        const values = {} as MultiObjectsMapped<Objects, ValueTextureSampleT>

        type ValueTextureLocationField = FieldsField<
            TextureLocationT & SampledTextureLocationT,
            TextureLocationElementType & SampledTextureLocationElementType,
            TextureLocationFuseMode & SampledTextureLocationFuseMode
        >

        iterObjects(
            this.values,
            this.template,
            (values, key, fullpath) => {
                const influence = extract<number>(influences, fullpath)
                if (influence > 0) {
                    const sample_location = extract<SampledTextureLocationT>(locations, fullpath)
                    const value_texture = values[key] as ValueTextureT
                    if (sample_location && value_texture) {
                        const value_location = {
                            ...location,
                            ...sample_location,
                        }
                        const value_context = {
                            ...context,
                            [SampleDomainLocationFieldKey]: extract<ValueTextureLocationField>(this.location_fields, fullpath)
                        }
                        const value = value_texture.sample(value_location, value_context)

                        intract(values, fullpath, value)
                    }
                }
            }
        )

        const combiner = FieldPointCombiner.instance as FieldPointCombiner<ValueTextureSampleT, Objects>

        return combiner.combine(
            this.template,
            values,
            influences
        )
    }
    
    render(resolution: Vec2, context: TextureRenderContext<
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            ValueTextureSampleT,
            ValueTextureSampleElementType,
            ValueTextureSampleFuseMode,
            ValueTextureSampleContainer,
            TextureSamplingContextT,
            Objects
        >): tensor.FieldPointTensor2D<ValueTextureSampleElementType> {
        throw new Error("Method not implemented.")
    }
}
