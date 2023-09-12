import { Entity, GraphNode, Vec3 } from "playcanvas-extended";
import { textures, volumes, surfaces, solids, fields } from "../index.js"
import { octtree, processing } from "../paradigm/index.js";
import { PropertyPath, intract, pathsToNodeWithKey, mergeGroups, mergeGroupsInplace, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsProcessingContext, MultiObjectsProcessingContext, MultiObjectsProcessingContextGroupKinds, MultiObjectsProcessingContextObjectsGrouped, MultiObjectsTemplate, MultiObjectsTemplate_Leaf, MultiObjectsGroupsTemplate, MultiObjectsGroupedObjectsKey, groupKindPaths, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsTemplateOrLeaf, MultiObjectsMappedOrLeaf, MultiObjectsIDs, MultiObjectsIDsKey, extract, mapGroups } from "../paradigm/trees/index.js";
import { IndicesT, Objects, ObjectsOtherInterpolatingGrouped, ObjectsSurfaceObjectsTexturesGrouped, OtherInterpolatingGroupsKindsT, OtherInterpolatingGroupsKindsTemplate, OtherInterpolatingGroupsT, SampleProcessingContext_MultiObjects_Template, SampleProcessingContextT, SampleT, SolidProcessingContextT, SolidT, SurfaceObjectsTexturesGroupsT, SurfaceProcessingContext_MultiObjects_Template, SurfaceProcessingContextT, SurfaceT, VolumeDomain_SamplingContext_PreservedGroupsKindsTemplate, Volume_Sample_PreservedGroupsKindsTemplate, VolumeLocationT, VolumeProcessingContext_MultiObjects_Template, VolumeProcessingContextT, VolumeProcessingInstanceT, VolumeProcessingT, VolumeDomainSamplingContext_MultiObjects_Template, VolumeDomainSamplingContextT, VolumeT, VolumeSamplingContext_MultiObjects_Template, SurfaceIndividualTextureLocationsGroupsField, SurfaceObjectsTextureLocationsGroupsField, ObjIDsT, ObjIDsType, SurfaceTextureLocationsGroupsFields, SampleElementType, SampleFuseMode, ObjIDsContainer, Volume_Sample_PreservedGroupsKindsT, Volume_Sample_PreservedGroupsT, VolumeDomain_SamplingContext_PreservedGroupsT, Volume_Context_PreservedGroupsKinds, VolumeLocationElementType, VolumeLocationFuseMode } from "./types.js";
import { makeClone } from "../utils/cloneable.js";
import { onlyOne, Reflect_entries, Reflect_fromEntries } from "../utils/index.js";
import { ComponentSystem, SYSTEM_ID } from "./system.js";
import { defaultVolumeSampleField } from "../volumes/volume.js";
import { GroupWithField } from "../fields/processing.js";

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

        type MultiObjPrerender = MultiObjectsMappedOrLeaf<MultiObjectsTemplateOrLeaf, symbol>
        type ChildVolumeSampleT = SampleFuseMode

        class VolumeNode {
            private readonly sym = Symbol()

            constructor(
                public readonly node: GraphNode,
                public readonly children: VolumeNode[]
            ) { }

            prerender(require_multiObjects = false): MultiObjPrerender | undefined {
                const entity = this.node as Entity
                const component = entity?.c[SYSTEM_ID] as Component<ID>

                const children = [
                    ...(component?.volume ? [['$$main', this.sym]] : []),
                    ...this.children
                        .map(child => [
                            child.node.name,
                            child.prerender()
                        ] as [string, MultiObjPrerender | undefined])
                        .filter(([, prerender]) => prerender)
                ] as [string, MultiObjPrerender][]

                if (children.length === 0)
                    return undefined
                else if (children.length === 1 && component?.volume !== undefined && !require_multiObjects)
                    return children[0][1]
                else return Reflect_fromEntries<MultiObjPrerender>(<any>children)
            }

            static multiObjectIDs(prerendering: MultiObjPrerender) {
                const multiObjectsIDs: MultiObjectsIDs<Objects, ObjIDsT> = {
                    template: {},
                    IDs: {},
                    IDsType: ObjIDsType,
                    paths: [],
                }

                const pathsMap = new Map<symbol, PropertyPath>()

                let id_next = 0

                function recurse(prerendering: MultiObjPrerender, path: PropertyPath) {
                    if (typeof prerendering === 'symbol') {
                        pathsMap.set(prerendering, path)
                        intract(multiObjectsIDs.IDs, path, id_next++)
                        intract(multiObjectsIDs.template, path, MultiObjectsTemplate_Leaf)
                        multiObjectsIDs.paths.push(path)
                    }
                    else Reflect.ownKeys(prerendering).forEach(key => recurse(prerendering[key], [...path, key]))
                }
                recurse(prerendering, [])

                return { multiObjectsIDs, pathsMap }
            }

            assignPaths(pathsMap: Map<symbol, PropertyPath>) {
                const path = pathsMap.get(this.sym)
                if (path !== undefined) {
                    const entity = this.node as Entity
                    const component = entity!.c[SYSTEM_ID] as Component<ID>
                    component._multiObjPath = path
                }

                for (const child of this.children)
                    child.assignPaths(pathsMap)
            }

            render(
                    childVolumeSampleField: fields.Field<ChildVolumeSampleT>,
                    require_multiObjects = false
                ): VolumeT | undefined {
                const entity = this.node as Entity
                const component = entity?.c[SYSTEM_ID] as Component<ID>

                if (component?.volume)
                    map_volume_component.set(component.volume, component)

                const children = [
                    ...(component?.volume ? [['$$main', component.volume]] : []),
                    ...this.children
                        .map(child => [
                            child.node.name,
                            new volumes.volumes.TransformVolume(
                                child.render(childVolumeSampleField)! as VolumeT,
                                child.node.getLocalTransform()
                            )
                        ] as [string, volumes.volumes.TransformVolume])
                        .filter(([, { inner }]) => inner !== undefined)
                ] as [string, VolumeT][]

                if (children.length === 0)
                    return undefined
                else if (children.length === 1 && component?.volume !== undefined && !require_multiObjects)
                    return children[0][1]
                else {
                    return new volumes.volumes.MultiObjectsVolume
                        // <
                        //     Objects,
                        //     ObjIDsT,
                        //     ObjIDsContainer,
                        //     Volume_Sample_PreservedGroupsT,
                        //     Volume_Sample_PreservedGroupsKindsT,
                        //     Volume_Context_PreservedGroupsT,
                        //     Volume_Context_PreservedGroupsKinds,
                        //     VolumeLocationT,
                        //     VolumeLocationElementType,
                        //     VolumeLocationFuseMode,
                        //     VolumeLocationContainer,
                        //     SampleProcessingContextT,
                        //     SampleFuseMode,
                        // >
                        (
                        Reflect_fromEntries<Record<string, VolumeT>>(children),
                        {
                            context: {
                                groupKindsTemplate: VolumeDomain_SamplingContext_PreservedGroupsKindsTemplate
                            },
                            sample: {
                                groupKindsTemplate: Volume_Sample_PreservedGroupsKindsTemplate
                            }
                        },
                        childVolumeSampleField,
                        fields.MultiObjectsInfluencesGroupsDefaultTemplate
                    ) as any as VolumeT
                }
            }

            static construct(node: GraphNode, isRoot = false): VolumeNode | undefined {
                if (node.name.startsWith("$$"))
                    return undefined

                const entity = node as Entity
                const component = entity?.c[SYSTEM_ID] as Component<ID>

                component.updateRoot()
                if (component.isRoot && !isRoot)
                    return undefined

                return new VolumeNode(
                    node,
                    node.children.map(child => this.construct(child)).filter<VolumeNode>((node): node is VolumeNode => node !== undefined)
                )
            }
        }

        const volumeNode = VolumeNode.construct(this.entity, true)
        if (!volumeNode)
            return undefined

        const prerendering = volumeNode.prerender(true)
        if (prerendering === undefined)
            return undefined
            
        const { multiObjectsIDs, pathsMap } = VolumeNode.multiObjectIDs(prerendering)
        volumeNode.assignPaths(pathsMap)

        const volumeSampleField = fields.fields.FieldsField.merge<ChildVolumeSampleT>(
            <fields.fields.FieldsField<ChildVolumeSampleT>>defaultVolumeSampleField,
            new fields.fields.FieldsField<ChildVolumeSampleT>(<any>{
                ...mapGroups(
                    fields.MultiObjectsInfluencesGroupsDefaultTemplate,
                    () => fields.fields.ScalarField.instance
                ),
                ...mapGroups(
                    surfaces.texturing.SurfaceObjectsTextureLocationsGroupsDefaultTemplate,
                    () => textures.defaultTextureLocationField
                )
                // ...fields.MultiObjectsInfluencesGroupsDefaultField(multiObjectsIDs),
                // ...SurfaceTextureLocationsGroupsFields(multiObjectsIDs),
            })
        )

        const compositeVolume_final = volumeNode.render(volumeSampleField, true)!

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

        function updateFieldMultiObjIDs(field: fields.Field) {
            if (field instanceof fields.fields.MultiObjectsField)
                field.multiObjectsIDs = multiObjectsIDs
            else if (field instanceof fields.fields.FieldsField) {
                fields.fields_point_map(
                    field.fields,
                    leaf => leaf.interpolationType && fields.makeInterpolator in leaf.interpolationType,
                    subfield => updateFieldMultiObjIDs(subfield)
                )
            }
        }

        function multiObjectsContext_insertObjects<
                Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
                ObjectsGrouped extends
                MultiObjectsGrouped<Objects, Groups> =
                MultiObjectsGrouped<Objects, Groups>,
                GroupsKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
            >(context: MultiObjectsProcessingContext<Objects, Groups, ObjectsGrouped, GroupsKinds>) {
            const {
                [MultiObjectsProcessingContextObjectsGrouped]: objectsGrouped
            } = context

            for (const path of pathsToNodeWithKey(objectsGrouped, MultiObjectsGroupedObjectsKey)) {
                intract(
                    objectsGrouped,
                    [...path, MultiObjectsGroupedObjectsKey],
                    objectsTemplate
                )

                const field = extract<GroupWithField>(context, path)
                if (field[fields.GroupFieldKey])
                    updateFieldMultiObjIDs(field[fields.GroupFieldKey])
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
        const volume_sampling_multiObjectsContext = makeClone(VolumeSamplingContext_MultiObjects_Template)
        const volume_domain_sampling_multiObjectsContext = makeClone(VolumeDomainSamplingContext_MultiObjects_Template)

        multiObjectsContext_insertGroups(sample_multiObjectsContext, OtherInterpolatingGroupsKindsTemplate, mergeGroups(...(this.interpolatingGroups ?? [])))
        multiObjectsContext_insertGroups(surface_multiObjectsContext, OtherInterpolatingGroupsKindsTemplate, mergeGroups(...(this.interpolatingGroups ?? [])))

        multiObjectsContext_insertObjects<OtherInterpolatingGroupsT, ObjectsOtherInterpolatingGrouped, OtherInterpolatingGroupsKindsT>(sample_multiObjectsContext)
        multiObjectsContext_insertObjects<SurfaceObjectsTexturesGroupsT, ObjectsSurfaceObjectsTexturesGrouped, surfaces.texturing.SurfaceObjectsTexturesGroupKinds>(surface_multiObjectsContext)
        multiObjectsContext_insertObjects(volume_multiObjectsContext)

        const sample_context = <SampleProcessingContextT>{
            ...sample_multiObjectsContext,

            [MultiObjectsIDsKey]: multiObjectsIDs,
            // ...fields.MultiObjectsInfluencesGroupsDefaultField<Objects, ObjIDsT>(multiObjectsIDs),
            // ...SurfaceTextureLocationsGroupsFields(multiObjectsIDs),
        }

        const surface_context: SurfaceProcessingContextT = {
            ...surface_multiObjectsContext,

            [MultiObjectsIDsKey]: multiObjectsIDs,
            samples: sample_context,
            surfaceLevel,
            [textures.TexturersKey]: {
                texturers: (this.texturers ?? []) as any,
                outputs: [
                    ['material', 'textures']
                ]
            },
            material: {
                textures: surfaces.rendering.material.Material_Groups_TextureContexts_Template
            },
        }

        const solid_context: SolidProcessingContextT = {
            samples: sample_context,
            surface: surface_context,
        }

        const volume_domain_sampling_context: VolumeDomainSamplingContextT = {
            ...volume_domain_sampling_multiObjectsContext,

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
            ...volume_multiObjectsContext,

            [MultiObjectsIDsKey]: multiObjectsIDs,
            [volumes.VolumeSampleKey]: sample_context,
            [volumes.sampling.SamplingKey]: volume_sampling_context,
            [surfaces.VolumeSurfacesKey]: surface_context,
            [solids.VolumeSolidsKey]: solid_context,
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
