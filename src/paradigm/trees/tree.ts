import { PropertyPath } from "./path.js"

export interface TreeByValue<
        Leaf,
        Tree extends TreeByValue<Leaf, Tree>
    > {
    [key: PropertyKey]:
        Tree |
        Leaf
}

export type TreeByValueOrLeaf<
        Leaf,
        Tree extends TreeByValue<Leaf, Tree>
    > =
    Tree | Leaf

export type TreeByValueMapped<
        Leaf,
        Tree extends TreeByValue<Leaf, Tree>,
        T
    > =
    TreeByValueMapped_recursive<Leaf, Tree, Tree, T>

export type TreeByValueMapped_recursive<
        Leaf,
        Tree extends TreeByValue<Leaf, Tree>,
        Node extends TreeByValue<Leaf, Tree>,
        T
    > = {
    [K in keyof Node]:
        Tree[K] extends Tree ?
            TreeByValueMapped_recursive<Leaf, Tree, Tree[K], T> :
            Tree[K] extends Leaf ? T : never
}

export const extract = <T>
    (tree: any, path: PropertyPath) =>
        path.reduce((obj, key) => obj ? obj[key] : undefined, tree) as T

export const intract = <T>
    (tree: any, path: PropertyPath, value: T) => {
    for (let i = 0; i < path.length - 1; i++)
        tree = (tree[path[i]] ??= {})
    tree[path[path.length - 1]] = value
    return value
}

export const hasPath =
    (tree: any, path: PropertyPath) => {
    for (let i = 0; i < path.length; i++) {
        if (!Reflect.has(tree, path[i]))
            return false
        tree = tree[path[i]]
    }
    return true
}

export const deletePath =
    (tree: any, path: PropertyPath) => {
    for (let i = 0; i < path.length - 1; i++) {
        if (!Reflect.has(tree, path[i]))
            return false
        tree = tree[path[i]]
    }
    return delete tree[path[path.length - 1]]
}

export const makeExtractor =
    <TDefault = any>(path: PropertyPath) =>
    <T = TDefault>(tree: any, makeEmptyObjects = false) =>
        makeEmptyObjects ?
            path.reduce((obj, key) => obj[key] ??= {}, tree) as T :
            path.reduce((obj, key) => obj ? obj[key] : undefined, tree) as T

export const makeIntractor =
    <TDefault = any>(path: PropertyPath) =>
    <T = TDefault>(tree: any, value: T) =>
        intract(tree, path, value)

export const makeHas =
    (path: PropertyPath) =>
    (tree: any) =>
        hasPath(tree, path)

export const makeDeleter =
    (path: PropertyPath) =>
    (tree: any) =>
        deletePath(tree, path)

/**
 * Searches for nodes that have a search keys present and returns paths to
 * those nodes.
 * @param tree the tree to search for nodes with a certain key
 * @param leaf the key to look for on each node
 */
export function* pathsToNodeWithKey(
        tree: any,
        leaf: PropertyKey
    ): Generator<PropertyPath> {
    if (tree) {
        let nodeHasKeys = false
        for (const key of Reflect.ownKeys(tree)) {
            if (!nodeHasKeys && leaf === key) {
                nodeHasKeys = true
                yield []
            }
            else if (typeof tree[key] === 'object' && tree[key] !== null)
                for (const subpath of pathsToNodeWithKey(tree[key], leaf))
                    yield [key, ...subpath]
        }
    }
}

/**
 * Searches for nodes that have one or more search keys present and returns
 * paths to those nodes.
 * @param tree the tree to search for nodes with certain keys
 * @param leaves the keys to look for on each node
 */
export function* pathsToNodeWithKeys(
        tree: any,
        leaves: PropertyKey[]
    ): Generator<PropertyPath> {
    if (tree) {
        let nodeHasKeys = false
        for (const key of Reflect.ownKeys(tree)) {
            if (!nodeHasKeys && leaves.includes(key)) {
                yield []
                nodeHasKeys = true
            }
            else if (typeof tree[key] === 'object' && tree[key] !== null)
                for (const subpath of pathsToNodeWithKeys(tree[key], leaves))
                    yield [key, ...subpath]
        }
    }
}

export function* pathsToValue<
        Leaf = any,
        Tree extends TreeByValue<Leaf, Tree> = any
    >(
        tree: Tree,
        leaf: Leaf
    ): Generator<PropertyPath> {
    if (tree)
        for (const key of Reflect.ownKeys(tree))
            if (tree[key] === leaf)
                yield [key]
            else if (typeof tree[key] === 'object' && tree[key] !== null)
                for (const subpath of pathsToValue<any, any>(tree[key], leaf))
                    yield [key, ...subpath]
}

export function* pathsToValues<
        Leaf = any,
        Tree extends TreeByValue<Leaf, Tree> = any
    >(
        tree: Tree,
        leaves: Leaf[]
    ): Generator<PropertyPath> {
    if (tree)
        for (const key of Reflect.ownKeys(tree))
            if (leaves.includes(tree[key] as Leaf))
                yield [key]
            else if (typeof tree[key] === 'object' && tree[key] !== null)
                for (const subpath of pathsToValues<any, any>(tree[key], leaves))
                    yield [key, ...subpath]
}

export interface LeafInterface<T = any> {
    path: PropertyPath
    has: ReturnType<typeof makeHas>
    get: ReturnType<typeof makeExtractor<T>>
    set: ReturnType<typeof makeIntractor<T>>
    delete: ReturnType<typeof makeDeleter>
}

export const makeLeafInterface = <T = any>(path: PropertyPath): LeafInterface<T> => ({
    path,
    has: makeHas(path),
    get: makeExtractor(path),
    set: makeIntractor(path),
    delete: makeDeleter(path),
})

export function* leavesByValue<
        Leaf = any,
        Tree extends TreeByValue<Leaf, Tree> = any
    >(
        tree: Tree,
        leaf: Leaf
    ) {
    for (const path of pathsToValue<Leaf, Tree>(tree, leaf))
        yield makeLeafInterface(path)
}

export function* leavesByValues<
        Leaf = any,
        Tree extends TreeByValue<Leaf, Tree> = any
    >(
        tree: Tree,
        leaves: Leaf[]
    ) {
    for (const path of pathsToValues<Leaf, Tree>(tree, leaves))
        yield makeLeafInterface(path)
}

export function iterTreeByLeavesValue(
        values: any,
        template: any,
        leaf: any,
        action: (value: any, key: PropertyKey, fullpath: PropertyPath, leaf: any) => void
    ) {
    function traverse(
        values: any,
        template: any,
        path: PropertyPath = []
    ) {
        for (const key of Reflect.ownKeys(template)) {
            const nextPath = [...path, key]

            if (template[key] === leaf)
                action(values, key, nextPath, template[key])
            else {
                if (!(key in values))
                    values[key] = {}

                traverse(
                    values[key],
                    template[key],
                    nextPath
                )
            }
        }
    }

    traverse(values, template)
}

export function iterTreeByLeavesValues(
        values: any,
        template: any,
        leaves: any[],
        action: (value: any, key: PropertyKey, fullpath: PropertyPath, leaf: any) => void
    ) {
    function traverse(
        values: any,
        template: any,
        path: PropertyPath = []
    ) {
        for (const key of Reflect.ownKeys(template)) {
            const nextPath = [...path, key]

            if (leaves.includes(template[key]))
                action(values, key, nextPath, template[key])
            else {
                if (!(key in values))
                    values[key] = {}

                traverse(
                    values[key],
                    template[key],
                    nextPath
                )
            }
        }
    }

    traverse(values, template)
}