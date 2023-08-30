import { Vec2, Vec3, Vec4, Quat, Mat3, Mat4, Color } from "playcanvas-extended"
import { MultiObjectsGroupedObjectsKey } from "../paradigm/trees/multi-objects-groups.js"
import { MultiObjectsTemplate, MultiObjectsMapped, MultiObjectsTemplate_Leaf } from "../paradigm/trees/multi-objects.js"
import { Reflect_entries } from "../utils/reflect-entries.js"
import { FieldPoint, FieldPointPrimitive, Vector, FieldsPoint } from "./point.js"

export type FieldPointType<Point extends FieldPoint = FieldPoint> =
    Point extends FieldPointPrimitive ? (
        Point extends number ? typeof Number :
        Point extends Vec2 ? typeof Vec2 :
        Point extends Vec3 ? typeof Vec3 :
        Point extends Vec4 ? typeof Vec4 :
        Point extends Quat ? typeof Quat :
        Point extends Mat3 ? typeof Mat3 :
        Point extends Mat4 ? typeof Mat4 :
        Point extends Color ? typeof Color :
        Point extends Vector ? (
            Point extends Uint8Array ? typeof Uint8Array :
            Point extends Uint8ClampedArray ? typeof Uint8ClampedArray :
            Point extends Int8Array ? typeof Int8Array :
            Point extends Uint16Array ? typeof Uint16Array :
            Point extends Int16Array ? typeof Int16Array :
            Point extends Uint32Array ? typeof Uint32Array :
            Point extends Int32Array ? typeof Int32Array :
            Point extends Float32Array ? typeof Float32Array :
            Point extends Float64Array ? typeof Float64Array :
            Point extends Array<number> ? typeof Array :
            never
        ) :
        never
    ):
    Point extends FieldsPoint ? {
        [K in keyof Point]:
            //TODO: there can be separate PointType type
            K extends typeof MultiObjectsGroupedObjectsKey ?
                FieldPointType :
                FieldPointType<Point[K]>
    } :
    never

export type MultiObjectsFieldPointElement<Point extends FieldPoint = FieldPoint> = { [MultiObjectsGroupedObjectsKey]: Point }

export function field_point_new<Point extends FieldPoint = FieldPoint>(type: FieldPointType<Point>): Point {
    if (type instanceof Function)
        return <Point>(new (<FieldPointType<FieldPointPrimitive>>type)())
    else {
        const result: any = {}

        for (const [key, subtype] of Reflect_entries(type))
            if (key !== MultiObjectsGroupedObjectsKey)
                result[key] = field_point_new(<any>subtype)

        return result
    }
}

export function field_point_type_contains<Superset extends FieldPoint, Subset extends FieldPoint>(
        superset: FieldPointType<Superset>,
        subset: FieldPointType<Subset>
    ): boolean {
    if (MultiObjectsGroupedObjectsKey in superset)
        return field_point_type_contains((<FieldPointType<{ [MultiObjectsGroupedObjectsKey]: FieldPoint }>>superset)[MultiObjectsGroupedObjectsKey], subset)
    else if (MultiObjectsGroupedObjectsKey in subset)
        return field_point_type_contains(superset, (<FieldPointType<{ [MultiObjectsGroupedObjectsKey]: FieldPoint }>>subset)[MultiObjectsGroupedObjectsKey])
    else if (superset instanceof Function)
        return superset === <Function>subset
    else {
        for (const [key, sub_subset] of Reflect_entries(subset)) {
            if (!(key in superset))
                return false
            if (!field_point_type_contains((<FieldPointType<FieldsPoint>>superset)[key], <FieldPointType>sub_subset))
                return false
        }
        return true
    }
}

const field_point_sizes = new Map<FieldPointType<FieldPointPrimitive>, number>([
    [Number, 1],
    [Vec2, 2],
    [Vec3, 3],
    [Vec4, 4],
    [Quat, 4],
    [Color, 4],
    [Mat3, 9],
    [Mat4, 16],
])

/**
 * Size (in scalars) of a type of field point
 */
export function field_point_type_size<Point extends FieldPoint = FieldPoint>(type: FieldPointType<Point>): number {
    if (type instanceof Function)
        return field_point_sizes.get(type)!
    else return Reflect_entries(type).reduce((sum, [, subtype]) => sum + field_point_type_size(<FieldPointType>subtype), 0)
}

function field_point_fits_type_obj<
        Point extends FieldPoint,
        Objects extends MultiObjectsTemplate
    >(
        p: MultiObjectsMapped<Objects, Point>,
        objType: FieldPointType<Point>,
        objectsTemplate: Objects,
        subObjectsTemplate: MultiObjectsTemplate = objectsTemplate
    ): boolean {
    for (const [key, subP] of Reflect_entries(p)) {
        if (!(key in subObjectsTemplate))
            return false
        
        const subSubObjectsTemplate = subObjectsTemplate[key]
        if (subSubObjectsTemplate === MultiObjectsTemplate_Leaf) {
            if (!field_point_fits_type(<Point>subP, objType, objectsTemplate))
                return false
        }
        else if (!field_point_fits_type_obj(<MultiObjectsMapped<Objects, Point>>subP, objType, objectsTemplate, subSubObjectsTemplate))
            return false
    }
    return true
}

export function field_point_fits_type<
        Point extends FieldPoint,
        Objects extends MultiObjectsTemplate
    >(
        p: Point,
        type: FieldPointType<Point>,
        objectsTemplate: Objects
    ): boolean {
    if (type instanceof Function) {
        if (<Function>type === Number)
            return typeof p === 'number'
        else return p instanceof type
    }
    else {
        if (!(typeof p === 'object') || p === null)
            return false

        for (const key of Reflect.ownKeys(type)) {
            if (key === MultiObjectsGroupedObjectsKey) {
                if (!field_point_fits_type_obj(<MultiObjectsMapped<Objects, FieldPoint>>(<any>p)[key], <FieldPointType>type[key], objectsTemplate))
                    return false
            }
            else if (!(key in p))
                // return false // if testing equality
                continue
            else if (!field_point_fits_type(<FieldPoint>(p as any)[key], type[key], objectsTemplate))
                return false
        }
        return true
    }
}