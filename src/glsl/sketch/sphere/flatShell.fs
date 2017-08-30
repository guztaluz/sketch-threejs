precision highp float;

uniform float time;

varying vec3 vPosition;

const vec3 light = vec3(0.7);

void main() {
  vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
  if(!gl_FrontFacing) {
      normal = -normal;
  }
  float diff = (dot(normal, light) + 1.0) / 2.0 * 0.2 + 0.1;
  gl_FragColor = vec4(vec3(diff), 1.0);
}
