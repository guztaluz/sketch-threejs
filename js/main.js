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
      "#define GLSLIFY 1\nvarying vec2 vUv;\r\n\r\nvoid main(void) {\r\n  vUv = uv;\r\n  gl_Position = vec4(position, 1.0);\r\n}\r\n",
      "#define GLSLIFY 1\nuniform vec2 resolution;\r\nuniform sampler2D velocity;\r\nuniform sampler2D acceleration;\r\nuniform vec2 anchor;\r\n\r\nvarying vec2 vUv;\r\n\r\n#define PRECISION 0.000001\r\n\r\nvec3 drag(vec3 a, float value) {\r\n  return normalize(a * -1.0 + PRECISION) * length(a) * value;\r\n}\r\n\r\nvec3 hook(vec3 v, vec3 anchor, float rest_length, float k) {\r\n  return normalize(v - anchor + PRECISION) * (-1.0 * k * (length(v - anchor) - rest_length));\r\n}\r\n\r\nvec3 attract(vec3 v1, vec3 v2, float m1, float m2, float g) {\r\n  return g * m1 * m2 / pow(clamp(length(v2 - v1), 5.0, 30.0), 2.0) * normalize(v2 - v1 + PRECISION);\r\n}\r\n\r\nvoid main(void) {\r\n  vec3 v = texture2D(velocity, vUv).xyz;\r\n  vec3 a = texture2D(acceleration, vUv).xyz;\r\n  vec3 a2 = a + normalize(vec3(\r\n    anchor.x * resolution.x / 6.0 + PRECISION,\r\n    0.0,\r\n    anchor.y * resolution.y / -2.0 + PRECISION\r\n  ) - v) / 2.0;\r\n  vec3 a3 = a2 + drag(a2, 0.003);\r\n  gl_FragColor = vec4(a3, 1.0);\r\n}\r\n"
    );
    this.velocity_mesh = this.createMesh(
      "#define GLSLIFY 1\nvarying vec2 vUv;\r\n\r\nvoid main(void) {\r\n  vUv = uv;\r\n  gl_Position = vec4(position, 1.0);\r\n}\r\n",
      "#define GLSLIFY 1\nuniform float time;\r\nuniform sampler2D velocity;\r\nuniform sampler2D acceleration;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main(void) {\r\n  gl_FragColor = vec4(texture2D(acceleration, vUv).xyz + texture2D(velocity, vUv).xyz, 1.0);\r\n}\r\n"
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
          vertexShader: "#define GLSLIFY 1\nvarying vec2 vUv;\r\n\r\nvoid main(void) {\r\n  vUv = uv;\r\n  gl_Position = vec4(position, 1.0);\r\n}\r\n",
          fragmentShader: "#define GLSLIFY 1\nuniform sampler2D velocity;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main(void) {\r\n  gl_FragColor = texture2D(velocity, vUv);\r\n}\r\n",
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
      vertexShader: "#define GLSLIFY 1\nattribute vec2 uv2;\r\nattribute vec3 color;\r\nattribute float mass;\r\n\r\nuniform sampler2D velocity;\r\nuniform sampler2D acceleration;\r\n\r\nvarying float vAcceleration;\r\nvarying vec3 vColor;\r\nvarying float vOpacity;\r\n\r\nvoid main(void) {\r\n  vec4 update_position = modelViewMatrix * texture2D(velocity, uv2);\r\n  vAcceleration = length(texture2D(acceleration, uv2).xyz) * mass;\r\n  vColor = color;\r\n  vOpacity = 0.6 * (300.0 / length(update_position.xyz));\r\n  gl_PointSize = 2.0 * (300.0 / length(update_position.xyz));\r\n  gl_Position = projectionMatrix * update_position;\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nvarying float vAcceleration;\r\nvarying vec3 vColor;\r\nvarying float vOpacity;\r\n\r\nuniform float time;\r\n\r\nvec3 hsv2rgb_1_0(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n\r\nvoid main(void) {\r\n  vec3 n;\r\n  n.xy = gl_PointCoord * 2.0 - 1.0;\r\n  n.z = 1.0 - dot(n.xy, n.xy);\r\n  if (n.z < 0.0) discard;\r\n  gl_FragColor = vec4(hsv2rgb_1_0(vec3(vColor.x + time / 3600.0, vColor.y, vColor.z)), vOpacity);\r\n}\r\n",
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
        vs: "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n",
        fs: "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n",
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
      vertexShader: "#define GLSLIFY 1\nuniform float time;\r\nuniform float radius;\r\nuniform float distort;\r\n\r\nvarying vec3 vColor;\r\nvarying vec3 vNormal;\r\n\r\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2_1(vec4 x) {\n     return mod289_2_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_2_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_2_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_2_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_2_5;\n  vec3 i1 = min( g_2_5.xyz, l.zxy );\n  vec3 i2 = max( g_2_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_2_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2_0(i);\n  vec4 p = permute_2_1( permute_2_1( permute_2_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_2_4.wyz - D_2_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_2_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_2_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_2_6.xy,h.z);\n  vec3 p3 = vec3(a1_2_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_2_2(vec4(dot(p0_2_7,p0_2_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_2_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_2_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 hsv2rgb_1_8(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n\r\nvoid main() {\r\n  float updateTime = time / 1000.0;\r\n  float noise = snoise_2_3(vec3(position / 400.1 + updateTime * 5.0));\r\n  vec4 mvPosition = modelViewMatrix * vec4(position * (noise * pow(distort, 2.0) + radius), 1.0);\r\n\r\n  vColor = hsv2rgb_1_8(vec3(noise * distort * 0.3 + updateTime, 0.2, 1.0));\r\n  vNormal = normal;\r\n\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nvarying vec3 vColor;\r\nvarying vec3 vNormal;\r\n\r\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2_1(vec4 x) {\n     return mod289_2_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_2_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_2_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_2_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_2_5;\n  vec3 i1 = min( g_2_5.xyz, l.zxy );\n  vec3 i2 = max( g_2_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_2_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2_0(i);\n  vec4 p = permute_2_1( permute_2_1( permute_2_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_2_4.wyz - D_2_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_2_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_2_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_2_6.xy,h.z);\n  vec3 p3 = vec3(a1_2_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_2_2(vec4(dot(p0_2_7,p0_2_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_2_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_2_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 hsv2rgb_1_8(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n\r\nstruct HemisphereLight {\r\n  vec3 direction;\r\n  vec3 groundColor;\r\n  vec3 skyColor;\r\n};\r\nuniform HemisphereLight hemisphereLights[NUM_HEMI_LIGHTS];\r\n\r\nvoid main() {\r\n  vec3 light = vec3(0.0);\r\n  light += (dot(hemisphereLights[0].direction, vNormal) + 1.0) * hemisphereLights[0].skyColor * 0.5;\r\n  light += (-dot(hemisphereLights[0].direction, vNormal) + 1.0) * hemisphereLights[0].groundColor * 0.5;\r\n  gl_FragColor = vec4(vColor * light, 1.0);\r\n}\r\n",
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
      vertexShader: "#define GLSLIFY 1\nvarying vec2 vUv;\r\n\r\nvoid main(void) {\r\n  vUv = uv;\r\n  gl_Position = vec4(position, 1.0);\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nuniform float time;\r\nuniform vec2 resolution;\r\nuniform float acceleration;\r\nuniform sampler2D texture;\r\n\r\nconst float blur = 16.0;\r\n\r\nvarying vec2 vUv;\r\n\r\nfloat random2_1_0(vec2 c){\r\n    return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);\r\n}\r\n\n\n//\n// Description : Array and textureless GLSL 2D simplex noise function.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_1(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289_2_1(vec2 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute_2_2(vec3 x) {\n  return mod289_2_1(((x*34.0)+1.0)*x);\n}\n\nfloat snoise_2_3(vec2 v)\n  {\n  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626,  // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i  = floor(v + dot(v, C.yy) );\n  vec2 x0 = v -   i + dot(i, C.xx);\n\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n// Permutations\n  i = mod289_2_1(i); // Avoid truncation effects in permutation\n  vec3 p = permute_2_2( permute_2_2( i.y + vec3(0.0, i1.y, 1.0 ))\n    + i.x + vec3(0.0, i1.x, 1.0 ));\n\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n// Normalise gradients implicitly by scaling m\n// Approximation of: m *= inversesqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n// Compute final noise value at P\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\n\n\n\r\nvec2 diffUv(float v, float diff) {\r\n  return vUv + (vec2(v + snoise_2_3(vec2(gl_FragCoord.y + time) / 100.0), 0.0) * diff + vec2(v * 3.0, 0.0)) / resolution;\r\n}\r\n\r\nfloat randomNoise(vec2 p) {\r\n  return (random2_1_0(p - vec2(sin(time))) * 2.0 - 1.0) * max(length(acceleration), 0.08);\r\n}\r\n\r\nvoid main() {\r\n  float diff = 300.0 * length(acceleration);\r\n  vec2 uv_r = diffUv(0.0, diff);\r\n  vec2 uv_g = diffUv(1.0, diff);\r\n  vec2 uv_b = diffUv(-1.0, diff);\r\n  float r = texture2D(texture, uv_r).r + randomNoise(uv_r);\r\n  float g = texture2D(texture, uv_g).g + randomNoise(uv_g);\r\n  float b = texture2D(texture, uv_b).b + randomNoise(uv_b);\r\n  gl_FragColor = vec4(r, g, b, 1.0);\r\n}\r\n",
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

      this.resizeWindow();
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
        vs: "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n",
        fs: "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n",
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
      vertexShader: "#define GLSLIFY 1\nattribute vec3 radian;\r\n\r\nuniform float time;\r\nuniform vec2 resolution;\r\nuniform float size;\r\nuniform vec2 force;\r\n\r\nvoid main() {\r\n  float radius = 300.0;\r\n  float radian_base = radians(time * 2.0);\r\n  vec3 update_positon = position + vec3(\r\n    cos(radian_base + radian.x) * cos(radian_base + radian.y) * radius,\r\n    cos(radian_base + radian.x) * sin(radian_base + radian.y) * radius,\r\n    sin(radian_base + radian.x) * radius\r\n  ) * force.x;\r\n  vec4 mvPosition = modelViewMatrix * vec4(update_positon, 1.0);\r\n\r\n  gl_PointSize = (size + force.y) * (abs(sin(radian_base + radian.z))) * (size / length(mvPosition.xyz)) * 480.0;\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nuniform float size;\r\n\r\nvoid main() {\r\n  vec3 n;\r\n  n.xy = gl_PointCoord.xy * 2.0 - 1.0;\r\n  n.z = 1.0 - dot(n.xy, n.xy);\r\n  if (n.z < 0.0) discard;\r\n  gl_FragColor = vec4(1.0);\r\n}\r\n",
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
      vertexShader: "#define GLSLIFY 1\nattribute float radius;\r\nattribute float radian;\r\nattribute float scale;\r\n\r\nuniform float time;\r\n\r\nvarying vec3 vPosition;\r\nvarying mat4 vInvertMatrix;\r\n\r\nfloat inverse_8_0(float m) {\n  return 1.0 / m;\n}\n\nmat2 inverse_8_0(mat2 m) {\n  return mat2(m[1][1],-m[0][1],\n             -m[1][0], m[0][0]) / (m[0][0]*m[1][1] - m[0][1]*m[1][0]);\n}\n\nmat3 inverse_8_0(mat3 m) {\n  float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];\n  float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];\n  float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];\n\n  float b01 = a22 * a11 - a12 * a21;\n  float b11 = -a22 * a10 + a12 * a20;\n  float b21 = a21 * a10 - a11 * a20;\n\n  float det = a00 * b01 + a01 * b11 + a02 * b21;\n\n  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),\n              b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),\n              b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;\n}\n\nmat4 inverse_8_0(mat4 m) {\n  float\n      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],\n      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],\n      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],\n      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],\n\n      b00 = a00 * a11 - a01 * a10,\n      b01 = a00 * a12 - a02 * a10,\n      b02 = a00 * a13 - a03 * a10,\n      b03 = a01 * a12 - a02 * a11,\n      b04 = a01 * a13 - a03 * a11,\n      b05 = a02 * a13 - a03 * a12,\n      b06 = a20 * a31 - a21 * a30,\n      b07 = a20 * a32 - a22 * a30,\n      b08 = a20 * a33 - a23 * a30,\n      b09 = a21 * a32 - a22 * a31,\n      b10 = a21 * a33 - a23 * a31,\n      b11 = a22 * a33 - a23 * a32,\n\n      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n\n  return mat4(\n      a11 * b11 - a12 * b10 + a13 * b09,\n      a02 * b10 - a01 * b11 - a03 * b09,\n      a31 * b05 - a32 * b04 + a33 * b03,\n      a22 * b04 - a21 * b05 - a23 * b03,\n      a12 * b08 - a10 * b11 - a13 * b07,\n      a00 * b11 - a02 * b08 + a03 * b07,\n      a32 * b02 - a30 * b05 - a33 * b01,\n      a20 * b05 - a22 * b02 + a23 * b01,\n      a10 * b10 - a11 * b08 + a13 * b06,\n      a01 * b08 - a00 * b10 - a03 * b06,\n      a30 * b04 - a31 * b02 + a33 * b00,\n      a21 * b02 - a20 * b04 - a23 * b00,\n      a11 * b07 - a10 * b09 - a12 * b06,\n      a00 * b09 - a01 * b07 + a02 * b06,\n      a31 * b01 - a30 * b03 - a32 * b00,\n      a20 * b03 - a21 * b01 + a22 * b00) / det;\n}\n\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_7_1(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_7_1(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_7_2(vec4 x) {\n     return mod289_7_1(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_7_3(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_7_4(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_7_5 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_7_6 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_7_6;\n  vec3 i1 = min( g_7_6.xyz, l.zxy );\n  vec3 i2 = max( g_7_6.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_7_5.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_7_1(i);\n  vec4 p = permute_7_2( permute_7_2( permute_7_2(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_7_5.wyz - D_7_5.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_7_7 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_7_8 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_7_7.xy,h.z);\n  vec3 p3 = vec3(a1_7_7.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_7_3(vec4(dot(p0_7_8,p0_7_8), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_7_8 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_7_8,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nmat4 translateMatrix_1_9(vec3 v) {\r\n  return mat4(\r\n    1.0, 0.0, 0.0, 0.0,\r\n    0.0, 1.0, 0.0, 0.0,\r\n    0.0, 0.0, 1.0, 0.0,\r\n    v.x, v.y, v.z, 1.0\r\n  );\r\n}\r\n\n\nmat4 rotationMatrixX_4_10(float radian) {\r\n  return mat4(\r\n    1.0, 0.0, 0.0, 0.0,\r\n    0.0, cos(radian), -sin(radian), 0.0,\r\n    0.0, sin(radian), cos(radian), 0.0,\r\n    0.0, 0.0, 0.0, 1.0\r\n  );\r\n}\r\n\n\nmat4 rotationMatrixY_5_11(float radian) {\r\n  return mat4(\r\n    cos(radian), 0.0, sin(radian), 0.0,\r\n    0.0, 1.0, 0.0, 0.0,\r\n    -sin(radian), 0.0, cos(radian), 0.0,\r\n    0.0, 0.0, 0.0, 1.0\r\n  );\r\n}\r\n\n\nmat4 rotationMatrixZ_6_12(float radian) {\r\n  return mat4(\r\n    cos(radian), -sin(radian), 0.0, 0.0,\r\n    sin(radian), cos(radian), 0.0, 0.0,\r\n    0.0, 0.0, 1.0, 0.0,\r\n    0.0, 0.0, 0.0, 1.0\r\n  );\r\n}\r\n\n\n\r\nmat4 rotationMatrix_2_13(float radian_x, float radian_y, float radian_z) {\r\n  return rotationMatrixX_4_10(radian_x) * rotationMatrixY_5_11(radian_y) * rotationMatrixZ_6_12(radian_z);\r\n}\r\n\n\nmat4 scaleMatrix_3_14(vec3 scale) {\r\n  return mat4(\r\n    scale.x, 0.0, 0.0, 0.0,\r\n    0.0, scale.y, 0.0, 0.0,\r\n    0.0, 0.0, scale.z, 0.0,\r\n    0.0, 0.0, 0.0, 1.0\r\n  );\r\n}\r\n\n\n\r\nvec4 move(vec3 position) {\r\n  return translateMatrix_1_9(\r\n    vec3(\r\n      cos(radians(time * 0.5) + radian) * radius,\r\n      sin(radians(time * 0.5) + radian * 10.0) * radius * 0.3,\r\n      sin(radians(time * 0.5) + radian) * radius\r\n    )\r\n  ) * rotationMatrix_2_13(\r\n    radians(time * radian) + radian, radians(time) + radian, radians(time) + radian\r\n  ) * scaleMatrix_3_14(\r\n    vec3(20.0 * scale) + vec3(10.0) * snoise_7_4((position + sin(radian)))\r\n  ) * vec4(position, 1.0);\r\n}\r\n\r\nvoid main() {\r\n  vec4 update_position = move(position);\r\n  vPosition = position;\r\n  vInvertMatrix = inverse_8_0(rotationMatrix_2_13(\r\n    radians(time * radian) + radian, radians(time) + radian, radians(time) + radian\r\n  ));\r\n  gl_Position = projectionMatrix * modelViewMatrix * update_position;\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nstruct DirectionalLight {\r\n  vec3 color;\r\n  vec3 direction;\r\n};\r\nuniform DirectionalLight directionalLights[1];\r\n\r\nvarying vec3 vPosition;\r\nvarying mat4 vInvertMatrix;\r\n\r\nvoid main() {\r\n  vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));\r\n  vec3 inv_light = normalize(vInvertMatrix * vec4(directionalLights[0].direction, 1.0)).xyz;\r\n  float diff = (dot(normal, inv_light) + 1.0) / 2.0 * 0.25 + 0.75;\r\n  gl_FragColor = vec4(vec3(1.0) * diff, 1.0);\r\n}\r\n",
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
      vertexShader: "#define GLSLIFY 1\nuniform float time;\r\n\r\nvarying vec3 vColor;\r\n\r\nvoid main() {\r\n  vColor = vec3((position.y / 1000.0 + 1.0) * 0.12 + 0.88);\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nvarying vec3 vColor;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(vColor, 1.0);\r\n}\r\n",
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
      vertexShader: "#define GLSLIFY 1\nuniform float time;\r\n\r\nvec3 getPolarCoord(float rad1, float rad2, float r) {\r\n  return vec3(\r\n    cos(rad1) * cos(rad2) * r,\r\n    sin(rad1) * r,\r\n    cos(rad1) * sin(rad2) * r\r\n  );\r\n}\r\n\r\nvoid main() {\r\n  vec3 update_position = getPolarCoord(\r\n    position.x,\r\n    position.y + radians(time / 2.0),\r\n    position.z + sin(radians(time * 2.0) + position.x + position.y) * position.z / 4.0\r\n  );\r\n  vec4 mv_position = modelViewMatrix * vec4(update_position, 1.0);\r\n\r\n  gl_PointSize = 2.0 * (1000.0 / length(mv_position.xyz));\r\n  gl_Position = projectionMatrix * mv_position;\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nvoid main() {\r\n  vec3 n;\r\n  n.xy = gl_PointCoord.xy * 2.0 - 1.0;\r\n  n.z = 1.0 - dot(n.xy, n.xy);\r\n  if (n.z < 0.0) discard;\r\n  gl_FragColor = vec4(1.0);\r\n}\r\n",
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
      vertexShader: "#define GLSLIFY 1\nuniform float time;\r\n\r\nvarying vec3 vColor;\r\n\r\nvec3 hsv2rgb_1_0(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_1(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2_1(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2_2(vec4 x) {\n     return mod289_2_1(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_2_3(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2_4(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_2_5 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_2_6 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_2_6;\n  vec3 i1 = min( g_2_6.xyz, l.zxy );\n  vec3 i2 = max( g_2_6.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_2_5.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2_1(i);\n  vec4 p = permute_2_2( permute_2_2( permute_2_2(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_2_5.wyz - D_2_5.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_2_7 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_2_8 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_2_7.xy,h.z);\n  vec3 p3 = vec3(a1_2_7.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_2_3(vec4(dot(p0_2_8,p0_2_8), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_2_8 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_2_8,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\n\r\nvoid main() {\r\n  float noise = snoise_2_4(\r\n    vec3(position.x + time * 10.0, position.y + cos(time / 20.0) * 100.0, position.z + time * 10.0) / 800.0\r\n  );\r\n  vColor = hsv2rgb_1_0(vec3(noise * 0.2 + 0.75, 0.4, noise * 0.3 + 0.5));\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nvarying vec3 vColor;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(vColor, 1.0);\r\n}\r\n",
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
      vertexShader: "#define GLSLIFY 1\nvarying vec2 vUv;\r\n\r\nvoid main(void) {\r\n  vUv = uv;\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nuniform float time;\r\nuniform vec2 resolution;\r\nuniform sampler2D texture;\r\nuniform sampler2D texture2;\r\n\r\nconst float blur = 20.0;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n  vec4 color = vec4(0.0);\r\n  for (float x = 0.0; x < blur; x++){\r\n    for (float y = 0.0; y < blur; y++){\r\n      color += texture2D(texture, vUv - (vec2(x, y) - vec2(blur / 2.0)) / resolution);\r\n    }\r\n  }\r\n  vec4 color2 = color / pow(blur, 2.0);\r\n  vec4 color3 = texture2D(texture2, vUv);\r\n  gl_FragColor = vec4(color3.rgb, floor(length(color2.rgb)));\r\n}\r\n",
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

      this.resizeWindow();
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
        vs: "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n",
        fs: "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n",
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
      vs: "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n",
      fs: "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n",
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
      vertexShader: "#define GLSLIFY 1\nvarying mat4 m_matrix;\r\n\r\nfloat inverse_1_0(float m) {\n  return 1.0 / m;\n}\n\nmat2 inverse_1_0(mat2 m) {\n  return mat2(m[1][1],-m[0][1],\n             -m[1][0], m[0][0]) / (m[0][0]*m[1][1] - m[0][1]*m[1][0]);\n}\n\nmat3 inverse_1_0(mat3 m) {\n  float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];\n  float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];\n  float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];\n\n  float b01 = a22 * a11 - a12 * a21;\n  float b11 = -a22 * a10 + a12 * a20;\n  float b21 = a21 * a10 - a11 * a20;\n\n  float det = a00 * b01 + a01 * b11 + a02 * b21;\n\n  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),\n              b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),\n              b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;\n}\n\nmat4 inverse_1_0(mat4 m) {\n  float\n      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],\n      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],\n      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],\n      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],\n\n      b00 = a00 * a11 - a01 * a10,\n      b01 = a00 * a12 - a02 * a10,\n      b02 = a00 * a13 - a03 * a10,\n      b03 = a01 * a12 - a02 * a11,\n      b04 = a01 * a13 - a03 * a11,\n      b05 = a02 * a13 - a03 * a12,\n      b06 = a20 * a31 - a21 * a30,\n      b07 = a20 * a32 - a22 * a30,\n      b08 = a20 * a33 - a23 * a30,\n      b09 = a21 * a32 - a22 * a31,\n      b10 = a21 * a33 - a23 * a31,\n      b11 = a22 * a33 - a23 * a32,\n\n      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n\n  return mat4(\n      a11 * b11 - a12 * b10 + a13 * b09,\n      a02 * b10 - a01 * b11 - a03 * b09,\n      a31 * b05 - a32 * b04 + a33 * b03,\n      a22 * b04 - a21 * b05 - a23 * b03,\n      a12 * b08 - a10 * b11 - a13 * b07,\n      a00 * b11 - a02 * b08 + a03 * b07,\n      a32 * b02 - a30 * b05 - a33 * b01,\n      a20 * b05 - a22 * b02 + a23 * b01,\n      a10 * b10 - a11 * b08 + a13 * b06,\n      a01 * b08 - a00 * b10 - a03 * b06,\n      a30 * b04 - a31 * b02 + a33 * b00,\n      a21 * b02 - a20 * b04 - a23 * b00,\n      a11 * b07 - a10 * b09 - a12 * b06,\n      a00 * b09 - a01 * b07 + a02 * b06,\n      a31 * b01 - a30 * b03 - a32 * b00,\n      a20 * b03 - a21 * b01 + a22 * b00) / det;\n}\n\n\n\r\nvoid main(void) {\r\n  m_matrix = inverse_1_0(modelMatrix);\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nuniform float time;\r\nuniform float time2;\r\nuniform float acceleration;\r\nuniform vec2 resolution;\r\n\r\nvarying mat4 m_matrix;\r\n\r\n// const vec3 cPos = vec3(0.0, 0.0, 10.0);\r\nconst float targetDepth = 3.5;\r\nconst vec3 lightDir = vec3(0.577, -0.577, 0.577);\r\n\r\nvec3 hsv2rgb_1_0(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_4_1(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_4_1(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_4_2(vec4 x) {\n     return mod289_4_1(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_4_3(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_4_4(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_4_5 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_4_6 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_4_6;\n  vec3 i1 = min( g_4_6.xyz, l.zxy );\n  vec3 i2 = max( g_4_6.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_4_5.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_4_1(i);\n  vec4 p = permute_4_2( permute_4_2( permute_4_2(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_4_5.wyz - D_4_5.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_4_7 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_4_8 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_4_7.xy,h.z);\n  vec3 p3 = vec3(a1_4_7.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_4_3(vec4(dot(p0_4_8,p0_4_8), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_4_8 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_4_8,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 rotate_2_9(vec3 p, float radian_x, float radian_y, float radian_z) {\r\n  mat3 mx = mat3(\r\n    1.0, 0.0, 0.0,\r\n    0.0, cos(radian_x), -sin(radian_x),\r\n    0.0, sin(radian_x), cos(radian_x)\r\n  );\r\n  mat3 my = mat3(\r\n    cos(radian_y), 0.0, sin(radian_y),\r\n    0.0, 1.0, 0.0,\r\n    -sin(radian_y), 0.0, cos(radian_y)\r\n  );\r\n  mat3 mz = mat3(\r\n    cos(radian_z), -sin(radian_z), 0.0,\r\n    sin(radian_z), cos(radian_z), 0.0,\r\n    0.0, 0.0, 1.0\r\n  );\r\n  return mx * my * mz * p;\r\n}\r\n\n\nfloat dBox_3_10(vec3 p, vec3 size) {\r\n  return length(max(abs(p) - size, 0.0));\r\n}\r\n\n\n\r\nfloat getNoise(vec3 p) {\r\n  return snoise_4_4(p * (0.4 + acceleration * 0.1) + time / 100.0);\r\n}\r\n\r\nvec3 getRotate(vec3 p) {\r\n  return rotate_2_9(p, radians(time2), radians(time2 * 2.0), radians(time2));\r\n}\r\n\r\nfloat distanceFunc(vec3 p) {\r\n  vec4 p1 = m_matrix * vec4(p, 1.0);\r\n  float n1 = getNoise(p1.xyz);\r\n  vec3 p2 = getRotate(p1.xyz);\r\n  float d1 = dBox_3_10(p2, vec3(0.8 - min(acceleration, 0.8))) - 0.2;\r\n  float d2 = dBox_3_10(p2, vec3(1.0)) - n1;\r\n  float d3 = dBox_3_10(p2, vec3(0.5 + acceleration * 0.4)) - n1;\r\n  return min(max(d1, -d2), d3);\r\n}\r\n\r\nfloat distanceFuncForFill(vec3 p) {\r\n  vec4 p1 = m_matrix * vec4(p, 1.0);\r\n  float n = getNoise(p1.xyz);\r\n  vec3 p2 = getRotate(p1.xyz);\r\n  return dBox_3_10(p2, vec3(0.5 + acceleration * 0.4)) - n;\r\n}\r\n\r\nvec3 getNormal(vec3 p) {\r\n  const float d = 0.1;\r\n  return normalize(vec3(\r\n    distanceFunc(p + vec3(d, 0.0, 0.0)) - distanceFunc(p + vec3(-d, 0.0, 0.0)),\r\n    distanceFunc(p + vec3(0.0, d, 0.0)) - distanceFunc(p + vec3(0.0, -d, 0.0)),\r\n    distanceFunc(p + vec3(0.0, 0.0, d)) - distanceFunc(p + vec3(0.0, 0.0, -d))\r\n  ));\r\n}\r\n\r\nvoid main() {\r\n  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);\r\n\r\n  vec3 cDir = normalize(cameraPosition * -1.0);\r\n  vec3 cUp  = vec3(0.0, 1.0, 0.0);\r\n  vec3 cSide = cross(cDir, cUp);\r\n\r\n  vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir * targetDepth);\r\n\r\n  float distance = 0.0;\r\n  float rLen = 0.0;\r\n  vec3 rPos = cameraPosition;\r\n  for(int i = 0; i < 64; i++){\r\n    distance = distanceFunc(rPos);\r\n    rLen += distance;\r\n    rPos = cameraPosition + ray * rLen * 0.2;\r\n  }\r\n\r\n  vec3 normal = getNormal(rPos);\r\n  if(abs(distance) < 0.5){\r\n    if (distanceFuncForFill(rPos) > 0.5) {\r\n      gl_FragColor = vec4(hsv2rgb_1_0(vec3(dot(normal, cUp) * 0.8 + time / 400.0, 0.2, dot(normal, cUp) * 0.8 + 0.1)), 1.0);\r\n    } else {\r\n      gl_FragColor = vec4(hsv2rgb_1_0(vec3(dot(normal, cUp) * 0.1 + time / 400.0, 0.8, dot(normal, cUp) * 0.2 + 0.8)), 1.0);\r\n    }\r\n  } else {\r\n    gl_FragColor = vec4(0.0);\r\n  }\r\n}\r\n",
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
      vertexShader: "#define GLSLIFY 1\nuniform float time;\r\nuniform float acceleration;\r\n\r\nvarying vec3 vPosition;\r\nvarying vec3 vColor;\r\nvarying mat4 invertMatrix;\r\n\r\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_3_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_3_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_3_1(vec4 x) {\n     return mod289_3_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_3_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_3_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_3_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_3_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_3_5;\n  vec3 i1 = min( g_3_5.xyz, l.zxy );\n  vec3 i2 = max( g_3_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_3_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_3_0(i);\n  vec4 p = permute_3_1( permute_3_1( permute_3_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_3_4.wyz - D_3_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_3_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_3_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_3_6.xy,h.z);\n  vec3 p3 = vec3(a1_3_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_3_2(vec4(dot(p0_3_7,p0_3_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_3_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_3_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 hsv2rgb_1_8(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\nfloat inverse_4_9(float m) {\n  return 1.0 / m;\n}\n\nmat2 inverse_4_9(mat2 m) {\n  return mat2(m[1][1],-m[0][1],\n             -m[1][0], m[0][0]) / (m[0][0]*m[1][1] - m[0][1]*m[1][0]);\n}\n\nmat3 inverse_4_9(mat3 m) {\n  float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];\n  float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];\n  float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];\n\n  float b01 = a22 * a11 - a12 * a21;\n  float b11 = -a22 * a10 + a12 * a20;\n  float b21 = a21 * a10 - a11 * a20;\n\n  float det = a00 * b01 + a01 * b11 + a02 * b21;\n\n  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),\n              b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),\n              b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;\n}\n\nmat4 inverse_4_9(mat4 m) {\n  float\n      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],\n      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],\n      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],\n      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],\n\n      b00 = a00 * a11 - a01 * a10,\n      b01 = a00 * a12 - a02 * a10,\n      b02 = a00 * a13 - a03 * a10,\n      b03 = a01 * a12 - a02 * a11,\n      b04 = a01 * a13 - a03 * a11,\n      b05 = a02 * a13 - a03 * a12,\n      b06 = a20 * a31 - a21 * a30,\n      b07 = a20 * a32 - a22 * a30,\n      b08 = a20 * a33 - a23 * a30,\n      b09 = a21 * a32 - a22 * a31,\n      b10 = a21 * a33 - a23 * a31,\n      b11 = a22 * a33 - a23 * a32,\n\n      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n\n  return mat4(\n      a11 * b11 - a12 * b10 + a13 * b09,\n      a02 * b10 - a01 * b11 - a03 * b09,\n      a31 * b05 - a32 * b04 + a33 * b03,\n      a22 * b04 - a21 * b05 - a23 * b03,\n      a12 * b08 - a10 * b11 - a13 * b07,\n      a00 * b11 - a02 * b08 + a03 * b07,\n      a32 * b02 - a30 * b05 - a33 * b01,\n      a20 * b05 - a22 * b02 + a23 * b01,\n      a10 * b10 - a11 * b08 + a13 * b06,\n      a01 * b08 - a00 * b10 - a03 * b06,\n      a30 * b04 - a31 * b02 + a33 * b00,\n      a21 * b02 - a20 * b04 - a23 * b00,\n      a11 * b07 - a10 * b09 - a12 * b06,\n      a00 * b09 - a01 * b07 + a02 * b06,\n      a31 * b01 - a30 * b03 - a32 * b00,\n      a20 * b03 - a21 * b01 + a22 * b00) / det;\n}\n\n\nvec3 rotate_2_10(vec3 p, float radian_x, float radian_y, float radian_z) {\r\n  mat3 mx = mat3(\r\n    1.0, 0.0, 0.0,\r\n    0.0, cos(radian_x), -sin(radian_x),\r\n    0.0, sin(radian_x), cos(radian_x)\r\n  );\r\n  mat3 my = mat3(\r\n    cos(radian_y), 0.0, sin(radian_y),\r\n    0.0, 1.0, 0.0,\r\n    -sin(radian_y), 0.0, cos(radian_y)\r\n  );\r\n  mat3 mz = mat3(\r\n    cos(radian_z), -sin(radian_z), 0.0,\r\n    sin(radian_z), cos(radian_z), 0.0,\r\n    0.0, 0.0, 1.0\r\n  );\r\n  return mx * my * mz * p;\r\n}\r\n\n\n\r\nvec3 getRotate(vec3 p) {\r\n  return rotate_2_10(p, radians(time / 6.0), radians(time / 7.0), radians(time / 8.0));\r\n}\r\n\r\nvoid main() {\r\n  float updateTime = time / 400.0;\r\n  vec3 p_rotate = getRotate(position);\r\n  float noise = snoise_3_3(vec3(p_rotate / 12.1 + updateTime * 0.5));\r\n  vec3 p_noise = p_rotate + p_rotate * noise / 20.0 * (min(acceleration, 6.0) + 1.0);\r\n\r\n  vPosition = p_noise;\r\n  vColor = hsv2rgb_1_8(vec3(updateTime + position.y / 400.0, 0.05 + min(acceleration / 10.0, 0.25), 1.0));\r\n  invertMatrix = inverse_4_9(modelMatrix);\r\n\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(p_noise, 1.0);\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nuniform float time;\r\nuniform float acceleration;\r\n\r\nvarying vec3 vPosition;\r\nvarying vec3 vColor;\r\nvarying mat4 invertMatrix;\r\n\r\nvoid main() {\r\n  vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));\r\n  vec3 inv_light = normalize(invertMatrix * vec4(0.7, -0.7, 0.7, 1.0)).xyz;\r\n  float diff = (dot(normal, inv_light) + 1.0) / 4.0 + 0.4;\r\n  gl_FragColor = vec4(vColor * diff, 1.0);\r\n}\r\n",
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

      this.resizeWindow();
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2RlYm91bmNlLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UyLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UzLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2VfY2FtZXJhLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2VfaGVtaXNwaGVyZV9saWdodC5qcyIsInNyYy9qcy9tb2R1bGVzL2ZvcmNlX3BvaW50X2xpZ2h0LmpzIiwic3JjL2pzL21vZHVsZXMvbW92ZXIuanMiLCJzcmMvanMvbW9kdWxlcy9waHlzaWNzX3JlbmRlcmVyLmpzIiwic3JjL2pzL21vZHVsZXMvcG9pbnRzLmpzIiwic3JjL2pzL21vZHVsZXMvdXRpbC5qcyIsInNyYy9qcy9za2V0Y2hlcy5qcyIsInNyYy9qcy9za2V0Y2hlcy9hdHRyYWN0LmpzIiwic3JjL2pzL3NrZXRjaGVzL2NvbWV0LmpzIiwic3JjL2pzL3NrZXRjaGVzL2Rpc3RvcnQuanMiLCJzcmMvanMvc2tldGNoZXMvZmlyZV9iYWxsLmpzIiwic3JjL2pzL3NrZXRjaGVzL2dhbGxlcnkuanMiLCJzcmMvanMvc2tldGNoZXMvaG9sZS5qcyIsInNyYy9qcy9za2V0Y2hlcy9oeXBlcl9zcGFjZS5qcyIsInNyYy9qcy9za2V0Y2hlcy9pbWFnZV9kYXRhLmpzIiwic3JjL2pzL3NrZXRjaGVzL21ldGFsX2N1YmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9kZWJvdW5jZScpO1xyXG52YXIgRm9yY2VDYW1lcmEgPSByZXF1aXJlKCcuL21vZHVsZXMvZm9yY2VfY2FtZXJhJyk7XHJcblxyXG52YXIgdmVjdG9yX21vdXNlX2Rvd24gPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xyXG52YXIgdmVjdG9yX21vdXNlX21vdmUgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xyXG52YXIgdmVjdG9yX21vdXNlX2VuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcblxyXG52YXIgY2FudmFzID0gbnVsbDtcclxudmFyIHJlbmRlcmVyID0gbnVsbDtcclxudmFyIHNjZW5lID0gbnVsbDtcclxudmFyIGNhbWVyYSA9IG51bGw7XHJcblxyXG52YXIgcnVubmluZyA9IG51bGw7XHJcbnZhciBza2V0Y2hlcyA9IHJlcXVpcmUoJy4vc2tldGNoZXMnKTtcclxudmFyIHNrZXRjaF9pZCA9IDA7XHJcblxyXG52YXIgbWV0YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWV0YScpO1xyXG52YXIgYnRuX3RvZ2dsZV9tZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi1zd2l0Y2gtbWVudScpO1xyXG52YXIgbWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZW51Jyk7XHJcbnZhciBzZWxlY3Rfc2tldGNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlbGVjdC1za2V0Y2gnKTtcclxudmFyIHNrZXRjaF90aXRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5za2V0Y2gtdGl0bGUnKTtcclxudmFyIHNrZXRjaF9kYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNrZXRjaC1kYXRlJyk7XHJcbnZhciBza2V0Y2hfZGVzY3JpcHRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2tldGNoLWRlc2NyaXB0aW9uJyk7XHJcblxyXG52YXIgaW5pdFRocmVlID0gZnVuY3Rpb24oKSB7XHJcbiAgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xyXG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xyXG4gICAgYW50aWFsaWFzOiB0cnVlLFxyXG4gICAgdG9uZU1hcHBpbmc6IFRIUkVFLk5vVG9uZU1hcHBpbmcsXHJcbiAgfSk7XHJcbiAgaWYgKCFyZW5kZXJlcikge1xyXG4gICAgYWxlcnQoJ1RocmVlLmpz44Gu5Yid5pyf5YyW44Gr5aSx5pWX44GX44G+44GX44Gf44CCJyk7XHJcbiAgfVxyXG4gIHJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgY2FudmFzLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG4gIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHgwMDAwMDAsIDEuMCk7XHJcblxyXG4gIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcblxyXG4gIGNhbWVyYSA9IG5ldyBGb3JjZUNhbWVyYSgzNSwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDEsIDEwMDAwKTtcclxufTtcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgc2V0U2tldGNoSWQoKTtcclxuICBidWlsZE1lbnUoKTtcclxuICBpbml0VGhyZWUoKTtcclxuICBzdGFydFJ1blNrZXRjaChza2V0Y2hlc1tza2V0Y2hlcy5sZW5ndGggLSBza2V0Y2hfaWRdKTtcclxuICByZW5kZXJsb29wKCk7XHJcbiAgc2V0RXZlbnQoKTtcclxuICBkZWJvdW5jZSh3aW5kb3csICdyZXNpemUnLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICByZXNpemVSZW5kZXJlcigpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudmFyIGdldFBhcmFtZXRlckJ5TmFtZSA9IGZ1bmN0aW9uKG5hbWUpIHtcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sIFwiXFxcXFtcIikucmVwbGFjZSgvW1xcXV0vLCBcIlxcXFxdXCIpO1xyXG4gIHZhciByZWdleCA9IG5ldyBSZWdFeHAoXCJbXFxcXD8mXVwiICsgbmFtZSArIFwiPShbXiYjXSopXCIpO1xyXG4gIHZhciByZXN1bHRzID0gcmVnZXguZXhlYyhsb2NhdGlvbi5zZWFyY2gpO1xyXG4gIHJldHVybiByZXN1bHRzID09PSBudWxsID8gXCJcIiA6IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xyXG59O1xyXG5cclxudmFyIHNldFNrZXRjaElkID0gZnVuY3Rpb24oKSB7XHJcbiAgc2tldGNoX2lkID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdza2V0Y2hfaWQnKTtcclxuICBpZiAoc2tldGNoX2lkID09IG51bGwgfHwgc2tldGNoX2lkID4gc2tldGNoZXMubGVuZ3RoIHx8IHNrZXRjaF9pZCA8IDEpIHtcclxuICAgIHNrZXRjaF9pZCA9IHNrZXRjaGVzLmxlbmd0aDtcclxuICB9XHJcbn07XHJcblxyXG52YXIgYnVpbGRNZW51ID0gZnVuY3Rpb24oKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBza2V0Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIHNrZXRjaCA9IHNrZXRjaGVzW2ldO1xyXG4gICAgdmFyIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICBkb20uc2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JywgaSk7XHJcbiAgICBkb20uaW5uZXJIVE1MID0gJzxzcGFuPicgKyBza2V0Y2gubmFtZSArICc8L3NwYW4+JztcclxuICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBzd2l0Y2hTa2V0Y2goc2tldGNoZXNbdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnKV0pO1xyXG4gICAgfSk7XHJcbiAgICBzZWxlY3Rfc2tldGNoLmFwcGVuZENoaWxkKGRvbSk7XHJcbiAgfVxyXG59O1xyXG5cclxudmFyIHN0YXJ0UnVuU2tldGNoID0gZnVuY3Rpb24oc2tldGNoKSB7XHJcbiAgcnVubmluZyA9IG5ldyBza2V0Y2gub2JqKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKTtcclxuICBza2V0Y2hfdGl0bGUuaW5uZXJIVE1MID0gc2tldGNoLm5hbWU7XHJcbiAgc2tldGNoX2RhdGUuaW5uZXJIVE1MID0gKHNrZXRjaC51cGRhdGUubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdwb3N0ZWQ6ICcgKyBza2V0Y2gucG9zdGVkICsgJyAvIHVwZGF0ZTogJyArIHNrZXRjaC51cGRhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdwb3N0ZWQ6ICcgKyBza2V0Y2gucG9zdGVkO1xyXG4gIHNrZXRjaF9kZXNjcmlwdGlvbi5pbm5lckhUTUwgPSBza2V0Y2guZGVzY3JpcHRpb247XHJcbn07XHJcblxyXG52YXIgc3dpdGNoU2tldGNoID0gZnVuY3Rpb24oc2tldGNoKSB7XHJcbiAgcnVubmluZy5yZW1vdmUoc2NlbmUsIGNhbWVyYSk7XHJcbiAgc3RhcnRSdW5Ta2V0Y2goc2tldGNoKTtcclxuICBzd2l0Y2hNZW51KCk7XHJcbn07XHJcblxyXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgcmVuZGVyZXIuY2xlYXIoKTtcclxuICBydW5uaW5nLnJlbmRlcihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcik7XHJcbiAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xyXG59O1xyXG5cclxudmFyIHJlbmRlcmxvb3AgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcclxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVybG9vcCk7XHJcbiAgcmVuZGVyKCk7XHJcbn07XHJcblxyXG52YXIgcmVzaXplUmVuZGVyZXIgPSBmdW5jdGlvbigpIHtcclxuICByZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gIGNhbWVyYS5yZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgcmVzaXplV2luZG93KCk7XHJcbn07XHJcblxyXG52YXIgc2V0RXZlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaFN0YXJ0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoTW92ZShldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZLCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hFbmQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoU3RhcnQoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFksIHRydWUpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hNb3ZlKGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZLCB0cnVlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hFbmQoZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSwgdHJ1ZSk7XHJcbiAgfSk7XHJcblxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBtb3VzZU91dCgpO1xyXG4gIH0pO1xyXG5cclxuICBidG5fdG9nZ2xlX21lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHN3aXRjaE1lbnUoKTtcclxuICB9KTtcclxufTtcclxuXHJcbnZhciB0cmFuc2Zvcm1WZWN0b3IyZCA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gIHZlY3Rvci54ID0gKHZlY3Rvci54IC8gd2luZG93LmlubmVyV2lkdGgpICogMiAtIDE7XHJcbiAgdmVjdG9yLnkgPSAtICh2ZWN0b3IueSAvIHdpbmRvdy5pbm5lckhlaWdodCkgKiAyICsgMTtcclxufTtcclxuXHJcbnZhciB0b3VjaFN0YXJ0ID0gZnVuY3Rpb24oeCwgeSwgdG91Y2hfZXZlbnQpIHtcclxuICB2ZWN0b3JfbW91c2VfZG93bi5zZXQoeCwgeSk7XHJcbiAgdHJhbnNmb3JtVmVjdG9yMmQodmVjdG9yX21vdXNlX2Rvd24pO1xyXG4gIGlmIChydW5uaW5nLnRvdWNoU3RhcnQpIHJ1bm5pbmcudG91Y2hTdGFydChzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93bik7XHJcbn07XHJcblxyXG52YXIgdG91Y2hNb3ZlID0gZnVuY3Rpb24oeCwgeSwgdG91Y2hfZXZlbnQpIHtcclxuICB2ZWN0b3JfbW91c2VfbW92ZS5zZXQoeCwgeSk7XHJcbiAgdHJhbnNmb3JtVmVjdG9yMmQodmVjdG9yX21vdXNlX21vdmUpO1xyXG4gIGlmIChydW5uaW5nLnRvdWNoTW92ZSkgcnVubmluZy50b3VjaE1vdmUoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxufTtcclxuXHJcbnZhciB0b3VjaEVuZCA9IGZ1bmN0aW9uKHgsIHksIHRvdWNoX2V2ZW50KSB7XHJcbiAgdmVjdG9yX21vdXNlX2VuZC5zZXQoeCwgeSk7XHJcbiAgaWYgKHJ1bm5pbmcudG91Y2hFbmQpIHJ1bm5pbmcudG91Y2hFbmQoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCk7XHJcbn07XHJcblxyXG52YXIgbW91c2VPdXQgPSBmdW5jdGlvbigpIHtcclxuICB2ZWN0b3JfbW91c2VfZW5kLnNldCgwLCAwKTtcclxuICBpZiAocnVubmluZy5tb3VzZU91dCkgcnVubmluZy5tb3VzZU91dChzY2VuZSwgY2FtZXJhKTtcclxufTtcclxuXHJcbnZhciBzd2l0Y2hNZW51ID0gZnVuY3Rpb24oKSB7XHJcbiAgYnRuX3RvZ2dsZV9tZW51LmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScpO1xyXG4gIG1lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJyk7XHJcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb2ludGVkJyk7XHJcbn07XHJcblxyXG52YXIgcmVzaXplV2luZG93ID0gZnVuY3Rpb24oKSB7XHJcbiAgaWYgKHJ1bm5pbmcucmVzaXplV2luZG93KSBydW5uaW5nLnJlc2l6ZVdpbmRvdyhzY2VuZSwgY2FtZXJhKTtcclxufTtcclxuXHJcblxyXG5pbml0KCk7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBldmVudFR5cGUsIGNhbGxiYWNrKXtcclxuICB2YXIgdGltZXI7XHJcblxyXG4gIG9iamVjdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgY2FsbGJhY2soZXZlbnQpO1xyXG4gICAgfSwgNTAwKTtcclxuICB9LCBmYWxzZSk7XHJcbn07XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIEZvcmNlMiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbiAgICB0aGlzLmFuY2hvciA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbiAgICB0aGlzLm1hc3MgPSAxO1xyXG4gIH07XHJcbiAgXHJcbiAgRm9yY2UyLnByb3RvdHlwZS51cGRhdGVWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uZGl2aWRlU2NhbGFyKHRoaXMubWFzcyk7XHJcbiAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5Rm9yY2UgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZCh2ZWN0b3IpO1xyXG4gIH07XHJcbiAgRm9yY2UyLnByb3RvdHlwZS5hcHBseUZyaWN0aW9uID0gZnVuY3Rpb24obXUsIG5vcm1hbCkge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKTtcclxuICAgIGlmICghbm9ybWFsKSBub3JtYWwgPSAxO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIoLTEpO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcihtdSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcbiAgRm9yY2UyLnByb3RvdHlwZS5hcHBseURyYWcgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIodGhpcy5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgKiB2YWx1ZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcbiAgRm9yY2UyLnByb3RvdHlwZS5hcHBseUhvb2sgPSBmdW5jdGlvbihyZXN0X2xlbmd0aCwgaykge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy52ZWxvY2l0eS5jbG9uZSgpLnN1Yih0aGlzLmFuY2hvcik7XHJcbiAgICB2YXIgZGlzdGFuY2UgPSBmb3JjZS5sZW5ndGgoKSAtIHJlc3RfbGVuZ3RoO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSAqIGsgKiBkaXN0YW5jZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiBGb3JjZTI7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgRm9yY2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMudmVsb2NpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgdGhpcy5hbmNob3IgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgdGhpcy5tYXNzID0gMTtcclxuICB9O1xyXG5cclxuICBGb3JjZS5wcm90b3R5cGUudXBkYXRlVmVsb2NpdHkgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLmRpdmlkZVNjYWxhcih0aGlzLm1hc3MpO1xyXG4gICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xyXG4gIH07XHJcbiAgRm9yY2UucHJvdG90eXBlLmFwcGx5Rm9yY2UgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZCh2ZWN0b3IpO1xyXG4gIH07XHJcbiAgRm9yY2UucHJvdG90eXBlLmFwcGx5RnJpY3Rpb24gPSBmdW5jdGlvbihtdSwgbm9ybWFsKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xyXG4gICAgaWYgKCFub3JtYWwpIG5vcm1hbCA9IDE7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSk7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKG11KTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlEcmFnID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIHZhciBmb3JjZSA9IHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSk7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKHRoaXMuYWNjZWxlcmF0aW9uLmxlbmd0aCgpICogdmFsdWUpO1xyXG4gICAgdGhpcy5hcHBseUZvcmNlKGZvcmNlKTtcclxuICB9O1xyXG4gIEZvcmNlLnByb3RvdHlwZS5hcHBseUhvb2sgPSBmdW5jdGlvbihyZXN0X2xlbmd0aCwgaykge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy52ZWxvY2l0eS5jbG9uZSgpLnN1Yih0aGlzLmFuY2hvcik7XHJcbiAgICB2YXIgZGlzdGFuY2UgPSBmb3JjZS5sZW5ndGgoKSAtIHJlc3RfbGVuZ3RoO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSAqIGsgKiBkaXN0YW5jZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiBGb3JjZTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgRm9yY2VDYW1lcmEgPSBmdW5jdGlvbihmb3YsIGFzcGVjdCwgbmVhciwgZmFyKSB7XHJcbiAgICBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYS5jYWxsKHRoaXMsIGZvdiwgYXNwZWN0LCBuZWFyLCBmYXIpO1xyXG4gICAgdGhpcy5mb3JjZSA9IHtcclxuICAgICAgcG9zaXRpb246IG5ldyBGb3JjZTMoKSxcclxuICAgICAgbG9vazogbmV3IEZvcmNlMygpLFxyXG4gICAgfTtcclxuICAgIHRoaXMudXAuc2V0KDAsIDEsIDApO1xyXG4gIH07XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYS5wcm90b3R5cGUpO1xyXG4gIEZvcmNlQ2FtZXJhLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEZvcmNlQ2FtZXJhO1xyXG4gIEZvcmNlQ2FtZXJhLnByb3RvdHlwZS51cGRhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wb3NpdGlvbi5jb3B5KHRoaXMuZm9yY2UucG9zaXRpb24udmVsb2NpdHkpO1xyXG4gIH07XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlLnVwZGF0ZUxvb2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubG9va0F0KHtcclxuICAgICAgeDogdGhpcy5mb3JjZS5sb29rLnZlbG9jaXR5LngsXHJcbiAgICAgIHk6IHRoaXMuZm9yY2UubG9vay52ZWxvY2l0eS55LFxyXG4gICAgICB6OiB0aGlzLmZvcmNlLmxvb2sudmVsb2NpdHkueixcclxuICAgIH0pO1xyXG4gIH07XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNldFBvbGFyQ29vcmQoKTtcclxuICAgIHRoaXMubG9va0F0Q2VudGVyKCk7XHJcbiAgfTtcclxuICBGb3JjZUNhbWVyYS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xyXG4gICAgdGhpcy5hc3BlY3QgPSB3aWR0aCAvIGhlaWdodDtcclxuICAgIHRoaXMudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xyXG4gIH07XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlLnNldFBvbGFyQ29vcmQgPSBmdW5jdGlvbihyYWQxLCByYWQyLCByYW5nZSkge1xyXG4gICAgdGhpcy5mb3JjZS5wb3NpdGlvbi5hbmNob3IuY29weShVdGlsLmdldFBvbGFyQ29vcmQocmFkMSwgcmFkMiwgcmFuZ2UpKTtcclxuICB9O1xyXG4gIEZvcmNlQ2FtZXJhLnByb3RvdHlwZS5sb29rQXRDZW50ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubG9va0F0KHtcclxuICAgICAgeDogMCxcclxuICAgICAgeTogMCxcclxuICAgICAgejogMFxyXG4gICAgfSk7XHJcbiAgfTtcclxuICByZXR1cm4gRm9yY2VDYW1lcmE7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIEZvcmNlSGVtaXNwaGVyZUxpZ2h0ID0gZnVuY3Rpb24oaGV4MSwgaGV4MiwgaW50ZW5zaXR5KSB7XHJcbiAgICBUSFJFRS5IZW1pc3BoZXJlTGlnaHQuY2FsbCh0aGlzLCBoZXgxLCBoZXgyLCBpbnRlbnNpdHkpO1xyXG4gICAgdGhpcy5mb3JjZSA9IG5ldyBGb3JjZTMoKTtcclxuICB9O1xyXG4gIEZvcmNlSGVtaXNwaGVyZUxpZ2h0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVEhSRUUuSGVtaXNwaGVyZUxpZ2h0LnByb3RvdHlwZSk7XHJcbiAgRm9yY2VIZW1pc3BoZXJlTGlnaHQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRm9yY2VIZW1pc3BoZXJlTGlnaHQ7XHJcbiAgRm9yY2VIZW1pc3BoZXJlTGlnaHQucHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkodGhpcy5mb3JjZS52ZWxvY2l0eSk7XHJcbiAgfTtcclxuICBGb3JjZUhlbWlzcGhlcmVMaWdodC5wcm90b3R5cGUuc2V0UG9zaXRpb25TcGhlcmljYWwgPSBmdW5jdGlvbihyYWQxLCByYWQyLCByYW5nZSkge1xyXG4gICAgdGhpcy5wb3NpdGlvbi5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChyYWQxLCByYWQyLCByYW5nZSkpO1xyXG4gIH07XHJcbiAgcmV0dXJuIEZvcmNlSGVtaXNwaGVyZUxpZ2h0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBGb3JjZVBvaW50TGlnaHQgPSBmdW5jdGlvbihoZXgsIGludGVuc2l0eSwgZGlzdGFuY2UsIGRlY2F5KSB7XHJcbiAgICBUSFJFRS5Qb2ludExpZ2h0LmNhbGwodGhpcywgaGV4LCBpbnRlbnNpdHksIGRpc3RhbmNlLCBkZWNheSk7XHJcbiAgICB0aGlzLmZvcmNlID0gbmV3IEZvcmNlMygpO1xyXG4gIH07XHJcbiAgRm9yY2VQb2ludExpZ2h0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVEhSRUUuUG9pbnRMaWdodC5wcm90b3R5cGUpO1xyXG4gIEZvcmNlUG9pbnRMaWdodC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBGb3JjZVBvaW50TGlnaHQ7XHJcbiAgRm9yY2VQb2ludExpZ2h0LnByb3RvdHlwZS51cGRhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wb3NpdGlvbi5jb3B5KHRoaXMuZm9yY2UudmVsb2NpdHkpO1xyXG4gIH07XHJcbiAgRm9yY2VQb2ludExpZ2h0LnByb3RvdHlwZS5zZXRQb2xhckNvb3JkID0gZnVuY3Rpb24ocmFkMSwgcmFkMiwgcmFuZ2UpIHtcclxuICAgIHRoaXMucG9zaXRpb24uY29weShVdGlsLmdldFBvbGFyQ29vcmQocmFkMSwgcmFkMiwgcmFuZ2UpKTtcclxuICB9O1xyXG4gIHJldHVybiBGb3JjZVBvaW50TGlnaHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIE1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNpemUgPSAwO1xyXG4gICAgdGhpcy50aW1lID0gMDtcclxuICAgIHRoaXMuaXNfYWN0aXZlID0gZmFsc2U7XHJcbiAgICBGb3JjZTMuY2FsbCh0aGlzKTtcclxuICB9O1xyXG4gIE1vdmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgTW92ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTW92ZXI7XHJcbiAgTW92ZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHRoaXMudmVsb2NpdHkgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gdmVjdG9yLmNsb25lKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbi5zZXQoMCwgMCwgMCk7XHJcbiAgICB0aGlzLnRpbWUgPSAwO1xyXG4gIH07XHJcbiAgTW92ZXIucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmlzX2FjdGl2ZSA9IHRydWU7XHJcbiAgfTtcclxuICBNb3Zlci5wcm90b3R5cGUuaW5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5pc19hY3RpdmUgPSBmYWxzZTtcclxuICB9O1xyXG4gIHJldHVybiBNb3ZlcjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgUGh5c2ljc1JlbmRlcmVyID0gZnVuY3Rpb24obGVuZ3RoKSB7XHJcbiAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uX3NjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgICB0aGlzLnZlbG9jaXR5X3NjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgMSwgMSwgMTAwMCk7XHJcbiAgICB0aGlzLm9wdGlvbiA9IHtcclxuICAgICAgdHlwZTogVEhSRUUuRmxvYXRUeXBlLFxyXG4gICAgfTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gW1xyXG4gICAgICBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQobGVuZ3RoLCBsZW5ndGgsIHRoaXMub3B0aW9uKSxcclxuICAgICAgbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KGxlbmd0aCwgbGVuZ3RoLCB0aGlzLm9wdGlvbiksXHJcbiAgICBdO1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IFtcclxuICAgICAgbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KGxlbmd0aCwgbGVuZ3RoLCB0aGlzLm9wdGlvbiksXHJcbiAgICAgIG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldChsZW5ndGgsIGxlbmd0aCwgdGhpcy5vcHRpb24pLFxyXG4gICAgXTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uX21lc2ggPSB0aGlzLmNyZWF0ZU1lc2goXHJcbiAgICAgIFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbnZvaWQgbWFpbih2b2lkKSB7XFxyXFxuICB2VXYgPSB1djtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIHZlYzIgcmVzb2x1dGlvbjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB2ZWxvY2l0eTtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCBhY2NlbGVyYXRpb247XFxyXFxudW5pZm9ybSB2ZWMyIGFuY2hvcjtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbiNkZWZpbmUgUFJFQ0lTSU9OIDAuMDAwMDAxXFxyXFxuXFxyXFxudmVjMyBkcmFnKHZlYzMgYSwgZmxvYXQgdmFsdWUpIHtcXHJcXG4gIHJldHVybiBub3JtYWxpemUoYSAqIC0xLjAgKyBQUkVDSVNJT04pICogbGVuZ3RoKGEpICogdmFsdWU7XFxyXFxufVxcclxcblxcclxcbnZlYzMgaG9vayh2ZWMzIHYsIHZlYzMgYW5jaG9yLCBmbG9hdCByZXN0X2xlbmd0aCwgZmxvYXQgaykge1xcclxcbiAgcmV0dXJuIG5vcm1hbGl6ZSh2IC0gYW5jaG9yICsgUFJFQ0lTSU9OKSAqICgtMS4wICogayAqIChsZW5ndGgodiAtIGFuY2hvcikgLSByZXN0X2xlbmd0aCkpO1xcclxcbn1cXHJcXG5cXHJcXG52ZWMzIGF0dHJhY3QodmVjMyB2MSwgdmVjMyB2MiwgZmxvYXQgbTEsIGZsb2F0IG0yLCBmbG9hdCBnKSB7XFxyXFxuICByZXR1cm4gZyAqIG0xICogbTIgLyBwb3coY2xhbXAobGVuZ3RoKHYyIC0gdjEpLCA1LjAsIDMwLjApLCAyLjApICogbm9ybWFsaXplKHYyIC0gdjEgKyBQUkVDSVNJT04pO1xcclxcbn1cXHJcXG5cXHJcXG52b2lkIG1haW4odm9pZCkge1xcclxcbiAgdmVjMyB2ID0gdGV4dHVyZTJEKHZlbG9jaXR5LCB2VXYpLnh5ejtcXHJcXG4gIHZlYzMgYSA9IHRleHR1cmUyRChhY2NlbGVyYXRpb24sIHZVdikueHl6O1xcclxcbiAgdmVjMyBhMiA9IGEgKyBub3JtYWxpemUodmVjMyhcXHJcXG4gICAgYW5jaG9yLnggKiByZXNvbHV0aW9uLnggLyA2LjAgKyBQUkVDSVNJT04sXFxyXFxuICAgIDAuMCxcXHJcXG4gICAgYW5jaG9yLnkgKiByZXNvbHV0aW9uLnkgLyAtMi4wICsgUFJFQ0lTSU9OXFxyXFxuICApIC0gdikgLyAyLjA7XFxyXFxuICB2ZWMzIGEzID0gYTIgKyBkcmFnKGEyLCAwLjAwMyk7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGEzLCAxLjApO1xcclxcbn1cXHJcXG5cIlxyXG4gICAgKTtcclxuICAgIHRoaXMudmVsb2NpdHlfbWVzaCA9IHRoaXMuY3JlYXRlTWVzaChcclxuICAgICAgXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgdmVjMiB2VXY7XFxyXFxuXFxyXFxudm9pZCBtYWluKHZvaWQpIHtcXHJcXG4gIHZVdiA9IHV2O1xcclxcbiAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbn1cXHJcXG5cIixcclxuICAgICAgXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB2ZWxvY2l0eTtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCBhY2NlbGVyYXRpb247XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMyIHZVdjtcXHJcXG5cXHJcXG52b2lkIG1haW4odm9pZCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCh0ZXh0dXJlMkQoYWNjZWxlcmF0aW9uLCB2VXYpLnh5eiArIHRleHR1cmUyRCh2ZWxvY2l0eSwgdlV2KS54eXosIDEuMCk7XFxyXFxufVxcclxcblwiXHJcbiAgICApO1xyXG4gICAgdGhpcy50YXJnZXRfaW5kZXggPSAwO1xyXG4gIH07XHJcbiAgUGh5c2ljc1JlbmRlcmVyLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHJlbmRlcmVyLCB2ZWxvY2l0eV9hcnJheSkge1xyXG4gICAgICB2YXIgYWNjZWxlcmF0aW9uX2luaXRfbWVzaCA9IG5ldyBUSFJFRS5NZXNoKFxyXG4gICAgICAgIG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KDIsIDIpLFxyXG4gICAgICAgIG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgICAgICB2ZXJ0ZXhTaGFkZXI6ICd2b2lkIG1haW4odm9pZCkge2dsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbiwgMS4wKTt9JyxcclxuICAgICAgICAgIGZyYWdtZW50U2hhZGVyOiAndm9pZCBtYWluKHZvaWQpIHtnbF9GcmFnQ29sb3IgPSB2ZWM0KDAuMCwgMC4wLCAwLjAsIDEuMCk7fScsXHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuICAgICAgdmFyIHZlbG9jaXR5X2luaXRfdGV4ID0gbmV3IFRIUkVFLkRhdGFUZXh0dXJlKHZlbG9jaXR5X2FycmF5LCB0aGlzLmxlbmd0aCwgdGhpcy5sZW5ndGgsIFRIUkVFLlJHQkZvcm1hdCwgVEhSRUUuRmxvYXRUeXBlKTtcclxuICAgICAgdmVsb2NpdHlfaW5pdF90ZXgubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgICB2YXIgdmVsb2NpdHlfaW5pdF9tZXNoID0gbmV3IFRIUkVFLk1lc2goXHJcbiAgICAgICAgbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkoMiwgMiksXHJcbiAgICAgICAgbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgICAgIHZlbG9jaXR5OiB7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiB2ZWxvY2l0eV9pbml0X3RleCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB2ZXJ0ZXhTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbnZvaWQgbWFpbih2b2lkKSB7XFxyXFxuICB2VXYgPSB1djtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgICAgICBmcmFnbWVudFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gc2FtcGxlcjJEIHZlbG9jaXR5O1xcclxcblxcclxcbnZhcnlpbmcgdmVjMiB2VXY7XFxyXFxuXFxyXFxudm9pZCBtYWluKHZvaWQpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh2ZWxvY2l0eSwgdlV2KTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uX3NjZW5lLmFkZCh0aGlzLmNhbWVyYSk7XHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uX3NjZW5lLmFkZChhY2NlbGVyYXRpb25faW5pdF9tZXNoKTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMuYWNjZWxlcmF0aW9uX3NjZW5lLCB0aGlzLmNhbWVyYSwgdGhpcy5hY2NlbGVyYXRpb25bMF0pO1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIodGhpcy5hY2NlbGVyYXRpb25fc2NlbmUsIHRoaXMuY2FtZXJhLCB0aGlzLmFjY2VsZXJhdGlvblsxXSk7XHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uX3NjZW5lLnJlbW92ZShhY2NlbGVyYXRpb25faW5pdF9tZXNoKTtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25fc2NlbmUuYWRkKHRoaXMuYWNjZWxlcmF0aW9uX21lc2gpO1xyXG5cclxuICAgICAgdGhpcy52ZWxvY2l0eV9zY2VuZS5hZGQodGhpcy5jYW1lcmEpO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5X3NjZW5lLmFkZCh2ZWxvY2l0eV9pbml0X21lc2gpO1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIodGhpcy52ZWxvY2l0eV9zY2VuZSwgdGhpcy5jYW1lcmEsIHRoaXMudmVsb2NpdHlbMF0pO1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIodGhpcy52ZWxvY2l0eV9zY2VuZSwgdGhpcy5jYW1lcmEsIHRoaXMudmVsb2NpdHlbMV0pO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5X3NjZW5lLnJlbW92ZSh2ZWxvY2l0eV9pbml0X21lc2gpO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5X3NjZW5lLmFkZCh0aGlzLnZlbG9jaXR5X21lc2gpO1xyXG4gICAgfSxcclxuICAgIGNyZWF0ZU1lc2g6IGZ1bmN0aW9uKHZzLCBmcykge1xyXG4gICAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goXHJcbiAgICAgICAgbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkoMiwgMiksXHJcbiAgICAgICAgbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgICAgIHJlc29sdXRpb246IHtcclxuICAgICAgICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdmVsb2NpdHk6IHtcclxuICAgICAgICAgICAgICB0eXBlOiAndCcsXHJcbiAgICAgICAgICAgICAgdmFsdWU6IG51bGwsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgIHR5cGU6ICd0JyxcclxuICAgICAgICAgICAgICB2YWx1ZTogbnVsbCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB2ZXJ0ZXhTaGFkZXI6IHZzLFxyXG4gICAgICAgICAgZnJhZ21lbnRTaGFkZXI6IGZzLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihyZW5kZXJlcikge1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbl9tZXNoLm1hdGVyaWFsLnVuaWZvcm1zLmFjY2VsZXJhdGlvbi52YWx1ZSA9IHRoaXMuYWNjZWxlcmF0aW9uW01hdGguYWJzKHRoaXMudGFyZ2V0X2luZGV4IC0gMSldO1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbl9tZXNoLm1hdGVyaWFsLnVuaWZvcm1zLnZlbG9jaXR5LnZhbHVlID0gdGhpcy52ZWxvY2l0eVt0aGlzLnRhcmdldF9pbmRleF07XHJcbiAgICAgIHJlbmRlcmVyLnJlbmRlcih0aGlzLmFjY2VsZXJhdGlvbl9zY2VuZSwgdGhpcy5jYW1lcmEsIHRoaXMuYWNjZWxlcmF0aW9uW3RoaXMudGFyZ2V0X2luZGV4XSk7XHJcbiAgICAgIHRoaXMudmVsb2NpdHlfbWVzaC5tYXRlcmlhbC51bmlmb3Jtcy5hY2NlbGVyYXRpb24udmFsdWUgPSB0aGlzLmFjY2VsZXJhdGlvblt0aGlzLnRhcmdldF9pbmRleF07XHJcbiAgICAgIHRoaXMudmVsb2NpdHlfbWVzaC5tYXRlcmlhbC51bmlmb3Jtcy52ZWxvY2l0eS52YWx1ZSA9IHRoaXMudmVsb2NpdHlbdGhpcy50YXJnZXRfaW5kZXhdO1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIodGhpcy52ZWxvY2l0eV9zY2VuZSwgdGhpcy5jYW1lcmEsIHRoaXMudmVsb2NpdHlbTWF0aC5hYnModGhpcy50YXJnZXRfaW5kZXggLSAxKV0pO1xyXG4gICAgICB0aGlzLnRhcmdldF9pbmRleCA9IE1hdGguYWJzKHRoaXMudGFyZ2V0X2luZGV4IC0gMSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0Q3VycmVudFZlbG9jaXR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmVsb2NpdHlbTWF0aC5hYnModGhpcy50YXJnZXRfaW5kZXggLSAxKV07XHJcbiAgICB9LFxyXG4gICAgZ2V0Q3VycmVudEFjY2VsZXJhdGlvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFjY2VsZXJhdGlvbltNYXRoLmFicyh0aGlzLnRhcmdldF9pbmRleCAtIDEpXTtcclxuICAgIH0sXHJcbiAgICByZXNpemU6IGZ1bmN0aW9uKGxlbmd0aCkge1xyXG4gICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcclxuICAgICAgdGhpcy52ZWxvY2l0eVswXS5zZXRTaXplKGxlbmd0aCwgbGVuZ3RoKTtcclxuICAgICAgdGhpcy52ZWxvY2l0eVsxXS5zZXRTaXplKGxlbmd0aCwgbGVuZ3RoKTtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25bMF0uc2V0U2l6ZShsZW5ndGgsIGxlbmd0aCk7XHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uWzFdLnNldFNpemUobGVuZ3RoLCBsZW5ndGgpO1xyXG4gICAgfSxcclxuICB9O1xyXG4gIHJldHVybiBQaHlzaWNzUmVuZGVyZXI7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgdGhpcy5tYXRlcmlhbCA9IG51bGw7XHJcbiAgICB0aGlzLm9iaiA9IG51bGw7XHJcbiAgICBGb3JjZTMuY2FsbCh0aGlzKTtcclxuICB9O1xyXG4gIFBvaW50cy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEZvcmNlMy5wcm90b3R5cGUpO1xyXG4gIFBvaW50cy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQb2ludHM7XHJcbiAgUG9pbnRzLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocGFyYW0pIHtcclxuICAgIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIGNvbG9yOiB7IHR5cGU6ICdjJywgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcigweGZmZmZmZikgfSxcclxuICAgICAgICB0ZXh0dXJlOiB7IHR5cGU6ICd0JywgdmFsdWU6IHBhcmFtLnRleHR1cmUgfVxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHBhcmFtLnZzLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogcGFyYW0uZnMsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxyXG4gICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcclxuICAgICAgYmxlbmRpbmc6IHBhcmFtLmJsZW5kaW5nXHJcbiAgICB9KTtcclxuICAgIHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocGFyYW0ucG9zaXRpb25zLCAzKSk7XHJcbiAgICB0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnY3VzdG9tQ29sb3InLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBhcmFtLmNvbG9ycywgMykpO1xyXG4gICAgdGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3ZlcnRleE9wYWNpdHknLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBhcmFtLm9wYWNpdGllcywgMSkpO1xyXG4gICAgdGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3NpemUnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBhcmFtLnNpemVzLCAxKSk7XHJcbiAgICB0aGlzLm9iaiA9IG5ldyBUSFJFRS5Qb2ludHModGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgICBwYXJhbS5zY2VuZS5hZGQodGhpcy5vYmopO1xyXG4gIH07XHJcbiAgUG9pbnRzLnByb3RvdHlwZS51cGRhdGVQb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMub2JqLnBvc2l0aW9uLmNvcHkodGhpcy52ZWxvY2l0eSk7XHJcbiAgICB0aGlzLm9iai5nZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMub2JqLmdlb21ldHJ5LmF0dHJpYnV0ZXMudmVydGV4T3BhY2l0eS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB0aGlzLm9iai5nZW9tZXRyeS5hdHRyaWJ1dGVzLnNpemUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5vYmouZ2VvbWV0cnkuYXR0cmlidXRlcy5jdXN0b21Db2xvci5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgfTtcclxuICByZXR1cm4gUG9pbnRzO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBleHBvcnRzID0ge1xyXG4gIGdldFJhbmRvbUludDogZnVuY3Rpb24obWluLCBtYXgpe1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcclxuICB9LFxyXG4gIGdldERlZ3JlZTogZnVuY3Rpb24ocmFkaWFuKSB7XHJcbiAgICByZXR1cm4gcmFkaWFuIC8gTWF0aC5QSSAqIDE4MDtcclxuICB9LFxyXG4gIGdldFJhZGlhbjogZnVuY3Rpb24oZGVncmVlcykge1xyXG4gICAgcmV0dXJuIGRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gIH0sXHJcbiAgZ2V0UG9sYXJDb29yZDogZnVuY3Rpb24ocmFkMSwgcmFkMiwgcikge1xyXG4gICAgdmFyIHggPSBNYXRoLmNvcyhyYWQxKSAqIE1hdGguY29zKHJhZDIpICogcjtcclxuICAgIHZhciB6ID0gTWF0aC5jb3MocmFkMSkgKiBNYXRoLnNpbihyYWQyKSAqIHI7XHJcbiAgICB2YXIgeSA9IE1hdGguc2luKHJhZDEpICogcjtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMyh4LCB5LCB6KTtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHM7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gW1xyXG4gIHtcclxuICAgIG5hbWU6ICdhdHRyYWN0JyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9hdHRyYWN0JyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE2LjYuMTMnLFxyXG4gICAgdXBkYXRlOiAnMjAxNi43LjInLFxyXG4gICAgZGVzY3JpcHRpb246ICd1c2UgZnJhZ21lbnQgc2hhZGVyIHRvIHBlcnRpY2xlIG1vdmluZy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2hvbGUnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2hvbGUnKSxcclxuICAgIHBvc3RlZDogJzIwMTYuNS4xMCcsXHJcbiAgICB1cGRhdGU6ICcyMDE2LjcuMicsXHJcbiAgICBkZXNjcmlwdGlvbjogJ3N0dWR5IG9mIFBvc3QgRWZmZWN0IHRoYXQgdXNlZCBUSFJFRS5XZWJHTFJlbmRlclRhcmdldC4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ21ldGFsIGN1YmUnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL21ldGFsX2N1YmUnKSxcclxuICAgIHBvc3RlZDogJzIwMTYuNC4yMScsXHJcbiAgICB1cGRhdGU6ICcnLFxyXG4gICAgZGVzY3JpcHRpb246ICdzdHVkeSBvZiByYXltYXJjaGluZyB1c2luZyB0aHJlZS5qcy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2Rpc3RvcnQnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2Rpc3RvcnQnKSxcclxuICAgIHBvc3RlZDogJzIwMTYuMi4yMycsXHJcbiAgICB1cGRhdGU6ICcyMDE2LjUuMTAnLFxyXG4gICAgZGVzY3JpcHRpb246ICd1c2luZyB0aGUgc2ltcGxleCBub2lzZSwgZGlzdG9ydCB0aGUgc3BoZXJlLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnaW1hZ2UgZGF0YScsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvaW1hZ2VfZGF0YScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMi45JyxcclxuICAgIHVwZGF0ZTogJzIwMTUuMTIuMTInLFxyXG4gICAgZGVzY3JpcHRpb246ICdQb2ludHMgYmFzZWQgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELmdldEltYWdlRGF0YSgpJyxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6ICdnYWxsZXJ5JyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9nYWxsZXJ5JyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjEyLjInLFxyXG4gICAgdXBkYXRlOiAnMjAxNS4xMi45JyxcclxuICAgIGRlc2NyaXB0aW9uOiAnaW1hZ2UgZ2FsbGVyeSBvbiAzZC4gdGVzdGVkIHRoYXQgcGlja2VkIG9iamVjdCBhbmQgbW92aW5nIGNhbWVyYS4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2NvbWV0JyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9jb21ldCcpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMS4yNCcsXHJcbiAgICB1cGRhdGU6ICcyMDE2LjEuOCcsXHJcbiAgICBkZXNjcmlwdGlvbjogJ2NhbWVyYSB0byB0cmFjayB0aGUgbW92aW5nIHBvaW50cy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2h5cGVyIHNwYWNlJyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9oeXBlcl9zcGFjZScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMS4xMicsXHJcbiAgICB1cGRhdGU6ICcnLFxyXG4gICAgZGVzY3JpcHRpb246ICdhZGQgbGl0dGxlIGNoYW5nZSBhYm91dCBjYW1lcmEgYW5nbGUgYW5kIHBhcnRpY2xlIGNvbnRyb2xlcy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2ZpcmUgYmFsbCcsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvZmlyZV9iYWxsJyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjExLjEyJyxcclxuICAgIHVwZGF0ZTogJycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ3Rlc3Qgb2Ygc2ltcGxlIHBoeXNpY3MgYW5kIGFkZGl0aXZlIGJsZW5kaW5nLicsXHJcbiAgfVxyXG5dO1xyXG4iLCJcclxudmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIFBoeXNpY3NSZW5kZXJlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcGh5c2ljc19yZW5kZXJlcicpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcikge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKTtcclxuICB9O1xyXG5cclxuICB2YXIgbGVuZ3RoID0gMTAwMDtcclxuICB2YXIgcGh5c2ljc19yZW5kZXJlciA9IG51bGw7XHJcblxyXG4gIHZhciBjcmVhdGVQb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgdmFyIHZlcnRpY2VzX2Jhc2UgPSBbXTtcclxuICAgIHZhciB1dnNfYmFzZSA9IFtdO1xyXG4gICAgdmFyIGNvbG9yc19iYXNlID0gW107XHJcbiAgICB2YXIgbWFzc2VzX2Jhc2UgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgTWF0aC5wb3cobGVuZ3RoLCAyKTsgaSsrKSB7XHJcbiAgICAgIHZlcnRpY2VzX2Jhc2UucHVzaCgwLCAwLCAwKTtcclxuICAgICAgdXZzX2Jhc2UucHVzaChcclxuICAgICAgICBpICUgbGVuZ3RoICogKDEgLyAobGVuZ3RoIC0gMSkpLFxyXG4gICAgICAgIE1hdGguZmxvb3IoaSAvIGxlbmd0aCkgKiAoMSAvIChsZW5ndGggLSAxKSlcclxuICAgICAgKTtcclxuICAgICAgY29sb3JzX2Jhc2UucHVzaChVdGlsLmdldFJhbmRvbUludCgwLCAxMjApIC8gMzYwLCAwLjgsIDEpO1xyXG4gICAgICBtYXNzZXNfYmFzZS5wdXNoKFV0aWwuZ2V0UmFuZG9tSW50KDEsIDEwMCkpO1xyXG4gICAgfVxyXG4gICAgdmFyIHZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlc19iYXNlKTtcclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHZlcnRpY2VzLCAzKSk7XHJcbiAgICB2YXIgdXZzID0gbmV3IEZsb2F0MzJBcnJheSh1dnNfYmFzZSk7XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3V2MicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUodXZzLCAyKSk7XHJcbiAgICB2YXIgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShjb2xvcnNfYmFzZSk7XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ2NvbG9yJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShjb2xvcnMsIDMpKTtcclxuICAgIHZhciBtYXNzZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1hc3Nlc19iYXNlKTtcclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnbWFzcycsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUobWFzc2VzLCAxKSk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdmVsb2NpdHk6IHtcclxuICAgICAgICAgIHR5cGU6ICd0JyxcclxuICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuVGV4dHVyZSgpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY2NlbGVyYXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICd0JyxcclxuICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuVGV4dHVyZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMiB1djI7XFxyXFxuYXR0cmlidXRlIHZlYzMgY29sb3I7XFxyXFxuYXR0cmlidXRlIGZsb2F0IG1hc3M7XFxyXFxuXFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdmVsb2NpdHk7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgYWNjZWxlcmF0aW9uO1xcclxcblxcclxcbnZhcnlpbmcgZmxvYXQgdkFjY2VsZXJhdGlvbjtcXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgdk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKHZvaWQpIHtcXHJcXG4gIHZlYzQgdXBkYXRlX3Bvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdGV4dHVyZTJEKHZlbG9jaXR5LCB1djIpO1xcclxcbiAgdkFjY2VsZXJhdGlvbiA9IGxlbmd0aCh0ZXh0dXJlMkQoYWNjZWxlcmF0aW9uLCB1djIpLnh5eikgKiBtYXNzO1xcclxcbiAgdkNvbG9yID0gY29sb3I7XFxyXFxuICB2T3BhY2l0eSA9IDAuNiAqICgzMDAuMCAvIGxlbmd0aCh1cGRhdGVfcG9zaXRpb24ueHl6KSk7XFxyXFxuICBnbF9Qb2ludFNpemUgPSAyLjAgKiAoMzAwLjAgLyBsZW5ndGgodXBkYXRlX3Bvc2l0aW9uLnh5eikpO1xcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdXBkYXRlX3Bvc2l0aW9uO1xcclxcbn1cXHJcXG5cIixcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIGZsb2F0IHZBY2NlbGVyYXRpb247XFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IHZPcGFjaXR5O1xcclxcblxcclxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG5cXHJcXG52ZWMzIGhzdjJyZ2JfMV8wKHZlYzMgYyl7XFxyXFxuICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XFxyXFxuICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XFxyXFxuICByZXR1cm4gYy56ICogbWl4KEsueHh4LCBjbGFtcChwIC0gSy54eHgsIDAuMCwgMS4wKSwgYy55KTtcXHJcXG59XFxyXFxuXFxuXFxuXFxyXFxudm9pZCBtYWluKHZvaWQpIHtcXHJcXG4gIHZlYzMgbjtcXHJcXG4gIG4ueHkgPSBnbF9Qb2ludENvb3JkICogMi4wIC0gMS4wO1xcclxcbiAgbi56ID0gMS4wIC0gZG90KG4ueHksIG4ueHkpO1xcclxcbiAgaWYgKG4ueiA8IDAuMCkgZGlzY2FyZDtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoaHN2MnJnYl8xXzAodmVjMyh2Q29sb3IueCArIHRpbWUgLyAzNjAwLjAsIHZDb2xvci55LCB2Q29sb3IueikpLCB2T3BhY2l0eSk7XFxyXFxufVxcclxcblwiLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcclxuICAgICAgZGVwdGhXcml0ZTogZmFsc2UsXHJcbiAgICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH1cclxuICB2YXIgcG9pbnRzID0gY3JlYXRlUG9pbnRzKCk7XHJcblxyXG4gIHZhciBjcmVhdGVQb2ludHNJbnRWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHZlcnRpY2VzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IE1hdGgucG93KGxlbmd0aCwgMik7IGkrKykge1xyXG4gICAgICB2YXIgdiA9IFV0aWwuZ2V0UG9sYXJDb29yZChcclxuICAgICAgICBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKSxcclxuICAgICAgICBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKSxcclxuICAgICAgICBVdGlsLmdldFJhbmRvbUludCgxMCwgMTAwMClcclxuICAgICAgKTtcclxuICAgICAgdmVydGljZXMucHVzaCh2LngsIHYueSAvIDEwLjAsIHYueik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcyk7XHJcbiAgfVxyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpIHtcclxuICAgICAgcGh5c2ljc19yZW5kZXJlciA9IG5ldyBQaHlzaWNzUmVuZGVyZXIobGVuZ3RoKTtcclxuICAgICAgcGh5c2ljc19yZW5kZXJlci5pbml0KHJlbmRlcmVyLCBjcmVhdGVQb2ludHNJbnRWZWxvY2l0eSgpKTtcclxuICAgICAgcGh5c2ljc19yZW5kZXJlci5hY2NlbGVyYXRpb25fbWVzaC5tYXRlcmlhbC51bmlmb3Jtcy5hbmNob3IgPSB7XHJcbiAgICAgICAgdHlwZTogJ3YyJyxcclxuICAgICAgICB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIoKSxcclxuICAgICAgfVxyXG4gICAgICBzY2VuZS5hZGQocG9pbnRzKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoMCwgMTUsIDYwMCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBwb2ludHMuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocG9pbnRzKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKSB7XHJcbiAgICAgIHBoeXNpY3NfcmVuZGVyZXIucmVuZGVyKHJlbmRlcmVyKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLnVuaWZvcm1zLnZlbG9jaXR5LnZhbHVlID0gcGh5c2ljc19yZW5kZXJlci5nZXRDdXJyZW50VmVsb2NpdHkoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLnVuaWZvcm1zLmFjY2VsZXJhdGlvbi52YWx1ZSA9IHBoeXNpY3NfcmVuZGVyZXIuZ2V0Q3VycmVudEFjY2VsZXJhdGlvbigpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5SG9vaygwLCAwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZUxvb2soKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBwaHlzaWNzX3JlbmRlcmVyLmFjY2VsZXJhdGlvbl9tZXNoLm1hdGVyaWFsLnVuaWZvcm1zLmFuY2hvci52YWx1ZS5jb3B5KHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgfSxcclxuICAgIG1vdXNlT3V0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHBoeXNpY3NfcmVuZGVyZXIuYWNjZWxlcmF0aW9uX21lc2gubWF0ZXJpYWwudW5pZm9ybXMuYW5jaG9yLnZhbHVlLnNldCgwLCAwLCAwKTtcclxuICAgIH0sXHJcbiAgICByZXNpemVXaW5kb3c6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMicpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcbnZhciBQb2ludHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50cy5qcycpO1xyXG52YXIgRm9yY2VIZW1pc3BoZXJlTGlnaHQgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlX2hlbWlzcGhlcmVfbGlnaHQnKTtcclxudmFyIEZvcmNlUG9pbnRMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2VfcG9pbnRfbGlnaHQnKTtcclxuXHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciBtb3ZlcnNfbnVtID0gMTAwMDA7XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBtb3Zlcl9hY3RpdmF0ZV9jb3VudCA9IDI7XHJcbiAgdmFyIHBvaW50cyA9IG5ldyBQb2ludHMoKTtcclxuICB2YXIgaGVtaV9saWdodCA9IG51bGw7XHJcbiAgdmFyIGNvbWV0X2xpZ2h0MSA9IG51bGw7XHJcbiAgdmFyIGNvbWV0X2xpZ2h0MiA9IG51bGw7XHJcbiAgdmFyIHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBjb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgb3BhY2l0aWVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBjb21ldCA9IG51bGw7XHJcbiAgdmFyIGNvbWV0X3JhZGl1cyA9IDMwO1xyXG4gIHZhciBjb21ldF9zY2FsZSA9IG5ldyBGb3JjZTIoKTtcclxuICB2YXIgY29tZXRfY29sb3JfaCA9IDE0MDtcclxuICB2YXIgY29sb3JfZGlmZiA9IDQ1O1xyXG4gIHZhciBwbGFuZXQgPSBudWxsO1xyXG4gIHZhciBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gIHZhciBsYXN0X3RpbWVfcGx1c19hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGxhc3RfdGltZV9ib3VuY2UgPSBEYXRlLm5vdygpO1xyXG4gIHZhciBsYXN0X3RpbWVfdG91Y2ggPSBEYXRlLm5vdygpO1xyXG4gIHZhciBwbHVzX2FjY2VsZXJhdGlvbiA9IDA7XHJcbiAgdmFyIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICB2YXIgaXNfcGx1c19hY3RpdmF0ZSA9IGZhbHNlO1xyXG4gIHZhciB0cmFja19wb2ludHMgPSB0cnVlO1xyXG5cclxuICB2YXIgdXBkYXRlTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgdmFyIHBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkge1xyXG4gICAgICAgIG1vdmVyLnRpbWUrKztcclxuICAgICAgICBtb3Zlci5hcHBseURyYWcoMC4xKTtcclxuICAgICAgICBtb3Zlci51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICAgIGlmIChtb3Zlci50aW1lID4gMTApIHtcclxuICAgICAgICAgIG1vdmVyLnNpemUgLT0gMjtcclxuICAgICAgICAgIC8vbW92ZXIuYSAtPSAwLjA0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobW92ZXIuc2l6ZSA8PSAwKSB7XHJcbiAgICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgIG1vdmVyLnRpbWUgPSAwO1xyXG4gICAgICAgICAgbW92ZXIuYSA9IDAuMDtcclxuICAgICAgICAgIG1vdmVyLmluYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54IC0gcG9pbnRzLnZlbG9jaXR5Lng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIudmVsb2NpdHkueSAtIHBvaW50cy52ZWxvY2l0eS55O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnZlbG9jaXR5LnogLSBwb2ludHMudmVsb2NpdHkuejtcclxuICAgICAgY29sb3JzW2kgKiAzICsgMF0gPSBtb3Zlci5jb2xvci5yO1xyXG4gICAgICBjb2xvcnNbaSAqIDMgKyAxXSA9IG1vdmVyLmNvbG9yLmc7XHJcbiAgICAgIGNvbG9yc1tpICogMyArIDJdID0gbW92ZXIuY29sb3IuYjtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY3RpdmF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gMTApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZDEgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgICB2YXIgcmFkMiA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICAgIHZhciByYW5nZSA9IFV0aWwuZ2V0UmFuZG9tSW50KDEsIDMwKTtcclxuICAgICAgICB2YXIgdmVjdG9yID0gVXRpbC5nZXRQb2xhckNvb3JkKHJhZDEsIHJhZDIsIHJhbmdlKTtcclxuICAgICAgICB2YXIgZm9yY2UgPSBVdGlsLmdldFBvbGFyQ29vcmQocmFkMSwgcmFkMiwgcmFuZ2UgLyAyMCk7XHJcbiAgICAgICAgdmFyIGggPSBVdGlsLmdldFJhbmRvbUludChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZiwgY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYpIC0gcGx1c19hY2NlbGVyYXRpb24gLyAxLjU7XHJcbiAgICAgICAgdmFyIHMgPSBVdGlsLmdldFJhbmRvbUludCg2MCwgODApO1xyXG4gICAgICAgIHZlY3Rvci5hZGQocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgICBtb3Zlci5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIG1vdmVyLmluaXQodmVjdG9yKTtcclxuICAgICAgICBtb3Zlci5jb2xvci5zZXRIU0woaCAvIDM2MCwgcyAvIDEwMCwgMC43KTtcclxuICAgICAgICBtb3Zlci5hcHBseUZvcmNlKGZvcmNlKTtcclxuICAgICAgICBtb3Zlci5hID0gMTtcclxuICAgICAgICBtb3Zlci5zaXplID0gMjU7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgICBpZiAoY291bnQgPj0gbW92ZXJfYWN0aXZhdGVfY291bnQpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHJvdGF0ZUNvbWV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb21ldC5yb3RhdGlvbi54ICs9IDAuMDMgKyBwbHVzX2FjY2VsZXJhdGlvbiAvIDEwMDA7XHJcbiAgICBjb21ldC5yb3RhdGlvbi55ICs9IDAuMDEgKyBwbHVzX2FjY2VsZXJhdGlvbiAvIDEwMDA7XHJcbiAgICBjb21ldC5yb3RhdGlvbi56ICs9IDAuMDEgKyBwbHVzX2FjY2VsZXJhdGlvbiAvIDEwMDA7XHJcbiAgICBwb2ludHMucmFkMV9iYXNlICs9IFV0aWwuZ2V0UmFkaWFuKC42KTtcclxuICAgIHBvaW50cy5yYWQxID0gVXRpbC5nZXRSYWRpYW4oTWF0aC5zaW4ocG9pbnRzLnJhZDFfYmFzZSkgKiA0NSArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwKTtcclxuICAgIHBvaW50cy5yYWQyICs9IFV0aWwuZ2V0UmFkaWFuKDAuOCArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwKTtcclxuICAgIHBvaW50cy5yYWQzICs9IDAuMDE7XHJcbiAgICByZXR1cm4gVXRpbC5nZXRQb2xhckNvb3JkKHBvaW50cy5yYWQxLCBwb2ludHMucmFkMiwgMzUwKTtcclxuICB9O1xyXG5cclxuICB2YXIgcm90YXRlQ29tZXRDb2xvciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHJhZGl1cyA9IGNvbWV0X3JhZGl1cyAqIDAuODtcclxuICAgIGNvbWV0X2xpZ2h0MS5wb3NpdGlvbi5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChVdGlsLmdldFJhZGlhbigwKSwgIFV0aWwuZ2V0UmFkaWFuKDApLCByYWRpdXMpLmFkZChwb2ludHMudmVsb2NpdHkpKTtcclxuICAgIGNvbWV0X2xpZ2h0Mi5wb3NpdGlvbi5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChVdGlsLmdldFJhZGlhbigxODApLCBVdGlsLmdldFJhZGlhbigwKSwgcmFkaXVzKS5hZGQocG9pbnRzLnZlbG9jaXR5KSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGJvdW5jZUNvbWV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoRGF0ZS5ub3coKSAtIGxhc3RfdGltZV9ib3VuY2UgPiAxMDAwIC0gcGx1c19hY2NlbGVyYXRpb24gKiAzKSB7XHJcbiAgICAgIGNvbWV0X3NjYWxlLmFwcGx5Rm9yY2UobmV3IFRIUkVFLlZlY3RvcjIoMC4wOCArIHBsdXNfYWNjZWxlcmF0aW9uIC8gNTAwMCwgMCkpO1xyXG4gICAgICBsYXN0X3RpbWVfYm91bmNlID0gRGF0ZS5ub3coKTtcclxuICAgICAgaXNfcGx1c19hY3RpdmF0ZSA9IHRydWU7XHJcbiAgICAgIGxhc3RfdGltZV9wbHVzX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICAgIH1cclxuICAgIGlmIChpc19wbHVzX2FjdGl2YXRlICYmIERhdGUubm93KCkgLSBsYXN0X3RpbWVfcGx1c19hY3RpdmF0ZSA8IDUwMCkge1xyXG4gICAgICBtb3Zlcl9hY3RpdmF0ZV9jb3VudCA9IDYgKyBNYXRoLmZsb29yKHBsdXNfYWNjZWxlcmF0aW9uIC8gNDApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbW92ZXJfYWN0aXZhdGVfY291bnQgPSAxICsgTWF0aC5mbG9vcihwbHVzX2FjY2VsZXJhdGlvbiAvIDQwKTtcclxuICAgIH1cclxuICAgIGNvbWV0X3NjYWxlLmFwcGx5SG9vaygwLCAwLjEpO1xyXG4gICAgY29tZXRfc2NhbGUuYXBwbHlEcmFnKDAuMTIpO1xyXG4gICAgY29tZXRfc2NhbGUudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgIGNvbWV0LnNjYWxlLnNldCgxICsgY29tZXRfc2NhbGUudmVsb2NpdHkueCwgMSArIGNvbWV0X3NjYWxlLnZlbG9jaXR5LngsIDEgKyBjb21ldF9zY2FsZS52ZWxvY2l0eS54KTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlVGV4dHVyZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgdmFyIGdyYWQgPSBudWxsO1xyXG4gICAgdmFyIHRleHR1cmUgPSBudWxsO1xyXG5cclxuICAgIGNhbnZhcy53aWR0aCA9IDIwMDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSAyMDA7XHJcbiAgICBncmFkID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KDEwMCwgMTAwLCAyMCwgMTAwLCAxMDAsIDEwMCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjksICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLjAsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDApJyk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcclxuICAgIGN0eC5hcmMoMTAwLCAxMDAsIDEwMCwgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXMpO1xyXG4gICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdGV4dHVyZTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlQ29tbWV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgYmFzZV9nZW9tZXRyeSA9IG5ldyBUSFJFRS5PY3RhaGVkcm9uR2VvbWV0cnkoY29tZXRfcmFkaXVzLCAyKTtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgY29sb3I6IG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyBjb21ldF9jb2xvcl9oICsgJywgMTAwJSwgMTAwJSknKSxcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmdcclxuICAgIH0pO1xyXG4gICAgdmFyIHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkoYmFzZV9nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGggKiAzKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmFzZV9nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDNdID0gYmFzZV9nZW9tZXRyeS52ZXJ0aWNlc1tpXS54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IGJhc2VfZ2VvbWV0cnkudmVydGljZXNbaV0ueTtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBiYXNlX2dlb21ldHJ5LnZlcnRpY2VzW2ldLno7XHJcbiAgICB9XHJcbiAgICB2YXIgaW5kaWNlcyA9IG5ldyBVaW50MzJBcnJheShiYXNlX2dlb21ldHJ5LmZhY2VzLmxlbmd0aCAqIDMpO1xyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBiYXNlX2dlb21ldHJ5LmZhY2VzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgIGluZGljZXNbaiAqIDNdID0gYmFzZV9nZW9tZXRyeS5mYWNlc1tqXS5hO1xyXG4gICAgICBpbmRpY2VzW2ogKiAzICsgMV0gPSBiYXNlX2dlb21ldHJ5LmZhY2VzW2pdLmI7XHJcbiAgICAgIGluZGljZXNbaiAqIDMgKyAyXSA9IGJhc2VfZ2VvbWV0cnkuZmFjZXNbal0uYztcclxuICAgIH1cclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9ucywgMykpO1xyXG4gICAgZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5keW5hbWljID0gdHJ1ZTtcclxuICAgIGdlb21ldHJ5LnNldEluZGV4KG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoaW5kaWNlcywgMSkpO1xyXG4gICAgZ2VvbWV0cnkuaW5kZXguZHluYW1pYyA9IHRydWU7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlUGxhbmV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuT2N0YWhlZHJvbkdlb21ldHJ5KDI1MCwgNCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBjb2xvcjogMHgyMjIyMjIsXHJcbiAgICAgIHNoYWRpbmc6IFRIUkVFLkZsYXRTaGFkaW5nXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY2NlbGVyYXRlQ29tZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChpc190b3VjaGVkICYmIHBsdXNfYWNjZWxlcmF0aW9uIDwgMjAwKSB7XHJcbiAgICAgIHBsdXNfYWNjZWxlcmF0aW9uICs9IDE7XHJcbiAgICB9IGVsc2UgaWYocGx1c19hY2NlbGVyYXRpb24gPiAwKSB7XHJcbiAgICAgIHBsdXNfYWNjZWxlcmF0aW9uIC09IDE7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgY29tZXQgPSBjcmVhdGVDb21tZXQoKTtcclxuICAgICAgc2NlbmUuYWRkKGNvbWV0KTtcclxuICAgICAgcGxhbmV0ID0gY3JlYXRlUGxhbmV0KCk7XHJcbiAgICAgIHNjZW5lLmFkZChwbGFuZXQpO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc19udW07IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG5ldyBNb3ZlcigpO1xyXG4gICAgICAgIHZhciBoID0gVXRpbC5nZXRSYW5kb21JbnQoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYsIGNvbWV0X2NvbG9yX2ggKyBjb2xvcl9kaWZmKTtcclxuICAgICAgICB2YXIgcyA9IFV0aWwuZ2V0UmFuZG9tSW50KDYwLCA4MCk7XHJcbiAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhVdGlsLmdldFJhbmRvbUludCgtMTAwLCAxMDApLCAwLCAwKSk7XHJcbiAgICAgICAgbW92ZXIuY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgaCArICcsICcgKyBzICsgJyUsIDcwJSknKTtcclxuICAgICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIudmVsb2NpdHkueTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnZlbG9jaXR5Lno7XHJcbiAgICAgICAgY29sb3JzW2kgKiAzICsgMF0gPSBtb3Zlci5jb2xvci5yO1xyXG4gICAgICAgIGNvbG9yc1tpICogMyArIDFdID0gbW92ZXIuY29sb3IuZztcclxuICAgICAgICBjb2xvcnNbaSAqIDMgKyAyXSA9IG1vdmVyLmNvbG9yLmI7XHJcbiAgICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICAgIH1cclxuICAgICAgcG9pbnRzLmluaXQoe1xyXG4gICAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgICB2czogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGN1c3RvbUNvbG9yO1xcclxcbmF0dHJpYnV0ZSBmbG9hdCB2ZXJ0ZXhPcGFjaXR5O1xcclxcbmF0dHJpYnV0ZSBmbG9hdCBzaXplO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2Q29sb3IgPSBjdXN0b21Db2xvcjtcXHJcXG4gIGZPcGFjaXR5ID0gdmVydGV4T3BhY2l0eTtcXHJcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxuICBnbF9Qb2ludFNpemUgPSBzaXplICogKDMwMC4wIC8gbGVuZ3RoKG12UG9zaXRpb24ueHl6KSk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIixcclxuICAgICAgICBmczogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gdmVjMyBjb2xvcjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yICogdkNvbG9yLCBmT3BhY2l0eSk7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSBnbF9GcmFnQ29sb3IgKiB0ZXh0dXJlMkQodGV4dHVyZSwgZ2xfUG9pbnRDb29yZCk7XFxyXFxufVxcclxcblwiLFxyXG4gICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICAgIGNvbG9yczogY29sb3JzLFxyXG4gICAgICAgIG9wYWNpdGllczogb3BhY2l0aWVzLFxyXG4gICAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgICB0ZXh0dXJlOiBjcmVhdGVUZXh0dXJlKCksXHJcbiAgICAgICAgYmxlbmRpbmc6IFRIUkVFLk5vcm1hbEJsZW5kaW5nXHJcbiAgICAgIH0pO1xyXG4gICAgICBwb2ludHMucmFkMSA9IDA7XHJcbiAgICAgIHBvaW50cy5yYWQxX2Jhc2UgPSAwO1xyXG4gICAgICBwb2ludHMucmFkMiA9IDA7XHJcbiAgICAgIHBvaW50cy5yYWQzID0gMDtcclxuICAgICAgaGVtaV9saWdodCA9IG5ldyBGb3JjZUhlbWlzcGhlcmVMaWdodChcclxuICAgICAgICBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgKGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmKSArICcsIDUwJSwgNjAlKScpLmdldEhleCgpLFxyXG4gICAgICAgIG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyAoY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYpICsgJywgNTAlLCA2MCUpJykuZ2V0SGV4KCksXHJcbiAgICAgICAgMVxyXG4gICAgICApO1xyXG4gICAgICBzY2VuZS5hZGQoaGVtaV9saWdodCk7XHJcbiAgICAgIGNvbWV0X2xpZ2h0MSA9IG5ldyBGb3JjZVBvaW50TGlnaHQoJ2hzbCgnICsgKGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmKSArICcsIDYwJSwgNTAlKScsIDEsIDUwMCwgMSk7XHJcbiAgICAgIHNjZW5lLmFkZChjb21ldF9saWdodDEpO1xyXG4gICAgICBjb21ldF9saWdodDIgPSBuZXcgRm9yY2VQb2ludExpZ2h0KCdoc2woJyArIChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZikgKyAnLCA2MCUsIDUwJSknLCAxLCA1MDAsIDEpO1xyXG4gICAgICBzY2VuZS5hZGQoY29tZXRfbGlnaHQyKTtcclxuICAgICAgY2FtZXJhLmFuY2hvciA9IG5ldyBUSFJFRS5WZWN0b3IzKDE1MDAsIDAsIDApO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgY29tZXQuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBjb21ldC5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShjb21ldCk7XHJcbiAgICAgIHBsYW5ldC5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBsYW5ldC5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwbGFuZXQpO1xyXG4gICAgICBwb2ludHMuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocG9pbnRzLm9iaik7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShoZW1pX2xpZ2h0KTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGNvbWV0X2xpZ2h0MSk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShjb21ldF9saWdodDIpO1xyXG4gICAgICBtb3ZlcnMgPSBbXTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgYWNjZWxlcmF0ZUNvbWV0KCk7XHJcbiAgICAgIHBvaW50cy52ZWxvY2l0eSA9IHJvdGF0ZUNvbWV0KCk7XHJcbiAgICAgIGlmICh0cmFja19wb2ludHMgPT09IHRydWUpIHtcclxuICAgICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLmNvcHkoXHJcbiAgICAgICAgICBwb2ludHMudmVsb2NpdHkuY2xvbmUoKS5hZGQoXHJcbiAgICAgICAgICAgIHBvaW50cy52ZWxvY2l0eS5jbG9uZSgpLnN1Yihwb2ludHMub2JqLnBvc2l0aW9uKS5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhcigtNDAwKVxyXG4gICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci55ICs9IHBvaW50cy52ZWxvY2l0eS55ICogMjtcclxuICAgICAgICBjYW1lcmEuZm9yY2UubG9vay5hbmNob3IuY29weShwb2ludHMudmVsb2NpdHkpO1xyXG4gICAgICB9XHJcbiAgICAgIHBvaW50cy51cGRhdGVQb2ludHMoKTtcclxuICAgICAgY29tZXQucG9zaXRpb24uY29weShwb2ludHMudmVsb2NpdHkpO1xyXG4gICAgICBoZW1pX2xpZ2h0LmNvbG9yLnNldEhTTCgoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNSkgLyAzNjAsIDAuNSwgMC42KTtcclxuICAgICAgaGVtaV9saWdodC5ncm91bmRDb2xvci5zZXRIU0woKGNvbWV0X2NvbG9yX2ggKyBjb2xvcl9kaWZmIC0gcGx1c19hY2NlbGVyYXRpb24gLyAxLjUpIC8gMzYwLCAwLjUsIDAuNik7XHJcbiAgICAgIGNvbWV0X2xpZ2h0MS5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgIGNvbWV0X2xpZ2h0MS5jb2xvci5zZXRIU0woKGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmIC0gcGx1c19hY2NlbGVyYXRpb24gLyAxLjUpIC8gMzYwLCAwLjUsIDAuNik7XHJcbiAgICAgIGNvbWV0X2xpZ2h0Mi5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgIGNvbWV0X2xpZ2h0Mi5jb2xvci5zZXRIU0woKGNvbWV0X2NvbG9yX2ggKyBjb2xvcl9kaWZmIC0gcGx1c19hY2NlbGVyYXRpb24gLyAxLjUpIC8gMzYwLCAwLjUsIDAuNik7XHJcbiAgICAgIGFjdGl2YXRlTW92ZXIoKTtcclxuICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hcHBseUhvb2soMCwgMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVMb29rKCk7XHJcbiAgICAgIHJvdGF0ZUNvbWV0Q29sb3IoKTtcclxuICAgICAgYm91bmNlQ29tZXQoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgaXNfdG91Y2hlZCA9IHRydWU7XHJcbiAgICAgIGxhc3RfdGltZV90b3VjaCA9IERhdGUubm93KCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgICBpc190b3VjaGVkID0gZmFsc2U7XHJcbiAgICAgIGlmIChEYXRlLm5vdygpIC0gbGFzdF90aW1lX3RvdWNoIDwgMTAwKSB7XHJcbiAgICAgICAgaWYgKHRyYWNrX3BvaW50cyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoMTIwMCwgMTIwMCwgMCk7XHJcbiAgICAgICAgICBjYW1lcmEuZm9yY2UubG9vay5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICAgICAgdHJhY2tfcG9pbnRzID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRyYWNrX3BvaW50cyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgdGhpcy50b3VjaEVuZChzY2VuZSwgY2FtZXJhKVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlQ2FtZXJhID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZV9jYW1lcmEnKTtcclxudmFyIEZvcmNlMiA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UyJyk7XHJcblxyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuICB2YXIgc3BoZXJlID0gbnVsbDtcclxuICB2YXIgYmcgPSBudWxsO1xyXG4gIHZhciBsaWdodCA9IG5ldyBUSFJFRS5IZW1pc3BoZXJlTGlnaHQoMHhmZmZmZmYsIDB4NjY2NjY2LCAxKTtcclxuICB2YXIgc3ViX3NjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgdmFyIHN1Yl9jYW1lcmEgPSBuZXcgRm9yY2VDYW1lcmEoNDUsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCAxLCAxMDAwMCk7XHJcbiAgdmFyIHN1Yl9saWdodCA9IG5ldyBUSFJFRS5IZW1pc3BoZXJlTGlnaHQoMHhmZmZmZmYsIDB4NjY2NjY2LCAxKTtcclxuICB2YXIgZm9yY2UgPSBuZXcgRm9yY2UyKCk7XHJcbiAgdmFyIHRpbWVfdW5pdCA9IDE7XHJcbiAgdmFyIHJlbmRlcl90YXJnZXQgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCwge1xyXG4gICAgbWFnRmlsdGVyOiBUSFJFRS5OZWFyZXN0RmlsdGVyLFxyXG4gICAgbWluRmlsdGVyOiBUSFJFRS5OZWFyZXN0RmlsdGVyLFxyXG4gICAgd3JhcFM6IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmcsXHJcbiAgICB3cmFwVDogVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZ1xyXG4gIH0pXHJcbiAgdmFyIGZyYW1lYnVmZmVyID0gbnVsbDtcclxuXHJcbiAgdmFyIGNyZWF0ZVNwaGVyZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICBnZW9tZXRyeS5mcm9tR2VvbWV0cnkobmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeSgyMDAsIDUpKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiBUSFJFRS5Vbmlmb3Jtc1V0aWxzLm1lcmdlKFtcclxuICAgICAgICBUSFJFRS5Vbmlmb3Jtc0xpYlsnbGlnaHRzJ10sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJhZGl1czoge1xyXG4gICAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICAgIHZhbHVlOiAxLjBcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBkaXN0b3J0OiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgICAgdmFsdWU6IDAuNFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgXSksXHJcbiAgICAgIHZlcnRleFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG51bmlmb3JtIGZsb2F0IHJhZGl1cztcXHJcXG51bmlmb3JtIGZsb2F0IGRpc3RvcnQ7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIHZlYzMgdk5vcm1hbDtcXHJcXG5cXHJcXG4vL1xcbi8vIERlc2NyaXB0aW9uIDogQXJyYXkgYW5kIHRleHR1cmVsZXNzIEdMU0wgMkQvM0QvNEQgc2ltcGxleFxcbi8vICAgICAgICAgICAgICAgbm9pc2UgZnVuY3Rpb25zLlxcbi8vICAgICAgQXV0aG9yIDogSWFuIE1jRXdhbiwgQXNoaW1hIEFydHMuXFxuLy8gIE1haW50YWluZXIgOiBpam1cXG4vLyAgICAgTGFzdG1vZCA6IDIwMTEwODIyIChpam0pXFxuLy8gICAgIExpY2Vuc2UgOiBDb3B5cmlnaHQgKEMpIDIwMTEgQXNoaW1hIEFydHMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXFxuLy8gICAgICAgICAgICAgICBEaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUuXFxuLy8gICAgICAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vYXNoaW1hL3dlYmdsLW5vaXNlXFxuLy9cXG5cXG52ZWMzIG1vZDI4OV8yXzAodmVjMyB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IG1vZDI4OV8yXzAodmVjNCB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IHBlcm11dGVfMl8xKHZlYzQgeCkge1xcbiAgICAgcmV0dXJuIG1vZDI4OV8yXzAoKCh4KjM0LjApKzEuMCkqeCk7XFxufVxcblxcbnZlYzQgdGF5bG9ySW52U3FydF8yXzIodmVjNCByKVxcbntcXG4gIHJldHVybiAxLjc5Mjg0MjkxNDAwMTU5IC0gMC44NTM3MzQ3MjA5NTMxNCAqIHI7XFxufVxcblxcbmZsb2F0IHNub2lzZV8yXzModmVjMyB2KVxcbiAge1xcbiAgY29uc3QgdmVjMiAgQyA9IHZlYzIoMS4wLzYuMCwgMS4wLzMuMCkgO1xcbiAgY29uc3QgdmVjNCAgRF8yXzQgPSB2ZWM0KDAuMCwgMC41LCAxLjAsIDIuMCk7XFxuXFxuLy8gRmlyc3QgY29ybmVyXFxuICB2ZWMzIGkgID0gZmxvb3IodiArIGRvdCh2LCBDLnl5eSkgKTtcXG4gIHZlYzMgeDAgPSAgIHYgLSBpICsgZG90KGksIEMueHh4KSA7XFxuXFxuLy8gT3RoZXIgY29ybmVyc1xcbiAgdmVjMyBnXzJfNSA9IHN0ZXAoeDAueXp4LCB4MC54eXopO1xcbiAgdmVjMyBsID0gMS4wIC0gZ18yXzU7XFxuICB2ZWMzIGkxID0gbWluKCBnXzJfNS54eXosIGwuenh5ICk7XFxuICB2ZWMzIGkyID0gbWF4KCBnXzJfNS54eXosIGwuenh5ICk7XFxuXFxuICAvLyAgIHgwID0geDAgLSAwLjAgKyAwLjAgKiBDLnh4eDtcXG4gIC8vICAgeDEgPSB4MCAtIGkxICArIDEuMCAqIEMueHh4O1xcbiAgLy8gICB4MiA9IHgwIC0gaTIgICsgMi4wICogQy54eHg7XFxuICAvLyAgIHgzID0geDAgLSAxLjAgKyAzLjAgKiBDLnh4eDtcXG4gIHZlYzMgeDEgPSB4MCAtIGkxICsgQy54eHg7XFxuICB2ZWMzIHgyID0geDAgLSBpMiArIEMueXl5OyAvLyAyLjAqQy54ID0gMS8zID0gQy55XFxuICB2ZWMzIHgzID0geDAgLSBEXzJfNC55eXk7ICAgICAgLy8gLTEuMCszLjAqQy54ID0gLTAuNSA9IC1ELnlcXG5cXG4vLyBQZXJtdXRhdGlvbnNcXG4gIGkgPSBtb2QyODlfMl8wKGkpO1xcbiAgdmVjNCBwID0gcGVybXV0ZV8yXzEoIHBlcm11dGVfMl8xKCBwZXJtdXRlXzJfMShcXG4gICAgICAgICAgICAgaS56ICsgdmVjNCgwLjAsIGkxLnosIGkyLnosIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnkgKyB2ZWM0KDAuMCwgaTEueSwgaTIueSwgMS4wICkpXFxuICAgICAgICAgICArIGkueCArIHZlYzQoMC4wLCBpMS54LCBpMi54LCAxLjAgKSk7XFxuXFxuLy8gR3JhZGllbnRzOiA3eDcgcG9pbnRzIG92ZXIgYSBzcXVhcmUsIG1hcHBlZCBvbnRvIGFuIG9jdGFoZWRyb24uXFxuLy8gVGhlIHJpbmcgc2l6ZSAxNyoxNyA9IDI4OSBpcyBjbG9zZSB0byBhIG11bHRpcGxlIG9mIDQ5ICg0OSo2ID0gMjk0KVxcbiAgZmxvYXQgbl8gPSAwLjE0Mjg1NzE0Mjg1NzsgLy8gMS4wLzcuMFxcbiAgdmVjMyAgbnMgPSBuXyAqIERfMl80Lnd5eiAtIERfMl80Lnh6eDtcXG5cXG4gIHZlYzQgaiA9IHAgLSA0OS4wICogZmxvb3IocCAqIG5zLnogKiBucy56KTsgIC8vICBtb2QocCw3KjcpXFxuXFxuICB2ZWM0IHhfID0gZmxvb3IoaiAqIG5zLnopO1xcbiAgdmVjNCB5XyA9IGZsb29yKGogLSA3LjAgKiB4XyApOyAgICAvLyBtb2QoaixOKVxcblxcbiAgdmVjNCB4ID0geF8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCB5ID0geV8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCBoID0gMS4wIC0gYWJzKHgpIC0gYWJzKHkpO1xcblxcbiAgdmVjNCBiMCA9IHZlYzQoIHgueHksIHkueHkgKTtcXG4gIHZlYzQgYjEgPSB2ZWM0KCB4Lnp3LCB5Lnp3ICk7XFxuXFxuICAvL3ZlYzQgczAgPSB2ZWM0KGxlc3NUaGFuKGIwLDAuMCkpKjIuMCAtIDEuMDtcXG4gIC8vdmVjNCBzMSA9IHZlYzQobGVzc1RoYW4oYjEsMC4wKSkqMi4wIC0gMS4wO1xcbiAgdmVjNCBzMCA9IGZsb29yKGIwKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHMxID0gZmxvb3IoYjEpKjIuMCArIDEuMDtcXG4gIHZlYzQgc2ggPSAtc3RlcChoLCB2ZWM0KDAuMCkpO1xcblxcbiAgdmVjNCBhMCA9IGIwLnh6eXcgKyBzMC54enl3KnNoLnh4eXkgO1xcbiAgdmVjNCBhMV8yXzYgPSBiMS54enl3ICsgczEueHp5dypzaC56end3IDtcXG5cXG4gIHZlYzMgcDBfMl83ID0gdmVjMyhhMC54eSxoLngpO1xcbiAgdmVjMyBwMSA9IHZlYzMoYTAuencsaC55KTtcXG4gIHZlYzMgcDIgPSB2ZWMzKGExXzJfNi54eSxoLnopO1xcbiAgdmVjMyBwMyA9IHZlYzMoYTFfMl82Lnp3LGgudyk7XFxuXFxuLy9Ob3JtYWxpc2UgZ3JhZGllbnRzXFxuICB2ZWM0IG5vcm0gPSB0YXlsb3JJbnZTcXJ0XzJfMih2ZWM0KGRvdChwMF8yXzcscDBfMl83KSwgZG90KHAxLHAxKSwgZG90KHAyLCBwMiksIGRvdChwMyxwMykpKTtcXG4gIHAwXzJfNyAqPSBub3JtLng7XFxuICBwMSAqPSBub3JtLnk7XFxuICBwMiAqPSBub3JtLno7XFxuICBwMyAqPSBub3JtLnc7XFxuXFxuLy8gTWl4IGZpbmFsIG5vaXNlIHZhbHVlXFxuICB2ZWM0IG0gPSBtYXgoMC42IC0gdmVjNChkb3QoeDAseDApLCBkb3QoeDEseDEpLCBkb3QoeDIseDIpLCBkb3QoeDMseDMpKSwgMC4wKTtcXG4gIG0gPSBtICogbTtcXG4gIHJldHVybiA0Mi4wICogZG90KCBtKm0sIHZlYzQoIGRvdChwMF8yXzcseDApLCBkb3QocDEseDEpLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90KHAyLHgyKSwgZG90KHAzLHgzKSApICk7XFxuICB9XFxuXFxuXFxuXFxudmVjMyBoc3YycmdiXzFfOCh2ZWMzIGMpe1xcclxcbiAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xcclxcbiAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xcclxcbiAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XFxyXFxufVxcclxcblxcblxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGZsb2F0IHVwZGF0ZVRpbWUgPSB0aW1lIC8gMTAwMC4wO1xcclxcbiAgZmxvYXQgbm9pc2UgPSBzbm9pc2VfMl8zKHZlYzMocG9zaXRpb24gLyA0MDAuMSArIHVwZGF0ZVRpbWUgKiA1LjApKTtcXHJcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24gKiAobm9pc2UgKiBwb3coZGlzdG9ydCwgMi4wKSArIHJhZGl1cyksIDEuMCk7XFxyXFxuXFxyXFxuICB2Q29sb3IgPSBoc3YycmdiXzFfOCh2ZWMzKG5vaXNlICogZGlzdG9ydCAqIDAuMyArIHVwZGF0ZVRpbWUsIDAuMiwgMS4wKSk7XFxyXFxuICB2Tm9ybWFsID0gbm9ybWFsO1xcclxcblxcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIHZlYzMgdk5vcm1hbDtcXHJcXG5cXHJcXG4vL1xcbi8vIERlc2NyaXB0aW9uIDogQXJyYXkgYW5kIHRleHR1cmVsZXNzIEdMU0wgMkQvM0QvNEQgc2ltcGxleFxcbi8vICAgICAgICAgICAgICAgbm9pc2UgZnVuY3Rpb25zLlxcbi8vICAgICAgQXV0aG9yIDogSWFuIE1jRXdhbiwgQXNoaW1hIEFydHMuXFxuLy8gIE1haW50YWluZXIgOiBpam1cXG4vLyAgICAgTGFzdG1vZCA6IDIwMTEwODIyIChpam0pXFxuLy8gICAgIExpY2Vuc2UgOiBDb3B5cmlnaHQgKEMpIDIwMTEgQXNoaW1hIEFydHMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXFxuLy8gICAgICAgICAgICAgICBEaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUuXFxuLy8gICAgICAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vYXNoaW1hL3dlYmdsLW5vaXNlXFxuLy9cXG5cXG52ZWMzIG1vZDI4OV8yXzAodmVjMyB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IG1vZDI4OV8yXzAodmVjNCB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IHBlcm11dGVfMl8xKHZlYzQgeCkge1xcbiAgICAgcmV0dXJuIG1vZDI4OV8yXzAoKCh4KjM0LjApKzEuMCkqeCk7XFxufVxcblxcbnZlYzQgdGF5bG9ySW52U3FydF8yXzIodmVjNCByKVxcbntcXG4gIHJldHVybiAxLjc5Mjg0MjkxNDAwMTU5IC0gMC44NTM3MzQ3MjA5NTMxNCAqIHI7XFxufVxcblxcbmZsb2F0IHNub2lzZV8yXzModmVjMyB2KVxcbiAge1xcbiAgY29uc3QgdmVjMiAgQyA9IHZlYzIoMS4wLzYuMCwgMS4wLzMuMCkgO1xcbiAgY29uc3QgdmVjNCAgRF8yXzQgPSB2ZWM0KDAuMCwgMC41LCAxLjAsIDIuMCk7XFxuXFxuLy8gRmlyc3QgY29ybmVyXFxuICB2ZWMzIGkgID0gZmxvb3IodiArIGRvdCh2LCBDLnl5eSkgKTtcXG4gIHZlYzMgeDAgPSAgIHYgLSBpICsgZG90KGksIEMueHh4KSA7XFxuXFxuLy8gT3RoZXIgY29ybmVyc1xcbiAgdmVjMyBnXzJfNSA9IHN0ZXAoeDAueXp4LCB4MC54eXopO1xcbiAgdmVjMyBsID0gMS4wIC0gZ18yXzU7XFxuICB2ZWMzIGkxID0gbWluKCBnXzJfNS54eXosIGwuenh5ICk7XFxuICB2ZWMzIGkyID0gbWF4KCBnXzJfNS54eXosIGwuenh5ICk7XFxuXFxuICAvLyAgIHgwID0geDAgLSAwLjAgKyAwLjAgKiBDLnh4eDtcXG4gIC8vICAgeDEgPSB4MCAtIGkxICArIDEuMCAqIEMueHh4O1xcbiAgLy8gICB4MiA9IHgwIC0gaTIgICsgMi4wICogQy54eHg7XFxuICAvLyAgIHgzID0geDAgLSAxLjAgKyAzLjAgKiBDLnh4eDtcXG4gIHZlYzMgeDEgPSB4MCAtIGkxICsgQy54eHg7XFxuICB2ZWMzIHgyID0geDAgLSBpMiArIEMueXl5OyAvLyAyLjAqQy54ID0gMS8zID0gQy55XFxuICB2ZWMzIHgzID0geDAgLSBEXzJfNC55eXk7ICAgICAgLy8gLTEuMCszLjAqQy54ID0gLTAuNSA9IC1ELnlcXG5cXG4vLyBQZXJtdXRhdGlvbnNcXG4gIGkgPSBtb2QyODlfMl8wKGkpO1xcbiAgdmVjNCBwID0gcGVybXV0ZV8yXzEoIHBlcm11dGVfMl8xKCBwZXJtdXRlXzJfMShcXG4gICAgICAgICAgICAgaS56ICsgdmVjNCgwLjAsIGkxLnosIGkyLnosIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnkgKyB2ZWM0KDAuMCwgaTEueSwgaTIueSwgMS4wICkpXFxuICAgICAgICAgICArIGkueCArIHZlYzQoMC4wLCBpMS54LCBpMi54LCAxLjAgKSk7XFxuXFxuLy8gR3JhZGllbnRzOiA3eDcgcG9pbnRzIG92ZXIgYSBzcXVhcmUsIG1hcHBlZCBvbnRvIGFuIG9jdGFoZWRyb24uXFxuLy8gVGhlIHJpbmcgc2l6ZSAxNyoxNyA9IDI4OSBpcyBjbG9zZSB0byBhIG11bHRpcGxlIG9mIDQ5ICg0OSo2ID0gMjk0KVxcbiAgZmxvYXQgbl8gPSAwLjE0Mjg1NzE0Mjg1NzsgLy8gMS4wLzcuMFxcbiAgdmVjMyAgbnMgPSBuXyAqIERfMl80Lnd5eiAtIERfMl80Lnh6eDtcXG5cXG4gIHZlYzQgaiA9IHAgLSA0OS4wICogZmxvb3IocCAqIG5zLnogKiBucy56KTsgIC8vICBtb2QocCw3KjcpXFxuXFxuICB2ZWM0IHhfID0gZmxvb3IoaiAqIG5zLnopO1xcbiAgdmVjNCB5XyA9IGZsb29yKGogLSA3LjAgKiB4XyApOyAgICAvLyBtb2QoaixOKVxcblxcbiAgdmVjNCB4ID0geF8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCB5ID0geV8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCBoID0gMS4wIC0gYWJzKHgpIC0gYWJzKHkpO1xcblxcbiAgdmVjNCBiMCA9IHZlYzQoIHgueHksIHkueHkgKTtcXG4gIHZlYzQgYjEgPSB2ZWM0KCB4Lnp3LCB5Lnp3ICk7XFxuXFxuICAvL3ZlYzQgczAgPSB2ZWM0KGxlc3NUaGFuKGIwLDAuMCkpKjIuMCAtIDEuMDtcXG4gIC8vdmVjNCBzMSA9IHZlYzQobGVzc1RoYW4oYjEsMC4wKSkqMi4wIC0gMS4wO1xcbiAgdmVjNCBzMCA9IGZsb29yKGIwKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHMxID0gZmxvb3IoYjEpKjIuMCArIDEuMDtcXG4gIHZlYzQgc2ggPSAtc3RlcChoLCB2ZWM0KDAuMCkpO1xcblxcbiAgdmVjNCBhMCA9IGIwLnh6eXcgKyBzMC54enl3KnNoLnh4eXkgO1xcbiAgdmVjNCBhMV8yXzYgPSBiMS54enl3ICsgczEueHp5dypzaC56end3IDtcXG5cXG4gIHZlYzMgcDBfMl83ID0gdmVjMyhhMC54eSxoLngpO1xcbiAgdmVjMyBwMSA9IHZlYzMoYTAuencsaC55KTtcXG4gIHZlYzMgcDIgPSB2ZWMzKGExXzJfNi54eSxoLnopO1xcbiAgdmVjMyBwMyA9IHZlYzMoYTFfMl82Lnp3LGgudyk7XFxuXFxuLy9Ob3JtYWxpc2UgZ3JhZGllbnRzXFxuICB2ZWM0IG5vcm0gPSB0YXlsb3JJbnZTcXJ0XzJfMih2ZWM0KGRvdChwMF8yXzcscDBfMl83KSwgZG90KHAxLHAxKSwgZG90KHAyLCBwMiksIGRvdChwMyxwMykpKTtcXG4gIHAwXzJfNyAqPSBub3JtLng7XFxuICBwMSAqPSBub3JtLnk7XFxuICBwMiAqPSBub3JtLno7XFxuICBwMyAqPSBub3JtLnc7XFxuXFxuLy8gTWl4IGZpbmFsIG5vaXNlIHZhbHVlXFxuICB2ZWM0IG0gPSBtYXgoMC42IC0gdmVjNChkb3QoeDAseDApLCBkb3QoeDEseDEpLCBkb3QoeDIseDIpLCBkb3QoeDMseDMpKSwgMC4wKTtcXG4gIG0gPSBtICogbTtcXG4gIHJldHVybiA0Mi4wICogZG90KCBtKm0sIHZlYzQoIGRvdChwMF8yXzcseDApLCBkb3QocDEseDEpLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90KHAyLHgyKSwgZG90KHAzLHgzKSApICk7XFxuICB9XFxuXFxuXFxuXFxudmVjMyBoc3YycmdiXzFfOCh2ZWMzIGMpe1xcclxcbiAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xcclxcbiAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xcclxcbiAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XFxyXFxufVxcclxcblxcblxcblxcclxcbnN0cnVjdCBIZW1pc3BoZXJlTGlnaHQge1xcclxcbiAgdmVjMyBkaXJlY3Rpb247XFxyXFxuICB2ZWMzIGdyb3VuZENvbG9yO1xcclxcbiAgdmVjMyBza3lDb2xvcjtcXHJcXG59O1xcclxcbnVuaWZvcm0gSGVtaXNwaGVyZUxpZ2h0IGhlbWlzcGhlcmVMaWdodHNbTlVNX0hFTUlfTElHSFRTXTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2ZWMzIGxpZ2h0ID0gdmVjMygwLjApO1xcclxcbiAgbGlnaHQgKz0gKGRvdChoZW1pc3BoZXJlTGlnaHRzWzBdLmRpcmVjdGlvbiwgdk5vcm1hbCkgKyAxLjApICogaGVtaXNwaGVyZUxpZ2h0c1swXS5za3lDb2xvciAqIDAuNTtcXHJcXG4gIGxpZ2h0ICs9ICgtZG90KGhlbWlzcGhlcmVMaWdodHNbMF0uZGlyZWN0aW9uLCB2Tm9ybWFsKSArIDEuMCkgKiBoZW1pc3BoZXJlTGlnaHRzWzBdLmdyb3VuZENvbG9yICogMC41O1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCh2Q29sb3IgKiBsaWdodCwgMS4wKTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIGxpZ2h0czogdHJ1ZSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZUJhY2tncm91bmQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgxODAwKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlUGxhbmVGb3JQb3N0UHJvY2VzcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5X2Jhc2UgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgyLCAyKTtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgZ2VvbWV0cnkuZnJvbUdlb21ldHJ5KGdlb21ldHJ5X2Jhc2UpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICB0aW1lOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc29sdXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICd2MicsXHJcbiAgICAgICAgICB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFjY2VsZXJhdGlvbjoge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRleHR1cmU6IHtcclxuICAgICAgICAgIHR5cGU6ICd0JyxcclxuICAgICAgICAgIHZhbHVlOiByZW5kZXJfdGFyZ2V0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgdmVjMiB2VXY7XFxyXFxuXFxyXFxudm9pZCBtYWluKHZvaWQpIHtcXHJcXG4gIHZVdiA9IHV2O1xcclxcbiAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbn1cXHJcXG5cIixcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxyXFxudW5pZm9ybSB2ZWMyIHJlc29sdXRpb247XFxyXFxudW5pZm9ybSBmbG9hdCBhY2NlbGVyYXRpb247XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXHJcXG5cXHJcXG5jb25zdCBmbG9hdCBibHVyID0gMTYuMDtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbmZsb2F0IHJhbmRvbTJfMV8wKHZlYzIgYyl7XFxyXFxuICAgIHJldHVybiBmcmFjdChzaW4oZG90KGMueHkgLHZlYzIoMTIuOTg5OCw3OC4yMzMpKSkgKiA0Mzc1OC41NDUzKTtcXHJcXG59XFxyXFxuXFxuXFxuLy9cXG4vLyBEZXNjcmlwdGlvbiA6IEFycmF5IGFuZCB0ZXh0dXJlbGVzcyBHTFNMIDJEIHNpbXBsZXggbm9pc2UgZnVuY3Rpb24uXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzJfMSh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzIgbW9kMjg5XzJfMSh2ZWMyIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzMgcGVybXV0ZV8yXzIodmVjMyB4KSB7XFxuICByZXR1cm4gbW9kMjg5XzJfMSgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzJfMyh2ZWMyIHYpXFxuICB7XFxuICBjb25zdCB2ZWM0IEMgPSB2ZWM0KDAuMjExMzI0ODY1NDA1MTg3LCAgLy8gKDMuMC1zcXJ0KDMuMCkpLzYuMFxcbiAgICAgICAgICAgICAgICAgICAgICAwLjM2NjAyNTQwMzc4NDQzOSwgIC8vIDAuNSooc3FydCgzLjApLTEuMClcXG4gICAgICAgICAgICAgICAgICAgICAtMC41NzczNTAyNjkxODk2MjYsICAvLyAtMS4wICsgMi4wICogQy54XFxuICAgICAgICAgICAgICAgICAgICAgIDAuMDI0MzkwMjQzOTAyNDM5KTsgLy8gMS4wIC8gNDEuMFxcbi8vIEZpcnN0IGNvcm5lclxcbiAgdmVjMiBpICA9IGZsb29yKHYgKyBkb3QodiwgQy55eSkgKTtcXG4gIHZlYzIgeDAgPSB2IC0gICBpICsgZG90KGksIEMueHgpO1xcblxcbi8vIE90aGVyIGNvcm5lcnNcXG4gIHZlYzIgaTE7XFxuICAvL2kxLnggPSBzdGVwKCB4MC55LCB4MC54ICk7IC8vIHgwLnggPiB4MC55ID8gMS4wIDogMC4wXFxuICAvL2kxLnkgPSAxLjAgLSBpMS54O1xcbiAgaTEgPSAoeDAueCA+IHgwLnkpID8gdmVjMigxLjAsIDAuMCkgOiB2ZWMyKDAuMCwgMS4wKTtcXG4gIC8vIHgwID0geDAgLSAwLjAgKyAwLjAgKiBDLnh4IDtcXG4gIC8vIHgxID0geDAgLSBpMSArIDEuMCAqIEMueHggO1xcbiAgLy8geDIgPSB4MCAtIDEuMCArIDIuMCAqIEMueHggO1xcbiAgdmVjNCB4MTIgPSB4MC54eXh5ICsgQy54eHp6O1xcbiAgeDEyLnh5IC09IGkxO1xcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV8yXzEoaSk7IC8vIEF2b2lkIHRydW5jYXRpb24gZWZmZWN0cyBpbiBwZXJtdXRhdGlvblxcbiAgdmVjMyBwID0gcGVybXV0ZV8yXzIoIHBlcm11dGVfMl8yKCBpLnkgKyB2ZWMzKDAuMCwgaTEueSwgMS4wICkpXFxuICAgICsgaS54ICsgdmVjMygwLjAsIGkxLngsIDEuMCApKTtcXG5cXG4gIHZlYzMgbSA9IG1heCgwLjUgLSB2ZWMzKGRvdCh4MCx4MCksIGRvdCh4MTIueHkseDEyLnh5KSwgZG90KHgxMi56dyx4MTIuencpKSwgMC4wKTtcXG4gIG0gPSBtKm0gO1xcbiAgbSA9IG0qbSA7XFxuXFxuLy8gR3JhZGllbnRzOiA0MSBwb2ludHMgdW5pZm9ybWx5IG92ZXIgYSBsaW5lLCBtYXBwZWQgb250byBhIGRpYW1vbmQuXFxuLy8gVGhlIHJpbmcgc2l6ZSAxNyoxNyA9IDI4OSBpcyBjbG9zZSB0byBhIG11bHRpcGxlIG9mIDQxICg0MSo3ID0gMjg3KVxcblxcbiAgdmVjMyB4ID0gMi4wICogZnJhY3QocCAqIEMud3d3KSAtIDEuMDtcXG4gIHZlYzMgaCA9IGFicyh4KSAtIDAuNTtcXG4gIHZlYzMgb3ggPSBmbG9vcih4ICsgMC41KTtcXG4gIHZlYzMgYTAgPSB4IC0gb3g7XFxuXFxuLy8gTm9ybWFsaXNlIGdyYWRpZW50cyBpbXBsaWNpdGx5IGJ5IHNjYWxpbmcgbVxcbi8vIEFwcHJveGltYXRpb24gb2Y6IG0gKj0gaW52ZXJzZXNxcnQoIGEwKmEwICsgaCpoICk7XFxuICBtICo9IDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogKCBhMCphMCArIGgqaCApO1xcblxcbi8vIENvbXB1dGUgZmluYWwgbm9pc2UgdmFsdWUgYXQgUFxcbiAgdmVjMyBnO1xcbiAgZy54ICA9IGEwLnggICogeDAueCAgKyBoLnggICogeDAueTtcXG4gIGcueXogPSBhMC55eiAqIHgxMi54eiArIGgueXogKiB4MTIueXc7XFxuICByZXR1cm4gMTMwLjAgKiBkb3QobSwgZyk7XFxufVxcblxcblxcblxcblxcclxcbnZlYzIgZGlmZlV2KGZsb2F0IHYsIGZsb2F0IGRpZmYpIHtcXHJcXG4gIHJldHVybiB2VXYgKyAodmVjMih2ICsgc25vaXNlXzJfMyh2ZWMyKGdsX0ZyYWdDb29yZC55ICsgdGltZSkgLyAxMDAuMCksIDAuMCkgKiBkaWZmICsgdmVjMih2ICogMy4wLCAwLjApKSAvIHJlc29sdXRpb247XFxyXFxufVxcclxcblxcclxcbmZsb2F0IHJhbmRvbU5vaXNlKHZlYzIgcCkge1xcclxcbiAgcmV0dXJuIChyYW5kb20yXzFfMChwIC0gdmVjMihzaW4odGltZSkpKSAqIDIuMCAtIDEuMCkgKiBtYXgobGVuZ3RoKGFjY2VsZXJhdGlvbiksIDAuMDgpO1xcclxcbn1cXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBmbG9hdCBkaWZmID0gMzAwLjAgKiBsZW5ndGgoYWNjZWxlcmF0aW9uKTtcXHJcXG4gIHZlYzIgdXZfciA9IGRpZmZVdigwLjAsIGRpZmYpO1xcclxcbiAgdmVjMiB1dl9nID0gZGlmZlV2KDEuMCwgZGlmZik7XFxyXFxuICB2ZWMyIHV2X2IgPSBkaWZmVXYoLTEuMCwgZGlmZik7XFxyXFxuICBmbG9hdCByID0gdGV4dHVyZTJEKHRleHR1cmUsIHV2X3IpLnIgKyByYW5kb21Ob2lzZSh1dl9yKTtcXHJcXG4gIGZsb2F0IGcgPSB0ZXh0dXJlMkQodGV4dHVyZSwgdXZfZykuZyArIHJhbmRvbU5vaXNlKHV2X2cpO1xcclxcbiAgZmxvYXQgYiA9IHRleHR1cmUyRCh0ZXh0dXJlLCB1dl9iKS5iICsgcmFuZG9tTm9pc2UodXZfYik7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHIsIGcsIGIsIDEuMCk7XFxyXFxufVxcclxcblwiLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJ2JnLXdoaXRlJztcclxuICAgICAgc3BoZXJlID0gY3JlYXRlU3BoZXJlKCk7XHJcbiAgICAgIHN1Yl9zY2VuZS5hZGQoc3BoZXJlKTtcclxuICAgICAgYmcgPSBjcmVhdGVCYWNrZ3JvdW5kKCk7XHJcbiAgICAgIHN1Yl9zY2VuZS5hZGQoYmcpO1xyXG4gICAgICBzdWJfc2NlbmUuYWRkKHN1Yl9saWdodCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgxODAwLCAxODAwLCAwKTtcclxuICAgICAgc3ViX2NhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcblxyXG4gICAgICBmcmFtZWJ1ZmZlciA9IGNyZWF0ZVBsYW5lRm9yUG9zdFByb2Nlc3MoKTtcclxuICAgICAgc2NlbmUuYWRkKGZyYW1lYnVmZmVyKTtcclxuICAgICAgc2NlbmUuYWRkKGxpZ2h0KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoMTgwMCwgMTgwMCwgMCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMSwgMCk7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMSwgMCk7XHJcbiAgICAgIGZvcmNlLnZlbG9jaXR5LnNldCgxLCAwKTtcclxuICAgICAgZm9yY2UuayA9IDAuMDQ1O1xyXG4gICAgICBmb3JjZS5kID0gMC4xNjtcclxuXHJcbiAgICAgIHRoaXMucmVzaXplV2luZG93KCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICcnO1xyXG4gICAgICBzcGhlcmUuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBzcGhlcmUubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzdWJfc2NlbmUucmVtb3ZlKHNwaGVyZSk7XHJcbiAgICAgIGJnLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgYmcubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzdWJfc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgICAgc3ViX3NjZW5lLnJlbW92ZShzdWJfbGlnaHQpO1xyXG4gICAgICBmcmFtZWJ1ZmZlci5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGZyYW1lYnVmZmVyKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGxpZ2h0KTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKSB7XHJcbiAgICAgIGZvcmNlLmFwcGx5SG9vaygwLCBmb3JjZS5rKTtcclxuICAgICAgZm9yY2UuYXBwbHlEcmFnKGZvcmNlLmQpO1xyXG4gICAgICBmb3JjZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICAvLyBjb25zb2xlLmxvZyhmb3JjZS5hY2NlbGVyYXRpb24ubGVuZ3RoKCkpO1xyXG4gICAgICBzcGhlcmUubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSArPSB0aW1lX3VuaXQ7XHJcbiAgICAgIHNwaGVyZS5tYXRlcmlhbC51bmlmb3Jtcy5yYWRpdXMudmFsdWUgPSBmb3JjZS52ZWxvY2l0eS54O1xyXG4gICAgICBzcGhlcmUubWF0ZXJpYWwudW5pZm9ybXMuZGlzdG9ydC52YWx1ZSA9IGZvcmNlLnZlbG9jaXR5LnggLyAyIC0gMC4xO1xyXG4gICAgICBzdWJfY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIHN1Yl9jYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIHN1Yl9jYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgc3ViX2NhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBzdWJfY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIHN1Yl9jYW1lcmEuZm9yY2UubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgc3ViX2NhbWVyYS5mb3JjZS5sb29rLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEudXBkYXRlTG9vaygpO1xyXG5cclxuICAgICAgZnJhbWVidWZmZXIubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSArPSB0aW1lX3VuaXQ7XHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLnVuaWZvcm1zLmFjY2VsZXJhdGlvbi52YWx1ZSA9IGZvcmNlLmFjY2VsZXJhdGlvbi5sZW5ndGgoKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hcHBseUhvb2soMCwgMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS5sb29rQXQoY2FtZXJhLmZvcmNlLmxvb2sudmVsb2NpdHkpO1xyXG5cclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHN1Yl9zY2VuZSwgc3ViX2NhbWVyYSwgcmVuZGVyX3RhcmdldCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIGlmIChmb3JjZS5hbmNob3IueCA8IDMpIHtcclxuICAgICAgICBmb3JjZS5rICs9IDAuMDA1O1xyXG4gICAgICAgIGZvcmNlLmQgLT0gMC4wMjtcclxuICAgICAgICBmb3JjZS5hbmNob3IueCArPSAwLjg7XHJcbiAgICAgICAgdGltZV91bml0ICs9IDAuNDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3JjZS5rID0gMC4wNTtcclxuICAgICAgICBmb3JjZS5kID0gMC4xNjtcclxuICAgICAgICBmb3JjZS5hbmNob3IueCA9IDEuMDtcclxuICAgICAgICB0aW1lX3VuaXQgPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIGlzX3RvdWNoZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpIHtcclxuICAgICAgaXNfdG91Y2hlZCA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIG1vdXNlT3V0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHRoaXMudG91Y2hFbmQoc2NlbmUsIGNhbWVyYSlcclxuICAgIH0sXHJcbiAgICByZXNpemVXaW5kb3c6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcmVuZGVyX3RhcmdldC5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgICBzdWJfY2FtZXJhLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgICAgZnJhbWVidWZmZXIubWF0ZXJpYWwudW5pZm9ybXMucmVzb2x1dGlvbi52YWx1ZS5zZXQod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcbnZhciBQb2ludHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50cy5qcycpO1xyXG52YXIgRm9yY2VQb2ludExpZ2h0ID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZV9wb2ludF9saWdodCcpO1xyXG5cclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEpO1xyXG4gIH07XHJcbiAgdmFyIG1vdmVyc19udW0gPSAxMDAwMDtcclxuICB2YXIgbW92ZXJzID0gW107XHJcbiAgdmFyIHBvaW50cyA9IG5ldyBQb2ludHMoKTtcclxuICB2YXIgbGlnaHQgPSBuZXcgRm9yY2VQb2ludExpZ2h0KDB4ZmY2NjAwLCAxLCAxODAwLCAxKTtcclxuICB2YXIgYmcgPSBudWxsO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIHNpemVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgZ3Jhdml0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAuMSwgMCk7XHJcbiAgdmFyIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGlzX2RyYWdlZCA9IGZhbHNlO1xyXG5cclxuICB2YXIgdXBkYXRlTW92ZXIgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIHtcclxuICAgICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlGb3JjZShncmF2aXR5KTtcclxuICAgICAgICBtb3Zlci5hcHBseURyYWcoMC4wMSk7XHJcbiAgICAgICAgbW92ZXIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgICBpZiAobW92ZXIudGltZSA+IDUwKSB7XHJcbiAgICAgICAgICBtb3Zlci5zaXplIC09IDAuNztcclxuICAgICAgICAgIG1vdmVyLmEgLT0gMC4wMDk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtb3Zlci5hIDw9IDApIHtcclxuICAgICAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xyXG4gICAgICAgICAgbW92ZXIudGltZSA9IDA7XHJcbiAgICAgICAgICBtb3Zlci5hID0gMC4wO1xyXG4gICAgICAgICAgbW92ZXIuaW5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnZlbG9jaXR5LnggLSBwb2ludHMudmVsb2NpdHkueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci52ZWxvY2l0eS55IC0gcG9pbnRzLnZlbG9jaXR5Lnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIudmVsb2NpdHkueiAtIHBvaW50cy52ZWxvY2l0eS56O1xyXG4gICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICB9XHJcbiAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGFjdGl2YXRlTW92ZXIgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gMTApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZDEgPSBVdGlsLmdldFJhZGlhbihNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgwLCAyNTYpKSAvIE1hdGgubG9nKDI1NikgKiAyNjApO1xyXG4gICAgICAgIHZhciByYWQyID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgICAgdmFyIHJhbmdlID0gKDEtIE1hdGgubG9nKFV0aWwuZ2V0UmFuZG9tSW50KDMyLCAyNTYpKSAvIE1hdGgubG9nKDI1NikpICogMTI7XHJcbiAgICAgICAgdmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICAgICAgdmFyIGZvcmNlID0gVXRpbC5nZXRQb2xhckNvb3JkKHJhZDEsIHJhZDIsIHJhbmdlKTtcclxuICAgICAgICB2ZWN0b3IuYWRkKHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgICAgbW92ZXIuYWN0aXZhdGUoKTtcclxuICAgICAgICBtb3Zlci5pbml0KHZlY3Rvcik7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgICAgICAgbW92ZXIuYSA9IDAuMjtcclxuICAgICAgICBtb3Zlci5zaXplID0gTWF0aC5wb3coMTIgLSByYW5nZSwgMikgKiBVdGlsLmdldFJhbmRvbUludCgxLCAyNCkgLyAxMDtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgIGlmIChjb3VudCA+PSA2KSBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciB1cGRhdGVQb2ludHMgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICBwb2ludHMudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgIGxpZ2h0Lm9iai5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIG1vdmVQb2ludHMgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHZhciB5ID0gdmVjdG9yLnkgKiB3aW5kb3cuaW5uZXJIZWlnaHQgLyAzO1xyXG4gICAgdmFyIHogPSB2ZWN0b3IueCAqIHdpbmRvdy5pbm5lcldpZHRoIC8gLTM7XHJcbiAgICBwb2ludHMuYW5jaG9yLnkgPSB5O1xyXG4gICAgcG9pbnRzLmFuY2hvci56ID0gejtcclxuICAgIGxpZ2h0LmZvcmNlLmFuY2hvci55ID0geTtcclxuICAgIGxpZ2h0LmZvcmNlLmFuY2hvci56ID0gejtcclxuICB9XHJcblxyXG4gIHZhciBjcmVhdGVUZXh0dXJlID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgdmFyIGdyYWQgPSBudWxsO1xyXG4gICAgdmFyIHRleHR1cmUgPSBudWxsO1xyXG5cclxuICAgIGNhbnZhcy53aWR0aCA9IDIwMDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSAyMDA7XHJcbiAgICBncmFkID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KDEwMCwgMTAwLCAyMCwgMTAwLCAxMDAsIDEwMCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjIsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjUsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEuMCwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMCknKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xyXG4gICAgY3R4LmFyYygxMDAsIDEwMCwgMTAwLCAwLCBNYXRoLlBJIC8gMTgwLCB0cnVlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVCYWNrZ3JvdW5kID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeSgxNTAwLCAzKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIGNvbG9yOiAweGZmZmZmZixcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmcsXHJcbiAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzX251bTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XHJcbiAgICAgICAgdmFyIGggPSBVdGlsLmdldFJhbmRvbUludCgwLCA0NSk7XHJcbiAgICAgICAgdmFyIHMgPSBVdGlsLmdldFJhbmRvbUludCg2MCwgOTApO1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyBoICsgJywgJyArIHMgKyAnJSwgNTAlKScpO1xyXG5cclxuICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKFV0aWwuZ2V0UmFuZG9tSW50KC0xMDAsIDEwMCksIDAsIDApKTtcclxuICAgICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIudmVsb2NpdHkueTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnZlbG9jaXR5Lno7XHJcbiAgICAgICAgY29sb3IudG9BcnJheShjb2xvcnMsIGkgKiAzKTtcclxuICAgICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgICAgfVxyXG4gICAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgICAgc2NlbmU6IHNjZW5lLFxyXG4gICAgICAgIHZzOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgY3VzdG9tQ29sb3I7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHZlcnRleE9wYWNpdHk7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHNpemU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZDb2xvciA9IGN1c3RvbUNvbG9yO1xcclxcbiAgZk9wYWNpdHkgPSB2ZXJ0ZXhPcGFjaXR5O1xcclxcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG4gIGdsX1BvaW50U2l6ZSA9IHNpemUgKiAoMzAwLjAgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiLFxyXG4gICAgICAgIGZzOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXHJcbiAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgICAgc2l6ZXM6IHNpemVzLFxyXG4gICAgICAgIHRleHR1cmU6IGNyZWF0ZVRleHR1cmUoKSxcclxuICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xyXG4gICAgICB9KTtcclxuICAgICAgc2NlbmUuYWRkKGxpZ2h0KTtcclxuICAgICAgYmcgPSBjcmVhdGVCYWNrZ3JvdW5kKCk7XHJcbiAgICAgIHNjZW5lLmFkZChiZyk7XHJcbiAgICAgIGNhbWVyYS5zZXRQb2xhckNvb3JkKFV0aWwuZ2V0UmFkaWFuKDI1KSwgMCwgMTAwMCk7XHJcbiAgICAgIGxpZ2h0LnNldFBvbGFyQ29vcmQoVXRpbC5nZXRSYWRpYW4oMjUpLCAwLCAyMDApO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBzY2VuZS5yZW1vdmUobGlnaHQpO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgICAgbW92ZXJzID0gW107XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHBvaW50cy5hcHBseUhvb2soMCwgMC4wOCk7XHJcbiAgICAgIHBvaW50cy5hcHBseURyYWcoMC4yKTtcclxuICAgICAgcG9pbnRzLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGxpZ2h0LmZvcmNlLmFwcGx5SG9vaygwLCAwLjA4KTtcclxuICAgICAgbGlnaHQuZm9yY2UuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGxpZ2h0LmZvcmNlLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGxpZ2h0LnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGFjdGl2YXRlTW92ZXIoKTtcclxuICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAwNCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4xKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIG1vdmVQb2ludHModmVjdG9yKTtcclxuICAgICAgaXNfZHJhZ2VkID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBpZiAoaXNfZHJhZ2VkKSB7XHJcbiAgICAgICAgbW92ZVBvaW50cyh2ZWN0b3JfbW91c2VfbW92ZSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIGlzX2RyYWdlZCA9IGZhbHNlO1xyXG4gICAgICBwb2ludHMuYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgbGlnaHQuZm9yY2UuYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxudmFyIEZvcmNlSGVtaXNwaGVyZUxpZ2h0ID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZV9oZW1pc3BoZXJlX2xpZ2h0Jyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciBpbWFnZXMgPSBbXTtcclxuICB2YXIgaW1hZ2VzX251bSA9IDMwMDtcclxuICB2YXIgbGlnaHQgPSBudWxsO1xyXG4gIHZhciByYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XHJcbiAgdmFyIHBpY2tlZF9pZCA9IC0xO1xyXG4gIHZhciBwaWNrZWRfaW5kZXggPSAtMTtcclxuICB2YXIgaXNfY2xpY2tlZCA9IGZhbHNlO1xyXG4gIHZhciBpc19kcmFnZWQgPSBmYWxzZTtcclxuICB2YXIgZ2V0X25lYXIgPSBmYWxzZTtcclxuXHJcbiAgdmFyIEltYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJhZCA9IDA7XHJcbiAgICB0aGlzLm9iaiA9IG51bGw7XHJcbiAgICB0aGlzLmlzX2VudGVyZWQgPSBmYWxzZTtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgdmFyIGltYWdlX2dlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMTAwLCAxMDApO1xyXG4gIEltYWdlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgSW1hZ2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSW1hZ2U7XHJcbiAgSW1hZ2UucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHZhciBpbWFnZV9tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXHJcbiAgICAgIG1hcDogbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKS5sb2FkKCdpbWcvZ2FsbGVyeS9pbWFnZTAnICsgVXRpbC5nZXRSYW5kb21JbnQoMSwgOSkgKyAnLmpwZycpXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLm9iaiA9IG5ldyBUSFJFRS5NZXNoKGltYWdlX2dlb21ldHJ5LCBpbWFnZV9tYXRlcmlhbCk7XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gdmVjdG9yLmNsb25lKCk7XHJcbiAgICB0aGlzLmFuY2hvciA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uc2V0KDAsIDAsIDApO1xyXG4gIH07XHJcblxyXG4gIHZhciBpbml0SW1hZ2VzID0gZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VzX251bTsgaSsrKSB7XHJcbiAgICAgIHZhciBpbWFnZSA9IG51bGw7XHJcbiAgICAgIHZhciByYWQgPSBVdGlsLmdldFJhZGlhbihpICUgNDUgKiA4ICsgMTgwKTtcclxuICAgICAgdmFyIHJhZGl1cyA9IDEwMDA7XHJcbiAgICAgIHZhciB4ID0gTWF0aC5jb3MocmFkKSAqIHJhZGl1cztcclxuICAgICAgdmFyIHkgPSBpICogNSAtIGltYWdlc19udW0gKiAyLjU7XHJcbiAgICAgIHZhciB6ID0gTWF0aC5zaW4ocmFkKSAqIHJhZGl1cztcclxuICAgICAgdmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKHgsIHksIHopO1xyXG4gICAgICBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICBpbWFnZS5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKCkpO1xyXG4gICAgICBpbWFnZS5yYWQgPSByYWQ7XHJcbiAgICAgIGltYWdlLm9iai5wb3NpdGlvbi5jb3B5KHZlY3Rvcik7XHJcbiAgICAgIHNjZW5lLmFkZChpbWFnZS5vYmopO1xyXG4gICAgICBpbWFnZXMucHVzaChpbWFnZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHBpY2tJbWFnZSA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgaWYgKGdldF9uZWFyKSByZXR1cm47XHJcbiAgICB2YXIgaW50ZXJzZWN0cyA9IG51bGw7XHJcbiAgICByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYSh2ZWN0b3IsIGNhbWVyYSk7XHJcbiAgICBpbnRlcnNlY3RzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoc2NlbmUuY2hpbGRyZW4pO1xyXG4gICAgaWYgKGludGVyc2VjdHMubGVuZ3RoID4gMCAmJiBpc19kcmFnZWQgPT0gZmFsc2UpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdpcy1wb2ludGVkJyk7XHJcbiAgICAgIHBpY2tlZF9pZCA9IGludGVyc2VjdHNbMF0ub2JqZWN0LmlkO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVzZXRQaWNrSW1hZ2UoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgZ2V0TmVhckltYWdlID0gZnVuY3Rpb24oY2FtZXJhLCBpbWFnZSkge1xyXG4gICAgZ2V0X25lYXIgPSB0cnVlO1xyXG4gICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoTWF0aC5jb3MoaW1hZ2UucmFkKSAqIDc4MCwgaW1hZ2Uub2JqLnBvc2l0aW9uLnksIE1hdGguc2luKGltYWdlLnJhZCkgKiA3ODApO1xyXG4gICAgY2FtZXJhLmZvcmNlLmxvb2suYW5jaG9yLmNvcHkoaW1hZ2Uub2JqLnBvc2l0aW9uKTtcclxuICAgIHJlc2V0UGlja0ltYWdlKCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIHJlc2V0UGlja0ltYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBvaW50ZWQnKTtcclxuICAgIHBpY2tlZF9pZCA9IC0xO1xyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGluaXRJbWFnZXMoc2NlbmUpO1xyXG4gICAgICBsaWdodCA9IG5ldyBGb3JjZUhlbWlzcGhlcmVMaWdodCgweGZmZmZmZiwgMHhmZmZmZmYsIDEpO1xyXG4gICAgICBzY2VuZS5hZGQobGlnaHQpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxID0gVXRpbC5nZXRSYWRpYW4oLTM1KTtcclxuICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxX2Jhc2UgPSBjYW1lcmEucm90YXRlX3JhZDE7XHJcbiAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMiA9IFV0aWwuZ2V0UmFkaWFuKDE4MCk7XHJcbiAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMl9iYXNlID0gY2FtZXJhLnJvdGF0ZV9yYWQyO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgaW1hZ2VfZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHNjZW5lLnJlbW92ZShpbWFnZXNbaV0ub2JqKTtcclxuICAgICAgfTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGxpZ2h0KTtcclxuICAgICAgaW1hZ2VzID0gW107XHJcbiAgICAgIGdldF9uZWFyID0gZmFsc2U7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcG9pbnRlZCcpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlc19udW07IGkrKykge1xyXG4gICAgICAgIGltYWdlc1tpXS5hcHBseUhvb2soMCwgMC4xNCk7XHJcbiAgICAgICAgaW1hZ2VzW2ldLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICAgIGltYWdlc1tpXS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICAgIGltYWdlc1tpXS5vYmoubG9va0F0KHtcclxuICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICB5OiBpbWFnZXNbaV0ub2JqLnBvc2l0aW9uLnksXHJcbiAgICAgICAgICB6OiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGltYWdlc1tpXS5vYmouaWQgPT0gcGlja2VkX2lkICYmIGlzX2RyYWdlZCA9PSBmYWxzZSAmJiBnZXRfbmVhciA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgaWYgKGlzX2NsaWNrZWQgPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBwaWNrZWRfaW5kZXggPSBpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaW1hZ2VzW2ldLm9iai5tYXRlcmlhbC5jb2xvci5zZXQoMHhhYWFhYWEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpbWFnZXNbaV0ub2JqLm1hdGVyaWFsLmNvbG9yLnNldCgweGZmZmZmZik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4wOCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBpZiAoZ2V0X25lYXIgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYW5jaG9yLmNvcHkoVXRpbC5nZXRQb2xhckNvb3JkKGNhbWVyYS5yb3RhdGVfcmFkMSwgY2FtZXJhLnJvdGF0ZV9yYWQyLCAxMDAwKSk7XHJcbiAgICAgIH1cclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZUxvb2soKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgcGlja0ltYWdlKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcik7XHJcbiAgICAgIGlzX2NsaWNrZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIHBpY2tJbWFnZShzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfbW92ZSk7XHJcbiAgICAgIGlmIChpc19jbGlja2VkICYmIHZlY3Rvcl9tb3VzZV9kb3duLmNsb25lKCkuc3ViKHZlY3Rvcl9tb3VzZV9tb3ZlKS5sZW5ndGgoKSA+IDAuMDEpIHtcclxuICAgICAgICBpc19jbGlja2VkID0gZmFsc2U7XHJcbiAgICAgICAgaXNfZHJhZ2VkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNfZHJhZ2VkID09IHRydWUgJiYgZ2V0X25lYXIgPT0gZmFsc2UpIHtcclxuICAgICAgICBjYW1lcmEucm90YXRlX3JhZDEgPSBjYW1lcmEucm90YXRlX3JhZDFfYmFzZSArIFV0aWwuZ2V0UmFkaWFuKCh2ZWN0b3JfbW91c2VfZG93bi55IC0gdmVjdG9yX21vdXNlX21vdmUueSkgKiA1MCk7XHJcbiAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQyID0gY2FtZXJhLnJvdGF0ZV9yYWQyX2Jhc2UgKyBVdGlsLmdldFJhZGlhbigodmVjdG9yX21vdXNlX2Rvd24ueCAtIHZlY3Rvcl9tb3VzZV9tb3ZlLngpICogNTApO1xyXG4gICAgICAgIGlmIChjYW1lcmEucm90YXRlX3JhZDEgPCBVdGlsLmdldFJhZGlhbigtNTApKSB7XHJcbiAgICAgICAgICBjYW1lcmEucm90YXRlX3JhZDEgPSBVdGlsLmdldFJhZGlhbigtNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2FtZXJhLnJvdGF0ZV9yYWQxID4gVXRpbC5nZXRSYWRpYW4oNTApKSB7XHJcbiAgICAgICAgICBjYW1lcmEucm90YXRlX3JhZDEgPSBVdGlsLmdldFJhZGlhbig1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICByZXNldFBpY2tJbWFnZSgpO1xyXG4gICAgICBpZiAoZ2V0X25lYXIpIHtcclxuICAgICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgICBwaWNrZWRfaW5kZXggPSAtMTtcclxuICAgICAgICBnZXRfbmVhciA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2UgaWYgKGlzX2NsaWNrZWQgJiYgcGlja2VkX2luZGV4ID4gLTEpIHtcclxuICAgICAgICBnZXROZWFySW1hZ2UoY2FtZXJhLCBpbWFnZXNbcGlja2VkX2luZGV4XSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoaXNfZHJhZ2VkKSB7XHJcbiAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxX2Jhc2UgPSBjYW1lcmEucm90YXRlX3JhZDE7XHJcbiAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQyX2Jhc2UgPSBjYW1lcmEucm90YXRlX3JhZDI7XHJcbiAgICAgIH1cclxuICAgICAgaXNfY2xpY2tlZCA9IGZhbHNlO1xyXG4gICAgICBpc19kcmFnZWQgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIHRoaXMudG91Y2hFbmQoc2NlbmUsIGNhbWVyYSwgdmVjdG9yKVxyXG4gICAgfVxyXG4gIH07XHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG5cclxudmFyIEZvcmNlQ2FtZXJhID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZV9jYW1lcmEnKTtcclxudmFyIEZvcmNlMiA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UyJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG5cclxuICB2YXIgcG9pbnRzID0gbnVsbDtcclxuICB2YXIgYmcgPSBudWxsO1xyXG4gIHZhciBiZ193ZiA9IG51bGw7XHJcbiAgdmFyIG9iaiA9IG51bGw7XHJcbiAgdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYsIDEpO1xyXG5cclxuICB2YXIgc3ViX3NjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgdmFyIHN1Yl9jYW1lcmEgPSBuZXcgRm9yY2VDYW1lcmEoNDUsIDEsIDEsIDEwMDAwKTtcclxuICB2YXIgcmVuZGVyX3RhcmdldCA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCgxMjAwLCAxMjAwKTtcclxuICB2YXIgZnJhbWVidWZmZXIgPSBudWxsO1xyXG5cclxuICB2YXIgc3ViX3NjZW5lMiA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIHZhciBzdWJfY2FtZXJhMiA9IG5ldyBGb3JjZUNhbWVyYSg0NSwgMSwgMSwgMTAwMDApO1xyXG4gIHZhciBzdWJfbGlnaHQgPSBuZXcgVEhSRUUuSGVtaXNwaGVyZUxpZ2h0KDB4ZmZmZmZmZiwgMHhjY2NjY2MsIDEpO1xyXG4gIHZhciByZW5kZXJfdGFyZ2V0MiA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCgxMjAwLCAxMjAwKTtcclxuICB2YXIgYmdfZmIgPSBudWxsO1xyXG4gIHZhciBwb2ludHNfZmIgPSBudWxsO1xyXG5cclxuICB2YXIgZm9yY2UgPSBuZXcgRm9yY2UyKCk7XHJcblxyXG4gIHZhciBjcmVhdGVQb2ludHNGb3JDcm9zc0ZhZGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgdmFyIHZlcnRpY2VzX2Jhc2UgPSBbXTtcclxuICAgIHZhciByYWRpYW5zX2Jhc2UgPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzI7IGkgKyspIHtcclxuICAgICAgdmFyIHggPSAwO1xyXG4gICAgICB2YXIgeSA9IDA7XHJcbiAgICAgIHZhciB6ID0gMDtcclxuICAgICAgdmVydGljZXNfYmFzZS5wdXNoKHgsIHksIHopO1xyXG4gICAgICB2YXIgcjEgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHIyID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgIHZhciByMyA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICByYWRpYW5zX2Jhc2UucHVzaChyMSwgcjIsIHIzKTtcclxuICAgIH1cclxuICAgIHZhciB2ZXJ0aWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXNfYmFzZSk7XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh2ZXJ0aWNlcywgMykpO1xyXG4gICAgdmFyIHJhZGlhbnMgPSBuZXcgRmxvYXQzMkFycmF5KHJhZGlhbnNfYmFzZSk7XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3JhZGlhbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocmFkaWFucywgMykpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICB0aW1lOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMC4wXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaXplOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMjguMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9yY2U6IHtcclxuICAgICAgICAgIHR5cGU6ICd2MicsXHJcbiAgICAgICAgICB2YWx1ZTogZm9yY2UudmVsb2NpdHksXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgcmFkaWFuO1xcclxcblxcclxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG51bmlmb3JtIHZlYzIgcmVzb2x1dGlvbjtcXHJcXG51bmlmb3JtIGZsb2F0IHNpemU7XFxyXFxudW5pZm9ybSB2ZWMyIGZvcmNlO1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGZsb2F0IHJhZGl1cyA9IDMwMC4wO1xcclxcbiAgZmxvYXQgcmFkaWFuX2Jhc2UgPSByYWRpYW5zKHRpbWUgKiAyLjApO1xcclxcbiAgdmVjMyB1cGRhdGVfcG9zaXRvbiA9IHBvc2l0aW9uICsgdmVjMyhcXHJcXG4gICAgY29zKHJhZGlhbl9iYXNlICsgcmFkaWFuLngpICogY29zKHJhZGlhbl9iYXNlICsgcmFkaWFuLnkpICogcmFkaXVzLFxcclxcbiAgICBjb3MocmFkaWFuX2Jhc2UgKyByYWRpYW4ueCkgKiBzaW4ocmFkaWFuX2Jhc2UgKyByYWRpYW4ueSkgKiByYWRpdXMsXFxyXFxuICAgIHNpbihyYWRpYW5fYmFzZSArIHJhZGlhbi54KSAqIHJhZGl1c1xcclxcbiAgKSAqIGZvcmNlLng7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHVwZGF0ZV9wb3NpdG9uLCAxLjApO1xcclxcblxcclxcbiAgZ2xfUG9pbnRTaXplID0gKHNpemUgKyBmb3JjZS55KSAqIChhYnMoc2luKHJhZGlhbl9iYXNlICsgcmFkaWFuLnopKSkgKiAoc2l6ZSAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpICogNDgwLjA7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIixcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHNpemU7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdmVjMyBuO1xcclxcbiAgbi54eSA9IGdsX1BvaW50Q29vcmQueHkgKiAyLjAgLSAxLjA7XFxyXFxuICBuLnogPSAxLjAgLSBkb3Qobi54eSwgbi54eSk7XFxyXFxuICBpZiAobi56IDwgMC4wKSBkaXNjYXJkO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCgxLjApO1xcclxcbn1cXHJcXG5cIixcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxyXG4gICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVPYmplY3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeV9iYXNlID0gbmV3IFRIUkVFLlNwaGVyZUJ1ZmZlckdlb21ldHJ5KDIsIDQsIDQpO1xyXG4gICAgdmFyIGF0dHIgPSBnZW9tZXRyeV9iYXNlLmF0dHJpYnV0ZXM7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIHZhciB2ZXJ0aWNlc19iYXNlID0gW107XHJcbiAgICB2YXIgcmFkaXVzZXNfYmFzZSA9IFtdO1xyXG4gICAgdmFyIHJhZGlhbnNfYmFzZSA9IFtdO1xyXG4gICAgdmFyIHNjYWxlc19iYXNlID0gW107XHJcbiAgICB2YXIgaW5kaWNlc19iYXNlID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpICsrKSB7XHJcbiAgICAgIHZhciByYWRpdXMgPSBVdGlsLmdldFJhbmRvbUludCgzMDAsIDEwMDApO1xyXG4gICAgICB2YXIgcmFkaWFuID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwMCkgLyAxMCk7XHJcbiAgICAgIHZhciBzY2FsZSA9IFV0aWwuZ2V0UmFuZG9tSW50KDYwLCAxMjApIC8gMTAwO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGF0dHIucG9zaXRpb24uYXJyYXkubGVuZ3RoOyBqICs9IDMpIHtcclxuICAgICAgICB2ZXJ0aWNlc19iYXNlLnB1c2goXHJcbiAgICAgICAgICBhdHRyLnBvc2l0aW9uLmFycmF5W2ogKyAwXSxcclxuICAgICAgICAgIGF0dHIucG9zaXRpb24uYXJyYXlbaiArIDFdLFxyXG4gICAgICAgICAgYXR0ci5wb3NpdGlvbi5hcnJheVtqICsgMl1cclxuICAgICAgICApO1xyXG4gICAgICAgIHJhZGl1c2VzX2Jhc2UucHVzaChyYWRpdXMpO1xyXG4gICAgICAgIHJhZGlhbnNfYmFzZS5wdXNoKHJhZGlhbik7XHJcbiAgICAgICAgc2NhbGVzX2Jhc2UucHVzaChzY2FsZSk7XHJcbiAgICAgIH1cclxuICAgICAgZ2VvbWV0cnlfYmFzZS5pbmRleC5hcnJheS5tYXAoKGl0ZW0pID0+IHtcclxuICAgICAgICBpbmRpY2VzX2Jhc2UucHVzaChpdGVtICsgaSAqIGF0dHIucG9zaXRpb24uYXJyYXkubGVuZ3RoIC8gMylcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICB2YXIgdmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzX2Jhc2UpO1xyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUodmVydGljZXMsIDMpKTtcclxuICAgIHZhciByYWRpdXMgPSBuZXcgRmxvYXQzMkFycmF5KHJhZGl1c2VzX2Jhc2UpO1xyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdyYWRpdXMnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHJhZGl1cywgMSkpO1xyXG4gICAgdmFyIHJhZGlhbnMgPSBuZXcgRmxvYXQzMkFycmF5KHJhZGlhbnNfYmFzZSk7XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3JhZGlhbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocmFkaWFucywgMSkpO1xyXG4gICAgdmFyIHNjYWxlcyA9IG5ldyBGbG9hdDMyQXJyYXkoc2NhbGVzX2Jhc2UpO1xyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdzY2FsZScsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoc2NhbGVzLCAxKSk7XHJcbiAgICB2YXIgaW5kaWNlcyA9IG5ldyBVaW50MzJBcnJheShpbmRpY2VzX2Jhc2UpO1xyXG4gICAgZ2VvbWV0cnkuc2V0SW5kZXgobmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShpbmRpY2VzLCAxKSk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3JtczogVEhSRUUuVW5pZm9ybXNVdGlscy5tZXJnZShbXHJcbiAgICAgICAgVEhSRUUuVW5pZm9ybXNMaWJbJ2xpZ2h0cyddLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICBdKSxcclxuICAgICAgdmVydGV4U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIGZsb2F0IHJhZGl1cztcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgcmFkaWFuO1xcclxcbmF0dHJpYnV0ZSBmbG9hdCBzY2FsZTtcXHJcXG5cXHJcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZQb3NpdGlvbjtcXHJcXG52YXJ5aW5nIG1hdDQgdkludmVydE1hdHJpeDtcXHJcXG5cXHJcXG5mbG9hdCBpbnZlcnNlXzhfMChmbG9hdCBtKSB7XFxuICByZXR1cm4gMS4wIC8gbTtcXG59XFxuXFxubWF0MiBpbnZlcnNlXzhfMChtYXQyIG0pIHtcXG4gIHJldHVybiBtYXQyKG1bMV1bMV0sLW1bMF1bMV0sXFxuICAgICAgICAgICAgIC1tWzFdWzBdLCBtWzBdWzBdKSAvIChtWzBdWzBdKm1bMV1bMV0gLSBtWzBdWzFdKm1bMV1bMF0pO1xcbn1cXG5cXG5tYXQzIGludmVyc2VfOF8wKG1hdDMgbSkge1xcbiAgZmxvYXQgYTAwID0gbVswXVswXSwgYTAxID0gbVswXVsxXSwgYTAyID0gbVswXVsyXTtcXG4gIGZsb2F0IGExMCA9IG1bMV1bMF0sIGExMSA9IG1bMV1bMV0sIGExMiA9IG1bMV1bMl07XFxuICBmbG9hdCBhMjAgPSBtWzJdWzBdLCBhMjEgPSBtWzJdWzFdLCBhMjIgPSBtWzJdWzJdO1xcblxcbiAgZmxvYXQgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxO1xcbiAgZmxvYXQgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMDtcXG4gIGZsb2F0IGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMDtcXG5cXG4gIGZsb2F0IGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcXG5cXG4gIHJldHVybiBtYXQzKGIwMSwgKC1hMjIgKiBhMDEgKyBhMDIgKiBhMjEpLCAoYTEyICogYTAxIC0gYTAyICogYTExKSxcXG4gICAgICAgICAgICAgIGIxMSwgKGEyMiAqIGEwMCAtIGEwMiAqIGEyMCksICgtYTEyICogYTAwICsgYTAyICogYTEwKSxcXG4gICAgICAgICAgICAgIGIyMSwgKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApLCAoYTExICogYTAwIC0gYTAxICogYTEwKSkgLyBkZXQ7XFxufVxcblxcbm1hdDQgaW52ZXJzZV84XzAobWF0NCBtKSB7XFxuICBmbG9hdFxcbiAgICAgIGEwMCA9IG1bMF1bMF0sIGEwMSA9IG1bMF1bMV0sIGEwMiA9IG1bMF1bMl0sIGEwMyA9IG1bMF1bM10sXFxuICAgICAgYTEwID0gbVsxXVswXSwgYTExID0gbVsxXVsxXSwgYTEyID0gbVsxXVsyXSwgYTEzID0gbVsxXVszXSxcXG4gICAgICBhMjAgPSBtWzJdWzBdLCBhMjEgPSBtWzJdWzFdLCBhMjIgPSBtWzJdWzJdLCBhMjMgPSBtWzJdWzNdLFxcbiAgICAgIGEzMCA9IG1bM11bMF0sIGEzMSA9IG1bM11bMV0sIGEzMiA9IG1bM11bMl0sIGEzMyA9IG1bM11bM10sXFxuXFxuICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxcbiAgICAgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcXG4gICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXFxuICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxcbiAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSxcXG4gICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXFxuICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxcbiAgICAgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcXG4gICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXFxuICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxcbiAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSxcXG4gICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzIsXFxuXFxuICAgICAgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xcblxcbiAgcmV0dXJuIG1hdDQoXFxuICAgICAgYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5LFxcbiAgICAgIGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSxcXG4gICAgICBhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMsXFxuICAgICAgYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzLFxcbiAgICAgIGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNyxcXG4gICAgICBhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcsXFxuICAgICAgYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxLFxcbiAgICAgIGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSxcXG4gICAgICBhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYsXFxuICAgICAgYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2LFxcbiAgICAgIGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCxcXG4gICAgICBhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDAsXFxuICAgICAgYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2LFxcbiAgICAgIGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNixcXG4gICAgICBhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDAsXFxuICAgICAgYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwKSAvIGRldDtcXG59XFxuXFxuXFxuLy9cXG4vLyBEZXNjcmlwdGlvbiA6IEFycmF5IGFuZCB0ZXh0dXJlbGVzcyBHTFNMIDJELzNELzREIHNpbXBsZXhcXG4vLyAgICAgICAgICAgICAgIG5vaXNlIGZ1bmN0aW9ucy5cXG4vLyAgICAgIEF1dGhvciA6IElhbiBNY0V3YW4sIEFzaGltYSBBcnRzLlxcbi8vICBNYWludGFpbmVyIDogaWptXFxuLy8gICAgIExhc3Rtb2QgOiAyMDExMDgyMiAoaWptKVxcbi8vICAgICBMaWNlbnNlIDogQ29weXJpZ2h0IChDKSAyMDExIEFzaGltYSBBcnRzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxcbi8vICAgICAgICAgICAgICAgRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlLlxcbi8vICAgICAgICAgICAgICAgaHR0cHM6Ly9naXRodWIuY29tL2FzaGltYS93ZWJnbC1ub2lzZVxcbi8vXFxuXFxudmVjMyBtb2QyODlfN18xKHZlYzMgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBtb2QyODlfN18xKHZlYzQgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBwZXJtdXRlXzdfMih2ZWM0IHgpIHtcXG4gICAgIHJldHVybiBtb2QyODlfN18xKCgoeCozNC4wKSsxLjApKngpO1xcbn1cXG5cXG52ZWM0IHRheWxvckludlNxcnRfN18zKHZlYzQgcilcXG57XFxuICByZXR1cm4gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiByO1xcbn1cXG5cXG5mbG9hdCBzbm9pc2VfN180KHZlYzMgdilcXG4gIHtcXG4gIGNvbnN0IHZlYzIgIEMgPSB2ZWMyKDEuMC82LjAsIDEuMC8zLjApIDtcXG4gIGNvbnN0IHZlYzQgIERfN181ID0gdmVjNCgwLjAsIDAuNSwgMS4wLCAyLjApO1xcblxcbi8vIEZpcnN0IGNvcm5lclxcbiAgdmVjMyBpICA9IGZsb29yKHYgKyBkb3QodiwgQy55eXkpICk7XFxuICB2ZWMzIHgwID0gICB2IC0gaSArIGRvdChpLCBDLnh4eCkgO1xcblxcbi8vIE90aGVyIGNvcm5lcnNcXG4gIHZlYzMgZ183XzYgPSBzdGVwKHgwLnl6eCwgeDAueHl6KTtcXG4gIHZlYzMgbCA9IDEuMCAtIGdfN182O1xcbiAgdmVjMyBpMSA9IG1pbiggZ183XzYueHl6LCBsLnp4eSApO1xcbiAgdmVjMyBpMiA9IG1heCggZ183XzYueHl6LCBsLnp4eSApO1xcblxcbiAgLy8gICB4MCA9IHgwIC0gMC4wICsgMC4wICogQy54eHg7XFxuICAvLyAgIHgxID0geDAgLSBpMSAgKyAxLjAgKiBDLnh4eDtcXG4gIC8vICAgeDIgPSB4MCAtIGkyICArIDIuMCAqIEMueHh4O1xcbiAgLy8gICB4MyA9IHgwIC0gMS4wICsgMy4wICogQy54eHg7XFxuICB2ZWMzIHgxID0geDAgLSBpMSArIEMueHh4O1xcbiAgdmVjMyB4MiA9IHgwIC0gaTIgKyBDLnl5eTsgLy8gMi4wKkMueCA9IDEvMyA9IEMueVxcbiAgdmVjMyB4MyA9IHgwIC0gRF83XzUueXl5OyAgICAgIC8vIC0xLjArMy4wKkMueCA9IC0wLjUgPSAtRC55XFxuXFxuLy8gUGVybXV0YXRpb25zXFxuICBpID0gbW9kMjg5XzdfMShpKTtcXG4gIHZlYzQgcCA9IHBlcm11dGVfN18yKCBwZXJtdXRlXzdfMiggcGVybXV0ZV83XzIoXFxuICAgICAgICAgICAgIGkueiArIHZlYzQoMC4wLCBpMS56LCBpMi56LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS55ICsgdmVjNCgwLjAsIGkxLnksIGkyLnksIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnggKyB2ZWM0KDAuMCwgaTEueCwgaTIueCwgMS4wICkpO1xcblxcbi8vIEdyYWRpZW50czogN3g3IHBvaW50cyBvdmVyIGEgc3F1YXJlLCBtYXBwZWQgb250byBhbiBvY3RhaGVkcm9uLlxcbi8vIFRoZSByaW5nIHNpemUgMTcqMTcgPSAyODkgaXMgY2xvc2UgdG8gYSBtdWx0aXBsZSBvZiA0OSAoNDkqNiA9IDI5NClcXG4gIGZsb2F0IG5fID0gMC4xNDI4NTcxNDI4NTc7IC8vIDEuMC83LjBcXG4gIHZlYzMgIG5zID0gbl8gKiBEXzdfNS53eXogLSBEXzdfNS54eng7XFxuXFxuICB2ZWM0IGogPSBwIC0gNDkuMCAqIGZsb29yKHAgKiBucy56ICogbnMueik7ICAvLyAgbW9kKHAsNyo3KVxcblxcbiAgdmVjNCB4XyA9IGZsb29yKGogKiBucy56KTtcXG4gIHZlYzQgeV8gPSBmbG9vcihqIC0gNy4wICogeF8gKTsgICAgLy8gbW9kKGosTilcXG5cXG4gIHZlYzQgeCA9IHhfICpucy54ICsgbnMueXl5eTtcXG4gIHZlYzQgeSA9IHlfICpucy54ICsgbnMueXl5eTtcXG4gIHZlYzQgaCA9IDEuMCAtIGFicyh4KSAtIGFicyh5KTtcXG5cXG4gIHZlYzQgYjAgPSB2ZWM0KCB4Lnh5LCB5Lnh5ICk7XFxuICB2ZWM0IGIxID0gdmVjNCggeC56dywgeS56dyApO1xcblxcbiAgLy92ZWM0IHMwID0gdmVjNChsZXNzVGhhbihiMCwwLjApKSoyLjAgLSAxLjA7XFxuICAvL3ZlYzQgczEgPSB2ZWM0KGxlc3NUaGFuKGIxLDAuMCkpKjIuMCAtIDEuMDtcXG4gIHZlYzQgczAgPSBmbG9vcihiMCkqMi4wICsgMS4wO1xcbiAgdmVjNCBzMSA9IGZsb29yKGIxKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHNoID0gLXN0ZXAoaCwgdmVjNCgwLjApKTtcXG5cXG4gIHZlYzQgYTAgPSBiMC54enl3ICsgczAueHp5dypzaC54eHl5IDtcXG4gIHZlYzQgYTFfN183ID0gYjEueHp5dyArIHMxLnh6eXcqc2guenp3dyA7XFxuXFxuICB2ZWMzIHAwXzdfOCA9IHZlYzMoYTAueHksaC54KTtcXG4gIHZlYzMgcDEgPSB2ZWMzKGEwLnp3LGgueSk7XFxuICB2ZWMzIHAyID0gdmVjMyhhMV83XzcueHksaC56KTtcXG4gIHZlYzMgcDMgPSB2ZWMzKGExXzdfNy56dyxoLncpO1xcblxcbi8vTm9ybWFsaXNlIGdyYWRpZW50c1xcbiAgdmVjNCBub3JtID0gdGF5bG9ySW52U3FydF83XzModmVjNChkb3QocDBfN184LHAwXzdfOCksIGRvdChwMSxwMSksIGRvdChwMiwgcDIpLCBkb3QocDMscDMpKSk7XFxuICBwMF83XzggKj0gbm9ybS54O1xcbiAgcDEgKj0gbm9ybS55O1xcbiAgcDIgKj0gbm9ybS56O1xcbiAgcDMgKj0gbm9ybS53O1xcblxcbi8vIE1peCBmaW5hbCBub2lzZSB2YWx1ZVxcbiAgdmVjNCBtID0gbWF4KDAuNiAtIHZlYzQoZG90KHgwLHgwKSwgZG90KHgxLHgxKSwgZG90KHgyLHgyKSwgZG90KHgzLHgzKSksIDAuMCk7XFxuICBtID0gbSAqIG07XFxuICByZXR1cm4gNDIuMCAqIGRvdCggbSptLCB2ZWM0KCBkb3QocDBfN184LHgwKSwgZG90KHAxLHgxKSxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvdChwMix4MiksIGRvdChwMyx4MykgKSApO1xcbiAgfVxcblxcblxcblxcbm1hdDQgdHJhbnNsYXRlTWF0cml4XzFfOSh2ZWMzIHYpIHtcXHJcXG4gIHJldHVybiBtYXQ0KFxcclxcbiAgICAxLjAsIDAuMCwgMC4wLCAwLjAsXFxyXFxuICAgIDAuMCwgMS4wLCAwLjAsIDAuMCxcXHJcXG4gICAgMC4wLCAwLjAsIDEuMCwgMC4wLFxcclxcbiAgICB2LngsIHYueSwgdi56LCAxLjBcXHJcXG4gICk7XFxyXFxufVxcclxcblxcblxcbm1hdDQgcm90YXRpb25NYXRyaXhYXzRfMTAoZmxvYXQgcmFkaWFuKSB7XFxyXFxuICByZXR1cm4gbWF0NChcXHJcXG4gICAgMS4wLCAwLjAsIDAuMCwgMC4wLFxcclxcbiAgICAwLjAsIGNvcyhyYWRpYW4pLCAtc2luKHJhZGlhbiksIDAuMCxcXHJcXG4gICAgMC4wLCBzaW4ocmFkaWFuKSwgY29zKHJhZGlhbiksIDAuMCxcXHJcXG4gICAgMC4wLCAwLjAsIDAuMCwgMS4wXFxyXFxuICApO1xcclxcbn1cXHJcXG5cXG5cXG5tYXQ0IHJvdGF0aW9uTWF0cml4WV81XzExKGZsb2F0IHJhZGlhbikge1xcclxcbiAgcmV0dXJuIG1hdDQoXFxyXFxuICAgIGNvcyhyYWRpYW4pLCAwLjAsIHNpbihyYWRpYW4pLCAwLjAsXFxyXFxuICAgIDAuMCwgMS4wLCAwLjAsIDAuMCxcXHJcXG4gICAgLXNpbihyYWRpYW4pLCAwLjAsIGNvcyhyYWRpYW4pLCAwLjAsXFxyXFxuICAgIDAuMCwgMC4wLCAwLjAsIDEuMFxcclxcbiAgKTtcXHJcXG59XFxyXFxuXFxuXFxubWF0NCByb3RhdGlvbk1hdHJpeFpfNl8xMihmbG9hdCByYWRpYW4pIHtcXHJcXG4gIHJldHVybiBtYXQ0KFxcclxcbiAgICBjb3MocmFkaWFuKSwgLXNpbihyYWRpYW4pLCAwLjAsIDAuMCxcXHJcXG4gICAgc2luKHJhZGlhbiksIGNvcyhyYWRpYW4pLCAwLjAsIDAuMCxcXHJcXG4gICAgMC4wLCAwLjAsIDEuMCwgMC4wLFxcclxcbiAgICAwLjAsIDAuMCwgMC4wLCAxLjBcXHJcXG4gICk7XFxyXFxufVxcclxcblxcblxcblxcclxcbm1hdDQgcm90YXRpb25NYXRyaXhfMl8xMyhmbG9hdCByYWRpYW5feCwgZmxvYXQgcmFkaWFuX3ksIGZsb2F0IHJhZGlhbl96KSB7XFxyXFxuICByZXR1cm4gcm90YXRpb25NYXRyaXhYXzRfMTAocmFkaWFuX3gpICogcm90YXRpb25NYXRyaXhZXzVfMTEocmFkaWFuX3kpICogcm90YXRpb25NYXRyaXhaXzZfMTIocmFkaWFuX3opO1xcclxcbn1cXHJcXG5cXG5cXG5tYXQ0IHNjYWxlTWF0cml4XzNfMTQodmVjMyBzY2FsZSkge1xcclxcbiAgcmV0dXJuIG1hdDQoXFxyXFxuICAgIHNjYWxlLngsIDAuMCwgMC4wLCAwLjAsXFxyXFxuICAgIDAuMCwgc2NhbGUueSwgMC4wLCAwLjAsXFxyXFxuICAgIDAuMCwgMC4wLCBzY2FsZS56LCAwLjAsXFxyXFxuICAgIDAuMCwgMC4wLCAwLjAsIDEuMFxcclxcbiAgKTtcXHJcXG59XFxyXFxuXFxuXFxuXFxyXFxudmVjNCBtb3ZlKHZlYzMgcG9zaXRpb24pIHtcXHJcXG4gIHJldHVybiB0cmFuc2xhdGVNYXRyaXhfMV85KFxcclxcbiAgICB2ZWMzKFxcclxcbiAgICAgIGNvcyhyYWRpYW5zKHRpbWUgKiAwLjUpICsgcmFkaWFuKSAqIHJhZGl1cyxcXHJcXG4gICAgICBzaW4ocmFkaWFucyh0aW1lICogMC41KSArIHJhZGlhbiAqIDEwLjApICogcmFkaXVzICogMC4zLFxcclxcbiAgICAgIHNpbihyYWRpYW5zKHRpbWUgKiAwLjUpICsgcmFkaWFuKSAqIHJhZGl1c1xcclxcbiAgICApXFxyXFxuICApICogcm90YXRpb25NYXRyaXhfMl8xMyhcXHJcXG4gICAgcmFkaWFucyh0aW1lICogcmFkaWFuKSArIHJhZGlhbiwgcmFkaWFucyh0aW1lKSArIHJhZGlhbiwgcmFkaWFucyh0aW1lKSArIHJhZGlhblxcclxcbiAgKSAqIHNjYWxlTWF0cml4XzNfMTQoXFxyXFxuICAgIHZlYzMoMjAuMCAqIHNjYWxlKSArIHZlYzMoMTAuMCkgKiBzbm9pc2VfN180KChwb3NpdGlvbiArIHNpbihyYWRpYW4pKSlcXHJcXG4gICkgKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbn1cXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2ZWM0IHVwZGF0ZV9wb3NpdGlvbiA9IG1vdmUocG9zaXRpb24pO1xcclxcbiAgdlBvc2l0aW9uID0gcG9zaXRpb247XFxyXFxuICB2SW52ZXJ0TWF0cml4ID0gaW52ZXJzZV84XzAocm90YXRpb25NYXRyaXhfMl8xMyhcXHJcXG4gICAgcmFkaWFucyh0aW1lICogcmFkaWFuKSArIHJhZGlhbiwgcmFkaWFucyh0aW1lKSArIHJhZGlhbiwgcmFkaWFucyh0aW1lKSArIHJhZGlhblxcclxcbiAgKSk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB1cGRhdGVfcG9zaXRpb247XFxyXFxufVxcclxcblwiLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnN0cnVjdCBEaXJlY3Rpb25hbExpZ2h0IHtcXHJcXG4gIHZlYzMgY29sb3I7XFxyXFxuICB2ZWMzIGRpcmVjdGlvbjtcXHJcXG59O1xcclxcbnVuaWZvcm0gRGlyZWN0aW9uYWxMaWdodCBkaXJlY3Rpb25hbExpZ2h0c1sxXTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdlBvc2l0aW9uO1xcclxcbnZhcnlpbmcgbWF0NCB2SW52ZXJ0TWF0cml4O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZlYzMgbm9ybWFsID0gbm9ybWFsaXplKGNyb3NzKGRGZHgodlBvc2l0aW9uKSwgZEZkeSh2UG9zaXRpb24pKSk7XFxyXFxuICB2ZWMzIGludl9saWdodCA9IG5vcm1hbGl6ZSh2SW52ZXJ0TWF0cml4ICogdmVjNChkaXJlY3Rpb25hbExpZ2h0c1swXS5kaXJlY3Rpb24sIDEuMCkpLnh5ejtcXHJcXG4gIGZsb2F0IGRpZmYgPSAoZG90KG5vcm1hbCwgaW52X2xpZ2h0KSArIDEuMCkgLyAyLjAgKiAwLjI1ICsgMC43NTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQodmVjMygxLjApICogZGlmZiwgMS4wKTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIHNoYWRpbmc6IFRIUkVFLkZsYXRTaGFkaW5nLFxyXG4gICAgICBsaWdodHM6IHRydWUsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVCYWNrZ3JvdW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMTIwMCwgNjQsIDY0KTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdkNvbG9yID0gdmVjMygocG9zaXRpb24ueSAvIDEwMDAuMCArIDEuMCkgKiAwLjEyICsgMC44OCk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbn1cXHJcXG5cIixcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQodkNvbG9yLCAxLjApO1xcclxcbn1cXHJcXG5cIixcclxuICAgICAgc2lkZTogVEhSRUUuQmFja1NpZGUsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVCYWNrZ3JvdW5kV2lyZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDExMDAsIDY0LCA2NCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xyXG4gICAgICBjb2xvcjogMHhkZGRkZGQsXHJcbiAgICAgIHdpcmVmcmFtZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlUG9pbnRzSW5GcmFtZWJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICB2YXIgdmVydGljZXNfYmFzZSA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyMDAwOyBpKyspIHtcclxuICAgICAgdmVydGljZXNfYmFzZS5wdXNoKFxyXG4gICAgICAgIFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDEyMCkgKyAxMjApLFxyXG4gICAgICAgIFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MDApIC8gMTApLFxyXG4gICAgICAgIFV0aWwuZ2V0UmFuZG9tSW50KDIwMCwgMTAwMClcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIHZhciB2ZXJ0aWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXNfYmFzZSk7XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh2ZXJ0aWNlcywgMykpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICB0aW1lOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxyXFxuXFxyXFxudmVjMyBnZXRQb2xhckNvb3JkKGZsb2F0IHJhZDEsIGZsb2F0IHJhZDIsIGZsb2F0IHIpIHtcXHJcXG4gIHJldHVybiB2ZWMzKFxcclxcbiAgICBjb3MocmFkMSkgKiBjb3MocmFkMikgKiByLFxcclxcbiAgICBzaW4ocmFkMSkgKiByLFxcclxcbiAgICBjb3MocmFkMSkgKiBzaW4ocmFkMikgKiByXFxyXFxuICApO1xcclxcbn1cXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2ZWMzIHVwZGF0ZV9wb3NpdGlvbiA9IGdldFBvbGFyQ29vcmQoXFxyXFxuICAgIHBvc2l0aW9uLngsXFxyXFxuICAgIHBvc2l0aW9uLnkgKyByYWRpYW5zKHRpbWUgLyAyLjApLFxcclxcbiAgICBwb3NpdGlvbi56ICsgc2luKHJhZGlhbnModGltZSAqIDIuMCkgKyBwb3NpdGlvbi54ICsgcG9zaXRpb24ueSkgKiBwb3NpdGlvbi56IC8gNC4wXFxyXFxuICApO1xcclxcbiAgdmVjNCBtdl9wb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQodXBkYXRlX3Bvc2l0aW9uLCAxLjApO1xcclxcblxcclxcbiAgZ2xfUG9pbnRTaXplID0gMi4wICogKDEwMDAuMCAvIGxlbmd0aChtdl9wb3NpdGlvbi54eXopKTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12X3Bvc2l0aW9uO1xcclxcbn1cXHJcXG5cIixcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2ZWMzIG47XFxyXFxuICBuLnh5ID0gZ2xfUG9pbnRDb29yZC54eSAqIDIuMCAtIDEuMDtcXHJcXG4gIG4ueiA9IDEuMCAtIGRvdChuLnh5LCBuLnh5KTtcXHJcXG4gIGlmIChuLnogPCAwLjApIGRpc2NhcmQ7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KDEuMCk7XFxyXFxufVxcclxcblwiLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVCYWNrZ3JvdW5kSW5GcmFtZWJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5X2Jhc2UgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMTAwMCwgMTI4LCAxMjgpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICBnZW9tZXRyeS5mcm9tR2VvbWV0cnkoZ2VvbWV0cnlfYmFzZSk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcblxcclxcbnZlYzMgaHN2MnJnYl8xXzAodmVjMyBjKXtcXHJcXG4gIHZlYzQgSyA9IHZlYzQoMS4wLCAyLjAgLyAzLjAsIDEuMCAvIDMuMCwgMy4wKTtcXHJcXG4gIHZlYzMgcCA9IGFicyhmcmFjdChjLnh4eCArIEsueHl6KSAqIDYuMCAtIEsud3d3KTtcXHJcXG4gIHJldHVybiBjLnogKiBtaXgoSy54eHgsIGNsYW1wKHAgLSBLLnh4eCwgMC4wLCAxLjApLCBjLnkpO1xcclxcbn1cXHJcXG5cXG5cXG4vL1xcbi8vIERlc2NyaXB0aW9uIDogQXJyYXkgYW5kIHRleHR1cmVsZXNzIEdMU0wgMkQvM0QvNEQgc2ltcGxleFxcbi8vICAgICAgICAgICAgICAgbm9pc2UgZnVuY3Rpb25zLlxcbi8vICAgICAgQXV0aG9yIDogSWFuIE1jRXdhbiwgQXNoaW1hIEFydHMuXFxuLy8gIE1haW50YWluZXIgOiBpam1cXG4vLyAgICAgTGFzdG1vZCA6IDIwMTEwODIyIChpam0pXFxuLy8gICAgIExpY2Vuc2UgOiBDb3B5cmlnaHQgKEMpIDIwMTEgQXNoaW1hIEFydHMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXFxuLy8gICAgICAgICAgICAgICBEaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUuXFxuLy8gICAgICAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vYXNoaW1hL3dlYmdsLW5vaXNlXFxuLy9cXG5cXG52ZWMzIG1vZDI4OV8yXzEodmVjMyB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IG1vZDI4OV8yXzEodmVjNCB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IHBlcm11dGVfMl8yKHZlYzQgeCkge1xcbiAgICAgcmV0dXJuIG1vZDI4OV8yXzEoKCh4KjM0LjApKzEuMCkqeCk7XFxufVxcblxcbnZlYzQgdGF5bG9ySW52U3FydF8yXzModmVjNCByKVxcbntcXG4gIHJldHVybiAxLjc5Mjg0MjkxNDAwMTU5IC0gMC44NTM3MzQ3MjA5NTMxNCAqIHI7XFxufVxcblxcbmZsb2F0IHNub2lzZV8yXzQodmVjMyB2KVxcbiAge1xcbiAgY29uc3QgdmVjMiAgQyA9IHZlYzIoMS4wLzYuMCwgMS4wLzMuMCkgO1xcbiAgY29uc3QgdmVjNCAgRF8yXzUgPSB2ZWM0KDAuMCwgMC41LCAxLjAsIDIuMCk7XFxuXFxuLy8gRmlyc3QgY29ybmVyXFxuICB2ZWMzIGkgID0gZmxvb3IodiArIGRvdCh2LCBDLnl5eSkgKTtcXG4gIHZlYzMgeDAgPSAgIHYgLSBpICsgZG90KGksIEMueHh4KSA7XFxuXFxuLy8gT3RoZXIgY29ybmVyc1xcbiAgdmVjMyBnXzJfNiA9IHN0ZXAoeDAueXp4LCB4MC54eXopO1xcbiAgdmVjMyBsID0gMS4wIC0gZ18yXzY7XFxuICB2ZWMzIGkxID0gbWluKCBnXzJfNi54eXosIGwuenh5ICk7XFxuICB2ZWMzIGkyID0gbWF4KCBnXzJfNi54eXosIGwuenh5ICk7XFxuXFxuICAvLyAgIHgwID0geDAgLSAwLjAgKyAwLjAgKiBDLnh4eDtcXG4gIC8vICAgeDEgPSB4MCAtIGkxICArIDEuMCAqIEMueHh4O1xcbiAgLy8gICB4MiA9IHgwIC0gaTIgICsgMi4wICogQy54eHg7XFxuICAvLyAgIHgzID0geDAgLSAxLjAgKyAzLjAgKiBDLnh4eDtcXG4gIHZlYzMgeDEgPSB4MCAtIGkxICsgQy54eHg7XFxuICB2ZWMzIHgyID0geDAgLSBpMiArIEMueXl5OyAvLyAyLjAqQy54ID0gMS8zID0gQy55XFxuICB2ZWMzIHgzID0geDAgLSBEXzJfNS55eXk7ICAgICAgLy8gLTEuMCszLjAqQy54ID0gLTAuNSA9IC1ELnlcXG5cXG4vLyBQZXJtdXRhdGlvbnNcXG4gIGkgPSBtb2QyODlfMl8xKGkpO1xcbiAgdmVjNCBwID0gcGVybXV0ZV8yXzIoIHBlcm11dGVfMl8yKCBwZXJtdXRlXzJfMihcXG4gICAgICAgICAgICAgaS56ICsgdmVjNCgwLjAsIGkxLnosIGkyLnosIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnkgKyB2ZWM0KDAuMCwgaTEueSwgaTIueSwgMS4wICkpXFxuICAgICAgICAgICArIGkueCArIHZlYzQoMC4wLCBpMS54LCBpMi54LCAxLjAgKSk7XFxuXFxuLy8gR3JhZGllbnRzOiA3eDcgcG9pbnRzIG92ZXIgYSBzcXVhcmUsIG1hcHBlZCBvbnRvIGFuIG9jdGFoZWRyb24uXFxuLy8gVGhlIHJpbmcgc2l6ZSAxNyoxNyA9IDI4OSBpcyBjbG9zZSB0byBhIG11bHRpcGxlIG9mIDQ5ICg0OSo2ID0gMjk0KVxcbiAgZmxvYXQgbl8gPSAwLjE0Mjg1NzE0Mjg1NzsgLy8gMS4wLzcuMFxcbiAgdmVjMyAgbnMgPSBuXyAqIERfMl81Lnd5eiAtIERfMl81Lnh6eDtcXG5cXG4gIHZlYzQgaiA9IHAgLSA0OS4wICogZmxvb3IocCAqIG5zLnogKiBucy56KTsgIC8vICBtb2QocCw3KjcpXFxuXFxuICB2ZWM0IHhfID0gZmxvb3IoaiAqIG5zLnopO1xcbiAgdmVjNCB5XyA9IGZsb29yKGogLSA3LjAgKiB4XyApOyAgICAvLyBtb2QoaixOKVxcblxcbiAgdmVjNCB4ID0geF8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCB5ID0geV8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCBoID0gMS4wIC0gYWJzKHgpIC0gYWJzKHkpO1xcblxcbiAgdmVjNCBiMCA9IHZlYzQoIHgueHksIHkueHkgKTtcXG4gIHZlYzQgYjEgPSB2ZWM0KCB4Lnp3LCB5Lnp3ICk7XFxuXFxuICAvL3ZlYzQgczAgPSB2ZWM0KGxlc3NUaGFuKGIwLDAuMCkpKjIuMCAtIDEuMDtcXG4gIC8vdmVjNCBzMSA9IHZlYzQobGVzc1RoYW4oYjEsMC4wKSkqMi4wIC0gMS4wO1xcbiAgdmVjNCBzMCA9IGZsb29yKGIwKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHMxID0gZmxvb3IoYjEpKjIuMCArIDEuMDtcXG4gIHZlYzQgc2ggPSAtc3RlcChoLCB2ZWM0KDAuMCkpO1xcblxcbiAgdmVjNCBhMCA9IGIwLnh6eXcgKyBzMC54enl3KnNoLnh4eXkgO1xcbiAgdmVjNCBhMV8yXzcgPSBiMS54enl3ICsgczEueHp5dypzaC56end3IDtcXG5cXG4gIHZlYzMgcDBfMl84ID0gdmVjMyhhMC54eSxoLngpO1xcbiAgdmVjMyBwMSA9IHZlYzMoYTAuencsaC55KTtcXG4gIHZlYzMgcDIgPSB2ZWMzKGExXzJfNy54eSxoLnopO1xcbiAgdmVjMyBwMyA9IHZlYzMoYTFfMl83Lnp3LGgudyk7XFxuXFxuLy9Ob3JtYWxpc2UgZ3JhZGllbnRzXFxuICB2ZWM0IG5vcm0gPSB0YXlsb3JJbnZTcXJ0XzJfMyh2ZWM0KGRvdChwMF8yXzgscDBfMl84KSwgZG90KHAxLHAxKSwgZG90KHAyLCBwMiksIGRvdChwMyxwMykpKTtcXG4gIHAwXzJfOCAqPSBub3JtLng7XFxuICBwMSAqPSBub3JtLnk7XFxuICBwMiAqPSBub3JtLno7XFxuICBwMyAqPSBub3JtLnc7XFxuXFxuLy8gTWl4IGZpbmFsIG5vaXNlIHZhbHVlXFxuICB2ZWM0IG0gPSBtYXgoMC42IC0gdmVjNChkb3QoeDAseDApLCBkb3QoeDEseDEpLCBkb3QoeDIseDIpLCBkb3QoeDMseDMpKSwgMC4wKTtcXG4gIG0gPSBtICogbTtcXG4gIHJldHVybiA0Mi4wICogZG90KCBtKm0sIHZlYzQoIGRvdChwMF8yXzgseDApLCBkb3QocDEseDEpLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90KHAyLHgyKSwgZG90KHAzLHgzKSApICk7XFxuICB9XFxuXFxuXFxuXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZmxvYXQgbm9pc2UgPSBzbm9pc2VfMl80KFxcclxcbiAgICB2ZWMzKHBvc2l0aW9uLnggKyB0aW1lICogMTAuMCwgcG9zaXRpb24ueSArIGNvcyh0aW1lIC8gMjAuMCkgKiAxMDAuMCwgcG9zaXRpb24ueiArIHRpbWUgKiAxMC4wKSAvIDgwMC4wXFxyXFxuICApO1xcclxcbiAgdkNvbG9yID0gaHN2MnJnYl8xXzAodmVjMyhub2lzZSAqIDAuMiArIDAuNzUsIDAuNCwgbm9pc2UgKiAwLjMgKyAwLjUpKTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxufVxcclxcblwiLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCh2Q29sb3IsIDEuMCk7XFxyXFxufVxcclxcblwiLFxyXG4gICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVBsYW5lRm9yRnJhbWVidWZmZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeV9iYXNlID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMTAwMCwgMTAwMCk7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIGdlb21ldHJ5LmZyb21HZW9tZXRyeShnZW9tZXRyeV9iYXNlKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0ZXh0dXJlOiB7XHJcbiAgICAgICAgICB0eXBlOiAndCcsXHJcbiAgICAgICAgICB2YWx1ZTogcmVuZGVyX3RhcmdldCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRleHR1cmUyOiB7XHJcbiAgICAgICAgICB0eXBlOiAndCcsXHJcbiAgICAgICAgICB2YWx1ZTogcmVuZGVyX3RhcmdldDIsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMyIHZVdjtcXHJcXG5cXHJcXG52b2lkIG1haW4odm9pZCkge1xcclxcbiAgdlV2ID0gdXY7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbn1cXHJcXG5cIixcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxyXFxudW5pZm9ybSB2ZWMyIHJlc29sdXRpb247XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlMjtcXHJcXG5cXHJcXG5jb25zdCBmbG9hdCBibHVyID0gMjAuMDtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZlYzQgY29sb3IgPSB2ZWM0KDAuMCk7XFxyXFxuICBmb3IgKGZsb2F0IHggPSAwLjA7IHggPCBibHVyOyB4Kyspe1xcclxcbiAgICBmb3IgKGZsb2F0IHkgPSAwLjA7IHkgPCBibHVyOyB5Kyspe1xcclxcbiAgICAgIGNvbG9yICs9IHRleHR1cmUyRCh0ZXh0dXJlLCB2VXYgLSAodmVjMih4LCB5KSAtIHZlYzIoYmx1ciAvIDIuMCkpIC8gcmVzb2x1dGlvbik7XFxyXFxuICAgIH1cXHJcXG4gIH1cXHJcXG4gIHZlYzQgY29sb3IyID0gY29sb3IgLyBwb3coYmx1ciwgMi4wKTtcXHJcXG4gIHZlYzQgY29sb3IzID0gdGV4dHVyZTJEKHRleHR1cmUyLCB2VXYpO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvcjMucmdiLCBmbG9vcihsZW5ndGgoY29sb3IyLnJnYikpKTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJ2JnLXdoaXRlJztcclxuICAgICAgZm9yY2UuYW5jaG9yLnNldCgxLCAwKTtcclxuXHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoMTAwMCwgMzAwLCAwKTtcclxuICAgICAgc3ViX2NhbWVyYTIuZm9yY2UubG9vay5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICBiZ19mYiA9IGNyZWF0ZUJhY2tncm91bmRJbkZyYW1lYnVmZmVyKCk7XHJcbiAgICAgIHBvaW50c19mYiA9IGNyZWF0ZVBvaW50c0luRnJhbWVidWZmZXIoKTtcclxuICAgICAgc3ViX3NjZW5lMi5hZGQoYmdfZmIpO1xyXG4gICAgICBzdWJfc2NlbmUyLmFkZChwb2ludHNfZmIpO1xyXG4gICAgICBzdWJfc2NlbmUyLmFkZChzdWJfbGlnaHQpO1xyXG5cclxuICAgICAgcG9pbnRzID0gY3JlYXRlUG9pbnRzRm9yQ3Jvc3NGYWRlKCk7XHJcbiAgICAgIHN1Yl9zY2VuZS5hZGQocG9pbnRzKTtcclxuICAgICAgc3ViX2NhbWVyYS5wb3NpdGlvbi5zZXQoMCwgMCwgMzAwMCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEubG9va0F0KDAsIDAsIDApO1xyXG5cclxuICAgICAgZnJhbWVidWZmZXIgPSBjcmVhdGVQbGFuZUZvckZyYW1lYnVmZmVyKCk7XHJcbiAgICAgIHNjZW5lLmFkZChmcmFtZWJ1ZmZlcik7XHJcbiAgICAgIGJnID0gY3JlYXRlQmFja2dyb3VuZCgpO1xyXG4gICAgICBzY2VuZS5hZGQoYmcpO1xyXG4gICAgICBiZ193ZiA9IGNyZWF0ZUJhY2tncm91bmRXaXJlKCk7XHJcbiAgICAgIHNjZW5lLmFkZChiZ193Zik7XHJcbiAgICAgIG9iaiA9IGNyZWF0ZU9iamVjdCgpO1xyXG4gICAgICBzY2VuZS5hZGQob2JqKTtcclxuICAgICAgbGlnaHQucG9zaXRpb24uc2V0KDAsIDEsIDApXHJcbiAgICAgIHNjZW5lLmFkZChsaWdodCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KDEwMDAsIDMwMCwgMCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcblxyXG4gICAgICB0aGlzLnJlc2l6ZVdpbmRvdygpO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnJztcclxuICAgICAgYmdfZmIuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBiZ19mYi5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHN1Yl9zY2VuZTIucmVtb3ZlKGJnX2ZiKTtcclxuICAgICAgcG9pbnRzX2ZiLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzX2ZiLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc3ViX3NjZW5lMi5yZW1vdmUocG9pbnRzX2ZiKTtcclxuICAgICAgc3ViX3NjZW5lMi5yZW1vdmUoc3ViX2xpZ2h0KTtcclxuXHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHN1Yl9zY2VuZS5yZW1vdmUocG9pbnRzKTtcclxuXHJcbiAgICAgIGZyYW1lYnVmZmVyLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgZnJhbWVidWZmZXIubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoZnJhbWVidWZmZXIpO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgICAgYmdfd2YuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBiZ193Zi5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShiZ193Zik7XHJcbiAgICAgIG9iai5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIG9iai5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShvYmopO1xyXG4gICAgICBzY2VuZS5yZW1vdmUobGlnaHQpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpIHtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuICAgICAgZnJhbWVidWZmZXIubG9va0F0KGNhbWVyYS5wb3NpdGlvbik7XHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuXHJcbiAgICAgIGJnX2ZiLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuICAgICAgcG9pbnRzX2ZiLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuXHJcbiAgICAgIGJnX3dmLnJvdGF0aW9uLnkgPSBwb2ludHMubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSAvIDEwMDA7XHJcbiAgICAgIG9iai5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlKys7XHJcblxyXG4gICAgICBmb3JjZS5hcHBseUhvb2soMCwgMC4xMik7XHJcbiAgICAgIGZvcmNlLmFwcGx5RHJhZygwLjE4KTtcclxuICAgICAgZm9yY2UudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hbmNob3IueSA9IE1hdGguc2luKHBvaW50cy5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlIC8gMTAwKSAqIDEwMDtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlTG9vaygpO1xyXG4gICAgICBzdWJfY2FtZXJhMi5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4xKTtcclxuICAgICAgc3ViX2NhbWVyYTIuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgc3ViX2NhbWVyYTIudXBkYXRlTG9vaygpO1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIoc3ViX3NjZW5lMiwgc3ViX2NhbWVyYTIsIHJlbmRlcl90YXJnZXQyKTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHN1Yl9zY2VuZSwgc3ViX2NhbWVyYSwgcmVuZGVyX3RhcmdldCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMiwgMzApO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpIHtcclxuICAgICAgZm9yY2UuYW5jaG9yLnNldCgxLCAwKTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3JjZS5hbmNob3Iuc2V0KDEsIDApO1xyXG4gICAgfSxcclxuICAgIHJlc2l6ZVdpbmRvdzogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwudW5pZm9ybXMucmVzb2x1dGlvbi52YWx1ZS5zZXQod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLnVuaWZvcm1zLnJlc29sdXRpb24udmFsdWUuc2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIE1vdmVyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9tb3ZlcicpO1xyXG52YXIgUG9pbnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludHMuanMnKTtcclxuXHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciBtb3ZlcnNfbnVtID0gMjAwMDA7XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBjb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgb3BhY2l0aWVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBncmF2aXR5ID0gbmV3IFRIUkVFLlZlY3RvcjMoMS41LCAwLCAwKTtcclxuICB2YXIgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICB2YXIgaXNfdG91Y2hlZCA9IGZhbHNlO1xyXG5cclxuICB2YXIgdXBkYXRlTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkge1xyXG4gICAgICAgIG1vdmVyLnRpbWUrKztcclxuICAgICAgICBtb3Zlci5hcHBseUZvcmNlKGdyYXZpdHkpO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgaWYgKG1vdmVyLmEgPCAwLjgpIHtcclxuICAgICAgICAgIG1vdmVyLmEgKz0gMC4wMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vdmVyLnZlbG9jaXR5LnggPiAxMDAwKSB7XHJcbiAgICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgIG1vdmVyLnRpbWUgPSAwO1xyXG4gICAgICAgICAgbW92ZXIuYSA9IDAuMDtcclxuICAgICAgICAgIG1vdmVyLmluYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnZlbG9jaXR5Lnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIudmVsb2NpdHkuejtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY3RpdmF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gZ3Jhdml0eS54ICogMTYpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZCA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDEyMCkgKiAzKTtcclxuICAgICAgICB2YXIgcmFuZ2UgPSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgyLCAxMjgpKSAvIE1hdGgubG9nKDEyOCkgKiAxNjAgKyA2MDtcclxuICAgICAgICB2YXIgeSA9IE1hdGguc2luKHJhZCkgKiByYW5nZTtcclxuICAgICAgICB2YXIgeiA9IE1hdGguY29zKHJhZCkgKiByYW5nZTtcclxuICAgICAgICB2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoLTEwMDAsIHksIHopO1xyXG4gICAgICAgIHZlY3Rvci5hZGQocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgICBtb3Zlci5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIG1vdmVyLmluaXQodmVjdG9yKTtcclxuICAgICAgICBtb3Zlci5hID0gMDtcclxuICAgICAgICBtb3Zlci5zaXplID0gVXRpbC5nZXRSYW5kb21JbnQoNSwgNjApO1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgaWYgKGNvdW50ID49IE1hdGgucG93KGdyYXZpdHkueCAqIDMsIGdyYXZpdHkueCAqIDAuNCkpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHVwZGF0ZVBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcG9pbnRzLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVRleHR1cmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIHZhciBncmFkID0gbnVsbDtcclxuICAgIHZhciB0ZXh0dXJlID0gbnVsbDtcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSAyNTY7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gMjU2O1xyXG4gICAgZ3JhZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudCgxMjgsIDEyOCwgMjAsIDEyOCwgMTI4LCAxMjgpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC4yLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC41LCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLjAsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDApJyk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcclxuICAgIGN0eC5hcmMoMTI4LCAxMjgsIDEyOCwgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXMpO1xyXG4gICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdGV4dHVyZTtcclxuICB9O1xyXG5cclxuICB2YXIgY2hhbmdlR3Jhdml0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGlzX3RvdWNoZWQpIHtcclxuICAgICAgaWYgKGdyYXZpdHkueCA8IDYpIGdyYXZpdHkueCArPSAwLjAyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGdyYXZpdHkueCA+IDEuNSkgZ3Jhdml0eS54IC09IDAuMTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc19udW07IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG5ldyBNb3ZlcigpO1xyXG4gICAgICAgIHZhciBoID0gVXRpbC5nZXRSYW5kb21JbnQoNjAsIDIxMCk7XHJcbiAgICAgICAgdmFyIHMgPSBVdGlsLmdldFJhbmRvbUludCgzMCwgOTApO1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyBoICsgJywgJyArIHMgKyAnJSwgNTAlKScpO1xyXG5cclxuICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKFV0aWwuZ2V0UmFuZG9tSW50KC0xMDAsIDEwMCksIDAsIDApKTtcclxuICAgICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIudmVsb2NpdHkueTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnZlbG9jaXR5Lno7XHJcbiAgICAgICAgY29sb3IudG9BcnJheShjb2xvcnMsIGkgKiAzKTtcclxuICAgICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgICAgfVxyXG4gICAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgICAgc2NlbmU6IHNjZW5lLFxyXG4gICAgICAgIHZzOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgY3VzdG9tQ29sb3I7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHZlcnRleE9wYWNpdHk7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHNpemU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZDb2xvciA9IGN1c3RvbUNvbG9yO1xcclxcbiAgZk9wYWNpdHkgPSB2ZXJ0ZXhPcGFjaXR5O1xcclxcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG4gIGdsX1BvaW50U2l6ZSA9IHNpemUgKiAoMzAwLjAgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiLFxyXG4gICAgICAgIGZzOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXHJcbiAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgICAgc2l6ZXM6IHNpemVzLFxyXG4gICAgICAgIHRleHR1cmU6IGNyZWF0ZVRleHR1cmUoKSxcclxuICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xyXG4gICAgICB9KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoODAwLCAwLCAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMub2JqKTtcclxuICAgICAgbW92ZXJzID0gW107XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGNoYW5nZUdyYXZpdHkoKTtcclxuICAgICAgYWN0aXZhdGVNb3ZlcigpO1xyXG4gICAgICB1cGRhdGVNb3ZlcigpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDA4KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rQXRDZW50ZXIoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgaXNfdG91Y2hlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci56ID0gdmVjdG9yX21vdXNlX21vdmUueCAqIDEyMDtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci55ID0gdmVjdG9yX21vdXNlX21vdmUueSAqIC0xMjA7XHJcbiAgICAgIC8vY2FtZXJhLmxvb2tBdENlbnRlcigpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueiA9IDA7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueSA9IDA7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcblxyXG52YXIgUG9pbnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludHMuanMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEpO1xyXG4gIH07XHJcbiAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgdmFyIGltYWdlX3ZlcnRpY2VzID0gW107XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBudWxsO1xyXG4gIHZhciBjb2xvcnMgPSBudWxsO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBudWxsO1xyXG4gIHZhciBzaXplcyA9IG51bGw7XHJcbiAgdmFyIGxlbmd0aF9zaWRlID0gNDAwO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIGNyZWF0ZWRfcG9pbnRzID0gZmFsc2U7XHJcblxyXG4gIHZhciBsb2FkSW1hZ2UgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgaW1hZ2Uuc3JjID0gJy4vaW1nL2ltYWdlX2RhdGEvZWxlcGhhbnQucG5nJztcclxuICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICB2YXIgZ2V0SW1hZ2VEYXRhID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjYW52YXMud2lkdGggPSBsZW5ndGhfc2lkZTtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBsZW5ndGhfc2lkZTtcclxuICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gICAgdmFyIGltYWdlX2RhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGxlbmd0aF9zaWRlLCBsZW5ndGhfc2lkZSk7XHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGxlbmd0aF9zaWRlOyB5KyspIHtcclxuICAgICAgaWYgKHkgJSAzID4gMCkgY29udGludWU7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgbGVuZ3RoX3NpZGU7IHgrKykge1xyXG4gICAgICAgIGlmICh4ICUgMyA+IDApIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmKGltYWdlX2RhdGEuZGF0YVsoeCArIHkgKiBsZW5ndGhfc2lkZSkgKiA0XSA+IDApIHtcclxuICAgICAgICAgIGltYWdlX3ZlcnRpY2VzLnB1c2goMCwgKHkgLSBsZW5ndGhfc2lkZSAvIDIpICogLTEsICh4IC0gbGVuZ3RoX3NpZGUvIDIpICogLTEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciBidWlsZFBvaW50cyA9IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KGltYWdlX3ZlcnRpY2VzKTtcclxuICAgIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoKTtcclxuICAgIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoIC8gMyk7XHJcbiAgICBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoIC8gMyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlX3ZlcnRpY2VzLmxlbmd0aCAvIDM7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2hzbCgnICsgKGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMl0gKyBpbWFnZV92ZXJ0aWNlc1tpICogMyArIDFdICsgbGVuZ3RoX3NpZGUpIC8gNVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnLCA2MCUsIDgwJSknKTtcclxuICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhpbWFnZV92ZXJ0aWNlc1tpICogM10sIGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMV0sIGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMl0pKTtcclxuICAgICAgbW92ZXIuaXNfYWN0aXZhdGUgPSB0cnVlO1xyXG4gICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgIGNvbG9yLnRvQXJyYXkoY29sb3JzLCBpICogMyk7XHJcbiAgICAgIG9wYWNpdGllc1tpXSA9IDE7XHJcbiAgICAgIHNpemVzW2ldID0gMTI7XHJcbiAgICB9XHJcbiAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgdnM6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyBjdXN0b21Db2xvcjtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgdmVydGV4T3BhY2l0eTtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgc2l6ZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdkNvbG9yID0gY3VzdG9tQ29sb3I7XFxyXFxuICBmT3BhY2l0eSA9IHZlcnRleE9wYWNpdHk7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbiAgZ2xfUG9pbnRTaXplID0gc2l6ZSAqICgzMDAuMCAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpO1xcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIGZzOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgdGV4dHVyZTogY3JlYXRlVGV4dHVyZSgpLFxyXG4gICAgICBibGVuZGluZzogVEhSRUUuTm9ybWFsQmxlbmRpbmdcclxuICAgIH0pO1xyXG4gICAgY3JlYXRlZF9wb2ludHMgPSB0cnVlO1xyXG4gIH07XHJcblxyXG4gIHZhciBhcHBseUZvcmNlVG9Qb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgdmFyIHJhZDEgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHJhZDIgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHNjYWxhciA9IFV0aWwuZ2V0UmFuZG9tSW50KDQwLCA4MCk7XHJcbiAgICAgIG1vdmVyLmlzX2FjdGl2YXRlID0gZmFsc2U7XHJcbiAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoVXRpbC5nZXRQb2xhckNvb3JkKHJhZDEsIHJhZDIsIHNjYWxhcikpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciB1cGRhdGVNb3ZlciA9ICBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICBpZiAobW92ZXIuYWNjZWxlcmF0aW9uLmxlbmd0aCgpIDwgMSkge1xyXG4gICAgICAgIG1vdmVyLmlzX2FjdGl2YXRlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZhdGUpIHtcclxuICAgICAgICBtb3Zlci5hcHBseUhvb2soMCwgMC4xOCk7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMjYpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG1vdmVyLmFwcGx5RHJhZygwLjAzNSk7XHJcbiAgICAgIH1cclxuICAgICAgbW92ZXIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgbW92ZXIudmVsb2NpdHkuc3ViKHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIudmVsb2NpdHkueCAtIHBvaW50cy52ZWxvY2l0eS54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnZlbG9jaXR5LnkgLSBwb2ludHMudmVsb2NpdHkueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci52ZWxvY2l0eS56IC0gcG9pbnRzLnZlbG9jaXR5Lng7XHJcbiAgICAgIG1vdmVyLnNpemUgPSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgxLCAxMjgpKSAvIE1hdGgubG9nKDEyOCkgKiBNYXRoLnNxcnQoZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCk7XHJcbiAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgIH1cclxuICAgIHBvaW50cy51cGRhdGVQb2ludHMoKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlVGV4dHVyZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgdmFyIGdyYWQgPSBudWxsO1xyXG4gICAgdmFyIHRleHR1cmUgPSBudWxsO1xyXG5cclxuICAgIGNhbnZhcy53aWR0aCA9IDIwMDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSAyMDA7XHJcbiAgICBncmFkID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KDEwMCwgMTAwLCAyMCwgMTAwLCAxMDAsIDEwMCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjIsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjUsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEuMCwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMCknKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xyXG4gICAgY3R4LmFyYygxMDAsIDEwMCwgMTAwLCAwLCBNYXRoLlBJIC8gMTgwLCB0cnVlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGxvYWRJbWFnZShmdW5jdGlvbigpIHtcclxuICAgICAgICBnZXRJbWFnZURhdGEoKTtcclxuICAgICAgICBidWlsZFBvaW50cyhzY2VuZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBjYW1lcmEuc2V0UG9sYXJDb29yZCgwLCAwLCAxNDAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBpbWFnZV92ZXJ0aWNlcyA9IFtdO1xyXG4gICAgICBtb3ZlcnMgPSBbXTtcclxuICAgICAgY2FtZXJhLnJhbmdlID0gMTAwMDtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgaWYgKGNyZWF0ZWRfcG9pbnRzKSB7XHJcbiAgICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgICAgIH1cclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcblxyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBhcHBseUZvcmNlVG9Qb2ludHMoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnogPSB2ZWN0b3JfbW91c2VfbW92ZS54ICogMTAwMDtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci55ID0gdmVjdG9yX21vdXNlX21vdmUueSAqIC0xMDAwO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueiA9IDA7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueSA9IDA7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgdGhpcy50b3VjaEVuZChzY2VuZSwgY2FtZXJhKVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxuXHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuICB2YXIgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xyXG4gIHZhciBpbnRlcnNlY3RzID0gbnVsbDtcclxuICB2YXIgY3ViZV9mb3JjZSA9IG5ldyBGb3JjZTMoKTtcclxuICB2YXIgY3ViZV9mb3JjZTIgPSBuZXcgRm9yY2UzKCk7XHJcbiAgdmFyIHZhY3Rvcl9yYXljYXN0ID0gbnVsbDtcclxuICBjdWJlX2ZvcmNlLm1hc3MgPSAxLjQ7XHJcblxyXG4gIHZhciBjcmVhdGVQbGFuZUZvclJheW1hcmNoaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeSg2LjAsIDYuMCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lMjoge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY2NlbGVyYXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIG1hdDQgbV9tYXRyaXg7XFxyXFxuXFxyXFxuZmxvYXQgaW52ZXJzZV8xXzAoZmxvYXQgbSkge1xcbiAgcmV0dXJuIDEuMCAvIG07XFxufVxcblxcbm1hdDIgaW52ZXJzZV8xXzAobWF0MiBtKSB7XFxuICByZXR1cm4gbWF0MihtWzFdWzFdLC1tWzBdWzFdLFxcbiAgICAgICAgICAgICAtbVsxXVswXSwgbVswXVswXSkgLyAobVswXVswXSptWzFdWzFdIC0gbVswXVsxXSptWzFdWzBdKTtcXG59XFxuXFxubWF0MyBpbnZlcnNlXzFfMChtYXQzIG0pIHtcXG4gIGZsb2F0IGEwMCA9IG1bMF1bMF0sIGEwMSA9IG1bMF1bMV0sIGEwMiA9IG1bMF1bMl07XFxuICBmbG9hdCBhMTAgPSBtWzFdWzBdLCBhMTEgPSBtWzFdWzFdLCBhMTIgPSBtWzFdWzJdO1xcbiAgZmxvYXQgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXTtcXG5cXG4gIGZsb2F0IGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMTtcXG4gIGZsb2F0IGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjA7XFxuICBmbG9hdCBiMjEgPSBhMjEgKiBhMTAgLSBhMTEgKiBhMjA7XFxuXFxuICBmbG9hdCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XFxuXFxuICByZXR1cm4gbWF0MyhiMDEsICgtYTIyICogYTAxICsgYTAyICogYTIxKSwgKGExMiAqIGEwMSAtIGEwMiAqIGExMSksXFxuICAgICAgICAgICAgICBiMTEsIChhMjIgKiBhMDAgLSBhMDIgKiBhMjApLCAoLWExMiAqIGEwMCArIGEwMiAqIGExMCksXFxuICAgICAgICAgICAgICBiMjEsICgtYTIxICogYTAwICsgYTAxICogYTIwKSwgKGExMSAqIGEwMCAtIGEwMSAqIGExMCkpIC8gZGV0O1xcbn1cXG5cXG5tYXQ0IGludmVyc2VfMV8wKG1hdDQgbSkge1xcbiAgZmxvYXRcXG4gICAgICBhMDAgPSBtWzBdWzBdLCBhMDEgPSBtWzBdWzFdLCBhMDIgPSBtWzBdWzJdLCBhMDMgPSBtWzBdWzNdLFxcbiAgICAgIGExMCA9IG1bMV1bMF0sIGExMSA9IG1bMV1bMV0sIGExMiA9IG1bMV1bMl0sIGExMyA9IG1bMV1bM10sXFxuICAgICAgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXSwgYTIzID0gbVsyXVszXSxcXG4gICAgICBhMzAgPSBtWzNdWzBdLCBhMzEgPSBtWzNdWzFdLCBhMzIgPSBtWzNdWzJdLCBhMzMgPSBtWzNdWzNdLFxcblxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcXG4gICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxcbiAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXFxuICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcXG4gICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxcbiAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXFxuICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyLFxcblxcbiAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcXG5cXG4gIHJldHVybiBtYXQ0KFxcbiAgICAgIGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSxcXG4gICAgICBhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDksXFxuICAgICAgYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzLFxcbiAgICAgIGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMyxcXG4gICAgICBhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcsXFxuICAgICAgYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3LFxcbiAgICAgIGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSxcXG4gICAgICBhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEsXFxuICAgICAgYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2LFxcbiAgICAgIGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNixcXG4gICAgICBhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDAsXFxuICAgICAgYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwLFxcbiAgICAgIGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNixcXG4gICAgICBhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYsXFxuICAgICAgYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwLFxcbiAgICAgIGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgLyBkZXQ7XFxufVxcblxcblxcblxcclxcbnZvaWQgbWFpbih2b2lkKSB7XFxyXFxuICBtX21hdHJpeCA9IGludmVyc2VfMV8wKG1vZGVsTWF0cml4KTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxufVxcclxcblwiLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG51bmlmb3JtIGZsb2F0IHRpbWUyO1xcclxcbnVuaWZvcm0gZmxvYXQgYWNjZWxlcmF0aW9uO1xcclxcbnVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcclxcblxcclxcbnZhcnlpbmcgbWF0NCBtX21hdHJpeDtcXHJcXG5cXHJcXG4vLyBjb25zdCB2ZWMzIGNQb3MgPSB2ZWMzKDAuMCwgMC4wLCAxMC4wKTtcXHJcXG5jb25zdCBmbG9hdCB0YXJnZXREZXB0aCA9IDMuNTtcXHJcXG5jb25zdCB2ZWMzIGxpZ2h0RGlyID0gdmVjMygwLjU3NywgLTAuNTc3LCAwLjU3Nyk7XFxyXFxuXFxyXFxudmVjMyBoc3YycmdiXzFfMCh2ZWMzIGMpe1xcclxcbiAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xcclxcbiAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xcclxcbiAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XFxyXFxufVxcclxcblxcblxcbi8vXFxuLy8gRGVzY3JpcHRpb24gOiBBcnJheSBhbmQgdGV4dHVyZWxlc3MgR0xTTCAyRC8zRC80RCBzaW1wbGV4XFxuLy8gICAgICAgICAgICAgICBub2lzZSBmdW5jdGlvbnMuXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzRfMSh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgbW9kMjg5XzRfMSh2ZWM0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV80XzIodmVjNCB4KSB7XFxuICAgICByZXR1cm4gbW9kMjg5XzRfMSgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxudmVjNCB0YXlsb3JJbnZTcXJ0XzRfMyh2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzRfNCh2ZWMzIHYpXFxuICB7XFxuICBjb25zdCB2ZWMyICBDID0gdmVjMigxLjAvNi4wLCAxLjAvMy4wKSA7XFxuICBjb25zdCB2ZWM0ICBEXzRfNSA9IHZlYzQoMC4wLCAwLjUsIDEuMCwgMi4wKTtcXG5cXG4vLyBGaXJzdCBjb3JuZXJcXG4gIHZlYzMgaSAgPSBmbG9vcih2ICsgZG90KHYsIEMueXl5KSApO1xcbiAgdmVjMyB4MCA9ICAgdiAtIGkgKyBkb3QoaSwgQy54eHgpIDtcXG5cXG4vLyBPdGhlciBjb3JuZXJzXFxuICB2ZWMzIGdfNF82ID0gc3RlcCh4MC55engsIHgwLnh5eik7XFxuICB2ZWMzIGwgPSAxLjAgLSBnXzRfNjtcXG4gIHZlYzMgaTEgPSBtaW4oIGdfNF82Lnh5eiwgbC56eHkgKTtcXG4gIHZlYzMgaTIgPSBtYXgoIGdfNF82Lnh5eiwgbC56eHkgKTtcXG5cXG4gIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcbiAgLy8gICB4MSA9IHgwIC0gaTEgICsgMS4wICogQy54eHg7XFxuICAvLyAgIHgyID0geDAgLSBpMiAgKyAyLjAgKiBDLnh4eDtcXG4gIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcbiAgdmVjMyB4MSA9IHgwIC0gaTEgKyBDLnh4eDtcXG4gIHZlYzMgeDIgPSB4MCAtIGkyICsgQy55eXk7IC8vIDIuMCpDLnggPSAxLzMgPSBDLnlcXG4gIHZlYzMgeDMgPSB4MCAtIERfNF81Lnl5eTsgICAgICAvLyAtMS4wKzMuMCpDLnggPSAtMC41ID0gLUQueVxcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV80XzEoaSk7XFxuICB2ZWM0IHAgPSBwZXJtdXRlXzRfMiggcGVybXV0ZV80XzIoIHBlcm11dGVfNF8yKFxcbiAgICAgICAgICAgICBpLnogKyB2ZWM0KDAuMCwgaTEueiwgaTIueiwgMS4wICkpXFxuICAgICAgICAgICArIGkueSArIHZlYzQoMC4wLCBpMS55LCBpMi55LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS54ICsgdmVjNCgwLjAsIGkxLngsIGkyLngsIDEuMCApKTtcXG5cXG4vLyBHcmFkaWVudHM6IDd4NyBwb2ludHMgb3ZlciBhIHNxdWFyZSwgbWFwcGVkIG9udG8gYW4gb2N0YWhlZHJvbi5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDkgKDQ5KjYgPSAyOTQpXFxuICBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyAvLyAxLjAvNy4wXFxuICB2ZWMzICBucyA9IG5fICogRF80XzUud3l6IC0gRF80XzUueHp4O1xcblxcbiAgdmVjNCBqID0gcCAtIDQ5LjAgKiBmbG9vcihwICogbnMueiAqIG5zLnopOyAgLy8gIG1vZChwLDcqNylcXG5cXG4gIHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7XFxuICB2ZWM0IHlfID0gZmxvb3IoaiAtIDcuMCAqIHhfICk7ICAgIC8vIG1vZChqLE4pXFxuXFxuICB2ZWM0IHggPSB4XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXFxuICB2ZWM0IGIwID0gdmVjNCggeC54eSwgeS54eSApO1xcbiAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cXG4gIC8vdmVjNCBzMCA9IHZlYzQobGVzc1RoYW4oYjAsMC4wKSkqMi4wIC0gMS4wO1xcbiAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuICB2ZWM0IHMwID0gZmxvb3IoYjApKjIuMCArIDEuMDtcXG4gIHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wO1xcbiAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXFxuICB2ZWM0IGEwID0gYjAueHp5dyArIHMwLnh6eXcqc2gueHh5eSA7XFxuICB2ZWM0IGExXzRfNyA9IGIxLnh6eXcgKyBzMS54enl3KnNoLnp6d3cgO1xcblxcbiAgdmVjMyBwMF80XzggPSB2ZWMzKGEwLnh5LGgueCk7XFxuICB2ZWMzIHAxID0gdmVjMyhhMC56dyxoLnkpO1xcbiAgdmVjMyBwMiA9IHZlYzMoYTFfNF83Lnh5LGgueik7XFxuICB2ZWMzIHAzID0gdmVjMyhhMV80XzcuencsaC53KTtcXG5cXG4vL05vcm1hbGlzZSBncmFkaWVudHNcXG4gIHZlYzQgbm9ybSA9IHRheWxvckludlNxcnRfNF8zKHZlYzQoZG90KHAwXzRfOCxwMF80XzgpLCBkb3QocDEscDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLHAzKSkpO1xcbiAgcDBfNF84ICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG5cXG4vLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG4gIHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApO1xcbiAgbSA9IG0gKiBtO1xcbiAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwXzRfOCx4MCksIGRvdChwMSx4MSksXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3QocDIseDIpLCBkb3QocDMseDMpICkgKTtcXG4gIH1cXG5cXG5cXG5cXG52ZWMzIHJvdGF0ZV8yXzkodmVjMyBwLCBmbG9hdCByYWRpYW5feCwgZmxvYXQgcmFkaWFuX3ksIGZsb2F0IHJhZGlhbl96KSB7XFxyXFxuICBtYXQzIG14ID0gbWF0MyhcXHJcXG4gICAgMS4wLCAwLjAsIDAuMCxcXHJcXG4gICAgMC4wLCBjb3MocmFkaWFuX3gpLCAtc2luKHJhZGlhbl94KSxcXHJcXG4gICAgMC4wLCBzaW4ocmFkaWFuX3gpLCBjb3MocmFkaWFuX3gpXFxyXFxuICApO1xcclxcbiAgbWF0MyBteSA9IG1hdDMoXFxyXFxuICAgIGNvcyhyYWRpYW5feSksIDAuMCwgc2luKHJhZGlhbl95KSxcXHJcXG4gICAgMC4wLCAxLjAsIDAuMCxcXHJcXG4gICAgLXNpbihyYWRpYW5feSksIDAuMCwgY29zKHJhZGlhbl95KVxcclxcbiAgKTtcXHJcXG4gIG1hdDMgbXogPSBtYXQzKFxcclxcbiAgICBjb3MocmFkaWFuX3opLCAtc2luKHJhZGlhbl96KSwgMC4wLFxcclxcbiAgICBzaW4ocmFkaWFuX3opLCBjb3MocmFkaWFuX3opLCAwLjAsXFxyXFxuICAgIDAuMCwgMC4wLCAxLjBcXHJcXG4gICk7XFxyXFxuICByZXR1cm4gbXggKiBteSAqIG16ICogcDtcXHJcXG59XFxyXFxuXFxuXFxuZmxvYXQgZEJveF8zXzEwKHZlYzMgcCwgdmVjMyBzaXplKSB7XFxyXFxuICByZXR1cm4gbGVuZ3RoKG1heChhYnMocCkgLSBzaXplLCAwLjApKTtcXHJcXG59XFxyXFxuXFxuXFxuXFxyXFxuZmxvYXQgZ2V0Tm9pc2UodmVjMyBwKSB7XFxyXFxuICByZXR1cm4gc25vaXNlXzRfNChwICogKDAuNCArIGFjY2VsZXJhdGlvbiAqIDAuMSkgKyB0aW1lIC8gMTAwLjApO1xcclxcbn1cXHJcXG5cXHJcXG52ZWMzIGdldFJvdGF0ZSh2ZWMzIHApIHtcXHJcXG4gIHJldHVybiByb3RhdGVfMl85KHAsIHJhZGlhbnModGltZTIpLCByYWRpYW5zKHRpbWUyICogMi4wKSwgcmFkaWFucyh0aW1lMikpO1xcclxcbn1cXHJcXG5cXHJcXG5mbG9hdCBkaXN0YW5jZUZ1bmModmVjMyBwKSB7XFxyXFxuICB2ZWM0IHAxID0gbV9tYXRyaXggKiB2ZWM0KHAsIDEuMCk7XFxyXFxuICBmbG9hdCBuMSA9IGdldE5vaXNlKHAxLnh5eik7XFxyXFxuICB2ZWMzIHAyID0gZ2V0Um90YXRlKHAxLnh5eik7XFxyXFxuICBmbG9hdCBkMSA9IGRCb3hfM18xMChwMiwgdmVjMygwLjggLSBtaW4oYWNjZWxlcmF0aW9uLCAwLjgpKSkgLSAwLjI7XFxyXFxuICBmbG9hdCBkMiA9IGRCb3hfM18xMChwMiwgdmVjMygxLjApKSAtIG4xO1xcclxcbiAgZmxvYXQgZDMgPSBkQm94XzNfMTAocDIsIHZlYzMoMC41ICsgYWNjZWxlcmF0aW9uICogMC40KSkgLSBuMTtcXHJcXG4gIHJldHVybiBtaW4obWF4KGQxLCAtZDIpLCBkMyk7XFxyXFxufVxcclxcblxcclxcbmZsb2F0IGRpc3RhbmNlRnVuY0ZvckZpbGwodmVjMyBwKSB7XFxyXFxuICB2ZWM0IHAxID0gbV9tYXRyaXggKiB2ZWM0KHAsIDEuMCk7XFxyXFxuICBmbG9hdCBuID0gZ2V0Tm9pc2UocDEueHl6KTtcXHJcXG4gIHZlYzMgcDIgPSBnZXRSb3RhdGUocDEueHl6KTtcXHJcXG4gIHJldHVybiBkQm94XzNfMTAocDIsIHZlYzMoMC41ICsgYWNjZWxlcmF0aW9uICogMC40KSkgLSBuO1xcclxcbn1cXHJcXG5cXHJcXG52ZWMzIGdldE5vcm1hbCh2ZWMzIHApIHtcXHJcXG4gIGNvbnN0IGZsb2F0IGQgPSAwLjE7XFxyXFxuICByZXR1cm4gbm9ybWFsaXplKHZlYzMoXFxyXFxuICAgIGRpc3RhbmNlRnVuYyhwICsgdmVjMyhkLCAwLjAsIDAuMCkpIC0gZGlzdGFuY2VGdW5jKHAgKyB2ZWMzKC1kLCAwLjAsIDAuMCkpLFxcclxcbiAgICBkaXN0YW5jZUZ1bmMocCArIHZlYzMoMC4wLCBkLCAwLjApKSAtIGRpc3RhbmNlRnVuYyhwICsgdmVjMygwLjAsIC1kLCAwLjApKSxcXHJcXG4gICAgZGlzdGFuY2VGdW5jKHAgKyB2ZWMzKDAuMCwgMC4wLCBkKSkgLSBkaXN0YW5jZUZ1bmMocCArIHZlYzMoMC4wLCAwLjAsIC1kKSlcXHJcXG4gICkpO1xcclxcbn1cXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2ZWMyIHAgPSAoZ2xfRnJhZ0Nvb3JkLnh5ICogMi4wIC0gcmVzb2x1dGlvbikgLyBtaW4ocmVzb2x1dGlvbi54LCByZXNvbHV0aW9uLnkpO1xcclxcblxcclxcbiAgdmVjMyBjRGlyID0gbm9ybWFsaXplKGNhbWVyYVBvc2l0aW9uICogLTEuMCk7XFxyXFxuICB2ZWMzIGNVcCAgPSB2ZWMzKDAuMCwgMS4wLCAwLjApO1xcclxcbiAgdmVjMyBjU2lkZSA9IGNyb3NzKGNEaXIsIGNVcCk7XFxyXFxuXFxyXFxuICB2ZWMzIHJheSA9IG5vcm1hbGl6ZShjU2lkZSAqIHAueCArIGNVcCAqIHAueSArIGNEaXIgKiB0YXJnZXREZXB0aCk7XFxyXFxuXFxyXFxuICBmbG9hdCBkaXN0YW5jZSA9IDAuMDtcXHJcXG4gIGZsb2F0IHJMZW4gPSAwLjA7XFxyXFxuICB2ZWMzIHJQb3MgPSBjYW1lcmFQb3NpdGlvbjtcXHJcXG4gIGZvcihpbnQgaSA9IDA7IGkgPCA2NDsgaSsrKXtcXHJcXG4gICAgZGlzdGFuY2UgPSBkaXN0YW5jZUZ1bmMoclBvcyk7XFxyXFxuICAgIHJMZW4gKz0gZGlzdGFuY2U7XFxyXFxuICAgIHJQb3MgPSBjYW1lcmFQb3NpdGlvbiArIHJheSAqIHJMZW4gKiAwLjI7XFxyXFxuICB9XFxyXFxuXFxyXFxuICB2ZWMzIG5vcm1hbCA9IGdldE5vcm1hbChyUG9zKTtcXHJcXG4gIGlmKGFicyhkaXN0YW5jZSkgPCAwLjUpe1xcclxcbiAgICBpZiAoZGlzdGFuY2VGdW5jRm9yRmlsbChyUG9zKSA+IDAuNSkge1xcclxcbiAgICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoaHN2MnJnYl8xXzAodmVjMyhkb3Qobm9ybWFsLCBjVXApICogMC44ICsgdGltZSAvIDQwMC4wLCAwLjIsIGRvdChub3JtYWwsIGNVcCkgKiAwLjggKyAwLjEpKSwgMS4wKTtcXHJcXG4gICAgfSBlbHNlIHtcXHJcXG4gICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGhzdjJyZ2JfMV8wKHZlYzMoZG90KG5vcm1hbCwgY1VwKSAqIDAuMSArIHRpbWUgLyA0MDAuMCwgMC44LCBkb3Qobm9ybWFsLCBjVXApICogMC4yICsgMC44KSksIDEuMCk7XFxyXFxuICAgIH1cXHJcXG4gIH0gZWxzZSB7XFxyXFxuICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoMC4wKTtcXHJcXG4gIH1cXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlXHJcbiAgICB9KTtcclxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIG1lc2gubmFtZSA9ICdNZXRhbEN1YmUnO1xyXG4gICAgcmV0dXJuIG1lc2g7XHJcbiAgfTtcclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZCA9ICBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeV9iYXNlID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeSgzMCwgNCk7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIGdlb21ldHJ5LmZyb21HZW9tZXRyeShnZW9tZXRyeV9iYXNlKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY2NlbGVyYXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcbnVuaWZvcm0gZmxvYXQgYWNjZWxlcmF0aW9uO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2UG9zaXRpb247XFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIG1hdDQgaW52ZXJ0TWF0cml4O1xcclxcblxcclxcbi8vXFxuLy8gRGVzY3JpcHRpb24gOiBBcnJheSBhbmQgdGV4dHVyZWxlc3MgR0xTTCAyRC8zRC80RCBzaW1wbGV4XFxuLy8gICAgICAgICAgICAgICBub2lzZSBmdW5jdGlvbnMuXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzNfMCh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgbW9kMjg5XzNfMCh2ZWM0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV8zXzEodmVjNCB4KSB7XFxuICAgICByZXR1cm4gbW9kMjg5XzNfMCgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxudmVjNCB0YXlsb3JJbnZTcXJ0XzNfMih2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzNfMyh2ZWMzIHYpXFxuICB7XFxuICBjb25zdCB2ZWMyICBDID0gdmVjMigxLjAvNi4wLCAxLjAvMy4wKSA7XFxuICBjb25zdCB2ZWM0ICBEXzNfNCA9IHZlYzQoMC4wLCAwLjUsIDEuMCwgMi4wKTtcXG5cXG4vLyBGaXJzdCBjb3JuZXJcXG4gIHZlYzMgaSAgPSBmbG9vcih2ICsgZG90KHYsIEMueXl5KSApO1xcbiAgdmVjMyB4MCA9ICAgdiAtIGkgKyBkb3QoaSwgQy54eHgpIDtcXG5cXG4vLyBPdGhlciBjb3JuZXJzXFxuICB2ZWMzIGdfM181ID0gc3RlcCh4MC55engsIHgwLnh5eik7XFxuICB2ZWMzIGwgPSAxLjAgLSBnXzNfNTtcXG4gIHZlYzMgaTEgPSBtaW4oIGdfM181Lnh5eiwgbC56eHkgKTtcXG4gIHZlYzMgaTIgPSBtYXgoIGdfM181Lnh5eiwgbC56eHkgKTtcXG5cXG4gIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcbiAgLy8gICB4MSA9IHgwIC0gaTEgICsgMS4wICogQy54eHg7XFxuICAvLyAgIHgyID0geDAgLSBpMiAgKyAyLjAgKiBDLnh4eDtcXG4gIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcbiAgdmVjMyB4MSA9IHgwIC0gaTEgKyBDLnh4eDtcXG4gIHZlYzMgeDIgPSB4MCAtIGkyICsgQy55eXk7IC8vIDIuMCpDLnggPSAxLzMgPSBDLnlcXG4gIHZlYzMgeDMgPSB4MCAtIERfM180Lnl5eTsgICAgICAvLyAtMS4wKzMuMCpDLnggPSAtMC41ID0gLUQueVxcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV8zXzAoaSk7XFxuICB2ZWM0IHAgPSBwZXJtdXRlXzNfMSggcGVybXV0ZV8zXzEoIHBlcm11dGVfM18xKFxcbiAgICAgICAgICAgICBpLnogKyB2ZWM0KDAuMCwgaTEueiwgaTIueiwgMS4wICkpXFxuICAgICAgICAgICArIGkueSArIHZlYzQoMC4wLCBpMS55LCBpMi55LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS54ICsgdmVjNCgwLjAsIGkxLngsIGkyLngsIDEuMCApKTtcXG5cXG4vLyBHcmFkaWVudHM6IDd4NyBwb2ludHMgb3ZlciBhIHNxdWFyZSwgbWFwcGVkIG9udG8gYW4gb2N0YWhlZHJvbi5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDkgKDQ5KjYgPSAyOTQpXFxuICBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyAvLyAxLjAvNy4wXFxuICB2ZWMzICBucyA9IG5fICogRF8zXzQud3l6IC0gRF8zXzQueHp4O1xcblxcbiAgdmVjNCBqID0gcCAtIDQ5LjAgKiBmbG9vcihwICogbnMueiAqIG5zLnopOyAgLy8gIG1vZChwLDcqNylcXG5cXG4gIHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7XFxuICB2ZWM0IHlfID0gZmxvb3IoaiAtIDcuMCAqIHhfICk7ICAgIC8vIG1vZChqLE4pXFxuXFxuICB2ZWM0IHggPSB4XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXFxuICB2ZWM0IGIwID0gdmVjNCggeC54eSwgeS54eSApO1xcbiAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cXG4gIC8vdmVjNCBzMCA9IHZlYzQobGVzc1RoYW4oYjAsMC4wKSkqMi4wIC0gMS4wO1xcbiAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuICB2ZWM0IHMwID0gZmxvb3IoYjApKjIuMCArIDEuMDtcXG4gIHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wO1xcbiAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXFxuICB2ZWM0IGEwID0gYjAueHp5dyArIHMwLnh6eXcqc2gueHh5eSA7XFxuICB2ZWM0IGExXzNfNiA9IGIxLnh6eXcgKyBzMS54enl3KnNoLnp6d3cgO1xcblxcbiAgdmVjMyBwMF8zXzcgPSB2ZWMzKGEwLnh5LGgueCk7XFxuICB2ZWMzIHAxID0gdmVjMyhhMC56dyxoLnkpO1xcbiAgdmVjMyBwMiA9IHZlYzMoYTFfM182Lnh5LGgueik7XFxuICB2ZWMzIHAzID0gdmVjMyhhMV8zXzYuencsaC53KTtcXG5cXG4vL05vcm1hbGlzZSBncmFkaWVudHNcXG4gIHZlYzQgbm9ybSA9IHRheWxvckludlNxcnRfM18yKHZlYzQoZG90KHAwXzNfNyxwMF8zXzcpLCBkb3QocDEscDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLHAzKSkpO1xcbiAgcDBfM183ICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG5cXG4vLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG4gIHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApO1xcbiAgbSA9IG0gKiBtO1xcbiAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwXzNfNyx4MCksIGRvdChwMSx4MSksXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3QocDIseDIpLCBkb3QocDMseDMpICkgKTtcXG4gIH1cXG5cXG5cXG5cXG52ZWMzIGhzdjJyZ2JfMV84KHZlYzMgYyl7XFxyXFxuICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XFxyXFxuICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XFxyXFxuICByZXR1cm4gYy56ICogbWl4KEsueHh4LCBjbGFtcChwIC0gSy54eHgsIDAuMCwgMS4wKSwgYy55KTtcXHJcXG59XFxyXFxuXFxuXFxuZmxvYXQgaW52ZXJzZV80XzkoZmxvYXQgbSkge1xcbiAgcmV0dXJuIDEuMCAvIG07XFxufVxcblxcbm1hdDIgaW52ZXJzZV80XzkobWF0MiBtKSB7XFxuICByZXR1cm4gbWF0MihtWzFdWzFdLC1tWzBdWzFdLFxcbiAgICAgICAgICAgICAtbVsxXVswXSwgbVswXVswXSkgLyAobVswXVswXSptWzFdWzFdIC0gbVswXVsxXSptWzFdWzBdKTtcXG59XFxuXFxubWF0MyBpbnZlcnNlXzRfOShtYXQzIG0pIHtcXG4gIGZsb2F0IGEwMCA9IG1bMF1bMF0sIGEwMSA9IG1bMF1bMV0sIGEwMiA9IG1bMF1bMl07XFxuICBmbG9hdCBhMTAgPSBtWzFdWzBdLCBhMTEgPSBtWzFdWzFdLCBhMTIgPSBtWzFdWzJdO1xcbiAgZmxvYXQgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXTtcXG5cXG4gIGZsb2F0IGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMTtcXG4gIGZsb2F0IGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjA7XFxuICBmbG9hdCBiMjEgPSBhMjEgKiBhMTAgLSBhMTEgKiBhMjA7XFxuXFxuICBmbG9hdCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XFxuXFxuICByZXR1cm4gbWF0MyhiMDEsICgtYTIyICogYTAxICsgYTAyICogYTIxKSwgKGExMiAqIGEwMSAtIGEwMiAqIGExMSksXFxuICAgICAgICAgICAgICBiMTEsIChhMjIgKiBhMDAgLSBhMDIgKiBhMjApLCAoLWExMiAqIGEwMCArIGEwMiAqIGExMCksXFxuICAgICAgICAgICAgICBiMjEsICgtYTIxICogYTAwICsgYTAxICogYTIwKSwgKGExMSAqIGEwMCAtIGEwMSAqIGExMCkpIC8gZGV0O1xcbn1cXG5cXG5tYXQ0IGludmVyc2VfNF85KG1hdDQgbSkge1xcbiAgZmxvYXRcXG4gICAgICBhMDAgPSBtWzBdWzBdLCBhMDEgPSBtWzBdWzFdLCBhMDIgPSBtWzBdWzJdLCBhMDMgPSBtWzBdWzNdLFxcbiAgICAgIGExMCA9IG1bMV1bMF0sIGExMSA9IG1bMV1bMV0sIGExMiA9IG1bMV1bMl0sIGExMyA9IG1bMV1bM10sXFxuICAgICAgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXSwgYTIzID0gbVsyXVszXSxcXG4gICAgICBhMzAgPSBtWzNdWzBdLCBhMzEgPSBtWzNdWzFdLCBhMzIgPSBtWzNdWzJdLCBhMzMgPSBtWzNdWzNdLFxcblxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcXG4gICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxcbiAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXFxuICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcXG4gICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxcbiAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXFxuICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyLFxcblxcbiAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcXG5cXG4gIHJldHVybiBtYXQ0KFxcbiAgICAgIGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSxcXG4gICAgICBhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDksXFxuICAgICAgYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzLFxcbiAgICAgIGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMyxcXG4gICAgICBhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcsXFxuICAgICAgYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3LFxcbiAgICAgIGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSxcXG4gICAgICBhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEsXFxuICAgICAgYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2LFxcbiAgICAgIGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNixcXG4gICAgICBhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDAsXFxuICAgICAgYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwLFxcbiAgICAgIGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNixcXG4gICAgICBhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYsXFxuICAgICAgYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwLFxcbiAgICAgIGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgLyBkZXQ7XFxufVxcblxcblxcbnZlYzMgcm90YXRlXzJfMTAodmVjMyBwLCBmbG9hdCByYWRpYW5feCwgZmxvYXQgcmFkaWFuX3ksIGZsb2F0IHJhZGlhbl96KSB7XFxyXFxuICBtYXQzIG14ID0gbWF0MyhcXHJcXG4gICAgMS4wLCAwLjAsIDAuMCxcXHJcXG4gICAgMC4wLCBjb3MocmFkaWFuX3gpLCAtc2luKHJhZGlhbl94KSxcXHJcXG4gICAgMC4wLCBzaW4ocmFkaWFuX3gpLCBjb3MocmFkaWFuX3gpXFxyXFxuICApO1xcclxcbiAgbWF0MyBteSA9IG1hdDMoXFxyXFxuICAgIGNvcyhyYWRpYW5feSksIDAuMCwgc2luKHJhZGlhbl95KSxcXHJcXG4gICAgMC4wLCAxLjAsIDAuMCxcXHJcXG4gICAgLXNpbihyYWRpYW5feSksIDAuMCwgY29zKHJhZGlhbl95KVxcclxcbiAgKTtcXHJcXG4gIG1hdDMgbXogPSBtYXQzKFxcclxcbiAgICBjb3MocmFkaWFuX3opLCAtc2luKHJhZGlhbl96KSwgMC4wLFxcclxcbiAgICBzaW4ocmFkaWFuX3opLCBjb3MocmFkaWFuX3opLCAwLjAsXFxyXFxuICAgIDAuMCwgMC4wLCAxLjBcXHJcXG4gICk7XFxyXFxuICByZXR1cm4gbXggKiBteSAqIG16ICogcDtcXHJcXG59XFxyXFxuXFxuXFxuXFxyXFxudmVjMyBnZXRSb3RhdGUodmVjMyBwKSB7XFxyXFxuICByZXR1cm4gcm90YXRlXzJfMTAocCwgcmFkaWFucyh0aW1lIC8gNi4wKSwgcmFkaWFucyh0aW1lIC8gNy4wKSwgcmFkaWFucyh0aW1lIC8gOC4wKSk7XFxyXFxufVxcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGZsb2F0IHVwZGF0ZVRpbWUgPSB0aW1lIC8gNDAwLjA7XFxyXFxuICB2ZWMzIHBfcm90YXRlID0gZ2V0Um90YXRlKHBvc2l0aW9uKTtcXHJcXG4gIGZsb2F0IG5vaXNlID0gc25vaXNlXzNfMyh2ZWMzKHBfcm90YXRlIC8gMTIuMSArIHVwZGF0ZVRpbWUgKiAwLjUpKTtcXHJcXG4gIHZlYzMgcF9ub2lzZSA9IHBfcm90YXRlICsgcF9yb3RhdGUgKiBub2lzZSAvIDIwLjAgKiAobWluKGFjY2VsZXJhdGlvbiwgNi4wKSArIDEuMCk7XFxyXFxuXFxyXFxuICB2UG9zaXRpb24gPSBwX25vaXNlO1xcclxcbiAgdkNvbG9yID0gaHN2MnJnYl8xXzgodmVjMyh1cGRhdGVUaW1lICsgcG9zaXRpb24ueSAvIDQwMC4wLCAwLjA1ICsgbWluKGFjY2VsZXJhdGlvbiAvIDEwLjAsIDAuMjUpLCAxLjApKTtcXHJcXG4gIGludmVydE1hdHJpeCA9IGludmVyc2VfNF85KG1vZGVsTWF0cml4KTtcXHJcXG5cXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocF9ub2lzZSwgMS4wKTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcbnVuaWZvcm0gZmxvYXQgYWNjZWxlcmF0aW9uO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2UG9zaXRpb247XFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIG1hdDQgaW52ZXJ0TWF0cml4O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZlYzMgbm9ybWFsID0gbm9ybWFsaXplKGNyb3NzKGRGZHgodlBvc2l0aW9uKSwgZEZkeSh2UG9zaXRpb24pKSk7XFxyXFxuICB2ZWMzIGludl9saWdodCA9IG5vcm1hbGl6ZShpbnZlcnRNYXRyaXggKiB2ZWM0KDAuNywgLTAuNywgMC43LCAxLjApKS54eXo7XFxyXFxuICBmbG9hdCBkaWZmID0gKGRvdChub3JtYWwsIGludl9saWdodCkgKyAxLjApIC8gNC4wICsgMC40O1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCh2Q29sb3IgKiBkaWZmLCAxLjApO1xcclxcbn1cXHJcXG5cIixcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmcsXHJcbiAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlXHJcbiAgICB9KTtcclxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIG1lc2gubmFtZSA9ICdCYWNrZ3JvdW5kJztcclxuICAgIHJldHVybiBtZXNoO1xyXG4gIH07XHJcblxyXG4gIHZhciBtb3ZlTWV0YWxDdWJlID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICBpZiAoY3ViZV9mb3JjZS5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgPiAwLjEgfHwgIXZlY3RvcikgcmV0dXJuO1xyXG4gICAgcmF5Y2FzdGVyLnNldEZyb21DYW1lcmEodmVjdG9yLCBjYW1lcmEpO1xyXG4gICAgaW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKHNjZW5lLmNoaWxkcmVuKVswXTtcclxuICAgIGlmKGludGVyc2VjdHMgJiYgaW50ZXJzZWN0cy5vYmplY3QubmFtZSA9PSAnTWV0YWxDdWJlJykge1xyXG4gICAgICBjdWJlX2ZvcmNlLmFuY2hvci5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChcclxuICAgICAgICBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgtMjAsIDIwKSksXHJcbiAgICAgICAgVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSksXHJcbiAgICAgICAgVXRpbC5nZXRSYW5kb21JbnQoMzAsIDkwKSAvIDEwXHJcbiAgICAgICkpO1xyXG4gICAgICBjdWJlX2ZvcmNlMi5hcHBseUZvcmNlKG5ldyBUSFJFRS5WZWN0b3IzKDEsIDAsIDApKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgcGxhbmUgPSBjcmVhdGVQbGFuZUZvclJheW1hcmNoaW5nKCk7XHJcbiAgdmFyIGJnID0gY3JlYXRlQmFja2dyb3VuZCgpO1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBzY2VuZS5hZGQocGxhbmUpO1xyXG4gICAgICBzY2VuZS5hZGQoYmcpO1xyXG4gICAgICBjYW1lcmEuc2V0UG9sYXJDb29yZCgwLCBVdGlsLmdldFJhZGlhbig5MCksIDI0KTtcclxuXHJcbiAgICAgIHRoaXMucmVzaXplV2luZG93KCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHBsYW5lLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcGxhbmUubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocGxhbmUpO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgbW92ZU1ldGFsQ3ViZShzY2VuZSwgY2FtZXJhLCB2YWN0b3JfcmF5Y2FzdCk7XHJcbiAgICAgIGN1YmVfZm9yY2UuYXBwbHlIb29rKDAsIDAuMTIpO1xyXG4gICAgICBjdWJlX2ZvcmNlLmFwcGx5RHJhZygwLjAxKTtcclxuICAgICAgY3ViZV9mb3JjZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjdWJlX2ZvcmNlMi5hcHBseUhvb2soMCwgMC4wMDUpO1xyXG4gICAgICBjdWJlX2ZvcmNlMi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY3ViZV9mb3JjZTIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgcGxhbmUucG9zaXRpb24uY29weShjdWJlX2ZvcmNlLnZlbG9jaXR5KTtcclxuICAgICAgcGxhbmUubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSsrO1xyXG4gICAgICBwbGFuZS5tYXRlcmlhbC51bmlmb3Jtcy50aW1lMi52YWx1ZSArPSAxICsgTWF0aC5mbG9vcihjdWJlX2ZvcmNlLmFjY2VsZXJhdGlvbi5sZW5ndGgoKSAqIDQpO1xyXG4gICAgICBwbGFuZS5tYXRlcmlhbC51bmlmb3Jtcy5hY2NlbGVyYXRpb24udmFsdWUgPSBjdWJlX2ZvcmNlLmFjY2VsZXJhdGlvbi5sZW5ndGgoKTtcclxuICAgICAgYmcubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSsrO1xyXG4gICAgICBiZy5tYXRlcmlhbC51bmlmb3Jtcy5hY2NlbGVyYXRpb24udmFsdWUgPSBjdWJlX2ZvcmNlMi52ZWxvY2l0eS5sZW5ndGgoKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcblxyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIHZhY3Rvcl9yYXljYXN0ID0gdmVjdG9yX21vdXNlX21vdmU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpIHtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgfSxcclxuICAgIHJlc2l6ZVdpbmRvdzogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBwbGFuZS5tYXRlcmlhbC51bmlmb3Jtcy5yZXNvbHV0aW9uLnZhbHVlLnNldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiJdfQ==
