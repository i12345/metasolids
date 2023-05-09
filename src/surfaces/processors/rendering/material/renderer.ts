import { MultiObjectsGroupsMapped, groups } from "../../../../fields/multi-objects-fields-point.js";
import { Material_Groups, Material_Groups_Template } from "./groups.js";
import { Cost_Space, MaterialSemanticImplementation, MaterialSemanticImplementationStorageClass, MaterialSemanticImplementationStorageClassInstanceIndividual, MaterialSemanticImplementationStorageClassInstanceShared, RenderedBufferForSemanticWithImplementation } from "./implementation.js";
import { MaterialSemanticImplementationStorageClass_Constant } from "./storage-classes/constant.js";
import { MaterialSemanticImplementationStorageClass_VertexColors } from "./storage-classes/vertex-colors.js";
import { MaterialSemanticImplementationStorageClass_Texture } from "./storage-classes/texture.js";
import { GeneratorType } from "../../../../utils/generator-type.js";
import { MaterialSemanticImplementation_Multi } from "./semantic-implementations/multi.js";
import { cacheGenerator } from "../../../../utils/cache-generator.js";
import { material_group_implementations } from "./implementor.js";
import { Texture, opaqueStagedTexture } from "../../../../textures/index.js";
import { FieldsPointMapped, field_point_add_inplace, field_point_compare_gte, field_point_fraction, field_point_primitives_sum, field_point_subtract } from "../../../../fields/point.js";
import { MaterialSemanticImplementation_Immediate } from "./semantic-implementations/immediate.js";
import { SurfaceRendererIndividual, SurfaceRendererShared } from "../renderer.js";
import { StandardMaterial } from "playcanvas-extended";
import { RefCount } from "../../../../utils/ref-count.js";
import { Material_Texture_Context, Material_Texture_Location } from "./material-texture.js";
import { VolumeLocation } from "../../../../volumes/volume.js";
import { Field, FieldsField, SampleDomainLocationField, Vec2Field, field_point_sum } from "../../../../fields/index.js";
import { VolumeSurfaceProcessingContext } from "../../../processor.js";
import { ParallelizedContextParallelInfo } from "../../../../processor/index.js";
import { VolumeProcessingContext } from "../../../../volumes/index.js";
import { MaterialSemanticImplementation_Shared } from "./semantic-implementations/shared.js";
import { MaterialSemanticImplementation_None } from "./semantic-implementations/none.js";
import { MaterialSemanticImplementation_Texture } from "./semantic-implementations/texture.js";
import { MaterialSemanticImplementation_Constant } from "./semantic-implementations/constant.js";
import { MaterialSemanticImplementation_VertexColors } from "./semantic-implementations/vertex-colors.js";
import { MaterialSemanticImplementation_Setting } from "./semantic-implementations/setting.js";

const groups_priorities: MultiObjectsGroupsMapped<Material_Groups, number> = {
    diffuse: 5,
    emissive: 4,
    specular: 3,
    clearCoat: {
        glossiness: 0,
        height: 0,
        intensity: 0
    },
    glossiness: 1,
    metalness: 1,
    height: 0,
    iridescence: {
        indexOfRefraction: 0,
        intensity: 0,
        thickness: 0
    },
    opacity: 0,
    refraction: {
        attenuation: {
            color: 2,
            distance: 4
        },
        indexOfRefraction: 0,
        visibility: 3
    },
    sheen: {
        color: 1,
        glossiness: 1
    }
}

const storageClasses: MaterialSemanticImplementationStorageClass[] = [
    MaterialSemanticImplementationStorageClass_Constant.instance,
    MaterialSemanticImplementationStorageClass_VertexColors.instance,
    MaterialSemanticImplementationStorageClass_Texture.instance,
]

const material_groups = [...groups(Material_Groups_Template)]

interface Material_Group_Implementation_Internal_Shared {
    readonly stage_max: number
    readonly options: () => Generator<MaterialSemanticImplementation_Multi<MaterialSemanticImplementation_Immediate>>
    readonly implementations_rendered_stage0_cache: Material_Group_Implementation_Internal_Individual[]
}

interface Material_Group_Implementation_Internal_Individual {
    shareable?: MaterialSemanticImplementation_Multi<MaterialSemanticImplementation_Shared>
    implementation?: MaterialSemanticImplementation_Multi<MaterialSemanticImplementation_Immediate>
    renderedBuffers?: RenderedBufferForSemanticWithImplementation[]
}

