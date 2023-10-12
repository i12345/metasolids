import * as tf from "@tensorflow/tfjs"
import { PerRank, TensorShape } from "../../utils/tf-rank.js"
import { PropertyPath, extract } from "../../paradigm/trees/index.js"
import { FieldsPoint } from "../point.js"

export interface FieldPointTensorTopology<R extends tf.Rank = tf.Rank> {
    shape: PerRank<number | PropertyPath, R>
    projector?: FieldPointTensorTopologyProjector<R>
}

export interface FieldPointTensorTopologyInstance<R extends tf.Rank = tf.Rank> {
    topology: FieldPointTensorTopology<R>
    shape: TensorShape<R>
    projector?: FieldPointTensorTopologyProjectorInstance<R>
}

export function field_point_tensor_topology_instance < R extends tf.Rank = tf.Rank > (
        topology: FieldPointTensorTopology<R>,
        parameters: FieldsPoint
    ): FieldPointTensorTopologyInstance<R> {
    const shape = <TensorShape<R>>topology.shape.map(semantic => typeof semantic === 'number' ?
        semantic :
        extract<number>(parameters, semantic)
    )

    const projector = topology.projector?.instance(shape)

    return {
        topology,
        shape,
        projector,
    }
}

export interface FieldPointTensorTopologyProjector<R extends tf.Rank = tf.Rank> {
    instance(shape: TensorShape<R>): FieldPointTensorTopologyProjectorInstance<R>
}

export interface FieldPointTensorTopologyProjectorInstance<R extends tf.Rank = tf.Rank> {
    shape: TensorShape<R>
    projector: FieldPointTensorTopologyProjector<R>

    project_delta(t: tf.Tensor<R>): tf.Tensor<R>
    project_update(t: tf.Tensor<R>): tf.Tensor<R>
}