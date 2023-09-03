import { BasicMaterial, StandardMaterial, math } from "playcanvas-extended"
import { ColorChannelIndex, ColorChannels } from "./color-channels.js"
import { IndicesArray } from "../../../utils/indices-array.js"

export interface RenderedBuffer {
    buffer: Float32Array | Uint8Array
    channels: number
}

export interface RenderedBufferForSemantic extends RenderedBuffer {
    /**
     * The key in {@link StandardMaterial} where this buffer should go
     *
     * For constants and textures, reference the corresponding constant or
     * texture `*Map` property.
     *
     * For vertex colors, reference the `*VertexColors` property and the
     * `*VertexColorChannels` will be automatically set.
     */
    semantic: keyof StandardMaterial | keyof BasicMaterial
}

export const CHANNELS_MAX = 4

export interface PackedRenderedBufferForSemantic
    <RenderedBufferT extends RenderedBufferForSemantic = RenderedBufferForSemantic> {
    channels: number
    sources: RenderedBufferT[]
    targets: {
        source: RenderedBufferT
        channels: ColorChannels
    }[]
}

export interface PackedRenderedBufferForSemanticWithRefCount
    <RenderedBufferT extends RenderedBufferForSemantic = RenderedBufferForSemantic>
    extends PackedRenderedBufferForSemantic<RenderedBufferT> {
    refCount: number
}

/**
 * Renders a pack of buffers into a single buffer, optionally remapping by
 * indices mapping.
 *
 * @param buffer the buffer to render these packed buffers into
 * @param pack the pack to render
 * @param indices_dst an index map of length len(buffer_dst) / pack.channels,
 * each element giving the corresponding element index in the source buffers
 * @returns the rendered buffer
 */
export function renderPack(
        buffer_dst: Float32Array | Uint8Array,
        pack: PackedRenderedBufferForSemantic,
        indices_dst?: IndicesArray
    ) {
    // if (pack.sources.length === 1 && pack.sources[0].buffer.length === buffer_dst.length) {
    //     const buffer_src = pack.sources[0].buffer
    //     if (buffer_dst.length !== buffer_src.length)
    //         throw new Error()

    //     if ((buffer_dst instanceof Float32Array && buffer_src instanceof Float32Array) ||
    //         (buffer_dst instanceof Uint8Array && buffer_src instanceof Uint8Array))
    //         buffer_dst.set(buffer_src)
    //     else if (buffer_dst instanceof Float32Array && buffer_src instanceof Uint8Array)
    //         for (let i = 0; i < buffer_dst.length; i++)
    //             buffer_dst[i] = buffer_src[i] / 255.0
    //     else if (buffer_dst instanceof Uint8Array && buffer_src instanceof Float32Array)
    //         for (let i = 0; i < buffer_dst.length; i++)
    //             buffer_dst[i] = math.clamp(Math.floor(buffer_src[i] * 255), 0, 255)
    // }
    // else {
        const size_dst = indices_dst?.length ?? (pack.sources[0].buffer.length / pack.sources[0].channels)
        if (buffer_dst.length !== size_dst * pack.channels)
            throw new Error()

        for (const source of pack.sources) {
            const target = pack.targets.find(target => target.source.semantic === source.semantic)!
            for (const [source_channel_index, pack_channel] of target.channels.entries()) {
                if (buffer_dst instanceof Float32Array) {
                    for (let i = 0; i < size_dst; i++) {
                        const src_i = indices_dst ? indices_dst[i] : i
                        const value = source.buffer[(src_i * source.channels) + source_channel_index]
                        buffer_dst[(i * pack.channels) + pack_channel] = value
                    }
                }
                else if (buffer_dst instanceof Uint8Array) {
                    for (let i = 0; i < size_dst; i++) {
                        //TODO: after debugging this code, make separate versions for with and without indices mappings
                        const src_i = indices_dst ? indices_dst[i] : i
                        let value = Math.floor(255 * source.buffer[(src_i * source.channels) + source_channel_index])
                        if (value < 0) value = 0
                        else if (value > 255) value = 255

                        buffer_dst[(i * pack.channels) + pack_channel] = value
                    }
                }
            }
        }
    // }

    return buffer_dst
}

export function* pack
    <RenderedBufferT extends RenderedBufferForSemantic = RenderedBufferForSemantic>(
        textures: RenderedBufferT[],
        finalBufferChannels?: number[]
    ):
    Generator<PackedRenderedBufferForSemantic<RenderedBufferT>> {
    const sizeGroups: { [size: number]: RenderedBufferT[] } = {}

    for (const texture of textures)
        (sizeGroups[texture.buffer.length / texture.channels] ??= []).push(texture)

    for (const group of Object.values(sizeGroups)) {
        const blocks: {
            sources: RenderedBufferT[]
            channelsInUse: number
        }[] = []

        for (const renderedBuffer of group) {
            let foundBlock = false

            for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].channelsInUse + renderedBuffer.channels <= CHANNELS_MAX) {
                    blocks[i].sources.push(renderedBuffer)
                    blocks[i].channelsInUse += renderedBuffer.channels
                    foundBlock = true
                    break
                }
            }

            if (!foundBlock) {
                blocks.push({
                    sources: [renderedBuffer],
                    channelsInUse: renderedBuffer.channels
                })
            }
        }

        for (const block of blocks) {
            const targets: PackedRenderedBufferForSemantic<RenderedBufferT>["targets"] = []

            const bufferChannels =
                finalBufferChannels ?
                    finalBufferChannels
                        .filter(channels => channels >= block.channelsInUse)
                        .sort((a, b) => a - b)[0] :
                    block.channelsInUse

            let channelNext = ColorChannelIndex.r

            for (const source of block.sources) {
                if (channelNext >= CHANNELS_MAX)
                    throw new Error()

                const channels: number[] = []
                for (let i = 0; i < source.channels; i++)
                    channels.push(channelNext++)

                targets.push({
                    source,
                    channels
                })
            }

            yield {
                channels: bufferChannels,
                sources: block.sources,
                targets
            }
        }
    }
}