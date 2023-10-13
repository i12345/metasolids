import { FieldPointTensorEncoding, FieldPointTensorFactory } from "../../fields/tensor/tensor-factory.js";
import { FieldPointTensorSystem, FieldPointTensorSystemParameters } from "../../fields/tensor/system.js";
import { FieldPointTensorVariable } from "../../fields/tensor/variable.js";
import { FactoryMappings, FactoryProcessor } from "../../paradigm/processing/processors/factory.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplate_Leaf, extract, intract } from "../../paradigm/trees/index.js";
import { Reflect_fromEntries } from "../../utils/reflect-entries.js";
import { mapFirst, mapFirstValue } from "../../utils/map-first.js";
import { FieldsPoint } from "../point.js";
import { FieldPointTensorSpace, FieldPointTensorTopologyProjectorFactory } from "./topology.js";

function variablesTemplate(system: FieldPointTensorSystem): MultiObjectsGroupsTemplate {
    return Reflect_fromEntries<MultiObjectsGroupsTemplate>(system.variables.filter(variable => variable.name).map(variable => [variable.name!, MultiObjectsGroupsTemplate_Leaf]))
}

export class FieldPointTensorSystemFactory<Item = any, Context = any>
    extends FactoryProcessor<
        MultiObjectsGroupsTemplate,
        MultiObjectsGroupsTemplate,
        MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, any>,
        MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, any>,
        Item,
        Context
    > {
    constructor(
        public system: FieldPointTensorSystem,
        public parameters: FieldPointTensorSystemParameters & FieldsPoint,
        public topologyProjectors: Map<FieldPointTensorSpace, FieldPointTensorTopologyProjectorFactory>,
        public encodings: FieldPointTensorEncoding[],
        mappings: FactoryMappings
    ) {
        super(
            {
                inputs: variablesTemplate(system),
                outputs: variablesTemplate(system)
            },
            mappings
        )
    }

    init() {
        const variables = variablesTemplate(this.system)
        
        this.template = {
            inputs: variables,
            outputs: variables,
        }

        return super.init()
    }

    protected factory(
        inputs: MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, any>,
        item: Item,
        context: Context
    ): MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, any> {
        const inputs_factories = new Map<FieldPointTensorVariable, FieldPointTensorFactory>()
        const input_encodings = new Map<FieldPointTensorVariable, FieldPointTensorEncoding>()

        function variablePath(variable: FieldPointTensorVariable) {
            return variable.name ? [variable.name] : undefined
        }

        for (const variable of this.system.variables) {
            const path = variablePath(variable)
            if (path === undefined) continue

            const input_item = extract(inputs, path)

            const [encoding, factory] = mapFirst(
                this.encodings,
                encoding => encoding.decode(
                    variable.type,
                    variable.rank,
                    input_item,
                    context
                )
            )!

            input_encodings.set(variable, encoding)
            inputs_factories.set(variable, factory)
        }

        const instance = this.system.instance(this.parameters, inputs_factories, this.topologyProjectors)
        instance.init()

        while (!instance.update().complete) { }

        const outputs = <MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, any>>{}

        for (const variable of this.system.variables) {
            const path = variablePath(variable)
            if (path === undefined) continue

            const variableInstance = instance.variables.get(variable)!
            const variableEncoding = input_encodings.get(variable)!

            const encoded =
                variableEncoding.encode(
                    variable.type,
                    variableInstance.topology.shape,
                    variableInstance.register
                ) ??
                mapFirstValue(
                    this.encodings,
                    encoding => encoding.encode(
                        variable.type,
                        variableInstance.topology.shape,
                        variableInstance.register
                    )
                )!

            intract(outputs, path, encoded)
        }

        return outputs
    }
}