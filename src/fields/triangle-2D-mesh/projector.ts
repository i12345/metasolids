import { Vec2 } from "playcanvas-extended";
import { FieldPointTensorTopologyProjectorFactory, FieldPointTensorTopologyProjector } from "../tensor/topology.js";
import * as tf from "@tensorflow/tfjs"
import { Triangles2DMesh } from "./mesh.js";
import { Triangles2DMeshCollider } from "./collider.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import HashTable from "@ronomon/hash-table";
import { cyrb53, renderTensor } from "../../utils/tf-img.js";
import * as fs from 'fs'
import { NumberTypedArray } from "../../utils/typed-array.js";

export type Triangle2DMeshTopologyProjectorCopyReference = {
    indices: {
        src: tf.Tensor2D,
        dst: tf.Tensor2D,
    },
    weights: tf.Tensor2D
}

export interface Triangle2DMeshTopologyProjectorCopyReferences {
    outside_to_inside: Triangle2DMeshTopologyProjectorCopyReference[]
    inside_to_outside: Triangle2DMeshTopologyProjectorCopyReference[]
}

function project_copy(t: tf.Tensor2D, references: Triangle2DMeshTopologyProjectorCopyReference[]): tf.Tensor2D {
    let projected = tf.zeros<tf.Rank.R2>(t.shape)

    for (const { indices, weights } of references) {
        projected = tf.tidy(() => {
            try {
                const src_values = tf.gatherND(t, indices.src).expandDims(0)
                const update_values = src_values.matMul(weights).as1D()
                const projected_sum = <tf.Tensor2D>tf.add(
                    projected,
                    tf.scatterND(
                        indices.dst,
                        update_values,
                        t.shape
                    )
                )

                projected.dispose()
                return projected_sum
            }
            catch (x) {
                console.log(x)
                return undefined! 
            }
        })
    }

    return projected
}

