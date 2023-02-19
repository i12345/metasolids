import { FieldPoint } from "./point"

export type Interpolator<
        Location extends FieldPoint,
        Point
    > = (location: Location) => Point

export const makeInterpolator = Symbol('makeInterpolator')

export interface InterpolationType<Point> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: [Location, Point][]
        ): Interpolator<Location, Point>
}

export type FieldInterpolator<
        Location extends FieldPoint = FieldPoint,
        Point extends FieldPoint = FieldPoint
    > = Interpolator<Location, Point>

export interface FieldInterpolationType<Point extends FieldPoint = FieldPoint>
    extends InterpolationType<Point> { }

export class InterpolationManager implements InterpolationType<any> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: [Location, any][]
        ): Interpolator<Location, any> {
        for (const interpolationType of InterpolationManager.interpolationTypes) {
            const interpolator = interpolationType[makeInterpolator](keypoints)
            if (interpolator)
                return interpolator
        }
         
        return undefined
    }
    
    private static interpolationTypes: InterpolationType<any>[]

    static register(type: InterpolationType<any>): void {
        this.interpolationTypes.push(type)
    }

    static [makeInterpolator]<Location extends FieldPoint>(keypoints: [Location, any][]): Interpolator<Location, any> {
        return this.instance[makeInterpolator](keypoints)
    }

    static readonly instance = new InterpolationManager()
}