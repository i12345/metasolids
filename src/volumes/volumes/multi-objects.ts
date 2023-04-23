import { BoundingBox } from 'playcanvas-extended'
import { FieldPoint, MultiObjectsTemplate, MultiObjectsGroupsTemplate, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsSampleDomain, MultiObjectsLeafContext, MultiObjectsSample, MultiObjectsContext, groups, groupKinds, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsGroupsKindsTemplateMapped, MultiObjectsInfluencesGroupKinds, MultiObjectsGroupsOmitted } from '../../fields/index.js'
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from '../volume.js'
import { GeneratorType } from '../../utils/types.js'
import { onlyOne } from '../../utils/only-one.js'

/// @ts-ignore
export class MultiObjectsVolume<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Groups extends InfluenceGroup & MultiObjectsGroupsTemplate = InfluenceGroup & MultiObjectsGroupsTemplate,
        GroupKinds extends
            MultiObjectsInfluencesGroupKinds &
            MultiObjectsGroupsKindsTemplate =
            MultiObjectsInfluencesGroupKinds &
            MultiObjectsGroupsKindsTemplate,
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
        Groups,
        GroupKinds,
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
    private influenceGroupRef: GeneratorType<ReturnType<typeof groups>>

    constructor(
        children: {
            [Object in keyof Objects]:
                Volume<
                    Location // ,
                    //LeafSample ,
                    // MultiObjectsLeafContext<Objects, Groups, GroupKinds, Location, LeafSample, LeafContext>
                >
        },
        groupKindsTemplate: GroupKinds,
        groupsTemplate?: Groups,
        public influenceGroup?: InfluenceGroup
    ) {
        super(children as any, groupKindsTemplate, groupsTemplate)
    }
    
    boundingBox: BoundingBox

    init(context: MultiObjectsContext<Objects, Groups, GroupKinds, Location /* , LeafContext */>): void {
        super.init(context)

        this.boundingBox = undefined
        for (const child_key of Reflect.ownKeys(this.children)) {
            const child = this.children[child_key]
            const box = (child as Volume).boundingBox
            if (!this.boundingBox) this.boundingBox = box
            else this.boundingBox.add(box)
        }

        this.influenceGroupRef = onlyOne(groupKinds(
            context as any,
            MultiObjectsInfluencesGroupKindsTemplate,
            this.influenceGroup
        )).group
    }

    protected override combineResidualLeafSample(accumulator: MultiObjectsSample<Objects, Groups, MultiObjectsGroupsMapped<Groups, FieldPoint>>, key: PropertyKey, residual: MultiObjectsGroupsOmitted<Groups, MultiObjectsGroupsMapped<Groups, FieldPoint>>): MultiObjectsSample<Objects, Groups, MultiObjectsGroupsMapped<Groups, FieldPoint>> {
        const presence = (residual as VolumeSample).presence
        const influenceGroup = this.influenceGroupRef.get(accumulator)
        if (influenceGroup === undefined)
            this.influenceGroupRef.set(accumulator, { [key]: presence })
        else influenceGroup[key] = presence
        
        return super.combineResidualLeafSample(accumulator, key, residual)
    }
}