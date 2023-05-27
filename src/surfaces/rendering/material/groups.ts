import { Color, StandardMaterial, BasicMaterial, BLEND_NORMAL } from "playcanvas-extended"
import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../../fields/multi-objects-fields-point.js"

export type Material_Groups = {
    /**
     * The color for a {@link BasicMaterial}.
     * 
     * If this field is set, then all other fields will be ignored, and a
     * {@link BasicMaterial} implementation will be used instead of
     * {@link StandardMaterial}.
     * 
     * If this field is set, then the {@link BasicMaterial} will have
     * {@link BasicMaterial.blendType} = {@link BLEND_NORMAL}.
     */
    color: MultiObjectsGroupsTemplateLeaf

    /**
     * "The diffuse color of the material. This color value is 3-component
     * (RGB), where each component is between 0 and 1. Defines basic surface
     * color (aka albedo)."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuse))
     * 
     * Renders into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuse)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseVertexColor)
     * - [addition or multiplication](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseDetailMode)
     * of [two textures](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseDetailMap)
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuse)
     * [multiplied by](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseTint)
     * ([texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseMap),
     * [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseVertexColor),
     * or [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseVertexColor))
     */
    diffuse: MultiObjectsGroupsTemplateLeaf

    /**
     * "The specular color of the material. This color value is 3-component
     * (RGB), where each component is between 0 and 1. Defines surface
     * reflection/specular color. Affects specular intensity and tint."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specular))
     * 
     * "The factor of specular intensity, used to weight the fresnel and
     * specularity. Default is 1.0."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactor))
     * 
     * If {@link metalness} is set while this field is set, then
     * {@link StandardMaterial.useMetalnessSpecularColor} will be set to `true`
     * "to apply color tint to specular reflections. at direct angles."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#useMetalnessSpecularColor))
     * 
     * RGB values control {@link StandardMaterial.specular} and render into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specular)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularVertexColor)
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specular)
     * [multiplied by](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularTint)
     * ([texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularMap),
     * [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularVertexColor), or
     * [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularVertexColor))
     * 
     * TODO: implement specularityFactor differently
     * Alpha values control {@link StandardMaterial.specularityFactor} and render into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorVertexColor)
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactor)
     * [multiplied by](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorTint)
     * ([texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorMap),
     * [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorVertexColor), or
     * [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorVertexColor))
     * 
     * If only a scalar texture is given, then it controls (specularity factor?)
     */
    specular: MultiObjectsGroupsTemplateLeaf

    /**
     * "The emissive color of the material."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissive))
     * 
     * Renders into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissive)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveVertexColor)
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissive)
     * [multiplied by](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveTint)
     * ([texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveMap),
     * [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveVertexColor), or
     * [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveVertexColor))
     */
    emissive: MultiObjectsGroupsTemplateLeaf

    /**
     * "Defines how much the surface is metallic. From 0 (dielectric) to 1 (metal)."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#metalness))
     * 
     * "With metalness == 0, the pixel is assumed to be dielectric, and diffuse
     * color is used as normal. With metalness == 1, the pixel is fully
     * metallic, and diffuse color is used as specular color instead."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#useMetalness))
     * 
     * If this field is set, then the {@link StandardMaterial.useMetalness} will be set to `true`.
     * 
     * If {@link specular.color} is set while this field is set, then
     * {@link StandardMaterial.useMetalnessSpecularColor} will be set to `true`
     * "to apply color tint to specular reflections. at direct angles."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#useMetalnessSpecularColor))
     * 
     * Renders into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#metalness)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#metalnessMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#metalnessVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#metalnessMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#metalnessVertexColor)
     */
    metalness: MultiObjectsGroupsTemplateLeaf

    /**
     * "Defines the glossiness of the material from 0 (rough) to 1 (shiny)."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#gloss))
     * 
     * Renders into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#gloss)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#glossMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#glossVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#glossMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#glossVertexColor)
     */
    glossiness: MultiObjectsGroupsTemplateLeaf

    /**
     * "The height map of the material (default is null). Used for a
     * view-dependent parallax effect. The texture must represent the height
     * of the surface where darker pixels are lower and lighter pixels are
     * higher. It is recommended to use it together with a normal map."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#gloss))
     * 
     * NOTE: this field is not set by the user; it is constructed using
     * interpolated surface normals (from {@link VolumeSample.gradient}) and
     * surface distance textures calculated from the metasphapes' textures for
     * metashape parameters (unit.height, unit.length, falloff.bias,
     * falloff.rate), merged with corresponding weights:
     * 
     * ```text
     * combine(
     *   value: mul<per object>(
     *     vertex-interpolation(
     *       value: <per object> samples[].gradient,
     *       locations: <per object> samples[].uv
     *     ),
     *     surfaceDistance(<per object> shape.texture)
     *   )
     *   weight: influences.presence<per object>
     * )
     * ```
     * 
     * The normal map will be generated from the height map and sample
     * gradients. If {@link StandardMaterial.useHeightMaps} is disabled
     * then only the normal map is made/updated.
     * 
     * Renders into [texture for height](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#heightMap)
     * (scaled by a [constant factor](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#heightMapFactor)),
     * along with:
     * 
     * - [primary normal map texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#normalMap)
     * scaled by [bumpiness factor](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#bumpiness)
     * - [primary normal map texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#normalMap)
     * scaled by [bumpiness factor](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#bumpiness)
     * added to [secondary normal map texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#normalDetailMap)
     * scaled by [bumpiness factor](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#normalDetailMapBumpiness)
     */
    height: MultiObjectsGroupsTemplateLeaf

    /**
     * "The opacity of the material. This value can be between 0 and 1, where 0
     * is fully transparent and 1 is fully opaque."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#opacity))
     * 
     * If this field is set, then {@link StandardMaterial.twoSidedLighting}
     * is set to `true` so the back sides of objects can be rendered.
     * 
     * **Note:** `opacityFadesSpecular` is set to `false` so that reflections
     * can be vivid even when the surface is mostly transparent (like water).
     * 
     * Renders into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#opacity)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#opacityMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#opacityVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#opacityMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#opacityVertexColor)
     */
    opacity: MultiObjectsGroupsTemplateLeaf

    /**
     * Iridescence
     * 
     * If this field is set, then {@link StandardMaterial.useIridescence} is set to `true`.
     */
    iridescence: {
        /**
         * Iridescence intensity
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceMap))
         * 
         * Renders into:
         * 
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceMap)
         */
        intensity: MultiObjectsGroupsTemplateLeaf

        /**
         * "The index of refraction of the iridescent thin-film.
         * Affects the color phase shift as described here:
         * https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_iridescence"
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceRefractionIndex))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceRefractionIndex)
         */
        indexOfRefraction: MultiObjectsGroupsTemplateLeaf

        /**
         * Iridescence thickness (in nm)
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceThicknessMap))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceThicknessMax)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceThicknessMap)
         */
        thickness: MultiObjectsGroupsTemplateLeaf
    }

    /**
     * Refraction
     * 
     * If this field is set, then {@link StandardMaterial.useRefraction} will
     * be set to `true`.
     * 
     * If {@link attenuation} is set, then
     * {@link StandardMaterial.useDynamicRefraction} will be set to `true`.
     */
    refraction: {
        /**
         * TODO: what does this mean?
         * 
         * "Defines the visibility of refraction."
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refraction))
         * 
         * If this field is set, then {@link StandardMaterial.useRefraction} will be set to `true`.
         * 
         * To enable higher quality refractions, set the {@link attenuation} field.
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#useDynamicRefraction))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refraction)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refractionMap)
         * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refractionVertexColor)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refractionMap)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refractionVertexColor)
         * 
         * @default 0
         */
        visibility: MultiObjectsGroupsTemplateLeaf

        /**
         * "Defines the index of refraction, i.e. The amount of distortion.
         * The value is calculated as (outerIor / surfaceIor), where inputs are
         * measured indices of refraction, the one around the object and the
         * one of its own surface. In most situations outer medium is air, so
         * outerIor will be approximately 1. Then you only need to do
         * (1.0 / surfaceIor)."
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refractionIndex))
         * 
         * If this field is set, then {@link StandardMaterial.useRefraction} will be set to `true`.
         * 
         * To enable higher quality refractions, set the {@link attenuation} field.
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#useDynamicRefraction))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refractionIndex)
         * 
         * @default 1
         */
        indexOfRefraction: MultiObjectsGroupsTemplateLeaf

        /**
         * TODO: should this be moved to the top level?
         * 
         * Attenuation
         * 
         * If this field is set, then {@link StandardMaterial.useRefraction} and
         * {@link StandardMaterial.useDynamicRefraction} will be set to `true`,
         * and the [thickness map](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#thicknessMap)
         * will be computed.
         * 
         * This will enable higher quality refractions.
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#useDynamicRefraction))
         */
        attenuation: {
            /**
             * "The attenuation color for refractive materials"
             * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#attenuation))
             * 
             * If this field is set, then {@link StandardMaterial.useRefraction} and
             * {@link StandardMaterial.useDynamicRefraction} will be set to `true`.
             * 
             * Renders into:
             * 
             * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#attenuation)
             * 
             * @default Color.BLACK
             */
            color: MultiObjectsGroupsTemplateLeaf

            /**
             * "The distance defining the absorption rate of light within the medium"
             * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#attenuationDistance))
             * 
             * If this field is set, then {@link StandardMaterial.useRefraction} and
             * {@link StandardMaterial.useDynamicRefraction} will be set to `true`.
             * 
             * Renders into:
             * 
             * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#attenuationDistance)
             * 
             * @default 1
             */
            distance: MultiObjectsGroupsTemplateLeaf
        }
    }

    /**
     * "The sheen (fabric) microfiber structure"
     * 
     * If this field is set, then {@link StandardMaterial.useSheen} will be set to `true`.
     */
    sheen: {
        /**
         * "The specular color of the sheen (fabric) microfiber structure.
         * This color value is 3-component (RGB), where each component is between
         * 0 and 1."
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheen))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheen)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenMap)
         * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenVertexColor)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenMap)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenVertexColor)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheen)
         * [multiplied by](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenTint)
         * ([texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenMap),
         * [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenVertexColor), or
         * [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenMap)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenVertexColor))
         */
        color: MultiObjectsGroupsTemplateLeaf

        /**
         * "The glossiness of the sheen (fabric) microfiber structure.
         * This color value is a single value between 0 and 1."
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGloss))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGloss)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossMap)
         * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossVertexColor)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossMap)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossVertexColor)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGloss)
         * [multiplied by](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossTint)
         * ([texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossMap),
         * [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossVertexColor), or
         * [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossMap)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossVertexColor))
         * 
         */
        glossiness: MultiObjectsGroupsTemplateLeaf
    }

    clearCoat: {
        /**
         * "Defines intensity of clearcoat layer from 0 to 1. Clearcoat layer
         * is disabled when clearCoat == 0. Default value is 0 (disabled)."
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoat))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoat)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoat)
         * multiplied by [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatMap)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoat)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatVertexColor)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoat)
         * multiplied by [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatMap)
         * and [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatVertexColor)
         */
        intensity: MultiObjectsGroupsTemplateLeaf

        /**
         * "Defines the clearcoat glossiness of the clearcoat layer from 0 (rough) to 1 (mirror)."
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGloss))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGloss)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGloss)
         * multiplied by [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGlossMap)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGloss)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGlossVertexColor)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGloss)
         * multiplied by [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGlossMap)
         * and [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGlossVertexColor)
         */
        glossiness: MultiObjectsGroupsTemplateLeaf

        /**
         * The height map for the clearcoat layer.
         * 
         * It will be used to generate a normal map.
         * 
         * Renders into:
         * 
         * - normal map [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatNormalMap)
         * scaled by [bumpiness factor](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatBumpiness)
         */
        height: MultiObjectsGroupsTemplateLeaf
    }
}

