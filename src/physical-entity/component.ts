import { Entity, GraphNode } from "playcanvas-extended";
import { fields, processing, solids, surfaces, textures, volumes } from "../index.js";
import { PropertyPath, intract, pathsToNodeWithKey, mergeGroups, mergeGroupsInplace, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsProcessingContext, MultiObjectsProcessingContext, MultiObjectsProcessingContextGroupKinds, MultiObjectsProcessingContextObjectsGrouped, MultiObjectsTemplate, MultiObjectsTemplate_Leaf, MultiObjectsGroupsTemplate, MultiObjectsGroupedObjectsKey, groupKindPaths, MultiObjectsGroupsKindsTemplate_Leaf } from "../paradigm/index.js";
import { Objects, ObjectsOtherInterpolatingGrouped, ObjectsSurfaceObjectsTexturesGrouped, OtherInterpolatingGroupsKindsT, OtherInterpolatingGroupsKindsTemplate, OtherInterpolatingGroupsT, SampleProcessingContext_MultiObjects_Template, SampleProcessingContextT, SampleT, SolidT, SurfaceCombinedTextureLocationT, SurfaceObjectsTexturesGroupsT, SurfaceProcessingContext_MultiObjects_Template, SurfaceProcessingContextT, SurfaceT, Volume_Context_PreservedGroupsKindsTemplate, Volume_Sample_PreservedGroupsKindsTemplate, VolumeLocationT, VolumeProcessingContext_MultiObjects_Template, VolumeProcessingContextT, VolumeProcessingInstanceT, VolumeProcessingT, VolumeProcessorT, VolumeSurfaceProcessorT, VolumeT } from "./types.js";
import { makeClone } from "../utils/cloneable.js";
import { onlyOne, Reflect_entries, Reflect_fromEntries } from "../utils/index.js";
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
    samplerSettings?: volumes.VolumeSamplerSettings
    meshingSettings?: surfaces.meshing.MeshingSettings

    constructor(system: ComponentSystem<ID>, entity: Entity) { 
        super(system, entity)
    }

    protected initializeProcessingFromRaw() {
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
                        new volumes.TransformVolume(
                            compositeVolume(child)!,
                            child.getLocalTransform()
                        )
                    ] as [string, volumes.TransformVolume<VolumeLocationT, SampleT, VolumeProcessingContextT>])
                    .filter(([, { inner }]) => inner !== undefined)
            ] as [string, VolumeT][]

            if (children.length === 0)
                return undefined
            else if (children.length === 1 && component?.volume !== undefined && !require_multiObjects)
                return children[0][1]
            else {
                return new volumes.MultiObjectsVolume(
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
            if (volume instanceof volumes.TransformVolume)
                assignMultiObjPaths(volume.inner as any as VolumeT, path)
            else {
                const component = map_volume_component.get(volume)
                if (component)
                    component._multiObjPath = path
                if (volume instanceof volumes.MultiObjectsVolume)
                    for (const [key, child] of Reflect_entries(volume.children))
                        assignMultiObjPaths(child as unknown as VolumeT, [...path, key])
            }
        }

        assignMultiObjPaths(compositeVolume_final, [])

        function objectsTemplate_populate(volume: VolumeT): MultiObjectsTemplate | typeof MultiObjectsTemplate_Leaf {
            if (volume instanceof volumes.MultiObjectsVolume)
                return Reflect_fromEntries(Reflect_entries(volume.children as any).map(([key, child]) =>
                    [key, objectsTemplate_populate(child as VolumeT) as ReturnType<typeof objectsTemplate_populate>])
                ) as MultiObjectsTemplate
            else if (volume instanceof volumes.TransformVolume)
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

        multiObjectsContext_insertGroups(sample_multiObjectsContext, OtherInterpolatingGroupsKindsTemplate, (this.interpolatingGroups ?? []).reduce(mergeGroups, {}))
        multiObjectsContext_insertGroups(surface_multiObjectsContext, OtherInterpolatingGroupsKindsTemplate, (this.interpolatingGroups ?? []).reduce(mergeGroups, {}))

        multiObjectsContext_insertObjects<OtherInterpolatingGroupsT, ObjectsOtherInterpolatingGrouped, OtherInterpolatingGroupsKindsT>(sample_multiObjectsContext)
        multiObjectsContext_insertObjects<SurfaceObjectsTexturesGroupsT, ObjectsSurfaceObjectsTexturesGrouped, surfaces.texturing.SurfaceObjectsTexturesGroupKinds>(surface_multiObjectsContext)
        multiObjectsContext_insertObjects(volume_multiObjectsContext as any)

        const sample_context: SampleProcessingContextT = {
            ...sample_multiObjectsContext,
        }

        const surface_context: SurfaceProcessingContextT = {
            samples: sample_context,
            [textures.TexturersKey]: {
                texturers: (this.texturers ?? []) as any,
                outputs: [
                    ['material', 'textures']
                ]
            },
            material: {},
            
            ...surface_multiObjectsContext
        }

        const volume_context: VolumeProcessingContextT = {
            [fields.SampleDomainLocationField]: volumes.defaultVolumeLocationField,

            [volumes.VolumeSampleKey]: sample_context,
            [volumes.VolumeSamplingKey]: {
                volume: compositeVolume_final,
                extraLocationParameters: this.extraLocationParameters,
                settings: this.samplerSettings ?? volumes.defaultVolumeSamplerSettings,
            },

            [surfaces.VolumeSurfacesKey]: surface_context,
            [surfaces.meshing.VolumeSurfaceMeshingKey]: {
                algorithm: new surfaces.meshing.SurfaceNetsMeshingAlgorithm(),
                settings: this.meshingSettings ?? surfaces.meshing.defaultMeshingSettings,
            },

            [solids.VolumeSolidsKey]: {
                samples: sample_context,
                surface: surface_context,
            },

            ...volume_multiObjectsContext
        }

        const volume_processing = {
            [surfaces.VolumeSurfacesKey]: [] as SurfaceT[],
            [solids.VolumeSolidsKey]: [] as SolidT[],
        } as VolumeProcessingT

        return {
            processing: volume_processing,
            context: volume_context
        }
    }
}
