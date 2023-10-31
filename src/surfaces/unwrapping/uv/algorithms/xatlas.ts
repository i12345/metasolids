import type { XAtlasAPI } from 'xatlasjs-esm'
import { SurfaceUVUnwrappingAlgorithm } from '../algorithm.js';
import { indicesArrayType } from '../../../../paradigm/arrays/indices-array.js';

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

export interface XAtlasOptions {
    maxIterations: number
    // maxCost: number
    
    /** @default 3 */
    margin: number
}

export const xAtlas: SurfaceUVUnwrappingAlgorithm = {
    init() {
        if (!xAtlasAPI)
            throw new Error("load XAtlasAPI before using the xatlas unwrapper")
    },

    unwrap(mesh, unwrap_options?: XAtlasOptions) {
        const indices_start = mesh.triangles instanceof Uint16Array ? mesh.triangles : new Uint16Array(mesh.triangles)
        const vertices_start = mesh.vertices
        const n_vertices_start = vertices_start.length / 3

        xAtlasAPI.createAtlas()
        xAtlasAPI.addMesh(indices_start, vertices_start)

        const xatlas_options = {
            chart: xAtlasAPI.defaultChartOptions(),
            pack: xAtlasAPI.defaultPackOptions()
        }
        
        const margin = unwrap_options?.margin ?? 3
        const resolution = 512

        xatlas_options.chart.maxIterations = 1
        xatlas_options.pack.resolution = resolution - (2 * margin)
        xatlas_options.pack.padding = margin
        xatlas_options.pack.bilinear = false
        
        if (unwrap_options) {
            xatlas_options.chart.maxIterations = unwrap_options.maxIterations
            // xatlas_options.chart.maxCost = unwrap_options.maxCost
        }

        function generateAtlas() {
            const results = xAtlasAPI.generateAtlas(xatlas_options.chart, xatlas_options.pack)
            if (results.length !== 1)
                throw new Error(`xatlas: ${results.length} atlases generated`)
            return results[0]
        }

        // function experiment(label: string) {
        //     function trial(i_trial: number) {
        //         const start = performance.now()
        //         generateAtlas()
        //         const end = performance.now()
        //         performance.measure(`${label} (${i_trial})`, { start, end })
        //         return end - start
        //     }

        //     const trials = []
        //     const n_trials = 10
        //     for (let i_trial = 0; i_trial < n_trials; i_trial++)
        //         trials.push(trial(i_trial))

        //     const trials_mean = trials.reduce((acc, trial) => acc + trial, 0) / trials.length
        //     const trials_stdDev = Math.sqrt(trials.reduce((acc, trial) => acc + ((trial - trials_mean) ** 2), 0))    

        //     console.info(`unwrap[${label}] = ${trials_mean}ms ± ${1.96*trials_stdDev}ms (95% CI)`)
        // }

        // experiment("default")

        // console.info(`default maxIterations = ${options.chart.maxIterations}`)
        // for (let iterations = 0; iterations < 25; iterations++) {
        //     options.chart.maxIterations = iterations
        //     experiment(`maxIterations = ${iterations}`)
        // }

        // console.info(`default maxCost = ${options.chart.maxCost}`)
        // for (let maxCost = 1; maxCost < 5; maxCost++) {
        //     options.chart.maxCost = maxCost
        //     experiment(`maxCost = ${maxCost}`)
        // }

        // console.info(`default maxBoundaryLength = ${options.chart.maxBoundaryLength}`)
        // for (let maxBoundaryLength = 1; maxBoundaryLength < 5; maxBoundaryLength++) {
        //     options.chart.maxBoundaryLength = maxBoundaryLength
        //     experiment(`maxBoundaryLength = ${maxBoundaryLength}`)
        // }
        
        const atlas = generateAtlas()

        /** number of atlas vertices */
        const n_vertices_unwrapped = atlas.vertex.vertices.length / 3

        /** atlas vertex index → final surface mesh vertex index */
        const mappings_unwrapped_final = Array<number>(n_vertices_unwrapped)
        /** original surface mesh vertex index → atlas vertex indices */
        const vertsUsed = new Array<boolean>(n_vertices_start).fill(false)
        /** original surface mesh vertex indices */
        const duplicatedVerts = new Array<number>()

        function original_vert_index(x: number, y: number, z: number) {
            //TODO: use binary list
            for (let i = 0; i < n_vertices_start; i++) {
                if (mesh.vertices[(3 * i) + 0] === x &&
                    mesh.vertices[(3 * i) + 1] === y &&
                    mesh.vertices[(3 * i) + 2] === z)
                    return i
            }

            throw new Error("element not found. If this is raised, implement nearest neighbor lookup")
        }

        const atlas_vertex_vertices = atlas.vertex.vertices
        for (let i_atlas = 0, i_atlas_vertex_vertices = 0; i_atlas < n_vertices_unwrapped; i_atlas++) {
            const i_original = original_vert_index(
                atlas_vertex_vertices[i_atlas_vertex_vertices++],
                atlas_vertex_vertices[i_atlas_vertex_vertices++],
                atlas_vertex_vertices[i_atlas_vertex_vertices++]
            )

            let i_final = i_original
            if (vertsUsed[i_original]) {
                i_final = n_vertices_start + duplicatedVerts.length
                duplicatedVerts.push(i_original)
            }

            vertsUsed[i_original] = true
            mappings_unwrapped_final[i_atlas] = i_final
        }

        const finalIndices = new (indicesArrayType(n_vertices_unwrapped))(atlas.index.length)
        for (let i_index_atlas = 0; i_index_atlas < finalIndices.length; i_index_atlas++)
            finalIndices[i_index_atlas] = mappings_unwrapped_final[atlas.index[i_index_atlas]]

        const UVs_tmp = atlas.vertex.coords1
        /** final vertex UV's */
        const UVs_final = new Float32Array(UVs_tmp.length)
        let i_final: number
        for (let i_atlas = 0, i_UV = 0; i_atlas < n_vertices_unwrapped; i_atlas++) {
            i_final = mappings_unwrapped_final[i_atlas]
            UVs_final[(2 * i_final) + 0] = UVs_tmp[i_UV++]
            UVs_final[(2 * i_final) + 1] = UVs_tmp[i_UV++]
        }
        
        for (i_final = 0; i_final < UVs_final.length; i_final++)
            UVs_final[i_final] = (((resolution - 2 * margin) * UVs_final[i_final]) + margin) / resolution

        xAtlasAPI.destroyAtlas()

        return {
            duplicatedVerts: new (indicesArrayType(n_vertices_start))(duplicatedVerts),
            finalIndices,
            UVs: UVs_final
        }
    }
}