export const Material_Groups_Template: Material_Groups = {
    color: MultiObjectsGroupsTemplate_Leaf,  

    diffuse: MultiObjectsGroupsTemplate_Leaf,

    specular: MultiObjectsGroupsTemplate_Leaf,

    emissive: MultiObjectsGroupsTemplate_Leaf,

    metalness: MultiObjectsGroupsTemplate_Leaf,

    glossiness: MultiObjectsGroupsTemplate_Leaf,

    height: MultiObjectsGroupsTemplate_Leaf,

    opacity: MultiObjectsGroupsTemplate_Leaf,

    iridescence: {
        intensity: MultiObjectsGroupsTemplate_Leaf,
        indexOfRefraction: MultiObjectsGroupsTemplate_Leaf,
        thickness: MultiObjectsGroupsTemplate_Leaf
    },

    refraction: {
        visibility: MultiObjectsGroupsTemplate_Leaf,
        indexOfRefraction: MultiObjectsGroupsTemplate_Leaf,
        attenuation: {
            color: MultiObjectsGroupsTemplate_Leaf,
            distance: MultiObjectsGroupsTemplate_Leaf
        }
    },

    sheen: {
        color: MultiObjectsGroupsTemplate_Leaf,
        glossiness: MultiObjectsGroupsTemplate_Leaf
    },

    clearCoat: {
        intensity: MultiObjectsGroupsTemplate_Leaf,
        glossiness: MultiObjectsGroupsTemplate_Leaf,
        height: MultiObjectsGroupsTemplate_Leaf
    }
}

