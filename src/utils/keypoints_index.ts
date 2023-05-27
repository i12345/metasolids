//TODO: test this search method

import { InterpolationKeypoint } from "../fields/interpolation.js";

/**
 * Finds the index of the keypoint at or immediately before the search time
 * @param t the time to search for a keypoint less than or equal to
 * @returns the index of a keypoint that is at or immediately before the search time
 */
export function keypoint_index<T = any>(t: number, keypoints: InterpolationKeypoint<number, T>[]): number {
    let low = 0,
        high = keypoints.length - 1
    
    while (low !== high) {
        const mid = Math.floor((low + high) / 2)
        
        // Too high
        if (keypoints[mid].location > t)
            high = mid - 1;
        // Too low.
        else if (keypoints[mid].location < t)
            low = mid + 1;
        // Key found.
        else
            return mid
    }

    if (keypoints[low].location <= t)
        return low
    return low - 1
}