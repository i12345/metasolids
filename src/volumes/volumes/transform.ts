import { Mat4, BoundingBox, Vec3 } from 'playcanvas-extended'
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from '../volume.js'
import { TransformingDefaultInnerSamplingContext, TransformingSampleDomain } from '../../fields/domains/transforming.js'
import { VolumeWithBoundingBox } from './bounded.js'
import { SampleDomainLocationFieldKey } from '../../fields/domain.js'
import { FusedVectorSamplingContext } from '../../fields/domains/fusing.js'
import { FusingFieldPointVectorWithMultiObjects, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, FieldPointVector, isDynamicVector, field_point_vectorized_new, FieldPointVectorContainerDynamic } from '../../fields/vectorized/index.js'
import { MultiObjectsGroupsTemplate_Leaf, MultiObjectsIDsKey, MultiObjectsTemplate, groupsProxyOverwritten } from '../../paradigm/trees/index.js'
import { IndicesTypedArray } from '../../utils/indices-array.js'
import { vectorIterator } from '../../fields/vectorized/iterators/factory.js'
import { vectorized } from 'vectorized-functions'
import { FieldsField } from '../../fields/fields/fields.js'
import { FieldPointType } from '../../fields/type.js'

export class TransformVolume<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        Location extends VolumeLocation = VolumeLocation,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends VolumeSample = VolumeSample,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleProcessingContextT = any,
        Context extends
            VolumeSamplingContext<Location, SampleProcessingContextT> =
            VolumeSamplingContext<Location, SampleProcessingContextT>,
        LocationVector extends
            FieldPointVector<Location, LocationContainer> =
            FieldPointVector<Location, LocationContainer>,
        SampleVector extends 
            FieldPointVectorWithMultiObjects<
                    Sample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    Sample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
                FusedVectorSamplingContext<
                        Location,
                        LocationContainer,
                        Sample,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        Context,
                        LocationVector,
                        SampleVector
                    > =
                FusedVectorSamplingContext<
                        Location,
                        LocationContainer,
                        Sample,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        Context,
                        LocationVector,
                        SampleVector
                    >,
        VolumeT extends
            Volume<
                    Location,
                    Sample,
                    SampleProcessingContextT,
                    Context
                > =
            Volume<
                    Location,
                    Sample,
                    SampleProcessingContextT,
                    Context
                >,
    > extends
    TransformingSampleDomain<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            
            Location,
            LocationContainer,
            Sample,
            SampleContainer,
            Context,
            LocationVector,
            SampleVector,
            VectorContext,
            
            Location,
            LocationContainer,
            Sample,
            SampleContainer,
            Context,
            LocationVector,
            SampleVector,
            VectorContext
        >
    implements VolumeWithBoundingBox<Location, Sample, SampleProcessingContextT, Context> {
    private transformInverse = new Mat4()
    readonly boundingBox = new BoundingBox(new Vec3(NaN, NaN, NaN), new Vec3(NaN, NaN, NaN))

    protected readonly transformsLocation = true
    protected readonly transformsSample = true
    
    constructor(
        public inner: VolumeT,
        public transform: Mat4
    ) {
        super(inner)
    }
    
    init(context: Context) {
        this.transformInverse.copy(this.transform).invert()
    
        const innerBoundingBox = <VolumeWithBoundingBox><unknown>this.inner
        if (innerBoundingBox.boundingBox)
            this.boundingBox.setFromTransformedAabb(innerBoundingBox.boundingBox, this.transform)

        super.init(context)
    }

    @vectorized(TransformVolume.transformLocation_vectorized)
    protected transformLocation(location: Location) {
        return {
            ...location,
            p: this.transformInverse.transformPoint(location.p)
        }
    }

    private static transformLocation_vectorized<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        Location extends VolumeLocation = VolumeLocation,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends VolumeSample = VolumeSample,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleProcessingContextT = any,
        Context extends
        VolumeSamplingContext<Location, SampleProcessingContextT> =
        VolumeSamplingContext<Location, SampleProcessingContextT>,
        LocationVector extends
        FieldPointVector<Location, LocationContainer> =
        FieldPointVector<Location, LocationContainer>,
        SampleVector extends
        FieldPointVectorWithMultiObjects<
            Sample,
            SampleContainer,
            ObjIDsT,
            ObjIDsContainer
        > =
        FieldPointVectorWithMultiObjects<
            Sample,
            SampleContainer,
            ObjIDsT,
            ObjIDsContainer
        >,
        VectorContext extends
        FusedVectorSamplingContext<
            Location,
            LocationContainer,
            Sample,
            SampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            Context,
            LocationVector,
            SampleVector
        > =
        FusedVectorSamplingContext<
            Location,
            LocationContainer,
            Sample,
            SampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            Context,
            LocationVector,
            SampleVector
        >,
        VolumeT extends
        Volume<
            Location,
            Sample,
            SampleProcessingContextT,
            Context
        > =
        Volume<
            Location,
            Sample,
            SampleProcessingContextT,
            Context
        >,
    >(
        this: TransformVolume<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            Location,
            LocationContainer,
            Sample,
            SampleContainer,
            SampleProcessingContextT,
            Context,
            LocationVector,
            SampleVector,
            VectorContext,
            VolumeT
        >,
        outerLocations: LocationVector,
        context: { outer: VectorContext, inner: VectorContext }
    ): LocationVector {
        const transform_inverse = this.transformInverse
        const isDynamic_locations = isDynamicVector<Location, LocationContainer>(outerLocations)
        const location_vectorIterator = vectorIterator(
            context.outer[SampleDomainLocationFieldKey].elementType,
            isDynamic_locations,
            context.outer[MultiObjectsIDsKey]
        )
        const length = location_vectorIterator.length(outerLocations, outerLocations)
        
        const p_local = field_point_vectorized_new<VolumeLocation["p"]>(
            <FieldPointType<VolumeLocation["p"]>>(<FieldsField<VolumeLocation>><unknown>context.inner[SampleDomainLocationFieldKey]).fields.p.elementType,
            length,
            isDynamic_locations
        )
        
        const p_world = outerLocations.p
        
        const innerLocations = <LocationVector>groupsProxyOverwritten(
            { p: MultiObjectsGroupsTemplate_Leaf },
            outerLocations,
            { p: p_local }
        )
        
        let p_i_world = 0
        let p_i_local = 0
    
        const p_item_local = new Vec3()
        const p_item_world = new Vec3()

        if (isDynamic_locations) {
            const p_world_container = <FieldPointVectorContainerDynamic><unknown>p_world
            const p_local_container = <FieldPointVectorContainerDynamic>p_local

            for (let i = 0; i < length; i++) {
                p_item_world.x = p_world_container.get(p_i_local++)
                p_item_world.y = p_world_container.get(p_i_local++)
                p_item_world.z = p_world_container.get(p_i_local++)
    
                transform_inverse.transformVector(p_item_world, p_item_local)
    
                p_local_container.set(p_i_world++, p_item_local.x)
                p_local_container.set(p_i_world++, p_item_local.y)
                p_local_container.set(p_i_world++, p_item_local.z)
            }
        }
        else {
            const p_world_container = <FieldPointVectorContainerStatic>p_world
            const p_local_container = <FieldPointVectorContainerStatic>p_local

            for (let i = 0; i < length; i++) {
                p_item_world.x = p_world_container[p_i_local++]
                p_item_world.y = p_world_container[p_i_local++]
                p_item_world.z = p_world_container[p_i_local++]
    
                transform_inverse.transformVector(p_item_world, p_item_local)
    
                p_local_container[p_i_world++] = p_item_local.x
                p_local_container[p_i_world++] = p_item_local.y
                p_local_container[p_i_world++] = p_item_local.z
            }
        }

        return innerLocations
    }

    @vectorized(TransformVolume.transformSample_vectorized)
    protected transformSample(
            sample: Sample,
            innerLocation: Location,
            outerLocation: Location,
            context: { outer: Context, inner: Context }
        ) {
        return {
            ...sample,
            gradient: this.transform.transformVector(sample.gradient)
        }
    }

    private static transformSample_vectorized<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        Location extends VolumeLocation = VolumeLocation,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends VolumeSample = VolumeSample,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleProcessingContextT = any,
        Context extends
            VolumeSamplingContext<Location, SampleProcessingContextT> =
            VolumeSamplingContext<Location, SampleProcessingContextT>,
        LocationVector extends
            FieldPointVector<Location, LocationContainer> =
            FieldPointVector<Location, LocationContainer>,
        SampleVector extends 
            FieldPointVectorWithMultiObjects<
                    Sample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    Sample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
                FusedVectorSamplingContext<
                        Location,
                        LocationContainer,
                        Sample,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        Context,
                        LocationVector,
                        SampleVector
                    > =
                FusedVectorSamplingContext<
                        Location,
                        LocationContainer,
                        Sample,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        Context,
                        LocationVector,
                        SampleVector
                    >,
        VolumeT extends
            Volume<
                    Location,
                    Sample,
                    SampleProcessingContextT,
                    Context
                > =
            Volume<
                    Location,
                    Sample,
                    SampleProcessingContextT,
                    Context
                >,
        >(
            this: TransformVolume<
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Location,
                    LocationContainer,
                    Sample,
                    SampleContainer,
                    SampleProcessingContextT,
                    Context,
                    LocationVector,
                    SampleVector,
                    VectorContext,
                    VolumeT
                >,
            samples: SampleVector,
            innerLocations: LocationVector,
            outerLocations: LocationVector,
            context: { outer: VectorContext, inner: VectorContext }
        ) {
        type FusingSampleVector = FusingFieldPointVectorWithMultiObjects<
            Sample,
            ObjIDsT,
            SampleContainer,
            ObjIDsContainer
        >
        
        this.transformSamples_fused_inplace(<FusingSampleVector>samples, innerLocations, outerLocations, context)

        return samples
    }
    
    protected transformSamples_fused_inplace(
            result: FusingFieldPointVectorWithMultiObjects<
                    Sample,
                    ObjIDsT,
                    SampleContainer,
                    ObjIDsContainer
                >,
            innerLocations: LocationVector,
            outerLocations: LocationVector,
            // objIndicesSampled: { prev: ObjIDsT, current: ObjIDsT },
            context: { outer: VectorContext; inner: VectorContext }
        ): void {
        const transform = this.transform
        const length = vectorIterator(
            context.outer[SampleDomainLocationFieldKey].elementType,
            isDynamicVector<Location, LocationContainer>(outerLocations),
            context.outer[MultiObjectsIDsKey]
        ).length(outerLocations, outerLocations)

        const result_gradient = result.gradient
        let result_gradient_i_world = 0
        let result_gradient_i_local = 0

        const gradient_local = new Vec3()
        const gradient_world = new Vec3()
        for (let i = 0; i < length; i++) {
            gradient_local.x = result_gradient[result_gradient_i_local++]
            gradient_local.y = result_gradient[result_gradient_i_local++]
            gradient_local.z = result_gradient[result_gradient_i_local++]

            transform.transformVector(gradient_local, gradient_world)

            result_gradient[result_gradient_i_world++] = gradient_world.x
            result_gradient[result_gradient_i_world++] = gradient_world.y
            result_gradient[result_gradient_i_world++] = gradient_world.z
        }
    }
}