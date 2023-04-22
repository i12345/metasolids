export type PropertyPath = PropertyKey[]
export const PROPERTYKEY_ANY = Symbol()

export const pathExists = (object: any, path: PropertyPath) => {
    if (path.length === 0)
        return true
    else if (typeof object !== 'object' || object === null)
        return false
    else {
        const subpath = [...path]
        const key = subpath.shift()

        if (key === PROPERTYKEY_ANY)
            return Object.values(object).some(value => pathExists(value, subpath))
        else return pathExists(object[key], subpath)
    }
}