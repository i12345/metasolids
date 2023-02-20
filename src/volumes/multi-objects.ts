import { FieldPoint, MultiObjectsGrouped, MultiObjectsGroupsTemplate, MultiObjectsInfluencesProcessingContext, MultiObjectsInfluencesProcessingResult, MultiObjectsProcessingResult, MultiObjectsTemplate } from "../fields/index.js";
import { ParallelizedContext } from "../processor/index.js";
import { VolumeSample } from "./volume.js";

export type MultiObjectsVolumeSample<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    > =
    VolumeSample &
    MultiObjectsInfluencesProcessingResult<Objects, InfluenceGroups>

export type MultiObjectsVolumeValueSample<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any
    > =
    VolumeSample &
    MultiObjectsProcessingResult<Objects, Groups, T>

export type MultiObjectsVolumeFieldPointSample<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Value extends FieldPoint = FieldPoint
    > =
    MultiObjectsVolumeValueSample<Objects, ValueGroups, Value> &
    MultiObjectsVolumeSample<Objects, InfluenceGroup>

export type MultiObjectsVolumeSampleProcessingContext<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends MultiObjectsGrouped<Objects, InfluenceGroups> = MultiObjectsGrouped<Objects, InfluenceGroups>,
        Results extends
            MultiObjectsVolumeSample<Objects, InfluenceGroups> =
            MultiObjectsVolumeSample<Objects, InfluenceGroups>,
        Context extends
            MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroups, ObjectsGrouped> =
            MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroups, ObjectsGrouped>
    > =
    ParallelizedContext<
            Results,
            Context
        >