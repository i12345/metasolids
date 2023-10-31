import { NumberArrayLike, NumberTypedArray } from "../arrays/typed-array.js"

export type OctTreeCell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export enum Axis {
    X = 0,
    Y = 1,
    Z = 2
}

export enum Direction {
    Negative = 0,
    Positive = 1
}

export enum Quadrant {
    __ = 0b00,
    X_ = 0b01,
    _Y = 0b10,
    XY = 0b11,
}

export enum AdjacentDirection {
    XMinus = 0,
    XPlus = 0,
    YMinus = 0,
    YPlus = 0,
    ZMinus = 0,
    ZPlus = 0,
}

export enum DiagonalDirection {
    /** (y-, z-) on the x-plane */
    X_MM = (4 * 0) | 0b00,

    /** (y+, z-) on the x-plane */
    X_MP = (4 * 0) | 0b01,

    /** (y-, z+) on the x-plane */
    X_PM = (4 * 0) | 0b10,

    /** (y+, z+) on the x-plane */
    X_PP = (4 * 0) | 0b11,



    /** (z-, x-) on the y-plane */
    Y_MM = (4 * 1) | 0b00,

    /** (z+, x-) on the y-plane */
    Y_MP = (4 * 1) | 0b01,

    /** (z-, x+) on the y-plane */
    Y_PM = (4 * 1) | 0b10,

    /** (z+, x+) on the y-plane */
    Y_PP = (4 * 1) | 0b11,



    /** (x-, y-) on the z-plane */
    Z_MM = (4 * 2) | 0b00,

    /** (x+, y-) on the z-plane */
    Z_MP = (4 * 2) | 0b01,

    /** (x-, y+) on the z-plane */
    Z_PM = (4 * 2) | 0b10,

    /** (x+, y+) on the z-plane */
    Z_PP = (4 * 2) | 0b11,
}

export type TriagonalDirection = OctTreeCell

export function octTreeSubcell(localIndex: number): OctTreeCell {
    return <OctTreeCell>(localIndex & 0x7)
}

export const octTreeSubcellOpposite = {
    adjacent(subcell: OctTreeCell, axis: 0 | 1 | 2): OctTreeCell {
        const mask = 1 << axis
        return <OctTreeCell>(subcell ^ mask)
    },

    diagonal(subcell: OctTreeCell, axis0: Axis, axis1: Axis): OctTreeCell {
        const mask0 = 1 << axis0
        const mask1 = 1 << axis1
        return <OctTreeCell>(subcell ^ (mask0 | mask1))
    },

    triagonal(subcell: OctTreeCell): OctTreeCell {
        return <OctTreeCell>(subcell ^ 0x7)
    }
}

export const octTreeCellsByDirection: {
    [axis: number]: {
        [direction: number]: [OctTreeCell, OctTreeCell, OctTreeCell, OctTreeCell]
    }
} = {
    [0]: {
        [0]: [0, 2, 4, 6],
        [1]: [1, 3, 5, 7]
    },
    [1]: {
        [0]: [0, 1, 4, 5],
        [1]: [2, 3, 6, 7]
    },
    [2]: {
        [0]: [0, 1, 2, 3],
        [1]: [4, 5, 6, 7]
    }
}

/**
 * octTreeCellsMaskByDirection[face] = mask of subcells composing that face
 */
export const octTreeCellsMaskByDirection = new Uint8Array(6)

for (let axis = 0; axis < 3; axis++) {
    for (let direction = 0; direction < 2; direction++) {
        const subcells = octTreeCellsByDirection[axis][direction]
        let mask = 0
        for (const subcell of subcells) mask |= (1 << subcell)
        octTreeCellsMaskByDirection[(2 * axis) + direction] = mask
    }
}

export enum OctTreeCellsMask {
    None = 0,
    All = 0xFF,
    C0 = 0x01,
    C1 = 0x02,
    C2 = 0x04,
    C3 = 0x08,
    C4 = 0x10,
    C5 = 0x20,
    C6 = 0x40,
    C7 = 0x80,
}

export type OctTreeAddress = NumberArrayLike<OctTreeCell>

/**
 * Returns whether {@link earlier} comes before {@link later}
 * @param earlier the address to consider coming before {@link later}
 * @param later the address to consider coming after {@link earlier}
 * @returns whether {@link earlier} comes before {@link later}
 */
export function octTreeAddressPrecedes(earlier: OctTreeAddress, later: OctTreeAddress): boolean {
    let layer: number
    const commonLayers = Math.min(earlier.length, later.length)
    for (layer = 0; layer < commonLayers; layer++){
        const earlier_cell = earlier[layer]
        const later_cell = later[layer]

        if (earlier_cell !== later_cell)
            return earlier_cell < later_cell
    }
    if (earlier.length > layer)
        return earlier[layer] < 4
    else if (later.length > layer)
        return later[layer] >= 4
    else return false
}