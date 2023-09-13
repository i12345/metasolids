import { groupsProxyOverwritten } from "./groups-proxy.js"
import { MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "./multi-objects-groups.js"

export const EncapsulatingKey = Symbol("encapsulating")

export type WithEncapsulating<EncapsulatingT> = {
    [EncapsulatingKey]: EncapsulatingT
}

export type EncapsulatingGroup = { [EncapsulatingKey]: MultiObjectsGroupsTemplateLeaf }
export const EncapsulatingGroupTemplate: EncapsulatingGroup = { [EncapsulatingKey]: MultiObjectsGroupsTemplate_Leaf }

export type WithoutEncapsulating<EncapsulatedT extends WithEncapsulating<any>> =
    Omit<EncapsulatedT, typeof EncapsulatingKey>

// let a!: WithEncapsulating<string> & { b: string }
// let b!: WithoutEncapsulating<typeof a>
// typeof a[EncapsulatingKey] === 'string' // ok (expected)
// a.b // string
// typeof b[EncapsulatingKey] === 'string' // error (expected)
// b.b // string

export function encapsulated<T extends object, Encapsulating>(item: T, encapsulating: Encapsulating): T & WithEncapsulating<Encapsulating> {
    return groupsProxyOverwritten<WithEncapsulating<MultiObjectsGroupsTemplateLeaf>, T, WithEncapsulating<Encapsulating>> (
        { [EncapsulatingKey]: MultiObjectsGroupsTemplate_Leaf },
        item,
        { [EncapsulatingKey]: encapsulating },
        false
    ) as T & WithEncapsulating<Encapsulating>
}