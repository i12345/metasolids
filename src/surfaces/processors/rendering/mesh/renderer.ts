import { Mesh, PRIMITIVE_TRIANGLES, calculateNormals } from "playcanvas-extended";
import { SurfaceRendererIndividual, SurfaceRendererShared } from "../renderer.js";
import { LevelOfDetailInfoComputerShared, LevelOfDetailInfoComputerIndividual } from "./LOD-info.js";
import { MeshDecimationIndividual, MeshDecimationShared } from "./decimation.js";
import { RefCount } from "../../../../utils/ref-count.js";
import { MultiObjectsGroupsTemplate, RANGE_MAX, RANGE_MIN, groupKinds } from "../../../../fields/index.js";
import { onlyOne } from "../../../../utils/index.js";
import { SurfaceTextureLocationsGroupKindsTemplate, SurfaceUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate } from "../../texturing/index.js";
import { TextureLocation } from "../../../../textures/texture.js";
import { VolumeLocation } from "../../../../volumes/volume.js";

export class MeshRendererShared<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > {
    readonly decimation: MeshDecimationShared
    readonly LOD: LevelOfDetailInfoComputerShared
    readonly UVUnwrapping?: SurfaceUVUnwrapping

    /** quality -> implementation */
    readonly implementation_cache = new Map<number, Mesh>()
    readonly computeBackingCallbacks: ((individual: MeshRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>) => void)[] = []

    constructor(public readonly renderer: SurfaceRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>) {
        ///@ts-ignore
        this.decimation = new MeshDecimationShared(this)
        ///@ts-ignore
        this.LOD = new LevelOfDetailInfoComputerShared(this)
        this.UVUnwrapping = onlyOne(groupKinds(
            renderer.context,
            SurfaceUVUnwrappingGroupKindsTemplate,
            renderer.surfaceUVUnwrappingGroup
        )).group?.get<SurfaceUVUnwrapping>(renderer.surface)
    }

    individualize(renderer: SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>) {
        return new MeshRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>(this, renderer)
    }
}

export class MeshRendererIndividual<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > {
    readonly decimation: MeshDecimationIndividual
    readonly LOD: LevelOfDetailInfoComputerIndividual
    readonly individuality = new RefCount()
    private _implementation!: Mesh
    private _individualImplimentationQuality?: number

    get implementation() {
        return this._implementation
    }

    constructor(
        public readonly shared: MeshRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>,
        public readonly renderer: SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>
    ) {
        this.decimation = shared.decimation.individualize()
        this.LOD = shared.LOD.individualize(this)
        this.update()
    }

    update() {
        this.LOD.update()

        const TARGET_SCREEN_DIST = 10
        const edge_distance_screen_mean = (
            this.LOD.info.edge.distances.absolute.screen[RANGE_MIN] +
            this.LOD.info.edge.distances.absolute.screen[RANGE_MAX]
        ) / 2
        const quality_now = TARGET_SCREEN_DIST / edge_distance_screen_mean
        const quality_target = Math.min(1, 1 / quality_now)

        const FINAL_QUALITY= [0.1, 0.4, 1]
        let quality_i = 0
        while (quality_i < FINAL_QUALITY.length &&
            FINAL_QUALITY[quality_i] > quality_target)
            quality_i++
        quality_i--

        // this.decimation.quality = FINAL_QUALITY[quality_i]
        this.decimation.quality = 1
    }

    updateBacking() {
        const currentlyShared = [...this.shared.implementation_cache.entries()].map(([quality, mesh]) => ({ quality, mesh })).find(({ mesh }) => mesh === this.implementation)

        if (this.individuality.refCount === 0) {
            const shared = this.shared.implementation_cache.get(this.decimation.quality)
            if (shared)
                this._implementation = shared
            else {
                // if a shared mesh can be used
                // though there is no current shared mesh for this quality
                // then a new shared mesh will have to be computed

                // if it was using a shared mesh (of a different quality)
                // then it will have to make a new shared mesh
                // otherwise it could reuse and share its individual mesh
                // (if it had one; at the start it will have to make one)
                // but it will have to compute the shared mesh either way

                if (currentlyShared)
                    this._implementation = new Mesh()
                else this._implementation ??= new Mesh()
                this.computeBacking()
                this.shared.implementation_cache.set(this.decimation.quality, this.implementation)
            }

            this._individualImplimentationQuality = undefined
        }
        else {
            if (currentlyShared) {
                // if this is the only individual referencing a shared version
                // it can just claim the shared version to minimize memory use
                // and will not need to recompute the mesh
                if (currentlyShared.mesh.refCount === 1 &&
                    currentlyShared.quality === this.decimation.quality)
                    this.shared.implementation_cache.delete(currentlyShared.quality)
                else {
                    this._implementation = new Mesh()
                    this.computeBacking()
                }
            }
            else if (this._individualImplimentationQuality !== this.decimation.quality)
                this.computeBacking()
            else {
                // The individual implementation is already made
            }

            this._individualImplimentationQuality = this.decimation.quality
        }

        if (this.renderer.implementation) {
            const oldMesh = this.renderer.implementation.mesh
            this.renderer.implementation.mesh = this.implementation
        
            if (oldMesh?.refCount === 0) {
                for (const [key, mesh] of this.shared.implementation_cache.entries()) {
                    if (mesh === oldMesh) {
                        this.shared.implementation_cache.delete(key)
                        break
                    }
                }
            }
        }
    }

    updateFinal() {
        this.implementation.update(PRIMITIVE_TRIANGLES)
    }

    private computeBacking() {
        const n_decimated = this.decimation.numRenderVerts
        const UVunwrapping = this.shared.UVUnwrapping
        const { vertices_original, vertices_final, triangles } = this.decimation.indices
        const mesh = this.implementation
        const surface = this.renderer.shared.surface
        const surface_meshData = surface.mesh
        
        const positions = new Float32Array(3 * n_decimated)
        const UVs = new Float32Array(2 * n_decimated)
        const normals = new Float32Array(3 * n_decimated)

        for (let i_decimated = 0; i_decimated < n_decimated; i_decimated++) {
            const i_original = vertices_original[i_decimated]
            const i_UVunwrapped = vertices_final[i_decimated]

            const position = surface_meshData.vertices[i_original]
            const uv = UVunwrapping?.UVs[i_UVunwrapped]!

            positions[(3 * i_decimated) + 0] = position.x
            positions[(3 * i_decimated) + 1] = position.y
            positions[(3 * i_decimated) + 2] = position.z
            UVs[(2 * i_decimated) + 0] = uv.x
            UVs[(2 * i_decimated) + 1] = uv.y
            normals[(3 * i_decimated) + 0] = surface_meshData.normals[(3 * i_original) + 0]
            normals[(3 * i_decimated) + 1] = surface_meshData.normals[(3 * i_original) + 1]
            normals[(3 * i_decimated) + 2] = surface_meshData.normals[(3 * i_original) + 2]
        }

        mesh.setPositions(positions)
        mesh.setIndices(triangles)
        mesh.setNormals(normals)
        mesh.setUvs(0, UVs)

        this.shared.computeBackingCallbacks.forEach(callback => callback(this))
    }
}