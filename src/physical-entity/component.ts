import { Entity, GraphNode } from "playcanvas-extended";
import { textures, volumes, surfaces, solids, fields } from "../index.js"
import { octtree, processing } from "../paradigm/index.js";
import { PropertyPath, intract, pathsToNodeWithKey, mergeGroups, mergeGroupsInplace, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsProcessingContext, MultiObjectsProcessingContext, MultiObjectsProcessingContextGroupKinds, MultiObjectsProcessingContextObjectsGrouped, MultiObjectsTemplate, MultiObjectsTemplate_Leaf, MultiObjectsGroupsTemplate, MultiObjectsGroupedObjectsKey, groupKindPaths, MultiObjectsGroupsKindsTemplate_Leaf } from "../paradigm/trees/index.js";
import { IndicesT, Objects, ObjectsOtherInterpolatingGrouped, ObjectsSurfaceObjectsTexturesGrouped, OtherInterpolatingGroupsKindsT, OtherInterpolatingGroupsKindsTemplate, OtherInterpolatingGroupsT, SampleProcessingContext_MultiObjects_Template, SampleProcessingContextT, SampleT, SolidProcessingContextT, SolidT, SurfaceCombinedTextureLocationT, SurfaceObjectsTexturesGroupsT, SurfaceProcessingContext_MultiObjects_Template, SurfaceProcessingContextT, SurfaceT, Volume_Context_PreservedGroupsKindsTemplate, Volume_Sample_PreservedGroupsKindsTemplate, VolumeLocationT, VolumeProcessingContext_MultiObjects_Template, VolumeProcessingContextT, VolumeProcessingInstanceT, VolumeProcessingT, VolumeProcessorT, VolumeSampling_MultiObjects_Template, VolumeSamplingContextT, VolumeSamplingSubdividingOctTreeGroupsTemplate, VolumeSurfaceProcessorT, VolumeT } from "./types.js";
import { makeClone } from "../utils/cloneable.js";
import { onlyOne, Reflect_entries, Reflect_fromEntries, TypedArrayConstructor } from "../utils/index.js";
import { ComponentSystem, SYSTEM_ID } from "./system.js";

