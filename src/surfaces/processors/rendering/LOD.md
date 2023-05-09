# Level of detail and dynamic objects

How can LOD be implemented? More generally, does the metasolid processing system support working with dynamic objects? If it does, then how can as much as possible be shared between the same class of object?

Consider a metashape of an octopus. If its chromatophores aren't rendered - only relatively large patches of skin changes color - how could this be represented? The diffuse texture could be composed of a (static) texture map multiplied by (dynamic) vertex colors. The same `PackedRenderedBufferForSemanticWithTexture` for the static texture could be shared among all octopuses, and it would get chosen due to its zero marginal cost. Although each octopus would have its own `Mesh` and `StandardMaterial`, much computation would be shared, and textures and other implementations could also be shared. If an animal was cloned but never updated, it could share the same mesh and material.

If the same surface is rendered in multiple entities though their material textures are static (not changing the mesh or material), then if one of the entities chooses a higher quality implementation, both entities should use it (sharing mesh and material). If a swarm of squid are flashing with different colors, then they will need different meshes to control their vertex colors differently (different mesh, same material). If the squid were decimated with different levels of detail, then they would have different meshes also. If the octopus's skin used a dynamic height map, then multiple octopuses could share the same mesh though use different materials. Finally, if those octopuses were decimates with different LOD's, then they would have different meshes and different materials.

Each entity has a `SurfaceRenderer`, and each `SurfaceWithRendering` has a `render(entity)` method to produce a `SurfaceRenderer`. The `SurfaceRenderer` can be asked to consider updating LOD given camera information, and it can be also be asked to re-render from a given stage. Internally, both of these may call the same render method.

When implementing a texture, quality largely determines value; the overhead of separate mesh and/or material objects is currently not considered, though if it is realized that only stage-0 (static) implementations are used for a storage class, then that storage class can be told to relax to the shared version. (When the storage classes are made, they are wired so that if the material texture and constant storage classes are shared, then the mesh instance is set to use the shared material. Similarly, the vertex-color storage class, when relaxed, lets the shared decimated mesh be used.) Importantly, the storage classes are told to share or individualize their mesh/material/other backing before the `RenderBuffer`'s are given.

## Custom shaders

Custom shader implementor may come later that can decompose a texture into an implementation with much less cost and higher quality that direct texture sampling.

For the octopus' chromatophores, a custom shader could take one base texture and $n$ distance-to-nearest-chromatophore textures for $n$ classes of chromatophores and interpolate between them based on the vertex colors. Then only the vertex colors on the individual octopus meshes would have to change though they could share the same material.

## Mesh instancing

If many objects are moving very fast and have little perceptual deformation, then they could use mesh instancing. This would probably be deliberately enabled by the application since "perceptual deformation" can be application-specific, though the metasolid system would make it easy to implement.
