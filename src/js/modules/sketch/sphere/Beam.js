const glslify = require('glslify');
const GEOMETRY_RADIUS = 110;
const GEOMETRY_DETAIL = 2;

export default class Beam {
  constructor() {
    this.uniforms = {
      time: {
        type: 'f',
        value: 0
      }
    }
    this.obj = this.createObj();
  }
  createObj() {
    return new THREE.Mesh(
      new THREE.OctahedronBufferGeometry(GEOMETRY_RADIUS, GEOMETRY_DETAIL),
      new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: glslify('../../../../glsl/sketch/sphere/beam.vs'),
        fragmentShader: glslify('../../../../glsl/sketch/sphere/beam.fs'),
        transparent: true,
        shading: THREE.FlatShading,
      })
    )
  }
  render(time) {
    this.uniforms.time.value += time;
    this.obj.rotation.set(
      this.uniforms.time.value * 0.1,
      this.uniforms.time.value * 0.1,
      this.uniforms.time.value * 0.1
    );
  }
}
