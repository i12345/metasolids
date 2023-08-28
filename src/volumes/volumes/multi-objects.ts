import { BoundingBox } from 'playcanvas-extended'
import { MultiObjectsTemplate, MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped, groups, groupKinds, MultiObjectsGroupsProcessingContext } from "../../paradigm/trees/index.js"
import { FieldPoint, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsInfluencesGroupKinds, Field } from '../../fields/index.js'
import { Volume, VolumeLocation, VolumeSample, VolumeSampleKey } from '../volume.js'
import { GeneratorType, IndicesTypedArray, onlyOne } from '../../utils/index.js'
import { MultiObjectsSamplingContext, MultiObjectsDomainInternalPreservedGroupsKinds, MultiObjectsSampleDomain } from '../../fields/domains/index.js'
import { VolumeWithBoundingBox } from './bounded.js'
import { FieldPointVectorContainerStatic } from '../../fields/vectorized/index.js'

export class MultiObjectsVolume<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroups extends InfluenceGroup = InfluenceGroup,
        SampleGroupKinds extends
            MultiObjectsInfluencesGroupKinds &
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsInfluencesGroupKinds &
            MultiObjectsDomainInternalPreservedGroupsKinds,
        ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ContextGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        Location extends VolumeLocation = VolumeLocation,
        LeafSample extends
            VolumeSample & MultiObjectsGroupsMapped<SampleGroups, FieldPoint> =
            VolumeSample & MultiObjectsGroupsMapped<SampleGroups, FieldPoint> //,
        // LeafContext extends
        //     VolumeSamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any> =
        //     VolumeSamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any>,
    >
    extends MultiObjectsSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SampleGroups,
        SampleGroupKinds,
        ContextGroups,
        ContextGroupKinds,
        Location//,
        // LeafSample,
        // LeafContext,
        // Volume<
        //     Location,
        //     LeafSample
        //     // MultiObjectsLeafContext<
        //     //     Objects,
        //     //     Groups,
        //     //     GroupKinds,
        //     //     Location,
        //     //     LeafSample,
        //     //     LeafContext,
        //     //     // Volume<Location, LeafSample, LeafContext>
        //     // >
        // >,
        // VolumeSample & MultiObjectsGroupedObjectsAndRegularValues<Objects, SampleGroups, LeafSample>
    >
    // implements VolumeWithBoundingBox<
    //     Location,
    //     VolumeSample & MultiObjectsSample<Objects, SampleGroups/* , LeafSample */>,
    //     VolumeSamplingContext<Location> & MultiObjectsContext<Objects, ContextGroups, ContextGroupKinds, Location/* , LeafContext */>
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
            sample: {
                groupKindsTemplate: SampleGroupKinds,
                groupsTemplate?: SampleGroups
            }
        },
        childField: Field<LeafSample>,
        public influenceGroup?: InfluenceGroup
    ) {
        super(children as any, multiObj, undefined, childField)
    }

    protected override sampleContext(context: any): MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> {
        return context[VolumeSampleKey]
    }

    init(context: MultiObjectsSamplingContext<Objects, ContextGroups, ContextGroupKinds, Location/* , LeafContext */>): void {
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
            context[VolumeSampleKey] as MultiObjectsGroupsProcessingContext<
                MultiObjectsGroupsTemplate,
                MultiObjectsInfluencesGroupKinds
            >,
            MultiObjectsInfluencesGroupKindsTemplate,
            this.influenceGroup
        )).group
    }
}