import { vectorized } from "vectorized-functions";
import { MultiObjectsGroupedObjectsKey, MultiObjectsIDsKey, MultiObjectsTemplate, PropertyMapping, PropertyPath, WithMultiObjectsIDs, object_mapped } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { SampleDomainLocationFieldKey, SamplingContext } from "../domain.js";
import { FieldPoint, FieldPointMapped, fields_point_map } from "../point.js";
import { FieldPointVector, FieldPointVectorContainerStatic, ItemObjIDsKey, ItemObjValuesOffsetsKey } from "../vectorized/index.js";
import { VectorSampleDomain, VectorSamplingContext } from "./vector.js";
import { Field } from "../field.js";
import { makeInterpolator } from "../interpolation.js";
import { MultiObjectsField, FieldsField } from "../fields/index.js";

export class MappingSampleDomain<
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> =
            SamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends FieldPointVector<SampleElementType, SampleContainer> = FieldPointVector<SampleElementType, SampleContainer>,
        VectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector
                >
    >
    implements VectorSampleDomain<
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SingularContext,
        LocationVector,
        SampleVector,
        VectorContext
    > {
    private _field!: Field<Sample, SampleElementType, SampleFuseMode>

    get field() {
        return this._field
    }
    
    constructor(
        public mappings: PropertyMapping[] = [{
            from: [],
            to: []
        }]
    ) { }

    init(context: SingularContext): void {
        function fields(field: Field): FieldPointMapped<FieldPoint, Field> {
            if (field instanceof FieldsField)
                return fields_point_map(
                    field.fields,
                    leaf => leaf.interpolationType && (makeInterpolator in leaf.interpolationType),
                    leaf => fields(leaf)
                )
            else if (field instanceof MultiObjectsField)
                return { [MultiObjectsGroupedObjectsKey]: fields(field.inner) }
            else return field
        }

        this._field = object_mapped(
            fields(context[SampleDomainLocationFieldKey]),
            this.mappings,
            (<Partial<WithMultiObjectsIDs<Objects, ObjIDsT>>>context)[MultiObjectsIDsKey]
        )
    }

    @vectorized(MappingSampleDomain.sample_vectorized)
    sample(location: Location, context: SingularContext): Sample {
        //TODO: support mappng per-object properties
        return object_mapped(location, this.mappings, (<Partial<WithMultiObjectsIDs<Objects, ObjIDsT>>>context)[MultiObjectsIDsKey])
    }

    private static sample_vectorized<
            Location extends FieldPoint = FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
            LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
            Sample extends FieldPoint = FieldPoint,
            SampleElementType extends FieldPoint = Sample,
            SampleFuseMode extends FieldPoint = Sample,
            SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
            SingularContext extends
                SamplingContext<Location, LocationElementType, LocationFuseMode> =
                SamplingContext<Location, LocationElementType, LocationFuseMode>,
            LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
            SampleVector extends FieldPointVector<SampleElementType, SampleContainer> = FieldPointVector<SampleElementType, SampleContainer>,
            VectorContext extends
                VectorSamplingContext<
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        Sample,
                        SampleElementType,
                        SampleFuseMode,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        SingularContext,
                        LocationVector,
                        SampleVector
                    > =
                VectorSamplingContext<
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        Sample,
                        SampleElementType,
                        SampleFuseMode,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        SingularContext,
                        LocationVector,
                        SampleVector
                    >
        >(
            this: MappingSampleDomain<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                Sample,
                SampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                SampleVector,
                VectorContext
            >,
            locations: LocationVector,
            context: VectorContext
        ): SampleVector {
        const copy = [ItemObjIDsKey, ItemObjValuesOffsetsKey].map<PropertyMapping>(root_key => ({
            from: [root_key],
            to: [root_key]
        }))

        function objGroupRemoved(path: PropertyPath) {
            const objGroupIndex = path.indexOf(MultiObjectsGroupedObjectsKey)
            if (objGroupIndex === -1)
                return path
            else return [...path.slice(0, objGroupIndex), ...path.slice(objGroupIndex + 1)]
        }

        const mappings_objGroupRemoved = this.mappings.map(({ from, to }) => ({
            from: objGroupRemoved(from),
            to: objGroupRemoved(to),
        }))

        return object_mapped(locations, [...mappings_objGroupRemoved, ...copy])
    }
}