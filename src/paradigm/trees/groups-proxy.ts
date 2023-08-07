import { Reflect_entries } from "../../utils/reflect-entries.js"
import { MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplateLeaf, isGroupLeaf } from "./multi-objects-groups.js"

export type MultiObjectsGroupsOverwritten<
        Groups extends MultiObjectsGroupsTemplate,
        Original extends any,
        Overwriting extends MultiObjectsGroupsMapped<Groups, any>
    > = {
    [K in keyof Original]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            Overwriting[K] extends MultiObjectsGroupsTemplate ?
                MultiObjectsGroupsOverwritten<Groups[K], Original[K], Overwriting[K]> :
                never :
        Groups[K] extends MultiObjectsGroupsTemplateLeaf ?
            Overwriting[K] :
        Original[K]
} & Overwriting

class GroupOverwritingProxyHandler<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Original extends MultiObjectsGroupsMapped<Groups, any> = MultiObjectsGroupsMapped<Groups, any>,
        Overwriting extends MultiObjectsGroupsMapped<Groups, any> = MultiObjectsGroupsMapped<Groups, any>
    > implements ProxyHandler<Original> {
    private readonly proxyCache = new Map<
        object,
        Map<
            string | symbol,
            MultiObjectsGroupsOverwritten<Groups, Original, Overwriting>
        >
    >()
    
    constructor(
        public readonly groups: Groups,
        public readonly overwriting: Overwriting
    ) { }
    
    apply(target: Original, thisArg: any, argArray: any[]) {
        const f = target as any as Function
        f.apply(thisArg, argArray)
    }
    
    construct(target: Original, argArray: any[], newTarget: Function): object {
        throw new Error("not implemented")
    }
    
    defineProperty(target: Original, property: string | symbol, attributes: PropertyDescriptor): boolean {
        const subgroup = this.groups[property]
        if (subgroup) {
            if (isGroupLeaf(subgroup))
                return Reflect.defineProperty(this.overwriting, property, attributes)
            else if (!Reflect.has(target, property)) {
                //TODO: at this point, it cannot be ensured that the property attributes will conform to the override specification
                console.warn("This method could have work")
                return Reflect.defineProperty(this.overwriting, property, attributes)
            }
            else
                throw new Error("overwritten/proxied properties should not be mixed with non-overwritten/proxied properties when defining properties")
        }
        else
            return Reflect.defineProperty(target, property, attributes)
    }

    deleteProperty(target: Original, p: string | symbol) {
        const subgroup = this.groups[p]
        if (subgroup) {
            if (isGroupLeaf(subgroup) || !Reflect.has(target, p))
                return Reflect.deleteProperty(this.overwriting, p)
            else
                throw new Error("overwritten/proxied properties should not be mixed with non-overwritten/proxied properties when deleting properties")
        }
        else
            return Reflect.deleteProperty(target, p)
    }

    private subproxy(target: Original, p: string | symbol) {
        if (!this.proxyCache.has(target))
            this.proxyCache.set(target, new Map())
        if (!this.proxyCache.get(target)!.has(p)) {
            const proxy = new Proxy(
                (target as any)[p] ??= {},
                new GroupOverwritingProxyHandler(
                    this.groups[p] as MultiObjectsGroupsTemplate,
                    (this.overwriting as any)[p] ??= {}
                )
            )
            this.proxyCache.get(target)!.set(p, proxy as any)
        }
        return this.proxyCache.get(target)!.get(p)!
    }
    
    get(target: Original, p: string | symbol, receiver: any) {
        const subgroup = this.groups[p]
        if (subgroup) {
            if (isGroupLeaf(subgroup) || !Reflect.has(target, p))
                return Reflect.get(this.overwriting, p)
            else
                return this.subproxy(target, p)
        }
        
        return Reflect.get(target, p, receiver)
    }

    set(target: Original, p: string | symbol, newValue: any, receiver: any): boolean {
        const subgroup = this.groups[p]
        if (subgroup) {
            if (isGroupLeaf(subgroup))
                return Reflect.set(this.overwriting, p, newValue)
            else {
                const proxy = this.subproxy(target, p)

                const value_new = newValue
                const value_old = Reflect.get(target, p, receiver)

                const properties_new = Reflect_entries<any>(value_new)
                const properties_old = Reflect_entries<any>(value_old)

                const properties_defined = properties_new.filter(([key_new]) => !properties_old.some(([key_old]) => key_new === key_old))
                const properties_deleted = properties_old.filter(([key_old]) => !properties_new.some(([key_new]) => key_old === key_new))
                const properties_shared = properties_old.map(
                    ([key, property_value_old]) => [
                            key,
                            property_value_old,
                            properties_new.find(([key_new]) => key === key_new)
                    ] as [key: string | symbol, property_value_old: any, property_new: [key: string | symbol, value: any] | undefined]
                ).filter(([, , property_new]) => property_new !== undefined) as [key: string | symbol, property_value_old: any, property_new: [key: string | symbol, value: any]][]

                const properties_changed = properties_shared.filter(([, property_value_old, [, property_value_new]]) => property_value_old !== property_value_new)
                
                return (
                    properties_defined.every(([key]) => Reflect.defineProperty(proxy, key, Reflect.getOwnPropertyDescriptor(value_new, key)!)) &&
                    properties_deleted.every(([key]) => Reflect.deleteProperty(proxy, key)) &&
                    properties_changed.every(([key, , [, newValue]]) => Reflect.set(proxy, key, newValue))
                )
            }
        }
        
        return Reflect.set(target, p, newValue, receiver)
    }

    has(target: Original, p: string | symbol): boolean {
        return Reflect.has(this.overwriting, p) || Reflect.has(target, p)
    }

    getOwnPropertyDescriptor(target: Original, p: string | symbol): PropertyDescriptor | undefined {
        const subgroup = this.groups[p]
        if (subgroup) {
            if (isGroupLeaf(subgroup))
                return Reflect.getOwnPropertyDescriptor(this.overwriting, p)
            else {
                const propertyDescriptor = {
                    overwriting: Reflect.getOwnPropertyDescriptor(this.overwriting, p),
                    target: Reflect.getOwnPropertyDescriptor(target, p)
                }

                const proxy = this.subproxy(target, p)

                const get = this.get.bind(this, target, p, target)
                const set_bound = this.set.bind(this, target, p)
                const set = (value: any) => set_bound(value, target)

                return {
                    configurable: propertyDescriptor.target!.configurable && propertyDescriptor.overwriting!.configurable,
                    enumerable: propertyDescriptor.target!.enumerable && propertyDescriptor.overwriting!.enumerable,
                    writable: propertyDescriptor.target!.writable && propertyDescriptor.overwriting!.writable,
                    value: proxy,
                    get,
                    set
                }
            }
        }
        
        return Reflect.getOwnPropertyDescriptor(target, p)
    }

    getPrototypeOf(target: Original): object | null {
        return Reflect.getPrototypeOf(target)
    }

    setPrototypeOf(target: Original, v: object | null): boolean {
        return Reflect.setPrototypeOf(target, v)
    }

    ownKeys(target: Original): ArrayLike<string | symbol> {
        const keys = new Set<string | symbol>(Reflect.ownKeys(target))
        Reflect.ownKeys(this.groups).forEach(key => keys.add(key))
        return [...keys]
    }

    isExtensible(target: Original): boolean {
        return Reflect.isExtensible(this.overwriting) || Reflect.isExtensible(target)
    }

    preventExtensions(target: Original): boolean {
        return Reflect.preventExtensions(target)
    }
}

