export enum ColorChannelIndex {
    r = 0,
    g = 1,
    b = 2,
    a = 3
}

export enum ColorChannelsMask {
    none = 0x0,
    r = 0x1,
    g = 0x2,
    b = 0x4,
    a = 0x8,
    valid = 0xF,
}

export type ColorChannels = ColorChannelIndex[]
export type ColorChannelString = 'r' | 'g' | 'b' | 'a'
export type ColorChannelsString =
    `${ColorChannelString}${ColorChannelString}${ColorChannelString}${ColorChannelString}` |
    `${ColorChannelString}${ColorChannelString}${ColorChannelString}` |
    `${ColorChannelString}${ColorChannelString}` |
    `${ColorChannelString}` |
    ""

const channelsAlphabet: ColorChannelsString = "rgba"

export function colorChannelsString(channels: ColorChannels): ColorChannelsString {
    let retval: ColorChannelsString = ""
    for (const channel of channels)
        retval += channelsAlphabet[channel]
    return retval as ColorChannelsString
}