function* flattenImplementationMulti(implementations: Generator<MaterialSemanticImplementation>): Generator<MaterialSemanticImplementation_Multi<MaterialSemanticImplementation_Immediate>> {
    function* flattenMultiTerms(implementation: MaterialSemanticImplementation): Generator<MaterialSemanticImplementation_Immediate> {
        if (implementation instanceof MaterialSemanticImplementation_Multi)
            for (const component of implementation.components)
                yield* flattenMultiTerms(component)
        else if (implementation instanceof MaterialSemanticImplementation_Constant ||
            implementation instanceof MaterialSemanticImplementation_Texture ||
            implementation instanceof MaterialSemanticImplementation_VertexColors ||
            implementation instanceof MaterialSemanticImplementation_Setting ||
            implementation instanceof MaterialSemanticImplementation_Shared)
            yield implementation
        else if (implementation instanceof MaterialSemanticImplementation_None) { }
        else throw new Error("unimplemented implementation type")
    }
    
    for (const implementation of implementations)
        yield new MaterialSemanticImplementation_Multi([...flattenMultiTerms(implementation)])
}

export class MaterialRendererShared<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    readonly groups: MultiObjectsGroupsMapped<Material_Groups, Material_Group_Implementation_Internal_Shared> = {} as typeof this.groups
    readonly storageClassInstances: MaterialSemanticImplementationStorageClassInstanceShared[]
    readonly computeBackingCallbacks: ((individual: MaterialRendererIndividual) => void)[] = []

    implementation?: StandardMaterial = new StandardMaterial()

    readonly textureContexts: MultiObjectsGroupsMapped<
        Material_Groups,
        Material_Texture_Context<VolumeLocationT>
    >

    constructor(
        public readonly renderer: SurfaceRendererShared,
        public value_thresholds: {
            implement: number,
            change: number
        } = {
            implement: 0.7,
            change: 0.25
        }
    ) {
        material_groups.forEach(group => {
            const stage_max = opaqueStagedTexture(group.get<Texture>(renderer.surface.textures))[0]

            group.set(
                this.groups,
                {
                    stage_max,
                    implementations_rendered_stage0_cache: [],
                    options: cacheGenerator<MaterialSemanticImplementation_Multi<MaterialSemanticImplementation_Immediate>>(
                        flattenImplementationMulti(
                            material_group_implementations(
                                group,
                                renderer.surface,
                                renderer.context
                            )
                        )
                    )
                } as Material_Group_Implementation_Internal_Shared
            )
        })

        this.storageClassInstances = storageClasses.map($class => $class.instance(renderer))
    }

    individualize(renderer: SurfaceRendererIndividual) {
        return new MaterialRendererIndividual(this, renderer)
    }
}

export class MaterialRendererIndividual {
    private readonly current: MultiObjectsGroupsMapped<Material_Groups, Material_Group_Implementation_Internal_Individual> = {} as typeof this.current
    readonly storageClassInstances: MaterialSemanticImplementationStorageClassInstanceIndividual[]

    private _implementation: StandardMaterial

    get implementation() {
        return this._implementation
    }

    readonly individuality = new RefCount()

    constructor(
        public readonly shared: MaterialRendererShared,
        public readonly renderer: SurfaceRendererIndividual
    ) {
        this.storageClassInstances = shared.storageClassInstances.map(storageClassInstance => storageClassInstance.individualize(renderer))
        this._implementation = shared.implementation

        material_groups.forEach(group => group.set<Material_Group_Implementation_Internal_Individual>(this.current, {
            implementation: undefined,
            shareable: undefined,
            renderedBuffers: []
        }))

        this.update()
    }

    updateBacking() {
        if (this.individuality.refCount === 0) {
            if (this.shared.implementation)
                this._implementation = this.shared.implementation
            else {
                this._implementation = this.shared.implementation = new StandardMaterial()
                this.shared.computeBackingCallbacks.forEach(callback => callback(this))
            }
        }
        else if (this.implementation === this.shared.implementation) {
            this._implementation = new StandardMaterial()
            this.shared.computeBackingCallbacks.forEach(callback => callback(this))
        }
        
        if (this.renderer.implementation.material !== this.implementation)
            this.renderer.implementation.material = this.implementation
    }

    updateFinal() {
        this.implementation.update()
    }

