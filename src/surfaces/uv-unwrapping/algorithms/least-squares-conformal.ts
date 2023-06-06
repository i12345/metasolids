import { SurfaceUVUnwrappingAlgorithm } from "../algorithm.js"

export const leastSquaresConformal: SurfaceUVUnwrappingAlgorithm = {
    init() {
    },
    
    unwrap(mesh) {
        // https://members.loria.fr/Bruno.Levy/papers/LSCM_SIGGRAPH_2002.pdf
        // https://github.com/icemiliang/lscm

        /**
         * expand_feature_curve(halfedge start)
            vector<halfedge> detected_feature
            for halfedge h ∈ { start, opposite(start) }
                halfedge h′ ← h
                do
                    use depth-first search to find the string S of halfedges
                    starting with h′ and such that:
                    • two consecutive halfedges of S share a vertex
                    • the length of S is 6 than max_string_length
                    • sharpness(S) ← ∑_{e∈S} sharpness(e) is maximum
                    • no halfedge of S goes backward (relative to h′)
                    • no halfedge of S is tagged as a feature neighbor
                    h′ ← second item of S
                    append h′ to detected_feature
                while(sharpness(S) > max_string_length × τ )
            end // for
            if (length(detected_feature) > min_feature_length) then
            tag the elements of detected_feature as features
            tag the halfedges in the neighborhood of detected_feature
            as feature neighbors
            end // if
            end // expand_feature_curve
         */

        // type HalfEdge = []
        
        // const tau = NaN
        // const max_string_length = NaN

        // function expand_feature_curve(start: HalfEdge) {
        //     const detected_feature: HalfEdge[] = []
        //     for (const h of [start, opposite(start)]) {
        //         let h_prime = h
        //         let sharpness: number
        //         do {
        //             sharpness = NaN
        //         } while(sharpness > max_string_length * tau)
        //     }
        // }

        throw new Error('not implemented')
    }
}