/**
 * Makes a proxy object that will get, set, define, and delete properties on
 * the original object except for properties specified as overwritten; these
 * are targeted to the overwriting object.
 * @param groups the groups to overwrite
 * @param original the original object to handle all non-overwritten properties
 * @param overwriting the overwriting storage object; if no overwriting object is given then an empty object will be made
 * @returns the proxy object
 */
export function groupsProxyOverwritten<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Original extends MultiObjectsGroupsMapped<Groups, any> = MultiObjectsGroupsMapped<Groups, any>,
        Overwriting extends MultiObjectsGroupsMapped<Groups, any> = MultiObjectsGroupsMapped<Groups, any>
    >(
        groups: Groups,
        original: Original,
        overwriting?: Overwriting
    ): MultiObjectsGroupsOverwritten<Groups, Original, Overwriting> {
    return new Proxy(original, new GroupOverwritingProxyHandler(groups, overwriting ?? {} as Overwriting)) as any
}

// let original = {
//     abc: 123,
//     ijk: 456,
//     uvw: 789
// }

// type overwriting_groups = {
//     abc: MultiObjectsGroupsTemplateLeaf
//     uvw: MultiObjectsGroupsTemplateLeaf
// }

// let overwriting_groups_template: overwriting_groups = {
//     abc: MultiObjectsGroupsTemplate_Leaf,
//     uvw: MultiObjectsGroupsTemplate_Leaf
// }

// let overwriting: MultiObjectsGroupsMapped<overwriting_groups, string> = {
//     abc: "abc",
//     uvw: "uvw"
// }

// let overwritten = groupsProxyOverwritten(overwriting_groups_template, original, overwriting)
// overwriting.abc
// overwritten.ijk
// overwritten.uvw