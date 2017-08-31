precision highp float;

uniform float time;

varying vec3 vPosition;

#pragma glslify: cnoise3 = require(glsl-noise/classic/3d);
#pragma glslify: convertHsvToRgb = require(glsl-util/convertHsvToRgb);

void main() {
  vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
  float noise = cnoise3(normal * 2.4 + time * 0.4);
  float opacity = smoothstep(0.1, 0.5, noise);
  float diff = 0.0;
  if(!gl_FrontFacing) {
      diff = 0.15;
  }
  vec3 hsv = vec3(noise * 0.8 + time * 0.1, 0.15, 1.0 - diff);
  vec3 rgb = convertHsvToRgb(hsv);
  gl_FragColor = vec4(vec3(rgb), opacity);
}
