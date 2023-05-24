// (MIT LICENSE)
// based off [1] by voxelbased/core which was adapted from [2] by theSoenke
// [1] https://github.com/voxelbased/core/blob/main/Assets/Voxelbased/Core/Voxel/Meshing/DualContouring/DualContouringUniform.cs
// [2] https://github.com/theSoenke/ProceduralTerrain/blob/master/Assets/ProceduralTerrain/Core/Scripts/Voxel/Meshing/DualControuringUniform.cs

import { MeshingAlgorithm, MeshingSettings } from "./meshing-algorithm.js"
import { Tables } from "./tables.js"
import { HermiteData, MeshData, Row, Vertex, Voxel } from "./types.js"
import { Vec3 } from "playcanvas-extended"
import { VolumeSamplingResult } from "../../volumes/sampling.js"

export class DualContouringUniformAlgorithm implements MeshingAlgorithm {
    mesh(volume: VolumeSamplingResult, { surfaceLevel }: MeshingSettings): MeshData {
        const impl = new DualContouringUniform(volume, surfaceLevel)
        return impl.GenerateMesh()
    }
}

/**
 * Dual Contouring meshing algorithm for uniform grids
 */
export class DualContouringUniform {
    private static readonly MaxParticleIterations = 50
    private readonly ToleranceDensity = 1E-3
    private readonly ToleranceCoord = 1E-3

    private readonly rows: Row[] = new Array(3)
    private verticesCount = 0
    private readonly vertices: Vec3[] = []
    private readonly normals: Vec3[] = []
    private readonly triangles: number[] = []
    private sizePlus3: Vec3

    constructor(
        public volume: VolumeSamplingResult,
        public surfaceLevel: number
    ) {
        this.sizePlus3 = new Vec3(3, 3, 3).add(volume.size)
    }

    public GenerateMesh(): MeshData {
        // initialize rows
        for (let i = 0; i < 3; i++) {
            let vRow = new Vec3(0, -1, 0)
            vRow.y = (i - 1)

            this.rows[i] = new Row(vRow, this.sizePlus3)
            this.rows[i].pos = vRow
            this.CalculatePoints(this.rows[i])
        }

        for (let y = 3; y <= this.volume.size.y + 2; y++) {
            let vRow = new Vec3(0, -1, 0)
            vRow.y = y
            this.rows[2].pos = vRow

            this.CalculatePoints(this.rows[2])
            this.CalculateCubes(this.rows[1])
            this.GenerateQuads()

            let tmp = this.rows[0]
            this.rows[0] = this.rows[1]
            this.rows[1] = this.rows[2]
            this.rows[2] = tmp
        }

        this.transformVerticesToLocalSpace()

        return {
            vertices: this.vertices,
            triangles: this.triangles
        }
    }

    private transformVerticesToLocalSpace() {
        const box_min = this.volume.boundingBox.getMin()
        const box_size = this.volume.boundingBox.halfExtents.clone().mulScalar(2)
        const voxels_size = this.volume.size

        for (const vert of this.vertices)
            vert.mul(box_size).div(voxels_size).add(box_min)
    }

    /**
     * Calculate points in row and generate cubes
     */
    private CalculatePoints(row: Row): void {
        for (let x = 0; x < this.sizePlus3.x; x++) {
            for (let z = 0; z < this.sizePlus3.z; z++) {
                const pos = new Vec3(row.pos.x + x - 1, row.pos.y, row.pos.z + z - 1)
                if (pos.x < 0) pos.x = 0; else if (pos.x >= this.volume.size.x) pos.x = this.volume.size.x - 1
                if (pos.y < 0) pos.y = 0; else if (pos.y >= this.volume.size.y) pos.y = this.volume.size.y - 1
                if (pos.z < 0) pos.z = 0; else if (pos.z >= this.volume.size.z) pos.z = this.volume.size.z - 1
                let density = this.volume.voxels[pos.x][pos.y][pos.z].presence - this.surfaceLevel

                row.points[(x * this.sizePlus3.x) + z] = {
                    pos,
                    density
                }
                row.vertices[(x * this.sizePlus3.x) + z] = {
                    index: 0,
                } as Vertex
            }
        }
    }

