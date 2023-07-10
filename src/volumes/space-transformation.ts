import { GraphNode, Mat4 } from "playcanvas-extended"

export interface SpaceTransformation {
    transform(points: Float32Array): void
}

export class WorldSpaceTransformation
    implements SpaceTransformation {
    constructor(public readonly world = new Mat4()) { }

    transform(points: Float32Array): void {
        const [
            m11, m12, m13, ,
            m21, m22, m23, ,
            m31, m32, m33, ,
            m41, m42, m43,
        ] = this.world.data

        const n = points.length / 3
        for (let i = 0; i < n; i++) {
            const x = points[(3 * i) + 0]
            const y = points[(3 * i) + 1]
            const z = points[(3 * i) + 2]
            points[(3 * i) + 0] = (x * m11) + (y * m21) + (z * m31) + m41
            points[(3 * i) + 1] = (x * m12) + (y * m22) + (z * m32) + m42
            points[(3 * i) + 2] = (x * m13) + (y * m23) + (z * m33) + m43
        }
    }
}

export class GraphNodeWorldSpaceTransformation
    extends WorldSpaceTransformation {
    constructor(public readonly node: GraphNode) {
        super(node.getWorldTransform())
    }

    override transform(points: Float32Array): void {
        this.world.copy(this.node.getWorldTransform())
        super.transform(points)
    }
}