export class Component<ID = string> extends processing.Component<
        VolumeProcessingT,
        VolumeProcessingInstanceT,
        VolumeProcessingContextT,
        ID
    > {
    private _multiObjPath?: PropertyPath

    get multiObjPath() {
        return this._multiObjPath
    }

    volume?: VolumeT
    texturers?: textures.Texturer[]
    interpolatingGroups?: MultiObjectsGroupsTemplate[]
    extraLocationParameters?: fields.FieldsPoint
    
    //TODO: these settings should be stored in a better way
    volumeSamplingSettings?: octtree.OctTreeSubdivisionSettings
    surfaceLevel?: number

    constructor(system: ComponentSystem<ID>, entity: Entity) { 
        super(system, entity)
    }

    protected initializeProcessingFromRaw() {
        const surfaceLevel = this.surfaceLevel ?? 0.5

        const map_volume_component = new Map<VolumeT, Component<ID>>()

        function compositeVolume(node: GraphNode, require_multiObjects = false): VolumeT | undefined {
            const entity = node as Entity
            const component = entity?.findComponent(SYSTEM_ID) as Component<ID>
            
            if (component?.volume)
                map_volume_component.set(component.volume, component)

            const children = [
                ...(component?.volume ? [['$$main', component.volume]] : []),
                ...node.children
                    .filter(child => !child.name.startsWith("$$"))
                    .map(child => [
                        child.name,
                        new volumes.volumes.TransformVolumeWithBoundingBox(
                            compositeVolume(child)! as volumes.volumes.VolumeWithBoundingBox<VolumeLocationT, SampleT, SampleProcessingContextT, VolumeSamplingContextT>,
                            child.getLocalTransform()
                        )
                    ] as [string, volumes.volumes.TransformVolumeWithBoundingBox<VolumeLocationT, SampleT, SampleProcessingContextT, VolumeSamplingContextT>])
                    .filter(([, { inner }]) => inner !== undefined)
            ] as [string, VolumeT][]

            if (children.length === 0)
                return undefined
            else if (children.length === 1 && component?.volume !== undefined && !require_multiObjects)
                return children[0][1]
            else {
                return new volumes.volumes.MultiObjectsVolume(
                    Reflect_fromEntries<Record<string, VolumeT>>(children),
                    {
                        context: {
                            groupKindsTemplate: Volume_Context_PreservedGroupsKindsTemplate
                        },
                        sample: {
                            groupKindsTemplate: Volume_Sample_PreservedGroupsKindsTemplate
                        }
                    },
                    fields.MultiObjectsInfluencesGroupsDefaultTemplate
                ) as any as VolumeT
            }
        }

        const compositeVolume_final = compositeVolume(this.entity, true)!

        function assignMultiObjPaths(volume: VolumeT, path: PropertyPath) {
            if (volume instanceof volumes.volumes.TransformVolume)
                assignMultiObjPaths(volume.inner as any as VolumeT, path)
            else {
                const component = map_volume_component.get(volume)
                if (component)
                    component._multiObjPath = path
                if (volume instanceof volumes.volumes.MultiObjectsVolume)
                    for (const [key, child] of Reflect_entries(volume.children))
                        assignMultiObjPaths(child as unknown as VolumeT, [...path, key])
            }
        }

        assignMultiObjPaths(compositeVolume_final, [])

        function objectsTemplate_populate(volume: VolumeT): MultiObjectsTemplate | typeof MultiObjectsTemplate_Leaf {
            if (volume instanceof volumes.volumes.MultiObjectsVolume)
                return Reflect_fromEntries(Reflect_entries(volume.children as any).map(([key, child]) =>
                    [key, objectsTemplate_populate(child as VolumeT) as ReturnType<typeof objectsTemplate_populate>])
                ) as MultiObjectsTemplate
            else if (volume instanceof volumes.volumes.TransformVolume)
                return objectsTemplate_populate(volume.inner as unknown as VolumeT)
            return MultiObjectsTemplate_Leaf
        }

        const objectsTemplate = <MultiObjectsTemplate>objectsTemplate_populate(compositeVolume_final)

        function multiObjectsContext_insertObjects<
            Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            ObjectsGrouped extends
            MultiObjectsGrouped<Objects, Groups> =
            MultiObjectsGrouped<Objects, Groups>,
            GroupsKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
        >({
            [MultiObjectsProcessingContextObjectsGrouped]: objectsGrouped
        }: MultiObjectsProcessingContext<Objects, Groups, ObjectsGrouped, GroupsKinds>) {
            for (const path of pathsToNodeWithKey(objectsGrouped, MultiObjectsGroupedObjectsKey)) {
                intract(
                    objectsGrouped,
                    [...path, MultiObjectsGroupedObjectsKey],
                    objectsTemplate
                )
            }
        }

        function multiObjectsContext_insertGroups<
            Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            GroupsKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
        >(
            context: MultiObjectsGroupsProcessingContext<Groups, GroupsKind>,
            kind: GroupsKind,
            groups: Groups
        ) {
            const kindPath = onlyOne(groupKindPaths(kind))
            intract(context[MultiObjectsProcessingContextGroupKinds], kindPath, MultiObjectsGroupsKindsTemplate_Leaf)
            intract(context, kindPath, groups)
            mergeGroupsInplace(context, groups)
        }

        const sample_multiObjectsContext = makeClone(SampleProcessingContext_MultiObjects_Template)
        const surface_multiObjectsContext = makeClone(SurfaceProcessingContext_MultiObjects_Template)
        const volume_multiObjectsContext = makeClone(VolumeProcessingContext_MultiObjects_Template)
        const volume_sampling_multiObjectsContext = makeClone(VolumeSampling_MultiObjects_Template)

        multiObjectsContext_insertGroups(sample_multiObjectsContext, OtherInterpolatingGroupsKindsTemplate, mergeGroups(...(this.interpolatingGroups ?? [])))
        multiObjectsContext_insertGroups(surface_multiObjectsContext, OtherInterpolatingGroupsKindsTemplate, mergeGroups(...(this.interpolatingGroups ?? [])))

        multiObjectsContext_insertObjects<OtherInterpolatingGroupsT, ObjectsOtherInterpolatingGrouped, OtherInterpolatingGroupsKindsT>(sample_multiObjectsContext)
        multiObjectsContext_insertObjects<SurfaceObjectsTexturesGroupsT, ObjectsSurfaceObjectsTexturesGrouped, surfaces.texturing.SurfaceObjectsTexturesGroupKinds>(surface_multiObjectsContext)
        multiObjectsContext_insertObjects(volume_multiObjectsContext as any)

        const sample_context: SampleProcessingContextT = {
            ...sample_multiObjectsContext,
        }

        const surface_context: SurfaceProcessingContextT = {
            samples: sample_context,
            surfaceLevel,
            [textures.TexturersKey]: {
                texturers: (this.texturers ?? []) as any,
                outputs: [
                    ['material', 'textures']
                ]
            },
            material: {},
            
            ...surface_multiObjectsContext
        }

        const solid_context: SolidProcessingContextT = {
            samples: sample_context,
            surface: surface_context,
        }

        const volume_domain_sampling_context: VolumeSamplingContextT = {
            [fields.SampleDomainLocationFieldKey]: fields.fields.FieldsField.merge<VolumeLocationT>(
                volumes.defaultVolumeLocationField,
                fields.fields.defaultField(this.extraLocationParameters ?? {}) as fields.fields.FieldsField<VolumeLocationT>
            ),
            [volumes.VolumeSampleKey]: sample_context,
            [solids.VolumeSolidsKey]: {
                hints: []
            },
            [surfaces.VolumeSurfacesKey]: {
                hints: [],
                surfaceLevel
            }
        }

        const volume_sampling_context: VolumeProcessingContextT[typeof volumes.sampling.SamplingKey] = {
            ...volume_sampling_multiObjectsContext,

            [volumes.sampling.VolumeSamplingContextKey]: volume_domain_sampling_context as unknown as VolumeProcessingContextT[typeof volumes.sampling.SamplingKey][typeof volumes.sampling.VolumeSamplingContextKey],

            [octtree.SubdivisionKey]: this.volumeSamplingSettings ?? {
                indicesType: Uint32Array,
                max_depth: 8,
                recommendation_threshold: 1
            } as octtree.OctTreeSubdivisionSettings<IndicesT>
        } as VolumeProcessingContextT[typeof volumes.sampling.SamplingKey]

        const volume_context: VolumeProcessingContextT = {
            [volumes.VolumeSampleKey]: sample_context,
            [volumes.sampling.SamplingKey]: volume_sampling_context,

            [surfaces.VolumeSurfacesKey]: surface_context,

            [solids.VolumeSolidsKey]: solid_context,

            ...volume_multiObjectsContext
        }

        const volume_processing = {
            [volumes.VolumeKey]: compositeVolume_final,
            [volumes.sampling.SamplingKey]: {
                extraLocationParameters: this.extraLocationParameters ?? {},
            },
            [surfaces.VolumeSurfacesKey]: [] as SurfaceT[],
            [solids.VolumeSolidsKey]: [] as SolidT[],
        } as VolumeProcessingT

        return {
            item: volume_processing,
            context: volume_context
        }
    }
}
