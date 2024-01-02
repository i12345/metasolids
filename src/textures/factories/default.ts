import { Color } from "playcanvas-physics-advanced";
import { FactoryProcessor } from "../../paradigm/processing/processors/factory.js";
import { ConstantTextureFactory } from "./constant.js";

export const defaultMaterialFactories: FactoryProcessor = new ConstantTextureFactory(
    Color.GRAY,
    {
        inputs: {},
        outputs: ['material', 'textures', 'diffuse']
    }
)