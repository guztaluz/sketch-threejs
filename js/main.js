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
      "#define GLSLIFY 1\nuniform vec2 resolution;\r\nuniform sampler2D velocity;\r\nuniform sampler2D acceleration;\r\nuniform vec2 anchor;\r\n\r\nvarying vec2 vUv;\r\n\r\n#define PRECISION 0.000001\r\n\r\nvec3 drag(vec3 a, float value) {\r\n  return normalize(a * -1.0 + PRECISION) * length(a) * value;\r\n}\r\n\r\nvec3 hook(vec3 v, vec3 anchor, float rest_length, float k) {\r\n  return normalize(v - anchor + PRECISION) * (-1.0 * k * (length(v - anchor) - rest_length));\r\n}\r\n\r\nvec3 attract(vec3 v1, vec3 v2, float m1, float m2, float g) {\r\n  return g * m1 * m2 / pow(clamp(length(v2 - v1), 5.0, 30.0), 2.0) * normalize(v2 - v1 + PRECISION);\r\n}\r\n\r\nvoid main(void) {\r\n  vec3 v = texture2D(velocity, vUv).xyz;\r\n  vec3 a = texture2D(acceleration, vUv).xyz;\r\n  vec3 a2 = a + normalize(vec3(anchor * 100.0, 0.0) - v) / 3.0;\r\n  vec3 a3 = a2 + drag(a2, 0.003);\r\n  gl_FragColor = vec4(a3, 1.0);\r\n}\r\n"
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
    update: '2016.6.14',
    description: 'use fragment shader to perticle moving.',
  },
  {
    name: 'hole',
    obj: require('./sketches/hole'),
    posted: '2016.5.10',
    update: '',
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
    for (var i = 0; i < Math.pow(length, 2); i++) {
      vertices_base.push(0, 0, 0);
      uvs_base.push(
        i % length * (1 / (length - 1)),
        Math.floor(i / length) * (1 / (length - 1))
      );
      colors_base.push(Util.getRandomInt(0, 90) / 360, 0.8, 1);
    }
    var vertices = new Float32Array(vertices_base);
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    var uvs = new Float32Array(uvs_base);
    geometry.addAttribute('uv2', new THREE.BufferAttribute(uvs, 2));
    var colors = new Float32Array(colors_base);
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
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
      vertexShader: "#define GLSLIFY 1\nattribute vec2 uv2;\r\nattribute vec3 color;\r\n\r\nuniform sampler2D velocity;\r\nuniform sampler2D acceleration;\r\n\r\nvarying float vAcceleration;\r\nvarying vec3 vColor;\r\n\r\nvoid main(void) {\r\n  vec4 update_position = modelViewMatrix * texture2D(velocity, uv2);\r\n  vAcceleration = length(texture2D(acceleration, uv2).xyz);\r\n  vColor = color;\r\n  gl_PointSize = 1.0;\r\n  gl_Position = projectionMatrix * update_position;\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nvarying float vAcceleration;\r\nvarying vec3 vColor;\r\n\r\nuniform float time;\r\n\r\nvec3 hsv2rgb_1_0(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n\r\nvoid main(void) {\r\n  gl_FragColor = vec4(hsv2rgb_1_0(vec3(vColor.x + time / 3600.0, vColor.y, vColor.z)), 0.4);\r\n}\r\n",
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
        Util.getRandomInt(10, 200)
      );
      vertices.push(v.x, v.y, v.z);
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
      camera.force.position.anchor.set(0, 0, 600);
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

var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

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
        vs: vs,
        fs: fs,
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

var vs = "#define GLSLIFY 1\nuniform float time;\r\nuniform float radius;\r\nuniform float distort;\r\n\r\nvarying vec3 vColor;\r\nvarying vec3 vNormal;\r\n\r\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2_1(vec4 x) {\n     return mod289_2_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_2_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_2_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_2_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_2_5;\n  vec3 i1 = min( g_2_5.xyz, l.zxy );\n  vec3 i2 = max( g_2_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_2_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2_0(i);\n  vec4 p = permute_2_1( permute_2_1( permute_2_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_2_4.wyz - D_2_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_2_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_2_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_2_6.xy,h.z);\n  vec3 p3 = vec3(a1_2_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_2_2(vec4(dot(p0_2_7,p0_2_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_2_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_2_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 hsv2rgb_1_8(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n\r\nvoid main() {\r\n  float updateTime = time / 1000.0;\r\n  float noise = snoise_2_3(vec3(position / 400.1 + updateTime * 5.0));\r\n  vec4 mvPosition = modelViewMatrix * vec4(position * (noise * pow(distort, 2.0) + radius), 1.0);\r\n\r\n  vColor = hsv2rgb_1_8(vec3(noise * distort * 0.3 + updateTime, 0.2, 1.0));\r\n  vNormal = normal;\r\n\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nvarying vec3 vColor;\r\nvarying vec3 vNormal;\r\n\r\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2_1(vec4 x) {\n     return mod289_2_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_2_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_2_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_2_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_2_5;\n  vec3 i1 = min( g_2_5.xyz, l.zxy );\n  vec3 i2 = max( g_2_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_2_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2_0(i);\n  vec4 p = permute_2_1( permute_2_1( permute_2_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_2_4.wyz - D_2_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_2_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_2_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_2_6.xy,h.z);\n  vec3 p3 = vec3(a1_2_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_2_2(vec4(dot(p0_2_7,p0_2_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_2_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_2_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 hsv2rgb_1_8(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n\r\nstruct HemisphereLight {\r\n  vec3 direction;\r\n  vec3 groundColor;\r\n  vec3 skyColor;\r\n};\r\nuniform HemisphereLight hemisphereLights[NUM_HEMI_LIGHTS];\r\n\r\nvoid main() {\r\n  vec3 light = vec3(0.0);\r\n  light += (dot(hemisphereLights[0].direction, vNormal) + 1.0) * hemisphereLights[0].skyColor * 0.5;\r\n  light += (-dot(hemisphereLights[0].direction, vNormal) + 1.0) * hemisphereLights[0].groundColor * 0.5;\r\n  gl_FragColor = vec4(vColor * light, 1.0);\r\n}\r\n";
var vs_pp = "#define GLSLIFY 1\nvarying vec2 vUv;\r\n\r\nvoid main(void) {\r\n  vUv = uv;\r\n  gl_Position = vec4(position, 1.0);\r\n}\r\n";
var fs_pp = "#define GLSLIFY 1\nuniform float time;\r\nuniform vec2 resolution;\r\nuniform float acceleration;\r\nuniform sampler2D texture;\r\n\r\nconst float blur = 16.0;\r\n\r\nvarying vec2 vUv;\r\n\r\nfloat random2_1_0(vec2 c){\r\n    return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);\r\n}\r\n\n\n//\n// Description : Array and textureless GLSL 2D simplex noise function.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_1(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289_2_1(vec2 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute_2_2(vec3 x) {\n  return mod289_2_1(((x*34.0)+1.0)*x);\n}\n\nfloat snoise_2_3(vec2 v)\n  {\n  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626,  // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i  = floor(v + dot(v, C.yy) );\n  vec2 x0 = v -   i + dot(i, C.xx);\n\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n// Permutations\n  i = mod289_2_1(i); // Avoid truncation effects in permutation\n  vec3 p = permute_2_2( permute_2_2( i.y + vec3(0.0, i1.y, 1.0 ))\n    + i.x + vec3(0.0, i1.x, 1.0 ));\n\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n// Normalise gradients implicitly by scaling m\n// Approximation of: m *= inversesqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n// Compute final noise value at P\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\n\n\n\r\nvec2 diffUv(float v, float diff) {\r\n  return vUv + (vec2(v + snoise_2_3(vec2(gl_FragCoord.y + time) / 100.0), 0.0) * diff + vec2(v * 3.0, 0.0)) / resolution;\r\n}\r\n\r\nfloat randomNoise(vec2 p) {\r\n  return (random2_1_0(p - vec2(sin(time))) * 2.0 - 1.0) * max(length(acceleration), 0.08);\r\n}\r\n\r\nvoid main() {\r\n  float diff = 300.0 * length(acceleration);\r\n  vec2 uv_r = diffUv(0.0, diff);\r\n  vec2 uv_g = diffUv(1.0, diff);\r\n  vec2 uv_b = diffUv(-1.0, diff);\r\n  float r = texture2D(texture, uv_r).r + randomNoise(uv_r);\r\n  float g = texture2D(texture, uv_g).g + randomNoise(uv_g);\r\n  float b = texture2D(texture, uv_b).b + randomNoise(uv_b);\r\n  gl_FragColor = vec4(r, g, b, 1.0);\r\n}\r\n";

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
      vertexShader: vs,
      fragmentShader: fs,
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
      vertexShader: vs_pp,
      fragmentShader: fs_pp,
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

var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

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
        vs: vs,
        fs: fs,
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
// var vs = glslify('../../glsl/hole.vs');
// var fs = glslify('../../glsl/hole.fs');
var vs_points = "#define GLSLIFY 1\nattribute vec3 radian;\r\n\r\nuniform float time;\r\nuniform vec2 resolution;\r\nuniform float size;\r\nuniform vec2 force;\r\n\r\nvoid main() {\r\n  float radius = max(min(resolution.x, resolution.y), 600.0) * cos(radians(time * 2.0) + radian.z);\r\n  float radian_base = radians(time * 2.0);\r\n  vec3 update_positon = position + vec3(\r\n    cos(radian_base + radian.x) * cos(radian_base + radian.y) * radius,\r\n    cos(radian_base + radian.x) * sin(radian_base + radian.y) * radius,\r\n    sin(radian_base + radian.x) * radius\r\n  ) * force.x;\r\n  vec4 mvPosition = modelViewMatrix * vec4(update_positon, 1.0);\r\n\r\n  gl_PointSize = (size + force.y) * (abs(sin(radian_base + radian.z))) * (size / length(mvPosition.xyz)) * min(resolution.x, resolution.y);\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs_points = "#define GLSLIFY 1\nuniform float size;\r\n\r\nvoid main() {\r\n  vec3 n;\r\n  n.xy = gl_PointCoord.xy * 2.0 - 1.0;\r\n  n.z = 1.0 - dot(n.xy, n.xy);\r\n  if (n.z < 0.0) discard;\r\n  gl_FragColor = vec4(1.0);\r\n}\r\n";
var vs_fb = "#define GLSLIFY 1\nvarying vec2 vUv;\r\n\r\nvoid main(void) {\r\n  vUv = uv;\r\n  gl_Position = vec4(position, 1.0);\r\n}\r\n";
var fs_fb = "#define GLSLIFY 1\nuniform float time;\r\nuniform vec2 resolution;\r\nuniform sampler2D texture;\r\nuniform sampler2D texture2;\r\n\r\nconst float blur = 20.0;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n  vec4 color = vec4(0.0);\r\n  for (float x = 0.0; x < blur; x++){\r\n    for (float y = 0.0; y < blur; y++){\r\n      color += texture2D(texture, vUv - (vec2(x, y) - vec2(blur / 2.0)) / resolution);\r\n    }\r\n  }\r\n  vec4 color2 = color / pow(blur, 2.0);\r\n  vec4 color3 = texture2D(texture2, vUv);\r\n  gl_FragColor = vec4(color3.rgb, floor(length(color2.rgb)));\r\n}\r\n";

