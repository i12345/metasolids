import {
    PIXELFORMAT_111110F,
    PIXELFORMAT_L8, PIXELFORMAT_A8, PIXELFORMAT_LA8, PIXELFORMAT_L8_A8,
    PIXELFORMAT_R4_G4_B4_A4, PIXELFORMAT_RGBA4,
    PIXELFORMAT_R5_G6_B5, PIXELFORMAT_RGB565,
    PIXELFORMAT_R5_G5_B5_A1, PIXELFORMAT_RGBA5551,
    PIXELFORMAT_R8_G8_B8, PIXELFORMAT_RGB8, PIXELFORMAT_R8_G8_B8_A8, PIXELFORMAT_RGBA8,
    PIXELFORMAT_BGRA8,
    PIXELFORMAT_R32F, PIXELFORMAT_RGB16F, PIXELFORMAT_RGBA16F, PIXELFORMAT_RGB32F, PIXELFORMAT_RGBA32F,
    PIXELFORMAT_DXT1, PIXELFORMAT_DXT3, PIXELFORMAT_DXT5, PIXELFORMAT_DEPTH
} from "playcanvas-extended";
import { ColorChannels } from "./color-channels.js";

export enum FormatChannelQuality {
    uint4,
    uint5,
    uint8,
    float16
}

const format_channel_bits: { [format: number]: [number, number, number, number] } = {
    [PIXELFORMAT_111110F]: [11, 11, 10, 0],
    [PIXELFORMAT_A8]: [0, 0, 0, 8],
    [PIXELFORMAT_L8]: [8, 8, 8, 0],
    [PIXELFORMAT_L8_A8]: [8, 8, 8, 8],
    [PIXELFORMAT_LA8]: [8, 8, 8, 8],
    [PIXELFORMAT_R4_G4_B4_A4]: [4, 4, 4, 4],
    [PIXELFORMAT_RGBA4]: [4, 4, 4, 4],
    [PIXELFORMAT_R5_G5_B5_A1]: [5, 5, 5, 1],
    [PIXELFORMAT_RGBA5551]: [5, 5, 5, 1],
    [PIXELFORMAT_R5_G6_B5]: [5, 6, 5, 0],
    [PIXELFORMAT_RGB565]: [5, 6, 5, 0],
    [PIXELFORMAT_R8_G8_B8]: [8, 8, 8, 0],
    [PIXELFORMAT_RGB8]: [8, 8, 8, 0],
    [PIXELFORMAT_R8_G8_B8_A8]: [8, 8, 8, 8],
    [PIXELFORMAT_RGBA8]: [8, 8, 8, 8],
    [PIXELFORMAT_BGRA8]: [8, 8, 8, 8],

    [PIXELFORMAT_R32F]: [32, 0, 0, 0],
    [PIXELFORMAT_RGB16F]: [16, 16, 16, 0],
    [PIXELFORMAT_RGBA16F]: [16, 16, 16, 16],
    [PIXELFORMAT_RGB32F]: [32, 32, 32, 0],
    [PIXELFORMAT_RGBA32F]: [32, 32, 32, 32],

    [PIXELFORMAT_DXT1]: [64 * 5 / 16, 64 * 6 / 16, 64 * 5 / 16, 0],
    [PIXELFORMAT_DXT3]: [64 * 5 / 16, 64 * 6 / 16, 64 * 5 / 16, 4],
    [PIXELFORMAT_DXT5]: [64 * 5 / 16, 64 * 6 / 16, 64 * 5 / 16, 64 / 16],
}

export function formatChannelBits(format: number, channels: ColorChannels): number {
    const channel_bits = format_channel_bits[format]
    
    let sum = 0
    for (const channel of channels)
        sum += channel_bits[channel]
    
    return sum
}

export function format_selector(channels: number, hdr: boolean) {
    const VALUE_RESOLUTION_LDR = Symbol("value-resolution:ldr")
    const VALUE_RESOLUTION_HDR = Symbol("value-resolution:hdr")

    const map: { [channels: number]: { [highRes: symbol]: number } } = {
        [1]: {
            [VALUE_RESOLUTION_LDR]: PIXELFORMAT_L8,
            // ?? [VALUE_RESOLUTION_HDR]: PIXELFORMAT_DEPTH
        },
        [2]: {
            [VALUE_RESOLUTION_LDR]: PIXELFORMAT_LA8,
        },
        [3]: {
            [VALUE_RESOLUTION_LDR]: PIXELFORMAT_RGB8,
            [VALUE_RESOLUTION_HDR]: PIXELFORMAT_RGB16F,
        },
        [4]: {
            [VALUE_RESOLUTION_LDR]: PIXELFORMAT_RGBA8,
            [VALUE_RESOLUTION_HDR]: PIXELFORMAT_RGBA16F,
        }
    }

    const channels_map = map[channels]
    if (hdr)
        return channels_map[VALUE_RESOLUTION_HDR] ?? channels_map[VALUE_RESOLUTION_LDR]
    else
        return channels_map[VALUE_RESOLUTION_LDR]
}
