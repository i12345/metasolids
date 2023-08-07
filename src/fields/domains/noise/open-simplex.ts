import { Vec2, Vec3, Vec4 } from "playcanvas-extended";
import { ScalarField } from "../../fields/scalar.js"
import { SeedKey, SeededSampleDomain, SeededSamplingContext } from "../../domains/seeded.js";

export const openSimplex = {
    [2]: {
        plain: new (class OpenSimplexSampleDomain_2D_plain extends SeededSampleDomain<Vec2, number> {
            readonly field = ScalarField.instance
        
            sample(location: Vec2, context: SeededSamplingContext<Vec2>): number {
                return OpenSimplex2S.noise2(BigInt(context[SeedKey]), location.x, location.y)
            }
        })(),
        improveX: new (class OpenSimplexSampleDomain_2D_improveX extends SeededSampleDomain<Vec2, number> {
            readonly field = ScalarField.instance
        
            sample(location: Vec2, context: SeededSamplingContext<Vec2>): number {
                return OpenSimplex2S.noise2_ImproveX(BigInt(context[SeedKey]), location.x, location.y)
            }
        })(),
    },
    [3]: {
        fallback: new (class OpenSimplexSampleDomain_3D_fallback extends SeededSampleDomain<Vec3, number> {
            readonly field = ScalarField.instance
        
            sample(location: Vec3, context: SeededSamplingContext<Vec3>): number {
                return OpenSimplex2S.noise3_Fallback(BigInt(context[SeedKey]), location.x, location.y, location.z)
            }
        })(),
        improveXY: new (class OpenSimplexSampleDomain_3D_improveXY extends SeededSampleDomain<Vec3, number> {
            readonly field = ScalarField.instance
        
            sample(location: Vec3, context: SeededSamplingContext<Vec3>): number {
                return OpenSimplex2S.noise3_ImproveXY(BigInt(context[SeedKey]), location.x, location.y, location.z)
            }
        })(),
        improveXZ: new (class OpenSimplexSampleDomain_3D_improveXZ extends SeededSampleDomain<Vec3, number> {
            readonly field = ScalarField.instance
        
            sample(location: Vec3, context: SeededSamplingContext<Vec3>): number {
                return OpenSimplex2S.noise3_ImproveXZ(BigInt(context[SeedKey]), location.x, location.y, location.z)
            }
        })(),
    },
    [4]: {
        fallback: new (class OpenSimplexSampleDomain_4D_fallback extends SeededSampleDomain<Vec4, number> {
            readonly field = ScalarField.instance
        
            sample(location: Vec4, context: SeededSamplingContext<Vec4>): number {
                return OpenSimplex2S.noise4_Fallback(BigInt(context[SeedKey]), location.x, location.y, location.z, location.w)
            }
        })(),
        improveXYZ: new (class OpenSimplexSampleDomain_4D_improveXYZ extends SeededSampleDomain<Vec4, number> {
            readonly field = ScalarField.instance
        
            sample(location: Vec4, context: SeededSamplingContext<Vec4>): number {
                return OpenSimplex2S.noise4_ImproveXYZ(BigInt(context[SeedKey]), location.x, location.y, location.z, location.w)
            }
        })(),
        improveXYZ_improveXY: new (class OpenSimplexSampleDomain_4D_improveXYZ_improveXY extends SeededSampleDomain<Vec4, number> {
            readonly field = ScalarField.instance
        
            sample(location: Vec4, context: SeededSamplingContext<Vec4>): number {
                return OpenSimplex2S.noise4_ImproveXYZ_ImproveXY(BigInt(context[SeedKey]), location.x, location.y, location.z, location.w)
            }
        })(),
        improveXYZ_improveXZ: new (class OpenSimplexSampleDomain_4D_improveXYZ_improveXZ extends SeededSampleDomain<Vec4, number> {
            readonly field = ScalarField.instance
        
            sample(location: Vec4, context: SeededSamplingContext<Vec4>): number {
                return OpenSimplex2S.noise4_ImproveXYZ_ImproveXZ(BigInt(context[SeedKey]), location.x, location.y, location.z, location.w)
            }
        })(),
        improveXY_improveZW: new (class OpenSimplexSampleDomain_4D_improveXY_improveZW extends SeededSampleDomain<Vec4, number> {
            readonly field = ScalarField.instance
        
            sample(location: Vec4, context: SeededSamplingContext<Vec4>): number {
                return OpenSimplex2S.noise4_ImproveXY_ImproveZW(BigInt(context[SeedKey]), location.x, location.y, location.z, location.w)
            }
        })(),
    }
}

// This is Kdotthis.JPG/OpenSimplex2S.java
// https://gist.github.com/KdotJPG/b1270127455a94ac5d19
// translated to TypeScript
// It could be translated more efficiently, perhaps using WebAssembly/emscripten

// type long = bigint
// const Long = (x) => BigInt(x)

const PRIME_X: bigint = 0x5205402B9270C86Fn;
const PRIME_Y: bigint = 0x598CD327003817B5n;
const PRIME_Z: bigint = 0x5BCC226E9FA0BACBn;
const PRIME_W: bigint = 0x56CC5227E58F554Bn;
const HASH_MULTIPLIER: bigint = 0x53A3F72DEEC546F5n;
const SEED_FLIP_3D: bigint = -0x52D547B2E96ED629n;

const ROOT2OVER2 = 0.7071067811865476;
const SKEW_2D = 0.366025403784439;
const UNSKEW_2D = -0.21132486540518713;

const ROOT3OVER3 = 0.577350269189626;
const FALLBACK_ROTATE3 = 2.0 / 3.0;
const ROTATE3_ORTHOGONALIZER = UNSKEW_2D;

const SKEW_4D = 0.309016994374947;
const UNSKEW_4D = -0.138196601125011;

const N_GRADS_2D_EXPONENT = 7;
const N_GRADS_3D_EXPONENT = 8;
const N_GRADS_4D_EXPONENT = 9;
const N_GRADS_2D = 1 << N_GRADS_2D_EXPONENT;
const N_GRADS_3D = 1 << N_GRADS_3D_EXPONENT;
const N_GRADS_4D = 1 << N_GRADS_4D_EXPONENT;

const NORMALIZER_2D = 0.05481866495625118;
const NORMALIZER_3D = 0.2781926117527186;
const NORMALIZER_4D = 0.11127401889945551;

const RSQUARED_2D = 2.0 / 3.0;
const RSQUARED_3D = 3.0 / 4.0;
const RSQUARED_4D = 4.0 / 5.0;

function invertLong(long: bigint): bigint {
    return 0xFFFF_FFFF_FFFF_FFFFn ^ long;
}

class LatticeVertex4D {
    public readonly dx: number
    public readonly dy: number
    public readonly dz: number
    public readonly dw: number;
    public readonly xsvp: bigint
    public readonly ysvp: bigint
    public readonly zsvp: bigint
    public readonly wsvp: bigint;
    
    constructor(xsv: number, ysv: number, zsv: number, wsv: number) {
        this.xsvp = BigInt(xsv) * PRIME_X; this.ysvp = BigInt(ysv) * PRIME_Y;
        this.zsvp = BigInt(zsv) * PRIME_Z; this.wsvp = BigInt(wsv) * PRIME_W;
        const ssv: number = (xsv + ysv + zsv + wsv) * UNSKEW_4D;
        this.dx = -xsv - ssv;
        this.dy = -ysv - ssv;
        this.dz = -zsv - ssv;
        this.dw = -wsv - ssv;
    }
}

/**
 * K.jpg's OpenSimplex 2, smooth variant ("SuperSimplex")
 *
 * More language ports, as well as legacy 2014 OpenSimplex, can be found here:
 * https://github.com/KdotJPG/OpenSimplex2
 */
export class OpenSimplex2S {

    /*
     * Noise Evaluators
     */

    /**
     * 2D OpenSimplex2S/SuperSimplex noise, standard lattice orientation.
     */
    public static noise2(seed: bigint, x: number, y: number): number {

        // Get points for A2* lattice
        const s: number = SKEW_2D * (x + y);
        const xs: number = x + s, ys = y + s;

        return this.noise2_UnskewedBase(seed, xs, ys);
    }

    /**
     * 2D OpenSimplex2S/SuperSimplex noise, with Y pointing down the main diagonal.
     * Might be better for a 2D sandbox style game, where Y is vertical.
     * Probably slightly less optimal for heightmaps or continent maps,
     * unless your map is centered around an equator. It's a slight
     * difference, but the option is here to make it easy.
     */
    public static noise2_ImproveX(seed: bigint, x: number, y: number): number {

        // Skew transform and rotation baked into one.
        const xx = x * ROOT2OVER2;
        const yy = y * (ROOT2OVER2 * (1 + 2 * SKEW_2D));

        return this.noise2_UnskewedBase(seed, yy + xx, yy - xx);
    }

    /**
     * 2D  OpenSimplex2S/SuperSimplex noise base.
     */
    private static noise2_UnskewedBase(seed: bigint, xs: number, ys: number) {

        // Get base points and offsets.
        const xsb = this.fastFloor(xs), ysb = this.fastFloor(ys);
        const xi = (xs - xsb), yi = (ys - ysb);

        // Prime pre-multiplication for hash.
        const xsbp: bigint = BigInt(xsb) * PRIME_X, ysbp = BigInt(ysb) * PRIME_Y;

        // Unskew.
        const t: number = (xi + yi) * UNSKEW_2D;
        const dx0: number = xi + t, dy0 = yi + t;

        // First vertex.
        const a0: number = RSQUARED_2D - dx0 * dx0 - dy0 * dy0;
        let value: number = (a0 * a0) * (a0 * a0) * this.grad_2(seed, xsbp, ysbp, dx0, dy0);

        // Second vertex.
        const a1: number = (2 * (1 + 2 * UNSKEW_2D) * (1 / UNSKEW_2D + 2)) * t + ((-2 * (1 + 2 * UNSKEW_2D) * (1 + 2 * UNSKEW_2D)) + a0);
        const dx1: number = dx0 - (1 + 2 * UNSKEW_2D);
        const dy1: number = dy0 - (1 + 2 * UNSKEW_2D);
        value += (a1 * a1) * (a1 * a1) * this.grad_2(seed, xsbp + PRIME_X, ysbp + PRIME_Y, dx1, dy1);

        // Third and fourth vertices.
        // Nested conditionals were faster than compact bit logic/arithmetic.
        const xmyi: number = xi - yi;
        if (t < UNSKEW_2D) {
            if (xi + xmyi > 1) {
                const dx2: number = dx0 - (3 * UNSKEW_2D + 2);
                const dy2: number = dy0 - (3 * UNSKEW_2D + 1);
                const a2: number = RSQUARED_2D - dx2 * dx2 - dy2 * dy2;
                if (a2 > 0) {
                    value += (a2 * a2) * (a2 * a2) * this.grad_2(seed, xsbp + (PRIME_X << 1n), ysbp + PRIME_Y, dx2, dy2);
                }
            }
            else
            {
                const dx2: number = dx0 - UNSKEW_2D;
                const dy2: number = dy0 - (UNSKEW_2D + 1);
                const a2: number = RSQUARED_2D - dx2 * dx2 - dy2 * dy2;
                if (a2 > 0) {
                    value += (a2 * a2) * (a2 * a2) * this.grad_2(seed, xsbp, ysbp + PRIME_Y, dx2, dy2);
                }
            }

            if (yi - xmyi > 1) {
                const dx3: number = dx0 - (3 * UNSKEW_2D + 1);
                const dy3: number = dy0 - (3 * UNSKEW_2D + 2);
                const a3: number = RSQUARED_2D - dx3 * dx3 - dy3 * dy3;
                if (a3 > 0) {
                    value += (a3 * a3) * (a3 * a3) * this.grad_2(seed, xsbp + PRIME_X, ysbp + (PRIME_Y << 1n), dx3, dy3);
                }
            }
            else
            {
                const dx3: number = dx0 - (UNSKEW_2D + 1);
                const dy3: number = dy0 - UNSKEW_2D;
                const a3: number = RSQUARED_2D - dx3 * dx3 - dy3 * dy3;
                if (a3 > 0) {
                    value += (a3 * a3) * (a3 * a3) * this.grad_2(seed, xsbp + PRIME_X, ysbp, dx3, dy3);
                }
            }
        }
        else
        {
            if (xi + xmyi < 0) {
                const dx2: number = dx0 + (1 + UNSKEW_2D);
                const dy2: number = dy0 + UNSKEW_2D;
                const a2: number = RSQUARED_2D - dx2 * dx2 - dy2 * dy2;
                if (a2 > 0) {
                    value += (a2 * a2) * (a2 * a2) * this.grad_2(seed, xsbp - PRIME_X, ysbp, dx2, dy2);
                }
            }
            else
            {
                const dx2: number = dx0 - (UNSKEW_2D + 1);
                const dy2: number = dy0 - UNSKEW_2D;
                const a2: number = RSQUARED_2D - dx2 * dx2 - dy2 * dy2;
                if (a2 > 0) {
                    value += (a2 * a2) * (a2 * a2) * this.grad_2(seed, xsbp + PRIME_X, ysbp, dx2, dy2);
                }
            }

            if (yi < xmyi) {
                const dx2: number = dx0 + UNSKEW_2D;
                const dy2: number = dy0 + (UNSKEW_2D + 1);
                const a2: number = RSQUARED_2D - dx2 * dx2 - dy2 * dy2;
                if (a2 > 0) {
                    value += (a2 * a2) * (a2 * a2) * this.grad_2(seed, xsbp, ysbp - PRIME_Y, dx2, dy2);
                }
            }
            else
            {
                const dx2: number = dx0 - UNSKEW_2D;
                const dy2: number = dy0 - (UNSKEW_2D + 1);
                const a2: number = RSQUARED_2D - dx2 * dx2 - dy2 * dy2;
                if (a2 > 0) {
                    value += (a2 * a2) * (a2 * a2) * this.grad_2(seed, xsbp, ysbp + PRIME_Y, dx2, dy2);
                }
            }
        }

        return value;
    }

