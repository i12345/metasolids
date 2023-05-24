# Material-making

Implementation uses two stages. Since the implementors can take time to generate potential implementations, the material-making processor can choose the implementor to run. Then the implementation is applied.

## Implementation notes

* Later processing stages should have priority for faster slots
  * Vertex colors claimed first by them
  * How does the system know when a value was made, the processing stage it was made in?
* When sampling a texture, if ideal resolution &lt; some constant and std dev of texture &lt; constant then use texture's mean value for a constant value slot
* When the sampling implementor is suggesting implementations, it samples part of the texture and can then compute the quality of a constant or vertex-interpolating implementation
  * This partial sampling is not discarded; it is potentially continued for a sampled texture implementation.
* Uncertainty in the triangular monotonicity can also be recorded, considered from the `screen_UV_ratio_max` value. Even computing the `screen_UV_ratio_max` value takes time, though, so it can be approximated using the maximum edge distance (in world space) and the object's distance from camera and a one-time calculation of $d(\text{world})/d(\text{screen})$ estimated at a fixed distance from the camera.

## Triangular monotonicity

Interpolating a texture's values using vertex colors is good when the values mostly follow the triangular interpolation.

Let ${\bf{\hat{t}}}(\vec{x})$ be the texture value at location $\vec{x}$ and let ${\bf{t}}(\vec{x})$ be the vertex-interpolated value. Let $m=e^{-E[|{\bf{\hat{t}}}(\vec{x})-{\bf{t}}(\vec{x})|]}$ be a metric of triangular monotonicity (1 = perfect fit).

The mean absolute difference should be computed using values of $\hat{x}$ that are nearby in screen space so it measures the high-frequency irregularities that would better fit with a sampled texture than vertex colors.
