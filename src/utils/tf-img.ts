import * as tf from "@tensorflow/tfjs"
import * as fs from "fs"

let nextTensorIDs = new Map<string, number>()
function nextTensorID(prefix: string) {
  const id = nextTensorIDs.get(prefix)
  if (id === undefined) {
    nextTensorIDs.set(prefix, 1)
    return 0
  }
  
  nextTensorIDs.set(prefix, id + 1)
  return id
}

export function renderTensor(t: tf.Tensor2D, colors_scale?: number, filenamePrefix?: string, filename = `${filenamePrefix ? filenamePrefix : ""}${nextTensorID(filenamePrefix!)}`) {
    const cvs = document.createElement('canvas');
    [cvs.height, cvs.width] = t.shape
    const ctx = cvs.getContext('2d')!

    function pxChannel_random(x: number, y: number) {
      return Math.max(0, cyrb53(x.toString(), y)) & 0xFF
    }
  
    function pxChannel_scale(x: number, y: number) {
      return Math.max(0, Math.min(255, Math.floor(255 * x / colors_scale!)))
    }
  
    const pxChannel = colors_scale !== undefined ? pxChannel_scale : pxChannel_random

    const data = t.dataSync()
    for (let y = 0; y < t.shape[0]; y++) {
        for (let x = 0; x < t.shape[1]; x++) {
            const pixel = data[(y * t.shape[1]) + x]
            ctx.fillStyle = `rgb(${(pxChannel(pixel, 1))}, ${pxChannel(pixel, 2)}, ${pxChannel(pixel, 3)})`
            ctx.fillRect(x, y, 1, 1)
        }
    }
    
    fs.writeFileSync(`output-textures/${filename}.png`, (<any>cvs).toBuffer())
}

// https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js

/*
    cyrb53 (c) 2018 bryc (github.com/bryc)
    License: Public domain. Attribution appreciated.
    A fast and simple 53-bit string hash function with decent collision resistance.
    Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
*/
export const cyrb53 = function(str: string, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };
  
  /*
      cyrb53a (c) 2023 bryc (github.com/bryc)
      License: Public domain. Attribution appreciated.
      The original cyrb53 has a slight mixing bias in the low bits of h1.
      This shouldn't be a huge problem, but I want to try to improve it.
      This new version should have improved avalanche behavior, but
      it is not quite final, I may still find improvements.
      So don't expect it to always produce the same output.
  */
  const cyrb53a = function(str: string, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 0x85ebca77);
      h2 = Math.imul(h2 ^ ch, 0xc2b2ae3d);
    }
    h1 ^= Math.imul(h1 ^ (h2 >>> 15), 0x735a2d97);
    h2 ^= Math.imul(h2 ^ (h1 >>> 15), 0xcaf649a9);
    h1 ^= h2 >>> 16; h2 ^= h1 >>> 16;
      return 2097152 * (h2 >>> 0) + (h1 >>> 11);
  };