import { PropertyPath } from "./path.js";
import { deletePath, extract, hasPath, intract } from "./tree.js";

export interface PropertyMapping {
    from: PropertyPath
    to: PropertyPath
}

/**
 * Merges the value(s) of a source object onto a destination object,
 * copying references where possible.
 *
 * @param dst the destination object (values are written by reference
 * where possible)
 * @param src the source object
 * @param mappings mappings for where value should be merged from and to
 * @returns the destination object with values from the source mapped into
 * it, by reference where possible. If the destination was originally not by
 * reference, then the return value will be different than the dst given.
 */
export function object_merge_mapped<Dst, Src>(
        dst: Dst | undefined,
        src: Src | undefined,
        mappings: PropertyMapping[]
    ): Dst {
    const dstObj = { dst }

    for (const mapping of mappings) {
        const dstPath = ['dst', ...mapping.to]
        if (hasPath(src, mapping.from)) {
            const value = extract(src, mapping.from)
            intract(dstObj, dstPath, value)
        }
        else deletePath(dstObj, dstPath)
    }

    return dstObj.dst!
}

export function object_mapped<Dst, Src>(
        src: Src,
        mappings: PropertyMapping[]
    ): Dst {
    return object_merge_mapped<Dst, Src>(undefined, src, mappings)
}

export function mapping_inverse(mapping: PropertyMapping): PropertyMapping {
    return {
        from: mapping.to,
        to: mapping.from
    }
}

export function map_path(
        mappings: PropertyMapping[],
        path: PropertyPath
    ): PropertyPath[] {
    const results: PropertyPath[] = []

    for (const mapping of mappings) {
        const commonPathLength = Math.min(mapping.from.length, path.length)
        let isCommonPath = true
        for (let i = 0; i < commonPathLength; i++) {
            if (mapping.from[i] !== path[i]) {
                isCommonPath = false
                break
            }
        }

        if (isCommonPath)
            results.push(mapping.to)
    }

    return results
}

export function map_path_common(
        mappings: PropertyMapping[],
        path: PropertyPath
    ): PropertyPath {
    return common_start_path(map_path(mappings, path))
}

export function common_start_path(paths: PropertyPath[]): PropertyPath {
    if(paths.length === 0) return []
    if(paths.length === 1) return paths[0]

    let commonLength = 0
    const commonLength_max = Math.max(...paths.map(path => path.length))
    while (commonLength < commonLength_max) {
        const commonItem = paths[0][commonLength]
        let isItemCommon = true
        for (let i = 1; i < paths.length; i++) {
            if (paths[i][commonLength] !== commonItem) {
                isItemCommon = false
                break
            }
        }
        
        if (!isItemCommon)
            break

        commonLength++
    }

    return paths[0].slice(0, commonLength)
}