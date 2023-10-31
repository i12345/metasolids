import { SubdivisionKey, OctTreeSubdividingProcessor, OctTreeSubdividingProcessingForSubdivisionProcessing, OctTreeSubdividingProcessingContextForSubdivisionProcessingContext } from "../../paradigm/octtree/processor.js"
import { OctTreeSpace } from "../../paradigm/octtree/space.js"
import { OctTreesTemplated } from "../../paradigm/octtree/templated.js"
import { ProcessorInitialization, Processor } from "../../paradigm/processing/processor.js"
import { EncapsulatingKey, WithEncapsulating, encapsulated } from "../../paradigm/trees/encapsulating.js"
import { MultiObjectsGroupsTemplate, MultiObjectsGroupedObjectsKey } from "../../paradigm/trees/multi-objects-groups.js"
import { TypedArray, isTypedArray } from "../../utils/index.js"
import { IndicesTypedArray } from "../../paradigm/arrays/indices-array.js"
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../volume.js"
import { VolumeProcessingWithSampling, VolumeProcessingContextWithSampling, VolumeSamplingSubdivisionProcessing, VolumeSamplingSubdivisionProcessingContext, VolumeSamplingSubdivisionProcessor, VolumeSamplingContextKey, SpaceKey, SamplingKey, SamplesKey, VolumeSamplingSubdivisionSamplesOctTreesGrouped } from "./types.js"
import { VolumeWithBoundingBox } from "../volumes/bounded.js"
import { VolumeKey } from "../processor.js"
import { VectorSampleFunction, VectorSamplingContext, makeVectorSamplingContext } from "../../fields/domains/vector.js"
import { FieldPointVector, FieldPointVectorContainerStatic, ItemObjIDsKey, ItemObjValuesOffsetsKey, field_point_vector_fill, field_point_vectorized_multi_objects_new } from "../../fields/vectorized/point.js"
import { MultiObjectsIDsKey, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js"
import { vectorIterator } from "../../fields/vectorized/iterators/factory.js"
import { SampleDomainLocationFieldKey } from "../../fields/domain.js"
import { FieldPoint, FieldPointMapped, field_point_map } from "../../fields/point.js"
import { extract, intract } from "../../paradigm/trees/tree.js"
import { TypedArrayOctTree } from "../../paradigm/octtree/typed-array.js"
import { FieldPointType, field_point_type_default } from "../../fields/type.js"

class VolumeDomainSamplingSubdivisionProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        OctTreeGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        OctTreeTGrouped extends any = any,
        OctTreeLayersGrouped extends any = any,
        OctTreesGrouped extends
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped
                > =
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped
                >,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            VolumeWithBoundingBox<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        VolumeProcessingT extends
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT//,
                    //VolumeSampleProcessingContextT//,
                    // VolumeProcessingContextT
                > =
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT//,
                    // VolumeSampleProcessingContextT//,
                    // VolumeProcessingContextT
                >,
        SubdivisionProcessingT extends
            VolumeSamplingSubdivisionProcessing<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT
                > =
            VolumeSamplingSubdivisionProcessing<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT
                >,
        SubdivisionProcessingContextT extends
            VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                > =
            VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                >
    > implements
    VolumeSamplingSubdivisionProcessor<
        IndicesT,
        OctTreeGroups,
        OctTreeTGrouped,
        OctTreeLayersGrouped,
        OctTreesGrouped,
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        VolumeProcessingT,
        VolumeProcessingContextT,
        SubdivisionProcessingT,
        SubdivisionProcessingContextT
    > {
    init(context: SubdivisionProcessingContextT): ProcessorInitialization {
        return {
            connections: {
                inputs: [
                    [EncapsulatingKey, VolumeKey],
                    [EncapsulatingKey, SamplingKey, 'extraLocationParameters']
                ],
                outputs: [[SamplesKey]]
            }
        }
    }

    process(item: SubdivisionProcessingT, context: SubdivisionProcessingContextT): void {
        type ObjIDsT = Uint32Array

        type VectorContextT = VectorSamplingContext<
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            FieldPointVectorContainerStatic,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            FieldPointVectorContainerStatic,
            MultiObjectsTemplate,
            ObjIDsT,
            FieldPointVectorContainerStatic<ObjIDsT>,
            VolumeSamplingContextT
        >

        const volume = item[EncapsulatingKey][VolumeKey]
        const samplingContext = <VectorContextT>context[VolumeSamplingContextKey]

        const extraLocationParameters = item[EncapsulatingKey][SamplingKey].extraLocationParameters

        const multiObjectsIDs = context[EncapsulatingKey][MultiObjectsIDsKey]

        if (!context[SpaceKey]) {
            samplingContext[MultiObjectsIDsKey] = multiObjectsIDs
            
            volume.init(samplingContext)

            makeVectorSamplingContext(volume.field, samplingContext, multiObjectsIDs)

            const min = volume.boundingBox.getMin()
            const max = volume.boundingBox.getMax()
            const largestDistance = Math.max(...([min.x, min.y, min.z, max.x, max.y, max.z].map(x => Math.abs(x))))

            const exponentOfTwo = Math.ceil(Math.log2(largestDistance))

            context[SpaceKey] = new OctTreeSpace(context[SubdivisionKey], exponentOfTwo)

            const context_samples = <VolumeSamplingSubdivisionSamplesOctTreesGrouped<VolumeSampleElementType>[typeof SamplesKey]>(context[SamplesKey] = <any>{})
            field_point_map<VolumeSampleElementType, FieldPointType, void>(
                <FieldPointMapped<VolumeSampleElementType, FieldPointType>>volume.field.elementType,
                type => type instanceof Function,
                (type, path) => {
                    const multiObjIndex = path.indexOf(MultiObjectsGroupedObjectsKey)
                    const nonMultiObjPath = multiObjIndex === -1 ? path : [...path.slice(0, multiObjIndex), ...path.slice(multiObjIndex + 1)]
                    const octtree = new TypedArrayOctTree(Float64Array)
                    intract(context_samples, nonMultiObjPath, octtree)
                }
            );
            (<any>context_samples)[ItemObjIDsKey] = new TypedArrayOctTree<number, ObjIDsT>(multiObjectsIDs.IDsType);
            (<any>context_samples)[ItemObjValuesOffsetsKey] = new TypedArrayOctTree(Uint32Array);
        }

        //TODO: using separate typed arrays mapped by groups for many field points at once will make this much faster and more memory-efficient
        const subdivision = context[SubdivisionKey]
        const layer = subdivision.depth
        const new_voxels = subdivision.layer_sizes.at(-1)!
        const space = context[SpaceKey]

        const local_indices = new subdivision.typedArray(new_voxels)
        for (let local_index = 0; local_index < local_indices.length; local_index++)
            local_indices[local_index] = local_index

        const positions = OctTreeSpace.vectorized.positionOfVoxel.layers_same.call(space, layer, local_indices)
        space.positions.layers.push(positions)

        let locations: FieldPointVector<VolumeLocationElementType, FieldPointVectorContainerStatic<Float64Array>>
        
        if (extraLocationParameters) {
            const extraLocations_type = field_point_type_default(<FieldPoint>extraLocationParameters)
            locations = <typeof locations><unknown>field_point_vectorized_multi_objects_new<FieldPoint, FieldPointVectorContainerStatic<Float64Array>, ObjIDsT>(extraLocations_type, new_voxels, <any>false, multiObjectsIDs?.IDsType)
            field_point_vector_fill(extraLocations_type, extraLocations_type, locations, <FieldPoint>extraLocationParameters, multiObjectsIDs)
        }
        else locations = <typeof locations>{ }

        locations.p = positions

        const samples = samplingContext[VectorSampleFunction](volume, <FieldPointVector<VolumeLocationElementType, FieldPointVectorContainerStatic<Float64Array>>>locations, samplingContext)
        item.samples = samples

        const context_samples = <VolumeSamplingSubdivisionSamplesOctTreesGrouped<VolumeSampleElementType>>context.samples
        field_point_map<VolumeSampleElementType, TypedArray, void>(
            samples,
            array => isTypedArray(array),
            (array, path) => {
                const multiObjIndex = path.indexOf(MultiObjectsGroupedObjectsKey)
                const nonMultiObjPath = multiObjIndex === -1 ? path : [...path.slice(0, multiObjIndex), ...path.slice(multiObjIndex + 1)]
                const octtree = extract<TypedArrayOctTree>(context_samples, nonMultiObjPath)
                octtree.layers.push(array)
            }
        );
        (<TypedArrayOctTree<number, ObjIDsT>>(<any>context_samples)[ItemObjIDsKey]).layers.push((<any>samples)[ItemObjIDsKey]);
        (<TypedArrayOctTree<number, Uint32Array>>(<any>context_samples)[ItemObjValuesOffsetsKey]).layers.push((<any>samples)[ItemObjValuesOffsetsKey]);
    }

    static readonly instance = new this()
}

export class VolumeSamplingSubdividingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        OctTreeGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        OctTreeTGrouped extends any = any,
        OctTreeLayersGrouped extends any = any,
        OctTreesGrouped extends
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped
                > =
            OctTreesTemplated<
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped
                >,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            VolumeWithBoundingBox<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        VolumeProcessingT extends
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT//,
                    //VolumeSampleProcessingContextT//,
                    // VolumeProcessingContextT
                > =
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT//,
                    // VolumeSampleProcessingContextT//,
                    // VolumeProcessingContextT
                >,
        SubdivisionProcessingT extends
            VolumeSamplingSubdivisionProcessing<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT
                > =
            VolumeSamplingSubdivisionProcessing<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT
                >,
        SubdivisionProcessingContextT extends
            VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                > =
            VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                >,
        SubdivisionProcessorT extends
            VolumeSamplingSubdivisionProcessor<
                    IndicesT,
                    OctTreeGroups,
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
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
                    OctTreeTGrouped,
                    OctTreeLayersGrouped,
                    OctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
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
                        OctTreeTGrouped,
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
                        OctTreeTGrouped,
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
                        OctTreeTGrouped,
                        OctTreeLayersGrouped,
                        OctTreesGrouped,
                        SubdivisionProcessingContextT
                    >

        const subdivisionItem = encapsulated(item[SamplingKey], item) as SubdividingProcessingT
        const subdivisionContext = encapsulated(context[SamplingKey], context) as SubdividingProcessingContextT

        this.subdivisionProcessor.process(subdivisionItem as any, subdivisionContext)

        item[SamplingKey][SpaceKey] = subdivisionContext[SpaceKey]
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