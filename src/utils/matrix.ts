import { Mat3, Mat4, Quat } from "playcanvas-physics-advanced";

export function trs(m: Mat4) {
    return {
        t: m.getTranslation(),
        r: new Quat().setFromMat4(m),
        s: m.getScale()
    }
}

export function mat4_from_mat3(src: Mat3, dst = new Mat4()) {
    dst.data[0] = src.data[0]
    dst.data[1] = src.data[1]
    dst.data[2] = src.data[2]

    dst.data[4] = src.data[3]
    dst.data[5] = src.data[4]
    dst.data[6] = src.data[5]

    dst.data[8] = src.data[6]
    dst.data[9] = src.data[7]
    dst.data[10] = src.data[8]

    dst.data[15] = 1

    return dst
}

export function mat4_lerp_identity(x: Mat4, alpha: number) {
    const t = x.getTranslation()
    const r = new Quat().setFromMat4(x)
    const s = x.getScale()

    t.mulScalar(alpha)
    r.slerp(Quat.IDENTITY, r, alpha)
    s.x = s.x ** alpha
    s.y = s.y ** alpha
    s.z = s.z ** alpha

    x.setTRS(t, r, s)
}