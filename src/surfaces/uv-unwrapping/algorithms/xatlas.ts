import type { XAtlasAPI } from 'xatlasjs-esm'
import { SurfaceUVUnwrappingAlgorithm } from '../algorithm.js';
import { indicesArrayType } from '../../../utils/indices-array.js';

let xAtlasAPI: XAtlasAPI

export const init_XAtlasAPI = (xatlas_path: string = '/xatlasjs-esm') => new Promise<void>(async resolve => {
    const { XAtlasAPI: XAtlasAPIClass } = await (eval(`import("${xatlas_path}/index.js")`) as PromiseLike<{ XAtlasAPI: typeof XAtlasAPI }>)
    
    xAtlasAPI = new XAtlasAPIClass(
        () => resolve(),
        (path, dir) => {
            //TODO: should the prefix "/" be removed for this path?
            if (path === "xatlas.wasm") return `${xatlas_path}/${path}`;
            return dir + path;
        },
        (mode: any, progress: any) => {
            console.log("on progress ", mode, progress);
        }
    )
})

export const xAtlas: SurfaceUVUnwrappingAlgorithm = {
    init() {
        if (!xAtlasAPI)
            throw new Error("load XAtlasAPI before using the xatlas unwrapper")
    },

    unwrap(mesh) {
        const indices_start = mesh.triangles instanceof Uint16Array ? mesh.triangles : new Uint16Array(mesh.triangles)
        const vertices_start = mesh.vertices

        xAtlasAPI.createAtlas()
        xAtlasAPI.addMesh(indices_start, vertices_start)
        const results = xAtlasAPI.generateAtlas(xAtlasAPI.defaultChartOptions(), xAtlasAPI.defaultPackOptions())
        if (results.length !== 1)
            throw new Error(`xatlas: ${results.length} atlases generated`)
        
        const atlas = results[0]
        
        /** number of atlas vertices */
        const n_atlas = atlas.vertex.vertices.length / 3

        /** atlas vertex index → final surface mesh vertex index */
        const mappings_atlas_final = Array<number>(n_atlas)
        /** original surface mesh vertex index → atlas vertex indices */
        const vertsUsed = new Array<boolean>(mesh.vertices.length).fill(false)
        /** original surface mesh vertex indices */
        const duplicatedVerts = new Array<number>()
        /** final vertex UV's */
        const UVs = atlas.vertex.coords1
        
        function original_vert_index(x: number, y: number, z: number) {
            //TODO: use binary list
            for (let i = 0; i < vertices_start.length / 3; i++) {
                if (mesh.vertices[(3 * i) + 0] === x &&
                    mesh.vertices[(3 * i) + 1] === y &&
                    mesh.vertices[(3 * i) + 2] === z)
                    return i
            }

            throw new Error("element not found. If this is raised, implement nearest neighbor lookup")
        }

        // for (let i_atlas = n_atlas - 1; i_atlas >= 0; i_atlas--) {
        for (let i_atlas = 0; i_atlas < n_atlas; i_atlas++) {
            const i_original = original_vert_index(
                atlas.vertex.vertices[(3 * i_atlas) + 0],
                atlas.vertex.vertices[(3 * i_atlas) + 1],
                atlas.vertex.vertices[(3 * i_atlas) + 2]
            )

            let i_final = i_original
            if (vertsUsed[i_original]) {
                i_final = mesh.vertices.length + duplicatedVerts.length
                duplicatedVerts.push(i_original)
            }

            vertsUsed[i_original] = true
            mappings_atlas_final[i_atlas] = i_final
        }

        const finalIndices = new (indicesArrayType(n_atlas))(atlas.index.length)
        for (let i_index_atlas = 0; i_index_atlas < atlas.index.length; i_index_atlas++)
            finalIndices[i_index_atlas] = mappings_atlas_final[atlas.index[i_index_atlas]]

        xAtlasAPI.destroyAtlas()

        return {
            duplicatedVerts: new (indicesArrayType(mesh.vertices.length))(duplicatedVerts),
            finalIndices,
            UVs
        }
    }
}