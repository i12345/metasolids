import { PropertyPath } from "./property-path.js"

export interface TreeByValue<
        Leaf,
        Tree extends TreeByValue<Leaf, Tree>
    > {
    [key: PropertyKey]:
        Tree |
        Leaf
}

export type TreeByKey<
        LeafKeysTemplate,
        LeafValue,
        Tree extends TreeByKey<LeafKeysTemplate, LeafValue, Tree>
    > =
    { [key: PropertyKey]: Tree } &
    { [K in keyof LeafKeysTemplate]: LeafValue }

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

export const extract = <
        T
    >(tree: any, path: PropertyPath) =>
        path.reduce((obj, key) => obj ? obj[key] : undefined, tree) as T

export const intract = <T>
    (tree: object, path: PropertyPath, value: T) => {
    for (let i = 0; i < path.length - 1; i++)
        tree = (tree[path[i]] ??= {})
    tree[path[path.length - 1]] = value
}

export const deletePath =
    (tree: object, path: PropertyPath) => {
    for (let i = 0; i < path.length - 1; i++)
        tree = (tree[path[i]] ??= {})
    delete tree[path[path.length - 1]]
}

export const makeExtractor =
    <TDefault = any>(path: PropertyPath) =>
    <T = TDefault>(tree: any, makeEmptyObjects = false) =>
        makeEmptyObjects ?
            path.reduce((obj, key) => obj ? (obj[key] ??= {}) : undefined, tree) as T :
            path.reduce((obj, key) => obj ? obj[key] : undefined, tree) as T

export const makeIntractor =
    (path: PropertyPath) =>
    <T>(tree: object, value: T) =>
        intract(tree, path, value)

export const makeDeleter =
    (path: PropertyPath) =>
    (tree: object) =>
        deletePath(tree, path)

export function* pathsToKey<
        LeafKeysTemplate,
        LeafValue,
        Tree extends TreeByKey<LeafKeysTemplate, LeafValue, Tree>
    >(
        tree: Tree,
        leafKeys: (keyof LeafKeysTemplate)[]
    ): Generator<PropertyPath> {
    for (const key of Reflect.ownKeys(tree))
        if (leafKeys.includes(key as keyof LeafKeysTemplate))
            yield [key]
        else for (const subpath of pathsToKey(tree[key], leafKeys))
            yield [key, ...subpath]
}

export function* pathsToValue<
        Leaf = any,
        Tree extends TreeByValue<Leaf, Tree> = any
    >(
        tree: Tree,
        leaf: Leaf
    ): Generator<PropertyPath> {
    for (const key of Reflect.ownKeys(tree))
        if (tree[key] === leaf)
            yield [key]
        else for (const subpath of pathsToValue<any, any>(tree[key], leaf))
            yield [key, ...subpath]
}

export function* pathsToValues<
        Leaf = any,
        Tree extends TreeByValue<Leaf, Tree> = any
    >(
        tree: Tree,
        leaves: Leaf[]
    ): Generator<PropertyPath> {
    for (const key of Reflect.ownKeys(tree))
        if (leaves.includes(tree[key] as Leaf))
            yield [key]
        else for (const subpath of pathsToValue<any, any>(tree[key], leaves))
            yield [key, ...subpath]
}

/**
 * Searches for subtrees that are related by a key in {@link leafKeys} and returns them
 * 
 * @deprecated use {@link leavesByValue} instead and apply its extractor to
 * the key-leaved trees.
 * @param tree the tree to search for leaves in
 * @param leafKeys the keys to consider to be leaves in the tree
 */
export function* leavesByKey<
        LeafKeysTemplate,
        LeafValue,
        Tree extends TreeByKey<LeafKeysTemplate, LeafValue, Tree>
    >(
        tree: Tree,
        leafKeys: (keyof LeafKeysTemplate)[]
    ) {
    for (const path of pathsToKey(tree, leafKeys)) {
        yield {
            path,
            get: makeExtractor(path),
            set: makeIntractor(path),
            delete: makeDeleter(path),
        }
    }
}

export function* leavesByValue<
        Leaf = any,
        Tree extends TreeByValue<Leaf, Tree> = any
    >(
        tree: Tree,
        leaf: Leaf
    ) {
    for (const path of pathsToValue<Leaf, Tree>(tree, leaf)) {
        yield {
            path,
            get: makeExtractor(path),
            set: makeIntractor(path),
            delete: makeDeleter(path),
        }
    }
}

export function* leavesByValues<
        Leaf = any,
        Tree extends TreeByValue<Leaf, Tree> = any
    >(
        tree: Tree,
        leaves: Leaf[]
    ) {
    for (const path of pathsToValues<Leaf, Tree>(tree, leaves)) {
        yield {
            path,
            get: makeExtractor(path),
            set: makeIntractor(path),
            delete: makeDeleter(path),
        }
    }
}

export function mapTreeByLeavesValue(
        values: object,
        template: object,
        leaf: any,
        action: (value: object, key: PropertyKey, fullpath: PropertyPath, leaf: any) => void
    ) {
    function traverse(
        values: object,
        template: object,
        path: PropertyPath = []
    ) {
        for (const key in Reflect.ownKeys(template)) {
            const nextPath = [...path, key]
            
            if (template[key] === leaf) {
                action(values, key, nextPath, template[key])
            } else traverse(
                values[key],
                template[key],
                nextPath
            )
        }
    }
    
    traverse(values, template)
}

export function mapTreeByLeavesValues(
        values: object,
        template: object,
        leaves: any[],
        action: (value: object, key: PropertyKey, fullpath: PropertyPath, leaf: any) => void
    ) {
    function traverse(
        values: object,
        template: object,
        path: PropertyPath = []
    ) {
        for (const key in Reflect.ownKeys(template)) {
            const nextPath = [...path, key]

            if (leaves.includes(template[key])) {
                action(values, key, nextPath, template[key])
            } else traverse(
                values[key],
                template[key],
                nextPath
            )
        }
    }

    traverse(values, template)
}