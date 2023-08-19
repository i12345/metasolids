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