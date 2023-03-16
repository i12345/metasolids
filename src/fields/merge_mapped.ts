import { extract, intract } from "../utils/tree.js";
import { FieldPoint } from "./point.js";

export interface FieldPointMapping {
    from: PropertyKey[]
    to: PropertyKey[]
}

/**
 * Merges the value(s) of a source field point onto a destination field point,
 * copying references where possible.
 *
 * @param dst the destination field point (values are written by reference
 * where possible)
 * @param src the source field point
 * @param mappings mappings for where value should be merged from and to
 * @returns the destination field point with values from the source mapped into
 * it, by reference where possible. If the destination was originally a number,
 * the return value will be by reference.
 */
export function field_point_merge_mapped<
        Dst extends FieldPoint,
        Src extends FieldPoint
    >(
        dst: Dst,
        src: Src,
        mappings: FieldPointMapping[]
    ): Dst {
    const dstObj = { dst }

    for (const mapping of mappings) {
        const value = extract(src, mapping.from)
        intract(dstObj, ['dst', ...mapping.to], value)
    }

    return dstObj.dst
}

export function field_point_mapped<
        Dst extends FieldPoint,
        Src extends FieldPoint
    >(
        src: Src,
        mappings: FieldPointMapping[]
    ): Dst {
    return field_point_merge_mapped<Dst, Src>(undefined as Dst, src, mappings)
}

export function mapping_inverse(mapping: FieldPointMapping): FieldPointMapping {
    return {
        from: mapping.to,
        to: mapping.from
    }
}

export function map_path(
        mappings: FieldPointMapping[],
        path: PropertyKey[]
    ): PropertyKey[][] {
    const results: PropertyKey[][] = []

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
        mappings: FieldPointMapping[],
        path: PropertyKey[]
    ): PropertyKey[] {
    return common_start_path(map_path(mappings, path))
}

export function common_start_path(paths: PropertyKey[][]): PropertyKey[] {
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