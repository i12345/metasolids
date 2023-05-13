import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";

export class CachedTexture<
        Location extends TextureLocation = TextureLocation,
        Sample extends TextureSample = TextureSample,
        Context extends
            TextureSamplingContext<Location> =
            TextureSamplingContext<Location>
    > implements
    Texture<Location, Sample, Context> {
    private cache: Sample[] = new Array(0)
    
    get field() {
        return this.inner.field
    }

    constructor(
        public readonly inner: Texture<Location, Sample, Context>,
        public readonly resolution: number
    ) { }

    init(context: Context): void {
        this.inner.init(context)

        this.cache = new Array(this.resolution ** 2)
    }

    sample(location: Location, context: Context): Sample {
        const coords = [
            Math.min(this.resolution - 1, Math.floor(location.uv.x * this.resolution)),
            Math.min(this.resolution - 1, Math.floor(location.uv.y * this.resolution))
        ]
        const cache_index = coords[0] + (coords[1] * this.resolution)
        const cached = this.cache[cache_index]
        
        if (cached) return cached
        else return this.cache[cache_index] = this.inner.sample(location, context)
    }
}