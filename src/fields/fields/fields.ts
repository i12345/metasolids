import { Field } from "../field.js";
import { FieldsInterpolationType } from "../interpolators/fields.js";
import { FieldInterpolationType, InterpolationType, makeInterpolator } from "../interpolation.js";
import { FieldPoint, FieldPointMapped, FieldsPoint, FieldsPointMapped, FieldsPointOmitted, FieldsPoint_Omit_Leaf, fields_point_map } from "../point.js";
import { extract, iterTreeByLeavesValue } from "../../utils/tree.js";

export class FieldsField<Point extends FieldsPoint = FieldsPoint>
    implements Field<Point> {
    get interpolationType(): FieldInterpolationType<Point> {
        return new FieldsInterpolationType<Point>(
            fields_point_map<Point, Field, FieldInterpolationType>(
                this.fields,
                leaf =>
                    leaf.interpolationType !== undefined &&
                    leaf.interpolationType[makeInterpolator] !== undefined,
                field => field.interpolationType
            )
        )
    }

    constructor(public fields: FieldsPointMapped<Point, Field>) { }

    distance(x: Point, y: Point): number {
        let distance = 0

        fields_point_map(
            this.fields,
            leaf =>
                leaf.interpolationType !== undefined &&
                leaf.interpolationType[makeInterpolator] !== undefined,
            (field, path) => distance += field.distance(
                extract<FieldPoint>(x, path),
                extract<FieldPoint>(y, path)
            )
        )

        return distance
    }

    /**
     * Merges multiple {@link FieldsField} fields.
     *
     * @param fields the fields to merge. Earlier fields have higher priority
     */
    static merge<Point extends FieldsPoint = FieldsPoint>(...fields: FieldsField<Point>[]): FieldsField<Point> {
        let result = {}

        function mergeIn(subfields: Field | FieldsPointMapped<FieldsPoint, Field>, subresult: any): FieldPointMapped<FieldPoint, Field> | undefined {
            if (!subfields)
                return undefined
            else if (subfields.interpolationType &&
                (subfields.interpolationType as FieldInterpolationType)[makeInterpolator]) {
                return (subfields instanceof FieldsField) ?
                    mergeIn(subfields.fields, subresult) :
                    subfields
            }
            else { // subfields is FieldsPointMapped<FieldsPoint, Field>
                for (const key of Reflect.ownKeys(subfields))
                    if (!(subresult[key] = mergeIn(
                            (subfields as FieldsPointMapped<FieldsPoint, Field>)[key],
                            subresult[key] ??= {}
                        )))
                        delete subresult[key]

                return subresult
            }
        }

        for (const field of fields)
            if (field)
                mergeIn(field.fields, result)
        
        return new FieldsField(result as FieldsPointMapped<Point, Field>)
    }

    omit<Subtract extends FieldsPoint = FieldsPoint>(
            subtract: FieldsPointMapped<Subtract, typeof FieldsPoint_Omit_Leaf>
        ): FieldsField<FieldsPointOmitted<Point, FieldsPointMapped<Subtract, typeof FieldsPoint_Omit_Leaf>>> {
        return new FieldsField(fields_point_map(
            this.fields,
            leaf =>
                leaf.interpolationType !== undefined &&
                leaf.interpolationType[makeInterpolator] !== undefined,
            (field, path) =>
                extract(subtract, path) !== FieldsPoint_Omit_Leaf ?
                    field : undefined
        ) as any as FieldsPointMapped<FieldsPointOmitted<Point, FieldsPointMapped<Subtract, typeof FieldsPoint_Omit_Leaf>>, Field>)
    }

    static readonly empty = new FieldsField({})
}