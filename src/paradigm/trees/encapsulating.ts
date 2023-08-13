export const EncapsulatingKey = Symbol("encapsulating")

export type WithEncapsulating<EncapsulatingT> = {
    [EncapsulatingKey]: EncapsulatingT
}

export type WithoutEncapsulating<EncapsulatedT extends WithEncapsulating<any>> =
    Omit<EncapsulatedT, typeof EncapsulatingKey>

// let a!: WithEncapsulating<string> & { b: string }
// let b!: WithoutEncapsulating<typeof a>
// typeof a[EncapsulatingKey] === 'string' // ok (expected)
// a.b // string
// typeof b[EncapsulatingKey] === 'string' // error (expected)
// b.b // string

export function encapsulated<T extends object, Encapsulating>(item: T, encapsulating: Encapsulating): T & WithEncapsulating<Encapsulating> {
    return new Proxy(item, {
        get(target, p, receiver) {
            if (target === item && p === EncapsulatingKey)
                return encapsulating
            else if (receiver)
                return Reflect.get(target, p, receiver)
            else return Reflect.get(target, p)
        },
        has(target, p) {
            return p === EncapsulatingKey || Reflect.has(target, p)
        },
    }) as any
}