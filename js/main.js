(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Util = require('./modules/util');
var debounce = require('./modules/debounce');
var ForceCamera = require('./modules/force_camera');

var vector_mouse_down = new THREE.Vector2();
var vector_mouse_move = new THREE.Vector2();
var vector_mouse_end = new THREE.Vector2();

var canvas = null;
var renderer = null;
var scene = null;
var camera = null;

var running = null;
var sketches = require('./sketches');
var sketch_id = 0;

var metas = document.getElementsByTagName('meta');
var btn_toggle_menu = document.querySelector('.btn-switch-menu');
var menu = document.querySelector('.menu');
var select_sketch = document.querySelector('.select-sketch');
var sketch_title = document.querySelector('.sketch-title');
var sketch_date = document.querySelector('.sketch-date');
var sketch_description = document.querySelector('.sketch-description');

var initThree = function() {
  canvas = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    toneMapping: THREE.NoToneMapping,
  });
  if (!renderer) {
    alert('Three.jsの初期化に失敗しました。');
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvas.appendChild(renderer.domElement);
  renderer.setClearColor(0x000000, 1.0);

  scene = new THREE.Scene();

  camera = new ForceCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
};

var init = function() {
  setSketchId();
  buildMenu();
  initThree();
  startRunSketch(sketches[sketches.length - sketch_id]);
  renderloop();
  setEvent();
  debounce(window, 'resize', function(event){
    resizeRenderer();
  });
};

var getParameterByName = function(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

var setSketchId = function() {
  sketch_id = getParameterByName('sketch_id');
  if (sketch_id == null || sketch_id > sketches.length || sketch_id < 1) {
    sketch_id = sketches.length;
  }
};

var buildMenu = function() {
  for (var i = 0; i < sketches.length; i++) {
    var sketch = sketches[i];
    var dom = document.createElement('li');
    dom.setAttribute('data-index', i);
    dom.innerHTML = '<span>' + sketch.name + '</span>';
    dom.addEventListener('click', function() {
      switchSketch(sketches[this.getAttribute('data-index')]);
    });
    select_sketch.appendChild(dom);
  }
};

var startRunSketch = function(sketch) {
  running = new sketch.obj(scene, camera, renderer);
  sketch_title.innerHTML = sketch.name;
  sketch_date.innerHTML = (sketch.update.length > 0)
                          ? 'posted: ' + sketch.posted + ' / update: ' + sketch.update
                          : 'posted: ' + sketch.posted;
  sketch_description.innerHTML = sketch.description;
};

var switchSketch = function(sketch) {
  running.remove(scene, camera);
  startRunSketch(sketch);
  switchMenu();
};

var render = function() {
  renderer.clear();
  running.render(scene, camera, renderer);
  renderer.render(scene, camera);
};

var renderloop = function() {
  var now = Date.now();
  requestAnimationFrame(renderloop);
  render();
};

var resizeRenderer = function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.resize(window.innerWidth, window.innerHeight);
  resizeWindow();
};

var setEvent = function () {
  canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('selectstart', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('mousedown', function (event) {
    event.preventDefault();
    touchStart(event.clientX, event.clientY, false);
  });

  canvas.addEventListener('mousemove', function (event) {
    event.preventDefault();
    touchMove(event.clientX, event.clientY, false);
  });

  canvas.addEventListener('mouseup', function (event) {
    event.preventDefault();
    touchEnd(event.clientX, event.clientY, false);
  });

  canvas.addEventListener('touchstart', function (event) {
    event.preventDefault();
    touchStart(event.touches[0].clientX, event.touches[0].clientY, true);
  });

  canvas.addEventListener('touchmove', function (event) {
    event.preventDefault();
    touchMove(event.touches[0].clientX, event.touches[0].clientY, true);
  });

  canvas.addEventListener('touchend', function (event) {
    event.preventDefault();
    touchEnd(event.changedTouches[0].clientX, event.changedTouches[0].clientY, true);
  });

  window.addEventListener('mouseout', function () {
    event.preventDefault();
    mouseOut();
  });

  btn_toggle_menu.addEventListener('click', function(event) {
    event.preventDefault();
    switchMenu();
  });
};

var transformVector2d = function(vector) {
  vector.x = (vector.x / window.innerWidth) * 2 - 1;
  vector.y = - (vector.y / window.innerHeight) * 2 + 1;
};

var touchStart = function(x, y, touch_event) {
  vector_mouse_down.set(x, y);
  transformVector2d(vector_mouse_down);
  if (running.touchStart) running.touchStart(scene, camera, vector_mouse_down);
};

var touchMove = function(x, y, touch_event) {
  vector_mouse_move.set(x, y);
  transformVector2d(vector_mouse_move);
  if (running.touchMove) running.touchMove(scene, camera, vector_mouse_down, vector_mouse_move);
};

var touchEnd = function(x, y, touch_event) {
  vector_mouse_end.set(x, y);
  if (running.touchEnd) running.touchEnd(scene, camera, vector_mouse_end);
};

var mouseOut = function() {
  vector_mouse_end.set(0, 0);
  if (running.mouseOut) running.mouseOut(scene, camera);
};

var switchMenu = function() {
  btn_toggle_menu.classList.toggle('is-active');
  menu.classList.toggle('is-active');
  document.body.classList.remove('is-pointed');
};

var resizeWindow = function() {
  if (running.resizeWindow) running.resizeWindow(scene, camera);
};


init();

},{"./modules/debounce":2,"./modules/force_camera":5,"./modules/util":11,"./sketches":12}],2:[function(require,module,exports){
module.exports = function(object, eventType, callback){
  var timer;

  object.addEventListener(eventType, function(event) {
    clearTimeout(timer);
    timer = setTimeout(function(){
      callback(event);
    }, 500);
  }, false);
};

},{}],3:[function(require,module,exports){
var Util = require('../modules/util');

var exports = function(){
  var Force2 = function() {
    this.velocity = new THREE.Vector2();
    this.acceleration = new THREE.Vector2();
    this.anchor = new THREE.Vector2();
    this.mass = 1;
  };
  
  Force2.prototype.updateVelocity = function() {
    this.acceleration.divideScalar(this.mass);
    this.velocity.add(this.acceleration);
  };
  Force2.prototype.applyForce = function(vector) {
    this.acceleration.add(vector);
  };
  Force2.prototype.applyFriction = function(mu, normal) {
    var force = this.acceleration.clone();
    if (!normal) normal = 1;
    force.multiplyScalar(-1);
    force.normalize();
    force.multiplyScalar(mu);
    this.applyForce(force);
  };
  Force2.prototype.applyDrag = function(value) {
    var force = this.acceleration.clone();
    force.multiplyScalar(-1);
    force.normalize();
    force.multiplyScalar(this.acceleration.length() * value);
    this.applyForce(force);
  };
  Force2.prototype.applyHook = function(rest_length, k) {
    var force = this.velocity.clone().sub(this.anchor);
    var distance = force.length() - rest_length;
    force.normalize();
    force.multiplyScalar(-1 * k * distance);
    this.applyForce(force);
  };

  return Force2;
};

module.exports = exports();

},{"../modules/util":11}],4:[function(require,module,exports){
var Util = require('../modules/util');

var exports = function(){
  var Force = function() {
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.anchor = new THREE.Vector3();
    this.mass = 1;
  };

  Force.prototype.updateVelocity = function() {
    this.acceleration.divideScalar(this.mass);
    this.velocity.add(this.acceleration);
  };
  Force.prototype.applyForce = function(vector) {
    this.acceleration.add(vector);
  };
  Force.prototype.applyFriction = function(mu, normal) {
    var force = this.acceleration.clone();
    if (!normal) normal = 1;
    force.multiplyScalar(-1);
    force.normalize();
    force.multiplyScalar(mu);
    this.applyForce(force);
  };
  Force.prototype.applyDrag = function(value) {
    var force = this.acceleration.clone();
    force.multiplyScalar(-1);
    force.normalize();
    force.multiplyScalar(this.acceleration.length() * value);
    this.applyForce(force);
  };
  Force.prototype.applyHook = function(rest_length, k) {
    var force = this.velocity.clone().sub(this.anchor);
    var distance = force.length() - rest_length;
    force.normalize();
    force.multiplyScalar(-1 * k * distance);
    this.applyForce(force);
  };

  return Force;
};

module.exports = exports();

},{"../modules/util":11}],5:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var ForceCamera = function(fov, aspect, near, far) {
    THREE.PerspectiveCamera.call(this, fov, aspect, near, far);
    this.force = {
      position: new Force3(),
      look: new Force3(),
    };
    this.up.set(0, 1, 0);
  };
  ForceCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
  ForceCamera.prototype.constructor = ForceCamera;
  ForceCamera.prototype.updatePosition = function() {
    this.position.copy(this.force.position.velocity);
  };
  ForceCamera.prototype.updateLook = function() {
    this.lookAt({
      x: this.force.look.velocity.x,
      y: this.force.look.velocity.y,
      z: this.force.look.velocity.z,
    });
  };
  ForceCamera.prototype.reset = function() {
    this.setPolarCoord();
    this.lookAtCenter();
  };
  ForceCamera.prototype.resize = function(width, height) {
    this.aspect = width / height;
    this.updateProjectionMatrix();
  };
  ForceCamera.prototype.setPolarCoord = function(rad1, rad2, range) {
    this.force.position.anchor.copy(Util.getPolarCoord(rad1, rad2, range));
  };
  ForceCamera.prototype.lookAtCenter = function() {
    this.lookAt({
      x: 0,
      y: 0,
      z: 0
    });
  };
  return ForceCamera;
};

module.exports = exports();

},{"../modules/force3":4,"../modules/util":11}],6:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var ForceHemisphereLight = function(hex1, hex2, intensity) {
    THREE.HemisphereLight.call(this, hex1, hex2, intensity);
    this.force = new Force3();
  };
  ForceHemisphereLight.prototype = Object.create(THREE.HemisphereLight.prototype);
  ForceHemisphereLight.prototype.constructor = ForceHemisphereLight;
  ForceHemisphereLight.prototype.updatePosition = function() {
    this.position.copy(this.force.velocity);
  };
  ForceHemisphereLight.prototype.setPositionSpherical = function(rad1, rad2, range) {
    this.position.copy(Util.getPolarCoord(rad1, rad2, range));
  };
  return ForceHemisphereLight;
};

module.exports = exports();

},{"../modules/force3":4,"../modules/util":11}],7:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var ForcePointLight = function(hex, intensity, distance, decay) {
    THREE.PointLight.call(this, hex, intensity, distance, decay);
    this.force = new Force3();
  };
  ForcePointLight.prototype = Object.create(THREE.PointLight.prototype);
  ForcePointLight.prototype.constructor = ForcePointLight;
  ForcePointLight.prototype.updatePosition = function() {
    this.position.copy(this.force.velocity);
  };
  ForcePointLight.prototype.setPolarCoord = function(rad1, rad2, range) {
    this.position.copy(Util.getPolarCoord(rad1, rad2, range));
  };
  return ForcePointLight;
};

module.exports = exports();

},{"../modules/force3":4,"../modules/util":11}],8:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var Mover = function() {
    this.size = 0;
    this.time = 0;
    this.is_active = false;
    Force3.call(this);
  };
  Mover.prototype = Object.create(Force3.prototype);
  Mover.prototype.constructor = Mover;
  Mover.prototype.init = function(vector) {
    this.velocity = vector.clone();
    this.anchor = vector.clone();
    this.acceleration.set(0, 0, 0);
    this.time = 0;
  };
  Mover.prototype.activate = function() {
    this.is_active = true;
  };
  Mover.prototype.inactivate = function() {
    this.is_active = false;
  };
  return Mover;
};

module.exports = exports();

},{"../modules/force3":4,"../modules/util":11}],9:[function(require,module,exports){


var exports = function(){
  var PhysicsRenderer = function(length) {
    this.length = length;
    this.acceleration_scene = new THREE.Scene();
    this.velocity_scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    this.option = {
      type: THREE.FloatType,
    };
    this.acceleration = [
      new THREE.WebGLRenderTarget(length, length, this.option),
      new THREE.WebGLRenderTarget(length, length, this.option),
    ];
    this.velocity = [
      new THREE.WebGLRenderTarget(length, length, this.option),
      new THREE.WebGLRenderTarget(length, length, this.option),
    ];
    this.acceleration_mesh = this.createMesh(
      "#define GLSLIFY 1\nvarying vec2 vUv;\n\nvoid main(void) {\n  vUv = uv;\n  gl_Position = vec4(position, 1.0);\n}\n",
      "#define GLSLIFY 1\nuniform vec2 resolution;\nuniform sampler2D velocity;\nuniform sampler2D acceleration;\nuniform vec2 anchor;\n\nvarying vec2 vUv;\n\n#define PRECISION 0.000001\n\nvec3 drag(vec3 a, float value) {\n  return normalize(a * -1.0 + PRECISION) * length(a) * value;\n}\n\nvec3 hook(vec3 v, vec3 anchor, float rest_length, float k) {\n  return normalize(v - anchor + PRECISION) * (-1.0 * k * (length(v - anchor) - rest_length));\n}\n\nvec3 attract(vec3 v1, vec3 v2, float m1, float m2, float g) {\n  return g * m1 * m2 / pow(clamp(length(v2 - v1), 5.0, 30.0), 2.0) * normalize(v2 - v1 + PRECISION);\n}\n\nvoid main(void) {\n  vec3 v = texture2D(velocity, vUv).xyz;\n  vec3 a = texture2D(acceleration, vUv).xyz;\n  vec3 a2 = a + normalize(vec3(\n    anchor.x * resolution.x / 6.0 + PRECISION,\n    0.0,\n    anchor.y * resolution.y / -2.0 + PRECISION\n  ) - v) / 2.0;\n  vec3 a3 = a2 + drag(a2, 0.003);\n  gl_FragColor = vec4(a3, 1.0);\n}\n"
    );
    this.velocity_mesh = this.createMesh(
      "#define GLSLIFY 1\nvarying vec2 vUv;\n\nvoid main(void) {\n  vUv = uv;\n  gl_Position = vec4(position, 1.0);\n}\n",
      "#define GLSLIFY 1\nuniform float time;\nuniform sampler2D velocity;\nuniform sampler2D acceleration;\n\nvarying vec2 vUv;\n\nvoid main(void) {\n  gl_FragColor = vec4(texture2D(acceleration, vUv).xyz + texture2D(velocity, vUv).xyz, 1.0);\n}\n"
    );
    this.target_index = 0;
  };
  PhysicsRenderer.prototype = {
    init: function(renderer, velocity_array) {
      var acceleration_init_mesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2),
        new THREE.ShaderMaterial({
          vertexShader: 'void main(void) {gl_Position = vec4(position, 1.0);}',
          fragmentShader: 'void main(void) {gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);}',
        })
      );
      var velocity_init_tex = new THREE.DataTexture(velocity_array, this.length, this.length, THREE.RGBFormat, THREE.FloatType);
      velocity_init_tex.needsUpdate = true;
      var velocity_init_mesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2),
        new THREE.ShaderMaterial({
          uniforms: {
            velocity: {
              type: 't',
              value: velocity_init_tex,
            },
          },
          vertexShader: "#define GLSLIFY 1\nvarying vec2 vUv;\n\nvoid main(void) {\n  vUv = uv;\n  gl_Position = vec4(position, 1.0);\n}\n",
          fragmentShader: "#define GLSLIFY 1\nuniform sampler2D velocity;\n\nvarying vec2 vUv;\n\nvoid main(void) {\n  gl_FragColor = texture2D(velocity, vUv);\n}\n",
        })
      );

      this.acceleration_scene.add(this.camera);
      this.acceleration_scene.add(acceleration_init_mesh);
      renderer.render(this.acceleration_scene, this.camera, this.acceleration[0]);
      renderer.render(this.acceleration_scene, this.camera, this.acceleration[1]);
      this.acceleration_scene.remove(acceleration_init_mesh);
      this.acceleration_scene.add(this.acceleration_mesh);

      this.velocity_scene.add(this.camera);
      this.velocity_scene.add(velocity_init_mesh);
      renderer.render(this.velocity_scene, this.camera, this.velocity[0]);
      renderer.render(this.velocity_scene, this.camera, this.velocity[1]);
      this.velocity_scene.remove(velocity_init_mesh);
      this.velocity_scene.add(this.velocity_mesh);
    },
    createMesh: function(vs, fs) {
      return new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2),
        new THREE.ShaderMaterial({
          uniforms: {
            resolution: {
              type: 'v2',
              value: new THREE.Vector2(window.innerWidth, window.innerHeight),
            },
            velocity: {
              type: 't',
              value: null,
            },
            acceleration: {
              type: 't',
              value: null,
            },
          },
          vertexShader: vs,
          fragmentShader: fs,
        })
      );
    },
    render: function(renderer) {
      this.acceleration_mesh.material.uniforms.acceleration.value = this.acceleration[Math.abs(this.target_index - 1)];
      this.acceleration_mesh.material.uniforms.velocity.value = this.velocity[this.target_index];
      renderer.render(this.acceleration_scene, this.camera, this.acceleration[this.target_index]);
      this.velocity_mesh.material.uniforms.acceleration.value = this.acceleration[this.target_index];
      this.velocity_mesh.material.uniforms.velocity.value = this.velocity[this.target_index];
      renderer.render(this.velocity_scene, this.camera, this.velocity[Math.abs(this.target_index - 1)]);
      this.target_index = Math.abs(this.target_index - 1);
    },
    getCurrentVelocity: function() {
      return this.velocity[Math.abs(this.target_index - 1)];
    },
    getCurrentAcceleration: function() {
      return this.acceleration[Math.abs(this.target_index - 1)];
    },
    resize: function(length) {
      this.length = length;
      this.velocity[0].setSize(length, length);
      this.velocity[1].setSize(length, length);
      this.acceleration[0].setSize(length, length);
      this.acceleration[1].setSize(length, length);
    },
  };
  return PhysicsRenderer;
};

module.exports = exports();

},{}],10:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var Points = function() {
    this.geometry = new THREE.BufferGeometry();
    this.material = null;
    this.obj = null;
    Force3.call(this);
  };
  Points.prototype = Object.create(Force3.prototype);
  Points.prototype.constructor = Points;
  Points.prototype.init = function(param) {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        color: { type: 'c', value: new THREE.Color(0xffffff) },
        texture: { type: 't', value: param.texture }
      },
      vertexShader: param.vs,
      fragmentShader: param.fs,
      transparent: true,
      depthWrite: false,
      blending: param.blending
    });
    this.geometry.addAttribute('position', new THREE.BufferAttribute(param.positions, 3));
    this.geometry.addAttribute('customColor', new THREE.BufferAttribute(param.colors, 3));
    this.geometry.addAttribute('vertexOpacity', new THREE.BufferAttribute(param.opacities, 1));
    this.geometry.addAttribute('size', new THREE.BufferAttribute(param.sizes, 1));
    this.obj = new THREE.Points(this.geometry, this.material);
    param.scene.add(this.obj);
  };
  Points.prototype.updatePoints = function() {
    this.obj.position.copy(this.velocity);
    this.obj.geometry.attributes.position.needsUpdate = true;
    this.obj.geometry.attributes.vertexOpacity.needsUpdate = true;
    this.obj.geometry.attributes.size.needsUpdate = true;
    this.obj.geometry.attributes.customColor.needsUpdate = true;
  };
  return Points;
};

module.exports = exports();

},{"../modules/force3":4,"../modules/util":11}],11:[function(require,module,exports){
var exports = {
  getRandomInt: function(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
  },
  getDegree: function(radian) {
    return radian / Math.PI * 180;
  },
  getRadian: function(degrees) {
    return degrees * Math.PI / 180;
  },
  getPolarCoord: function(rad1, rad2, r) {
    var x = Math.cos(rad1) * Math.cos(rad2) * r;
    var z = Math.cos(rad1) * Math.sin(rad2) * r;
    var y = Math.sin(rad1) * r;
    return new THREE.Vector3(x, y, z);
  }
};

module.exports = exports;

},{}],12:[function(require,module,exports){
module.exports = [
  {
    name: 'attract',
    obj: require('./sketches/attract'),
    posted: '2016.6.13',
    update: '2016.7.2',
    description: 'use fragment shader to perticle moving.',
  },
  {
    name: 'hole',
    obj: require('./sketches/hole'),
    posted: '2016.5.10',
    update: '2016.7.2',
    description: 'study of Post Effect that used THREE.WebGLRenderTarget.',
  },
  {
    name: 'metal cube',
    obj: require('./sketches/metal_cube'),
    posted: '2016.4.21',
    update: '',
    description: 'study of raymarching using three.js.',
  },
  {
    name: 'distort',
    obj: require('./sketches/distort'),
    posted: '2016.2.23',
    update: '2016.5.10',
    description: 'using the simplex noise, distort the sphere.',
  },
  {
    name: 'image data',
    obj: require('./sketches/image_data'),
    posted: '2015.12.9',
    update: '2015.12.12',
    description: 'Points based CanvasRenderingContext2D.getImageData()',
  },
  {
    name: 'gallery',
    obj: require('./sketches/gallery'),
    posted: '2015.12.2',
    update: '2015.12.9',
    description: 'image gallery on 3d. tested that picked object and moving camera.',
  },
  {
    name: 'comet',
    obj: require('./sketches/comet'),
    posted: '2015.11.24',
    update: '2016.1.8',
    description: 'camera to track the moving points.',
  },
  {
    name: 'hyper space',
    obj: require('./sketches/hyper_space'),
    posted: '2015.11.12',
    update: '',
    description: 'add little change about camera angle and particle controles.',
  },
  {
    name: 'fire ball',
    obj: require('./sketches/fire_ball'),
    posted: '2015.11.12',
    update: '',
    description: 'test of simple physics and additive blending.',
  }
];

},{"./sketches/attract":13,"./sketches/comet":14,"./sketches/distort":15,"./sketches/fire_ball":16,"./sketches/gallery":17,"./sketches/hole":18,"./sketches/hyper_space":19,"./sketches/image_data":20,"./sketches/metal_cube":21}],13:[function(require,module,exports){

var Util = require('../modules/util');
var PhysicsRenderer = require('../modules/physics_renderer');

var exports = function(){
  var Sketch = function(scene, camera, renderer) {
    this.init(scene, camera, renderer);
  };

  var length = 1000;
  var physics_renderer = null;

  var createPoints = function() {
    var geometry = new THREE.BufferGeometry();
    var vertices_base = [];
    var uvs_base = [];
    var colors_base = [];
    var masses_base = [];
    for (var i = 0; i < Math.pow(length, 2); i++) {
      vertices_base.push(0, 0, 0);
      uvs_base.push(
        i % length * (1 / (length - 1)),
        Math.floor(i / length) * (1 / (length - 1))
      );
      colors_base.push(Util.getRandomInt(0, 120) / 360, 0.8, 1);
      masses_base.push(Util.getRandomInt(1, 100));
    }
    var vertices = new Float32Array(vertices_base);
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    var uvs = new Float32Array(uvs_base);
    geometry.addAttribute('uv2', new THREE.BufferAttribute(uvs, 2));
    var colors = new Float32Array(colors_base);
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    var masses = new Float32Array(masses_base);
    geometry.addAttribute('mass', new THREE.BufferAttribute(masses, 1));
    var material = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0,
        },
        velocity: {
          type: 't',
          value: new THREE.Texture()
        },
        acceleration: {
          type: 't',
          value: new THREE.Texture()
        }
      },
      vertexShader: "#define GLSLIFY 1\nattribute vec2 uv2;\nattribute vec3 color;\nattribute float mass;\n\nuniform sampler2D velocity;\nuniform sampler2D acceleration;\n\nvarying float vAcceleration;\nvarying vec3 vColor;\nvarying float vOpacity;\n\nvoid main(void) {\n  vec4 update_position = modelViewMatrix * texture2D(velocity, uv2);\n  vAcceleration = length(texture2D(acceleration, uv2).xyz) * mass;\n  vColor = color;\n  vOpacity = 0.6 * (300.0 / length(update_position.xyz));\n  gl_PointSize = 2.0 * (300.0 / length(update_position.xyz));\n  gl_Position = projectionMatrix * update_position;\n}\n",
      fragmentShader: "#define GLSLIFY 1\nvarying float vAcceleration;\nvarying vec3 vColor;\nvarying float vOpacity;\n\nuniform float time;\n\nvec3 hsv2rgb_1_0(vec3 c){\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\n\n\nvoid main(void) {\n  vec3 n;\n  n.xy = gl_PointCoord * 2.0 - 1.0;\n  n.z = 1.0 - dot(n.xy, n.xy);\n  if (n.z < 0.0) discard;\n  gl_FragColor = vec4(hsv2rgb_1_0(vec3(vColor.x + time / 3600.0, vColor.y, vColor.z)), vOpacity);\n}\n",
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.Points(geometry, material);
  }
  var points = createPoints();

  var createPointsIntVelocity = function() {
    var vertices = [];
    for (var i = 0; i < Math.pow(length, 2); i++) {
      var v = Util.getPolarCoord(
        Util.getRadian(Util.getRandomInt(0, 360)),
        Util.getRadian(Util.getRandomInt(0, 360)),
        Util.getRandomInt(10, 1000)
      );
      vertices.push(v.x, v.y / 10.0, v.z);
    }
    return new Float32Array(vertices);
  }

  Sketch.prototype = {
    init: function(scene, camera, renderer) {
      physics_renderer = new PhysicsRenderer(length);
      physics_renderer.init(renderer, createPointsIntVelocity());
      physics_renderer.acceleration_mesh.material.uniforms.anchor = {
        type: 'v2',
        value: new THREE.Vector2(),
      }
      scene.add(points);
      camera.force.position.anchor.set(0, 15, 600);
      camera.force.look.anchor.set(0, 0, 0);
    },
    remove: function(scene) {
      points.geometry.dispose();
      points.material.dispose();
      scene.remove(points);
    },
    render: function(scene, camera, renderer) {
      physics_renderer.render(renderer);
      points.material.uniforms.time.value++;
      points.material.uniforms.velocity.value = physics_renderer.getCurrentVelocity();
      points.material.uniforms.acceleration.value = physics_renderer.getCurrentAcceleration();
      camera.force.position.applyHook(0, 0.025);
      camera.force.position.applyDrag(0.2);
      camera.force.position.updateVelocity();
      camera.updatePosition();
      camera.force.look.applyHook(0, 0.2);
      camera.force.look.applyDrag(0.4);
      camera.force.look.updateVelocity();
      camera.updateLook();
    },
    touchStart: function(scene, camera, vector) {
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      physics_renderer.acceleration_mesh.material.uniforms.anchor.value.copy(vector_mouse_move);
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
    },
    mouseOut: function(scene, camera) {
      physics_renderer.acceleration_mesh.material.uniforms.anchor.value.set(0, 0, 0);
    },
    resizeWindow: function(scene, camera) {
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/physics_renderer":9,"../modules/util":11}],14:[function(require,module,exports){
var Util = require('../modules/util');
var Force2 = require('../modules/force2');
var Mover = require('../modules/mover');
var Points = require('../modules/points.js');
var ForceHemisphereLight = require('../modules/force_hemisphere_light');
var ForcePointLight = require('../modules/force_point_light');


var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };
  var movers_num = 10000;
  var movers = [];
  var mover_activate_count = 2;
  var points = new Points();
  var hemi_light = null;
  var comet_light1 = null;
  var comet_light2 = null;
  var positions = new Float32Array(movers_num * 3);
  var colors = new Float32Array(movers_num * 3);
  var opacities = new Float32Array(movers_num);
  var sizes = new Float32Array(movers_num);
  var comet = null;
  var comet_radius = 30;
  var comet_scale = new Force2();
  var comet_color_h = 140;
  var color_diff = 45;
  var planet = null;
  var last_time_activate = Date.now();
  var last_time_plus_activate = Date.now();
  var last_time_bounce = Date.now();
  var last_time_touch = Date.now();
  var plus_acceleration = 0;
  var is_touched = false;
  var is_plus_activate = false;
  var track_points = true;

  var updateMover = function() {
    for (var i = 0; i < movers.length; i++) {
      var mover = movers[i];
      var position = new THREE.Vector3();
      if (mover.is_active) {
        mover.time++;
        mover.applyDrag(0.1);
        mover.updateVelocity();
        if (mover.time > 10) {
          mover.size -= 2;
          //mover.a -= 0.04;
        }
        if (mover.size <= 0) {
          mover.init(new THREE.Vector3(0, 0, 0));
          mover.time = 0;
          mover.a = 0.0;
          mover.inactivate();
        }
      }
      positions[i * 3 + 0] = mover.velocity.x - points.velocity.x;
      positions[i * 3 + 1] = mover.velocity.y - points.velocity.y;
      positions[i * 3 + 2] = mover.velocity.z - points.velocity.z;
      colors[i * 3 + 0] = mover.color.r;
      colors[i * 3 + 1] = mover.color.g;
      colors[i * 3 + 2] = mover.color.b;
      opacities[i] = mover.a;
      sizes[i] = mover.size;
    }
    points.updatePoints();
  };

  var activateMover = function() {
    var count = 0;
    var now = Date.now();
    if (now - last_time_activate > 10) {
      for (var i = 0; i < movers.length; i++) {
        var mover = movers[i];
        if (mover.is_active) continue;
        var rad1 = Util.getRadian(Util.getRandomInt(0, 360));
        var rad2 = Util.getRadian(Util.getRandomInt(0, 360));
        var range = Util.getRandomInt(1, 30);
        var vector = Util.getPolarCoord(rad1, rad2, range);
        var force = Util.getPolarCoord(rad1, rad2, range / 20);
        var h = Util.getRandomInt(comet_color_h - color_diff, comet_color_h + color_diff) - plus_acceleration / 1.5;
        var s = Util.getRandomInt(60, 80);
        vector.add(points.velocity);
        mover.activate();
        mover.init(vector);
        mover.color.setHSL(h / 360, s / 100, 0.7);
        mover.applyForce(force);
        mover.a = 1;
        mover.size = 25;
        count++;
        if (count >= mover_activate_count) break;
      }
      last_time_activate = Date.now();
    }
  };

  var rotateComet = function() {
    comet.rotation.x += 0.03 + plus_acceleration / 1000;
    comet.rotation.y += 0.01 + plus_acceleration / 1000;
    comet.rotation.z += 0.01 + plus_acceleration / 1000;
    points.rad1_base += Util.getRadian(.6);
    points.rad1 = Util.getRadian(Math.sin(points.rad1_base) * 45 + plus_acceleration / 100);
    points.rad2 += Util.getRadian(0.8 + plus_acceleration / 100);
    points.rad3 += 0.01;
    return Util.getPolarCoord(points.rad1, points.rad2, 350);
  };

  var rotateCometColor = function() {
    var radius = comet_radius * 0.8;
    comet_light1.position.copy(Util.getPolarCoord(Util.getRadian(0),  Util.getRadian(0), radius).add(points.velocity));
    comet_light2.position.copy(Util.getPolarCoord(Util.getRadian(180), Util.getRadian(0), radius).add(points.velocity));
  };

  var bounceComet = function() {
    if (Date.now() - last_time_bounce > 1000 - plus_acceleration * 3) {
      comet_scale.applyForce(new THREE.Vector2(0.08 + plus_acceleration / 5000, 0));
      last_time_bounce = Date.now();
      is_plus_activate = true;
      last_time_plus_activate = Date.now();
    }
    if (is_plus_activate && Date.now() - last_time_plus_activate < 500) {
      mover_activate_count = 6 + Math.floor(plus_acceleration / 40);
    } else {
      mover_activate_count = 1 + Math.floor(plus_acceleration / 40);
    }
    comet_scale.applyHook(0, 0.1);
    comet_scale.applyDrag(0.12);
    comet_scale.updateVelocity();
    comet.scale.set(1 + comet_scale.velocity.x, 1 + comet_scale.velocity.x, 1 + comet_scale.velocity.x);
  };

  var createTexture = function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var grad = null;
    var texture = null;

    canvas.width = 200;
    canvas.height = 200;
    grad = ctx.createRadialGradient(100, 100, 20, 100, 100, 100);
    grad.addColorStop(0.9, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.arc(100, 100, 100, 0, Math.PI / 180, true);
    ctx.fill();

    texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  };

  var createCommet = function() {
    var base_geometry = new THREE.OctahedronGeometry(comet_radius, 2);
    var geometry = new THREE.BufferGeometry();
    var material = new THREE.MeshPhongMaterial({
      color: new THREE.Color('hsl(' + comet_color_h + ', 100%, 100%)'),
      shading: THREE.FlatShading
    });
    var positions = new Float32Array(base_geometry.vertices.length * 3);
    for (var i = 0; i < base_geometry.vertices.length; i++) {
      positions[i * 3] = base_geometry.vertices[i].x;
      positions[i * 3 + 1] = base_geometry.vertices[i].y;
      positions[i * 3 + 2] = base_geometry.vertices[i].z;
    }
    var indices = new Uint32Array(base_geometry.faces.length * 3);
    for (var j = 0; j < base_geometry.faces.length; j++) {
      indices[j * 3] = base_geometry.faces[j].a;
      indices[j * 3 + 1] = base_geometry.faces[j].b;
      indices[j * 3 + 2] = base_geometry.faces[j].c;
    }
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.attributes.position.dynamic = true;
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.index.dynamic = true;
    return new THREE.Mesh(geometry, material);
  };

  var createPlanet = function() {
    var geometry = new THREE.OctahedronGeometry(250, 4);
    var material = new THREE.MeshPhongMaterial({
      color: 0x222222,
      shading: THREE.FlatShading
    });
    return new THREE.Mesh(geometry, material);
  };

  var accelerateComet = function() {
    if (is_touched && plus_acceleration < 200) {
      plus_acceleration += 1;
    } else if(plus_acceleration > 0) {
      plus_acceleration -= 1;
    }
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      comet = createCommet();
      scene.add(comet);
      planet = createPlanet();
      scene.add(planet);
      for (var i = 0; i < movers_num; i++) {
        var mover = new Mover();
        var h = Util.getRandomInt(comet_color_h - color_diff, comet_color_h + color_diff);
        var s = Util.getRandomInt(60, 80);
        mover.init(new THREE.Vector3(Util.getRandomInt(-100, 100), 0, 0));
        mover.color = new THREE.Color('hsl(' + h + ', ' + s + '%, 70%)');
        movers.push(mover);
        positions[i * 3 + 0] = mover.velocity.x;
        positions[i * 3 + 1] = mover.velocity.y;
        positions[i * 3 + 2] = mover.velocity.z;
        colors[i * 3 + 0] = mover.color.r;
        colors[i * 3 + 1] = mover.color.g;
        colors[i * 3 + 2] = mover.color.b;
        opacities[i] = mover.a;
        sizes[i] = mover.size;
      }
      points.init({
        scene: scene,
        vs: "#define GLSLIFY 1\nattribute vec3 customColor;\nattribute float vertexOpacity;\nattribute float size;\n\nvarying vec3 vColor;\nvarying float fOpacity;\n\nvoid main() {\n  vColor = customColor;\n  fOpacity = vertexOpacity;\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\n  gl_Position = projectionMatrix * mvPosition;\n}\n",
        fs: "#define GLSLIFY 1\nuniform vec3 color;\nuniform sampler2D texture;\n\nvarying vec3 vColor;\nvarying float fOpacity;\n\nvoid main() {\n  gl_FragColor = vec4(color * vColor, fOpacity);\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\n}\n",
        positions: positions,
        colors: colors,
        opacities: opacities,
        sizes: sizes,
        texture: createTexture(),
        blending: THREE.NormalBlending
      });
      points.rad1 = 0;
      points.rad1_base = 0;
      points.rad2 = 0;
      points.rad3 = 0;
      hemi_light = new ForceHemisphereLight(
        new THREE.Color('hsl(' + (comet_color_h - color_diff) + ', 50%, 60%)').getHex(),
        new THREE.Color('hsl(' + (comet_color_h + color_diff) + ', 50%, 60%)').getHex(),
        1
      );
      scene.add(hemi_light);
      comet_light1 = new ForcePointLight('hsl(' + (comet_color_h - color_diff) + ', 60%, 50%)', 1, 500, 1);
      scene.add(comet_light1);
      comet_light2 = new ForcePointLight('hsl(' + (comet_color_h - color_diff) + ', 60%, 50%)', 1, 500, 1);
      scene.add(comet_light2);
      camera.anchor = new THREE.Vector3(1500, 0, 0);
    },
    remove: function(scene) {
      comet.geometry.dispose();
      comet.material.dispose();
      scene.remove(comet);
      planet.geometry.dispose();
      planet.material.dispose();
      scene.remove(planet);
      points.geometry.dispose();
      points.material.dispose();
      scene.remove(points.obj);
      scene.remove(hemi_light);
      scene.remove(comet_light1);
      scene.remove(comet_light2);
      movers = [];
    },
    render: function(scene, camera) {
      accelerateComet();
      points.velocity = rotateComet();
      if (track_points === true) {
        camera.force.position.anchor.copy(
          points.velocity.clone().add(
            points.velocity.clone().sub(points.obj.position).normalize().multiplyScalar(-400)
          )
        );
        camera.force.position.anchor.y += points.velocity.y * 2;
        camera.force.look.anchor.copy(points.velocity);
      }
      points.updatePoints();
      comet.position.copy(points.velocity);
      hemi_light.color.setHSL((comet_color_h - color_diff - plus_acceleration / 1.5) / 360, 0.5, 0.6);
      hemi_light.groundColor.setHSL((comet_color_h + color_diff - plus_acceleration / 1.5) / 360, 0.5, 0.6);
      comet_light1.position.copy(points.velocity);
      comet_light1.color.setHSL((comet_color_h - color_diff - plus_acceleration / 1.5) / 360, 0.5, 0.6);
      comet_light2.position.copy(points.velocity);
      comet_light2.color.setHSL((comet_color_h + color_diff - plus_acceleration / 1.5) / 360, 0.5, 0.6);
      activateMover();
      updateMover();
      camera.force.position.applyHook(0, 0.025);
      camera.force.position.applyDrag(0.2);
      camera.force.position.updateVelocity();
      camera.updatePosition();
      camera.force.look.applyHook(0, 0.2);
      camera.force.look.applyDrag(0.4);
      camera.force.look.updateVelocity();
      camera.updateLook();
      rotateCometColor();
      bounceComet();
    },
    touchStart: function(scene, camera, vector) {
      is_touched = true;
      last_time_touch = Date.now();
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      is_touched = false;
      if (Date.now() - last_time_touch < 100) {
        if (track_points === true) {
          camera.force.position.anchor.set(1200, 1200, 0);
          camera.force.look.anchor.set(0, 0, 0);
          track_points = false;
        } else {
          track_points = true;
        }
      }
    },
    mouseOut: function(scene, camera) {
      this.touchEnd(scene, camera)
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/force2":3,"../modules/force_hemisphere_light":6,"../modules/force_point_light":7,"../modules/mover":8,"../modules/points.js":10,"../modules/util":11}],15:[function(require,module,exports){
var Util = require('../modules/util');
var ForceCamera = require('../modules/force_camera');
var Force2 = require('../modules/force2');


var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };
  var sphere = null;
  var bg = null;
  var light = new THREE.HemisphereLight(0xffffff, 0x666666, 1);
  var sub_scene = new THREE.Scene();
  var sub_camera = new ForceCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  var sub_light = new THREE.HemisphereLight(0xffffff, 0x666666, 1);
  var force = new Force2();
  var time_unit = 1;
  var render_target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping
  })
  var framebuffer = null;

  var createSphere = function() {
    var geometry = new THREE.BufferGeometry();
    geometry.fromGeometry(new THREE.OctahedronGeometry(200, 5));
    var material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib['lights'],
        {
          time: {
            type: 'f',
            value: 0,
          },
          radius: {
            type: 'f',
            value: 1.0
          },
          distort: {
            type: 'f',
            value: 0.4
          }
        }
      ]),
      vertexShader: "#define GLSLIFY 1\nuniform float time;\nuniform float radius;\nuniform float distort;\n\nvarying vec3 vColor;\nvarying vec3 vNormal;\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2_1(vec4 x) {\n     return mod289_2_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_2_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_2_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_2_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_2_5;\n  vec3 i1 = min( g_2_5.xyz, l.zxy );\n  vec3 i2 = max( g_2_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_2_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2_0(i);\n  vec4 p = permute_2_1( permute_2_1( permute_2_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_2_4.wyz - D_2_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_2_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_2_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_2_6.xy,h.z);\n  vec3 p3 = vec3(a1_2_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_2_2(vec4(dot(p0_2_7,p0_2_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_2_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_2_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 hsv2rgb_1_8(vec3 c){\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\n\n\nvoid main() {\n  float updateTime = time / 1000.0;\n  float noise = snoise_2_3(vec3(position / 400.1 + updateTime * 5.0));\n  vec4 mvPosition = modelViewMatrix * vec4(position * (noise * pow(distort, 2.0) + radius), 1.0);\n\n  vColor = hsv2rgb_1_8(vec3(noise * distort * 0.3 + updateTime, 0.2, 1.0));\n  vNormal = normal;\n\n  gl_Position = projectionMatrix * mvPosition;\n}\n",
      fragmentShader: "#define GLSLIFY 1\nvarying vec3 vColor;\nvarying vec3 vNormal;\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2_1(vec4 x) {\n     return mod289_2_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_2_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_2_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_2_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_2_5;\n  vec3 i1 = min( g_2_5.xyz, l.zxy );\n  vec3 i2 = max( g_2_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_2_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2_0(i);\n  vec4 p = permute_2_1( permute_2_1( permute_2_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_2_4.wyz - D_2_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_2_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_2_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_2_6.xy,h.z);\n  vec3 p3 = vec3(a1_2_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_2_2(vec4(dot(p0_2_7,p0_2_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_2_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_2_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 hsv2rgb_1_8(vec3 c){\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\n\n\nstruct HemisphereLight {\n  vec3 direction;\n  vec3 groundColor;\n  vec3 skyColor;\n};\nuniform HemisphereLight hemisphereLights[NUM_HEMI_LIGHTS];\n\nvoid main() {\n  vec3 light = vec3(0.0);\n  light += (dot(hemisphereLights[0].direction, vNormal) + 1.0) * hemisphereLights[0].skyColor * 0.5;\n  light += (-dot(hemisphereLights[0].direction, vNormal) + 1.0) * hemisphereLights[0].groundColor * 0.5;\n  gl_FragColor = vec4(vColor * light, 1.0);\n}\n",
      lights: true,
    });
    return new THREE.Mesh(geometry, material);
  };

  var createBackground = function() {
    var geometry = new THREE.SphereGeometry(1800);
    var material = new THREE.MeshPhongMaterial({
      side: THREE.BackSide,
    });
    return new THREE.Mesh(geometry, material);
  };

  var createPlaneForPostProcess = function() {
    var geometry_base = new THREE.PlaneGeometry(2, 2);
    var geometry = new THREE.BufferGeometry();
    geometry.fromGeometry(geometry_base);
    var material = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0,
        },
        resolution: {
          type: 'v2',
          value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        },
        acceleration: {
          type: 'f',
          value: 0
        },
        texture: {
          type: 't',
          value: render_target,
        },
      },
      vertexShader: "#define GLSLIFY 1\nvarying vec2 vUv;\n\nvoid main(void) {\n  vUv = uv;\n  gl_Position = vec4(position, 1.0);\n}\n",
      fragmentShader: "#define GLSLIFY 1\nuniform float time;\nuniform vec2 resolution;\nuniform float acceleration;\nuniform sampler2D texture;\n\nconst float blur = 16.0;\n\nvarying vec2 vUv;\n\nfloat random2_1_0(vec2 c){\n    return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\n\n//\n// Description : Array and textureless GLSL 2D simplex noise function.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_1(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289_2_1(vec2 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute_2_2(vec3 x) {\n  return mod289_2_1(((x*34.0)+1.0)*x);\n}\n\nfloat snoise_2_3(vec2 v)\n  {\n  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626,  // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i  = floor(v + dot(v, C.yy) );\n  vec2 x0 = v -   i + dot(i, C.xx);\n\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n// Permutations\n  i = mod289_2_1(i); // Avoid truncation effects in permutation\n  vec3 p = permute_2_2( permute_2_2( i.y + vec3(0.0, i1.y, 1.0 ))\n    + i.x + vec3(0.0, i1.x, 1.0 ));\n\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n// Normalise gradients implicitly by scaling m\n// Approximation of: m *= inversesqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n// Compute final noise value at P\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\n\n\n\nvec2 diffUv(float v, float diff) {\n  return vUv + (vec2(v + snoise_2_3(vec2(gl_FragCoord.y + time) / 100.0), 0.0) * diff + vec2(v * 3.0, 0.0)) / resolution;\n}\n\nfloat randomNoise(vec2 p) {\n  return (random2_1_0(p - vec2(sin(time))) * 2.0 - 1.0) * max(length(acceleration), 0.08);\n}\n\nvoid main() {\n  float diff = 300.0 * length(acceleration);\n  vec2 uv_r = diffUv(0.0, diff);\n  vec2 uv_g = diffUv(1.0, diff);\n  vec2 uv_b = diffUv(-1.0, diff);\n  float r = texture2D(texture, uv_r).r + randomNoise(uv_r);\n  float g = texture2D(texture, uv_g).g + randomNoise(uv_g);\n  float b = texture2D(texture, uv_b).b + randomNoise(uv_b);\n  gl_FragColor = vec4(r, g, b, 1.0);\n}\n",
    });
    return new THREE.Mesh(geometry, material);
  }

  Sketch.prototype = {
    init: function(scene, camera) {
      document.body.className = 'bg-white';
      sphere = createSphere();
      sub_scene.add(sphere);
      bg = createBackground();
      sub_scene.add(bg);
      sub_scene.add(sub_light);
      sub_camera.force.position.anchor.set(1800, 1800, 0);
      sub_camera.force.look.anchor.set(0, 0, 0);
      console.log(sphere.material.uniforms);

      framebuffer = createPlaneForPostProcess();
      scene.add(framebuffer);
      scene.add(light);
      camera.force.position.anchor.set(1800, 1800, 0);
      camera.force.look.anchor.set(0, 0, 0);
      force.anchor.set(1, 0);
      force.anchor.set(1, 0);
      force.velocity.set(1, 0);
      force.k = 0.045;
      force.d = 0.16;
    },
    remove: function(scene) {
      document.body.className = '';
      sphere.geometry.dispose();
      sphere.material.dispose();
      sub_scene.remove(sphere);
      bg.geometry.dispose();
      bg.material.dispose();
      sub_scene.remove(bg);
      sub_scene.remove(sub_light);
      framebuffer.geometry.dispose();
      framebuffer.material.dispose();
      scene.remove(framebuffer);
      scene.remove(light);
    },
    render: function(scene, camera, renderer) {
      force.applyHook(0, force.k);
      force.applyDrag(force.d);
      force.updateVelocity();
      // console.log(force.acceleration.length());
      sphere.material.uniforms.time.value += time_unit;
      sphere.material.uniforms.radius.value = force.velocity.x;
      sphere.material.uniforms.distort.value = force.velocity.x / 2 - 0.1;
      sub_camera.force.position.applyHook(0, 0.025);
      sub_camera.force.position.applyDrag(0.2);
      sub_camera.force.position.updateVelocity();
      sub_camera.updatePosition();
      sub_camera.force.look.applyHook(0, 0.2);
      sub_camera.force.look.applyDrag(0.4);
      sub_camera.force.look.updateVelocity();
      sub_camera.updateLook();

      framebuffer.material.uniforms.time.value += time_unit;
      framebuffer.material.uniforms.acceleration.value = force.acceleration.length();
      camera.force.position.applyHook(0, 0.025);
      camera.force.position.applyDrag(0.2);
      camera.force.position.updateVelocity();
      camera.updatePosition();
      camera.force.look.applyHook(0, 0.2);
      camera.force.look.applyDrag(0.4);
      camera.force.look.updateVelocity();
      camera.lookAt(camera.force.look.velocity);

      renderer.render(sub_scene, sub_camera, render_target);
    },
    touchStart: function(scene, camera, vector) {
      if (force.anchor.x < 3) {
        force.k += 0.005;
        force.d -= 0.02;
        force.anchor.x += 0.8;
        time_unit += 0.4;
      } else {
        force.k = 0.05;
        force.d = 0.16;
        force.anchor.x = 1.0;
        time_unit = 1;
      }
      is_touched = true;
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      is_touched = false;
    },
    mouseOut: function(scene, camera) {
      this.touchEnd(scene, camera)
    },
    resizeWindow: function(scene, camera) {
      render_target.setSize(window.innerWidth, window.innerHeight);
      sub_camera.resize(window.innerWidth, window.innerHeight);
      framebuffer.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/force2":3,"../modules/force_camera":5,"../modules/util":11}],16:[function(require,module,exports){
var Util = require('../modules/util');
var Mover = require('../modules/mover');
var Points = require('../modules/points.js');
var ForcePointLight = require('../modules/force_point_light');


var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };
  var movers_num = 10000;
  var movers = [];
  var points = new Points();
  var light = new ForcePointLight(0xff6600, 1, 1800, 1);
  var bg = null;
  var positions = new Float32Array(movers_num * 3);
  var colors = new Float32Array(movers_num * 3);
  var opacities = new Float32Array(movers_num);
  var sizes = new Float32Array(movers_num);
  var gravity = new THREE.Vector3(0, 0.1, 0);
  var last_time_activate = Date.now();
  var is_draged = false;

  var updateMover =  function() {
    for (var i = 0; i < movers.length; i++) {
      var mover = movers[i];
      if (mover.is_active) {
        mover.time++;
        mover.applyForce(gravity);
        mover.applyDrag(0.01);
        mover.updateVelocity();
        if (mover.time > 50) {
          mover.size -= 0.7;
          mover.a -= 0.009;
        }
        if (mover.a <= 0) {
          mover.init(new THREE.Vector3(0, 0, 0));
          mover.time = 0;
          mover.a = 0.0;
          mover.inactivate();
        }
      }
      positions[i * 3 + 0] = mover.velocity.x - points.velocity.x;
      positions[i * 3 + 1] = mover.velocity.y - points.velocity.y;
      positions[i * 3 + 2] = mover.velocity.z - points.velocity.z;
      opacities[i] = mover.a;
      sizes[i] = mover.size;
    }
    points.updatePoints();
  };

  var activateMover =  function() {
    var count = 0;
    var now = Date.now();
    if (now - last_time_activate > 10) {
      for (var i = 0; i < movers.length; i++) {
        var mover = movers[i];
        if (mover.is_active) continue;
        var rad1 = Util.getRadian(Math.log(Util.getRandomInt(0, 256)) / Math.log(256) * 260);
        var rad2 = Util.getRadian(Util.getRandomInt(0, 360));
        var range = (1- Math.log(Util.getRandomInt(32, 256)) / Math.log(256)) * 12;
        var vector = new THREE.Vector3();
        var force = Util.getPolarCoord(rad1, rad2, range);
        vector.add(points.velocity);
        mover.activate();
        mover.init(vector);
        mover.applyForce(force);
        mover.a = 0.2;
        mover.size = Math.pow(12 - range, 2) * Util.getRandomInt(1, 24) / 10;
        count++;
        if (count >= 6) break;
      }
      last_time_activate = Date.now();
    }
  };

  var updatePoints =  function() {
    points.updateVelocity();
    light.obj.position.copy(points.velocity);
  };

  var movePoints = function(vector) {
    var y = vector.y * window.innerHeight / 3;
    var z = vector.x * window.innerWidth / -3;
    points.anchor.y = y;
    points.anchor.z = z;
    light.force.anchor.y = y;
    light.force.anchor.z = z;
  }

  var createTexture =  function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var grad = null;
    var texture = null;

    canvas.width = 200;
    canvas.height = 200;
    grad = ctx.createRadialGradient(100, 100, 20, 100, 100, 100);
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.arc(100, 100, 100, 0, Math.PI / 180, true);
    ctx.fill();

    texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  };

  var createBackground =  function() {
    var geometry = new THREE.OctahedronGeometry(1500, 3);
    var material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shading: THREE.FlatShading,
      side: THREE.BackSide
    });
    return new THREE.Mesh(geometry, material);
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      for (var i = 0; i < movers_num; i++) {
        var mover = new Mover();
        var h = Util.getRandomInt(0, 45);
        var s = Util.getRandomInt(60, 90);
        var color = new THREE.Color('hsl(' + h + ', ' + s + '%, 50%)');

        mover.init(new THREE.Vector3(Util.getRandomInt(-100, 100), 0, 0));
        movers.push(mover);
        positions[i * 3 + 0] = mover.velocity.x;
        positions[i * 3 + 1] = mover.velocity.y;
        positions[i * 3 + 2] = mover.velocity.z;
        color.toArray(colors, i * 3);
        opacities[i] = mover.a;
        sizes[i] = mover.size;
      }
      points.init({
        scene: scene,
        vs: "#define GLSLIFY 1\nattribute vec3 customColor;\nattribute float vertexOpacity;\nattribute float size;\n\nvarying vec3 vColor;\nvarying float fOpacity;\n\nvoid main() {\n  vColor = customColor;\n  fOpacity = vertexOpacity;\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\n  gl_Position = projectionMatrix * mvPosition;\n}\n",
        fs: "#define GLSLIFY 1\nuniform vec3 color;\nuniform sampler2D texture;\n\nvarying vec3 vColor;\nvarying float fOpacity;\n\nvoid main() {\n  gl_FragColor = vec4(color * vColor, fOpacity);\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\n}\n",
        positions: positions,
        colors: colors,
        opacities: opacities,
        sizes: sizes,
        texture: createTexture(),
        blending: THREE.AdditiveBlending
      });
      scene.add(light);
      bg = createBackground();
      scene.add(bg);
      camera.setPolarCoord(Util.getRadian(25), 0, 1000);
      light.setPolarCoord(Util.getRadian(25), 0, 200);
    },
    remove: function(scene) {
      points.geometry.dispose();
      points.material.dispose();
      scene.remove(points.obj);
      scene.remove(light);
      bg.geometry.dispose();
      bg.material.dispose();
      scene.remove(bg);
      movers = [];
    },
    render: function(scene, camera) {
      points.applyHook(0, 0.08);
      points.applyDrag(0.2);
      points.updateVelocity();
      light.force.applyHook(0, 0.08);
      light.force.applyDrag(0.2);
      light.force.updateVelocity();
      light.updatePosition();
      activateMover();
      updateMover();
      camera.force.position.applyHook(0, 0.004);
      camera.force.position.applyDrag(0.1);
      camera.force.position.updateVelocity();
      camera.updatePosition();
      camera.lookAtCenter();
    },
    touchStart: function(scene, camera, vector) {
      movePoints(vector);
      is_draged = true;
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      if (is_draged) {
        movePoints(vector_mouse_move);
      }
    },
    touchEnd: function(scene, camera, vector) {
      is_draged = false;
      points.anchor.set(0, 0, 0);
      light.force.anchor.set(0, 0, 0);
    },
    mouseOut: function(scene, camera) {
      this.touchEnd(scene, camera)
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/force_point_light":7,"../modules/mover":8,"../modules/points.js":10,"../modules/util":11}],17:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');
var ForceHemisphereLight = require('../modules/force_hemisphere_light');

var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };
  var images = [];
  var images_num = 300;
  var light = null;
  var raycaster = new THREE.Raycaster();
  var picked_id = -1;
  var picked_index = -1;
  var is_clicked = false;
  var is_draged = false;
  var get_near = false;

  var Image = function() {
    this.rad = 0;
    this.obj = null;
    this.is_entered = false;
    Force3.call(this);
  };
  var image_geometry = new THREE.PlaneGeometry(100, 100);
  Image.prototype = Object.create(Force3.prototype);
  Image.prototype.constructor = Image;
  Image.prototype.init = function(vector) {
    var image_material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load('img/gallery/image0' + Util.getRandomInt(1, 9) + '.jpg')
    });

    this.obj = new THREE.Mesh(image_geometry, image_material);
    this.velocity = vector.clone();
    this.anchor = vector.clone();
    this.acceleration.set(0, 0, 0);
  };

  var initImages = function(scene) {
    for (var i = 0; i < images_num; i++) {
      var image = null;
      var rad = Util.getRadian(i % 45 * 8 + 180);
      var radius = 1000;
      var x = Math.cos(rad) * radius;
      var y = i * 5 - images_num * 2.5;
      var z = Math.sin(rad) * radius;
      var vector = new THREE.Vector3(x, y, z);
      image = new Image();
      image.init(new THREE.Vector3());
      image.rad = rad;
      image.obj.position.copy(vector);
      scene.add(image.obj);
      images.push(image);
    }
  };

  var pickImage = function(scene, camera, vector) {
    if (get_near) return;
    var intersects = null;
    raycaster.setFromCamera(vector, camera);
    intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0 && is_draged == false) {
      document.body.classList.add('is-pointed');
      picked_id = intersects[0].object.id;
    } else {
      resetPickImage();
    }
  };

  var getNearImage = function(camera, image) {
    get_near = true;
    camera.force.position.anchor.set(Math.cos(image.rad) * 780, image.obj.position.y, Math.sin(image.rad) * 780);
    camera.force.look.anchor.copy(image.obj.position);
    resetPickImage();
  };

  var resetPickImage = function() {
    document.body.classList.remove('is-pointed');
    picked_id = -1;
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      initImages(scene);
      light = new ForceHemisphereLight(0xffffff, 0xffffff, 1);
      scene.add(light);
      camera.force.position.anchor.set(0, 0, 0);
      camera.rotate_rad1 = Util.getRadian(-35);
      camera.rotate_rad1_base = camera.rotate_rad1;
      camera.rotate_rad2 = Util.getRadian(180);
      camera.rotate_rad2_base = camera.rotate_rad2;
    },
    remove: function(scene) {
      image_geometry.dispose();
      for (var i = 0; i < images.length; i++) {
        scene.remove(images[i].obj);
      };
      scene.remove(light);
      images = [];
      get_near = false;
      document.body.classList.remove('is-pointed');
    },
    render: function(scene, camera) {
      for (var i = 0; i < images_num; i++) {
        images[i].applyHook(0, 0.14);
        images[i].applyDrag(0.4);
        images[i].updateVelocity();
        images[i].obj.lookAt({
          x: 0,
          y: images[i].obj.position.y,
          z: 0
        });
        if (images[i].obj.id == picked_id && is_draged == false && get_near == false) {
          if (is_clicked == true) {
            picked_index = i;
          } else {
            images[i].obj.material.color.set(0xaaaaaa);
          }
        } else {
          images[i].obj.material.color.set(0xffffff);
        }
      }
      camera.force.position.applyHook(0, 0.08);
      camera.force.position.applyDrag(0.4);
      camera.force.position.updateVelocity();
      camera.updatePosition();
      if (get_near === false) {
        camera.force.look.anchor.copy(Util.getPolarCoord(camera.rotate_rad1, camera.rotate_rad2, 1000));
      }
      camera.force.look.applyHook(0, 0.08);
      camera.force.look.applyDrag(0.4);
      camera.force.look.updateVelocity();
      camera.updateLook();
    },
    touchStart: function(scene, camera, vector) {
      pickImage(scene, camera, vector);
      is_clicked = true;
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      pickImage(scene, camera, vector_mouse_move);
      if (is_clicked && vector_mouse_down.clone().sub(vector_mouse_move).length() > 0.01) {
        is_clicked = false;
        is_draged = true;
      }
      if (is_draged == true && get_near == false) {
        camera.rotate_rad1 = camera.rotate_rad1_base + Util.getRadian((vector_mouse_down.y - vector_mouse_move.y) * 50);
        camera.rotate_rad2 = camera.rotate_rad2_base + Util.getRadian((vector_mouse_down.x - vector_mouse_move.x) * 50);
        if (camera.rotate_rad1 < Util.getRadian(-50)) {
          camera.rotate_rad1 = Util.getRadian(-50);
        }
        if (camera.rotate_rad1 > Util.getRadian(50)) {
          camera.rotate_rad1 = Util.getRadian(50);
        }
      }
    },
    touchEnd: function(scene, camera, vector) {
      resetPickImage();
      if (get_near) {
        camera.force.position.anchor.set(0, 0, 0);
        picked_index = -1;
        get_near = false;
      } else if (is_clicked && picked_index > -1) {
        getNearImage(camera, images[picked_index]);
      } else if (is_draged) {
        camera.rotate_rad1_base = camera.rotate_rad1;
        camera.rotate_rad2_base = camera.rotate_rad2;
      }
      is_clicked = false;
      is_draged = false;
    },
    mouseOut: function(scene, camera, vector) {
      this.touchEnd(scene, camera, vector)
    }
  };
  return Sketch;
};

module.exports = exports();

},{"../modules/force3":4,"../modules/force_hemisphere_light":6,"../modules/util":11}],18:[function(require,module,exports){
var Util = require('../modules/util');

var ForceCamera = require('../modules/force_camera');
var Force2 = require('../modules/force2');

var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };

  var points = null;
  var bg = null;
  var bg_wf = null;
  var obj = null;
  var light = new THREE.DirectionalLight(0xffffff, 1);

  var sub_scene = new THREE.Scene();
  var sub_camera = new ForceCamera(45, 1, 1, 10000);
  var render_target = new THREE.WebGLRenderTarget(1200, 1200);
  var framebuffer = null;

  var sub_scene2 = new THREE.Scene();
  var sub_camera2 = new ForceCamera(45, 1, 1, 10000);
  var sub_light = new THREE.HemisphereLight(0xfffffff, 0xcccccc, 1);
  var render_target2 = new THREE.WebGLRenderTarget(1200, 1200);
  var bg_fb = null;
  var points_fb = null;

  var force = new Force2();

  var createPointsForCrossFade = function() {
    var geometry = new THREE.BufferGeometry();
    var vertices_base = [];
    var radians_base = [];
    for (let i = 0; i < 32; i ++) {
      var x = 0;
      var y = 0;
      var z = 0;
      vertices_base.push(x, y, z);
      var r1 = Util.getRadian(Util.getRandomInt(0, 360));
      var r2 = Util.getRadian(Util.getRandomInt(0, 360));
      var r3 = Util.getRadian(Util.getRandomInt(0, 360));
      radians_base.push(r1, r2, r3);
    }
    var vertices = new Float32Array(vertices_base);
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    var radians = new Float32Array(radians_base);
    geometry.addAttribute('radian', new THREE.BufferAttribute(radians, 3));
    var material = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0.0
        },
        resolution: {
          type: 'v2',
          value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        },
        size: {
          type: 'f',
          value: 28.0
        },
        force: {
          type: 'v2',
          value: force.velocity,
        },
      },
      vertexShader: "#define GLSLIFY 1\nattribute vec3 radian;\n\nuniform float time;\nuniform vec2 resolution;\nuniform float size;\nuniform vec2 force;\n\nvoid main() {\n  float radius = 300.0;\n  float radian_base = radians(time * 2.0);\n  vec3 update_positon = position + vec3(\n    cos(radian_base + radian.x) * cos(radian_base + radian.y) * radius,\n    cos(radian_base + radian.x) * sin(radian_base + radian.y) * radius,\n    sin(radian_base + radian.x) * radius\n  ) * force.x;\n  vec4 mvPosition = modelViewMatrix * vec4(update_positon, 1.0);\n\n  gl_PointSize = (size + force.y) * (abs(sin(radian_base + radian.z))) * (size / length(mvPosition.xyz)) * 480.0;\n  gl_Position = projectionMatrix * mvPosition;\n}\n",
      fragmentShader: "#define GLSLIFY 1\nuniform float size;\n\nvoid main() {\n  vec3 n;\n  n.xy = gl_PointCoord.xy * 2.0 - 1.0;\n  n.z = 1.0 - dot(n.xy, n.xy);\n  if (n.z < 0.0) discard;\n  gl_FragColor = vec4(1.0);\n}\n",
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    return new THREE.Points(geometry, material);
  };

  var createObject = function() {
    var geometry_base = new THREE.SphereBufferGeometry(2, 4, 4);
    var attr = geometry_base.attributes;
    var geometry = new THREE.BufferGeometry();
    var vertices_base = [];
    var radiuses_base = [];
    var radians_base = [];
    var scales_base = [];
    var indices_base = [];
    for (let i = 0; i < 16; i ++) {
      var radius = Util.getRandomInt(300, 1000);
      var radian = Util.getRadian(Util.getRandomInt(0, 3600) / 10);
      var scale = Util.getRandomInt(60, 120) / 100;
      for (var j = 0; j < attr.position.array.length; j += 3) {
        vertices_base.push(
          attr.position.array[j + 0],
          attr.position.array[j + 1],
          attr.position.array[j + 2]
        );
        radiuses_base.push(radius);
        radians_base.push(radian);
        scales_base.push(scale);
      }
      geometry_base.index.array.map((item) => {
        indices_base.push(item + i * attr.position.array.length / 3)
      });
    }
    var vertices = new Float32Array(vertices_base);
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    var radius = new Float32Array(radiuses_base);
    geometry.addAttribute('radius', new THREE.BufferAttribute(radius, 1));
    var radians = new Float32Array(radians_base);
    geometry.addAttribute('radian', new THREE.BufferAttribute(radians, 1));
    var scales = new Float32Array(scales_base);
    geometry.addAttribute('scale', new THREE.BufferAttribute(scales, 1));
    var indices = new Uint32Array(indices_base);
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    var material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib['lights'],
        {
          time: {
            type: 'f',
            value: 0,
          },
        }
      ]),
      vertexShader: "#define GLSLIFY 1\nattribute float radius;\nattribute float radian;\nattribute float scale;\n\nuniform float time;\n\nvarying vec3 vPosition;\nvarying mat4 vInvertMatrix;\n\nfloat inverse_8_0(float m) {\n  return 1.0 / m;\n}\n\nmat2 inverse_8_0(mat2 m) {\n  return mat2(m[1][1],-m[0][1],\n             -m[1][0], m[0][0]) / (m[0][0]*m[1][1] - m[0][1]*m[1][0]);\n}\n\nmat3 inverse_8_0(mat3 m) {\n  float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];\n  float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];\n  float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];\n\n  float b01 = a22 * a11 - a12 * a21;\n  float b11 = -a22 * a10 + a12 * a20;\n  float b21 = a21 * a10 - a11 * a20;\n\n  float det = a00 * b01 + a01 * b11 + a02 * b21;\n\n  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),\n              b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),\n              b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;\n}\n\nmat4 inverse_8_0(mat4 m) {\n  float\n      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],\n      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],\n      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],\n      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],\n\n      b00 = a00 * a11 - a01 * a10,\n      b01 = a00 * a12 - a02 * a10,\n      b02 = a00 * a13 - a03 * a10,\n      b03 = a01 * a12 - a02 * a11,\n      b04 = a01 * a13 - a03 * a11,\n      b05 = a02 * a13 - a03 * a12,\n      b06 = a20 * a31 - a21 * a30,\n      b07 = a20 * a32 - a22 * a30,\n      b08 = a20 * a33 - a23 * a30,\n      b09 = a21 * a32 - a22 * a31,\n      b10 = a21 * a33 - a23 * a31,\n      b11 = a22 * a33 - a23 * a32,\n\n      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n\n  return mat4(\n      a11 * b11 - a12 * b10 + a13 * b09,\n      a02 * b10 - a01 * b11 - a03 * b09,\n      a31 * b05 - a32 * b04 + a33 * b03,\n      a22 * b04 - a21 * b05 - a23 * b03,\n      a12 * b08 - a10 * b11 - a13 * b07,\n      a00 * b11 - a02 * b08 + a03 * b07,\n      a32 * b02 - a30 * b05 - a33 * b01,\n      a20 * b05 - a22 * b02 + a23 * b01,\n      a10 * b10 - a11 * b08 + a13 * b06,\n      a01 * b08 - a00 * b10 - a03 * b06,\n      a30 * b04 - a31 * b02 + a33 * b00,\n      a21 * b02 - a20 * b04 - a23 * b00,\n      a11 * b07 - a10 * b09 - a12 * b06,\n      a00 * b09 - a01 * b07 + a02 * b06,\n      a31 * b01 - a30 * b03 - a32 * b00,\n      a20 * b03 - a21 * b01 + a22 * b00) / det;\n}\n\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_7_1(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_7_1(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_7_2(vec4 x) {\n     return mod289_7_1(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_7_3(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_7_4(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_7_5 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_7_6 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_7_6;\n  vec3 i1 = min( g_7_6.xyz, l.zxy );\n  vec3 i2 = max( g_7_6.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_7_5.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_7_1(i);\n  vec4 p = permute_7_2( permute_7_2( permute_7_2(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_7_5.wyz - D_7_5.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_7_7 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_7_8 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_7_7.xy,h.z);\n  vec3 p3 = vec3(a1_7_7.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_7_3(vec4(dot(p0_7_8,p0_7_8), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_7_8 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_7_8,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nmat4 translateMatrix_1_9(vec3 v) {\n  return mat4(\n    1.0, 0.0, 0.0, 0.0,\n    0.0, 1.0, 0.0, 0.0,\n    0.0, 0.0, 1.0, 0.0,\n    v.x, v.y, v.z, 1.0\n  );\n}\n\n\nmat4 rotationMatrixX_4_10(float radian) {\n  return mat4(\n    1.0, 0.0, 0.0, 0.0,\n    0.0, cos(radian), -sin(radian), 0.0,\n    0.0, sin(radian), cos(radian), 0.0,\n    0.0, 0.0, 0.0, 1.0\n  );\n}\n\n\nmat4 rotationMatrixY_5_11(float radian) {\n  return mat4(\n    cos(radian), 0.0, sin(radian), 0.0,\n    0.0, 1.0, 0.0, 0.0,\n    -sin(radian), 0.0, cos(radian), 0.0,\n    0.0, 0.0, 0.0, 1.0\n  );\n}\n\n\nmat4 rotationMatrixZ_6_12(float radian) {\n  return mat4(\n    cos(radian), -sin(radian), 0.0, 0.0,\n    sin(radian), cos(radian), 0.0, 0.0,\n    0.0, 0.0, 1.0, 0.0,\n    0.0, 0.0, 0.0, 1.0\n  );\n}\n\n\n\nmat4 rotationMatrix_2_13(float radian_x, float radian_y, float radian_z) {\n  return rotationMatrixX_4_10(radian_x) * rotationMatrixY_5_11(radian_y) * rotationMatrixZ_6_12(radian_z);\n}\n\n\nmat4 scaleMatrix_3_14(vec3 scale) {\n  return mat4(\n    scale.x, 0.0, 0.0, 0.0,\n    0.0, scale.y, 0.0, 0.0,\n    0.0, 0.0, scale.z, 0.0,\n    0.0, 0.0, 0.0, 1.0\n  );\n}\n\n\n\nvec4 move(vec3 position) {\n  return translateMatrix_1_9(\n    vec3(\n      cos(radians(time * 0.5) + radian) * radius,\n      sin(radians(time * 0.5) + radian * 10.0) * radius * 0.3,\n      sin(radians(time * 0.5) + radian) * radius\n    )\n  ) * rotationMatrix_2_13(\n    radians(time * radian) + radian, radians(time) + radian, radians(time) + radian\n  ) * scaleMatrix_3_14(\n    vec3(20.0 * scale) + vec3(10.0) * snoise_7_4((position + sin(radian)))\n  ) * vec4(position, 1.0);\n}\n\nvoid main() {\n  vec4 update_position = move(position);\n  vPosition = position;\n  vInvertMatrix = inverse_8_0(rotationMatrix_2_13(\n    radians(time * radian) + radian, radians(time) + radian, radians(time) + radian\n  ));\n  gl_Position = projectionMatrix * modelViewMatrix * update_position;\n}\n",
      fragmentShader: "#define GLSLIFY 1\nstruct DirectionalLight {\n  vec3 color;\n  vec3 direction;\n};\nuniform DirectionalLight directionalLights[1];\n\nvarying vec3 vPosition;\nvarying mat4 vInvertMatrix;\n\nvoid main() {\n  vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));\n  vec3 inv_light = normalize(vInvertMatrix * vec4(directionalLights[0].direction, 1.0)).xyz;\n  float diff = (dot(normal, inv_light) + 1.0) / 2.0 * 0.25 + 0.75;\n  gl_FragColor = vec4(vec3(1.0) * diff, 1.0);\n}\n",
      shading: THREE.FlatShading,
      lights: true,
    });
    return new THREE.Mesh(geometry, material);
  };

  var createBackground = function() {
    var geometry = new THREE.SphereGeometry(1200, 64, 64);
    var material = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0,
        },
      },
      vertexShader: "#define GLSLIFY 1\nuniform float time;\n\nvarying vec3 vColor;\n\nvoid main() {\n  vColor = vec3((position.y / 1000.0 + 1.0) * 0.12 + 0.88);\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}\n",
      fragmentShader: "#define GLSLIFY 1\nvarying vec3 vColor;\n\nvoid main() {\n  gl_FragColor = vec4(vColor, 1.0);\n}\n",
      side: THREE.BackSide,
    });
    return new THREE.Mesh(geometry, material);
  };

  var createBackgroundWire = function() {
    var geometry = new THREE.SphereGeometry(1100, 64, 64);
    var material = new THREE.MeshBasicMaterial({
      color: 0xdddddd,
      wireframe: true
    });
    return new THREE.Mesh(geometry, material);
  };

  var createPointsInFramebuffer = function() {
    var geometry = new THREE.BufferGeometry();
    var vertices_base = [];
    for (var i = 0; i < 2000; i++) {
      vertices_base.push(
        Util.getRadian(Util.getRandomInt(0, 120) + 120),
        Util.getRadian(Util.getRandomInt(0, 3600) / 10),
        Util.getRandomInt(200, 1000)
      );
    }
    var vertices = new Float32Array(vertices_base);
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    var material = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0,
        },
      },
      vertexShader: "#define GLSLIFY 1\nuniform float time;\n\nvec3 getPolarCoord(float rad1, float rad2, float r) {\n  return vec3(\n    cos(rad1) * cos(rad2) * r,\n    sin(rad1) * r,\n    cos(rad1) * sin(rad2) * r\n  );\n}\n\nvoid main() {\n  vec3 update_position = getPolarCoord(\n    position.x,\n    position.y + radians(time / 2.0),\n    position.z + sin(radians(time * 2.0) + position.x + position.y) * position.z / 4.0\n  );\n  vec4 mv_position = modelViewMatrix * vec4(update_position, 1.0);\n\n  gl_PointSize = 2.0 * (1000.0 / length(mv_position.xyz));\n  gl_Position = projectionMatrix * mv_position;\n}\n",
      fragmentShader: "#define GLSLIFY 1\nvoid main() {\n  vec3 n;\n  n.xy = gl_PointCoord.xy * 2.0 - 1.0;\n  n.z = 1.0 - dot(n.xy, n.xy);\n  if (n.z < 0.0) discard;\n  gl_FragColor = vec4(1.0);\n}\n",
    });
    return new THREE.Points(geometry, material);
  };

  var createBackgroundInFramebuffer = function() {
    var geometry_base = new THREE.SphereGeometry(1000, 128, 128);
    var geometry = new THREE.BufferGeometry();
    geometry.fromGeometry(geometry_base);
    var material = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0,
        },
      },
      vertexShader: "#define GLSLIFY 1\nuniform float time;\n\nvarying vec3 vColor;\n\nvec3 hsv2rgb_1_0(vec3 c){\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_1(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2_1(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2_2(vec4 x) {\n     return mod289_2_1(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_2_3(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2_4(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_2_5 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_2_6 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_2_6;\n  vec3 i1 = min( g_2_6.xyz, l.zxy );\n  vec3 i2 = max( g_2_6.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_2_5.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2_1(i);\n  vec4 p = permute_2_2( permute_2_2( permute_2_2(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_2_5.wyz - D_2_5.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_2_7 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_2_8 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_2_7.xy,h.z);\n  vec3 p3 = vec3(a1_2_7.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_2_3(vec4(dot(p0_2_8,p0_2_8), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_2_8 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_2_8,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\n\nvoid main() {\n  float noise = snoise_2_4(\n    vec3(position.x + time * 10.0, position.y + cos(time / 20.0) * 100.0, position.z + time * 10.0) / 800.0\n  );\n  vColor = hsv2rgb_1_0(vec3(noise * 0.2 + 0.75, 0.4, noise * 0.3 + 0.5));\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}\n",
      fragmentShader: "#define GLSLIFY 1\nvarying vec3 vColor;\n\nvoid main() {\n  gl_FragColor = vec4(vColor, 1.0);\n}\n",
      side: THREE.BackSide,
    });
    return new THREE.Mesh(geometry, material);
  };

  var createPlaneForFramebuffer = function() {
    var geometry_base = new THREE.PlaneGeometry(1000, 1000);
    var geometry = new THREE.BufferGeometry();
    geometry.fromGeometry(geometry_base);
    var material = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0,
        },
        resolution: {
          type: 'v2',
          value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        },
        texture: {
          type: 't',
          value: render_target,
        },
        texture2: {
          type: 't',
          value: render_target2,
        },
      },
      vertexShader: "#define GLSLIFY 1\nvarying vec2 vUv;\n\nvoid main(void) {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}\n",
      fragmentShader: "#define GLSLIFY 1\nuniform float time;\nuniform vec2 resolution;\nuniform sampler2D texture;\nuniform sampler2D texture2;\n\nconst float blur = 20.0;\n\nvarying vec2 vUv;\n\nvoid main() {\n  vec4 color = vec4(0.0);\n  for (float x = 0.0; x < blur; x++){\n    for (float y = 0.0; y < blur; y++){\n      color += texture2D(texture, vUv - (vec2(x, y) - vec2(blur / 2.0)) / resolution);\n    }\n  }\n  vec4 color2 = color / pow(blur, 2.0);\n  vec4 color3 = texture2D(texture2, vUv);\n  gl_FragColor = vec4(color3.rgb, floor(length(color2.rgb)));\n}\n",
      transparent: true
    });
    return new THREE.Mesh(geometry, material);
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      document.body.className = 'bg-white';
      force.anchor.set(1, 0);

      sub_camera2.force.position.anchor.set(1000, 300, 0);
      sub_camera2.force.look.anchor.set(0, 0, 0);
      bg_fb = createBackgroundInFramebuffer();
      points_fb = createPointsInFramebuffer();
      sub_scene2.add(bg_fb);
      sub_scene2.add(points_fb);
      sub_scene2.add(sub_light);

      points = createPointsForCrossFade();
      sub_scene.add(points);
      sub_camera.position.set(0, 0, 3000);
      sub_camera.lookAt(0, 0, 0);

      framebuffer = createPlaneForFramebuffer();
      scene.add(framebuffer);
      bg = createBackground();
      scene.add(bg);
      bg_wf = createBackgroundWire();
      scene.add(bg_wf);
      obj = createObject();
      scene.add(obj);
      light.position.set(0, 1, 0)
      scene.add(light);
      camera.force.position.anchor.set(1000, 300, 0);
      camera.force.look.anchor.set(0, 0, 0);
    },
    remove: function(scene) {
      document.body.className = '';
      bg_fb.geometry.dispose();
      bg_fb.material.dispose();
      sub_scene2.remove(bg_fb);
      points_fb.geometry.dispose();
      points_fb.material.dispose();
      sub_scene2.remove(points_fb);
      sub_scene2.remove(sub_light);

      points.geometry.dispose();
      points.material.dispose();
      sub_scene.remove(points);

      framebuffer.geometry.dispose();
      framebuffer.material.dispose();
      scene.remove(framebuffer);
      bg.geometry.dispose();
      bg.material.dispose();
      scene.remove(bg);
      bg_wf.geometry.dispose();
      bg_wf.material.dispose();
      scene.remove(bg_wf);
      obj.geometry.dispose();
      obj.material.dispose();
      scene.remove(obj);
      scene.remove(light);
    },
    render: function(scene, camera, renderer) {
      points.material.uniforms.time.value++;
      framebuffer.lookAt(camera.position);
      framebuffer.material.uniforms.time.value++;

      bg_fb.material.uniforms.time.value++;
      points_fb.material.uniforms.time.value++;

      bg_wf.rotation.y = points.material.uniforms.time.value / 1000;
      obj.material.uniforms.time.value++;

      force.applyHook(0, 0.12);
      force.applyDrag(0.18);
      force.updateVelocity();
      camera.force.position.applyHook(0, 0.025);
      camera.force.position.applyDrag(0.2);
      camera.force.position.updateVelocity();
      camera.updatePosition();
      camera.force.look.anchor.y = Math.sin(points.material.uniforms.time.value / 100) * 100;
      camera.force.look.applyHook(0, 0.2);
      camera.force.look.applyDrag(0.4);
      camera.updateLook();
      sub_camera2.force.position.applyHook(0, 0.1);
      sub_camera2.force.position.applyDrag(0.2);
      sub_camera2.force.position.updateVelocity();
      sub_camera2.updatePosition();
      sub_camera2.force.look.applyHook(0, 0.2);
      sub_camera2.force.look.applyDrag(0.4);
      sub_camera2.force.look.updateVelocity();
      sub_camera2.updateLook();
      renderer.render(sub_scene2, sub_camera2, render_target2);
      renderer.render(sub_scene, sub_camera, render_target);
    },
    touchStart: function(scene, camera, vector) {
      force.anchor.set(2, 30);
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      force.anchor.set(1, 0);
    },
    mouseOut: function(scene, camera) {
      force.anchor.set(1, 0);
    },
    resizeWindow: function(scene, camera) {
      points.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
      framebuffer.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/force2":3,"../modules/force_camera":5,"../modules/util":11}],19:[function(require,module,exports){
var Util = require('../modules/util');
var Mover = require('../modules/mover');
var Points = require('../modules/points.js');


var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };
  var movers_num = 20000;
  var movers = [];
  var points = new Points();
  var positions = new Float32Array(movers_num * 3);
  var colors = new Float32Array(movers_num * 3);
  var opacities = new Float32Array(movers_num);
  var sizes = new Float32Array(movers_num);
  var gravity = new THREE.Vector3(1.5, 0, 0);
  var last_time_activate = Date.now();
  var is_touched = false;

  var updateMover = function() {
    for (var i = 0; i < movers.length; i++) {
      var mover = movers[i];
      if (mover.is_active) {
        mover.time++;
        mover.applyForce(gravity);
        mover.applyDrag(0.1);
        mover.updateVelocity();
        if (mover.a < 0.8) {
          mover.a += 0.02;
        }
        if (mover.velocity.x > 1000) {
          mover.init(new THREE.Vector3(0, 0, 0));
          mover.time = 0;
          mover.a = 0.0;
          mover.inactivate();
        }
      }
      positions[i * 3 + 0] = mover.velocity.x;
      positions[i * 3 + 1] = mover.velocity.y;
      positions[i * 3 + 2] = mover.velocity.z;
      opacities[i] = mover.a;
      sizes[i] = mover.size;
    }
    points.updatePoints();
  };

  var activateMover = function() {
    var count = 0;
    var now = Date.now();
    if (now - last_time_activate > gravity.x * 16) {
      for (var i = 0; i < movers.length; i++) {
        var mover = movers[i];
        if (mover.is_active) continue;
        var rad = Util.getRadian(Util.getRandomInt(0, 120) * 3);
        var range = Math.log(Util.getRandomInt(2, 128)) / Math.log(128) * 160 + 60;
        var y = Math.sin(rad) * range;
        var z = Math.cos(rad) * range;
        var vector = new THREE.Vector3(-1000, y, z);
        vector.add(points.velocity);
        mover.activate();
        mover.init(vector);
        mover.a = 0;
        mover.size = Util.getRandomInt(5, 60);
        count++;
        if (count >= Math.pow(gravity.x * 3, gravity.x * 0.4)) break;
      }
      last_time_activate = Date.now();
    }
  };

  var updatePoints = function() {
    points.updateVelocity();
  };

  var createTexture = function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var grad = null;
    var texture = null;

    canvas.width = 256;
    canvas.height = 256;
    grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.arc(128, 128, 128, 0, Math.PI / 180, true);
    ctx.fill();

    texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  var changeGravity = function() {
    if (is_touched) {
      if (gravity.x < 6) gravity.x += 0.02;
    } else {
      if (gravity.x > 1.5) gravity.x -= 0.1;
    }
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      for (var i = 0; i < movers_num; i++) {
        var mover = new Mover();
        var h = Util.getRandomInt(60, 210);
        var s = Util.getRandomInt(30, 90);
        var color = new THREE.Color('hsl(' + h + ', ' + s + '%, 50%)');

        mover.init(new THREE.Vector3(Util.getRandomInt(-100, 100), 0, 0));
        movers.push(mover);
        positions[i * 3 + 0] = mover.velocity.x;
        positions[i * 3 + 1] = mover.velocity.y;
        positions[i * 3 + 2] = mover.velocity.z;
        color.toArray(colors, i * 3);
        opacities[i] = mover.a;
        sizes[i] = mover.size;
      }
      points.init({
        scene: scene,
        vs: "#define GLSLIFY 1\nattribute vec3 customColor;\nattribute float vertexOpacity;\nattribute float size;\n\nvarying vec3 vColor;\nvarying float fOpacity;\n\nvoid main() {\n  vColor = customColor;\n  fOpacity = vertexOpacity;\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\n  gl_Position = projectionMatrix * mvPosition;\n}\n",
        fs: "#define GLSLIFY 1\nuniform vec3 color;\nuniform sampler2D texture;\n\nvarying vec3 vColor;\nvarying float fOpacity;\n\nvoid main() {\n  gl_FragColor = vec4(color * vColor, fOpacity);\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\n}\n",
        positions: positions,
        colors: colors,
        opacities: opacities,
        sizes: sizes,
        texture: createTexture(),
        blending: THREE.AdditiveBlending
      });
      camera.force.position.anchor.set(800, 0, 0);
    },
    remove: function(scene) {
      points.geometry.dispose();
      points.material.dispose();
      scene.remove(points.obj);
      movers = [];
    },
    render: function(scene, camera) {
      changeGravity();
      activateMover();
      updateMover();
      camera.force.position.applyHook(0, 0.008);
      camera.force.position.applyDrag(0.1);
      camera.force.position.updateVelocity();
      camera.updatePosition();
      camera.lookAtCenter();
    },
    touchStart: function(scene, camera, vector) {
      is_touched = true;
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      camera.force.position.anchor.z = vector_mouse_move.x * 120;
      camera.force.position.anchor.y = vector_mouse_move.y * -120;
      //camera.lookAtCenter();
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      camera.force.position.anchor.z = 0;
      camera.force.position.anchor.y = 0;
      is_touched = false;
    },
    mouseOut: function(scene, camera) {
      this.touchEnd(scene, camera)
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/mover":8,"../modules/points.js":10,"../modules/util":11}],20:[function(require,module,exports){
var Util = require('../modules/util');
var Mover = require('../modules/mover');

var Points = require('../modules/points.js');

var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };
  var image = new Image();
  var image_vertices = [];
  var movers = [];
  var positions = null;
  var colors = null;
  var opacities = null;
  var sizes = null;
  var length_side = 400;
  var points = new Points();
  var created_points = false;

  var loadImage = function(callback) {
    image.src = './img/image_data/elephant.png';
    image.onload = function() {
      callback();
    };
  };

  var getImageData = function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = length_side;
    canvas.height = length_side;
    ctx.drawImage(image, 0, 0);
    var image_data = ctx.getImageData(0, 0, length_side, length_side);
    for (var y = 0; y < length_side; y++) {
      if (y % 3 > 0) continue;
      for (var x = 0; x < length_side; x++) {
        if (x % 3 > 0) continue;
        if(image_data.data[(x + y * length_side) * 4] > 0) {
          image_vertices.push(0, (y - length_side / 2) * -1, (x - length_side/ 2) * -1);
        }
      }
    }
  };

  var buildPoints = function(scene) {
    positions = new Float32Array(image_vertices);
    colors = new Float32Array(image_vertices.length);
    opacities = new Float32Array(image_vertices.length / 3);
    sizes = new Float32Array(image_vertices.length / 3);
    for (var i = 0; i < image_vertices.length / 3; i++) {
      var mover = new Mover();
      var color = new THREE.Color(
                                  'hsl(' + (image_vertices[i * 3 + 2] + image_vertices[i * 3 + 1] + length_side) / 5
                                  + ', 60%, 80%)');
      mover.init(new THREE.Vector3(image_vertices[i * 3], image_vertices[i * 3 + 1], image_vertices[i * 3 + 2]));
      mover.is_activate = true;
      movers.push(mover);
      color.toArray(colors, i * 3);
      opacities[i] = 1;
      sizes[i] = 12;
    }
    points.init({
      scene: scene,
      vs: "#define GLSLIFY 1\nattribute vec3 customColor;\nattribute float vertexOpacity;\nattribute float size;\n\nvarying vec3 vColor;\nvarying float fOpacity;\n\nvoid main() {\n  vColor = customColor;\n  fOpacity = vertexOpacity;\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\n  gl_Position = projectionMatrix * mvPosition;\n}\n",
      fs: "#define GLSLIFY 1\nuniform vec3 color;\nuniform sampler2D texture;\n\nvarying vec3 vColor;\nvarying float fOpacity;\n\nvoid main() {\n  gl_FragColor = vec4(color * vColor, fOpacity);\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\n}\n",
      positions: positions,
      colors: colors,
      opacities: opacities,
      sizes: sizes,
      texture: createTexture(),
      blending: THREE.NormalBlending
    });
    created_points = true;
  };

  var applyForceToPoints = function() {
    for (var i = 0; i < movers.length; i++) {
      var mover = movers[i];
      var rad1 = Util.getRadian(Util.getRandomInt(0, 360));
      var rad2 = Util.getRadian(Util.getRandomInt(0, 360));
      var scalar = Util.getRandomInt(40, 80);
      mover.is_activate = false;
      mover.applyForce(Util.getPolarCoord(rad1, rad2, scalar));
    }
  };

  var updateMover =  function() {
    for (var i = 0; i < movers.length; i++) {
      var mover = movers[i];
      mover.time++;
      if (mover.acceleration.length() < 1) {
        mover.is_activate = true;
      }
      if (mover.is_activate) {
        mover.applyHook(0, 0.18);
        mover.applyDrag(0.26);
      } else {
        mover.applyDrag(0.035);
      }
      mover.updateVelocity();
      mover.velocity.sub(points.velocity);
      positions[i * 3 + 0] = mover.velocity.x - points.velocity.x;
      positions[i * 3 + 1] = mover.velocity.y - points.velocity.x;
      positions[i * 3 + 2] = mover.velocity.z - points.velocity.x;
      mover.size = Math.log(Util.getRandomInt(1, 128)) / Math.log(128) * Math.sqrt(document.body.clientWidth);
      sizes[i] = mover.size;
    }
    points.updatePoints();
  };

  var createTexture = function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var grad = null;
    var texture = null;

    canvas.width = 200;
    canvas.height = 200;
    grad = ctx.createRadialGradient(100, 100, 20, 100, 100, 100);
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.arc(100, 100, 100, 0, Math.PI / 180, true);
    ctx.fill();

    texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      loadImage(function() {
        getImageData();
        buildPoints(scene);
      });
      camera.setPolarCoord(0, 0, 1400);
    },
    remove: function(scene, camera) {
      points.geometry.dispose();
      points.material.dispose();
      scene.remove(points.obj);
      image_vertices = [];
      movers = [];
      camera.range = 1000;
    },
    render: function(scene, camera) {
      if (created_points) {
        updateMover();
        points.updatePoints();
      }
      camera.force.position.applyHook(0, 0.025);
      camera.force.position.applyDrag(0.2);
      camera.force.position.updateVelocity();
      camera.updatePosition();
      camera.lookAtCenter();

    },
    touchStart: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      applyForceToPoints();
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      camera.force.position.anchor.z = vector_mouse_move.x * 1000;
      camera.force.position.anchor.y = vector_mouse_move.y * -1000;
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      camera.force.position.anchor.z = 0;
      camera.force.position.anchor.y = 0;
    },
    mouseOut: function(scene, camera) {
      this.touchEnd(scene, camera)
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/mover":8,"../modules/points.js":10,"../modules/util":11}],21:[function(require,module,exports){
var Util = require('../modules/util');

var Force3 = require('../modules/force3');

var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };
  var raycaster = new THREE.Raycaster();
  var intersects = null;
  var cube_force = new Force3();
  var cube_force2 = new Force3();
  var vactor_raycast = null;
  cube_force.mass = 1.4;

  var createPlaneForRaymarching = function() {
    var geometry = new THREE.PlaneBufferGeometry(6.0, 6.0);
    var material = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0
        },
        time2: {
          type: 'f',
          value: 0,
        },
        acceleration: {
          type: 'f',
          value: 0
        },
        resolution: {
          type: 'v2',
          value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        }
      },
      vertexShader: "#define GLSLIFY 1\nvarying mat4 m_matrix;\n\nfloat inverse_1_0(float m) {\n  return 1.0 / m;\n}\n\nmat2 inverse_1_0(mat2 m) {\n  return mat2(m[1][1],-m[0][1],\n             -m[1][0], m[0][0]) / (m[0][0]*m[1][1] - m[0][1]*m[1][0]);\n}\n\nmat3 inverse_1_0(mat3 m) {\n  float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];\n  float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];\n  float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];\n\n  float b01 = a22 * a11 - a12 * a21;\n  float b11 = -a22 * a10 + a12 * a20;\n  float b21 = a21 * a10 - a11 * a20;\n\n  float det = a00 * b01 + a01 * b11 + a02 * b21;\n\n  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),\n              b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),\n              b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;\n}\n\nmat4 inverse_1_0(mat4 m) {\n  float\n      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],\n      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],\n      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],\n      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],\n\n      b00 = a00 * a11 - a01 * a10,\n      b01 = a00 * a12 - a02 * a10,\n      b02 = a00 * a13 - a03 * a10,\n      b03 = a01 * a12 - a02 * a11,\n      b04 = a01 * a13 - a03 * a11,\n      b05 = a02 * a13 - a03 * a12,\n      b06 = a20 * a31 - a21 * a30,\n      b07 = a20 * a32 - a22 * a30,\n      b08 = a20 * a33 - a23 * a30,\n      b09 = a21 * a32 - a22 * a31,\n      b10 = a21 * a33 - a23 * a31,\n      b11 = a22 * a33 - a23 * a32,\n\n      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n\n  return mat4(\n      a11 * b11 - a12 * b10 + a13 * b09,\n      a02 * b10 - a01 * b11 - a03 * b09,\n      a31 * b05 - a32 * b04 + a33 * b03,\n      a22 * b04 - a21 * b05 - a23 * b03,\n      a12 * b08 - a10 * b11 - a13 * b07,\n      a00 * b11 - a02 * b08 + a03 * b07,\n      a32 * b02 - a30 * b05 - a33 * b01,\n      a20 * b05 - a22 * b02 + a23 * b01,\n      a10 * b10 - a11 * b08 + a13 * b06,\n      a01 * b08 - a00 * b10 - a03 * b06,\n      a30 * b04 - a31 * b02 + a33 * b00,\n      a21 * b02 - a20 * b04 - a23 * b00,\n      a11 * b07 - a10 * b09 - a12 * b06,\n      a00 * b09 - a01 * b07 + a02 * b06,\n      a31 * b01 - a30 * b03 - a32 * b00,\n      a20 * b03 - a21 * b01 + a22 * b00) / det;\n}\n\n\n\nvoid main(void) {\n  m_matrix = inverse_1_0(modelMatrix);\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}\n",
      fragmentShader: "#define GLSLIFY 1\nuniform float time;\nuniform float time2;\nuniform float acceleration;\nuniform vec2 resolution;\n\nvarying mat4 m_matrix;\n\n// const vec3 cPos = vec3(0.0, 0.0, 10.0);\nconst float targetDepth = 3.5;\nconst vec3 lightDir = vec3(0.577, -0.577, 0.577);\n\nvec3 hsv2rgb_1_0(vec3 c){\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_4_1(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_4_1(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_4_2(vec4 x) {\n     return mod289_4_1(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_4_3(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_4_4(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_4_5 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_4_6 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_4_6;\n  vec3 i1 = min( g_4_6.xyz, l.zxy );\n  vec3 i2 = max( g_4_6.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_4_5.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_4_1(i);\n  vec4 p = permute_4_2( permute_4_2( permute_4_2(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_4_5.wyz - D_4_5.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_4_7 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_4_8 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_4_7.xy,h.z);\n  vec3 p3 = vec3(a1_4_7.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_4_3(vec4(dot(p0_4_8,p0_4_8), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_4_8 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_4_8,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 rotate_2_9(vec3 p, float radian_x, float radian_y, float radian_z) {\n  mat3 mx = mat3(\n    1.0, 0.0, 0.0,\n    0.0, cos(radian_x), -sin(radian_x),\n    0.0, sin(radian_x), cos(radian_x)\n  );\n  mat3 my = mat3(\n    cos(radian_y), 0.0, sin(radian_y),\n    0.0, 1.0, 0.0,\n    -sin(radian_y), 0.0, cos(radian_y)\n  );\n  mat3 mz = mat3(\n    cos(radian_z), -sin(radian_z), 0.0,\n    sin(radian_z), cos(radian_z), 0.0,\n    0.0, 0.0, 1.0\n  );\n  return mx * my * mz * p;\n}\n\n\nfloat dBox_3_10(vec3 p, vec3 size) {\n  return length(max(abs(p) - size, 0.0));\n}\n\n\n\nfloat getNoise(vec3 p) {\n  return snoise_4_4(p * (0.4 + acceleration * 0.1) + time / 100.0);\n}\n\nvec3 getRotate(vec3 p) {\n  return rotate_2_9(p, radians(time2), radians(time2 * 2.0), radians(time2));\n}\n\nfloat distanceFunc(vec3 p) {\n  vec4 p1 = m_matrix * vec4(p, 1.0);\n  float n1 = getNoise(p1.xyz);\n  vec3 p2 = getRotate(p1.xyz);\n  float d1 = dBox_3_10(p2, vec3(0.8 - min(acceleration, 0.8))) - 0.2;\n  float d2 = dBox_3_10(p2, vec3(1.0)) - n1;\n  float d3 = dBox_3_10(p2, vec3(0.5 + acceleration * 0.4)) - n1;\n  return min(max(d1, -d2), d3);\n}\n\nfloat distanceFuncForFill(vec3 p) {\n  vec4 p1 = m_matrix * vec4(p, 1.0);\n  float n = getNoise(p1.xyz);\n  vec3 p2 = getRotate(p1.xyz);\n  return dBox_3_10(p2, vec3(0.5 + acceleration * 0.4)) - n;\n}\n\nvec3 getNormal(vec3 p) {\n  const float d = 0.1;\n  return normalize(vec3(\n    distanceFunc(p + vec3(d, 0.0, 0.0)) - distanceFunc(p + vec3(-d, 0.0, 0.0)),\n    distanceFunc(p + vec3(0.0, d, 0.0)) - distanceFunc(p + vec3(0.0, -d, 0.0)),\n    distanceFunc(p + vec3(0.0, 0.0, d)) - distanceFunc(p + vec3(0.0, 0.0, -d))\n  ));\n}\n\nvoid main() {\n  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);\n\n  vec3 cDir = normalize(cameraPosition * -1.0);\n  vec3 cUp  = vec3(0.0, 1.0, 0.0);\n  vec3 cSide = cross(cDir, cUp);\n\n  vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir * targetDepth);\n\n  float distance = 0.0;\n  float rLen = 0.0;\n  vec3 rPos = cameraPosition;\n  for(int i = 0; i < 64; i++){\n    distance = distanceFunc(rPos);\n    rLen += distance;\n    rPos = cameraPosition + ray * rLen * 0.2;\n  }\n\n  vec3 normal = getNormal(rPos);\n  if(abs(distance) < 0.5){\n    if (distanceFuncForFill(rPos) > 0.5) {\n      gl_FragColor = vec4(hsv2rgb_1_0(vec3(dot(normal, cUp) * 0.8 + time / 400.0, 0.2, dot(normal, cUp) * 0.8 + 0.1)), 1.0);\n    } else {\n      gl_FragColor = vec4(hsv2rgb_1_0(vec3(dot(normal, cUp) * 0.1 + time / 400.0, 0.8, dot(normal, cUp) * 0.2 + 0.8)), 1.0);\n    }\n  } else {\n    gl_FragColor = vec4(0.0);\n  }\n}\n",
      transparent: true
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'MetalCube';
    return mesh;
  };
  var createBackground =  function() {
    var geometry_base = new THREE.OctahedronGeometry(30, 4);
    var geometry = new THREE.BufferGeometry();
    geometry.fromGeometry(geometry_base);
    var material = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0,
        },
        acceleration: {
          type: 'f',
          value: 0
        },
      },
      vertexShader: "#define GLSLIFY 1\nuniform float time;\nuniform float acceleration;\n\nvarying vec3 vPosition;\nvarying vec3 vColor;\nvarying mat4 invertMatrix;\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_3_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_3_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_3_1(vec4 x) {\n     return mod289_3_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_3_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_3_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_3_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_3_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_3_5;\n  vec3 i1 = min( g_3_5.xyz, l.zxy );\n  vec3 i2 = max( g_3_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_3_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_3_0(i);\n  vec4 p = permute_3_1( permute_3_1( permute_3_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_3_4.wyz - D_3_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_3_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_3_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_3_6.xy,h.z);\n  vec3 p3 = vec3(a1_3_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_3_2(vec4(dot(p0_3_7,p0_3_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_3_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_3_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 hsv2rgb_1_8(vec3 c){\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\n\nfloat inverse_4_9(float m) {\n  return 1.0 / m;\n}\n\nmat2 inverse_4_9(mat2 m) {\n  return mat2(m[1][1],-m[0][1],\n             -m[1][0], m[0][0]) / (m[0][0]*m[1][1] - m[0][1]*m[1][0]);\n}\n\nmat3 inverse_4_9(mat3 m) {\n  float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];\n  float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];\n  float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];\n\n  float b01 = a22 * a11 - a12 * a21;\n  float b11 = -a22 * a10 + a12 * a20;\n  float b21 = a21 * a10 - a11 * a20;\n\n  float det = a00 * b01 + a01 * b11 + a02 * b21;\n\n  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),\n              b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),\n              b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;\n}\n\nmat4 inverse_4_9(mat4 m) {\n  float\n      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],\n      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],\n      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],\n      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],\n\n      b00 = a00 * a11 - a01 * a10,\n      b01 = a00 * a12 - a02 * a10,\n      b02 = a00 * a13 - a03 * a10,\n      b03 = a01 * a12 - a02 * a11,\n      b04 = a01 * a13 - a03 * a11,\n      b05 = a02 * a13 - a03 * a12,\n      b06 = a20 * a31 - a21 * a30,\n      b07 = a20 * a32 - a22 * a30,\n      b08 = a20 * a33 - a23 * a30,\n      b09 = a21 * a32 - a22 * a31,\n      b10 = a21 * a33 - a23 * a31,\n      b11 = a22 * a33 - a23 * a32,\n\n      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n\n  return mat4(\n      a11 * b11 - a12 * b10 + a13 * b09,\n      a02 * b10 - a01 * b11 - a03 * b09,\n      a31 * b05 - a32 * b04 + a33 * b03,\n      a22 * b04 - a21 * b05 - a23 * b03,\n      a12 * b08 - a10 * b11 - a13 * b07,\n      a00 * b11 - a02 * b08 + a03 * b07,\n      a32 * b02 - a30 * b05 - a33 * b01,\n      a20 * b05 - a22 * b02 + a23 * b01,\n      a10 * b10 - a11 * b08 + a13 * b06,\n      a01 * b08 - a00 * b10 - a03 * b06,\n      a30 * b04 - a31 * b02 + a33 * b00,\n      a21 * b02 - a20 * b04 - a23 * b00,\n      a11 * b07 - a10 * b09 - a12 * b06,\n      a00 * b09 - a01 * b07 + a02 * b06,\n      a31 * b01 - a30 * b03 - a32 * b00,\n      a20 * b03 - a21 * b01 + a22 * b00) / det;\n}\n\n\nvec3 rotate_2_10(vec3 p, float radian_x, float radian_y, float radian_z) {\n  mat3 mx = mat3(\n    1.0, 0.0, 0.0,\n    0.0, cos(radian_x), -sin(radian_x),\n    0.0, sin(radian_x), cos(radian_x)\n  );\n  mat3 my = mat3(\n    cos(radian_y), 0.0, sin(radian_y),\n    0.0, 1.0, 0.0,\n    -sin(radian_y), 0.0, cos(radian_y)\n  );\n  mat3 mz = mat3(\n    cos(radian_z), -sin(radian_z), 0.0,\n    sin(radian_z), cos(radian_z), 0.0,\n    0.0, 0.0, 1.0\n  );\n  return mx * my * mz * p;\n}\n\n\n\nvec3 getRotate(vec3 p) {\n  return rotate_2_10(p, radians(time / 6.0), radians(time / 7.0), radians(time / 8.0));\n}\n\nvoid main() {\n  float updateTime = time / 400.0;\n  vec3 p_rotate = getRotate(position);\n  float noise = snoise_3_3(vec3(p_rotate / 12.1 + updateTime * 0.5));\n  vec3 p_noise = p_rotate + p_rotate * noise / 20.0 * (min(acceleration, 6.0) + 1.0);\n\n  vPosition = p_noise;\n  vColor = hsv2rgb_1_8(vec3(updateTime + position.y / 400.0, 0.05 + min(acceleration / 10.0, 0.25), 1.0));\n  invertMatrix = inverse_4_9(modelMatrix);\n\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(p_noise, 1.0);\n}\n",
      fragmentShader: "#define GLSLIFY 1\nuniform float time;\nuniform float acceleration;\n\nvarying vec3 vPosition;\nvarying vec3 vColor;\nvarying mat4 invertMatrix;\n\nvoid main() {\n  vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));\n  vec3 inv_light = normalize(invertMatrix * vec4(0.7, -0.7, 0.7, 1.0)).xyz;\n  float diff = (dot(normal, inv_light) + 1.0) / 4.0 + 0.4;\n  gl_FragColor = vec4(vColor * diff, 1.0);\n}\n",
      shading: THREE.FlatShading,
      side: THREE.BackSide
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'Background';
    return mesh;
  };

  var moveMetalCube = function(scene, camera, vector) {
    if (cube_force.acceleration.length() > 0.1 || !vector) return;
    raycaster.setFromCamera(vector, camera);
    intersects = raycaster.intersectObjects(scene.children)[0];
    if(intersects && intersects.object.name == 'MetalCube') {
      cube_force.anchor.copy(Util.getPolarCoord(
        Util.getRadian(Util.getRandomInt(-20, 20)),
        Util.getRadian(Util.getRandomInt(0, 360)),
        Util.getRandomInt(30, 90) / 10
      ));
      cube_force2.applyForce(new THREE.Vector3(1, 0, 0));
    }
  };

  var plane = createPlaneForRaymarching();
  var bg = createBackground();

  Sketch.prototype = {
    init: function(scene, camera) {
      scene.add(plane);
      scene.add(bg);
      camera.setPolarCoord(0, Util.getRadian(90), 24);
    },
    remove: function(scene, camera) {
      plane.geometry.dispose();
      plane.material.dispose();
      scene.remove(plane);
      bg.geometry.dispose();
      bg.material.dispose();
      scene.remove(bg);
    },
    render: function(scene, camera) {
      moveMetalCube(scene, camera, vactor_raycast);
      cube_force.applyHook(0, 0.12);
      cube_force.applyDrag(0.01);
      cube_force.updateVelocity();
      cube_force2.applyHook(0, 0.005);
      cube_force2.applyDrag(0.2);
      cube_force2.updateVelocity();
      plane.position.copy(cube_force.velocity);
      plane.material.uniforms.time.value++;
      plane.material.uniforms.time2.value += 1 + Math.floor(cube_force.acceleration.length() * 4);
      plane.material.uniforms.acceleration.value = cube_force.acceleration.length();
      bg.material.uniforms.time.value++;
      bg.material.uniforms.acceleration.value = cube_force2.velocity.length();
      camera.force.position.applyHook(0, 0.025);
      camera.force.position.applyDrag(0.2);
      camera.force.position.updateVelocity();
      camera.updatePosition();
      camera.lookAtCenter();
    },
    touchStart: function(scene, camera, vector_mouse_down, vector_mouse_move) {

    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      vactor_raycast = vector_mouse_move;
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
    },
    mouseOut: function(scene, camera) {
    },
    resizeWindow: function(scene, camera) {
      plane.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/force3":4,"../modules/util":11}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2RlYm91bmNlLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UyLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UzLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2VfY2FtZXJhLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2VfaGVtaXNwaGVyZV9saWdodC5qcyIsInNyYy9qcy9tb2R1bGVzL2ZvcmNlX3BvaW50X2xpZ2h0LmpzIiwic3JjL2pzL21vZHVsZXMvbW92ZXIuanMiLCJzcmMvanMvbW9kdWxlcy9waHlzaWNzX3JlbmRlcmVyLmpzIiwic3JjL2pzL21vZHVsZXMvcG9pbnRzLmpzIiwic3JjL2pzL21vZHVsZXMvdXRpbC5qcyIsInNyYy9qcy9za2V0Y2hlcy5qcyIsInNyYy9qcy9za2V0Y2hlcy9hdHRyYWN0LmpzIiwic3JjL2pzL3NrZXRjaGVzL2NvbWV0LmpzIiwic3JjL2pzL3NrZXRjaGVzL2Rpc3RvcnQuanMiLCJzcmMvanMvc2tldGNoZXMvZmlyZV9iYWxsLmpzIiwic3JjL2pzL3NrZXRjaGVzL2dhbGxlcnkuanMiLCJzcmMvanMvc2tldGNoZXMvaG9sZS5qcyIsInNyYy9qcy9za2V0Y2hlcy9oeXBlcl9zcGFjZS5qcyIsInNyYy9qcy9za2V0Y2hlcy9pbWFnZV9kYXRhLmpzIiwic3JjL2pzL3NrZXRjaGVzL21ldGFsX2N1YmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBVdGlsID0gcmVxdWlyZSgnLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnLi9tb2R1bGVzL2RlYm91bmNlJyk7XHJcbnZhciBGb3JjZUNhbWVyYSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9mb3JjZV9jYW1lcmEnKTtcclxuXHJcbnZhciB2ZWN0b3JfbW91c2VfZG93biA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbnZhciB2ZWN0b3JfbW91c2VfbW92ZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbnZhciB2ZWN0b3JfbW91c2VfZW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuXHJcbnZhciBjYW52YXMgPSBudWxsO1xyXG52YXIgcmVuZGVyZXIgPSBudWxsO1xyXG52YXIgc2NlbmUgPSBudWxsO1xyXG52YXIgY2FtZXJhID0gbnVsbDtcclxuXHJcbnZhciBydW5uaW5nID0gbnVsbDtcclxudmFyIHNrZXRjaGVzID0gcmVxdWlyZSgnLi9za2V0Y2hlcycpO1xyXG52YXIgc2tldGNoX2lkID0gMDtcclxuXHJcbnZhciBtZXRhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtZXRhJyk7XHJcbnZhciBidG5fdG9nZ2xlX21lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLXN3aXRjaC1tZW51Jyk7XHJcbnZhciBtZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1lbnUnKTtcclxudmFyIHNlbGVjdF9za2V0Y2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LXNrZXRjaCcpO1xyXG52YXIgc2tldGNoX3RpdGxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNrZXRjaC10aXRsZScpO1xyXG52YXIgc2tldGNoX2RhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2tldGNoLWRhdGUnKTtcclxudmFyIHNrZXRjaF9kZXNjcmlwdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5za2V0Y2gtZGVzY3JpcHRpb24nKTtcclxuXHJcbnZhciBpbml0VGhyZWUgPSBmdW5jdGlvbigpIHtcclxuICBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XHJcbiAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XHJcbiAgICBhbnRpYWxpYXM6IHRydWUsXHJcbiAgICB0b25lTWFwcGluZzogVEhSRUUuTm9Ub25lTWFwcGluZyxcclxuICB9KTtcclxuICBpZiAoIXJlbmRlcmVyKSB7XHJcbiAgICBhbGVydCgnVGhyZWUuanPjga7liJ3mnJ/ljJbjgavlpLHmlZfjgZfjgb7jgZfjgZ/jgIInKTtcclxuICB9XHJcbiAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICBjYW52YXMuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XHJcbiAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigweDAwMDAwMCwgMS4wKTtcclxuXHJcbiAgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuXHJcbiAgY2FtZXJhID0gbmV3IEZvcmNlQ2FtZXJhKDM1LCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMSwgMTAwMDApO1xyXG59O1xyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbigpIHtcclxuICBzZXRTa2V0Y2hJZCgpO1xyXG4gIGJ1aWxkTWVudSgpO1xyXG4gIGluaXRUaHJlZSgpO1xyXG4gIHN0YXJ0UnVuU2tldGNoKHNrZXRjaGVzW3NrZXRjaGVzLmxlbmd0aCAtIHNrZXRjaF9pZF0pO1xyXG4gIHJlbmRlcmxvb3AoKTtcclxuICBzZXRFdmVudCgpO1xyXG4gIGRlYm91bmNlKHdpbmRvdywgJ3Jlc2l6ZScsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgIHJlc2l6ZVJlbmRlcmVyKCk7XHJcbiAgfSk7XHJcbn07XHJcblxyXG52YXIgZ2V0UGFyYW1ldGVyQnlOYW1lID0gZnVuY3Rpb24obmFtZSkge1xyXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgXCJcXFxcW1wiKS5yZXBsYWNlKC9bXFxdXS8sIFwiXFxcXF1cIik7XHJcbiAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIltcXFxcPyZdXCIgKyBuYW1lICsgXCI9KFteJiNdKilcIik7XHJcbiAgdmFyIHJlc3VsdHMgPSByZWdleC5leGVjKGxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyBcIlwiIDogZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csIFwiIFwiKSk7XHJcbn07XHJcblxyXG52YXIgc2V0U2tldGNoSWQgPSBmdW5jdGlvbigpIHtcclxuICBza2V0Y2hfaWQgPSBnZXRQYXJhbWV0ZXJCeU5hbWUoJ3NrZXRjaF9pZCcpO1xyXG4gIGlmIChza2V0Y2hfaWQgPT0gbnVsbCB8fCBza2V0Y2hfaWQgPiBza2V0Y2hlcy5sZW5ndGggfHwgc2tldGNoX2lkIDwgMSkge1xyXG4gICAgc2tldGNoX2lkID0gc2tldGNoZXMubGVuZ3RoO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciBidWlsZE1lbnUgPSBmdW5jdGlvbigpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHNrZXRjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgc2tldGNoID0gc2tldGNoZXNbaV07XHJcbiAgICB2YXIgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgIGRvbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnLCBpKTtcclxuICAgIGRvbS5pbm5lckhUTUwgPSAnPHNwYW4+JyArIHNrZXRjaC5uYW1lICsgJzwvc3Bhbj4nO1xyXG4gICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHN3aXRjaFNrZXRjaChza2V0Y2hlc1t0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpXSk7XHJcbiAgICB9KTtcclxuICAgIHNlbGVjdF9za2V0Y2guYXBwZW5kQ2hpbGQoZG9tKTtcclxuICB9XHJcbn07XHJcblxyXG52YXIgc3RhcnRSdW5Ta2V0Y2ggPSBmdW5jdGlvbihza2V0Y2gpIHtcclxuICBydW5uaW5nID0gbmV3IHNrZXRjaC5vYmooc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpO1xyXG4gIHNrZXRjaF90aXRsZS5pbm5lckhUTUwgPSBza2V0Y2gubmFtZTtcclxuICBza2V0Y2hfZGF0ZS5pbm5lckhUTUwgPSAoc2tldGNoLnVwZGF0ZS5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgID8gJ3Bvc3RlZDogJyArIHNrZXRjaC5wb3N0ZWQgKyAnIC8gdXBkYXRlOiAnICsgc2tldGNoLnVwZGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3Bvc3RlZDogJyArIHNrZXRjaC5wb3N0ZWQ7XHJcbiAgc2tldGNoX2Rlc2NyaXB0aW9uLmlubmVySFRNTCA9IHNrZXRjaC5kZXNjcmlwdGlvbjtcclxufTtcclxuXHJcbnZhciBzd2l0Y2hTa2V0Y2ggPSBmdW5jdGlvbihza2V0Y2gpIHtcclxuICBydW5uaW5nLnJlbW92ZShzY2VuZSwgY2FtZXJhKTtcclxuICBzdGFydFJ1blNrZXRjaChza2V0Y2gpO1xyXG4gIHN3aXRjaE1lbnUoKTtcclxufTtcclxuXHJcbnZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICByZW5kZXJlci5jbGVhcigpO1xyXG4gIHJ1bm5pbmcucmVuZGVyKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKTtcclxuICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XHJcbn07XHJcblxyXG52YXIgcmVuZGVybG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJsb29wKTtcclxuICByZW5kZXIoKTtcclxufTtcclxuXHJcbnZhciByZXNpemVSZW5kZXJlciA9IGZ1bmN0aW9uKCkge1xyXG4gIHJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgY2FtZXJhLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICByZXNpemVXaW5kb3coKTtcclxufTtcclxuXHJcbnZhciBzZXRFdmVudCA9IGZ1bmN0aW9uICgpIHtcclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoU3RhcnQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hNb3ZlKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaEVuZChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZLCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hTdGFydChldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSwgdHJ1ZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaE1vdmUoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFksIHRydWUpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaEVuZChldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYLCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZLCB0cnVlKTtcclxuICB9KTtcclxuXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIG1vdXNlT3V0KCk7XHJcbiAgfSk7XHJcblxyXG4gIGJ0bl90b2dnbGVfbWVudS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgc3dpdGNoTWVudSgpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudmFyIHRyYW5zZm9ybVZlY3RvcjJkID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgdmVjdG9yLnggPSAodmVjdG9yLnggLyB3aW5kb3cuaW5uZXJXaWR0aCkgKiAyIC0gMTtcclxuICB2ZWN0b3IueSA9IC0gKHZlY3Rvci55IC8gd2luZG93LmlubmVySGVpZ2h0KSAqIDIgKyAxO1xyXG59O1xyXG5cclxudmFyIHRvdWNoU3RhcnQgPSBmdW5jdGlvbih4LCB5LCB0b3VjaF9ldmVudCkge1xyXG4gIHZlY3Rvcl9tb3VzZV9kb3duLnNldCh4LCB5KTtcclxuICB0cmFuc2Zvcm1WZWN0b3IyZCh2ZWN0b3JfbW91c2VfZG93bik7XHJcbiAgaWYgKHJ1bm5pbmcudG91Y2hTdGFydCkgcnVubmluZy50b3VjaFN0YXJ0KHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duKTtcclxufTtcclxuXHJcbnZhciB0b3VjaE1vdmUgPSBmdW5jdGlvbih4LCB5LCB0b3VjaF9ldmVudCkge1xyXG4gIHZlY3Rvcl9tb3VzZV9tb3ZlLnNldCh4LCB5KTtcclxuICB0cmFuc2Zvcm1WZWN0b3IyZCh2ZWN0b3JfbW91c2VfbW92ZSk7XHJcbiAgaWYgKHJ1bm5pbmcudG91Y2hNb3ZlKSBydW5uaW5nLnRvdWNoTW92ZShzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpO1xyXG59O1xyXG5cclxudmFyIHRvdWNoRW5kID0gZnVuY3Rpb24oeCwgeSwgdG91Y2hfZXZlbnQpIHtcclxuICB2ZWN0b3JfbW91c2VfZW5kLnNldCh4LCB5KTtcclxuICBpZiAocnVubmluZy50b3VjaEVuZCkgcnVubmluZy50b3VjaEVuZChzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKTtcclxufTtcclxuXHJcbnZhciBtb3VzZU91dCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZlY3Rvcl9tb3VzZV9lbmQuc2V0KDAsIDApO1xyXG4gIGlmIChydW5uaW5nLm1vdXNlT3V0KSBydW5uaW5nLm1vdXNlT3V0KHNjZW5lLCBjYW1lcmEpO1xyXG59O1xyXG5cclxudmFyIHN3aXRjaE1lbnUgPSBmdW5jdGlvbigpIHtcclxuICBidG5fdG9nZ2xlX21lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJyk7XHJcbiAgbWVudS5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKTtcclxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBvaW50ZWQnKTtcclxufTtcclxuXHJcbnZhciByZXNpemVXaW5kb3cgPSBmdW5jdGlvbigpIHtcclxuICBpZiAocnVubmluZy5yZXNpemVXaW5kb3cpIHJ1bm5pbmcucmVzaXplV2luZG93KHNjZW5lLCBjYW1lcmEpO1xyXG59O1xyXG5cclxuXHJcbmluaXQoKTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmplY3QsIGV2ZW50VHlwZSwgY2FsbGJhY2spe1xyXG4gIHZhciB0aW1lcjtcclxuXHJcbiAgb2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICBjYWxsYmFjayhldmVudCk7XHJcbiAgICB9LCA1MDApO1xyXG4gIH0sIGZhbHNlKTtcclxufTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgRm9yY2UyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICAgIHRoaXMubWFzcyA9IDE7XHJcbiAgfTtcclxuICBcclxuICBGb3JjZTIucHJvdG90eXBlLnVwZGF0ZVZlbG9jaXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbi5kaXZpZGVTY2FsYXIodGhpcy5tYXNzKTtcclxuICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcclxuICB9O1xyXG4gIEZvcmNlMi5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHZlY3Rvcik7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5RnJpY3Rpb24gPSBmdW5jdGlvbihtdSwgbm9ybWFsKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xyXG4gICAgaWYgKCFub3JtYWwpIG5vcm1hbCA9IDE7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSk7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKG11KTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5RHJhZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIoLTEpO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcih0aGlzLmFjY2VsZXJhdGlvbi5sZW5ndGgoKSAqIHZhbHVlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5SG9vayA9IGZ1bmN0aW9uKHJlc3RfbGVuZ3RoLCBrKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLnZlbG9jaXR5LmNsb25lKCkuc3ViKHRoaXMuYW5jaG9yKTtcclxuICAgIHZhciBkaXN0YW5jZSA9IGZvcmNlLmxlbmd0aCgpIC0gcmVzdF9sZW5ndGg7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xICogayAqIGRpc3RhbmNlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIEZvcmNlMjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBGb3JjZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLmFuY2hvciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLm1hc3MgPSAxO1xyXG4gIH07XHJcblxyXG4gIEZvcmNlLnByb3RvdHlwZS51cGRhdGVWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uZGl2aWRlU2NhbGFyKHRoaXMubWFzcyk7XHJcbiAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHZlY3Rvcik7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlGcmljdGlvbiA9IGZ1bmN0aW9uKG11LCBub3JtYWwpIHtcclxuICAgIHZhciBmb3JjZSA9IHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCk7XHJcbiAgICBpZiAoIW5vcm1hbCkgbm9ybWFsID0gMTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIobXUpO1xyXG4gICAgdGhpcy5hcHBseUZvcmNlKGZvcmNlKTtcclxuICB9O1xyXG4gIEZvcmNlLnByb3RvdHlwZS5hcHBseURyYWcgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIodGhpcy5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgKiB2YWx1ZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcbiAgRm9yY2UucHJvdG90eXBlLmFwcGx5SG9vayA9IGZ1bmN0aW9uKHJlc3RfbGVuZ3RoLCBrKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLnZlbG9jaXR5LmNsb25lKCkuc3ViKHRoaXMuYW5jaG9yKTtcclxuICAgIHZhciBkaXN0YW5jZSA9IGZvcmNlLmxlbmd0aCgpIC0gcmVzdF9sZW5ndGg7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xICogayAqIGRpc3RhbmNlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIEZvcmNlO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBGb3JjZUNhbWVyYSA9IGZ1bmN0aW9uKGZvdiwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcclxuICAgIFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhLmNhbGwodGhpcywgZm92LCBhc3BlY3QsIG5lYXIsIGZhcik7XHJcbiAgICB0aGlzLmZvcmNlID0ge1xyXG4gICAgICBwb3NpdGlvbjogbmV3IEZvcmNlMygpLFxyXG4gICAgICBsb29rOiBuZXcgRm9yY2UzKCksXHJcbiAgICB9O1xyXG4gICAgdGhpcy51cC5zZXQoMCwgMSwgMCk7XHJcbiAgfTtcclxuICBGb3JjZUNhbWVyYS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhLnByb3RvdHlwZSk7XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRm9yY2VDYW1lcmE7XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkodGhpcy5mb3JjZS5wb3NpdGlvbi52ZWxvY2l0eSk7XHJcbiAgfTtcclxuICBGb3JjZUNhbWVyYS5wcm90b3R5cGUudXBkYXRlTG9vayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5sb29rQXQoe1xyXG4gICAgICB4OiB0aGlzLmZvcmNlLmxvb2sudmVsb2NpdHkueCxcclxuICAgICAgeTogdGhpcy5mb3JjZS5sb29rLnZlbG9jaXR5LnksXHJcbiAgICAgIHo6IHRoaXMuZm9yY2UubG9vay52ZWxvY2l0eS56LFxyXG4gICAgfSk7XHJcbiAgfTtcclxuICBGb3JjZUNhbWVyYS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2V0UG9sYXJDb29yZCgpO1xyXG4gICAgdGhpcy5sb29rQXRDZW50ZXIoKTtcclxuICB9O1xyXG4gIEZvcmNlQ2FtZXJhLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICB0aGlzLmFzcGVjdCA9IHdpZHRoIC8gaGVpZ2h0O1xyXG4gICAgdGhpcy51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcbiAgfTtcclxuICBGb3JjZUNhbWVyYS5wcm90b3R5cGUuc2V0UG9sYXJDb29yZCA9IGZ1bmN0aW9uKHJhZDEsIHJhZDIsIHJhbmdlKSB7XHJcbiAgICB0aGlzLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChyYWQxLCByYWQyLCByYW5nZSkpO1xyXG4gIH07XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlLmxvb2tBdENlbnRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5sb29rQXQoe1xyXG4gICAgICB4OiAwLFxyXG4gICAgICB5OiAwLFxyXG4gICAgICB6OiAwXHJcbiAgICB9KTtcclxuICB9O1xyXG4gIHJldHVybiBGb3JjZUNhbWVyYTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgRm9yY2VIZW1pc3BoZXJlTGlnaHQgPSBmdW5jdGlvbihoZXgxLCBoZXgyLCBpbnRlbnNpdHkpIHtcclxuICAgIFRIUkVFLkhlbWlzcGhlcmVMaWdodC5jYWxsKHRoaXMsIGhleDEsIGhleDIsIGludGVuc2l0eSk7XHJcbiAgICB0aGlzLmZvcmNlID0gbmV3IEZvcmNlMygpO1xyXG4gIH07XHJcbiAgRm9yY2VIZW1pc3BoZXJlTGlnaHQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUSFJFRS5IZW1pc3BoZXJlTGlnaHQucHJvdG90eXBlKTtcclxuICBGb3JjZUhlbWlzcGhlcmVMaWdodC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBGb3JjZUhlbWlzcGhlcmVMaWdodDtcclxuICBGb3JjZUhlbWlzcGhlcmVMaWdodC5wcm90b3R5cGUudXBkYXRlUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucG9zaXRpb24uY29weSh0aGlzLmZvcmNlLnZlbG9jaXR5KTtcclxuICB9O1xyXG4gIEZvcmNlSGVtaXNwaGVyZUxpZ2h0LnByb3RvdHlwZS5zZXRQb3NpdGlvblNwaGVyaWNhbCA9IGZ1bmN0aW9uKHJhZDEsIHJhZDIsIHJhbmdlKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkoVXRpbC5nZXRQb2xhckNvb3JkKHJhZDEsIHJhZDIsIHJhbmdlKSk7XHJcbiAgfTtcclxuICByZXR1cm4gRm9yY2VIZW1pc3BoZXJlTGlnaHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIEZvcmNlUG9pbnRMaWdodCA9IGZ1bmN0aW9uKGhleCwgaW50ZW5zaXR5LCBkaXN0YW5jZSwgZGVjYXkpIHtcclxuICAgIFRIUkVFLlBvaW50TGlnaHQuY2FsbCh0aGlzLCBoZXgsIGludGVuc2l0eSwgZGlzdGFuY2UsIGRlY2F5KTtcclxuICAgIHRoaXMuZm9yY2UgPSBuZXcgRm9yY2UzKCk7XHJcbiAgfTtcclxuICBGb3JjZVBvaW50TGlnaHQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUSFJFRS5Qb2ludExpZ2h0LnByb3RvdHlwZSk7XHJcbiAgRm9yY2VQb2ludExpZ2h0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEZvcmNlUG9pbnRMaWdodDtcclxuICBGb3JjZVBvaW50TGlnaHQucHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkodGhpcy5mb3JjZS52ZWxvY2l0eSk7XHJcbiAgfTtcclxuICBGb3JjZVBvaW50TGlnaHQucHJvdG90eXBlLnNldFBvbGFyQ29vcmQgPSBmdW5jdGlvbihyYWQxLCByYWQyLCByYW5nZSkge1xyXG4gICAgdGhpcy5wb3NpdGlvbi5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChyYWQxLCByYWQyLCByYW5nZSkpO1xyXG4gIH07XHJcbiAgcmV0dXJuIEZvcmNlUG9pbnRMaWdodDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2l6ZSA9IDA7XHJcbiAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgdGhpcy5pc19hY3RpdmUgPSBmYWxzZTtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgTW92ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBNb3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNb3ZlcjtcclxuICBNb3Zlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgdGhpcy5hbmNob3IgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLnNldCgwLCAwLCAwKTtcclxuICAgIHRoaXMudGltZSA9IDA7XHJcbiAgfTtcclxuICBNb3Zlci5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuaXNfYWN0aXZlID0gdHJ1ZTtcclxuICB9O1xyXG4gIE1vdmVyLnByb3RvdHlwZS5pbmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmlzX2FjdGl2ZSA9IGZhbHNlO1xyXG4gIH07XHJcbiAgcmV0dXJuIE1vdmVyO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsIlxyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBQaHlzaWNzUmVuZGVyZXIgPSBmdW5jdGlvbihsZW5ndGgpIHtcclxuICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb25fc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICAgIHRoaXMudmVsb2NpdHlfc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCAxLCAxLCAxMDAwKTtcclxuICAgIHRoaXMub3B0aW9uID0ge1xyXG4gICAgICB0eXBlOiBUSFJFRS5GbG9hdFR5cGUsXHJcbiAgICB9O1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24gPSBbXHJcbiAgICAgIG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldChsZW5ndGgsIGxlbmd0aCwgdGhpcy5vcHRpb24pLFxyXG4gICAgICBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQobGVuZ3RoLCBsZW5ndGgsIHRoaXMub3B0aW9uKSxcclxuICAgIF07XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gW1xyXG4gICAgICBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQobGVuZ3RoLCBsZW5ndGgsIHRoaXMub3B0aW9uKSxcclxuICAgICAgbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KGxlbmd0aCwgbGVuZ3RoLCB0aGlzLm9wdGlvbiksXHJcbiAgICBdO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb25fbWVzaCA9IHRoaXMuY3JlYXRlTWVzaChcclxuICAgICAgXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgdmVjMiB2VXY7XFxuXFxudm9pZCBtYWluKHZvaWQpIHtcXG4gIHZVdiA9IHV2O1xcbiAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcbn1cXG5cIixcclxuICAgICAgXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHZlbG9jaXR5O1xcbnVuaWZvcm0gc2FtcGxlcjJEIGFjY2VsZXJhdGlvbjtcXG51bmlmb3JtIHZlYzIgYW5jaG9yO1xcblxcbnZhcnlpbmcgdmVjMiB2VXY7XFxuXFxuI2RlZmluZSBQUkVDSVNJT04gMC4wMDAwMDFcXG5cXG52ZWMzIGRyYWcodmVjMyBhLCBmbG9hdCB2YWx1ZSkge1xcbiAgcmV0dXJuIG5vcm1hbGl6ZShhICogLTEuMCArIFBSRUNJU0lPTikgKiBsZW5ndGgoYSkgKiB2YWx1ZTtcXG59XFxuXFxudmVjMyBob29rKHZlYzMgdiwgdmVjMyBhbmNob3IsIGZsb2F0IHJlc3RfbGVuZ3RoLCBmbG9hdCBrKSB7XFxuICByZXR1cm4gbm9ybWFsaXplKHYgLSBhbmNob3IgKyBQUkVDSVNJT04pICogKC0xLjAgKiBrICogKGxlbmd0aCh2IC0gYW5jaG9yKSAtIHJlc3RfbGVuZ3RoKSk7XFxufVxcblxcbnZlYzMgYXR0cmFjdCh2ZWMzIHYxLCB2ZWMzIHYyLCBmbG9hdCBtMSwgZmxvYXQgbTIsIGZsb2F0IGcpIHtcXG4gIHJldHVybiBnICogbTEgKiBtMiAvIHBvdyhjbGFtcChsZW5ndGgodjIgLSB2MSksIDUuMCwgMzAuMCksIDIuMCkgKiBub3JtYWxpemUodjIgLSB2MSArIFBSRUNJU0lPTik7XFxufVxcblxcbnZvaWQgbWFpbih2b2lkKSB7XFxuICB2ZWMzIHYgPSB0ZXh0dXJlMkQodmVsb2NpdHksIHZVdikueHl6O1xcbiAgdmVjMyBhID0gdGV4dHVyZTJEKGFjY2VsZXJhdGlvbiwgdlV2KS54eXo7XFxuICB2ZWMzIGEyID0gYSArIG5vcm1hbGl6ZSh2ZWMzKFxcbiAgICBhbmNob3IueCAqIHJlc29sdXRpb24ueCAvIDYuMCArIFBSRUNJU0lPTixcXG4gICAgMC4wLFxcbiAgICBhbmNob3IueSAqIHJlc29sdXRpb24ueSAvIC0yLjAgKyBQUkVDSVNJT05cXG4gICkgLSB2KSAvIDIuMDtcXG4gIHZlYzMgYTMgPSBhMiArIGRyYWcoYTIsIDAuMDAzKTtcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoYTMsIDEuMCk7XFxufVxcblwiXHJcbiAgICApO1xyXG4gICAgdGhpcy52ZWxvY2l0eV9tZXNoID0gdGhpcy5jcmVhdGVNZXNoKFxyXG4gICAgICBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMyIHZVdjtcXG5cXG52b2lkIG1haW4odm9pZCkge1xcbiAgdlV2ID0gdXY7XFxuICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDEuMCk7XFxufVxcblwiLFxyXG4gICAgICBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHZlbG9jaXR5O1xcbnVuaWZvcm0gc2FtcGxlcjJEIGFjY2VsZXJhdGlvbjtcXG5cXG52YXJ5aW5nIHZlYzIgdlV2O1xcblxcbnZvaWQgbWFpbih2b2lkKSB7XFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHRleHR1cmUyRChhY2NlbGVyYXRpb24sIHZVdikueHl6ICsgdGV4dHVyZTJEKHZlbG9jaXR5LCB2VXYpLnh5eiwgMS4wKTtcXG59XFxuXCJcclxuICAgICk7XHJcbiAgICB0aGlzLnRhcmdldF9pbmRleCA9IDA7XHJcbiAgfTtcclxuICBQaHlzaWNzUmVuZGVyZXIucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24ocmVuZGVyZXIsIHZlbG9jaXR5X2FycmF5KSB7XHJcbiAgICAgIHZhciBhY2NlbGVyYXRpb25faW5pdF9tZXNoID0gbmV3IFRIUkVFLk1lc2goXHJcbiAgICAgICAgbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkoMiwgMiksXHJcbiAgICAgICAgbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgICAgIHZlcnRleFNoYWRlcjogJ3ZvaWQgbWFpbih2b2lkKSB7Z2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAxLjApO30nLFxyXG4gICAgICAgICAgZnJhZ21lbnRTaGFkZXI6ICd2b2lkIG1haW4odm9pZCkge2dsX0ZyYWdDb2xvciA9IHZlYzQoMC4wLCAwLjAsIDAuMCwgMS4wKTt9JyxcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgICB2YXIgdmVsb2NpdHlfaW5pdF90ZXggPSBuZXcgVEhSRUUuRGF0YVRleHR1cmUodmVsb2NpdHlfYXJyYXksIHRoaXMubGVuZ3RoLCB0aGlzLmxlbmd0aCwgVEhSRUUuUkdCRm9ybWF0LCBUSFJFRS5GbG9hdFR5cGUpO1xyXG4gICAgICB2ZWxvY2l0eV9pbml0X3RleC5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICAgIHZhciB2ZWxvY2l0eV9pbml0X21lc2ggPSBuZXcgVEhSRUUuTWVzaChcclxuICAgICAgICBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeSgyLCAyKSxcclxuICAgICAgICBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICAgICAgdmVsb2NpdHk6IHtcclxuICAgICAgICAgICAgICB0eXBlOiAndCcsXHJcbiAgICAgICAgICAgICAgdmFsdWU6IHZlbG9jaXR5X2luaXRfdGV4LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHZlcnRleFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgdmVjMiB2VXY7XFxuXFxudm9pZCBtYWluKHZvaWQpIHtcXG4gIHZVdiA9IHV2O1xcbiAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcbn1cXG5cIixcclxuICAgICAgICAgIGZyYWdtZW50U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBzYW1wbGVyMkQgdmVsb2NpdHk7XFxuXFxudmFyeWluZyB2ZWMyIHZVdjtcXG5cXG52b2lkIG1haW4odm9pZCkge1xcbiAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHZlbG9jaXR5LCB2VXYpO1xcbn1cXG5cIixcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG5cclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25fc2NlbmUuYWRkKHRoaXMuY2FtZXJhKTtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25fc2NlbmUuYWRkKGFjY2VsZXJhdGlvbl9pbml0X21lc2gpO1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIodGhpcy5hY2NlbGVyYXRpb25fc2NlbmUsIHRoaXMuY2FtZXJhLCB0aGlzLmFjY2VsZXJhdGlvblswXSk7XHJcbiAgICAgIHJlbmRlcmVyLnJlbmRlcih0aGlzLmFjY2VsZXJhdGlvbl9zY2VuZSwgdGhpcy5jYW1lcmEsIHRoaXMuYWNjZWxlcmF0aW9uWzFdKTtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25fc2NlbmUucmVtb3ZlKGFjY2VsZXJhdGlvbl9pbml0X21lc2gpO1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbl9zY2VuZS5hZGQodGhpcy5hY2NlbGVyYXRpb25fbWVzaCk7XHJcblxyXG4gICAgICB0aGlzLnZlbG9jaXR5X3NjZW5lLmFkZCh0aGlzLmNhbWVyYSk7XHJcbiAgICAgIHRoaXMudmVsb2NpdHlfc2NlbmUuYWRkKHZlbG9jaXR5X2luaXRfbWVzaCk7XHJcbiAgICAgIHJlbmRlcmVyLnJlbmRlcih0aGlzLnZlbG9jaXR5X3NjZW5lLCB0aGlzLmNhbWVyYSwgdGhpcy52ZWxvY2l0eVswXSk7XHJcbiAgICAgIHJlbmRlcmVyLnJlbmRlcih0aGlzLnZlbG9jaXR5X3NjZW5lLCB0aGlzLmNhbWVyYSwgdGhpcy52ZWxvY2l0eVsxXSk7XHJcbiAgICAgIHRoaXMudmVsb2NpdHlfc2NlbmUucmVtb3ZlKHZlbG9jaXR5X2luaXRfbWVzaCk7XHJcbiAgICAgIHRoaXMudmVsb2NpdHlfc2NlbmUuYWRkKHRoaXMudmVsb2NpdHlfbWVzaCk7XHJcbiAgICB9LFxyXG4gICAgY3JlYXRlTWVzaDogZnVuY3Rpb24odnMsIGZzKSB7XHJcbiAgICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChcclxuICAgICAgICBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeSgyLCAyKSxcclxuICAgICAgICBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICAgICAgcmVzb2x1dGlvbjoge1xyXG4gICAgICAgICAgICAgIHR5cGU6ICd2MicsXHJcbiAgICAgICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB2ZWxvY2l0eToge1xyXG4gICAgICAgICAgICAgIHR5cGU6ICd0JyxcclxuICAgICAgICAgICAgICB2YWx1ZTogbnVsbCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWNjZWxlcmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHZlcnRleFNoYWRlcjogdnMsXHJcbiAgICAgICAgICBmcmFnbWVudFNoYWRlcjogZnMsXHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHJlbmRlcmVyKSB7XHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uX21lc2gubWF0ZXJpYWwudW5pZm9ybXMuYWNjZWxlcmF0aW9uLnZhbHVlID0gdGhpcy5hY2NlbGVyYXRpb25bTWF0aC5hYnModGhpcy50YXJnZXRfaW5kZXggLSAxKV07XHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uX21lc2gubWF0ZXJpYWwudW5pZm9ybXMudmVsb2NpdHkudmFsdWUgPSB0aGlzLnZlbG9jaXR5W3RoaXMudGFyZ2V0X2luZGV4XTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMuYWNjZWxlcmF0aW9uX3NjZW5lLCB0aGlzLmNhbWVyYSwgdGhpcy5hY2NlbGVyYXRpb25bdGhpcy50YXJnZXRfaW5kZXhdKTtcclxuICAgICAgdGhpcy52ZWxvY2l0eV9tZXNoLm1hdGVyaWFsLnVuaWZvcm1zLmFjY2VsZXJhdGlvbi52YWx1ZSA9IHRoaXMuYWNjZWxlcmF0aW9uW3RoaXMudGFyZ2V0X2luZGV4XTtcclxuICAgICAgdGhpcy52ZWxvY2l0eV9tZXNoLm1hdGVyaWFsLnVuaWZvcm1zLnZlbG9jaXR5LnZhbHVlID0gdGhpcy52ZWxvY2l0eVt0aGlzLnRhcmdldF9pbmRleF07XHJcbiAgICAgIHJlbmRlcmVyLnJlbmRlcih0aGlzLnZlbG9jaXR5X3NjZW5lLCB0aGlzLmNhbWVyYSwgdGhpcy52ZWxvY2l0eVtNYXRoLmFicyh0aGlzLnRhcmdldF9pbmRleCAtIDEpXSk7XHJcbiAgICAgIHRoaXMudGFyZ2V0X2luZGV4ID0gTWF0aC5hYnModGhpcy50YXJnZXRfaW5kZXggLSAxKTtcclxuICAgIH0sXHJcbiAgICBnZXRDdXJyZW50VmVsb2NpdHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy52ZWxvY2l0eVtNYXRoLmFicyh0aGlzLnRhcmdldF9pbmRleCAtIDEpXTtcclxuICAgIH0sXHJcbiAgICBnZXRDdXJyZW50QWNjZWxlcmF0aW9uOiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuYWNjZWxlcmF0aW9uW01hdGguYWJzKHRoaXMudGFyZ2V0X2luZGV4IC0gMSldO1xyXG4gICAgfSxcclxuICAgIHJlc2l6ZTogZnVuY3Rpb24obGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5WzBdLnNldFNpemUobGVuZ3RoLCBsZW5ndGgpO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5WzFdLnNldFNpemUobGVuZ3RoLCBsZW5ndGgpO1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvblswXS5zZXRTaXplKGxlbmd0aCwgbGVuZ3RoKTtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25bMV0uc2V0U2l6ZShsZW5ndGgsIGxlbmd0aCk7XHJcbiAgICB9LFxyXG4gIH07XHJcbiAgcmV0dXJuIFBoeXNpY3NSZW5kZXJlcjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgUG9pbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICB0aGlzLm1hdGVyaWFsID0gbnVsbDtcclxuICAgIHRoaXMub2JqID0gbnVsbDtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgUG9pbnRzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgUG9pbnRzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvaW50cztcclxuICBQb2ludHMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihwYXJhbSkge1xyXG4gICAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgY29sb3I6IHsgdHlwZTogJ2MnLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKDB4ZmZmZmZmKSB9LFxyXG4gICAgICAgIHRleHR1cmU6IHsgdHlwZTogJ3QnLCB2YWx1ZTogcGFyYW0udGV4dHVyZSB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogcGFyYW0udnMsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBwYXJhbS5mcyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxyXG4gICAgICBibGVuZGluZzogcGFyYW0uYmxlbmRpbmdcclxuICAgIH0pO1xyXG4gICAgdGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwYXJhbS5wb3NpdGlvbnMsIDMpKTtcclxuICAgIHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdjdXN0b21Db2xvcicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocGFyYW0uY29sb3JzLCAzKSk7XHJcbiAgICB0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgndmVydGV4T3BhY2l0eScsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocGFyYW0ub3BhY2l0aWVzLCAxKSk7XHJcbiAgICB0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnc2l6ZScsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocGFyYW0uc2l6ZXMsIDEpKTtcclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLlBvaW50cyh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICAgIHBhcmFtLnNjZW5lLmFkZCh0aGlzLm9iaik7XHJcbiAgfTtcclxuICBQb2ludHMucHJvdG90eXBlLnVwZGF0ZVBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5vYmoucG9zaXRpb24uY29weSh0aGlzLnZlbG9jaXR5KTtcclxuICAgIHRoaXMub2JqLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24ubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5vYmouZ2VvbWV0cnkuYXR0cmlidXRlcy52ZXJ0ZXhPcGFjaXR5Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMub2JqLmdlb21ldHJ5LmF0dHJpYnV0ZXMuc2l6ZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB0aGlzLm9iai5nZW9tZXRyeS5hdHRyaWJ1dGVzLmN1c3RvbUNvbG9yLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICB9O1xyXG4gIHJldHVybiBQb2ludHM7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIGV4cG9ydHMgPSB7XHJcbiAgZ2V0UmFuZG9tSW50OiBmdW5jdGlvbihtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xyXG4gIH0sXHJcbiAgZ2V0RGVncmVlOiBmdW5jdGlvbihyYWRpYW4pIHtcclxuICAgIHJldHVybiByYWRpYW4gLyBNYXRoLlBJICogMTgwO1xyXG4gIH0sXHJcbiAgZ2V0UmFkaWFuOiBmdW5jdGlvbihkZWdyZWVzKSB7XHJcbiAgICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XHJcbiAgfSxcclxuICBnZXRQb2xhckNvb3JkOiBmdW5jdGlvbihyYWQxLCByYWQyLCByKSB7XHJcbiAgICB2YXIgeCA9IE1hdGguY29zKHJhZDEpICogTWF0aC5jb3MocmFkMikgKiByO1xyXG4gICAgdmFyIHogPSBNYXRoLmNvcyhyYWQxKSAqIE1hdGguc2luKHJhZDIpICogcjtcclxuICAgIHZhciB5ID0gTWF0aC5zaW4ocmFkMSkgKiByO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IzKHgsIHksIHopO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cztcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBbXHJcbiAge1xyXG4gICAgbmFtZTogJ2F0dHJhY3QnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2F0dHJhY3QnKSxcclxuICAgIHBvc3RlZDogJzIwMTYuNi4xMycsXHJcbiAgICB1cGRhdGU6ICcyMDE2LjcuMicsXHJcbiAgICBkZXNjcmlwdGlvbjogJ3VzZSBmcmFnbWVudCBzaGFkZXIgdG8gcGVydGljbGUgbW92aW5nLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnaG9sZScsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvaG9sZScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNi41LjEwJyxcclxuICAgIHVwZGF0ZTogJzIwMTYuNy4yJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnc3R1ZHkgb2YgUG9zdCBFZmZlY3QgdGhhdCB1c2VkIFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0LicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnbWV0YWwgY3ViZScsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvbWV0YWxfY3ViZScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNi40LjIxJyxcclxuICAgIHVwZGF0ZTogJycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ3N0dWR5IG9mIHJheW1hcmNoaW5nIHVzaW5nIHRocmVlLmpzLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnZGlzdG9ydCcsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvZGlzdG9ydCcpLFxyXG4gICAgcG9zdGVkOiAnMjAxNi4yLjIzJyxcclxuICAgIHVwZGF0ZTogJzIwMTYuNS4xMCcsXHJcbiAgICBkZXNjcmlwdGlvbjogJ3VzaW5nIHRoZSBzaW1wbGV4IG5vaXNlLCBkaXN0b3J0IHRoZSBzcGhlcmUuJyxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6ICdpbWFnZSBkYXRhJyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9pbWFnZV9kYXRhJyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjEyLjknLFxyXG4gICAgdXBkYXRlOiAnMjAxNS4xMi4xMicsXHJcbiAgICBkZXNjcmlwdGlvbjogJ1BvaW50cyBiYXNlZCBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQuZ2V0SW1hZ2VEYXRhKCknLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2dhbGxlcnknLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2dhbGxlcnknKSxcclxuICAgIHBvc3RlZDogJzIwMTUuMTIuMicsXHJcbiAgICB1cGRhdGU6ICcyMDE1LjEyLjknLFxyXG4gICAgZGVzY3JpcHRpb246ICdpbWFnZSBnYWxsZXJ5IG9uIDNkLiB0ZXN0ZWQgdGhhdCBwaWNrZWQgb2JqZWN0IGFuZCBtb3ZpbmcgY2FtZXJhLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnY29tZXQnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2NvbWV0JyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjExLjI0JyxcclxuICAgIHVwZGF0ZTogJzIwMTYuMS44JyxcclxuICAgIGRlc2NyaXB0aW9uOiAnY2FtZXJhIHRvIHRyYWNrIHRoZSBtb3ZpbmcgcG9pbnRzLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnaHlwZXIgc3BhY2UnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2h5cGVyX3NwYWNlJyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjExLjEyJyxcclxuICAgIHVwZGF0ZTogJycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ2FkZCBsaXR0bGUgY2hhbmdlIGFib3V0IGNhbWVyYSBhbmdsZSBhbmQgcGFydGljbGUgY29udHJvbGVzLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnZmlyZSBiYWxsJyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9maXJlX2JhbGwnKSxcclxuICAgIHBvc3RlZDogJzIwMTUuMTEuMTInLFxyXG4gICAgdXBkYXRlOiAnJyxcclxuICAgIGRlc2NyaXB0aW9uOiAndGVzdCBvZiBzaW1wbGUgcGh5c2ljcyBhbmQgYWRkaXRpdmUgYmxlbmRpbmcuJyxcclxuICB9XHJcbl07XHJcbiIsIlxyXG52YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgUGh5c2ljc1JlbmRlcmVyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9waHlzaWNzX3JlbmRlcmVyJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpO1xyXG4gIH07XHJcblxyXG4gIHZhciBsZW5ndGggPSAxMDAwO1xyXG4gIHZhciBwaHlzaWNzX3JlbmRlcmVyID0gbnVsbDtcclxuXHJcbiAgdmFyIGNyZWF0ZVBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICB2YXIgdmVydGljZXNfYmFzZSA9IFtdO1xyXG4gICAgdmFyIHV2c19iYXNlID0gW107XHJcbiAgICB2YXIgY29sb3JzX2Jhc2UgPSBbXTtcclxuICAgIHZhciBtYXNzZXNfYmFzZSA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBNYXRoLnBvdyhsZW5ndGgsIDIpOyBpKyspIHtcclxuICAgICAgdmVydGljZXNfYmFzZS5wdXNoKDAsIDAsIDApO1xyXG4gICAgICB1dnNfYmFzZS5wdXNoKFxyXG4gICAgICAgIGkgJSBsZW5ndGggKiAoMSAvIChsZW5ndGggLSAxKSksXHJcbiAgICAgICAgTWF0aC5mbG9vcihpIC8gbGVuZ3RoKSAqICgxIC8gKGxlbmd0aCAtIDEpKVxyXG4gICAgICApO1xyXG4gICAgICBjb2xvcnNfYmFzZS5wdXNoKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDEyMCkgLyAzNjAsIDAuOCwgMSk7XHJcbiAgICAgIG1hc3Nlc19iYXNlLnB1c2goVXRpbC5nZXRSYW5kb21JbnQoMSwgMTAwKSk7XHJcbiAgICB9XHJcbiAgICB2YXIgdmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzX2Jhc2UpO1xyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUodmVydGljZXMsIDMpKTtcclxuICAgIHZhciB1dnMgPSBuZXcgRmxvYXQzMkFycmF5KHV2c19iYXNlKTtcclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgndXYyJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh1dnMsIDIpKTtcclxuICAgIHZhciBjb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KGNvbG9yc19iYXNlKTtcclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnY29sb3InLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKGNvbG9ycywgMykpO1xyXG4gICAgdmFyIG1hc3NlcyA9IG5ldyBGbG9hdDMyQXJyYXkobWFzc2VzX2Jhc2UpO1xyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdtYXNzJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShtYXNzZXMsIDEpKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB2ZWxvY2l0eToge1xyXG4gICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5UZXh0dXJlKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFjY2VsZXJhdGlvbjoge1xyXG4gICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5UZXh0dXJlKClcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMyIHV2MjtcXG5hdHRyaWJ1dGUgdmVjMyBjb2xvcjtcXG5hdHRyaWJ1dGUgZmxvYXQgbWFzcztcXG5cXG51bmlmb3JtIHNhbXBsZXIyRCB2ZWxvY2l0eTtcXG51bmlmb3JtIHNhbXBsZXIyRCBhY2NlbGVyYXRpb247XFxuXFxudmFyeWluZyBmbG9hdCB2QWNjZWxlcmF0aW9uO1xcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxudmFyeWluZyBmbG9hdCB2T3BhY2l0eTtcXG5cXG52b2lkIG1haW4odm9pZCkge1xcbiAgdmVjNCB1cGRhdGVfcG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB0ZXh0dXJlMkQodmVsb2NpdHksIHV2Mik7XFxuICB2QWNjZWxlcmF0aW9uID0gbGVuZ3RoKHRleHR1cmUyRChhY2NlbGVyYXRpb24sIHV2MikueHl6KSAqIG1hc3M7XFxuICB2Q29sb3IgPSBjb2xvcjtcXG4gIHZPcGFjaXR5ID0gMC42ICogKDMwMC4wIC8gbGVuZ3RoKHVwZGF0ZV9wb3NpdGlvbi54eXopKTtcXG4gIGdsX1BvaW50U2l6ZSA9IDIuMCAqICgzMDAuMCAvIGxlbmd0aCh1cGRhdGVfcG9zaXRpb24ueHl6KSk7XFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB1cGRhdGVfcG9zaXRpb247XFxufVxcblwiLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgZmxvYXQgdkFjY2VsZXJhdGlvbjtcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcbnZhcnlpbmcgZmxvYXQgdk9wYWNpdHk7XFxuXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcblxcbnZlYzMgaHN2MnJnYl8xXzAodmVjMyBjKXtcXG4gIHZlYzQgSyA9IHZlYzQoMS4wLCAyLjAgLyAzLjAsIDEuMCAvIDMuMCwgMy4wKTtcXG4gIHZlYzMgcCA9IGFicyhmcmFjdChjLnh4eCArIEsueHl6KSAqIDYuMCAtIEsud3d3KTtcXG4gIHJldHVybiBjLnogKiBtaXgoSy54eHgsIGNsYW1wKHAgLSBLLnh4eCwgMC4wLCAxLjApLCBjLnkpO1xcbn1cXG5cXG5cXG5cXG52b2lkIG1haW4odm9pZCkge1xcbiAgdmVjMyBuO1xcbiAgbi54eSA9IGdsX1BvaW50Q29vcmQgKiAyLjAgLSAxLjA7XFxuICBuLnogPSAxLjAgLSBkb3Qobi54eSwgbi54eSk7XFxuICBpZiAobi56IDwgMC4wKSBkaXNjYXJkO1xcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChoc3YycmdiXzFfMCh2ZWMzKHZDb2xvci54ICsgdGltZSAvIDM2MDAuMCwgdkNvbG9yLnksIHZDb2xvci56KSksIHZPcGFjaXR5KTtcXG59XFxuXCIsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxyXG4gICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcclxuICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfVxyXG4gIHZhciBwb2ludHMgPSBjcmVhdGVQb2ludHMoKTtcclxuXHJcbiAgdmFyIGNyZWF0ZVBvaW50c0ludFZlbG9jaXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdmVydGljZXMgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgTWF0aC5wb3cobGVuZ3RoLCAyKTsgaSsrKSB7XHJcbiAgICAgIHZhciB2ID0gVXRpbC5nZXRQb2xhckNvb3JkKFxyXG4gICAgICAgIFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpLFxyXG4gICAgICAgIFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpLFxyXG4gICAgICAgIFV0aWwuZ2V0UmFuZG9tSW50KDEwLCAxMDAwKVxyXG4gICAgICApO1xyXG4gICAgICB2ZXJ0aWNlcy5wdXNoKHYueCwgdi55IC8gMTAuMCwgdi56KTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKTtcclxuICB9XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcikge1xyXG4gICAgICBwaHlzaWNzX3JlbmRlcmVyID0gbmV3IFBoeXNpY3NSZW5kZXJlcihsZW5ndGgpO1xyXG4gICAgICBwaHlzaWNzX3JlbmRlcmVyLmluaXQocmVuZGVyZXIsIGNyZWF0ZVBvaW50c0ludFZlbG9jaXR5KCkpO1xyXG4gICAgICBwaHlzaWNzX3JlbmRlcmVyLmFjY2VsZXJhdGlvbl9tZXNoLm1hdGVyaWFsLnVuaWZvcm1zLmFuY2hvciA9IHtcclxuICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMigpLFxyXG4gICAgICB9XHJcbiAgICAgIHNjZW5lLmFkZChwb2ludHMpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgwLCAxNSwgNjAwKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpIHtcclxuICAgICAgcGh5c2ljc19yZW5kZXJlci5yZW5kZXIocmVuZGVyZXIpO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSsrO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwudW5pZm9ybXMudmVsb2NpdHkudmFsdWUgPSBwaHlzaWNzX3JlbmRlcmVyLmdldEN1cnJlbnRWZWxvY2l0eSgpO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwudW5pZm9ybXMuYWNjZWxlcmF0aW9uLnZhbHVlID0gcGh5c2ljc19yZW5kZXJlci5nZXRDdXJyZW50QWNjZWxlcmF0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4wMjUpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlTG9vaygpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIHBoeXNpY3NfcmVuZGVyZXIuYWNjZWxlcmF0aW9uX21lc2gubWF0ZXJpYWwudW5pZm9ybXMuYW5jaG9yLnZhbHVlLmNvcHkodmVjdG9yX21vdXNlX21vdmUpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcGh5c2ljc19yZW5kZXJlci5hY2NlbGVyYXRpb25fbWVzaC5tYXRlcmlhbC51bmlmb3Jtcy5hbmNob3IudmFsdWUuc2V0KDAsIDAsIDApO1xyXG4gICAgfSxcclxuICAgIHJlc2l6ZVdpbmRvdzogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMiA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UyJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbW92ZXInKTtcclxudmFyIFBvaW50cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRzLmpzJyk7XHJcbnZhciBGb3JjZUhlbWlzcGhlcmVMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2VfaGVtaXNwaGVyZV9saWdodCcpO1xyXG52YXIgRm9yY2VQb2ludExpZ2h0ID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZV9wb2ludF9saWdodCcpO1xyXG5cclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEpO1xyXG4gIH07XHJcbiAgdmFyIG1vdmVyc19udW0gPSAxMDAwMDtcclxuICB2YXIgbW92ZXJzID0gW107XHJcbiAgdmFyIG1vdmVyX2FjdGl2YXRlX2NvdW50ID0gMjtcclxuICB2YXIgcG9pbnRzID0gbmV3IFBvaW50cygpO1xyXG4gIHZhciBoZW1pX2xpZ2h0ID0gbnVsbDtcclxuICB2YXIgY29tZXRfbGlnaHQxID0gbnVsbDtcclxuICB2YXIgY29tZXRfbGlnaHQyID0gbnVsbDtcclxuICB2YXIgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIGNvbWV0ID0gbnVsbDtcclxuICB2YXIgY29tZXRfcmFkaXVzID0gMzA7XHJcbiAgdmFyIGNvbWV0X3NjYWxlID0gbmV3IEZvcmNlMigpO1xyXG4gIHZhciBjb21ldF9jb2xvcl9oID0gMTQwO1xyXG4gIHZhciBjb2xvcl9kaWZmID0gNDU7XHJcbiAgdmFyIHBsYW5ldCA9IG51bGw7XHJcbiAgdmFyIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGxhc3RfdGltZV9wbHVzX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICB2YXIgbGFzdF90aW1lX2JvdW5jZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGxhc3RfdGltZV90b3VjaCA9IERhdGUubm93KCk7XHJcbiAgdmFyIHBsdXNfYWNjZWxlcmF0aW9uID0gMDtcclxuICB2YXIgaXNfdG91Y2hlZCA9IGZhbHNlO1xyXG4gIHZhciBpc19wbHVzX2FjdGl2YXRlID0gZmFsc2U7XHJcbiAgdmFyIHRyYWNrX3BvaW50cyA9IHRydWU7XHJcblxyXG4gIHZhciB1cGRhdGVNb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICB2YXIgcG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZlKSB7XHJcbiAgICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgaWYgKG1vdmVyLnRpbWUgPiAxMCkge1xyXG4gICAgICAgICAgbW92ZXIuc2l6ZSAtPSAyO1xyXG4gICAgICAgICAgLy9tb3Zlci5hIC09IDAuMDQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtb3Zlci5zaXplIDw9IDApIHtcclxuICAgICAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xyXG4gICAgICAgICAgbW92ZXIudGltZSA9IDA7XHJcbiAgICAgICAgICBtb3Zlci5hID0gMC4wO1xyXG4gICAgICAgICAgbW92ZXIuaW5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnZlbG9jaXR5LnggLSBwb2ludHMudmVsb2NpdHkueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci52ZWxvY2l0eS55IC0gcG9pbnRzLnZlbG9jaXR5Lnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIudmVsb2NpdHkueiAtIHBvaW50cy52ZWxvY2l0eS56O1xyXG4gICAgICBjb2xvcnNbaSAqIDMgKyAwXSA9IG1vdmVyLmNvbG9yLnI7XHJcbiAgICAgIGNvbG9yc1tpICogMyArIDFdID0gbW92ZXIuY29sb3IuZztcclxuICAgICAgY29sb3JzW2kgKiAzICsgMl0gPSBtb3Zlci5jb2xvci5iO1xyXG4gICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICB9XHJcbiAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGFjdGl2YXRlTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb3VudCA9IDA7XHJcbiAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGlmIChub3cgLSBsYXN0X3RpbWVfYWN0aXZhdGUgPiAxMCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgICBpZiAobW92ZXIuaXNfYWN0aXZlKSBjb250aW51ZTtcclxuICAgICAgICB2YXIgcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICAgIHZhciByYWQyID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgICAgdmFyIHJhbmdlID0gVXRpbC5nZXRSYW5kb21JbnQoMSwgMzApO1xyXG4gICAgICAgIHZhciB2ZWN0b3IgPSBVdGlsLmdldFBvbGFyQ29vcmQocmFkMSwgcmFkMiwgcmFuZ2UpO1xyXG4gICAgICAgIHZhciBmb3JjZSA9IFV0aWwuZ2V0UG9sYXJDb29yZChyYWQxLCByYWQyLCByYW5nZSAvIDIwKTtcclxuICAgICAgICB2YXIgaCA9IFV0aWwuZ2V0UmFuZG9tSW50KGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmLCBjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZikgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNTtcclxuICAgICAgICB2YXIgcyA9IFV0aWwuZ2V0UmFuZG9tSW50KDYwLCA4MCk7XHJcbiAgICAgICAgdmVjdG9yLmFkZChwb2ludHMudmVsb2NpdHkpO1xyXG4gICAgICAgIG1vdmVyLmFjdGl2YXRlKCk7XHJcbiAgICAgICAgbW92ZXIuaW5pdCh2ZWN0b3IpO1xyXG4gICAgICAgIG1vdmVyLmNvbG9yLnNldEhTTChoIC8gMzYwLCBzIC8gMTAwLCAwLjcpO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gICAgICAgIG1vdmVyLmEgPSAxO1xyXG4gICAgICAgIG1vdmVyLnNpemUgPSAyNTtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgIGlmIChjb3VudCA+PSBtb3Zlcl9hY3RpdmF0ZV9jb3VudCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgcm90YXRlQ29tZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbWV0LnJvdGF0aW9uLnggKz0gMC4wMyArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwMDtcclxuICAgIGNvbWV0LnJvdGF0aW9uLnkgKz0gMC4wMSArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwMDtcclxuICAgIGNvbWV0LnJvdGF0aW9uLnogKz0gMC4wMSArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwMDtcclxuICAgIHBvaW50cy5yYWQxX2Jhc2UgKz0gVXRpbC5nZXRSYWRpYW4oLjYpO1xyXG4gICAgcG9pbnRzLnJhZDEgPSBVdGlsLmdldFJhZGlhbihNYXRoLnNpbihwb2ludHMucmFkMV9iYXNlKSAqIDQ1ICsgcGx1c19hY2NlbGVyYXRpb24gLyAxMDApO1xyXG4gICAgcG9pbnRzLnJhZDIgKz0gVXRpbC5nZXRSYWRpYW4oMC44ICsgcGx1c19hY2NlbGVyYXRpb24gLyAxMDApO1xyXG4gICAgcG9pbnRzLnJhZDMgKz0gMC4wMTtcclxuICAgIHJldHVybiBVdGlsLmdldFBvbGFyQ29vcmQocG9pbnRzLnJhZDEsIHBvaW50cy5yYWQyLCAzNTApO1xyXG4gIH07XHJcblxyXG4gIHZhciByb3RhdGVDb21ldENvbG9yID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcmFkaXVzID0gY29tZXRfcmFkaXVzICogMC44O1xyXG4gICAgY29tZXRfbGlnaHQxLnBvc2l0aW9uLmNvcHkoVXRpbC5nZXRQb2xhckNvb3JkKFV0aWwuZ2V0UmFkaWFuKDApLCAgVXRpbC5nZXRSYWRpYW4oMCksIHJhZGl1cykuYWRkKHBvaW50cy52ZWxvY2l0eSkpO1xyXG4gICAgY29tZXRfbGlnaHQyLnBvc2l0aW9uLmNvcHkoVXRpbC5nZXRQb2xhckNvb3JkKFV0aWwuZ2V0UmFkaWFuKDE4MCksIFV0aWwuZ2V0UmFkaWFuKDApLCByYWRpdXMpLmFkZChwb2ludHMudmVsb2NpdHkpKTtcclxuICB9O1xyXG5cclxuICB2YXIgYm91bmNlQ29tZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChEYXRlLm5vdygpIC0gbGFzdF90aW1lX2JvdW5jZSA+IDEwMDAgLSBwbHVzX2FjY2VsZXJhdGlvbiAqIDMpIHtcclxuICAgICAgY29tZXRfc2NhbGUuYXBwbHlGb3JjZShuZXcgVEhSRUUuVmVjdG9yMigwLjA4ICsgcGx1c19hY2NlbGVyYXRpb24gLyA1MDAwLCAwKSk7XHJcbiAgICAgIGxhc3RfdGltZV9ib3VuY2UgPSBEYXRlLm5vdygpO1xyXG4gICAgICBpc19wbHVzX2FjdGl2YXRlID0gdHJ1ZTtcclxuICAgICAgbGFzdF90aW1lX3BsdXNfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzX3BsdXNfYWN0aXZhdGUgJiYgRGF0ZS5ub3coKSAtIGxhc3RfdGltZV9wbHVzX2FjdGl2YXRlIDwgNTAwKSB7XHJcbiAgICAgIG1vdmVyX2FjdGl2YXRlX2NvdW50ID0gNiArIE1hdGguZmxvb3IocGx1c19hY2NlbGVyYXRpb24gLyA0MCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtb3Zlcl9hY3RpdmF0ZV9jb3VudCA9IDEgKyBNYXRoLmZsb29yKHBsdXNfYWNjZWxlcmF0aW9uIC8gNDApO1xyXG4gICAgfVxyXG4gICAgY29tZXRfc2NhbGUuYXBwbHlIb29rKDAsIDAuMSk7XHJcbiAgICBjb21ldF9zY2FsZS5hcHBseURyYWcoMC4xMik7XHJcbiAgICBjb21ldF9zY2FsZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgY29tZXQuc2NhbGUuc2V0KDEgKyBjb21ldF9zY2FsZS52ZWxvY2l0eS54LCAxICsgY29tZXRfc2NhbGUudmVsb2NpdHkueCwgMSArIGNvbWV0X3NjYWxlLnZlbG9jaXR5LngpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVUZXh0dXJlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB2YXIgZ3JhZCA9IG51bGw7XHJcbiAgICB2YXIgdGV4dHVyZSA9IG51bGw7XHJcblxyXG4gICAgY2FudmFzLndpZHRoID0gMjAwO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IDIwMDtcclxuICAgIGdyYWQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoMTAwLCAxMDAsIDIwLCAxMDAsIDEwMCwgMTAwKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuOSwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMSknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEuMCwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMCknKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xyXG4gICAgY3R4LmFyYygxMDAsIDEwMCwgMTAwLCAwLCBNYXRoLlBJIC8gMTgwLCB0cnVlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVDb21tZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBiYXNlX2dlb21ldHJ5ID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeShjb21ldF9yYWRpdXMsIDIpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBjb2xvcjogbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIGNvbWV0X2NvbG9yX2ggKyAnLCAxMDAlLCAxMDAlKScpLFxyXG4gICAgICBzaGFkaW5nOiBUSFJFRS5GbGF0U2hhZGluZ1xyXG4gICAgfSk7XHJcbiAgICB2YXIgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShiYXNlX2dlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aCAqIDMpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiYXNlX2dlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogM10gPSBiYXNlX2dlb21ldHJ5LnZlcnRpY2VzW2ldLng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gYmFzZV9nZW9tZXRyeS52ZXJ0aWNlc1tpXS55O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IGJhc2VfZ2VvbWV0cnkudmVydGljZXNbaV0uejtcclxuICAgIH1cclxuICAgIHZhciBpbmRpY2VzID0gbmV3IFVpbnQzMkFycmF5KGJhc2VfZ2VvbWV0cnkuZmFjZXMubGVuZ3RoICogMyk7XHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGJhc2VfZ2VvbWV0cnkuZmFjZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgaW5kaWNlc1tqICogM10gPSBiYXNlX2dlb21ldHJ5LmZhY2VzW2pdLmE7XHJcbiAgICAgIGluZGljZXNbaiAqIDMgKyAxXSA9IGJhc2VfZ2VvbWV0cnkuZmFjZXNbal0uYjtcclxuICAgICAgaW5kaWNlc1tqICogMyArIDJdID0gYmFzZV9nZW9tZXRyeS5mYWNlc1tqXS5jO1xyXG4gICAgfVxyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocG9zaXRpb25zLCAzKSk7XHJcbiAgICBnZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uLmR5bmFtaWMgPSB0cnVlO1xyXG4gICAgZ2VvbWV0cnkuc2V0SW5kZXgobmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShpbmRpY2VzLCAxKSk7XHJcbiAgICBnZW9tZXRyeS5pbmRleC5keW5hbWljID0gdHJ1ZTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVQbGFuZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5PY3RhaGVkcm9uR2VvbWV0cnkoMjUwLCA0KTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIGNvbG9yOiAweDIyMjIyMixcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmdcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGFjY2VsZXJhdGVDb21ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGlzX3RvdWNoZWQgJiYgcGx1c19hY2NlbGVyYXRpb24gPCAyMDApIHtcclxuICAgICAgcGx1c19hY2NlbGVyYXRpb24gKz0gMTtcclxuICAgIH0gZWxzZSBpZihwbHVzX2FjY2VsZXJhdGlvbiA+IDApIHtcclxuICAgICAgcGx1c19hY2NlbGVyYXRpb24gLT0gMTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBjb21ldCA9IGNyZWF0ZUNvbW1ldCgpO1xyXG4gICAgICBzY2VuZS5hZGQoY29tZXQpO1xyXG4gICAgICBwbGFuZXQgPSBjcmVhdGVQbGFuZXQoKTtcclxuICAgICAgc2NlbmUuYWRkKHBsYW5ldCk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzX251bTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XHJcbiAgICAgICAgdmFyIGggPSBVdGlsLmdldFJhbmRvbUludChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZiwgY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYpO1xyXG4gICAgICAgIHZhciBzID0gVXRpbC5nZXRSYW5kb21JbnQoNjAsIDgwKTtcclxuICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKFV0aWwuZ2V0UmFuZG9tSW50KC0xMDAsIDEwMCksIDAsIDApKTtcclxuICAgICAgICBtb3Zlci5jb2xvciA9IG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyBoICsgJywgJyArIHMgKyAnJSwgNzAlKScpO1xyXG4gICAgICAgIG1vdmVycy5wdXNoKG1vdmVyKTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnZlbG9jaXR5Lng7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci52ZWxvY2l0eS55O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIudmVsb2NpdHkuejtcclxuICAgICAgICBjb2xvcnNbaSAqIDMgKyAwXSA9IG1vdmVyLmNvbG9yLnI7XHJcbiAgICAgICAgY29sb3JzW2kgKiAzICsgMV0gPSBtb3Zlci5jb2xvci5nO1xyXG4gICAgICAgIGNvbG9yc1tpICogMyArIDJdID0gbW92ZXIuY29sb3IuYjtcclxuICAgICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgICAgfVxyXG4gICAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgICAgc2NlbmU6IHNjZW5lLFxyXG4gICAgICAgIHZzOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgY3VzdG9tQ29sb3I7XFxuYXR0cmlidXRlIGZsb2F0IHZlcnRleE9wYWNpdHk7XFxuYXR0cmlidXRlIGZsb2F0IHNpemU7XFxuXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcblxcbnZvaWQgbWFpbigpIHtcXG4gIHZDb2xvciA9IGN1c3RvbUNvbG9yO1xcbiAgZk9wYWNpdHkgPSB2ZXJ0ZXhPcGFjaXR5O1xcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXG4gIGdsX1BvaW50U2l6ZSA9IHNpemUgKiAoMzAwLjAgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKTtcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxufVxcblwiLFxyXG4gICAgICAgIGZzOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxuXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcblxcbnZvaWQgbWFpbigpIHtcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXG59XFxuXCIsXHJcbiAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXHJcbiAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgICAgc2l6ZXM6IHNpemVzLFxyXG4gICAgICAgIHRleHR1cmU6IGNyZWF0ZVRleHR1cmUoKSxcclxuICAgICAgICBibGVuZGluZzogVEhSRUUuTm9ybWFsQmxlbmRpbmdcclxuICAgICAgfSk7XHJcbiAgICAgIHBvaW50cy5yYWQxID0gMDtcclxuICAgICAgcG9pbnRzLnJhZDFfYmFzZSA9IDA7XHJcbiAgICAgIHBvaW50cy5yYWQyID0gMDtcclxuICAgICAgcG9pbnRzLnJhZDMgPSAwO1xyXG4gICAgICBoZW1pX2xpZ2h0ID0gbmV3IEZvcmNlSGVtaXNwaGVyZUxpZ2h0KFxyXG4gICAgICAgIG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyAoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYpICsgJywgNTAlLCA2MCUpJykuZ2V0SGV4KCksXHJcbiAgICAgICAgbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIChjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZikgKyAnLCA1MCUsIDYwJSknKS5nZXRIZXgoKSxcclxuICAgICAgICAxXHJcbiAgICAgICk7XHJcbiAgICAgIHNjZW5lLmFkZChoZW1pX2xpZ2h0KTtcclxuICAgICAgY29tZXRfbGlnaHQxID0gbmV3IEZvcmNlUG9pbnRMaWdodCgnaHNsKCcgKyAoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYpICsgJywgNjAlLCA1MCUpJywgMSwgNTAwLCAxKTtcclxuICAgICAgc2NlbmUuYWRkKGNvbWV0X2xpZ2h0MSk7XHJcbiAgICAgIGNvbWV0X2xpZ2h0MiA9IG5ldyBGb3JjZVBvaW50TGlnaHQoJ2hzbCgnICsgKGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmKSArICcsIDYwJSwgNTAlKScsIDEsIDUwMCwgMSk7XHJcbiAgICAgIHNjZW5lLmFkZChjb21ldF9saWdodDIpO1xyXG4gICAgICBjYW1lcmEuYW5jaG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoMTUwMCwgMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBjb21ldC5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGNvbWV0Lm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGNvbWV0KTtcclxuICAgICAgcGxhbmV0Lmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcGxhbmV0Lm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBsYW5ldCk7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMub2JqKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGhlbWlfbGlnaHQpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoY29tZXRfbGlnaHQxKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGNvbWV0X2xpZ2h0Mik7XHJcbiAgICAgIG1vdmVycyA9IFtdO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBhY2NlbGVyYXRlQ29tZXQoKTtcclxuICAgICAgcG9pbnRzLnZlbG9jaXR5ID0gcm90YXRlQ29tZXQoKTtcclxuICAgICAgaWYgKHRyYWNrX3BvaW50cyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IuY29weShcclxuICAgICAgICAgIHBvaW50cy52ZWxvY2l0eS5jbG9uZSgpLmFkZChcclxuICAgICAgICAgICAgcG9pbnRzLnZlbG9jaXR5LmNsb25lKCkuc3ViKHBvaW50cy5vYmoucG9zaXRpb24pLm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKC00MDApXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnkgKz0gcG9pbnRzLnZlbG9jaXR5LnkgKiAyO1xyXG4gICAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgIH1cclxuICAgICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gICAgICBjb21ldC5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgIGhlbWlfbGlnaHQuY29sb3Iuc2V0SFNMKChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZiAtIHBsdXNfYWNjZWxlcmF0aW9uIC8gMS41KSAvIDM2MCwgMC41LCAwLjYpO1xyXG4gICAgICBoZW1pX2xpZ2h0Lmdyb3VuZENvbG9yLnNldEhTTCgoY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNSkgLyAzNjAsIDAuNSwgMC42KTtcclxuICAgICAgY29tZXRfbGlnaHQxLnBvc2l0aW9uLmNvcHkocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgY29tZXRfbGlnaHQxLmNvbG9yLnNldEhTTCgoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNSkgLyAzNjAsIDAuNSwgMC42KTtcclxuICAgICAgY29tZXRfbGlnaHQyLnBvc2l0aW9uLmNvcHkocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgY29tZXRfbGlnaHQyLmNvbG9yLnNldEhTTCgoY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNSkgLyAzNjAsIDAuNSwgMC42KTtcclxuICAgICAgYWN0aXZhdGVNb3ZlcigpO1xyXG4gICAgICB1cGRhdGVNb3ZlcigpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5SG9vaygwLCAwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZUxvb2soKTtcclxuICAgICAgcm90YXRlQ29tZXRDb2xvcigpO1xyXG4gICAgICBib3VuY2VDb21ldCgpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBpc190b3VjaGVkID0gdHJ1ZTtcclxuICAgICAgbGFzdF90aW1lX3RvdWNoID0gRGF0ZS5ub3coKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICAgICAgaWYgKERhdGUubm93KCkgLSBsYXN0X3RpbWVfdG91Y2ggPCAxMDApIHtcclxuICAgICAgICBpZiAodHJhY2tfcG9pbnRzID09PSB0cnVlKSB7XHJcbiAgICAgICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgxMjAwLCAxMjAwLCAwKTtcclxuICAgICAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgICAgICB0cmFja19wb2ludHMgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdHJhY2tfcG9pbnRzID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2VDYW1lcmEgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlX2NhbWVyYScpO1xyXG52YXIgRm9yY2UyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTInKTtcclxuXHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciBzcGhlcmUgPSBudWxsO1xyXG4gIHZhciBiZyA9IG51bGw7XHJcbiAgdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweGZmZmZmZiwgMHg2NjY2NjYsIDEpO1xyXG4gIHZhciBzdWJfc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICB2YXIgc3ViX2NhbWVyYSA9IG5ldyBGb3JjZUNhbWVyYSg0NSwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDEsIDEwMDAwKTtcclxuICB2YXIgc3ViX2xpZ2h0ID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweGZmZmZmZiwgMHg2NjY2NjYsIDEpO1xyXG4gIHZhciBmb3JjZSA9IG5ldyBGb3JjZTIoKTtcclxuICB2YXIgdGltZV91bml0ID0gMTtcclxuICB2YXIgcmVuZGVyX3RhcmdldCA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0LCB7XHJcbiAgICBtYWdGaWx0ZXI6IFRIUkVFLk5lYXJlc3RGaWx0ZXIsXHJcbiAgICBtaW5GaWx0ZXI6IFRIUkVFLk5lYXJlc3RGaWx0ZXIsXHJcbiAgICB3cmFwUzogVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZyxcclxuICAgIHdyYXBUOiBUSFJFRS5DbGFtcFRvRWRnZVdyYXBwaW5nXHJcbiAgfSlcclxuICB2YXIgZnJhbWVidWZmZXIgPSBudWxsO1xyXG5cclxuICB2YXIgY3JlYXRlU3BoZXJlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIGdlb21ldHJ5LmZyb21HZW9tZXRyeShuZXcgVEhSRUUuT2N0YWhlZHJvbkdlb21ldHJ5KDIwMCwgNSkpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IFRIUkVFLlVuaWZvcm1zVXRpbHMubWVyZ2UoW1xyXG4gICAgICAgIFRIUkVFLlVuaWZvcm1zTGliWydsaWdodHMnXSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0aW1lOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgcmFkaXVzOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgICAgdmFsdWU6IDEuMFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGRpc3RvcnQ6IHtcclxuICAgICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgICB2YWx1ZTogMC40XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICBdKSxcclxuICAgICAgdmVydGV4U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcbnVuaWZvcm0gZmxvYXQgcmFkaXVzO1xcbnVuaWZvcm0gZmxvYXQgZGlzdG9ydDtcXG5cXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xcblxcbi8vXFxuLy8gRGVzY3JpcHRpb24gOiBBcnJheSBhbmQgdGV4dHVyZWxlc3MgR0xTTCAyRC8zRC80RCBzaW1wbGV4XFxuLy8gICAgICAgICAgICAgICBub2lzZSBmdW5jdGlvbnMuXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzJfMCh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgbW9kMjg5XzJfMCh2ZWM0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV8yXzEodmVjNCB4KSB7XFxuICAgICByZXR1cm4gbW9kMjg5XzJfMCgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxudmVjNCB0YXlsb3JJbnZTcXJ0XzJfMih2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzJfMyh2ZWMzIHYpXFxuICB7XFxuICBjb25zdCB2ZWMyICBDID0gdmVjMigxLjAvNi4wLCAxLjAvMy4wKSA7XFxuICBjb25zdCB2ZWM0ICBEXzJfNCA9IHZlYzQoMC4wLCAwLjUsIDEuMCwgMi4wKTtcXG5cXG4vLyBGaXJzdCBjb3JuZXJcXG4gIHZlYzMgaSAgPSBmbG9vcih2ICsgZG90KHYsIEMueXl5KSApO1xcbiAgdmVjMyB4MCA9ICAgdiAtIGkgKyBkb3QoaSwgQy54eHgpIDtcXG5cXG4vLyBPdGhlciBjb3JuZXJzXFxuICB2ZWMzIGdfMl81ID0gc3RlcCh4MC55engsIHgwLnh5eik7XFxuICB2ZWMzIGwgPSAxLjAgLSBnXzJfNTtcXG4gIHZlYzMgaTEgPSBtaW4oIGdfMl81Lnh5eiwgbC56eHkgKTtcXG4gIHZlYzMgaTIgPSBtYXgoIGdfMl81Lnh5eiwgbC56eHkgKTtcXG5cXG4gIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcbiAgLy8gICB4MSA9IHgwIC0gaTEgICsgMS4wICogQy54eHg7XFxuICAvLyAgIHgyID0geDAgLSBpMiAgKyAyLjAgKiBDLnh4eDtcXG4gIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcbiAgdmVjMyB4MSA9IHgwIC0gaTEgKyBDLnh4eDtcXG4gIHZlYzMgeDIgPSB4MCAtIGkyICsgQy55eXk7IC8vIDIuMCpDLnggPSAxLzMgPSBDLnlcXG4gIHZlYzMgeDMgPSB4MCAtIERfMl80Lnl5eTsgICAgICAvLyAtMS4wKzMuMCpDLnggPSAtMC41ID0gLUQueVxcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV8yXzAoaSk7XFxuICB2ZWM0IHAgPSBwZXJtdXRlXzJfMSggcGVybXV0ZV8yXzEoIHBlcm11dGVfMl8xKFxcbiAgICAgICAgICAgICBpLnogKyB2ZWM0KDAuMCwgaTEueiwgaTIueiwgMS4wICkpXFxuICAgICAgICAgICArIGkueSArIHZlYzQoMC4wLCBpMS55LCBpMi55LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS54ICsgdmVjNCgwLjAsIGkxLngsIGkyLngsIDEuMCApKTtcXG5cXG4vLyBHcmFkaWVudHM6IDd4NyBwb2ludHMgb3ZlciBhIHNxdWFyZSwgbWFwcGVkIG9udG8gYW4gb2N0YWhlZHJvbi5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDkgKDQ5KjYgPSAyOTQpXFxuICBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyAvLyAxLjAvNy4wXFxuICB2ZWMzICBucyA9IG5fICogRF8yXzQud3l6IC0gRF8yXzQueHp4O1xcblxcbiAgdmVjNCBqID0gcCAtIDQ5LjAgKiBmbG9vcihwICogbnMueiAqIG5zLnopOyAgLy8gIG1vZChwLDcqNylcXG5cXG4gIHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7XFxuICB2ZWM0IHlfID0gZmxvb3IoaiAtIDcuMCAqIHhfICk7ICAgIC8vIG1vZChqLE4pXFxuXFxuICB2ZWM0IHggPSB4XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXFxuICB2ZWM0IGIwID0gdmVjNCggeC54eSwgeS54eSApO1xcbiAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cXG4gIC8vdmVjNCBzMCA9IHZlYzQobGVzc1RoYW4oYjAsMC4wKSkqMi4wIC0gMS4wO1xcbiAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuICB2ZWM0IHMwID0gZmxvb3IoYjApKjIuMCArIDEuMDtcXG4gIHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wO1xcbiAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXFxuICB2ZWM0IGEwID0gYjAueHp5dyArIHMwLnh6eXcqc2gueHh5eSA7XFxuICB2ZWM0IGExXzJfNiA9IGIxLnh6eXcgKyBzMS54enl3KnNoLnp6d3cgO1xcblxcbiAgdmVjMyBwMF8yXzcgPSB2ZWMzKGEwLnh5LGgueCk7XFxuICB2ZWMzIHAxID0gdmVjMyhhMC56dyxoLnkpO1xcbiAgdmVjMyBwMiA9IHZlYzMoYTFfMl82Lnh5LGgueik7XFxuICB2ZWMzIHAzID0gdmVjMyhhMV8yXzYuencsaC53KTtcXG5cXG4vL05vcm1hbGlzZSBncmFkaWVudHNcXG4gIHZlYzQgbm9ybSA9IHRheWxvckludlNxcnRfMl8yKHZlYzQoZG90KHAwXzJfNyxwMF8yXzcpLCBkb3QocDEscDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLHAzKSkpO1xcbiAgcDBfMl83ICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG5cXG4vLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG4gIHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApO1xcbiAgbSA9IG0gKiBtO1xcbiAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwXzJfNyx4MCksIGRvdChwMSx4MSksXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3QocDIseDIpLCBkb3QocDMseDMpICkgKTtcXG4gIH1cXG5cXG5cXG5cXG52ZWMzIGhzdjJyZ2JfMV84KHZlYzMgYyl7XFxuICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XFxuICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XFxuICByZXR1cm4gYy56ICogbWl4KEsueHh4LCBjbGFtcChwIC0gSy54eHgsIDAuMCwgMS4wKSwgYy55KTtcXG59XFxuXFxuXFxuXFxudm9pZCBtYWluKCkge1xcbiAgZmxvYXQgdXBkYXRlVGltZSA9IHRpbWUgLyAxMDAwLjA7XFxuICBmbG9hdCBub2lzZSA9IHNub2lzZV8yXzModmVjMyhwb3NpdGlvbiAvIDQwMC4xICsgdXBkYXRlVGltZSAqIDUuMCkpO1xcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiAqIChub2lzZSAqIHBvdyhkaXN0b3J0LCAyLjApICsgcmFkaXVzKSwgMS4wKTtcXG5cXG4gIHZDb2xvciA9IGhzdjJyZ2JfMV84KHZlYzMobm9pc2UgKiBkaXN0b3J0ICogMC4zICsgdXBkYXRlVGltZSwgMC4yLCAxLjApKTtcXG4gIHZOb3JtYWwgPSBub3JtYWw7XFxuXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcbn1cXG5cIixcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xcblxcbi8vXFxuLy8gRGVzY3JpcHRpb24gOiBBcnJheSBhbmQgdGV4dHVyZWxlc3MgR0xTTCAyRC8zRC80RCBzaW1wbGV4XFxuLy8gICAgICAgICAgICAgICBub2lzZSBmdW5jdGlvbnMuXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzJfMCh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgbW9kMjg5XzJfMCh2ZWM0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV8yXzEodmVjNCB4KSB7XFxuICAgICByZXR1cm4gbW9kMjg5XzJfMCgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxudmVjNCB0YXlsb3JJbnZTcXJ0XzJfMih2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzJfMyh2ZWMzIHYpXFxuICB7XFxuICBjb25zdCB2ZWMyICBDID0gdmVjMigxLjAvNi4wLCAxLjAvMy4wKSA7XFxuICBjb25zdCB2ZWM0ICBEXzJfNCA9IHZlYzQoMC4wLCAwLjUsIDEuMCwgMi4wKTtcXG5cXG4vLyBGaXJzdCBjb3JuZXJcXG4gIHZlYzMgaSAgPSBmbG9vcih2ICsgZG90KHYsIEMueXl5KSApO1xcbiAgdmVjMyB4MCA9ICAgdiAtIGkgKyBkb3QoaSwgQy54eHgpIDtcXG5cXG4vLyBPdGhlciBjb3JuZXJzXFxuICB2ZWMzIGdfMl81ID0gc3RlcCh4MC55engsIHgwLnh5eik7XFxuICB2ZWMzIGwgPSAxLjAgLSBnXzJfNTtcXG4gIHZlYzMgaTEgPSBtaW4oIGdfMl81Lnh5eiwgbC56eHkgKTtcXG4gIHZlYzMgaTIgPSBtYXgoIGdfMl81Lnh5eiwgbC56eHkgKTtcXG5cXG4gIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcbiAgLy8gICB4MSA9IHgwIC0gaTEgICsgMS4wICogQy54eHg7XFxuICAvLyAgIHgyID0geDAgLSBpMiAgKyAyLjAgKiBDLnh4eDtcXG4gIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcbiAgdmVjMyB4MSA9IHgwIC0gaTEgKyBDLnh4eDtcXG4gIHZlYzMgeDIgPSB4MCAtIGkyICsgQy55eXk7IC8vIDIuMCpDLnggPSAxLzMgPSBDLnlcXG4gIHZlYzMgeDMgPSB4MCAtIERfMl80Lnl5eTsgICAgICAvLyAtMS4wKzMuMCpDLnggPSAtMC41ID0gLUQueVxcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV8yXzAoaSk7XFxuICB2ZWM0IHAgPSBwZXJtdXRlXzJfMSggcGVybXV0ZV8yXzEoIHBlcm11dGVfMl8xKFxcbiAgICAgICAgICAgICBpLnogKyB2ZWM0KDAuMCwgaTEueiwgaTIueiwgMS4wICkpXFxuICAgICAgICAgICArIGkueSArIHZlYzQoMC4wLCBpMS55LCBpMi55LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS54ICsgdmVjNCgwLjAsIGkxLngsIGkyLngsIDEuMCApKTtcXG5cXG4vLyBHcmFkaWVudHM6IDd4NyBwb2ludHMgb3ZlciBhIHNxdWFyZSwgbWFwcGVkIG9udG8gYW4gb2N0YWhlZHJvbi5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDkgKDQ5KjYgPSAyOTQpXFxuICBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyAvLyAxLjAvNy4wXFxuICB2ZWMzICBucyA9IG5fICogRF8yXzQud3l6IC0gRF8yXzQueHp4O1xcblxcbiAgdmVjNCBqID0gcCAtIDQ5LjAgKiBmbG9vcihwICogbnMueiAqIG5zLnopOyAgLy8gIG1vZChwLDcqNylcXG5cXG4gIHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7XFxuICB2ZWM0IHlfID0gZmxvb3IoaiAtIDcuMCAqIHhfICk7ICAgIC8vIG1vZChqLE4pXFxuXFxuICB2ZWM0IHggPSB4XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXFxuICB2ZWM0IGIwID0gdmVjNCggeC54eSwgeS54eSApO1xcbiAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cXG4gIC8vdmVjNCBzMCA9IHZlYzQobGVzc1RoYW4oYjAsMC4wKSkqMi4wIC0gMS4wO1xcbiAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuICB2ZWM0IHMwID0gZmxvb3IoYjApKjIuMCArIDEuMDtcXG4gIHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wO1xcbiAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXFxuICB2ZWM0IGEwID0gYjAueHp5dyArIHMwLnh6eXcqc2gueHh5eSA7XFxuICB2ZWM0IGExXzJfNiA9IGIxLnh6eXcgKyBzMS54enl3KnNoLnp6d3cgO1xcblxcbiAgdmVjMyBwMF8yXzcgPSB2ZWMzKGEwLnh5LGgueCk7XFxuICB2ZWMzIHAxID0gdmVjMyhhMC56dyxoLnkpO1xcbiAgdmVjMyBwMiA9IHZlYzMoYTFfMl82Lnh5LGgueik7XFxuICB2ZWMzIHAzID0gdmVjMyhhMV8yXzYuencsaC53KTtcXG5cXG4vL05vcm1hbGlzZSBncmFkaWVudHNcXG4gIHZlYzQgbm9ybSA9IHRheWxvckludlNxcnRfMl8yKHZlYzQoZG90KHAwXzJfNyxwMF8yXzcpLCBkb3QocDEscDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLHAzKSkpO1xcbiAgcDBfMl83ICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG5cXG4vLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG4gIHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApO1xcbiAgbSA9IG0gKiBtO1xcbiAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwXzJfNyx4MCksIGRvdChwMSx4MSksXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3QocDIseDIpLCBkb3QocDMseDMpICkgKTtcXG4gIH1cXG5cXG5cXG5cXG52ZWMzIGhzdjJyZ2JfMV84KHZlYzMgYyl7XFxuICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XFxuICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XFxuICByZXR1cm4gYy56ICogbWl4KEsueHh4LCBjbGFtcChwIC0gSy54eHgsIDAuMCwgMS4wKSwgYy55KTtcXG59XFxuXFxuXFxuXFxuc3RydWN0IEhlbWlzcGhlcmVMaWdodCB7XFxuICB2ZWMzIGRpcmVjdGlvbjtcXG4gIHZlYzMgZ3JvdW5kQ29sb3I7XFxuICB2ZWMzIHNreUNvbG9yO1xcbn07XFxudW5pZm9ybSBIZW1pc3BoZXJlTGlnaHQgaGVtaXNwaGVyZUxpZ2h0c1tOVU1fSEVNSV9MSUdIVFNdO1xcblxcbnZvaWQgbWFpbigpIHtcXG4gIHZlYzMgbGlnaHQgPSB2ZWMzKDAuMCk7XFxuICBsaWdodCArPSAoZG90KGhlbWlzcGhlcmVMaWdodHNbMF0uZGlyZWN0aW9uLCB2Tm9ybWFsKSArIDEuMCkgKiBoZW1pc3BoZXJlTGlnaHRzWzBdLnNreUNvbG9yICogMC41O1xcbiAgbGlnaHQgKz0gKC1kb3QoaGVtaXNwaGVyZUxpZ2h0c1swXS5kaXJlY3Rpb24sIHZOb3JtYWwpICsgMS4wKSAqIGhlbWlzcGhlcmVMaWdodHNbMF0uZ3JvdW5kQ29sb3IgKiAwLjU7XFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZDb2xvciAqIGxpZ2h0LCAxLjApO1xcbn1cXG5cIixcclxuICAgICAgbGlnaHRzOiB0cnVlLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDE4MDApO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgc2lkZTogVEhSRUUuQmFja1NpZGUsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVQbGFuZUZvclBvc3RQcm9jZXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnlfYmFzZSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDIsIDIpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICBnZW9tZXRyeS5mcm9tR2VvbWV0cnkoZ2VvbWV0cnlfYmFzZSk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzb2x1dGlvbjoge1xyXG4gICAgICAgICAgdHlwZTogJ3YyJyxcclxuICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWNjZWxlcmF0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGV4dHVyZToge1xyXG4gICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgdmFsdWU6IHJlbmRlcl90YXJnZXQsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMyIHZVdjtcXG5cXG52b2lkIG1haW4odm9pZCkge1xcbiAgdlV2ID0gdXY7XFxuICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDEuMCk7XFxufVxcblwiLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXG51bmlmb3JtIHZlYzIgcmVzb2x1dGlvbjtcXG51bmlmb3JtIGZsb2F0IGFjY2VsZXJhdGlvbjtcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcblxcbmNvbnN0IGZsb2F0IGJsdXIgPSAxNi4wO1xcblxcbnZhcnlpbmcgdmVjMiB2VXY7XFxuXFxuZmxvYXQgcmFuZG9tMl8xXzAodmVjMiBjKXtcXG4gICAgcmV0dXJuIGZyYWN0KHNpbihkb3QoYy54eSAsdmVjMigxMi45ODk4LDc4LjIzMykpKSAqIDQzNzU4LjU0NTMpO1xcbn1cXG5cXG5cXG4vL1xcbi8vIERlc2NyaXB0aW9uIDogQXJyYXkgYW5kIHRleHR1cmVsZXNzIEdMU0wgMkQgc2ltcGxleCBub2lzZSBmdW5jdGlvbi5cXG4vLyAgICAgIEF1dGhvciA6IElhbiBNY0V3YW4sIEFzaGltYSBBcnRzLlxcbi8vICBNYWludGFpbmVyIDogaWptXFxuLy8gICAgIExhc3Rtb2QgOiAyMDExMDgyMiAoaWptKVxcbi8vICAgICBMaWNlbnNlIDogQ29weXJpZ2h0IChDKSAyMDExIEFzaGltYSBBcnRzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxcbi8vICAgICAgICAgICAgICAgRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlLlxcbi8vICAgICAgICAgICAgICAgaHR0cHM6Ly9naXRodWIuY29tL2FzaGltYS93ZWJnbC1ub2lzZVxcbi8vXFxuXFxudmVjMyBtb2QyODlfMl8xKHZlYzMgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjMiBtb2QyODlfMl8xKHZlYzIgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjMyBwZXJtdXRlXzJfMih2ZWMzIHgpIHtcXG4gIHJldHVybiBtb2QyODlfMl8xKCgoeCozNC4wKSsxLjApKngpO1xcbn1cXG5cXG5mbG9hdCBzbm9pc2VfMl8zKHZlYzIgdilcXG4gIHtcXG4gIGNvbnN0IHZlYzQgQyA9IHZlYzQoMC4yMTEzMjQ4NjU0MDUxODcsICAvLyAoMy4wLXNxcnQoMy4wKSkvNi4wXFxuICAgICAgICAgICAgICAgICAgICAgIDAuMzY2MDI1NDAzNzg0NDM5LCAgLy8gMC41KihzcXJ0KDMuMCktMS4wKVxcbiAgICAgICAgICAgICAgICAgICAgIC0wLjU3NzM1MDI2OTE4OTYyNiwgIC8vIC0xLjAgKyAyLjAgKiBDLnhcXG4gICAgICAgICAgICAgICAgICAgICAgMC4wMjQzOTAyNDM5MDI0MzkpOyAvLyAxLjAgLyA0MS4wXFxuLy8gRmlyc3QgY29ybmVyXFxuICB2ZWMyIGkgID0gZmxvb3IodiArIGRvdCh2LCBDLnl5KSApO1xcbiAgdmVjMiB4MCA9IHYgLSAgIGkgKyBkb3QoaSwgQy54eCk7XFxuXFxuLy8gT3RoZXIgY29ybmVyc1xcbiAgdmVjMiBpMTtcXG4gIC8vaTEueCA9IHN0ZXAoIHgwLnksIHgwLnggKTsgLy8geDAueCA+IHgwLnkgPyAxLjAgOiAwLjBcXG4gIC8vaTEueSA9IDEuMCAtIGkxLng7XFxuICBpMSA9ICh4MC54ID4geDAueSkgPyB2ZWMyKDEuMCwgMC4wKSA6IHZlYzIoMC4wLCAxLjApO1xcbiAgLy8geDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHggO1xcbiAgLy8geDEgPSB4MCAtIGkxICsgMS4wICogQy54eCA7XFxuICAvLyB4MiA9IHgwIC0gMS4wICsgMi4wICogQy54eCA7XFxuICB2ZWM0IHgxMiA9IHgwLnh5eHkgKyBDLnh4eno7XFxuICB4MTIueHkgLT0gaTE7XFxuXFxuLy8gUGVybXV0YXRpb25zXFxuICBpID0gbW9kMjg5XzJfMShpKTsgLy8gQXZvaWQgdHJ1bmNhdGlvbiBlZmZlY3RzIGluIHBlcm11dGF0aW9uXFxuICB2ZWMzIHAgPSBwZXJtdXRlXzJfMiggcGVybXV0ZV8yXzIoIGkueSArIHZlYzMoMC4wLCBpMS55LCAxLjAgKSlcXG4gICAgKyBpLnggKyB2ZWMzKDAuMCwgaTEueCwgMS4wICkpO1xcblxcbiAgdmVjMyBtID0gbWF4KDAuNSAtIHZlYzMoZG90KHgwLHgwKSwgZG90KHgxMi54eSx4MTIueHkpLCBkb3QoeDEyLnp3LHgxMi56dykpLCAwLjApO1xcbiAgbSA9IG0qbSA7XFxuICBtID0gbSptIDtcXG5cXG4vLyBHcmFkaWVudHM6IDQxIHBvaW50cyB1bmlmb3JtbHkgb3ZlciBhIGxpbmUsIG1hcHBlZCBvbnRvIGEgZGlhbW9uZC5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDEgKDQxKjcgPSAyODcpXFxuXFxuICB2ZWMzIHggPSAyLjAgKiBmcmFjdChwICogQy53d3cpIC0gMS4wO1xcbiAgdmVjMyBoID0gYWJzKHgpIC0gMC41O1xcbiAgdmVjMyBveCA9IGZsb29yKHggKyAwLjUpO1xcbiAgdmVjMyBhMCA9IHggLSBveDtcXG5cXG4vLyBOb3JtYWxpc2UgZ3JhZGllbnRzIGltcGxpY2l0bHkgYnkgc2NhbGluZyBtXFxuLy8gQXBwcm94aW1hdGlvbiBvZjogbSAqPSBpbnZlcnNlc3FydCggYTAqYTAgKyBoKmggKTtcXG4gIG0gKj0gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiAoIGEwKmEwICsgaCpoICk7XFxuXFxuLy8gQ29tcHV0ZSBmaW5hbCBub2lzZSB2YWx1ZSBhdCBQXFxuICB2ZWMzIGc7XFxuICBnLnggID0gYTAueCAgKiB4MC54ICArIGgueCAgKiB4MC55O1xcbiAgZy55eiA9IGEwLnl6ICogeDEyLnh6ICsgaC55eiAqIHgxMi55dztcXG4gIHJldHVybiAxMzAuMCAqIGRvdChtLCBnKTtcXG59XFxuXFxuXFxuXFxuXFxudmVjMiBkaWZmVXYoZmxvYXQgdiwgZmxvYXQgZGlmZikge1xcbiAgcmV0dXJuIHZVdiArICh2ZWMyKHYgKyBzbm9pc2VfMl8zKHZlYzIoZ2xfRnJhZ0Nvb3JkLnkgKyB0aW1lKSAvIDEwMC4wKSwgMC4wKSAqIGRpZmYgKyB2ZWMyKHYgKiAzLjAsIDAuMCkpIC8gcmVzb2x1dGlvbjtcXG59XFxuXFxuZmxvYXQgcmFuZG9tTm9pc2UodmVjMiBwKSB7XFxuICByZXR1cm4gKHJhbmRvbTJfMV8wKHAgLSB2ZWMyKHNpbih0aW1lKSkpICogMi4wIC0gMS4wKSAqIG1heChsZW5ndGgoYWNjZWxlcmF0aW9uKSwgMC4wOCk7XFxufVxcblxcbnZvaWQgbWFpbigpIHtcXG4gIGZsb2F0IGRpZmYgPSAzMDAuMCAqIGxlbmd0aChhY2NlbGVyYXRpb24pO1xcbiAgdmVjMiB1dl9yID0gZGlmZlV2KDAuMCwgZGlmZik7XFxuICB2ZWMyIHV2X2cgPSBkaWZmVXYoMS4wLCBkaWZmKTtcXG4gIHZlYzIgdXZfYiA9IGRpZmZVdigtMS4wLCBkaWZmKTtcXG4gIGZsb2F0IHIgPSB0ZXh0dXJlMkQodGV4dHVyZSwgdXZfcikuciArIHJhbmRvbU5vaXNlKHV2X3IpO1xcbiAgZmxvYXQgZyA9IHRleHR1cmUyRCh0ZXh0dXJlLCB1dl9nKS5nICsgcmFuZG9tTm9pc2UodXZfZyk7XFxuICBmbG9hdCBiID0gdGV4dHVyZTJEKHRleHR1cmUsIHV2X2IpLmIgKyByYW5kb21Ob2lzZSh1dl9iKTtcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQociwgZywgYiwgMS4wKTtcXG59XFxuXCIsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH1cclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnYmctd2hpdGUnO1xyXG4gICAgICBzcGhlcmUgPSBjcmVhdGVTcGhlcmUoKTtcclxuICAgICAgc3ViX3NjZW5lLmFkZChzcGhlcmUpO1xyXG4gICAgICBiZyA9IGNyZWF0ZUJhY2tncm91bmQoKTtcclxuICAgICAgc3ViX3NjZW5lLmFkZChiZyk7XHJcbiAgICAgIHN1Yl9zY2VuZS5hZGQoc3ViX2xpZ2h0KTtcclxuICAgICAgc3ViX2NhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KDE4MDAsIDE4MDAsIDApO1xyXG4gICAgICBzdWJfY2FtZXJhLmZvcmNlLmxvb2suYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgY29uc29sZS5sb2coc3BoZXJlLm1hdGVyaWFsLnVuaWZvcm1zKTtcclxuXHJcbiAgICAgIGZyYW1lYnVmZmVyID0gY3JlYXRlUGxhbmVGb3JQb3N0UHJvY2VzcygpO1xyXG4gICAgICBzY2VuZS5hZGQoZnJhbWVidWZmZXIpO1xyXG4gICAgICBzY2VuZS5hZGQobGlnaHQpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgxODAwLCAxODAwLCAwKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgZm9yY2UuYW5jaG9yLnNldCgxLCAwKTtcclxuICAgICAgZm9yY2UuYW5jaG9yLnNldCgxLCAwKTtcclxuICAgICAgZm9yY2UudmVsb2NpdHkuc2V0KDEsIDApO1xyXG4gICAgICBmb3JjZS5rID0gMC4wNDU7XHJcbiAgICAgIGZvcmNlLmQgPSAwLjE2O1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnJztcclxuICAgICAgc3BoZXJlLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgc3BoZXJlLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc3ViX3NjZW5lLnJlbW92ZShzcGhlcmUpO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc3ViX3NjZW5lLnJlbW92ZShiZyk7XHJcbiAgICAgIHN1Yl9zY2VuZS5yZW1vdmUoc3ViX2xpZ2h0KTtcclxuICAgICAgZnJhbWVidWZmZXIuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBmcmFtZWJ1ZmZlci5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShmcmFtZWJ1ZmZlcik7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShsaWdodCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcikge1xyXG4gICAgICBmb3JjZS5hcHBseUhvb2soMCwgZm9yY2Uuayk7XHJcbiAgICAgIGZvcmNlLmFwcGx5RHJhZyhmb3JjZS5kKTtcclxuICAgICAgZm9yY2UudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgLy8gY29uc29sZS5sb2coZm9yY2UuYWNjZWxlcmF0aW9uLmxlbmd0aCgpKTtcclxuICAgICAgc3BoZXJlLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUgKz0gdGltZV91bml0O1xyXG4gICAgICBzcGhlcmUubWF0ZXJpYWwudW5pZm9ybXMucmFkaXVzLnZhbHVlID0gZm9yY2UudmVsb2NpdHkueDtcclxuICAgICAgc3BoZXJlLm1hdGVyaWFsLnVuaWZvcm1zLmRpc3RvcnQudmFsdWUgPSBmb3JjZS52ZWxvY2l0eS54IC8gMiAtIDAuMTtcclxuICAgICAgc3ViX2NhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4wMjUpO1xyXG4gICAgICBzdWJfY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBzdWJfY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgc3ViX2NhbWVyYS5mb3JjZS5sb29rLmFwcGx5SG9vaygwLCAwLjIpO1xyXG4gICAgICBzdWJfY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEuZm9yY2UubG9vay51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBzdWJfY2FtZXJhLnVwZGF0ZUxvb2soKTtcclxuXHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUgKz0gdGltZV91bml0O1xyXG4gICAgICBmcmFtZWJ1ZmZlci5tYXRlcmlhbC51bmlmb3Jtcy5hY2NlbGVyYXRpb24udmFsdWUgPSBmb3JjZS5hY2NlbGVyYXRpb24ubGVuZ3RoKCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4wMjUpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEubG9va0F0KGNhbWVyYS5mb3JjZS5sb29rLnZlbG9jaXR5KTtcclxuXHJcbiAgICAgIHJlbmRlcmVyLnJlbmRlcihzdWJfc2NlbmUsIHN1Yl9jYW1lcmEsIHJlbmRlcl90YXJnZXQpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBpZiAoZm9yY2UuYW5jaG9yLnggPCAzKSB7XHJcbiAgICAgICAgZm9yY2UuayArPSAwLjAwNTtcclxuICAgICAgICBmb3JjZS5kIC09IDAuMDI7XHJcbiAgICAgICAgZm9yY2UuYW5jaG9yLnggKz0gMC44O1xyXG4gICAgICAgIHRpbWVfdW5pdCArPSAwLjQ7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm9yY2UuayA9IDAuMDU7XHJcbiAgICAgICAgZm9yY2UuZCA9IDAuMTY7XHJcbiAgICAgICAgZm9yY2UuYW5jaG9yLnggPSAxLjA7XHJcbiAgICAgICAgdGltZV91bml0ID0gMTtcclxuICAgICAgfVxyXG4gICAgICBpc190b3VjaGVkID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEpXHJcbiAgICB9LFxyXG4gICAgcmVzaXplV2luZG93OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHJlbmRlcl90YXJnZXQuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgICAgc3ViX2NhbWVyYS5yZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLnVuaWZvcm1zLnJlc29sdXRpb24udmFsdWUuc2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIE1vdmVyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9tb3ZlcicpO1xyXG52YXIgUG9pbnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludHMuanMnKTtcclxudmFyIEZvcmNlUG9pbnRMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2VfcG9pbnRfbGlnaHQnKTtcclxuXHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciBtb3ZlcnNfbnVtID0gMTAwMDA7XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIGxpZ2h0ID0gbmV3IEZvcmNlUG9pbnRMaWdodCgweGZmNjYwMCwgMSwgMTgwMCwgMSk7XHJcbiAgdmFyIGJnID0gbnVsbDtcclxuICB2YXIgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIGdyYXZpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLjEsIDApO1xyXG4gIHZhciBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gIHZhciBpc19kcmFnZWQgPSBmYWxzZTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZlKSB7XHJcbiAgICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoZ3Jhdml0eSk7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMDEpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgaWYgKG1vdmVyLnRpbWUgPiA1MCkge1xyXG4gICAgICAgICAgbW92ZXIuc2l6ZSAtPSAwLjc7XHJcbiAgICAgICAgICBtb3Zlci5hIC09IDAuMDA5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobW92ZXIuYSA8PSAwKSB7XHJcbiAgICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgIG1vdmVyLnRpbWUgPSAwO1xyXG4gICAgICAgICAgbW92ZXIuYSA9IDAuMDtcclxuICAgICAgICAgIG1vdmVyLmluYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54IC0gcG9pbnRzLnZlbG9jaXR5Lng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIudmVsb2NpdHkueSAtIHBvaW50cy52ZWxvY2l0eS55O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnZlbG9jaXR5LnogLSBwb2ludHMudmVsb2NpdHkuejtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY3RpdmF0ZU1vdmVyID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvdW50ID0gMDtcclxuICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgaWYgKG5vdyAtIGxhc3RfdGltZV9hY3RpdmF0ZSA+IDEwKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIGNvbnRpbnVlO1xyXG4gICAgICAgIHZhciByYWQxID0gVXRpbC5nZXRSYWRpYW4oTWF0aC5sb2coVXRpbC5nZXRSYW5kb21JbnQoMCwgMjU2KSkgLyBNYXRoLmxvZygyNTYpICogMjYwKTtcclxuICAgICAgICB2YXIgcmFkMiA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICAgIHZhciByYW5nZSA9ICgxLSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgzMiwgMjU2KSkgLyBNYXRoLmxvZygyNTYpKSAqIDEyO1xyXG4gICAgICAgIHZhciB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgICAgIHZhciBmb3JjZSA9IFV0aWwuZ2V0UG9sYXJDb29yZChyYWQxLCByYWQyLCByYW5nZSk7XHJcbiAgICAgICAgdmVjdG9yLmFkZChwb2ludHMudmVsb2NpdHkpO1xyXG4gICAgICAgIG1vdmVyLmFjdGl2YXRlKCk7XHJcbiAgICAgICAgbW92ZXIuaW5pdCh2ZWN0b3IpO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gICAgICAgIG1vdmVyLmEgPSAwLjI7XHJcbiAgICAgICAgbW92ZXIuc2l6ZSA9IE1hdGgucG93KDEyIC0gcmFuZ2UsIDIpICogVXRpbC5nZXRSYW5kb21JbnQoMSwgMjQpIC8gMTA7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgICBpZiAoY291bnQgPj0gNikgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgdXBkYXRlUG9pbnRzID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgcG9pbnRzLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICBsaWdodC5vYmoucG9zaXRpb24uY29weShwb2ludHMudmVsb2NpdHkpO1xyXG4gIH07XHJcblxyXG4gIHZhciBtb3ZlUG9pbnRzID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgICB2YXIgeSA9IHZlY3Rvci55ICogd2luZG93LmlubmVySGVpZ2h0IC8gMztcclxuICAgIHZhciB6ID0gdmVjdG9yLnggKiB3aW5kb3cuaW5uZXJXaWR0aCAvIC0zO1xyXG4gICAgcG9pbnRzLmFuY2hvci55ID0geTtcclxuICAgIHBvaW50cy5hbmNob3IueiA9IHo7XHJcbiAgICBsaWdodC5mb3JjZS5hbmNob3IueSA9IHk7XHJcbiAgICBsaWdodC5mb3JjZS5hbmNob3IueiA9IHo7XHJcbiAgfVxyXG5cclxuICB2YXIgY3JlYXRlVGV4dHVyZSA9ICBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIHZhciBncmFkID0gbnVsbDtcclxuICAgIHZhciB0ZXh0dXJlID0gbnVsbDtcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSAyMDA7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gMjAwO1xyXG4gICAgZ3JhZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudCgxMDAsIDEwMCwgMjAsIDEwMCwgMTAwLCAxMDApO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC4yLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC41LCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLjAsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDApJyk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcclxuICAgIGN0eC5hcmMoMTAwLCAxMDAsIDEwMCwgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXMpO1xyXG4gICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdGV4dHVyZTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZCA9ICBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5PY3RhaGVkcm9uR2VvbWV0cnkoMTUwMCwgMyk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBjb2xvcjogMHhmZmZmZmYsXHJcbiAgICAgIHNoYWRpbmc6IFRIUkVFLkZsYXRTaGFkaW5nLFxyXG4gICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc19udW07IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG5ldyBNb3ZlcigpO1xyXG4gICAgICAgIHZhciBoID0gVXRpbC5nZXRSYW5kb21JbnQoMCwgNDUpO1xyXG4gICAgICAgIHZhciBzID0gVXRpbC5nZXRSYW5kb21JbnQoNjAsIDkwKTtcclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgaCArICcsICcgKyBzICsgJyUsIDUwJSknKTtcclxuXHJcbiAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhVdGlsLmdldFJhbmRvbUludCgtMTAwLCAxMDApLCAwLCAwKSk7XHJcbiAgICAgICAgbW92ZXJzLnB1c2gobW92ZXIpO1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIudmVsb2NpdHkueDtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnZlbG9jaXR5Lnk7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci52ZWxvY2l0eS56O1xyXG4gICAgICAgIGNvbG9yLnRvQXJyYXkoY29sb3JzLCBpICogMyk7XHJcbiAgICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICAgIH1cclxuICAgICAgcG9pbnRzLmluaXQoe1xyXG4gICAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgICB2czogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGN1c3RvbUNvbG9yO1xcbmF0dHJpYnV0ZSBmbG9hdCB2ZXJ0ZXhPcGFjaXR5O1xcbmF0dHJpYnV0ZSBmbG9hdCBzaXplO1xcblxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXG5cXG52b2lkIG1haW4oKSB7XFxuICB2Q29sb3IgPSBjdXN0b21Db2xvcjtcXG4gIGZPcGFjaXR5ID0gdmVydGV4T3BhY2l0eTtcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxuICBnbF9Qb2ludFNpemUgPSBzaXplICogKDMwMC4wIC8gbGVuZ3RoKG12UG9zaXRpb24ueHl6KSk7XFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcbn1cXG5cIixcclxuICAgICAgICBmczogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gdmVjMyBjb2xvcjtcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcblxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXG5cXG52b2lkIG1haW4oKSB7XFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yICogdkNvbG9yLCBmT3BhY2l0eSk7XFxuICBnbF9GcmFnQ29sb3IgPSBnbF9GcmFnQ29sb3IgKiB0ZXh0dXJlMkQodGV4dHVyZSwgZ2xfUG9pbnRDb29yZCk7XFxufVxcblwiLFxyXG4gICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICAgIGNvbG9yczogY29sb3JzLFxyXG4gICAgICAgIG9wYWNpdGllczogb3BhY2l0aWVzLFxyXG4gICAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgICB0ZXh0dXJlOiBjcmVhdGVUZXh0dXJlKCksXHJcbiAgICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcclxuICAgICAgfSk7XHJcbiAgICAgIHNjZW5lLmFkZChsaWdodCk7XHJcbiAgICAgIGJnID0gY3JlYXRlQmFja2dyb3VuZCgpO1xyXG4gICAgICBzY2VuZS5hZGQoYmcpO1xyXG4gICAgICBjYW1lcmEuc2V0UG9sYXJDb29yZChVdGlsLmdldFJhZGlhbigyNSksIDAsIDEwMDApO1xyXG4gICAgICBsaWdodC5zZXRQb2xhckNvb3JkKFV0aWwuZ2V0UmFkaWFuKDI1KSwgMCwgMjAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMub2JqKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGxpZ2h0KTtcclxuICAgICAgYmcuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBiZy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShiZyk7XHJcbiAgICAgIG1vdmVycyA9IFtdO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBwb2ludHMuYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBwb2ludHMuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIHBvaW50cy51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBsaWdodC5mb3JjZS5hcHBseUhvb2soMCwgMC4wOCk7XHJcbiAgICAgIGxpZ2h0LmZvcmNlLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBsaWdodC5mb3JjZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBsaWdodC51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBhY3RpdmF0ZU1vdmVyKCk7XHJcbiAgICAgIHVwZGF0ZU1vdmVyKCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4wMDQpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuMSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmxvb2tBdENlbnRlcigpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBtb3ZlUG9pbnRzKHZlY3Rvcik7XHJcbiAgICAgIGlzX2RyYWdlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgaWYgKGlzX2RyYWdlZCkge1xyXG4gICAgICAgIG1vdmVQb2ludHModmVjdG9yX21vdXNlX21vdmUpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBpc19kcmFnZWQgPSBmYWxzZTtcclxuICAgICAgcG9pbnRzLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIGxpZ2h0LmZvcmNlLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgdGhpcy50b3VjaEVuZChzY2VuZSwgY2FtZXJhKVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcbnZhciBGb3JjZUhlbWlzcGhlcmVMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2VfaGVtaXNwaGVyZV9saWdodCcpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuICB2YXIgaW1hZ2VzID0gW107XHJcbiAgdmFyIGltYWdlc19udW0gPSAzMDA7XHJcbiAgdmFyIGxpZ2h0ID0gbnVsbDtcclxuICB2YXIgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xyXG4gIHZhciBwaWNrZWRfaWQgPSAtMTtcclxuICB2YXIgcGlja2VkX2luZGV4ID0gLTE7XHJcbiAgdmFyIGlzX2NsaWNrZWQgPSBmYWxzZTtcclxuICB2YXIgaXNfZHJhZ2VkID0gZmFsc2U7XHJcbiAgdmFyIGdldF9uZWFyID0gZmFsc2U7XHJcblxyXG4gIHZhciBJbWFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5yYWQgPSAwO1xyXG4gICAgdGhpcy5vYmogPSBudWxsO1xyXG4gICAgdGhpcy5pc19lbnRlcmVkID0gZmFsc2U7XHJcbiAgICBGb3JjZTMuY2FsbCh0aGlzKTtcclxuICB9O1xyXG4gIHZhciBpbWFnZV9nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDEwMCwgMTAwKTtcclxuICBJbWFnZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEZvcmNlMy5wcm90b3R5cGUpO1xyXG4gIEltYWdlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEltYWdlO1xyXG4gIEltYWdlLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgICB2YXIgaW1hZ2VfbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxyXG4gICAgICBtYXA6IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCkubG9hZCgnaW1nL2dhbGxlcnkvaW1hZ2UwJyArIFV0aWwuZ2V0UmFuZG9tSW50KDEsIDkpICsgJy5qcGcnKVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5vYmogPSBuZXcgVEhSRUUuTWVzaChpbWFnZV9nZW9tZXRyeSwgaW1hZ2VfbWF0ZXJpYWwpO1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgdGhpcy5hbmNob3IgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLnNldCgwLCAwLCAwKTtcclxuICB9O1xyXG5cclxuICB2YXIgaW5pdEltYWdlcyA9IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlc19udW07IGkrKykge1xyXG4gICAgICB2YXIgaW1hZ2UgPSBudWxsO1xyXG4gICAgICB2YXIgcmFkID0gVXRpbC5nZXRSYWRpYW4oaSAlIDQ1ICogOCArIDE4MCk7XHJcbiAgICAgIHZhciByYWRpdXMgPSAxMDAwO1xyXG4gICAgICB2YXIgeCA9IE1hdGguY29zKHJhZCkgKiByYWRpdXM7XHJcbiAgICAgIHZhciB5ID0gaSAqIDUgLSBpbWFnZXNfbnVtICogMi41O1xyXG4gICAgICB2YXIgeiA9IE1hdGguc2luKHJhZCkgKiByYWRpdXM7XHJcbiAgICAgIHZhciB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMyh4LCB5LCB6KTtcclxuICAgICAgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgaW1hZ2UuaW5pdChuZXcgVEhSRUUuVmVjdG9yMygpKTtcclxuICAgICAgaW1hZ2UucmFkID0gcmFkO1xyXG4gICAgICBpbWFnZS5vYmoucG9zaXRpb24uY29weSh2ZWN0b3IpO1xyXG4gICAgICBzY2VuZS5hZGQoaW1hZ2Uub2JqKTtcclxuICAgICAgaW1hZ2VzLnB1c2goaW1hZ2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciBwaWNrSW1hZ2UgPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgIGlmIChnZXRfbmVhcikgcmV0dXJuO1xyXG4gICAgdmFyIGludGVyc2VjdHMgPSBudWxsO1xyXG4gICAgcmF5Y2FzdGVyLnNldEZyb21DYW1lcmEodmVjdG9yLCBjYW1lcmEpO1xyXG4gICAgaW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKHNjZW5lLmNoaWxkcmVuKTtcclxuICAgIGlmIChpbnRlcnNlY3RzLmxlbmd0aCA+IDAgJiYgaXNfZHJhZ2VkID09IGZhbHNlKSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnaXMtcG9pbnRlZCcpO1xyXG4gICAgICBwaWNrZWRfaWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdC5pZDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlc2V0UGlja0ltYWdlKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIGdldE5lYXJJbWFnZSA9IGZ1bmN0aW9uKGNhbWVyYSwgaW1hZ2UpIHtcclxuICAgIGdldF9uZWFyID0gdHJ1ZTtcclxuICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KE1hdGguY29zKGltYWdlLnJhZCkgKiA3ODAsIGltYWdlLm9iai5wb3NpdGlvbi55LCBNYXRoLnNpbihpbWFnZS5yYWQpICogNzgwKTtcclxuICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5jb3B5KGltYWdlLm9iai5wb3NpdGlvbik7XHJcbiAgICByZXNldFBpY2tJbWFnZSgpO1xyXG4gIH07XHJcblxyXG4gIHZhciByZXNldFBpY2tJbWFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb2ludGVkJyk7XHJcbiAgICBwaWNrZWRfaWQgPSAtMTtcclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBpbml0SW1hZ2VzKHNjZW5lKTtcclxuICAgICAgbGlnaHQgPSBuZXcgRm9yY2VIZW1pc3BoZXJlTGlnaHQoMHhmZmZmZmYsIDB4ZmZmZmZmLCAxKTtcclxuICAgICAgc2NlbmUuYWRkKGxpZ2h0KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKC0zNSk7XHJcbiAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMV9iYXNlID0gY2FtZXJhLnJvdGF0ZV9yYWQxO1xyXG4gICAgICBjYW1lcmEucm90YXRlX3JhZDIgPSBVdGlsLmdldFJhZGlhbigxODApO1xyXG4gICAgICBjYW1lcmEucm90YXRlX3JhZDJfYmFzZSA9IGNhbWVyYS5yb3RhdGVfcmFkMjtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIGltYWdlX2dlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBzY2VuZS5yZW1vdmUoaW1hZ2VzW2ldLm9iaik7XHJcbiAgICAgIH07XHJcbiAgICAgIHNjZW5lLnJlbW92ZShsaWdodCk7XHJcbiAgICAgIGltYWdlcyA9IFtdO1xyXG4gICAgICBnZXRfbmVhciA9IGZhbHNlO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBvaW50ZWQnKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZXNfbnVtOyBpKyspIHtcclxuICAgICAgICBpbWFnZXNbaV0uYXBwbHlIb29rKDAsIDAuMTQpO1xyXG4gICAgICAgIGltYWdlc1tpXS5hcHBseURyYWcoMC40KTtcclxuICAgICAgICBpbWFnZXNbaV0udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgICBpbWFnZXNbaV0ub2JqLmxvb2tBdCh7XHJcbiAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgeTogaW1hZ2VzW2ldLm9iai5wb3NpdGlvbi55LFxyXG4gICAgICAgICAgejogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChpbWFnZXNbaV0ub2JqLmlkID09IHBpY2tlZF9pZCAmJiBpc19kcmFnZWQgPT0gZmFsc2UgJiYgZ2V0X25lYXIgPT0gZmFsc2UpIHtcclxuICAgICAgICAgIGlmIChpc19jbGlja2VkID09IHRydWUpIHtcclxuICAgICAgICAgICAgcGlja2VkX2luZGV4ID0gaTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGltYWdlc1tpXS5vYmoubWF0ZXJpYWwuY29sb3Iuc2V0KDB4YWFhYWFhKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaW1hZ2VzW2ldLm9iai5tYXRlcmlhbC5jb2xvci5zZXQoMHhmZmZmZmYpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgaWYgKGdldF9uZWFyID09PSBmYWxzZSkge1xyXG4gICAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChjYW1lcmEucm90YXRlX3JhZDEsIGNhbWVyYS5yb3RhdGVfcmFkMiwgMTAwMCkpO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5SG9vaygwLCAwLjA4KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVMb29rKCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIHBpY2tJbWFnZShzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpO1xyXG4gICAgICBpc19jbGlja2VkID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBwaWNrSW1hZ2Uoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX21vdmUpO1xyXG4gICAgICBpZiAoaXNfY2xpY2tlZCAmJiB2ZWN0b3JfbW91c2VfZG93bi5jbG9uZSgpLnN1Yih2ZWN0b3JfbW91c2VfbW92ZSkubGVuZ3RoKCkgPiAwLjAxKSB7XHJcbiAgICAgICAgaXNfY2xpY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlzX2RyYWdlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzX2RyYWdlZCA9PSB0cnVlICYmIGdldF9uZWFyID09IGZhbHNlKSB7XHJcbiAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxID0gY2FtZXJhLnJvdGF0ZV9yYWQxX2Jhc2UgKyBVdGlsLmdldFJhZGlhbigodmVjdG9yX21vdXNlX2Rvd24ueSAtIHZlY3Rvcl9tb3VzZV9tb3ZlLnkpICogNTApO1xyXG4gICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMiA9IGNhbWVyYS5yb3RhdGVfcmFkMl9iYXNlICsgVXRpbC5nZXRSYWRpYW4oKHZlY3Rvcl9tb3VzZV9kb3duLnggLSB2ZWN0b3JfbW91c2VfbW92ZS54KSAqIDUwKTtcclxuICAgICAgICBpZiAoY2FtZXJhLnJvdGF0ZV9yYWQxIDwgVXRpbC5nZXRSYWRpYW4oLTUwKSkge1xyXG4gICAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxID0gVXRpbC5nZXRSYWRpYW4oLTUwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNhbWVyYS5yb3RhdGVfcmFkMSA+IFV0aWwuZ2V0UmFkaWFuKDUwKSkge1xyXG4gICAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxID0gVXRpbC5nZXRSYWRpYW4oNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgcmVzZXRQaWNrSW1hZ2UoKTtcclxuICAgICAgaWYgKGdldF9uZWFyKSB7XHJcbiAgICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgICAgcGlja2VkX2luZGV4ID0gLTE7XHJcbiAgICAgICAgZ2V0X25lYXIgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIGlmIChpc19jbGlja2VkICYmIHBpY2tlZF9pbmRleCA+IC0xKSB7XHJcbiAgICAgICAgZ2V0TmVhckltYWdlKGNhbWVyYSwgaW1hZ2VzW3BpY2tlZF9pbmRleF0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGlzX2RyYWdlZCkge1xyXG4gICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMV9iYXNlID0gY2FtZXJhLnJvdGF0ZV9yYWQxO1xyXG4gICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMl9iYXNlID0gY2FtZXJhLnJvdGF0ZV9yYWQyO1xyXG4gICAgICB9XHJcbiAgICAgIGlzX2NsaWNrZWQgPSBmYWxzZTtcclxuICAgICAgaXNfZHJhZ2VkID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEsIHZlY3RvcilcclxuICAgIH1cclxuICB9O1xyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxuXHJcbnZhciBGb3JjZUNhbWVyYSA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2VfY2FtZXJhJyk7XHJcbnZhciBGb3JjZTIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMicpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIHBvaW50cyA9IG51bGw7XHJcbiAgdmFyIGJnID0gbnVsbDtcclxuICB2YXIgYmdfd2YgPSBudWxsO1xyXG4gIHZhciBvYmogPSBudWxsO1xyXG4gIHZhciBsaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmLCAxKTtcclxuXHJcbiAgdmFyIHN1Yl9zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIHZhciBzdWJfY2FtZXJhID0gbmV3IEZvcmNlQ2FtZXJhKDQ1LCAxLCAxLCAxMDAwMCk7XHJcbiAgdmFyIHJlbmRlcl90YXJnZXQgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQoMTIwMCwgMTIwMCk7XHJcbiAgdmFyIGZyYW1lYnVmZmVyID0gbnVsbDtcclxuXHJcbiAgdmFyIHN1Yl9zY2VuZTIgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICB2YXIgc3ViX2NhbWVyYTIgPSBuZXcgRm9yY2VDYW1lcmEoNDUsIDEsIDEsIDEwMDAwKTtcclxuICB2YXIgc3ViX2xpZ2h0ID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweGZmZmZmZmYsIDB4Y2NjY2NjLCAxKTtcclxuICB2YXIgcmVuZGVyX3RhcmdldDIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQoMTIwMCwgMTIwMCk7XHJcbiAgdmFyIGJnX2ZiID0gbnVsbDtcclxuICB2YXIgcG9pbnRzX2ZiID0gbnVsbDtcclxuXHJcbiAgdmFyIGZvcmNlID0gbmV3IEZvcmNlMigpO1xyXG5cclxuICB2YXIgY3JlYXRlUG9pbnRzRm9yQ3Jvc3NGYWRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIHZhciB2ZXJ0aWNlc19iYXNlID0gW107XHJcbiAgICB2YXIgcmFkaWFuc19iYXNlID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDMyOyBpICsrKSB7XHJcbiAgICAgIHZhciB4ID0gMDtcclxuICAgICAgdmFyIHkgPSAwO1xyXG4gICAgICB2YXIgeiA9IDA7XHJcbiAgICAgIHZlcnRpY2VzX2Jhc2UucHVzaCh4LCB5LCB6KTtcclxuICAgICAgdmFyIHIxID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgIHZhciByMiA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICB2YXIgcjMgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgcmFkaWFuc19iYXNlLnB1c2gocjEsIHIyLCByMyk7XHJcbiAgICB9XHJcbiAgICB2YXIgdmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzX2Jhc2UpO1xyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUodmVydGljZXMsIDMpKTtcclxuICAgIHZhciByYWRpYW5zID0gbmV3IEZsb2F0MzJBcnJheShyYWRpYW5zX2Jhc2UpO1xyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdyYWRpYW4nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHJhZGlhbnMsIDMpKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAuMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzb2x1dGlvbjoge1xyXG4gICAgICAgICAgdHlwZTogJ3YyJyxcclxuICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2l6ZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDI4LjBcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvcmNlOiB7XHJcbiAgICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgICAgdmFsdWU6IGZvcmNlLnZlbG9jaXR5LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIHJhZGlhbjtcXG5cXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxudW5pZm9ybSB2ZWMyIHJlc29sdXRpb247XFxudW5pZm9ybSBmbG9hdCBzaXplO1xcbnVuaWZvcm0gdmVjMiBmb3JjZTtcXG5cXG52b2lkIG1haW4oKSB7XFxuICBmbG9hdCByYWRpdXMgPSAzMDAuMDtcXG4gIGZsb2F0IHJhZGlhbl9iYXNlID0gcmFkaWFucyh0aW1lICogMi4wKTtcXG4gIHZlYzMgdXBkYXRlX3Bvc2l0b24gPSBwb3NpdGlvbiArIHZlYzMoXFxuICAgIGNvcyhyYWRpYW5fYmFzZSArIHJhZGlhbi54KSAqIGNvcyhyYWRpYW5fYmFzZSArIHJhZGlhbi55KSAqIHJhZGl1cyxcXG4gICAgY29zKHJhZGlhbl9iYXNlICsgcmFkaWFuLngpICogc2luKHJhZGlhbl9iYXNlICsgcmFkaWFuLnkpICogcmFkaXVzLFxcbiAgICBzaW4ocmFkaWFuX2Jhc2UgKyByYWRpYW4ueCkgKiByYWRpdXNcXG4gICkgKiBmb3JjZS54O1xcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNCh1cGRhdGVfcG9zaXRvbiwgMS4wKTtcXG5cXG4gIGdsX1BvaW50U2l6ZSA9IChzaXplICsgZm9yY2UueSkgKiAoYWJzKHNpbihyYWRpYW5fYmFzZSArIHJhZGlhbi56KSkpICogKHNpemUgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKSAqIDQ4MC4wO1xcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXG59XFxuXCIsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCBzaXplO1xcblxcbnZvaWQgbWFpbigpIHtcXG4gIHZlYzMgbjtcXG4gIG4ueHkgPSBnbF9Qb2ludENvb3JkLnh5ICogMi4wIC0gMS4wO1xcbiAgbi56ID0gMS4wIC0gZG90KG4ueHksIG4ueHkpO1xcbiAgaWYgKG4ueiA8IDAuMCkgZGlzY2FyZDtcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoMS4wKTtcXG59XFxuXCIsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxyXG4gICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcclxuICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5Qb2ludHMoZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlT2JqZWN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnlfYmFzZSA9IG5ldyBUSFJFRS5TcGhlcmVCdWZmZXJHZW9tZXRyeSgyLCA0LCA0KTtcclxuICAgIHZhciBhdHRyID0gZ2VvbWV0cnlfYmFzZS5hdHRyaWJ1dGVzO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICB2YXIgdmVydGljZXNfYmFzZSA9IFtdO1xyXG4gICAgdmFyIHJhZGl1c2VzX2Jhc2UgPSBbXTtcclxuICAgIHZhciByYWRpYW5zX2Jhc2UgPSBbXTtcclxuICAgIHZhciBzY2FsZXNfYmFzZSA9IFtdO1xyXG4gICAgdmFyIGluZGljZXNfYmFzZSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgaSArKykge1xyXG4gICAgICB2YXIgcmFkaXVzID0gVXRpbC5nZXRSYW5kb21JbnQoMzAwLCAxMDAwKTtcclxuICAgICAgdmFyIHJhZGlhbiA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MDApIC8gMTApO1xyXG4gICAgICB2YXIgc2NhbGUgPSBVdGlsLmdldFJhbmRvbUludCg2MCwgMTIwKSAvIDEwMDtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhdHRyLnBvc2l0aW9uLmFycmF5Lmxlbmd0aDsgaiArPSAzKSB7XHJcbiAgICAgICAgdmVydGljZXNfYmFzZS5wdXNoKFxyXG4gICAgICAgICAgYXR0ci5wb3NpdGlvbi5hcnJheVtqICsgMF0sXHJcbiAgICAgICAgICBhdHRyLnBvc2l0aW9uLmFycmF5W2ogKyAxXSxcclxuICAgICAgICAgIGF0dHIucG9zaXRpb24uYXJyYXlbaiArIDJdXHJcbiAgICAgICAgKTtcclxuICAgICAgICByYWRpdXNlc19iYXNlLnB1c2gocmFkaXVzKTtcclxuICAgICAgICByYWRpYW5zX2Jhc2UucHVzaChyYWRpYW4pO1xyXG4gICAgICAgIHNjYWxlc19iYXNlLnB1c2goc2NhbGUpO1xyXG4gICAgICB9XHJcbiAgICAgIGdlb21ldHJ5X2Jhc2UuaW5kZXguYXJyYXkubWFwKChpdGVtKSA9PiB7XHJcbiAgICAgICAgaW5kaWNlc19iYXNlLnB1c2goaXRlbSArIGkgKiBhdHRyLnBvc2l0aW9uLmFycmF5Lmxlbmd0aCAvIDMpXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdmFyIHZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlc19iYXNlKTtcclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHZlcnRpY2VzLCAzKSk7XHJcbiAgICB2YXIgcmFkaXVzID0gbmV3IEZsb2F0MzJBcnJheShyYWRpdXNlc19iYXNlKTtcclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncmFkaXVzJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShyYWRpdXMsIDEpKTtcclxuICAgIHZhciByYWRpYW5zID0gbmV3IEZsb2F0MzJBcnJheShyYWRpYW5zX2Jhc2UpO1xyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdyYWRpYW4nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHJhZGlhbnMsIDEpKTtcclxuICAgIHZhciBzY2FsZXMgPSBuZXcgRmxvYXQzMkFycmF5KHNjYWxlc19iYXNlKTtcclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnc2NhbGUnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHNjYWxlcywgMSkpO1xyXG4gICAgdmFyIGluZGljZXMgPSBuZXcgVWludDMyQXJyYXkoaW5kaWNlc19iYXNlKTtcclxuICAgIGdlb21ldHJ5LnNldEluZGV4KG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoaW5kaWNlcywgMSkpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IFRIUkVFLlVuaWZvcm1zVXRpbHMubWVyZ2UoW1xyXG4gICAgICAgIFRIUkVFLlVuaWZvcm1zTGliWydsaWdodHMnXSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0aW1lOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgICAgXSksXHJcbiAgICAgIHZlcnRleFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSBmbG9hdCByYWRpdXM7XFxuYXR0cmlidXRlIGZsb2F0IHJhZGlhbjtcXG5hdHRyaWJ1dGUgZmxvYXQgc2NhbGU7XFxuXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcblxcbnZhcnlpbmcgdmVjMyB2UG9zaXRpb247XFxudmFyeWluZyBtYXQ0IHZJbnZlcnRNYXRyaXg7XFxuXFxuZmxvYXQgaW52ZXJzZV84XzAoZmxvYXQgbSkge1xcbiAgcmV0dXJuIDEuMCAvIG07XFxufVxcblxcbm1hdDIgaW52ZXJzZV84XzAobWF0MiBtKSB7XFxuICByZXR1cm4gbWF0MihtWzFdWzFdLC1tWzBdWzFdLFxcbiAgICAgICAgICAgICAtbVsxXVswXSwgbVswXVswXSkgLyAobVswXVswXSptWzFdWzFdIC0gbVswXVsxXSptWzFdWzBdKTtcXG59XFxuXFxubWF0MyBpbnZlcnNlXzhfMChtYXQzIG0pIHtcXG4gIGZsb2F0IGEwMCA9IG1bMF1bMF0sIGEwMSA9IG1bMF1bMV0sIGEwMiA9IG1bMF1bMl07XFxuICBmbG9hdCBhMTAgPSBtWzFdWzBdLCBhMTEgPSBtWzFdWzFdLCBhMTIgPSBtWzFdWzJdO1xcbiAgZmxvYXQgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXTtcXG5cXG4gIGZsb2F0IGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMTtcXG4gIGZsb2F0IGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjA7XFxuICBmbG9hdCBiMjEgPSBhMjEgKiBhMTAgLSBhMTEgKiBhMjA7XFxuXFxuICBmbG9hdCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XFxuXFxuICByZXR1cm4gbWF0MyhiMDEsICgtYTIyICogYTAxICsgYTAyICogYTIxKSwgKGExMiAqIGEwMSAtIGEwMiAqIGExMSksXFxuICAgICAgICAgICAgICBiMTEsIChhMjIgKiBhMDAgLSBhMDIgKiBhMjApLCAoLWExMiAqIGEwMCArIGEwMiAqIGExMCksXFxuICAgICAgICAgICAgICBiMjEsICgtYTIxICogYTAwICsgYTAxICogYTIwKSwgKGExMSAqIGEwMCAtIGEwMSAqIGExMCkpIC8gZGV0O1xcbn1cXG5cXG5tYXQ0IGludmVyc2VfOF8wKG1hdDQgbSkge1xcbiAgZmxvYXRcXG4gICAgICBhMDAgPSBtWzBdWzBdLCBhMDEgPSBtWzBdWzFdLCBhMDIgPSBtWzBdWzJdLCBhMDMgPSBtWzBdWzNdLFxcbiAgICAgIGExMCA9IG1bMV1bMF0sIGExMSA9IG1bMV1bMV0sIGExMiA9IG1bMV1bMl0sIGExMyA9IG1bMV1bM10sXFxuICAgICAgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXSwgYTIzID0gbVsyXVszXSxcXG4gICAgICBhMzAgPSBtWzNdWzBdLCBhMzEgPSBtWzNdWzFdLCBhMzIgPSBtWzNdWzJdLCBhMzMgPSBtWzNdWzNdLFxcblxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcXG4gICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxcbiAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXFxuICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcXG4gICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxcbiAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXFxuICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyLFxcblxcbiAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcXG5cXG4gIHJldHVybiBtYXQ0KFxcbiAgICAgIGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSxcXG4gICAgICBhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDksXFxuICAgICAgYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzLFxcbiAgICAgIGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMyxcXG4gICAgICBhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcsXFxuICAgICAgYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3LFxcbiAgICAgIGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSxcXG4gICAgICBhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEsXFxuICAgICAgYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2LFxcbiAgICAgIGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNixcXG4gICAgICBhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDAsXFxuICAgICAgYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwLFxcbiAgICAgIGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNixcXG4gICAgICBhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYsXFxuICAgICAgYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwLFxcbiAgICAgIGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgLyBkZXQ7XFxufVxcblxcblxcbi8vXFxuLy8gRGVzY3JpcHRpb24gOiBBcnJheSBhbmQgdGV4dHVyZWxlc3MgR0xTTCAyRC8zRC80RCBzaW1wbGV4XFxuLy8gICAgICAgICAgICAgICBub2lzZSBmdW5jdGlvbnMuXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzdfMSh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgbW9kMjg5XzdfMSh2ZWM0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV83XzIodmVjNCB4KSB7XFxuICAgICByZXR1cm4gbW9kMjg5XzdfMSgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxudmVjNCB0YXlsb3JJbnZTcXJ0XzdfMyh2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzdfNCh2ZWMzIHYpXFxuICB7XFxuICBjb25zdCB2ZWMyICBDID0gdmVjMigxLjAvNi4wLCAxLjAvMy4wKSA7XFxuICBjb25zdCB2ZWM0ICBEXzdfNSA9IHZlYzQoMC4wLCAwLjUsIDEuMCwgMi4wKTtcXG5cXG4vLyBGaXJzdCBjb3JuZXJcXG4gIHZlYzMgaSAgPSBmbG9vcih2ICsgZG90KHYsIEMueXl5KSApO1xcbiAgdmVjMyB4MCA9ICAgdiAtIGkgKyBkb3QoaSwgQy54eHgpIDtcXG5cXG4vLyBPdGhlciBjb3JuZXJzXFxuICB2ZWMzIGdfN182ID0gc3RlcCh4MC55engsIHgwLnh5eik7XFxuICB2ZWMzIGwgPSAxLjAgLSBnXzdfNjtcXG4gIHZlYzMgaTEgPSBtaW4oIGdfN182Lnh5eiwgbC56eHkgKTtcXG4gIHZlYzMgaTIgPSBtYXgoIGdfN182Lnh5eiwgbC56eHkgKTtcXG5cXG4gIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcbiAgLy8gICB4MSA9IHgwIC0gaTEgICsgMS4wICogQy54eHg7XFxuICAvLyAgIHgyID0geDAgLSBpMiAgKyAyLjAgKiBDLnh4eDtcXG4gIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcbiAgdmVjMyB4MSA9IHgwIC0gaTEgKyBDLnh4eDtcXG4gIHZlYzMgeDIgPSB4MCAtIGkyICsgQy55eXk7IC8vIDIuMCpDLnggPSAxLzMgPSBDLnlcXG4gIHZlYzMgeDMgPSB4MCAtIERfN181Lnl5eTsgICAgICAvLyAtMS4wKzMuMCpDLnggPSAtMC41ID0gLUQueVxcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV83XzEoaSk7XFxuICB2ZWM0IHAgPSBwZXJtdXRlXzdfMiggcGVybXV0ZV83XzIoIHBlcm11dGVfN18yKFxcbiAgICAgICAgICAgICBpLnogKyB2ZWM0KDAuMCwgaTEueiwgaTIueiwgMS4wICkpXFxuICAgICAgICAgICArIGkueSArIHZlYzQoMC4wLCBpMS55LCBpMi55LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS54ICsgdmVjNCgwLjAsIGkxLngsIGkyLngsIDEuMCApKTtcXG5cXG4vLyBHcmFkaWVudHM6IDd4NyBwb2ludHMgb3ZlciBhIHNxdWFyZSwgbWFwcGVkIG9udG8gYW4gb2N0YWhlZHJvbi5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDkgKDQ5KjYgPSAyOTQpXFxuICBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyAvLyAxLjAvNy4wXFxuICB2ZWMzICBucyA9IG5fICogRF83XzUud3l6IC0gRF83XzUueHp4O1xcblxcbiAgdmVjNCBqID0gcCAtIDQ5LjAgKiBmbG9vcihwICogbnMueiAqIG5zLnopOyAgLy8gIG1vZChwLDcqNylcXG5cXG4gIHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7XFxuICB2ZWM0IHlfID0gZmxvb3IoaiAtIDcuMCAqIHhfICk7ICAgIC8vIG1vZChqLE4pXFxuXFxuICB2ZWM0IHggPSB4XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXFxuICB2ZWM0IGIwID0gdmVjNCggeC54eSwgeS54eSApO1xcbiAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cXG4gIC8vdmVjNCBzMCA9IHZlYzQobGVzc1RoYW4oYjAsMC4wKSkqMi4wIC0gMS4wO1xcbiAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuICB2ZWM0IHMwID0gZmxvb3IoYjApKjIuMCArIDEuMDtcXG4gIHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wO1xcbiAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXFxuICB2ZWM0IGEwID0gYjAueHp5dyArIHMwLnh6eXcqc2gueHh5eSA7XFxuICB2ZWM0IGExXzdfNyA9IGIxLnh6eXcgKyBzMS54enl3KnNoLnp6d3cgO1xcblxcbiAgdmVjMyBwMF83XzggPSB2ZWMzKGEwLnh5LGgueCk7XFxuICB2ZWMzIHAxID0gdmVjMyhhMC56dyxoLnkpO1xcbiAgdmVjMyBwMiA9IHZlYzMoYTFfN183Lnh5LGgueik7XFxuICB2ZWMzIHAzID0gdmVjMyhhMV83XzcuencsaC53KTtcXG5cXG4vL05vcm1hbGlzZSBncmFkaWVudHNcXG4gIHZlYzQgbm9ybSA9IHRheWxvckludlNxcnRfN18zKHZlYzQoZG90KHAwXzdfOCxwMF83XzgpLCBkb3QocDEscDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLHAzKSkpO1xcbiAgcDBfN184ICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG5cXG4vLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG4gIHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApO1xcbiAgbSA9IG0gKiBtO1xcbiAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwXzdfOCx4MCksIGRvdChwMSx4MSksXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3QocDIseDIpLCBkb3QocDMseDMpICkgKTtcXG4gIH1cXG5cXG5cXG5cXG5tYXQ0IHRyYW5zbGF0ZU1hdHJpeF8xXzkodmVjMyB2KSB7XFxuICByZXR1cm4gbWF0NChcXG4gICAgMS4wLCAwLjAsIDAuMCwgMC4wLFxcbiAgICAwLjAsIDEuMCwgMC4wLCAwLjAsXFxuICAgIDAuMCwgMC4wLCAxLjAsIDAuMCxcXG4gICAgdi54LCB2LnksIHYueiwgMS4wXFxuICApO1xcbn1cXG5cXG5cXG5tYXQ0IHJvdGF0aW9uTWF0cml4WF80XzEwKGZsb2F0IHJhZGlhbikge1xcbiAgcmV0dXJuIG1hdDQoXFxuICAgIDEuMCwgMC4wLCAwLjAsIDAuMCxcXG4gICAgMC4wLCBjb3MocmFkaWFuKSwgLXNpbihyYWRpYW4pLCAwLjAsXFxuICAgIDAuMCwgc2luKHJhZGlhbiksIGNvcyhyYWRpYW4pLCAwLjAsXFxuICAgIDAuMCwgMC4wLCAwLjAsIDEuMFxcbiAgKTtcXG59XFxuXFxuXFxubWF0NCByb3RhdGlvbk1hdHJpeFlfNV8xMShmbG9hdCByYWRpYW4pIHtcXG4gIHJldHVybiBtYXQ0KFxcbiAgICBjb3MocmFkaWFuKSwgMC4wLCBzaW4ocmFkaWFuKSwgMC4wLFxcbiAgICAwLjAsIDEuMCwgMC4wLCAwLjAsXFxuICAgIC1zaW4ocmFkaWFuKSwgMC4wLCBjb3MocmFkaWFuKSwgMC4wLFxcbiAgICAwLjAsIDAuMCwgMC4wLCAxLjBcXG4gICk7XFxufVxcblxcblxcbm1hdDQgcm90YXRpb25NYXRyaXhaXzZfMTIoZmxvYXQgcmFkaWFuKSB7XFxuICByZXR1cm4gbWF0NChcXG4gICAgY29zKHJhZGlhbiksIC1zaW4ocmFkaWFuKSwgMC4wLCAwLjAsXFxuICAgIHNpbihyYWRpYW4pLCBjb3MocmFkaWFuKSwgMC4wLCAwLjAsXFxuICAgIDAuMCwgMC4wLCAxLjAsIDAuMCxcXG4gICAgMC4wLCAwLjAsIDAuMCwgMS4wXFxuICApO1xcbn1cXG5cXG5cXG5cXG5tYXQ0IHJvdGF0aW9uTWF0cml4XzJfMTMoZmxvYXQgcmFkaWFuX3gsIGZsb2F0IHJhZGlhbl95LCBmbG9hdCByYWRpYW5feikge1xcbiAgcmV0dXJuIHJvdGF0aW9uTWF0cml4WF80XzEwKHJhZGlhbl94KSAqIHJvdGF0aW9uTWF0cml4WV81XzExKHJhZGlhbl95KSAqIHJvdGF0aW9uTWF0cml4Wl82XzEyKHJhZGlhbl96KTtcXG59XFxuXFxuXFxubWF0NCBzY2FsZU1hdHJpeF8zXzE0KHZlYzMgc2NhbGUpIHtcXG4gIHJldHVybiBtYXQ0KFxcbiAgICBzY2FsZS54LCAwLjAsIDAuMCwgMC4wLFxcbiAgICAwLjAsIHNjYWxlLnksIDAuMCwgMC4wLFxcbiAgICAwLjAsIDAuMCwgc2NhbGUueiwgMC4wLFxcbiAgICAwLjAsIDAuMCwgMC4wLCAxLjBcXG4gICk7XFxufVxcblxcblxcblxcbnZlYzQgbW92ZSh2ZWMzIHBvc2l0aW9uKSB7XFxuICByZXR1cm4gdHJhbnNsYXRlTWF0cml4XzFfOShcXG4gICAgdmVjMyhcXG4gICAgICBjb3MocmFkaWFucyh0aW1lICogMC41KSArIHJhZGlhbikgKiByYWRpdXMsXFxuICAgICAgc2luKHJhZGlhbnModGltZSAqIDAuNSkgKyByYWRpYW4gKiAxMC4wKSAqIHJhZGl1cyAqIDAuMyxcXG4gICAgICBzaW4ocmFkaWFucyh0aW1lICogMC41KSArIHJhZGlhbikgKiByYWRpdXNcXG4gICAgKVxcbiAgKSAqIHJvdGF0aW9uTWF0cml4XzJfMTMoXFxuICAgIHJhZGlhbnModGltZSAqIHJhZGlhbikgKyByYWRpYW4sIHJhZGlhbnModGltZSkgKyByYWRpYW4sIHJhZGlhbnModGltZSkgKyByYWRpYW5cXG4gICkgKiBzY2FsZU1hdHJpeF8zXzE0KFxcbiAgICB2ZWMzKDIwLjAgKiBzY2FsZSkgKyB2ZWMzKDEwLjApICogc25vaXNlXzdfNCgocG9zaXRpb24gKyBzaW4ocmFkaWFuKSkpXFxuICApICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXG59XFxuXFxudm9pZCBtYWluKCkge1xcbiAgdmVjNCB1cGRhdGVfcG9zaXRpb24gPSBtb3ZlKHBvc2l0aW9uKTtcXG4gIHZQb3NpdGlvbiA9IHBvc2l0aW9uO1xcbiAgdkludmVydE1hdHJpeCA9IGludmVyc2VfOF8wKHJvdGF0aW9uTWF0cml4XzJfMTMoXFxuICAgIHJhZGlhbnModGltZSAqIHJhZGlhbikgKyByYWRpYW4sIHJhZGlhbnModGltZSkgKyByYWRpYW4sIHJhZGlhbnModGltZSkgKyByYWRpYW5cXG4gICkpO1xcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdXBkYXRlX3Bvc2l0aW9uO1xcbn1cXG5cIixcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5zdHJ1Y3QgRGlyZWN0aW9uYWxMaWdodCB7XFxuICB2ZWMzIGNvbG9yO1xcbiAgdmVjMyBkaXJlY3Rpb247XFxufTtcXG51bmlmb3JtIERpcmVjdGlvbmFsTGlnaHQgZGlyZWN0aW9uYWxMaWdodHNbMV07XFxuXFxudmFyeWluZyB2ZWMzIHZQb3NpdGlvbjtcXG52YXJ5aW5nIG1hdDQgdkludmVydE1hdHJpeDtcXG5cXG52b2lkIG1haW4oKSB7XFxuICB2ZWMzIG5vcm1hbCA9IG5vcm1hbGl6ZShjcm9zcyhkRmR4KHZQb3NpdGlvbiksIGRGZHkodlBvc2l0aW9uKSkpO1xcbiAgdmVjMyBpbnZfbGlnaHQgPSBub3JtYWxpemUodkludmVydE1hdHJpeCAqIHZlYzQoZGlyZWN0aW9uYWxMaWdodHNbMF0uZGlyZWN0aW9uLCAxLjApKS54eXo7XFxuICBmbG9hdCBkaWZmID0gKGRvdChub3JtYWwsIGludl9saWdodCkgKyAxLjApIC8gMi4wICogMC4yNSArIDAuNzU7XFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZlYzMoMS4wKSAqIGRpZmYsIDEuMCk7XFxufVxcblwiLFxyXG4gICAgICBzaGFkaW5nOiBUSFJFRS5GbGF0U2hhZGluZyxcclxuICAgICAgbGlnaHRzOiB0cnVlLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDEyMDAsIDY0LCA2NCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXG5cXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcblxcbnZvaWQgbWFpbigpIHtcXG4gIHZDb2xvciA9IHZlYzMoKHBvc2l0aW9uLnkgLyAxMDAwLjAgKyAxLjApICogMC4xMiArIDAuODgpO1xcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXG59XFxuXCIsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXG5cXG52b2lkIG1haW4oKSB7XFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZDb2xvciwgMS4wKTtcXG59XFxuXCIsXHJcbiAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZFdpcmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgxMTAwLCA2NCwgNjQpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcclxuICAgICAgY29sb3I6IDB4ZGRkZGRkLFxyXG4gICAgICB3aXJlZnJhbWU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVBvaW50c0luRnJhbWVidWZmZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgdmFyIHZlcnRpY2VzX2Jhc2UgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjAwMDsgaSsrKSB7XHJcbiAgICAgIHZlcnRpY2VzX2Jhc2UucHVzaChcclxuICAgICAgICBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAxMjApICsgMTIwKSxcclxuICAgICAgICBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjAwKSAvIDEwKSxcclxuICAgICAgICBVdGlsLmdldFJhbmRvbUludCgyMDAsIDEwMDApXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICB2YXIgdmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzX2Jhc2UpO1xyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUodmVydGljZXMsIDMpKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcblxcbnZlYzMgZ2V0UG9sYXJDb29yZChmbG9hdCByYWQxLCBmbG9hdCByYWQyLCBmbG9hdCByKSB7XFxuICByZXR1cm4gdmVjMyhcXG4gICAgY29zKHJhZDEpICogY29zKHJhZDIpICogcixcXG4gICAgc2luKHJhZDEpICogcixcXG4gICAgY29zKHJhZDEpICogc2luKHJhZDIpICogclxcbiAgKTtcXG59XFxuXFxudm9pZCBtYWluKCkge1xcbiAgdmVjMyB1cGRhdGVfcG9zaXRpb24gPSBnZXRQb2xhckNvb3JkKFxcbiAgICBwb3NpdGlvbi54LFxcbiAgICBwb3NpdGlvbi55ICsgcmFkaWFucyh0aW1lIC8gMi4wKSxcXG4gICAgcG9zaXRpb24ueiArIHNpbihyYWRpYW5zKHRpbWUgKiAyLjApICsgcG9zaXRpb24ueCArIHBvc2l0aW9uLnkpICogcG9zaXRpb24ueiAvIDQuMFxcbiAgKTtcXG4gIHZlYzQgbXZfcG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHVwZGF0ZV9wb3NpdGlvbiwgMS4wKTtcXG5cXG4gIGdsX1BvaW50U2l6ZSA9IDIuMCAqICgxMDAwLjAgLyBsZW5ndGgobXZfcG9zaXRpb24ueHl6KSk7XFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdl9wb3NpdGlvbjtcXG59XFxuXCIsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudm9pZCBtYWluKCkge1xcbiAgdmVjMyBuO1xcbiAgbi54eSA9IGdsX1BvaW50Q29vcmQueHkgKiAyLjAgLSAxLjA7XFxuICBuLnogPSAxLjAgLSBkb3Qobi54eSwgbi54eSk7XFxuICBpZiAobi56IDwgMC4wKSBkaXNjYXJkO1xcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCgxLjApO1xcbn1cXG5cIixcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5Qb2ludHMoZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZEluRnJhbWVidWZmZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeV9iYXNlID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDEwMDAsIDEyOCwgMTI4KTtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgZ2VvbWV0cnkuZnJvbUdlb21ldHJ5KGdlb21ldHJ5X2Jhc2UpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICB0aW1lOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxuXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXG5cXG52ZWMzIGhzdjJyZ2JfMV8wKHZlYzMgYyl7XFxuICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XFxuICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XFxuICByZXR1cm4gYy56ICogbWl4KEsueHh4LCBjbGFtcChwIC0gSy54eHgsIDAuMCwgMS4wKSwgYy55KTtcXG59XFxuXFxuXFxuLy9cXG4vLyBEZXNjcmlwdGlvbiA6IEFycmF5IGFuZCB0ZXh0dXJlbGVzcyBHTFNMIDJELzNELzREIHNpbXBsZXhcXG4vLyAgICAgICAgICAgICAgIG5vaXNlIGZ1bmN0aW9ucy5cXG4vLyAgICAgIEF1dGhvciA6IElhbiBNY0V3YW4sIEFzaGltYSBBcnRzLlxcbi8vICBNYWludGFpbmVyIDogaWptXFxuLy8gICAgIExhc3Rtb2QgOiAyMDExMDgyMiAoaWptKVxcbi8vICAgICBMaWNlbnNlIDogQ29weXJpZ2h0IChDKSAyMDExIEFzaGltYSBBcnRzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxcbi8vICAgICAgICAgICAgICAgRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlLlxcbi8vICAgICAgICAgICAgICAgaHR0cHM6Ly9naXRodWIuY29tL2FzaGltYS93ZWJnbC1ub2lzZVxcbi8vXFxuXFxudmVjMyBtb2QyODlfMl8xKHZlYzMgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBtb2QyODlfMl8xKHZlYzQgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBwZXJtdXRlXzJfMih2ZWM0IHgpIHtcXG4gICAgIHJldHVybiBtb2QyODlfMl8xKCgoeCozNC4wKSsxLjApKngpO1xcbn1cXG5cXG52ZWM0IHRheWxvckludlNxcnRfMl8zKHZlYzQgcilcXG57XFxuICByZXR1cm4gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiByO1xcbn1cXG5cXG5mbG9hdCBzbm9pc2VfMl80KHZlYzMgdilcXG4gIHtcXG4gIGNvbnN0IHZlYzIgIEMgPSB2ZWMyKDEuMC82LjAsIDEuMC8zLjApIDtcXG4gIGNvbnN0IHZlYzQgIERfMl81ID0gdmVjNCgwLjAsIDAuNSwgMS4wLCAyLjApO1xcblxcbi8vIEZpcnN0IGNvcm5lclxcbiAgdmVjMyBpICA9IGZsb29yKHYgKyBkb3QodiwgQy55eXkpICk7XFxuICB2ZWMzIHgwID0gICB2IC0gaSArIGRvdChpLCBDLnh4eCkgO1xcblxcbi8vIE90aGVyIGNvcm5lcnNcXG4gIHZlYzMgZ18yXzYgPSBzdGVwKHgwLnl6eCwgeDAueHl6KTtcXG4gIHZlYzMgbCA9IDEuMCAtIGdfMl82O1xcbiAgdmVjMyBpMSA9IG1pbiggZ18yXzYueHl6LCBsLnp4eSApO1xcbiAgdmVjMyBpMiA9IG1heCggZ18yXzYueHl6LCBsLnp4eSApO1xcblxcbiAgLy8gICB4MCA9IHgwIC0gMC4wICsgMC4wICogQy54eHg7XFxuICAvLyAgIHgxID0geDAgLSBpMSAgKyAxLjAgKiBDLnh4eDtcXG4gIC8vICAgeDIgPSB4MCAtIGkyICArIDIuMCAqIEMueHh4O1xcbiAgLy8gICB4MyA9IHgwIC0gMS4wICsgMy4wICogQy54eHg7XFxuICB2ZWMzIHgxID0geDAgLSBpMSArIEMueHh4O1xcbiAgdmVjMyB4MiA9IHgwIC0gaTIgKyBDLnl5eTsgLy8gMi4wKkMueCA9IDEvMyA9IEMueVxcbiAgdmVjMyB4MyA9IHgwIC0gRF8yXzUueXl5OyAgICAgIC8vIC0xLjArMy4wKkMueCA9IC0wLjUgPSAtRC55XFxuXFxuLy8gUGVybXV0YXRpb25zXFxuICBpID0gbW9kMjg5XzJfMShpKTtcXG4gIHZlYzQgcCA9IHBlcm11dGVfMl8yKCBwZXJtdXRlXzJfMiggcGVybXV0ZV8yXzIoXFxuICAgICAgICAgICAgIGkueiArIHZlYzQoMC4wLCBpMS56LCBpMi56LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS55ICsgdmVjNCgwLjAsIGkxLnksIGkyLnksIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnggKyB2ZWM0KDAuMCwgaTEueCwgaTIueCwgMS4wICkpO1xcblxcbi8vIEdyYWRpZW50czogN3g3IHBvaW50cyBvdmVyIGEgc3F1YXJlLCBtYXBwZWQgb250byBhbiBvY3RhaGVkcm9uLlxcbi8vIFRoZSByaW5nIHNpemUgMTcqMTcgPSAyODkgaXMgY2xvc2UgdG8gYSBtdWx0aXBsZSBvZiA0OSAoNDkqNiA9IDI5NClcXG4gIGZsb2F0IG5fID0gMC4xNDI4NTcxNDI4NTc7IC8vIDEuMC83LjBcXG4gIHZlYzMgIG5zID0gbl8gKiBEXzJfNS53eXogLSBEXzJfNS54eng7XFxuXFxuICB2ZWM0IGogPSBwIC0gNDkuMCAqIGZsb29yKHAgKiBucy56ICogbnMueik7ICAvLyAgbW9kKHAsNyo3KVxcblxcbiAgdmVjNCB4XyA9IGZsb29yKGogKiBucy56KTtcXG4gIHZlYzQgeV8gPSBmbG9vcihqIC0gNy4wICogeF8gKTsgICAgLy8gbW9kKGosTilcXG5cXG4gIHZlYzQgeCA9IHhfICpucy54ICsgbnMueXl5eTtcXG4gIHZlYzQgeSA9IHlfICpucy54ICsgbnMueXl5eTtcXG4gIHZlYzQgaCA9IDEuMCAtIGFicyh4KSAtIGFicyh5KTtcXG5cXG4gIHZlYzQgYjAgPSB2ZWM0KCB4Lnh5LCB5Lnh5ICk7XFxuICB2ZWM0IGIxID0gdmVjNCggeC56dywgeS56dyApO1xcblxcbiAgLy92ZWM0IHMwID0gdmVjNChsZXNzVGhhbihiMCwwLjApKSoyLjAgLSAxLjA7XFxuICAvL3ZlYzQgczEgPSB2ZWM0KGxlc3NUaGFuKGIxLDAuMCkpKjIuMCAtIDEuMDtcXG4gIHZlYzQgczAgPSBmbG9vcihiMCkqMi4wICsgMS4wO1xcbiAgdmVjNCBzMSA9IGZsb29yKGIxKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHNoID0gLXN0ZXAoaCwgdmVjNCgwLjApKTtcXG5cXG4gIHZlYzQgYTAgPSBiMC54enl3ICsgczAueHp5dypzaC54eHl5IDtcXG4gIHZlYzQgYTFfMl83ID0gYjEueHp5dyArIHMxLnh6eXcqc2guenp3dyA7XFxuXFxuICB2ZWMzIHAwXzJfOCA9IHZlYzMoYTAueHksaC54KTtcXG4gIHZlYzMgcDEgPSB2ZWMzKGEwLnp3LGgueSk7XFxuICB2ZWMzIHAyID0gdmVjMyhhMV8yXzcueHksaC56KTtcXG4gIHZlYzMgcDMgPSB2ZWMzKGExXzJfNy56dyxoLncpO1xcblxcbi8vTm9ybWFsaXNlIGdyYWRpZW50c1xcbiAgdmVjNCBub3JtID0gdGF5bG9ySW52U3FydF8yXzModmVjNChkb3QocDBfMl84LHAwXzJfOCksIGRvdChwMSxwMSksIGRvdChwMiwgcDIpLCBkb3QocDMscDMpKSk7XFxuICBwMF8yXzggKj0gbm9ybS54O1xcbiAgcDEgKj0gbm9ybS55O1xcbiAgcDIgKj0gbm9ybS56O1xcbiAgcDMgKj0gbm9ybS53O1xcblxcbi8vIE1peCBmaW5hbCBub2lzZSB2YWx1ZVxcbiAgdmVjNCBtID0gbWF4KDAuNiAtIHZlYzQoZG90KHgwLHgwKSwgZG90KHgxLHgxKSwgZG90KHgyLHgyKSwgZG90KHgzLHgzKSksIDAuMCk7XFxuICBtID0gbSAqIG07XFxuICByZXR1cm4gNDIuMCAqIGRvdCggbSptLCB2ZWM0KCBkb3QocDBfMl84LHgwKSwgZG90KHAxLHgxKSxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvdChwMix4MiksIGRvdChwMyx4MykgKSApO1xcbiAgfVxcblxcblxcblxcblxcbnZvaWQgbWFpbigpIHtcXG4gIGZsb2F0IG5vaXNlID0gc25vaXNlXzJfNChcXG4gICAgdmVjMyhwb3NpdGlvbi54ICsgdGltZSAqIDEwLjAsIHBvc2l0aW9uLnkgKyBjb3ModGltZSAvIDIwLjApICogMTAwLjAsIHBvc2l0aW9uLnogKyB0aW1lICogMTAuMCkgLyA4MDAuMFxcbiAgKTtcXG4gIHZDb2xvciA9IGhzdjJyZ2JfMV8wKHZlYzMobm9pc2UgKiAwLjIgKyAwLjc1LCAwLjQsIG5vaXNlICogMC4zICsgMC41KSk7XFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcbn1cXG5cIixcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcblxcbnZvaWQgbWFpbigpIHtcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQodkNvbG9yLCAxLjApO1xcbn1cXG5cIixcclxuICAgICAgc2lkZTogVEhSRUUuQmFja1NpZGUsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVQbGFuZUZvckZyYW1lYnVmZmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnlfYmFzZSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDEwMDAsIDEwMDApO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICBnZW9tZXRyeS5mcm9tR2VvbWV0cnkoZ2VvbWV0cnlfYmFzZSk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzb2x1dGlvbjoge1xyXG4gICAgICAgICAgdHlwZTogJ3YyJyxcclxuICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGV4dHVyZToge1xyXG4gICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgdmFsdWU6IHJlbmRlcl90YXJnZXQsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0ZXh0dXJlMjoge1xyXG4gICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgdmFsdWU6IHJlbmRlcl90YXJnZXQyLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgdmVjMiB2VXY7XFxuXFxudm9pZCBtYWluKHZvaWQpIHtcXG4gIHZVdiA9IHV2O1xcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXG59XFxuXCIsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcbnVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTI7XFxuXFxuY29uc3QgZmxvYXQgYmx1ciA9IDIwLjA7XFxuXFxudmFyeWluZyB2ZWMyIHZVdjtcXG5cXG52b2lkIG1haW4oKSB7XFxuICB2ZWM0IGNvbG9yID0gdmVjNCgwLjApO1xcbiAgZm9yIChmbG9hdCB4ID0gMC4wOyB4IDwgYmx1cjsgeCsrKXtcXG4gICAgZm9yIChmbG9hdCB5ID0gMC4wOyB5IDwgYmx1cjsgeSsrKXtcXG4gICAgICBjb2xvciArPSB0ZXh0dXJlMkQodGV4dHVyZSwgdlV2IC0gKHZlYzIoeCwgeSkgLSB2ZWMyKGJsdXIgLyAyLjApKSAvIHJlc29sdXRpb24pO1xcbiAgICB9XFxuICB9XFxuICB2ZWM0IGNvbG9yMiA9IGNvbG9yIC8gcG93KGJsdXIsIDIuMCk7XFxuICB2ZWM0IGNvbG9yMyA9IHRleHR1cmUyRCh0ZXh0dXJlMiwgdlV2KTtcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IzLnJnYiwgZmxvb3IobGVuZ3RoKGNvbG9yMi5yZ2IpKSk7XFxufVxcblwiLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICdiZy13aGl0ZSc7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMSwgMCk7XHJcblxyXG4gICAgICBzdWJfY2FtZXJhMi5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KDEwMDAsIDMwMCwgMCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLmxvb2suYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgYmdfZmIgPSBjcmVhdGVCYWNrZ3JvdW5kSW5GcmFtZWJ1ZmZlcigpO1xyXG4gICAgICBwb2ludHNfZmIgPSBjcmVhdGVQb2ludHNJbkZyYW1lYnVmZmVyKCk7XHJcbiAgICAgIHN1Yl9zY2VuZTIuYWRkKGJnX2ZiKTtcclxuICAgICAgc3ViX3NjZW5lMi5hZGQocG9pbnRzX2ZiKTtcclxuICAgICAgc3ViX3NjZW5lMi5hZGQoc3ViX2xpZ2h0KTtcclxuXHJcbiAgICAgIHBvaW50cyA9IGNyZWF0ZVBvaW50c0ZvckNyb3NzRmFkZSgpO1xyXG4gICAgICBzdWJfc2NlbmUuYWRkKHBvaW50cyk7XHJcbiAgICAgIHN1Yl9jYW1lcmEucG9zaXRpb24uc2V0KDAsIDAsIDMwMDApO1xyXG4gICAgICBzdWJfY2FtZXJhLmxvb2tBdCgwLCAwLCAwKTtcclxuXHJcbiAgICAgIGZyYW1lYnVmZmVyID0gY3JlYXRlUGxhbmVGb3JGcmFtZWJ1ZmZlcigpO1xyXG4gICAgICBzY2VuZS5hZGQoZnJhbWVidWZmZXIpO1xyXG4gICAgICBiZyA9IGNyZWF0ZUJhY2tncm91bmQoKTtcclxuICAgICAgc2NlbmUuYWRkKGJnKTtcclxuICAgICAgYmdfd2YgPSBjcmVhdGVCYWNrZ3JvdW5kV2lyZSgpO1xyXG4gICAgICBzY2VuZS5hZGQoYmdfd2YpO1xyXG4gICAgICBvYmogPSBjcmVhdGVPYmplY3QoKTtcclxuICAgICAgc2NlbmUuYWRkKG9iaik7XHJcbiAgICAgIGxpZ2h0LnBvc2l0aW9uLnNldCgwLCAxLCAwKVxyXG4gICAgICBzY2VuZS5hZGQobGlnaHQpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgxMDAwLCAzMDAsIDApO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnJztcclxuICAgICAgYmdfZmIuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBiZ19mYi5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHN1Yl9zY2VuZTIucmVtb3ZlKGJnX2ZiKTtcclxuICAgICAgcG9pbnRzX2ZiLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzX2ZiLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc3ViX3NjZW5lMi5yZW1vdmUocG9pbnRzX2ZiKTtcclxuICAgICAgc3ViX3NjZW5lMi5yZW1vdmUoc3ViX2xpZ2h0KTtcclxuXHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHN1Yl9zY2VuZS5yZW1vdmUocG9pbnRzKTtcclxuXHJcbiAgICAgIGZyYW1lYnVmZmVyLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgZnJhbWVidWZmZXIubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoZnJhbWVidWZmZXIpO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgICAgYmdfd2YuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBiZ193Zi5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShiZ193Zik7XHJcbiAgICAgIG9iai5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIG9iai5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShvYmopO1xyXG4gICAgICBzY2VuZS5yZW1vdmUobGlnaHQpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpIHtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuICAgICAgZnJhbWVidWZmZXIubG9va0F0KGNhbWVyYS5wb3NpdGlvbik7XHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuXHJcbiAgICAgIGJnX2ZiLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuICAgICAgcG9pbnRzX2ZiLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuXHJcbiAgICAgIGJnX3dmLnJvdGF0aW9uLnkgPSBwb2ludHMubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSAvIDEwMDA7XHJcbiAgICAgIG9iai5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlKys7XHJcblxyXG4gICAgICBmb3JjZS5hcHBseUhvb2soMCwgMC4xMik7XHJcbiAgICAgIGZvcmNlLmFwcGx5RHJhZygwLjE4KTtcclxuICAgICAgZm9yY2UudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hbmNob3IueSA9IE1hdGguc2luKHBvaW50cy5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlIC8gMTAwKSAqIDEwMDtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlTG9vaygpO1xyXG4gICAgICBzdWJfY2FtZXJhMi5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4xKTtcclxuICAgICAgc3ViX2NhbWVyYTIuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgc3ViX2NhbWVyYTIudXBkYXRlTG9vaygpO1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIoc3ViX3NjZW5lMiwgc3ViX2NhbWVyYTIsIHJlbmRlcl90YXJnZXQyKTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHN1Yl9zY2VuZSwgc3ViX2NhbWVyYSwgcmVuZGVyX3RhcmdldCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMiwgMzApO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpIHtcclxuICAgICAgZm9yY2UuYW5jaG9yLnNldCgxLCAwKTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3JjZS5hbmNob3Iuc2V0KDEsIDApO1xyXG4gICAgfSxcclxuICAgIHJlc2l6ZVdpbmRvdzogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwudW5pZm9ybXMucmVzb2x1dGlvbi52YWx1ZS5zZXQod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLnVuaWZvcm1zLnJlc29sdXRpb24udmFsdWUuc2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIE1vdmVyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9tb3ZlcicpO1xyXG52YXIgUG9pbnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludHMuanMnKTtcclxuXHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciBtb3ZlcnNfbnVtID0gMjAwMDA7XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBjb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgb3BhY2l0aWVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBncmF2aXR5ID0gbmV3IFRIUkVFLlZlY3RvcjMoMS41LCAwLCAwKTtcclxuICB2YXIgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICB2YXIgaXNfdG91Y2hlZCA9IGZhbHNlO1xyXG5cclxuICB2YXIgdXBkYXRlTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkge1xyXG4gICAgICAgIG1vdmVyLnRpbWUrKztcclxuICAgICAgICBtb3Zlci5hcHBseUZvcmNlKGdyYXZpdHkpO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgaWYgKG1vdmVyLmEgPCAwLjgpIHtcclxuICAgICAgICAgIG1vdmVyLmEgKz0gMC4wMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vdmVyLnZlbG9jaXR5LnggPiAxMDAwKSB7XHJcbiAgICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgIG1vdmVyLnRpbWUgPSAwO1xyXG4gICAgICAgICAgbW92ZXIuYSA9IDAuMDtcclxuICAgICAgICAgIG1vdmVyLmluYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnZlbG9jaXR5Lnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIudmVsb2NpdHkuejtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY3RpdmF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gZ3Jhdml0eS54ICogMTYpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZCA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDEyMCkgKiAzKTtcclxuICAgICAgICB2YXIgcmFuZ2UgPSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgyLCAxMjgpKSAvIE1hdGgubG9nKDEyOCkgKiAxNjAgKyA2MDtcclxuICAgICAgICB2YXIgeSA9IE1hdGguc2luKHJhZCkgKiByYW5nZTtcclxuICAgICAgICB2YXIgeiA9IE1hdGguY29zKHJhZCkgKiByYW5nZTtcclxuICAgICAgICB2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoLTEwMDAsIHksIHopO1xyXG4gICAgICAgIHZlY3Rvci5hZGQocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgICBtb3Zlci5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIG1vdmVyLmluaXQodmVjdG9yKTtcclxuICAgICAgICBtb3Zlci5hID0gMDtcclxuICAgICAgICBtb3Zlci5zaXplID0gVXRpbC5nZXRSYW5kb21JbnQoNSwgNjApO1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgaWYgKGNvdW50ID49IE1hdGgucG93KGdyYXZpdHkueCAqIDMsIGdyYXZpdHkueCAqIDAuNCkpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHVwZGF0ZVBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcG9pbnRzLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVRleHR1cmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIHZhciBncmFkID0gbnVsbDtcclxuICAgIHZhciB0ZXh0dXJlID0gbnVsbDtcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSAyNTY7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gMjU2O1xyXG4gICAgZ3JhZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudCgxMjgsIDEyOCwgMjAsIDEyOCwgMTI4LCAxMjgpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC4yLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC41LCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLjAsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDApJyk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcclxuICAgIGN0eC5hcmMoMTI4LCAxMjgsIDEyOCwgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXMpO1xyXG4gICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdGV4dHVyZTtcclxuICB9O1xyXG5cclxuICB2YXIgY2hhbmdlR3Jhdml0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGlzX3RvdWNoZWQpIHtcclxuICAgICAgaWYgKGdyYXZpdHkueCA8IDYpIGdyYXZpdHkueCArPSAwLjAyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGdyYXZpdHkueCA+IDEuNSkgZ3Jhdml0eS54IC09IDAuMTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc19udW07IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG5ldyBNb3ZlcigpO1xyXG4gICAgICAgIHZhciBoID0gVXRpbC5nZXRSYW5kb21JbnQoNjAsIDIxMCk7XHJcbiAgICAgICAgdmFyIHMgPSBVdGlsLmdldFJhbmRvbUludCgzMCwgOTApO1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyBoICsgJywgJyArIHMgKyAnJSwgNTAlKScpO1xyXG5cclxuICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKFV0aWwuZ2V0UmFuZG9tSW50KC0xMDAsIDEwMCksIDAsIDApKTtcclxuICAgICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIudmVsb2NpdHkueTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnZlbG9jaXR5Lno7XHJcbiAgICAgICAgY29sb3IudG9BcnJheShjb2xvcnMsIGkgKiAzKTtcclxuICAgICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgICAgfVxyXG4gICAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgICAgc2NlbmU6IHNjZW5lLFxyXG4gICAgICAgIHZzOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgY3VzdG9tQ29sb3I7XFxuYXR0cmlidXRlIGZsb2F0IHZlcnRleE9wYWNpdHk7XFxuYXR0cmlidXRlIGZsb2F0IHNpemU7XFxuXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcblxcbnZvaWQgbWFpbigpIHtcXG4gIHZDb2xvciA9IGN1c3RvbUNvbG9yO1xcbiAgZk9wYWNpdHkgPSB2ZXJ0ZXhPcGFjaXR5O1xcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXG4gIGdsX1BvaW50U2l6ZSA9IHNpemUgKiAoMzAwLjAgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKTtcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxufVxcblwiLFxyXG4gICAgICAgIGZzOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxuXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcblxcbnZvaWQgbWFpbigpIHtcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXG59XFxuXCIsXHJcbiAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXHJcbiAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgICAgc2l6ZXM6IHNpemVzLFxyXG4gICAgICAgIHRleHR1cmU6IGNyZWF0ZVRleHR1cmUoKSxcclxuICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xyXG4gICAgICB9KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoODAwLCAwLCAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMub2JqKTtcclxuICAgICAgbW92ZXJzID0gW107XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGNoYW5nZUdyYXZpdHkoKTtcclxuICAgICAgYWN0aXZhdGVNb3ZlcigpO1xyXG4gICAgICB1cGRhdGVNb3ZlcigpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDA4KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rQXRDZW50ZXIoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgaXNfdG91Y2hlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci56ID0gdmVjdG9yX21vdXNlX21vdmUueCAqIDEyMDtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci55ID0gdmVjdG9yX21vdXNlX21vdmUueSAqIC0xMjA7XHJcbiAgICAgIC8vY2FtZXJhLmxvb2tBdENlbnRlcigpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueiA9IDA7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueSA9IDA7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcblxyXG52YXIgUG9pbnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludHMuanMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEpO1xyXG4gIH07XHJcbiAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgdmFyIGltYWdlX3ZlcnRpY2VzID0gW107XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBudWxsO1xyXG4gIHZhciBjb2xvcnMgPSBudWxsO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBudWxsO1xyXG4gIHZhciBzaXplcyA9IG51bGw7XHJcbiAgdmFyIGxlbmd0aF9zaWRlID0gNDAwO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIGNyZWF0ZWRfcG9pbnRzID0gZmFsc2U7XHJcblxyXG4gIHZhciBsb2FkSW1hZ2UgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgaW1hZ2Uuc3JjID0gJy4vaW1nL2ltYWdlX2RhdGEvZWxlcGhhbnQucG5nJztcclxuICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICB2YXIgZ2V0SW1hZ2VEYXRhID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjYW52YXMud2lkdGggPSBsZW5ndGhfc2lkZTtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBsZW5ndGhfc2lkZTtcclxuICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gICAgdmFyIGltYWdlX2RhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGxlbmd0aF9zaWRlLCBsZW5ndGhfc2lkZSk7XHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGxlbmd0aF9zaWRlOyB5KyspIHtcclxuICAgICAgaWYgKHkgJSAzID4gMCkgY29udGludWU7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgbGVuZ3RoX3NpZGU7IHgrKykge1xyXG4gICAgICAgIGlmICh4ICUgMyA+IDApIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmKGltYWdlX2RhdGEuZGF0YVsoeCArIHkgKiBsZW5ndGhfc2lkZSkgKiA0XSA+IDApIHtcclxuICAgICAgICAgIGltYWdlX3ZlcnRpY2VzLnB1c2goMCwgKHkgLSBsZW5ndGhfc2lkZSAvIDIpICogLTEsICh4IC0gbGVuZ3RoX3NpZGUvIDIpICogLTEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciBidWlsZFBvaW50cyA9IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KGltYWdlX3ZlcnRpY2VzKTtcclxuICAgIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoKTtcclxuICAgIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoIC8gMyk7XHJcbiAgICBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoIC8gMyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlX3ZlcnRpY2VzLmxlbmd0aCAvIDM7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2hzbCgnICsgKGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMl0gKyBpbWFnZV92ZXJ0aWNlc1tpICogMyArIDFdICsgbGVuZ3RoX3NpZGUpIC8gNVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnLCA2MCUsIDgwJSknKTtcclxuICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhpbWFnZV92ZXJ0aWNlc1tpICogM10sIGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMV0sIGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMl0pKTtcclxuICAgICAgbW92ZXIuaXNfYWN0aXZhdGUgPSB0cnVlO1xyXG4gICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgIGNvbG9yLnRvQXJyYXkoY29sb3JzLCBpICogMyk7XHJcbiAgICAgIG9wYWNpdGllc1tpXSA9IDE7XHJcbiAgICAgIHNpemVzW2ldID0gMTI7XHJcbiAgICB9XHJcbiAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgdnM6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyBjdXN0b21Db2xvcjtcXG5hdHRyaWJ1dGUgZmxvYXQgdmVydGV4T3BhY2l0eTtcXG5hdHRyaWJ1dGUgZmxvYXQgc2l6ZTtcXG5cXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxuXFxudm9pZCBtYWluKCkge1xcbiAgdkNvbG9yID0gY3VzdG9tQ29sb3I7XFxuICBmT3BhY2l0eSA9IHZlcnRleE9wYWNpdHk7XFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcbiAgZ2xfUG9pbnRTaXplID0gc2l6ZSAqICgzMDAuMCAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpO1xcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXG59XFxuXCIsXHJcbiAgICAgIGZzOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxuXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcblxcbnZvaWQgbWFpbigpIHtcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXG59XFxuXCIsXHJcbiAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgdGV4dHVyZTogY3JlYXRlVGV4dHVyZSgpLFxyXG4gICAgICBibGVuZGluZzogVEhSRUUuTm9ybWFsQmxlbmRpbmdcclxuICAgIH0pO1xyXG4gICAgY3JlYXRlZF9wb2ludHMgPSB0cnVlO1xyXG4gIH07XHJcblxyXG4gIHZhciBhcHBseUZvcmNlVG9Qb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgdmFyIHJhZDEgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHJhZDIgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHNjYWxhciA9IFV0aWwuZ2V0UmFuZG9tSW50KDQwLCA4MCk7XHJcbiAgICAgIG1vdmVyLmlzX2FjdGl2YXRlID0gZmFsc2U7XHJcbiAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoVXRpbC5nZXRQb2xhckNvb3JkKHJhZDEsIHJhZDIsIHNjYWxhcikpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciB1cGRhdGVNb3ZlciA9ICBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICBpZiAobW92ZXIuYWNjZWxlcmF0aW9uLmxlbmd0aCgpIDwgMSkge1xyXG4gICAgICAgIG1vdmVyLmlzX2FjdGl2YXRlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZhdGUpIHtcclxuICAgICAgICBtb3Zlci5hcHBseUhvb2soMCwgMC4xOCk7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMjYpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG1vdmVyLmFwcGx5RHJhZygwLjAzNSk7XHJcbiAgICAgIH1cclxuICAgICAgbW92ZXIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgbW92ZXIudmVsb2NpdHkuc3ViKHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIudmVsb2NpdHkueCAtIHBvaW50cy52ZWxvY2l0eS54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnZlbG9jaXR5LnkgLSBwb2ludHMudmVsb2NpdHkueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci52ZWxvY2l0eS56IC0gcG9pbnRzLnZlbG9jaXR5Lng7XHJcbiAgICAgIG1vdmVyLnNpemUgPSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgxLCAxMjgpKSAvIE1hdGgubG9nKDEyOCkgKiBNYXRoLnNxcnQoZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCk7XHJcbiAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgIH1cclxuICAgIHBvaW50cy51cGRhdGVQb2ludHMoKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlVGV4dHVyZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgdmFyIGdyYWQgPSBudWxsO1xyXG4gICAgdmFyIHRleHR1cmUgPSBudWxsO1xyXG5cclxuICAgIGNhbnZhcy53aWR0aCA9IDIwMDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSAyMDA7XHJcbiAgICBncmFkID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KDEwMCwgMTAwLCAyMCwgMTAwLCAxMDAsIDEwMCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjIsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjUsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEuMCwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMCknKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xyXG4gICAgY3R4LmFyYygxMDAsIDEwMCwgMTAwLCAwLCBNYXRoLlBJIC8gMTgwLCB0cnVlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGxvYWRJbWFnZShmdW5jdGlvbigpIHtcclxuICAgICAgICBnZXRJbWFnZURhdGEoKTtcclxuICAgICAgICBidWlsZFBvaW50cyhzY2VuZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBjYW1lcmEuc2V0UG9sYXJDb29yZCgwLCAwLCAxNDAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBpbWFnZV92ZXJ0aWNlcyA9IFtdO1xyXG4gICAgICBtb3ZlcnMgPSBbXTtcclxuICAgICAgY2FtZXJhLnJhbmdlID0gMTAwMDtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgaWYgKGNyZWF0ZWRfcG9pbnRzKSB7XHJcbiAgICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgICAgIH1cclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcblxyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBhcHBseUZvcmNlVG9Qb2ludHMoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnogPSB2ZWN0b3JfbW91c2VfbW92ZS54ICogMTAwMDtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci55ID0gdmVjdG9yX21vdXNlX21vdmUueSAqIC0xMDAwO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueiA9IDA7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueSA9IDA7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgdGhpcy50b3VjaEVuZChzY2VuZSwgY2FtZXJhKVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxuXHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuICB2YXIgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xyXG4gIHZhciBpbnRlcnNlY3RzID0gbnVsbDtcclxuICB2YXIgY3ViZV9mb3JjZSA9IG5ldyBGb3JjZTMoKTtcclxuICB2YXIgY3ViZV9mb3JjZTIgPSBuZXcgRm9yY2UzKCk7XHJcbiAgdmFyIHZhY3Rvcl9yYXljYXN0ID0gbnVsbDtcclxuICBjdWJlX2ZvcmNlLm1hc3MgPSAxLjQ7XHJcblxyXG4gIHZhciBjcmVhdGVQbGFuZUZvclJheW1hcmNoaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeSg2LjAsIDYuMCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lMjoge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY2NlbGVyYXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIG1hdDQgbV9tYXRyaXg7XFxuXFxuZmxvYXQgaW52ZXJzZV8xXzAoZmxvYXQgbSkge1xcbiAgcmV0dXJuIDEuMCAvIG07XFxufVxcblxcbm1hdDIgaW52ZXJzZV8xXzAobWF0MiBtKSB7XFxuICByZXR1cm4gbWF0MihtWzFdWzFdLC1tWzBdWzFdLFxcbiAgICAgICAgICAgICAtbVsxXVswXSwgbVswXVswXSkgLyAobVswXVswXSptWzFdWzFdIC0gbVswXVsxXSptWzFdWzBdKTtcXG59XFxuXFxubWF0MyBpbnZlcnNlXzFfMChtYXQzIG0pIHtcXG4gIGZsb2F0IGEwMCA9IG1bMF1bMF0sIGEwMSA9IG1bMF1bMV0sIGEwMiA9IG1bMF1bMl07XFxuICBmbG9hdCBhMTAgPSBtWzFdWzBdLCBhMTEgPSBtWzFdWzFdLCBhMTIgPSBtWzFdWzJdO1xcbiAgZmxvYXQgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXTtcXG5cXG4gIGZsb2F0IGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMTtcXG4gIGZsb2F0IGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjA7XFxuICBmbG9hdCBiMjEgPSBhMjEgKiBhMTAgLSBhMTEgKiBhMjA7XFxuXFxuICBmbG9hdCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XFxuXFxuICByZXR1cm4gbWF0MyhiMDEsICgtYTIyICogYTAxICsgYTAyICogYTIxKSwgKGExMiAqIGEwMSAtIGEwMiAqIGExMSksXFxuICAgICAgICAgICAgICBiMTEsIChhMjIgKiBhMDAgLSBhMDIgKiBhMjApLCAoLWExMiAqIGEwMCArIGEwMiAqIGExMCksXFxuICAgICAgICAgICAgICBiMjEsICgtYTIxICogYTAwICsgYTAxICogYTIwKSwgKGExMSAqIGEwMCAtIGEwMSAqIGExMCkpIC8gZGV0O1xcbn1cXG5cXG5tYXQ0IGludmVyc2VfMV8wKG1hdDQgbSkge1xcbiAgZmxvYXRcXG4gICAgICBhMDAgPSBtWzBdWzBdLCBhMDEgPSBtWzBdWzFdLCBhMDIgPSBtWzBdWzJdLCBhMDMgPSBtWzBdWzNdLFxcbiAgICAgIGExMCA9IG1bMV1bMF0sIGExMSA9IG1bMV1bMV0sIGExMiA9IG1bMV1bMl0sIGExMyA9IG1bMV1bM10sXFxuICAgICAgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXSwgYTIzID0gbVsyXVszXSxcXG4gICAgICBhMzAgPSBtWzNdWzBdLCBhMzEgPSBtWzNdWzFdLCBhMzIgPSBtWzNdWzJdLCBhMzMgPSBtWzNdWzNdLFxcblxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcXG4gICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxcbiAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXFxuICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcXG4gICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxcbiAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXFxuICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyLFxcblxcbiAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcXG5cXG4gIHJldHVybiBtYXQ0KFxcbiAgICAgIGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSxcXG4gICAgICBhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDksXFxuICAgICAgYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzLFxcbiAgICAgIGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMyxcXG4gICAgICBhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcsXFxuICAgICAgYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3LFxcbiAgICAgIGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSxcXG4gICAgICBhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEsXFxuICAgICAgYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2LFxcbiAgICAgIGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNixcXG4gICAgICBhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDAsXFxuICAgICAgYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwLFxcbiAgICAgIGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNixcXG4gICAgICBhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYsXFxuICAgICAgYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwLFxcbiAgICAgIGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgLyBkZXQ7XFxufVxcblxcblxcblxcbnZvaWQgbWFpbih2b2lkKSB7XFxuICBtX21hdHJpeCA9IGludmVyc2VfMV8wKG1vZGVsTWF0cml4KTtcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxufVxcblwiLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXG51bmlmb3JtIGZsb2F0IHRpbWUyO1xcbnVuaWZvcm0gZmxvYXQgYWNjZWxlcmF0aW9uO1xcbnVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcblxcbnZhcnlpbmcgbWF0NCBtX21hdHJpeDtcXG5cXG4vLyBjb25zdCB2ZWMzIGNQb3MgPSB2ZWMzKDAuMCwgMC4wLCAxMC4wKTtcXG5jb25zdCBmbG9hdCB0YXJnZXREZXB0aCA9IDMuNTtcXG5jb25zdCB2ZWMzIGxpZ2h0RGlyID0gdmVjMygwLjU3NywgLTAuNTc3LCAwLjU3Nyk7XFxuXFxudmVjMyBoc3YycmdiXzFfMCh2ZWMzIGMpe1xcbiAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xcbiAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xcbiAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XFxufVxcblxcblxcbi8vXFxuLy8gRGVzY3JpcHRpb24gOiBBcnJheSBhbmQgdGV4dHVyZWxlc3MgR0xTTCAyRC8zRC80RCBzaW1wbGV4XFxuLy8gICAgICAgICAgICAgICBub2lzZSBmdW5jdGlvbnMuXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzRfMSh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgbW9kMjg5XzRfMSh2ZWM0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV80XzIodmVjNCB4KSB7XFxuICAgICByZXR1cm4gbW9kMjg5XzRfMSgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxudmVjNCB0YXlsb3JJbnZTcXJ0XzRfMyh2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzRfNCh2ZWMzIHYpXFxuICB7XFxuICBjb25zdCB2ZWMyICBDID0gdmVjMigxLjAvNi4wLCAxLjAvMy4wKSA7XFxuICBjb25zdCB2ZWM0ICBEXzRfNSA9IHZlYzQoMC4wLCAwLjUsIDEuMCwgMi4wKTtcXG5cXG4vLyBGaXJzdCBjb3JuZXJcXG4gIHZlYzMgaSAgPSBmbG9vcih2ICsgZG90KHYsIEMueXl5KSApO1xcbiAgdmVjMyB4MCA9ICAgdiAtIGkgKyBkb3QoaSwgQy54eHgpIDtcXG5cXG4vLyBPdGhlciBjb3JuZXJzXFxuICB2ZWMzIGdfNF82ID0gc3RlcCh4MC55engsIHgwLnh5eik7XFxuICB2ZWMzIGwgPSAxLjAgLSBnXzRfNjtcXG4gIHZlYzMgaTEgPSBtaW4oIGdfNF82Lnh5eiwgbC56eHkgKTtcXG4gIHZlYzMgaTIgPSBtYXgoIGdfNF82Lnh5eiwgbC56eHkgKTtcXG5cXG4gIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcbiAgLy8gICB4MSA9IHgwIC0gaTEgICsgMS4wICogQy54eHg7XFxuICAvLyAgIHgyID0geDAgLSBpMiAgKyAyLjAgKiBDLnh4eDtcXG4gIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcbiAgdmVjMyB4MSA9IHgwIC0gaTEgKyBDLnh4eDtcXG4gIHZlYzMgeDIgPSB4MCAtIGkyICsgQy55eXk7IC8vIDIuMCpDLnggPSAxLzMgPSBDLnlcXG4gIHZlYzMgeDMgPSB4MCAtIERfNF81Lnl5eTsgICAgICAvLyAtMS4wKzMuMCpDLnggPSAtMC41ID0gLUQueVxcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV80XzEoaSk7XFxuICB2ZWM0IHAgPSBwZXJtdXRlXzRfMiggcGVybXV0ZV80XzIoIHBlcm11dGVfNF8yKFxcbiAgICAgICAgICAgICBpLnogKyB2ZWM0KDAuMCwgaTEueiwgaTIueiwgMS4wICkpXFxuICAgICAgICAgICArIGkueSArIHZlYzQoMC4wLCBpMS55LCBpMi55LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS54ICsgdmVjNCgwLjAsIGkxLngsIGkyLngsIDEuMCApKTtcXG5cXG4vLyBHcmFkaWVudHM6IDd4NyBwb2ludHMgb3ZlciBhIHNxdWFyZSwgbWFwcGVkIG9udG8gYW4gb2N0YWhlZHJvbi5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDkgKDQ5KjYgPSAyOTQpXFxuICBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyAvLyAxLjAvNy4wXFxuICB2ZWMzICBucyA9IG5fICogRF80XzUud3l6IC0gRF80XzUueHp4O1xcblxcbiAgdmVjNCBqID0gcCAtIDQ5LjAgKiBmbG9vcihwICogbnMueiAqIG5zLnopOyAgLy8gIG1vZChwLDcqNylcXG5cXG4gIHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7XFxuICB2ZWM0IHlfID0gZmxvb3IoaiAtIDcuMCAqIHhfICk7ICAgIC8vIG1vZChqLE4pXFxuXFxuICB2ZWM0IHggPSB4XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXFxuICB2ZWM0IGIwID0gdmVjNCggeC54eSwgeS54eSApO1xcbiAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cXG4gIC8vdmVjNCBzMCA9IHZlYzQobGVzc1RoYW4oYjAsMC4wKSkqMi4wIC0gMS4wO1xcbiAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuICB2ZWM0IHMwID0gZmxvb3IoYjApKjIuMCArIDEuMDtcXG4gIHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wO1xcbiAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXFxuICB2ZWM0IGEwID0gYjAueHp5dyArIHMwLnh6eXcqc2gueHh5eSA7XFxuICB2ZWM0IGExXzRfNyA9IGIxLnh6eXcgKyBzMS54enl3KnNoLnp6d3cgO1xcblxcbiAgdmVjMyBwMF80XzggPSB2ZWMzKGEwLnh5LGgueCk7XFxuICB2ZWMzIHAxID0gdmVjMyhhMC56dyxoLnkpO1xcbiAgdmVjMyBwMiA9IHZlYzMoYTFfNF83Lnh5LGgueik7XFxuICB2ZWMzIHAzID0gdmVjMyhhMV80XzcuencsaC53KTtcXG5cXG4vL05vcm1hbGlzZSBncmFkaWVudHNcXG4gIHZlYzQgbm9ybSA9IHRheWxvckludlNxcnRfNF8zKHZlYzQoZG90KHAwXzRfOCxwMF80XzgpLCBkb3QocDEscDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLHAzKSkpO1xcbiAgcDBfNF84ICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG5cXG4vLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG4gIHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApO1xcbiAgbSA9IG0gKiBtO1xcbiAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwXzRfOCx4MCksIGRvdChwMSx4MSksXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3QocDIseDIpLCBkb3QocDMseDMpICkgKTtcXG4gIH1cXG5cXG5cXG5cXG52ZWMzIHJvdGF0ZV8yXzkodmVjMyBwLCBmbG9hdCByYWRpYW5feCwgZmxvYXQgcmFkaWFuX3ksIGZsb2F0IHJhZGlhbl96KSB7XFxuICBtYXQzIG14ID0gbWF0MyhcXG4gICAgMS4wLCAwLjAsIDAuMCxcXG4gICAgMC4wLCBjb3MocmFkaWFuX3gpLCAtc2luKHJhZGlhbl94KSxcXG4gICAgMC4wLCBzaW4ocmFkaWFuX3gpLCBjb3MocmFkaWFuX3gpXFxuICApO1xcbiAgbWF0MyBteSA9IG1hdDMoXFxuICAgIGNvcyhyYWRpYW5feSksIDAuMCwgc2luKHJhZGlhbl95KSxcXG4gICAgMC4wLCAxLjAsIDAuMCxcXG4gICAgLXNpbihyYWRpYW5feSksIDAuMCwgY29zKHJhZGlhbl95KVxcbiAgKTtcXG4gIG1hdDMgbXogPSBtYXQzKFxcbiAgICBjb3MocmFkaWFuX3opLCAtc2luKHJhZGlhbl96KSwgMC4wLFxcbiAgICBzaW4ocmFkaWFuX3opLCBjb3MocmFkaWFuX3opLCAwLjAsXFxuICAgIDAuMCwgMC4wLCAxLjBcXG4gICk7XFxuICByZXR1cm4gbXggKiBteSAqIG16ICogcDtcXG59XFxuXFxuXFxuZmxvYXQgZEJveF8zXzEwKHZlYzMgcCwgdmVjMyBzaXplKSB7XFxuICByZXR1cm4gbGVuZ3RoKG1heChhYnMocCkgLSBzaXplLCAwLjApKTtcXG59XFxuXFxuXFxuXFxuZmxvYXQgZ2V0Tm9pc2UodmVjMyBwKSB7XFxuICByZXR1cm4gc25vaXNlXzRfNChwICogKDAuNCArIGFjY2VsZXJhdGlvbiAqIDAuMSkgKyB0aW1lIC8gMTAwLjApO1xcbn1cXG5cXG52ZWMzIGdldFJvdGF0ZSh2ZWMzIHApIHtcXG4gIHJldHVybiByb3RhdGVfMl85KHAsIHJhZGlhbnModGltZTIpLCByYWRpYW5zKHRpbWUyICogMi4wKSwgcmFkaWFucyh0aW1lMikpO1xcbn1cXG5cXG5mbG9hdCBkaXN0YW5jZUZ1bmModmVjMyBwKSB7XFxuICB2ZWM0IHAxID0gbV9tYXRyaXggKiB2ZWM0KHAsIDEuMCk7XFxuICBmbG9hdCBuMSA9IGdldE5vaXNlKHAxLnh5eik7XFxuICB2ZWMzIHAyID0gZ2V0Um90YXRlKHAxLnh5eik7XFxuICBmbG9hdCBkMSA9IGRCb3hfM18xMChwMiwgdmVjMygwLjggLSBtaW4oYWNjZWxlcmF0aW9uLCAwLjgpKSkgLSAwLjI7XFxuICBmbG9hdCBkMiA9IGRCb3hfM18xMChwMiwgdmVjMygxLjApKSAtIG4xO1xcbiAgZmxvYXQgZDMgPSBkQm94XzNfMTAocDIsIHZlYzMoMC41ICsgYWNjZWxlcmF0aW9uICogMC40KSkgLSBuMTtcXG4gIHJldHVybiBtaW4obWF4KGQxLCAtZDIpLCBkMyk7XFxufVxcblxcbmZsb2F0IGRpc3RhbmNlRnVuY0ZvckZpbGwodmVjMyBwKSB7XFxuICB2ZWM0IHAxID0gbV9tYXRyaXggKiB2ZWM0KHAsIDEuMCk7XFxuICBmbG9hdCBuID0gZ2V0Tm9pc2UocDEueHl6KTtcXG4gIHZlYzMgcDIgPSBnZXRSb3RhdGUocDEueHl6KTtcXG4gIHJldHVybiBkQm94XzNfMTAocDIsIHZlYzMoMC41ICsgYWNjZWxlcmF0aW9uICogMC40KSkgLSBuO1xcbn1cXG5cXG52ZWMzIGdldE5vcm1hbCh2ZWMzIHApIHtcXG4gIGNvbnN0IGZsb2F0IGQgPSAwLjE7XFxuICByZXR1cm4gbm9ybWFsaXplKHZlYzMoXFxuICAgIGRpc3RhbmNlRnVuYyhwICsgdmVjMyhkLCAwLjAsIDAuMCkpIC0gZGlzdGFuY2VGdW5jKHAgKyB2ZWMzKC1kLCAwLjAsIDAuMCkpLFxcbiAgICBkaXN0YW5jZUZ1bmMocCArIHZlYzMoMC4wLCBkLCAwLjApKSAtIGRpc3RhbmNlRnVuYyhwICsgdmVjMygwLjAsIC1kLCAwLjApKSxcXG4gICAgZGlzdGFuY2VGdW5jKHAgKyB2ZWMzKDAuMCwgMC4wLCBkKSkgLSBkaXN0YW5jZUZ1bmMocCArIHZlYzMoMC4wLCAwLjAsIC1kKSlcXG4gICkpO1xcbn1cXG5cXG52b2lkIG1haW4oKSB7XFxuICB2ZWMyIHAgPSAoZ2xfRnJhZ0Nvb3JkLnh5ICogMi4wIC0gcmVzb2x1dGlvbikgLyBtaW4ocmVzb2x1dGlvbi54LCByZXNvbHV0aW9uLnkpO1xcblxcbiAgdmVjMyBjRGlyID0gbm9ybWFsaXplKGNhbWVyYVBvc2l0aW9uICogLTEuMCk7XFxuICB2ZWMzIGNVcCAgPSB2ZWMzKDAuMCwgMS4wLCAwLjApO1xcbiAgdmVjMyBjU2lkZSA9IGNyb3NzKGNEaXIsIGNVcCk7XFxuXFxuICB2ZWMzIHJheSA9IG5vcm1hbGl6ZShjU2lkZSAqIHAueCArIGNVcCAqIHAueSArIGNEaXIgKiB0YXJnZXREZXB0aCk7XFxuXFxuICBmbG9hdCBkaXN0YW5jZSA9IDAuMDtcXG4gIGZsb2F0IHJMZW4gPSAwLjA7XFxuICB2ZWMzIHJQb3MgPSBjYW1lcmFQb3NpdGlvbjtcXG4gIGZvcihpbnQgaSA9IDA7IGkgPCA2NDsgaSsrKXtcXG4gICAgZGlzdGFuY2UgPSBkaXN0YW5jZUZ1bmMoclBvcyk7XFxuICAgIHJMZW4gKz0gZGlzdGFuY2U7XFxuICAgIHJQb3MgPSBjYW1lcmFQb3NpdGlvbiArIHJheSAqIHJMZW4gKiAwLjI7XFxuICB9XFxuXFxuICB2ZWMzIG5vcm1hbCA9IGdldE5vcm1hbChyUG9zKTtcXG4gIGlmKGFicyhkaXN0YW5jZSkgPCAwLjUpe1xcbiAgICBpZiAoZGlzdGFuY2VGdW5jRm9yRmlsbChyUG9zKSA+IDAuNSkge1xcbiAgICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoaHN2MnJnYl8xXzAodmVjMyhkb3Qobm9ybWFsLCBjVXApICogMC44ICsgdGltZSAvIDQwMC4wLCAwLjIsIGRvdChub3JtYWwsIGNVcCkgKiAwLjggKyAwLjEpKSwgMS4wKTtcXG4gICAgfSBlbHNlIHtcXG4gICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGhzdjJyZ2JfMV8wKHZlYzMoZG90KG5vcm1hbCwgY1VwKSAqIDAuMSArIHRpbWUgLyA0MDAuMCwgMC44LCBkb3Qobm9ybWFsLCBjVXApICogMC4yICsgMC44KSksIDEuMCk7XFxuICAgIH1cXG4gIH0gZWxzZSB7XFxuICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoMC4wKTtcXG4gIH1cXG59XFxuXCIsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlXHJcbiAgICB9KTtcclxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIG1lc2gubmFtZSA9ICdNZXRhbEN1YmUnO1xyXG4gICAgcmV0dXJuIG1lc2g7XHJcbiAgfTtcclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZCA9ICBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeV9iYXNlID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeSgzMCwgNCk7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIGdlb21ldHJ5LmZyb21HZW9tZXRyeShnZW9tZXRyeV9iYXNlKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY2NlbGVyYXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcbnVuaWZvcm0gZmxvYXQgYWNjZWxlcmF0aW9uO1xcblxcbnZhcnlpbmcgdmVjMyB2UG9zaXRpb247XFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXG52YXJ5aW5nIG1hdDQgaW52ZXJ0TWF0cml4O1xcblxcbi8vXFxuLy8gRGVzY3JpcHRpb24gOiBBcnJheSBhbmQgdGV4dHVyZWxlc3MgR0xTTCAyRC8zRC80RCBzaW1wbGV4XFxuLy8gICAgICAgICAgICAgICBub2lzZSBmdW5jdGlvbnMuXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzNfMCh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgbW9kMjg5XzNfMCh2ZWM0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV8zXzEodmVjNCB4KSB7XFxuICAgICByZXR1cm4gbW9kMjg5XzNfMCgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxudmVjNCB0YXlsb3JJbnZTcXJ0XzNfMih2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzNfMyh2ZWMzIHYpXFxuICB7XFxuICBjb25zdCB2ZWMyICBDID0gdmVjMigxLjAvNi4wLCAxLjAvMy4wKSA7XFxuICBjb25zdCB2ZWM0ICBEXzNfNCA9IHZlYzQoMC4wLCAwLjUsIDEuMCwgMi4wKTtcXG5cXG4vLyBGaXJzdCBjb3JuZXJcXG4gIHZlYzMgaSAgPSBmbG9vcih2ICsgZG90KHYsIEMueXl5KSApO1xcbiAgdmVjMyB4MCA9ICAgdiAtIGkgKyBkb3QoaSwgQy54eHgpIDtcXG5cXG4vLyBPdGhlciBjb3JuZXJzXFxuICB2ZWMzIGdfM181ID0gc3RlcCh4MC55engsIHgwLnh5eik7XFxuICB2ZWMzIGwgPSAxLjAgLSBnXzNfNTtcXG4gIHZlYzMgaTEgPSBtaW4oIGdfM181Lnh5eiwgbC56eHkgKTtcXG4gIHZlYzMgaTIgPSBtYXgoIGdfM181Lnh5eiwgbC56eHkgKTtcXG5cXG4gIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcbiAgLy8gICB4MSA9IHgwIC0gaTEgICsgMS4wICogQy54eHg7XFxuICAvLyAgIHgyID0geDAgLSBpMiAgKyAyLjAgKiBDLnh4eDtcXG4gIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcbiAgdmVjMyB4MSA9IHgwIC0gaTEgKyBDLnh4eDtcXG4gIHZlYzMgeDIgPSB4MCAtIGkyICsgQy55eXk7IC8vIDIuMCpDLnggPSAxLzMgPSBDLnlcXG4gIHZlYzMgeDMgPSB4MCAtIERfM180Lnl5eTsgICAgICAvLyAtMS4wKzMuMCpDLnggPSAtMC41ID0gLUQueVxcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV8zXzAoaSk7XFxuICB2ZWM0IHAgPSBwZXJtdXRlXzNfMSggcGVybXV0ZV8zXzEoIHBlcm11dGVfM18xKFxcbiAgICAgICAgICAgICBpLnogKyB2ZWM0KDAuMCwgaTEueiwgaTIueiwgMS4wICkpXFxuICAgICAgICAgICArIGkueSArIHZlYzQoMC4wLCBpMS55LCBpMi55LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS54ICsgdmVjNCgwLjAsIGkxLngsIGkyLngsIDEuMCApKTtcXG5cXG4vLyBHcmFkaWVudHM6IDd4NyBwb2ludHMgb3ZlciBhIHNxdWFyZSwgbWFwcGVkIG9udG8gYW4gb2N0YWhlZHJvbi5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDkgKDQ5KjYgPSAyOTQpXFxuICBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyAvLyAxLjAvNy4wXFxuICB2ZWMzICBucyA9IG5fICogRF8zXzQud3l6IC0gRF8zXzQueHp4O1xcblxcbiAgdmVjNCBqID0gcCAtIDQ5LjAgKiBmbG9vcihwICogbnMueiAqIG5zLnopOyAgLy8gIG1vZChwLDcqNylcXG5cXG4gIHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7XFxuICB2ZWM0IHlfID0gZmxvb3IoaiAtIDcuMCAqIHhfICk7ICAgIC8vIG1vZChqLE4pXFxuXFxuICB2ZWM0IHggPSB4XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXFxuICB2ZWM0IGIwID0gdmVjNCggeC54eSwgeS54eSApO1xcbiAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cXG4gIC8vdmVjNCBzMCA9IHZlYzQobGVzc1RoYW4oYjAsMC4wKSkqMi4wIC0gMS4wO1xcbiAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuICB2ZWM0IHMwID0gZmxvb3IoYjApKjIuMCArIDEuMDtcXG4gIHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wO1xcbiAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXFxuICB2ZWM0IGEwID0gYjAueHp5dyArIHMwLnh6eXcqc2gueHh5eSA7XFxuICB2ZWM0IGExXzNfNiA9IGIxLnh6eXcgKyBzMS54enl3KnNoLnp6d3cgO1xcblxcbiAgdmVjMyBwMF8zXzcgPSB2ZWMzKGEwLnh5LGgueCk7XFxuICB2ZWMzIHAxID0gdmVjMyhhMC56dyxoLnkpO1xcbiAgdmVjMyBwMiA9IHZlYzMoYTFfM182Lnh5LGgueik7XFxuICB2ZWMzIHAzID0gdmVjMyhhMV8zXzYuencsaC53KTtcXG5cXG4vL05vcm1hbGlzZSBncmFkaWVudHNcXG4gIHZlYzQgbm9ybSA9IHRheWxvckludlNxcnRfM18yKHZlYzQoZG90KHAwXzNfNyxwMF8zXzcpLCBkb3QocDEscDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLHAzKSkpO1xcbiAgcDBfM183ICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG5cXG4vLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG4gIHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApO1xcbiAgbSA9IG0gKiBtO1xcbiAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwXzNfNyx4MCksIGRvdChwMSx4MSksXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3QocDIseDIpLCBkb3QocDMseDMpICkgKTtcXG4gIH1cXG5cXG5cXG5cXG52ZWMzIGhzdjJyZ2JfMV84KHZlYzMgYyl7XFxuICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XFxuICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XFxuICByZXR1cm4gYy56ICogbWl4KEsueHh4LCBjbGFtcChwIC0gSy54eHgsIDAuMCwgMS4wKSwgYy55KTtcXG59XFxuXFxuXFxuZmxvYXQgaW52ZXJzZV80XzkoZmxvYXQgbSkge1xcbiAgcmV0dXJuIDEuMCAvIG07XFxufVxcblxcbm1hdDIgaW52ZXJzZV80XzkobWF0MiBtKSB7XFxuICByZXR1cm4gbWF0MihtWzFdWzFdLC1tWzBdWzFdLFxcbiAgICAgICAgICAgICAtbVsxXVswXSwgbVswXVswXSkgLyAobVswXVswXSptWzFdWzFdIC0gbVswXVsxXSptWzFdWzBdKTtcXG59XFxuXFxubWF0MyBpbnZlcnNlXzRfOShtYXQzIG0pIHtcXG4gIGZsb2F0IGEwMCA9IG1bMF1bMF0sIGEwMSA9IG1bMF1bMV0sIGEwMiA9IG1bMF1bMl07XFxuICBmbG9hdCBhMTAgPSBtWzFdWzBdLCBhMTEgPSBtWzFdWzFdLCBhMTIgPSBtWzFdWzJdO1xcbiAgZmxvYXQgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXTtcXG5cXG4gIGZsb2F0IGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMTtcXG4gIGZsb2F0IGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjA7XFxuICBmbG9hdCBiMjEgPSBhMjEgKiBhMTAgLSBhMTEgKiBhMjA7XFxuXFxuICBmbG9hdCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XFxuXFxuICByZXR1cm4gbWF0MyhiMDEsICgtYTIyICogYTAxICsgYTAyICogYTIxKSwgKGExMiAqIGEwMSAtIGEwMiAqIGExMSksXFxuICAgICAgICAgICAgICBiMTEsIChhMjIgKiBhMDAgLSBhMDIgKiBhMjApLCAoLWExMiAqIGEwMCArIGEwMiAqIGExMCksXFxuICAgICAgICAgICAgICBiMjEsICgtYTIxICogYTAwICsgYTAxICogYTIwKSwgKGExMSAqIGEwMCAtIGEwMSAqIGExMCkpIC8gZGV0O1xcbn1cXG5cXG5tYXQ0IGludmVyc2VfNF85KG1hdDQgbSkge1xcbiAgZmxvYXRcXG4gICAgICBhMDAgPSBtWzBdWzBdLCBhMDEgPSBtWzBdWzFdLCBhMDIgPSBtWzBdWzJdLCBhMDMgPSBtWzBdWzNdLFxcbiAgICAgIGExMCA9IG1bMV1bMF0sIGExMSA9IG1bMV1bMV0sIGExMiA9IG1bMV1bMl0sIGExMyA9IG1bMV1bM10sXFxuICAgICAgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXSwgYTIzID0gbVsyXVszXSxcXG4gICAgICBhMzAgPSBtWzNdWzBdLCBhMzEgPSBtWzNdWzFdLCBhMzIgPSBtWzNdWzJdLCBhMzMgPSBtWzNdWzNdLFxcblxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcXG4gICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxcbiAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXFxuICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcXG4gICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxcbiAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXFxuICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyLFxcblxcbiAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcXG5cXG4gIHJldHVybiBtYXQ0KFxcbiAgICAgIGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSxcXG4gICAgICBhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDksXFxuICAgICAgYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzLFxcbiAgICAgIGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMyxcXG4gICAgICBhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcsXFxuICAgICAgYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3LFxcbiAgICAgIGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSxcXG4gICAgICBhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEsXFxuICAgICAgYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2LFxcbiAgICAgIGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNixcXG4gICAgICBhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDAsXFxuICAgICAgYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwLFxcbiAgICAgIGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNixcXG4gICAgICBhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYsXFxuICAgICAgYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwLFxcbiAgICAgIGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgLyBkZXQ7XFxufVxcblxcblxcbnZlYzMgcm90YXRlXzJfMTAodmVjMyBwLCBmbG9hdCByYWRpYW5feCwgZmxvYXQgcmFkaWFuX3ksIGZsb2F0IHJhZGlhbl96KSB7XFxuICBtYXQzIG14ID0gbWF0MyhcXG4gICAgMS4wLCAwLjAsIDAuMCxcXG4gICAgMC4wLCBjb3MocmFkaWFuX3gpLCAtc2luKHJhZGlhbl94KSxcXG4gICAgMC4wLCBzaW4ocmFkaWFuX3gpLCBjb3MocmFkaWFuX3gpXFxuICApO1xcbiAgbWF0MyBteSA9IG1hdDMoXFxuICAgIGNvcyhyYWRpYW5feSksIDAuMCwgc2luKHJhZGlhbl95KSxcXG4gICAgMC4wLCAxLjAsIDAuMCxcXG4gICAgLXNpbihyYWRpYW5feSksIDAuMCwgY29zKHJhZGlhbl95KVxcbiAgKTtcXG4gIG1hdDMgbXogPSBtYXQzKFxcbiAgICBjb3MocmFkaWFuX3opLCAtc2luKHJhZGlhbl96KSwgMC4wLFxcbiAgICBzaW4ocmFkaWFuX3opLCBjb3MocmFkaWFuX3opLCAwLjAsXFxuICAgIDAuMCwgMC4wLCAxLjBcXG4gICk7XFxuICByZXR1cm4gbXggKiBteSAqIG16ICogcDtcXG59XFxuXFxuXFxuXFxudmVjMyBnZXRSb3RhdGUodmVjMyBwKSB7XFxuICByZXR1cm4gcm90YXRlXzJfMTAocCwgcmFkaWFucyh0aW1lIC8gNi4wKSwgcmFkaWFucyh0aW1lIC8gNy4wKSwgcmFkaWFucyh0aW1lIC8gOC4wKSk7XFxufVxcblxcbnZvaWQgbWFpbigpIHtcXG4gIGZsb2F0IHVwZGF0ZVRpbWUgPSB0aW1lIC8gNDAwLjA7XFxuICB2ZWMzIHBfcm90YXRlID0gZ2V0Um90YXRlKHBvc2l0aW9uKTtcXG4gIGZsb2F0IG5vaXNlID0gc25vaXNlXzNfMyh2ZWMzKHBfcm90YXRlIC8gMTIuMSArIHVwZGF0ZVRpbWUgKiAwLjUpKTtcXG4gIHZlYzMgcF9ub2lzZSA9IHBfcm90YXRlICsgcF9yb3RhdGUgKiBub2lzZSAvIDIwLjAgKiAobWluKGFjY2VsZXJhdGlvbiwgNi4wKSArIDEuMCk7XFxuXFxuICB2UG9zaXRpb24gPSBwX25vaXNlO1xcbiAgdkNvbG9yID0gaHN2MnJnYl8xXzgodmVjMyh1cGRhdGVUaW1lICsgcG9zaXRpb24ueSAvIDQwMC4wLCAwLjA1ICsgbWluKGFjY2VsZXJhdGlvbiAvIDEwLjAsIDAuMjUpLCAxLjApKTtcXG4gIGludmVydE1hdHJpeCA9IGludmVyc2VfNF85KG1vZGVsTWF0cml4KTtcXG5cXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocF9ub2lzZSwgMS4wKTtcXG59XFxuXCIsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcbnVuaWZvcm0gZmxvYXQgYWNjZWxlcmF0aW9uO1xcblxcbnZhcnlpbmcgdmVjMyB2UG9zaXRpb247XFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXG52YXJ5aW5nIG1hdDQgaW52ZXJ0TWF0cml4O1xcblxcbnZvaWQgbWFpbigpIHtcXG4gIHZlYzMgbm9ybWFsID0gbm9ybWFsaXplKGNyb3NzKGRGZHgodlBvc2l0aW9uKSwgZEZkeSh2UG9zaXRpb24pKSk7XFxuICB2ZWMzIGludl9saWdodCA9IG5vcm1hbGl6ZShpbnZlcnRNYXRyaXggKiB2ZWM0KDAuNywgLTAuNywgMC43LCAxLjApKS54eXo7XFxuICBmbG9hdCBkaWZmID0gKGRvdChub3JtYWwsIGludl9saWdodCkgKyAxLjApIC8gNC4wICsgMC40O1xcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCh2Q29sb3IgKiBkaWZmLCAxLjApO1xcbn1cXG5cIixcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmcsXHJcbiAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlXHJcbiAgICB9KTtcclxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIG1lc2gubmFtZSA9ICdCYWNrZ3JvdW5kJztcclxuICAgIHJldHVybiBtZXNoO1xyXG4gIH07XHJcblxyXG4gIHZhciBtb3ZlTWV0YWxDdWJlID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICBpZiAoY3ViZV9mb3JjZS5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgPiAwLjEgfHwgIXZlY3RvcikgcmV0dXJuO1xyXG4gICAgcmF5Y2FzdGVyLnNldEZyb21DYW1lcmEodmVjdG9yLCBjYW1lcmEpO1xyXG4gICAgaW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKHNjZW5lLmNoaWxkcmVuKVswXTtcclxuICAgIGlmKGludGVyc2VjdHMgJiYgaW50ZXJzZWN0cy5vYmplY3QubmFtZSA9PSAnTWV0YWxDdWJlJykge1xyXG4gICAgICBjdWJlX2ZvcmNlLmFuY2hvci5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChcclxuICAgICAgICBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgtMjAsIDIwKSksXHJcbiAgICAgICAgVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSksXHJcbiAgICAgICAgVXRpbC5nZXRSYW5kb21JbnQoMzAsIDkwKSAvIDEwXHJcbiAgICAgICkpO1xyXG4gICAgICBjdWJlX2ZvcmNlMi5hcHBseUZvcmNlKG5ldyBUSFJFRS5WZWN0b3IzKDEsIDAsIDApKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgcGxhbmUgPSBjcmVhdGVQbGFuZUZvclJheW1hcmNoaW5nKCk7XHJcbiAgdmFyIGJnID0gY3JlYXRlQmFja2dyb3VuZCgpO1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBzY2VuZS5hZGQocGxhbmUpO1xyXG4gICAgICBzY2VuZS5hZGQoYmcpO1xyXG4gICAgICBjYW1lcmEuc2V0UG9sYXJDb29yZCgwLCBVdGlsLmdldFJhZGlhbig5MCksIDI0KTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcGxhbmUuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwbGFuZS5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwbGFuZSk7XHJcbiAgICAgIGJnLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgYmcubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoYmcpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBtb3ZlTWV0YWxDdWJlKHNjZW5lLCBjYW1lcmEsIHZhY3Rvcl9yYXljYXN0KTtcclxuICAgICAgY3ViZV9mb3JjZS5hcHBseUhvb2soMCwgMC4xMik7XHJcbiAgICAgIGN1YmVfZm9yY2UuYXBwbHlEcmFnKDAuMDEpO1xyXG4gICAgICBjdWJlX2ZvcmNlLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGN1YmVfZm9yY2UyLmFwcGx5SG9vaygwLCAwLjAwNSk7XHJcbiAgICAgIGN1YmVfZm9yY2UyLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjdWJlX2ZvcmNlMi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBwbGFuZS5wb3NpdGlvbi5jb3B5KGN1YmVfZm9yY2UudmVsb2NpdHkpO1xyXG4gICAgICBwbGFuZS5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlKys7XHJcbiAgICAgIHBsYW5lLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUyLnZhbHVlICs9IDEgKyBNYXRoLmZsb29yKGN1YmVfZm9yY2UuYWNjZWxlcmF0aW9uLmxlbmd0aCgpICogNCk7XHJcbiAgICAgIHBsYW5lLm1hdGVyaWFsLnVuaWZvcm1zLmFjY2VsZXJhdGlvbi52YWx1ZSA9IGN1YmVfZm9yY2UuYWNjZWxlcmF0aW9uLmxlbmd0aCgpO1xyXG4gICAgICBiZy5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlKys7XHJcbiAgICAgIGJnLm1hdGVyaWFsLnVuaWZvcm1zLmFjY2VsZXJhdGlvbi52YWx1ZSA9IGN1YmVfZm9yY2UyLnZlbG9jaXR5Lmxlbmd0aCgpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rQXRDZW50ZXIoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuXHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgdmFjdG9yX3JheWNhc3QgPSB2ZWN0b3JfbW91c2VfbW92ZTtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgfSxcclxuICAgIG1vdXNlT3V0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB9LFxyXG4gICAgcmVzaXplV2luZG93OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHBsYW5lLm1hdGVyaWFsLnVuaWZvcm1zLnJlc29sdXRpb24udmFsdWUuc2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIl19
