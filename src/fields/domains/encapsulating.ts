import { SampleDomain, SamplingContext } from "../domain.js";
import { FieldPoint } from "../point.js";

//TODO: reimplement using WithEncapsulating<{ domain: ... context: ... }>
export const EncapsulatingDomainSamplingContextParentDomain = Symbol('encapsulating-domain:parent:domain')
export const EncapsulatingDomainSamplingContextParentContext = Symbol('encapsulating-domain:parent:context')
export interface EncapsulatingDomainSamplingContext<
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        ParentLocation extends FieldPoint = FieldPoint,
        ParentLocationElementType extends FieldPoint = ParentLocation,
        ParentLocationFuseMode extends FieldPoint = ParentLocation,
        ParentSample extends FieldPoint = FieldPoint,
        ParentSampleElementType extends FieldPoint = ParentSample,
        ParentSampleFuseMode extends FieldPoint = ParentSample,
        ParentContext extends
            SamplingContext<ParentLocation, ParentLocationElementType, ParentLocationFuseMode> =
            SamplingContext<ParentLocation, ParentLocationElementType, ParentLocationFuseMode>
    > extends SamplingContext<Location, LocationElementType, LocationFuseMode> {
    [EncapsulatingDomainSamplingContextParentDomain]: SampleDomain<
        ParentLocation,
        ParentSample,
        ParentLocationElementType,
        ParentLocationFuseMode,
        ParentSampleElementType,
        ParentSampleFuseMode,
        ParentContext
    >
    [EncapsulatingDomainSamplingContextParentContext]: ParentContext
}