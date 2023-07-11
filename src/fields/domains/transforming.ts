import { FieldPoint } from '../point.js'
import { SampleDomain, SampleDomainLocationField, SampleDomain_vectorized, SamplingContext } from '../domain.js'
import { Field } from '../field.js'
import { EncapsulatingDomainSamplingContext, EncapsulatingDomainSamplingContextParentContext, EncapsulatingDomainSamplingContextParentDomain } from './encapsulating.js'
import { PropertyPath } from '../../paradigm/property-path.js'
import { VectorFunction, vectorized } from 'vectorized-functions'

export type TransformingDefaultInnerSamplingContext<
        OuterLocation extends FieldPoint = FieldPoint,
        InnerLocation extends FieldPoint = FieldPoint,
        OuterSample extends FieldPoint = FieldPoint,
        OuterContext extends
            SamplingContext<OuterLocation> =
            SamplingContext<OuterLocation>
    > = Omit<OuterContext, typeof SampleDomainLocationField> &
    EncapsulatingDomainSamplingContext<InnerLocation, OuterLocation, OuterSample, OuterContext> &
    { [SampleDomainLocationField]: Field<InnerLocation> }

/**
 * A transforming sample domain. It has overrideable behavoir for transforming
 * the outer location to a different inner location, the inner sample to a
 * different outer sample, and the outer context to a different inner context.
 *
 * By default, the outer location is considered equal to the inner location,
 * the inner sample is considered equal to the outer sample, and the outer
 * context is wrapped with an {@link EncapsulatingDomainSamplingContext} though
 * with the same location field from the outer context by default.
 */
export abstract class TransformingSampleDomain<
        OuterLocation extends FieldPoint,
        OuterSample extends FieldPoint,
        OuterContext extends
            SamplingContext<OuterLocation> =
            SamplingContext<OuterLocation>,
        InnerLocation extends FieldPoint = OuterLocation,
        InnerSample extends FieldPoint = OuterSample,
        InnerContext extends
            SamplingContext<InnerLocation> =
            TransformingDefaultInnerSamplingContext<
                    OuterLocation,
                    InnerLocation,
                    OuterSample,
                    OuterContext
                >,
    > implements
    SampleDomain<OuterLocation, OuterSample, OuterContext> {
    constructor(public inner: SampleDomain<InnerLocation, InnerSample, InnerContext>) {}
    field!: Field<OuterSample>
    private location_field!: Field<InnerLocation>

    init(context: OuterContext): void {
        this.location_field = this.init_location_field(context)
        const innerContext = this.transformContext(context)
        this.inner.init(innerContext)
        this.init_transfer_context(innerContext, context)
        this.field = this.init_make_field(this.inner.field, {
            inner: innerContext,
            outer: context
         })
    }

    protected transformContext(context: OuterContext): InnerContext {
        const innerContext: TransformingDefaultInnerSamplingContext<OuterLocation, InnerLocation, OuterSample, OuterContext> = {
            ...context,
            [SampleDomainLocationField]: this.location_field,
            [EncapsulatingDomainSamplingContextParentContext]: context,
            [EncapsulatingDomainSamplingContextParentDomain]: this
        }

        return innerContext as any as InnerContext
    }

    protected init_location_field(context: OuterContext): Field<InnerLocation> {
        return context[SampleDomainLocationField] as any as Field<InnerLocation>
    }

    protected init_transfer_context(
            innerContext: InnerContext,
            outerContext: OuterContext
        ): void {
        const exclude_keys: PropertyPath = [EncapsulatingDomainSamplingContextParentContext, EncapsulatingDomainSamplingContextParentDomain]

        Reflect.ownKeys(innerContext)
            .filter(key => !exclude_keys.includes(key) && !(outerContext as any)[key])
            .forEach(key => (outerContext as any)[key] = (innerContext as any)[key])
    }

    protected init_make_field(innerField: Field<InnerSample>, context: { inner: InnerContext, outer: OuterContext }): Field<OuterSample> {
        return innerField as any as Field<OuterSample>
    }
    
    protected transformLocation(
            location: OuterLocation,
            context: { outer: OuterContext, inner: InnerContext }
        ): InnerLocation {
        return location as any as InnerLocation
    }

    protected transformSample(
            sample: InnerSample,
            location: { outer: OuterLocation, inner: InnerLocation },
            context: { outer: OuterContext, inner: InnerContext }
        ): OuterSample {
        return sample as any as OuterSample
    }

    @vectorized(TransformingSampleDomain.sample_vectorized)
    sample(outerLocation: OuterLocation, outerContext: OuterContext): OuterSample {
        const innerContext = this.transformContext(outerContext)
        const context = { outer: outerContext, inner: innerContext }
        const innerLocation = this.transformLocation(outerLocation, context)
        const location = { outer: outerLocation, inner: innerLocation }
        const innerSample = this.inner.sample(innerLocation, innerContext)
        return this.transformSample(innerSample, location, context)
    }

    private static sample_vectorized<
            OuterLocation extends FieldPoint,
            OuterSample extends FieldPoint,
            OuterContext extends
                SamplingContext<OuterLocation> =
                SamplingContext<OuterLocation>,
            InnerLocation extends FieldPoint = OuterLocation,
            InnerSample extends FieldPoint = OuterSample,
            InnerContext extends
                SamplingContext<InnerLocation> =
                TransformingDefaultInnerSamplingContext<
                        OuterLocation,
                        InnerLocation,
                        OuterSample,
                        OuterContext
                    >,
        >(
            this: TransformingSampleDomain<
                OuterLocation,
                OuterSample,
                OuterContext,
                InnerLocation,
                InnerSample,
                InnerContext
                >,
            outerLocations: OuterLocation[],
            outerContext: OuterContext
        ): OuterSample[] {
        const innerContext = this.transformContext(outerContext)
        const context = { outer: outerContext, inner: innerContext }
        const innerLocations = TransformingSampleDomain.vectorized.transformLocation.call(this as any, outerLocations, context)
        const locations = outerLocations.map((_, i) => ({ outer: outerLocations[i], inner: innerLocations[i] }))
        const innerSamples = SampleDomain_vectorized.sample(this.inner, innerLocations, innerContext)
        return TransformingSampleDomain.vectorized.transformSample.call(this as any, innerSamples, locations, context) as OuterSample[]
    }

    protected static readonly vectorized = {
        transformLocation: new VectorFunction<
                {
                    transformLocation(
                        location: FieldPoint,
                        context: { outer: SamplingContext, inner: SamplingContext }
                    ): FieldPoint
                },
                "transformLocation",
                (
                    location: FieldPoint,
                    context: { outer: SamplingContext, inner: SamplingContext }
                ) => FieldPoint,
                (
                    locations: FieldPoint[],
                    context: { outer: SamplingContext, inner: SamplingContext }
                ) => FieldPoint[]
            >("transformLocation"),
        
        transformSample: new VectorFunction <
                {
                    transformSample(
                        sample: FieldPoint,
                        location: { outer: FieldPoint, inner: FieldPoint },
                        context: { outer: SamplingContext, inner: SamplingContext }
                    ): FieldPoint
                },
                "transformSample",
                (
                    sample: FieldPoint,
                    location: { outer: FieldPoint, inner: FieldPoint },
                    context: { outer: SamplingContext, inner: SamplingContext }
                ) => FieldPoint,
                (
                    samples: FieldPoint[],
                    locations: { outer: FieldPoint, inner: FieldPoint }[],
                    context: { outer: SamplingContext, inner: SamplingContext }
                ) => FieldPoint[]
            >("transformSample", [0, 1]),
    }
}