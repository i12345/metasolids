import { IndicesArray, indicesArrayType } from "../../../utils/indices-array.js"
import { VolumeLocation } from "../../../volumes/index.js"
import { MeshRendererShared } from "./renderer.js"

export class MeshDecimationShared<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    /** quality -> indices */
    private readonly cache = new Map<number, MeshDecimationIndividual["indices"]>()

    constructor(public readonly renderer: MeshRendererShared<VolumeLocationT>) {
    }

    cached(quality: number) {
        return this.cache.get(quality) ?? this.addCached(quality)
    }

    private addCached(quality: number) {
        const cached = this.computeCache(quality)
        this.cache.set(quality, cached)
        return cached
    }

    private computeCache(quality: number) {
        const meshData = this.renderer.renderer.meshData
        const UVunwrapping = this.renderer.renderer.surfaceUVUnwrapping

        if (quality === 1) {
            const n_original = meshData.vertices.length
            const n_unwrapped = n_original + (UVunwrapping?.duplicatedVerts.length ?? 0)
            const n_final = n_unwrapped

            const indices: MeshDecimationIndividual["indices"] = {
                vertices_final: new (indicesArrayType(n_unwrapped))(n_final),
                vertices_original: new (indicesArrayType(n_original))(n_final),
                triangles: UVunwrapping?.finalIndices ?? meshData.triangles
            }

            for (let i = 0; i < n_original; i++) {
                indices.vertices_final[i] = i
                indices.vertices_original[i] = i
            }
            
            if (UVunwrapping) {
                for (let i = 0; i < UVunwrapping.duplicatedVerts.length; i++) {
                    indices.vertices_final[n_original + i] = n_original + i
                    indices.vertices_original[n_original + i] = UVunwrapping.duplicatedVerts[i]
                }
            }

            return indices
        }

        throw new Error("decimation not implemented")

        // const n_original_triangles = meshData.triangles.length / 3
        // function triangle_get(i: number, vertex: 0 | 1 | 2) {
        //     return meshData.triangles[(3 * i) + vertex]
        // }

        // function triangle_set(i: number, vertex: 0 | 1 | 2, vertexIndex: number) {
        //     meshData.triangles[(3 * i) + vertex] = vertexIndex
        // }

        // const triangle_ = triangle_get

        // // https://github.com/isl-org/Open3D/blob/03231bb99b1b02fbca5ca79285e4a2e3d157218e/cpp/open3d/geometry/TriangleMeshSimplification.cpp
        // class Quadric {
        //     constructor() {
        //         this.A_.set([
        //             0, 0, 0,
        //             0, 0, 0,
        //             0, 0, 0
        //         ]);
        //         this.b_.set(0, 0, 0);
        //         this.c_ = 0;
        //     }
            
        //     ctor(plane: Vec4, weight = 1) {
        //         const n = this.b_.set(plane.x, plane.y, plane.z)
        //         this.A_.set([
        //             n.x * n.x, n.x * n.y, n.x * n.z,
        //             n.y * n.x, n.y * n.y, n.y * n.z,
        //             n.z * n.x, n.z * n.y, n.z * n.z,
        //         ])
        //         this.b_.mulScalar(weight * plane.w);
        //         this.c_ = weight * plane.w * plane.w;
        //         return this
        //     }
            
        //     add_inplace(other: Quadric) {
        //         // TODO: did it mean addition or multiplication in the source code?
        //         // it start with all 0's in A_, and many items are add()'d together,
        //         // so it is difficult to consider that the code meant multiplication
        //         // this.A_.setFromMat4(mat4_from_mat3(this.A_).mul(mat4_from_mat3(other.A_)))
        //         for (let i = 0; i < 9; i++)
        //             this.A_.data[i] += other.A_.data[i];
        //         this.b_.add(other.b_);
        //         this.c_ += other.c_;
        //         return this;
        //     }
            
        //     add(other: Quadric) {
        //         const clone = new Quadric()
        //         clone.A_.set(this.A_.data as any as number[])
        //         clone.b_.copy(this.b_)
        //         clone.c_ = this.c_
        //         return clone.add_inplace(other)
        //     }
            
        //     Eval(v: Vec3): number {
        //         const Av: Vec3 = this.A_.transformVector(v);
        //         const q = v.dot(Av) + 2 * this.b_.dot(v) + this.c_;
        //         return q;
        //     }
            
        //     IsInvertible() {
        //         const m = this.A_.data
        //         const det = (
        //             (m[0] * ((m[4] * m[8]) - (m[5] * m[7]))) -
        //             (m[1] * ((m[3] * m[8]) - (m[5] * m[6]))) +
        //             (m[2] * ((m[3] * m[7]) - (m[5] * m[6])))
        //         )
        //         return Math.abs(det) > 1e-4;
        //     }
            
        //     // Eigen::Vector3d Minimum() const { return -A_.ldlt().solve(b_); }
        //     Minimum() {
        //         return mat4_from_mat3(this.A_).invert().transformPoint(this.b_).mulScalar(-1)
        //     }
            
        //     /** A_ = n . n^T, where n is the plane normal  */
        //     readonly A_ = new Mat3();
        //     /**
        //      * b_ = d . n, where n is the plane normal and d the non-normal component
        //      * of the plane parameters
        //      */
        //     readonly b_ = new Vec3();
        //     /** c_ = d . d, where d the non-normal component pf the plane parameters */
        //     c_: number;
        // }

        // // interpolating code

        // type Edge = [a: number, b: number]

        // class EdgeMap<V> {
        //     private readonly internal = new Array<Map<number, V>>()

        //     has([a, b]: Edge) {
        //         if (a > b) { 
        //             const tmp = b
        //             b = a
        //             a = tmp
        //         }
        //         return (this.internal[a] ??= new Map()).has(b)
        //     }

        //     get([a, b]: Edge): V {
        //         if (a > b) { 
        //             const tmp = b
        //             b = a
        //             a = tmp
        //         }
        //         return (this.internal[a] ??= new Map()).get(b)
        //     }

        //     set([a, b]: Edge, v: V) {
        //         if (a > b) { 
        //             const tmp = b
        //             b = a
        //             a = tmp
        //         }
        //         const map = (this.internal[a] ??= new Map())
        //         map.set(b, v)
        //     }

        //     count([a, b]: Edge) {
        //         if (a > b) { 
        //             const tmp = b
        //             b = a
        //             a = tmp
        //         }
        //         const map = this.internal[a]
        //         if (!map) return 0
        //         else return map.has(b) ? 1 : 0
        //     }
        // }

        // // https://github.com/isl-org/Open3D/blob/03231bb99b1b02fbca5ca79285e4a2e3d157218e/cpp/open3d/geometry/TriangleMeshSimplification.cpp#L246

        // const target_number_of_triangles = Math.floor(quality * n_original_triangles),
        // const maximum_error = Infinity
        // const boundary_weight = 1.0

        // type CostEdge = [number, number, number]

        // // auto mesh = std::make_shared<TriangleMesh>();
        // // mesh->vertices_ = vertices_;
        // // mesh->vertex_normals_ = vertex_normals_;
        // // mesh->vertex_colors_ = vertex_colors_;
        // // mesh->triangles_ = triangles_;

        // // std::vector<bool> vertices_deleted(vertices_.size(), false);
        // // std::vector<bool> triangles_deleted(triangles_.size(), false);
        // const vertices_deleted = new Array<boolean>(meshData.vertices.length).fill(false)
        // const triangles_deleted = new Array<boolean>(n_original_triangles).fill(false)

        // // Map vertices to triangles and compute triangle planes and areas
        // // std::vector<std::unordered_set<int>> vert_to_triangles(vertices_.size());
        // // std::vector<Eigen::Vector4d> triangle_planes(triangles_.size());
        // // std::vector<double> triangle_areas(triangles_.size());
        // const vert_to_triangles = new Array<Set<number>>(meshData.vertices.length)
        // const triangle_planes = new Array<Vec4>(n_original_triangles)
        // const triangle_areas = new Array<number>(n_original_triangles)

        // for (let tidx = 0; tidx < n_original_triangles; ++tidx) {
        //     (vert_to_triangles[triangle_(tidx, 0)] ??= new Set()).add(tidx);
        //     (vert_to_triangles[triangle_(tidx, 1)] ??= new Set()).add(tidx);
        //     (vert_to_triangles[triangle_(tidx, 2)] ??= new Set()).add(tidx);

        //     triangle_planes[tidx] = GetTrianglePlane(tidx);
        //     triangle_areas[tidx] = GetTriangleArea(tidx);
        // }

        // // Compute the error metric per vertex
        // // std::vector<Quadric> Qs(vertices_.size());
        // // for (size_t vidx = 0; vidx < vertices_.size(); ++vidx) {
        // //     for (int tidx : vert_to_triangles[vidx]) {
        // //         Qs[vidx] += Quadric(triangle_planes[tidx], triangle_areas[tidx]);
        // //     }
        // // }
        // const Qs = new Array<Quadric>(meshData.vertices.length)
        // for (let vidx = 0; vidx < meshData.vertices.length; ++vidx)
        //     for (const tidx of vert_to_triangles[vidx])
        //         Qs[vidx].add(new Quadric().ctor(triangle_planes[tidx], triangle_areas[tidx]))
        // //?? what is the meaning of adding a Quadric here?
        
        // // For boundary edges add perpendicular plane quadric
        // // auto edge_triangle_count = GetEdgeToTrianglesMap();
        // // auto AddPerpPlaneQuadric = [&](int vidx0, int vidx1, int vidx2,
        // //                             double area) {
        // //     int min = std::min(vidx0, vidx1);
        // //     int max = std::max(vidx0, vidx1);
        // //     Eigen::Vector2i edge(min, max);
        // //     if (edge_triangle_count[edge].size() != 1) {
        // //         return;
        // //     }
        // //     const auto& vert0 = mesh->vertices_[vidx0];
        // //     const auto& vert1 = mesh->vertices_[vidx1];
        // //     const auto& vert2 = mesh->vertices_[vidx2];
        // //     Eigen::Vector3d vert2p = (vert2 - vert0).cross(vert2 - vert1);
        // //     Eigen::Vector4d plane = ComputeTrianglePlane(vert0, vert1, vert2p);
        // //     Quadric quad(plane, area * boundary_weight);
        // //     Qs[vidx0] += quad;
        // //     Qs[vidx1] += quad;
        // // };

        // let edge_triangle_count = GetEdgeToTrianglesMap();
        // function AddPerpPlaneQuadric(vidx0: number, vidx1: number, vidx2: number, area: number) {
        //     const min = Math.min(vidx0, vidx1)
        //     const max = Math.max(vidx0, vidx1)
        //     const edge: Edge = [min, max]
        //     if (edge_triangle_count.get(edge) !== 1)
        //         return
        //     const vert0 = meshData.vertices[vidx0]
        //     const vert1 = meshData.vertices[vidx1]
        //     const vert2 = meshData.vertices[vidx2]
        //     const vert2p = new Vec3().cross(
        //         new Vec3().sub2(vert2, vert0),
        //         new Vec3().sub2(vert2, vert1)
        //     )
        //     const plane = ComputeTrianglePlane(vert0, vert1, vert2p);
        //     const quad = new Quadric().ctor(plane, area * boundary_weight)
        //     Qs[vidx0].add(quad)
        //     Qs[vidx1].add(quad)
        // }

        // for (let tidx = 0; tidx < n_original_triangles; ++tidx) {
        //     const tria_v0 = triangle_(tidx, 0)
        //     const tria_v1 = triangle_(tidx, 1)
        //     const tria_v2 = triangle_(tidx, 2)
            
        //     const area = triangle_areas[tidx];
        //     AddPerpPlaneQuadric(tria_v0, tria_v1, tria_v2, area);
        //     AddPerpPlaneQuadric(tria_v1, tria_v2, tria_v0, area);
        //     AddPerpPlaneQuadric(tria_v2, tria_v0, tria_v1, area);
        // }

        // // Get valid edges and compute cost
        // // Note: We could also select all vertex pairs as edges with dist < eps
        
        // const vbars = new EdgeMap<Vec3>()
        // const costs = new EdgeMap<number>()
        // // std::unordered_map<Eigen::Vector2i, Eigen::Vector3d,
        // //                 utility::hash_eigen<Eigen::Vector2i>>
        // //         vbars;
        // // std::unordered_map<Eigen::Vector2i, double,
        // //                 utility::hash_eigen<Eigen::Vector2i>>
        // //         costs;

        // function CostEdgeComp(a: CostEdge, b: CostEdge) {
        //     return a[0] > b[0]
        // }
        // const queue = new PriorityQueue<CostEdge>(CostEdgeComp)

        // function AddEdge (vidx0: number, vidx1: number, update: boolean) {
        //     const min = Math.min(vidx0, vidx1);
        //     const max = Math.max(vidx0, vidx1);
        //     const edge: Edge = [min, max]
        //     if (update || vbars.count(edge) == 0) {
        //         const Q0 = Qs[min]
        //         const Q1 = Qs[max]
        //         const Qbar = Q0.add(Q1)
        //         let cost: number
        //         let vbar: Vec3
        //         if (Qbar.IsInvertible()) {
        //             vbar = Qbar.Minimum();
        //             cost = Qbar.Eval(vbar);
        //         } else {
        //             const v0 = meshData.vertices[vidx0];
        //             const v1 = meshData.vertices[vidx1];
        //             // const vmid = new Vec3().add2(v0, v1).divScalar(2);
        //             const cost0 = Qbar.Eval(v0);
        //             const cost1 = Qbar.Eval(v1);
        //             // const costmid = Qbar.Eval(vmid);
        //             // cost = Math.min(cost0, cost1, costmid);
        //             //TODO: if midpoint is removed and collapses from distant UV locations are prohibited
        //             vbar = (cost0 < cost1) ? v0 : v1
        //             // if (cost == costmid) {
        //             //     vbar = vmid;
        //             // } else if (cost == cost0) {
        //             //     vbar = v0;
        //             // } else {
        //             //     vbar = v1;
        //             // }
        //         }
        //         vbars.add(min, max, vbar)
        //         costs.add(min, max, cost)
        //         queue.push([cost, min, max]);
        //     }
        // };

        // // add all edges to priority queue
        // // for (const auto& triangle : triangles_) {
        // for (let i = 0; i < n_original_triangles; ++i) {
        //     AddEdge(triangle_(i, 0), triangle_(i, 1), false);
        //     AddEdge(triangle_(i, 1), triangle_(i, 2), false);
        //     AddEdge(triangle_(i, 2), triangle_(i, 0), false);
        // }

        // // perform incremental edge collapse
        // const has_vert_normal = HasVertexNormals();
        // const has_vert_color = HasVertexColors();
        // let n_triangles = n_original_triangles
        // while (n_triangles > target_number_of_triangles && !queue.empty()) {
        //     // retrieve edge from queue
        //     let cost: number;
        //     let vidx0: number, vidx1: number;
        //     [cost, vidx0, vidx1] = queue.top();
        //     queue.pop();

        //     if (cost > maximum_error) {
        //         break;
        //     }

        //     // test if the edge has been updated (reinserted into queue)
        //     const edge: Edge = [vidx0, vidx1];
        //     const valid = !vertices_deleted[vidx0] && !vertices_deleted[vidx1] &&
        //                 cost == costs.get(edge);
        //     if (!valid) {
        //         continue;
        //     }

        //     // avoid flip of triangle normal
        //     let flipped = false;
        //     for (const tidx of vert_to_triangles[vidx1]) {
        //         if (triangles_deleted[tidx]) {
        //             continue;
        //         }

        //         let tria_i_0 = triangle_(tidx, 0)
        //         let tria_i_1 = triangle_(tidx, 1)
        //         let tria_i_2 = triangle_(tidx, 2)
                
        //         // const Eigen::Vector3i& tria = mesh->triangles_[tidx];
        //         const has_vidx0 =
        //                 vidx0 == tria_i_0 || vidx0 == tria_i_1 || vidx0 == tria_i_2;
        //         const has_vidx1 =
        //                 vidx1 == tria_i_0 || vidx1 == tria_i_1 || vidx1 == tria_i_2;
        //         if (has_vidx0 && has_vidx1) {
        //             continue;
        //         }

        //         let vert0 = meshData.vertices[tria_i_0];
        //         let vert1 = meshData.vertices[tria_i_1];
        //         let vert2 = meshData.vertices[tria_i_2];
        //         const norm_before = new Vec3().cross(
        //             new Vec3().sub2(vert1, vert0),
        //             new Vec3().sub2(vert2, vert0)
        //         )
        //         norm_before.normalize();

        //         // is it assigning the triangle's vertices, changing the vertices, or just local variables?
        //         if (vidx1 == tria_i_0)
        //             // triangle_set(tidx, 0, vbars.get(edge))
        //             meshData.vertices[tria_i_0] = vert0 = vbars.get(edge);
        //         else if (vidx1 == tria_i_1)
        //             meshData.vertices[tria_i_1] = vert1 = vbars.get(edge);
        //         else if (vidx1 == tria_i_2)
        //             meshData.vertices[tria_i_2] = vert2 = vbars.get(edge);

        //         const norm_after =  new Vec3().cross(
        //             new Vec3().sub2(vert1, vert0),
        //             new Vec3().sub2(vert2, vert0)
        //         )
        //         norm_after.normalize();
        //         if (norm_before.dot(norm_after) < 0) {
        //             flipped = true; // should this be flipped = !flipped
        //             break;
        //         }
        //     }
        //     if (flipped) {
        //         continue;
        //     }

        //     // Connect triangles from vidx1 to vidx0, or mark deleted
        //     for (const tidx of vert_to_triangles[vidx1]) {
        //         if (triangles_deleted[tidx]) {
        //             continue;
        //         }

        //         // Eigen::Vector3i& tria = mesh->triangles_[tidx];
        //         const tria_i_0 = triangle_(tidx, 0)
        //         const tria_i_1 = triangle_(tidx, 1)
        //         const tria_i_2 = triangle_(tidx, 2)
        //         const has_vidx0 =
        //                 vidx0 == tria_i_0 || vidx0 == tria_i_1 || vidx0 == tria_i_2;
        //         const has_vidx1 =
        //                 vidx1 == tria_i_0 || vidx1 == tria_i_1 || vidx1 == tria_i_2;

        //         if (has_vidx0 && has_vidx1) {
        //             triangles_deleted[tidx] = true;
        //             n_triangles--;
        //             continue;
        //         }

        //         if (vidx1 == tria_i_0) {
        //             triangle_set(tidx, 0, vidx0);
        //         } else if (vidx1 == tria(1)) {
        //             triangle_set(tidx, 1, vidx0);
        //         } else if (vidx1 == tria(2)) {
        //             triangle_set(tidx, 2, vidx0);
        //         }
        //         vert_to_triangles[vidx0].add(tidx);
        //     }

        //     // update vertex vidx0 to vbar
        //     vertices[vidx0] = vbars.get(edge);
        //     Qs[vidx0].add_inplace(Qs[vidx1]);
        //     // if (has_vert_normal) {
        //     //     mesh->vertex_normals_[vidx0] = 0.5 * (mesh->vertex_normals_[vidx0] +
        //     //                                         mesh->vertex_normals_[vidx1]);
        //     // }
        //     // if (has_vert_color) {
        //     //     mesh->vertex_colors_[vidx0] = 0.5 * (mesh->vertex_colors_[vidx0] +
        //     //                                         mesh->vertex_colors_[vidx1]);
        //     // }
        //     vertices_deleted[vidx1] = true;

        //     // Update edge costs for all triangles connecting to vidx0
        //     for (const tidx of vert_to_triangles[vidx0]) {
        //         if (triangles_deleted[tidx]) {
        //             continue;
        //         }
        //         // const Eigen:: Vector3i& tria = mesh -> triangles_[tidx];
        //         const tria_i_0 = triangle_(tidx, 0)
        //         const tria_i_1 = triangle_(tidx, 1)
        //         const tria_i_2 = triangle_(tidx, 2)

        //         if (tria_i_0 == vidx0 || tria_i_1 == vidx0) {
        //             AddEdge(tria_i_0, tria_i_1, true);
        //         }
        //         if (tria_i_1 == vidx0 || tria_i_2 == vidx0) {
        //             AddEdge(tria_i_1, tria_i_2, true);
        //         }
        //         if (tria_i_2 == vidx0 || tria_i_0 == vidx0) {
        //             AddEdge(tria_i_2, tria_i_0, true);
        //         }
        //     }
        // }

        // // Apply changes to the triangle mesh
        // let next_free = 0;
        // const vert_remapping = new Map<number, number>();
        // for (let idx = 0; idx < vertices_.length; ++idx) {
        //     if (!vertices_deleted[idx]) {
        //         vert_remapping.set(idx, next_free);
        //         vertices_[next_free] = vertices_[idx];
        //         // if (has_vert_normal) {
        //         //     mesh->vertex_normals_[next_free] = mesh->vertex_normals_[idx];
        //         // }
        //         // if (has_vert_color) {
        //         //     mesh->vertex_colors_[next_free] = mesh->vertex_colors_[idx];
        //         // }
        //         next_free++;
        //     }
        // }
        // vertices_.resize(next_free);
        // // if (has_vert_normal) {
        // //     mesh->vertex_normals_.resize(next_free);
        // // }
        // // if (has_vert_color) {
        // //     mesh->vertex_colors_.resize(next_free);
        // // }

        // next_free = 0;
        // for (let idx = 0; idx < triangles_.length; ++idx) {
        //     if (!triangles_deleted[idx]) {
        //         // Eigen::Vector3i tria = triangles_[idx];
        //         triangles_[next_free++] = vert_remapping[triangle_(idx, 0)];
        //         triangles_[next_free++] = vert_remapping[triangle_(idx, 1)];
        //         triangles_[next_free++] = vert_remapping[triangle_(idx, 2)];
        //     }
        // }
        // triangles_.resize(next_free);

        // if (HasTriangleNormals()) {
        //     mesh->ComputeTriangleNormals();
        // }

        // return mesh;
    }

    individualize() {
        return new MeshDecimationIndividual<VolumeLocationT>(this)
    }
}

export class MeshDecimationIndividual<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    private _quality: number = NaN

    private _indices!: {
        /**
         * Array of original vertex indices (before UV unwrapping)
         * 
         * Equal to {@link vertices_final} except duplicated vertex indices are
         * mapped to their original vertex indices.
         */
        readonly vertices_original: IndicesArray

        /**
         * Array of final vertex indices (after considering duplicated
         * vertices from UV unwrapping)
         */
        readonly vertices_final: IndicesArray

        /** triples of indices within the decimated vertices */
        readonly triangles: IndicesArray
    }

    get indices() {
        return this._indices
    }

    get numRenderVerts() {
        return this.indices.vertices_final.length
    }

    get quality() {
        return this._quality
    }

    set quality(quality) {
        if (quality > 1) quality = 1
        else if (quality < 0) quality = 0
        else if (isNaN(quality)) throw new RangeError("Quality must be in range [0, 1]")
        if(this._quality === quality) return
        this._quality = quality
        
        this._indices = this.shared.cached(quality)
    }

    constructor(public readonly shared: MeshDecimationShared<VolumeLocationT>) {
        this.quality = 1
    }
}