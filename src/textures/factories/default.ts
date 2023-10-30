import { Color } from "playcanvas-extended";
import { FactoryProcessor } from "../../paradigm/processing/processors/factory.js";
import { ConstantTextureFactory } from "./constant.js";

export const defaultMaterialFactories: FactoryProcessor = new ConstantTextureFactory(
    Color.GRAY,
    {
        inputs: {},
        outputs: ['material', 'textures', 'diffuse']
    }
)