import { Vec2 } from "playcanvas-extended";
import { FieldPointTensorTopologyProjectorFactory, FieldPointTensorTopologyProjector } from "../tensor/topology.js";
import * as tf from "@tensorflow/tfjs"
import { Triangles2DMesh } from "./mesh.js";
import { Triangles2DMeshCollider } from "./collider.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import HashTable from "@ronomon/hash-table";
import { renderTensor } from "../../utils/tf-img.js";
import * as fs from 'fs'

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
                const src_values = tf.gatherND(t, indices.src).expandDims(1)
                const update_values = weights.matMul(src_values, true, false).as1D()
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
        const w0 = new Float32Array(w1.length)

        for (let i = 0; i < w0.length; i++)
            w0[i] = 1 - (w1[i] + w2[i])

        const n_triangle_edges = triangles.length

        const edges_map_lookup_buffer_external_indices = Buffer.alloc(2 * 4)
        const edges_map_lookup_buffer_vertex_and_edge_indices = Buffer.alloc(3 * 4)
        
        /** stored before swapping order */
        const edge_external_indices = new Uint32Array(2 * n_triangle_edges)

        /** external index -> vertex indices A/B, edge index */
        const edges_map_A = new HashTable(edges_map_lookup_buffer_external_indices.byteLength, edges_map_lookup_buffer_vertex_and_edge_indices.byteLength, n_triangle_edges, n_triangle_edges)
        const edges_map_B = new HashTable(edges_map_lookup_buffer_external_indices.byteLength, edges_map_lookup_buffer_vertex_and_edge_indices.byteLength, n_triangle_edges, n_triangle_edges)
        
        /** 0 = shared, 1/2 = distinct */
        const edges_indices_island = new Uint8Array(n_triangle_edges)

        let i_edge = 0

        let vertex_index_other_a: number,
            vertex_index_other_b: number,
            i_edge_other: number

        let tmp: number
        
        function iterateEdge(
                vertex_index_a: number, vertex_index_b: number,
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
                vertex_index_other_a = edges_map_lookup_buffer_vertex_and_edge_indices.readUint32LE(0)
                vertex_index_other_b = edges_map_lookup_buffer_vertex_and_edge_indices.readUint32LE(4)
                i_edge_other = edges_map_lookup_buffer_vertex_and_edge_indices.readUint32LE(8)

                if (edges_map_B.exist(edges_map_lookup_buffer_external_indices, 0))
                    throw new Error("same edge shared by > 2 triangles")
                
                if (vertex_index_other_a !== vertex_index_a || vertex_index_other_b !== vertex_index_b) {
                    edges_indices_island[i_edge] = 2

                    edges_map_lookup_buffer_vertex_and_edge_indices.writeUint32LE(vertex_index_a, 0)
                    edges_map_lookup_buffer_vertex_and_edge_indices.writeUint32LE(vertex_index_b, 4)
                    edges_map_lookup_buffer_vertex_and_edge_indices.writeUint32LE(i_edge, 8)
                    edges_map_B.set(edges_map_lookup_buffer_external_indices, 0, edges_map_lookup_buffer_vertex_and_edge_indices, 0)
                }
                else {
                    edges_indices_island[i_edge_other] = 0
                }
            }
            else {
                edges_indices_island[i_edge] = 1

                edges_map_lookup_buffer_vertex_and_edge_indices.writeUint32LE(vertex_index_a, 0)
                edges_map_lookup_buffer_vertex_and_edge_indices.writeUint32LE(vertex_index_b, 4)
                edges_map_lookup_buffer_vertex_and_edge_indices.writeUint32LE(i_edge, 8)
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

            iterateEdge(vertices_index_a, vertices_index_b, external_index_a, external_index_b)
            iterateEdge(vertices_index_b, vertices_index_c, external_index_b, external_index_c)
            iterateEdge(vertices_index_c, vertices_index_a, external_index_c, external_index_a)
        }

        i_edge = 0

        const area = w * h
        const w_minus_2 = w - 2

        let x_a: number
        let y_a: number
        let c_a: number

        let x_b: number
        let y_b: number
        let c_b: number

        enum Direction {
            Invalid = 0,
            NW = 0x1,
            N = 0x2,
            NE = 0x3,
            W = 0x4,
            E = 0x5,
            SW = 0x6,
            S = 0x7,
            SE = 0x8,

            X_greaterEqual = 0x10,
            Y_greaterEqual = 0x20,

            NNE = NE | Y_greaterEqual,
            NEE = NE | X_greaterEqual,
            SEE = SE | X_greaterEqual,
            SSE = SE | Y_greaterEqual,
            SSW = SW | Y_greaterEqual,
            SWW = SW | X_greaterEqual,
            NWW = NW | X_greaterEqual,
            NNW = NW | Y_greaterEqual,
        }

        let ax: number
        let ay: number
        let ac: number
        let ad: Direction

        function direction(dx: number, dy: number): Direction {
            ax = Math.sign(dx)
            ay = Math.sign(dy)

            switch ((3 * (ay + 1)) + (ax + 1)) {
                case 0:
                    ad = Direction.NW
                    break
                case 1:
                    ad = Direction.N
                    break
                case 2:
                    ad = Direction.NE
                    break
                case 3:
                    ad = Direction.W
                    break
                case 4:
                    return Direction.Invalid
                case 5:
                    ad = Direction.E
                    break
                case 6:
                    ad = Direction.SW
                    break
                case 7:
                    ad = Direction.S
                    break
                case 8:
                    ad = Direction.SE
                    break
            }

            ac = (dx / ax) / (dy / ay)

            if (ax === 0 || ay === 0)
                return ad
            else return ad | (
                (ac >= 1 ? Direction.X_greaterEqual : 0) |
                (ac <= 1 ? Direction.Y_greaterEqual : 0)
            )
        }
        
        let coords_n: number
        let coords_offset: number
        
        let triangle_edge_direction: Direction

        let dx0: number
        let dy0: number
        let dc0: number
        
        let dx1: number
        let dy1: number
        let dc1: number

        let dx2a: number
        let dy2a: number
        let dc2a: number

        let dx2b: number
        let dy2b: number
        let dc2b: number

        const dc_N = -w
        const dc_S = +w
        const dc_E = +1
        const dc_W = -1

        const dc_NE = dc_N + dc_E
        const dc_SE = dc_S + dc_E
        const dc_SW = dc_S + dc_W
        const dc_NW = dc_N + dc_W

        const dx_N = 0
        const dy_N = -1

        const dx_E = +1
        const dy_E = 0

        const dx_S = 0
        const dy_S = +1

        const dx_W = -1
        const dy_W = 0

        const dx_NE = dx_N + dx_E
        const dy_NE = dy_N + dy_E

        const dx_SE = dx_S + dx_E
        const dy_SE = dy_S + dy_E

        const dx_SW = dx_S + dx_W
        const dy_SW = dy_S + dy_W

        const dx_NW = dx_N + dx_W
        const dy_NW = dy_N + dy_W

        function triangle_edge(
            tri_i: number,
            coords: Int32Array,
            values: Float32Array,
            bitmap_value: Float32Array,
            vertex_index_a: number, vertex_index_b: number,
        ): number {
            vertex_index_a *= 2
            vertex_index_b *= 2

            x_a = vertices[vertex_index_a++]
            y_a = vertices[vertex_index_a]

            x_b = vertices[vertex_index_b++]
            y_b = vertices[vertex_index_b]

            triangle_edge_direction = direction(x_b - x_a, y_b - y_a)

            x_a = Math.floor(x_a * w)
            y_a = Math.floor(y_a * h)
            c_a = (y_a * w) + x_a

            switch (triangle_edge_direction) {
                case Direction.N:
                    dx0 = dx1 = dx_N
                    dy0 = dy1 = dy_N
                    dc0 = dc1 = dc_N

                    dx2a = dx_E
                    dy2a = dy_E
                    dc2a = dc_E

                    dx2b = dx_W
                    dy2b = dy_W
                    dc2b = dc_W

                    break
                
                case Direction.NNE:
                    dx0 = dx_N
                    dy0 = dy_N
                    dc0 = dc_N

                    dx1 = dx_NE
                    dy1 = dy_NE
                    dc1 = dc_NE

                    dx2a = dx2b = dx_E
                    dy2a = dy2b = dy_E
                    dc2a = dc2b = dc_E
                    
                    break
                
                case Direction.NE:
                    dx0 = dx1 = dx_NE
                    dy0 = dy1 = dy_NE
                    dc0 = dc1 = dc_NE

                    dx2a = dx_N
                    dy2a = dy_N
                    dc2a = dc_N

                    dx2b = dx_E
                    dy2b = dy_E
                    dc2b = dc_E
                    
                    break
                
                case Direction.NEE:
                    dx0 = dx_E
                    dy0 = dy_E
                    dc0 = dc_E

                    dx1 = dx_NE
                    dy1 = dy_NE
                    dc1 = dc_NE

                    dx2a = dx2b = dx_N
                    dy2a = dy2b = dy_N
                    dc2a = dc2b = dc_N
                    
                    break
                
                case Direction.E:
                    dx0 = dx1 = dx_E
                    dy0 = dy1 = dy_E
                    dc0 = dc1 = dc_E

                    dx2a = dx_S
                    dy2a = dy_S
                    dc2a = dc_S

                    dx2b = dx_N
                    dy2b = dy_N
                    dc2b = dc_N

                    break
                
                case Direction.SEE:
                    dx0 = dx_E
                    dy0 = dy_E
                    dc0 = dc_E

                    dx1 = dx_SE
                    dy1 = dy_SE
                    dc1 = dc_SE

                    dx2a = dx2b = dx_S
                    dy2a = dy2b = dy_S
                    dc2a = dc2b = dc_S
                    
                    break
                
                case Direction.SE:
                    dx0 = dx1 = dx_SE
                    dy0 = dy1 = dy_SE
                    dc0 = dc1 = dc_SE

                    dx2a = dx_S
                    dy2a = dy_S
                    dc2a = dc_S

                    dx2b = dx_E
                    dy2b = dy_E
                    dc2b = dc_E
                    
                    break
                
                case Direction.SSE:
                    dx0 = dx_S
                    dy0 = dy_S
                    dc0 = dc_S

                    dx1 = dx_SE
                    dy1 = dy_SE
                    dc1 = dc_SE

                    dx2a = dx2b = dx_E
                    dy2a = dy2b = dy_E
                    dc2a = dc2b = dc_E
                    
                    break
                
                case Direction.S:
                    dx0 = dx1 = dx_S
                    dy0 = dy1 = dy_S
                    dc0 = dc1 = dc_S

                    dx2a = dx_W
                    dy2a = dy_W
                    dc2a = dc_W

                    dx2b = dx_E
                    dy2b = dy_E
                    dc2b = dc_E

                    break
                
                case Direction.SSW:
                    dx0 = dx_S
                    dy0 = dy_S
                    dc0 = dc_S

                    dx1 = dx_SW
                    dy1 = dy_SW
                    dc1 = dc_SW

                    dx2a = dx2b = dx_W
                    dy2a = dy2b = dy_W
                    dc2a = dc2b = dc_W
                    
                    break
                
                case Direction.SW:
                    dx0 = dx1 = dx_SW
                    dy0 = dy1 = dy_SW
                    dc0 = dc1 = dc_SW

                    dx2a = dx_S
                    dy2a = dy_S
                    dc2a = dc_S

                    dx2b = dx_W
                    dy2b = dy_W
                    dc2b = dc_W
                    
                    break
                
                case Direction.SWW:
                    dx0 = dx_W
                    dy0 = dy_W
                    dc0 = dc_W

                    dx1 = dx_SW
                    dy1 = dy_SW
                    dc1 = dc_SW

                    dx2a = dx2b = dx_S
                    dy2a = dy2b = dy_S
                    dc2a = dc2b = dc_S
                    
                    break
                
                case Direction.W:
                    dx0 = dx1 = dx_W
                    dy0 = dy1 = dy_W
                    dc0 = dc1 = dc_W

                    dx2a = dx_N
                    dy2a = dy_N
                    dc2a = dc_N

                    dx2b = dx_S
                    dy2b = dy_S
                    dc2b = dc_S
                    
                    break
                
                case Direction.NWW:
                    dx0 = dx_W
                    dy0 = dy_W
                    dc0 = dc_W

                    dx1 = dx_NW
                    dy1 = dy_NW
                    dc1 = dc_NW

                    dx2a = dx2b = dx_N
                    dy2a = dy2b = dy_N
                    dc2a = dc2b = dc_N
                    
                    break
                
                case Direction.NW:
                    dx0 = dx1 = dx_NW
                    dy0 = dy1 = dy_NW
                    dc0 = dc1 = dc_NW

                    dx2a = dx_N
                    dy2a = dy_N
                    dc2a = dc_N

                    dx2b = dx_W
                    dy2b = dy_W
                    dc2b = dc_W
                    
                    break
                
                case Direction.NNW:
                    dx0 = dx_N
                    dy0 = dy_N
                    dc0 = dc_N

                    dx1 = dx_NW
                    dy1 = dy_NW
                    dc1 = dc_NW

                    dx2a = dx2b = dx_W
                    dy2a = dy2b = dy_W
                    dc2a = dc2b = dc_W
                    
                    break
                
                default:
                    throw new Error()
            }

            coords_n = 0
            coords_offset = 0
            
            if (tri[c_a] !== tri_i) {
                x_b = x_a + dx0
                y_b = y_a + dy0
                c_b = c_a + dc0
        
                if (x_b >= 0 && x_b < w && y_b >= 0 && y_b < h && tri[c_b] === tri_i) {
                    x_a = x_b
                    y_a = y_b
                    c_a = c_b
                }
                else {
                    x_b = x_a + dx1
                    y_b = y_a + dy1
                    c_b = c_a + dc1
            
                    if (x_b >= 0 && x_b < w && y_b >= 0 && y_b < h && tri[c_b] === tri_i) {
                        x_a = x_b
                        y_a = y_b
                        c_a = c_b
                    }
                    else {
                        x_b = x_a + dx2a
                        y_b = y_a + dy2a
                        c_b = c_a + dc2a
            
                        if (x_b >= 0 && x_b < w && y_b >= 0 && y_b < h && tri[c_b] === tri_i) {
                            x_a = x_b
                            y_a = y_b
                            c_a = c_b
                        }
                        else if (dc2b !== dc2a) {
                            x_b = x_a + dx2b
                            y_b = y_a + dy2b
                            c_b = c_a + dc2b
                
                            if (x_b >= 0 && x_b < w && y_b >= 0 && y_b < h && tri[c_b] === tri_i) {
                                x_a = x_b
                                y_a = y_b
                                c_a = c_b
                            }
                            else {
                                return 0
                            }
                        }
                        else {
                            return 0
                        }
                    }
                }
            }

            while (true) {
                coords[coords_offset++] = x_a
                coords[coords_offset++] = y_a
                values[coords_n++] = bitmap_value[c_a]

                x_b = x_a + dx0
                y_b = y_a + dy0
                c_b = c_a + dc0
            
                if (x_b >= 0 && x_b < w && y_b >= 0 && y_b < h && tri[c_b] === tri_i) {
                    x_a = x_b
                    y_a = y_b
                    c_a = c_b
                }
                else if (dc1 !== dc0) {
                    x_b = x_a + dx1
                    y_b = y_a + dy1
                    c_b = c_a + dc1
                
                    if (x_b >= 0 && x_b < w && y_b >= 0 && y_b < h && tri[c_b] === tri_i) {
                        x_a = x_b
                        y_a = y_b
                        c_a = c_b
                    }
                    else {
                        break
                    }
                }
                else {
                    break
                }
            }

            return coords_n
        }

        const diffuse_buffer = new Float32Array(area)
        const diffuse_count = new Uint8Array(area)

        /** @returns number of diffused elements */
        function diffuse(
                mask: Uint8Array,
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
                    if (mask[line_1D] !== 0) {
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
                    if (mask[line_1D] !== 0) {
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
                    if (mask[line_1D] !== 0) {
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
                    if (mask[line_1D] !== 0) {
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
                line_1D += 2
                if (line_1D < area && x <= w_minus_2) {
                    if (mask[line_1D] !== 0) {
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
                    if (mask[line_1D] !== 0) {
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
                    if (mask[line_1D] !== 0) {
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
                    if (mask[line_1D] !== 0) {
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

        // function normalizeMatRows(m: tf.Tensor2D): tf.Tensor2D {
        //     return m.divNoNan(m.sum(1, true))
        // }

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
                    t_src_combination = (i_src - t_src_prev) / (t_src_next - t_src_prev)

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

        const triangle_coords = [w0, w1, w2]

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

        function mapEdge_1(i_tri: number, vertex_index_a: number, vertex_index_b: number) {
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
            edges_map_B.get(edges_map_lookup_buffer_external_indices, 0, edges_map_lookup_buffer_vertex_and_edge_indices, 0)

            vertex_index_other_a = edges_map_lookup_buffer_vertex_and_edge_indices.readUInt32LE(0)
            vertex_index_other_b = edges_map_lookup_buffer_vertex_and_edge_indices.readUInt32LE(4)
            i_edge_other = edges_map_lookup_buffer_vertex_and_edge_indices.readUInt32LE(8)

            const src_A = triangle_coords[i_edge % 3]
            const src_B = triangle_coords[i_edge_other % 3]

            i_tri_other = Math.floor(i_edge_other / 3)

            const src_coords_n_A = triangle_edge(i_tri, src_coords_A, src_value_A, src_A, vertex_index_a, vertex_index_b)
            const src_coords_n_B = triangle_edge(i_tri_other, src_coords_B, src_value_B, src_B, vertex_index_other_a, vertex_index_other_b)

            if (src_coords_n_A === 0 || src_coords_n_B === 0) return

            const dst_coords_n_A = diffuse(invalid, src_coords_A, src_coords_n_A, src_value_A, dst_coords_A, dst_value_A)
            const dst_coords_n_B = diffuse(invalid, src_coords_B, src_coords_n_B, src_value_B, dst_coords_B, dst_value_B)

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

        function drawLine(a: number, b: number) {
            const a_x = w * vertices[(2 * a) + 0]
            const a_y = h * vertices[(2 * a) + 1]

            const b_x = w * vertices[(2 * b) + 0]
            const b_y = h * vertices[(2 * b) + 1]

            ctx.moveTo(a_x, a_y)
            ctx.lineTo(b_x, b_y)
            ctx.stroke()
        }

        function mapEdge(i_tri: number, vertex_index_a: number, vertex_index_b: number) {
            if (edges_indices_island[i_edge] === 1) {
                external_index_a = edge_external_indices[(2 * i_edge) + 0]
                external_index_b = edge_external_indices[(2 * i_edge) + 1]

                edges_map_lookup_buffer_external_indices.writeUint32LE(external_index_a, 0)
                edges_map_lookup_buffer_external_indices.writeUint32LE(external_index_b, 4)

                edges_map_A.get(edges_map_lookup_buffer_external_indices, 0, edges_map_lookup_buffer_vertex_and_edge_indices, 0)
                drawLine(
                    edges_map_lookup_buffer_vertex_and_edge_indices.readUint32LE(0),
                    edges_map_lookup_buffer_vertex_and_edge_indices.readUint32LE(4)
                )

                edges_map_B.get(edges_map_lookup_buffer_external_indices, 0, edges_map_lookup_buffer_vertex_and_edge_indices, 0)
                drawLine(
                    edges_map_lookup_buffer_vertex_and_edge_indices.readUint32LE(0),
                    edges_map_lookup_buffer_vertex_and_edge_indices.readUint32LE(4)
                )

                mapEdge_1(i_tri, vertex_index_a, vertex_index_b)
            }

            i_edge++
        }

        let i_index = 0
        const n_tri = n_triangle_edges / 3
        for (let i_tri = 0; i_tri < n_tri; i_tri++) {
            triangle_index_a = i_index++
            triangle_index_b = i_index++
            triangle_index_c = i_index++

            vertices_index_a = triangles[triangle_index_a]
            vertices_index_b = triangles[triangle_index_b]
            vertices_index_c = triangles[triangle_index_c]

            mapEdge(i_tri, vertices_index_a, vertices_index_b)
            mapEdge(i_tri, vertices_index_b, vertices_index_c)
            mapEdge(i_tri, vertices_index_c, vertices_index_a)
        }

        const mask = <tf.Tensor2D>tf.tensor2d(invalid, shape, 'bool').logicalNot()

        const edges_outside = tf.tidy(() => {
            let x = <tf.Tensor2D>tf.zeros(mask.shape)
            for (const { indices } of copy_references.inside_to_outside)
                x = <tf.Tensor2D>tf.tensorScatterUpdate(x, indices.dst, tf.broadcastTo(1, [indices.dst.shape[0]]))
            return x
        })

        renderTensor(edges_outside, 1, `edges_${Math.floor(Math.random()*100).toString().padStart(3, '0')}`)

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
    
    constructor(
        public readonly projector: Triangle2DMeshTopologyProjectorFactory,
        public readonly shape: [h: number, w: number],
        public readonly copy_references: Triangle2DMeshTopologyProjectorCopyReferences,
        public readonly inside: tf.Tensor2D,
    ) {
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
        return t.add(project_copy(t, this.copy_references.outside_to_inside))
    }

    project_update(t: tf.Tensor2D): tf.Tensor2D {
        return t.where(this.inside, project_copy(t, this.copy_references.inside_to_outside))
    }
}