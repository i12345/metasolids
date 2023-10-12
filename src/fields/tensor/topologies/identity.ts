import * as tf from "@tensorflow/tfjs"
import { FieldPointTensorTopologyProjectorFactory, FieldPointTensorTopologyProjector } from "../topology.js";
import { TensorShape } from "../../../utils/tf-rank.js";

export class FieldPointTensorTopologyProjectorFactoryIdentity<R extends tf.Rank = tf.Rank>
    implements FieldPointTensorTopologyProjectorFactory<R> {
    instance(realShape: TensorShape<R>): FieldPointTensorTopologyProjector<R> {
        return new FieldPointTensorTopologyProjectorIdentity(realShape, this)
    }
}

export class FieldPointTensorTopologyProjectorIdentity<R extends tf.Rank = tf.Rank>
    implements FieldPointTensorTopologyProjector<R> {
    readonly mask = tf.scalar(true).broadcastTo(this.shape)
    
    constructor(
            public readonly shape: TensorShape<R>,
            public readonly projector: FieldPointTensorTopologyProjectorFactory<R>
        ) { }
        
    project_delta(t: tf.Tensor<R>): tf.Tensor<R> {
        return t
    }
    
    project_update(t: tf.Tensor<R>): tf.Tensor<R> {
        return t
    }
}