var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };

  var points = null;
  var bg = null;
  var light = new THREE.HemisphereLight(0xfffffff, 0xfffffff, 1);

  var sub_scene = new THREE.Scene();
  var sub_camera = new ForceCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  var render_target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
  var framebuffer = null;

  var sub_scene2 = new THREE.Scene();
  var sub_camera2 = new ForceCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  var sub_light = new THREE.HemisphereLight(0x000000, 0x444444, 1);
  var render_target2 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
  var bg_fb = null;
  var obj_fb = null;

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
      vertexShader: vs_points,
      fragmentShader: fs_points,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    return new THREE.Points(geometry, material);
  };

  var createBackground = function() {
    var geometry = new THREE.SphereGeometry(1000, 32, 32);
    var material = new THREE.MeshPhongMaterial({
      side: THREE.BackSide,
      map: new THREE.TextureLoader().load('img/hole/background.jpg'),
    });
    return new THREE.Mesh(geometry, material);
  };

  var createObjectInFramebuffer = function(radius, detail) {
    var geometry = new THREE.OctahedronGeometry(radius, detail);
    var material = new THREE.MeshPhongMaterial({
      side: THREE.BackSide,
      shading: THREE.FlatShading,
    });
    return new THREE.Mesh(geometry, material);
  }

  var createPlaneForFramebuffer = function() {
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
        texture: {
          type: 't',
          value: render_target,
        },
        texture2: {
          type: 't',
          value: render_target2,
        },
      },
      vertexShader: vs_fb,
      fragmentShader: fs_fb,
      transparent: true
    });
    return new THREE.Mesh(geometry, material);
  }

  Sketch.prototype = {
    init: function(scene, camera) {
      document.body.className = 'bg-white';
      force.anchor.set(1, 0);

      sub_camera2.force.position.anchor.set(1000, 300, 0);
      sub_camera2.force.look.anchor.set(0, 0, 0);
      obj_fb = createObjectInFramebuffer(60, 2);
      sub_scene2.add(obj_fb);
      sub_scene2.add(sub_light);

      points = createPointsForCrossFade();
      sub_scene.add(points);
      sub_camera.position.set(0, 0, 3000);
      sub_camera.lookAt(0, 0, 0);

      framebuffer = createPlaneForFramebuffer();
      scene.add(framebuffer);
      bg = createBackground();
      scene.add(bg);
      scene.add(light);
      camera.force.position.anchor.set(1000, -300, 0);
      camera.force.look.anchor.set(0, 0, 0);
    },
    remove: function(scene) {
      document.body.className = '';

      obj_fb.geometry.dispose();
      obj_fb.material.dispose();
      sub_scene2.remove(obj_fb);
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
      scene.remove(light);
    },
    render: function(scene, camera, renderer) {
      points.material.uniforms.time.value++;
      framebuffer.material.uniforms.time.value++;
      bg.rotation.y = points.material.uniforms.time.value / 200;
      obj_fb.rotation.y = points.material.uniforms.time.value / 200;
      force.applyHook(0, 0.06);
      force.applyDrag(0.2);
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
      force.anchor.set(2, 40);
      sub_camera2.force.position.anchor.set(600, -300, 0);
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      force.anchor.set(1, 0);
      sub_camera2.force.position.anchor.set(1000, 300, 0);
    },
    mouseOut: function(scene, camera) {
      force.anchor.set(1, 0);
      sub_camera2.force.position.anchor.set(1000, 300, 0);
    },
    resizeWindow: function(scene, camera) {
      render_target.setSize(window.innerWidth, window.innerHeight);
      render_target2.setSize(window.innerWidth, window.innerHeight);
      sub_camera.resize(window.innerWidth, window.innerHeight);
      sub_camera2.resize(window.innerWidth, window.innerHeight);
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

var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

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
        vs: vs,
        fs: fs,
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
var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

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
      vs: vs,
      fs: fs,
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
var vs = "#define GLSLIFY 1\nvarying mat4 m_matrix;\r\n\r\nfloat inverse_1_0(float m) {\n  return 1.0 / m;\n}\n\nmat2 inverse_1_0(mat2 m) {\n  return mat2(m[1][1],-m[0][1],\n             -m[1][0], m[0][0]) / (m[0][0]*m[1][1] - m[0][1]*m[1][0]);\n}\n\nmat3 inverse_1_0(mat3 m) {\n  float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];\n  float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];\n  float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];\n\n  float b01 = a22 * a11 - a12 * a21;\n  float b11 = -a22 * a10 + a12 * a20;\n  float b21 = a21 * a10 - a11 * a20;\n\n  float det = a00 * b01 + a01 * b11 + a02 * b21;\n\n  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),\n              b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),\n              b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;\n}\n\nmat4 inverse_1_0(mat4 m) {\n  float\n      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],\n      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],\n      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],\n      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],\n\n      b00 = a00 * a11 - a01 * a10,\n      b01 = a00 * a12 - a02 * a10,\n      b02 = a00 * a13 - a03 * a10,\n      b03 = a01 * a12 - a02 * a11,\n      b04 = a01 * a13 - a03 * a11,\n      b05 = a02 * a13 - a03 * a12,\n      b06 = a20 * a31 - a21 * a30,\n      b07 = a20 * a32 - a22 * a30,\n      b08 = a20 * a33 - a23 * a30,\n      b09 = a21 * a32 - a22 * a31,\n      b10 = a21 * a33 - a23 * a31,\n      b11 = a22 * a33 - a23 * a32,\n\n      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n\n  return mat4(\n      a11 * b11 - a12 * b10 + a13 * b09,\n      a02 * b10 - a01 * b11 - a03 * b09,\n      a31 * b05 - a32 * b04 + a33 * b03,\n      a22 * b04 - a21 * b05 - a23 * b03,\n      a12 * b08 - a10 * b11 - a13 * b07,\n      a00 * b11 - a02 * b08 + a03 * b07,\n      a32 * b02 - a30 * b05 - a33 * b01,\n      a20 * b05 - a22 * b02 + a23 * b01,\n      a10 * b10 - a11 * b08 + a13 * b06,\n      a01 * b08 - a00 * b10 - a03 * b06,\n      a30 * b04 - a31 * b02 + a33 * b00,\n      a21 * b02 - a20 * b04 - a23 * b00,\n      a11 * b07 - a10 * b09 - a12 * b06,\n      a00 * b09 - a01 * b07 + a02 * b06,\n      a31 * b01 - a30 * b03 - a32 * b00,\n      a20 * b03 - a21 * b01 + a22 * b00) / det;\n}\n\n\n\r\nvoid main(void) {\r\n  m_matrix = inverse_1_0(modelMatrix);\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform float time;\r\nuniform float time2;\r\nuniform float acceleration;\r\nuniform vec2 resolution;\r\n\r\nvarying mat4 m_matrix;\r\n\r\n// const vec3 cPos = vec3(0.0, 0.0, 10.0);\r\nconst float targetDepth = 3.5;\r\nconst vec3 lightDir = vec3(0.577, -0.577, 0.577);\r\n\r\nvec3 hsv2rgb_1_0(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_4_1(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_4_1(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_4_2(vec4 x) {\n     return mod289_4_1(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_4_3(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_4_4(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_4_5 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_4_6 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_4_6;\n  vec3 i1 = min( g_4_6.xyz, l.zxy );\n  vec3 i2 = max( g_4_6.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_4_5.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_4_1(i);\n  vec4 p = permute_4_2( permute_4_2( permute_4_2(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_4_5.wyz - D_4_5.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_4_7 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_4_8 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_4_7.xy,h.z);\n  vec3 p3 = vec3(a1_4_7.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_4_3(vec4(dot(p0_4_8,p0_4_8), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_4_8 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_4_8,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 rotate_2_9(vec3 p, float radian_x, float radian_y, float radian_z) {\r\n  mat3 mx = mat3(\r\n    1.0, 0.0, 0.0,\r\n    0.0, cos(radian_x), -sin(radian_x),\r\n    0.0, sin(radian_x), cos(radian_x)\r\n  );\r\n  mat3 my = mat3(\r\n    cos(radian_y), 0.0, sin(radian_y),\r\n    0.0, 1.0, 0.0,\r\n    -sin(radian_y), 0.0, cos(radian_y)\r\n  );\r\n  mat3 mz = mat3(\r\n    cos(radian_z), -sin(radian_z), 0.0,\r\n    sin(radian_z), cos(radian_z), 0.0,\r\n    0.0, 0.0, 1.0\r\n  );\r\n  return mx * my * mz * p;\r\n}\r\n\n\nfloat dBox_3_10(vec3 p, vec3 size) {\r\n  return length(max(abs(p) - size, 0.0));\r\n}\r\n\n\n\r\nfloat getNoise(vec3 p) {\r\n  return snoise_4_4(p * (0.4 + acceleration * 0.1) + time / 100.0);\r\n}\r\n\r\nvec3 getRotate(vec3 p) {\r\n  return rotate_2_9(p, radians(time2), radians(time2 * 2.0), radians(time2));\r\n}\r\n\r\nfloat distanceFunc(vec3 p) {\r\n  vec4 p1 = m_matrix * vec4(p, 1.0);\r\n  float n1 = getNoise(p1.xyz);\r\n  vec3 p2 = getRotate(p1.xyz);\r\n  float d1 = dBox_3_10(p2, vec3(0.8 - min(acceleration, 0.8))) - 0.2;\r\n  float d2 = dBox_3_10(p2, vec3(1.0)) - n1;\r\n  float d3 = dBox_3_10(p2, vec3(0.5 + acceleration * 0.4)) - n1;\r\n  return min(max(d1, -d2), d3);\r\n}\r\n\r\nfloat distanceFuncForFill(vec3 p) {\r\n  vec4 p1 = m_matrix * vec4(p, 1.0);\r\n  float n = getNoise(p1.xyz);\r\n  vec3 p2 = getRotate(p1.xyz);\r\n  return dBox_3_10(p2, vec3(0.5 + acceleration * 0.4)) - n;\r\n}\r\n\r\nvec3 getNormal(vec3 p) {\r\n  const float d = 0.1;\r\n  return normalize(vec3(\r\n    distanceFunc(p + vec3(d, 0.0, 0.0)) - distanceFunc(p + vec3(-d, 0.0, 0.0)),\r\n    distanceFunc(p + vec3(0.0, d, 0.0)) - distanceFunc(p + vec3(0.0, -d, 0.0)),\r\n    distanceFunc(p + vec3(0.0, 0.0, d)) - distanceFunc(p + vec3(0.0, 0.0, -d))\r\n  ));\r\n}\r\n\r\nvoid main() {\r\n  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);\r\n\r\n  vec3 cDir = normalize(cameraPosition * -1.0);\r\n  vec3 cUp  = vec3(0.0, 1.0, 0.0);\r\n  vec3 cSide = cross(cDir, cUp);\r\n\r\n  vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir * targetDepth);\r\n\r\n  float distance = 0.0;\r\n  float rLen = 0.0;\r\n  vec3 rPos = cameraPosition;\r\n  for(int i = 0; i < 64; i++){\r\n    distance = distanceFunc(rPos);\r\n    rLen += distance;\r\n    rPos = cameraPosition + ray * rLen * 0.2;\r\n  }\r\n\r\n  vec3 normal = getNormal(rPos);\r\n  if(abs(distance) < 0.5){\r\n    if (distanceFuncForFill(rPos) > 0.5) {\r\n      gl_FragColor = vec4(hsv2rgb_1_0(vec3(dot(normal, cUp) * 0.8 + time / 400.0, 0.2, dot(normal, cUp) * 0.8 + 0.1)), 1.0);\r\n    } else {\r\n      gl_FragColor = vec4(hsv2rgb_1_0(vec3(dot(normal, cUp) * 0.1 + time / 400.0, 0.8, dot(normal, cUp) * 0.2 + 0.8)), 1.0);\r\n    }\r\n  } else {\r\n    gl_FragColor = vec4(0.0);\r\n  }\r\n}\r\n";
var vs_bg = "#define GLSLIFY 1\nuniform float time;\r\nuniform float acceleration;\r\n\r\nvarying vec3 vPosition;\r\nvarying vec3 vColor;\r\nvarying mat4 invertMatrix;\r\n\r\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_3_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_3_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_3_1(vec4 x) {\n     return mod289_3_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_3_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_3_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_3_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_3_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_3_5;\n  vec3 i1 = min( g_3_5.xyz, l.zxy );\n  vec3 i2 = max( g_3_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_3_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_3_0(i);\n  vec4 p = permute_3_1( permute_3_1( permute_3_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_3_4.wyz - D_3_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_3_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_3_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_3_6.xy,h.z);\n  vec3 p3 = vec3(a1_3_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_3_2(vec4(dot(p0_3_7,p0_3_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_3_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_3_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 hsv2rgb_1_8(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\nfloat inverse_4_9(float m) {\n  return 1.0 / m;\n}\n\nmat2 inverse_4_9(mat2 m) {\n  return mat2(m[1][1],-m[0][1],\n             -m[1][0], m[0][0]) / (m[0][0]*m[1][1] - m[0][1]*m[1][0]);\n}\n\nmat3 inverse_4_9(mat3 m) {\n  float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];\n  float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];\n  float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];\n\n  float b01 = a22 * a11 - a12 * a21;\n  float b11 = -a22 * a10 + a12 * a20;\n  float b21 = a21 * a10 - a11 * a20;\n\n  float det = a00 * b01 + a01 * b11 + a02 * b21;\n\n  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),\n              b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),\n              b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;\n}\n\nmat4 inverse_4_9(mat4 m) {\n  float\n      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],\n      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],\n      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],\n      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],\n\n      b00 = a00 * a11 - a01 * a10,\n      b01 = a00 * a12 - a02 * a10,\n      b02 = a00 * a13 - a03 * a10,\n      b03 = a01 * a12 - a02 * a11,\n      b04 = a01 * a13 - a03 * a11,\n      b05 = a02 * a13 - a03 * a12,\n      b06 = a20 * a31 - a21 * a30,\n      b07 = a20 * a32 - a22 * a30,\n      b08 = a20 * a33 - a23 * a30,\n      b09 = a21 * a32 - a22 * a31,\n      b10 = a21 * a33 - a23 * a31,\n      b11 = a22 * a33 - a23 * a32,\n\n      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n\n  return mat4(\n      a11 * b11 - a12 * b10 + a13 * b09,\n      a02 * b10 - a01 * b11 - a03 * b09,\n      a31 * b05 - a32 * b04 + a33 * b03,\n      a22 * b04 - a21 * b05 - a23 * b03,\n      a12 * b08 - a10 * b11 - a13 * b07,\n      a00 * b11 - a02 * b08 + a03 * b07,\n      a32 * b02 - a30 * b05 - a33 * b01,\n      a20 * b05 - a22 * b02 + a23 * b01,\n      a10 * b10 - a11 * b08 + a13 * b06,\n      a01 * b08 - a00 * b10 - a03 * b06,\n      a30 * b04 - a31 * b02 + a33 * b00,\n      a21 * b02 - a20 * b04 - a23 * b00,\n      a11 * b07 - a10 * b09 - a12 * b06,\n      a00 * b09 - a01 * b07 + a02 * b06,\n      a31 * b01 - a30 * b03 - a32 * b00,\n      a20 * b03 - a21 * b01 + a22 * b00) / det;\n}\n\n\nvec3 rotate_2_10(vec3 p, float radian_x, float radian_y, float radian_z) {\r\n  mat3 mx = mat3(\r\n    1.0, 0.0, 0.0,\r\n    0.0, cos(radian_x), -sin(radian_x),\r\n    0.0, sin(radian_x), cos(radian_x)\r\n  );\r\n  mat3 my = mat3(\r\n    cos(radian_y), 0.0, sin(radian_y),\r\n    0.0, 1.0, 0.0,\r\n    -sin(radian_y), 0.0, cos(radian_y)\r\n  );\r\n  mat3 mz = mat3(\r\n    cos(radian_z), -sin(radian_z), 0.0,\r\n    sin(radian_z), cos(radian_z), 0.0,\r\n    0.0, 0.0, 1.0\r\n  );\r\n  return mx * my * mz * p;\r\n}\r\n\n\n\r\nvec3 getRotate(vec3 p) {\r\n  return rotate_2_10(p, radians(time / 6.0), radians(time / 7.0), radians(time / 8.0));\r\n}\r\n\r\nvoid main() {\r\n  float updateTime = time / 400.0;\r\n  vec3 p_rotate = getRotate(position);\r\n  float noise = snoise_3_3(vec3(p_rotate / 12.1 + updateTime * 0.5));\r\n  vec3 p_noise = p_rotate + p_rotate * noise / 20.0 * (min(acceleration, 6.0) + 1.0);\r\n\r\n  vPosition = p_noise;\r\n  vColor = hsv2rgb_1_8(vec3(updateTime + position.y / 400.0, 0.05 + min(acceleration / 10.0, 0.25), 1.0));\r\n  invertMatrix = inverse_4_9(modelMatrix);\r\n\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(p_noise, 1.0);\r\n}\r\n";
var fs_bg = "#define GLSLIFY 1\nuniform float time;\r\nuniform float acceleration;\r\n\r\nvarying vec3 vPosition;\r\nvarying vec3 vColor;\r\nvarying mat4 invertMatrix;\r\n\r\nvoid main() {\r\n  vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));\r\n  vec3 inv_light = normalize(invertMatrix * vec4(0.7, -0.7, 0.7, 1.0)).xyz;\r\n  float diff = (dot(normal, inv_light) + 1.0) / 4.0 + 0.4;\r\n  gl_FragColor = vec4(vColor * diff, 1.0);\r\n}\r\n";

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
      vertexShader: vs,
      fragmentShader: fs,
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
      vertexShader: vs_bg,
      fragmentShader: fs_bg,
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2RlYm91bmNlLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UyLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UzLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2VfY2FtZXJhLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2VfaGVtaXNwaGVyZV9saWdodC5qcyIsInNyYy9qcy9tb2R1bGVzL2ZvcmNlX3BvaW50X2xpZ2h0LmpzIiwic3JjL2pzL21vZHVsZXMvbW92ZXIuanMiLCJzcmMvanMvbW9kdWxlcy9waHlzaWNzX3JlbmRlcmVyLmpzIiwic3JjL2pzL21vZHVsZXMvcG9pbnRzLmpzIiwic3JjL2pzL21vZHVsZXMvdXRpbC5qcyIsInNyYy9qcy9za2V0Y2hlcy5qcyIsInNyYy9qcy9za2V0Y2hlcy9hdHRyYWN0LmpzIiwic3JjL2pzL3NrZXRjaGVzL2NvbWV0LmpzIiwic3JjL2pzL3NrZXRjaGVzL2Rpc3RvcnQuanMiLCJzcmMvanMvc2tldGNoZXMvZmlyZV9iYWxsLmpzIiwic3JjL2pzL3NrZXRjaGVzL2dhbGxlcnkuanMiLCJzcmMvanMvc2tldGNoZXMvaG9sZS5qcyIsInNyYy9qcy9za2V0Y2hlcy9oeXBlcl9zcGFjZS5qcyIsInNyYy9qcy9za2V0Y2hlcy9pbWFnZV9kYXRhLmpzIiwic3JjL2pzL3NrZXRjaGVzL21ldGFsX2N1YmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9kZWJvdW5jZScpO1xyXG52YXIgRm9yY2VDYW1lcmEgPSByZXF1aXJlKCcuL21vZHVsZXMvZm9yY2VfY2FtZXJhJyk7XHJcblxyXG52YXIgdmVjdG9yX21vdXNlX2Rvd24gPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xyXG52YXIgdmVjdG9yX21vdXNlX21vdmUgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xyXG52YXIgdmVjdG9yX21vdXNlX2VuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcblxyXG52YXIgY2FudmFzID0gbnVsbDtcclxudmFyIHJlbmRlcmVyID0gbnVsbDtcclxudmFyIHNjZW5lID0gbnVsbDtcclxudmFyIGNhbWVyYSA9IG51bGw7XHJcblxyXG52YXIgcnVubmluZyA9IG51bGw7XHJcbnZhciBza2V0Y2hlcyA9IHJlcXVpcmUoJy4vc2tldGNoZXMnKTtcclxudmFyIHNrZXRjaF9pZCA9IDA7XHJcblxyXG52YXIgbWV0YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWV0YScpO1xyXG52YXIgYnRuX3RvZ2dsZV9tZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi1zd2l0Y2gtbWVudScpO1xyXG52YXIgbWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZW51Jyk7XHJcbnZhciBzZWxlY3Rfc2tldGNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlbGVjdC1za2V0Y2gnKTtcclxudmFyIHNrZXRjaF90aXRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5za2V0Y2gtdGl0bGUnKTtcclxudmFyIHNrZXRjaF9kYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNrZXRjaC1kYXRlJyk7XHJcbnZhciBza2V0Y2hfZGVzY3JpcHRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2tldGNoLWRlc2NyaXB0aW9uJyk7XHJcblxyXG52YXIgaW5pdFRocmVlID0gZnVuY3Rpb24oKSB7XHJcbiAgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xyXG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xyXG4gICAgYW50aWFsaWFzOiB0cnVlLFxyXG4gICAgdG9uZU1hcHBpbmc6IFRIUkVFLk5vVG9uZU1hcHBpbmcsXHJcbiAgfSk7XHJcbiAgaWYgKCFyZW5kZXJlcikge1xyXG4gICAgYWxlcnQoJ1RocmVlLmpz44Gu5Yid5pyf5YyW44Gr5aSx5pWX44GX44G+44GX44Gf44CCJyk7XHJcbiAgfVxyXG4gIHJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgY2FudmFzLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG4gIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHgwMDAwMDAsIDEuMCk7XHJcblxyXG4gIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcblxyXG4gIGNhbWVyYSA9IG5ldyBGb3JjZUNhbWVyYSgzNSwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDEsIDEwMDAwKTtcclxufTtcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgc2V0U2tldGNoSWQoKTtcclxuICBidWlsZE1lbnUoKTtcclxuICBpbml0VGhyZWUoKTtcclxuICBzdGFydFJ1blNrZXRjaChza2V0Y2hlc1tza2V0Y2hlcy5sZW5ndGggLSBza2V0Y2hfaWRdKTtcclxuICByZW5kZXJsb29wKCk7XHJcbiAgc2V0RXZlbnQoKTtcclxuICBkZWJvdW5jZSh3aW5kb3csICdyZXNpemUnLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICByZXNpemVSZW5kZXJlcigpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudmFyIGdldFBhcmFtZXRlckJ5TmFtZSA9IGZ1bmN0aW9uKG5hbWUpIHtcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sIFwiXFxcXFtcIikucmVwbGFjZSgvW1xcXV0vLCBcIlxcXFxdXCIpO1xyXG4gIHZhciByZWdleCA9IG5ldyBSZWdFeHAoXCJbXFxcXD8mXVwiICsgbmFtZSArIFwiPShbXiYjXSopXCIpO1xyXG4gIHZhciByZXN1bHRzID0gcmVnZXguZXhlYyhsb2NhdGlvbi5zZWFyY2gpO1xyXG4gIHJldHVybiByZXN1bHRzID09PSBudWxsID8gXCJcIiA6IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xyXG59O1xyXG5cclxudmFyIHNldFNrZXRjaElkID0gZnVuY3Rpb24oKSB7XHJcbiAgc2tldGNoX2lkID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdza2V0Y2hfaWQnKTtcclxuICBpZiAoc2tldGNoX2lkID09IG51bGwgfHwgc2tldGNoX2lkID4gc2tldGNoZXMubGVuZ3RoIHx8IHNrZXRjaF9pZCA8IDEpIHtcclxuICAgIHNrZXRjaF9pZCA9IHNrZXRjaGVzLmxlbmd0aDtcclxuICB9XHJcbn07XHJcblxyXG52YXIgYnVpbGRNZW51ID0gZnVuY3Rpb24oKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBza2V0Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIHNrZXRjaCA9IHNrZXRjaGVzW2ldO1xyXG4gICAgdmFyIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICBkb20uc2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JywgaSk7XHJcbiAgICBkb20uaW5uZXJIVE1MID0gJzxzcGFuPicgKyBza2V0Y2gubmFtZSArICc8L3NwYW4+JztcclxuICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBzd2l0Y2hTa2V0Y2goc2tldGNoZXNbdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnKV0pO1xyXG4gICAgfSk7XHJcbiAgICBzZWxlY3Rfc2tldGNoLmFwcGVuZENoaWxkKGRvbSk7XHJcbiAgfVxyXG59O1xyXG5cclxudmFyIHN0YXJ0UnVuU2tldGNoID0gZnVuY3Rpb24oc2tldGNoKSB7XHJcbiAgcnVubmluZyA9IG5ldyBza2V0Y2gub2JqKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKTtcclxuICBza2V0Y2hfdGl0bGUuaW5uZXJIVE1MID0gc2tldGNoLm5hbWU7XHJcbiAgc2tldGNoX2RhdGUuaW5uZXJIVE1MID0gKHNrZXRjaC51cGRhdGUubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdwb3N0ZWQ6ICcgKyBza2V0Y2gucG9zdGVkICsgJyAvIHVwZGF0ZTogJyArIHNrZXRjaC51cGRhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdwb3N0ZWQ6ICcgKyBza2V0Y2gucG9zdGVkO1xyXG4gIHNrZXRjaF9kZXNjcmlwdGlvbi5pbm5lckhUTUwgPSBza2V0Y2guZGVzY3JpcHRpb247XHJcbn07XHJcblxyXG52YXIgc3dpdGNoU2tldGNoID0gZnVuY3Rpb24oc2tldGNoKSB7XHJcbiAgcnVubmluZy5yZW1vdmUoc2NlbmUsIGNhbWVyYSk7XHJcbiAgc3RhcnRSdW5Ta2V0Y2goc2tldGNoKTtcclxuICBzd2l0Y2hNZW51KCk7XHJcbn07XHJcblxyXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgcmVuZGVyZXIuY2xlYXIoKTtcclxuICBydW5uaW5nLnJlbmRlcihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcik7XHJcbiAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xyXG59O1xyXG5cclxudmFyIHJlbmRlcmxvb3AgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcclxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVybG9vcCk7XHJcbiAgcmVuZGVyKCk7XHJcbn07XHJcblxyXG52YXIgcmVzaXplUmVuZGVyZXIgPSBmdW5jdGlvbigpIHtcclxuICByZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gIGNhbWVyYS5yZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgcmVzaXplV2luZG93KCk7XHJcbn07XHJcblxyXG52YXIgc2V0RXZlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaFN0YXJ0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoTW92ZShldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZLCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hFbmQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoU3RhcnQoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFksIHRydWUpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hNb3ZlKGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZLCB0cnVlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hFbmQoZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSwgdHJ1ZSk7XHJcbiAgfSk7XHJcblxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBtb3VzZU91dCgpO1xyXG4gIH0pO1xyXG5cclxuICBidG5fdG9nZ2xlX21lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHN3aXRjaE1lbnUoKTtcclxuICB9KTtcclxufTtcclxuXHJcbnZhciB0cmFuc2Zvcm1WZWN0b3IyZCA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gIHZlY3Rvci54ID0gKHZlY3Rvci54IC8gd2luZG93LmlubmVyV2lkdGgpICogMiAtIDE7XHJcbiAgdmVjdG9yLnkgPSAtICh2ZWN0b3IueSAvIHdpbmRvdy5pbm5lckhlaWdodCkgKiAyICsgMTtcclxufTtcclxuXHJcbnZhciB0b3VjaFN0YXJ0ID0gZnVuY3Rpb24oeCwgeSwgdG91Y2hfZXZlbnQpIHtcclxuICB2ZWN0b3JfbW91c2VfZG93bi5zZXQoeCwgeSk7XHJcbiAgdHJhbnNmb3JtVmVjdG9yMmQodmVjdG9yX21vdXNlX2Rvd24pO1xyXG4gIGlmIChydW5uaW5nLnRvdWNoU3RhcnQpIHJ1bm5pbmcudG91Y2hTdGFydChzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93bik7XHJcbn07XHJcblxyXG52YXIgdG91Y2hNb3ZlID0gZnVuY3Rpb24oeCwgeSwgdG91Y2hfZXZlbnQpIHtcclxuICB2ZWN0b3JfbW91c2VfbW92ZS5zZXQoeCwgeSk7XHJcbiAgdHJhbnNmb3JtVmVjdG9yMmQodmVjdG9yX21vdXNlX21vdmUpO1xyXG4gIGlmIChydW5uaW5nLnRvdWNoTW92ZSkgcnVubmluZy50b3VjaE1vdmUoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxufTtcclxuXHJcbnZhciB0b3VjaEVuZCA9IGZ1bmN0aW9uKHgsIHksIHRvdWNoX2V2ZW50KSB7XHJcbiAgdmVjdG9yX21vdXNlX2VuZC5zZXQoeCwgeSk7XHJcbiAgaWYgKHJ1bm5pbmcudG91Y2hFbmQpIHJ1bm5pbmcudG91Y2hFbmQoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCk7XHJcbn07XHJcblxyXG52YXIgbW91c2VPdXQgPSBmdW5jdGlvbigpIHtcclxuICB2ZWN0b3JfbW91c2VfZW5kLnNldCgwLCAwKTtcclxuICBpZiAocnVubmluZy5tb3VzZU91dCkgcnVubmluZy5tb3VzZU91dChzY2VuZSwgY2FtZXJhKTtcclxufTtcclxuXHJcbnZhciBzd2l0Y2hNZW51ID0gZnVuY3Rpb24oKSB7XHJcbiAgYnRuX3RvZ2dsZV9tZW51LmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScpO1xyXG4gIG1lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJyk7XHJcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb2ludGVkJyk7XHJcbn07XHJcblxyXG52YXIgcmVzaXplV2luZG93ID0gZnVuY3Rpb24oKSB7XHJcbiAgaWYgKHJ1bm5pbmcucmVzaXplV2luZG93KSBydW5uaW5nLnJlc2l6ZVdpbmRvdyhzY2VuZSwgY2FtZXJhKTtcclxufTtcclxuXHJcblxyXG5pbml0KCk7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBldmVudFR5cGUsIGNhbGxiYWNrKXtcclxuICB2YXIgdGltZXI7XHJcblxyXG4gIG9iamVjdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgY2FsbGJhY2soZXZlbnQpO1xyXG4gICAgfSwgNTAwKTtcclxuICB9LCBmYWxzZSk7XHJcbn07XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIEZvcmNlMiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbiAgICB0aGlzLmFuY2hvciA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbiAgICB0aGlzLm1hc3MgPSAxO1xyXG4gIH07XHJcbiAgXHJcbiAgRm9yY2UyLnByb3RvdHlwZS51cGRhdGVWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uZGl2aWRlU2NhbGFyKHRoaXMubWFzcyk7XHJcbiAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5Rm9yY2UgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZCh2ZWN0b3IpO1xyXG4gIH07XHJcbiAgRm9yY2UyLnByb3RvdHlwZS5hcHBseUZyaWN0aW9uID0gZnVuY3Rpb24obXUsIG5vcm1hbCkge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKTtcclxuICAgIGlmICghbm9ybWFsKSBub3JtYWwgPSAxO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIoLTEpO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcihtdSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcbiAgRm9yY2UyLnByb3RvdHlwZS5hcHBseURyYWcgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIodGhpcy5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgKiB2YWx1ZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcbiAgRm9yY2UyLnByb3RvdHlwZS5hcHBseUhvb2sgPSBmdW5jdGlvbihyZXN0X2xlbmd0aCwgaykge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy52ZWxvY2l0eS5jbG9uZSgpLnN1Yih0aGlzLmFuY2hvcik7XHJcbiAgICB2YXIgZGlzdGFuY2UgPSBmb3JjZS5sZW5ndGgoKSAtIHJlc3RfbGVuZ3RoO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSAqIGsgKiBkaXN0YW5jZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiBGb3JjZTI7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgRm9yY2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMudmVsb2NpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgdGhpcy5hbmNob3IgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgdGhpcy5tYXNzID0gMTtcclxuICB9O1xyXG5cclxuICBGb3JjZS5wcm90b3R5cGUudXBkYXRlVmVsb2NpdHkgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLmRpdmlkZVNjYWxhcih0aGlzLm1hc3MpO1xyXG4gICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xyXG4gIH07XHJcbiAgRm9yY2UucHJvdG90eXBlLmFwcGx5Rm9yY2UgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZCh2ZWN0b3IpO1xyXG4gIH07XHJcbiAgRm9yY2UucHJvdG90eXBlLmFwcGx5RnJpY3Rpb24gPSBmdW5jdGlvbihtdSwgbm9ybWFsKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xyXG4gICAgaWYgKCFub3JtYWwpIG5vcm1hbCA9IDE7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSk7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKG11KTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlEcmFnID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIHZhciBmb3JjZSA9IHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSk7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKHRoaXMuYWNjZWxlcmF0aW9uLmxlbmd0aCgpICogdmFsdWUpO1xyXG4gICAgdGhpcy5hcHBseUZvcmNlKGZvcmNlKTtcclxuICB9O1xyXG4gIEZvcmNlLnByb3RvdHlwZS5hcHBseUhvb2sgPSBmdW5jdGlvbihyZXN0X2xlbmd0aCwgaykge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy52ZWxvY2l0eS5jbG9uZSgpLnN1Yih0aGlzLmFuY2hvcik7XHJcbiAgICB2YXIgZGlzdGFuY2UgPSBmb3JjZS5sZW5ndGgoKSAtIHJlc3RfbGVuZ3RoO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSAqIGsgKiBkaXN0YW5jZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiBGb3JjZTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgRm9yY2VDYW1lcmEgPSBmdW5jdGlvbihmb3YsIGFzcGVjdCwgbmVhciwgZmFyKSB7XHJcbiAgICBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYS5jYWxsKHRoaXMsIGZvdiwgYXNwZWN0LCBuZWFyLCBmYXIpO1xyXG4gICAgdGhpcy5mb3JjZSA9IHtcclxuICAgICAgcG9zaXRpb246IG5ldyBGb3JjZTMoKSxcclxuICAgICAgbG9vazogbmV3IEZvcmNlMygpLFxyXG4gICAgfTtcclxuICAgIHRoaXMudXAuc2V0KDAsIDEsIDApO1xyXG4gIH07XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYS5wcm90b3R5cGUpO1xyXG4gIEZvcmNlQ2FtZXJhLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEZvcmNlQ2FtZXJhO1xyXG4gIEZvcmNlQ2FtZXJhLnByb3RvdHlwZS51cGRhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wb3NpdGlvbi5jb3B5KHRoaXMuZm9yY2UucG9zaXRpb24udmVsb2NpdHkpO1xyXG4gIH07XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlLnVwZGF0ZUxvb2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubG9va0F0KHtcclxuICAgICAgeDogdGhpcy5mb3JjZS5sb29rLnZlbG9jaXR5LngsXHJcbiAgICAgIHk6IHRoaXMuZm9yY2UubG9vay52ZWxvY2l0eS55LFxyXG4gICAgICB6OiB0aGlzLmZvcmNlLmxvb2sudmVsb2NpdHkueixcclxuICAgIH0pO1xyXG4gIH07XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNldFBvbGFyQ29vcmQoKTtcclxuICAgIHRoaXMubG9va0F0Q2VudGVyKCk7XHJcbiAgfTtcclxuICBGb3JjZUNhbWVyYS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xyXG4gICAgdGhpcy5hc3BlY3QgPSB3aWR0aCAvIGhlaWdodDtcclxuICAgIHRoaXMudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xyXG4gIH07XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlLnNldFBvbGFyQ29vcmQgPSBmdW5jdGlvbihyYWQxLCByYWQyLCByYW5nZSkge1xyXG4gICAgdGhpcy5mb3JjZS5wb3NpdGlvbi5hbmNob3IuY29weShVdGlsLmdldFBvbGFyQ29vcmQocmFkMSwgcmFkMiwgcmFuZ2UpKTtcclxuICB9O1xyXG4gIEZvcmNlQ2FtZXJhLnByb3RvdHlwZS5sb29rQXRDZW50ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubG9va0F0KHtcclxuICAgICAgeDogMCxcclxuICAgICAgeTogMCxcclxuICAgICAgejogMFxyXG4gICAgfSk7XHJcbiAgfTtcclxuICByZXR1cm4gRm9yY2VDYW1lcmE7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIEZvcmNlSGVtaXNwaGVyZUxpZ2h0ID0gZnVuY3Rpb24oaGV4MSwgaGV4MiwgaW50ZW5zaXR5KSB7XHJcbiAgICBUSFJFRS5IZW1pc3BoZXJlTGlnaHQuY2FsbCh0aGlzLCBoZXgxLCBoZXgyLCBpbnRlbnNpdHkpO1xyXG4gICAgdGhpcy5mb3JjZSA9IG5ldyBGb3JjZTMoKTtcclxuICB9O1xyXG4gIEZvcmNlSGVtaXNwaGVyZUxpZ2h0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVEhSRUUuSGVtaXNwaGVyZUxpZ2h0LnByb3RvdHlwZSk7XHJcbiAgRm9yY2VIZW1pc3BoZXJlTGlnaHQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRm9yY2VIZW1pc3BoZXJlTGlnaHQ7XHJcbiAgRm9yY2VIZW1pc3BoZXJlTGlnaHQucHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkodGhpcy5mb3JjZS52ZWxvY2l0eSk7XHJcbiAgfTtcclxuICBGb3JjZUhlbWlzcGhlcmVMaWdodC5wcm90b3R5cGUuc2V0UG9zaXRpb25TcGhlcmljYWwgPSBmdW5jdGlvbihyYWQxLCByYWQyLCByYW5nZSkge1xyXG4gICAgdGhpcy5wb3NpdGlvbi5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChyYWQxLCByYWQyLCByYW5nZSkpO1xyXG4gIH07XHJcbiAgcmV0dXJuIEZvcmNlSGVtaXNwaGVyZUxpZ2h0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBGb3JjZVBvaW50TGlnaHQgPSBmdW5jdGlvbihoZXgsIGludGVuc2l0eSwgZGlzdGFuY2UsIGRlY2F5KSB7XHJcbiAgICBUSFJFRS5Qb2ludExpZ2h0LmNhbGwodGhpcywgaGV4LCBpbnRlbnNpdHksIGRpc3RhbmNlLCBkZWNheSk7XHJcbiAgICB0aGlzLmZvcmNlID0gbmV3IEZvcmNlMygpO1xyXG4gIH07XHJcbiAgRm9yY2VQb2ludExpZ2h0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVEhSRUUuUG9pbnRMaWdodC5wcm90b3R5cGUpO1xyXG4gIEZvcmNlUG9pbnRMaWdodC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBGb3JjZVBvaW50TGlnaHQ7XHJcbiAgRm9yY2VQb2ludExpZ2h0LnByb3RvdHlwZS51cGRhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wb3NpdGlvbi5jb3B5KHRoaXMuZm9yY2UudmVsb2NpdHkpO1xyXG4gIH07XHJcbiAgRm9yY2VQb2ludExpZ2h0LnByb3RvdHlwZS5zZXRQb2xhckNvb3JkID0gZnVuY3Rpb24ocmFkMSwgcmFkMiwgcmFuZ2UpIHtcclxuICAgIHRoaXMucG9zaXRpb24uY29weShVdGlsLmdldFBvbGFyQ29vcmQocmFkMSwgcmFkMiwgcmFuZ2UpKTtcclxuICB9O1xyXG4gIHJldHVybiBGb3JjZVBvaW50TGlnaHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIE1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNpemUgPSAwO1xyXG4gICAgdGhpcy50aW1lID0gMDtcclxuICAgIHRoaXMuaXNfYWN0aXZlID0gZmFsc2U7XHJcbiAgICBGb3JjZTMuY2FsbCh0aGlzKTtcclxuICB9O1xyXG4gIE1vdmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgTW92ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTW92ZXI7XHJcbiAgTW92ZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHRoaXMudmVsb2NpdHkgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gdmVjdG9yLmNsb25lKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbi5zZXQoMCwgMCwgMCk7XHJcbiAgICB0aGlzLnRpbWUgPSAwO1xyXG4gIH07XHJcbiAgTW92ZXIucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmlzX2FjdGl2ZSA9IHRydWU7XHJcbiAgfTtcclxuICBNb3Zlci5wcm90b3R5cGUuaW5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5pc19hY3RpdmUgPSBmYWxzZTtcclxuICB9O1xyXG4gIHJldHVybiBNb3ZlcjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgUGh5c2ljc1JlbmRlcmVyID0gZnVuY3Rpb24obGVuZ3RoKSB7XHJcbiAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uX3NjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgICB0aGlzLnZlbG9jaXR5X3NjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgMSwgMSwgMTAwMCk7XHJcbiAgICB0aGlzLm9wdGlvbiA9IHtcclxuICAgICAgdHlwZTogVEhSRUUuRmxvYXRUeXBlLFxyXG4gICAgfTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gW1xyXG4gICAgICBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQobGVuZ3RoLCBsZW5ndGgsIHRoaXMub3B0aW9uKSxcclxuICAgICAgbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KGxlbmd0aCwgbGVuZ3RoLCB0aGlzLm9wdGlvbiksXHJcbiAgICBdO1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IFtcclxuICAgICAgbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KGxlbmd0aCwgbGVuZ3RoLCB0aGlzLm9wdGlvbiksXHJcbiAgICAgIG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldChsZW5ndGgsIGxlbmd0aCwgdGhpcy5vcHRpb24pLFxyXG4gICAgXTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uX21lc2ggPSB0aGlzLmNyZWF0ZU1lc2goXHJcbiAgICAgIFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbnZvaWQgbWFpbih2b2lkKSB7XFxyXFxuICB2VXYgPSB1djtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIHZlYzIgcmVzb2x1dGlvbjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB2ZWxvY2l0eTtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCBhY2NlbGVyYXRpb247XFxyXFxudW5pZm9ybSB2ZWMyIGFuY2hvcjtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbiNkZWZpbmUgUFJFQ0lTSU9OIDAuMDAwMDAxXFxyXFxuXFxyXFxudmVjMyBkcmFnKHZlYzMgYSwgZmxvYXQgdmFsdWUpIHtcXHJcXG4gIHJldHVybiBub3JtYWxpemUoYSAqIC0xLjAgKyBQUkVDSVNJT04pICogbGVuZ3RoKGEpICogdmFsdWU7XFxyXFxufVxcclxcblxcclxcbnZlYzMgaG9vayh2ZWMzIHYsIHZlYzMgYW5jaG9yLCBmbG9hdCByZXN0X2xlbmd0aCwgZmxvYXQgaykge1xcclxcbiAgcmV0dXJuIG5vcm1hbGl6ZSh2IC0gYW5jaG9yICsgUFJFQ0lTSU9OKSAqICgtMS4wICogayAqIChsZW5ndGgodiAtIGFuY2hvcikgLSByZXN0X2xlbmd0aCkpO1xcclxcbn1cXHJcXG5cXHJcXG52ZWMzIGF0dHJhY3QodmVjMyB2MSwgdmVjMyB2MiwgZmxvYXQgbTEsIGZsb2F0IG0yLCBmbG9hdCBnKSB7XFxyXFxuICByZXR1cm4gZyAqIG0xICogbTIgLyBwb3coY2xhbXAobGVuZ3RoKHYyIC0gdjEpLCA1LjAsIDMwLjApLCAyLjApICogbm9ybWFsaXplKHYyIC0gdjEgKyBQUkVDSVNJT04pO1xcclxcbn1cXHJcXG5cXHJcXG52b2lkIG1haW4odm9pZCkge1xcclxcbiAgdmVjMyB2ID0gdGV4dHVyZTJEKHZlbG9jaXR5LCB2VXYpLnh5ejtcXHJcXG4gIHZlYzMgYSA9IHRleHR1cmUyRChhY2NlbGVyYXRpb24sIHZVdikueHl6O1xcclxcbiAgdmVjMyBhMiA9IGEgKyBub3JtYWxpemUodmVjMyhhbmNob3IgKiAxMDAuMCwgMC4wKSAtIHYpIC8gMy4wO1xcclxcbiAgdmVjMyBhMyA9IGEyICsgZHJhZyhhMiwgMC4wMDMpO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChhMywgMS4wKTtcXHJcXG59XFxyXFxuXCJcclxuICAgICk7XHJcbiAgICB0aGlzLnZlbG9jaXR5X21lc2ggPSB0aGlzLmNyZWF0ZU1lc2goXHJcbiAgICAgIFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbnZvaWQgbWFpbih2b2lkKSB7XFxyXFxuICB2VXYgPSB1djtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdmVsb2NpdHk7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgYWNjZWxlcmF0aW9uO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMiB2VXY7XFxyXFxuXFxyXFxudm9pZCBtYWluKHZvaWQpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQodGV4dHVyZTJEKGFjY2VsZXJhdGlvbiwgdlV2KS54eXogKyB0ZXh0dXJlMkQodmVsb2NpdHksIHZVdikueHl6LCAxLjApO1xcclxcbn1cXHJcXG5cIlxyXG4gICAgKTtcclxuICAgIHRoaXMudGFyZ2V0X2luZGV4ID0gMDtcclxuICB9O1xyXG4gIFBoeXNpY3NSZW5kZXJlci5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihyZW5kZXJlciwgdmVsb2NpdHlfYXJyYXkpIHtcclxuICAgICAgdmFyIGFjY2VsZXJhdGlvbl9pbml0X21lc2ggPSBuZXcgVEhSRUUuTWVzaChcclxuICAgICAgICBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeSgyLCAyKSxcclxuICAgICAgICBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICAgICAgdmVydGV4U2hhZGVyOiAndm9pZCBtYWluKHZvaWQpIHtnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDEuMCk7fScsXHJcbiAgICAgICAgICBmcmFnbWVudFNoYWRlcjogJ3ZvaWQgbWFpbih2b2lkKSB7Z2xfRnJhZ0NvbG9yID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO30nLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcbiAgICAgIHZhciB2ZWxvY2l0eV9pbml0X3RleCA9IG5ldyBUSFJFRS5EYXRhVGV4dHVyZSh2ZWxvY2l0eV9hcnJheSwgdGhpcy5sZW5ndGgsIHRoaXMubGVuZ3RoLCBUSFJFRS5SR0JGb3JtYXQsIFRIUkVFLkZsb2F0VHlwZSk7XHJcbiAgICAgIHZlbG9jaXR5X2luaXRfdGV4Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgdmFyIHZlbG9jaXR5X2luaXRfbWVzaCA9IG5ldyBUSFJFRS5NZXNoKFxyXG4gICAgICAgIG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KDIsIDIpLFxyXG4gICAgICAgIG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgICAgICB2ZWxvY2l0eToge1xyXG4gICAgICAgICAgICAgIHR5cGU6ICd0JyxcclxuICAgICAgICAgICAgICB2YWx1ZTogdmVsb2NpdHlfaW5pdF90ZXgsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdmVydGV4U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMyIHZVdjtcXHJcXG5cXHJcXG52b2lkIG1haW4odm9pZCkge1xcclxcbiAgdlV2ID0gdXY7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxufVxcclxcblwiLFxyXG4gICAgICAgICAgZnJhZ21lbnRTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIHNhbXBsZXIyRCB2ZWxvY2l0eTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbnZvaWQgbWFpbih2b2lkKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodmVsb2NpdHksIHZVdik7XFxyXFxufVxcclxcblwiLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbl9zY2VuZS5hZGQodGhpcy5jYW1lcmEpO1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbl9zY2VuZS5hZGQoYWNjZWxlcmF0aW9uX2luaXRfbWVzaCk7XHJcbiAgICAgIHJlbmRlcmVyLnJlbmRlcih0aGlzLmFjY2VsZXJhdGlvbl9zY2VuZSwgdGhpcy5jYW1lcmEsIHRoaXMuYWNjZWxlcmF0aW9uWzBdKTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMuYWNjZWxlcmF0aW9uX3NjZW5lLCB0aGlzLmNhbWVyYSwgdGhpcy5hY2NlbGVyYXRpb25bMV0pO1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbl9zY2VuZS5yZW1vdmUoYWNjZWxlcmF0aW9uX2luaXRfbWVzaCk7XHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uX3NjZW5lLmFkZCh0aGlzLmFjY2VsZXJhdGlvbl9tZXNoKTtcclxuXHJcbiAgICAgIHRoaXMudmVsb2NpdHlfc2NlbmUuYWRkKHRoaXMuY2FtZXJhKTtcclxuICAgICAgdGhpcy52ZWxvY2l0eV9zY2VuZS5hZGQodmVsb2NpdHlfaW5pdF9tZXNoKTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMudmVsb2NpdHlfc2NlbmUsIHRoaXMuY2FtZXJhLCB0aGlzLnZlbG9jaXR5WzBdKTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMudmVsb2NpdHlfc2NlbmUsIHRoaXMuY2FtZXJhLCB0aGlzLnZlbG9jaXR5WzFdKTtcclxuICAgICAgdGhpcy52ZWxvY2l0eV9zY2VuZS5yZW1vdmUodmVsb2NpdHlfaW5pdF9tZXNoKTtcclxuICAgICAgdGhpcy52ZWxvY2l0eV9zY2VuZS5hZGQodGhpcy52ZWxvY2l0eV9tZXNoKTtcclxuICAgIH0sXHJcbiAgICBjcmVhdGVNZXNoOiBmdW5jdGlvbih2cywgZnMpIHtcclxuICAgICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKFxyXG4gICAgICAgIG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KDIsIDIpLFxyXG4gICAgICAgIG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ3YyJyxcclxuICAgICAgICAgICAgICB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHZlbG9jaXR5OiB7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhY2NlbGVyYXRpb246IHtcclxuICAgICAgICAgICAgICB0eXBlOiAndCcsXHJcbiAgICAgICAgICAgICAgdmFsdWU6IG51bGwsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdmVydGV4U2hhZGVyOiB2cyxcclxuICAgICAgICAgIGZyYWdtZW50U2hhZGVyOiBmcyxcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24ocmVuZGVyZXIpIHtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25fbWVzaC5tYXRlcmlhbC51bmlmb3Jtcy5hY2NlbGVyYXRpb24udmFsdWUgPSB0aGlzLmFjY2VsZXJhdGlvbltNYXRoLmFicyh0aGlzLnRhcmdldF9pbmRleCAtIDEpXTtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25fbWVzaC5tYXRlcmlhbC51bmlmb3Jtcy52ZWxvY2l0eS52YWx1ZSA9IHRoaXMudmVsb2NpdHlbdGhpcy50YXJnZXRfaW5kZXhdO1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIodGhpcy5hY2NlbGVyYXRpb25fc2NlbmUsIHRoaXMuY2FtZXJhLCB0aGlzLmFjY2VsZXJhdGlvblt0aGlzLnRhcmdldF9pbmRleF0pO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5X21lc2gubWF0ZXJpYWwudW5pZm9ybXMuYWNjZWxlcmF0aW9uLnZhbHVlID0gdGhpcy5hY2NlbGVyYXRpb25bdGhpcy50YXJnZXRfaW5kZXhdO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5X21lc2gubWF0ZXJpYWwudW5pZm9ybXMudmVsb2NpdHkudmFsdWUgPSB0aGlzLnZlbG9jaXR5W3RoaXMudGFyZ2V0X2luZGV4XTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMudmVsb2NpdHlfc2NlbmUsIHRoaXMuY2FtZXJhLCB0aGlzLnZlbG9jaXR5W01hdGguYWJzKHRoaXMudGFyZ2V0X2luZGV4IC0gMSldKTtcclxuICAgICAgdGhpcy50YXJnZXRfaW5kZXggPSBNYXRoLmFicyh0aGlzLnRhcmdldF9pbmRleCAtIDEpO1xyXG4gICAgfSxcclxuICAgIGdldEN1cnJlbnRWZWxvY2l0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnZlbG9jaXR5W01hdGguYWJzKHRoaXMudGFyZ2V0X2luZGV4IC0gMSldO1xyXG4gICAgfSxcclxuICAgIGdldEN1cnJlbnRBY2NlbGVyYXRpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5hY2NlbGVyYXRpb25bTWF0aC5hYnModGhpcy50YXJnZXRfaW5kZXggLSAxKV07XHJcbiAgICB9LFxyXG4gICAgcmVzaXplOiBmdW5jdGlvbihsZW5ndGgpIHtcclxuICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XHJcbiAgICAgIHRoaXMudmVsb2NpdHlbMF0uc2V0U2l6ZShsZW5ndGgsIGxlbmd0aCk7XHJcbiAgICAgIHRoaXMudmVsb2NpdHlbMV0uc2V0U2l6ZShsZW5ndGgsIGxlbmd0aCk7XHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uWzBdLnNldFNpemUobGVuZ3RoLCBsZW5ndGgpO1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvblsxXS5zZXRTaXplKGxlbmd0aCwgbGVuZ3RoKTtcclxuICAgIH0sXHJcbiAgfTtcclxuICByZXR1cm4gUGh5c2ljc1JlbmRlcmVyO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBQb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIHRoaXMubWF0ZXJpYWwgPSBudWxsO1xyXG4gICAgdGhpcy5vYmogPSBudWxsO1xyXG4gICAgRm9yY2UzLmNhbGwodGhpcyk7XHJcbiAgfTtcclxuICBQb2ludHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBQb2ludHMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUG9pbnRzO1xyXG4gIFBvaW50cy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHBhcmFtKSB7XHJcbiAgICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICBjb2xvcjogeyB0eXBlOiAnYycsIHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoMHhmZmZmZmYpIH0sXHJcbiAgICAgICAgdGV4dHVyZTogeyB0eXBlOiAndCcsIHZhbHVlOiBwYXJhbS50ZXh0dXJlIH1cclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiBwYXJhbS52cyxcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IHBhcmFtLmZzLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcclxuICAgICAgZGVwdGhXcml0ZTogZmFsc2UsXHJcbiAgICAgIGJsZW5kaW5nOiBwYXJhbS5ibGVuZGluZ1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBhcmFtLnBvc2l0aW9ucywgMykpO1xyXG4gICAgdGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ2N1c3RvbUNvbG9yJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwYXJhbS5jb2xvcnMsIDMpKTtcclxuICAgIHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCd2ZXJ0ZXhPcGFjaXR5JywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwYXJhbS5vcGFjaXRpZXMsIDEpKTtcclxuICAgIHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdzaXplJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwYXJhbS5zaXplcywgMSkpO1xyXG4gICAgdGhpcy5vYmogPSBuZXcgVEhSRUUuUG9pbnRzKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gICAgcGFyYW0uc2NlbmUuYWRkKHRoaXMub2JqKTtcclxuICB9O1xyXG4gIFBvaW50cy5wcm90b3R5cGUudXBkYXRlUG9pbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm9iai5wb3NpdGlvbi5jb3B5KHRoaXMudmVsb2NpdHkpO1xyXG4gICAgdGhpcy5vYmouZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB0aGlzLm9iai5nZW9tZXRyeS5hdHRyaWJ1dGVzLnZlcnRleE9wYWNpdHkubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5vYmouZ2VvbWV0cnkuYXR0cmlidXRlcy5zaXplLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMub2JqLmdlb21ldHJ5LmF0dHJpYnV0ZXMuY3VzdG9tQ29sb3IubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gIH07XHJcbiAgcmV0dXJuIFBvaW50cztcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgZXhwb3J0cyA9IHtcclxuICBnZXRSYW5kb21JbnQ6IGZ1bmN0aW9uKG1pbiwgbWF4KXtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XHJcbiAgfSxcclxuICBnZXREZWdyZWU6IGZ1bmN0aW9uKHJhZGlhbikge1xyXG4gICAgcmV0dXJuIHJhZGlhbiAvIE1hdGguUEkgKiAxODA7XHJcbiAgfSxcclxuICBnZXRSYWRpYW46IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcclxuICAgIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcclxuICB9LFxyXG4gIGdldFBvbGFyQ29vcmQ6IGZ1bmN0aW9uKHJhZDEsIHJhZDIsIHIpIHtcclxuICAgIHZhciB4ID0gTWF0aC5jb3MocmFkMSkgKiBNYXRoLmNvcyhyYWQyKSAqIHI7XHJcbiAgICB2YXIgeiA9IE1hdGguY29zKHJhZDEpICogTWF0aC5zaW4ocmFkMikgKiByO1xyXG4gICAgdmFyIHkgPSBNYXRoLnNpbihyYWQxKSAqIHI7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoeCwgeSwgeik7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFtcclxuICB7XHJcbiAgICBuYW1lOiAnYXR0cmFjdCcsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvYXR0cmFjdCcpLFxyXG4gICAgcG9zdGVkOiAnMjAxNi42LjEzJyxcclxuICAgIHVwZGF0ZTogJzIwMTYuNi4xNCcsXHJcbiAgICBkZXNjcmlwdGlvbjogJ3VzZSBmcmFnbWVudCBzaGFkZXIgdG8gcGVydGljbGUgbW92aW5nLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnaG9sZScsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvaG9sZScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNi41LjEwJyxcclxuICAgIHVwZGF0ZTogJycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ3N0dWR5IG9mIFBvc3QgRWZmZWN0IHRoYXQgdXNlZCBUSFJFRS5XZWJHTFJlbmRlclRhcmdldC4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ21ldGFsIGN1YmUnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL21ldGFsX2N1YmUnKSxcclxuICAgIHBvc3RlZDogJzIwMTYuNC4yMScsXHJcbiAgICB1cGRhdGU6ICcnLFxyXG4gICAgZGVzY3JpcHRpb246ICdzdHVkeSBvZiByYXltYXJjaGluZyB1c2luZyB0aHJlZS5qcy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2Rpc3RvcnQnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2Rpc3RvcnQnKSxcclxuICAgIHBvc3RlZDogJzIwMTYuMi4yMycsXHJcbiAgICB1cGRhdGU6ICcyMDE2LjUuMTAnLFxyXG4gICAgZGVzY3JpcHRpb246ICd1c2luZyB0aGUgc2ltcGxleCBub2lzZSwgZGlzdG9ydCB0aGUgc3BoZXJlLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnaW1hZ2UgZGF0YScsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvaW1hZ2VfZGF0YScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMi45JyxcclxuICAgIHVwZGF0ZTogJzIwMTUuMTIuMTInLFxyXG4gICAgZGVzY3JpcHRpb246ICdQb2ludHMgYmFzZWQgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELmdldEltYWdlRGF0YSgpJyxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6ICdnYWxsZXJ5JyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9nYWxsZXJ5JyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjEyLjInLFxyXG4gICAgdXBkYXRlOiAnMjAxNS4xMi45JyxcclxuICAgIGRlc2NyaXB0aW9uOiAnaW1hZ2UgZ2FsbGVyeSBvbiAzZC4gdGVzdGVkIHRoYXQgcGlja2VkIG9iamVjdCBhbmQgbW92aW5nIGNhbWVyYS4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2NvbWV0JyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9jb21ldCcpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMS4yNCcsXHJcbiAgICB1cGRhdGU6ICcyMDE2LjEuOCcsXHJcbiAgICBkZXNjcmlwdGlvbjogJ2NhbWVyYSB0byB0cmFjayB0aGUgbW92aW5nIHBvaW50cy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2h5cGVyIHNwYWNlJyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9oeXBlcl9zcGFjZScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMS4xMicsXHJcbiAgICB1cGRhdGU6ICcnLFxyXG4gICAgZGVzY3JpcHRpb246ICdhZGQgbGl0dGxlIGNoYW5nZSBhYm91dCBjYW1lcmEgYW5nbGUgYW5kIHBhcnRpY2xlIGNvbnRyb2xlcy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2ZpcmUgYmFsbCcsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvZmlyZV9iYWxsJyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjExLjEyJyxcclxuICAgIHVwZGF0ZTogJycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ3Rlc3Qgb2Ygc2ltcGxlIHBoeXNpY3MgYW5kIGFkZGl0aXZlIGJsZW5kaW5nLicsXHJcbiAgfVxyXG5dO1xyXG4iLCJcclxudmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIFBoeXNpY3NSZW5kZXJlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcGh5c2ljc19yZW5kZXJlcicpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcikge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKTtcclxuICB9O1xyXG5cclxuICB2YXIgbGVuZ3RoID0gMTAwMDtcclxuICB2YXIgcGh5c2ljc19yZW5kZXJlciA9IG51bGw7XHJcblxyXG4gIHZhciBjcmVhdGVQb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgdmFyIHZlcnRpY2VzX2Jhc2UgPSBbXTtcclxuICAgIHZhciB1dnNfYmFzZSA9IFtdO1xyXG4gICAgdmFyIGNvbG9yc19iYXNlID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IE1hdGgucG93KGxlbmd0aCwgMik7IGkrKykge1xyXG4gICAgICB2ZXJ0aWNlc19iYXNlLnB1c2goMCwgMCwgMCk7XHJcbiAgICAgIHV2c19iYXNlLnB1c2goXHJcbiAgICAgICAgaSAlIGxlbmd0aCAqICgxIC8gKGxlbmd0aCAtIDEpKSxcclxuICAgICAgICBNYXRoLmZsb29yKGkgLyBsZW5ndGgpICogKDEgLyAobGVuZ3RoIC0gMSkpXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbG9yc19iYXNlLnB1c2goVXRpbC5nZXRSYW5kb21JbnQoMCwgOTApIC8gMzYwLCAwLjgsIDEpO1xyXG4gICAgfVxyXG4gICAgdmFyIHZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlc19iYXNlKTtcclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHZlcnRpY2VzLCAzKSk7XHJcbiAgICB2YXIgdXZzID0gbmV3IEZsb2F0MzJBcnJheSh1dnNfYmFzZSk7XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3V2MicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUodXZzLCAyKSk7XHJcbiAgICB2YXIgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShjb2xvcnNfYmFzZSk7XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ2NvbG9yJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShjb2xvcnMsIDMpKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB2ZWxvY2l0eToge1xyXG4gICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5UZXh0dXJlKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFjY2VsZXJhdGlvbjoge1xyXG4gICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5UZXh0dXJlKClcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMyIHV2MjtcXHJcXG5hdHRyaWJ1dGUgdmVjMyBjb2xvcjtcXHJcXG5cXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB2ZWxvY2l0eTtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCBhY2NlbGVyYXRpb247XFxyXFxuXFxyXFxudmFyeWluZyBmbG9hdCB2QWNjZWxlcmF0aW9uO1xcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxuXFxyXFxudm9pZCBtYWluKHZvaWQpIHtcXHJcXG4gIHZlYzQgdXBkYXRlX3Bvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdGV4dHVyZTJEKHZlbG9jaXR5LCB1djIpO1xcclxcbiAgdkFjY2VsZXJhdGlvbiA9IGxlbmd0aCh0ZXh0dXJlMkQoYWNjZWxlcmF0aW9uLCB1djIpLnh5eik7XFxyXFxuICB2Q29sb3IgPSBjb2xvcjtcXHJcXG4gIGdsX1BvaW50U2l6ZSA9IDEuMDtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIHVwZGF0ZV9wb3NpdGlvbjtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyBmbG9hdCB2QWNjZWxlcmF0aW9uO1xcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxuXFxyXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcblxcclxcbnZlYzMgaHN2MnJnYl8xXzAodmVjMyBjKXtcXHJcXG4gIHZlYzQgSyA9IHZlYzQoMS4wLCAyLjAgLyAzLjAsIDEuMCAvIDMuMCwgMy4wKTtcXHJcXG4gIHZlYzMgcCA9IGFicyhmcmFjdChjLnh4eCArIEsueHl6KSAqIDYuMCAtIEsud3d3KTtcXHJcXG4gIHJldHVybiBjLnogKiBtaXgoSy54eHgsIGNsYW1wKHAgLSBLLnh4eCwgMC4wLCAxLjApLCBjLnkpO1xcclxcbn1cXHJcXG5cXG5cXG5cXHJcXG52b2lkIG1haW4odm9pZCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChoc3YycmdiXzFfMCh2ZWMzKHZDb2xvci54ICsgdGltZSAvIDM2MDAuMCwgdkNvbG9yLnksIHZDb2xvci56KSksIDAuNCk7XFxyXFxufVxcclxcblwiLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcclxuICAgICAgZGVwdGhXcml0ZTogZmFsc2UsXHJcbiAgICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH1cclxuICB2YXIgcG9pbnRzID0gY3JlYXRlUG9pbnRzKCk7XHJcblxyXG4gIHZhciBjcmVhdGVQb2ludHNJbnRWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHZlcnRpY2VzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IE1hdGgucG93KGxlbmd0aCwgMik7IGkrKykge1xyXG4gICAgICB2YXIgdiA9IFV0aWwuZ2V0UG9sYXJDb29yZChcclxuICAgICAgICBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKSxcclxuICAgICAgICBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKSxcclxuICAgICAgICBVdGlsLmdldFJhbmRvbUludCgxMCwgMjAwKVxyXG4gICAgICApO1xyXG4gICAgICB2ZXJ0aWNlcy5wdXNoKHYueCwgdi55LCB2LnopO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpO1xyXG4gIH1cclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKSB7XHJcbiAgICAgIHBoeXNpY3NfcmVuZGVyZXIgPSBuZXcgUGh5c2ljc1JlbmRlcmVyKGxlbmd0aCk7XHJcbiAgICAgIHBoeXNpY3NfcmVuZGVyZXIuaW5pdChyZW5kZXJlciwgY3JlYXRlUG9pbnRzSW50VmVsb2NpdHkoKSk7XHJcbiAgICAgIHBoeXNpY3NfcmVuZGVyZXIuYWNjZWxlcmF0aW9uX21lc2gubWF0ZXJpYWwudW5pZm9ybXMuYW5jaG9yID0ge1xyXG4gICAgICAgIHR5cGU6ICd2MicsXHJcbiAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKCksXHJcbiAgICAgIH1cclxuICAgICAgc2NlbmUuYWRkKHBvaW50cyk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KDAsIDAsIDYwMCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBwb2ludHMuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocG9pbnRzKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKSB7XHJcbiAgICAgIHBoeXNpY3NfcmVuZGVyZXIucmVuZGVyKHJlbmRlcmVyKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLnVuaWZvcm1zLnZlbG9jaXR5LnZhbHVlID0gcGh5c2ljc19yZW5kZXJlci5nZXRDdXJyZW50VmVsb2NpdHkoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLnVuaWZvcm1zLmFjY2VsZXJhdGlvbi52YWx1ZSA9IHBoeXNpY3NfcmVuZGVyZXIuZ2V0Q3VycmVudEFjY2VsZXJhdGlvbigpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5SG9vaygwLCAwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZUxvb2soKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBwaHlzaWNzX3JlbmRlcmVyLmFjY2VsZXJhdGlvbl9tZXNoLm1hdGVyaWFsLnVuaWZvcm1zLmFuY2hvci52YWx1ZS5jb3B5KHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgfSxcclxuICAgIG1vdXNlT3V0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHBoeXNpY3NfcmVuZGVyZXIuYWNjZWxlcmF0aW9uX21lc2gubWF0ZXJpYWwudW5pZm9ybXMuYW5jaG9yLnZhbHVlLnNldCgwLCAwLCAwKTtcclxuICAgIH0sXHJcbiAgICByZXNpemVXaW5kb3c6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMicpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcbnZhciBQb2ludHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50cy5qcycpO1xyXG52YXIgRm9yY2VIZW1pc3BoZXJlTGlnaHQgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlX2hlbWlzcGhlcmVfbGlnaHQnKTtcclxudmFyIEZvcmNlUG9pbnRMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2VfcG9pbnRfbGlnaHQnKTtcclxuXHJcbnZhciB2cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyBjdXN0b21Db2xvcjtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgdmVydGV4T3BhY2l0eTtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgc2l6ZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdkNvbG9yID0gY3VzdG9tQ29sb3I7XFxyXFxuICBmT3BhY2l0eSA9IHZlcnRleE9wYWNpdHk7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbiAgZ2xfUG9pbnRTaXplID0gc2l6ZSAqICgzMDAuMCAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpO1xcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciBmcyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIHZlYzMgY29sb3I7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciAqIHZDb2xvciwgZk9wYWNpdHkpO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gZ2xfRnJhZ0NvbG9yICogdGV4dHVyZTJEKHRleHR1cmUsIGdsX1BvaW50Q29vcmQpO1xcclxcbn1cXHJcXG5cIjtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEpO1xyXG4gIH07XHJcbiAgdmFyIG1vdmVyc19udW0gPSAxMDAwMDtcclxuICB2YXIgbW92ZXJzID0gW107XHJcbiAgdmFyIG1vdmVyX2FjdGl2YXRlX2NvdW50ID0gMjtcclxuICB2YXIgcG9pbnRzID0gbmV3IFBvaW50cygpO1xyXG4gIHZhciBoZW1pX2xpZ2h0ID0gbnVsbDtcclxuICB2YXIgY29tZXRfbGlnaHQxID0gbnVsbDtcclxuICB2YXIgY29tZXRfbGlnaHQyID0gbnVsbDtcclxuICB2YXIgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIGNvbWV0ID0gbnVsbDtcclxuICB2YXIgY29tZXRfcmFkaXVzID0gMzA7XHJcbiAgdmFyIGNvbWV0X3NjYWxlID0gbmV3IEZvcmNlMigpO1xyXG4gIHZhciBjb21ldF9jb2xvcl9oID0gMTQwO1xyXG4gIHZhciBjb2xvcl9kaWZmID0gNDU7XHJcbiAgdmFyIHBsYW5ldCA9IG51bGw7XHJcbiAgdmFyIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGxhc3RfdGltZV9wbHVzX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICB2YXIgbGFzdF90aW1lX2JvdW5jZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGxhc3RfdGltZV90b3VjaCA9IERhdGUubm93KCk7XHJcbiAgdmFyIHBsdXNfYWNjZWxlcmF0aW9uID0gMDtcclxuICB2YXIgaXNfdG91Y2hlZCA9IGZhbHNlO1xyXG4gIHZhciBpc19wbHVzX2FjdGl2YXRlID0gZmFsc2U7XHJcbiAgdmFyIHRyYWNrX3BvaW50cyA9IHRydWU7XHJcblxyXG4gIHZhciB1cGRhdGVNb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICB2YXIgcG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZlKSB7XHJcbiAgICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgaWYgKG1vdmVyLnRpbWUgPiAxMCkge1xyXG4gICAgICAgICAgbW92ZXIuc2l6ZSAtPSAyO1xyXG4gICAgICAgICAgLy9tb3Zlci5hIC09IDAuMDQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtb3Zlci5zaXplIDw9IDApIHtcclxuICAgICAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xyXG4gICAgICAgICAgbW92ZXIudGltZSA9IDA7XHJcbiAgICAgICAgICBtb3Zlci5hID0gMC4wO1xyXG4gICAgICAgICAgbW92ZXIuaW5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnZlbG9jaXR5LnggLSBwb2ludHMudmVsb2NpdHkueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci52ZWxvY2l0eS55IC0gcG9pbnRzLnZlbG9jaXR5Lnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIudmVsb2NpdHkueiAtIHBvaW50cy52ZWxvY2l0eS56O1xyXG4gICAgICBjb2xvcnNbaSAqIDMgKyAwXSA9IG1vdmVyLmNvbG9yLnI7XHJcbiAgICAgIGNvbG9yc1tpICogMyArIDFdID0gbW92ZXIuY29sb3IuZztcclxuICAgICAgY29sb3JzW2kgKiAzICsgMl0gPSBtb3Zlci5jb2xvci5iO1xyXG4gICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICB9XHJcbiAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGFjdGl2YXRlTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb3VudCA9IDA7XHJcbiAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGlmIChub3cgLSBsYXN0X3RpbWVfYWN0aXZhdGUgPiAxMCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgICBpZiAobW92ZXIuaXNfYWN0aXZlKSBjb250aW51ZTtcclxuICAgICAgICB2YXIgcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICAgIHZhciByYWQyID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgICAgdmFyIHJhbmdlID0gVXRpbC5nZXRSYW5kb21JbnQoMSwgMzApO1xyXG4gICAgICAgIHZhciB2ZWN0b3IgPSBVdGlsLmdldFBvbGFyQ29vcmQocmFkMSwgcmFkMiwgcmFuZ2UpO1xyXG4gICAgICAgIHZhciBmb3JjZSA9IFV0aWwuZ2V0UG9sYXJDb29yZChyYWQxLCByYWQyLCByYW5nZSAvIDIwKTtcclxuICAgICAgICB2YXIgaCA9IFV0aWwuZ2V0UmFuZG9tSW50KGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmLCBjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZikgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNTtcclxuICAgICAgICB2YXIgcyA9IFV0aWwuZ2V0UmFuZG9tSW50KDYwLCA4MCk7XHJcbiAgICAgICAgdmVjdG9yLmFkZChwb2ludHMudmVsb2NpdHkpO1xyXG4gICAgICAgIG1vdmVyLmFjdGl2YXRlKCk7XHJcbiAgICAgICAgbW92ZXIuaW5pdCh2ZWN0b3IpO1xyXG4gICAgICAgIG1vdmVyLmNvbG9yLnNldEhTTChoIC8gMzYwLCBzIC8gMTAwLCAwLjcpO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gICAgICAgIG1vdmVyLmEgPSAxO1xyXG4gICAgICAgIG1vdmVyLnNpemUgPSAyNTtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgIGlmIChjb3VudCA+PSBtb3Zlcl9hY3RpdmF0ZV9jb3VudCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgcm90YXRlQ29tZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbWV0LnJvdGF0aW9uLnggKz0gMC4wMyArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwMDtcclxuICAgIGNvbWV0LnJvdGF0aW9uLnkgKz0gMC4wMSArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwMDtcclxuICAgIGNvbWV0LnJvdGF0aW9uLnogKz0gMC4wMSArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwMDtcclxuICAgIHBvaW50cy5yYWQxX2Jhc2UgKz0gVXRpbC5nZXRSYWRpYW4oLjYpO1xyXG4gICAgcG9pbnRzLnJhZDEgPSBVdGlsLmdldFJhZGlhbihNYXRoLnNpbihwb2ludHMucmFkMV9iYXNlKSAqIDQ1ICsgcGx1c19hY2NlbGVyYXRpb24gLyAxMDApO1xyXG4gICAgcG9pbnRzLnJhZDIgKz0gVXRpbC5nZXRSYWRpYW4oMC44ICsgcGx1c19hY2NlbGVyYXRpb24gLyAxMDApO1xyXG4gICAgcG9pbnRzLnJhZDMgKz0gMC4wMTtcclxuICAgIHJldHVybiBVdGlsLmdldFBvbGFyQ29vcmQocG9pbnRzLnJhZDEsIHBvaW50cy5yYWQyLCAzNTApO1xyXG4gIH07XHJcblxyXG4gIHZhciByb3RhdGVDb21ldENvbG9yID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcmFkaXVzID0gY29tZXRfcmFkaXVzICogMC44O1xyXG4gICAgY29tZXRfbGlnaHQxLnBvc2l0aW9uLmNvcHkoVXRpbC5nZXRQb2xhckNvb3JkKFV0aWwuZ2V0UmFkaWFuKDApLCAgVXRpbC5nZXRSYWRpYW4oMCksIHJhZGl1cykuYWRkKHBvaW50cy52ZWxvY2l0eSkpO1xyXG4gICAgY29tZXRfbGlnaHQyLnBvc2l0aW9uLmNvcHkoVXRpbC5nZXRQb2xhckNvb3JkKFV0aWwuZ2V0UmFkaWFuKDE4MCksIFV0aWwuZ2V0UmFkaWFuKDApLCByYWRpdXMpLmFkZChwb2ludHMudmVsb2NpdHkpKTtcclxuICB9O1xyXG5cclxuICB2YXIgYm91bmNlQ29tZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChEYXRlLm5vdygpIC0gbGFzdF90aW1lX2JvdW5jZSA+IDEwMDAgLSBwbHVzX2FjY2VsZXJhdGlvbiAqIDMpIHtcclxuICAgICAgY29tZXRfc2NhbGUuYXBwbHlGb3JjZShuZXcgVEhSRUUuVmVjdG9yMigwLjA4ICsgcGx1c19hY2NlbGVyYXRpb24gLyA1MDAwLCAwKSk7XHJcbiAgICAgIGxhc3RfdGltZV9ib3VuY2UgPSBEYXRlLm5vdygpO1xyXG4gICAgICBpc19wbHVzX2FjdGl2YXRlID0gdHJ1ZTtcclxuICAgICAgbGFzdF90aW1lX3BsdXNfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzX3BsdXNfYWN0aXZhdGUgJiYgRGF0ZS5ub3coKSAtIGxhc3RfdGltZV9wbHVzX2FjdGl2YXRlIDwgNTAwKSB7XHJcbiAgICAgIG1vdmVyX2FjdGl2YXRlX2NvdW50ID0gNiArIE1hdGguZmxvb3IocGx1c19hY2NlbGVyYXRpb24gLyA0MCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtb3Zlcl9hY3RpdmF0ZV9jb3VudCA9IDEgKyBNYXRoLmZsb29yKHBsdXNfYWNjZWxlcmF0aW9uIC8gNDApO1xyXG4gICAgfVxyXG4gICAgY29tZXRfc2NhbGUuYXBwbHlIb29rKDAsIDAuMSk7XHJcbiAgICBjb21ldF9zY2FsZS5hcHBseURyYWcoMC4xMik7XHJcbiAgICBjb21ldF9zY2FsZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgY29tZXQuc2NhbGUuc2V0KDEgKyBjb21ldF9zY2FsZS52ZWxvY2l0eS54LCAxICsgY29tZXRfc2NhbGUudmVsb2NpdHkueCwgMSArIGNvbWV0X3NjYWxlLnZlbG9jaXR5LngpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVUZXh0dXJlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB2YXIgZ3JhZCA9IG51bGw7XHJcbiAgICB2YXIgdGV4dHVyZSA9IG51bGw7XHJcblxyXG4gICAgY2FudmFzLndpZHRoID0gMjAwO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IDIwMDtcclxuICAgIGdyYWQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoMTAwLCAxMDAsIDIwLCAxMDAsIDEwMCwgMTAwKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuOSwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMSknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEuMCwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMCknKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xyXG4gICAgY3R4LmFyYygxMDAsIDEwMCwgMTAwLCAwLCBNYXRoLlBJIC8gMTgwLCB0cnVlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVDb21tZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBiYXNlX2dlb21ldHJ5ID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeShjb21ldF9yYWRpdXMsIDIpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBjb2xvcjogbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIGNvbWV0X2NvbG9yX2ggKyAnLCAxMDAlLCAxMDAlKScpLFxyXG4gICAgICBzaGFkaW5nOiBUSFJFRS5GbGF0U2hhZGluZ1xyXG4gICAgfSk7XHJcbiAgICB2YXIgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShiYXNlX2dlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aCAqIDMpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiYXNlX2dlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogM10gPSBiYXNlX2dlb21ldHJ5LnZlcnRpY2VzW2ldLng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gYmFzZV9nZW9tZXRyeS52ZXJ0aWNlc1tpXS55O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IGJhc2VfZ2VvbWV0cnkudmVydGljZXNbaV0uejtcclxuICAgIH1cclxuICAgIHZhciBpbmRpY2VzID0gbmV3IFVpbnQzMkFycmF5KGJhc2VfZ2VvbWV0cnkuZmFjZXMubGVuZ3RoICogMyk7XHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGJhc2VfZ2VvbWV0cnkuZmFjZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgaW5kaWNlc1tqICogM10gPSBiYXNlX2dlb21ldHJ5LmZhY2VzW2pdLmE7XHJcbiAgICAgIGluZGljZXNbaiAqIDMgKyAxXSA9IGJhc2VfZ2VvbWV0cnkuZmFjZXNbal0uYjtcclxuICAgICAgaW5kaWNlc1tqICogMyArIDJdID0gYmFzZV9nZW9tZXRyeS5mYWNlc1tqXS5jO1xyXG4gICAgfVxyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocG9zaXRpb25zLCAzKSk7XHJcbiAgICBnZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uLmR5bmFtaWMgPSB0cnVlO1xyXG4gICAgZ2VvbWV0cnkuc2V0SW5kZXgobmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShpbmRpY2VzLCAxKSk7XHJcbiAgICBnZW9tZXRyeS5pbmRleC5keW5hbWljID0gdHJ1ZTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVQbGFuZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5PY3RhaGVkcm9uR2VvbWV0cnkoMjUwLCA0KTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIGNvbG9yOiAweDIyMjIyMixcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmdcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGFjY2VsZXJhdGVDb21ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGlzX3RvdWNoZWQgJiYgcGx1c19hY2NlbGVyYXRpb24gPCAyMDApIHtcclxuICAgICAgcGx1c19hY2NlbGVyYXRpb24gKz0gMTtcclxuICAgIH0gZWxzZSBpZihwbHVzX2FjY2VsZXJhdGlvbiA+IDApIHtcclxuICAgICAgcGx1c19hY2NlbGVyYXRpb24gLT0gMTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBjb21ldCA9IGNyZWF0ZUNvbW1ldCgpO1xyXG4gICAgICBzY2VuZS5hZGQoY29tZXQpO1xyXG4gICAgICBwbGFuZXQgPSBjcmVhdGVQbGFuZXQoKTtcclxuICAgICAgc2NlbmUuYWRkKHBsYW5ldCk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzX251bTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XHJcbiAgICAgICAgdmFyIGggPSBVdGlsLmdldFJhbmRvbUludChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZiwgY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYpO1xyXG4gICAgICAgIHZhciBzID0gVXRpbC5nZXRSYW5kb21JbnQoNjAsIDgwKTtcclxuICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKFV0aWwuZ2V0UmFuZG9tSW50KC0xMDAsIDEwMCksIDAsIDApKTtcclxuICAgICAgICBtb3Zlci5jb2xvciA9IG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyBoICsgJywgJyArIHMgKyAnJSwgNzAlKScpO1xyXG4gICAgICAgIG1vdmVycy5wdXNoKG1vdmVyKTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnZlbG9jaXR5Lng7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci52ZWxvY2l0eS55O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIudmVsb2NpdHkuejtcclxuICAgICAgICBjb2xvcnNbaSAqIDMgKyAwXSA9IG1vdmVyLmNvbG9yLnI7XHJcbiAgICAgICAgY29sb3JzW2kgKiAzICsgMV0gPSBtb3Zlci5jb2xvci5nO1xyXG4gICAgICAgIGNvbG9yc1tpICogMyArIDJdID0gbW92ZXIuY29sb3IuYjtcclxuICAgICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgICAgfVxyXG4gICAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgICAgc2NlbmU6IHNjZW5lLFxyXG4gICAgICAgIHZzOiB2cyxcclxuICAgICAgICBmczogZnMsXHJcbiAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXHJcbiAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgICAgc2l6ZXM6IHNpemVzLFxyXG4gICAgICAgIHRleHR1cmU6IGNyZWF0ZVRleHR1cmUoKSxcclxuICAgICAgICBibGVuZGluZzogVEhSRUUuTm9ybWFsQmxlbmRpbmdcclxuICAgICAgfSk7XHJcbiAgICAgIHBvaW50cy5yYWQxID0gMDtcclxuICAgICAgcG9pbnRzLnJhZDFfYmFzZSA9IDA7XHJcbiAgICAgIHBvaW50cy5yYWQyID0gMDtcclxuICAgICAgcG9pbnRzLnJhZDMgPSAwO1xyXG4gICAgICBoZW1pX2xpZ2h0ID0gbmV3IEZvcmNlSGVtaXNwaGVyZUxpZ2h0KFxyXG4gICAgICAgIG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyAoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYpICsgJywgNTAlLCA2MCUpJykuZ2V0SGV4KCksXHJcbiAgICAgICAgbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIChjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZikgKyAnLCA1MCUsIDYwJSknKS5nZXRIZXgoKSxcclxuICAgICAgICAxXHJcbiAgICAgICk7XHJcbiAgICAgIHNjZW5lLmFkZChoZW1pX2xpZ2h0KTtcclxuICAgICAgY29tZXRfbGlnaHQxID0gbmV3IEZvcmNlUG9pbnRMaWdodCgnaHNsKCcgKyAoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYpICsgJywgNjAlLCA1MCUpJywgMSwgNTAwLCAxKTtcclxuICAgICAgc2NlbmUuYWRkKGNvbWV0X2xpZ2h0MSk7XHJcbiAgICAgIGNvbWV0X2xpZ2h0MiA9IG5ldyBGb3JjZVBvaW50TGlnaHQoJ2hzbCgnICsgKGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmKSArICcsIDYwJSwgNTAlKScsIDEsIDUwMCwgMSk7XHJcbiAgICAgIHNjZW5lLmFkZChjb21ldF9saWdodDIpO1xyXG4gICAgICBjYW1lcmEuYW5jaG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoMTUwMCwgMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBjb21ldC5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGNvbWV0Lm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGNvbWV0KTtcclxuICAgICAgcGxhbmV0Lmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcGxhbmV0Lm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBsYW5ldCk7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMub2JqKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGhlbWlfbGlnaHQpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoY29tZXRfbGlnaHQxKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGNvbWV0X2xpZ2h0Mik7XHJcbiAgICAgIG1vdmVycyA9IFtdO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBhY2NlbGVyYXRlQ29tZXQoKTtcclxuICAgICAgcG9pbnRzLnZlbG9jaXR5ID0gcm90YXRlQ29tZXQoKTtcclxuICAgICAgaWYgKHRyYWNrX3BvaW50cyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IuY29weShcclxuICAgICAgICAgIHBvaW50cy52ZWxvY2l0eS5jbG9uZSgpLmFkZChcclxuICAgICAgICAgICAgcG9pbnRzLnZlbG9jaXR5LmNsb25lKCkuc3ViKHBvaW50cy5vYmoucG9zaXRpb24pLm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKC00MDApXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnkgKz0gcG9pbnRzLnZlbG9jaXR5LnkgKiAyO1xyXG4gICAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgIH1cclxuICAgICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gICAgICBjb21ldC5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgIGhlbWlfbGlnaHQuY29sb3Iuc2V0SFNMKChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZiAtIHBsdXNfYWNjZWxlcmF0aW9uIC8gMS41KSAvIDM2MCwgMC41LCAwLjYpO1xyXG4gICAgICBoZW1pX2xpZ2h0Lmdyb3VuZENvbG9yLnNldEhTTCgoY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNSkgLyAzNjAsIDAuNSwgMC42KTtcclxuICAgICAgY29tZXRfbGlnaHQxLnBvc2l0aW9uLmNvcHkocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgY29tZXRfbGlnaHQxLmNvbG9yLnNldEhTTCgoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNSkgLyAzNjAsIDAuNSwgMC42KTtcclxuICAgICAgY29tZXRfbGlnaHQyLnBvc2l0aW9uLmNvcHkocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgY29tZXRfbGlnaHQyLmNvbG9yLnNldEhTTCgoY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNSkgLyAzNjAsIDAuNSwgMC42KTtcclxuICAgICAgYWN0aXZhdGVNb3ZlcigpO1xyXG4gICAgICB1cGRhdGVNb3ZlcigpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5SG9vaygwLCAwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZUxvb2soKTtcclxuICAgICAgcm90YXRlQ29tZXRDb2xvcigpO1xyXG4gICAgICBib3VuY2VDb21ldCgpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBpc190b3VjaGVkID0gdHJ1ZTtcclxuICAgICAgbGFzdF90aW1lX3RvdWNoID0gRGF0ZS5ub3coKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICAgICAgaWYgKERhdGUubm93KCkgLSBsYXN0X3RpbWVfdG91Y2ggPCAxMDApIHtcclxuICAgICAgICBpZiAodHJhY2tfcG9pbnRzID09PSB0cnVlKSB7XHJcbiAgICAgICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgxMjAwLCAxMjAwLCAwKTtcclxuICAgICAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgICAgICB0cmFja19wb2ludHMgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdHJhY2tfcG9pbnRzID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2VDYW1lcmEgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlX2NhbWVyYScpO1xyXG52YXIgRm9yY2UyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTInKTtcclxuXHJcbnZhciB2cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxyXFxudW5pZm9ybSBmbG9hdCByYWRpdXM7XFxyXFxudW5pZm9ybSBmbG9hdCBkaXN0b3J0O1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyB2ZWMzIHZOb3JtYWw7XFxyXFxuXFxyXFxuLy9cXG4vLyBEZXNjcmlwdGlvbiA6IEFycmF5IGFuZCB0ZXh0dXJlbGVzcyBHTFNMIDJELzNELzREIHNpbXBsZXhcXG4vLyAgICAgICAgICAgICAgIG5vaXNlIGZ1bmN0aW9ucy5cXG4vLyAgICAgIEF1dGhvciA6IElhbiBNY0V3YW4sIEFzaGltYSBBcnRzLlxcbi8vICBNYWludGFpbmVyIDogaWptXFxuLy8gICAgIExhc3Rtb2QgOiAyMDExMDgyMiAoaWptKVxcbi8vICAgICBMaWNlbnNlIDogQ29weXJpZ2h0IChDKSAyMDExIEFzaGltYSBBcnRzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxcbi8vICAgICAgICAgICAgICAgRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlLlxcbi8vICAgICAgICAgICAgICAgaHR0cHM6Ly9naXRodWIuY29tL2FzaGltYS93ZWJnbC1ub2lzZVxcbi8vXFxuXFxudmVjMyBtb2QyODlfMl8wKHZlYzMgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBtb2QyODlfMl8wKHZlYzQgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBwZXJtdXRlXzJfMSh2ZWM0IHgpIHtcXG4gICAgIHJldHVybiBtb2QyODlfMl8wKCgoeCozNC4wKSsxLjApKngpO1xcbn1cXG5cXG52ZWM0IHRheWxvckludlNxcnRfMl8yKHZlYzQgcilcXG57XFxuICByZXR1cm4gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiByO1xcbn1cXG5cXG5mbG9hdCBzbm9pc2VfMl8zKHZlYzMgdilcXG4gIHtcXG4gIGNvbnN0IHZlYzIgIEMgPSB2ZWMyKDEuMC82LjAsIDEuMC8zLjApIDtcXG4gIGNvbnN0IHZlYzQgIERfMl80ID0gdmVjNCgwLjAsIDAuNSwgMS4wLCAyLjApO1xcblxcbi8vIEZpcnN0IGNvcm5lclxcbiAgdmVjMyBpICA9IGZsb29yKHYgKyBkb3QodiwgQy55eXkpICk7XFxuICB2ZWMzIHgwID0gICB2IC0gaSArIGRvdChpLCBDLnh4eCkgO1xcblxcbi8vIE90aGVyIGNvcm5lcnNcXG4gIHZlYzMgZ18yXzUgPSBzdGVwKHgwLnl6eCwgeDAueHl6KTtcXG4gIHZlYzMgbCA9IDEuMCAtIGdfMl81O1xcbiAgdmVjMyBpMSA9IG1pbiggZ18yXzUueHl6LCBsLnp4eSApO1xcbiAgdmVjMyBpMiA9IG1heCggZ18yXzUueHl6LCBsLnp4eSApO1xcblxcbiAgLy8gICB4MCA9IHgwIC0gMC4wICsgMC4wICogQy54eHg7XFxuICAvLyAgIHgxID0geDAgLSBpMSAgKyAxLjAgKiBDLnh4eDtcXG4gIC8vICAgeDIgPSB4MCAtIGkyICArIDIuMCAqIEMueHh4O1xcbiAgLy8gICB4MyA9IHgwIC0gMS4wICsgMy4wICogQy54eHg7XFxuICB2ZWMzIHgxID0geDAgLSBpMSArIEMueHh4O1xcbiAgdmVjMyB4MiA9IHgwIC0gaTIgKyBDLnl5eTsgLy8gMi4wKkMueCA9IDEvMyA9IEMueVxcbiAgdmVjMyB4MyA9IHgwIC0gRF8yXzQueXl5OyAgICAgIC8vIC0xLjArMy4wKkMueCA9IC0wLjUgPSAtRC55XFxuXFxuLy8gUGVybXV0YXRpb25zXFxuICBpID0gbW9kMjg5XzJfMChpKTtcXG4gIHZlYzQgcCA9IHBlcm11dGVfMl8xKCBwZXJtdXRlXzJfMSggcGVybXV0ZV8yXzEoXFxuICAgICAgICAgICAgIGkueiArIHZlYzQoMC4wLCBpMS56LCBpMi56LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS55ICsgdmVjNCgwLjAsIGkxLnksIGkyLnksIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnggKyB2ZWM0KDAuMCwgaTEueCwgaTIueCwgMS4wICkpO1xcblxcbi8vIEdyYWRpZW50czogN3g3IHBvaW50cyBvdmVyIGEgc3F1YXJlLCBtYXBwZWQgb250byBhbiBvY3RhaGVkcm9uLlxcbi8vIFRoZSByaW5nIHNpemUgMTcqMTcgPSAyODkgaXMgY2xvc2UgdG8gYSBtdWx0aXBsZSBvZiA0OSAoNDkqNiA9IDI5NClcXG4gIGZsb2F0IG5fID0gMC4xNDI4NTcxNDI4NTc7IC8vIDEuMC83LjBcXG4gIHZlYzMgIG5zID0gbl8gKiBEXzJfNC53eXogLSBEXzJfNC54eng7XFxuXFxuICB2ZWM0IGogPSBwIC0gNDkuMCAqIGZsb29yKHAgKiBucy56ICogbnMueik7ICAvLyAgbW9kKHAsNyo3KVxcblxcbiAgdmVjNCB4XyA9IGZsb29yKGogKiBucy56KTtcXG4gIHZlYzQgeV8gPSBmbG9vcihqIC0gNy4wICogeF8gKTsgICAgLy8gbW9kKGosTilcXG5cXG4gIHZlYzQgeCA9IHhfICpucy54ICsgbnMueXl5eTtcXG4gIHZlYzQgeSA9IHlfICpucy54ICsgbnMueXl5eTtcXG4gIHZlYzQgaCA9IDEuMCAtIGFicyh4KSAtIGFicyh5KTtcXG5cXG4gIHZlYzQgYjAgPSB2ZWM0KCB4Lnh5LCB5Lnh5ICk7XFxuICB2ZWM0IGIxID0gdmVjNCggeC56dywgeS56dyApO1xcblxcbiAgLy92ZWM0IHMwID0gdmVjNChsZXNzVGhhbihiMCwwLjApKSoyLjAgLSAxLjA7XFxuICAvL3ZlYzQgczEgPSB2ZWM0KGxlc3NUaGFuKGIxLDAuMCkpKjIuMCAtIDEuMDtcXG4gIHZlYzQgczAgPSBmbG9vcihiMCkqMi4wICsgMS4wO1xcbiAgdmVjNCBzMSA9IGZsb29yKGIxKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHNoID0gLXN0ZXAoaCwgdmVjNCgwLjApKTtcXG5cXG4gIHZlYzQgYTAgPSBiMC54enl3ICsgczAueHp5dypzaC54eHl5IDtcXG4gIHZlYzQgYTFfMl82ID0gYjEueHp5dyArIHMxLnh6eXcqc2guenp3dyA7XFxuXFxuICB2ZWMzIHAwXzJfNyA9IHZlYzMoYTAueHksaC54KTtcXG4gIHZlYzMgcDEgPSB2ZWMzKGEwLnp3LGgueSk7XFxuICB2ZWMzIHAyID0gdmVjMyhhMV8yXzYueHksaC56KTtcXG4gIHZlYzMgcDMgPSB2ZWMzKGExXzJfNi56dyxoLncpO1xcblxcbi8vTm9ybWFsaXNlIGdyYWRpZW50c1xcbiAgdmVjNCBub3JtID0gdGF5bG9ySW52U3FydF8yXzIodmVjNChkb3QocDBfMl83LHAwXzJfNyksIGRvdChwMSxwMSksIGRvdChwMiwgcDIpLCBkb3QocDMscDMpKSk7XFxuICBwMF8yXzcgKj0gbm9ybS54O1xcbiAgcDEgKj0gbm9ybS55O1xcbiAgcDIgKj0gbm9ybS56O1xcbiAgcDMgKj0gbm9ybS53O1xcblxcbi8vIE1peCBmaW5hbCBub2lzZSB2YWx1ZVxcbiAgdmVjNCBtID0gbWF4KDAuNiAtIHZlYzQoZG90KHgwLHgwKSwgZG90KHgxLHgxKSwgZG90KHgyLHgyKSwgZG90KHgzLHgzKSksIDAuMCk7XFxuICBtID0gbSAqIG07XFxuICByZXR1cm4gNDIuMCAqIGRvdCggbSptLCB2ZWM0KCBkb3QocDBfMl83LHgwKSwgZG90KHAxLHgxKSxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvdChwMix4MiksIGRvdChwMyx4MykgKSApO1xcbiAgfVxcblxcblxcblxcbnZlYzMgaHN2MnJnYl8xXzgodmVjMyBjKXtcXHJcXG4gIHZlYzQgSyA9IHZlYzQoMS4wLCAyLjAgLyAzLjAsIDEuMCAvIDMuMCwgMy4wKTtcXHJcXG4gIHZlYzMgcCA9IGFicyhmcmFjdChjLnh4eCArIEsueHl6KSAqIDYuMCAtIEsud3d3KTtcXHJcXG4gIHJldHVybiBjLnogKiBtaXgoSy54eHgsIGNsYW1wKHAgLSBLLnh4eCwgMC4wLCAxLjApLCBjLnkpO1xcclxcbn1cXHJcXG5cXG5cXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBmbG9hdCB1cGRhdGVUaW1lID0gdGltZSAvIDEwMDAuMDtcXHJcXG4gIGZsb2F0IG5vaXNlID0gc25vaXNlXzJfMyh2ZWMzKHBvc2l0aW9uIC8gNDAwLjEgKyB1cGRhdGVUaW1lICogNS4wKSk7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uICogKG5vaXNlICogcG93KGRpc3RvcnQsIDIuMCkgKyByYWRpdXMpLCAxLjApO1xcclxcblxcclxcbiAgdkNvbG9yID0gaHN2MnJnYl8xXzgodmVjMyhub2lzZSAqIGRpc3RvcnQgKiAwLjMgKyB1cGRhdGVUaW1lLCAwLjIsIDEuMCkpO1xcclxcbiAgdk5vcm1hbCA9IG5vcm1hbDtcXHJcXG5cXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIHZlYzMgdk5vcm1hbDtcXHJcXG5cXHJcXG4vL1xcbi8vIERlc2NyaXB0aW9uIDogQXJyYXkgYW5kIHRleHR1cmVsZXNzIEdMU0wgMkQvM0QvNEQgc2ltcGxleFxcbi8vICAgICAgICAgICAgICAgbm9pc2UgZnVuY3Rpb25zLlxcbi8vICAgICAgQXV0aG9yIDogSWFuIE1jRXdhbiwgQXNoaW1hIEFydHMuXFxuLy8gIE1haW50YWluZXIgOiBpam1cXG4vLyAgICAgTGFzdG1vZCA6IDIwMTEwODIyIChpam0pXFxuLy8gICAgIExpY2Vuc2UgOiBDb3B5cmlnaHQgKEMpIDIwMTEgQXNoaW1hIEFydHMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXFxuLy8gICAgICAgICAgICAgICBEaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUuXFxuLy8gICAgICAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vYXNoaW1hL3dlYmdsLW5vaXNlXFxuLy9cXG5cXG52ZWMzIG1vZDI4OV8yXzAodmVjMyB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IG1vZDI4OV8yXzAodmVjNCB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IHBlcm11dGVfMl8xKHZlYzQgeCkge1xcbiAgICAgcmV0dXJuIG1vZDI4OV8yXzAoKCh4KjM0LjApKzEuMCkqeCk7XFxufVxcblxcbnZlYzQgdGF5bG9ySW52U3FydF8yXzIodmVjNCByKVxcbntcXG4gIHJldHVybiAxLjc5Mjg0MjkxNDAwMTU5IC0gMC44NTM3MzQ3MjA5NTMxNCAqIHI7XFxufVxcblxcbmZsb2F0IHNub2lzZV8yXzModmVjMyB2KVxcbiAge1xcbiAgY29uc3QgdmVjMiAgQyA9IHZlYzIoMS4wLzYuMCwgMS4wLzMuMCkgO1xcbiAgY29uc3QgdmVjNCAgRF8yXzQgPSB2ZWM0KDAuMCwgMC41LCAxLjAsIDIuMCk7XFxuXFxuLy8gRmlyc3QgY29ybmVyXFxuICB2ZWMzIGkgID0gZmxvb3IodiArIGRvdCh2LCBDLnl5eSkgKTtcXG4gIHZlYzMgeDAgPSAgIHYgLSBpICsgZG90KGksIEMueHh4KSA7XFxuXFxuLy8gT3RoZXIgY29ybmVyc1xcbiAgdmVjMyBnXzJfNSA9IHN0ZXAoeDAueXp4LCB4MC54eXopO1xcbiAgdmVjMyBsID0gMS4wIC0gZ18yXzU7XFxuICB2ZWMzIGkxID0gbWluKCBnXzJfNS54eXosIGwuenh5ICk7XFxuICB2ZWMzIGkyID0gbWF4KCBnXzJfNS54eXosIGwuenh5ICk7XFxuXFxuICAvLyAgIHgwID0geDAgLSAwLjAgKyAwLjAgKiBDLnh4eDtcXG4gIC8vICAgeDEgPSB4MCAtIGkxICArIDEuMCAqIEMueHh4O1xcbiAgLy8gICB4MiA9IHgwIC0gaTIgICsgMi4wICogQy54eHg7XFxuICAvLyAgIHgzID0geDAgLSAxLjAgKyAzLjAgKiBDLnh4eDtcXG4gIHZlYzMgeDEgPSB4MCAtIGkxICsgQy54eHg7XFxuICB2ZWMzIHgyID0geDAgLSBpMiArIEMueXl5OyAvLyAyLjAqQy54ID0gMS8zID0gQy55XFxuICB2ZWMzIHgzID0geDAgLSBEXzJfNC55eXk7ICAgICAgLy8gLTEuMCszLjAqQy54ID0gLTAuNSA9IC1ELnlcXG5cXG4vLyBQZXJtdXRhdGlvbnNcXG4gIGkgPSBtb2QyODlfMl8wKGkpO1xcbiAgdmVjNCBwID0gcGVybXV0ZV8yXzEoIHBlcm11dGVfMl8xKCBwZXJtdXRlXzJfMShcXG4gICAgICAgICAgICAgaS56ICsgdmVjNCgwLjAsIGkxLnosIGkyLnosIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnkgKyB2ZWM0KDAuMCwgaTEueSwgaTIueSwgMS4wICkpXFxuICAgICAgICAgICArIGkueCArIHZlYzQoMC4wLCBpMS54LCBpMi54LCAxLjAgKSk7XFxuXFxuLy8gR3JhZGllbnRzOiA3eDcgcG9pbnRzIG92ZXIgYSBzcXVhcmUsIG1hcHBlZCBvbnRvIGFuIG9jdGFoZWRyb24uXFxuLy8gVGhlIHJpbmcgc2l6ZSAxNyoxNyA9IDI4OSBpcyBjbG9zZSB0byBhIG11bHRpcGxlIG9mIDQ5ICg0OSo2ID0gMjk0KVxcbiAgZmxvYXQgbl8gPSAwLjE0Mjg1NzE0Mjg1NzsgLy8gMS4wLzcuMFxcbiAgdmVjMyAgbnMgPSBuXyAqIERfMl80Lnd5eiAtIERfMl80Lnh6eDtcXG5cXG4gIHZlYzQgaiA9IHAgLSA0OS4wICogZmxvb3IocCAqIG5zLnogKiBucy56KTsgIC8vICBtb2QocCw3KjcpXFxuXFxuICB2ZWM0IHhfID0gZmxvb3IoaiAqIG5zLnopO1xcbiAgdmVjNCB5XyA9IGZsb29yKGogLSA3LjAgKiB4XyApOyAgICAvLyBtb2QoaixOKVxcblxcbiAgdmVjNCB4ID0geF8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCB5ID0geV8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCBoID0gMS4wIC0gYWJzKHgpIC0gYWJzKHkpO1xcblxcbiAgdmVjNCBiMCA9IHZlYzQoIHgueHksIHkueHkgKTtcXG4gIHZlYzQgYjEgPSB2ZWM0KCB4Lnp3LCB5Lnp3ICk7XFxuXFxuICAvL3ZlYzQgczAgPSB2ZWM0KGxlc3NUaGFuKGIwLDAuMCkpKjIuMCAtIDEuMDtcXG4gIC8vdmVjNCBzMSA9IHZlYzQobGVzc1RoYW4oYjEsMC4wKSkqMi4wIC0gMS4wO1xcbiAgdmVjNCBzMCA9IGZsb29yKGIwKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHMxID0gZmxvb3IoYjEpKjIuMCArIDEuMDtcXG4gIHZlYzQgc2ggPSAtc3RlcChoLCB2ZWM0KDAuMCkpO1xcblxcbiAgdmVjNCBhMCA9IGIwLnh6eXcgKyBzMC54enl3KnNoLnh4eXkgO1xcbiAgdmVjNCBhMV8yXzYgPSBiMS54enl3ICsgczEueHp5dypzaC56end3IDtcXG5cXG4gIHZlYzMgcDBfMl83ID0gdmVjMyhhMC54eSxoLngpO1xcbiAgdmVjMyBwMSA9IHZlYzMoYTAuencsaC55KTtcXG4gIHZlYzMgcDIgPSB2ZWMzKGExXzJfNi54eSxoLnopO1xcbiAgdmVjMyBwMyA9IHZlYzMoYTFfMl82Lnp3LGgudyk7XFxuXFxuLy9Ob3JtYWxpc2UgZ3JhZGllbnRzXFxuICB2ZWM0IG5vcm0gPSB0YXlsb3JJbnZTcXJ0XzJfMih2ZWM0KGRvdChwMF8yXzcscDBfMl83KSwgZG90KHAxLHAxKSwgZG90KHAyLCBwMiksIGRvdChwMyxwMykpKTtcXG4gIHAwXzJfNyAqPSBub3JtLng7XFxuICBwMSAqPSBub3JtLnk7XFxuICBwMiAqPSBub3JtLno7XFxuICBwMyAqPSBub3JtLnc7XFxuXFxuLy8gTWl4IGZpbmFsIG5vaXNlIHZhbHVlXFxuICB2ZWM0IG0gPSBtYXgoMC42IC0gdmVjNChkb3QoeDAseDApLCBkb3QoeDEseDEpLCBkb3QoeDIseDIpLCBkb3QoeDMseDMpKSwgMC4wKTtcXG4gIG0gPSBtICogbTtcXG4gIHJldHVybiA0Mi4wICogZG90KCBtKm0sIHZlYzQoIGRvdChwMF8yXzcseDApLCBkb3QocDEseDEpLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90KHAyLHgyKSwgZG90KHAzLHgzKSApICk7XFxuICB9XFxuXFxuXFxuXFxudmVjMyBoc3YycmdiXzFfOCh2ZWMzIGMpe1xcclxcbiAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xcclxcbiAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xcclxcbiAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XFxyXFxufVxcclxcblxcblxcblxcclxcbnN0cnVjdCBIZW1pc3BoZXJlTGlnaHQge1xcclxcbiAgdmVjMyBkaXJlY3Rpb247XFxyXFxuICB2ZWMzIGdyb3VuZENvbG9yO1xcclxcbiAgdmVjMyBza3lDb2xvcjtcXHJcXG59O1xcclxcbnVuaWZvcm0gSGVtaXNwaGVyZUxpZ2h0IGhlbWlzcGhlcmVMaWdodHNbTlVNX0hFTUlfTElHSFRTXTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2ZWMzIGxpZ2h0ID0gdmVjMygwLjApO1xcclxcbiAgbGlnaHQgKz0gKGRvdChoZW1pc3BoZXJlTGlnaHRzWzBdLmRpcmVjdGlvbiwgdk5vcm1hbCkgKyAxLjApICogaGVtaXNwaGVyZUxpZ2h0c1swXS5za3lDb2xvciAqIDAuNTtcXHJcXG4gIGxpZ2h0ICs9ICgtZG90KGhlbWlzcGhlcmVMaWdodHNbMF0uZGlyZWN0aW9uLCB2Tm9ybWFsKSArIDEuMCkgKiBoZW1pc3BoZXJlTGlnaHRzWzBdLmdyb3VuZENvbG9yICogMC41O1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCh2Q29sb3IgKiBsaWdodCwgMS4wKTtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciB2c19wcCA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbnZvaWQgbWFpbih2b2lkKSB7XFxyXFxuICB2VXYgPSB1djtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciBmc19wcCA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxyXFxudW5pZm9ybSB2ZWMyIHJlc29sdXRpb247XFxyXFxudW5pZm9ybSBmbG9hdCBhY2NlbGVyYXRpb247XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXHJcXG5cXHJcXG5jb25zdCBmbG9hdCBibHVyID0gMTYuMDtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbmZsb2F0IHJhbmRvbTJfMV8wKHZlYzIgYyl7XFxyXFxuICAgIHJldHVybiBmcmFjdChzaW4oZG90KGMueHkgLHZlYzIoMTIuOTg5OCw3OC4yMzMpKSkgKiA0Mzc1OC41NDUzKTtcXHJcXG59XFxyXFxuXFxuXFxuLy9cXG4vLyBEZXNjcmlwdGlvbiA6IEFycmF5IGFuZCB0ZXh0dXJlbGVzcyBHTFNMIDJEIHNpbXBsZXggbm9pc2UgZnVuY3Rpb24uXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzJfMSh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzIgbW9kMjg5XzJfMSh2ZWMyIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzMgcGVybXV0ZV8yXzIodmVjMyB4KSB7XFxuICByZXR1cm4gbW9kMjg5XzJfMSgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzJfMyh2ZWMyIHYpXFxuICB7XFxuICBjb25zdCB2ZWM0IEMgPSB2ZWM0KDAuMjExMzI0ODY1NDA1MTg3LCAgLy8gKDMuMC1zcXJ0KDMuMCkpLzYuMFxcbiAgICAgICAgICAgICAgICAgICAgICAwLjM2NjAyNTQwMzc4NDQzOSwgIC8vIDAuNSooc3FydCgzLjApLTEuMClcXG4gICAgICAgICAgICAgICAgICAgICAtMC41NzczNTAyNjkxODk2MjYsICAvLyAtMS4wICsgMi4wICogQy54XFxuICAgICAgICAgICAgICAgICAgICAgIDAuMDI0MzkwMjQzOTAyNDM5KTsgLy8gMS4wIC8gNDEuMFxcbi8vIEZpcnN0IGNvcm5lclxcbiAgdmVjMiBpICA9IGZsb29yKHYgKyBkb3QodiwgQy55eSkgKTtcXG4gIHZlYzIgeDAgPSB2IC0gICBpICsgZG90KGksIEMueHgpO1xcblxcbi8vIE90aGVyIGNvcm5lcnNcXG4gIHZlYzIgaTE7XFxuICAvL2kxLnggPSBzdGVwKCB4MC55LCB4MC54ICk7IC8vIHgwLnggPiB4MC55ID8gMS4wIDogMC4wXFxuICAvL2kxLnkgPSAxLjAgLSBpMS54O1xcbiAgaTEgPSAoeDAueCA+IHgwLnkpID8gdmVjMigxLjAsIDAuMCkgOiB2ZWMyKDAuMCwgMS4wKTtcXG4gIC8vIHgwID0geDAgLSAwLjAgKyAwLjAgKiBDLnh4IDtcXG4gIC8vIHgxID0geDAgLSBpMSArIDEuMCAqIEMueHggO1xcbiAgLy8geDIgPSB4MCAtIDEuMCArIDIuMCAqIEMueHggO1xcbiAgdmVjNCB4MTIgPSB4MC54eXh5ICsgQy54eHp6O1xcbiAgeDEyLnh5IC09IGkxO1xcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV8yXzEoaSk7IC8vIEF2b2lkIHRydW5jYXRpb24gZWZmZWN0cyBpbiBwZXJtdXRhdGlvblxcbiAgdmVjMyBwID0gcGVybXV0ZV8yXzIoIHBlcm11dGVfMl8yKCBpLnkgKyB2ZWMzKDAuMCwgaTEueSwgMS4wICkpXFxuICAgICsgaS54ICsgdmVjMygwLjAsIGkxLngsIDEuMCApKTtcXG5cXG4gIHZlYzMgbSA9IG1heCgwLjUgLSB2ZWMzKGRvdCh4MCx4MCksIGRvdCh4MTIueHkseDEyLnh5KSwgZG90KHgxMi56dyx4MTIuencpKSwgMC4wKTtcXG4gIG0gPSBtKm0gO1xcbiAgbSA9IG0qbSA7XFxuXFxuLy8gR3JhZGllbnRzOiA0MSBwb2ludHMgdW5pZm9ybWx5IG92ZXIgYSBsaW5lLCBtYXBwZWQgb250byBhIGRpYW1vbmQuXFxuLy8gVGhlIHJpbmcgc2l6ZSAxNyoxNyA9IDI4OSBpcyBjbG9zZSB0byBhIG11bHRpcGxlIG9mIDQxICg0MSo3ID0gMjg3KVxcblxcbiAgdmVjMyB4ID0gMi4wICogZnJhY3QocCAqIEMud3d3KSAtIDEuMDtcXG4gIHZlYzMgaCA9IGFicyh4KSAtIDAuNTtcXG4gIHZlYzMgb3ggPSBmbG9vcih4ICsgMC41KTtcXG4gIHZlYzMgYTAgPSB4IC0gb3g7XFxuXFxuLy8gTm9ybWFsaXNlIGdyYWRpZW50cyBpbXBsaWNpdGx5IGJ5IHNjYWxpbmcgbVxcbi8vIEFwcHJveGltYXRpb24gb2Y6IG0gKj0gaW52ZXJzZXNxcnQoIGEwKmEwICsgaCpoICk7XFxuICBtICo9IDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogKCBhMCphMCArIGgqaCApO1xcblxcbi8vIENvbXB1dGUgZmluYWwgbm9pc2UgdmFsdWUgYXQgUFxcbiAgdmVjMyBnO1xcbiAgZy54ICA9IGEwLnggICogeDAueCAgKyBoLnggICogeDAueTtcXG4gIGcueXogPSBhMC55eiAqIHgxMi54eiArIGgueXogKiB4MTIueXc7XFxuICByZXR1cm4gMTMwLjAgKiBkb3QobSwgZyk7XFxufVxcblxcblxcblxcblxcclxcbnZlYzIgZGlmZlV2KGZsb2F0IHYsIGZsb2F0IGRpZmYpIHtcXHJcXG4gIHJldHVybiB2VXYgKyAodmVjMih2ICsgc25vaXNlXzJfMyh2ZWMyKGdsX0ZyYWdDb29yZC55ICsgdGltZSkgLyAxMDAuMCksIDAuMCkgKiBkaWZmICsgdmVjMih2ICogMy4wLCAwLjApKSAvIHJlc29sdXRpb247XFxyXFxufVxcclxcblxcclxcbmZsb2F0IHJhbmRvbU5vaXNlKHZlYzIgcCkge1xcclxcbiAgcmV0dXJuIChyYW5kb20yXzFfMChwIC0gdmVjMihzaW4odGltZSkpKSAqIDIuMCAtIDEuMCkgKiBtYXgobGVuZ3RoKGFjY2VsZXJhdGlvbiksIDAuMDgpO1xcclxcbn1cXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBmbG9hdCBkaWZmID0gMzAwLjAgKiBsZW5ndGgoYWNjZWxlcmF0aW9uKTtcXHJcXG4gIHZlYzIgdXZfciA9IGRpZmZVdigwLjAsIGRpZmYpO1xcclxcbiAgdmVjMiB1dl9nID0gZGlmZlV2KDEuMCwgZGlmZik7XFxyXFxuICB2ZWMyIHV2X2IgPSBkaWZmVXYoLTEuMCwgZGlmZik7XFxyXFxuICBmbG9hdCByID0gdGV4dHVyZTJEKHRleHR1cmUsIHV2X3IpLnIgKyByYW5kb21Ob2lzZSh1dl9yKTtcXHJcXG4gIGZsb2F0IGcgPSB0ZXh0dXJlMkQodGV4dHVyZSwgdXZfZykuZyArIHJhbmRvbU5vaXNlKHV2X2cpO1xcclxcbiAgZmxvYXQgYiA9IHRleHR1cmUyRCh0ZXh0dXJlLCB1dl9iKS5iICsgcmFuZG9tTm9pc2UodXZfYik7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHIsIGcsIGIsIDEuMCk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuICB2YXIgc3BoZXJlID0gbnVsbDtcclxuICB2YXIgYmcgPSBudWxsO1xyXG4gIHZhciBsaWdodCA9IG5ldyBUSFJFRS5IZW1pc3BoZXJlTGlnaHQoMHhmZmZmZmYsIDB4NjY2NjY2LCAxKTtcclxuICB2YXIgc3ViX3NjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgdmFyIHN1Yl9jYW1lcmEgPSBuZXcgRm9yY2VDYW1lcmEoNDUsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCAxLCAxMDAwMCk7XHJcbiAgdmFyIHN1Yl9saWdodCA9IG5ldyBUSFJFRS5IZW1pc3BoZXJlTGlnaHQoMHhmZmZmZmYsIDB4NjY2NjY2LCAxKTtcclxuICB2YXIgZm9yY2UgPSBuZXcgRm9yY2UyKCk7XHJcbiAgdmFyIHRpbWVfdW5pdCA9IDE7XHJcbiAgdmFyIHJlbmRlcl90YXJnZXQgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCwge1xyXG4gICAgbWFnRmlsdGVyOiBUSFJFRS5OZWFyZXN0RmlsdGVyLFxyXG4gICAgbWluRmlsdGVyOiBUSFJFRS5OZWFyZXN0RmlsdGVyLFxyXG4gICAgd3JhcFM6IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmcsXHJcbiAgICB3cmFwVDogVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZ1xyXG4gIH0pXHJcbiAgdmFyIGZyYW1lYnVmZmVyID0gbnVsbDtcclxuXHJcbiAgdmFyIGNyZWF0ZVNwaGVyZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICBnZW9tZXRyeS5mcm9tR2VvbWV0cnkobmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeSgyMDAsIDUpKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiBUSFJFRS5Vbmlmb3Jtc1V0aWxzLm1lcmdlKFtcclxuICAgICAgICBUSFJFRS5Vbmlmb3Jtc0xpYlsnbGlnaHRzJ10sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJhZGl1czoge1xyXG4gICAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICAgIHZhbHVlOiAxLjBcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBkaXN0b3J0OiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgICAgdmFsdWU6IDAuNFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgXSksXHJcbiAgICAgIHZlcnRleFNoYWRlcjogdnMsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBmcyxcclxuICAgICAgbGlnaHRzOiB0cnVlLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDE4MDApO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgc2lkZTogVEhSRUUuQmFja1NpZGUsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVQbGFuZUZvclBvc3RQcm9jZXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnlfYmFzZSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDIsIDIpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICBnZW9tZXRyeS5mcm9tR2VvbWV0cnkoZ2VvbWV0cnlfYmFzZSk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzb2x1dGlvbjoge1xyXG4gICAgICAgICAgdHlwZTogJ3YyJyxcclxuICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWNjZWxlcmF0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGV4dHVyZToge1xyXG4gICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgdmFsdWU6IHJlbmRlcl90YXJnZXQsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiB2c19wcCxcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGZzX3BwLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJ2JnLXdoaXRlJztcclxuICAgICAgc3BoZXJlID0gY3JlYXRlU3BoZXJlKCk7XHJcbiAgICAgIHN1Yl9zY2VuZS5hZGQoc3BoZXJlKTtcclxuICAgICAgYmcgPSBjcmVhdGVCYWNrZ3JvdW5kKCk7XHJcbiAgICAgIHN1Yl9zY2VuZS5hZGQoYmcpO1xyXG4gICAgICBzdWJfc2NlbmUuYWRkKHN1Yl9saWdodCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgxODAwLCAxODAwLCAwKTtcclxuICAgICAgc3ViX2NhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKHNwaGVyZS5tYXRlcmlhbC51bmlmb3Jtcyk7XHJcblxyXG4gICAgICBmcmFtZWJ1ZmZlciA9IGNyZWF0ZVBsYW5lRm9yUG9zdFByb2Nlc3MoKTtcclxuICAgICAgc2NlbmUuYWRkKGZyYW1lYnVmZmVyKTtcclxuICAgICAgc2NlbmUuYWRkKGxpZ2h0KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoMTgwMCwgMTgwMCwgMCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMSwgMCk7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMSwgMCk7XHJcbiAgICAgIGZvcmNlLnZlbG9jaXR5LnNldCgxLCAwKTtcclxuICAgICAgZm9yY2UuayA9IDAuMDQ1O1xyXG4gICAgICBmb3JjZS5kID0gMC4xNjtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJyc7XHJcbiAgICAgIHNwaGVyZS5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHNwaGVyZS5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHN1Yl9zY2VuZS5yZW1vdmUoc3BoZXJlKTtcclxuICAgICAgYmcuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBiZy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHN1Yl9zY2VuZS5yZW1vdmUoYmcpO1xyXG4gICAgICBzdWJfc2NlbmUucmVtb3ZlKHN1Yl9saWdodCk7XHJcbiAgICAgIGZyYW1lYnVmZmVyLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgZnJhbWVidWZmZXIubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoZnJhbWVidWZmZXIpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUobGlnaHQpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpIHtcclxuICAgICAgZm9yY2UuYXBwbHlIb29rKDAsIGZvcmNlLmspO1xyXG4gICAgICBmb3JjZS5hcHBseURyYWcoZm9yY2UuZCk7XHJcbiAgICAgIGZvcmNlLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKGZvcmNlLmFjY2VsZXJhdGlvbi5sZW5ndGgoKSk7XHJcbiAgICAgIHNwaGVyZS5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlICs9IHRpbWVfdW5pdDtcclxuICAgICAgc3BoZXJlLm1hdGVyaWFsLnVuaWZvcm1zLnJhZGl1cy52YWx1ZSA9IGZvcmNlLnZlbG9jaXR5Lng7XHJcbiAgICAgIHNwaGVyZS5tYXRlcmlhbC51bmlmb3Jtcy5kaXN0b3J0LnZhbHVlID0gZm9yY2UudmVsb2NpdHkueCAvIDIgLSAwLjE7XHJcbiAgICAgIHN1Yl9jYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgc3ViX2NhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgc3ViX2NhbWVyYS5mb3JjZS5wb3NpdGlvbi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBzdWJfY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEuZm9yY2UubG9vay5hcHBseUhvb2soMCwgMC4yKTtcclxuICAgICAgc3ViX2NhbWVyYS5mb3JjZS5sb29rLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBzdWJfY2FtZXJhLmZvcmNlLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgc3ViX2NhbWVyYS51cGRhdGVMb29rKCk7XHJcblxyXG4gICAgICBmcmFtZWJ1ZmZlci5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlICs9IHRpbWVfdW5pdDtcclxuICAgICAgZnJhbWVidWZmZXIubWF0ZXJpYWwudW5pZm9ybXMuYWNjZWxlcmF0aW9uLnZhbHVlID0gZm9yY2UuYWNjZWxlcmF0aW9uLmxlbmd0aCgpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5SG9vaygwLCAwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLmxvb2tBdChjYW1lcmEuZm9yY2UubG9vay52ZWxvY2l0eSk7XHJcblxyXG4gICAgICByZW5kZXJlci5yZW5kZXIoc3ViX3NjZW5lLCBzdWJfY2FtZXJhLCByZW5kZXJfdGFyZ2V0KTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgaWYgKGZvcmNlLmFuY2hvci54IDwgMykge1xyXG4gICAgICAgIGZvcmNlLmsgKz0gMC4wMDU7XHJcbiAgICAgICAgZm9yY2UuZCAtPSAwLjAyO1xyXG4gICAgICAgIGZvcmNlLmFuY2hvci54ICs9IDAuODtcclxuICAgICAgICB0aW1lX3VuaXQgKz0gMC40O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvcmNlLmsgPSAwLjA1O1xyXG4gICAgICAgIGZvcmNlLmQgPSAwLjE2O1xyXG4gICAgICAgIGZvcmNlLmFuY2hvci54ID0gMS4wO1xyXG4gICAgICAgIHRpbWVfdW5pdCA9IDE7XHJcbiAgICAgIH1cclxuICAgICAgaXNfdG91Y2hlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgICBpc190b3VjaGVkID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgdGhpcy50b3VjaEVuZChzY2VuZSwgY2FtZXJhKVxyXG4gICAgfSxcclxuICAgIHJlc2l6ZVdpbmRvdzogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICByZW5kZXJfdGFyZ2V0LnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEucmVzaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgICBmcmFtZWJ1ZmZlci5tYXRlcmlhbC51bmlmb3Jtcy5yZXNvbHV0aW9uLnZhbHVlLnNldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbW92ZXInKTtcclxudmFyIFBvaW50cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRzLmpzJyk7XHJcbnZhciBGb3JjZVBvaW50TGlnaHQgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlX3BvaW50X2xpZ2h0Jyk7XHJcblxyXG52YXIgdnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgY3VzdG9tQ29sb3I7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHZlcnRleE9wYWNpdHk7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHNpemU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZDb2xvciA9IGN1c3RvbUNvbG9yO1xcclxcbiAgZk9wYWNpdHkgPSB2ZXJ0ZXhPcGFjaXR5O1xcclxcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG4gIGdsX1BvaW50U2l6ZSA9IHNpemUgKiAoMzAwLjAgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXHJcXG59XFxyXFxuXCI7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciBtb3ZlcnNfbnVtID0gMTAwMDA7XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIGxpZ2h0ID0gbmV3IEZvcmNlUG9pbnRMaWdodCgweGZmNjYwMCwgMSwgMTgwMCwgMSk7XHJcbiAgdmFyIGJnID0gbnVsbDtcclxuICB2YXIgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIGdyYXZpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLjEsIDApO1xyXG4gIHZhciBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gIHZhciBpc19kcmFnZWQgPSBmYWxzZTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZlKSB7XHJcbiAgICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoZ3Jhdml0eSk7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMDEpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgaWYgKG1vdmVyLnRpbWUgPiA1MCkge1xyXG4gICAgICAgICAgbW92ZXIuc2l6ZSAtPSAwLjc7XHJcbiAgICAgICAgICBtb3Zlci5hIC09IDAuMDA5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobW92ZXIuYSA8PSAwKSB7XHJcbiAgICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgIG1vdmVyLnRpbWUgPSAwO1xyXG4gICAgICAgICAgbW92ZXIuYSA9IDAuMDtcclxuICAgICAgICAgIG1vdmVyLmluYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54IC0gcG9pbnRzLnZlbG9jaXR5Lng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIudmVsb2NpdHkueSAtIHBvaW50cy52ZWxvY2l0eS55O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnZlbG9jaXR5LnogLSBwb2ludHMudmVsb2NpdHkuejtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY3RpdmF0ZU1vdmVyID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvdW50ID0gMDtcclxuICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgaWYgKG5vdyAtIGxhc3RfdGltZV9hY3RpdmF0ZSA+IDEwKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIGNvbnRpbnVlO1xyXG4gICAgICAgIHZhciByYWQxID0gVXRpbC5nZXRSYWRpYW4oTWF0aC5sb2coVXRpbC5nZXRSYW5kb21JbnQoMCwgMjU2KSkgLyBNYXRoLmxvZygyNTYpICogMjYwKTtcclxuICAgICAgICB2YXIgcmFkMiA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICAgIHZhciByYW5nZSA9ICgxLSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgzMiwgMjU2KSkgLyBNYXRoLmxvZygyNTYpKSAqIDEyO1xyXG4gICAgICAgIHZhciB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgICAgIHZhciBmb3JjZSA9IFV0aWwuZ2V0UG9sYXJDb29yZChyYWQxLCByYWQyLCByYW5nZSk7XHJcbiAgICAgICAgdmVjdG9yLmFkZChwb2ludHMudmVsb2NpdHkpO1xyXG4gICAgICAgIG1vdmVyLmFjdGl2YXRlKCk7XHJcbiAgICAgICAgbW92ZXIuaW5pdCh2ZWN0b3IpO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gICAgICAgIG1vdmVyLmEgPSAwLjI7XHJcbiAgICAgICAgbW92ZXIuc2l6ZSA9IE1hdGgucG93KDEyIC0gcmFuZ2UsIDIpICogVXRpbC5nZXRSYW5kb21JbnQoMSwgMjQpIC8gMTA7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgICBpZiAoY291bnQgPj0gNikgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgdXBkYXRlUG9pbnRzID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgcG9pbnRzLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICBsaWdodC5vYmoucG9zaXRpb24uY29weShwb2ludHMudmVsb2NpdHkpO1xyXG4gIH07XHJcblxyXG4gIHZhciBtb3ZlUG9pbnRzID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgICB2YXIgeSA9IHZlY3Rvci55ICogd2luZG93LmlubmVySGVpZ2h0IC8gMztcclxuICAgIHZhciB6ID0gdmVjdG9yLnggKiB3aW5kb3cuaW5uZXJXaWR0aCAvIC0zO1xyXG4gICAgcG9pbnRzLmFuY2hvci55ID0geTtcclxuICAgIHBvaW50cy5hbmNob3IueiA9IHo7XHJcbiAgICBsaWdodC5mb3JjZS5hbmNob3IueSA9IHk7XHJcbiAgICBsaWdodC5mb3JjZS5hbmNob3IueiA9IHo7XHJcbiAgfVxyXG5cclxuICB2YXIgY3JlYXRlVGV4dHVyZSA9ICBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIHZhciBncmFkID0gbnVsbDtcclxuICAgIHZhciB0ZXh0dXJlID0gbnVsbDtcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSAyMDA7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gMjAwO1xyXG4gICAgZ3JhZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudCgxMDAsIDEwMCwgMjAsIDEwMCwgMTAwLCAxMDApO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC4yLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC41LCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLjAsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDApJyk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcclxuICAgIGN0eC5hcmMoMTAwLCAxMDAsIDEwMCwgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXMpO1xyXG4gICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdGV4dHVyZTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZCA9ICBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5PY3RhaGVkcm9uR2VvbWV0cnkoMTUwMCwgMyk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBjb2xvcjogMHhmZmZmZmYsXHJcbiAgICAgIHNoYWRpbmc6IFRIUkVFLkZsYXRTaGFkaW5nLFxyXG4gICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc19udW07IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG5ldyBNb3ZlcigpO1xyXG4gICAgICAgIHZhciBoID0gVXRpbC5nZXRSYW5kb21JbnQoMCwgNDUpO1xyXG4gICAgICAgIHZhciBzID0gVXRpbC5nZXRSYW5kb21JbnQoNjAsIDkwKTtcclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgaCArICcsICcgKyBzICsgJyUsIDUwJSknKTtcclxuXHJcbiAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhVdGlsLmdldFJhbmRvbUludCgtMTAwLCAxMDApLCAwLCAwKSk7XHJcbiAgICAgICAgbW92ZXJzLnB1c2gobW92ZXIpO1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIudmVsb2NpdHkueDtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnZlbG9jaXR5Lnk7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci52ZWxvY2l0eS56O1xyXG4gICAgICAgIGNvbG9yLnRvQXJyYXkoY29sb3JzLCBpICogMyk7XHJcbiAgICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICAgIH1cclxuICAgICAgcG9pbnRzLmluaXQoe1xyXG4gICAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgICB2czogdnMsXHJcbiAgICAgICAgZnM6IGZzLFxyXG4gICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICAgIGNvbG9yczogY29sb3JzLFxyXG4gICAgICAgIG9wYWNpdGllczogb3BhY2l0aWVzLFxyXG4gICAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgICB0ZXh0dXJlOiBjcmVhdGVUZXh0dXJlKCksXHJcbiAgICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcclxuICAgICAgfSk7XHJcbiAgICAgIHNjZW5lLmFkZChsaWdodCk7XHJcbiAgICAgIGJnID0gY3JlYXRlQmFja2dyb3VuZCgpO1xyXG4gICAgICBzY2VuZS5hZGQoYmcpO1xyXG4gICAgICBjYW1lcmEuc2V0UG9sYXJDb29yZChVdGlsLmdldFJhZGlhbigyNSksIDAsIDEwMDApO1xyXG4gICAgICBsaWdodC5zZXRQb2xhckNvb3JkKFV0aWwuZ2V0UmFkaWFuKDI1KSwgMCwgMjAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMub2JqKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGxpZ2h0KTtcclxuICAgICAgYmcuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBiZy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShiZyk7XHJcbiAgICAgIG1vdmVycyA9IFtdO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBwb2ludHMuYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBwb2ludHMuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIHBvaW50cy51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBsaWdodC5mb3JjZS5hcHBseUhvb2soMCwgMC4wOCk7XHJcbiAgICAgIGxpZ2h0LmZvcmNlLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBsaWdodC5mb3JjZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBsaWdodC51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBhY3RpdmF0ZU1vdmVyKCk7XHJcbiAgICAgIHVwZGF0ZU1vdmVyKCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4wMDQpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuMSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmxvb2tBdENlbnRlcigpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBtb3ZlUG9pbnRzKHZlY3Rvcik7XHJcbiAgICAgIGlzX2RyYWdlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgaWYgKGlzX2RyYWdlZCkge1xyXG4gICAgICAgIG1vdmVQb2ludHModmVjdG9yX21vdXNlX21vdmUpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBpc19kcmFnZWQgPSBmYWxzZTtcclxuICAgICAgcG9pbnRzLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIGxpZ2h0LmZvcmNlLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgdGhpcy50b3VjaEVuZChzY2VuZSwgY2FtZXJhKVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcbnZhciBGb3JjZUhlbWlzcGhlcmVMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2VfaGVtaXNwaGVyZV9saWdodCcpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuICB2YXIgaW1hZ2VzID0gW107XHJcbiAgdmFyIGltYWdlc19udW0gPSAzMDA7XHJcbiAgdmFyIGxpZ2h0ID0gbnVsbDtcclxuICB2YXIgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xyXG4gIHZhciBwaWNrZWRfaWQgPSAtMTtcclxuICB2YXIgcGlja2VkX2luZGV4ID0gLTE7XHJcbiAgdmFyIGlzX2NsaWNrZWQgPSBmYWxzZTtcclxuICB2YXIgaXNfZHJhZ2VkID0gZmFsc2U7XHJcbiAgdmFyIGdldF9uZWFyID0gZmFsc2U7XHJcblxyXG4gIHZhciBJbWFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5yYWQgPSAwO1xyXG4gICAgdGhpcy5vYmogPSBudWxsO1xyXG4gICAgdGhpcy5pc19lbnRlcmVkID0gZmFsc2U7XHJcbiAgICBGb3JjZTMuY2FsbCh0aGlzKTtcclxuICB9O1xyXG4gIHZhciBpbWFnZV9nZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDEwMCwgMTAwKTtcclxuICBJbWFnZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEZvcmNlMy5wcm90b3R5cGUpO1xyXG4gIEltYWdlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEltYWdlO1xyXG4gIEltYWdlLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgICB2YXIgaW1hZ2VfbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxyXG4gICAgICBtYXA6IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCkubG9hZCgnaW1nL2dhbGxlcnkvaW1hZ2UwJyArIFV0aWwuZ2V0UmFuZG9tSW50KDEsIDkpICsgJy5qcGcnKVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5vYmogPSBuZXcgVEhSRUUuTWVzaChpbWFnZV9nZW9tZXRyeSwgaW1hZ2VfbWF0ZXJpYWwpO1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgdGhpcy5hbmNob3IgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLnNldCgwLCAwLCAwKTtcclxuICB9O1xyXG5cclxuICB2YXIgaW5pdEltYWdlcyA9IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlc19udW07IGkrKykge1xyXG4gICAgICB2YXIgaW1hZ2UgPSBudWxsO1xyXG4gICAgICB2YXIgcmFkID0gVXRpbC5nZXRSYWRpYW4oaSAlIDQ1ICogOCArIDE4MCk7XHJcbiAgICAgIHZhciByYWRpdXMgPSAxMDAwO1xyXG4gICAgICB2YXIgeCA9IE1hdGguY29zKHJhZCkgKiByYWRpdXM7XHJcbiAgICAgIHZhciB5ID0gaSAqIDUgLSBpbWFnZXNfbnVtICogMi41O1xyXG4gICAgICB2YXIgeiA9IE1hdGguc2luKHJhZCkgKiByYWRpdXM7XHJcbiAgICAgIHZhciB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMyh4LCB5LCB6KTtcclxuICAgICAgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgaW1hZ2UuaW5pdChuZXcgVEhSRUUuVmVjdG9yMygpKTtcclxuICAgICAgaW1hZ2UucmFkID0gcmFkO1xyXG4gICAgICBpbWFnZS5vYmoucG9zaXRpb24uY29weSh2ZWN0b3IpO1xyXG4gICAgICBzY2VuZS5hZGQoaW1hZ2Uub2JqKTtcclxuICAgICAgaW1hZ2VzLnB1c2goaW1hZ2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciBwaWNrSW1hZ2UgPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgIGlmIChnZXRfbmVhcikgcmV0dXJuO1xyXG4gICAgdmFyIGludGVyc2VjdHMgPSBudWxsO1xyXG4gICAgcmF5Y2FzdGVyLnNldEZyb21DYW1lcmEodmVjdG9yLCBjYW1lcmEpO1xyXG4gICAgaW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKHNjZW5lLmNoaWxkcmVuKTtcclxuICAgIGlmIChpbnRlcnNlY3RzLmxlbmd0aCA+IDAgJiYgaXNfZHJhZ2VkID09IGZhbHNlKSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnaXMtcG9pbnRlZCcpO1xyXG4gICAgICBwaWNrZWRfaWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdC5pZDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlc2V0UGlja0ltYWdlKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIGdldE5lYXJJbWFnZSA9IGZ1bmN0aW9uKGNhbWVyYSwgaW1hZ2UpIHtcclxuICAgIGdldF9uZWFyID0gdHJ1ZTtcclxuICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KE1hdGguY29zKGltYWdlLnJhZCkgKiA3ODAsIGltYWdlLm9iai5wb3NpdGlvbi55LCBNYXRoLnNpbihpbWFnZS5yYWQpICogNzgwKTtcclxuICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5jb3B5KGltYWdlLm9iai5wb3NpdGlvbik7XHJcbiAgICByZXNldFBpY2tJbWFnZSgpO1xyXG4gIH07XHJcblxyXG4gIHZhciByZXNldFBpY2tJbWFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb2ludGVkJyk7XHJcbiAgICBwaWNrZWRfaWQgPSAtMTtcclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBpbml0SW1hZ2VzKHNjZW5lKTtcclxuICAgICAgbGlnaHQgPSBuZXcgRm9yY2VIZW1pc3BoZXJlTGlnaHQoMHhmZmZmZmYsIDB4ZmZmZmZmLCAxKTtcclxuICAgICAgc2NlbmUuYWRkKGxpZ2h0KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKC0zNSk7XHJcbiAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMV9iYXNlID0gY2FtZXJhLnJvdGF0ZV9yYWQxO1xyXG4gICAgICBjYW1lcmEucm90YXRlX3JhZDIgPSBVdGlsLmdldFJhZGlhbigxODApO1xyXG4gICAgICBjYW1lcmEucm90YXRlX3JhZDJfYmFzZSA9IGNhbWVyYS5yb3RhdGVfcmFkMjtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIGltYWdlX2dlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBzY2VuZS5yZW1vdmUoaW1hZ2VzW2ldLm9iaik7XHJcbiAgICAgIH07XHJcbiAgICAgIHNjZW5lLnJlbW92ZShsaWdodCk7XHJcbiAgICAgIGltYWdlcyA9IFtdO1xyXG4gICAgICBnZXRfbmVhciA9IGZhbHNlO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBvaW50ZWQnKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZXNfbnVtOyBpKyspIHtcclxuICAgICAgICBpbWFnZXNbaV0uYXBwbHlIb29rKDAsIDAuMTQpO1xyXG4gICAgICAgIGltYWdlc1tpXS5hcHBseURyYWcoMC40KTtcclxuICAgICAgICBpbWFnZXNbaV0udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgICBpbWFnZXNbaV0ub2JqLmxvb2tBdCh7XHJcbiAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgeTogaW1hZ2VzW2ldLm9iai5wb3NpdGlvbi55LFxyXG4gICAgICAgICAgejogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChpbWFnZXNbaV0ub2JqLmlkID09IHBpY2tlZF9pZCAmJiBpc19kcmFnZWQgPT0gZmFsc2UgJiYgZ2V0X25lYXIgPT0gZmFsc2UpIHtcclxuICAgICAgICAgIGlmIChpc19jbGlja2VkID09IHRydWUpIHtcclxuICAgICAgICAgICAgcGlja2VkX2luZGV4ID0gaTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGltYWdlc1tpXS5vYmoubWF0ZXJpYWwuY29sb3Iuc2V0KDB4YWFhYWFhKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaW1hZ2VzW2ldLm9iai5tYXRlcmlhbC5jb2xvci5zZXQoMHhmZmZmZmYpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgaWYgKGdldF9uZWFyID09PSBmYWxzZSkge1xyXG4gICAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChjYW1lcmEucm90YXRlX3JhZDEsIGNhbWVyYS5yb3RhdGVfcmFkMiwgMTAwMCkpO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5SG9vaygwLCAwLjA4KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVMb29rKCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIHBpY2tJbWFnZShzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpO1xyXG4gICAgICBpc19jbGlja2VkID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBwaWNrSW1hZ2Uoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX21vdmUpO1xyXG4gICAgICBpZiAoaXNfY2xpY2tlZCAmJiB2ZWN0b3JfbW91c2VfZG93bi5jbG9uZSgpLnN1Yih2ZWN0b3JfbW91c2VfbW92ZSkubGVuZ3RoKCkgPiAwLjAxKSB7XHJcbiAgICAgICAgaXNfY2xpY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlzX2RyYWdlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzX2RyYWdlZCA9PSB0cnVlICYmIGdldF9uZWFyID09IGZhbHNlKSB7XHJcbiAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxID0gY2FtZXJhLnJvdGF0ZV9yYWQxX2Jhc2UgKyBVdGlsLmdldFJhZGlhbigodmVjdG9yX21vdXNlX2Rvd24ueSAtIHZlY3Rvcl9tb3VzZV9tb3ZlLnkpICogNTApO1xyXG4gICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMiA9IGNhbWVyYS5yb3RhdGVfcmFkMl9iYXNlICsgVXRpbC5nZXRSYWRpYW4oKHZlY3Rvcl9tb3VzZV9kb3duLnggLSB2ZWN0b3JfbW91c2VfbW92ZS54KSAqIDUwKTtcclxuICAgICAgICBpZiAoY2FtZXJhLnJvdGF0ZV9yYWQxIDwgVXRpbC5nZXRSYWRpYW4oLTUwKSkge1xyXG4gICAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxID0gVXRpbC5nZXRSYWRpYW4oLTUwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNhbWVyYS5yb3RhdGVfcmFkMSA+IFV0aWwuZ2V0UmFkaWFuKDUwKSkge1xyXG4gICAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxID0gVXRpbC5nZXRSYWRpYW4oNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgcmVzZXRQaWNrSW1hZ2UoKTtcclxuICAgICAgaWYgKGdldF9uZWFyKSB7XHJcbiAgICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgICAgcGlja2VkX2luZGV4ID0gLTE7XHJcbiAgICAgICAgZ2V0X25lYXIgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIGlmIChpc19jbGlja2VkICYmIHBpY2tlZF9pbmRleCA+IC0xKSB7XHJcbiAgICAgICAgZ2V0TmVhckltYWdlKGNhbWVyYSwgaW1hZ2VzW3BpY2tlZF9pbmRleF0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGlzX2RyYWdlZCkge1xyXG4gICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMV9iYXNlID0gY2FtZXJhLnJvdGF0ZV9yYWQxO1xyXG4gICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMl9iYXNlID0gY2FtZXJhLnJvdGF0ZV9yYWQyO1xyXG4gICAgICB9XHJcbiAgICAgIGlzX2NsaWNrZWQgPSBmYWxzZTtcclxuICAgICAgaXNfZHJhZ2VkID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEsIHZlY3RvcilcclxuICAgIH1cclxuICB9O1xyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxuXHJcbnZhciBGb3JjZUNhbWVyYSA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2VfY2FtZXJhJyk7XHJcbnZhciBGb3JjZTIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMicpO1xyXG4vLyB2YXIgdnMgPSBnbHNsaWZ5KCcuLi8uLi9nbHNsL2hvbGUudnMnKTtcclxuLy8gdmFyIGZzID0gZ2xzbGlmeSgnLi4vLi4vZ2xzbC9ob2xlLmZzJyk7XHJcbnZhciB2c19wb2ludHMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgcmFkaWFuO1xcclxcblxcclxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG51bmlmb3JtIHZlYzIgcmVzb2x1dGlvbjtcXHJcXG51bmlmb3JtIGZsb2F0IHNpemU7XFxyXFxudW5pZm9ybSB2ZWMyIGZvcmNlO1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGZsb2F0IHJhZGl1cyA9IG1heChtaW4ocmVzb2x1dGlvbi54LCByZXNvbHV0aW9uLnkpLCA2MDAuMCkgKiBjb3MocmFkaWFucyh0aW1lICogMi4wKSArIHJhZGlhbi56KTtcXHJcXG4gIGZsb2F0IHJhZGlhbl9iYXNlID0gcmFkaWFucyh0aW1lICogMi4wKTtcXHJcXG4gIHZlYzMgdXBkYXRlX3Bvc2l0b24gPSBwb3NpdGlvbiArIHZlYzMoXFxyXFxuICAgIGNvcyhyYWRpYW5fYmFzZSArIHJhZGlhbi54KSAqIGNvcyhyYWRpYW5fYmFzZSArIHJhZGlhbi55KSAqIHJhZGl1cyxcXHJcXG4gICAgY29zKHJhZGlhbl9iYXNlICsgcmFkaWFuLngpICogc2luKHJhZGlhbl9iYXNlICsgcmFkaWFuLnkpICogcmFkaXVzLFxcclxcbiAgICBzaW4ocmFkaWFuX2Jhc2UgKyByYWRpYW4ueCkgKiByYWRpdXNcXHJcXG4gICkgKiBmb3JjZS54O1xcclxcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNCh1cGRhdGVfcG9zaXRvbiwgMS4wKTtcXHJcXG5cXHJcXG4gIGdsX1BvaW50U2l6ZSA9IChzaXplICsgZm9yY2UueSkgKiAoYWJzKHNpbihyYWRpYW5fYmFzZSArIHJhZGlhbi56KSkpICogKHNpemUgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKSAqIG1pbihyZXNvbHV0aW9uLngsIHJlc29sdXRpb24ueSk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzX3BvaW50cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHNpemU7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdmVjMyBuO1xcclxcbiAgbi54eSA9IGdsX1BvaW50Q29vcmQueHkgKiAyLjAgLSAxLjA7XFxyXFxuICBuLnogPSAxLjAgLSBkb3Qobi54eSwgbi54eSk7XFxyXFxuICBpZiAobi56IDwgMC4wKSBkaXNjYXJkO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCgxLjApO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIHZzX2ZiID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgdmVjMiB2VXY7XFxyXFxuXFxyXFxudm9pZCBtYWluKHZvaWQpIHtcXHJcXG4gIHZVdiA9IHV2O1xcclxcbiAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzX2ZiID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG51bmlmb3JtIHZlYzIgcmVzb2x1dGlvbjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmUyO1xcclxcblxcclxcbmNvbnN0IGZsb2F0IGJsdXIgPSAyMC4wO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMiB2VXY7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdmVjNCBjb2xvciA9IHZlYzQoMC4wKTtcXHJcXG4gIGZvciAoZmxvYXQgeCA9IDAuMDsgeCA8IGJsdXI7IHgrKyl7XFxyXFxuICAgIGZvciAoZmxvYXQgeSA9IDAuMDsgeSA8IGJsdXI7IHkrKyl7XFxyXFxuICAgICAgY29sb3IgKz0gdGV4dHVyZTJEKHRleHR1cmUsIHZVdiAtICh2ZWMyKHgsIHkpIC0gdmVjMihibHVyIC8gMi4wKSkgLyByZXNvbHV0aW9uKTtcXHJcXG4gICAgfVxcclxcbiAgfVxcclxcbiAgdmVjNCBjb2xvcjIgPSBjb2xvciAvIHBvdyhibHVyLCAyLjApO1xcclxcbiAgdmVjNCBjb2xvcjMgPSB0ZXh0dXJlMkQodGV4dHVyZTIsIHZVdik7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yMy5yZ2IsIGZsb29yKGxlbmd0aChjb2xvcjIucmdiKSkpO1xcclxcbn1cXHJcXG5cIjtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEpO1xyXG4gIH07XHJcblxyXG4gIHZhciBwb2ludHMgPSBudWxsO1xyXG4gIHZhciBiZyA9IG51bGw7XHJcbiAgdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweGZmZmZmZmYsIDB4ZmZmZmZmZiwgMSk7XHJcblxyXG4gIHZhciBzdWJfc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICB2YXIgc3ViX2NhbWVyYSA9IG5ldyBGb3JjZUNhbWVyYSg0NSwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDEsIDEwMDAwKTtcclxuICB2YXIgcmVuZGVyX3RhcmdldCA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICB2YXIgZnJhbWVidWZmZXIgPSBudWxsO1xyXG5cclxuICB2YXIgc3ViX3NjZW5lMiA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIHZhciBzdWJfY2FtZXJhMiA9IG5ldyBGb3JjZUNhbWVyYSg0NSwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDEsIDEwMDAwKTtcclxuICB2YXIgc3ViX2xpZ2h0ID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweDAwMDAwMCwgMHg0NDQ0NDQsIDEpO1xyXG4gIHZhciByZW5kZXJfdGFyZ2V0MiA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICB2YXIgYmdfZmIgPSBudWxsO1xyXG4gIHZhciBvYmpfZmIgPSBudWxsO1xyXG5cclxuICB2YXIgZm9yY2UgPSBuZXcgRm9yY2UyKCk7XHJcblxyXG4gIHZhciBjcmVhdGVQb2ludHNGb3JDcm9zc0ZhZGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgdmFyIHZlcnRpY2VzX2Jhc2UgPSBbXTtcclxuICAgIHZhciByYWRpYW5zX2Jhc2UgPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzI7IGkgKyspIHtcclxuICAgICAgdmFyIHggPSAwO1xyXG4gICAgICB2YXIgeSA9IDA7XHJcbiAgICAgIHZhciB6ID0gMDtcclxuICAgICAgdmVydGljZXNfYmFzZS5wdXNoKHgsIHksIHopO1xyXG4gICAgICB2YXIgcjEgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHIyID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgIHZhciByMyA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICByYWRpYW5zX2Jhc2UucHVzaChyMSwgcjIsIHIzKTtcclxuICAgIH1cclxuICAgIHZhciB2ZXJ0aWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXNfYmFzZSk7XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh2ZXJ0aWNlcywgMykpO1xyXG4gICAgdmFyIHJhZGlhbnMgPSBuZXcgRmxvYXQzMkFycmF5KHJhZGlhbnNfYmFzZSk7XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3JhZGlhbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocmFkaWFucywgMykpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICB0aW1lOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMC4wXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaXplOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMjguMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9yY2U6IHtcclxuICAgICAgICAgIHR5cGU6ICd2MicsXHJcbiAgICAgICAgICB2YWx1ZTogZm9yY2UudmVsb2NpdHksXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiB2c19wb2ludHMsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBmc19wb2ludHMsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxyXG4gICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcclxuICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5Qb2ludHMoZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDEwMDAsIDMyLCAzMik7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZSxcclxuICAgICAgbWFwOiBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpLmxvYWQoJ2ltZy9ob2xlL2JhY2tncm91bmQuanBnJyksXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVPYmplY3RJbkZyYW1lYnVmZmVyID0gZnVuY3Rpb24ocmFkaXVzLCBkZXRhaWwpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5PY3RhaGVkcm9uR2VvbWV0cnkocmFkaXVzLCBkZXRhaWwpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgc2lkZTogVEhSRUUuQmFja1NpZGUsXHJcbiAgICAgIHNoYWRpbmc6IFRIUkVFLkZsYXRTaGFkaW5nLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9XHJcblxyXG4gIHZhciBjcmVhdGVQbGFuZUZvckZyYW1lYnVmZmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnlfYmFzZSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDIsIDIpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICBnZW9tZXRyeS5mcm9tR2VvbWV0cnkoZ2VvbWV0cnlfYmFzZSk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzb2x1dGlvbjoge1xyXG4gICAgICAgICAgdHlwZTogJ3YyJyxcclxuICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGV4dHVyZToge1xyXG4gICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgdmFsdWU6IHJlbmRlcl90YXJnZXQsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0ZXh0dXJlMjoge1xyXG4gICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgdmFsdWU6IHJlbmRlcl90YXJnZXQyLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogdnNfZmIsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBmc19mYixcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWVcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfVxyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICdiZy13aGl0ZSc7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMSwgMCk7XHJcblxyXG4gICAgICBzdWJfY2FtZXJhMi5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KDEwMDAsIDMwMCwgMCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLmxvb2suYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgb2JqX2ZiID0gY3JlYXRlT2JqZWN0SW5GcmFtZWJ1ZmZlcig2MCwgMik7XHJcbiAgICAgIHN1Yl9zY2VuZTIuYWRkKG9ial9mYik7XHJcbiAgICAgIHN1Yl9zY2VuZTIuYWRkKHN1Yl9saWdodCk7XHJcblxyXG4gICAgICBwb2ludHMgPSBjcmVhdGVQb2ludHNGb3JDcm9zc0ZhZGUoKTtcclxuICAgICAgc3ViX3NjZW5lLmFkZChwb2ludHMpO1xyXG4gICAgICBzdWJfY2FtZXJhLnBvc2l0aW9uLnNldCgwLCAwLCAzMDAwKTtcclxuICAgICAgc3ViX2NhbWVyYS5sb29rQXQoMCwgMCwgMCk7XHJcblxyXG4gICAgICBmcmFtZWJ1ZmZlciA9IGNyZWF0ZVBsYW5lRm9yRnJhbWVidWZmZXIoKTtcclxuICAgICAgc2NlbmUuYWRkKGZyYW1lYnVmZmVyKTtcclxuICAgICAgYmcgPSBjcmVhdGVCYWNrZ3JvdW5kKCk7XHJcbiAgICAgIHNjZW5lLmFkZChiZyk7XHJcbiAgICAgIHNjZW5lLmFkZChsaWdodCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KDEwMDAsIC0zMDAsIDApO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnJztcclxuXHJcbiAgICAgIG9ial9mYi5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIG9ial9mYi5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHN1Yl9zY2VuZTIucmVtb3ZlKG9ial9mYik7XHJcbiAgICAgIHN1Yl9zY2VuZTIucmVtb3ZlKHN1Yl9saWdodCk7XHJcblxyXG4gICAgICBwb2ludHMuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzdWJfc2NlbmUucmVtb3ZlKHBvaW50cyk7XHJcblxyXG4gICAgICBmcmFtZWJ1ZmZlci5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGZyYW1lYnVmZmVyKTtcclxuICAgICAgYmcuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBiZy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShiZyk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShsaWdodCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcikge1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSsrO1xyXG4gICAgICBmcmFtZWJ1ZmZlci5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlKys7XHJcbiAgICAgIGJnLnJvdGF0aW9uLnkgPSBwb2ludHMubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSAvIDIwMDtcclxuICAgICAgb2JqX2ZiLnJvdGF0aW9uLnkgPSBwb2ludHMubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSAvIDIwMDtcclxuICAgICAgZm9yY2UuYXBwbHlIb29rKDAsIDAuMDYpO1xyXG4gICAgICBmb3JjZS5hcHBseURyYWcoMC4yKTtcclxuICAgICAgZm9yY2UudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hbmNob3IueSA9IE1hdGguc2luKHBvaW50cy5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlIC8gMTAwKSAqIDEwMDtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlTG9vaygpO1xyXG4gICAgICBzdWJfY2FtZXJhMi5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4xKTtcclxuICAgICAgc3ViX2NhbWVyYTIuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgc3ViX2NhbWVyYTIudXBkYXRlTG9vaygpO1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIoc3ViX3NjZW5lMiwgc3ViX2NhbWVyYTIsIHJlbmRlcl90YXJnZXQyKTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHN1Yl9zY2VuZSwgc3ViX2NhbWVyYSwgcmVuZGVyX3RhcmdldCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMiwgNDApO1xyXG4gICAgICBzdWJfY2FtZXJhMi5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KDYwMCwgLTMwMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgICBmb3JjZS5hbmNob3Iuc2V0KDEsIDApO1xyXG4gICAgICBzdWJfY2FtZXJhMi5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KDEwMDAsIDMwMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgZm9yY2UuYW5jaG9yLnNldCgxLCAwKTtcclxuICAgICAgc3ViX2NhbWVyYTIuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgxMDAwLCAzMDAsIDApO1xyXG4gICAgfSxcclxuICAgIHJlc2l6ZVdpbmRvdzogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICByZW5kZXJfdGFyZ2V0LnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgIHJlbmRlcl90YXJnZXQyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEucmVzaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgICBzdWJfY2FtZXJhMi5yZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC51bmlmb3Jtcy5yZXNvbHV0aW9uLnZhbHVlLnNldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgICAgZnJhbWVidWZmZXIubWF0ZXJpYWwudW5pZm9ybXMucmVzb2x1dGlvbi52YWx1ZS5zZXQod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcbnZhciBQb2ludHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50cy5qcycpO1xyXG5cclxudmFyIHZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGN1c3RvbUNvbG9yO1xcclxcbmF0dHJpYnV0ZSBmbG9hdCB2ZXJ0ZXhPcGFjaXR5O1xcclxcbmF0dHJpYnV0ZSBmbG9hdCBzaXplO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2Q29sb3IgPSBjdXN0b21Db2xvcjtcXHJcXG4gIGZPcGFjaXR5ID0gdmVydGV4T3BhY2l0eTtcXHJcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxuICBnbF9Qb2ludFNpemUgPSBzaXplICogKDMwMC4wIC8gbGVuZ3RoKG12UG9zaXRpb24ueHl6KSk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gdmVjMyBjb2xvcjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yICogdkNvbG9yLCBmT3BhY2l0eSk7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSBnbF9GcmFnQ29sb3IgKiB0ZXh0dXJlMkQodGV4dHVyZSwgZ2xfUG9pbnRDb29yZCk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuICB2YXIgbW92ZXJzX251bSA9IDIwMDAwO1xyXG4gIHZhciBtb3ZlcnMgPSBbXTtcclxuICB2YXIgcG9pbnRzID0gbmV3IFBvaW50cygpO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIHNpemVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgZ3Jhdml0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKDEuNSwgMCwgMCk7XHJcbiAgdmFyIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIHtcclxuICAgICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlGb3JjZShncmF2aXR5KTtcclxuICAgICAgICBtb3Zlci5hcHBseURyYWcoMC4xKTtcclxuICAgICAgICBtb3Zlci51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICAgIGlmIChtb3Zlci5hIDwgMC44KSB7XHJcbiAgICAgICAgICBtb3Zlci5hICs9IDAuMDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtb3Zlci52ZWxvY2l0eS54ID4gMTAwMCkge1xyXG4gICAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XHJcbiAgICAgICAgICBtb3Zlci50aW1lID0gMDtcclxuICAgICAgICAgIG1vdmVyLmEgPSAwLjA7XHJcbiAgICAgICAgICBtb3Zlci5pbmFjdGl2YXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIudmVsb2NpdHkueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci52ZWxvY2l0eS55O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnZlbG9jaXR5Lno7XHJcbiAgICAgIG9wYWNpdGllc1tpXSA9IG1vdmVyLmE7XHJcbiAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgIH1cclxuICAgIHBvaW50cy51cGRhdGVQb2ludHMoKTtcclxuICB9O1xyXG5cclxuICB2YXIgYWN0aXZhdGVNb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvdW50ID0gMDtcclxuICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgaWYgKG5vdyAtIGxhc3RfdGltZV9hY3RpdmF0ZSA+IGdyYXZpdHkueCAqIDE2KSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIGNvbnRpbnVlO1xyXG4gICAgICAgIHZhciByYWQgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAxMjApICogMyk7XHJcbiAgICAgICAgdmFyIHJhbmdlID0gTWF0aC5sb2coVXRpbC5nZXRSYW5kb21JbnQoMiwgMTI4KSkgLyBNYXRoLmxvZygxMjgpICogMTYwICsgNjA7XHJcbiAgICAgICAgdmFyIHkgPSBNYXRoLnNpbihyYWQpICogcmFuZ2U7XHJcbiAgICAgICAgdmFyIHogPSBNYXRoLmNvcyhyYWQpICogcmFuZ2U7XHJcbiAgICAgICAgdmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKC0xMDAwLCB5LCB6KTtcclxuICAgICAgICB2ZWN0b3IuYWRkKHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgICAgbW92ZXIuYWN0aXZhdGUoKTtcclxuICAgICAgICBtb3Zlci5pbml0KHZlY3Rvcik7XHJcbiAgICAgICAgbW92ZXIuYSA9IDA7XHJcbiAgICAgICAgbW92ZXIuc2l6ZSA9IFV0aWwuZ2V0UmFuZG9tSW50KDUsIDYwKTtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgIGlmIChjb3VudCA+PSBNYXRoLnBvdyhncmF2aXR5LnggKiAzLCBncmF2aXR5LnggKiAwLjQpKSBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciB1cGRhdGVQb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHBvaW50cy51cGRhdGVWZWxvY2l0eSgpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVUZXh0dXJlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB2YXIgZ3JhZCA9IG51bGw7XHJcbiAgICB2YXIgdGV4dHVyZSA9IG51bGw7XHJcblxyXG4gICAgY2FudmFzLndpZHRoID0gMjU2O1xyXG4gICAgY2FudmFzLmhlaWdodCA9IDI1NjtcclxuICAgIGdyYWQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoMTI4LCAxMjgsIDIwLCAxMjgsIDEyOCwgMTI4KTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuMiwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMSknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuNSwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMS4wLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwKScpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgICBjdHguYXJjKDEyOCwgMTI4LCAxMjgsIDAsIE1hdGguUEkgLyAxODAsIHRydWUpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuXHJcbiAgICB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzKTtcclxuICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRleHR1cmU7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNoYW5nZUdyYXZpdHkgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChpc190b3VjaGVkKSB7XHJcbiAgICAgIGlmIChncmF2aXR5LnggPCA2KSBncmF2aXR5LnggKz0gMC4wMjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChncmF2aXR5LnggPiAxLjUpIGdyYXZpdHkueCAtPSAwLjE7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnNfbnVtOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgICB2YXIgaCA9IFV0aWwuZ2V0UmFuZG9tSW50KDYwLCAyMTApO1xyXG4gICAgICAgIHZhciBzID0gVXRpbC5nZXRSYW5kb21JbnQoMzAsIDkwKTtcclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgaCArICcsICcgKyBzICsgJyUsIDUwJSknKTtcclxuXHJcbiAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhVdGlsLmdldFJhbmRvbUludCgtMTAwLCAxMDApLCAwLCAwKSk7XHJcbiAgICAgICAgbW92ZXJzLnB1c2gobW92ZXIpO1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIudmVsb2NpdHkueDtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnZlbG9jaXR5Lnk7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci52ZWxvY2l0eS56O1xyXG4gICAgICAgIGNvbG9yLnRvQXJyYXkoY29sb3JzLCBpICogMyk7XHJcbiAgICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICAgIH1cclxuICAgICAgcG9pbnRzLmluaXQoe1xyXG4gICAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgICB2czogdnMsXHJcbiAgICAgICAgZnM6IGZzLFxyXG4gICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICAgIGNvbG9yczogY29sb3JzLFxyXG4gICAgICAgIG9wYWNpdGllczogb3BhY2l0aWVzLFxyXG4gICAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgICB0ZXh0dXJlOiBjcmVhdGVUZXh0dXJlKCksXHJcbiAgICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcclxuICAgICAgfSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KDgwMCwgMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBwb2ludHMuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocG9pbnRzLm9iaik7XHJcbiAgICAgIG1vdmVycyA9IFtdO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBjaGFuZ2VHcmF2aXR5KCk7XHJcbiAgICAgIGFjdGl2YXRlTW92ZXIoKTtcclxuICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAwOCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4xKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueiA9IHZlY3Rvcl9tb3VzZV9tb3ZlLnggKiAxMjA7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueSA9IHZlY3Rvcl9tb3VzZV9tb3ZlLnkgKiAtMTIwO1xyXG4gICAgICAvL2NhbWVyYS5sb29rQXRDZW50ZXIoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnogPSAwO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnkgPSAwO1xyXG4gICAgICBpc190b3VjaGVkID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgdGhpcy50b3VjaEVuZChzY2VuZSwgY2FtZXJhKVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIE1vdmVyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9tb3ZlcicpO1xyXG5cclxudmFyIFBvaW50cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRzLmpzJyk7XHJcbnZhciB2cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyBjdXN0b21Db2xvcjtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgdmVydGV4T3BhY2l0eTtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgc2l6ZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdkNvbG9yID0gY3VzdG9tQ29sb3I7XFxyXFxuICBmT3BhY2l0eSA9IHZlcnRleE9wYWNpdHk7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbiAgZ2xfUG9pbnRTaXplID0gc2l6ZSAqICgzMDAuMCAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpO1xcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciBmcyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIHZlYzMgY29sb3I7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciAqIHZDb2xvciwgZk9wYWNpdHkpO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gZ2xfRnJhZ0NvbG9yICogdGV4dHVyZTJEKHRleHR1cmUsIGdsX1BvaW50Q29vcmQpO1xcclxcbn1cXHJcXG5cIjtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEpO1xyXG4gIH07XHJcbiAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgdmFyIGltYWdlX3ZlcnRpY2VzID0gW107XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBudWxsO1xyXG4gIHZhciBjb2xvcnMgPSBudWxsO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBudWxsO1xyXG4gIHZhciBzaXplcyA9IG51bGw7XHJcbiAgdmFyIGxlbmd0aF9zaWRlID0gNDAwO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIGNyZWF0ZWRfcG9pbnRzID0gZmFsc2U7XHJcblxyXG4gIHZhciBsb2FkSW1hZ2UgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgaW1hZ2Uuc3JjID0gJy4vaW1nL2ltYWdlX2RhdGEvZWxlcGhhbnQucG5nJztcclxuICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICB2YXIgZ2V0SW1hZ2VEYXRhID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjYW52YXMud2lkdGggPSBsZW5ndGhfc2lkZTtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBsZW5ndGhfc2lkZTtcclxuICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gICAgdmFyIGltYWdlX2RhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGxlbmd0aF9zaWRlLCBsZW5ndGhfc2lkZSk7XHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGxlbmd0aF9zaWRlOyB5KyspIHtcclxuICAgICAgaWYgKHkgJSAzID4gMCkgY29udGludWU7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgbGVuZ3RoX3NpZGU7IHgrKykge1xyXG4gICAgICAgIGlmICh4ICUgMyA+IDApIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmKGltYWdlX2RhdGEuZGF0YVsoeCArIHkgKiBsZW5ndGhfc2lkZSkgKiA0XSA+IDApIHtcclxuICAgICAgICAgIGltYWdlX3ZlcnRpY2VzLnB1c2goMCwgKHkgLSBsZW5ndGhfc2lkZSAvIDIpICogLTEsICh4IC0gbGVuZ3RoX3NpZGUvIDIpICogLTEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciBidWlsZFBvaW50cyA9IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KGltYWdlX3ZlcnRpY2VzKTtcclxuICAgIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoKTtcclxuICAgIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoIC8gMyk7XHJcbiAgICBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoIC8gMyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlX3ZlcnRpY2VzLmxlbmd0aCAvIDM7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2hzbCgnICsgKGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMl0gKyBpbWFnZV92ZXJ0aWNlc1tpICogMyArIDFdICsgbGVuZ3RoX3NpZGUpIC8gNVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnLCA2MCUsIDgwJSknKTtcclxuICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhpbWFnZV92ZXJ0aWNlc1tpICogM10sIGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMV0sIGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMl0pKTtcclxuICAgICAgbW92ZXIuaXNfYWN0aXZhdGUgPSB0cnVlO1xyXG4gICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgIGNvbG9yLnRvQXJyYXkoY29sb3JzLCBpICogMyk7XHJcbiAgICAgIG9wYWNpdGllc1tpXSA9IDE7XHJcbiAgICAgIHNpemVzW2ldID0gMTI7XHJcbiAgICB9XHJcbiAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgdnM6IHZzLFxyXG4gICAgICBmczogZnMsXHJcbiAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgdGV4dHVyZTogY3JlYXRlVGV4dHVyZSgpLFxyXG4gICAgICBibGVuZGluZzogVEhSRUUuTm9ybWFsQmxlbmRpbmdcclxuICAgIH0pO1xyXG4gICAgY3JlYXRlZF9wb2ludHMgPSB0cnVlO1xyXG4gIH07XHJcblxyXG4gIHZhciBhcHBseUZvcmNlVG9Qb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgdmFyIHJhZDEgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHJhZDIgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHNjYWxhciA9IFV0aWwuZ2V0UmFuZG9tSW50KDQwLCA4MCk7XHJcbiAgICAgIG1vdmVyLmlzX2FjdGl2YXRlID0gZmFsc2U7XHJcbiAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoVXRpbC5nZXRQb2xhckNvb3JkKHJhZDEsIHJhZDIsIHNjYWxhcikpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciB1cGRhdGVNb3ZlciA9ICBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICBpZiAobW92ZXIuYWNjZWxlcmF0aW9uLmxlbmd0aCgpIDwgMSkge1xyXG4gICAgICAgIG1vdmVyLmlzX2FjdGl2YXRlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZhdGUpIHtcclxuICAgICAgICBtb3Zlci5hcHBseUhvb2soMCwgMC4xOCk7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMjYpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG1vdmVyLmFwcGx5RHJhZygwLjAzNSk7XHJcbiAgICAgIH1cclxuICAgICAgbW92ZXIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgbW92ZXIudmVsb2NpdHkuc3ViKHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIudmVsb2NpdHkueCAtIHBvaW50cy52ZWxvY2l0eS54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnZlbG9jaXR5LnkgLSBwb2ludHMudmVsb2NpdHkueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci52ZWxvY2l0eS56IC0gcG9pbnRzLnZlbG9jaXR5Lng7XHJcbiAgICAgIG1vdmVyLnNpemUgPSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgxLCAxMjgpKSAvIE1hdGgubG9nKDEyOCkgKiBNYXRoLnNxcnQoZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCk7XHJcbiAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgIH1cclxuICAgIHBvaW50cy51cGRhdGVQb2ludHMoKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlVGV4dHVyZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgdmFyIGdyYWQgPSBudWxsO1xyXG4gICAgdmFyIHRleHR1cmUgPSBudWxsO1xyXG5cclxuICAgIGNhbnZhcy53aWR0aCA9IDIwMDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSAyMDA7XHJcbiAgICBncmFkID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KDEwMCwgMTAwLCAyMCwgMTAwLCAxMDAsIDEwMCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjIsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjUsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEuMCwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMCknKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xyXG4gICAgY3R4LmFyYygxMDAsIDEwMCwgMTAwLCAwLCBNYXRoLlBJIC8gMTgwLCB0cnVlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGxvYWRJbWFnZShmdW5jdGlvbigpIHtcclxuICAgICAgICBnZXRJbWFnZURhdGEoKTtcclxuICAgICAgICBidWlsZFBvaW50cyhzY2VuZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBjYW1lcmEuc2V0UG9sYXJDb29yZCgwLCAwLCAxNDAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBpbWFnZV92ZXJ0aWNlcyA9IFtdO1xyXG4gICAgICBtb3ZlcnMgPSBbXTtcclxuICAgICAgY2FtZXJhLnJhbmdlID0gMTAwMDtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgaWYgKGNyZWF0ZWRfcG9pbnRzKSB7XHJcbiAgICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgICAgIH1cclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcblxyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBhcHBseUZvcmNlVG9Qb2ludHMoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnogPSB2ZWN0b3JfbW91c2VfbW92ZS54ICogMTAwMDtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci55ID0gdmVjdG9yX21vdXNlX21vdmUueSAqIC0xMDAwO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueiA9IDA7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueSA9IDA7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgdGhpcy50b3VjaEVuZChzY2VuZSwgY2FtZXJhKVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxuXHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG52YXIgdnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyBtYXQ0IG1fbWF0cml4O1xcclxcblxcclxcbmZsb2F0IGludmVyc2VfMV8wKGZsb2F0IG0pIHtcXG4gIHJldHVybiAxLjAgLyBtO1xcbn1cXG5cXG5tYXQyIGludmVyc2VfMV8wKG1hdDIgbSkge1xcbiAgcmV0dXJuIG1hdDIobVsxXVsxXSwtbVswXVsxXSxcXG4gICAgICAgICAgICAgLW1bMV1bMF0sIG1bMF1bMF0pIC8gKG1bMF1bMF0qbVsxXVsxXSAtIG1bMF1bMV0qbVsxXVswXSk7XFxufVxcblxcbm1hdDMgaW52ZXJzZV8xXzAobWF0MyBtKSB7XFxuICBmbG9hdCBhMDAgPSBtWzBdWzBdLCBhMDEgPSBtWzBdWzFdLCBhMDIgPSBtWzBdWzJdO1xcbiAgZmxvYXQgYTEwID0gbVsxXVswXSwgYTExID0gbVsxXVsxXSwgYTEyID0gbVsxXVsyXTtcXG4gIGZsb2F0IGEyMCA9IG1bMl1bMF0sIGEyMSA9IG1bMl1bMV0sIGEyMiA9IG1bMl1bMl07XFxuXFxuICBmbG9hdCBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjE7XFxuICBmbG9hdCBiMTEgPSAtYTIyICogYTEwICsgYTEyICogYTIwO1xcbiAgZmxvYXQgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwO1xcblxcbiAgZmxvYXQgZGV0ID0gYTAwICogYjAxICsgYTAxICogYjExICsgYTAyICogYjIxO1xcblxcbiAgcmV0dXJuIG1hdDMoYjAxLCAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSksIChhMTIgKiBhMDEgLSBhMDIgKiBhMTEpLFxcbiAgICAgICAgICAgICAgYjExLCAoYTIyICogYTAwIC0gYTAyICogYTIwKSwgKC1hMTIgKiBhMDAgKyBhMDIgKiBhMTApLFxcbiAgICAgICAgICAgICAgYjIxLCAoLWEyMSAqIGEwMCArIGEwMSAqIGEyMCksIChhMTEgKiBhMDAgLSBhMDEgKiBhMTApKSAvIGRldDtcXG59XFxuXFxubWF0NCBpbnZlcnNlXzFfMChtYXQ0IG0pIHtcXG4gIGZsb2F0XFxuICAgICAgYTAwID0gbVswXVswXSwgYTAxID0gbVswXVsxXSwgYTAyID0gbVswXVsyXSwgYTAzID0gbVswXVszXSxcXG4gICAgICBhMTAgPSBtWzFdWzBdLCBhMTEgPSBtWzFdWzFdLCBhMTIgPSBtWzFdWzJdLCBhMTMgPSBtWzFdWzNdLFxcbiAgICAgIGEyMCA9IG1bMl1bMF0sIGEyMSA9IG1bMl1bMV0sIGEyMiA9IG1bMl1bMl0sIGEyMyA9IG1bMl1bM10sXFxuICAgICAgYTMwID0gbVszXVswXSwgYTMxID0gbVszXVsxXSwgYTMyID0gbVszXVsyXSwgYTMzID0gbVszXVszXSxcXG5cXG4gICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsXFxuICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxcbiAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcXG4gICAgICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXFxuICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxcbiAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcXG4gICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsXFxuICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxcbiAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcXG4gICAgICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXFxuICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxcbiAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMixcXG5cXG4gICAgICBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XFxuXFxuICByZXR1cm4gbWF0NChcXG4gICAgICBhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDksXFxuICAgICAgYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5LFxcbiAgICAgIGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMyxcXG4gICAgICBhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMsXFxuICAgICAgYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3LFxcbiAgICAgIGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNyxcXG4gICAgICBhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEsXFxuICAgICAgYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxLFxcbiAgICAgIGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNixcXG4gICAgICBhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYsXFxuICAgICAgYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwLFxcbiAgICAgIGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCxcXG4gICAgICBhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYsXFxuICAgICAgYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2LFxcbiAgICAgIGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCxcXG4gICAgICBhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApIC8gZGV0O1xcbn1cXG5cXG5cXG5cXHJcXG52b2lkIG1haW4odm9pZCkge1xcclxcbiAgbV9tYXRyaXggPSBpbnZlcnNlXzFfMChtb2RlbE1hdHJpeCk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG51bmlmb3JtIGZsb2F0IHRpbWUyO1xcclxcbnVuaWZvcm0gZmxvYXQgYWNjZWxlcmF0aW9uO1xcclxcbnVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcclxcblxcclxcbnZhcnlpbmcgbWF0NCBtX21hdHJpeDtcXHJcXG5cXHJcXG4vLyBjb25zdCB2ZWMzIGNQb3MgPSB2ZWMzKDAuMCwgMC4wLCAxMC4wKTtcXHJcXG5jb25zdCBmbG9hdCB0YXJnZXREZXB0aCA9IDMuNTtcXHJcXG5jb25zdCB2ZWMzIGxpZ2h0RGlyID0gdmVjMygwLjU3NywgLTAuNTc3LCAwLjU3Nyk7XFxyXFxuXFxyXFxudmVjMyBoc3YycmdiXzFfMCh2ZWMzIGMpe1xcclxcbiAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xcclxcbiAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xcclxcbiAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XFxyXFxufVxcclxcblxcblxcbi8vXFxuLy8gRGVzY3JpcHRpb24gOiBBcnJheSBhbmQgdGV4dHVyZWxlc3MgR0xTTCAyRC8zRC80RCBzaW1wbGV4XFxuLy8gICAgICAgICAgICAgICBub2lzZSBmdW5jdGlvbnMuXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzRfMSh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgbW9kMjg5XzRfMSh2ZWM0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV80XzIodmVjNCB4KSB7XFxuICAgICByZXR1cm4gbW9kMjg5XzRfMSgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxudmVjNCB0YXlsb3JJbnZTcXJ0XzRfMyh2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzRfNCh2ZWMzIHYpXFxuICB7XFxuICBjb25zdCB2ZWMyICBDID0gdmVjMigxLjAvNi4wLCAxLjAvMy4wKSA7XFxuICBjb25zdCB2ZWM0ICBEXzRfNSA9IHZlYzQoMC4wLCAwLjUsIDEuMCwgMi4wKTtcXG5cXG4vLyBGaXJzdCBjb3JuZXJcXG4gIHZlYzMgaSAgPSBmbG9vcih2ICsgZG90KHYsIEMueXl5KSApO1xcbiAgdmVjMyB4MCA9ICAgdiAtIGkgKyBkb3QoaSwgQy54eHgpIDtcXG5cXG4vLyBPdGhlciBjb3JuZXJzXFxuICB2ZWMzIGdfNF82ID0gc3RlcCh4MC55engsIHgwLnh5eik7XFxuICB2ZWMzIGwgPSAxLjAgLSBnXzRfNjtcXG4gIHZlYzMgaTEgPSBtaW4oIGdfNF82Lnh5eiwgbC56eHkgKTtcXG4gIHZlYzMgaTIgPSBtYXgoIGdfNF82Lnh5eiwgbC56eHkgKTtcXG5cXG4gIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcbiAgLy8gICB4MSA9IHgwIC0gaTEgICsgMS4wICogQy54eHg7XFxuICAvLyAgIHgyID0geDAgLSBpMiAgKyAyLjAgKiBDLnh4eDtcXG4gIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcbiAgdmVjMyB4MSA9IHgwIC0gaTEgKyBDLnh4eDtcXG4gIHZlYzMgeDIgPSB4MCAtIGkyICsgQy55eXk7IC8vIDIuMCpDLnggPSAxLzMgPSBDLnlcXG4gIHZlYzMgeDMgPSB4MCAtIERfNF81Lnl5eTsgICAgICAvLyAtMS4wKzMuMCpDLnggPSAtMC41ID0gLUQueVxcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV80XzEoaSk7XFxuICB2ZWM0IHAgPSBwZXJtdXRlXzRfMiggcGVybXV0ZV80XzIoIHBlcm11dGVfNF8yKFxcbiAgICAgICAgICAgICBpLnogKyB2ZWM0KDAuMCwgaTEueiwgaTIueiwgMS4wICkpXFxuICAgICAgICAgICArIGkueSArIHZlYzQoMC4wLCBpMS55LCBpMi55LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS54ICsgdmVjNCgwLjAsIGkxLngsIGkyLngsIDEuMCApKTtcXG5cXG4vLyBHcmFkaWVudHM6IDd4NyBwb2ludHMgb3ZlciBhIHNxdWFyZSwgbWFwcGVkIG9udG8gYW4gb2N0YWhlZHJvbi5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDkgKDQ5KjYgPSAyOTQpXFxuICBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyAvLyAxLjAvNy4wXFxuICB2ZWMzICBucyA9IG5fICogRF80XzUud3l6IC0gRF80XzUueHp4O1xcblxcbiAgdmVjNCBqID0gcCAtIDQ5LjAgKiBmbG9vcihwICogbnMueiAqIG5zLnopOyAgLy8gIG1vZChwLDcqNylcXG5cXG4gIHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7XFxuICB2ZWM0IHlfID0gZmxvb3IoaiAtIDcuMCAqIHhfICk7ICAgIC8vIG1vZChqLE4pXFxuXFxuICB2ZWM0IHggPSB4XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXFxuICB2ZWM0IGIwID0gdmVjNCggeC54eSwgeS54eSApO1xcbiAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cXG4gIC8vdmVjNCBzMCA9IHZlYzQobGVzc1RoYW4oYjAsMC4wKSkqMi4wIC0gMS4wO1xcbiAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuICB2ZWM0IHMwID0gZmxvb3IoYjApKjIuMCArIDEuMDtcXG4gIHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wO1xcbiAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXFxuICB2ZWM0IGEwID0gYjAueHp5dyArIHMwLnh6eXcqc2gueHh5eSA7XFxuICB2ZWM0IGExXzRfNyA9IGIxLnh6eXcgKyBzMS54enl3KnNoLnp6d3cgO1xcblxcbiAgdmVjMyBwMF80XzggPSB2ZWMzKGEwLnh5LGgueCk7XFxuICB2ZWMzIHAxID0gdmVjMyhhMC56dyxoLnkpO1xcbiAgdmVjMyBwMiA9IHZlYzMoYTFfNF83Lnh5LGgueik7XFxuICB2ZWMzIHAzID0gdmVjMyhhMV80XzcuencsaC53KTtcXG5cXG4vL05vcm1hbGlzZSBncmFkaWVudHNcXG4gIHZlYzQgbm9ybSA9IHRheWxvckludlNxcnRfNF8zKHZlYzQoZG90KHAwXzRfOCxwMF80XzgpLCBkb3QocDEscDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLHAzKSkpO1xcbiAgcDBfNF84ICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG5cXG4vLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG4gIHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApO1xcbiAgbSA9IG0gKiBtO1xcbiAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwXzRfOCx4MCksIGRvdChwMSx4MSksXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3QocDIseDIpLCBkb3QocDMseDMpICkgKTtcXG4gIH1cXG5cXG5cXG5cXG52ZWMzIHJvdGF0ZV8yXzkodmVjMyBwLCBmbG9hdCByYWRpYW5feCwgZmxvYXQgcmFkaWFuX3ksIGZsb2F0IHJhZGlhbl96KSB7XFxyXFxuICBtYXQzIG14ID0gbWF0MyhcXHJcXG4gICAgMS4wLCAwLjAsIDAuMCxcXHJcXG4gICAgMC4wLCBjb3MocmFkaWFuX3gpLCAtc2luKHJhZGlhbl94KSxcXHJcXG4gICAgMC4wLCBzaW4ocmFkaWFuX3gpLCBjb3MocmFkaWFuX3gpXFxyXFxuICApO1xcclxcbiAgbWF0MyBteSA9IG1hdDMoXFxyXFxuICAgIGNvcyhyYWRpYW5feSksIDAuMCwgc2luKHJhZGlhbl95KSxcXHJcXG4gICAgMC4wLCAxLjAsIDAuMCxcXHJcXG4gICAgLXNpbihyYWRpYW5feSksIDAuMCwgY29zKHJhZGlhbl95KVxcclxcbiAgKTtcXHJcXG4gIG1hdDMgbXogPSBtYXQzKFxcclxcbiAgICBjb3MocmFkaWFuX3opLCAtc2luKHJhZGlhbl96KSwgMC4wLFxcclxcbiAgICBzaW4ocmFkaWFuX3opLCBjb3MocmFkaWFuX3opLCAwLjAsXFxyXFxuICAgIDAuMCwgMC4wLCAxLjBcXHJcXG4gICk7XFxyXFxuICByZXR1cm4gbXggKiBteSAqIG16ICogcDtcXHJcXG59XFxyXFxuXFxuXFxuZmxvYXQgZEJveF8zXzEwKHZlYzMgcCwgdmVjMyBzaXplKSB7XFxyXFxuICByZXR1cm4gbGVuZ3RoKG1heChhYnMocCkgLSBzaXplLCAwLjApKTtcXHJcXG59XFxyXFxuXFxuXFxuXFxyXFxuZmxvYXQgZ2V0Tm9pc2UodmVjMyBwKSB7XFxyXFxuICByZXR1cm4gc25vaXNlXzRfNChwICogKDAuNCArIGFjY2VsZXJhdGlvbiAqIDAuMSkgKyB0aW1lIC8gMTAwLjApO1xcclxcbn1cXHJcXG5cXHJcXG52ZWMzIGdldFJvdGF0ZSh2ZWMzIHApIHtcXHJcXG4gIHJldHVybiByb3RhdGVfMl85KHAsIHJhZGlhbnModGltZTIpLCByYWRpYW5zKHRpbWUyICogMi4wKSwgcmFkaWFucyh0aW1lMikpO1xcclxcbn1cXHJcXG5cXHJcXG5mbG9hdCBkaXN0YW5jZUZ1bmModmVjMyBwKSB7XFxyXFxuICB2ZWM0IHAxID0gbV9tYXRyaXggKiB2ZWM0KHAsIDEuMCk7XFxyXFxuICBmbG9hdCBuMSA9IGdldE5vaXNlKHAxLnh5eik7XFxyXFxuICB2ZWMzIHAyID0gZ2V0Um90YXRlKHAxLnh5eik7XFxyXFxuICBmbG9hdCBkMSA9IGRCb3hfM18xMChwMiwgdmVjMygwLjggLSBtaW4oYWNjZWxlcmF0aW9uLCAwLjgpKSkgLSAwLjI7XFxyXFxuICBmbG9hdCBkMiA9IGRCb3hfM18xMChwMiwgdmVjMygxLjApKSAtIG4xO1xcclxcbiAgZmxvYXQgZDMgPSBkQm94XzNfMTAocDIsIHZlYzMoMC41ICsgYWNjZWxlcmF0aW9uICogMC40KSkgLSBuMTtcXHJcXG4gIHJldHVybiBtaW4obWF4KGQxLCAtZDIpLCBkMyk7XFxyXFxufVxcclxcblxcclxcbmZsb2F0IGRpc3RhbmNlRnVuY0ZvckZpbGwodmVjMyBwKSB7XFxyXFxuICB2ZWM0IHAxID0gbV9tYXRyaXggKiB2ZWM0KHAsIDEuMCk7XFxyXFxuICBmbG9hdCBuID0gZ2V0Tm9pc2UocDEueHl6KTtcXHJcXG4gIHZlYzMgcDIgPSBnZXRSb3RhdGUocDEueHl6KTtcXHJcXG4gIHJldHVybiBkQm94XzNfMTAocDIsIHZlYzMoMC41ICsgYWNjZWxlcmF0aW9uICogMC40KSkgLSBuO1xcclxcbn1cXHJcXG5cXHJcXG52ZWMzIGdldE5vcm1hbCh2ZWMzIHApIHtcXHJcXG4gIGNvbnN0IGZsb2F0IGQgPSAwLjE7XFxyXFxuICByZXR1cm4gbm9ybWFsaXplKHZlYzMoXFxyXFxuICAgIGRpc3RhbmNlRnVuYyhwICsgdmVjMyhkLCAwLjAsIDAuMCkpIC0gZGlzdGFuY2VGdW5jKHAgKyB2ZWMzKC1kLCAwLjAsIDAuMCkpLFxcclxcbiAgICBkaXN0YW5jZUZ1bmMocCArIHZlYzMoMC4wLCBkLCAwLjApKSAtIGRpc3RhbmNlRnVuYyhwICsgdmVjMygwLjAsIC1kLCAwLjApKSxcXHJcXG4gICAgZGlzdGFuY2VGdW5jKHAgKyB2ZWMzKDAuMCwgMC4wLCBkKSkgLSBkaXN0YW5jZUZ1bmMocCArIHZlYzMoMC4wLCAwLjAsIC1kKSlcXHJcXG4gICkpO1xcclxcbn1cXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2ZWMyIHAgPSAoZ2xfRnJhZ0Nvb3JkLnh5ICogMi4wIC0gcmVzb2x1dGlvbikgLyBtaW4ocmVzb2x1dGlvbi54LCByZXNvbHV0aW9uLnkpO1xcclxcblxcclxcbiAgdmVjMyBjRGlyID0gbm9ybWFsaXplKGNhbWVyYVBvc2l0aW9uICogLTEuMCk7XFxyXFxuICB2ZWMzIGNVcCAgPSB2ZWMzKDAuMCwgMS4wLCAwLjApO1xcclxcbiAgdmVjMyBjU2lkZSA9IGNyb3NzKGNEaXIsIGNVcCk7XFxyXFxuXFxyXFxuICB2ZWMzIHJheSA9IG5vcm1hbGl6ZShjU2lkZSAqIHAueCArIGNVcCAqIHAueSArIGNEaXIgKiB0YXJnZXREZXB0aCk7XFxyXFxuXFxyXFxuICBmbG9hdCBkaXN0YW5jZSA9IDAuMDtcXHJcXG4gIGZsb2F0IHJMZW4gPSAwLjA7XFxyXFxuICB2ZWMzIHJQb3MgPSBjYW1lcmFQb3NpdGlvbjtcXHJcXG4gIGZvcihpbnQgaSA9IDA7IGkgPCA2NDsgaSsrKXtcXHJcXG4gICAgZGlzdGFuY2UgPSBkaXN0YW5jZUZ1bmMoclBvcyk7XFxyXFxuICAgIHJMZW4gKz0gZGlzdGFuY2U7XFxyXFxuICAgIHJQb3MgPSBjYW1lcmFQb3NpdGlvbiArIHJheSAqIHJMZW4gKiAwLjI7XFxyXFxuICB9XFxyXFxuXFxyXFxuICB2ZWMzIG5vcm1hbCA9IGdldE5vcm1hbChyUG9zKTtcXHJcXG4gIGlmKGFicyhkaXN0YW5jZSkgPCAwLjUpe1xcclxcbiAgICBpZiAoZGlzdGFuY2VGdW5jRm9yRmlsbChyUG9zKSA+IDAuNSkge1xcclxcbiAgICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoaHN2MnJnYl8xXzAodmVjMyhkb3Qobm9ybWFsLCBjVXApICogMC44ICsgdGltZSAvIDQwMC4wLCAwLjIsIGRvdChub3JtYWwsIGNVcCkgKiAwLjggKyAwLjEpKSwgMS4wKTtcXHJcXG4gICAgfSBlbHNlIHtcXHJcXG4gICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGhzdjJyZ2JfMV8wKHZlYzMoZG90KG5vcm1hbCwgY1VwKSAqIDAuMSArIHRpbWUgLyA0MDAuMCwgMC44LCBkb3Qobm9ybWFsLCBjVXApICogMC4yICsgMC44KSksIDEuMCk7XFxyXFxuICAgIH1cXHJcXG4gIH0gZWxzZSB7XFxyXFxuICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoMC4wKTtcXHJcXG4gIH1cXHJcXG59XFxyXFxuXCI7XHJcbnZhciB2c19iZyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxyXFxudW5pZm9ybSBmbG9hdCBhY2NlbGVyYXRpb247XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZQb3NpdGlvbjtcXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgbWF0NCBpbnZlcnRNYXRyaXg7XFxyXFxuXFxyXFxuLy9cXG4vLyBEZXNjcmlwdGlvbiA6IEFycmF5IGFuZCB0ZXh0dXJlbGVzcyBHTFNMIDJELzNELzREIHNpbXBsZXhcXG4vLyAgICAgICAgICAgICAgIG5vaXNlIGZ1bmN0aW9ucy5cXG4vLyAgICAgIEF1dGhvciA6IElhbiBNY0V3YW4sIEFzaGltYSBBcnRzLlxcbi8vICBNYWludGFpbmVyIDogaWptXFxuLy8gICAgIExhc3Rtb2QgOiAyMDExMDgyMiAoaWptKVxcbi8vICAgICBMaWNlbnNlIDogQ29weXJpZ2h0IChDKSAyMDExIEFzaGltYSBBcnRzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxcbi8vICAgICAgICAgICAgICAgRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlLlxcbi8vICAgICAgICAgICAgICAgaHR0cHM6Ly9naXRodWIuY29tL2FzaGltYS93ZWJnbC1ub2lzZVxcbi8vXFxuXFxudmVjMyBtb2QyODlfM18wKHZlYzMgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBtb2QyODlfM18wKHZlYzQgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBwZXJtdXRlXzNfMSh2ZWM0IHgpIHtcXG4gICAgIHJldHVybiBtb2QyODlfM18wKCgoeCozNC4wKSsxLjApKngpO1xcbn1cXG5cXG52ZWM0IHRheWxvckludlNxcnRfM18yKHZlYzQgcilcXG57XFxuICByZXR1cm4gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiByO1xcbn1cXG5cXG5mbG9hdCBzbm9pc2VfM18zKHZlYzMgdilcXG4gIHtcXG4gIGNvbnN0IHZlYzIgIEMgPSB2ZWMyKDEuMC82LjAsIDEuMC8zLjApIDtcXG4gIGNvbnN0IHZlYzQgIERfM180ID0gdmVjNCgwLjAsIDAuNSwgMS4wLCAyLjApO1xcblxcbi8vIEZpcnN0IGNvcm5lclxcbiAgdmVjMyBpICA9IGZsb29yKHYgKyBkb3QodiwgQy55eXkpICk7XFxuICB2ZWMzIHgwID0gICB2IC0gaSArIGRvdChpLCBDLnh4eCkgO1xcblxcbi8vIE90aGVyIGNvcm5lcnNcXG4gIHZlYzMgZ18zXzUgPSBzdGVwKHgwLnl6eCwgeDAueHl6KTtcXG4gIHZlYzMgbCA9IDEuMCAtIGdfM181O1xcbiAgdmVjMyBpMSA9IG1pbiggZ18zXzUueHl6LCBsLnp4eSApO1xcbiAgdmVjMyBpMiA9IG1heCggZ18zXzUueHl6LCBsLnp4eSApO1xcblxcbiAgLy8gICB4MCA9IHgwIC0gMC4wICsgMC4wICogQy54eHg7XFxuICAvLyAgIHgxID0geDAgLSBpMSAgKyAxLjAgKiBDLnh4eDtcXG4gIC8vICAgeDIgPSB4MCAtIGkyICArIDIuMCAqIEMueHh4O1xcbiAgLy8gICB4MyA9IHgwIC0gMS4wICsgMy4wICogQy54eHg7XFxuICB2ZWMzIHgxID0geDAgLSBpMSArIEMueHh4O1xcbiAgdmVjMyB4MiA9IHgwIC0gaTIgKyBDLnl5eTsgLy8gMi4wKkMueCA9IDEvMyA9IEMueVxcbiAgdmVjMyB4MyA9IHgwIC0gRF8zXzQueXl5OyAgICAgIC8vIC0xLjArMy4wKkMueCA9IC0wLjUgPSAtRC55XFxuXFxuLy8gUGVybXV0YXRpb25zXFxuICBpID0gbW9kMjg5XzNfMChpKTtcXG4gIHZlYzQgcCA9IHBlcm11dGVfM18xKCBwZXJtdXRlXzNfMSggcGVybXV0ZV8zXzEoXFxuICAgICAgICAgICAgIGkueiArIHZlYzQoMC4wLCBpMS56LCBpMi56LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS55ICsgdmVjNCgwLjAsIGkxLnksIGkyLnksIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnggKyB2ZWM0KDAuMCwgaTEueCwgaTIueCwgMS4wICkpO1xcblxcbi8vIEdyYWRpZW50czogN3g3IHBvaW50cyBvdmVyIGEgc3F1YXJlLCBtYXBwZWQgb250byBhbiBvY3RhaGVkcm9uLlxcbi8vIFRoZSByaW5nIHNpemUgMTcqMTcgPSAyODkgaXMgY2xvc2UgdG8gYSBtdWx0aXBsZSBvZiA0OSAoNDkqNiA9IDI5NClcXG4gIGZsb2F0IG5fID0gMC4xNDI4NTcxNDI4NTc7IC8vIDEuMC83LjBcXG4gIHZlYzMgIG5zID0gbl8gKiBEXzNfNC53eXogLSBEXzNfNC54eng7XFxuXFxuICB2ZWM0IGogPSBwIC0gNDkuMCAqIGZsb29yKHAgKiBucy56ICogbnMueik7ICAvLyAgbW9kKHAsNyo3KVxcblxcbiAgdmVjNCB4XyA9IGZsb29yKGogKiBucy56KTtcXG4gIHZlYzQgeV8gPSBmbG9vcihqIC0gNy4wICogeF8gKTsgICAgLy8gbW9kKGosTilcXG5cXG4gIHZlYzQgeCA9IHhfICpucy54ICsgbnMueXl5eTtcXG4gIHZlYzQgeSA9IHlfICpucy54ICsgbnMueXl5eTtcXG4gIHZlYzQgaCA9IDEuMCAtIGFicyh4KSAtIGFicyh5KTtcXG5cXG4gIHZlYzQgYjAgPSB2ZWM0KCB4Lnh5LCB5Lnh5ICk7XFxuICB2ZWM0IGIxID0gdmVjNCggeC56dywgeS56dyApO1xcblxcbiAgLy92ZWM0IHMwID0gdmVjNChsZXNzVGhhbihiMCwwLjApKSoyLjAgLSAxLjA7XFxuICAvL3ZlYzQgczEgPSB2ZWM0KGxlc3NUaGFuKGIxLDAuMCkpKjIuMCAtIDEuMDtcXG4gIHZlYzQgczAgPSBmbG9vcihiMCkqMi4wICsgMS4wO1xcbiAgdmVjNCBzMSA9IGZsb29yKGIxKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHNoID0gLXN0ZXAoaCwgdmVjNCgwLjApKTtcXG5cXG4gIHZlYzQgYTAgPSBiMC54enl3ICsgczAueHp5dypzaC54eHl5IDtcXG4gIHZlYzQgYTFfM182ID0gYjEueHp5dyArIHMxLnh6eXcqc2guenp3dyA7XFxuXFxuICB2ZWMzIHAwXzNfNyA9IHZlYzMoYTAueHksaC54KTtcXG4gIHZlYzMgcDEgPSB2ZWMzKGEwLnp3LGgueSk7XFxuICB2ZWMzIHAyID0gdmVjMyhhMV8zXzYueHksaC56KTtcXG4gIHZlYzMgcDMgPSB2ZWMzKGExXzNfNi56dyxoLncpO1xcblxcbi8vTm9ybWFsaXNlIGdyYWRpZW50c1xcbiAgdmVjNCBub3JtID0gdGF5bG9ySW52U3FydF8zXzIodmVjNChkb3QocDBfM183LHAwXzNfNyksIGRvdChwMSxwMSksIGRvdChwMiwgcDIpLCBkb3QocDMscDMpKSk7XFxuICBwMF8zXzcgKj0gbm9ybS54O1xcbiAgcDEgKj0gbm9ybS55O1xcbiAgcDIgKj0gbm9ybS56O1xcbiAgcDMgKj0gbm9ybS53O1xcblxcbi8vIE1peCBmaW5hbCBub2lzZSB2YWx1ZVxcbiAgdmVjNCBtID0gbWF4KDAuNiAtIHZlYzQoZG90KHgwLHgwKSwgZG90KHgxLHgxKSwgZG90KHgyLHgyKSwgZG90KHgzLHgzKSksIDAuMCk7XFxuICBtID0gbSAqIG07XFxuICByZXR1cm4gNDIuMCAqIGRvdCggbSptLCB2ZWM0KCBkb3QocDBfM183LHgwKSwgZG90KHAxLHgxKSxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvdChwMix4MiksIGRvdChwMyx4MykgKSApO1xcbiAgfVxcblxcblxcblxcbnZlYzMgaHN2MnJnYl8xXzgodmVjMyBjKXtcXHJcXG4gIHZlYzQgSyA9IHZlYzQoMS4wLCAyLjAgLyAzLjAsIDEuMCAvIDMuMCwgMy4wKTtcXHJcXG4gIHZlYzMgcCA9IGFicyhmcmFjdChjLnh4eCArIEsueHl6KSAqIDYuMCAtIEsud3d3KTtcXHJcXG4gIHJldHVybiBjLnogKiBtaXgoSy54eHgsIGNsYW1wKHAgLSBLLnh4eCwgMC4wLCAxLjApLCBjLnkpO1xcclxcbn1cXHJcXG5cXG5cXG5mbG9hdCBpbnZlcnNlXzRfOShmbG9hdCBtKSB7XFxuICByZXR1cm4gMS4wIC8gbTtcXG59XFxuXFxubWF0MiBpbnZlcnNlXzRfOShtYXQyIG0pIHtcXG4gIHJldHVybiBtYXQyKG1bMV1bMV0sLW1bMF1bMV0sXFxuICAgICAgICAgICAgIC1tWzFdWzBdLCBtWzBdWzBdKSAvIChtWzBdWzBdKm1bMV1bMV0gLSBtWzBdWzFdKm1bMV1bMF0pO1xcbn1cXG5cXG5tYXQzIGludmVyc2VfNF85KG1hdDMgbSkge1xcbiAgZmxvYXQgYTAwID0gbVswXVswXSwgYTAxID0gbVswXVsxXSwgYTAyID0gbVswXVsyXTtcXG4gIGZsb2F0IGExMCA9IG1bMV1bMF0sIGExMSA9IG1bMV1bMV0sIGExMiA9IG1bMV1bMl07XFxuICBmbG9hdCBhMjAgPSBtWzJdWzBdLCBhMjEgPSBtWzJdWzFdLCBhMjIgPSBtWzJdWzJdO1xcblxcbiAgZmxvYXQgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxO1xcbiAgZmxvYXQgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMDtcXG4gIGZsb2F0IGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMDtcXG5cXG4gIGZsb2F0IGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcXG5cXG4gIHJldHVybiBtYXQzKGIwMSwgKC1hMjIgKiBhMDEgKyBhMDIgKiBhMjEpLCAoYTEyICogYTAxIC0gYTAyICogYTExKSxcXG4gICAgICAgICAgICAgIGIxMSwgKGEyMiAqIGEwMCAtIGEwMiAqIGEyMCksICgtYTEyICogYTAwICsgYTAyICogYTEwKSxcXG4gICAgICAgICAgICAgIGIyMSwgKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApLCAoYTExICogYTAwIC0gYTAxICogYTEwKSkgLyBkZXQ7XFxufVxcblxcbm1hdDQgaW52ZXJzZV80XzkobWF0NCBtKSB7XFxuICBmbG9hdFxcbiAgICAgIGEwMCA9IG1bMF1bMF0sIGEwMSA9IG1bMF1bMV0sIGEwMiA9IG1bMF1bMl0sIGEwMyA9IG1bMF1bM10sXFxuICAgICAgYTEwID0gbVsxXVswXSwgYTExID0gbVsxXVsxXSwgYTEyID0gbVsxXVsyXSwgYTEzID0gbVsxXVszXSxcXG4gICAgICBhMjAgPSBtWzJdWzBdLCBhMjEgPSBtWzJdWzFdLCBhMjIgPSBtWzJdWzJdLCBhMjMgPSBtWzJdWzNdLFxcbiAgICAgIGEzMCA9IG1bM11bMF0sIGEzMSA9IG1bM11bMV0sIGEzMiA9IG1bM11bMl0sIGEzMyA9IG1bM11bM10sXFxuXFxuICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxcbiAgICAgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcXG4gICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXFxuICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxcbiAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSxcXG4gICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXFxuICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxcbiAgICAgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcXG4gICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXFxuICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxcbiAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSxcXG4gICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzIsXFxuXFxuICAgICAgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xcblxcbiAgcmV0dXJuIG1hdDQoXFxuICAgICAgYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5LFxcbiAgICAgIGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSxcXG4gICAgICBhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMsXFxuICAgICAgYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzLFxcbiAgICAgIGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNyxcXG4gICAgICBhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcsXFxuICAgICAgYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxLFxcbiAgICAgIGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSxcXG4gICAgICBhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYsXFxuICAgICAgYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2LFxcbiAgICAgIGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCxcXG4gICAgICBhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDAsXFxuICAgICAgYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2LFxcbiAgICAgIGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNixcXG4gICAgICBhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDAsXFxuICAgICAgYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwKSAvIGRldDtcXG59XFxuXFxuXFxudmVjMyByb3RhdGVfMl8xMCh2ZWMzIHAsIGZsb2F0IHJhZGlhbl94LCBmbG9hdCByYWRpYW5feSwgZmxvYXQgcmFkaWFuX3opIHtcXHJcXG4gIG1hdDMgbXggPSBtYXQzKFxcclxcbiAgICAxLjAsIDAuMCwgMC4wLFxcclxcbiAgICAwLjAsIGNvcyhyYWRpYW5feCksIC1zaW4ocmFkaWFuX3gpLFxcclxcbiAgICAwLjAsIHNpbihyYWRpYW5feCksIGNvcyhyYWRpYW5feClcXHJcXG4gICk7XFxyXFxuICBtYXQzIG15ID0gbWF0MyhcXHJcXG4gICAgY29zKHJhZGlhbl95KSwgMC4wLCBzaW4ocmFkaWFuX3kpLFxcclxcbiAgICAwLjAsIDEuMCwgMC4wLFxcclxcbiAgICAtc2luKHJhZGlhbl95KSwgMC4wLCBjb3MocmFkaWFuX3kpXFxyXFxuICApO1xcclxcbiAgbWF0MyBteiA9IG1hdDMoXFxyXFxuICAgIGNvcyhyYWRpYW5feiksIC1zaW4ocmFkaWFuX3opLCAwLjAsXFxyXFxuICAgIHNpbihyYWRpYW5feiksIGNvcyhyYWRpYW5feiksIDAuMCxcXHJcXG4gICAgMC4wLCAwLjAsIDEuMFxcclxcbiAgKTtcXHJcXG4gIHJldHVybiBteCAqIG15ICogbXogKiBwO1xcclxcbn1cXHJcXG5cXG5cXG5cXHJcXG52ZWMzIGdldFJvdGF0ZSh2ZWMzIHApIHtcXHJcXG4gIHJldHVybiByb3RhdGVfMl8xMChwLCByYWRpYW5zKHRpbWUgLyA2LjApLCByYWRpYW5zKHRpbWUgLyA3LjApLCByYWRpYW5zKHRpbWUgLyA4LjApKTtcXHJcXG59XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZmxvYXQgdXBkYXRlVGltZSA9IHRpbWUgLyA0MDAuMDtcXHJcXG4gIHZlYzMgcF9yb3RhdGUgPSBnZXRSb3RhdGUocG9zaXRpb24pO1xcclxcbiAgZmxvYXQgbm9pc2UgPSBzbm9pc2VfM18zKHZlYzMocF9yb3RhdGUgLyAxMi4xICsgdXBkYXRlVGltZSAqIDAuNSkpO1xcclxcbiAgdmVjMyBwX25vaXNlID0gcF9yb3RhdGUgKyBwX3JvdGF0ZSAqIG5vaXNlIC8gMjAuMCAqIChtaW4oYWNjZWxlcmF0aW9uLCA2LjApICsgMS4wKTtcXHJcXG5cXHJcXG4gIHZQb3NpdGlvbiA9IHBfbm9pc2U7XFxyXFxuICB2Q29sb3IgPSBoc3YycmdiXzFfOCh2ZWMzKHVwZGF0ZVRpbWUgKyBwb3NpdGlvbi55IC8gNDAwLjAsIDAuMDUgKyBtaW4oYWNjZWxlcmF0aW9uIC8gMTAuMCwgMC4yNSksIDEuMCkpO1xcclxcbiAgaW52ZXJ0TWF0cml4ID0gaW52ZXJzZV80XzkobW9kZWxNYXRyaXgpO1xcclxcblxcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwX25vaXNlLCAxLjApO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzX2JnID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG51bmlmb3JtIGZsb2F0IGFjY2VsZXJhdGlvbjtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdlBvc2l0aW9uO1xcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBtYXQ0IGludmVydE1hdHJpeDtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2ZWMzIG5vcm1hbCA9IG5vcm1hbGl6ZShjcm9zcyhkRmR4KHZQb3NpdGlvbiksIGRGZHkodlBvc2l0aW9uKSkpO1xcclxcbiAgdmVjMyBpbnZfbGlnaHQgPSBub3JtYWxpemUoaW52ZXJ0TWF0cml4ICogdmVjNCgwLjcsIC0wLjcsIDAuNywgMS4wKSkueHl6O1xcclxcbiAgZmxvYXQgZGlmZiA9IChkb3Qobm9ybWFsLCBpbnZfbGlnaHQpICsgMS4wKSAvIDQuMCArIDAuNDtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQodkNvbG9yICogZGlmZiwgMS4wKTtcXHJcXG59XFxyXFxuXCI7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciByYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XHJcbiAgdmFyIGludGVyc2VjdHMgPSBudWxsO1xyXG4gIHZhciBjdWJlX2ZvcmNlID0gbmV3IEZvcmNlMygpO1xyXG4gIHZhciBjdWJlX2ZvcmNlMiA9IG5ldyBGb3JjZTMoKTtcclxuICB2YXIgdmFjdG9yX3JheWNhc3QgPSBudWxsO1xyXG4gIGN1YmVfZm9yY2UubWFzcyA9IDEuNDtcclxuXHJcbiAgdmFyIGNyZWF0ZVBsYW5lRm9yUmF5bWFyY2hpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KDYuMCwgNi4wKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpbWUyOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFjY2VsZXJhdGlvbjoge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc29sdXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICd2MicsXHJcbiAgICAgICAgICB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogdnMsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBmcyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWVcclxuICAgIH0pO1xyXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgbWVzaC5uYW1lID0gJ01ldGFsQ3ViZSc7XHJcbiAgICByZXR1cm4gbWVzaDtcclxuICB9O1xyXG4gIHZhciBjcmVhdGVCYWNrZ3JvdW5kID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5X2Jhc2UgPSBuZXcgVEhSRUUuT2N0YWhlZHJvbkdlb21ldHJ5KDMwLCA0KTtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgZ2VvbWV0cnkuZnJvbUdlb21ldHJ5KGdlb21ldHJ5X2Jhc2UpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICB0aW1lOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFjY2VsZXJhdGlvbjoge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDBcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHZzX2JnLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogZnNfYmcsXHJcbiAgICAgIHNoYWRpbmc6IFRIUkVFLkZsYXRTaGFkaW5nLFxyXG4gICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZVxyXG4gICAgfSk7XHJcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICBtZXNoLm5hbWUgPSAnQmFja2dyb3VuZCc7XHJcbiAgICByZXR1cm4gbWVzaDtcclxuICB9O1xyXG5cclxuICB2YXIgbW92ZU1ldGFsQ3ViZSA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgaWYgKGN1YmVfZm9yY2UuYWNjZWxlcmF0aW9uLmxlbmd0aCgpID4gMC4xIHx8ICF2ZWN0b3IpIHJldHVybjtcclxuICAgIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKHZlY3RvciwgY2FtZXJhKTtcclxuICAgIGludGVyc2VjdHMgPSByYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyhzY2VuZS5jaGlsZHJlbilbMF07XHJcbiAgICBpZihpbnRlcnNlY3RzICYmIGludGVyc2VjdHMub2JqZWN0Lm5hbWUgPT0gJ01ldGFsQ3ViZScpIHtcclxuICAgICAgY3ViZV9mb3JjZS5hbmNob3IuY29weShVdGlsLmdldFBvbGFyQ29vcmQoXHJcbiAgICAgICAgVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoLTIwLCAyMCkpLFxyXG4gICAgICAgIFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpLFxyXG4gICAgICAgIFV0aWwuZ2V0UmFuZG9tSW50KDMwLCA5MCkgLyAxMFxyXG4gICAgICApKTtcclxuICAgICAgY3ViZV9mb3JjZTIuYXBwbHlGb3JjZShuZXcgVEhSRUUuVmVjdG9yMygxLCAwLCAwKSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHBsYW5lID0gY3JlYXRlUGxhbmVGb3JSYXltYXJjaGluZygpO1xyXG4gIHZhciBiZyA9IGNyZWF0ZUJhY2tncm91bmQoKTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgc2NlbmUuYWRkKHBsYW5lKTtcclxuICAgICAgc2NlbmUuYWRkKGJnKTtcclxuICAgICAgY2FtZXJhLnNldFBvbGFyQ29vcmQoMCwgVXRpbC5nZXRSYWRpYW4oOTApLCAyNCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHBsYW5lLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcGxhbmUubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocGxhbmUpO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgbW92ZU1ldGFsQ3ViZShzY2VuZSwgY2FtZXJhLCB2YWN0b3JfcmF5Y2FzdCk7XHJcbiAgICAgIGN1YmVfZm9yY2UuYXBwbHlIb29rKDAsIDAuMTIpO1xyXG4gICAgICBjdWJlX2ZvcmNlLmFwcGx5RHJhZygwLjAxKTtcclxuICAgICAgY3ViZV9mb3JjZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjdWJlX2ZvcmNlMi5hcHBseUhvb2soMCwgMC4wMDUpO1xyXG4gICAgICBjdWJlX2ZvcmNlMi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY3ViZV9mb3JjZTIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgcGxhbmUucG9zaXRpb24uY29weShjdWJlX2ZvcmNlLnZlbG9jaXR5KTtcclxuICAgICAgcGxhbmUubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSsrO1xyXG4gICAgICBwbGFuZS5tYXRlcmlhbC51bmlmb3Jtcy50aW1lMi52YWx1ZSArPSAxICsgTWF0aC5mbG9vcihjdWJlX2ZvcmNlLmFjY2VsZXJhdGlvbi5sZW5ndGgoKSAqIDQpO1xyXG4gICAgICBwbGFuZS5tYXRlcmlhbC51bmlmb3Jtcy5hY2NlbGVyYXRpb24udmFsdWUgPSBjdWJlX2ZvcmNlLmFjY2VsZXJhdGlvbi5sZW5ndGgoKTtcclxuICAgICAgYmcubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSsrO1xyXG4gICAgICBiZy5tYXRlcmlhbC51bmlmb3Jtcy5hY2NlbGVyYXRpb24udmFsdWUgPSBjdWJlX2ZvcmNlMi52ZWxvY2l0eS5sZW5ndGgoKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcblxyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIHZhY3Rvcl9yYXljYXN0ID0gdmVjdG9yX21vdXNlX21vdmU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpIHtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgfSxcclxuICAgIHJlc2l6ZVdpbmRvdzogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBwbGFuZS5tYXRlcmlhbC51bmlmb3Jtcy5yZXNvbHV0aW9uLnZhbHVlLnNldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiJdfQ==
