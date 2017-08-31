attribute vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float time;

varying vec3 vPosition;

#pragma glslify: cnoise3 = require(glsl-noise/classic/3d);

void main(void) {
  float noise1 = cnoise3(position + time * 0.5);
  float noise2 = cnoise3(position * 0.05 + time * 0.1);
  vec3 updatePosition = position + normalize(position) * noise1 * 30.0 + normalize(position) * noise2 * 100.0;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(updatePosition, 1.0);
}
