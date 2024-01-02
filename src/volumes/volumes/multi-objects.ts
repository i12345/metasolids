import { BoundingBox } from 'playcanvas-physics-advanced'
import { MultiObjectsTemplate, MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped, groups, groupKinds, MultiObjectsGroupsProcessingContext } from "../../paradigm/trees/index.js"
import { FieldPoint, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsInfluencesGroupKinds, Field, SampleDomain, SamplingContext } from '../../fields/index.js'
import { Volume, VolumeLocation, VolumeSample, VolumeSampleKey, VolumeSamplingContext } from '../volume.js'
import { Cloneable, GeneratorType, IndicesTypedArray, clone, makeClone, onlyOne } from '../../utils/index.js'
import { MultiObjectsSamplingContext, MultiObjectsDomainInternalPreservedGroupsKinds, MultiObjectsSampleDomain, MultiObjectsSampleFuseMode, MultiObjectsLeafContext, MultiObjectsLeafSample, MultiObjectsSampleElementType, MultiObjectsSample } from '../../fields/domains/index.js'
import { VolumeWithBoundingBox } from './bounded.js'
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, FuseMode } from '../../fields/vectorized/index.js'
import { InfluenceGroup } from '../../physical-entity/types.js'

export class MultiObjectsVolume<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ContextGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        Location extends VolumeLocation = VolumeLocation,
        LocationElementType extends VolumeLocation = Location,
        LocationFuseMode extends VolumeLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleProcessingContextT = any,
        LeafSample extends
            VolumeSample & MultiObjectsLeafSample<SampleGroups> =
            VolumeSample & MultiObjectsLeafSample<SampleGroups>,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        LeafContext extends
            VolumeSamplingContext<Location, LocationElementType, LocationFuseMode, SampleProcessingContextT> & MultiObjectsGroupsMapped<ContextGroups, any> =
            VolumeSamplingContext<Location, LocationElementType, LocationFuseMode, SampleProcessingContextT> & MultiObjectsGroupsMapped<ContextGroups, any>,
        LeafDomain extends
            Volume<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LeafSample,
                    LeafSample,
                    LeafSample,
                    SampleProcessingContextT,
                    MultiObjectsLeafContext<
                            Objects,
                            ObjIDsT,
                            ObjIDsContainer,
                            SampleGroups,
                            SampleGroupKinds,
                            ContextGroups,
                            ContextGroupKinds,
                            Location,
                            LocationElementType,
                            LocationFuseMode,
                            LocationContainer,
                            LeafSample,
                            SampleContainer,
                            LeafContext
                        >
                > =
            Volume<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LeafSample,
                    LeafSample,
                    LeafSample,
                    SampleProcessingContextT,
                    MultiObjectsLeafContext<
                            Objects,
                            ObjIDsT,
                            ObjIDsContainer,
                            SampleGroups,
                            SampleGroupKinds,
                            ContextGroups,
                            ContextGroupKinds,
                            Location,
                            LocationElementType,
                            LocationFuseMode,
                            LocationContainer,
                            LeafSample,
                            SampleContainer,
                            LeafContext
                        >
                >,
        SingularContext extends
            MultiObjectsSamplingContext<
                    Objects,
                    ObjIDsT,
                    ContextGroups,
                    ContextGroupKinds,
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LeafContext
                > =
            MultiObjectsSamplingContext<
                    Objects,
                    ObjIDsT,
                    ContextGroups,
                    ContextGroupKinds,
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LeafContext
                >,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        LeafSampleVector extends
            FieldPointVectorWithMultiObjects<
                    LeafSample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    LeafSample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
    >
    extends MultiObjectsSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SampleGroups,
        SampleGroupKinds,
        ContextGroups,
        ContextGroupKinds,
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        LeafSample,
        SampleContainer,
        LeafContext,
        LeafDomain,
        SingularContext,
        LocationVector,
        LeafSampleVector,
        SampleVector
    >
    implements Cloneable<MultiObjectsVolume<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SampleGroups,
        SampleGroupKinds,
        ContextGroups,
        ContextGroupKinds,
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        SampleProcessingContextT,
        LeafSample,
        SampleContainer,
        LeafContext,
        LeafDomain,
        SingularContext,
        LocationVector,
        LeafSampleVector,
        SampleVector
    >>
    // VolumeWithBoundingBox<
    //     Location,
    //     LocationElementType,
    //     LocationFuseMode,
    //     VolumeSample & MultiObjectsSample<Objects, SampleGroups, LeafSample>,
    //     VolumeSample & MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
    //     VolumeSample & MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>,
    //     SampleProcessingContextT,
    //     SingularContext
    // >
    {
    boundingBox!: BoundingBox
    private influenceGroupRef?: GeneratorType<ReturnType<typeof groups>>

    constructor(
        children: {
            [Object in keyof Objects]:
                Volume<
                    Location // ,
                    //LeafSample ,
                    // MultiObjectsLeafContext<Objects, Groups, GroupKinds, Location, LeafSample, LeafContext>
                >
        },
        multiObj: {
            context: {
                groupKindsTemplate: ContextGroupKinds,
                groupsTemplate?: ContextGroups
            },
            sample?: {
                groupKindsTemplate: SampleGroupKinds,
                groupsTemplate?: SampleGroups
            }
        },
        childField: Field<LeafSample>,
        public influenceGroup?: InfluenceGroup,
        fuseMode?: FuseMode<MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>>
    ) {
        super(children as any, multiObj, childField, fuseMode)
    }

    [clone]() {
        return new MultiObjectsVolume<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                ContextGroups,
                ContextGroupKinds,
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                SampleProcessingContextT,
                LeafSample,
                SampleContainer,
                LeafContext,
                LeafDomain,
                SingularContext,
                LocationVector,
                LeafSampleVector,
                SampleVector
            >(
                <any>makeClone(this.children),
                makeClone(this.multiObj),
                makeClone(this.childField),
                makeClone(this.influenceGroup),
                makeClone(this.fuseMode),
            )
    }

    protected override sampleContext(context: any): MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> {
        return context[VolumeSampleKey]
    }

    init(context: MultiObjectsSamplingContext<Objects, ObjIDsT, ContextGroups, ContextGroupKinds, Location, LeafContext>): void {
        super.init(context)

        this.boundingBox = undefined!
        for (const child_key of Reflect.ownKeys(this.children)) {
            const child = this.children[child_key]
            const box = (child as unknown as VolumeWithBoundingBox).boundingBox
            if (box) {
                if (!this.boundingBox) this.boundingBox = box
                else this.boundingBox.add(box)
            }
        }

        this.influenceGroupRef = onlyOne(groupKinds(
            context[VolumeSampleKey] as unknown as MultiObjectsGroupsProcessingContext<
                MultiObjectsGroupsTemplate,
                MultiObjectsInfluencesGroupKinds
            >,
            MultiObjectsInfluencesGroupKindsTemplate,
            this.influenceGroup
        )).group
    }
}