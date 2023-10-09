import * as tf from "@tensorflow/tfjs"
import { FieldPointTensorTopologyProjector, FieldPointTensorTopologyProjectorInstance } from "../topology.js";
import { TensorShape } from "../../../utils/tf-rank.js";

export class FieldPointTensorToplogyProjectorCopy<R extends tf.Rank = tf.Rank>
    implements FieldPointTensorTopologyProjector<R> {
    
    constructor(

    ) {}
    
    instance(shape: TensorShape<R>): FieldPointTensorTopologyProjectorInstance<R> {
        return new FieldPointTensorToplogyProjectorInstanceCopy(shape, this)
    }
}

export class FieldPointTensorToplogyProjectorInstanceCopy<R extends tf.Rank = tf.Rank>
    implements FieldPointTensorTopologyProjectorInstance<R> {
    constructor(
        public readonly shape: TensorShape<R>,
        public readonly projector: FieldPointTensorTopologyProjector<R>
    ) { }

    project(t: tf.Tensor<R>): tf.Tensor<R> {
        throw new Error("Method not implemented.");
    }
}