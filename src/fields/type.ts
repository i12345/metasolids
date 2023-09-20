import { Vec2, Vec3, Vec4, Quat, Mat3, Mat4, Color } from "playcanvas-extended"
import { MultiObjectsGroup, MultiObjectsGroupedObjectsKey } from "../paradigm/trees/multi-objects-groups.js"
import { MultiObjectsTemplate, MultiObjectsMapped, MultiObjectsTemplate_Leaf, MultiObjectsIDs, objectValuePaths } from "../paradigm/trees/multi-objects.js"
import { Reflect_entries, Reflect_fromEntries } from "../utils/reflect-entries.js"
import { FieldPoint, FieldPointPrimitive, Vector, FieldsPoint } from "./point.js"
import { IndicesTypedArray } from "../utils/indices-array.js"
import { extract, hasPath, intract } from "../paradigm/trees/tree.js"
import { TypedArray, typedArrayConstructor } from "../utils/typed-array.js"
import { PropertyPath } from "../paradigm/trees/path.js"

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

export type MultiObjectsFieldPointElement<Point extends FieldPoint = FieldPoint> = MultiObjectsGroup<Point>

export function field_point_new<Point extends FieldPoint = FieldPoint>(type: FieldPointType<Point>): Point {
    if (type instanceof Function)
        return (type === <FieldPointType<Point>>Number) ? <Point>0 : <Point>(new (<FieldPointType<FieldPointPrimitive>>type)())
    else {
        const result: any = {}

        for (const [key, subtype] of Reflect_entries(type))
            if (key !== MultiObjectsGroupedObjectsKey)
                result[key] = field_point_new(<any>subtype)

        return result
    }
}

/**
 * Makes a type that describes this value.
 * 
 * Does not work for multi-object mapped values.
 * 
 * @param p the value to make a type for
 */
export function field_point_type_default<Point extends FieldPoint>(p: Point): FieldPointType<Point> {
    if (typeof p === 'number')
        return <FieldPointType<Point>>Number
    else if (p instanceof Vec2)
        return <FieldPointType<Point>>Vec2
    else if (p instanceof Vec3)
        return <FieldPointType<Point>>Vec3
    else if (p instanceof Vec4)
        return <FieldPointType<Point>>Vec4
    else if (p instanceof Quat)
        return <FieldPointType<Point>>Quat
    else if (p instanceof Mat3)
        return <FieldPointType<Point>>Mat3
    else if (p instanceof Mat4)
        return <FieldPointType<Point>>Mat4
    else if (p instanceof Color)
        return <FieldPointType<Point>>Color
    else if (p instanceof Int8Array ||
        p instanceof Uint8Array ||
        p instanceof Uint8ClampedArray ||
        p instanceof Int16Array ||
        p instanceof Uint16Array ||
        p instanceof Int32Array ||
        p instanceof Uint32Array ||
        p instanceof Float32Array ||
        p instanceof Float64Array)
        return <FieldPointType<Point>>typedArrayConstructor(<TypedArray>p)
    else {
        return Reflect_fromEntries<FieldPointType<Point>>(
            Reflect_entries(<FieldsPoint>p).map(([key, value]) =>
                [key, <FieldPointType>field_point_type_default(value)] as [keyof FieldPointType<Point>, FieldPointType<Point>[keyof FieldPointType<Point>]]))
    }
}

export function field_point_type_singleObj(type: FieldPointType): FieldPointType {
    if (type instanceof Function)
        return type
    else if (MultiObjectsGroupedObjectsKey in type)
        return type[MultiObjectsGroupedObjectsKey]
    else return Reflect_fromEntries<FieldPointType<FieldsPoint>>(Reflect_entries(type).map(([key, subtype]) => <[PropertyKey, FieldPointType]>[key, field_point_type_singleObj(subtype)]))
}

