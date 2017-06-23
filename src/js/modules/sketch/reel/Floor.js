import Projector from './Projector.js';

const glslify = require('glslify');

export default class Floor {
  constructor() {
    this.projector = new Projector(50, 1, 1, 100);
    this.uniforms = {
      time: {
        type: 'f',
        value: 0
      },
      texture: {
        type: 't',
        value: null
      },
      textureMatrix: {
        type: 'm4',
        value: this.projector.textureMatrix
      },
      projectorPosition: {
        type: 'v3',
        value: this.projector.position
      }
    };
    this.helper = new THREE.Mesh(
      new THREE.SphereGeometry(50, 24, 24),
      new THREE.MeshBasicMaterial({color: 0x555555})
    );
    this.helper.position.set(0, 800, 0);
    this.projector.position.copy(this.helper.position);
    this.projector.lookAt(new THREE.Vector3(0, 0, 0));
    const loader = new THREE.TextureLoader();
    loader.load(
      '/sketch-threejs/img/sketch/image_data/elephant.png',
      // '/sketch-threejs/img/sketch/glitch/osaka.jpg',
      (tex) => {
        console.log(tex)
        this.uniforms.texture.value = tex;
      }
    )
    this.obj = this.createObj();
  }
  createObj() {
    const geometry = new THREE.PlaneBufferGeometry(4000, 4000);
    return new THREE.Mesh(
      geometry,
      new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: glslify('../../../../glsl/sketch/reel/floor.vs'),
        fragmentShader: glslify('../../../../glsl/sketch/reel/floor.fs'),
      })
    )
  }
  render(time) {
    this.uniforms.time.value += time;
    this.helper.position.set(0, 800 + Math.cos(this.uniforms.time.value * 0.5) * 600, 0);
    this.projector.position.copy(this.helper.position);
    this.projector.lookAt(new THREE.Vector3(Math.cos(this.uniforms.time.value) * 1000, 0, Math.sin(this.uniforms.time.value) * 1000));
    this.projector.updateTextureMatrix();
  }
}