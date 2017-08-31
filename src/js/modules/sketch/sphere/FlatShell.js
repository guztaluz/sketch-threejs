const glslify = require('glslify');
const GEOMETRY_RADIUS = 120;
const GEOMETRY_DETAIL = 4;

export default class FlatShell {
  constructor() {
    this.uniforms = {
      time: {
        type: 'f',
        value: 0
      }
    }
    this.obj = this.createObj();
    this.obj.renderOrder = 10;
  }
  createObj() {
    return new THREE.Mesh(
      new THREE.OctahedronBufferGeometry(GEOMETRY_RADIUS, GEOMETRY_DETAIL),
      new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: glslify('../../../../glsl/sketch/sphere/flatShell.vs'),
        fragmentShader: glslify('../../../../glsl/sketch/sphere/flatShell.fs'),
        depthWrite: false,
        transparent: true,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading,
        blending: THREE.CustomBlending,
      })
    )
  }
  render(time) {
    this.uniforms.time.value += time;
  }
}
