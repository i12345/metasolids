import * as tf from "@tensorflow/tfjs"
import { Vec2, Vec3, Vec4 } from "playcanvas-extended"

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

export interface ScalarNLookup {
    [tf.Rank.R0]: never
    [tf.Rank.R1]: number
    [tf.Rank.R2]: Vec2
    [tf.Rank.R3]: Vec3
    [tf.Rank.R4]: Vec4
    [tf.Rank.R5]: never
    [tf.Rank.R6]: never
}

export type ScalarN<R extends tf.Rank> = ScalarNLookup[R]