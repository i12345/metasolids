type IsEmptyStruct<T> = (
    T extends (boolean | number | string | symbol | bigint | Function | null | undefined) ? false :
    T extends never ? true : (
        { [K in keyof NonNullable<T>]: IsEmptyStruct<NonNullable<T>[K]> } extends
        { [K in keyof NonNullable<T>]: true } ?
            true : false
    )
)

// let emptyStruct_1: {
// }

// let isEmpty_1: IsEmptyStruct<typeof emptyStruct_1> = true

// let emptyStruct_2: {
//     a: never
//     b: {
//         c: never
//     }
// }

// let isEmpty_2: IsEmptyStruct<typeof emptyStruct_2> = true

// let emptyStruct_3: {
//     a: number
//     b: {
//         c: never
//     }
// }

// let debug1: (typeof emptyStruct_3) extends never ? true : false
// let debug2: IsEmptyStruct<(typeof emptyStruct_3)["a"]>
// let isEmpty_3: IsEmptyStruct<typeof emptyStruct_3> = false

// let halfEmptyStruct_1: {
//     a: number
//     b: boolean
//     c: {
//         u: never
//         v: never
//         w: {
//             calculation: never
//             z: bigint
//         }
//     }
//     d: {
//         u: never
//         v: never
//         w: {
//             calculation: never
//         }
//     }
// }

// let isEmpty_4: IsEmptyStruct<typeof halfEmptyStruct_1> = false
// let isEmpty_5: IsEmptyStruct<typeof halfEmptyStruct_1["c"]> = false
// let isEmpty_6: IsEmptyStruct<typeof halfEmptyStruct_1["d"]> = true

type RemoveEmptyStructs_recursive<T extends object> = (
    IsEmptyStruct<T> extends true ?
        never :
        {
            [K in keyof T]:
                NonNullable<T[K]> extends object ?
                    RemoveEmptyStructs_recursive<NonNullable<T[K]>> :
                    T[K]
        }
)

export type RemoveEmptyStructs<T extends object> =
    IsEmptyStruct<T> extends true ?
        {} :
        RemoveEmptyStructs_recursive<T>

// let debug0a: {} extends object ? true : false = true
// let debug0b: undefined extends object ? true : false = false
// let debug0c: 123 extends object ? true : false = false
// let debug0d: bigint extends object ? true : false = false
// let debug0e: null extends object ? true : false = false
// let debug0f: ({ a?: { b: number }})["a"] extends object ? true : false = false
// let debug0h: NonNullable<({ a?: { b: number }})["a"]> extends object ? true : false = true

// let removedEmpty_1: RemoveEmptyStructs<typeof emptyStruct_1> = {}
// let removedEmpty_2: RemoveEmptyStructs<typeof emptyStruct_2> = {}
// let removedEmpty_3: RemoveEmptyStructs<typeof halfEmptyStruct_1> = {
//     a: 1,
//     b: false,
//     c: {
//         u: undefined as never,
//         v: undefined as never,
//         w: {
//             z: BigInt(1),
//             calculation: undefined as never,
//         }
//     },
//     d: undefined as never,
// }
// removedEmpty_3 = {
//     a: 1,
//     b: false,
//     c: {
//         w: {
//             z: BigInt(1),
//         }
//     },
// } as RemoveEmptyStructs<typeof halfEmptyStruct_1>

// interface Int {
//     a: never
//     b: number
// }

// let i!: Int
// i.a
// i.b
// i = {
//     b: 12
// } as Int