export class Triangle2DMeshTopologyProjectorFactory
    implements FieldPointTensorTopologyProjectorFactory<tf.Rank.R2> {
    constructor(
        public readonly mesh: Triangles2DMesh,
        public readonly externalIndices: IndicesTypedArray
    ) { }
    
    instance(shape: [h: number, w: number]): FieldPointTensorTopologyProjector<tf.Rank.R2> {
        const [h, w] = shape
        const resolution = new Vec2(w, h)

        const { vertices, triangles } = this.mesh

        const { tri, w1, w2, invalid } = new Triangles2DMeshCollider(this.mesh).render(resolution, true)

        const n_triangle_edges = triangles.length
        const n_tri = n_triangle_edges / 3
        let i_index: number

        const edges_map_lookup_buffer_external_indices = Buffer.alloc(2 * 4)
        const edges_map_lookup_buffer_vertex_and_edge_indices = Buffer.alloc(4 * Uint32Array.BYTES_PER_ELEMENT)
        const edges_map_lookup_vertex_edges_indices = new Uint32Array(edges_map_lookup_buffer_vertex_and_edge_indices.buffer, 0, 4)
        
        /** stored before swapping order */
        const edge_external_indices = new Uint32Array(2 * n_triangle_edges)

        /** external index -> vertex indices A/B/C, edge index */
        const edges_map_A = new HashTable(edges_map_lookup_buffer_external_indices.byteLength, edges_map_lookup_buffer_vertex_and_edge_indices.byteLength, n_triangle_edges, n_triangle_edges)
        const edges_map_B = new HashTable(edges_map_lookup_buffer_external_indices.byteLength, edges_map_lookup_buffer_vertex_and_edge_indices.byteLength, n_triangle_edges, n_triangle_edges)
        
        /** 0 = shared, 1/2 = distinct */
        const edges_indices_island = new Uint8Array(n_triangle_edges)

        let i_edge = 0

        let vertex_index_other_a: number,
            vertex_index_other_b: number,
            vertex_index_other_c: number,
            i_edge_other: number

        let tmp: number
        
        function iterateEdge(
                vertex_index_a: number, vertex_index_b: number, vertex_index_c: number,
                external_index_a: number, external_index_b: number
            ) {
            edge_external_indices[(2 * i_edge) + 0] = external_index_a
            edge_external_indices[(2 * i_edge) + 1] = external_index_b
            
            if (external_index_a > external_index_b) {
                tmp = external_index_a
                external_index_a = external_index_b
                external_index_b = tmp

                tmp = vertex_index_a
                vertex_index_a = vertex_index_b
                vertex_index_b = tmp
            }

            edges_map_lookup_buffer_external_indices.writeUint32LE(external_index_a, 0)
            edges_map_lookup_buffer_external_indices.writeUint32LE(external_index_b, 4)
            
            if (edges_map_A.get(edges_map_lookup_buffer_external_indices, 0, edges_map_lookup_buffer_vertex_and_edge_indices, 0) !== 0) {
                vertex_index_other_a = edges_map_lookup_vertex_edges_indices[0]
                vertex_index_other_b = edges_map_lookup_vertex_edges_indices[1]
                vertex_index_other_c = edges_map_lookup_vertex_edges_indices[2]
                i_edge_other = edges_map_lookup_vertex_edges_indices[3]

                if (edges_map_B.exist(edges_map_lookup_buffer_external_indices, 0))
                    throw new Error("same edge shared by > 2 triangles")
                
                if (vertex_index_other_a === vertex_index_a && vertex_index_other_b === vertex_index_b)
                    edges_indices_island[i_edge_other] = 0
                else
                    edges_indices_island[i_edge] = 2

                edges_map_lookup_vertex_edges_indices[0] = vertex_index_a
                edges_map_lookup_vertex_edges_indices[1] = vertex_index_b
                edges_map_lookup_vertex_edges_indices[2] = vertex_index_c
                edges_map_lookup_vertex_edges_indices[3] = i_edge
                edges_map_B.set(edges_map_lookup_buffer_external_indices, 0, edges_map_lookup_buffer_vertex_and_edge_indices, 0)
            }
            else {
                edges_indices_island[i_edge] = 1

                edges_map_lookup_vertex_edges_indices[0] = vertex_index_a
                edges_map_lookup_vertex_edges_indices[1] = vertex_index_b
                edges_map_lookup_vertex_edges_indices[2] = vertex_index_c
                edges_map_lookup_vertex_edges_indices[3] = i_edge
                edges_map_A.set(edges_map_lookup_buffer_external_indices, 0, edges_map_lookup_buffer_vertex_and_edge_indices, 0)
            }
            
            i_edge++
        }

        const n_2D_indices = triangles.length
        
        let triangle_index_a: number,
            triangle_index_b: number,
            triangle_index_c: number,
            vertices_index_a: number,
            vertices_index_b: number,
            vertices_index_c: number,
            external_index_a: number,
            external_index_b: number,
            external_index_c: number
        
        const externalIndices = this.externalIndices
        
        for (let i_triangle = 0; i_triangle < n_2D_indices;) {
            triangle_index_a = i_triangle++
            triangle_index_b = i_triangle++
            triangle_index_c = i_triangle++

            vertices_index_a = triangles[triangle_index_a]
            vertices_index_b = triangles[triangle_index_b]
            vertices_index_c = triangles[triangle_index_c]

            external_index_a = externalIndices[triangle_index_a]
            external_index_b = externalIndices[triangle_index_b]
            external_index_c = externalIndices[triangle_index_c]

            iterateEdge(vertices_index_a, vertices_index_b, vertices_index_c, external_index_a, external_index_b)
            iterateEdge(vertices_index_b, vertices_index_c, vertices_index_a, external_index_b, external_index_c)
            iterateEdge(vertices_index_c, vertices_index_a, vertices_index_b, external_index_c, external_index_a)
        }

        for (i_edge = 0; i_edge < n_triangle_edges; i_edge++) {
            external_index_a = externalIndices[(3 * Math.floor(i_edge / 3)) + ((i_edge + 0) % 3)]
            external_index_b = externalIndices[(3 * Math.floor(i_edge / 3)) + ((i_edge + 1) % 3)]

            if (external_index_a > external_index_b) {
                tmp = external_index_a
                external_index_a = external_index_b
                external_index_b = tmp
            }

            edges_map_lookup_buffer_external_indices.writeUint32LE(external_index_a, 0)
            edges_map_lookup_buffer_external_indices.writeUint32LE(external_index_b, 4)

            if (!edges_map_A.exist(edges_map_lookup_buffer_external_indices, 0))
                throw new Error()
            if (!edges_map_B.get(edges_map_lookup_buffer_external_indices, 0, edges_map_lookup_buffer_vertex_and_edge_indices, 0))
                throw new Error()

            vertex_index_other_a = edges_map_lookup_vertex_edges_indices[0]
            vertex_index_other_b = edges_map_lookup_vertex_edges_indices[1]
            vertex_index_other_c = edges_map_lookup_vertex_edges_indices[2]
            i_edge_other = edges_map_lookup_vertex_edges_indices[3]
        }

        i_edge = 0

        const area = w * h
        const w_minus_2 = w - 2
        const w_minus_1 = w - 1
        const h_minus_1 = h - 1

        let dx: number
        let dy: number
        let dc: number
        let dc_j: number

        let x_i: number
        let y_i: number
        let c_i: number

        let x_a: number
        let y_a: number

        let x_b: number
        let y_b: number

        let coords_n: number
        let coords_i: number
        let coords_offset: number
        let coords_clear_offset: number

        function clearMask(coords: Int32Array) {
            coords_clear_offset = 0
            while (coords_clear_offset < coords_offset)
                coords_mask[coords[coords_clear_offset++] + (w * coords[coords_clear_offset++])] = 0
        }

        let l_joined: number
        let l_N: number
        let l_E: number
        let l_S: number
        let l_W: number
        let l_NE: number
        let l_NW: number
        let l_SE: number
        let l_SW: number
        let tri_i: number
        let tri_N: number
        let tri_E: number
        let tri_S: number
        let tri_W: number
        let tri_NE: number
        let tri_NW: number
        let tri_SE: number
        let tri_SW: number

        function joinIslands() {
            // island pixels are added into the adjacent/diagonal triangle
            // with longest line of pixels leading to island pixel

            for (y_i = 0, c_i = 0; y_i < h; y_i++) {
                for (x_i = 0; x_i < w; x_i++, c_i++) {
                    if (!invalid[c_i]) {
                        tri_i = tri[c_i]

                        if (y_i > 0 && !invalid[c_i - w]) {
                            tri_N = tri[c_i - w]
                            if (tri_N === tri_i) continue
                            for (l_N = 2; (y_i - l_N) >= 0 && !invalid[c_i - (w * l_N)] && tri[c_i - (w * l_N)] === tri_N; l_N++) { }
                            l_N--
                        }
                        else {
                            l_N = 0
                        }

                        if (x_i > 0 && !invalid[c_i + 1]) {
                            tri_E = tri[c_i + 1]
                            if (tri_E === tri_i) continue
                            for (l_E = 2; (x_i - l_E) <= w_minus_1 && !invalid[c_i + l_E] && tri[c_i + l_E] === tri_E; l_E++) { }
                            l_E--
                        }
                        else {
                            l_E = 0
                        }

                        if (y_i < h_minus_1 && !invalid[c_i + w]) {
                            tri_S = tri[c_i + w]
                            if (tri_S === tri_i) continue
                            for (l_S = 2; (y_i + l_S) <= h_minus_1 && !invalid[c_i + (w * l_S)] && tri[c_i + (w * l_S)] === tri_S; l_S++) { }
                            l_S--
                        }
                        else {
                            l_S = 0
                        }

                        if (x_i > 0 && !invalid[c_i - 1]) {
                            tri_W = tri[c_i - 1]
                            if (tri_W === tri_i) continue
                            for (l_W = 2; (x_i - l_W) >= 0 && !invalid[c_i - l_W] && tri[c_i - l_W] === tri_W; l_W++) { }
                            l_W--
                        }
                        else {
                            l_W = 0
                        }

                        if (x_i > 0 && y_i > 0 && !invalid[c_i - w - 1]) {
                            tri_NW = tri[c_i - w - 1]
                            if (tri_NW === tri_i) continue
                            for (l_NW = 2; (x_i - l_NW) >= 0 && (y_i - l_NW) >= 0 && !invalid[c_i - (w * l_NW) - l_NW] && tri[c_i - (w * l_NW) - l_NW] === tri_NW; l_NW++) { }
                            l_NW--
                        }
                        else {
                            l_NW = 0
                        }

                        if (x_i < w_minus_1 && y_i > 0 && !invalid[c_i - w + 1]) {
                            tri_NE = tri[c_i - w + 1]
                            if (tri_NE === tri_i) continue
                            for (l_NE = 2; (x_i + l_NE) <= w_minus_1 && (y_i - l_NE) >= 0 && !invalid[c_i - (w * l_NE) + l_NE] && tri[c_i - (w * l_NE) + l_NE] === tri_NE; l_NE++) { }
                            l_NE--
                        }
                        else {
                            l_NE = 0
                        }

                        if (x_i > 0 && y_i < h_minus_1 && !invalid[c_i + w - 1]) {
                            tri_SW = tri[c_i + w - 1]
                            if (tri_SW === tri_i) continue
                            for (l_SW = 2; (x_i - l_SW) >= 0 && (y_i + l_SW) <= h_minus_1 && !invalid[c_i + (w * l_SW) - l_SW] && tri[c_i + (w * l_SW) - l_SW] === tri_SW; l_SW++) { }
                            l_SW--
                        }
                        else {
                            l_SW = 0
                        }

                        if (x_i < w_minus_1 && y_i < h_minus_1 && !invalid[c_i + w + 1]) {
                            tri_SE = tri[c_i + w + 1]
                            if (tri_SE === tri_i) continue
                            for (l_SE = 2; (x_i + l_SE) <= w_minus_1 && (y_i + l_SE) <= h_minus_1 && !invalid[c_i + (w * l_SE) + l_SE] && tri[c_i + (w * l_SE) + l_SE] === tri_SE; l_SE++) { }
                            l_SE--
                        }
                        else {
                            l_SE = 0
                        }

                        l_joined = 1
                        if (l_N > l_joined) {
                            dc = -w
                            l_joined = l_N
                        }
                        if (l_E > l_joined) {
                            dc = 1
                            l_joined = l_E
                        }
                        if (l_S > l_joined) {
                            dc = w
                            l_joined = l_S
                        }
                        if (l_W > l_joined) {
                            dc = -1
                            l_joined = l_W
                        }
                        if (l_NW > l_joined) {
                            dc = -w - 1
                            l_joined = l_NW
                        }
                        if (l_NE > l_joined) {
                            dc = -w + 1
                            l_joined = l_NE
                        }
                        if (l_SW > l_joined) {
                            dc = w - 1
                            l_joined = l_SW
                        }
                        if (l_SE > l_joined) {
                            dc = w + 1
                            l_joined = l_SE
                        }

                        if (l_joined > 1) {
                            tri[c_i] = tri[c_i + dc!]
                            w1[c_i] = (w1[c_i + dc!] > 0.5) ? (1 - ((1 - w1[c_i + dc!]) / 2)) : (w1[c_i + dc!] / 2)
                            w2[c_i] = (w2[c_i + dc!] > 0.5) ? (1 - ((1 - w2[c_i + dc!]) / 2)) : (w2[c_i + dc!] / 2)
                        }
                    }
                }
            }
        }

        joinIslands()

        let tri_above: boolean
        let tri_right: boolean

        /**
         * y_c = (y_b - y_a)t + y_a
         * t = (y_c - y_a) / (y_b - y_a)
         * x_c' = (x_b  - x_a)t + x_a
         *      = (x_b - x_a)(y_c - y_a) / (y_b - y_a) + x_a
         * tri_right = (x_c' < x_c)
         */
        let x_c: number
        let y_c: number

        const coords_mask = new Uint8Array(area)
        const tri_edges = new Int32Array(area).fill(-1)

        function triangle_edge_initial(
                tri_i: number,
                coords: Int32Array,
                values: Float32Array,
                bitmap_value: Float32Array,
                vertex_index_a: number, vertex_index_b: number, vertex_index_c: number
            ): number {
            vertex_index_a *= 2
            vertex_index_b *= 2
            vertex_index_c *= 2

            x_a = vertices[vertex_index_a++]
            y_a = vertices[vertex_index_a]

            x_b = vertices[vertex_index_b++]
            y_b = vertices[vertex_index_b]

            x_c = vertices[vertex_index_c++]
            y_c = vertices[vertex_index_c]

            tri_right = ((x_b - x_a) * (y_c - y_a) / (y_b - y_a)) + x_a < x_c
            tri_above = ((y_b - y_a) * (x_c - x_a) / (x_b - x_a)) + y_a > y_c

            x_a = x_a * w
            y_a = y_a * h

            x_b = x_b * w
            y_b = y_b * h

            coords_n = 0
            coords_offset = 0

            // y0 = (y_b - y_a) * t + y_a
            // t = (y0 - y_a) / (y_b - y_a)
            // x0 = (x_b - x_a) * t + x_a
            //    = (x_b - x_a) * (y0 - y_a) / (y_b - y_a) + x_a

            let pixel_found: boolean
            let last: number

            if (Math.abs(y_a - y_b) > Math.abs(x_a - x_b)) {
                dx = tri_right ? 1 : -1
                dc = tri_right ? 1 : -1
                dy = Math.sign(y_b - y_a)
                dc_j = dy * w
                last = Math.floor(y_b) + dy
                for (y_i = Math.floor(y_a); y_i !== last; y_i += dy) {
                    x_i = (x_b - x_a) * ((y_i + 0.5) - y_a) / (y_b - y_a) + x_a
                    x_i = Math.floor(x_i)
                    c_i = (y_i * w) + x_i
                    pixel_found = (invalid[c_i] === 0 && tri[c_i] === tri_i)

                    while (true) {
                        if (pixel_found) {
                            if (coords_n === 0)
                                break

                            if (coords_mask[c_i - dc_j] === 1 ||
                                coords_mask[c_i - dc_j - dc] === 1 ||
                                coords_mask[c_i - dc_j + dc] === 1)
                                break
                        }

                        x_i += dx
                        c_i += dc
                        if (x_i >= 0 && x_i < w && (invalid[c_i] === 0 && tri[c_i] === tri_i))
                            pixel_found = true
                        else break
                    }

                    if (!pixel_found) {
                        if (coords_n > 0) {
                            // there are no tri elements in this row
                            // this function is done
                            break
                        }
                        else {
                            // line not yet started
                            continue
                        }
                    }

                    coords_mask[c_i] = 1

                    if (invalid[c_i])
                        throw new Error()
                    values[coords_n++] = bitmap_value[c_i]
                    coords[coords_offset++] = x_i
                    coords[coords_offset++] = y_i
                }
            }
            else {
                dy = tri_above ? -1 : 1
                dc = tri_above ? -w : w
                dx = Math.sign(x_b - x_a)
                dc_j = dx
                last = Math.floor(x_b) + dx
                for (x_i = Math.floor(x_a); x_i !== last; x_i += dx) {
                    y_i = (y_b - y_a) * ((x_i + 0.5) - x_a) / (x_b - x_a) + y_a
                    y_i = Math.floor(y_i)
                    c_i = (y_i * w) + x_i
                    pixel_found = (invalid[c_i] === 0 && tri[c_i] === tri_i)

                    while (true) {
                        if (pixel_found) {
                            if (coords_n === 0)
                                break

                            if (coords_mask[c_i - dc_j] === 1 ||
                                coords_mask[c_i - dc_j - dc] === 1 ||
                                coords_mask[c_i - dc_j + dc] === 1)
                                break
                        }

                        y_i += dy
                        c_i += dc
                        if (y_i >= 0 && y_i < h && (invalid[c_i] === 0 && tri[c_i] === tri_i))
                            pixel_found = true
                        else break
                    }

                    if (!pixel_found) {
                        if (coords_n > 0) {
                            // there are no tri elements in this row
                            // this function is done
                            break
                        }
                        else {
                            // line not yet started
                            continue
                        }
                    }

                    coords_mask[c_i] = 1

                    if (invalid[c_i])
                        throw new Error()
                    values[coords_n++] = bitmap_value[c_i]
                    coords[coords_offset++] = x_i
                    coords[coords_offset++] = y_i
                }
            }

            coords_clear_offset = 0
            while (coords_clear_offset < coords_offset) {
                x_i = coords[coords_clear_offset++]
                y_i = coords[coords_clear_offset++]
                c_i = (y_i * w) + x_i
                coords_mask[c_i] = 0
            }

            return coords_n
        }

        function triangle_edge_final(
                i_edge: number,
                coords: Int32Array,
                values: Float32Array,
                bitmap_value: Float32Array,
                vertex_index_a: number, vertex_index_b: number
            ): number {
            vertex_index_a *= 2
            vertex_index_b *= 2
            
            x_a = vertices[vertex_index_a++]
            y_a = vertices[vertex_index_a]
            x_b = vertices[vertex_index_b++]
            y_b = vertices[vertex_index_b]

            x_i = Math.floor(w * (x_a + x_b) / 2)
            y_i = Math.floor(h * (y_a + y_b) / 2)
            c_i = (y_i * w) + x_i
                
            if (tri_edges[c_i] === i_edge) { }
            else if ((x_i > 0) && (y_i > 0) && tri_edges[c_i - w - 1] === i_edge) {
                x_i--
                y_i--
                c_i = c_i - w - 1
            }
            else if ((y_i > 0) && tri_edges[c_i - w] === i_edge) {
                y_i--
                c_i = c_i - w
            }
            else if ((x_i < w_minus_1) && (y_i > 0) && tri_edges[c_i - w + 1] === i_edge) {
                x_i++
                y_i--
                c_i = c_i - w + 1
            }
            else if ((x_i > 0) && tri_edges[c_i - 1] === i_edge) {
                x_i--
                c_i = c_i - 1
            }
            else if ((x_i < w_minus_1) && tri_edges[c_i + 1] === i_edge) {
                x_i++
                c_i = c_i + 1
            }
            else if ((x_i > 0) && (y_i < h_minus_1) && tri_edges[c_i + w - 1] === i_edge) {
                x_i--
                y_i++
                c_i = c_i + w - 1
            }
            else if ((y_i < h_minus_1) && tri_edges[c_i + w] === i_edge) {
                y_i++
                c_i = c_i + w
            }
            else if ((x_i < w_minus_1) && (y_i < h_minus_1) && tri_edges[c_i + w + 1] === i_edge) {
                x_i++
                y_i++
                c_i = c_i + w + 1
            }
            else throw new Error()

            coords_n = 0
            coords_offset = 0

            if (Math.abs(y_b - y_a) > Math.abs(x_b - x_a)) {
                dy = Math.sign(y_b - y_a)
                dc_j = dy * w

                while (true) {
                    c_i = (y_i * w) + x_i
                    coords_n++
                    coords_mask[c_i] = 1
                    coords[coords_offset++] = x_i
                    coords[coords_offset++] = y_i

                    if (y_i > 0 && y_i < h_minus_1 && tri_edges[c_i - dc_j] === i_edge && coords_mask[c_i - dc_j] === 0) {
                        y_i -= dy
                    }
                    else if (y_i > 0 && y_i < h_minus_1 && x_i > 0 && tri_edges[c_i - dc_j - 1] === i_edge && coords_mask[c_i - dc_j - 1] === 0) {
                        y_i -= dy
                        x_i--
                    }
                    else if (y_i > 0 && y_i < h_minus_1 && x_i < w_minus_1 && tri_edges[c_i - dc_j + 1] === i_edge && coords_mask[c_i - dc_j + 1] === 0) {
                        y_i -= dy
                        x_i++
                    }
                    else if (x_i > 0 && tri_edges[c_i - 1] === i_edge && coords_mask[c_i - 1] === 0) {
                        x_i--
                    }
                    else if (x_i < w_minus_1 && tri_edges[c_i + 1] === i_edge && coords_mask[c_i + 1] === 0) {
                        x_i++
                    }
                    else break
                }

                clearMask(coords)

                coords_n = 0
                coords_offset = 0

                while (true) {
                    c_i = (w * y_i) + x_i

                    coords_n++
                    coords[coords_offset++] = x_i
                    coords[coords_offset++] = y_i
                    coords_mask[c_i] = 1

                    if (x_i > 0 && tri_edges[c_i - 1] === i_edge && coords_mask[c_i - 1] === 0) {
                        x_i--
                        c_i--
                    }
                    else if (x_i < w_minus_1 && tri_edges[c_i + 1] === i_edge && coords_mask[c_i + 1] === 0) {
                        x_i++
                        c_i++
                    }
                    else if (y_i > 0 && y_i < h_minus_1 && tri_edges[c_i + dc_j] === i_edge && coords_mask[c_i + dc_j] === 0) {
                        y_i += dy
                        c_i += dc_j
                    }
                    else if (y_i > 0 && y_i < h_minus_1 && x_i > 0 && tri_edges[c_i + dc_j - 1] === i_edge && coords_mask[c_i + dc_j - 1] === 0) {
                        x_i--
                        y_i += dy
                        c_i += dc_j - 1
                    }
                    else if (y_i > 0 && y_i < h_minus_1 && x_i < w_minus_1 && tri_edges[c_i + dc_j + 1] === i_edge && coords_mask[c_i + dc_j + 1] === 0) {
                        x_i++
                        y_i += dy
                        c_i += dc_j + 1
                    }
                    else break
                }
            }
            else {
                dx = Math.sign(x_b - x_a)
                dc_j = dx

                while (true) {
                    c_i = (y_i * w) + x_i
                    coords_n++
                    coords_mask[c_i] = 1
                    coords[coords_offset++] = x_i
                    coords[coords_offset++] = y_i

                    if (x_i > 0 && x_i < w_minus_1 && tri_edges[c_i - dc_j] === i_edge && coords_mask[c_i - dc_j] === 0) {
                        x_i -= dx
                    }
                    else if (x_i > 0 && x_i < w_minus_1 && y_i > 0 && tri_edges[c_i - dc_j - w] === i_edge && coords_mask[c_i - dc_j - w] === 0) {
                        x_i -= dx
                        y_i--
                    }
                    else if (x_i > 0 && x_i < w_minus_1 && y_i < h_minus_1 && tri_edges[c_i - dc_j + w] === i_edge && coords_mask[c_i - dc_j + w] === 0) {
                        x_i -= dx
                        y_i++
                    }
                    else if (y_i > 0 && tri_edges[c_i - w] === i_edge && coords_mask[c_i - w] === 0) {
                        y_i--
                    }
                    else if (y_i < h_minus_1 && tri_edges[c_i + w] === i_edge && coords_mask[c_i + w] === 0) {
                        y_i++
                    }
                    else break
                }

                clearMask(coords)

                coords_n = 0
                coords_offset = 0

                while (true) {
                    c_i = (w * y_i) + x_i

                    coords_n++
                    coords[coords_offset++] = x_i
                    coords[coords_offset++] = y_i
                    coords_mask[c_i] = 1

                    if (y_i > 0 && tri_edges[c_i - w] === i_edge && coords_mask[c_i - w] === 0) {
                        y_i--
                        c_i--
                    }
                    else if (y_i < h_minus_1 && tri_edges[c_i + w] === i_edge && coords_mask[c_i + w] === 0) {
                        y_i++
                        c_i++
                    }
                    else if (x_i > 0 && x_i < w_minus_1 && tri_edges[c_i + dc_j] === i_edge && coords_mask[c_i + dc_j] === 0) {
                        x_i += dx
                        c_i += dc_j
                    }
                    else if (x_i > 0 && x_i < w_minus_1 && y_i > 0 && tri_edges[c_i + dc_j - w] === i_edge && coords_mask[c_i + dc_j - w] === 0) {
                        y_i--
                        x_i += dx
                        c_i += dc_j - w
                    }
                    else if (x_i > 0 && x_i < w_minus_1 && y_i < h_minus_1 && tri_edges[c_i + dc_j + w] === i_edge && coords_mask[c_i + dc_j + w] === 0) {
                        y_i++
                        x_i += dx
                        c_i += dc_j + w
                    }
                    else break
                }
            }

            clearMask(coords)

            coords_offset = 0
            for (coords_i = 0; coords_i < coords_n; coords_i++) {
                x_i = coords[coords_offset++]
                y_i = coords[coords_offset++]
                c_i = (y_i * w) + x_i
                values[coords_i] = bitmap_value[c_i]
            }

            return coords_n
        }

        const diffuse_buffer = new Float32Array(area)
        const diffuse_count = new Uint8Array(area)

        /** @returns number of diffused elements */
        function diffuse(
                diffusing_coords: Int32Array,
                diffusing_coords_n: number,
                diffusing_values: Float32Array,
                /** coords per diffused element */
                diffused_coords: Int32Array,
                /** value per diffused element */
                diffused_values: Float32Array,
            ): number {
            let diffusing: number
            let x: number
            let y: number
            let line_1D: number
            let i_diffusing_coord = 0

            let n_diffused = 0
            let i_diffused_coord = 0

            let count_current: number

            for (let i = 0; i < diffusing_coords_n; i++) {
                x = diffusing_coords[i_diffusing_coord++]
                y = diffusing_coords[i_diffusing_coord++]
                line_1D = ((y - 1) * w) + (x - 1)
                diffusing = diffusing_values[i]

                if (line_1D >= 0 && x > 0) {
                    if (invalid[line_1D] !== 0) {
                        count_current = diffuse_count[line_1D]
                        if (count_current === 0) {
                            diffuse_buffer[line_1D] = diffusing
                            diffuse_count[line_1D] = 1

                            diffused_coords[i_diffused_coord++] = x - 1
                            diffused_coords[i_diffused_coord++] = y - 1
                            n_diffused++
                        }
                        else {
                            diffuse_buffer[line_1D] += diffusing
                            diffuse_count[line_1D] = 1 + count_current
                        }
                    }
                }
                line_1D++
                if (line_1D >= 0) {
                    if (invalid[line_1D] !== 0) {
                        count_current = diffuse_count[line_1D]
                        if (count_current === 0) {
                            diffuse_buffer[line_1D] = diffusing
                            diffuse_count[line_1D] = 1
                            
                            diffused_coords[i_diffused_coord++] = x
                            diffused_coords[i_diffused_coord++] = y - 1
                            n_diffused++
                        }
                        else {
                            diffuse_buffer[line_1D] += diffusing
                            diffuse_count[line_1D] = 1 + count_current
                        }
                    }
                }
                line_1D++
                if (line_1D >= 0 && x <= w_minus_2) {
                    if (invalid[line_1D] !== 0) {
                        count_current = diffuse_count[line_1D]
                        if (count_current === 0) {
                            diffuse_buffer[line_1D] = diffusing
                            diffuse_count[line_1D] = 1
                            
                            diffused_coords[i_diffused_coord++] = x + 1
                            diffused_coords[i_diffused_coord++] = y - 1
                            n_diffused++
                        }
                        else {
                            diffuse_buffer[line_1D] += diffusing
                            diffuse_count[line_1D] = 1 + count_current
                        }
                    }
                }
                line_1D += w_minus_2
                if (line_1D >= 0 && x > 0) {
                    if (invalid[line_1D] !== 0) {
                        count_current = diffuse_count[line_1D]
                        if (count_current === 0) {
                            diffuse_buffer[line_1D] = diffusing
                            diffuse_count[line_1D] = 1
                            
                            diffused_coords[i_diffused_coord++] = x - 1
                            diffused_coords[i_diffused_coord++] = y
                            n_diffused++
                        }
                        else {
                            diffuse_buffer[line_1D] += diffusing
                            diffuse_count[line_1D] = 1 + count_current
                        }
                    }
                }
                line_1D++
                if (invalid[line_1D] !== 0)
                    throw new Error()
                line_1D++
                if (line_1D < area && x <= w_minus_2) {
                    if (invalid[line_1D] !== 0) {
                        count_current = diffuse_count[line_1D]
                        if (count_current === 0) {
                            diffuse_buffer[line_1D] = diffusing
                            diffuse_count[line_1D] = 1
                            
                            diffused_coords[i_diffused_coord++] = x + 1
                            diffused_coords[i_diffused_coord++] = y
                            n_diffused++
                        }
                        else {
                            diffuse_buffer[line_1D] += diffusing
                            diffuse_count[line_1D] = 1 + count_current
                        }
                    }
                }
                line_1D += w_minus_2
                if (line_1D < area && x > 0) {
                    if (invalid[line_1D] !== 0) {
                        count_current = diffuse_count[line_1D]
                        if (count_current === 0) {
                            diffuse_buffer[line_1D] = diffusing
                            diffuse_count[line_1D] = 1
                            
                            diffused_coords[i_diffused_coord++] = x - 1
                            diffused_coords[i_diffused_coord++] = y + 1
                            n_diffused++
                        }
                        else {
                            diffuse_buffer[line_1D] += diffusing
                            diffuse_count[line_1D] = 1 + count_current
                        }
                    }
                }
                line_1D++
                if (line_1D < area) {
                    if (invalid[line_1D] !== 0) {
                        count_current = diffuse_count[line_1D]
                        if (count_current === 0) {
                            diffuse_buffer[line_1D] = diffusing
                            diffuse_count[line_1D] = 1
                            
                            diffused_coords[i_diffused_coord++] = x
                            diffused_coords[i_diffused_coord++] = y + 1
                            n_diffused++
                        }
                        else {
                            diffuse_buffer[line_1D] += diffusing
                            diffuse_count[line_1D] = 1 + count_current
                        }
                    }
                }
                line_1D++
                if (line_1D < area && x <= w_minus_2) {
                    if (invalid[line_1D] !== 0) {
                        count_current = diffuse_count[line_1D]
                        if (count_current === 0) {
                            diffuse_buffer[line_1D] = diffusing
                            diffuse_count[line_1D] = 1
                            
                            diffused_coords[i_diffused_coord++] = x + 1
                            diffused_coords[i_diffused_coord++] = y + 1
                            n_diffused++
                        }
                        else {
                            diffuse_buffer[line_1D] += diffusing
                            diffuse_count[line_1D] = 1 + count_current
                        }
                    }
                }
            }

            for (let i = 0, i_diffused_coord = 0; i < n_diffused; i++) {
                x = diffused_coords[i_diffused_coord++]
                y = diffused_coords[i_diffused_coord++]
                line_1D = (y * w) + x
                count_current = diffuse_count[line_1D]
                if (count_current === 1)
                    diffused_values[i] = diffuse_buffer[line_1D]
                else
                    diffused_values[i] = diffuse_buffer[line_1D] / count_current
                diffuse_count[line_1D] = 0
            }

            return n_diffused
        }

        function normalizeMatCols(m: tf.Tensor2D): tf.Tensor2D {
            return m.divNoNan(m.sum(0, true))
        }

        function dst_map_src(
                // ordered
                time_src: Float32Array, n_indices_src: number,
                // unordered
                time_dst: Float32Array, n_indices_dst: number
            ) {
            if (n_indices_src === 0 || n_indices_dst === 0)
                throw new Error()

            const n_indices_src_minus_1 = n_indices_src - 1

            const src_0 = time_src[0]
            const src_1 = time_src[n_indices_src_minus_1]
            const src_spacing = (src_1 - src_0) / n_indices_src_minus_1

            /** i_dst_src[i] = src index for dst item i */
            const i_dst_src = new Uint32Array(n_indices_dst)

            /** t_dst_src[i] = time in src index for dst item i */
            const t_dst_src = new Float32Array(n_indices_dst)

            /** i_src_dst_a[i] = dst index with greatest value for src item i */
            const i_src_dst_a = new Int32Array(n_indices_src)
            
            /** i_src_dst_b[i] = dst index with least value for src item i */
            const i_src_dst_b = new Int32Array(n_indices_src)

            i_src_dst_a.fill(-1)
            i_src_dst_b.fill(-1)

            /** w_src_dst[i, j] = weight from src i to dst j */
            const w_src_dst = new Float32Array(n_indices_src * n_indices_dst)

            /** w_dst_src[i, j] = weight from dst i to src j */
            const w_dst_src = new Float32Array(n_indices_dst * n_indices_src)

            let t_src: number
            let i_src: number
            let t_local_src: number
            let current_src_dst_a: number
            let current_src_dst_b: number

            for (let i_dst = 0; i_dst < n_indices_dst; i_dst++) {
                t_src = Number.isNaN(src_spacing) ? 0 : Math.max(0, Math.min(n_indices_src_minus_1, (time_dst[i_dst] - src_0) / src_spacing))
                i_src = Math.round(t_src)
                t_local_src = t_src - i_src + 0.5

                i_dst_src[i_dst] = i_src
                t_dst_src[i_dst] = t_local_src
                
                current_src_dst_a = i_src_dst_a[i_src]
                if (current_src_dst_a === -1)
                    i_src_dst_a[i_src] = i_src_dst_b[i_src] = i_dst
                else {
                    current_src_dst_b = i_src_dst_b[i_src]
                    if (t_local_src > t_dst_src[current_src_dst_a])
                        i_src_dst_a[i_src] = i_dst
                    else if (current_src_dst_a === current_src_dst_b || t_local_src < t_dst_src[current_src_dst_b])
                        i_src_dst_b[i_src] = i_dst
                }

                w_src_dst[(i_src * n_indices_dst) + i_dst] = 1
                w_dst_src[(i_dst * n_indices_src) + i_src] = 1
            }

            let i_dst_prev: number
            let t_src_prev: number
            let i_src_prev: number

            let i_dst_next: number
            let t_src_next: number
            let i_src_next: number

            let t_src_combination: number

            for (let i_src = 0, i_src_times_n_dst = 0; i_src < n_indices_src; i_src++, i_src_times_n_dst += n_indices_dst) {
                if (i_src_dst_a[i_src] !== -1) continue
                
                for (i_src_prev = i_src - 1, t_src_prev = 0.5, i_dst_prev = -1;
                    i_src_prev >= 0;
                    i_src_prev--, t_src_prev++) {
                    i_dst_prev = i_src_dst_a[i_src_prev]
                    if (i_dst_prev !== -1) {
                        t_src_prev += (1 - t_dst_src[i_dst_prev])
                        break
                    }
                }

                for (i_src_next = i_src + 1, t_src_next = 0.5, i_dst_next = -1;
                    i_src_next < n_indices_src;
                    i_src_next++, t_src_next++) {
                    i_dst_next = i_src_dst_b[i_src_next]
                    if (i_dst_next !== -1) {
                        t_src_next += t_dst_src[i_dst_next]
                        break
                    }
                }

                if (i_dst_prev === -1) {
                    w_dst_src[(i_dst_next * n_indices_src) + i_src] = 1
                    w_src_dst[i_src_times_n_dst + i_dst_next] = 1
                }
                else if (i_dst_next === -1) {
                    w_dst_src[(i_dst_prev * n_indices_src) + i_src] = 1
                    w_src_dst[i_src_times_n_dst + i_dst_prev] = 1
                }
                else {
                    t_src_prev += i_src - i_src_prev
                    t_src_next += i_src_next - i_src
                    t_src_combination = t_src_prev / (t_src_prev + t_src_next)

                    w_dst_src[(i_dst_prev * n_indices_src) + i_src] = t_src_combination
                    w_src_dst[i_src_times_n_dst + i_dst_prev] = t_src_combination

                    t_src_combination = 1 - t_src_combination

                    w_dst_src[(i_dst_next * n_indices_src) + i_src] = t_src_combination
                    w_src_dst[i_src_times_n_dst + i_dst_next] = t_src_combination
                }
            }

            return {
                /** w_src_dst[i, j] = weight from src i to dst j */
                w_src_dst: normalizeMatCols(tf.tensor2d(w_src_dst, [n_indices_src, n_indices_dst])),

                /** w_dst_src[i, j] = weight from dst i to src j */
                w_dst_src: normalizeMatCols(tf.tensor2d(w_dst_src, [n_indices_dst, n_indices_src])),
            }
        }

        let i_tri_other: number
        const src_coords_A = new Int32Array(2 * (w + h))
        const src_coords_B = new Int32Array(2 * (w + h))
        const src_value_A = new Float32Array(w + h)
        const src_value_B = new Float32Array(w + h)
        const dst_coords_A = new Int32Array(2 * (w + h))
        const dst_coords_B = new Int32Array(2 * (w + h))
        const dst_value_A = new Float32Array(w + h)
        const dst_value_B = new Float32Array(w + h)

        const copy_references: Triangle2DMeshTopologyProjectorCopyReferences = {
            inside_to_outside: [],
            outside_to_inside: [],
        }

        function coordsTensor(coords: Int32Array, count: number): tf.Tensor2D {
            const array = new Int32Array(2 * count)
            for (let i = 0; i < count; i++) {
                array[(2 * i) + 1] = coords[(2 * i) + 0]
                array[(2 * i) + 0] = coords[(2 * i) + 1]
            }
            return tf.tensor2d(array, [count, 2])
        }

        function invert(a: Float32Array) {
            const b = new Float32Array(a.length)

            for (let i = 0; i < a.length; i++)
                b[i] = 1 - a[i]

            return b
        }

        const w01 = w1
        const w02 = w2
        const w12 = w2
        const w21 = w1
        const w10 = invert(w1)
        const w20 = invert(w2)

        const triangle_coords = [
            w01, w12, w20,
            w10, w21, w02,
        ]

        function indexOf(x: number, y: number, range = 5) {
            for (let i = 0; i < vertices.length / 2; i++)
                if ((((w * vertices[(2 * i) + 0]) - x) ** 2) +
                    (((h * vertices[(2 * i) + 1]) - y) ** 2) <=
                    range ** 2)
                    return i
            return -1
        }
        indexOf(0, 0)

        function localNeighborhood_index(arr: NumberTypedArray, index: number, margin_x = 5, margin_y = 4) {
            const x = Math.floor(vertices[(2 * index) + 0] * w);
            const y = Math.floor(vertices[(2 * index) + 1] * h);
            return localNeighborhood(arr, x,y,margin_x,margin_y)
        }

        function localNeighborhood(arr: NumberTypedArray, x: number, y: number, margin_x = 5, margin_y = 4) {
            const lines: NumberTypedArray[] = [];

            for (let dy = -margin_y; dy <= margin_y; dy++) {
                const x0 = Math.max(0, x - margin_x);
                const x1 = Math.min(w, x + margin_x + 1);

                if (y + dy >= 0 && y + dy < h) {
                    const c = w * (y + dy);
                    lines.push(arr.subarray(c + x0, c + x1));
                }
                else lines.push(undefined!);
            }

            return lines;
        }

        /** coords for boundary pixels */
        const boundary_coords = new Int32Array(2 * area)
        let boundary_coords_offset = 0
        
        /** texture of boundary values (used for src lines) */
        const boundary_values = new Float32Array(area).fill(-1)

        function mapEdge_initial_1(i_tri: number, vertex_index_a: number, vertex_index_b: number, vertex_index_c: number) {
            external_index_a = edge_external_indices[(2 * i_edge) + 0]
            external_index_b = edge_external_indices[(2 * i_edge) + 1]

            let inverted = false

            if (external_index_a > external_index_b) {
                inverted = true

                tmp = external_index_a
                external_index_a = external_index_b
                external_index_b = tmp

                tmp = vertex_index_a
                vertex_index_a = vertex_index_b
                vertex_index_b = tmp
            }

            edges_map_lookup_buffer_external_indices.writeUInt32LE(external_index_a, 0)
            edges_map_lookup_buffer_external_indices.writeUInt32LE(external_index_b, 4)
            if (!edges_map_B.get(edges_map_lookup_buffer_external_indices, 0, edges_map_lookup_buffer_vertex_and_edge_indices, 0))
                throw new Error("mesh not closed")

            vertex_index_other_a = edges_map_lookup_vertex_edges_indices[0]
            vertex_index_other_b = edges_map_lookup_vertex_edges_indices[1]
            vertex_index_other_c = edges_map_lookup_vertex_edges_indices[2]
            i_edge_other = edges_map_lookup_vertex_edges_indices[3]

            const src_A = triangle_coords[(i_edge % 3) + (inverted ? 3 : 0)]
            const src_B = triangle_coords[(i_edge_other % 3) + (inverted ? 3 : 0)]

            i_tri_other = Math.floor(i_edge_other / 3)

            const src_coords_n_A = triangle_edge_initial(i_tri, src_coords_A, src_value_A, src_A, vertex_index_a, vertex_index_b, vertex_index_c)
            const src_coords_n_B = triangle_edge_initial(i_tri_other, src_coords_B, src_value_B, src_B, vertex_index_other_a, vertex_index_other_b, vertex_index_other_c)

            function traceCoords(result: NumberTypedArray, coords: Int32Array, values: Float32Array | number, n_coords: number) {
                coords_offset = 0
                if (values instanceof Float32Array) {
                    for (let i = 0; i < n_coords; i++) {
                        x_i = coords[coords_offset++]
                        y_i = coords[coords_offset++]
                        c_i = (y_i * w) + x_i

                        result[c_i] = values[i]
                    }
                }
                else {
                    for (let i = 0; i < n_coords; i++) {
                        x_i = coords[coords_offset++]
                        y_i = coords[coords_offset++]
                        c_i = (y_i * w) + x_i

                        result[c_i] = values
                    }
                }
            }

            traceCoords(boundary_values, src_coords_A, src_value_A, src_coords_n_A)
            traceCoords(boundary_values, src_coords_B, src_value_B, src_coords_n_B)

            traceCoords(tri_edges, src_coords_A, i_edge, src_coords_n_A)
            traceCoords(tri_edges, src_coords_B, i_edge_other, src_coords_n_B)
        }

        function mapEdge_final_1(i_tri: number, vertex_index_a: number, vertex_index_b: number, vertex_index_c: number) {
            external_index_a = edge_external_indices[(2 * i_edge) + 0]
            external_index_b = edge_external_indices[(2 * i_edge) + 1]

            if (external_index_a > external_index_b) {
                tmp = external_index_a
                external_index_a = external_index_b
                external_index_b = tmp

                tmp = vertex_index_a
                vertex_index_a = vertex_index_b
                vertex_index_b = tmp
            }

            edges_map_lookup_buffer_external_indices.writeUInt32LE(external_index_a, 0)
            edges_map_lookup_buffer_external_indices.writeUInt32LE(external_index_b, 4)
            if (!edges_map_B.get(edges_map_lookup_buffer_external_indices, 0, edges_map_lookup_buffer_vertex_and_edge_indices, 0))
                throw new Error("mesh not closed")

            vertex_index_other_a = edges_map_lookup_vertex_edges_indices[0]
            vertex_index_other_b = edges_map_lookup_vertex_edges_indices[1]
            vertex_index_other_c = edges_map_lookup_vertex_edges_indices[2]
            i_edge_other = edges_map_lookup_vertex_edges_indices[3]

            // const src_A = triangle_coords[(i_edge % 3) + (inverted ? 3 : 0)]
            // const src_B = triangle_coords[(i_edge_other % 3) + (inverted ? 3 : 0)]

            const src_A = boundary_values
            const src_B = boundary_values

            // i_tri_other = Math.floor(i_edge_other / 3)

            const src_coords_n_A = triangle_edge_final(i_edge, src_coords_A, src_value_A, src_A, vertex_index_a, vertex_index_b)
            const src_coords_n_B = triangle_edge_final(i_edge_other, src_coords_B, src_value_B, src_B, vertex_index_other_a, vertex_index_other_b)

            if (Math.random() < 0) {
                localNeighborhood_index(tri, vertex_index_a)
                localNeighborhood(tri, 0, 0)
            }
            
            if (src_coords_n_A === 0 || src_coords_n_B === 0) return

            const dst_coords_n_A = diffuse(src_coords_A, src_coords_n_A, src_value_A, dst_coords_A, dst_value_A)
            const dst_coords_n_B = diffuse(src_coords_B, src_coords_n_B, src_value_B, dst_coords_B, dst_value_B)

            if (dst_coords_n_A === 0 || dst_coords_n_B === 0) return

            const mappings_AB = dst_map_src(src_value_A, src_coords_n_A, dst_value_B, dst_coords_n_B)
            const mappings_BA = dst_map_src(src_value_B, src_coords_n_B, dst_value_A, dst_coords_n_A)

            const src_coords_tensor_A = coordsTensor(src_coords_A, src_coords_n_A)
            const src_coords_tensor_B = coordsTensor(src_coords_B, src_coords_n_B)

            const dst_coords_tensor_A = coordsTensor(dst_coords_A, dst_coords_n_A)
            const dst_coords_tensor_B = coordsTensor(dst_coords_B, dst_coords_n_B)

            copy_references.inside_to_outside.push({
                indices: {
                    src: src_coords_tensor_A,
                    dst: dst_coords_tensor_B
                },
                weights: mappings_AB.w_src_dst
            })

            copy_references.inside_to_outside.push({
                indices: {
                    src: src_coords_tensor_B,
                    dst: dst_coords_tensor_A
                },
                weights: mappings_BA.w_src_dst
            })

            copy_references.outside_to_inside.push({
                indices: {
                    src: dst_coords_tensor_A,
                    dst: src_coords_tensor_B
                },
                weights: mappings_BA.w_dst_src
            })

            copy_references.outside_to_inside.push({
                indices: {
                    src: dst_coords_tensor_B,
                    dst: src_coords_tensor_A
                },
                weights: mappings_AB.w_dst_src
            })
        }

        const cvs = document.createElement('canvas')
        cvs.width = w
        cvs.height = h
        const ctx = cvs.getContext('2d')!
        ctx.lineWidth = 1
        ctx.strokeStyle = '#fff'
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, w, h)

        function colorFromID(id: number) {
            const r = cyrb53(id.toString())
            const g = cyrb53(id.toString())
            const b = cyrb53(id.toString())

            return `rgb(${r & 0xFF}, ${g & 0xFF}, ${b & 0xFF})`
        }

        function drawLine(a: number, b: number, id: number) {
            const a_x = w * vertices[(2 * a) + 0]
            const a_y = h * vertices[(2 * a) + 1]

            const b_x = w * vertices[(2 * b) + 0]
            const b_y = h * vertices[(2 * b) + 1]

            ctx.strokeStyle = colorFromID(id)
            ctx.moveTo(a_x, a_y)
            ctx.lineTo(b_x, b_y)
            ctx.stroke()
        }

        function mapEdge_initial(i_tri: number, vertex_index_a: number, vertex_index_b: number, vertex_index_c: number) {
            if (edges_indices_island[i_edge] === 1) {
                mapEdge_initial_1(i_tri, vertex_index_a, vertex_index_b, vertex_index_c)
            }

            i_edge++
        }

        function mapEdge_final(i_tri: number, vertex_index_a: number, vertex_index_b: number, vertex_index_c: number) {
            if (edges_indices_island[i_edge] === 1) {
                external_index_a = edge_external_indices[(2 * i_edge) + 0]
                external_index_b = edge_external_indices[(2 * i_edge) + 1]

                if (external_index_a > external_index_b) {
                    tmp = external_index_a
                    external_index_a = external_index_b
                    external_index_b = tmp

                    // tmp = vertex_index_a
                    // vertex_index_a = vertex_index_b
                    // vertex_index_b = tmp
                }

                edges_map_lookup_buffer_external_indices.writeUint32LE(external_index_a, 0)
                edges_map_lookup_buffer_external_indices.writeUint32LE(external_index_b, 4)

                edges_map_A.get(edges_map_lookup_buffer_external_indices, 0, edges_map_lookup_buffer_vertex_and_edge_indices, 0)
                drawLine(
                    edges_map_lookup_vertex_edges_indices[0],
                    edges_map_lookup_vertex_edges_indices[1],
                    i_edge
                )

                edges_map_B.get(edges_map_lookup_buffer_external_indices, 0, edges_map_lookup_buffer_vertex_and_edge_indices, 0)
                drawLine(
                    edges_map_lookup_vertex_edges_indices[0],
                    edges_map_lookup_vertex_edges_indices[1],
                    i_edge
                )

                mapEdge_final_1(i_tri, vertex_index_a, vertex_index_b, vertex_index_c)
            }

            i_edge++
        }

        i_index = 0
        for (let i_tri = 0; i_tri < n_tri; i_tri++) {
            triangle_index_a = i_index++
            triangle_index_b = i_index++
            triangle_index_c = i_index++

            vertices_index_a = triangles[triangle_index_a]
            vertices_index_b = triangles[triangle_index_b]
            vertices_index_c = triangles[triangle_index_c]

            mapEdge_initial(i_tri, vertices_index_a, vertices_index_b, vertices_index_c)
            mapEdge_initial(i_tri, vertices_index_b, vertices_index_c, vertices_index_a)
            mapEdge_initial(i_tri, vertices_index_c, vertices_index_a, vertices_index_b)
        }

        for (y_i = 0, c_i = 0; y_i < h; y_i++) {
            for (x_i = 0; x_i < w; x_i++, c_i++) {
                if (!invalid[c_i]) {
                    if ((x_i === 0) || (x_i > 0 && invalid[c_i - 1]) ||
                        (x_i === w_minus_1) || (x_i < w_minus_1 && invalid[c_i + 1]) ||
                        (y_i === 0) || (y_i > 0 && invalid[c_i - w]) ||
                        (y_i === h_minus_1) || (y_i < h_minus_1 && invalid[c_i + w])) {
                        boundary_coords[boundary_coords_offset++] = x_i
                        boundary_coords[boundary_coords_offset++] = y_i
                    }
                }
            }
        }

        renderTensor(tf.tensor2d(boundary_values, [h, w]), 1, 'boundary_values_initial')
        renderTensor(<tf.Tensor2D>tf.scatterND(coordsTensor(boundary_coords, boundary_coords_offset / 2), new Int32Array(boundary_coords_offset / 2).fill(1), [h, w]), 1, 'boundary')
        let boundary_accounted: boolean
        let boundary_coords_offset1: number
        let c1_i: number
        do {
            boundary_accounted = true
            boundary_coords_offset1 = 0

            while (boundary_coords_offset1 < boundary_coords_offset) {
                x_i = boundary_coords[boundary_coords_offset1++]
                y_i = boundary_coords[boundary_coords_offset1++]
                c_i = (y_i * w) + x_i
                
                if (boundary_values[c_i] === -1) {
                    if (x_i > 0 && y_i > 0 && boundary_values[c_i - w - 1] !== -1) 
                        c1_i = c_i - w - 1
                    else if (y_i > 0 && boundary_values[c_i - w] !== -1)
                        c1_i = c_i - w
                    else if (x_i < w_minus_1 && y_i > 0 && boundary_values[c_i - w + 1] !== -1)
                        c1_i = c_i - w + 1
                    else if (x_i > 0 && boundary_values[c_i - 1] !== -1)
                        c1_i = c_i - 1
                    else if (x_i < w_minus_1 && boundary_values[c_i + 1] !== -1)
                        c1_i = c_i + 1
                    else if (x_i > 0 && y_i < h_minus_1 && boundary_values[c_i + w - 1] !== -1)
                        c1_i = c_i + w - 1
                    else if (y_i < h_minus_1 && boundary_values[c_i + w] !== -1)
                        c1_i = c_i + w
                    else if (x_i < w_minus_1 && y_i < h_minus_1 && boundary_values[c_i + w + 1] !== -1)
                        c1_i = c_i + w + 1
                    else {
                        boundary_accounted = false
                        continue
                    }

                    tri_edges[c_i] = tri_edges[c1_i]
                    tri[c_i] = tri[c1_i]
                    if (boundary_values[c1_i] > 0.5)
                        boundary_values[c_i] = 1 - ((1 - boundary_values[c1_i]) / 2)
                    else
                        boundary_values[c_i] = boundary_values[c1_i] / 2
                }
            }
        } while (!boundary_accounted)
        renderTensor(tf.tensor2d(boundary_values, [h, w]), 1, 'boundary_values_final')

        i_edge = 0
        i_index = 0
        for (let i_tri = 0; i_tri < n_tri; i_tri++) {
            triangle_index_a = i_index++
            triangle_index_b = i_index++
            triangle_index_c = i_index++

            vertices_index_a = triangles[triangle_index_a]
            vertices_index_b = triangles[triangle_index_b]
            vertices_index_c = triangles[triangle_index_c]

            mapEdge_final(i_tri, vertices_index_a, vertices_index_b, vertices_index_c)
            mapEdge_final(i_tri, vertices_index_b, vertices_index_c, vertices_index_a)
            mapEdge_final(i_tri, vertices_index_c, vertices_index_a, vertices_index_b)
        }

        const mask = <tf.Tensor2D>tf.tensor2d(invalid, shape, 'bool').logicalNot()

        const edges_outside = tf.tidy(() => {
            let x = <tf.Tensor2D>tf.zeros(mask.shape)
            for (const { indices } of copy_references.inside_to_outside)
                x = <tf.Tensor2D>tf.tensorScatterUpdate(x, indices.dst, tf.broadcastTo(1, [indices.dst.shape[0]]))
            return x
        })

        const edges_inside = tf.tidy(() => {
            let x = <tf.Tensor2D>tf.zeros(mask.shape)
            for (const { indices } of copy_references.inside_to_outside)
                x = <tf.Tensor2D>tf.tensorScatterUpdate(x, indices.src, tf.broadcastTo(1, [indices.src.shape[0]]))
            return x
        })

        renderTensor(edges_outside, 1, "edges_o")
        renderTensor(edges_inside, 1, "edges_i")

        edges_outside.dispose()
        edges_inside.dispose()

        fs.writeFileSync("output-textures/edges_lines.png", (<any>cvs).toBuffer())

        return new Triangle2DMeshTopologyProjector(this, shape, copy_references, mask)
    }
}

