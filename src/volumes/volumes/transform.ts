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
import { Cloneable, clone, makeClone } from '../../utils/cloneable.js'

export class TransformVolume<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        Location extends VolumeLocation = VolumeLocation,
        LocationElementType extends VolumeLocation = Location,
        LocationFuseMode extends VolumeLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends VolumeSample = VolumeSample,
        SampleElementType extends VolumeSample = Sample,
        SampleFuseMode extends VolumeSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleProcessingContextT = any,
        Context extends
            VolumeSamplingContext<Location, LocationElementType, LocationFuseMode, SampleProcessingContextT> =
            VolumeSamplingContext<Location, LocationElementType, LocationFuseMode, SampleProcessingContextT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    SampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    SampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
                FusedVectorSamplingContext<
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        Sample,
                        SampleElementType,
                        SampleFuseMode,
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
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        Sample,
                        SampleElementType,
                        SampleFuseMode,
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
                    LocationElementType,
                    LocationFuseMode,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleProcessingContextT,
                    Context
                > =
            Volume<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleProcessingContextT,
                    Context
                >,
    > extends
    TransformingSampleDomain<
            Objects,
            ObjIDsT,
            ObjIDsContainer,

            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Sample,
            SampleElementType,
            SampleFuseMode,
            SampleContainer,
            Context,
            LocationVector,
            SampleVector,
            VectorContext,

            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Sample,
            SampleElementType,
            SampleFuseMode,
            SampleContainer,
            Context,
            LocationVector,
            SampleVector,
            VectorContext
        >
    implements VolumeWithBoundingBox<
        Location,
        LocationElementType,
        LocationFuseMode,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleProcessingContextT,
        Context
    >,
    Cloneable<TransformVolume<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        SampleProcessingContextT,
        Context,
        LocationVector,
        SampleVector,
        VectorContext,
        VolumeT
    >> {
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

    [clone]() {
        return new TransformVolume<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                Sample,
                SampleElementType,
                SampleFuseMode,
                SampleContainer,
                SampleProcessingContextT,
                Context,
                LocationVector,
                SampleVector,
                VectorContext,
                VolumeT
            >(
                makeClone(this.inner),
                makeClone(this.transform),
            )
    }

    init(context: Context) {
        super.init(context)
        
        this.transformInverse.copy(this.transform).invert()

        const innerBoundingBox = <VolumeWithBoundingBox><unknown>this.inner
        if (innerBoundingBox.boundingBox)
            this.boundingBox.setFromTransformedAabb(innerBoundingBox.boundingBox, this.transform)
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
        LocationElementType extends VolumeLocation = Location,
        LocationFuseMode extends VolumeLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends VolumeSample = VolumeSample,
        SampleElementType extends VolumeSample = Sample,
        SampleFuseMode extends VolumeSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleProcessingContextT = any,
        Context extends
            VolumeSamplingContext<Location, LocationElementType, LocationFuseMode, SampleProcessingContextT> =
            VolumeSamplingContext<Location, LocationElementType, LocationFuseMode, SampleProcessingContextT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    SampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    SampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
                FusedVectorSamplingContext<
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        Sample,
                        SampleElementType,
                        SampleFuseMode,
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
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        Sample,
                        SampleElementType,
                        SampleFuseMode,
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
                    LocationElementType,
                    LocationFuseMode,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleProcessingContextT,
                    Context
                > =
            Volume<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleProcessingContextT,
                    Context
                >,
    >(
        this: TransformVolume<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Sample,
            SampleElementType,
            SampleFuseMode,
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
        const outerLocations_type = context.outer[SampleDomainLocationFieldKey].elementType
        const transform_inverse = this.transformInverse
        const isDynamic_outerLocations = isDynamicVector<LocationElementType, LocationContainer>(outerLocations_type, outerLocations)
        const outerLocations_vectorIterator = vectorIterator(
            outerLocations_type,
            isDynamic_outerLocations,
            context.outer[MultiObjectsIDsKey]
        )
        const length = outerLocations_vectorIterator.length(outerLocations, outerLocations)

        const p_local = field_point_vectorized_new<VolumeLocation["p"]>(
            <FieldPointType<VolumeLocation["p"]>>(<FieldsField<VolumeLocation>><unknown>context.inner[SampleDomainLocationFieldKey]).fields.p.elementType,
            length,
            isDynamic_outerLocations
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

        if (isDynamic_outerLocations) {
            const p_world_container = <FieldPointVectorContainerDynamic><unknown>p_world
            const p_local_container = <FieldPointVectorContainerDynamic>p_local

            for (let i = 0; i < length; i++) {
                p_item_world.x = p_world_container.get(p_i_local++)
                p_item_world.y = p_world_container.get(p_i_local++)
                p_item_world.z = p_world_container.get(p_i_local++)

                transform_inverse.transformPoint(p_item_world, p_item_local)

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

                transform_inverse.transformPoint(p_item_world, p_item_local)

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
        LocationElementType extends VolumeLocation = Location,
        LocationFuseMode extends VolumeLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends VolumeSample = VolumeSample,
        SampleElementType extends VolumeSample = Sample,
        SampleFuseMode extends VolumeSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleProcessingContextT = any,
        Context extends
            VolumeSamplingContext<Location, LocationElementType, LocationFuseMode, SampleProcessingContextT> =
            VolumeSamplingContext<Location, LocationElementType, LocationFuseMode, SampleProcessingContextT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    SampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    SampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
                FusedVectorSamplingContext<
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        Sample,
                        SampleElementType,
                        SampleFuseMode,
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
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        Sample,
                        SampleElementType,
                        SampleFuseMode,
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
                    LocationElementType,
                    LocationFuseMode,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleProcessingContextT,
                    Context
                > =
            Volume<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleProcessingContextT,
                    Context
                >,
        >(
            this: TransformVolume<
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
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
            SampleElementType,
            ObjIDsT,
            SampleContainer,
            ObjIDsContainer
        >

        this.transformSamples_fused_inplace(<FusingSampleVector>samples, innerLocations, outerLocations, context)

        return samples
    }

    protected transformSamples_fused_inplace(
            result: FusingFieldPointVectorWithMultiObjects<
                    SampleElementType,
                    ObjIDsT,
                    SampleContainer,
                    ObjIDsContainer
                >,
            innerLocations: LocationVector,
            outerLocations: LocationVector,
            context: { outer: VectorContext; inner: VectorContext }
        ): void {
        const outerLocations_type = context.outer[SampleDomainLocationFieldKey].elementType
        const transform = this.transform
        const length = vectorIterator(
            outerLocations_type,
            isDynamicVector<LocationElementType, LocationContainer>(outerLocations_type, outerLocations),
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