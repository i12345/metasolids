import { Field, FieldPoint, FieldPointCombiner, FieldsField, iterObjects, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsTemplate, objectValues, SampleDomainLocationField, SamplingContext } from "../../fields/index.js";
import { extract, intract } from "../../utils/tree.js";
import { Texture, TextureLocation, TextureSample } from "../texture.js";

export type ObjectsCombiningTexturesTemplated<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        SampledTextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends FieldPoint = FieldPoint,
        TextureSamplesGrouped extends
            MultiObjectsGroupsMapped<Groups, TextureSampleT> =
            MultiObjectsGroupsMapped<Groups, TextureSampleT>,
        ValueTextureT extends
            Texture<TextureLocationT & SampledTextureLocationT, TextureSampleT> =
            Texture<TextureLocationT & SampledTextureLocationT, TextureSampleT>,
        ValueTexturesGrouped extends
            MultiObjectsGroupsMapped<Groups, ValueTextureT> =
            MultiObjectsGroupsMapped<Groups, ValueTextureT>
    > = {
        [K in keyof Groups]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
        (TextureSamplesGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TextureSampleT> ?
            ValueTexturesGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], ValueTextureT> ?
            ObjectsCombiningTexturesTemplated<
                Objects,
                Groups[K],
                TextureLocationT,
                SampledTextureLocationT,
                TextureSampleT,
                TextureSamplesGrouped[K],
                ValueTextureT,
                ValueTexturesGrouped[K]
            > :
            never : never) :
        (TextureSamplesGrouped[K] extends TextureSampleT ?
            ValueTexturesGrouped[K] extends Texture<
                    TextureLocationT & SampledTextureLocationT,
                    TextureSamplesGrouped[K]
                > ?
            ObjectsCombiningTexture<
                Objects,
                TextureLocationT,
                SampledTextureLocationT,
                TextureSamplesGrouped[K],
                ValueTexturesGrouped[K]
            > :
            never : never)
    }

export type ObjectsInfluencesTextureSample<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
    > =
    MultiObjectsMapped<Objects, number>

export type ObjectsTextureLocationsTextureSample<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation
    > =
    MultiObjectsMapped<Objects, TextureLocationT>

export class ObjectsCombiningTexture<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        SampledTextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        ValueTextureT extends
            Texture<TextureLocationT & SampledTextureLocationT, TextureSampleT> =
            Texture<TextureLocationT & SampledTextureLocationT, TextureSampleT>
    > implements
    Texture<TextureLocationT, TextureSampleT> {
    field!: Field<TextureSampleT>

    private location_fields!: MultiObjectsMapped<Objects, Field<TextureLocationT & SampledTextureLocationT>>

    constructor(
        public template: Objects,
        public influences: Texture<TextureLocationT, ObjectsInfluencesTextureSample<Objects>>,
        public locations: Texture<TextureLocationT, ObjectsTextureLocationsTextureSample<Objects, SampledTextureLocationT>>,
        public values: MultiObjectsMapped<Objects, ValueTextureT>
    ) { }

    init(context: SamplingContext<TextureLocationT>): void {
        this.locations.init(context)
        this.influences.init(context)

        this.location_fields = {} as MultiObjectsMapped<Objects, Field<TextureLocationT & SampledTextureLocationT>>
        for (const { get, set } of objectValues(this.template)) {
            const value = get<ValueTextureT>(this.values)
            
            if (value) {
                set(this.location_fields, FieldsField.merge<TextureLocationT & SampledTextureLocationT>(
                    get((this.locations.field as FieldsField<ObjectsTextureLocationsTextureSample<Objects, SampledTextureLocationT>>).fields) as FieldsField<SampledTextureLocationT> as FieldsField<TextureLocationT & SampledTextureLocationT>,
                    context[SampleDomainLocationField] as FieldsField<TextureLocationT & SampledTextureLocationT>
                ))
                
                value.init({
                    ...context,
                    [SampleDomainLocationField]: get(this.location_fields)
                })
            }
        }

        const objFields: ValueTextureT["field"][] = []
        iterObjects(this.values, this.template, (values, key, path) =>
            objFields.push(extract<ValueTextureT>(this.values, path).field))
        if (objFields[0] instanceof FieldsField)
            this.field = FieldsField.merge(...(objFields as unknown as FieldsField[])) as unknown as Field<TextureSampleT>
        else this.field = objFields[0]
    }

    sample(location: TextureLocationT, context: SamplingContext<TextureLocationT>): TextureSampleT {
        const influences = this.influences.sample(location, context)
        const locations = this.locations.sample(location, context)
        const values = {} as MultiObjectsMapped<Objects, TextureSampleT>
        
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
                            [SampleDomainLocationField]: extract(this.location_fields, fullpath) as Field<TextureLocationT & SampledTextureLocationT>
                        }
                        const value = value_texture.sample(value_location, value_context)
                        
                        intract(values, fullpath, value)
                    }
                }
            }
        )

        const combiner = FieldPointCombiner.instance as FieldPointCombiner<TextureSampleT, Objects>

        return combiner.combine(
            this.template,
            values,
            influences
        )
    }
}
