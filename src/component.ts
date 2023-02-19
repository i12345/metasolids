// import { Mat4, Vec3 } from "playcanvas-extended";
// import { FieldInterpolator } from "./fields/interpolator";
// import { Figure } from "./figures";
// import { Volume } from "./volume";

// export class MetaShape2<
//         Location extends MetaShapeLocation,
//         Sample extends MetaShapeSample
//     > implements Volume<Location, Sample> {
//     private parent: MetaShape2<Location, Sample>
//     transform: Mat4
//     transformInterpolationType: FieldInterpolationType<number, Mat4>;
//     private transformInterpolator: FieldInterpolator<number, Mat4>;

//     figure: Figure

//     falloffWeight: number = 1
//     falloffBias: number = 0
//     zeroPoint: number = 0
//     min: number = 0
//     max: number = Number.POSITIVE_INFINITY
//     subtractive: boolean = false

//     init() {
//         if (this.parent) {
//             this.transformInterpolator = this.transformInterpolationType.makeInterpolator(this.parent.transform, this.transform)
//         }
//     }

//     private localSample_interpolated(p: Vec3, t: number) {
        
//     }

//     private localSample(p: Vec3) {
//         const distance = (t: number) => {

//         }

//         // adapted from https://github.com/darkskyapp/binary-search/blob/master/index.js
//         function search(iterations: number = 10) {
//             let mid: number
//             let cmp: ReturnType<typeof distance>
//             let low = 0, high = 1

//             while (iterations-- > 0) {
//                 mid = (low + high) / 2
//                 cmp = distance(mid);
          
//                 // Too low.
//                 if (cmp.distance < 0.0)
//                     low = mid;
          
//                 // Too high.
//                 else if (cmp.distance > 0.0)
//                     high = mid;
          
//                 // Key found.
//                 else
//                     return { ...cmp, t: mid }
//             }

//             if (low === 0) {
//                 return {
//                     ...distance(0),
//                     t: 0
//                 }
//             } else if (high === 1) {
//                 return {
//                     ...distance(1),
//                     t: 1
//                 }
//             }
//             else {
//                 // Key not found.
//                 return { ...cmp, t: mid }
//             }
//         }

//         const iterations = Math.log2(p_delta.length()) + 5
//         const closest = search(iterations)
//         const t = closest.t
//     }

//     sample(p: Vec3) {
//         const local_p = this._transformInverse.transformPoint(p)
//         const shape_location = change<Location, Location, never>(location, ['p'], { p: local_p })
//         const sample = this.shape.sample(shape_location)
//         const attenuated = Math.exp((Math.log(sample.distance) * this.falloffWeight) + this.falloffBias)
//         const biased = attenuated - this.zeroPoint
//         const clamped = Math.max(this.min, Math.min(this.max, biased))
//         const mode_scale = this.subtractive ? -1 : 1
//         const density = clamped * mode_scale

//         return {
//             ...sample,
//             density
//         }
//     }
// }
export { }
