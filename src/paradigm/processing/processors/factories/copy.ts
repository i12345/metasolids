import { MultiObjectsGroupsOrLeafMapped, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, PropertyPath } from "../../../trees/index.js"
import { FactoryProcessor } from "../factory.js"

export type Inputs = MultiObjectsGroupsTemplateLeaf

export type Outputs = MultiObjectsGroupsTemplateLeaf

export const InputsTemplate: Inputs = MultiObjectsGroupsTemplate_Leaf

export const OutputsTemplate: Outputs = MultiObjectsGroupsTemplate_Leaf

export const template: {
    inputs: Inputs,
    outputs: Outputs,
} = {
    inputs: InputsTemplate,
    outputs: OutputsTemplate,
}

export type InputValues<T> = T

export type OutputValues<T> = T

export class CopyFactory<
        T = any,
        Item = any,
        Context = any,
    >
    extends FactoryProcessor<
        Inputs,
        Outputs,
        InputValues<T>,
        OutputValues<T>,
        Item,
        Context
    > {
    constructor(
            mappings?: {
                inputs: MultiObjectsGroupsOrLeafMapped<Inputs, PropertyPath>,
                outputs: MultiObjectsGroupsOrLeafMapped<Outputs, PropertyPath>,
            }
        ) {
        super(
            template,
            mappings
        )
    }
    
    protected factory(inputs: T): T {
        return inputs
    }
}