    /**
     * 3D OpenSimplex2S/SuperSimplex noise, with better visual isotropy in (X, Y).
     * Recommended for 3D terrain and time-varied animations.
     * The Z coordinate should always be the "different" coordinate in whatever your use case is.
     * If Y is vertical in world coordinates, call noise3_ImproveXZ(x, z, Y) or use noise3_this.XZBeforeY.
     * If Z is vertical in world coordinates, call noise3_ImproveXZ(x, y, Z).
     * For a time varied animation, call noise3_ImproveXY(x, y, T).
     */
    public static noise3_ImproveXY(seed: bigint, x: number, y: number, z: number): number {

        // Re-orient the cubic lattices without skewing, so Z points up the main lattice diagonal,
        // and the planes formed by XY are moved far out of alignment with the cube faces.
        // Orthonormal rotation. Not a skew transform.
        const xy: number = x + y;
        const s2: number = xy * ROTATE3_ORTHOGONALIZER;
        const zz: number = z * ROOT3OVER3;
        const xr: number = x + s2 + zz;
        const yr: number = y + s2 + zz;
        const zr: number = xy * -ROOT3OVER3 + zz;

        // Evaluate both lattices to form a BCC lattice.
        return this.noise3_UnrotatedBase(seed, xr, yr, zr);
    }

    /**
     * 3D OpenSimplex2S/SuperSimplex noise, with better visual isotropy in (X, Z).
     * Recommended for 3D terrain and time-varied animations.
     * The Y coordinate should always be the "different" coordinate in whatever your use case is.
     * If Y is vertical in world coordinates, call noise3_ImproveXZ(x, Y, z).
     * If Z is vertical in world coordinates, call noise3_ImproveXZ(x, Z, y) or use noise3_ImproveXY.
     * For a time varied animation, call noise3_ImproveXZ(x, T, y) or use noise3_ImproveXY.
     */
    public static noise3_ImproveXZ(seed: bigint, x: number, y: number, z: number): number {

        // Re-orient the cubic lattices without skewing, so Y points up the main lattice diagonal,
        // and the planes formed by XZ are moved far out of alignment with the cube faces.
        // Orthonormal rotation. Not a skew transform.
        const xz: number = x + z;
        const s2: number = xz * -0.211324865405187;
        const yy: number = y * ROOT3OVER3;
        const xr: number = x + s2 + yy;
        const zr: number = z + s2 + yy;
        const yr: number = xz * -ROOT3OVER3 + yy;

        // Evaluate both lattices to form a BCC lattice.
        return this.noise3_UnrotatedBase(seed, xr, yr, zr);
    }

    /**
     * 3D OpenSimplex2S/SuperSimplex noise, fallback rotation option
     * Use noise3_ImproveXY or noise3_ImproveXZ instead, wherever appropriate.
     * They have less diagonal bias. This function's best use is as a fallback.
     */
    public static noise3_Fallback(seed: bigint, x: number, y: number, z: number): number {

        // Re-orient the cubic lattices via rotation, to produce a familiar look.
        // Orthonormal rotation. Not a skew transform.
        const r: number = FALLBACK_ROTATE3 * (x + y + z);
        const xr: number = r - x, yr = r - y, zr = r - z;

        // Evaluate both lattices to form a BCC lattice.
        return this.noise3_UnrotatedBase(seed, xr, yr, zr);
    }

    /**
     * Generate overlapping cubic lattices for 3D Re-oriented this.BCC noise.
     * Lookup table implementation inspired by DigitalShadow.
     * It was actually faster to narrow down the points in the loop itself,
     * than to build up the index with enough info to isolate 8 points.
     */
    private static noise3_UnrotatedBase(seed: bigint, xr: number, yr: number, zr: number): number {

        // Get base points and offsets.
        const xrb = this.fastFloor(xr), yrb = this.fastFloor(yr), zrb = this.fastFloor(zr);
        const xi: number = xr - xrb, yi = yr - yrb, zi = zr - zrb;

        // Prime pre-multiplication for hash. Also flip seed for second lattice copy.
        const xrbp: bigint = BigInt(xrb) * PRIME_X, yrbp = BigInt(yrb) * PRIME_Y, zrbp = BigInt(zrb) * PRIME_Z;
        const seed2: bigint = seed ^ -0x52D547B2E96ED629n;

        // -1 if positive, 0 if negative.
        const xNMask = (-0.5 - xi), yNMask = (-0.5 - yi), zNMask = (-0.5 - zi);

        // First vertex.
        const x0: number = xi + xNMask;
        const y0: number = yi + yNMask;
        const z0: number = zi + zNMask;
        const a0: number = RSQUARED_3D - x0 * x0 - y0 * y0 - z0 * z0;
        let value: number = (a0 * a0) * (a0 * a0) * this.grad_3(seed,
                xrbp + (BigInt(xNMask) & PRIME_X), yrbp + (BigInt(yNMask) & PRIME_Y), zrbp + (BigInt(zNMask) & PRIME_Z), x0, y0, z0);

        // Second vertex.
        const x1: number = xi - 0.5;
        const y1: number = yi - 0.5;
        const z1: number = zi - 0.5;
        const a1: number = RSQUARED_3D - x1 * x1 - y1 * y1 - z1 * z1;
        value += (a1 * a1) * (a1 * a1) * this.grad_3(seed2,
                xrbp + PRIME_X, yrbp + PRIME_Y, zrbp + PRIME_Z, x1, y1, z1);

        // Shortcuts for building the remaining falloffs.
        // Derived by subtracting the polynomials with the offsets plugged in.
        const xAFlipMask0: number = ((xNMask | 1) << 1) * x1;
        const yAFlipMask0: number = ((yNMask | 1) << 1) * y1;
        const zAFlipMask0: number = ((zNMask | 1) << 1) * z1;
        const xAFlipMask1: number = (-2 - (xNMask << 2)) * x1 - 1.0;
        const yAFlipMask1: number = (-2 - (yNMask << 2)) * y1 - 1.0;
        const zAFlipMask1: number = (-2 - (zNMask << 2)) * z1 - 1.0;

        let skip5: boolean = false;
        const a2: number = xAFlipMask0 + a0;
        if (a2 > 0) {
            const x2: number = x0 - (xNMask | 1);
            const y2: number = y0;
            const z2: number = z0;
            value += (a2 * a2) * (a2 * a2) * this.grad_3(seed,
                    xrbp + (invertLong(BigInt(xNMask)) & PRIME_X), yrbp + (BigInt(yNMask) & PRIME_Y), zrbp + (BigInt(zNMask) & PRIME_Z), x2, y2, z2);
        }
        else
        {
            const a3: number = yAFlipMask0 + zAFlipMask0 + a0;
            if (a3 > 0) {
                const x3: number = x0;
                const y3: number = y0 - (yNMask | 1);
                const z3: number = z0 - (zNMask | 1);
                value += (a3 * a3) * (a3 * a3) * this.grad_3(seed,
                        xrbp + (BigInt(xNMask) & PRIME_X), yrbp + (invertLong(BigInt(yNMask)) & PRIME_Y), zrbp + (invertLong(BigInt(zNMask)) & PRIME_Z), x3, y3, z3);
            }

            const a4: number = xAFlipMask1 + a1;
            if (a4 > 0) {
                const x4: number = (xNMask | 1) + x1;
                const y4: number = y1;
                const z4: number = z1;
                value += (a4 * a4) * (a4 * a4) * this.grad_3(seed2,
                        xrbp + (BigInt(xNMask) & (PRIME_X * 2n)), yrbp + PRIME_Y, zrbp + PRIME_Z, x4, y4, z4);
                skip5 = true;
            }
        }

        let skip9: boolean = false;
        const a6: number = yAFlipMask0 + a0;
        if (a6 > 0) {
            const x6: number = x0;
            const y6: number = y0 - (yNMask | 1);
            const z6: number = z0;
            value += (a6 * a6) * (a6 * a6) * this.grad_3(seed,
                    xrbp + (BigInt(xNMask) & PRIME_X), yrbp + (invertLong(BigInt(yNMask)) & PRIME_Y), zrbp + (BigInt(zNMask) & PRIME_Z), x6, y6, z6);
        }
        else
        {
            const a7: number = xAFlipMask0 + zAFlipMask0 + a0;
            if (a7 > 0) {
                const x7: number = x0 - (xNMask | 1);
                const y7: number = y0;
                const z7: number = z0 - (zNMask | 1);
                value += (a7 * a7) * (a7 * a7) * this.grad_3(seed,
                        xrbp + (invertLong(BigInt(xNMask)) & PRIME_X), yrbp + (BigInt(yNMask) & PRIME_Y), zrbp + (invertLong(BigInt(zNMask)) & PRIME_Z), x7, y7, z7);
            }

            const a8: number = yAFlipMask1 + a1;
            if (a8 > 0) {
                const x8: number = x1;
                const y8: number = (yNMask | 1) + y1;
                const z8: number = z1;
                value += (a8 * a8) * (a8 * a8) * this.grad_3(seed2,
                        xrbp + PRIME_X, yrbp + (BigInt(yNMask) & (PRIME_Y << 1n)), zrbp + PRIME_Z, x8, y8, z8);
                skip9 = true;
            }
        }

        let skipD: boolean = false;
        const aA: number = zAFlipMask0 + a0;
        if (aA > 0) {
            const xA: number = x0;
            const yA: number = y0;
            const zA: number = z0 - (zNMask | 1);
            value += (aA * aA) * (aA * aA) * this.grad_3(seed,
                    xrbp + (BigInt(xNMask) & PRIME_X), yrbp + (BigInt(yNMask) & PRIME_Y), zrbp + (invertLong(BigInt(zNMask)) & PRIME_Z), xA, yA, zA);
        }
        else
        {
            const aB: number = xAFlipMask0 + yAFlipMask0 + a0;
            if (aB > 0) {
                const xB: number = x0 - (xNMask | 1);
                const yB: number = y0 - (yNMask | 1);
                const zB: number = z0;
                value += (aB * aB) * (aB * aB) * this.grad_3(seed,
                        xrbp + (invertLong(BigInt(xNMask)) & PRIME_X), yrbp + (invertLong(BigInt(yNMask)) & PRIME_Y), zrbp + (BigInt(zNMask) & PRIME_Z), xB, yB, zB);
            }

            const aC: number = zAFlipMask1 + a1;
            if (aC > 0) {
                const xC: number = x1;
                const yC: number = y1;
                const zC: number = (zNMask | 1) + z1;
                value += (aC * aC) * (aC * aC) * this.grad_3(seed2,
                        xrbp + PRIME_X, yrbp + PRIME_Y, zrbp + (BigInt(zNMask) & (PRIME_Z << 1n)), xC, yC, zC);
                skipD = true;
            }
        }

        if (!skip5) {
            const a5: number = yAFlipMask1 + zAFlipMask1 + a1;
            if (a5 > 0) {
                const x5: number = x1;
                const y5: number = (yNMask | 1) + y1;
                const z5: number = (zNMask | 1) + z1;
                value += (a5 * a5) * (a5 * a5) * this.grad_3(seed2,
                        xrbp + PRIME_X, yrbp + (BigInt(yNMask) & (PRIME_Y << 1n)), zrbp + (BigInt(zNMask) & (PRIME_Z << 1n)), x5, y5, z5);
            }
        }

        if (!skip9) {
            const a9: number = xAFlipMask1 + zAFlipMask1 + a1;
            if (a9 > 0) {
                const x9: number = (xNMask | 1) + x1;
                const y9: number = y1;
                const z9: number = (zNMask | 1) + z1;
                value += (a9 * a9) * (a9 * a9) * this.grad_3(seed2,
                        xrbp + (BigInt(xNMask) & (PRIME_X * 2n)), yrbp + PRIME_Y, zrbp + (BigInt(zNMask) & (PRIME_Z << 1n)), x9, y9, z9);
            }
        }

        if (!skipD) {
            const aD: number = xAFlipMask1 + yAFlipMask1 + a1;
            if (aD > 0) {
                const xD: number = (xNMask | 1) + x1;
                const yD: number = (yNMask | 1) + y1;
                const zD: number = z1;
                value += (aD * aD) * (aD * aD) * this.grad_3(seed2,
                        xrbp + (BigInt(xNMask) & (PRIME_X << 1n)), yrbp + (BigInt(yNMask) & (PRIME_Y << 1n)), zrbp + PRIME_Z, xD, yD, zD);
            }
        }

        return value;
    }

