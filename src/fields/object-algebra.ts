import { Reflect_entries } from "../utils/index.js"
import { ExtraFields, FieldsPoint } from "./point.js"

export function change<Final, Start, Subtract>(
        start: Start,
        subtract: (keyof Subtract)[],
        add: any
        // add: Omit<Final, keyof Start>
    ) {
    const subtracted = { ...start } as any
    for (const key of subtract) delete subtracted[key]

    const added = subtracted as unknown as Final
    for (const [key, value] of Reflect_entries(add)) (added as any)[key] = value

    return added
}

export function extraFields<Base extends FieldsPoint, Real extends Base = Base>(real: Real, base: { [K in keyof Base]: true }): ExtraFields<Real, Base> {
    return change<ExtraFields<Real, Base>, Real, Base>(real, Reflect.ownKeys(base) as (keyof Base)[], {})
}