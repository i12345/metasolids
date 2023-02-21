// Based off marching cubes implementation by theSoenke
// https://github.com/theSoenke/ProceduralTerrain/blob/master/Assets/ProceduralTerrain/Core/Scripts/Voxel/Meshing/MarchingCubes.cs

import { MeshingAlgorithm, MeshingSettings } from "./meshing-algorithm.js";
import { Tables } from "./tables.js";
import { MeshData } from "./types.js";
import { Vec3 } from "playcanvas-extended";
import { VolumeSamplingResult } from "../volumes/sampling.js";

export class MarchingCubesAlgorithm implements MeshingAlgorithm {
    mesh(volume: VolumeSamplingResult, { surfaceLevel }: MeshingSettings): MeshData {
        const impl = new MarchingCubes(volume, surfaceLevel)
        return impl.GenerateMesh()
    }
}

class MarchingCubes
{
    constructor(
        public volume: VolumeSamplingResult,
        public surfaceLevel: number
    ) {
    }

    public GenerateMesh(): MeshData
    {
        let vertices: Vec3[] = []
        let triangles: number[] = []
        let voxels = this.CalculateDensities();

        for (let x = 0; x < this.volume.size.x - 1; x++)
        {
            for (let y = 0; y < this.volume.size.y - 1; y++)
            {
                for (let z = 0; z < this.volume.size.z - 1; z++)
                {
                    let cube: number[] = MarchingCubes.CreateCube(x, y, z, voxels);
                    this.MarchCube(new Vec3(x, y, z), cube, vertices, triangles);
                }
            }
        }

        this.transformVerticesToLocalSpace(vertices)
        
        return {
            vertices,
            triangles
        }
    }

    private transformVerticesToLocalSpace(vertices: Vec3[]) {
        const box_min = this.volume.boundingBox.getMin()
        const box_size = this.volume.boundingBox.halfExtents.clone().mulScalar(2)
        const voxels_size = this.volume.size

        for (const vert of vertices)
            vert.mul(box_size).div(voxels_size).add(box_min)
    }

    /**
     * Calculate densities for voxel array
     * @returns Voxel values
     */
    private CalculateDensities(): number[][][]
    {
        return this.volume.voxels.map(sample_yz => sample_yz.map(sample_z => sample_z.map(sample => sample.presence)))
    }

    /**
     * Get the values 8 neighbor values of the cube
     */
    private static CreateCube(x: number, y: number, z: number, voxels: number[][][]): number[]
    {
        const cube: number[] = new Array(8);

        for (let i = 0; i < 8; i++)
        {
            cube[i] = voxels[x + Tables.VertexOffset[i][0]][y + Tables.VertexOffset[i][1]][z + Tables.VertexOffset[i][2]];
        }

        return cube;
    }

    /**
     * Find the point of intersection of the surface between points with values v1 and v2
     */
    private GetOffset(v1: number, v2: number): number
    {
        const delta = v2 - v1;

        if (Math.abs(delta) < 0.0001)
        {
            return 0.5;
        }
        return (this.surfaceLevel - v1) / delta;
    }

    /**
     * Performs the Marching Cubes algorithm on a single cube
     */
    private MarchCube(pos: Vec3, cube: number[], vertList: Vec3[], indexList: number[]): void
    {
        let cubeIndex = 0;
        let edgeVertex: Vec3[] = new Array(12);

        // Find vertices inside the surface
        for (let i = 0; i < 8; i++)
        {
            if (cube[i] <= this.surfaceLevel)
            {
                cubeIndex |= 1 << i;
            }
        }

        // Find edges intersected by surface
        let edgeFlags = Tables.EdgeTable[cubeIndex];

        // No intersection if cube is completely outside surface or completely inside surface
        if (edgeFlags == 0 || edgeFlags == 15)
        {
            return;
        }

        // Find intersection point with surface for each edge
        for (let i = 0; i < 12; i++)
        {
            // When intersection for this edge exists
            if ((edgeFlags & (1 << i)) != 0)
            {
                let offset = this.GetOffset(cube[Tables.EdgeConnection[i][0]], cube[Tables.EdgeConnection[i][1]]);

                edgeVertex[i] = new Vec3(
                    pos.x + (Tables.VertexOffset[Tables.EdgeConnection[i][0]][0] + offset * Tables.EdgeDirection[i][0]),
                    pos.y + (Tables.VertexOffset[Tables.EdgeConnection[i][0]][1] + offset * Tables.EdgeDirection[i][1]),
                    pos.z + (Tables.VertexOffset[Tables.EdgeConnection[i][0]][2] + offset * Tables.EdgeDirection[i][2])
                )
            }
        }

        // Store found triangles. Up to five per cube possible
        for (let i = 0; i < 5; i++)
        {
            // Stop when triangle list terminates with -1
            if (Tables.TriTable[cubeIndex][3 * i] < 0)
            {
                break;
            }

            let idx = vertList.length;

            for (let j = 0; j < 3; j++)
            {
                let vert = Tables.TriTable[cubeIndex][3 * i + j];
                indexList.push(idx + Tables.WindingOrder[j]);
                vertList.push(edgeVertex[vert]);
            }
        }
    }
}