    /**
     * 4D SuperSimplex noise, with XYZ oriented like noise3_ImproveXY
     * and W for an extra degree of freedom. W repeats eventually.
     * Recommended for time-varied animations which texture a 3D object (W=time)
     * in a space where Z is vertical
     */
    public static noise4_ImproveXYZ_ImproveXY(seed: bigint, x: number, y: number, z: number, w: number): number {
        const xy: number = x + y;
        const s2: number = xy * -0.21132486540518699998;
        const zz: number = z * 0.28867513459481294226;
        const ww: number = w * 1.118033988749894;
        const xr: number = x + (zz + ww + s2), yr = y + (zz + ww + s2);
        const zr: number = xy * -0.57735026918962599998 + (zz + ww);
        const wr: number = z * -0.866025403784439 + ww;

        return this.noise4_UnskewedBase(seed, xr, yr, zr, wr);
    }

    /**
     * 4D SuperSimplex noise, with XYZ oriented like noise3_ImproveXZ
     * and W for an extra degree of freedom. W repeats eventually.
     * Recommended for time-varied animations which texture a 3D object (W=time)
     * in a space where Y is vertical
     */
    public static noise4_ImproveXYZ_ImproveXZ(seed: bigint, x: number, y: number, z: number, w: number): number {
        const xz: number = x + z;
        const s2: number = xz * -0.21132486540518699998;
        const yy: number = y * 0.28867513459481294226;
        const ww: number = w * 1.118033988749894;
        const xr: number = x + (yy + ww + s2), zr = z + (yy + ww + s2);
        const yr: number = xz * -0.57735026918962599998 + (yy + ww);
        const wr: number = y * -0.866025403784439 + ww;

        return this.noise4_UnskewedBase(seed, xr, yr, zr, wr);
    }

    /**
     * 4D SuperSimplex noise, with XYZ oriented like noise3_Fallback
     * and W for an extra degree of freedom. W repeats eventually.
     * Recommended for time-varied animations which texture a 3D object (W=time)
     * where there isn't a clear distinction between horizontal and vertical
     */
    public static noise4_ImproveXYZ(seed: bigint, x: number, y: number, z: number, w: number): number {
        const xyz: number = x + y + z;
        const ww: number = w * 1.118033988749894;
        const s2: number = xyz * -0.16666666666666666 + ww;
        const xs: number = x + s2, ys = y + s2, zs = z + s2, ws = -0.5 * xyz + ww;

        return this.noise4_UnskewedBase(seed, xs, ys, zs, ws);
    }
    
    /**
     * 4D SuperSimplex noise, with XY and ZW forming orthogonal triangular-based planes.
     * Recommended for 3D terrain, where X and Y (or Z and W) are horizontal.
     * Recommended for noise(x, y, sin(time), cos(time)) trick.
     */
    public static noise4_ImproveXY_ImproveZW(seed: bigint, x: number, y: number, z: number, w: number): number {
        
        const s2: number = (x + y) * -0.28522513987434876941 + (z + w) * 0.83897065470611435718;
        const t2: number = (z + w) * 0.21939749883706435719 + (x + y) * -0.48214856493302476942;
        const xs: number = x + s2, ys = y + s2, zs = z + t2, ws = w + t2;
        
        return this.noise4_UnskewedBase(seed, xs, ys, zs, ws);
    }

    /**
     * 4D SuperSimplex noise, fallback lattice orientation.
     */
    public static noise4_Fallback(seed: bigint, x: number, y: number, z: number, w: number): number {

        // Get points for A4 lattice
        const s: number = SKEW_4D * (x + y + z + w);
        const xs: number = x + s, ys = y + s, zs = z + s, ws = w + s;

        return this.noise4_UnskewedBase(seed, xs, ys, zs, ws);
    }

    /**
     * 4D SuperSimplex noise base.
     * Using ultra-simple 4x4x4x4 lookup partitioning.
     * This isn't as elegant or SIMD/GPU/etc. portable as other approaches,
     * but it competes performance-wise with optimized 2014 OpenSimplex.
     */
    private static noise4_UnskewedBase(seed: bigint, xs: number, ys: number, zs: number, ws: number): number {

        // Get base points and offsets
        const xsb = this.fastFloor(xs), ysb = this.fastFloor(ys), zsb = this.fastFloor(zs), wsb = this.fastFloor(ws);
        const xsi: number = xs - xsb, ysi = ys - ysb, zsi = zs - zsb, wsi = ws - wsb;

        // Unskewed offsets
        const ssi: number = (xsi + ysi + zsi + wsi) * UNSKEW_4D;
        const xi: number = xsi + ssi, yi = ysi + ssi, zi = zsi + ssi, wi = wsi + ssi;

        // Prime pre-multiplication for hash.
        const xsvp: bigint = BigInt(xsb) * PRIME_X, ysvp = BigInt(ysb) * PRIME_Y, zsvp = BigInt(zsb) * PRIME_Z, wsvp = BigInt(wsb) * PRIME_W;

        // Index into initial table.
        const index = ((this.fastFloor(xs * 4) & 3) << 0)
                | ((this.fastFloor(ys * 4) & 3) << 2)
                | ((this.fastFloor(zs * 4) & 3) << 4)
                | ((this.fastFloor(ws * 4) & 3) << 6);

        // Point contributions
        let value: number = 0;
        const secondaryIndexStartAndStop = this.LOOKUP_4D_A[index];
        const secondaryIndexStart = secondaryIndexStartAndStop & 0xFFFF;
        const secondaryIndexStop = secondaryIndexStartAndStop >> 16;
        for (let i = secondaryIndexStart; i < secondaryIndexStop; i++) {
            const c: LatticeVertex4D = this.LOOKUP_4D_B[i];
            const dx: number = xi + c.dx, dy = yi + c.dy, dz = zi + c.dz, dw = wi + c.dw;
            let a: number = (dx * dx + dy * dy) + (dz * dz + dw * dw);
            if (a < RSQUARED_4D) {
                a -= RSQUARED_4D;
                a *= a;
                value += a * a * this.grad_4(seed, xsvp + c.xsvp, ysvp + c.ysvp, zsvp + c.zsvp, wsvp + c.wsvp, dx, dy, dz, dw);
            }
        }
        return value;
    }

    /*
     * Utility
     */

    private static grad_2(seed: bigint, xsvp: bigint, ysvp: bigint, dx: number, dy: number): number {
        let hash: bigint = seed ^ xsvp ^ ysvp;
        hash *= HASH_MULTIPLIER;
        hash ^= hash >> BigInt(64 - N_GRADS_2D_EXPONENT + 1);
        const gi = Number(hash) & ((N_GRADS_2D - 1) << 1);
        return this.GRADIENTS_2D[gi | 0] * dx + this.GRADIENTS_2D[gi | 1] * dy;
    }

    private static grad_3(seed: bigint, xrvp: bigint, yrvp: bigint, zrvp: bigint, dx: number, dy: number, dz: number): number {
        let hash: bigint = (seed ^ xrvp) ^ (yrvp ^ zrvp);
        hash *= HASH_MULTIPLIER;
        hash ^= hash >> BigInt(64 - N_GRADS_3D_EXPONENT + 2);
        const gi = Number(hash) & ((N_GRADS_3D - 1) << 2);
        return this.GRADIENTS_3D[gi | 0] * dx + this.GRADIENTS_3D[gi | 1] * dy + this.GRADIENTS_3D[gi | 2] * dz;
    }

    private static grad_4(seed: bigint, xsvp: bigint, ysvp: bigint, zsvp: bigint, wsvp: bigint, dx: number, dy: number, dz: number, dw: number): number {
        let hash: bigint = seed ^ (xsvp ^ ysvp) ^ (zsvp ^ wsvp);
        hash *= HASH_MULTIPLIER;
        hash ^= hash >> BigInt(64 - N_GRADS_4D_EXPONENT + 2);
        const gi = Number(hash) & ((N_GRADS_4D - 1) << 2);
        return (this.GRADIENTS_4D[gi | 0] * dx + this.GRADIENTS_4D[gi | 1] * dy) + (this.GRADIENTS_4D[gi | 2] * dz + this.GRADIENTS_4D[gi | 3] * dw);
    }

