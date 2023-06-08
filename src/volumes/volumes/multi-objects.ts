import { BoundingBox } from 'playcanvas-extended'
import { MultiObjectsTemplate, MultiObjectsGroupsTemplate, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, groups, groupKinds, MultiObjectsGroupsOmitted, MultiObjectsGroupsProcessingContext } from "../../paradigm/index.js"
import { FieldPoint, MultiObjectsSampleDomain, MultiObjectsSample, MultiObjectsContext, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsInfluencesGroupKinds, MultiObjectsDomainInternalPreservedGroupsKinds } from '../../fields/index.js'
import { Volume, VolumeLocation, VolumeSample } from '../volume.js'
import { GeneratorType, onlyOne } from '../../utils/index.js'
import { VolumeSampleKey } from '../processor.js'

export class MultiObjectsVolume<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
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
        // LeafSample extends
        //     VolumeSample & MultiObjectsGroupsMapped<Groups, FieldPoint> =
        //     VolumeSample & MultiObjectsGroupsMapped<Groups, FieldPoint>,
        // LeafContext extends
        //     VolumeSamplingContext<Location> & MultiObjectsGroupsMapped<Groups, any> =
        //     VolumeSamplingContext<Location> & MultiObjectsGroupsMapped<Groups, any>,
    >
    extends MultiObjectsSampleDomain<
        Objects,
        SampleGroups,
        SampleGroupKinds,
        ContextGroups,
        ContextGroupKinds,
        Location //,
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
        // >
        // // VolumeSample & MultiObjectsGroupedObjectsAndRegularValues<Objects, Groups, LeafSample>
    >
    // implements Volume<
    //     Location,
    //     VolumeSample & MultiObjectsSample<Objects, Groups, LeafSample>,
    //     MultiObjectsContext<Objects, Groups, GroupKinds, Location, LeafContext>
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
        public influenceGroup?: InfluenceGroup
    ) {
        super(children as any, multiObj)
    }

    protected override sampleContext(context: any): MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> {
        return context[VolumeSampleKey]
    }

    init(context: MultiObjectsContext<Objects, ContextGroups, ContextGroupKinds, Location /* , LeafContext */>): void {
        super.init(context)

        this.boundingBox = undefined!
        for (const child_key of Reflect.ownKeys(this.children)) {
            const child = this.children[child_key]
            const box = (child as Volume).boundingBox
            if (!this.boundingBox) this.boundingBox = box
            else this.boundingBox.add(box)
        }

        this.influenceGroupRef = onlyOne(groupKinds(
            (context as any)[VolumeSampleKey] as MultiObjectsGroupsProcessingContext<
                MultiObjectsGroupsTemplate,
                MultiObjectsInfluencesGroupKinds
            >,
            MultiObjectsInfluencesGroupKindsTemplate,
            this.influenceGroup
        )).group
    }

    protected override combineResidualLeafSample(
            accumulator: MultiObjectsSample<Objects, SampleGroups, MultiObjectsGroupsMapped<SampleGroups, FieldPoint>>,
            key: PropertyKey,
            residual: MultiObjectsGroupsOmitted<SampleGroups, MultiObjectsGroupsMapped<SampleGroups, FieldPoint>>
        ): MultiObjectsSample<Objects, SampleGroups, MultiObjectsGroupsMapped<SampleGroups, FieldPoint>> {
        const presence = (residual as VolumeSample).presence
        const influenceGroup = this.influenceGroupRef!.get(accumulator)
        if (influenceGroup === undefined)
            this.influenceGroupRef!.set(accumulator, { [key]: presence })
        else if (influenceGroup[key] === undefined)
            influenceGroup[key] = presence
        // if key were in influenceGroup already, then it may've been set by a nested multi-objects volume
        
        return super.combineResidualLeafSample(accumulator, key, residual)
    }
}