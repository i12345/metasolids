import { onlyOne } from "../../../utils/only-one.js";
import { MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, groupKinds, groupPaths } from "../../trees/multi-objects-groups.js";
import { PropertyPath } from "../../trees/path.js";
import { extract } from "../../trees/tree.js";
import { Processor, ProcessorInitialization } from "../processor.js";

export const GateGroupKindKey: unique symbol = Symbol('group-kind:gate')
export type GateGroupKinds = {
    [GateGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const GateGroupKindsTemplate: GateGroupKinds = {
    [GateGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const GateGroupsDefaultKey = Symbol("gate")
export type GateGroupsDefault = {
    [GateGroupsDefaultKey]: MultiObjectsGroupsTemplateLeaf
}
export const GateGroupsDefaultTemplate: GateGroupsDefault = {
    [GateGroupsDefaultKey]: MultiObjectsGroupsTemplate_Leaf
}

export type GateProcessingContext<
        GateGroup extends MultiObjectsGroupsTemplate = GateGroupsDefault,
        GateValue = string
    > =
    MultiObjectsGroupsProcessingContext<GateGroup, GateGroupKinds> &
    MultiObjectsGroupsMapped<GateGroup, GateValue>

export class GateProcessor<
        GateGroup extends MultiObjectsGroupsTemplate = GateGroupsDefault,
        GateValue = string,
        Item = any,
        Context extends
            GateProcessingContext<GateGroup, GateValue> =
            GateProcessingContext<GateGroup, GateValue>,
        Initialization extends ProcessorInitialization = ProcessorInitialization,
        ProcessorT extends
            Processor<Item, Context, Initialization> =
            Processor<Item, Context, Initialization>
    > implements Processor<Item, Context, Initialization> {
    constructor(
        public readonly inner: ProcessorT,
        public readonly gateValue: GateValue,
        public readonly gateGroup?: GateGroup | PropertyPath
    ) { }
    
    private gateGroupPath(context: Context): PropertyPath {
        return this.gateGroup ? (
            this.gateGroup instanceof Array ? this.gateGroup :
                onlyOne(groupPaths(this.gateGroup))
        ) : onlyOne(groupKinds(context, GateGroupKindsTemplate)).group.path
    }

    protected isGateSatisfied(realValue: GateValue): boolean {
        return realValue === this.gateValue
    }

    init(context: Context): Initialization {
        if (this.isGateSatisfied(extract(context, this.gateGroupPath(context))))
            return this.inner.init(context)

        return <Initialization><unknown>{
            connections: {
                inputs: [],
                outputs: [],
            }
        }
    }

    process(item: Item, context: Context): void {
        if (this.isGateSatisfied(extract(context, this.gateGroupPath(context))))
            this.inner.process(item, context)
    }
}

export class RangeGateProcessor<
        GateGroup extends MultiObjectsGroupsTemplate = GateGroupsDefault,
        GateValue = string,
        Item = any,
        Context extends
            GateProcessingContext<GateGroup, GateValue> =
            GateProcessingContext<GateGroup, GateValue>,
        Initialization extends ProcessorInitialization = ProcessorInitialization,
        ProcessorT extends
            Processor<Item, Context, Initialization> =
            Processor<Item, Context, Initialization>
    >
    extends GateProcessor<GateGroup, GateValue, Item, Context, Initialization, ProcessorT> {
    constructor(
        inner: ProcessorT,
        public readonly gateValues: GateValue[],
        gateGroup?: GateGroup | PropertyPath
    ) {
        super(inner, undefined!, gateGroup)
    }
    
    protected isGateSatisfied(realValue: GateValue): boolean {
        return this.gateValues.includes(realValue)
    }
}