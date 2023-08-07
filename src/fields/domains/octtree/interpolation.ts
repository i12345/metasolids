import { Vec3 } from "playcanvas-extended";
import { SamplingContext } from "../../domain.js";
import { FieldPoint, field_point_add_inplace_weighted, field_point_multiply, field_point_subtract } from "../../point.js";
import { Field } from "../../field.js";
import { OctTree, OctTreeSpace } from "../../../paradigm/octtree/index.js";
import { Sign } from "../../../utils/sign.js";
import { OctTreeSampleDomain } from "./interface.js";

const SQRT_1 = 1
const SQRT_2 = Math.SQRT2
const SQRT_3 = Math.sqrt(3)

export class InterpolationOctTreeSampleDomain<T extends FieldPoint, Layer extends ArrayLike<T>>
    implements OctTreeSampleDomain<T, Layer> {
    constructor(
        public readonly octtree: OctTree<T, Layer>,
        public readonly field: Field<T>,
        public readonly space: OctTreeSpace
    ) { }

    init(context: SamplingContext<Vec3>): void {
    }

    sample(location: Vec3, context: SamplingContext<Vec3>): T {
        const { layer, local_index, address, offset } = this.space.positionInfo(location, false, this.space.subdivisions.depth)
        
        const sign_X = <Sign>Math.sign(offset.x)
        const sign_Y = <Sign>Math.sign(offset.y)
        const sign_Z = <Sign>Math.sign(offset.z)

        const data = this.octtree.layers

        const address_0 = { layer, local_index }
        const cell_0 = this.octtree.layers[address_0.layer][address_0.local_index]
        // const delta_0 = field_point_subtract(cell_0, cell_0)
        const cell_halfExtent_0 = 2 ** -(this.space.exponentOfTwoHalfExtent + address_0.layer)

        const address_X = sign_X !== 0 ? this.space.subdivisions.neighbor_adjacent(address, 0, sign_X === 1 ? 1 : 0, layer) : undefined
        const cell_X = address_X !== undefined ? this.octtree.layers[address_X.layerLocalIndex.layer][address_X.layerLocalIndex.local_index] : undefined
        // const delta_X = cell_X !== undefined ? field_point_subtract(cell_X, cell_0) : undefined
        const cell_halfExtent_X = address_X !== undefined ? 2 ** -(this.space.exponentOfTwoHalfExtent + address_X.layerLocalIndex.layer) : undefined
        const cell_distance_X = address_X !== undefined ? SQRT_1 * (cell_halfExtent_0 + cell_halfExtent_X!) : undefined
        const p_distance_X = address_X !== undefined ? Math.sqrt(((offset.x - cell_distance_X!) ** 2) + ((offset.y - 0) ** 2) + ((offset.z - 0) ** 2)) : undefined
        const influence_X = address_X !== undefined ? Math.min(0, 1 - (p_distance_X! / cell_distance_X!)) : undefined
        
        const address_Y = sign_Y !== 0 ? this.space.subdivisions.neighbor_adjacent(address, 1, sign_Y === 1 ? 1 : 0, layer) : undefined
        const cell_Y = address_Y !== undefined ? this.octtree.layers[address_Y.layerLocalIndex.layer][address_Y.layerLocalIndex.local_index] : undefined
        // const delta_Y = cell_Y !== undefined ? field_point_subtract(cell_Y, cell_0) : undefined
        const cell_halfExtent_Y = address_Y !== undefined ? 2 ** -(this.space.exponentOfTwoHalfExtent + address_Y.layerLocalIndex.layer) : undefined
        const cell_distance_Y = address_Y !== undefined ? SQRT_1 * (cell_halfExtent_0 + cell_halfExtent_Y!) : undefined
        const p_distance_Y = address_Y !== undefined ? Math.sqrt(((offset.x - 0) ** 2) + ((offset.y - cell_distance_Y!) ** 2) + ((offset.z - 0) ** 2)) : undefined
        const influence_Y = address_Y !== undefined ? Math.min(0, 1 - (p_distance_Y! / cell_distance_Y!)) : undefined
        
        const address_Z = sign_Z !== 0 ? this.space.subdivisions.neighbor_adjacent(address, 2, sign_Z === 1 ? 1 : 0, layer) : undefined
        const cell_Z = address_Z !== undefined ? this.octtree.layers[address_Z.layerLocalIndex.layer][address_Z.layerLocalIndex.local_index] : undefined
        // const delta_Z = address_Z !== undefined ? field_point_subtract(cell_Z!, cell_0) : undefined
        const cell_halfExtent_Z = address_Z !== undefined ? 2 ** -(this.space.exponentOfTwoHalfExtent + address_Z.layerLocalIndex.layer) : undefined
        const cell_distance_Z = address_Z !== undefined ? SQRT_1 * (cell_halfExtent_0 + cell_halfExtent_Z!) : undefined
        const p_distance_Z = address_Z !== undefined ? Math.sqrt(((offset.x - 0) ** 2) + ((offset.y - 0) ** 2) + ((offset.z - cell_distance_Z!) ** 2)) : undefined
        const influence_Z = address_Z !== undefined ? Math.min(0, 1 - (p_distance_Z! / cell_distance_Z!)) : undefined
        
        const address_XY = (sign_X !== 0 && sign_Y !== 0) ? this.space.subdivisions.neighbor_diagonal(address, 0, sign_X === 1 ? 1 : 0, 1, sign_Y === 1 ? 1 : 0, layer) : undefined
        const cell_XY = address_XY !== undefined ? this.octtree.layers[address_XY.layerLocalIndex.layer][address_XY.layerLocalIndex.local_index] : undefined
        // const delta_XY = address_XY !== undefined ? field_point_subtract(cell_XY!, cell_0) : undefined
        const cell_halfExtent_XY = address_XY !== undefined ? 2 ** -(this.space.exponentOfTwoHalfExtent + address_XY.layerLocalIndex.layer) : undefined
        const cell_distance_XY = address_XY !== undefined ? SQRT_2 * (cell_halfExtent_0 + cell_halfExtent_XY!) : undefined
        const p_distance_XY = address_XY !== undefined ? Math.sqrt(((offset.x - cell_distance_XY!) ** 2) + ((offset.y - cell_distance_XY!) ** 2) + ((offset.z - 0) ** 2)) : undefined
        const influence_XY = address_XY !== undefined ? Math.min(0, 1 - (p_distance_XY! / cell_distance_XY!)) : undefined
        
        const address_XZ = (sign_X !== 0 && sign_Z !== 0) ? this.space.subdivisions.neighbor_diagonal(address, 0, sign_X === 1 ? 1 : 0, 2, sign_Z === 1 ? 1 : 0, layer) : undefined
        const cell_XZ = address_XZ !== undefined ? this.octtree.layers[address_XZ.layerLocalIndex.layer][address_XZ.layerLocalIndex.local_index] : undefined
        // const delta_XZ = address_XZ !== undefined ? field_point_subtract(cell_XZ!, cell_0) : undefined
        const cell_halfExtent_XZ = address_XZ !== undefined ? 2 ** -(this.space.exponentOfTwoHalfExtent + address_XZ.layerLocalIndex.layer) : undefined
        const cell_distance_XZ = address_XZ !== undefined ? SQRT_2 * (cell_halfExtent_0 + cell_halfExtent_XZ!) : undefined
        const p_distance_XZ = address_XZ !== undefined ? Math.sqrt(((offset.x - cell_distance_XZ!) ** 2) + ((offset.y - 0) ** 2) + ((offset.z - cell_distance_XZ!) ** 2)) : undefined
        const influence_XZ = address_XZ !== undefined ? Math.min(0, 1 - (p_distance_XZ! / cell_distance_XZ!)) : undefined
        
        const address_YZ = (sign_Y !== 0 && sign_Z !== 0) ? this.space.subdivisions.neighbor_diagonal(address, 1, sign_Y === 1 ? 1 : 0, 2, sign_Z === 1 ? 1 : 0, layer) : undefined
        const cell_YZ = address_YZ !== undefined ? this.octtree.layers[address_YZ.layerLocalIndex.layer][address_YZ.layerLocalIndex.local_index] : undefined
        // const delta_YZ = address_YZ !== undefined ? field_point_subtract(cell_YZ!, cell_0) : undefined
        const cell_halfExtent_YZ = address_YZ !== undefined ? 2 ** -(this.space.exponentOfTwoHalfExtent + address_YZ.layerLocalIndex.layer) : undefined
        const cell_distance_YZ = address_YZ !== undefined ? SQRT_2 * (cell_halfExtent_0 + cell_halfExtent_YZ!) : undefined
        const p_distance_YZ = address_YZ !== undefined ? Math.sqrt(((offset.x - 0) ** 2) + ((offset.y - cell_distance_YZ!) ** 2) + ((offset.z - cell_distance_YZ!) ** 2)) : undefined
        const influence_YZ = address_YZ !== undefined ? Math.min(0, 1 - (p_distance_YZ! / cell_distance_YZ!)) : undefined

        const address_XYZ = (sign_X !== 0 && sign_Y !== 0 && sign_Z !== 0) ? this.space.subdivisions.neighbor_triagonal(address, sign_X === 1 ? 1 : 0, sign_Y === 1 ? 1 : 0, sign_Z === 1 ? 1 : 0, layer) : undefined
        const cell_XYZ = address_XYZ !== undefined ? this.octtree.layers[address_XYZ.layerLocalIndex.layer][address_XYZ.layerLocalIndex.local_index] : undefined
        // const delta_XYZ = address_XYZ !== undefined ? field_point_subtract(cell_XYZ!, cell_0) : undefined
        const cell_halfExtent_XYZ = address_XYZ !== undefined ? 2 ** -(this.space.exponentOfTwoHalfExtent + address_XYZ.layerLocalIndex.layer) : undefined
        const cell_distance_XYZ = address_XYZ !== undefined ? SQRT_3 * (cell_halfExtent_0 + cell_halfExtent_XYZ!) : undefined
        const p_distance_XYZ = address_XYZ !== undefined ? Math.sqrt(((offset.x - cell_distance_XYZ!) ** 2) + ((offset.y - cell_distance_XYZ!) ** 2) + ((offset.z - cell_distance_XYZ!) ** 2)) : undefined
        const influence_XYZ = address_XYZ !== undefined ? Math.min(0, 1 - (p_distance_XYZ! / cell_distance_XYZ!)) : undefined
        
        /**
         * f(u, v, w)
         * 
         * f_00u = f_000(1 - u) + f_001(u)
         * f_01u = f_010(1 - u) + f_011(u)
         * f_10u = f_100(1 - u) + f_101(u)
         * f_11u = f_110(1 - u) + f_111(u)
         * 
         * f_0vu = f_00u(1 - v) + f_01u(v)
         * f_1vu = f_10u(1 - v) + f_11u(v)
         * 
         * f_wvu = f_0vu(1 - w) + f_1vu(w)
         * 
         * = (f_00u(1 - v) + f_01u(v))(1 - w) + (f_10u(1 - v) + f_11u(v))(w)
         * = ((f_000(1 - u) + f_001(u))(1 - v) + (f_010(1 - u) + f_011(u))(v))(1 - w) + ((f_100(1 - u) + f_101(u))(1 - v) + (f_110(1 - u) + f_111(u))(v))(w)
         * = ((f_000 - (u)f_000 + (u)f_001)(1 - v)                                + (f_010 - (u)f_010 + (u)f_011)(v))(1 - w)   + ((f_100 - (u)f_100 + (u)f_101)(1 - v) + (f_110 - (u)f_110 + (u)f_111)(v))(w)
         * = ((f_000 - (u)f_000 + (u)f_001) - ((v)f_000 - (uv)f_000 + (uv)f_001)) + ((v)f_010 - (uv)f_010 + (uv)f_011))(1 - w) + ((f_100 - (u)f_100 + (u)f_101) - ((v)f_100 - (uv)f_100 + (uv)f_101)) + ((v)f_110 - (uv)f_110 + (uv)f_111))(w)
         * = ((f_000 - (u)f_000 + (u)f_001 - (v)f_000 + (uv)f_000 - (uv)f_001))   +  (v)f_010 - (uv)f_010 + (uv)f_011 )(1 - w) + ((f_100 - (u)f_100 + (u)f_101  - (v)f_100 + (uv)f_100 - (uv)f_101) ) + ((v)f_110 - (uv)f_110 + (uv)f_111))(w)
         * = ( f_000 - (u)(f_000 + f_001) - (v)f_000 + (uv)(f_000 - f_001))       +  (v)f_010 - (uv)f_010 + (uv)f_011 )(1 - w) + ((f_100 - (u)f_100 + (u)f_101  - (v)f_100 + (uv)f_100 - (uv)f_101) ) + ((v)f_110 - (uv)f_110 + (uv)f_111))(w)
         * 
         * r = 0
         * a = xy
         * b = xz
         * c = yz
         * d = xyz
         * = ((f_000(1 - u) + f_001(u))(1 - v) + (f_010(1 - u) + f_011(u))(v))(1 - w) + ((f_100(1 - u) + f_101(u))(1 - v) + (f_110(1 - u) + f_111(u))(v))(w)
         * = ((r(1 - u) + x(u))(1 - v) + (y(1 - u) + a(u))(v))(1 - w) + ((z(1 - u) + b(u))(1 - v) + (c(1 - u) + d(u))(v))(w)
         * 
         * Using SymboLab.com
         * r-ru-rv+ruv+ux-uxv-rw+ruw+rvw-ruvw-uxw+uxvw+vy-uvy+auv-vyw+uvyw-auvw + zw-zuw-zvw+zuvw+buw-buvw+cvw-cuvw+duvw
         * r(1 - u - v - w + uv + uw + vw - uvw) +
         * x(u - uv - uw + uvw)
         * y(v - uv - vw + vwy)
         * z(w - uw - vw + uvw)
         * XY = a(uv - uvw)
         * XZ = b(uw - uvw)
         * YZ = c(vw - uvw)
         * XYZ = d(uvw)
         * 
         * f_wvu = can interpolate side length for a single axis;
         * given three coordinates (x, y, z) where x=f_x(u,v,w), y=f_y(u,v,w), and z=f_z(u,v,w)
         * how can u, v, and w be determined?
         * TODO: this could use more work
         * for now an imprecise interpolation is used
         */

        const influences = [
            [influence_X, cell_X],
            [influence_Y, cell_Y],
            [influence_Z, cell_Z],
            [influence_XY, cell_XY],
            [influence_XZ, cell_XZ],
            [influence_YZ, cell_YZ],
            [influence_XYZ, cell_XYZ]
        ] as [number | undefined, T][]
        
        const topInfluences = influences.filter(([influence]) => influence) as [number, T][]
        topInfluences.sort(([a], [b]) => b - a)

        if(topInfluences.length > 3) topInfluences.length = 3
        const top3 = topInfluences

        const influence_0 = 1 - top3.reduce((acc, [influence]) => acc + influence, 0)

        let weightedSum = field_point_multiply(cell_0, influence_0)
        for (let i = 0; i < top3.length; i++)
            weightedSum = field_point_add_inplace_weighted(weightedSum, top3[i][1], top3[i][0])
        return weightedSum

        // let topInfluence1: [number, T] | undefined = undefined
        // let topInfluence2: [number, T] | undefined = undefined
        // let topInfluence3: [number, T] | undefined = undefined

        // for (let i = 0; i < influences.length; i++){
        //     const influence = influences[i]
        //     let influenceFactor = influence[0]
        //     if (influenceFactor) {
        //         if (!topInfluence1) topInfluence1 = influence as [number, T]
        //         else if (influenceFactor > topInfluence1[0]) {
        //             if (!topInfluence2) topInfluence2 = topInfluence1
        //             else {
        //                 if (!topInfluence3) topInfluence3 = topInfluence2
        //                 else if()
        //             }
        //         }
        //     }
        // }
    }
}