    /**
     * Calculate vector and density for all 8 corners
     * @param row
     */
    private CalculateCubes(row: Row): void {
        let corners: Voxel[] = new Array(8)

        for (let x = 0; x < this.sizePlus3.x - 1; x++) {
            for (let z = 0; z < this.sizePlus3.z - 1; z++) {
                let cubeIndex = 0

                // Find intersection point with surface for each edge
                for (let i = 0; i < 8; i++) {
                    let pointX = x + Tables.VertexOffset[i][0]
                    let pointZ = z + Tables.VertexOffset[i][2]

                    corners[i] = this.rows[Tables.VertexOffset[i][1]].points[(pointX * this.sizePlus3.x) + pointZ]

                    if (corners[i].density < 0) {
                        cubeIndex |= 1 << i
                    }
                }

                let vertex: Vertex = row.vertices[(x * this.sizePlus3.x) + z]
                vertex.edgeFlags = Tables.EdgeTable[cubeIndex]

                // No intersection if cube is complety outside surface
                if (vertex.edgeFlags == 0) {
                    vertex.index = 0
                    continue
                }
                vertex.index = cubeIndex
                this.GenerateVertex(vertex, corners)
            }
        }
    }

    private GenerateVertex(vertex: Vertex, corners: Voxel[]): void {
        var data: HermiteData = {
            intersectionPoints: [],
            gradientVectors: []
        }

        // Find the point of intersection of the surface in each of the 12 edges
        for (let i = 0; i < 12; i++) {
            let n1 = Tables.EdgeConnection[i][0]
            let n2 = Tables.EdgeConnection[i][1]

            if ((vertex.edgeFlags & (1 << i)) === 0) {
                continue
            }

            if (Math.abs(corners[n1].density) < this.ToleranceDensity) {
                data.intersectionPoints.push(corners[n1].pos)
            }
            else if (Math.abs(corners[n2].density) < this.ToleranceDensity) {
                data.intersectionPoints.push(corners[n2].pos)
            }
            else {
                let vDiff = new Vec3().sub2(corners[n1].pos, corners[n2].pos)
                let p = new Vec3(0, 0, 0)
                if (Math.abs(vDiff.x) > this.ToleranceDensity) {
                    this.IntersectXAxis(corners[n1], corners[n2], p)
                }
                if (Math.abs(vDiff.y) > this.ToleranceDensity) {
                    this.IntersectYAxis(corners[n1], corners[n2], p)
                }
                if (Math.abs(vDiff.z) > this.ToleranceDensity) {
                    this.IntersectZAxis(corners[n1], corners[n2], p)
                }
                data.intersectionPoints.push(p)
            }

            let normal = this.GetNormal(data.intersectionPoints[data.intersectionPoints.length - 1])
            data.gradientVectors.push(normal)
        }

        vertex.pos = DualContouringUniform.SchmitzVertexFromHermiteData(data, 0.001)
        vertex.normal = this.GetNormal(vertex.pos)
        // vertex.pos.sub(this.offset)
    }

