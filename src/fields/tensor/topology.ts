import * as tf from "@tensorflow/tfjs"
import { PerRank, TensorShape } from "../../utils/tf-rank.js"
import { PropertyPath, extract } from "../../paradigm/trees/index.js"
import { FieldsPoint } from "../point.js"

export interface FieldPointTensorSpace<R extends tf.Rank = tf.Rank> {
    shape: PerRank<number | PropertyPath, R>
}

export interface FieldPointTensorTopology<R extends tf.Rank = tf.Rank> {
    space: FieldPointTensorSpace<R>
    shape: TensorShape<R>
    projector: FieldPointTensorTopologyProjector<R>
}

export function field_point_tensor_topology_instance<R extends tf.Rank = tf.Rank>(
        space: FieldPointTensorSpace<R>,
        parameters: FieldsPoint,
        projectors: Map<FieldPointTensorSpace, FieldPointTensorTopologyProjectorFactory>,
    ): FieldPointTensorTopology<R> {
    const shape = <TensorShape<R>>space.shape.map(semantic => typeof semantic === 'number' ?
        semantic :
        extract<number>(parameters, semantic)
    )

    const projector = (<FieldPointTensorTopologyProjectorFactory<R>>projectors.get(space)!).instance(shape)

    return {
        space,
        shape,
        projector,
    }
}

export interface FieldPointTensorTopologyProjectorFactory<R extends tf.Rank = tf.Rank> {
    instance(shape: TensorShape<R>): FieldPointTensorTopologyProjector<R>
}

export interface FieldPointTensorTopologyProjector<R extends tf.Rank = tf.Rank> {
    shape: TensorShape<R>
    projector: FieldPointTensorTopologyProjectorFactory<R>
    mask: tf.Tensor<R>

    project_delta(t: tf.Tensor<R>): tf.Tensor<R>
    project_update(t: tf.Tensor<R>): tf.Tensor<R>
}