    update(invalidateStagesSince = 0): void {
        /**
         * (Implementation sets for each group are already calculated)
         * 
         * ```text
         * value =
         *      a * quality -
         *      exp(-b * [
         *          (c * implementation.cost.time) +
         *          (d * implementation.cost.space / available_space)
         *      ])
         * ```
         * 
         * ## Determine what can change
         * 
         * - For each group's current implementation:
         *   - If current implementation set:
         *     - stage < invalidateStagesSince and
         *     - quality > threshhold
         *   - Then keep current implementation unchanged
         *   - Else:
         *     - Add this group to the set of groups that can change
         * 
         * ## Then consider how to implement the groups that can change:
         * 
         * - Calculate available space (adding space from implementations in H).
         * - Step from max(stages) to invalidateStagesSince:
         *   - For each group (sorted by priority):
         *     - Out of implementations for this stage and group, that fit the
         *       available space, take the implementation set for the first
         *       implementation with value above a threshold.
         *       - When considering the implementations for this group, they
         *         can be lazily generated
         *         (This prevents unnecessary quality metric computations.)
         *     - If it is not the current implementation (same semantics):
         *       - Remove current implementation and add this implementation.
         *       - Store this as current implementation set.
         *     - Update available space.
         * 
         */
        const notes = "see comment above";

        let space_available: Cost_Space = field_point_sum(this.shared.storageClassInstances.map(storageClassInstance => storageClassInstance.$class.startingSpace(this.renderer)))

        function value(implementation: MaterialSemanticImplementation): number {
            const a = 0.9 // [0, 1]
            const b = 0.002 // [0, \infty]
            const c = 0.5 // [0, \infty]
            const d = 0.03 // [0, \infty]
            const e = 0.1 // [0, \infty]

            /**
             * ```text
             * value =
             *      [1 - (a * [1 - quality])] -
             *      [1 - exp(-b * [
             *          (c * implementation.cost.time) +
             *          (d * implementation.cost.space / available_space)
             *      ])]
             * ```
             */
            return (
                (1 - (a * (1 - implementation.quality(this.surface)))) -
                (1 - Math.exp(-b * (
                    (c * implementation.cost.time) +
                    (d * field_point_primitives_sum(field_point_fraction(implementation.cost.space, space_available))) +
                    (e * implementation.cost.space.elements)
                )))
            )
        }

        const potential_implementations: GeneratorType<ReturnType<typeof groups>>[] = []

        material_groups.forEach(group => {
            const current = group.get<Material_Group_Implementation_Internal_Individual>(this.current)
            const { stage_max } = group.get<Material_Group_Implementation_Internal_Shared>(this.shared.groups)
            if (!current.implementation ||
                stage_max >= invalidateStagesSince ||
                value(current.implementation) < this.shared.value_thresholds.change) {
                
                potential_implementations.push(group)

                current.implementation?.components.forEach(implementation =>
                    space_available = field_point_subtract(space_available, implementation.cost.space)
                )
            }
        })

        potential_implementations.sort((a, b) => a.get<number>(groups_priorities) - b.get<number>(groups_priorities))

        const total: {
            add: RenderedBufferForSemanticWithImplementation[]
            remove: RenderedBufferForSemanticWithImplementation[]
        } = {
            add: [],
            remove: []
        }

        for (let stage = Math.max(...potential_implementations.map(group => group.get<Material_Group_Implementation_Internal_Shared>(this.shared.groups).stage_max));
            stage >= 0;
            stage--) {
            for (const group of potential_implementations) {
                const implementation_internal_shared = group.get<Material_Group_Implementation_Internal_Shared>(this.shared.groups)
                const implementation_internal_individual = group.get<Material_Group_Implementation_Internal_Individual>(this.current)
                const candidates: [value: number, implementation: MaterialSemanticImplementation_Multi<MaterialSemanticImplementation_Immediate>][] = []

                if (implementation_internal_shared.stage_max < stage)
                    continue

                /**
                 * This first considers current implementations of other
                 * individual material renderers of this same shared material
                 * renderer; they no time or texture space cost
                 */

                if (stage === 0)
                    for (const { shareable } of implementation_internal_shared.implementations_rendered_stage0_cache)
                        if (shareable)
                            candidates.push([value(shareable), shareable])

                if (!candidates.some(([value]) => value > this.shared.value_thresholds.implement)) {
                    for (const option of implementation_internal_shared.options()) {
                        if (option.stage === stage) {
                            if (field_point_compare_gte(space_available, option.cost.space)) {
                                const option_value = value(option)
                                candidates.push([option_value, option])

                                if (option_value > this.shared.value_thresholds.implement) {
                                    candidates.splice(0, candidates.length - 1)
                                    break
                                }
                            }
                        }
                    }
                }

                if (candidates.length > 0) {
                    const topCandidate = candidates.sort((a, b) => a[0] - b[0])[0][1]
                    const add_implementations = topCandidate.components
                    const remove_implementations = implementation_internal_individual.implementation?.components ?? []
                    const kept_implementations: typeof remove_implementations = []

                    for (let i = 0; i < remove_implementations.length; i++) {
                        const alreadyImplemented = remove_implementations[i]
                        const add_index = add_implementations.findIndex(toAdd => alreadyImplemented.equals(toAdd))
                        if (add_index !== -1) {
                            kept_implementations.push(alreadyImplemented)
                            add_implementations.splice(add_index, 1)
                            remove_implementations.splice(i, 1)
                            i--
                        }
                    }

                    const add_renderedBuffers =
                        add_implementations.flatMap(implementation => {
                            const shared =
                                !(stage === 0 && implementation instanceof MaterialSemanticImplementation_Shared) ?
                                    implementation :
                                    implementation_internal_shared.implementations_rendered_stage0_cache
                                    .find(cached =>
                                        cached
                                            .implementation
                                            ?.components
                                            .some(cached_component => implementation.equals(cached_component))
                                        ?? false
                                    )?.shareable!.components.find(shared => shared.implementation.equals(implementation))

                            return (shared ?? implementation).implement(this.renderer)
                        })
                    
                    const remove_renderedBuffers =
                        implementation_internal_individual.renderedBuffers?.filter(
                            renderedBuffer =>
                                remove_implementations.some(implementation =>
                                    implementation.equals(renderedBuffer.implementation)
                                )
                        )

                    const kept_renderedBuffers =
                        implementation_internal_individual.renderedBuffers?.filter(
                            renderedBuffer =>
                                kept_implementations.some(implementation =>
                                    implementation.equals(renderedBuffer.implementation)
                                )
                        )
                    
                    total.add.push(...add_renderedBuffers)
                    total.remove.push(...remove_renderedBuffers)
                    potential_implementations.splice(potential_implementations.indexOf(group), 1)
                    add_implementations.forEach(add => space_available = field_point_subtract(space_available, add.cost.space))
                    remove_implementations.forEach(remove => space_available = field_point_add_inplace(space_available, remove.cost.space))
                    
                    implementation_internal_individual.implementation = new MaterialSemanticImplementation_Multi([
                        ...kept_implementations,
                        ...add_implementations
                    ])
                    implementation_internal_individual.renderedBuffers = [...kept_renderedBuffers, ...add_renderedBuffers]
                    implementation_internal_individual.shareable = new MaterialSemanticImplementation_Multi([
                        ...add_implementations.map(implementation =>
                            new MaterialSemanticImplementation_Shared(
                                implementation,
                                add_renderedBuffers.filter(renderedBuffer =>
                                    implementation.equals(renderedBuffer.implementation)
                                )
                            )
                        ),
                        ...kept_implementations.map(implementation =>
                            new MaterialSemanticImplementation_Shared(
                                implementation,
                                kept_renderedBuffers.filter(renderedBuffer =>
                                    implementation.equals(renderedBuffer.implementation)
                                )
                            )
                        )
                    ])
                }
            }
        }

        const total_storageClassInstances = this.storageClassInstances.map(
            storageClassInstance => ({
                storageClassInstance,
                add: total.add.filter(renderedBuffer => renderedBuffer.storageClass === storageClassInstance.$class.$class.$class),
                remove: total.remove.filter(renderedBuffer => renderedBuffer.storageClass === storageClassInstance.$class.$class.$class)
            })
        ).filter(({ add, remove }) => add.length > 0 || remove.length > 0)

        total_storageClassInstances.forEach(({ storageClassInstance, add, remove }) => storageClassInstance.preoptimize(add, remove))
        
        this.renderer.material.updateBacking()
        this.renderer.mesh.updateBacking()

        total_storageClassInstances.forEach(({ storageClassInstance, add, remove }) => storageClassInstance.apply(add, remove))

        this.renderer.material.updateFinal()
        this.renderer.mesh.updateFinal()
    }
}