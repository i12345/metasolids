// import savePixels from 'save-pixels'
// import ndarray from "ndarray";
// import fs from 'fs'
// import path from 'path'
// import { PropertyPath, extract } from '../paradigm/trees/index.js';
// import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from './texture.js';
// import { FieldPoint, FieldPointType, field_point_type_size } from '../fields/index.js';
// import { FieldPointVectorContainerStatic, field_point_vectorized_new } from '../fields/vectorized/index.js';
// import { vectorIterator } from '../fields/vectorized/iterators/factory.js';
// import { Vec2 } from 'playcanvas-extended';
// import { NumberTypedArray } from '../utils/typed-array.js';

// export function renderTexture<
//         TextureSampleT extends TextureSample = TextureSample,
//         TextureSampleElementType extends TextureSample = TextureSampleT,
//         TextureSampleFuseMode extends TextureSample = TextureSampleT,
//         TextureSamplingContextT extends TextureSamplingContext = TextureSamplingContext,
//     >(
//         output = "img.png",
//         texture: Texture<
//                 TextureLocation,
//                 TextureLocation,
//                 TextureLocation,
//                 FieldPointVectorContainerStatic<NumberTypedArray>,
//                 TextureSampleT,
//                 TextureSampleElementType,
//                 TextureSampleFuseMode,
//                 FieldPointVectorContainerStatic<NumberTypedArray>,
//                 TextureSamplingContextT
//             >,
//         context: TextureSamplingContextT,
//         render_path: PropertyPath = [],
//         min_x = 0, min_y = 0, max_x = 1, max_y = 1, resolution = 1024
//     ) {
//     min_x *= resolution
//     min_y *= resolution
//     max_x *= resolution
//     max_y *= resolution

//     min_x = Math.floor(min_x)
//     min_y = Math.floor(min_y)
//     max_x = Math.floor(max_x)
//     max_y = Math.floor(max_y)

//     const area = (max_x - min_x) * (max_y - min_y)

//     const result_elementType = extract<FieldPointType>(texture.field.elementType, render_path)
//     const result = field_point_vectorized_new(result_elementType, area, false)
//     const iterator = vectorIterator(result_elementType, false)

//     let result_i = 0
//     let sample: FieldPoint
//     const uv = new Vec2()
//     for (let x = min_x; x < max_x; x++) {
//         for (let y = min_y; y < max_y; y++) {
//             uv.x = x / resolution
//             uv.y = y / resolution
//             sample = texture.sample({ uv }, context)
//             iterator.set(result, result, extract(sample, render_path), result_i++)
//         }
//     }
    
//     function renderImg(data: Float64Array, data_channels_render: number, data_channels_render_offset = 0, data_channels = data_channels_render) {
//         const items = data.length / data_channels
//         const buffer_channels = 1
//         const buffer_data = new Uint8ClampedArray(items * buffer_channels)
//         const array = ndarray(buffer_data, [max_y - min_y, max_x - min_x])
        
//         console.assert(data_channels_render === 1)

//         for (let i = 0; i < items; i++)
//             for (let channel = 0; channel < data_channels_render; channel++)
//                 buffer_data[(i * buffer_channels) + channel] = 256 * data[(i * data_channels) + data_channels_render_offset]

//         let render_output = `${path.dirname(output)}/${path.parse(output).name}_${data_channels_render_offset}${path.extname(output)}`
//         while (fs.existsSync(render_output))
//             render_output = `${path.dirname(render_output)}/${path.parse(render_output).name}-1${path.extname(render_output)}`

//         const stream = fs.createWriteStream(render_output)
//         savePixels(array, <"png" | "gif">path.extname(render_output)).pipe(stream)
//     }

//     const result_container = <Float64Array>result
//     const result_channels = field_point_type_size(result_elementType)
//     for (let result_channel = 0; result_channel < result_channels; result_channel++)
//         renderImg(result_container, 1, result_channel, result_channels)
// }

export const renderTexture = undefined