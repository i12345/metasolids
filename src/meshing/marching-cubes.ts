// Based off marching cubes implementation by theSoenke
// https://github.com/theSoenke/ProceduralTerrain/blob/master/Assets/ProceduralTerrain/Core/Scripts/Voxel/Meshing/MarchingCubes.cs

import { MeshingAlgorithm } from "./meshing-algorithm";
import { Tables } from "./tables";
import { MeshData } from "./types";
import { Volume } from "../volumes/volume";
import { Vec3 } from "playcanvas-extended";

export class MarchingCubesAlgorithm implements MeshingAlgorithm {
    mesh(volume: Volume, offset: Vec3, chunkSize: Vec3): MeshData {
        const impl = new MarchingCubes(volume, offset, chunkSize)
        return impl.GenerateMesh()
    }
}

class MarchingCubes
{
    private static readonly Target = 0; // The value that represents the surface of mesh

    constructor(
        public volume: Volume,
        public offset: Vec3,
        public chunkSize: Vec3) {
    }

    public GenerateMesh(): MeshData
    {
        let vertices: Vec3[] = []
        let triangles: number[] = []
        let voxels = this.CalculateDensities();

        for (let x = 0; x < this.chunkSize.x - 1; x++)
        {
            for (let y = 0; y < this.chunkSize.y - 1; y++)
            {
                for (let z = 0; z < this.chunkSize.z - 1; z++)
                {
                    let cube: number[] = MarchingCubes.CreateCube(x, y, z, voxels);
                    this.MarchCube(new Vec3(x, y, z), cube, vertices, triangles);
                }
            }
        }
        
        return {
            vertices: vertices,
            triangles: triangles
        };
    }

    /**
     * Calculate densities for voxel array
     * @returns Voxel values
     */
    private CalculateDensities(): number[][][]
    {
        let voxels = new Array(this.chunkSize.x)

        for (let x = 0; x < this.chunkSize.x; x++)
        {
            voxels[x] = new Array(this.chunkSize.y)
            for (let y = 0; y < this.chunkSize.y; y++)
            {
                voxels[x][y] = new Array(this.chunkSize.z)
                for (let z = 0; z < this.chunkSize.z; z++)
                {
                    const pos = new Vec3(x, y, z)
                    const density = this.volume.getDensity(pos.add(this.offset));
                    voxels[x][y][z] = density;
                }
            }
        }

        return voxels;
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
    private static GetOffset(v1: number, v2: number): number
    {
        const delta = v2 - v1;

        if (Math.abs(delta) < 0.0001)
        {
            return 0.5;
        }
        return (MarchingCubes.Target - v1) / delta;
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
            if (cube[i] <= MarchingCubes.Target)
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
                let offset = MarchingCubes.GetOffset(cube[Tables.EdgeConnection[i][0]], cube[Tables.EdgeConnection[i][1]]);

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