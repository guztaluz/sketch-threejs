attribute vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float time;

varying vec3 vPosition;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d);

void main(void) {
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