    /**
     * Generate triangles for row
     */
    private GenerateQuads(): void {
        for (let x = 1; x < this.volume.size.x + 1; x++) {
            for (let z = 1; z < this.volume.size.z + 1; z++) {
                let tmpVertices: Vertex[] = new Array(4)
                tmpVertices[0] = this.GetVertexPointer(x, z, 0, 0, 0)

                for (let i = 0; i < 3; i++) {
                    let windingOrder: boolean
                    if (i == 0 && (tmpVertices[0].edgeFlags & (1 << 10)) == 1 << 10) {
                        tmpVertices[1] = this.GetVertexPointer(x, z, 1, 0, 0)
                        tmpVertices[2] = this.GetVertexPointer(x, z, 1, 1, 0)
                        tmpVertices[3] = this.GetVertexPointer(x, z, 0, 1, 0)
                        windingOrder = (tmpVertices[0].index & (1 << 6)) == 1 << 6
                    }
                    else if (i == 1 && (tmpVertices[0].edgeFlags & (1 << 6)) == 1 << 6) {
                        tmpVertices[1] = this.GetVertexPointer(x, z, 0, 0, 1)
                        tmpVertices[2] = this.GetVertexPointer(x, z, 0, 1, 1)
                        tmpVertices[3] = this.GetVertexPointer(x, z, 0, 1, 0)
                        windingOrder = (tmpVertices[0].index & (1 << 7)) == 1 << 7
                    }
                    else if (i == 2 && (tmpVertices[0].edgeFlags & (1 << 5)) == 1 << 5) {
                        tmpVertices[1] = this.GetVertexPointer(x, z, 1, 0, 0)
                        tmpVertices[2] = this.GetVertexPointer(x, z, 1, 0, 1)
                        tmpVertices[3] = this.GetVertexPointer(x, z, 0, 0, 1)
                        windingOrder = (tmpVertices[0].index & (1 << 5)) == 1 << 5
                    }
                    else {
                        continue
                    }

                    let triangle: Vertex[] = new Array(3)
                    triangle[0] = tmpVertices[0]

                    for (let j = 1; j < 3; j++) {
                        let ja = windingOrder ? j : j + 1
                        let jb = windingOrder ? j + 1 : j

                        triangle[1] = tmpVertices[ja]
                        triangle[2] = tmpVertices[jb]

                        this.AddTriangle(triangle)
                    }
                }
            }
        }
    }

    /**
     * Create new triangle
     * @param triangle Vertices for new triangle
     */
    private AddTriangle(triangle: Vertex[]): void {
        for (let i = 0; i < 3; i++) {
            this.vertices.push(triangle[i].pos)
            this.normals.push(triangle[i].normal)
            this.triangles.push(this.verticesCount + Tables.WindingOrder[i])
        }

        this.verticesCount += 3
    }

    /**
     * Gets vertex pointer in the cubes of the row
     * @returns Vertex pointer
     */
    private GetVertexPointer(x: number, z: number, xi: number, yi: number, zi: number): Vertex {
        const pointX = x + xi
        const pointZ = z + zi

        return this.rows[yi].vertices[(pointX * this.sizePlus3.x) + pointZ]
    }

    /**
     * Calculate normal for point
     * @returns Normal
     */
    private GetNormal({ x, y, z }: Vec3): Vec3 {
        x = Math.floor(x); if (x < 1) x = 1; else if (x >= this.volume.size.x - 1) x = this.volume.size.x - 2
        y = Math.floor(y); if (y < 1) y = 1; else if (y >= this.volume.size.y - 1) y = this.volume.size.y - 2
        z = Math.floor(z); if (z < 1) z = 1; else if (z >= this.volume.size.z - 1) z = this.volume.size.z - 2
        // return this.volume.voxels[x][y][z].gradient.clone().mulScalar(-1).normalize()
        const voxels = this.volume.voxels
        return new Vec3(
            voxels[x - 1][y][z].presence - voxels[x + 1][y][z].presence,
            voxels[x][y - 1][z].presence - voxels[x][y + 1][z].presence,
            voxels[x][y][z - 1].presence - voxels[x][y][z + 1].presence
        ).mulScalar(-1).normalize()
    }

    /**
     * Calculates an approximated vertex for a row.
     * Based on the algorithm described in the paper "Analysis and Acceleration of High Quality Isosurface Contouring".
     * @param data The hermite data for a row
     * @param threshold When has a force has a value below it will return the approximated position
     * @returns Approximated vertex for the row
     */
    private static SchmitzVertexFromHermiteData(data: HermiteData, threshold: number): Vec3
    {
        threshold *= threshold

        const xPoints: Vec3[] = data.intersectionPoints
        const grads: Vec3[] = data.gradientVectors
        let pointsCount = xPoints.length

        if (pointsCount == 0)
        {
            return new Vec3()
        }

        // start mass point
        // calculated by mean of intersection points
        let c = new Vec3()

        for (let i = 0; i < pointsCount; i++)
        {
            c.add(xPoints[i])
        }
        c.divScalar(pointsCount)

        for (let i = 0; i < DualContouringUniform.MaxParticleIterations; i++)
        {
            // force that acts on mass
            let force = new Vec3()

            for (let j = 0; j < pointsCount; j++)
            {
                const xPoint = xPoints[j]
                const xNormal = grads[j]

                force.add(xNormal.clone().mulScalar(-1 * xNormal.dot(new Vec3().sub2(c, xPoint))))
            }

            // dampen force
            const damping = 1 - (i / DualContouringUniform.MaxParticleIterations)
            c.add(force.clone().mulScalar(damping / pointsCount))

            if ((force.lengthSq() ** 2) < threshold)
            {
                break
            }
        }

        return c
    }

