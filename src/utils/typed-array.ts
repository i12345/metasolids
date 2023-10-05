export type NumberTypedArray =
    Uint8Array |
    Uint8ClampedArray |
    Int8Array |
    Uint16Array |
    Int16Array |
    Uint32Array |
    Int32Array |
    Float32Array |
    Float64Array

export type BigIntTypedArray =
    BigUint64Array |
    BigInt64Array

export type TypedArray<T extends number | bigint = number | bigint> =
    (T extends number ? NumberTypedArray : never) |
    (T extends bigint ? BigIntTypedArray : never)

export type NumberArrayLike<T extends number | bigint = number> = TypedArray<T> | T[]

export function isNumberTypedArray<TArray>(x: TArray): TArray extends TypedArray<number> ? true : false {
    return <TArray extends TypedArray<number> ? true : false>(
        x instanceof Uint8Array ||
        x instanceof Uint8ClampedArray ||
        x instanceof Int8Array ||
        x instanceof Uint16Array ||
        x instanceof Int16Array ||
        x instanceof Uint32Array ||
        x instanceof Int32Array ||
        x instanceof Float32Array ||
        x instanceof Float64Array
    )
}

export function isBigIntTypedArray<TArray>(x: TArray): TArray extends TypedArray<bigint> ? true : false {
    return <TArray extends TypedArray<bigint> ? true : false>(
        x instanceof BigInt64Array ||
        x instanceof BigUint64Array
    )
}

export function isTypedArray<TArray>(x: TArray): TArray extends TypedArray ? true : false {
    return <TArray extends TypedArray ? true : false>(isNumberTypedArray(x) || isBigIntTypedArray(x))
}

export function sum<T extends number | bigint, TArray extends TypedArray<T> = TypedArray<T>>(array: TArray): T {
    if (array.length === 0)
        return <T>(new (<TypedArrayConstructor<T>>array.constructor)(1)[0])

    let result = <T>array[0]
    for (let i = 1; i < array.length; i++)
        result += <any>array[i]

    return result
}

export function add<T extends number | bigint, AccumulatorT extends TypedArray<T>, AddendT extends TypedArray<T>>(accumulator: AccumulatorT, ...addends: AddendT[]) {
    for (const addend of addends) {
        if (addend.length !== accumulator.length)
            throw new Error(`accumulator.length (${accumulator.length}) !== addend.length (${addend.length})`)

        for (let i = 0; i < accumulator.length; i++)
            accumulator[i] += <any>addend[i]
    }

    return accumulator
}

export function addDeltas<T extends number | bigint, AccumulatorT extends TypedArray<T>, OffsetsT extends TypedArray<T>>(deltasAccumulator: AccumulatorT, offsets: OffsetsT | T): void {
    if (isTypedArray(offsets)) {
        let prev = <T>(isNumberTypedArray(deltasAccumulator) ? 0 : 0n)
        let next: T
        for (let i = 0; i < deltasAccumulator.length; i++) {
            next = <T>(<OffsetsT>offsets)[i]
            deltasAccumulator[i] += <any>(next - prev)
            prev = next
        }
    }
    else {
        for (let i = 0; i < deltasAccumulator.length; i++)
            deltasAccumulator[i] += <any>offsets
    }
}

export function typedArrayClone<T extends number | bigint, TypedArrayT extends TypedArray<T> = TypedArray<T>>(array: TypedArrayT): TypedArrayT {
    const clone = <TypedArrayT>(new (typedArrayConstructor(array))(array.length))
    clone.set(<ArrayLike<bigint> & ArrayLike<number>><unknown>array)
    return clone
}

// export type TypedArrayConstructor =
//     Uint8ArrayConstructor |
//     Uint8ClampedArrayConstructor |
//     Int8ArrayConstructor |
//     Uint16ArrayConstructor |
//     Int16ArrayConstructor |
//     Uint32ArrayConstructor |
//     Int32ArrayConstructor |
//     Float32ArrayConstructor |
//     Float64ArrayConstructor |
//     BigUint64ArrayConstructor |
//     BigInt64ArrayConstructor

export type TypedArrayConstructor<
        T extends number | bigint = number | bigint,
        TypedArrayT extends TypedArray<T> = TypedArray<T>
    > =
    (T extends number ? TypedArrayT extends NumberTypedArray ? (
        TypedArrayT extends Uint8Array ? Uint8ArrayConstructor :
        TypedArrayT extends Uint8ClampedArray ? Uint8ClampedArrayConstructor :
        TypedArrayT extends Int8Array ? Int8ArrayConstructor :
        TypedArrayT extends Uint16Array ? Uint16ArrayConstructor :
        TypedArrayT extends Int16Array ? Int16ArrayConstructor :
        TypedArrayT extends Uint32Array ? Uint32ArrayConstructor :
        TypedArrayT extends Int32Array ? Int32ArrayConstructor :
        TypedArrayT extends Float32Array ? Float32ArrayConstructor :
        TypedArrayT extends Float64Array ? Float64ArrayConstructor :
        never
    ) : never : never) |
    (T extends bigint ? TypedArrayT extends BigIntTypedArray ? (
        TypedArrayT extends BigUint64Array ? BigUint64ArrayConstructor :
        TypedArrayT extends BigInt64Array ? BigInt64ArrayConstructor :
        never
    ) : never : never)

// let a1: TypedArrayConstructor
// let a2: TypedArrayConstructor<number, Float32Array>
// let a3: TypedArrayConstructor<number | bigint, BigInt64Array> = BigInt64Array
// let a4: TypedArrayConstructor<number | bigint, Int32Array> = Int32Array
// let a5: TypedArrayConstructor<number> = BigInt64Array // err (expected)
// let a6: TypedArrayConstructor<bigint> = Float32Array // err (expected)
// let a7: TypedArrayConstructor<number> = BigInt64Array // err (expected)
// let a8: TypedArrayConstructor<bigint> = Float32Array // err (expected)
// let a9: TypedArrayConstructor<number> = Float32Array // ok (expected)
// let a10: TypedArrayConstructor<bigint> = BigUint64Array // ok (expected)
// let a11: TypedArrayConstructor<number, BigInt64Array> // err (expected)
// let a12: TypedArrayConstructor<bigint, Int32Array> // err (expected)

export function typedArrayConstructor<T extends number | bigint, TArray extends TypedArray<T> = TypedArray<T>>(typedArrayOrConstructor: TArray | TypedArrayConstructor<T, TArray>): TypedArrayConstructor<T, TArray> {
    if ([Uint8Array, Int8Array, Uint8ClampedArray, Uint16Array, Int16Array, Uint32Array, Int32Array, Float32Array, Float64Array, BigUint64Array, BigInt64Array].includes(<TypedArrayConstructor<T, TArray>>typedArrayOrConstructor))
        return <TypedArrayConstructor<T, TArray>>typedArrayOrConstructor
    return <TypedArrayConstructor<T, TArray>>typedArrayOrConstructor.constructor
}

//TODO: merge with invalidIndex()
const invalid_lookup = new Map<TypedArrayConstructor, number | bigint>()
export function typedArrayInvalid<T extends number | bigint, TypedArrayT extends TypedArray<T>>(array: TypedArrayT | TypedArrayConstructor<T, TypedArrayT>): T {
    const type = typedArrayConstructor(array)
    if (invalid_lookup.has(type))
        return <T>invalid_lookup.get(type)!

    const invalid_array = <TypedArrayT>new type(1)
    invalid_array[0] = isNumberTypedArray(invalid_array) ? -1 : -1n
    invalid_lookup.set(type, invalid_array[0])
    return <T>invalid_array[0]
}