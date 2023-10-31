import { MultiObjectsGroupedObjectsKey, MultiObjectsGroupsMapped, MultiObjectsGroupsOrLeafMapped, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplateOrLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/multi-objects-groups.js";
import { MultiObjectsIDs, MultiObjectsMapped, MultiObjectsTemplate, objectValuePaths } from "../../paradigm/trees/multi-objects.js";
import { PropertyPath } from "../../paradigm/trees/path.js";
import { extract, hasPath, intract } from "../../paradigm/trees/tree.js";
import { clone } from "../../utils/cloneable.js";
import { IndicesTypedArray } from "../../paradigm/arrays/indices-array.js";
import { Reflect_entries, Reflect_fromEntries } from "../../utils/reflect-entries.js";
import { Field } from "../field.js";
import { makeInterpolator } from "../interpolation.js";
import { MultiObjectsInterpolationType } from "../interpolators/multi-objects.js";
import { FieldPoint, FieldPointMapped, FieldsPoint, FieldsPointMapped } from "../point.js";
import { FieldPointType, MultiObjectsFieldPointElement } from "../type.js"
import { FieldsField } from "./fields.js";

export class MultiObjectsField<
        Point extends FieldPoint = FieldPoint,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
    > implements
    Field<
        MultiObjectsMapped<Objects, Point>,
        MultiObjectsFieldPointElement<Point>,
        Point
    > {
    readonly interpolationType = new MultiObjectsInterpolationType<Objects, ObjIDsT, Point>(this.inner.interpolationType, this.multiObjectsIDs)

    readonly elementType = <FieldPointType<MultiObjectsFieldPointElement<Point>>>{ [MultiObjectsGroupedObjectsKey]: this.inner.elementType }

    readonly fuseMode = this.inner.fuseMode

    constructor(
        public readonly inner: Field<Point>,
        public multiObjectsIDs: MultiObjectsIDs<Objects, ObjIDsT>
    ) { }

    distance(
            x: MultiObjectsMapped<Objects, Point>,
            y: MultiObjectsMapped<Objects, Point>
        ): number {
        let distances = 0
        const pow = 2

        for (const objPath of objectValuePaths(this.multiObjectsIDs.template)) {
            const x_i = hasPath(x, objPath) ? extract(x, objPath) : undefined
            const y_i = hasPath(y, objPath) ? extract(y, objPath) : undefined
            if (x_i !== undefined || y_i !== undefined)
                distances += (this.inner.distance(<Point>x_i, <Point>y_i) ** pow)
        }

        return distances ** (1 / pow)
    }

    static multiObj<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array,
            SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
        >(
            field: Field,
            paths: PropertyPath[],
            multiObjectsIDs: MultiObjectsIDs<Objects, ObjIDsT>
        ) {
        const sampleMultiObjTemplate = <{ root: MultiObjectsGroupsMapped<SampleGroups, true> }>{}
        paths.forEach(path => intract(sampleMultiObjTemplate, ['root', ...path], true))

        function multiObjField_recursive(field: Field, sampleMultiObjMapped: MultiObjectsGroupsMapped<SampleGroups, true>): Field {
            if (sampleMultiObjMapped === true)
                return new MultiObjectsField(field, multiObjectsIDs)
            else if (field instanceof FieldsField) {
                function fields_recursive(
                    fields: FieldPointMapped<FieldPoint, Field>,
                    sampleMultiObjMapped: MultiObjectsGroupsOrLeafMapped<MultiObjectsGroupsTemplateOrLeaf, true>
                ): FieldPointMapped<FieldPoint, Field> {
                    if (sampleMultiObjMapped === true) {
                        return new MultiObjectsField(
                            ((<Field>fields).interpolationType && (makeInterpolator in (<Field>fields).interpolationType)) ?
                                <Field>fields :
                                new FieldsField(<FieldPointMapped<FieldsPoint, Field>>fields),
                            multiObjectsIDs
                        )
                    }
                    else if ((<Field>fields).interpolationType && (makeInterpolator in (<Field>fields).interpolationType))
                        return fields
                    else {
                        return Reflect_fromEntries(
                            Reflect_entries(fields).map(([key, subfields]) => [
                                key,
                                fields_recursive(
                                    <FieldPointMapped<FieldPoint, Field>>subfields,
                                    sampleMultiObjMapped[key]
                                )
                            ] as [typeof key, FieldPointMapped<FieldPoint, Field>]))
                    }
                }

                const mapped = fields_recursive((<FieldsField>field).fields, sampleMultiObjMapped)
                if (mapped.interpolationType && makeInterpolator in mapped.interpolationType)
                    return <Field>mapped
                else return new FieldsField(<FieldsPointMapped<FieldsPoint, Field>>mapped)
            }
            else return field
        }

        return multiObjField_recursive(field, sampleMultiObjTemplate.root)
    }

    static unMultiObj<
            SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        >(
            field: Field,
            paths?: PropertyPath[]
        ): Field {
        const sampleMultiObjTemplate = <{ root: MultiObjectsGroupsMapped<SampleGroups, true> }>{}
        paths?.forEach(path => intract(sampleMultiObjTemplate, ['root', ...path], true))
        
        function unMultiObjField_recursive(field: Field, multiObjTemplate: MultiObjectsGroupsOrLeafMapped<MultiObjectsGroupsTemplateOrLeaf, true> | undefined): Field {
            if (field instanceof MultiObjectsField) {
                if (multiObjTemplate === true)
                    return field
                else return field.inner
            }
            else if (field instanceof FieldsField) {
                const newfields = <FieldsPointMapped<FieldsPoint, Field>>{}
                for (const key of Reflect.ownKeys(field.fields)) {
                    const subfield = <Field>(<any>field.fields)[key]
                    const subMultiObjTemplate = <MultiObjectsGroupsOrLeafMapped<MultiObjectsGroupsTemplateLeaf, true> | undefined>(
                        multiObjTemplate ?
                            <MultiObjectsGroupsTemplateLeaf><unknown>multiObjTemplate === MultiObjectsGroupsTemplate_Leaf ?
                                undefined :
                                (<MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, true>>multiObjTemplate)[key] :
                            undefined
                    )
                    newfields[key] = unMultiObjField_recursive(subfield, subMultiObjTemplate)
                }
                return new FieldsField(newfields)
            }
            else return field
        }

        return unMultiObjField_recursive(field, sampleMultiObjTemplate.root)
    }

    [clone]() {
        return new MultiObjectsField(this.inner[clone](), this.multiObjectsIDs)
    }
}