import { MultiObjectsGroupedObjectsKey } from "../../paradigm/trees/multi-objects-groups.js";
import { MultiObjectsIDs, MultiObjectsMapped, MultiObjectsTemplate, objectValuePaths } from "../../paradigm/trees/multi-objects.js";
import { extract, hasPath } from "../../paradigm/trees/tree.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { Field } from "../field.js";
import { MultiObjectsInterpolationType } from "../interpolators/multi-objects.js";
import { FieldPoint } from "../point.js";
import { FieldPointType, MultiObjectsFieldPointElement } from "../type.js"

export class MultiObjectsField<
        Point extends FieldPoint = FieldPoint,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
    > implements
    Field<
        MultiObjectsMapped<Objects, Point>,
        MultiObjectsFieldPointElement<Point>,
        Point
    > {
    readonly interpolationType = new MultiObjectsInterpolationType<Objects, ObjIDsT, Point>(this.inner.interpolationType, this.multiObjectsIDs)

    readonly elementType = <FieldPointType<MultiObjectsFieldPointElement<Point>>>{ [MultiObjectsGroupedObjectsKey]: this.inner.elementType }

    readonly fuseMode = this.inner.fuseMode

    constructor(
        public readonly inner: Field<Point>,
        public readonly multiObjectsIDs: MultiObjectsIDs<Objects, ObjIDsT>
    ) { }

    distance(
            x: MultiObjectsMapped<Objects, Point>,
            y: MultiObjectsMapped<Objects, Point>
        ): number {
        let distances = 0
        const pow = 2

        for (const objPath of objectValuePaths(this.multiObjectsIDs.template)) {
            const x_i = hasPath(x, objPath) ? extract(x, objPath) : undefined
            const y_i = hasPath(y, objPath) ? extract(y, objPath) : undefined
            if (x_i !== undefined || y_i !== undefined)
                distances += (this.inner.distance(<Point>x_i, <Point>y_i) ** pow)
        }

        return distances ** (1 / pow)
    }
}