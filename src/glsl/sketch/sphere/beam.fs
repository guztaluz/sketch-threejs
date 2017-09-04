precision highp float;

uniform float time;

varying vec3 vPosition;
varying float vNoise;

#pragma glslify: cnoise3 = require(glsl-noise/classic/3d);
#pragma glslify: convertHsvToRgb = require(glsl-util/convertHsvToRgb);

const vec3 light = vec3(0.7);

void main() {
  vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
  float diff = (dot(normal, light) + 1.0) / 2.0;

  float h = 0.8 + time * 0.1 + vPosition.y / 1600.0;

  float v1 = pow(smoothstep(0.08, 1.0, vNoise), 3.0);
  vec3 hsv1 = vec3(h, 0.8, v1 * 5.5);
  vec3 rgb1 = convertHsvToRgb(hsv1);

  vec3 hsv2 = vec3(h, 0.95, diff * 0.4);
  vec3 rgb2 = convertHsvToRgb(hsv2);

  gl_FragColor = vec4(rgb1 + rgb2, 1.0);
}
