precision highp float;

uniform float time;

varying vec3 vPosition;

const vec3 light = vec3(0.7);

void main() {
  gl_FragColor = vec4(vPosition, 1.0);
}