export function field_point_type_is_multiObj(type: FieldPointType): boolean {
    if (type instanceof Function)
        return false
    else if (MultiObjectsGroupedObjectsKey in type)
        return true
    else {
        for (const key of Reflect.ownKeys(type))
            if (field_point_type_is_multiObj(type[key]))
                return true
        
        return false
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

export function field_point_multiObj_count<
        PointT extends FieldPoint = FieldPoint,
        PointElementType extends FieldPoint = PointT,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray
    >(
        type: FieldPointType<PointElementType>,
        point: PointT,
        multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ): number | undefined {
    if (type instanceof Function)
        return undefined
    else if (MultiObjectsGroupedObjectsKey in type) {
        let objs = 0
        for (const path of objectValuePaths(multiObjectIDs!.template))
            if (hasPath(point, path))
                objs++
        return objs
    }
    else {
        const subsizes = Reflect.ownKeys(type).map(key => field_point_multiObj_count(type[key], (<FieldsPoint>point)[key], multiObjectIDs)).filter(size => size !== undefined)
        return subsizes.length > 0 ? Math.max(...(<number[]>subsizes)) : undefined
    }
}

export function field_point_multiObj_IDs<
        PointT extends FieldPoint = FieldPoint,
        PointElementType extends FieldPoint = PointT,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray
    >(
        type: FieldPointType<PointElementType>,
        point: PointT,
        multiObjectIDs: MultiObjectsIDs<Objects, ObjIDsT>,
        IDs: ObjIDsT,
        IDs_length = 0
    ): number {
    if (type instanceof Function)
        return IDs_length
    else if (MultiObjectsGroupedObjectsKey in type) {
        let id_i: number
        let objID: number
        for (const path of objectValuePaths(multiObjectIDs!.template)) {
            if (hasPath(point, path)) {
                objID = extract<number>(multiObjectIDs!.IDs, path)
                for (id_i = 0; id_i < IDs_length; id_i++)
                    if (IDs[id_i] === objID)
                        break
                
                if (id_i === IDs_length)
                    IDs[IDs_length++] = objID
            }
        }
    }
    else {
        for (const key of Reflect.ownKeys(type)) {
            IDs_length = field_point_multiObj_IDs(
                type[key],
                (<FieldsPoint>point)[key],
                multiObjectIDs,
                IDs,
                IDs_length
            )
        }
    }
    return IDs_length
}

export function field_point_multiObj_extract<
        PointT extends FieldPoint = FieldPoint,
        PointElementType extends FieldPoint = PointT,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray
    >(
        type: FieldPointType<PointElementType>,
        point: PointT,
        multiObjectIDs: MultiObjectsIDs<Objects, ObjIDsT>,
        objIDs?: ObjIDsT
    ): [objID: number | undefined, singleObj: PointT | undefined, reduced: FieldPoint][] {
    function* recurse<
        PointT extends FieldPoint = FieldPoint,
        PointElementType extends FieldPoint = PointT
    >(
        type: FieldPointType<PointElementType>,
        point: PointT,
        objPaths: PropertyPath[],
        objID: -1 | number
    ): Generator<[objID: number, singleObj: PointT | undefined, reduced: FieldPoint]> {
        if (type instanceof Function)
            yield [objID, objID !== -1 ? point : undefined, point]
        else if (MultiObjectsGroupedObjectsKey in type) {
            if (objID !== -1)
                throw new Error()

            const subtype = type[MultiObjectsGroupedObjectsKey]
            
            for (const [objID, objPath] of objPaths.entries()) {
                if (hasPath(point, objPath)) {
                    for (const [, , objValue] of recurse(subtype, extract<FieldPoint>(point, objPath), objPaths, objID)) {
                        const singleObj = <FieldsPoint>{}
                        intract(singleObj, objPath, objValue)
                        yield [objID, <PointT>singleObj, objValue]
                    }
                }
            }
        }
        else {
            if (objID === -1) {
                const values_generic = <FieldsPoint>{}
                const values_objs_singleObj = new Array<FieldsPoint>(objPaths.length)
                const values_objs_reduced = new Array<FieldsPoint>(objPaths.length)
                let hasValues_generic = false
                let hasValues_objs = false

                for (const key of Reflect.ownKeys(type)) {
                    const subtype = type[key]
                    const subpoint = (<FieldsPoint>point)[key]

                    for (const [objID, objValue_singleObj, objValue_reduced] of recurse(subtype, subpoint, objPaths, -1)) {
                        if (objID === undefined) {
                            values_generic[key] = objValue_reduced
                            hasValues_generic = true
                        }
                        else {
                            (values_objs_singleObj[objID] ??= {})[key] = objValue_singleObj!;
                            (values_objs_reduced[objID] ??= {})[key] = objValue_reduced;
                            hasValues_objs = true
                        }
                    }
                }

                if (!hasValues_objs)
                    yield [-1, undefined, <PointT>values_generic]
                else {
                    if (hasValues_generic) {
                        for (let objID = 0; objID < objPaths.length; objID++) {
                            if (values_objs_reduced[objID] === undefined) continue
                            
                            Object.assign(values_objs_singleObj[objID], values_generic)
                            Object.assign(values_objs_reduced[objID], values_generic)
                        }
                    }
                    
                    for (let objID = 0; objID < objPaths.length; objID++)
                        if (values_objs_reduced[objID] !== undefined)
                            yield [objID, <PointT>values_objs_singleObj[objID], values_objs_reduced[objID]]
                }
            }
            else {
                const values_obj = <FieldsPoint>{}

                for (const key of Reflect.ownKeys(type)) {
                    const subtype = type[key]
                    const subpoint = (<FieldsPoint>point)[key]

                    for (const [sub_objID, objValue_singleObj, objValue_reduced] of recurse(subtype, subpoint, objPaths, objID)) {
                        if (sub_objID !== objID ||
                            objValue_singleObj !== objValue_reduced)
                            throw new Error()
                        
                        values_obj[key] = objValue_reduced
                    }
                }

                yield [objID, <PointT>values_obj, values_obj]
            }
        }
    }

    const objPaths = objIDs ? [...objIDs].map(objID => multiObjectIDs.paths[objID]) : multiObjectIDs.paths
    const results: [number, PointT | undefined, FieldPoint][] = []

    for (const [relative_objID, objValue_singleObj, objValue_reduced] of recurse(type, point, objPaths, -1)) {
        if (relative_objID === -1)
            return [[undefined, undefined, objValue_reduced]]
        else if (objIDs)
            results.push([objIDs[relative_objID], objValue_singleObj, objValue_reduced])
        else
            results.push([relative_objID, objValue_singleObj, objValue_reduced])
    }

    return results
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