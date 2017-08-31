attribute vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float time;

varying vec3 vPosition;

#pragma glslify: cnoise3 = require(glsl-noise/classic/3d);

void main(void) {
  float noise = cnoise3(position + time * 0.1);
  vec3 updatePosition = position + normalize(position) * noise * 20.0;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(updatePosition, 1.0);
}