export type Material_Groups_Textures_TexelTypes = {
    color: Color

    /**
     * "The diffuse color of the material. This color value is 3-component
     * (RGB), where each component is between 0 and 1. Defines basic surface
     * color (aka albedo)."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuse))
     * 
     * Renders into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuse)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseVertexColor)
     * - [addition or multiplication](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseDetailMode)
     * of [two textures](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseDetailMap)
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuse)
     * [multiplied by](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseTint)
     * ([texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseMap),
     * [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseVertexColor),
     * or [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#diffuseVertexColor))
     */
    diffuse: Color
    
    /**
     * "The specular color of the material. This color value is 3-component
     * (RGB), where each component is between 0 and 1. Defines surface
     * reflection/specular color. Affects specular intensity and tint."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specular))
     * 
     * "The factor of specular intensity, used to weight the fresnel and
     * specularity. Default is 1.0."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactor))
     * 
     * If {@link metalness} is set while this field is set, then
     * {@link StandardMaterial.useMetalnessSpecularColor} will be set to `true`
     * "to apply color tint to specular reflections. at direct angles."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#useMetalnessSpecularColor))
     * 
     * RGB values control {@link StandardMaterial.specular} and render into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specular)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularVertexColor)
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specular)
     * [multiplied by](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularTint)
     * ([texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularMap),
     * [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularVertexColor), or
     * [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularVertexColor))
     * 
     * Alpha values control {@link StandardMaterial.specularityFactor} and render into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorVertexColor)
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactor)
     * [multiplied by](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorTint)
     * ([texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorMap),
     * [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorVertexColor), or
     * [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#specularityFactorVertexColor))
     * 
     * If only a scalar texture is given, then it controls (specularity factor?)
     */
    specular: Color | number

    /**
     * "The emissive color of the material."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissive))
     * 
     * Renders into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissive)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveVertexColor)
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissive)
     * [multiplied by](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveTint)
     * ([texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveMap),
     * [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveVertexColor), or
     * [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#emissiveVertexColor))
     */
    emissive: Color

    /**
     * "Defines how much the surface is metallic. From 0 (dielectric) to 1 (metal)."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#metalness))
     * 
     * "With metalness == 0, the pixel is assumed to be dielectric, and diffuse
     * color is used as normal. With metalness == 1, the pixel is fully
     * metallic, and diffuse color is used as specular color instead."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#useMetalness))
     * 
     * If this field is set, then the {@link StandardMaterial.useMetalness} will be set to `true`.
     * 
     * If {@link specular.color} is set while this field is set, then
     * {@link StandardMaterial.useMetalnessSpecularColor} will be set to `true`
     * "to apply color tint to specular reflections. at direct angles."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#useMetalnessSpecularColor))
     * 
     * Renders into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#metalness)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#metalnessMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#metalnessVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#metalnessMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#metalnessVertexColor)
     */
    metalness: number

    /**
     * "Defines the glossiness of the material from 0 (rough) to 1 (shiny)."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#gloss))
     * 
     * Renders into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#gloss)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#glossMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#glossVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#glossMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#glossVertexColor)
     */
    glossiness: number

    /**
     * "The height map of the material (default is null). Used for a
     * view-dependent parallax effect. The texture must represent the height
     * of the surface where darker pixels are lower and lighter pixels are
     * higher. It is recommended to use it together with a normal map."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#gloss))
     * 
     * NOTE: this field is not set by the user; it is constructed using
     * interpolated surface normals (from {@link VolumeSample.gradient}) and
     * surface distance textures calculated from the metasphapes' textures for
     * metashape parameters (unit.height, unit.length, falloff.bias,
     * falloff.rate), merged with corresponding weights:
     * 
     * ```text
     * combine(
     *   value: mul<per object>(
     *     vertex-interpolation(
     *       value: <per object> samples[].gradient,
     *       locations: <per object> samples[].uv
     *     ),
     *     surfaceDistance(<per object> shape.texture)
     *   )
     *   weight: influences.presence<per object>
     * )
     * ```
     * 
     * The normal map will be generated from the height map and sample
     * gradients. If {@link StandardMaterial.useHeightMaps} is disabled
     * then only the normal map is made/updated.
     * 
     * Renders into [texture for height](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#heightMap)
     * (scaled by a [constant factor](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#heightMapFactor)),
     * along with:
     * 
     * - [primary normal map texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#normalMap)
     * scaled by [bumpiness factor](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#bumpiness)
     * - [primary normal map texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#normalMap)
     * scaled by [bumpiness factor](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#bumpiness)
     * added to [secondary normal map texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#normalDetailMap)
     * scaled by [bumpiness factor](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#normalDetailMapBumpiness)
     */
    height: number

    /**
     * "The opacity of the material. This value can be between 0 and 1, where 0
     * is fully transparent and 1 is fully opaque."
     * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#opacity))
     * 
     * If this field is set, then {@link StandardMaterial.twoSidedLighting}
     * is set to `true` so the back sides of objects can be rendered.
     * 
     * **Note:** `opacityFadesSpecular` is set to `false` so that reflections
     * can be vivid even when the surface is mostly transparent (like water).
     * 
     * Renders into:
     * 
     * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#opacity)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#opacityMap)
     * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#opacityVertexColor)
     * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#opacityMap)
     * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#opacityVertexColor)
     */
    opacity: number

    /**
     * Iridescence
     * 
     * If this field is set, then {@link StandardMaterial.useIridescence} is set to `true`.
     */
    iridescence: {
        /**
         * Iridescence intensity
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceMap))
         * 
         * Renders into:
         * 
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceMap)
         */
        intensity: number

        /**
         * "The index of refraction of the iridescent thin-film.
         * Affects the color phase shift as described here:
         * https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_iridescence"
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceRefractionIndex))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceRefractionIndex)
         */
        indexOfRefraction: number

        /**
         * Iridescence thickness (in nm)
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceThicknessMap))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceThicknessMax)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#iridescenceThicknessMap)
         */
        thickness: number
    }

    /**
     * Refraction
     * 
     * If this field is set, then {@link StandardMaterial.useRefraction} will
     * be set to `true`.
     * 
     * If {@link attenuation} is set, then
     * {@link StandardMaterial.useDynamicRefraction} will be set to `true`.
     */
    refraction: {
        /**
         * TODO: what does this mean?
         * 
         * "Defines the visibility of refraction."
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refraction))
         * 
         * If this field is set, then {@link StandardMaterial.useRefraction} will be set to `true`.
         * 
         * To enable higher quality refractions, set the {@link attenuation} field.
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#useDynamicRefraction))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refraction)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refractionMap)
         * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refractionVertexColor)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refractionMap)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refractionVertexColor)
         * 
         * @default 0
         */
        visibility: number

        /**
         * "Defines the index of refraction, i.e. The amount of distortion.
         * The value is calculated as (outerIor / surfaceIor), where inputs are
         * measured indices of refraction, the one around the object and the
         * one of its own surface. In most situations outer medium is air, so
         * outerIor will be approximately 1. Then you only need to do
         * (1.0 / surfaceIor)."
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refractionIndex))
         * 
         * If this field is set, then {@link StandardMaterial.useRefraction} will be set to `true`.
         * 
         * To enable higher quality refractions, set the {@link attenuation} field.
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#useDynamicRefraction))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#refractionIndex)
         * 
         * @default 1
         */
        indexOfRefraction: number

        /**
         * TODO: should this be moved to the top level?
         * 
         * Attenuation
         * 
         * If this field is set, then {@link StandardMaterial.useRefraction} and
         * {@link StandardMaterial.useDynamicRefraction} will be set to `true`,
         * and the [thickness map](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#thicknessMap)
         * will be computed.
         * 
         * This will enable higher quality refractions.
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#useDynamicRefraction))
         */
        attenuation: {
            /**
             * "The attenuation color for refractive materials"
             * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#attenuation))
             * 
             * If this field is set, then {@link StandardMaterial.useRefraction} and
             * {@link StandardMaterial.useDynamicRefraction} will be set to `true`.
             * 
             * Renders into:
             * 
             * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#attenuation)
             * 
             * @default Color.BLACK
             */
            color: Color

            /**
             * "The distance defining the absorption rate of light within the medium"
             * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#attenuationDistance))
             * 
             * If this field is set, then {@link StandardMaterial.useRefraction} and
             * {@link StandardMaterial.useDynamicRefraction} will be set to `true`.
             * 
             * Renders into:
             * 
             * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#attenuationDistance)
             * 
             * @default 1
             */
            distance: number
        }
    }

    /**
     * "The sheen (fabric) microfiber structure"
     * 
     * If this field is set, then {@link StandardMaterial.useSheen} will be set to `true`.
     */
    sheen: {
        /**
         * "The specular color of the sheen (fabric) microfiber structure.
         * This color value is 3-component (RGB), where each component is between
         * 0 and 1."
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheen))
         * 
         * Alpha values will be premultiplied into the resulting RGB values,
         * so sheen color can be dimmed with alpha.
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheen)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenMap)
         * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenVertexColor)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenMap)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenVertexColor)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheen)
         * [multiplied by](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenTint)
         * ([texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenMap),
         * [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenVertexColor), or
         * [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenMap)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenVertexColor))
         */
        color: Color

        /**
         * "The glossiness of the sheen (fabric) microfiber structure.
         * This color value is a single value between 0 and 1."
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGloss))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGloss)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossMap)
         * - [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossVertexColor)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossMap)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossVertexColor)
         * - [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossMap)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossVertexColor)
         * [multiplied by](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGlossTint)
         * [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#sheenGloss)
         */
        glossiness: number
    }

    clearCoat: {
        /**
         * "Defines intensity of clearcoat layer from 0 to 1. Clearcoat layer
         * is disabled when clearCoat == 0. Default value is 0 (disabled)."
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoat))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoat)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoat)
         * multiplied by [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatMap)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoat)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatVertexColor)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoat)
         * multiplied by [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatMap)
         * and [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatVertexColor)
         */
        intensity: number

        /**
         * "Defines the clearcoat glossiness of the clearcoat layer from 0 (rough) to 1 (mirror)."
         * ([PlayCanvas API](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGloss))
         * 
         * Renders into:
         * 
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGloss)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGloss)
         * multiplied by [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGlossMap)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGloss)
         * multiplied by [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGlossVertexColor)
         * - [constant value](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGloss)
         * multiplied by [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGlossMap)
         * and [vertex colors](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatGlossVertexColor)
         */
        glossiness: number

        /**
         * The height map for the clearcoat layer.
         * 
         * Unlike the first height texture, this height map is user-defined.
         * 
         * It will be used to generate a normal map.
         * 
         * Renders into:
         * 
         * - normal map [texture](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatNormalMap)
         * scaled by [bumpiness factor](https://developer.playcanvas.com/en/api/pc.StandardMaterial.html#clearCoatBumpiness)
         */
        height: number
    }
}