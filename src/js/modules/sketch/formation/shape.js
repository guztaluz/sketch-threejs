const glslify = require('glslify');

export default class Shape {
  constructor() {
    this.uniforms = {
      time: {
        type: 'f',
        value: 0
      }
    };
    this.path = {
      logo: [
        177.7,0,0,177.7,95,0,88.8,47.5,0,
        177.7,95,0,177.7,0,0,266.5,47.5,0,
        88.8,47.5,0,88.8,142.5,0,0,95,0,
        88.8,142.5,0,88.8,47.5,0,177.7,95,0,
        266.5,47.5,0,266.5,142.5,0,177.7,95,0,
        266.5,142.5,0,266.5,47.5,0,355.3,95,0,
        177.7,95,0,177.7,190,0,88.8,142.5,0,
        177.7,190,0,177.7,95,0,266.5,142.5,0,
        88.8,142.5,0,88.8,237.5,0,0,190,0,
        88.8,237.5,0,88.8,142.5,0,177.7,190,0,
        266.5,142.5,0,266.5,237.5,0,177.7,190,0,
        266.5,237.5,0,266.5,142.5,0,355.3,190,0,
        177.7,190,0,177.7,285,0,88.8,237.5,0,
        177.7,285,0,177.7,190,0,266.5,237.5,0,
        88.8,237.5,0,88.8,332.5,0,0,285,0,
        88.8,332.5,0,88.8,237.5,0,177.7,285,0,
        266.5,237.5,0,266.5,332.5,0,177.7,285,0,
        266.5,332.5,0,266.5,237.5,0,355.3,285,0,
        177.7,285,0,177.7,380,0,88.8,332.5,0,
        177.7,380,0,177.7,285,0,266.5,332.5,0,
      ],
      f: [
        266.5,47.5,0,266.5,142.5,0,177.7,95,0,
        177.7,95,0,177.7,0,0,266.5,47.5,0,
        177.7,0,0,177.7,95,0,88.8,47.5,0,
        88.8,47.5,0,88.8,-47.5,0,177.7,0,0,
        355.3,95,0,355.3,190,0,266.5,142.5,0,
        266.5,142.5,0,266.5,47.5,0,355.3,95,0,
        88.8,-47.5,0,88.8,47.5,0,0,0,0,
        0,0,0,0,-95,0,88.8,-47.5,0,
        177.7,190,0,177.7,285,0,88.8,237.5,0,
        88.8,237.5,0,88.8,142.5,0,177.7,190,0,
        88.8,47.5,0,88.8,142.5,0,0,95,0,
        0,95,0,0,0,0,88.8,47.5,0,
        266.5,237.5,0,266.5,332.5,0,177.7,285,0,
        177.7,285,0,177.7,190,0,266.5,237.5,0,
        88.8,237.5,0,88.8,332.5,0,0,285,0,
        0,285,0,0,190,0,88.8,237.5,0,
        88.8,142.5,0,88.8,237.5,0,0,190,0,
        0,190,0,0,95,0,88.8,142.5,0,
        88.8,332.5,0,88.8,427.5,0,0,380,0,
        0,380,0,0,285,0,88.8,332.5,0,
      ],
      u: [
        355.3,-95,0,355.3,0,0,266.5,-47.5,0,
        0,0,0,0,-95,0,88.8,-47.5,0,
        88.8,-47.5,0,88.8,47.5,0,0,0,0,
        266.5,47.5,0,266.5,-47.5,0,355.3,0,0,
        355.3,0,0,355.3,95,0,266.5,47.5,0,
        0,95,0,0,0,0,88.8,47.5,0,
        88.8,47.5,0,88.8,142.5,0,0,95,0,
        266.5,142.5,0,266.5,47.5,0,355.3,95,0,
        355.3,95,0,355.3,190,0,266.5,142.5,0,
        0,190,0,0,95,0,88.8,142.5,0,
        88.8,142.5,0,88.8,237.5,0,0,190,0,
        266.5,237.5,0,266.5,142.5,0,355.3,190,0,
        355.3,190,0,355.3,285,0,266.5,237.5,0,
        0,285,0,0,190,0,88.8,237.5,0,
        88.8,237.5,0,88.8,332.5,0,0,285,0,
        88.8,332.5,0,88.8,237.5,0,177.7,285,0,
        266.5,237.5,0,266.5,332.5,0,177.7,285,0,
        266.5,332.5,0,266.5,237.5,0,355.3,285,0,
        177.7,285,0,177.7,380,0,88.8,332.5,0,
        177.7,380,0,177.7,285,0,266.5,332.5,0,
      ]
    };
    this.colors = [
      new THREE.Color(0x0FB4AE),
      new THREE.Color(0x7BC8BC),
      new THREE.Color(0x5EC0BB),
      new THREE.Color(0x6A718E),
      new THREE.Color(0xEC6867),
      new THREE.Color(0xEB6157),
      new THREE.Color(0xE84144),
      new THREE.Color(0xF5A915),
      new THREE.Color(0xF19419),
      new THREE.Color(0xF8BB0E),
    ];
    this.obj = this.createObj();
  }
  createObj() {
    const geometry = new THREE.BufferGeometry();
    const verticesBase1 = [];
    const verticesBase2 = [];
    const verticesBase3 = [];
    const colorsBase = [];
    for (var i = 0; i < this.path.logo.length; i += 3) {
      verticesBase1.push(
        this.path.logo[i + 0] - 177.65,
        (this.path.logo[i + 1] - 190) * -1,
        this.path.logo[i + 2]
      );
      verticesBase2.push(
        this.path.f[i + 0] - 177.65,
        (this.path.f[i + 1] - 190) * -1,
        this.path.f[i + 2]
      );
      verticesBase3.push(
        this.path.u[i + 0] - 177.65,
        (this.path.u[i + 1] - 190) * -1,
        this.path.u[i + 2]
      );
      colorsBase.push(
        this.colors[Math.floor(i / 18)].r,
        this.colors[Math.floor(i / 18)].g,
        this.colors[Math.floor(i / 18)].b
      );
    }
    const vertices1 = new Float32Array(verticesBase1);
    const vertices2 = new Float32Array(verticesBase2);
    const vertices3 = new Float32Array(verticesBase3);
    const colors = new Float32Array(colorsBase);
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices1, 3));
    geometry.addAttribute('position2', new THREE.BufferAttribute(vertices2, 3));
    geometry.addAttribute('position3', new THREE.BufferAttribute(vertices3, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    return new THREE.Mesh(
      geometry,
      new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: glslify('../../../../glsl/sketch/formation/shape.vs'),
        fragmentShader: glslify('../../../../glsl/sketch/formation/shape.fs'),
        side: THREE.DoubleSide
      })
    )
  }
  render(time) {
    this.uniforms.time.value += time;
  }
}
