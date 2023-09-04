import { Field } from "../field.js";
import { FieldsInterpolationType } from "../interpolators/fields.js";
import { FieldInterpolationType, makeInterpolator } from "../interpolation.js";
import { FieldPoint, FieldPointMapped, FieldsPoint, FieldsPointMapped, FieldsPointOmitted, FieldsPoint_Omit_Leaf, fields_point_map } from "../point.js";
import { FieldPointType } from "../type.js"
import { deletePath, extract, pathsToValue } from "../../paradigm/trees/index.js";
import { FuseMode } from "../vectorized/fusing.js";
import { clone } from "../../utils/cloneable.js";

export class FieldsField<
        Point extends FieldsPoint = FieldsPoint,
        PointElementType extends FieldsPoint = Point,
        PointFuseMode extends FieldsPoint = Point,
    >
    implements Field<Point, PointElementType, PointFuseMode> {
    readonly elementType: FieldPointType<PointElementType>
    readonly fuseMode: FuseMode<PointFuseMode>

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

    constructor(public fields: FieldsPointMapped<Point, Field>) {
        this.elementType = <FieldPointType<PointElementType>>fields_point_map(
            fields,
            field => (field.interpolationType && field.interpolationType[makeInterpolator]) !== undefined,
            field => field.elementType
        )

        this.fuseMode = <FuseMode<PointFuseMode>>fields_point_map(
            fields,
            field => (field.interpolationType && field.interpolationType[makeInterpolator]) !== undefined,
            field => field.fuseMode
        )
    }

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
    static merge<
            Point extends FieldsPoint = FieldsPoint,
            PointElementType extends FieldsPoint = Point,
            PointFuseMode extends FieldsPoint = Point,
        >(...fields: FieldsField<Point, PointElementType, PointFuseMode>[]): FieldsField<Point, PointElementType, PointFuseMode> {
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

    omit<
            Subtract extends FieldsPoint = FieldsPoint,
            SubtractElementType extends FieldsPoint = Subtract,
            SubtractFuseMode extends FieldsPoint = Subtract,
        >(
            subtract: FieldsPointMapped<Subtract, typeof FieldsPoint_Omit_Leaf>
        ): FieldsField<
            FieldsPointOmitted<Point, FieldsPointMapped<Subtract, typeof FieldsPoint_Omit_Leaf>>,
            FieldsPointOmitted<PointElementType, FieldsPointMapped<Subtract, typeof FieldsPoint_Omit_Leaf>>,
            FieldsPointOmitted<PointFuseMode, FieldsPointMapped<Subtract, typeof FieldsPoint_Omit_Leaf>>
        > {
        const omitted = fields_point_map(
            this.fields,
            leaf =>
                leaf.interpolationType !== undefined &&
                leaf.interpolationType[makeInterpolator] !== undefined,
            field => field
        ) as any as FieldsPointMapped<FieldsPointOmitted<Point, FieldsPointMapped<Subtract, typeof FieldsPoint_Omit_Leaf>>, Field>

        for (const group of pathsToValue(subtract as any, FieldsPoint_Omit_Leaf))
            deletePath(omitted, group)

        return new FieldsField(omitted)
    }

    [clone]() {
        return new FieldsField(
            fields_point_map(
                this.fields,
                field => field.interpolationType && makeInterpolator in field.interpolationType,
                field => field[clone]()
            )
        )
    }

    static readonly empty = new FieldsField({})
}