export class Triangle2DMeshTopologyProjector
    implements FieldPointTensorTopologyProjector<tf.Rank.R2> {
    readonly mask = tf.tensorScatterUpdate(
        this.inside,
        this.copy_references.inside_to_outside.length > 0 ?
            tf.concat(this.copy_references.inside_to_outside.map(({ indices }) => indices.dst), 0) :
            tf.tensor2d([], [0, 2], 'int32'),
        this.copy_references.inside_to_outside.length > 0 ?
            tf.scalar(true).broadcastTo([
                this.copy_references.inside_to_outside
                    .map(({ indices }) => indices.dst.shape[0])
                    .reduce((acc, length) => acc + length, 0)
            ]) :
            tf.tensor1d([], 'bool')
    )
    
    private readonly outside: tf.Tensor2D
    private readonly divisor_outside: tf.Tensor2D

    constructor(
        public readonly projector: Triangle2DMeshTopologyProjectorFactory,
        public readonly shape: [h: number, w: number],
        public readonly copy_references: Triangle2DMeshTopologyProjectorCopyReferences,
        public readonly inside: tf.Tensor2D,
    ) {
        this.divisor_outside = tf.tidy(() => project_copy(tf.where<tf.Tensor2D>(this.inside, 1, 0), copy_references.inside_to_outside))
        this.outside = tf.tidy(() => this.divisor_outside.notEqual(0))
        renderTensor(this.divisor_outside, 10, 'divisorOutside')
        renderTensor(this.outside, 1, 'outside')

        tf.tidy(() => {
            for (const { indices } of copy_references.inside_to_outside) {
                const x = tf.gatherND(this.inside, indices.dst)
                if (x.sum(0).dataSync()[0] > 0) {
                    console.error("")
                }
            }

            for (const { indices } of copy_references.outside_to_inside) {
                const x = tf.gatherND(this.inside, indices.dst)
                if (x.sum(0).dataSync()[0] === 0 && indices.dst.shape[1] !== 0) {
                    console.error("")
                }
            }
        })
    }

    project_delta(t: tf.Tensor2D): tf.Tensor2D {
        renderTensor(t, 1.5, 't_delta')
        return t.add(project_copy(<tf.Tensor2D>tf.where(this.outside, t.divNoNan(this.divisor_outside), t), this.copy_references.outside_to_inside))
    }

    project_update(t: tf.Tensor2D): tf.Tensor2D {
        renderTensor(t, 1.5, 't_update')
        const projected = project_copy(t, this.copy_references.inside_to_outside)
        renderTensor(projected, 1.5, 'projected')
        const projectedScaled = <tf.Tensor2D>projected.divNoNan(this.divisor_outside)
        renderTensor(projectedScaled, 1.5, 'projectedScaled')
        return t.where(this.inside, projectedScaled)
    }
}