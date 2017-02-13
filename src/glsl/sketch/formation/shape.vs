attribute vec3 position;
attribute vec3 position2;
attribute vec3 position3;
attribute vec3 color;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;

varying vec3 vColor;

#pragma glslify: ease = require(glsl-easings/exponential-in-out)

void main() {
  float animation = ease(max(mod(time, 2.0) - 1.0, 0.0));
  float index = floor(mod(time, 6.0) / 2.0);
  float step1 = 1.0 - step(1.0, index);
  float step2 = step(1.0, index) * (1.0 - step(2.0, index));
  float step3 = step(2.0, index) * (1.0 - step(3.0, index));
  vec3 updatePosition = vec3(0.0);
  updatePosition += mix(position, position2, animation) * step1;
  updatePosition += mix(position2, position3, animation) * step2;
  updatePosition += mix(position3, position, animation) * step3;
  vColor = color;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(updatePosition, 1.0);
}
