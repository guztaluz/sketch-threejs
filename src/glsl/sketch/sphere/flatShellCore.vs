attribute vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float time;

varying vec3 vPosition;

#pragma glslify: cnoise3 = require(glsl-noise/classic/3d);

void main(void) {
  vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
