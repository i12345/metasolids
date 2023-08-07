import { Vec3 } from "playcanvas-extended";
import { FieldPoint } from "../../point.js";
import { SampleDomain } from "../../domain.js";
import { OctTree, OctTreeSpace } from "../../../paradigm/octtree/index.js";

export interface OctTreeSampleDomain<T extends FieldPoint, Layer extends ArrayLike<T>>
    extends SampleDomain<Vec3, T> {
    octtree: OctTree<T, Layer>
    space: OctTreeSpace
}