    private static fastFloor(x: number) {
        const xi = Math.trunc(x); //TODO: I am not sure if this is how Java handles (int)a_double_variable
        return x < xi ? xi - 1 : xi;
    }

    /*
     * Lookup Tables & Gradients
     */

    private static readonly GRADIENTS_2D = new Float32Array(N_GRADS_2D * 2);
    private static readonly GRADIENTS_3D = new Float32Array(N_GRADS_3D * 4);
    private static readonly GRADIENTS_4D = new Float32Array(N_GRADS_4D * 4);
    private static readonly LOOKUP_4D_A = new Uint32Array(256);
    private static readonly LOOKUP_4D_B: LatticeVertex4D[] = [];
    
    static {
        // this.GRADIENTS_2D = new Float32Array(N_GRADS_2D * 2);
        const grad2 = [
                0.38268343236509,   0.923879532511287,
                0.923879532511287,  0.38268343236509,
                0.923879532511287, -0.38268343236509,
                0.38268343236509,  -0.923879532511287,
                -0.38268343236509,  -0.923879532511287,
                -0.923879532511287, -0.38268343236509,
                -0.923879532511287,  0.38268343236509,
                -0.38268343236509,   0.923879532511287,
                //-------------------------------------//
                0.130526192220052,  0.99144486137381,
                0.608761429008721,  0.793353340291235,
                0.793353340291235,  0.608761429008721,
                0.99144486137381,   0.130526192220051,
                0.99144486137381,  -0.130526192220051,
                0.793353340291235, -0.60876142900872,
                0.608761429008721, -0.793353340291235,
                0.130526192220052, -0.99144486137381,
                -0.130526192220052, -0.99144486137381,
                -0.608761429008721, -0.793353340291235,
                -0.793353340291235, -0.608761429008721,
                -0.99144486137381,  -0.130526192220052,
                -0.99144486137381,   0.130526192220051,
                -0.793353340291235,  0.608761429008721,
                -0.608761429008721,  0.793353340291235,
                -0.130526192220052,  0.99144486137381,
        ];
        for (let i = 0; i < grad2.length; i++) {
            grad2[i] = grad2[i] / NORMALIZER_2D;
        }
        for (let i = 0, j = 0; i < this.GRADIENTS_2D.length; i++, j++) {
            if (j == grad2.length) j = 0;
            this.GRADIENTS_2D[i] = grad2[j];
        }

        // this.GRADIENTS_3D = new Float32Array(N_GRADS_3D * 4);
        const grad3 = [
                2.22474487139,       2.22474487139,      -1.0,                 0.0,
                2.22474487139,       2.22474487139,       1.0,                 0.0,
                3.0862664687972017,  1.1721513422464978,  0.0,                 0.0,
                1.1721513422464978,  3.0862664687972017,  0.0,                 0.0,
                -2.22474487139,       2.22474487139,      -1.0,                 0.0,
                -2.22474487139,       2.22474487139,       1.0,                 0.0,
                -1.1721513422464978,  3.0862664687972017,  0.0,                 0.0,
                -3.0862664687972017,  1.1721513422464978,  0.0,                 0.0,
                -1.0,                -2.22474487139,      -2.22474487139,       0.0,
                1.0,                -2.22474487139,      -2.22474487139,       0.0,
                0.0,                -3.0862664687972017, -1.1721513422464978,  0.0,
                0.0,                -1.1721513422464978, -3.0862664687972017,  0.0,
                -1.0,                -2.22474487139,       2.22474487139,       0.0,
                1.0,                -2.22474487139,       2.22474487139,       0.0,
                0.0,                -1.1721513422464978,  3.0862664687972017,  0.0,
                0.0,                -3.0862664687972017,  1.1721513422464978,  0.0,
                //--------------------------------------------------------------------//
                -2.22474487139,      -2.22474487139,      -1.0,                 0.0,
                -2.22474487139,      -2.22474487139,       1.0,                 0.0,
                -3.0862664687972017, -1.1721513422464978,  0.0,                 0.0,
                -1.1721513422464978, -3.0862664687972017,  0.0,                 0.0,
                -2.22474487139,      -1.0,                -2.22474487139,       0.0,
                -2.22474487139,       1.0,                -2.22474487139,       0.0,
                -1.1721513422464978,  0.0,                -3.0862664687972017,  0.0,
                -3.0862664687972017,  0.0,                -1.1721513422464978,  0.0,
                -2.22474487139,      -1.0,                 2.22474487139,       0.0,
                -2.22474487139,       1.0,                 2.22474487139,       0.0,
                -3.0862664687972017,  0.0,                 1.1721513422464978,  0.0,
                -1.1721513422464978,  0.0,                 3.0862664687972017,  0.0,
                -1.0,                 2.22474487139,      -2.22474487139,       0.0,
                1.0,                 2.22474487139,      -2.22474487139,       0.0,
                0.0,                 1.1721513422464978, -3.0862664687972017,  0.0,
                0.0,                 3.0862664687972017, -1.1721513422464978,  0.0,
                -1.0,                 2.22474487139,       2.22474487139,       0.0,
                1.0,                 2.22474487139,       2.22474487139,       0.0,
                0.0,                 3.0862664687972017,  1.1721513422464978,  0.0,
                0.0,                 1.1721513422464978,  3.0862664687972017,  0.0,
                2.22474487139,      -2.22474487139,      -1.0,                 0.0,
                2.22474487139,      -2.22474487139,       1.0,                 0.0,
                1.1721513422464978, -3.0862664687972017,  0.0,                 0.0,
                3.0862664687972017, -1.1721513422464978,  0.0,                 0.0,
                2.22474487139,      -1.0,                -2.22474487139,       0.0,
                2.22474487139,       1.0,                -2.22474487139,       0.0,
                3.0862664687972017,  0.0,                -1.1721513422464978,  0.0,
                1.1721513422464978,  0.0,                -3.0862664687972017,  0.0,
                2.22474487139,      -1.0,                 2.22474487139,       0.0,
                2.22474487139,       1.0,                 2.22474487139,       0.0,
                1.1721513422464978,  0.0,                 3.0862664687972017,  0.0,
                3.0862664687972017,  0.0,                 1.1721513422464978,  0.0,
        ];
        for (let i = 0; i < grad3.length; i++) {
            grad3[i] = grad3[i] / NORMALIZER_3D;
        }
        for (let i = 0, j = 0; i < this.GRADIENTS_3D.length; i++, j++) {
            if (j == grad3.length) j = 0;
            this.GRADIENTS_3D[i] = grad3[j];
        }

        // this.GRADIENTS_4D = new Float32Array(N_GRADS_4D * 4);
        const grad4 = [
                -0.6740059517812944,   -0.3239847771997537,   -0.3239847771997537,    0.5794684678643381,
                -0.7504883828755602,   -0.4004672082940195,    0.15296486218853164,   0.5029860367700724,
                -0.7504883828755602,    0.15296486218853164,  -0.4004672082940195,    0.5029860367700724,
                -0.8828161875373585,    0.08164729285680945,   0.08164729285680945,   0.4553054119602712,
                -0.4553054119602712,   -0.08164729285680945,  -0.08164729285680945,   0.8828161875373585,
                -0.5029860367700724,   -0.15296486218853164,   0.4004672082940195,    0.7504883828755602,
                -0.5029860367700724,    0.4004672082940195,   -0.15296486218853164,   0.7504883828755602,
                -0.5794684678643381,    0.3239847771997537,    0.3239847771997537,    0.6740059517812944,
                -0.6740059517812944,   -0.3239847771997537,    0.5794684678643381,   -0.3239847771997537,
                -0.7504883828755602,   -0.4004672082940195,    0.5029860367700724,    0.15296486218853164,
                -0.7504883828755602,    0.15296486218853164,   0.5029860367700724,   -0.4004672082940195,
                -0.8828161875373585,    0.08164729285680945,   0.4553054119602712,    0.08164729285680945,
                -0.4553054119602712,   -0.08164729285680945,   0.8828161875373585,   -0.08164729285680945,
                -0.5029860367700724,   -0.15296486218853164,   0.7504883828755602,    0.4004672082940195,
                -0.5029860367700724,    0.4004672082940195,    0.7504883828755602,   -0.15296486218853164,
                -0.5794684678643381,    0.3239847771997537,    0.6740059517812944,    0.3239847771997537,
                -0.6740059517812944,    0.5794684678643381,   -0.3239847771997537,   -0.3239847771997537,
                -0.7504883828755602,    0.5029860367700724,   -0.4004672082940195,    0.15296486218853164,
                -0.7504883828755602,    0.5029860367700724,    0.15296486218853164,  -0.4004672082940195,
                -0.8828161875373585,    0.4553054119602712,    0.08164729285680945,   0.08164729285680945,
                -0.4553054119602712,    0.8828161875373585,   -0.08164729285680945,  -0.08164729285680945,
                -0.5029860367700724,    0.7504883828755602,   -0.15296486218853164,   0.4004672082940195,
                -0.5029860367700724,    0.7504883828755602,    0.4004672082940195,   -0.15296486218853164,
                -0.5794684678643381,    0.6740059517812944,    0.3239847771997537,    0.3239847771997537,
                0.5794684678643381,   -0.6740059517812944,   -0.3239847771997537,   -0.3239847771997537,
                0.5029860367700724,   -0.7504883828755602,   -0.4004672082940195,    0.15296486218853164,
                0.5029860367700724,   -0.7504883828755602,    0.15296486218853164,  -0.4004672082940195,
                0.4553054119602712,   -0.8828161875373585,    0.08164729285680945,   0.08164729285680945,
                0.8828161875373585,   -0.4553054119602712,   -0.08164729285680945,  -0.08164729285680945,
                0.7504883828755602,   -0.5029860367700724,   -0.15296486218853164,   0.4004672082940195,
                0.7504883828755602,   -0.5029860367700724,    0.4004672082940195,   -0.15296486218853164,
                0.6740059517812944,   -0.5794684678643381,    0.3239847771997537,    0.3239847771997537,
                //------------------------------------------------------------------------------------------//
                -0.753341017856078,    -0.37968289875261624,  -0.37968289875261624,  -0.37968289875261624,
                -0.7821684431180708,   -0.4321472685365301,   -0.4321472685365301,    0.12128480194602098,
                -0.7821684431180708,   -0.4321472685365301,    0.12128480194602098,  -0.4321472685365301,
                -0.7821684431180708,    0.12128480194602098,  -0.4321472685365301,   -0.4321472685365301,
                -0.8586508742123365,   -0.508629699630796,     0.044802370851755174,  0.044802370851755174,
                -0.8586508742123365,    0.044802370851755174, -0.508629699630796,     0.044802370851755174,
                -0.8586508742123365,    0.044802370851755174,  0.044802370851755174, -0.508629699630796,
                -0.9982828964265062,   -0.03381941603233842,  -0.03381941603233842,  -0.03381941603233842,
                -0.37968289875261624,  -0.753341017856078,    -0.37968289875261624,  -0.37968289875261624,
                -0.4321472685365301,   -0.7821684431180708,   -0.4321472685365301,    0.12128480194602098,
                -0.4321472685365301,   -0.7821684431180708,    0.12128480194602098,  -0.4321472685365301,
                0.12128480194602098,  -0.7821684431180708,   -0.4321472685365301,   -0.4321472685365301,
                -0.508629699630796,    -0.8586508742123365,    0.044802370851755174,  0.044802370851755174,
                0.044802370851755174, -0.8586508742123365,   -0.508629699630796,     0.044802370851755174,
                0.044802370851755174, -0.8586508742123365,    0.044802370851755174, -0.508629699630796,
                -0.03381941603233842,  -0.9982828964265062,   -0.03381941603233842,  -0.03381941603233842,
                -0.37968289875261624,  -0.37968289875261624,  -0.753341017856078,    -0.37968289875261624,
                -0.4321472685365301,   -0.4321472685365301,   -0.7821684431180708,    0.12128480194602098,
                -0.4321472685365301,    0.12128480194602098,  -0.7821684431180708,   -0.4321472685365301,
                0.12128480194602098,  -0.4321472685365301,   -0.7821684431180708,   -0.4321472685365301,
                -0.508629699630796,     0.044802370851755174, -0.8586508742123365,    0.044802370851755174,
                0.044802370851755174, -0.508629699630796,    -0.8586508742123365,    0.044802370851755174,
                0.044802370851755174,  0.044802370851755174, -0.8586508742123365,   -0.508629699630796,
                -0.03381941603233842,  -0.03381941603233842,  -0.9982828964265062,   -0.03381941603233842,
                -0.37968289875261624,  -0.37968289875261624,  -0.37968289875261624,  -0.753341017856078,
                -0.4321472685365301,   -0.4321472685365301,    0.12128480194602098,  -0.7821684431180708,
                -0.4321472685365301,    0.12128480194602098,  -0.4321472685365301,   -0.7821684431180708,
                0.12128480194602098,  -0.4321472685365301,   -0.4321472685365301,   -0.7821684431180708,
                -0.508629699630796,     0.044802370851755174,  0.044802370851755174, -0.8586508742123365,
                0.044802370851755174, -0.508629699630796,     0.044802370851755174, -0.8586508742123365,
                0.044802370851755174,  0.044802370851755174, -0.508629699630796,    -0.8586508742123365,
                -0.03381941603233842,  -0.03381941603233842,  -0.03381941603233842,  -0.9982828964265062,
                -0.3239847771997537,   -0.6740059517812944,   -0.3239847771997537,    0.5794684678643381,
                -0.4004672082940195,   -0.7504883828755602,    0.15296486218853164,   0.5029860367700724,
                0.15296486218853164,  -0.7504883828755602,   -0.4004672082940195,    0.5029860367700724,
                0.08164729285680945,  -0.8828161875373585,    0.08164729285680945,   0.4553054119602712,
                -0.08164729285680945,  -0.4553054119602712,   -0.08164729285680945,   0.8828161875373585,
                -0.15296486218853164,  -0.5029860367700724,    0.4004672082940195,    0.7504883828755602,
                0.4004672082940195,   -0.5029860367700724,   -0.15296486218853164,   0.7504883828755602,
                0.3239847771997537,   -0.5794684678643381,    0.3239847771997537,    0.6740059517812944,
                -0.3239847771997537,   -0.3239847771997537,   -0.6740059517812944,    0.5794684678643381,
                -0.4004672082940195,    0.15296486218853164,  -0.7504883828755602,    0.5029860367700724,
                0.15296486218853164,  -0.4004672082940195,   -0.7504883828755602,    0.5029860367700724,
                0.08164729285680945,   0.08164729285680945,  -0.8828161875373585,    0.4553054119602712,
                -0.08164729285680945,  -0.08164729285680945,  -0.4553054119602712,    0.8828161875373585,
                -0.15296486218853164,   0.4004672082940195,   -0.5029860367700724,    0.7504883828755602,
                0.4004672082940195,   -0.15296486218853164,  -0.5029860367700724,    0.7504883828755602,
                0.3239847771997537,    0.3239847771997537,   -0.5794684678643381,    0.6740059517812944,
                -0.3239847771997537,   -0.6740059517812944,    0.5794684678643381,   -0.3239847771997537,
                -0.4004672082940195,   -0.7504883828755602,    0.5029860367700724,    0.15296486218853164,
                0.15296486218853164,  -0.7504883828755602,    0.5029860367700724,   -0.4004672082940195,
                0.08164729285680945,  -0.8828161875373585,    0.4553054119602712,    0.08164729285680945,
                -0.08164729285680945,  -0.4553054119602712,    0.8828161875373585,   -0.08164729285680945,
                -0.15296486218853164,  -0.5029860367700724,    0.7504883828755602,    0.4004672082940195,
                0.4004672082940195,   -0.5029860367700724,    0.7504883828755602,   -0.15296486218853164,
                0.3239847771997537,   -0.5794684678643381,    0.6740059517812944,    0.3239847771997537,
                -0.3239847771997537,   -0.3239847771997537,    0.5794684678643381,   -0.6740059517812944,
                -0.4004672082940195,    0.15296486218853164,   0.5029860367700724,   -0.7504883828755602,
                0.15296486218853164,  -0.4004672082940195,    0.5029860367700724,   -0.7504883828755602,
                0.08164729285680945,   0.08164729285680945,   0.4553054119602712,   -0.8828161875373585,
                -0.08164729285680945,  -0.08164729285680945,   0.8828161875373585,   -0.4553054119602712,
                -0.15296486218853164,   0.4004672082940195,    0.7504883828755602,   -0.5029860367700724,
                0.4004672082940195,   -0.15296486218853164,   0.7504883828755602,   -0.5029860367700724,
                0.3239847771997537,    0.3239847771997537,    0.6740059517812944,   -0.5794684678643381,
                -0.3239847771997537,    0.5794684678643381,   -0.6740059517812944,   -0.3239847771997537,
                -0.4004672082940195,    0.5029860367700724,   -0.7504883828755602,    0.15296486218853164,
                0.15296486218853164,   0.5029860367700724,   -0.7504883828755602,   -0.4004672082940195,
                0.08164729285680945,   0.4553054119602712,   -0.8828161875373585,    0.08164729285680945,
                -0.08164729285680945,   0.8828161875373585,   -0.4553054119602712,   -0.08164729285680945,
                -0.15296486218853164,   0.7504883828755602,   -0.5029860367700724,    0.4004672082940195,
                0.4004672082940195,    0.7504883828755602,   -0.5029860367700724,   -0.15296486218853164,
                0.3239847771997537,    0.6740059517812944,   -0.5794684678643381,    0.3239847771997537,
                -0.3239847771997537,    0.5794684678643381,   -0.3239847771997537,   -0.6740059517812944,
                -0.4004672082940195,    0.5029860367700724,    0.15296486218853164,  -0.7504883828755602,
                0.15296486218853164,   0.5029860367700724,   -0.4004672082940195,   -0.7504883828755602,
                0.08164729285680945,   0.4553054119602712,    0.08164729285680945,  -0.8828161875373585,
                -0.08164729285680945,   0.8828161875373585,   -0.08164729285680945,  -0.4553054119602712,
                -0.15296486218853164,   0.7504883828755602,    0.4004672082940195,   -0.5029860367700724,
                0.4004672082940195,    0.7504883828755602,   -0.15296486218853164,  -0.5029860367700724,
                0.3239847771997537,    0.6740059517812944,    0.3239847771997537,   -0.5794684678643381,
                0.5794684678643381,   -0.3239847771997537,   -0.6740059517812944,   -0.3239847771997537,
                0.5029860367700724,   -0.4004672082940195,   -0.7504883828755602,    0.15296486218853164,
                0.5029860367700724,    0.15296486218853164,  -0.7504883828755602,   -0.4004672082940195,
                0.4553054119602712,    0.08164729285680945,  -0.8828161875373585,    0.08164729285680945,
                0.8828161875373585,   -0.08164729285680945,  -0.4553054119602712,   -0.08164729285680945,
                0.7504883828755602,   -0.15296486218853164,  -0.5029860367700724,    0.4004672082940195,
                0.7504883828755602,    0.4004672082940195,   -0.5029860367700724,   -0.15296486218853164,
                0.6740059517812944,    0.3239847771997537,   -0.5794684678643381,    0.3239847771997537,
                0.5794684678643381,   -0.3239847771997537,   -0.3239847771997537,   -0.6740059517812944,
                0.5029860367700724,   -0.4004672082940195,    0.15296486218853164,  -0.7504883828755602,
                0.5029860367700724,    0.15296486218853164,  -0.4004672082940195,   -0.7504883828755602,
                0.4553054119602712,    0.08164729285680945,   0.08164729285680945,  -0.8828161875373585,
                0.8828161875373585,   -0.08164729285680945,  -0.08164729285680945,  -0.4553054119602712,
                0.7504883828755602,   -0.15296486218853164,   0.4004672082940195,   -0.5029860367700724,
                0.7504883828755602,    0.4004672082940195,   -0.15296486218853164,  -0.5029860367700724,
                0.6740059517812944,    0.3239847771997537,    0.3239847771997537,   -0.5794684678643381,
                0.03381941603233842,   0.03381941603233842,   0.03381941603233842,   0.9982828964265062,
                -0.044802370851755174, -0.044802370851755174,  0.508629699630796,     0.8586508742123365,
                -0.044802370851755174,  0.508629699630796,    -0.044802370851755174,  0.8586508742123365,
                -0.12128480194602098,   0.4321472685365301,    0.4321472685365301,    0.7821684431180708,
                0.508629699630796,    -0.044802370851755174, -0.044802370851755174,  0.8586508742123365,
                0.4321472685365301,   -0.12128480194602098,   0.4321472685365301,    0.7821684431180708,
                0.4321472685365301,    0.4321472685365301,   -0.12128480194602098,   0.7821684431180708,
                0.37968289875261624,   0.37968289875261624,   0.37968289875261624,   0.753341017856078,
                0.03381941603233842,   0.03381941603233842,   0.9982828964265062,    0.03381941603233842,
                -0.044802370851755174,  0.044802370851755174,  0.8586508742123365,    0.508629699630796,
                -0.044802370851755174,  0.508629699630796,     0.8586508742123365,   -0.044802370851755174,
                -0.12128480194602098,   0.4321472685365301,    0.7821684431180708,    0.4321472685365301,
                0.508629699630796,    -0.044802370851755174,  0.8586508742123365,   -0.044802370851755174,
                0.4321472685365301,   -0.12128480194602098,   0.7821684431180708,    0.4321472685365301,
                0.4321472685365301,    0.4321472685365301,    0.7821684431180708,   -0.12128480194602098,
                0.37968289875261624,   0.37968289875261624,   0.753341017856078,     0.37968289875261624,
                0.03381941603233842,   0.9982828964265062,    0.03381941603233842,   0.03381941603233842,
                -0.044802370851755174,  0.8586508742123365,   -0.044802370851755174,  0.508629699630796,
                -0.044802370851755174,  0.8586508742123365,    0.508629699630796,    -0.044802370851755174,
                -0.12128480194602098,   0.7821684431180708,    0.4321472685365301,    0.4321472685365301,
                0.508629699630796,     0.8586508742123365,   -0.044802370851755174, -0.044802370851755174,
                0.4321472685365301,    0.7821684431180708,   -0.12128480194602098,   0.4321472685365301,
                0.4321472685365301,    0.7821684431180708,    0.4321472685365301,   -0.12128480194602098,
                0.37968289875261624,   0.753341017856078,     0.37968289875261624,   0.37968289875261624,
                0.9982828964265062,    0.03381941603233842,   0.03381941603233842,   0.03381941603233842,
                0.8586508742123365,   -0.044802370851755174, -0.044802370851755174,  0.508629699630796,
                0.8586508742123365,   -0.044802370851755174,  0.508629699630796,    -0.044802370851755174,
                0.7821684431180708,   -0.12128480194602098,   0.4321472685365301,    0.4321472685365301,
                0.8586508742123365,    0.508629699630796,    -0.044802370851755174, -0.044802370851755174,
                0.7821684431180708,    0.4321472685365301,   -0.12128480194602098,   0.4321472685365301,
                0.7821684431180708,    0.4321472685365301,    0.4321472685365301,   -0.12128480194602098,
                0.753341017856078,     0.37968289875261624,   0.37968289875261624,   0.37968289875261624,
        ];
        for (let i = 0; i < grad4.length; i++) {
            grad4[i] = grad4[i] / NORMALIZER_4D;
        }
        for (let i = 0, j = 0; i < this.GRADIENTS_4D.length; i++, j++) {
            if (j == grad4.length) j = 0;
            this.GRADIENTS_4D[i] = grad4[j];
        }

        const lookup4DVertexCodes: number[][] = [
                [ 0x15, 0x45, 0x51, 0x54, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x15, 0x45, 0x51, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x6A, 0x95, 0x96, 0x9A, 0xA6, 0xAA ],
                [ 0x01, 0x05, 0x11, 0x15, 0x41, 0x45, 0x51, 0x55, 0x56, 0x5A, 0x66, 0x6A, 0x96, 0x9A, 0xA6, 0xAA ],
                [ 0x01, 0x15, 0x16, 0x45, 0x46, 0x51, 0x52, 0x55, 0x56, 0x5A, 0x66, 0x6A, 0x96, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x15, 0x45, 0x54, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x69, 0x6A, 0x95, 0x99, 0x9A, 0xA9, 0xAA ],
                [ 0x05, 0x15, 0x45, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xAA ],
                [ 0x05, 0x15, 0x45, 0x55, 0x56, 0x59, 0x5A, 0x66, 0x6A, 0x96, 0x9A, 0xAA ],
                [ 0x05, 0x15, 0x16, 0x45, 0x46, 0x55, 0x56, 0x59, 0x5A, 0x66, 0x6A, 0x96, 0x9A, 0xAA, 0xAB ],
                [ 0x04, 0x05, 0x14, 0x15, 0x44, 0x45, 0x54, 0x55, 0x59, 0x5A, 0x69, 0x6A, 0x99, 0x9A, 0xA9, 0xAA ],
                [ 0x05, 0x15, 0x45, 0x55, 0x56, 0x59, 0x5A, 0x69, 0x6A, 0x99, 0x9A, 0xAA ],
                [ 0x05, 0x15, 0x45, 0x55, 0x56, 0x59, 0x5A, 0x6A, 0x9A, 0xAA ],
                [ 0x05, 0x15, 0x16, 0x45, 0x46, 0x55, 0x56, 0x59, 0x5A, 0x5B, 0x6A, 0x9A, 0xAA, 0xAB ],
                [ 0x04, 0x15, 0x19, 0x45, 0x49, 0x54, 0x55, 0x58, 0x59, 0x5A, 0x69, 0x6A, 0x99, 0x9A, 0xA9, 0xAA, 0xAE ],
                [ 0x05, 0x15, 0x19, 0x45, 0x49, 0x55, 0x56, 0x59, 0x5A, 0x69, 0x6A, 0x99, 0x9A, 0xAA, 0xAE ],
                [ 0x05, 0x15, 0x19, 0x45, 0x49, 0x55, 0x56, 0x59, 0x5A, 0x5E, 0x6A, 0x9A, 0xAA, 0xAE ],
                [ 0x05, 0x15, 0x1A, 0x45, 0x4A, 0x55, 0x56, 0x59, 0x5A, 0x5B, 0x5E, 0x6A, 0x9A, 0xAA, 0xAB, 0xAE, 0xAF ],
                [ 0x15, 0x51, 0x54, 0x55, 0x56, 0x59, 0x65, 0x66, 0x69, 0x6A, 0x95, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x11, 0x15, 0x51, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x96, 0xA5, 0xA6, 0xAA ],
                [ 0x11, 0x15, 0x51, 0x55, 0x56, 0x5A, 0x65, 0x66, 0x6A, 0x96, 0xA6, 0xAA ],
                [ 0x11, 0x15, 0x16, 0x51, 0x52, 0x55, 0x56, 0x5A, 0x65, 0x66, 0x6A, 0x96, 0xA6, 0xAA, 0xAB ],
                [ 0x14, 0x15, 0x54, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x99, 0xA5, 0xA9, 0xAA ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x9A, 0xA6, 0xA9, 0xAA ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x96, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x15, 0x16, 0x55, 0x56, 0x5A, 0x66, 0x6A, 0x6B, 0x96, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x14, 0x15, 0x54, 0x55, 0x59, 0x5A, 0x65, 0x69, 0x6A, 0x99, 0xA9, 0xAA ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x99, 0x9A, 0xA9, 0xAA, 0xAE ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x9A, 0xAA ],
                [ 0x15, 0x16, 0x55, 0x56, 0x59, 0x5A, 0x66, 0x6A, 0x6B, 0x9A, 0xAA, 0xAB ],
                [ 0x14, 0x15, 0x19, 0x54, 0x55, 0x58, 0x59, 0x5A, 0x65, 0x69, 0x6A, 0x99, 0xA9, 0xAA, 0xAE ],
                [ 0x15, 0x19, 0x55, 0x59, 0x5A, 0x69, 0x6A, 0x6E, 0x99, 0x9A, 0xA9, 0xAA, 0xAE ],
                [ 0x15, 0x19, 0x55, 0x56, 0x59, 0x5A, 0x69, 0x6A, 0x6E, 0x9A, 0xAA, 0xAE ],
                [ 0x15, 0x1A, 0x55, 0x56, 0x59, 0x5A, 0x6A, 0x6B, 0x6E, 0x9A, 0xAA, 0xAB, 0xAE, 0xAF ],
                [ 0x10, 0x11, 0x14, 0x15, 0x50, 0x51, 0x54, 0x55, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x11, 0x15, 0x51, 0x55, 0x56, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA6, 0xAA ],
                [ 0x11, 0x15, 0x51, 0x55, 0x56, 0x65, 0x66, 0x6A, 0xA6, 0xAA ],
                [ 0x11, 0x15, 0x16, 0x51, 0x52, 0x55, 0x56, 0x65, 0x66, 0x67, 0x6A, 0xA6, 0xAA, 0xAB ],
                [ 0x14, 0x15, 0x54, 0x55, 0x59, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA9, 0xAA ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0xA6, 0xAA ],
                [ 0x15, 0x16, 0x55, 0x56, 0x5A, 0x65, 0x66, 0x6A, 0x6B, 0xA6, 0xAA, 0xAB ],
                [ 0x14, 0x15, 0x54, 0x55, 0x59, 0x65, 0x69, 0x6A, 0xA9, 0xAA ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0xA9, 0xAA ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0xAA ],
                [ 0x15, 0x16, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x6B, 0xAA, 0xAB ],
                [ 0x14, 0x15, 0x19, 0x54, 0x55, 0x58, 0x59, 0x65, 0x69, 0x6A, 0x6D, 0xA9, 0xAA, 0xAE ],
                [ 0x15, 0x19, 0x55, 0x59, 0x5A, 0x65, 0x69, 0x6A, 0x6E, 0xA9, 0xAA, 0xAE ],
                [ 0x15, 0x19, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x6E, 0xAA, 0xAE ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x66, 0x69, 0x6A, 0x6B, 0x6E, 0x9A, 0xAA, 0xAB, 0xAE, 0xAF ],
                [ 0x10, 0x15, 0x25, 0x51, 0x54, 0x55, 0x61, 0x64, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x11, 0x15, 0x25, 0x51, 0x55, 0x56, 0x61, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA6, 0xAA, 0xBA ],
                [ 0x11, 0x15, 0x25, 0x51, 0x55, 0x56, 0x61, 0x65, 0x66, 0x6A, 0x76, 0xA6, 0xAA, 0xBA ],
                [ 0x11, 0x15, 0x26, 0x51, 0x55, 0x56, 0x62, 0x65, 0x66, 0x67, 0x6A, 0x76, 0xA6, 0xAA, 0xAB, 0xBA, 0xBB ],
                [ 0x14, 0x15, 0x25, 0x54, 0x55, 0x59, 0x64, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA9, 0xAA, 0xBA ],
                [ 0x15, 0x25, 0x55, 0x65, 0x66, 0x69, 0x6A, 0x7A, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x15, 0x25, 0x55, 0x56, 0x65, 0x66, 0x69, 0x6A, 0x7A, 0xA6, 0xAA, 0xBA ],
                [ 0x15, 0x26, 0x55, 0x56, 0x65, 0x66, 0x6A, 0x6B, 0x7A, 0xA6, 0xAA, 0xAB, 0xBA, 0xBB ],
                [ 0x14, 0x15, 0x25, 0x54, 0x55, 0x59, 0x64, 0x65, 0x69, 0x6A, 0x79, 0xA9, 0xAA, 0xBA ],
                [ 0x15, 0x25, 0x55, 0x59, 0x65, 0x66, 0x69, 0x6A, 0x7A, 0xA9, 0xAA, 0xBA ],
                [ 0x15, 0x25, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x7A, 0xAA, 0xBA ],
                [ 0x15, 0x55, 0x56, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x6B, 0x7A, 0xA6, 0xAA, 0xAB, 0xBA, 0xBB ],
                [ 0x14, 0x15, 0x29, 0x54, 0x55, 0x59, 0x65, 0x68, 0x69, 0x6A, 0x6D, 0x79, 0xA9, 0xAA, 0xAE, 0xBA, 0xBE ],
                [ 0x15, 0x29, 0x55, 0x59, 0x65, 0x69, 0x6A, 0x6E, 0x7A, 0xA9, 0xAA, 0xAE, 0xBA, 0xBE ],
                [ 0x15, 0x55, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x6E, 0x7A, 0xA9, 0xAA, 0xAE, 0xBA, 0xBE ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x6B, 0x6E, 0x7A, 0xAA, 0xAB, 0xAE, 0xBA, 0xBF ],
                [ 0x45, 0x51, 0x54, 0x55, 0x56, 0x59, 0x65, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x41, 0x45, 0x51, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xAA ],
                [ 0x41, 0x45, 0x51, 0x55, 0x56, 0x5A, 0x66, 0x95, 0x96, 0x9A, 0xA6, 0xAA ],
                [ 0x41, 0x45, 0x46, 0x51, 0x52, 0x55, 0x56, 0x5A, 0x66, 0x95, 0x96, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x44, 0x45, 0x54, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x69, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA9, 0xAA ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA6, 0xA9, 0xAA ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x66, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x45, 0x46, 0x55, 0x56, 0x5A, 0x66, 0x6A, 0x96, 0x9A, 0x9B, 0xA6, 0xAA, 0xAB ],
                [ 0x44, 0x45, 0x54, 0x55, 0x59, 0x5A, 0x69, 0x95, 0x99, 0x9A, 0xA9, 0xAA ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x69, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA9, 0xAA, 0xAE ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xAA ],
                [ 0x45, 0x46, 0x55, 0x56, 0x59, 0x5A, 0x6A, 0x96, 0x9A, 0x9B, 0xAA, 0xAB ],
                [ 0x44, 0x45, 0x49, 0x54, 0x55, 0x58, 0x59, 0x5A, 0x69, 0x95, 0x99, 0x9A, 0xA9, 0xAA, 0xAE ],
                [ 0x45, 0x49, 0x55, 0x59, 0x5A, 0x69, 0x6A, 0x99, 0x9A, 0x9E, 0xA9, 0xAA, 0xAE ],
                [ 0x45, 0x49, 0x55, 0x56, 0x59, 0x5A, 0x6A, 0x99, 0x9A, 0x9E, 0xAA, 0xAE ],
                [ 0x45, 0x4A, 0x55, 0x56, 0x59, 0x5A, 0x6A, 0x9A, 0x9B, 0x9E, 0xAA, 0xAB, 0xAE, 0xAF ],
                [ 0x50, 0x51, 0x54, 0x55, 0x56, 0x59, 0x65, 0x66, 0x69, 0x95, 0x96, 0x99, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x51, 0x55, 0x56, 0x59, 0x65, 0x66, 0x6A, 0x95, 0x96, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x51, 0x55, 0x56, 0x5A, 0x65, 0x66, 0x6A, 0x95, 0x96, 0x9A, 0xA5, 0xA6, 0xAA, 0xAB ],
                [ 0x51, 0x52, 0x55, 0x56, 0x5A, 0x66, 0x6A, 0x96, 0x9A, 0xA6, 0xA7, 0xAA, 0xAB ],
                [ 0x54, 0x55, 0x56, 0x59, 0x65, 0x69, 0x6A, 0x95, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x15, 0x45, 0x51, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x6A, 0x95, 0x96, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x55, 0x56, 0x5A, 0x66, 0x6A, 0x96, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x54, 0x55, 0x59, 0x5A, 0x65, 0x69, 0x6A, 0x95, 0x99, 0x9A, 0xA5, 0xA9, 0xAA, 0xAE ],
                [ 0x15, 0x45, 0x54, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x69, 0x6A, 0x95, 0x99, 0x9A, 0xA9, 0xAA, 0xAE ],
                [ 0x15, 0x45, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA6, 0xA9, 0xAA, 0xAB, 0xAE ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x66, 0x6A, 0x96, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x54, 0x55, 0x58, 0x59, 0x5A, 0x69, 0x6A, 0x99, 0x9A, 0xA9, 0xAA, 0xAD, 0xAE ],
                [ 0x55, 0x59, 0x5A, 0x69, 0x6A, 0x99, 0x9A, 0xA9, 0xAA, 0xAE ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x69, 0x6A, 0x99, 0x9A, 0xA9, 0xAA, 0xAE ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x6A, 0x9A, 0xAA, 0xAB, 0xAE, 0xAF ],
                [ 0x50, 0x51, 0x54, 0x55, 0x65, 0x66, 0x69, 0x95, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x96, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x6A, 0x95, 0x96, 0xA5, 0xA6, 0xAA ],
                [ 0x51, 0x52, 0x55, 0x56, 0x65, 0x66, 0x6A, 0x96, 0xA6, 0xA7, 0xAA, 0xAB ],
                [ 0x54, 0x55, 0x59, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x99, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x15, 0x51, 0x54, 0x55, 0x56, 0x59, 0x65, 0x66, 0x69, 0x6A, 0x95, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x15, 0x51, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x96, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xAB, 0xBA ],
                [ 0x55, 0x56, 0x5A, 0x65, 0x66, 0x6A, 0x96, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x54, 0x55, 0x59, 0x65, 0x69, 0x6A, 0x95, 0x99, 0xA5, 0xA9, 0xAA ],
                [ 0x15, 0x54, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xAE, 0xBA ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x9A, 0xA6, 0xA9, 0xAA ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x96, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x54, 0x55, 0x58, 0x59, 0x65, 0x69, 0x6A, 0x99, 0xA9, 0xAA, 0xAD, 0xAE ],
                [ 0x55, 0x59, 0x5A, 0x65, 0x69, 0x6A, 0x99, 0x9A, 0xA9, 0xAA, 0xAE ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x99, 0x9A, 0xA9, 0xAA, 0xAE ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x66, 0x69, 0x6A, 0x9A, 0xAA, 0xAB, 0xAE, 0xAF ],
                [ 0x50, 0x51, 0x54, 0x55, 0x61, 0x64, 0x65, 0x66, 0x69, 0x95, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x51, 0x55, 0x61, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA6, 0xA9, 0xAA, 0xB6, 0xBA ],
                [ 0x51, 0x55, 0x56, 0x61, 0x65, 0x66, 0x6A, 0xA5, 0xA6, 0xAA, 0xB6, 0xBA ],
                [ 0x51, 0x55, 0x56, 0x62, 0x65, 0x66, 0x6A, 0xA6, 0xA7, 0xAA, 0xAB, 0xB6, 0xBA, 0xBB ],
                [ 0x54, 0x55, 0x64, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA6, 0xA9, 0xAA, 0xB9, 0xBA ],
                [ 0x55, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x55, 0x56, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x55, 0x56, 0x65, 0x66, 0x6A, 0xA6, 0xAA, 0xAB, 0xBA, 0xBB ],
                [ 0x54, 0x55, 0x59, 0x64, 0x65, 0x69, 0x6A, 0xA5, 0xA9, 0xAA, 0xB9, 0xBA ],
                [ 0x55, 0x59, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x15, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x15, 0x55, 0x56, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0xA6, 0xAA, 0xAB, 0xBA, 0xBB ],
                [ 0x54, 0x55, 0x59, 0x65, 0x68, 0x69, 0x6A, 0xA9, 0xAA, 0xAD, 0xAE, 0xB9, 0xBA, 0xBE ],
                [ 0x55, 0x59, 0x65, 0x69, 0x6A, 0xA9, 0xAA, 0xAE, 0xBA, 0xBE ],
                [ 0x15, 0x55, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0xA9, 0xAA, 0xAE, 0xBA, 0xBE ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0xAA, 0xAB, 0xAE, 0xBA, 0xBF ],
                [ 0x40, 0x41, 0x44, 0x45, 0x50, 0x51, 0x54, 0x55, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x41, 0x45, 0x51, 0x55, 0x56, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xAA ],
                [ 0x41, 0x45, 0x51, 0x55, 0x56, 0x95, 0x96, 0x9A, 0xA6, 0xAA ],
                [ 0x41, 0x45, 0x46, 0x51, 0x52, 0x55, 0x56, 0x95, 0x96, 0x97, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x44, 0x45, 0x54, 0x55, 0x59, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA9, 0xAA ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0xA6, 0xAA ],
                [ 0x45, 0x46, 0x55, 0x56, 0x5A, 0x95, 0x96, 0x9A, 0x9B, 0xA6, 0xAA, 0xAB ],
                [ 0x44, 0x45, 0x54, 0x55, 0x59, 0x95, 0x99, 0x9A, 0xA9, 0xAA ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0xA9, 0xAA ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0xAA ],
                [ 0x45, 0x46, 0x55, 0x56, 0x59, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0x9B, 0xAA, 0xAB ],
                [ 0x44, 0x45, 0x49, 0x54, 0x55, 0x58, 0x59, 0x95, 0x99, 0x9A, 0x9D, 0xA9, 0xAA, 0xAE ],
                [ 0x45, 0x49, 0x55, 0x59, 0x5A, 0x95, 0x99, 0x9A, 0x9E, 0xA9, 0xAA, 0xAE ],
                [ 0x45, 0x49, 0x55, 0x56, 0x59, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0x9E, 0xAA, 0xAE ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x6A, 0x96, 0x99, 0x9A, 0x9B, 0x9E, 0xAA, 0xAB, 0xAE, 0xAF ],
                [ 0x50, 0x51, 0x54, 0x55, 0x65, 0x95, 0x96, 0x99, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x95, 0x96, 0x9A, 0xA5, 0xA6, 0xAA ],
                [ 0x51, 0x52, 0x55, 0x56, 0x66, 0x95, 0x96, 0x9A, 0xA6, 0xA7, 0xAA, 0xAB ],
                [ 0x54, 0x55, 0x59, 0x65, 0x69, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x45, 0x51, 0x54, 0x55, 0x56, 0x59, 0x65, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x45, 0x51, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xAB, 0xEA ],
                [ 0x55, 0x56, 0x5A, 0x66, 0x6A, 0x95, 0x96, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x54, 0x55, 0x59, 0x65, 0x69, 0x95, 0x99, 0x9A, 0xA5, 0xA9, 0xAA ],
                [ 0x45, 0x54, 0x55, 0x56, 0x59, 0x5A, 0x65, 0x69, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xAE, 0xEA ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA6, 0xA9, 0xAA ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x66, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA6, 0xAA, 0xAB ],
                [ 0x54, 0x55, 0x58, 0x59, 0x69, 0x95, 0x99, 0x9A, 0xA9, 0xAA, 0xAD, 0xAE ],
                [ 0x55, 0x59, 0x5A, 0x69, 0x6A, 0x95, 0x99, 0x9A, 0xA9, 0xAA, 0xAE ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x69, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA9, 0xAA, 0xAE ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x6A, 0x96, 0x99, 0x9A, 0xAA, 0xAB, 0xAE, 0xAF ],
                [ 0x50, 0x51, 0x54, 0x55, 0x65, 0x95, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x95, 0x96, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x95, 0x96, 0xA5, 0xA6, 0xAA ],
                [ 0x51, 0x52, 0x55, 0x56, 0x65, 0x66, 0x95, 0x96, 0xA5, 0xA6, 0xA7, 0xAA, 0xAB ],
                [ 0x54, 0x55, 0x59, 0x65, 0x69, 0x95, 0x99, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x51, 0x54, 0x55, 0x56, 0x59, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA, 0xEA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x6A, 0x95, 0x96, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x51, 0x55, 0x56, 0x5A, 0x65, 0x66, 0x6A, 0x95, 0x96, 0x9A, 0xA5, 0xA6, 0xAA, 0xAB ],
                [ 0x54, 0x55, 0x59, 0x65, 0x69, 0x95, 0x99, 0xA5, 0xA9, 0xAA ],
                [ 0x54, 0x55, 0x59, 0x65, 0x69, 0x6A, 0x95, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x6A, 0x95, 0x96, 0x9A, 0xA6, 0xA9, 0xAA, 0xAB ],
                [ 0x54, 0x55, 0x58, 0x59, 0x65, 0x69, 0x95, 0x99, 0xA5, 0xA9, 0xAA, 0xAD, 0xAE ],
                [ 0x54, 0x55, 0x59, 0x5A, 0x65, 0x69, 0x6A, 0x95, 0x99, 0x9A, 0xA5, 0xA9, 0xAA, 0xAE ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x65, 0x69, 0x6A, 0x95, 0x99, 0x9A, 0xA6, 0xA9, 0xAA, 0xAE ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x66, 0x69, 0x6A, 0x96, 0x99, 0x9A, 0xA6, 0xA9, 0xAA, 0xAB, 0xAE, 0xAF ],
                [ 0x50, 0x51, 0x54, 0x55, 0x61, 0x64, 0x65, 0x95, 0xA5, 0xA6, 0xA9, 0xAA, 0xB5, 0xBA ],
                [ 0x51, 0x55, 0x61, 0x65, 0x66, 0x95, 0xA5, 0xA6, 0xA9, 0xAA, 0xB6, 0xBA ],
                [ 0x51, 0x55, 0x56, 0x61, 0x65, 0x66, 0x95, 0x96, 0xA5, 0xA6, 0xAA, 0xB6, 0xBA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x6A, 0x96, 0xA5, 0xA6, 0xA7, 0xAA, 0xAB, 0xB6, 0xBA, 0xBB ],
                [ 0x54, 0x55, 0x64, 0x65, 0x69, 0x95, 0xA5, 0xA6, 0xA9, 0xAA, 0xB9, 0xBA ],
                [ 0x55, 0x65, 0x66, 0x69, 0x6A, 0x95, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x96, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x6A, 0x96, 0xA5, 0xA6, 0xAA, 0xAB, 0xBA, 0xBB ],
                [ 0x54, 0x55, 0x59, 0x64, 0x65, 0x69, 0x95, 0x99, 0xA5, 0xA9, 0xAA, 0xB9, 0xBA ],
                [ 0x54, 0x55, 0x59, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x99, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x55, 0x56, 0x59, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA ],
                [ 0x55, 0x56, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x96, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xAB, 0xBA, 0xBB ],
                [ 0x54, 0x55, 0x59, 0x65, 0x69, 0x6A, 0x99, 0xA5, 0xA9, 0xAA, 0xAD, 0xAE, 0xB9, 0xBA, 0xBE ],
                [ 0x54, 0x55, 0x59, 0x65, 0x69, 0x6A, 0x99, 0xA5, 0xA9, 0xAA, 0xAE, 0xBA, 0xBE ],
                [ 0x55, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xAE, 0xBA, 0xBE ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x9A, 0xA6, 0xA9, 0xAA, 0xAB, 0xAE, 0xBA ],
                [ 0x40, 0x45, 0x51, 0x54, 0x55, 0x85, 0x91, 0x94, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x41, 0x45, 0x51, 0x55, 0x56, 0x85, 0x91, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xAA, 0xEA ],
                [ 0x41, 0x45, 0x51, 0x55, 0x56, 0x85, 0x91, 0x95, 0x96, 0x9A, 0xA6, 0xAA, 0xD6, 0xEA ],
                [ 0x41, 0x45, 0x51, 0x55, 0x56, 0x86, 0x92, 0x95, 0x96, 0x97, 0x9A, 0xA6, 0xAA, 0xAB, 0xD6, 0xEA, 0xEB ],
                [ 0x44, 0x45, 0x54, 0x55, 0x59, 0x85, 0x94, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA9, 0xAA, 0xEA ],
                [ 0x45, 0x55, 0x85, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xDA, 0xEA ],
                [ 0x45, 0x55, 0x56, 0x85, 0x95, 0x96, 0x99, 0x9A, 0xA6, 0xAA, 0xDA, 0xEA ],
                [ 0x45, 0x55, 0x56, 0x86, 0x95, 0x96, 0x9A, 0x9B, 0xA6, 0xAA, 0xAB, 0xDA, 0xEA, 0xEB ],
                [ 0x44, 0x45, 0x54, 0x55, 0x59, 0x85, 0x94, 0x95, 0x99, 0x9A, 0xA9, 0xAA, 0xD9, 0xEA ],
                [ 0x45, 0x55, 0x59, 0x85, 0x95, 0x96, 0x99, 0x9A, 0xA9, 0xAA, 0xDA, 0xEA ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x85, 0x95, 0x96, 0x99, 0x9A, 0xAA, 0xDA, 0xEA ],
                [ 0x45, 0x55, 0x56, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0x9B, 0xA6, 0xAA, 0xAB, 0xDA, 0xEA, 0xEB ],
                [ 0x44, 0x45, 0x54, 0x55, 0x59, 0x89, 0x95, 0x98, 0x99, 0x9A, 0x9D, 0xA9, 0xAA, 0xAE, 0xD9, 0xEA, 0xEE ],
                [ 0x45, 0x55, 0x59, 0x89, 0x95, 0x99, 0x9A, 0x9E, 0xA9, 0xAA, 0xAE, 0xDA, 0xEA, 0xEE ],
                [ 0x45, 0x55, 0x59, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0x9E, 0xA9, 0xAA, 0xAE, 0xDA, 0xEA, 0xEE ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0x9B, 0x9E, 0xAA, 0xAB, 0xAE, 0xDA, 0xEA, 0xEF ],
                [ 0x50, 0x51, 0x54, 0x55, 0x65, 0x91, 0x94, 0x95, 0x96, 0x99, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x51, 0x55, 0x91, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xE6, 0xEA ],
                [ 0x51, 0x55, 0x56, 0x91, 0x95, 0x96, 0x9A, 0xA5, 0xA6, 0xAA, 0xE6, 0xEA ],
                [ 0x51, 0x55, 0x56, 0x92, 0x95, 0x96, 0x9A, 0xA6, 0xA7, 0xAA, 0xAB, 0xE6, 0xEA, 0xEB ],
                [ 0x54, 0x55, 0x94, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xE9, 0xEA ],
                [ 0x55, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x55, 0x56, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x55, 0x56, 0x95, 0x96, 0x9A, 0xA6, 0xAA, 0xAB, 0xEA, 0xEB ],
                [ 0x54, 0x55, 0x59, 0x94, 0x95, 0x99, 0x9A, 0xA5, 0xA9, 0xAA, 0xE9, 0xEA ],
                [ 0x55, 0x59, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x45, 0x55, 0x56, 0x59, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x45, 0x55, 0x56, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0xA6, 0xAA, 0xAB, 0xEA, 0xEB ],
                [ 0x54, 0x55, 0x59, 0x95, 0x98, 0x99, 0x9A, 0xA9, 0xAA, 0xAD, 0xAE, 0xE9, 0xEA, 0xEE ],
                [ 0x55, 0x59, 0x95, 0x99, 0x9A, 0xA9, 0xAA, 0xAE, 0xEA, 0xEE ],
                [ 0x45, 0x55, 0x59, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0xA9, 0xAA, 0xAE, 0xEA, 0xEE ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x95, 0x96, 0x99, 0x9A, 0xAA, 0xAB, 0xAE, 0xEA, 0xEF ],
                [ 0x50, 0x51, 0x54, 0x55, 0x65, 0x91, 0x94, 0x95, 0xA5, 0xA6, 0xA9, 0xAA, 0xE5, 0xEA ],
                [ 0x51, 0x55, 0x65, 0x91, 0x95, 0x96, 0xA5, 0xA6, 0xA9, 0xAA, 0xE6, 0xEA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x91, 0x95, 0x96, 0xA5, 0xA6, 0xAA, 0xE6, 0xEA ],
                [ 0x51, 0x55, 0x56, 0x66, 0x95, 0x96, 0x9A, 0xA5, 0xA6, 0xA7, 0xAA, 0xAB, 0xE6, 0xEA, 0xEB ],
                [ 0x54, 0x55, 0x65, 0x94, 0x95, 0x99, 0xA5, 0xA6, 0xA9, 0xAA, 0xE9, 0xEA ],
                [ 0x55, 0x65, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x51, 0x55, 0x56, 0x66, 0x95, 0x96, 0x9A, 0xA5, 0xA6, 0xAA, 0xAB, 0xEA, 0xEB ],
                [ 0x54, 0x55, 0x59, 0x65, 0x69, 0x94, 0x95, 0x99, 0xA5, 0xA9, 0xAA, 0xE9, 0xEA ],
                [ 0x54, 0x55, 0x59, 0x65, 0x69, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x55, 0x56, 0x59, 0x65, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xEA ],
                [ 0x55, 0x56, 0x5A, 0x66, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xAB, 0xEA, 0xEB ],
                [ 0x54, 0x55, 0x59, 0x69, 0x95, 0x99, 0x9A, 0xA5, 0xA9, 0xAA, 0xAD, 0xAE, 0xE9, 0xEA, 0xEE ],
                [ 0x54, 0x55, 0x59, 0x69, 0x95, 0x99, 0x9A, 0xA5, 0xA9, 0xAA, 0xAE, 0xEA, 0xEE ],
                [ 0x55, 0x59, 0x5A, 0x69, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xAE, 0xEA, 0xEE ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA6, 0xA9, 0xAA, 0xAB, 0xAE, 0xEA ],
                [ 0x50, 0x51, 0x54, 0x55, 0x65, 0x95, 0xA1, 0xA4, 0xA5, 0xA6, 0xA9, 0xAA, 0xB5, 0xBA, 0xE5, 0xEA, 0xFA ],
                [ 0x51, 0x55, 0x65, 0x95, 0xA1, 0xA5, 0xA6, 0xA9, 0xAA, 0xB6, 0xBA, 0xE6, 0xEA, 0xFA ],
                [ 0x51, 0x55, 0x65, 0x66, 0x95, 0x96, 0xA5, 0xA6, 0xA9, 0xAA, 0xB6, 0xBA, 0xE6, 0xEA, 0xFA ],
                [ 0x51, 0x55, 0x56, 0x65, 0x66, 0x95, 0x96, 0xA5, 0xA6, 0xA7, 0xAA, 0xAB, 0xB6, 0xBA, 0xE6, 0xEA, 0xFB ],
                [ 0x54, 0x55, 0x65, 0x95, 0xA4, 0xA5, 0xA6, 0xA9, 0xAA, 0xB9, 0xBA, 0xE9, 0xEA, 0xFA ],
                [ 0x55, 0x65, 0x95, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA, 0xEA, 0xFA ],
                [ 0x51, 0x55, 0x65, 0x66, 0x95, 0x96, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA, 0xEA, 0xFA ],
                [ 0x55, 0x56, 0x65, 0x66, 0x95, 0x96, 0xA5, 0xA6, 0xAA, 0xAB, 0xBA, 0xEA, 0xFB ],
                [ 0x54, 0x55, 0x65, 0x69, 0x95, 0x99, 0xA5, 0xA6, 0xA9, 0xAA, 0xB9, 0xBA, 0xE9, 0xEA, 0xFA ],
                [ 0x54, 0x55, 0x65, 0x69, 0x95, 0x99, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA, 0xEA, 0xFA ],
                [ 0x55, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xBA, 0xEA, 0xFA ],
                [ 0x55, 0x56, 0x65, 0x66, 0x6A, 0x95, 0x96, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xAB, 0xBA, 0xEA ],
                [ 0x54, 0x55, 0x59, 0x65, 0x69, 0x95, 0x99, 0xA5, 0xA9, 0xAA, 0xAD, 0xAE, 0xB9, 0xBA, 0xE9, 0xEA, 0xFE ],
                [ 0x55, 0x59, 0x65, 0x69, 0x95, 0x99, 0xA5, 0xA9, 0xAA, 0xAE, 0xBA, 0xEA, 0xFE ],
                [ 0x55, 0x59, 0x65, 0x69, 0x6A, 0x95, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xAE, 0xBA, 0xEA ],
                [ 0x55, 0x56, 0x59, 0x5A, 0x65, 0x66, 0x69, 0x6A, 0x95, 0x96, 0x99, 0x9A, 0xA5, 0xA6, 0xA9, 0xAA, 0xAB, 0xAE, 0xBA, 0xEA ],
        ];
        const latticeVerticesByCode = new Array<LatticeVertex4D>(256);
        for (let i = 0; i < 256; i++) {
            const cx = ((i >> 0) & 3) - 1;
            const cy = ((i >> 2) & 3) - 1;
            const cz = ((i >> 4) & 3) - 1;
            const cw = ((i >> 6) & 3) - 1;
            latticeVerticesByCode[i] = new LatticeVertex4D(cx, cy, cz, cw);
        }
        let nLatticeVerticesTotal = 0;
        for (let i = 0; i < 256; i++) {
            nLatticeVerticesTotal += lookup4DVertexCodes[i].length;
        }
        // this.LOOKUP_4D_A = new Uint32Array(256);
        // this.LOOKUP_4D_B = new Array<LatticeVertex4D>(nLatticeVerticesTotal);
        this.LOOKUP_4D_B.length = nLatticeVerticesTotal;
        for (let i = 0, j = 0; i < 256; i++) {
            this.LOOKUP_4D_A[i] = j | ((j + lookup4DVertexCodes[i].length) << 16);
            for (let k = 0; k < lookup4DVertexCodes[i].length; k++) {
                this.LOOKUP_4D_B[j++] = latticeVerticesByCode[lookup4DVertexCodes[i][k]];
            }
        }
    }
}