import { BoundingBox } from 'playcanvas-extended'
import { FieldPoint, MultiObjectsTemplate, MultiObjectsGroupsTemplate, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsSampleDomain, MultiObjectsLeafContext, MultiObjectsSample, MultiObjectsContext } from '../../fields/index.js'
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from '../volume.js'

/// @ts-ignore
export class MultiObjectsVolume<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        GroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        Location extends VolumeLocation = VolumeLocation,
        LeafSample extends
            VolumeSample & MultiObjectsGroupsMapped<Groups, FieldPoint> =
            VolumeSample & MultiObjectsGroupsMapped<Groups, FieldPoint>,
        LeafContext extends
            VolumeSamplingContext<Location> & MultiObjectsGroupsMapped<Groups, any> =
            VolumeSamplingContext<Location> & MultiObjectsGroupsMapped<Groups, any>,
    >
    extends MultiObjectsSampleDomain<
        Objects,
        Groups,
        GroupKinds,
        Location,
        LeafSample,
        LeafContext,
        Volume<
            Location,
            LeafSample
            // MultiObjectsLeafContext<
            //     Objects,
            //     Groups,
            //     GroupKinds,
            //     Location,
            //     LeafSample,
            //     LeafContext,
            //     // Volume<Location, LeafSample, LeafContext>
            // >
        >
        // VolumeSample & MultiObjectsGroupedObjectsAndRegularValues<Objects, Groups, LeafSample>
    >
    implements Volume<
        Location,
        VolumeSample & MultiObjectsSample<Objects, Groups, LeafSample>,
        MultiObjectsContext<Objects, Groups, GroupKinds, Location, LeafContext>
    > {
        constructor(
            children: {
                [Object in keyof Objects]:
                    Volume<
                        Location,
                        LeafSample,
                        MultiObjectsLeafContext<Objects, Groups, GroupKinds, Location, LeafSample, LeafContext>
                    >
            },
            groupKindsTemplate: GroupKinds,
            groupsTemplate?: Groups,
        ) {
        super(children, groupKindsTemplate, groupsTemplate)
    }
    
    boundingBox: BoundingBox

    init(context: MultiObjectsContext<Objects, Groups, GroupKinds, Location, LeafContext>): void {
        super.init(context)

        this.boundingBox = undefined
        for (const child_key of Reflect.ownKeys(this.children)) {
            const child = this.children[child_key]
            const box = child.boundingBox
            if (!this.boundingBox) this.boundingBox = box
            else this.boundingBox.add(box)
        }
    }
}