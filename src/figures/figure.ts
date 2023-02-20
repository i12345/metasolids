import { BoundingBox, Vec2 } from "playcanvas-extended"
import { FieldsPoint, SampleDomain } from "../fields/index.js"

export interface FigureLocation extends FieldsPoint {
    /**
     * The point to sample the figure at
     */
    p: Vec2
}

export interface FigurePerimeterSample extends FieldsPoint {
    /**
     * The closest point in the figure to the sample point
     */
    pointOnFigure: Vec2
}

export interface FigureSample extends FigurePerimeterSample {
    /**
     * The closest distance to the sample point
     */
    distance: number
}

export interface Figure<
        Location extends FigureLocation = FigureLocation,
        Sample extends FigureSample = FigureSample
    > extends SampleDomain<Location, Sample> {
    boundingBox: BoundingBox
}