import { FieldPoint } from '../point.js'
import { SampleDomain, SampleDomainLocationFieldKey, SamplingContext } from '../domain.js'
import { Field } from '../field.js'
import { vectorized } from 'vectorized-functions'
import { VectorSamplingContext } from './vector.js'
import { FieldPointVector, FieldPointVectorContainerStatic, IsDynamicVector, field_point_vectorized_new, isDynamicVector } from '../vectorized/index.js'
import { MultiObjectsIDsKey, MultiObjectsTemplate } from '../../paradigm/trees/index.js'
import { IndicesTypedArray } from '../../utils/indices-array.js'
import { vectorIterator } from '../vectorized/iterators/factory.js'

export class ConstantSampleDomain<
        Location extends FieldPoint = FieldPoint,
        Sample extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        Context extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> =
            SamplingContext<Location, LocationElementType, LocationFuseMode>
    > implements
    SampleDomain<
        Location,
        Sample,
        LocationElementType,
        LocationFuseMode,
        SampleElementType,
        SampleFuseMode,
        Context
    > {
    constructor(
        public value: Sample,
        public field: Field<Sample, SampleElementType, SampleFuseMode>
    ) { }

    init(context: Context): void {}

    @vectorized(ConstantSampleDomain.sample_vectorized)
    sample(location: Location, context: Context): Sample {
        return this.value
    }

    private static sample_vectorized<
            Location extends FieldPoint = FieldPoint,
            Sample extends FieldPoint = FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
            LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            SampleElementType extends FieldPoint = Sample,
            SampleFuseMode extends FieldPoint = Sample,
            SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
            SingularContext extends
                SamplingContext<Location, LocationElementType, LocationFuseMode> =
                SamplingContext<Location, LocationElementType, LocationFuseMode>,
            LocationVector extends
                FieldPointVector<LocationElementType, LocationContainer> =
                FieldPointVector<LocationElementType, LocationContainer>,
            SampleVector extends
                FieldPointVector<SampleElementType, SampleContainer> =
                FieldPointVector<SampleElementType, SampleContainer>,
        >(
            this: ConstantSampleDomain<
                Location,
                Sample,
                LocationElementType,
                LocationFuseMode,
                SampleElementType,
                SampleFuseMode,
                SingularContext
            >,
            locations: LocationVector,
            context: VectorSamplingContext<
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
                SingularContext,
                LocationVector,
                SampleVector
            >
        ): SampleVector {
        const locations_type = context[SampleDomainLocationFieldKey].elementType
        const locations_isDynamic = isDynamicVector<LocationElementType, LocationContainer>(locations_type, locations)
        const locations_iterator = vectorIterator(locations_type, locations_isDynamic, context[MultiObjectsIDsKey])
        console.warn("this is not intended to work for constant value w/ obj-mapped values")

        return <SampleVector>field_point_vectorized_new(
            this.field.elementType,
            locations_iterator.length(locations, locations),
            <IsDynamicVector<SampleElementType, SampleContainer>><unknown>locations_isDynamic,
            undefined,
            <SampleElementType><unknown>this.value
        )
    }
}