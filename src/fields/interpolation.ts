import { Field } from "./field.js"
import { FieldPoint } from "./point.js"

export interface InterpolationKeypoint<
        Location extends FieldPoint = FieldPoint,
        Value = any
    > {
    location: Location
    value: Value
}

export interface FieldInterpolationKeypoint<
        Location extends FieldPoint = FieldPoint,
        Value extends FieldPoint = FieldPoint
    > extends
    InterpolationKeypoint<Location, Value> { }

export type Interpolator<
        Location extends FieldPoint,
        Point
    > = (location: Location) => Point

export const makeInterpolator = Symbol('makeInterpolator')

export interface InterpolationType<Point> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: InterpolationKeypoint<Location, Point>[],
            locationField: Field<Location>
        ): Interpolator<Location, Point>
}

export interface FieldInterpolator<
        Location extends FieldPoint = FieldPoint,
        Value extends FieldPoint = FieldPoint
    > extends
    Interpolator<Location, Value> { }

export interface FieldInterpolationType<
        Value extends FieldPoint = FieldPoint
    > extends
    InterpolationType<Value> { }

export class InterpolationManager implements InterpolationType<any> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: InterpolationKeypoint<Location, any>[],
            locationField: Field<Location>
        ): Interpolator<Location, any> {
        for (const interpolationType of InterpolationManager.interpolationTypes) {
            const interpolator = interpolationType[makeInterpolator](keypoints, locationField)
            if (interpolator)
                return interpolator
        }
         
        return undefined
    }
    
    private static interpolationTypes: InterpolationType<any>[] = []

    static register(type: InterpolationType<any>): void {
        this.interpolationTypes.push(type)
    }

    static [makeInterpolator]<Location extends FieldPoint>(
            keypoints: InterpolationKeypoint<Location, any>[],
            locationField: Field<Location>
        ): Interpolator<Location, any> {
        return this.instance[makeInterpolator](keypoints, locationField)
    }

    static readonly instance = new InterpolationManager()
}