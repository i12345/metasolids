import { Vec3 } from "playcanvas-extended";
import { SampleDomain, SamplingContext } from "../../domain.js";
import { FieldPoint } from "../../point.js";
import { Field } from "../../field.js";
import { OctTree, OctTreeSpace } from "../../../paradigm/octtree/index.js";
import { OctTreeSampleDomain } from "./interface.js";

export class ConstantOctTreeSampleDomain<T extends FieldPoint, Layer extends ArrayLike<T>>
    implements OctTreeSampleDomain<T, Layer> {
    constructor(
        public readonly octtree: OctTree<T, Layer>,
        public readonly field: Field<T>,
        public readonly space: OctTreeSpace
    ) { }

    init(context: SamplingContext<Vec3>): void {
    }

    sample(location: Vec3, context: SamplingContext<Vec3>): T {
        const { layer, local_index } = this.space.indexOfPosition(location)
        return this.octtree.layers[layer][local_index]
    }
}