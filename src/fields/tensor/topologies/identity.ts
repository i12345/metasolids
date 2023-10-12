import * as tf from "@tensorflow/tfjs"
import { FieldPointTensorTopologyProjector, FieldPointTensorTopologyProjectorInstance } from "../topology.js";
import { TensorShape } from "../../../utils/tf-rank.js";

export class FieldPointTensorTopologyProjectorIdentity<R extends tf.Rank = tf.Rank>
    implements FieldPointTensorTopologyProjector<R> {
    instance(realShape: TensorShape<R>): FieldPointTensorTopologyProjectorInstance<R> {
        return new FieldPointTensorTopologyProjectorInstanceIdentity(realShape, this)
    }
}

export class FieldPointTensorTopologyProjectorInstanceIdentity<R extends tf.Rank = tf.Rank>
    implements FieldPointTensorTopologyProjectorInstance<R> {
    constructor(
            public readonly shape: TensorShape<R>,
            public readonly projector: FieldPointTensorTopologyProjector<R>
        ) { }
        
    project_delta(t: tf.Tensor<R>): tf.Tensor<R> {
        return t
    }
    
    project_update(t: tf.Tensor<R>): tf.Tensor<R> {
        return t
    }
}
