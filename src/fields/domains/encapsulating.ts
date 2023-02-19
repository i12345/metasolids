import { SampleDomain, SamplingContext } from "../domain";
import { FieldPoint } from "../point";

export const EncapsulatingDomainSamplingContextParentDomain = Symbol('encapsulating-domain:parent:domain')
export const EncapsulatingDomainSamplingContextParentContext = Symbol('encapsulating-domain:parent:context')
export interface EncapsulatingDomainSamplingContext<
        Location extends FieldPoint = FieldPoint,
        ParentLocation extends FieldPoint = FieldPoint,
        ParentSample extends FieldPoint = FieldPoint,
        ParentContext extends
            SamplingContext<ParentLocation> =
            SamplingContext<ParentLocation>
    > extends SamplingContext<Location> {
    [EncapsulatingDomainSamplingContextParentDomain]: SampleDomain<ParentLocation, ParentSample, ParentContext>
    [EncapsulatingDomainSamplingContextParentContext]: ParentContext
}