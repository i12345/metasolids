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
        Context extends SamplingContext<Location> = SamplingContext<Location>,
    > implements
    SampleDomain<Location, Sample, Context> {
    constructor(
        public value: Sample,
        public field: Field<Sample>
    ) { }
    
    init(context: Context): void {}
    
    @vectorized(ConstantSampleDomain.sample_vectorized)
    sample(location: Location, context: Context): Sample {
        return this.value
    }

    private static sample_vectorized<
            Location extends FieldPoint = FieldPoint,
            LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            Sample extends FieldPoint = FieldPoint,
            SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,    
            ObjIDsT extends IndicesTypedArray = Uint32Array,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
            SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
            LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
            SampleVector extends FieldPointVector<Sample, SampleContainer> = FieldPointVector<Sample, SampleContainer>,
        >(
            this: ConstantSampleDomain<Location, Sample, SingularContext>,
            locations: LocationVector,
            context: VectorSamplingContext<
                Location,
                LocationContainer,
                Sample,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                SampleVector
            >
        ): SampleVector {
        const isDynamic = isDynamicVector<Location, LocationContainer>(locations)
        const locationsIterator = vectorIterator(context[SampleDomainLocationFieldKey].elementType, isDynamic, context[MultiObjectsIDsKey])
        
        return <SampleVector>field_point_vectorized_new(
            this.field.elementType,
            locationsIterator.length(locations, locations),
            <IsDynamicVector<Sample, SampleContainer>><unknown>isDynamic,
            undefined,
            this.value
        )
    }
}