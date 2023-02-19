import { Field } from "../field";
import { FieldsInterpolationType } from "../interpolators";
import { FieldInterpolationType, makeInterpolator } from "../interpolation";
import { FieldsPoint, FieldsPointMapped, FieldsPointOmitted, FieldsPoint_Omit_Leaf, fields_point_map } from "../point";

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

    /**
     * Merges multiple {@link FieldsField} fields.
     *
     * @param fields the fields to merge. Earlier fields have higher priority
     */
    static merge<Point extends FieldsPoint = FieldsPoint>(...fields: FieldsField<Point>[]): FieldsField<Point> {
        
    }

    omit<Subtract extends FieldsPoint = FieldsPoint>(fields: FieldsPointMapped<Subtract, typeof FieldsPoint_Omit_Leaf>): FieldsField<FieldsPointOmitted<Point, Subtract>> {
        
    }
}