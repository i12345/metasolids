import { PropertyPath, mapGroups, groups, extract, mapByGroups, intract, MultiObjectsGroupsTemplateOrLeaf, MultiObjectsGroupsOrLeafMapped, MultiObjectsGroupsMapped } from "../../trees/index.js";
import { Processor } from "../processor.js";

export type FactoryTemplate<
        Inputs extends MultiObjectsGroupsTemplateOrLeaf = MultiObjectsGroupsTemplateOrLeaf,
        Outputs extends MultiObjectsGroupsTemplateOrLeaf = MultiObjectsGroupsTemplateOrLeaf,
    > = {
    inputs: Inputs
    outputs: Outputs
}

export type FactoryMappings<
        Inputs extends MultiObjectsGroupsTemplateOrLeaf = MultiObjectsGroupsTemplateOrLeaf,
        Outputs extends MultiObjectsGroupsTemplateOrLeaf = MultiObjectsGroupsTemplateOrLeaf,
    > = MultiObjectsGroupsMapped<FactoryTemplate, PropertyPath>

export abstract class FactoryProcessor<
        Inputs extends MultiObjectsGroupsTemplateOrLeaf = MultiObjectsGroupsTemplateOrLeaf,
        Outputs extends MultiObjectsGroupsTemplateOrLeaf = MultiObjectsGroupsTemplateOrLeaf,
        InputValues extends MultiObjectsGroupsOrLeafMapped<Inputs, any> = MultiObjectsGroupsOrLeafMapped<Inputs, any>,
        OutputValues extends MultiObjectsGroupsOrLeafMapped<Outputs, any> = MultiObjectsGroupsOrLeafMapped<Outputs, any>,
        Item = any,
        Context = any,
    > implements Processor<Item, Context> {
    constructor(
        public template: FactoryTemplate<Inputs, Outputs>,
        public mappings: FactoryMappings<Inputs, Outputs> = {
            inputs: mapGroups(template.inputs, () => <PropertyPath>undefined!),
            outputs: mapGroups(template.outputs, () => <PropertyPath>undefined!),
        }
    ) {
    }

    protected abstract factory(inputs: InputValues, item: Item, context: Context): OutputValues

    init() {
        const connections = {
            inputs: [...groups(this.template.inputs)].map(input => input.get<PropertyPath>(this.mappings.inputs)),
            outputs: [...groups(this.template.outputs)].map(output => output.get<PropertyPath>(this.mappings.outputs)).filter(path => path !== undefined),
        }

        return { connections }
    }

    process(item: Item, context: Context): void {
        const inputs = <InputValues>mapGroups(
            this.template.inputs,
            path => extract(item, extract(this.mappings.inputs, path))
        )

        const outputs = this.factory(inputs, item, context)

        mapByGroups<Outputs, any, void>(
            this.template.outputs,
            outputs,
            (path, output) => {
                const mapping = extract<PropertyPath>(this.mappings.outputs, path)
                if (mapping)
                    intract(item, mapping, output)
            }
        )
    }
}