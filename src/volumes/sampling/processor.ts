import { SampleDomain_vectorized } from "../../fields/domain.js"
import { SubdivisionKey, OctTreeSubdividingProcessor, OctTreeSubdividingProcessingForSubdivisionProcessing, OctTreeSubdividingProcessingContextForSubdivisionProcessingContext } from "../../paradigm/octtree/processor.js"
import { OctTreeSpace } from "../../paradigm/octtree/space.js"
import { ArrayLikeTemplated, OctTreesTemplated } from "../../paradigm/octtree/templated.js"
import { ProcessorInitialization, Processor } from "../../paradigm/processing/processor.js"
import { EncapsulatingKey, WithEncapsulating, encapsulated } from "../../paradigm/trees/encapsulating.js"
import { MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate_Leaf, groupPaths } from "../../paradigm/trees/multi-objects-groups.js"
import { OctTree } from "../../utils/index.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../volume.js"
import { VolumeProcessingWithSampling, VolumeProcessingContextWithSampling, VolumeSamplingSubdivisionProcessing, VolumeSamplingSubdivisionProcessingContext, VolumeSamplingSubdivisionProcessor, VolumeSamplingSubdivisionSamplesGroups, VolumeSamplingContextKey, SpaceKey, SamplingKey } from "./types.js"
import { VolumeWithBoundingBox } from "../volumes/bounded.js"
import { VolumeKey } from "../processor.js"
import { Vec3 } from "playcanvas-extended"

class VolumeDomainSamplingSubdivisionProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        OctTreeGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        OctTreeT = any,
        OctTreeTGrouped extends
            MultiObjectsGroupsMapped<
                    OctTreeGroups,
                    OctTreeT
                > =
            MultiObjectsGroupsMapped<
                    OctTreeGroups,
                    OctTreeT
                >,
        OctTreeLayer extends ArrayLike<OctTreeT> = ArrayLike<OctTreeT>,
        OctTreeLayersGrouped extends
            // MultiObjectsGroupsMapped<
            //         OctTreeGroups,
            //         OctTreeLayer
            //     > &
            ArrayLikeTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped
                > =
            // MultiObjectsGroupsMapped<
            //         OctTreeGroups,
            //         OctTreeLayer
            //     > &
            ArrayLikeTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped
                >,
        OctTreesGrouped extends
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped
                > =
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped
                >,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT//,
                    //VolumeSampleProcessingContextT//,
                    // VolumeProcessingContextT
                > =
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT//,
                    // VolumeSampleProcessingContextT//,
                    // VolumeProcessingContextT
                >,
        SubdivisionProcessingT extends
            VolumeSamplingSubdivisionProcessing<
                    IndicesT,    
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT
                > =
            VolumeSamplingSubdivisionProcessing<
                    IndicesT,    
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT
                >,
        SubdivisionProcessingContextT extends
            VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                > =
            VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                >
    > implements
    VolumeSamplingSubdivisionProcessor<
        IndicesT,
        OctTreeGroups,
        OctTreeT,
        OctTreeTGrouped,
        OctTreeLayer,
        OctTreeLayersGrouped,
        OctTreesGrouped,
        VolumeLocationT,
        VolumeSampleT,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        VolumeProcessingT,
        VolumeProcessingContextT,
        SubdivisionProcessingT,
        SubdivisionProcessingContextT
    > {
    init(context: SubdivisionProcessingContextT): ProcessorInitialization {
        //TODO: replace with separate oct trees per field
        const volumeSamplingSubdivisionSamplesGroupsTemplate: VolumeSamplingSubdivisionSamplesGroups<VolumeSample> = {
            samples: MultiObjectsGroupsTemplate_Leaf
        }

        return {
            connections: {
                inputs: [
                    [EncapsulatingKey, VolumeKey],
                    [EncapsulatingKey, SamplingKey, 'extraLocationParameters']
                ],
                outputs: [...groupPaths(volumeSamplingSubdivisionSamplesGroupsTemplate)]
            }
        }
    }

    process(item: SubdivisionProcessingT, context: SubdivisionProcessingContextT): void {
        const volume = item[EncapsulatingKey][VolumeKey]
        const samplingContext = context[VolumeSamplingContextKey]

        const extraLocationParameters = item[EncapsulatingKey][SamplingKey].extraLocationParameters

        if (!context[SpaceKey]) {
            volume.init(samplingContext)

            const min = volume.boundingBox.getMin()
            const max = volume.boundingBox.getMax()
            const largestDistance = Math.max(...([min.x, min.y, min.z, max.x, max.y, max.z].map(x => Math.abs(x))))

            const exponentOfTwo = Math.ceil(Math.log2(largestDistance))
            
            context[SpaceKey] = new OctTreeSpace(context[SubdivisionKey], exponentOfTwo)
            context.samples = new OctTree()
        }

        //TODO: using separate typed arrays mapped by groups for many field points at once will make this much faster and more memory-efficient
        const subdivision = context[SubdivisionKey]
        const layer = subdivision.depth
        const new_voxels = subdivision.layer_sizes.at(-1)!
        const locations = new Array<VolumeLocationT>(new_voxels)
        const space = context[SpaceKey]
        
        const local_indices = new subdivision.typedArray(new_voxels)
        for (let local_index = 0; local_index < local_indices.length; local_index++)
            local_indices[local_index] = local_index
        
        const positions_v3 = OctTreeSpace.vectorized.positionOfVoxel.layers_same.call(space, layer, local_indices)
        const positions = space.positions.subdivide(3 * new_voxels)

        for (let local_index = 0; local_index < locations.length; local_index++) {
            const position_v3 = positions_v3[local_index]

            positions[(3 * local_index) + 0] = position_v3.x
            positions[(3 * local_index) + 1] = position_v3.y
            positions[(3 * local_index) + 2] = position_v3.z

            locations[local_index] = {
                p: position_v3,
                ...extraLocationParameters
            } as VolumeLocationT
        }

        const samples = SampleDomain_vectorized.sample(volume, locations, samplingContext)
        item.samples = samples
        context.samples.layers.push(samples)
    }

    static readonly instance = new this()
}

export class VolumeSamplingSubdividingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        OctTreeGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        OctTreeT = any,
        OctTreeTGrouped extends
            MultiObjectsGroupsMapped<
                    OctTreeGroups,
                    OctTreeT
                > =
            MultiObjectsGroupsMapped<
                    OctTreeGroups,
                    OctTreeT
                >,
        OctTreeLayer extends ArrayLike<OctTreeT> = ArrayLike<OctTreeT>,
        OctTreeLayersGrouped extends
            // MultiObjectsGroupsMapped<
            //         OctTreeGroups,
            //         OctTreeLayer
            //     > &
            ArrayLikeTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped
                > =
            // MultiObjectsGroupsMapped<
            //         OctTreeGroups,
            //         OctTreeLayer
            //     > &
            ArrayLikeTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped
                >,
        OctTreesGrouped extends
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped
                > =
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped
                >,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > =
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                >,
        SubdivisionProcessingT extends
            VolumeSamplingSubdivisionProcessing<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,    
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT
                > =
            VolumeSamplingSubdivisionProcessing<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT
                >,
        SubdivisionProcessingContextT extends
            VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                > =
            VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                >,
        SubdivisionProcessorT extends
            VolumeSamplingSubdivisionProcessor<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT,
                    VolumeProcessingContextT,
                    SubdivisionProcessingT,
                    SubdivisionProcessingContextT
                > =
            VolumeSamplingSubdivisionProcessor<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeT,
                    OctTreeTGrouped,
                    OctTreeLayer,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT,
                    VolumeProcessingContextT,
                    SubdivisionProcessingT,
                    SubdivisionProcessingContextT
                >
    > implements
    Processor<VolumeProcessingT, VolumeProcessingContextT> {
    readonly subdivisionProcessor = new OctTreeSubdividingProcessor//<
            // IndicesT,
            // OctTreeGroups,
            // OctTreeT,
            // OctTreeTGrouped,
            // OctTreeLayer,
            // OctTreeLayersGrouped,
            // OctTreesGrouped,
            // VolumeProcessingT[typeof SamplingKey] &
            //     WithEncapsulating<VolumeProcessingT> &
            //     OctTreeSubdividingProcessingForSubdivisionProcessing<
            //             IndicesT,
            //             OctTreeGroups,
            //             OctTreeT,
            //             OctTreeTGrouped,
            //             OctTreeLayer,
            //             OctTreeLayersGrouped,
            //             OctTreesGrouped,
            //             SubdivisionProcessingT
            //         >,
            // VolumeProcessingContextT[typeof SamplingKey] &
            //     WithEncapsulating<VolumeProcessingContextT> & {
            //             [SpaceKey]: OctTreeSpace<IndicesT>
            //         } &
            //     OctTreeSubdividingProcessingContextForSubdivisionProcessingContext<
            //             IndicesT,
            //             OctTreeGroups,
            //             OctTreeT,
            //             OctTreeTGrouped,
            //             OctTreeLayer,
            //             OctTreeLayersGrouped,
            //             OctTreesGrouped,
            //             SubdivisionProcessingContextT
            //         > //,
            // // SubdivisionProcessingT,
            // // SubdivisionProcessingContextT
        //>
        (
            [
                VolumeDomainSamplingSubdivisionProcessor.instance,
                ...this.processors
            ] as any[]
        )

    constructor(public readonly processors: SubdivisionProcessorT[]) {
    }

    init(context: VolumeProcessingContextT): ProcessorInitialization {
        type SubdividingProcessingContextT =
            VolumeProcessingContextT[typeof SamplingKey] &
                WithEncapsulating<VolumeProcessingContextT> & {
                        [SpaceKey]: OctTreeSpace<IndicesT>
                    } &
                OctTreeSubdividingProcessingContextForSubdivisionProcessingContext<
                        IndicesT,
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped,
                        OctTreeLayer,
                        OctTreeLayersGrouped,
                        OctTreesGrouped,
                        SubdivisionProcessingContextT
                    >
        
        ///@ts-ignore
        const subdivisionContext = encapsulated(context[SamplingKey], context) as SubdividingProcessingContextT

        const initialization = this.subdivisionProcessor.init(subdivisionContext)

        return {
            ...initialization,
            connections: {
                inputs: initialization.connections.inputs.map(path => [SamplingKey, ...path]),
                outputs: [[SpaceKey], ...initialization.connections.outputs].map(path => [SamplingKey, ...path])
            }
        }
    }

    process(item: VolumeProcessingT, context: VolumeProcessingContextT): void {
        type SubdividingProcessingT = VolumeProcessingT[typeof SamplingKey] &
                WithEncapsulating<VolumeProcessingT> &
                OctTreeSubdividingProcessingForSubdivisionProcessing<
                        IndicesT,
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped,
                        OctTreeLayer,
                        OctTreeLayersGrouped,
                        OctTreesGrouped,
                        SubdivisionProcessingT
                    >
        
        type SubdividingProcessingContextT =
            VolumeProcessingContextT[typeof SamplingKey] &
                WithEncapsulating<VolumeProcessingContextT> & {
                        [SpaceKey]: OctTreeSpace<IndicesT>
                    } &
                OctTreeSubdividingProcessingContextForSubdivisionProcessingContext<
                        IndicesT,
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped,
                        OctTreeLayer,
                        OctTreeLayersGrouped,
                        OctTreesGrouped,
                        SubdivisionProcessingContextT
                    >
        
        const subdivisionItem = encapsulated(item[SamplingKey], item) as SubdividingProcessingT
        const subdivisionContext = encapsulated(context[SamplingKey], context) as SubdividingProcessingContextT
        
        this.subdivisionProcessor.process(subdivisionItem as any, subdivisionContext)
    }
}

