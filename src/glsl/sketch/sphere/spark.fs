precision highp float;

uniform float time;

varying vec3 vPosition;

const vec3 light = vec3(0.7);

#pragma glslify: cnoise3 = require(glsl-noise/classic/3d);
#pragma glslify: convertHsvToRgb = require(glsl-util/convertHsvToRgb);

void main() {
  vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
  float noise = cnoise3(vec3(normal.xy, normal.z + time * 0.5) * 2.4);
  float diff = dot(normal, light) * 0.2;
  float opacity = smoothstep(0.35, 0.65, noise);
  vec3 hsv = vec3(noise * 0.8 + time * 0.1, 0.2, 1.0);
  vec3 rgb = convertHsvToRgb(hsv);
  gl_FragColor = vec4(vec3(rgb), opacity);
}
