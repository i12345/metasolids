import { MultiObjectsIDs, MultiObjectsMapped, MultiObjectsTemplate, PropertyPath, intract, makeExtractor, makeHas, objectValuePaths } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../paradigm/arrays/indices-array.js";
import { Field } from "../field.js";
import { FieldInterpolationType, FieldInterpolator, InterpolationKeypoint, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class MultiObjectsInterpolationType<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        Point extends FieldPoint = FieldPoint
    > implements
    FieldInterpolationType<MultiObjectsMapped<Objects, Point>> {
    constructor(
        public readonly inner: FieldInterpolationType<Point>,
        public readonly multiObjectIDs: MultiObjectsIDs<Objects, ObjIDsT>
    ) { }

    [makeInterpolator]<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
        >(
            keypoints: InterpolationKeypoint<Location, MultiObjectsMapped<Objects, Point>>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>
        ): FieldInterpolator<Location, MultiObjectsMapped<Objects, Point>> | undefined {
        const objInterpolators: { objPath: PropertyPath, objInterpolator: FieldInterpolator<Location, Point> }[] = []

        for (const objPath of objectValuePaths(this.multiObjectIDs.template)) {
            const get = makeExtractor(objPath)
            const has = makeHas(objPath)
            if (!keypoints.some(({ value }) => has(value))) continue

            const objKeypoints = keypoints.map(({ location, value }) => ({ location, value: get(value, false) }))
            const objInterpolator = this.inner[makeInterpolator](objKeypoints, locationField)
            if (objInterpolator === undefined) continue

            objInterpolators.push({ objPath, objInterpolator })
        }

        return location => {
            const result = <MultiObjectsMapped<Objects, Point>>{}
            for (const { objPath, objInterpolator } of objInterpolators)
                intract(result, objPath, objInterpolator(location))
            return result
        }
    }
}