/**
 * Adaptive sampling:
 * Start with a single cell
 * Compute surfaces from voxels
 * Collide surfaces with voxels
 *   Any voxels intersected by the surface are candidates for further subdivision
 *     (The surface sample positions are made from midpoints of the voxels)
 *     Possibly their neighbor voxels should also be subdivided
 *   If round > 0:
 *     Compare difference between old surfaces collision and current surfaces collision
 *     Penalty increases for each voxel that has no difference
 * For each volume hint point (metasolids will generate these):
 *   Ensure hint is in a voxel with presence. If not, then it is a subdivision candidate
 * For each voxel that is a subdivision candidate:
 *   If its penalty >= penalty_limit: do not subdivide
 *   Else: subdivide and sample (penalty is inherited)
 *     TODO: consider how surface meshing algorithm can be integrated,
 *       since only some voxels were subdivided.
 *       There is no need to have high quality mesh where there are low-quality voxels
 *       However, actually for soft bodies, don't we want evenly sampled meshes?
 *       A decimation algorithm can reduce this for rendering and rigid bodies
 * Repeat until subdivision_limit reached
 * 
 * Paper-thin sampling:
 * Filter metasolids: select those with at least one volume hint point
 *   that does not have presence in its corresponding voxel
 * Gather their surface hint points, aggregate by approximate intersection
 * Sample surface points to make surfaces with no volume
 */

/**
 * Extensible adaptive sampling:
 * 
 * Subdivision advisors:
 * - give advice whether to subdivide
 * - compute penalty after
 * 
 * Some subdivision advisors:
 *   Surface
 *   - compute surface
 *   - recommend subdivision for each voxel that intersects surface
 *   - could have adaptive surface building
 *   - compute penalty if not first round
 *   ----
 *   SurfaceMeshing processor injects this subdivision advisor
 *   If, in process(), it detects that subdivision advisor already meshed surfaces,
 *   then the processor will not need to.
 *   Either way, it will still test for paper-thin surfaces.
 *   
 *   Volume hint points
 *   - wherever an interior hint point is, if the voxel does not have presence, recommend subdivision
 */