    /**
     * Interpolate vertex offset for an edge on the X axis
     * @returns Interpolated vector
     */
    private IntersectXAxis(p0: Voxel, p1: Voxel, pOut: Vec3): void
    {
        let xa: number, xb: number

        if (p0.density < 0)
        {
            xa = p0.pos.x
            xb = p1.pos.x
        }
        else
        {
            xa = p1.pos.x
            xb = p0.pos.x
        }

        let y = p0.pos.y
        let z = p0.pos.z
        let xm: number

        while (true)
        {
            xm = (xa + xb) * 0.5
            const d = this.volume.voxels[xm][y][z].presence - this.surfaceLevel

            if (Math.abs(d) < this.ToleranceDensity)
            {
                break
            }
            if (Math.abs(xa - xb) < this.ToleranceCoord)
            {
                break
            }

            if (d < 0)
            {
                xa = xm
            }
            else
            {
                xb = xm
            }
        }

        //return new Vector3(xm, y, z)
        // pOut = new Vector3(xm, y, z)
        pOut.x = xm
        pOut.y = y
        pOut.z = z
    }

    /**
     * Interpolate vertex offset for an edge on the Y axis
     * @returns Interpolated vector
     */
    private IntersectYAxis(p0: Voxel, p1: Voxel, pOut: Vec3): void
    {
        let ya: number, yb: number

        if (p0.density < 0)
        {
            ya = p0.pos.y
            yb = p1.pos.y
        }
        else
        {
            ya = p1.pos.y
            yb = p0.pos.y
        }

        let x = p0.pos.x
        let z = p0.pos.z
        let ym: number

        while (true)
        {
            ym = (ya + yb) * 0.5
            const d = this.volume.voxels[x][ym][z].presence - this.surfaceLevel

            if (Math.abs(d) < this.ToleranceDensity)
            {
                break
            }
            if (Math.abs(ya - yb) < this.ToleranceCoord)
            {
                break
            }

            if (d < 0)
            {
                ya = ym
            }
            else
            {
                yb = ym
            }
        }

        //return new Vector3(x, ym, z)
        // pOut = new Vector3(x, ym, z)
        pOut.x = x
        pOut.y = ym
        pOut.z = z
    }

    /**
     * Interpolate vertex offset for an edge on the Z axis
     * @returns Interpolated vector
     */
    private IntersectZAxis(p0: Voxel, p1: Voxel, pOut: Vec3): void
    {
        let za: number, zb: number

        if (p0.density < 0)
        {
            za = p0.pos.z
            zb = p1.pos.z
        }
        else
        {
            za = p1.pos.z
            zb = p0.pos.z
        }

        let x = p0.pos.x
        let y = p0.pos.y
        let zm: number

        while (true)
        {
            zm = (za + zb) * 0.5
            const d = this.volume.voxels[x][y][zm].presence - this.surfaceLevel

            if (Math.abs(d) < this.ToleranceDensity)
            {
                break
            }
            if (Math.abs(za - zb) < this.ToleranceCoord)
            {
                break
            }

            if (d < 0)
            {
                za = zm
            }
            else
            {
                zb = zm
            }
        }

        //return new Vector3(x, y, zm)
        // pOut = new Vector3(x, y, zm)
        pOut.x = x
        pOut.y = y
        pOut.z = zm
    }
}