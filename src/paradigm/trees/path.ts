import { EncapsulatingKey, WithEncapsulating } from "./encapsulating.js"

export type PropertyPath = PropertyKey[]
export const PROPERTYKEY_ALL = Symbol('all')

interface ParentLink extends Partial<WithEncapsulating<ParentLink>> {
    parent: object
}

export const pathExists = (object: any, path: PropertyPath, parent: ParentLink | undefined = undefined): boolean => {
    if (object === undefined || object === null)
        return false
    else if (path.length === 0)
        return true
    else {
        const subpath = [...path]
        const key = subpath.shift()!

        if (key === PROPERTYKEY_ALL)
            return Object.values(object).every(value => pathExists(value, subpath))
        else if (key === EncapsulatingKey) {
            if(EncapsulatingKey in object)
                return pathExists(object[EncapsulatingKey], subpath, undefined)
            else if (parent)
                return pathExists(parent.parent, subpath, parent[EncapsulatingKey])
            else return false
        }
        else return pathExists(object[key], subpath, { parent: object, [EncapsulatingKey]: parent })
    }
}

/**
 * Tests if one path subsumes another.
 *
 * @param path the path considered more general
 * @param subpath the path that may be a subpath of {@link path}
 * @returns true if the {@link subpath} would exist if the {@link path} exists
 */
export function pathSubsumes(path: PropertyPath, subpath: PropertyPath): boolean {
    if (subpath.length < path.length)
        for (let i = subpath.length; i < path.length; i++)
            if (path[i] !== PROPERTYKEY_ALL)
                return false
    
    for (let i = path.length - 1; i >= 0; i--) {
        if (path[i] === PROPERTYKEY_ALL)
            continue
        
        if (path[i] !== subpath[i])
            return false
    }

    return true
}