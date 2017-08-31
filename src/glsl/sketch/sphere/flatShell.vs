attribute vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float time;

varying vec3 vPosition;

#pragma glslify: cnoise3 = require(glsl-noise/classic/3d);

void main(void) {
  vec3 updatePosition = position + normalize(position) * sin(time) * 5.0;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(updatePosition, 1.0);
}
