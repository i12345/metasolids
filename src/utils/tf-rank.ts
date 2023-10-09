import * as tf from "@tensorflow/tfjs"
import { Vec2, Vec3, Vec4 } from "playcanvas-extended"

const rankArray = [tf.Rank.R0, tf.Rank.R1, tf.Rank.R2, tf.Rank.R3, tf.Rank.R4, tf.Rank.R5, tf.Rank.R6]
export function rankOfShape<R extends tf.Rank = tf.Rank>(shape: tf.ShapeMap[R]): R {
    return <R>rankArray[shape.length]
}

export interface RankPrevLookup {
    [tf.Rank.R0]: never
    [tf.Rank.R1]: tf.Rank.R0
    [tf.Rank.R2]: tf.Rank.R1
    [tf.Rank.R3]: tf.Rank.R2
    [tf.Rank.R4]: tf.Rank.R3
    [tf.Rank.R5]: tf.Rank.R4
    [tf.Rank.R6]: tf.Rank.R5
}

export type RankPrev<R extends tf.Rank> = RankPrevLookup[R]

export interface RankNextLookup {
    [tf.Rank.R0]: tf.Rank.R1
    [tf.Rank.R1]: tf.Rank.R2
    [tf.Rank.R2]: tf.Rank.R3
    [tf.Rank.R3]: tf.Rank.R4
    [tf.Rank.R4]: tf.Rank.R5
    [tf.Rank.R5]: tf.Rank.R6
    [tf.Rank.R6]: never
}

export type RankNext<R extends tf.Rank> = RankNextLookup[R]

export type RankAtOrBelow<R extends tf.Rank> =
    R extends tf.Rank.R0 ? tf.Rank.R0 : R | RankAtOrBelow<RankPrev<R>>

export type RankAtOrAbove<R extends tf.Rank> =
    R extends tf.Rank.R6 ? tf.Rank.R6 : R | RankAtOrAbove<RankNext<R>>

export interface PerRankLookup<T> {
    [tf.Rank.R0]: []
    [tf.Rank.R1]: [T]
    [tf.Rank.R2]: [T, T]
    [tf.Rank.R3]: [T, T, T]
    [tf.Rank.R4]: [T, T, T, T]
    [tf.Rank.R5]: [T, T, T, T, T]
    [tf.Rank.R6]: [T, T, T, T, T, T]
}

export type PerRank<T, R extends tf.Rank> = PerRankLookup<T>[R]

export interface PerRankLookupArtificialObject<T> {
    [tf.Rank.R0]: {}
    [tf.Rank.R1]: { [0]: T }
    [tf.Rank.R2]: { [0]: T, [1]: T }
    [tf.Rank.R3]: { [0]: T, [1]: T, [2]: T }
    [tf.Rank.R4]: { [0]: T, [1]: T, [2]: T, [3]: T }
    [tf.Rank.R5]: { [0]: T, [1]: T, [2]: T, [3]: T, [4]: T }
    [tf.Rank.R6]: { [0]: T, [1]: T, [2]: T, [3]: T, [4]: T, [5]: T }
}

export type PerRankArtificialObject<T, R extends tf.Rank> = PerRankLookupArtificialObject<T>[R]

export type ScalarN<R extends tf.Rank> = PerRankArtificialObject<number, R>