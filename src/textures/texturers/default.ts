import { Color } from "playcanvas-extended";
import { Texturer } from "../texturer.js";
import { ConstantTexturer } from "./constant.js";

export const defaultDiffuseTexturer: Texturer = new ConstantTexturer(
    Color.GRAY,
    {
        inputs: {},
        outputs: {
            value: ['material', 'textures', 'diffuse']
        }
    }
)