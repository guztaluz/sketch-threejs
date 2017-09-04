attribute vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float time;

varying vec3 vPosition;
varying float vNoise;

void main(void) {
  float noise = cos(position.x * 0.08 + time * 2.0) * sin(position.y * 0.06 - time * 3.0);

  vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vNoise = noise;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
