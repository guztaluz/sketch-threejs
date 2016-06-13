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
      "#define GLSLIFY 1\nuniform vec2 resolution;\r\nuniform sampler2D velocity;\r\nuniform sampler2D acceleration;\r\nuniform vec2 anchor;\r\n\r\nvarying vec2 vUv;\r\n\r\n#define PRECISION 0.000001\r\n\r\nvec3 drag(vec3 a, float value) {\r\n  return normalize(a * -1.0 + PRECISION) * length(a) * value;\r\n}\r\n\r\nvec3 hook(vec3 v, vec3 anchor, float rest_length, float k) {\r\n  return normalize(v - anchor + PRECISION) * (-1.0 * k * (length(v - anchor) - rest_length));\r\n}\r\n\r\nvec3 attract(vec3 v1, vec3 v2, float m1, float m2, float g) {\r\n  return g * m1 * m2 / pow(clamp(length(v2 - v1), 5.0, 30.0), 2.0) * normalize(v2 - v1 + PRECISION);\r\n}\r\n\r\nvoid main(void) {\r\n  vec3 v = texture2D(velocity, vUv).xyz;\r\n  vec3 a = texture2D(acceleration, vUv).xyz;\r\n  vec3 a2 = a + attract(v, vec3(anchor.x * 80.0, anchor.y * 80.0, 0.0), 1.0, 1.0, 10.0);\r\n  gl_FragColor = vec4(a2, 1.0);\r\n}\r\n"
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
    update: '',
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
        }
      },
      vertexShader: "#define GLSLIFY 1\nattribute vec2 uv2;\r\nattribute vec3 color;\r\n\r\nuniform sampler2D velocity;\r\n\r\nvarying vec3 vColor;\r\n\r\nvoid main(void) {\r\n  vec4 update_position = modelViewMatrix * texture2D(velocity, uv2);\r\n  vColor = color;\r\n  gl_PointSize = 1.0;\r\n  gl_Position = projectionMatrix * update_position;\r\n}\r\n",
      fragmentShader: "#define GLSLIFY 1\nvarying vec3 vColor;\r\n\r\nuniform float time;\r\n\r\nvec3 hsv2rgb_1_0(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n\r\nvoid main(void) {\r\n  gl_FragColor = vec4(hsv2rgb_1_0(vec3(vColor.x + time / 3600.0, vColor.yz)), 0.5);\r\n}\r\n",
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
        Util.getRandomInt(10, 20)
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2RlYm91bmNlLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UyLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UzLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2VfY2FtZXJhLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2VfaGVtaXNwaGVyZV9saWdodC5qcyIsInNyYy9qcy9tb2R1bGVzL2ZvcmNlX3BvaW50X2xpZ2h0LmpzIiwic3JjL2pzL21vZHVsZXMvbW92ZXIuanMiLCJzcmMvanMvbW9kdWxlcy9waHlzaWNzX3JlbmRlcmVyLmpzIiwic3JjL2pzL21vZHVsZXMvcG9pbnRzLmpzIiwic3JjL2pzL21vZHVsZXMvdXRpbC5qcyIsInNyYy9qcy9za2V0Y2hlcy5qcyIsInNyYy9qcy9za2V0Y2hlcy9hdHRyYWN0LmpzIiwic3JjL2pzL3NrZXRjaGVzL2NvbWV0LmpzIiwic3JjL2pzL3NrZXRjaGVzL2Rpc3RvcnQuanMiLCJzcmMvanMvc2tldGNoZXMvZmlyZV9iYWxsLmpzIiwic3JjL2pzL3NrZXRjaGVzL2dhbGxlcnkuanMiLCJzcmMvanMvc2tldGNoZXMvaG9sZS5qcyIsInNyYy9qcy9za2V0Y2hlcy9oeXBlcl9zcGFjZS5qcyIsInNyYy9qcy9za2V0Y2hlcy9pbWFnZV9kYXRhLmpzIiwic3JjL2pzL3NrZXRjaGVzL21ldGFsX2N1YmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBVdGlsID0gcmVxdWlyZSgnLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnLi9tb2R1bGVzL2RlYm91bmNlJyk7XHJcbnZhciBGb3JjZUNhbWVyYSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9mb3JjZV9jYW1lcmEnKTtcclxuXHJcbnZhciB2ZWN0b3JfbW91c2VfZG93biA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbnZhciB2ZWN0b3JfbW91c2VfbW92ZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbnZhciB2ZWN0b3JfbW91c2VfZW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuXHJcbnZhciBjYW52YXMgPSBudWxsO1xyXG52YXIgcmVuZGVyZXIgPSBudWxsO1xyXG52YXIgc2NlbmUgPSBudWxsO1xyXG52YXIgY2FtZXJhID0gbnVsbDtcclxuXHJcbnZhciBydW5uaW5nID0gbnVsbDtcclxudmFyIHNrZXRjaGVzID0gcmVxdWlyZSgnLi9za2V0Y2hlcycpO1xyXG52YXIgc2tldGNoX2lkID0gMDtcclxuXHJcbnZhciBtZXRhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtZXRhJyk7XHJcbnZhciBidG5fdG9nZ2xlX21lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLXN3aXRjaC1tZW51Jyk7XHJcbnZhciBtZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1lbnUnKTtcclxudmFyIHNlbGVjdF9za2V0Y2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LXNrZXRjaCcpO1xyXG52YXIgc2tldGNoX3RpdGxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNrZXRjaC10aXRsZScpO1xyXG52YXIgc2tldGNoX2RhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2tldGNoLWRhdGUnKTtcclxudmFyIHNrZXRjaF9kZXNjcmlwdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5za2V0Y2gtZGVzY3JpcHRpb24nKTtcclxuXHJcbnZhciBpbml0VGhyZWUgPSBmdW5jdGlvbigpIHtcclxuICBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XHJcbiAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XHJcbiAgICBhbnRpYWxpYXM6IHRydWUsXHJcbiAgICB0b25lTWFwcGluZzogVEhSRUUuTm9Ub25lTWFwcGluZyxcclxuICB9KTtcclxuICBpZiAoIXJlbmRlcmVyKSB7XHJcbiAgICBhbGVydCgnVGhyZWUuanPjga7liJ3mnJ/ljJbjgavlpLHmlZfjgZfjgb7jgZfjgZ/jgIInKTtcclxuICB9XHJcbiAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICBjYW52YXMuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XHJcbiAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigweDAwMDAwMCwgMS4wKTtcclxuXHJcbiAgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuXHJcbiAgY2FtZXJhID0gbmV3IEZvcmNlQ2FtZXJhKDM1LCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMSwgMTAwMDApO1xyXG59O1xyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbigpIHtcclxuICBzZXRTa2V0Y2hJZCgpO1xyXG4gIGJ1aWxkTWVudSgpO1xyXG4gIGluaXRUaHJlZSgpO1xyXG4gIHN0YXJ0UnVuU2tldGNoKHNrZXRjaGVzW3NrZXRjaGVzLmxlbmd0aCAtIHNrZXRjaF9pZF0pO1xyXG4gIHJlbmRlcmxvb3AoKTtcclxuICBzZXRFdmVudCgpO1xyXG4gIGRlYm91bmNlKHdpbmRvdywgJ3Jlc2l6ZScsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgIHJlc2l6ZVJlbmRlcmVyKCk7XHJcbiAgfSk7XHJcbn07XHJcblxyXG52YXIgZ2V0UGFyYW1ldGVyQnlOYW1lID0gZnVuY3Rpb24obmFtZSkge1xyXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgXCJcXFxcW1wiKS5yZXBsYWNlKC9bXFxdXS8sIFwiXFxcXF1cIik7XHJcbiAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIltcXFxcPyZdXCIgKyBuYW1lICsgXCI9KFteJiNdKilcIik7XHJcbiAgdmFyIHJlc3VsdHMgPSByZWdleC5leGVjKGxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyBcIlwiIDogZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csIFwiIFwiKSk7XHJcbn07XHJcblxyXG52YXIgc2V0U2tldGNoSWQgPSBmdW5jdGlvbigpIHtcclxuICBza2V0Y2hfaWQgPSBnZXRQYXJhbWV0ZXJCeU5hbWUoJ3NrZXRjaF9pZCcpO1xyXG4gIGlmIChza2V0Y2hfaWQgPT0gbnVsbCB8fCBza2V0Y2hfaWQgPiBza2V0Y2hlcy5sZW5ndGggfHwgc2tldGNoX2lkIDwgMSkge1xyXG4gICAgc2tldGNoX2lkID0gc2tldGNoZXMubGVuZ3RoO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciBidWlsZE1lbnUgPSBmdW5jdGlvbigpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHNrZXRjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgc2tldGNoID0gc2tldGNoZXNbaV07XHJcbiAgICB2YXIgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgIGRvbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnLCBpKTtcclxuICAgIGRvbS5pbm5lckhUTUwgPSAnPHNwYW4+JyArIHNrZXRjaC5uYW1lICsgJzwvc3Bhbj4nO1xyXG4gICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHN3aXRjaFNrZXRjaChza2V0Y2hlc1t0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpXSk7XHJcbiAgICB9KTtcclxuICAgIHNlbGVjdF9za2V0Y2guYXBwZW5kQ2hpbGQoZG9tKTtcclxuICB9XHJcbn07XHJcblxyXG52YXIgc3RhcnRSdW5Ta2V0Y2ggPSBmdW5jdGlvbihza2V0Y2gpIHtcclxuICBydW5uaW5nID0gbmV3IHNrZXRjaC5vYmooc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpO1xyXG4gIHNrZXRjaF90aXRsZS5pbm5lckhUTUwgPSBza2V0Y2gubmFtZTtcclxuICBza2V0Y2hfZGF0ZS5pbm5lckhUTUwgPSAoc2tldGNoLnVwZGF0ZS5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgID8gJ3Bvc3RlZDogJyArIHNrZXRjaC5wb3N0ZWQgKyAnIC8gdXBkYXRlOiAnICsgc2tldGNoLnVwZGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3Bvc3RlZDogJyArIHNrZXRjaC5wb3N0ZWQ7XHJcbiAgc2tldGNoX2Rlc2NyaXB0aW9uLmlubmVySFRNTCA9IHNrZXRjaC5kZXNjcmlwdGlvbjtcclxufTtcclxuXHJcbnZhciBzd2l0Y2hTa2V0Y2ggPSBmdW5jdGlvbihza2V0Y2gpIHtcclxuICBydW5uaW5nLnJlbW92ZShzY2VuZSwgY2FtZXJhKTtcclxuICBzdGFydFJ1blNrZXRjaChza2V0Y2gpO1xyXG4gIHN3aXRjaE1lbnUoKTtcclxufTtcclxuXHJcbnZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICByZW5kZXJlci5jbGVhcigpO1xyXG4gIHJ1bm5pbmcucmVuZGVyKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKTtcclxuICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XHJcbn07XHJcblxyXG52YXIgcmVuZGVybG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJsb29wKTtcclxuICByZW5kZXIoKTtcclxufTtcclxuXHJcbnZhciByZXNpemVSZW5kZXJlciA9IGZ1bmN0aW9uKCkge1xyXG4gIHJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgY2FtZXJhLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICByZXNpemVXaW5kb3coKTtcclxufTtcclxuXHJcbnZhciBzZXRFdmVudCA9IGZ1bmN0aW9uICgpIHtcclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoU3RhcnQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hNb3ZlKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaEVuZChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZLCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hTdGFydChldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSwgdHJ1ZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaE1vdmUoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFksIHRydWUpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaEVuZChldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYLCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZLCB0cnVlKTtcclxuICB9KTtcclxuXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIG1vdXNlT3V0KCk7XHJcbiAgfSk7XHJcblxyXG4gIGJ0bl90b2dnbGVfbWVudS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgc3dpdGNoTWVudSgpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudmFyIHRyYW5zZm9ybVZlY3RvcjJkID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgdmVjdG9yLnggPSAodmVjdG9yLnggLyB3aW5kb3cuaW5uZXJXaWR0aCkgKiAyIC0gMTtcclxuICB2ZWN0b3IueSA9IC0gKHZlY3Rvci55IC8gd2luZG93LmlubmVySGVpZ2h0KSAqIDIgKyAxO1xyXG59O1xyXG5cclxudmFyIHRvdWNoU3RhcnQgPSBmdW5jdGlvbih4LCB5LCB0b3VjaF9ldmVudCkge1xyXG4gIHZlY3Rvcl9tb3VzZV9kb3duLnNldCh4LCB5KTtcclxuICB0cmFuc2Zvcm1WZWN0b3IyZCh2ZWN0b3JfbW91c2VfZG93bik7XHJcbiAgaWYgKHJ1bm5pbmcudG91Y2hTdGFydCkgcnVubmluZy50b3VjaFN0YXJ0KHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duKTtcclxufTtcclxuXHJcbnZhciB0b3VjaE1vdmUgPSBmdW5jdGlvbih4LCB5LCB0b3VjaF9ldmVudCkge1xyXG4gIHZlY3Rvcl9tb3VzZV9tb3ZlLnNldCh4LCB5KTtcclxuICB0cmFuc2Zvcm1WZWN0b3IyZCh2ZWN0b3JfbW91c2VfbW92ZSk7XHJcbiAgaWYgKHJ1bm5pbmcudG91Y2hNb3ZlKSBydW5uaW5nLnRvdWNoTW92ZShzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpO1xyXG59O1xyXG5cclxudmFyIHRvdWNoRW5kID0gZnVuY3Rpb24oeCwgeSwgdG91Y2hfZXZlbnQpIHtcclxuICB2ZWN0b3JfbW91c2VfZW5kLnNldCh4LCB5KTtcclxuICBpZiAocnVubmluZy50b3VjaEVuZCkgcnVubmluZy50b3VjaEVuZChzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKTtcclxufTtcclxuXHJcbnZhciBtb3VzZU91dCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZlY3Rvcl9tb3VzZV9lbmQuc2V0KDAsIDApO1xyXG4gIGlmIChydW5uaW5nLm1vdXNlT3V0KSBydW5uaW5nLm1vdXNlT3V0KHNjZW5lLCBjYW1lcmEpO1xyXG59O1xyXG5cclxudmFyIHN3aXRjaE1lbnUgPSBmdW5jdGlvbigpIHtcclxuICBidG5fdG9nZ2xlX21lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJyk7XHJcbiAgbWVudS5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKTtcclxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBvaW50ZWQnKTtcclxufTtcclxuXHJcbnZhciByZXNpemVXaW5kb3cgPSBmdW5jdGlvbigpIHtcclxuICBpZiAocnVubmluZy5yZXNpemVXaW5kb3cpIHJ1bm5pbmcucmVzaXplV2luZG93KHNjZW5lLCBjYW1lcmEpO1xyXG59O1xyXG5cclxuXHJcbmluaXQoKTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmplY3QsIGV2ZW50VHlwZSwgY2FsbGJhY2spe1xyXG4gIHZhciB0aW1lcjtcclxuXHJcbiAgb2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICBjYWxsYmFjayhldmVudCk7XHJcbiAgICB9LCA1MDApO1xyXG4gIH0sIGZhbHNlKTtcclxufTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgRm9yY2UyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICAgIHRoaXMubWFzcyA9IDE7XHJcbiAgfTtcclxuICBcclxuICBGb3JjZTIucHJvdG90eXBlLnVwZGF0ZVZlbG9jaXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbi5kaXZpZGVTY2FsYXIodGhpcy5tYXNzKTtcclxuICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcclxuICB9O1xyXG4gIEZvcmNlMi5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHZlY3Rvcik7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5RnJpY3Rpb24gPSBmdW5jdGlvbihtdSwgbm9ybWFsKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xyXG4gICAgaWYgKCFub3JtYWwpIG5vcm1hbCA9IDE7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSk7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKG11KTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5RHJhZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIoLTEpO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcih0aGlzLmFjY2VsZXJhdGlvbi5sZW5ndGgoKSAqIHZhbHVlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5SG9vayA9IGZ1bmN0aW9uKHJlc3RfbGVuZ3RoLCBrKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLnZlbG9jaXR5LmNsb25lKCkuc3ViKHRoaXMuYW5jaG9yKTtcclxuICAgIHZhciBkaXN0YW5jZSA9IGZvcmNlLmxlbmd0aCgpIC0gcmVzdF9sZW5ndGg7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xICogayAqIGRpc3RhbmNlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIEZvcmNlMjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBGb3JjZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLmFuY2hvciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLm1hc3MgPSAxO1xyXG4gIH07XHJcblxyXG4gIEZvcmNlLnByb3RvdHlwZS51cGRhdGVWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uZGl2aWRlU2NhbGFyKHRoaXMubWFzcyk7XHJcbiAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHZlY3Rvcik7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlGcmljdGlvbiA9IGZ1bmN0aW9uKG11LCBub3JtYWwpIHtcclxuICAgIHZhciBmb3JjZSA9IHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCk7XHJcbiAgICBpZiAoIW5vcm1hbCkgbm9ybWFsID0gMTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIobXUpO1xyXG4gICAgdGhpcy5hcHBseUZvcmNlKGZvcmNlKTtcclxuICB9O1xyXG4gIEZvcmNlLnByb3RvdHlwZS5hcHBseURyYWcgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIodGhpcy5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgKiB2YWx1ZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcbiAgRm9yY2UucHJvdG90eXBlLmFwcGx5SG9vayA9IGZ1bmN0aW9uKHJlc3RfbGVuZ3RoLCBrKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLnZlbG9jaXR5LmNsb25lKCkuc3ViKHRoaXMuYW5jaG9yKTtcclxuICAgIHZhciBkaXN0YW5jZSA9IGZvcmNlLmxlbmd0aCgpIC0gcmVzdF9sZW5ndGg7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xICogayAqIGRpc3RhbmNlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIEZvcmNlO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBGb3JjZUNhbWVyYSA9IGZ1bmN0aW9uKGZvdiwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcclxuICAgIFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhLmNhbGwodGhpcywgZm92LCBhc3BlY3QsIG5lYXIsIGZhcik7XHJcbiAgICB0aGlzLmZvcmNlID0ge1xyXG4gICAgICBwb3NpdGlvbjogbmV3IEZvcmNlMygpLFxyXG4gICAgICBsb29rOiBuZXcgRm9yY2UzKCksXHJcbiAgICB9O1xyXG4gICAgdGhpcy51cC5zZXQoMCwgMSwgMCk7XHJcbiAgfTtcclxuICBGb3JjZUNhbWVyYS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhLnByb3RvdHlwZSk7XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRm9yY2VDYW1lcmE7XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkodGhpcy5mb3JjZS5wb3NpdGlvbi52ZWxvY2l0eSk7XHJcbiAgfTtcclxuICBGb3JjZUNhbWVyYS5wcm90b3R5cGUudXBkYXRlTG9vayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5sb29rQXQoe1xyXG4gICAgICB4OiB0aGlzLmZvcmNlLmxvb2sudmVsb2NpdHkueCxcclxuICAgICAgeTogdGhpcy5mb3JjZS5sb29rLnZlbG9jaXR5LnksXHJcbiAgICAgIHo6IHRoaXMuZm9yY2UubG9vay52ZWxvY2l0eS56LFxyXG4gICAgfSk7XHJcbiAgfTtcclxuICBGb3JjZUNhbWVyYS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2V0UG9sYXJDb29yZCgpO1xyXG4gICAgdGhpcy5sb29rQXRDZW50ZXIoKTtcclxuICB9O1xyXG4gIEZvcmNlQ2FtZXJhLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICB0aGlzLmFzcGVjdCA9IHdpZHRoIC8gaGVpZ2h0O1xyXG4gICAgdGhpcy51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcbiAgfTtcclxuICBGb3JjZUNhbWVyYS5wcm90b3R5cGUuc2V0UG9sYXJDb29yZCA9IGZ1bmN0aW9uKHJhZDEsIHJhZDIsIHJhbmdlKSB7XHJcbiAgICB0aGlzLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChyYWQxLCByYWQyLCByYW5nZSkpO1xyXG4gIH07XHJcbiAgRm9yY2VDYW1lcmEucHJvdG90eXBlLmxvb2tBdENlbnRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5sb29rQXQoe1xyXG4gICAgICB4OiAwLFxyXG4gICAgICB5OiAwLFxyXG4gICAgICB6OiAwXHJcbiAgICB9KTtcclxuICB9O1xyXG4gIHJldHVybiBGb3JjZUNhbWVyYTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgRm9yY2VIZW1pc3BoZXJlTGlnaHQgPSBmdW5jdGlvbihoZXgxLCBoZXgyLCBpbnRlbnNpdHkpIHtcclxuICAgIFRIUkVFLkhlbWlzcGhlcmVMaWdodC5jYWxsKHRoaXMsIGhleDEsIGhleDIsIGludGVuc2l0eSk7XHJcbiAgICB0aGlzLmZvcmNlID0gbmV3IEZvcmNlMygpO1xyXG4gIH07XHJcbiAgRm9yY2VIZW1pc3BoZXJlTGlnaHQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUSFJFRS5IZW1pc3BoZXJlTGlnaHQucHJvdG90eXBlKTtcclxuICBGb3JjZUhlbWlzcGhlcmVMaWdodC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBGb3JjZUhlbWlzcGhlcmVMaWdodDtcclxuICBGb3JjZUhlbWlzcGhlcmVMaWdodC5wcm90b3R5cGUudXBkYXRlUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucG9zaXRpb24uY29weSh0aGlzLmZvcmNlLnZlbG9jaXR5KTtcclxuICB9O1xyXG4gIEZvcmNlSGVtaXNwaGVyZUxpZ2h0LnByb3RvdHlwZS5zZXRQb3NpdGlvblNwaGVyaWNhbCA9IGZ1bmN0aW9uKHJhZDEsIHJhZDIsIHJhbmdlKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkoVXRpbC5nZXRQb2xhckNvb3JkKHJhZDEsIHJhZDIsIHJhbmdlKSk7XHJcbiAgfTtcclxuICByZXR1cm4gRm9yY2VIZW1pc3BoZXJlTGlnaHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIEZvcmNlUG9pbnRMaWdodCA9IGZ1bmN0aW9uKGhleCwgaW50ZW5zaXR5LCBkaXN0YW5jZSwgZGVjYXkpIHtcclxuICAgIFRIUkVFLlBvaW50TGlnaHQuY2FsbCh0aGlzLCBoZXgsIGludGVuc2l0eSwgZGlzdGFuY2UsIGRlY2F5KTtcclxuICAgIHRoaXMuZm9yY2UgPSBuZXcgRm9yY2UzKCk7XHJcbiAgfTtcclxuICBGb3JjZVBvaW50TGlnaHQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShUSFJFRS5Qb2ludExpZ2h0LnByb3RvdHlwZSk7XHJcbiAgRm9yY2VQb2ludExpZ2h0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEZvcmNlUG9pbnRMaWdodDtcclxuICBGb3JjZVBvaW50TGlnaHQucHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkodGhpcy5mb3JjZS52ZWxvY2l0eSk7XHJcbiAgfTtcclxuICBGb3JjZVBvaW50TGlnaHQucHJvdG90eXBlLnNldFBvbGFyQ29vcmQgPSBmdW5jdGlvbihyYWQxLCByYWQyLCByYW5nZSkge1xyXG4gICAgdGhpcy5wb3NpdGlvbi5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChyYWQxLCByYWQyLCByYW5nZSkpO1xyXG4gIH07XHJcbiAgcmV0dXJuIEZvcmNlUG9pbnRMaWdodDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2l6ZSA9IDA7XHJcbiAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgdGhpcy5pc19hY3RpdmUgPSBmYWxzZTtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgTW92ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBNb3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNb3ZlcjtcclxuICBNb3Zlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgdGhpcy5hbmNob3IgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLnNldCgwLCAwLCAwKTtcclxuICAgIHRoaXMudGltZSA9IDA7XHJcbiAgfTtcclxuICBNb3Zlci5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuaXNfYWN0aXZlID0gdHJ1ZTtcclxuICB9O1xyXG4gIE1vdmVyLnByb3RvdHlwZS5pbmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmlzX2FjdGl2ZSA9IGZhbHNlO1xyXG4gIH07XHJcbiAgcmV0dXJuIE1vdmVyO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsIlxyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBQaHlzaWNzUmVuZGVyZXIgPSBmdW5jdGlvbihsZW5ndGgpIHtcclxuICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb25fc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICAgIHRoaXMudmVsb2NpdHlfc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCAxLCAxLCAxMDAwKTtcclxuICAgIHRoaXMub3B0aW9uID0ge1xyXG4gICAgICB0eXBlOiBUSFJFRS5GbG9hdFR5cGUsXHJcbiAgICB9O1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24gPSBbXHJcbiAgICAgIG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldChsZW5ndGgsIGxlbmd0aCwgdGhpcy5vcHRpb24pLFxyXG4gICAgICBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQobGVuZ3RoLCBsZW5ndGgsIHRoaXMub3B0aW9uKSxcclxuICAgIF07XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gW1xyXG4gICAgICBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQobGVuZ3RoLCBsZW5ndGgsIHRoaXMub3B0aW9uKSxcclxuICAgICAgbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KGxlbmd0aCwgbGVuZ3RoLCB0aGlzLm9wdGlvbiksXHJcbiAgICBdO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb25fbWVzaCA9IHRoaXMuY3JlYXRlTWVzaChcclxuICAgICAgXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgdmVjMiB2VXY7XFxyXFxuXFxyXFxudm9pZCBtYWluKHZvaWQpIHtcXHJcXG4gIHZVdiA9IHV2O1xcclxcbiAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbn1cXHJcXG5cIixcclxuICAgICAgXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHZlbG9jaXR5O1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIGFjY2VsZXJhdGlvbjtcXHJcXG51bmlmb3JtIHZlYzIgYW5jaG9yO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMiB2VXY7XFxyXFxuXFxyXFxuI2RlZmluZSBQUkVDSVNJT04gMC4wMDAwMDFcXHJcXG5cXHJcXG52ZWMzIGRyYWcodmVjMyBhLCBmbG9hdCB2YWx1ZSkge1xcclxcbiAgcmV0dXJuIG5vcm1hbGl6ZShhICogLTEuMCArIFBSRUNJU0lPTikgKiBsZW5ndGgoYSkgKiB2YWx1ZTtcXHJcXG59XFxyXFxuXFxyXFxudmVjMyBob29rKHZlYzMgdiwgdmVjMyBhbmNob3IsIGZsb2F0IHJlc3RfbGVuZ3RoLCBmbG9hdCBrKSB7XFxyXFxuICByZXR1cm4gbm9ybWFsaXplKHYgLSBhbmNob3IgKyBQUkVDSVNJT04pICogKC0xLjAgKiBrICogKGxlbmd0aCh2IC0gYW5jaG9yKSAtIHJlc3RfbGVuZ3RoKSk7XFxyXFxufVxcclxcblxcclxcbnZlYzMgYXR0cmFjdCh2ZWMzIHYxLCB2ZWMzIHYyLCBmbG9hdCBtMSwgZmxvYXQgbTIsIGZsb2F0IGcpIHtcXHJcXG4gIHJldHVybiBnICogbTEgKiBtMiAvIHBvdyhjbGFtcChsZW5ndGgodjIgLSB2MSksIDUuMCwgMzAuMCksIDIuMCkgKiBub3JtYWxpemUodjIgLSB2MSArIFBSRUNJU0lPTik7XFxyXFxufVxcclxcblxcclxcbnZvaWQgbWFpbih2b2lkKSB7XFxyXFxuICB2ZWMzIHYgPSB0ZXh0dXJlMkQodmVsb2NpdHksIHZVdikueHl6O1xcclxcbiAgdmVjMyBhID0gdGV4dHVyZTJEKGFjY2VsZXJhdGlvbiwgdlV2KS54eXo7XFxyXFxuICB2ZWMzIGEyID0gYSArIGF0dHJhY3QodiwgdmVjMyhhbmNob3IueCAqIDgwLjAsIGFuY2hvci55ICogODAuMCwgMC4wKSwgMS4wLCAxLjAsIDEwLjApO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChhMiwgMS4wKTtcXHJcXG59XFxyXFxuXCJcclxuICAgICk7XHJcbiAgICB0aGlzLnZlbG9jaXR5X21lc2ggPSB0aGlzLmNyZWF0ZU1lc2goXHJcbiAgICAgIFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbnZvaWQgbWFpbih2b2lkKSB7XFxyXFxuICB2VXYgPSB1djtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdmVsb2NpdHk7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgYWNjZWxlcmF0aW9uO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMiB2VXY7XFxyXFxuXFxyXFxudm9pZCBtYWluKHZvaWQpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQodGV4dHVyZTJEKGFjY2VsZXJhdGlvbiwgdlV2KS54eXogKyB0ZXh0dXJlMkQodmVsb2NpdHksIHZVdikueHl6LCAxLjApO1xcclxcbn1cXHJcXG5cIlxyXG4gICAgKTtcclxuICAgIHRoaXMudGFyZ2V0X2luZGV4ID0gMDtcclxuICB9O1xyXG4gIFBoeXNpY3NSZW5kZXJlci5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihyZW5kZXJlciwgdmVsb2NpdHlfYXJyYXkpIHtcclxuICAgICAgdmFyIGFjY2VsZXJhdGlvbl9pbml0X21lc2ggPSBuZXcgVEhSRUUuTWVzaChcclxuICAgICAgICBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeSgyLCAyKSxcclxuICAgICAgICBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICAgICAgdmVydGV4U2hhZGVyOiAndm9pZCBtYWluKHZvaWQpIHtnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDEuMCk7fScsXHJcbiAgICAgICAgICBmcmFnbWVudFNoYWRlcjogJ3ZvaWQgbWFpbih2b2lkKSB7Z2xfRnJhZ0NvbG9yID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO30nLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcbiAgICAgIHZhciB2ZWxvY2l0eV9pbml0X3RleCA9IG5ldyBUSFJFRS5EYXRhVGV4dHVyZSh2ZWxvY2l0eV9hcnJheSwgdGhpcy5sZW5ndGgsIHRoaXMubGVuZ3RoLCBUSFJFRS5SR0JGb3JtYXQsIFRIUkVFLkZsb2F0VHlwZSk7XHJcbiAgICAgIHZlbG9jaXR5X2luaXRfdGV4Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgdmFyIHZlbG9jaXR5X2luaXRfbWVzaCA9IG5ldyBUSFJFRS5NZXNoKFxyXG4gICAgICAgIG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KDIsIDIpLFxyXG4gICAgICAgIG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgICAgICB2ZWxvY2l0eToge1xyXG4gICAgICAgICAgICAgIHR5cGU6ICd0JyxcclxuICAgICAgICAgICAgICB2YWx1ZTogdmVsb2NpdHlfaW5pdF90ZXgsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdmVydGV4U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMyIHZVdjtcXHJcXG5cXHJcXG52b2lkIG1haW4odm9pZCkge1xcclxcbiAgdlV2ID0gdXY7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxufVxcclxcblwiLFxyXG4gICAgICAgICAgZnJhZ21lbnRTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIHNhbXBsZXIyRCB2ZWxvY2l0eTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzIgdlV2O1xcclxcblxcclxcbnZvaWQgbWFpbih2b2lkKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodmVsb2NpdHksIHZVdik7XFxyXFxufVxcclxcblwiLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbl9zY2VuZS5hZGQodGhpcy5jYW1lcmEpO1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbl9zY2VuZS5hZGQoYWNjZWxlcmF0aW9uX2luaXRfbWVzaCk7XHJcbiAgICAgIHJlbmRlcmVyLnJlbmRlcih0aGlzLmFjY2VsZXJhdGlvbl9zY2VuZSwgdGhpcy5jYW1lcmEsIHRoaXMuYWNjZWxlcmF0aW9uWzBdKTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMuYWNjZWxlcmF0aW9uX3NjZW5lLCB0aGlzLmNhbWVyYSwgdGhpcy5hY2NlbGVyYXRpb25bMV0pO1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvbl9zY2VuZS5yZW1vdmUoYWNjZWxlcmF0aW9uX2luaXRfbWVzaCk7XHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uX3NjZW5lLmFkZCh0aGlzLmFjY2VsZXJhdGlvbl9tZXNoKTtcclxuXHJcbiAgICAgIHRoaXMudmVsb2NpdHlfc2NlbmUuYWRkKHRoaXMuY2FtZXJhKTtcclxuICAgICAgdGhpcy52ZWxvY2l0eV9zY2VuZS5hZGQodmVsb2NpdHlfaW5pdF9tZXNoKTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMudmVsb2NpdHlfc2NlbmUsIHRoaXMuY2FtZXJhLCB0aGlzLnZlbG9jaXR5WzBdKTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMudmVsb2NpdHlfc2NlbmUsIHRoaXMuY2FtZXJhLCB0aGlzLnZlbG9jaXR5WzFdKTtcclxuICAgICAgdGhpcy52ZWxvY2l0eV9zY2VuZS5yZW1vdmUodmVsb2NpdHlfaW5pdF9tZXNoKTtcclxuICAgICAgdGhpcy52ZWxvY2l0eV9zY2VuZS5hZGQodGhpcy52ZWxvY2l0eV9tZXNoKTtcclxuICAgIH0sXHJcbiAgICBjcmVhdGVNZXNoOiBmdW5jdGlvbih2cywgZnMpIHtcclxuICAgICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKFxyXG4gICAgICAgIG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KDIsIDIpLFxyXG4gICAgICAgIG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ3YyJyxcclxuICAgICAgICAgICAgICB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHZlbG9jaXR5OiB7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ3QnLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhY2NlbGVyYXRpb246IHtcclxuICAgICAgICAgICAgICB0eXBlOiAndCcsXHJcbiAgICAgICAgICAgICAgdmFsdWU6IG51bGwsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdmVydGV4U2hhZGVyOiB2cyxcclxuICAgICAgICAgIGZyYWdtZW50U2hhZGVyOiBmcyxcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24ocmVuZGVyZXIpIHtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25fbWVzaC5tYXRlcmlhbC51bmlmb3Jtcy5hY2NlbGVyYXRpb24udmFsdWUgPSB0aGlzLmFjY2VsZXJhdGlvbltNYXRoLmFicyh0aGlzLnRhcmdldF9pbmRleCAtIDEpXTtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25fbWVzaC5tYXRlcmlhbC51bmlmb3Jtcy52ZWxvY2l0eS52YWx1ZSA9IHRoaXMudmVsb2NpdHlbdGhpcy50YXJnZXRfaW5kZXhdO1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIodGhpcy5hY2NlbGVyYXRpb25fc2NlbmUsIHRoaXMuY2FtZXJhLCB0aGlzLmFjY2VsZXJhdGlvblt0aGlzLnRhcmdldF9pbmRleF0pO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5X21lc2gubWF0ZXJpYWwudW5pZm9ybXMuYWNjZWxlcmF0aW9uLnZhbHVlID0gdGhpcy5hY2NlbGVyYXRpb25bdGhpcy50YXJnZXRfaW5kZXhdO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5X21lc2gubWF0ZXJpYWwudW5pZm9ybXMudmVsb2NpdHkudmFsdWUgPSB0aGlzLnZlbG9jaXR5W3RoaXMudGFyZ2V0X2luZGV4XTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMudmVsb2NpdHlfc2NlbmUsIHRoaXMuY2FtZXJhLCB0aGlzLnZlbG9jaXR5W01hdGguYWJzKHRoaXMudGFyZ2V0X2luZGV4IC0gMSldKTtcclxuICAgICAgdGhpcy50YXJnZXRfaW5kZXggPSBNYXRoLmFicyh0aGlzLnRhcmdldF9pbmRleCAtIDEpO1xyXG4gICAgfSxcclxuICAgIGdldEN1cnJlbnRWZWxvY2l0eTogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnZlbG9jaXR5W01hdGguYWJzKHRoaXMudGFyZ2V0X2luZGV4IC0gMSldO1xyXG4gICAgfSxcclxuICAgIHJlc2l6ZTogZnVuY3Rpb24obGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5WzBdLnNldFNpemUobGVuZ3RoLCBsZW5ndGgpO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5WzFdLnNldFNpemUobGVuZ3RoLCBsZW5ndGgpO1xyXG4gICAgICB0aGlzLmFjY2VsZXJhdGlvblswXS5zZXRTaXplKGxlbmd0aCwgbGVuZ3RoKTtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25bMV0uc2V0U2l6ZShsZW5ndGgsIGxlbmd0aCk7XHJcbiAgICB9LFxyXG4gIH07XHJcbiAgcmV0dXJuIFBoeXNpY3NSZW5kZXJlcjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgUG9pbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICB0aGlzLm1hdGVyaWFsID0gbnVsbDtcclxuICAgIHRoaXMub2JqID0gbnVsbDtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgUG9pbnRzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgUG9pbnRzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvaW50cztcclxuICBQb2ludHMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihwYXJhbSkge1xyXG4gICAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgY29sb3I6IHsgdHlwZTogJ2MnLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKDB4ZmZmZmZmKSB9LFxyXG4gICAgICAgIHRleHR1cmU6IHsgdHlwZTogJ3QnLCB2YWx1ZTogcGFyYW0udGV4dHVyZSB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogcGFyYW0udnMsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBwYXJhbS5mcyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxyXG4gICAgICBibGVuZGluZzogcGFyYW0uYmxlbmRpbmdcclxuICAgIH0pO1xyXG4gICAgdGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwYXJhbS5wb3NpdGlvbnMsIDMpKTtcclxuICAgIHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdjdXN0b21Db2xvcicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocGFyYW0uY29sb3JzLCAzKSk7XHJcbiAgICB0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgndmVydGV4T3BhY2l0eScsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocGFyYW0ub3BhY2l0aWVzLCAxKSk7XHJcbiAgICB0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnc2l6ZScsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocGFyYW0uc2l6ZXMsIDEpKTtcclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLlBvaW50cyh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICAgIHBhcmFtLnNjZW5lLmFkZCh0aGlzLm9iaik7XHJcbiAgfTtcclxuICBQb2ludHMucHJvdG90eXBlLnVwZGF0ZVBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5vYmoucG9zaXRpb24uY29weSh0aGlzLnZlbG9jaXR5KTtcclxuICAgIHRoaXMub2JqLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24ubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5vYmouZ2VvbWV0cnkuYXR0cmlidXRlcy52ZXJ0ZXhPcGFjaXR5Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMub2JqLmdlb21ldHJ5LmF0dHJpYnV0ZXMuc2l6ZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB0aGlzLm9iai5nZW9tZXRyeS5hdHRyaWJ1dGVzLmN1c3RvbUNvbG9yLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICB9O1xyXG4gIHJldHVybiBQb2ludHM7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIGV4cG9ydHMgPSB7XHJcbiAgZ2V0UmFuZG9tSW50OiBmdW5jdGlvbihtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xyXG4gIH0sXHJcbiAgZ2V0RGVncmVlOiBmdW5jdGlvbihyYWRpYW4pIHtcclxuICAgIHJldHVybiByYWRpYW4gLyBNYXRoLlBJICogMTgwO1xyXG4gIH0sXHJcbiAgZ2V0UmFkaWFuOiBmdW5jdGlvbihkZWdyZWVzKSB7XHJcbiAgICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XHJcbiAgfSxcclxuICBnZXRQb2xhckNvb3JkOiBmdW5jdGlvbihyYWQxLCByYWQyLCByKSB7XHJcbiAgICB2YXIgeCA9IE1hdGguY29zKHJhZDEpICogTWF0aC5jb3MocmFkMikgKiByO1xyXG4gICAgdmFyIHogPSBNYXRoLmNvcyhyYWQxKSAqIE1hdGguc2luKHJhZDIpICogcjtcclxuICAgIHZhciB5ID0gTWF0aC5zaW4ocmFkMSkgKiByO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IzKHgsIHksIHopO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cztcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBbXHJcbiAge1xyXG4gICAgbmFtZTogJ2F0dHJhY3QnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2F0dHJhY3QnKSxcclxuICAgIHBvc3RlZDogJzIwMTYuNi4xMycsXHJcbiAgICB1cGRhdGU6ICcnLFxyXG4gICAgZGVzY3JpcHRpb246ICd1c2UgZnJhZ21lbnQgc2hhZGVyIHRvIHBlcnRpY2xlIG1vdmluZy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2hvbGUnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2hvbGUnKSxcclxuICAgIHBvc3RlZDogJzIwMTYuNS4xMCcsXHJcbiAgICB1cGRhdGU6ICcnLFxyXG4gICAgZGVzY3JpcHRpb246ICdzdHVkeSBvZiBQb3N0IEVmZmVjdCB0aGF0IHVzZWQgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQuJyxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6ICdtZXRhbCBjdWJlJyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9tZXRhbF9jdWJlJyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE2LjQuMjEnLFxyXG4gICAgdXBkYXRlOiAnJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnc3R1ZHkgb2YgcmF5bWFyY2hpbmcgdXNpbmcgdGhyZWUuanMuJyxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6ICdkaXN0b3J0JyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9kaXN0b3J0JyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE2LjIuMjMnLFxyXG4gICAgdXBkYXRlOiAnMjAxNi41LjEwJyxcclxuICAgIGRlc2NyaXB0aW9uOiAndXNpbmcgdGhlIHNpbXBsZXggbm9pc2UsIGRpc3RvcnQgdGhlIHNwaGVyZS4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2ltYWdlIGRhdGEnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2ltYWdlX2RhdGEnKSxcclxuICAgIHBvc3RlZDogJzIwMTUuMTIuOScsXHJcbiAgICB1cGRhdGU6ICcyMDE1LjEyLjEyJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnUG9pbnRzIGJhc2VkIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC5nZXRJbWFnZURhdGEoKScsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnZ2FsbGVyeScsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvZ2FsbGVyeScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMi4yJyxcclxuICAgIHVwZGF0ZTogJzIwMTUuMTIuOScsXHJcbiAgICBkZXNjcmlwdGlvbjogJ2ltYWdlIGdhbGxlcnkgb24gM2QuIHRlc3RlZCB0aGF0IHBpY2tlZCBvYmplY3QgYW5kIG1vdmluZyBjYW1lcmEuJyxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6ICdjb21ldCcsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvY29tZXQnKSxcclxuICAgIHBvc3RlZDogJzIwMTUuMTEuMjQnLFxyXG4gICAgdXBkYXRlOiAnMjAxNi4xLjgnLFxyXG4gICAgZGVzY3JpcHRpb246ICdjYW1lcmEgdG8gdHJhY2sgdGhlIG1vdmluZyBwb2ludHMuJyxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6ICdoeXBlciBzcGFjZScsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvaHlwZXJfc3BhY2UnKSxcclxuICAgIHBvc3RlZDogJzIwMTUuMTEuMTInLFxyXG4gICAgdXBkYXRlOiAnJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnYWRkIGxpdHRsZSBjaGFuZ2UgYWJvdXQgY2FtZXJhIGFuZ2xlIGFuZCBwYXJ0aWNsZSBjb250cm9sZXMuJyxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6ICdmaXJlIGJhbGwnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2ZpcmVfYmFsbCcpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMS4xMicsXHJcbiAgICB1cGRhdGU6ICcnLFxyXG4gICAgZGVzY3JpcHRpb246ICd0ZXN0IG9mIHNpbXBsZSBwaHlzaWNzIGFuZCBhZGRpdGl2ZSBibGVuZGluZy4nLFxyXG4gIH1cclxuXTtcclxuIiwiXHJcbnZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBQaHlzaWNzUmVuZGVyZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BoeXNpY3NfcmVuZGVyZXInKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhLCByZW5kZXJlcik7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGxlbmd0aCA9IDEwMDA7XHJcbiAgdmFyIHBoeXNpY3NfcmVuZGVyZXIgPSBudWxsO1xyXG5cclxuICB2YXIgY3JlYXRlUG9pbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIHZhciB2ZXJ0aWNlc19iYXNlID0gW107XHJcbiAgICB2YXIgdXZzX2Jhc2UgPSBbXTtcclxuICAgIHZhciBjb2xvcnNfYmFzZSA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBNYXRoLnBvdyhsZW5ndGgsIDIpOyBpKyspIHtcclxuICAgICAgdmVydGljZXNfYmFzZS5wdXNoKDAsIDAsIDApO1xyXG4gICAgICB1dnNfYmFzZS5wdXNoKFxyXG4gICAgICAgIGkgJSBsZW5ndGggKiAoMSAvIChsZW5ndGggLSAxKSksXHJcbiAgICAgICAgTWF0aC5mbG9vcihpIC8gbGVuZ3RoKSAqICgxIC8gKGxlbmd0aCAtIDEpKVxyXG4gICAgICApO1xyXG4gICAgICBjb2xvcnNfYmFzZS5wdXNoKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDkwKSAvIDM2MCwgMC44LCAxKTtcclxuICAgIH1cclxuICAgIHZhciB2ZXJ0aWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXNfYmFzZSk7XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh2ZXJ0aWNlcywgMykpO1xyXG4gICAgdmFyIHV2cyA9IG5ldyBGbG9hdDMyQXJyYXkodXZzX2Jhc2UpO1xyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCd1djInLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHV2cywgMikpO1xyXG4gICAgdmFyIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoY29sb3JzX2Jhc2UpO1xyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdjb2xvcicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoY29sb3JzLCAzKSk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdmVsb2NpdHk6IHtcclxuICAgICAgICAgIHR5cGU6ICd0JyxcclxuICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuVGV4dHVyZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMiB1djI7XFxyXFxuYXR0cmlidXRlIHZlYzMgY29sb3I7XFxyXFxuXFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdmVsb2NpdHk7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG5cXHJcXG52b2lkIG1haW4odm9pZCkge1xcclxcbiAgdmVjNCB1cGRhdGVfcG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB0ZXh0dXJlMkQodmVsb2NpdHksIHV2Mik7XFxyXFxuICB2Q29sb3IgPSBjb2xvcjtcXHJcXG4gIGdsX1BvaW50U2l6ZSA9IDEuMDtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIHVwZGF0ZV9wb3NpdGlvbjtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG5cXHJcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxyXFxuXFxyXFxudmVjMyBoc3YycmdiXzFfMCh2ZWMzIGMpe1xcclxcbiAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xcclxcbiAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xcclxcbiAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XFxyXFxufVxcclxcblxcblxcblxcclxcbnZvaWQgbWFpbih2b2lkKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGhzdjJyZ2JfMV8wKHZlYzModkNvbG9yLnggKyB0aW1lIC8gMzYwMC4wLCB2Q29sb3IueXopKSwgMC41KTtcXHJcXG59XFxyXFxuXCIsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxyXG4gICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcclxuICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfVxyXG4gIHZhciBwb2ludHMgPSBjcmVhdGVQb2ludHMoKTtcclxuXHJcbiAgdmFyIGNyZWF0ZVBvaW50c0ludFZlbG9jaXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdmVydGljZXMgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgTWF0aC5wb3cobGVuZ3RoLCAyKTsgaSsrKSB7XHJcbiAgICAgIHZhciB2ID0gVXRpbC5nZXRQb2xhckNvb3JkKFxyXG4gICAgICAgIFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpLFxyXG4gICAgICAgIFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpLFxyXG4gICAgICAgIFV0aWwuZ2V0UmFuZG9tSW50KDEwLCAyMClcclxuICAgICAgKTtcclxuICAgICAgdmVydGljZXMucHVzaCh2LngsIHYueSwgdi56KTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKTtcclxuICB9XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcikge1xyXG4gICAgICBwaHlzaWNzX3JlbmRlcmVyID0gbmV3IFBoeXNpY3NSZW5kZXJlcihsZW5ndGgpO1xyXG4gICAgICBwaHlzaWNzX3JlbmRlcmVyLmluaXQocmVuZGVyZXIsIGNyZWF0ZVBvaW50c0ludFZlbG9jaXR5KCkpO1xyXG4gICAgICBwaHlzaWNzX3JlbmRlcmVyLmFjY2VsZXJhdGlvbl9tZXNoLm1hdGVyaWFsLnVuaWZvcm1zLmFuY2hvciA9IHtcclxuICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMigpLFxyXG4gICAgICB9XHJcbiAgICAgIHNjZW5lLmFkZChwb2ludHMpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgwLCAwLCA2MDApO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cyk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcikge1xyXG4gICAgICBwaHlzaWNzX3JlbmRlcmVyLnJlbmRlcihyZW5kZXJlcik7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlKys7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC51bmlmb3Jtcy52ZWxvY2l0eS52YWx1ZSA9IHBoeXNpY3NfcmVuZGVyZXIuZ2V0Q3VycmVudFZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4wMjUpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlTG9vaygpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIHBoeXNpY3NfcmVuZGVyZXIuYWNjZWxlcmF0aW9uX21lc2gubWF0ZXJpYWwudW5pZm9ybXMuYW5jaG9yLnZhbHVlLmNvcHkodmVjdG9yX21vdXNlX21vdmUpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcGh5c2ljc19yZW5kZXJlci5hY2NlbGVyYXRpb25fbWVzaC5tYXRlcmlhbC51bmlmb3Jtcy5hbmNob3IudmFsdWUuc2V0KDAsIDAsIDApO1xyXG4gICAgfSxcclxuICAgIHJlc2l6ZVdpbmRvdzogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMiA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UyJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbW92ZXInKTtcclxudmFyIFBvaW50cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRzLmpzJyk7XHJcbnZhciBGb3JjZUhlbWlzcGhlcmVMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2VfaGVtaXNwaGVyZV9saWdodCcpO1xyXG52YXIgRm9yY2VQb2ludExpZ2h0ID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZV9wb2ludF9saWdodCcpO1xyXG5cclxudmFyIHZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGN1c3RvbUNvbG9yO1xcclxcbmF0dHJpYnV0ZSBmbG9hdCB2ZXJ0ZXhPcGFjaXR5O1xcclxcbmF0dHJpYnV0ZSBmbG9hdCBzaXplO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2Q29sb3IgPSBjdXN0b21Db2xvcjtcXHJcXG4gIGZPcGFjaXR5ID0gdmVydGV4T3BhY2l0eTtcXHJcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxuICBnbF9Qb2ludFNpemUgPSBzaXplICogKDMwMC4wIC8gbGVuZ3RoKG12UG9zaXRpb24ueHl6KSk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gdmVjMyBjb2xvcjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yICogdkNvbG9yLCBmT3BhY2l0eSk7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSBnbF9GcmFnQ29sb3IgKiB0ZXh0dXJlMkQodGV4dHVyZSwgZ2xfUG9pbnRDb29yZCk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuICB2YXIgbW92ZXJzX251bSA9IDEwMDAwO1xyXG4gIHZhciBtb3ZlcnMgPSBbXTtcclxuICB2YXIgbW92ZXJfYWN0aXZhdGVfY291bnQgPSAyO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIGhlbWlfbGlnaHQgPSBudWxsO1xyXG4gIHZhciBjb21ldF9saWdodDEgPSBudWxsO1xyXG4gIHZhciBjb21ldF9saWdodDIgPSBudWxsO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIHNpemVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgY29tZXQgPSBudWxsO1xyXG4gIHZhciBjb21ldF9yYWRpdXMgPSAzMDtcclxuICB2YXIgY29tZXRfc2NhbGUgPSBuZXcgRm9yY2UyKCk7XHJcbiAgdmFyIGNvbWV0X2NvbG9yX2ggPSAxNDA7XHJcbiAgdmFyIGNvbG9yX2RpZmYgPSA0NTtcclxuICB2YXIgcGxhbmV0ID0gbnVsbDtcclxuICB2YXIgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICB2YXIgbGFzdF90aW1lX3BsdXNfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gIHZhciBsYXN0X3RpbWVfYm91bmNlID0gRGF0ZS5ub3coKTtcclxuICB2YXIgbGFzdF90aW1lX3RvdWNoID0gRGF0ZS5ub3coKTtcclxuICB2YXIgcGx1c19hY2NlbGVyYXRpb24gPSAwO1xyXG4gIHZhciBpc190b3VjaGVkID0gZmFsc2U7XHJcbiAgdmFyIGlzX3BsdXNfYWN0aXZhdGUgPSBmYWxzZTtcclxuICB2YXIgdHJhY2tfcG9pbnRzID0gdHJ1ZTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgIHZhciBwb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIHtcclxuICAgICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMSk7XHJcbiAgICAgICAgbW92ZXIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgICBpZiAobW92ZXIudGltZSA+IDEwKSB7XHJcbiAgICAgICAgICBtb3Zlci5zaXplIC09IDI7XHJcbiAgICAgICAgICAvL21vdmVyLmEgLT0gMC4wNDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vdmVyLnNpemUgPD0gMCkge1xyXG4gICAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XHJcbiAgICAgICAgICBtb3Zlci50aW1lID0gMDtcclxuICAgICAgICAgIG1vdmVyLmEgPSAwLjA7XHJcbiAgICAgICAgICBtb3Zlci5pbmFjdGl2YXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIudmVsb2NpdHkueCAtIHBvaW50cy52ZWxvY2l0eS54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnZlbG9jaXR5LnkgLSBwb2ludHMudmVsb2NpdHkueTtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci52ZWxvY2l0eS56IC0gcG9pbnRzLnZlbG9jaXR5Lno7XHJcbiAgICAgIGNvbG9yc1tpICogMyArIDBdID0gbW92ZXIuY29sb3IucjtcclxuICAgICAgY29sb3JzW2kgKiAzICsgMV0gPSBtb3Zlci5jb2xvci5nO1xyXG4gICAgICBjb2xvcnNbaSAqIDMgKyAyXSA9IG1vdmVyLmNvbG9yLmI7XHJcbiAgICAgIG9wYWNpdGllc1tpXSA9IG1vdmVyLmE7XHJcbiAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgIH1cclxuICAgIHBvaW50cy51cGRhdGVQb2ludHMoKTtcclxuICB9O1xyXG5cclxuICB2YXIgYWN0aXZhdGVNb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvdW50ID0gMDtcclxuICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgaWYgKG5vdyAtIGxhc3RfdGltZV9hY3RpdmF0ZSA+IDEwKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIGNvbnRpbnVlO1xyXG4gICAgICAgIHZhciByYWQxID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgICAgdmFyIHJhZDIgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgICB2YXIgcmFuZ2UgPSBVdGlsLmdldFJhbmRvbUludCgxLCAzMCk7XHJcbiAgICAgICAgdmFyIHZlY3RvciA9IFV0aWwuZ2V0UG9sYXJDb29yZChyYWQxLCByYWQyLCByYW5nZSk7XHJcbiAgICAgICAgdmFyIGZvcmNlID0gVXRpbC5nZXRQb2xhckNvb3JkKHJhZDEsIHJhZDIsIHJhbmdlIC8gMjApO1xyXG4gICAgICAgIHZhciBoID0gVXRpbC5nZXRSYW5kb21JbnQoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYsIGNvbWV0X2NvbG9yX2ggKyBjb2xvcl9kaWZmKSAtIHBsdXNfYWNjZWxlcmF0aW9uIC8gMS41O1xyXG4gICAgICAgIHZhciBzID0gVXRpbC5nZXRSYW5kb21JbnQoNjAsIDgwKTtcclxuICAgICAgICB2ZWN0b3IuYWRkKHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgICAgbW92ZXIuYWN0aXZhdGUoKTtcclxuICAgICAgICBtb3Zlci5pbml0KHZlY3Rvcik7XHJcbiAgICAgICAgbW92ZXIuY29sb3Iuc2V0SFNMKGggLyAzNjAsIHMgLyAxMDAsIDAuNyk7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgICAgICAgbW92ZXIuYSA9IDE7XHJcbiAgICAgICAgbW92ZXIuc2l6ZSA9IDI1O1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgaWYgKGNvdW50ID49IG1vdmVyX2FjdGl2YXRlX2NvdW50KSBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciByb3RhdGVDb21ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29tZXQucm90YXRpb24ueCArPSAwLjAzICsgcGx1c19hY2NlbGVyYXRpb24gLyAxMDAwO1xyXG4gICAgY29tZXQucm90YXRpb24ueSArPSAwLjAxICsgcGx1c19hY2NlbGVyYXRpb24gLyAxMDAwO1xyXG4gICAgY29tZXQucm90YXRpb24ueiArPSAwLjAxICsgcGx1c19hY2NlbGVyYXRpb24gLyAxMDAwO1xyXG4gICAgcG9pbnRzLnJhZDFfYmFzZSArPSBVdGlsLmdldFJhZGlhbiguNik7XHJcbiAgICBwb2ludHMucmFkMSA9IFV0aWwuZ2V0UmFkaWFuKE1hdGguc2luKHBvaW50cy5yYWQxX2Jhc2UpICogNDUgKyBwbHVzX2FjY2VsZXJhdGlvbiAvIDEwMCk7XHJcbiAgICBwb2ludHMucmFkMiArPSBVdGlsLmdldFJhZGlhbigwLjggKyBwbHVzX2FjY2VsZXJhdGlvbiAvIDEwMCk7XHJcbiAgICBwb2ludHMucmFkMyArPSAwLjAxO1xyXG4gICAgcmV0dXJuIFV0aWwuZ2V0UG9sYXJDb29yZChwb2ludHMucmFkMSwgcG9pbnRzLnJhZDIsIDM1MCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIHJvdGF0ZUNvbWV0Q29sb3IgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciByYWRpdXMgPSBjb21ldF9yYWRpdXMgKiAwLjg7XHJcbiAgICBjb21ldF9saWdodDEucG9zaXRpb24uY29weShVdGlsLmdldFBvbGFyQ29vcmQoVXRpbC5nZXRSYWRpYW4oMCksICBVdGlsLmdldFJhZGlhbigwKSwgcmFkaXVzKS5hZGQocG9pbnRzLnZlbG9jaXR5KSk7XHJcbiAgICBjb21ldF9saWdodDIucG9zaXRpb24uY29weShVdGlsLmdldFBvbGFyQ29vcmQoVXRpbC5nZXRSYWRpYW4oMTgwKSwgVXRpbC5nZXRSYWRpYW4oMCksIHJhZGl1cykuYWRkKHBvaW50cy52ZWxvY2l0eSkpO1xyXG4gIH07XHJcblxyXG4gIHZhciBib3VuY2VDb21ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKERhdGUubm93KCkgLSBsYXN0X3RpbWVfYm91bmNlID4gMTAwMCAtIHBsdXNfYWNjZWxlcmF0aW9uICogMykge1xyXG4gICAgICBjb21ldF9zY2FsZS5hcHBseUZvcmNlKG5ldyBUSFJFRS5WZWN0b3IyKDAuMDggKyBwbHVzX2FjY2VsZXJhdGlvbiAvIDUwMDAsIDApKTtcclxuICAgICAgbGFzdF90aW1lX2JvdW5jZSA9IERhdGUubm93KCk7XHJcbiAgICAgIGlzX3BsdXNfYWN0aXZhdGUgPSB0cnVlO1xyXG4gICAgICBsYXN0X3RpbWVfcGx1c19hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgICBpZiAoaXNfcGx1c19hY3RpdmF0ZSAmJiBEYXRlLm5vdygpIC0gbGFzdF90aW1lX3BsdXNfYWN0aXZhdGUgPCA1MDApIHtcclxuICAgICAgbW92ZXJfYWN0aXZhdGVfY291bnQgPSA2ICsgTWF0aC5mbG9vcihwbHVzX2FjY2VsZXJhdGlvbiAvIDQwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1vdmVyX2FjdGl2YXRlX2NvdW50ID0gMSArIE1hdGguZmxvb3IocGx1c19hY2NlbGVyYXRpb24gLyA0MCk7XHJcbiAgICB9XHJcbiAgICBjb21ldF9zY2FsZS5hcHBseUhvb2soMCwgMC4xKTtcclxuICAgIGNvbWV0X3NjYWxlLmFwcGx5RHJhZygwLjEyKTtcclxuICAgIGNvbWV0X3NjYWxlLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICBjb21ldC5zY2FsZS5zZXQoMSArIGNvbWV0X3NjYWxlLnZlbG9jaXR5LngsIDEgKyBjb21ldF9zY2FsZS52ZWxvY2l0eS54LCAxICsgY29tZXRfc2NhbGUudmVsb2NpdHkueCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVRleHR1cmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIHZhciBncmFkID0gbnVsbDtcclxuICAgIHZhciB0ZXh0dXJlID0gbnVsbDtcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSAyMDA7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gMjAwO1xyXG4gICAgZ3JhZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudCgxMDAsIDEwMCwgMjAsIDEwMCwgMTAwLCAxMDApO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC45LCAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMS4wLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwKScpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgICBjdHguYXJjKDEwMCwgMTAwLCAxMDAsIDAsIE1hdGguUEkgLyAxODAsIHRydWUpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuXHJcbiAgICB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzKTtcclxuICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRleHR1cmU7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZUNvbW1ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGJhc2VfZ2VvbWV0cnkgPSBuZXcgVEhSRUUuT2N0YWhlZHJvbkdlb21ldHJ5KGNvbWV0X3JhZGl1cywgMik7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIGNvbG9yOiBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgY29tZXRfY29sb3JfaCArICcsIDEwMCUsIDEwMCUpJyksXHJcbiAgICAgIHNoYWRpbmc6IFRIUkVFLkZsYXRTaGFkaW5nXHJcbiAgICB9KTtcclxuICAgIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KGJhc2VfZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoICogMyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJhc2VfZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzXSA9IGJhc2VfZ2VvbWV0cnkudmVydGljZXNbaV0ueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBiYXNlX2dlb21ldHJ5LnZlcnRpY2VzW2ldLnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gYmFzZV9nZW9tZXRyeS52ZXJ0aWNlc1tpXS56O1xyXG4gICAgfVxyXG4gICAgdmFyIGluZGljZXMgPSBuZXcgVWludDMyQXJyYXkoYmFzZV9nZW9tZXRyeS5mYWNlcy5sZW5ndGggKiAzKTtcclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgYmFzZV9nZW9tZXRyeS5mYWNlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICBpbmRpY2VzW2ogKiAzXSA9IGJhc2VfZ2VvbWV0cnkuZmFjZXNbal0uYTtcclxuICAgICAgaW5kaWNlc1tqICogMyArIDFdID0gYmFzZV9nZW9tZXRyeS5mYWNlc1tqXS5iO1xyXG4gICAgICBpbmRpY2VzW2ogKiAzICsgMl0gPSBiYXNlX2dlb21ldHJ5LmZhY2VzW2pdLmM7XHJcbiAgICB9XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbnMsIDMpKTtcclxuICAgIGdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24uZHluYW1pYyA9IHRydWU7XHJcbiAgICBnZW9tZXRyeS5zZXRJbmRleChuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKGluZGljZXMsIDEpKTtcclxuICAgIGdlb21ldHJ5LmluZGV4LmR5bmFtaWMgPSB0cnVlO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVBsYW5ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeSgyNTAsIDQpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgY29sb3I6IDB4MjIyMjIyLFxyXG4gICAgICBzaGFkaW5nOiBUSFJFRS5GbGF0U2hhZGluZ1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgYWNjZWxlcmF0ZUNvbWV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoaXNfdG91Y2hlZCAmJiBwbHVzX2FjY2VsZXJhdGlvbiA8IDIwMCkge1xyXG4gICAgICBwbHVzX2FjY2VsZXJhdGlvbiArPSAxO1xyXG4gICAgfSBlbHNlIGlmKHBsdXNfYWNjZWxlcmF0aW9uID4gMCkge1xyXG4gICAgICBwbHVzX2FjY2VsZXJhdGlvbiAtPSAxO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGNvbWV0ID0gY3JlYXRlQ29tbWV0KCk7XHJcbiAgICAgIHNjZW5lLmFkZChjb21ldCk7XHJcbiAgICAgIHBsYW5ldCA9IGNyZWF0ZVBsYW5ldCgpO1xyXG4gICAgICBzY2VuZS5hZGQocGxhbmV0KTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnNfbnVtOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgICB2YXIgaCA9IFV0aWwuZ2V0UmFuZG9tSW50KGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmLCBjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZik7XHJcbiAgICAgICAgdmFyIHMgPSBVdGlsLmdldFJhbmRvbUludCg2MCwgODApO1xyXG4gICAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoVXRpbC5nZXRSYW5kb21JbnQoLTEwMCwgMTAwKSwgMCwgMCkpO1xyXG4gICAgICAgIG1vdmVyLmNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIGggKyAnLCAnICsgcyArICclLCA3MCUpJyk7XHJcbiAgICAgICAgbW92ZXJzLnB1c2gobW92ZXIpO1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIudmVsb2NpdHkueDtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnZlbG9jaXR5Lnk7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci52ZWxvY2l0eS56O1xyXG4gICAgICAgIGNvbG9yc1tpICogMyArIDBdID0gbW92ZXIuY29sb3IucjtcclxuICAgICAgICBjb2xvcnNbaSAqIDMgKyAxXSA9IG1vdmVyLmNvbG9yLmc7XHJcbiAgICAgICAgY29sb3JzW2kgKiAzICsgMl0gPSBtb3Zlci5jb2xvci5iO1xyXG4gICAgICAgIG9wYWNpdGllc1tpXSA9IG1vdmVyLmE7XHJcbiAgICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgICB9XHJcbiAgICAgIHBvaW50cy5pbml0KHtcclxuICAgICAgICBzY2VuZTogc2NlbmUsXHJcbiAgICAgICAgdnM6IHZzLFxyXG4gICAgICAgIGZzOiBmcyxcclxuICAgICAgICBwb3NpdGlvbnM6IHBvc2l0aW9ucyxcclxuICAgICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgICBvcGFjaXRpZXM6IG9wYWNpdGllcyxcclxuICAgICAgICBzaXplczogc2l6ZXMsXHJcbiAgICAgICAgdGV4dHVyZTogY3JlYXRlVGV4dHVyZSgpLFxyXG4gICAgICAgIGJsZW5kaW5nOiBUSFJFRS5Ob3JtYWxCbGVuZGluZ1xyXG4gICAgICB9KTtcclxuICAgICAgcG9pbnRzLnJhZDEgPSAwO1xyXG4gICAgICBwb2ludHMucmFkMV9iYXNlID0gMDtcclxuICAgICAgcG9pbnRzLnJhZDIgPSAwO1xyXG4gICAgICBwb2ludHMucmFkMyA9IDA7XHJcbiAgICAgIGhlbWlfbGlnaHQgPSBuZXcgRm9yY2VIZW1pc3BoZXJlTGlnaHQoXHJcbiAgICAgICAgbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZikgKyAnLCA1MCUsIDYwJSknKS5nZXRIZXgoKSxcclxuICAgICAgICBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgKGNvbWV0X2NvbG9yX2ggKyBjb2xvcl9kaWZmKSArICcsIDUwJSwgNjAlKScpLmdldEhleCgpLFxyXG4gICAgICAgIDFcclxuICAgICAgKTtcclxuICAgICAgc2NlbmUuYWRkKGhlbWlfbGlnaHQpO1xyXG4gICAgICBjb21ldF9saWdodDEgPSBuZXcgRm9yY2VQb2ludExpZ2h0KCdoc2woJyArIChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZikgKyAnLCA2MCUsIDUwJSknLCAxLCA1MDAsIDEpO1xyXG4gICAgICBzY2VuZS5hZGQoY29tZXRfbGlnaHQxKTtcclxuICAgICAgY29tZXRfbGlnaHQyID0gbmV3IEZvcmNlUG9pbnRMaWdodCgnaHNsKCcgKyAoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYpICsgJywgNjAlLCA1MCUpJywgMSwgNTAwLCAxKTtcclxuICAgICAgc2NlbmUuYWRkKGNvbWV0X2xpZ2h0Mik7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IgPSBuZXcgVEhSRUUuVmVjdG9yMygxNTAwLCAwLCAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIGNvbWV0Lmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgY29tZXQubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoY29tZXQpO1xyXG4gICAgICBwbGFuZXQuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwbGFuZXQubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocGxhbmV0KTtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoaGVtaV9saWdodCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShjb21ldF9saWdodDEpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoY29tZXRfbGlnaHQyKTtcclxuICAgICAgbW92ZXJzID0gW107XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGFjY2VsZXJhdGVDb21ldCgpO1xyXG4gICAgICBwb2ludHMudmVsb2NpdHkgPSByb3RhdGVDb21ldCgpO1xyXG4gICAgICBpZiAodHJhY2tfcG9pbnRzID09PSB0cnVlKSB7XHJcbiAgICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5jb3B5KFxyXG4gICAgICAgICAgcG9pbnRzLnZlbG9jaXR5LmNsb25lKCkuYWRkKFxyXG4gICAgICAgICAgICBwb2ludHMudmVsb2NpdHkuY2xvbmUoKS5zdWIocG9pbnRzLm9iai5wb3NpdGlvbikubm9ybWFsaXplKCkubXVsdGlwbHlTY2FsYXIoLTQwMClcclxuICAgICAgICAgIClcclxuICAgICAgICApO1xyXG4gICAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueSArPSBwb2ludHMudmVsb2NpdHkueSAqIDI7XHJcbiAgICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYW5jaG9yLmNvcHkocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgfVxyXG4gICAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgICAgIGNvbWV0LnBvc2l0aW9uLmNvcHkocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgaGVtaV9saWdodC5jb2xvci5zZXRIU0woKGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmIC0gcGx1c19hY2NlbGVyYXRpb24gLyAxLjUpIC8gMzYwLCAwLjUsIDAuNik7XHJcbiAgICAgIGhlbWlfbGlnaHQuZ3JvdW5kQ29sb3Iuc2V0SFNMKChjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZiAtIHBsdXNfYWNjZWxlcmF0aW9uIC8gMS41KSAvIDM2MCwgMC41LCAwLjYpO1xyXG4gICAgICBjb21ldF9saWdodDEucG9zaXRpb24uY29weShwb2ludHMudmVsb2NpdHkpO1xyXG4gICAgICBjb21ldF9saWdodDEuY29sb3Iuc2V0SFNMKChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZiAtIHBsdXNfYWNjZWxlcmF0aW9uIC8gMS41KSAvIDM2MCwgMC41LCAwLjYpO1xyXG4gICAgICBjb21ldF9saWdodDIucG9zaXRpb24uY29weShwb2ludHMudmVsb2NpdHkpO1xyXG4gICAgICBjb21ldF9saWdodDIuY29sb3Iuc2V0SFNMKChjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZiAtIHBsdXNfYWNjZWxlcmF0aW9uIC8gMS41KSAvIDM2MCwgMC41LCAwLjYpO1xyXG4gICAgICBhY3RpdmF0ZU1vdmVyKCk7XHJcbiAgICAgIHVwZGF0ZU1vdmVyKCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4wMjUpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlTG9vaygpO1xyXG4gICAgICByb3RhdGVDb21ldENvbG9yKCk7XHJcbiAgICAgIGJvdW5jZUNvbWV0KCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSB0cnVlO1xyXG4gICAgICBsYXN0X3RpbWVfdG91Y2ggPSBEYXRlLm5vdygpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpIHtcclxuICAgICAgaXNfdG91Y2hlZCA9IGZhbHNlO1xyXG4gICAgICBpZiAoRGF0ZS5ub3coKSAtIGxhc3RfdGltZV90b3VjaCA8IDEwMCkge1xyXG4gICAgICAgIGlmICh0cmFja19wb2ludHMgPT09IHRydWUpIHtcclxuICAgICAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KDEyMDAsIDEyMDAsIDApO1xyXG4gICAgICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgICAgIHRyYWNrX3BvaW50cyA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0cmFja19wb2ludHMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIG1vdXNlT3V0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHRoaXMudG91Y2hFbmQoc2NlbmUsIGNhbWVyYSlcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZUNhbWVyYSA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2VfY2FtZXJhJyk7XHJcbnZhciBGb3JjZTIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMicpO1xyXG5cclxudmFyIHZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG51bmlmb3JtIGZsb2F0IHJhZGl1cztcXHJcXG51bmlmb3JtIGZsb2F0IGRpc3RvcnQ7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIHZlYzMgdk5vcm1hbDtcXHJcXG5cXHJcXG4vL1xcbi8vIERlc2NyaXB0aW9uIDogQXJyYXkgYW5kIHRleHR1cmVsZXNzIEdMU0wgMkQvM0QvNEQgc2ltcGxleFxcbi8vICAgICAgICAgICAgICAgbm9pc2UgZnVuY3Rpb25zLlxcbi8vICAgICAgQXV0aG9yIDogSWFuIE1jRXdhbiwgQXNoaW1hIEFydHMuXFxuLy8gIE1haW50YWluZXIgOiBpam1cXG4vLyAgICAgTGFzdG1vZCA6IDIwMTEwODIyIChpam0pXFxuLy8gICAgIExpY2Vuc2UgOiBDb3B5cmlnaHQgKEMpIDIwMTEgQXNoaW1hIEFydHMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXFxuLy8gICAgICAgICAgICAgICBEaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUuXFxuLy8gICAgICAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vYXNoaW1hL3dlYmdsLW5vaXNlXFxuLy9cXG5cXG52ZWMzIG1vZDI4OV8yXzAodmVjMyB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IG1vZDI4OV8yXzAodmVjNCB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IHBlcm11dGVfMl8xKHZlYzQgeCkge1xcbiAgICAgcmV0dXJuIG1vZDI4OV8yXzAoKCh4KjM0LjApKzEuMCkqeCk7XFxufVxcblxcbnZlYzQgdGF5bG9ySW52U3FydF8yXzIodmVjNCByKVxcbntcXG4gIHJldHVybiAxLjc5Mjg0MjkxNDAwMTU5IC0gMC44NTM3MzQ3MjA5NTMxNCAqIHI7XFxufVxcblxcbmZsb2F0IHNub2lzZV8yXzModmVjMyB2KVxcbiAge1xcbiAgY29uc3QgdmVjMiAgQyA9IHZlYzIoMS4wLzYuMCwgMS4wLzMuMCkgO1xcbiAgY29uc3QgdmVjNCAgRF8yXzQgPSB2ZWM0KDAuMCwgMC41LCAxLjAsIDIuMCk7XFxuXFxuLy8gRmlyc3QgY29ybmVyXFxuICB2ZWMzIGkgID0gZmxvb3IodiArIGRvdCh2LCBDLnl5eSkgKTtcXG4gIHZlYzMgeDAgPSAgIHYgLSBpICsgZG90KGksIEMueHh4KSA7XFxuXFxuLy8gT3RoZXIgY29ybmVyc1xcbiAgdmVjMyBnXzJfNSA9IHN0ZXAoeDAueXp4LCB4MC54eXopO1xcbiAgdmVjMyBsID0gMS4wIC0gZ18yXzU7XFxuICB2ZWMzIGkxID0gbWluKCBnXzJfNS54eXosIGwuenh5ICk7XFxuICB2ZWMzIGkyID0gbWF4KCBnXzJfNS54eXosIGwuenh5ICk7XFxuXFxuICAvLyAgIHgwID0geDAgLSAwLjAgKyAwLjAgKiBDLnh4eDtcXG4gIC8vICAgeDEgPSB4MCAtIGkxICArIDEuMCAqIEMueHh4O1xcbiAgLy8gICB4MiA9IHgwIC0gaTIgICsgMi4wICogQy54eHg7XFxuICAvLyAgIHgzID0geDAgLSAxLjAgKyAzLjAgKiBDLnh4eDtcXG4gIHZlYzMgeDEgPSB4MCAtIGkxICsgQy54eHg7XFxuICB2ZWMzIHgyID0geDAgLSBpMiArIEMueXl5OyAvLyAyLjAqQy54ID0gMS8zID0gQy55XFxuICB2ZWMzIHgzID0geDAgLSBEXzJfNC55eXk7ICAgICAgLy8gLTEuMCszLjAqQy54ID0gLTAuNSA9IC1ELnlcXG5cXG4vLyBQZXJtdXRhdGlvbnNcXG4gIGkgPSBtb2QyODlfMl8wKGkpO1xcbiAgdmVjNCBwID0gcGVybXV0ZV8yXzEoIHBlcm11dGVfMl8xKCBwZXJtdXRlXzJfMShcXG4gICAgICAgICAgICAgaS56ICsgdmVjNCgwLjAsIGkxLnosIGkyLnosIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnkgKyB2ZWM0KDAuMCwgaTEueSwgaTIueSwgMS4wICkpXFxuICAgICAgICAgICArIGkueCArIHZlYzQoMC4wLCBpMS54LCBpMi54LCAxLjAgKSk7XFxuXFxuLy8gR3JhZGllbnRzOiA3eDcgcG9pbnRzIG92ZXIgYSBzcXVhcmUsIG1hcHBlZCBvbnRvIGFuIG9jdGFoZWRyb24uXFxuLy8gVGhlIHJpbmcgc2l6ZSAxNyoxNyA9IDI4OSBpcyBjbG9zZSB0byBhIG11bHRpcGxlIG9mIDQ5ICg0OSo2ID0gMjk0KVxcbiAgZmxvYXQgbl8gPSAwLjE0Mjg1NzE0Mjg1NzsgLy8gMS4wLzcuMFxcbiAgdmVjMyAgbnMgPSBuXyAqIERfMl80Lnd5eiAtIERfMl80Lnh6eDtcXG5cXG4gIHZlYzQgaiA9IHAgLSA0OS4wICogZmxvb3IocCAqIG5zLnogKiBucy56KTsgIC8vICBtb2QocCw3KjcpXFxuXFxuICB2ZWM0IHhfID0gZmxvb3IoaiAqIG5zLnopO1xcbiAgdmVjNCB5XyA9IGZsb29yKGogLSA3LjAgKiB4XyApOyAgICAvLyBtb2QoaixOKVxcblxcbiAgdmVjNCB4ID0geF8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCB5ID0geV8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCBoID0gMS4wIC0gYWJzKHgpIC0gYWJzKHkpO1xcblxcbiAgdmVjNCBiMCA9IHZlYzQoIHgueHksIHkueHkgKTtcXG4gIHZlYzQgYjEgPSB2ZWM0KCB4Lnp3LCB5Lnp3ICk7XFxuXFxuICAvL3ZlYzQgczAgPSB2ZWM0KGxlc3NUaGFuKGIwLDAuMCkpKjIuMCAtIDEuMDtcXG4gIC8vdmVjNCBzMSA9IHZlYzQobGVzc1RoYW4oYjEsMC4wKSkqMi4wIC0gMS4wO1xcbiAgdmVjNCBzMCA9IGZsb29yKGIwKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHMxID0gZmxvb3IoYjEpKjIuMCArIDEuMDtcXG4gIHZlYzQgc2ggPSAtc3RlcChoLCB2ZWM0KDAuMCkpO1xcblxcbiAgdmVjNCBhMCA9IGIwLnh6eXcgKyBzMC54enl3KnNoLnh4eXkgO1xcbiAgdmVjNCBhMV8yXzYgPSBiMS54enl3ICsgczEueHp5dypzaC56end3IDtcXG5cXG4gIHZlYzMgcDBfMl83ID0gdmVjMyhhMC54eSxoLngpO1xcbiAgdmVjMyBwMSA9IHZlYzMoYTAuencsaC55KTtcXG4gIHZlYzMgcDIgPSB2ZWMzKGExXzJfNi54eSxoLnopO1xcbiAgdmVjMyBwMyA9IHZlYzMoYTFfMl82Lnp3LGgudyk7XFxuXFxuLy9Ob3JtYWxpc2UgZ3JhZGllbnRzXFxuICB2ZWM0IG5vcm0gPSB0YXlsb3JJbnZTcXJ0XzJfMih2ZWM0KGRvdChwMF8yXzcscDBfMl83KSwgZG90KHAxLHAxKSwgZG90KHAyLCBwMiksIGRvdChwMyxwMykpKTtcXG4gIHAwXzJfNyAqPSBub3JtLng7XFxuICBwMSAqPSBub3JtLnk7XFxuICBwMiAqPSBub3JtLno7XFxuICBwMyAqPSBub3JtLnc7XFxuXFxuLy8gTWl4IGZpbmFsIG5vaXNlIHZhbHVlXFxuICB2ZWM0IG0gPSBtYXgoMC42IC0gdmVjNChkb3QoeDAseDApLCBkb3QoeDEseDEpLCBkb3QoeDIseDIpLCBkb3QoeDMseDMpKSwgMC4wKTtcXG4gIG0gPSBtICogbTtcXG4gIHJldHVybiA0Mi4wICogZG90KCBtKm0sIHZlYzQoIGRvdChwMF8yXzcseDApLCBkb3QocDEseDEpLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90KHAyLHgyKSwgZG90KHAzLHgzKSApICk7XFxuICB9XFxuXFxuXFxuXFxudmVjMyBoc3YycmdiXzFfOCh2ZWMzIGMpe1xcclxcbiAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xcclxcbiAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xcclxcbiAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XFxyXFxufVxcclxcblxcblxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGZsb2F0IHVwZGF0ZVRpbWUgPSB0aW1lIC8gMTAwMC4wO1xcclxcbiAgZmxvYXQgbm9pc2UgPSBzbm9pc2VfMl8zKHZlYzMocG9zaXRpb24gLyA0MDAuMSArIHVwZGF0ZVRpbWUgKiA1LjApKTtcXHJcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24gKiAobm9pc2UgKiBwb3coZGlzdG9ydCwgMi4wKSArIHJhZGl1cyksIDEuMCk7XFxyXFxuXFxyXFxuICB2Q29sb3IgPSBoc3YycmdiXzFfOCh2ZWMzKG5vaXNlICogZGlzdG9ydCAqIDAuMyArIHVwZGF0ZVRpbWUsIDAuMiwgMS4wKSk7XFxyXFxuICB2Tm9ybWFsID0gbm9ybWFsO1xcclxcblxcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciBmcyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xcclxcblxcclxcbi8vXFxuLy8gRGVzY3JpcHRpb24gOiBBcnJheSBhbmQgdGV4dHVyZWxlc3MgR0xTTCAyRC8zRC80RCBzaW1wbGV4XFxuLy8gICAgICAgICAgICAgICBub2lzZSBmdW5jdGlvbnMuXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzJfMCh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgbW9kMjg5XzJfMCh2ZWM0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV8yXzEodmVjNCB4KSB7XFxuICAgICByZXR1cm4gbW9kMjg5XzJfMCgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxudmVjNCB0YXlsb3JJbnZTcXJ0XzJfMih2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzJfMyh2ZWMzIHYpXFxuICB7XFxuICBjb25zdCB2ZWMyICBDID0gdmVjMigxLjAvNi4wLCAxLjAvMy4wKSA7XFxuICBjb25zdCB2ZWM0ICBEXzJfNCA9IHZlYzQoMC4wLCAwLjUsIDEuMCwgMi4wKTtcXG5cXG4vLyBGaXJzdCBjb3JuZXJcXG4gIHZlYzMgaSAgPSBmbG9vcih2ICsgZG90KHYsIEMueXl5KSApO1xcbiAgdmVjMyB4MCA9ICAgdiAtIGkgKyBkb3QoaSwgQy54eHgpIDtcXG5cXG4vLyBPdGhlciBjb3JuZXJzXFxuICB2ZWMzIGdfMl81ID0gc3RlcCh4MC55engsIHgwLnh5eik7XFxuICB2ZWMzIGwgPSAxLjAgLSBnXzJfNTtcXG4gIHZlYzMgaTEgPSBtaW4oIGdfMl81Lnh5eiwgbC56eHkgKTtcXG4gIHZlYzMgaTIgPSBtYXgoIGdfMl81Lnh5eiwgbC56eHkgKTtcXG5cXG4gIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcbiAgLy8gICB4MSA9IHgwIC0gaTEgICsgMS4wICogQy54eHg7XFxuICAvLyAgIHgyID0geDAgLSBpMiAgKyAyLjAgKiBDLnh4eDtcXG4gIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcbiAgdmVjMyB4MSA9IHgwIC0gaTEgKyBDLnh4eDtcXG4gIHZlYzMgeDIgPSB4MCAtIGkyICsgQy55eXk7IC8vIDIuMCpDLnggPSAxLzMgPSBDLnlcXG4gIHZlYzMgeDMgPSB4MCAtIERfMl80Lnl5eTsgICAgICAvLyAtMS4wKzMuMCpDLnggPSAtMC41ID0gLUQueVxcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV8yXzAoaSk7XFxuICB2ZWM0IHAgPSBwZXJtdXRlXzJfMSggcGVybXV0ZV8yXzEoIHBlcm11dGVfMl8xKFxcbiAgICAgICAgICAgICBpLnogKyB2ZWM0KDAuMCwgaTEueiwgaTIueiwgMS4wICkpXFxuICAgICAgICAgICArIGkueSArIHZlYzQoMC4wLCBpMS55LCBpMi55LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS54ICsgdmVjNCgwLjAsIGkxLngsIGkyLngsIDEuMCApKTtcXG5cXG4vLyBHcmFkaWVudHM6IDd4NyBwb2ludHMgb3ZlciBhIHNxdWFyZSwgbWFwcGVkIG9udG8gYW4gb2N0YWhlZHJvbi5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDkgKDQ5KjYgPSAyOTQpXFxuICBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyAvLyAxLjAvNy4wXFxuICB2ZWMzICBucyA9IG5fICogRF8yXzQud3l6IC0gRF8yXzQueHp4O1xcblxcbiAgdmVjNCBqID0gcCAtIDQ5LjAgKiBmbG9vcihwICogbnMueiAqIG5zLnopOyAgLy8gIG1vZChwLDcqNylcXG5cXG4gIHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7XFxuICB2ZWM0IHlfID0gZmxvb3IoaiAtIDcuMCAqIHhfICk7ICAgIC8vIG1vZChqLE4pXFxuXFxuICB2ZWM0IHggPSB4XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXFxuICB2ZWM0IGIwID0gdmVjNCggeC54eSwgeS54eSApO1xcbiAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cXG4gIC8vdmVjNCBzMCA9IHZlYzQobGVzc1RoYW4oYjAsMC4wKSkqMi4wIC0gMS4wO1xcbiAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuICB2ZWM0IHMwID0gZmxvb3IoYjApKjIuMCArIDEuMDtcXG4gIHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wO1xcbiAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXFxuICB2ZWM0IGEwID0gYjAueHp5dyArIHMwLnh6eXcqc2gueHh5eSA7XFxuICB2ZWM0IGExXzJfNiA9IGIxLnh6eXcgKyBzMS54enl3KnNoLnp6d3cgO1xcblxcbiAgdmVjMyBwMF8yXzcgPSB2ZWMzKGEwLnh5LGgueCk7XFxuICB2ZWMzIHAxID0gdmVjMyhhMC56dyxoLnkpO1xcbiAgdmVjMyBwMiA9IHZlYzMoYTFfMl82Lnh5LGgueik7XFxuICB2ZWMzIHAzID0gdmVjMyhhMV8yXzYuencsaC53KTtcXG5cXG4vL05vcm1hbGlzZSBncmFkaWVudHNcXG4gIHZlYzQgbm9ybSA9IHRheWxvckludlNxcnRfMl8yKHZlYzQoZG90KHAwXzJfNyxwMF8yXzcpLCBkb3QocDEscDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLHAzKSkpO1xcbiAgcDBfMl83ICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG5cXG4vLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG4gIHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApO1xcbiAgbSA9IG0gKiBtO1xcbiAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwXzJfNyx4MCksIGRvdChwMSx4MSksXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3QocDIseDIpLCBkb3QocDMseDMpICkgKTtcXG4gIH1cXG5cXG5cXG5cXG52ZWMzIGhzdjJyZ2JfMV84KHZlYzMgYyl7XFxyXFxuICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XFxyXFxuICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XFxyXFxuICByZXR1cm4gYy56ICogbWl4KEsueHh4LCBjbGFtcChwIC0gSy54eHgsIDAuMCwgMS4wKSwgYy55KTtcXHJcXG59XFxyXFxuXFxuXFxuXFxyXFxuc3RydWN0IEhlbWlzcGhlcmVMaWdodCB7XFxyXFxuICB2ZWMzIGRpcmVjdGlvbjtcXHJcXG4gIHZlYzMgZ3JvdW5kQ29sb3I7XFxyXFxuICB2ZWMzIHNreUNvbG9yO1xcclxcbn07XFxyXFxudW5pZm9ybSBIZW1pc3BoZXJlTGlnaHQgaGVtaXNwaGVyZUxpZ2h0c1tOVU1fSEVNSV9MSUdIVFNdO1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZlYzMgbGlnaHQgPSB2ZWMzKDAuMCk7XFxyXFxuICBsaWdodCArPSAoZG90KGhlbWlzcGhlcmVMaWdodHNbMF0uZGlyZWN0aW9uLCB2Tm9ybWFsKSArIDEuMCkgKiBoZW1pc3BoZXJlTGlnaHRzWzBdLnNreUNvbG9yICogMC41O1xcclxcbiAgbGlnaHQgKz0gKC1kb3QoaGVtaXNwaGVyZUxpZ2h0c1swXS5kaXJlY3Rpb24sIHZOb3JtYWwpICsgMS4wKSAqIGhlbWlzcGhlcmVMaWdodHNbMF0uZ3JvdW5kQ29sb3IgKiAwLjU7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZDb2xvciAqIGxpZ2h0LCAxLjApO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIHZzX3BwID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgdmVjMiB2VXY7XFxyXFxuXFxyXFxudm9pZCBtYWluKHZvaWQpIHtcXHJcXG4gIHZVdiA9IHV2O1xcclxcbiAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzX3BwID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG51bmlmb3JtIHZlYzIgcmVzb2x1dGlvbjtcXHJcXG51bmlmb3JtIGZsb2F0IGFjY2VsZXJhdGlvbjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcclxcblxcclxcbmNvbnN0IGZsb2F0IGJsdXIgPSAxNi4wO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMiB2VXY7XFxyXFxuXFxyXFxuZmxvYXQgcmFuZG9tMl8xXzAodmVjMiBjKXtcXHJcXG4gICAgcmV0dXJuIGZyYWN0KHNpbihkb3QoYy54eSAsdmVjMigxMi45ODk4LDc4LjIzMykpKSAqIDQzNzU4LjU0NTMpO1xcclxcbn1cXHJcXG5cXG5cXG4vL1xcbi8vIERlc2NyaXB0aW9uIDogQXJyYXkgYW5kIHRleHR1cmVsZXNzIEdMU0wgMkQgc2ltcGxleCBub2lzZSBmdW5jdGlvbi5cXG4vLyAgICAgIEF1dGhvciA6IElhbiBNY0V3YW4sIEFzaGltYSBBcnRzLlxcbi8vICBNYWludGFpbmVyIDogaWptXFxuLy8gICAgIExhc3Rtb2QgOiAyMDExMDgyMiAoaWptKVxcbi8vICAgICBMaWNlbnNlIDogQ29weXJpZ2h0IChDKSAyMDExIEFzaGltYSBBcnRzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxcbi8vICAgICAgICAgICAgICAgRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlLlxcbi8vICAgICAgICAgICAgICAgaHR0cHM6Ly9naXRodWIuY29tL2FzaGltYS93ZWJnbC1ub2lzZVxcbi8vXFxuXFxudmVjMyBtb2QyODlfMl8xKHZlYzMgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjMiBtb2QyODlfMl8xKHZlYzIgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjMyBwZXJtdXRlXzJfMih2ZWMzIHgpIHtcXG4gIHJldHVybiBtb2QyODlfMl8xKCgoeCozNC4wKSsxLjApKngpO1xcbn1cXG5cXG5mbG9hdCBzbm9pc2VfMl8zKHZlYzIgdilcXG4gIHtcXG4gIGNvbnN0IHZlYzQgQyA9IHZlYzQoMC4yMTEzMjQ4NjU0MDUxODcsICAvLyAoMy4wLXNxcnQoMy4wKSkvNi4wXFxuICAgICAgICAgICAgICAgICAgICAgIDAuMzY2MDI1NDAzNzg0NDM5LCAgLy8gMC41KihzcXJ0KDMuMCktMS4wKVxcbiAgICAgICAgICAgICAgICAgICAgIC0wLjU3NzM1MDI2OTE4OTYyNiwgIC8vIC0xLjAgKyAyLjAgKiBDLnhcXG4gICAgICAgICAgICAgICAgICAgICAgMC4wMjQzOTAyNDM5MDI0MzkpOyAvLyAxLjAgLyA0MS4wXFxuLy8gRmlyc3QgY29ybmVyXFxuICB2ZWMyIGkgID0gZmxvb3IodiArIGRvdCh2LCBDLnl5KSApO1xcbiAgdmVjMiB4MCA9IHYgLSAgIGkgKyBkb3QoaSwgQy54eCk7XFxuXFxuLy8gT3RoZXIgY29ybmVyc1xcbiAgdmVjMiBpMTtcXG4gIC8vaTEueCA9IHN0ZXAoIHgwLnksIHgwLnggKTsgLy8geDAueCA+IHgwLnkgPyAxLjAgOiAwLjBcXG4gIC8vaTEueSA9IDEuMCAtIGkxLng7XFxuICBpMSA9ICh4MC54ID4geDAueSkgPyB2ZWMyKDEuMCwgMC4wKSA6IHZlYzIoMC4wLCAxLjApO1xcbiAgLy8geDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHggO1xcbiAgLy8geDEgPSB4MCAtIGkxICsgMS4wICogQy54eCA7XFxuICAvLyB4MiA9IHgwIC0gMS4wICsgMi4wICogQy54eCA7XFxuICB2ZWM0IHgxMiA9IHgwLnh5eHkgKyBDLnh4eno7XFxuICB4MTIueHkgLT0gaTE7XFxuXFxuLy8gUGVybXV0YXRpb25zXFxuICBpID0gbW9kMjg5XzJfMShpKTsgLy8gQXZvaWQgdHJ1bmNhdGlvbiBlZmZlY3RzIGluIHBlcm11dGF0aW9uXFxuICB2ZWMzIHAgPSBwZXJtdXRlXzJfMiggcGVybXV0ZV8yXzIoIGkueSArIHZlYzMoMC4wLCBpMS55LCAxLjAgKSlcXG4gICAgKyBpLnggKyB2ZWMzKDAuMCwgaTEueCwgMS4wICkpO1xcblxcbiAgdmVjMyBtID0gbWF4KDAuNSAtIHZlYzMoZG90KHgwLHgwKSwgZG90KHgxMi54eSx4MTIueHkpLCBkb3QoeDEyLnp3LHgxMi56dykpLCAwLjApO1xcbiAgbSA9IG0qbSA7XFxuICBtID0gbSptIDtcXG5cXG4vLyBHcmFkaWVudHM6IDQxIHBvaW50cyB1bmlmb3JtbHkgb3ZlciBhIGxpbmUsIG1hcHBlZCBvbnRvIGEgZGlhbW9uZC5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDEgKDQxKjcgPSAyODcpXFxuXFxuICB2ZWMzIHggPSAyLjAgKiBmcmFjdChwICogQy53d3cpIC0gMS4wO1xcbiAgdmVjMyBoID0gYWJzKHgpIC0gMC41O1xcbiAgdmVjMyBveCA9IGZsb29yKHggKyAwLjUpO1xcbiAgdmVjMyBhMCA9IHggLSBveDtcXG5cXG4vLyBOb3JtYWxpc2UgZ3JhZGllbnRzIGltcGxpY2l0bHkgYnkgc2NhbGluZyBtXFxuLy8gQXBwcm94aW1hdGlvbiBvZjogbSAqPSBpbnZlcnNlc3FydCggYTAqYTAgKyBoKmggKTtcXG4gIG0gKj0gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiAoIGEwKmEwICsgaCpoICk7XFxuXFxuLy8gQ29tcHV0ZSBmaW5hbCBub2lzZSB2YWx1ZSBhdCBQXFxuICB2ZWMzIGc7XFxuICBnLnggID0gYTAueCAgKiB4MC54ICArIGgueCAgKiB4MC55O1xcbiAgZy55eiA9IGEwLnl6ICogeDEyLnh6ICsgaC55eiAqIHgxMi55dztcXG4gIHJldHVybiAxMzAuMCAqIGRvdChtLCBnKTtcXG59XFxuXFxuXFxuXFxuXFxyXFxudmVjMiBkaWZmVXYoZmxvYXQgdiwgZmxvYXQgZGlmZikge1xcclxcbiAgcmV0dXJuIHZVdiArICh2ZWMyKHYgKyBzbm9pc2VfMl8zKHZlYzIoZ2xfRnJhZ0Nvb3JkLnkgKyB0aW1lKSAvIDEwMC4wKSwgMC4wKSAqIGRpZmYgKyB2ZWMyKHYgKiAzLjAsIDAuMCkpIC8gcmVzb2x1dGlvbjtcXHJcXG59XFxyXFxuXFxyXFxuZmxvYXQgcmFuZG9tTm9pc2UodmVjMiBwKSB7XFxyXFxuICByZXR1cm4gKHJhbmRvbTJfMV8wKHAgLSB2ZWMyKHNpbih0aW1lKSkpICogMi4wIC0gMS4wKSAqIG1heChsZW5ndGgoYWNjZWxlcmF0aW9uKSwgMC4wOCk7XFxyXFxufVxcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGZsb2F0IGRpZmYgPSAzMDAuMCAqIGxlbmd0aChhY2NlbGVyYXRpb24pO1xcclxcbiAgdmVjMiB1dl9yID0gZGlmZlV2KDAuMCwgZGlmZik7XFxyXFxuICB2ZWMyIHV2X2cgPSBkaWZmVXYoMS4wLCBkaWZmKTtcXHJcXG4gIHZlYzIgdXZfYiA9IGRpZmZVdigtMS4wLCBkaWZmKTtcXHJcXG4gIGZsb2F0IHIgPSB0ZXh0dXJlMkQodGV4dHVyZSwgdXZfcikuciArIHJhbmRvbU5vaXNlKHV2X3IpO1xcclxcbiAgZmxvYXQgZyA9IHRleHR1cmUyRCh0ZXh0dXJlLCB1dl9nKS5nICsgcmFuZG9tTm9pc2UodXZfZyk7XFxyXFxuICBmbG9hdCBiID0gdGV4dHVyZTJEKHRleHR1cmUsIHV2X2IpLmIgKyByYW5kb21Ob2lzZSh1dl9iKTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQociwgZywgYiwgMS4wKTtcXHJcXG59XFxyXFxuXCI7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciBzcGhlcmUgPSBudWxsO1xyXG4gIHZhciBiZyA9IG51bGw7XHJcbiAgdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweGZmZmZmZiwgMHg2NjY2NjYsIDEpO1xyXG4gIHZhciBzdWJfc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuICB2YXIgc3ViX2NhbWVyYSA9IG5ldyBGb3JjZUNhbWVyYSg0NSwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDEsIDEwMDAwKTtcclxuICB2YXIgc3ViX2xpZ2h0ID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweGZmZmZmZiwgMHg2NjY2NjYsIDEpO1xyXG4gIHZhciBmb3JjZSA9IG5ldyBGb3JjZTIoKTtcclxuICB2YXIgdGltZV91bml0ID0gMTtcclxuICB2YXIgcmVuZGVyX3RhcmdldCA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0LCB7XHJcbiAgICBtYWdGaWx0ZXI6IFRIUkVFLk5lYXJlc3RGaWx0ZXIsXHJcbiAgICBtaW5GaWx0ZXI6IFRIUkVFLk5lYXJlc3RGaWx0ZXIsXHJcbiAgICB3cmFwUzogVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZyxcclxuICAgIHdyYXBUOiBUSFJFRS5DbGFtcFRvRWRnZVdyYXBwaW5nXHJcbiAgfSlcclxuICB2YXIgZnJhbWVidWZmZXIgPSBudWxsO1xyXG5cclxuICB2YXIgY3JlYXRlU3BoZXJlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIGdlb21ldHJ5LmZyb21HZW9tZXRyeShuZXcgVEhSRUUuT2N0YWhlZHJvbkdlb21ldHJ5KDIwMCwgNSkpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IFRIUkVFLlVuaWZvcm1zVXRpbHMubWVyZ2UoW1xyXG4gICAgICAgIFRIUkVFLlVuaWZvcm1zTGliWydsaWdodHMnXSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0aW1lOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgcmFkaXVzOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgICAgdmFsdWU6IDEuMFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGRpc3RvcnQ6IHtcclxuICAgICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgICB2YWx1ZTogMC40XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICBdKSxcclxuICAgICAgdmVydGV4U2hhZGVyOiB2cyxcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGZzLFxyXG4gICAgICBsaWdodHM6IHRydWUsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVCYWNrZ3JvdW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMTgwMCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVBsYW5lRm9yUG9zdFByb2Nlc3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeV9iYXNlID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMiwgMik7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIGdlb21ldHJ5LmZyb21HZW9tZXRyeShnZW9tZXRyeV9iYXNlKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY2NlbGVyYXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0ZXh0dXJlOiB7XHJcbiAgICAgICAgICB0eXBlOiAndCcsXHJcbiAgICAgICAgICB2YWx1ZTogcmVuZGVyX3RhcmdldCxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHZzX3BwLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogZnNfcHAsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH1cclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnYmctd2hpdGUnO1xyXG4gICAgICBzcGhlcmUgPSBjcmVhdGVTcGhlcmUoKTtcclxuICAgICAgc3ViX3NjZW5lLmFkZChzcGhlcmUpO1xyXG4gICAgICBiZyA9IGNyZWF0ZUJhY2tncm91bmQoKTtcclxuICAgICAgc3ViX3NjZW5lLmFkZChiZyk7XHJcbiAgICAgIHN1Yl9zY2VuZS5hZGQoc3ViX2xpZ2h0KTtcclxuICAgICAgc3ViX2NhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KDE4MDAsIDE4MDAsIDApO1xyXG4gICAgICBzdWJfY2FtZXJhLmZvcmNlLmxvb2suYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgY29uc29sZS5sb2coc3BoZXJlLm1hdGVyaWFsLnVuaWZvcm1zKTtcclxuXHJcbiAgICAgIGZyYW1lYnVmZmVyID0gY3JlYXRlUGxhbmVGb3JQb3N0UHJvY2VzcygpO1xyXG4gICAgICBzY2VuZS5hZGQoZnJhbWVidWZmZXIpO1xyXG4gICAgICBzY2VuZS5hZGQobGlnaHQpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgxODAwLCAxODAwLCAwKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgZm9yY2UuYW5jaG9yLnNldCgxLCAwKTtcclxuICAgICAgZm9yY2UuYW5jaG9yLnNldCgxLCAwKTtcclxuICAgICAgZm9yY2UudmVsb2NpdHkuc2V0KDEsIDApO1xyXG4gICAgICBmb3JjZS5rID0gMC4wNDU7XHJcbiAgICAgIGZvcmNlLmQgPSAwLjE2O1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnJztcclxuICAgICAgc3BoZXJlLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgc3BoZXJlLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc3ViX3NjZW5lLnJlbW92ZShzcGhlcmUpO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc3ViX3NjZW5lLnJlbW92ZShiZyk7XHJcbiAgICAgIHN1Yl9zY2VuZS5yZW1vdmUoc3ViX2xpZ2h0KTtcclxuICAgICAgZnJhbWVidWZmZXIuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBmcmFtZWJ1ZmZlci5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShmcmFtZWJ1ZmZlcik7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShsaWdodCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcikge1xyXG4gICAgICBmb3JjZS5hcHBseUhvb2soMCwgZm9yY2Uuayk7XHJcbiAgICAgIGZvcmNlLmFwcGx5RHJhZyhmb3JjZS5kKTtcclxuICAgICAgZm9yY2UudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgLy8gY29uc29sZS5sb2coZm9yY2UuYWNjZWxlcmF0aW9uLmxlbmd0aCgpKTtcclxuICAgICAgc3BoZXJlLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUgKz0gdGltZV91bml0O1xyXG4gICAgICBzcGhlcmUubWF0ZXJpYWwudW5pZm9ybXMucmFkaXVzLnZhbHVlID0gZm9yY2UudmVsb2NpdHkueDtcclxuICAgICAgc3BoZXJlLm1hdGVyaWFsLnVuaWZvcm1zLmRpc3RvcnQudmFsdWUgPSBmb3JjZS52ZWxvY2l0eS54IC8gMiAtIDAuMTtcclxuICAgICAgc3ViX2NhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4wMjUpO1xyXG4gICAgICBzdWJfY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBzdWJfY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgc3ViX2NhbWVyYS5mb3JjZS5sb29rLmFwcGx5SG9vaygwLCAwLjIpO1xyXG4gICAgICBzdWJfY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEuZm9yY2UubG9vay51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBzdWJfY2FtZXJhLnVwZGF0ZUxvb2soKTtcclxuXHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUgKz0gdGltZV91bml0O1xyXG4gICAgICBmcmFtZWJ1ZmZlci5tYXRlcmlhbC51bmlmb3Jtcy5hY2NlbGVyYXRpb24udmFsdWUgPSBmb3JjZS5hY2NlbGVyYXRpb24ubGVuZ3RoKCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4wMjUpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEubG9va0F0KGNhbWVyYS5mb3JjZS5sb29rLnZlbG9jaXR5KTtcclxuXHJcbiAgICAgIHJlbmRlcmVyLnJlbmRlcihzdWJfc2NlbmUsIHN1Yl9jYW1lcmEsIHJlbmRlcl90YXJnZXQpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBpZiAoZm9yY2UuYW5jaG9yLnggPCAzKSB7XHJcbiAgICAgICAgZm9yY2UuayArPSAwLjAwNTtcclxuICAgICAgICBmb3JjZS5kIC09IDAuMDI7XHJcbiAgICAgICAgZm9yY2UuYW5jaG9yLnggKz0gMC44O1xyXG4gICAgICAgIHRpbWVfdW5pdCArPSAwLjQ7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm9yY2UuayA9IDAuMDU7XHJcbiAgICAgICAgZm9yY2UuZCA9IDAuMTY7XHJcbiAgICAgICAgZm9yY2UuYW5jaG9yLnggPSAxLjA7XHJcbiAgICAgICAgdGltZV91bml0ID0gMTtcclxuICAgICAgfVxyXG4gICAgICBpc190b3VjaGVkID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEpXHJcbiAgICB9LFxyXG4gICAgcmVzaXplV2luZG93OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHJlbmRlcl90YXJnZXQuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgICAgc3ViX2NhbWVyYS5yZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLnVuaWZvcm1zLnJlc29sdXRpb24udmFsdWUuc2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIE1vdmVyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9tb3ZlcicpO1xyXG52YXIgUG9pbnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludHMuanMnKTtcclxudmFyIEZvcmNlUG9pbnRMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2VfcG9pbnRfbGlnaHQnKTtcclxuXHJcbnZhciB2cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyBjdXN0b21Db2xvcjtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgdmVydGV4T3BhY2l0eTtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgc2l6ZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdkNvbG9yID0gY3VzdG9tQ29sb3I7XFxyXFxuICBmT3BhY2l0eSA9IHZlcnRleE9wYWNpdHk7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbiAgZ2xfUG9pbnRTaXplID0gc2l6ZSAqICgzMDAuMCAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpO1xcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciBmcyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIHZlYzMgY29sb3I7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciAqIHZDb2xvciwgZk9wYWNpdHkpO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gZ2xfRnJhZ0NvbG9yICogdGV4dHVyZTJEKHRleHR1cmUsIGdsX1BvaW50Q29vcmQpO1xcclxcbn1cXHJcXG5cIjtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEpO1xyXG4gIH07XHJcbiAgdmFyIG1vdmVyc19udW0gPSAxMDAwMDtcclxuICB2YXIgbW92ZXJzID0gW107XHJcbiAgdmFyIHBvaW50cyA9IG5ldyBQb2ludHMoKTtcclxuICB2YXIgbGlnaHQgPSBuZXcgRm9yY2VQb2ludExpZ2h0KDB4ZmY2NjAwLCAxLCAxODAwLCAxKTtcclxuICB2YXIgYmcgPSBudWxsO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIHNpemVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgZ3Jhdml0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAuMSwgMCk7XHJcbiAgdmFyIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGlzX2RyYWdlZCA9IGZhbHNlO1xyXG5cclxuICB2YXIgdXBkYXRlTW92ZXIgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIHtcclxuICAgICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlGb3JjZShncmF2aXR5KTtcclxuICAgICAgICBtb3Zlci5hcHBseURyYWcoMC4wMSk7XHJcbiAgICAgICAgbW92ZXIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgICBpZiAobW92ZXIudGltZSA+IDUwKSB7XHJcbiAgICAgICAgICBtb3Zlci5zaXplIC09IDAuNztcclxuICAgICAgICAgIG1vdmVyLmEgLT0gMC4wMDk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtb3Zlci5hIDw9IDApIHtcclxuICAgICAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xyXG4gICAgICAgICAgbW92ZXIudGltZSA9IDA7XHJcbiAgICAgICAgICBtb3Zlci5hID0gMC4wO1xyXG4gICAgICAgICAgbW92ZXIuaW5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnZlbG9jaXR5LnggLSBwb2ludHMudmVsb2NpdHkueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci52ZWxvY2l0eS55IC0gcG9pbnRzLnZlbG9jaXR5Lnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIudmVsb2NpdHkueiAtIHBvaW50cy52ZWxvY2l0eS56O1xyXG4gICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICB9XHJcbiAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGFjdGl2YXRlTW92ZXIgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gMTApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZDEgPSBVdGlsLmdldFJhZGlhbihNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgwLCAyNTYpKSAvIE1hdGgubG9nKDI1NikgKiAyNjApO1xyXG4gICAgICAgIHZhciByYWQyID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgICAgdmFyIHJhbmdlID0gKDEtIE1hdGgubG9nKFV0aWwuZ2V0UmFuZG9tSW50KDMyLCAyNTYpKSAvIE1hdGgubG9nKDI1NikpICogMTI7XHJcbiAgICAgICAgdmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICAgICAgdmFyIGZvcmNlID0gVXRpbC5nZXRQb2xhckNvb3JkKHJhZDEsIHJhZDIsIHJhbmdlKTtcclxuICAgICAgICB2ZWN0b3IuYWRkKHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgICAgbW92ZXIuYWN0aXZhdGUoKTtcclxuICAgICAgICBtb3Zlci5pbml0KHZlY3Rvcik7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgICAgICAgbW92ZXIuYSA9IDAuMjtcclxuICAgICAgICBtb3Zlci5zaXplID0gTWF0aC5wb3coMTIgLSByYW5nZSwgMikgKiBVdGlsLmdldFJhbmRvbUludCgxLCAyNCkgLyAxMDtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgIGlmIChjb3VudCA+PSA2KSBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciB1cGRhdGVQb2ludHMgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICBwb2ludHMudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgIGxpZ2h0Lm9iai5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIG1vdmVQb2ludHMgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHZhciB5ID0gdmVjdG9yLnkgKiB3aW5kb3cuaW5uZXJIZWlnaHQgLyAzO1xyXG4gICAgdmFyIHogPSB2ZWN0b3IueCAqIHdpbmRvdy5pbm5lcldpZHRoIC8gLTM7XHJcbiAgICBwb2ludHMuYW5jaG9yLnkgPSB5O1xyXG4gICAgcG9pbnRzLmFuY2hvci56ID0gejtcclxuICAgIGxpZ2h0LmZvcmNlLmFuY2hvci55ID0geTtcclxuICAgIGxpZ2h0LmZvcmNlLmFuY2hvci56ID0gejtcclxuICB9XHJcblxyXG4gIHZhciBjcmVhdGVUZXh0dXJlID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgdmFyIGdyYWQgPSBudWxsO1xyXG4gICAgdmFyIHRleHR1cmUgPSBudWxsO1xyXG5cclxuICAgIGNhbnZhcy53aWR0aCA9IDIwMDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSAyMDA7XHJcbiAgICBncmFkID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KDEwMCwgMTAwLCAyMCwgMTAwLCAxMDAsIDEwMCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjIsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjUsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEuMCwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMCknKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xyXG4gICAgY3R4LmFyYygxMDAsIDEwMCwgMTAwLCAwLCBNYXRoLlBJIC8gMTgwLCB0cnVlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVCYWNrZ3JvdW5kID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeSgxNTAwLCAzKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIGNvbG9yOiAweGZmZmZmZixcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmcsXHJcbiAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzX251bTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XHJcbiAgICAgICAgdmFyIGggPSBVdGlsLmdldFJhbmRvbUludCgwLCA0NSk7XHJcbiAgICAgICAgdmFyIHMgPSBVdGlsLmdldFJhbmRvbUludCg2MCwgOTApO1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyBoICsgJywgJyArIHMgKyAnJSwgNTAlKScpO1xyXG5cclxuICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKFV0aWwuZ2V0UmFuZG9tSW50KC0xMDAsIDEwMCksIDAsIDApKTtcclxuICAgICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIudmVsb2NpdHkueTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnZlbG9jaXR5Lno7XHJcbiAgICAgICAgY29sb3IudG9BcnJheShjb2xvcnMsIGkgKiAzKTtcclxuICAgICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgICAgfVxyXG4gICAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgICAgc2NlbmU6IHNjZW5lLFxyXG4gICAgICAgIHZzOiB2cyxcclxuICAgICAgICBmczogZnMsXHJcbiAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXHJcbiAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgICAgc2l6ZXM6IHNpemVzLFxyXG4gICAgICAgIHRleHR1cmU6IGNyZWF0ZVRleHR1cmUoKSxcclxuICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xyXG4gICAgICB9KTtcclxuICAgICAgc2NlbmUuYWRkKGxpZ2h0KTtcclxuICAgICAgYmcgPSBjcmVhdGVCYWNrZ3JvdW5kKCk7XHJcbiAgICAgIHNjZW5lLmFkZChiZyk7XHJcbiAgICAgIGNhbWVyYS5zZXRQb2xhckNvb3JkKFV0aWwuZ2V0UmFkaWFuKDI1KSwgMCwgMTAwMCk7XHJcbiAgICAgIGxpZ2h0LnNldFBvbGFyQ29vcmQoVXRpbC5nZXRSYWRpYW4oMjUpLCAwLCAyMDApO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBzY2VuZS5yZW1vdmUobGlnaHQpO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgICAgbW92ZXJzID0gW107XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHBvaW50cy5hcHBseUhvb2soMCwgMC4wOCk7XHJcbiAgICAgIHBvaW50cy5hcHBseURyYWcoMC4yKTtcclxuICAgICAgcG9pbnRzLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGxpZ2h0LmZvcmNlLmFwcGx5SG9vaygwLCAwLjA4KTtcclxuICAgICAgbGlnaHQuZm9yY2UuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGxpZ2h0LmZvcmNlLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGxpZ2h0LnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGFjdGl2YXRlTW92ZXIoKTtcclxuICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjAwNCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4xKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIG1vdmVQb2ludHModmVjdG9yKTtcclxuICAgICAgaXNfZHJhZ2VkID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBpZiAoaXNfZHJhZ2VkKSB7XHJcbiAgICAgICAgbW92ZVBvaW50cyh2ZWN0b3JfbW91c2VfbW92ZSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIGlzX2RyYWdlZCA9IGZhbHNlO1xyXG4gICAgICBwb2ludHMuYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgbGlnaHQuZm9yY2UuYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxudmFyIEZvcmNlSGVtaXNwaGVyZUxpZ2h0ID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZV9oZW1pc3BoZXJlX2xpZ2h0Jyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciBpbWFnZXMgPSBbXTtcclxuICB2YXIgaW1hZ2VzX251bSA9IDMwMDtcclxuICB2YXIgbGlnaHQgPSBudWxsO1xyXG4gIHZhciByYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XHJcbiAgdmFyIHBpY2tlZF9pZCA9IC0xO1xyXG4gIHZhciBwaWNrZWRfaW5kZXggPSAtMTtcclxuICB2YXIgaXNfY2xpY2tlZCA9IGZhbHNlO1xyXG4gIHZhciBpc19kcmFnZWQgPSBmYWxzZTtcclxuICB2YXIgZ2V0X25lYXIgPSBmYWxzZTtcclxuXHJcbiAgdmFyIEltYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJhZCA9IDA7XHJcbiAgICB0aGlzLm9iaiA9IG51bGw7XHJcbiAgICB0aGlzLmlzX2VudGVyZWQgPSBmYWxzZTtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgdmFyIGltYWdlX2dlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMTAwLCAxMDApO1xyXG4gIEltYWdlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgSW1hZ2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSW1hZ2U7XHJcbiAgSW1hZ2UucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHZhciBpbWFnZV9tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXHJcbiAgICAgIG1hcDogbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKS5sb2FkKCdpbWcvZ2FsbGVyeS9pbWFnZTAnICsgVXRpbC5nZXRSYW5kb21JbnQoMSwgOSkgKyAnLmpwZycpXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLm9iaiA9IG5ldyBUSFJFRS5NZXNoKGltYWdlX2dlb21ldHJ5LCBpbWFnZV9tYXRlcmlhbCk7XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gdmVjdG9yLmNsb25lKCk7XHJcbiAgICB0aGlzLmFuY2hvciA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uc2V0KDAsIDAsIDApO1xyXG4gIH07XHJcblxyXG4gIHZhciBpbml0SW1hZ2VzID0gZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VzX251bTsgaSsrKSB7XHJcbiAgICAgIHZhciBpbWFnZSA9IG51bGw7XHJcbiAgICAgIHZhciByYWQgPSBVdGlsLmdldFJhZGlhbihpICUgNDUgKiA4ICsgMTgwKTtcclxuICAgICAgdmFyIHJhZGl1cyA9IDEwMDA7XHJcbiAgICAgIHZhciB4ID0gTWF0aC5jb3MocmFkKSAqIHJhZGl1cztcclxuICAgICAgdmFyIHkgPSBpICogNSAtIGltYWdlc19udW0gKiAyLjU7XHJcbiAgICAgIHZhciB6ID0gTWF0aC5zaW4ocmFkKSAqIHJhZGl1cztcclxuICAgICAgdmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKHgsIHksIHopO1xyXG4gICAgICBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICBpbWFnZS5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKCkpO1xyXG4gICAgICBpbWFnZS5yYWQgPSByYWQ7XHJcbiAgICAgIGltYWdlLm9iai5wb3NpdGlvbi5jb3B5KHZlY3Rvcik7XHJcbiAgICAgIHNjZW5lLmFkZChpbWFnZS5vYmopO1xyXG4gICAgICBpbWFnZXMucHVzaChpbWFnZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHBpY2tJbWFnZSA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgaWYgKGdldF9uZWFyKSByZXR1cm47XHJcbiAgICB2YXIgaW50ZXJzZWN0cyA9IG51bGw7XHJcbiAgICByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYSh2ZWN0b3IsIGNhbWVyYSk7XHJcbiAgICBpbnRlcnNlY3RzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoc2NlbmUuY2hpbGRyZW4pO1xyXG4gICAgaWYgKGludGVyc2VjdHMubGVuZ3RoID4gMCAmJiBpc19kcmFnZWQgPT0gZmFsc2UpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdpcy1wb2ludGVkJyk7XHJcbiAgICAgIHBpY2tlZF9pZCA9IGludGVyc2VjdHNbMF0ub2JqZWN0LmlkO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVzZXRQaWNrSW1hZ2UoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgZ2V0TmVhckltYWdlID0gZnVuY3Rpb24oY2FtZXJhLCBpbWFnZSkge1xyXG4gICAgZ2V0X25lYXIgPSB0cnVlO1xyXG4gICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoTWF0aC5jb3MoaW1hZ2UucmFkKSAqIDc4MCwgaW1hZ2Uub2JqLnBvc2l0aW9uLnksIE1hdGguc2luKGltYWdlLnJhZCkgKiA3ODApO1xyXG4gICAgY2FtZXJhLmZvcmNlLmxvb2suYW5jaG9yLmNvcHkoaW1hZ2Uub2JqLnBvc2l0aW9uKTtcclxuICAgIHJlc2V0UGlja0ltYWdlKCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIHJlc2V0UGlja0ltYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBvaW50ZWQnKTtcclxuICAgIHBpY2tlZF9pZCA9IC0xO1xyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGluaXRJbWFnZXMoc2NlbmUpO1xyXG4gICAgICBsaWdodCA9IG5ldyBGb3JjZUhlbWlzcGhlcmVMaWdodCgweGZmZmZmZiwgMHhmZmZmZmYsIDEpO1xyXG4gICAgICBzY2VuZS5hZGQobGlnaHQpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxID0gVXRpbC5nZXRSYWRpYW4oLTM1KTtcclxuICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxX2Jhc2UgPSBjYW1lcmEucm90YXRlX3JhZDE7XHJcbiAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMiA9IFV0aWwuZ2V0UmFkaWFuKDE4MCk7XHJcbiAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMl9iYXNlID0gY2FtZXJhLnJvdGF0ZV9yYWQyO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgaW1hZ2VfZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHNjZW5lLnJlbW92ZShpbWFnZXNbaV0ub2JqKTtcclxuICAgICAgfTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGxpZ2h0KTtcclxuICAgICAgaW1hZ2VzID0gW107XHJcbiAgICAgIGdldF9uZWFyID0gZmFsc2U7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcG9pbnRlZCcpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlc19udW07IGkrKykge1xyXG4gICAgICAgIGltYWdlc1tpXS5hcHBseUhvb2soMCwgMC4xNCk7XHJcbiAgICAgICAgaW1hZ2VzW2ldLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICAgIGltYWdlc1tpXS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICAgIGltYWdlc1tpXS5vYmoubG9va0F0KHtcclxuICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICB5OiBpbWFnZXNbaV0ub2JqLnBvc2l0aW9uLnksXHJcbiAgICAgICAgICB6OiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGltYWdlc1tpXS5vYmouaWQgPT0gcGlja2VkX2lkICYmIGlzX2RyYWdlZCA9PSBmYWxzZSAmJiBnZXRfbmVhciA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgaWYgKGlzX2NsaWNrZWQgPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBwaWNrZWRfaW5kZXggPSBpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaW1hZ2VzW2ldLm9iai5tYXRlcmlhbC5jb2xvci5zZXQoMHhhYWFhYWEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpbWFnZXNbaV0ub2JqLm1hdGVyaWFsLmNvbG9yLnNldCgweGZmZmZmZik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseUhvb2soMCwgMC4wOCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBpZiAoZ2V0X25lYXIgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYW5jaG9yLmNvcHkoVXRpbC5nZXRQb2xhckNvb3JkKGNhbWVyYS5yb3RhdGVfcmFkMSwgY2FtZXJhLnJvdGF0ZV9yYWQyLCAxMDAwKSk7XHJcbiAgICAgIH1cclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZUxvb2soKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgcGlja0ltYWdlKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcik7XHJcbiAgICAgIGlzX2NsaWNrZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIHBpY2tJbWFnZShzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfbW92ZSk7XHJcbiAgICAgIGlmIChpc19jbGlja2VkICYmIHZlY3Rvcl9tb3VzZV9kb3duLmNsb25lKCkuc3ViKHZlY3Rvcl9tb3VzZV9tb3ZlKS5sZW5ndGgoKSA+IDAuMDEpIHtcclxuICAgICAgICBpc19jbGlja2VkID0gZmFsc2U7XHJcbiAgICAgICAgaXNfZHJhZ2VkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNfZHJhZ2VkID09IHRydWUgJiYgZ2V0X25lYXIgPT0gZmFsc2UpIHtcclxuICAgICAgICBjYW1lcmEucm90YXRlX3JhZDEgPSBjYW1lcmEucm90YXRlX3JhZDFfYmFzZSArIFV0aWwuZ2V0UmFkaWFuKCh2ZWN0b3JfbW91c2VfZG93bi55IC0gdmVjdG9yX21vdXNlX21vdmUueSkgKiA1MCk7XHJcbiAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQyID0gY2FtZXJhLnJvdGF0ZV9yYWQyX2Jhc2UgKyBVdGlsLmdldFJhZGlhbigodmVjdG9yX21vdXNlX2Rvd24ueCAtIHZlY3Rvcl9tb3VzZV9tb3ZlLngpICogNTApO1xyXG4gICAgICAgIGlmIChjYW1lcmEucm90YXRlX3JhZDEgPCBVdGlsLmdldFJhZGlhbigtNTApKSB7XHJcbiAgICAgICAgICBjYW1lcmEucm90YXRlX3JhZDEgPSBVdGlsLmdldFJhZGlhbigtNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2FtZXJhLnJvdGF0ZV9yYWQxID4gVXRpbC5nZXRSYWRpYW4oNTApKSB7XHJcbiAgICAgICAgICBjYW1lcmEucm90YXRlX3JhZDEgPSBVdGlsLmdldFJhZGlhbig1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICByZXNldFBpY2tJbWFnZSgpO1xyXG4gICAgICBpZiAoZ2V0X25lYXIpIHtcclxuICAgICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgICBwaWNrZWRfaW5kZXggPSAtMTtcclxuICAgICAgICBnZXRfbmVhciA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2UgaWYgKGlzX2NsaWNrZWQgJiYgcGlja2VkX2luZGV4ID4gLTEpIHtcclxuICAgICAgICBnZXROZWFySW1hZ2UoY2FtZXJhLCBpbWFnZXNbcGlja2VkX2luZGV4XSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoaXNfZHJhZ2VkKSB7XHJcbiAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxX2Jhc2UgPSBjYW1lcmEucm90YXRlX3JhZDE7XHJcbiAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQyX2Jhc2UgPSBjYW1lcmEucm90YXRlX3JhZDI7XHJcbiAgICAgIH1cclxuICAgICAgaXNfY2xpY2tlZCA9IGZhbHNlO1xyXG4gICAgICBpc19kcmFnZWQgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIHRoaXMudG91Y2hFbmQoc2NlbmUsIGNhbWVyYSwgdmVjdG9yKVxyXG4gICAgfVxyXG4gIH07XHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG5cclxudmFyIEZvcmNlQ2FtZXJhID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZV9jYW1lcmEnKTtcclxudmFyIEZvcmNlMiA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UyJyk7XHJcbi8vIHZhciB2cyA9IGdsc2xpZnkoJy4uLy4uL2dsc2wvaG9sZS52cycpO1xyXG4vLyB2YXIgZnMgPSBnbHNsaWZ5KCcuLi8uLi9nbHNsL2hvbGUuZnMnKTtcclxudmFyIHZzX3BvaW50cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyByYWRpYW47XFxyXFxuXFxyXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcbnVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcclxcbnVuaWZvcm0gZmxvYXQgc2l6ZTtcXHJcXG51bmlmb3JtIHZlYzIgZm9yY2U7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZmxvYXQgcmFkaXVzID0gbWF4KG1pbihyZXNvbHV0aW9uLngsIHJlc29sdXRpb24ueSksIDYwMC4wKSAqIGNvcyhyYWRpYW5zKHRpbWUgKiAyLjApICsgcmFkaWFuLnopO1xcclxcbiAgZmxvYXQgcmFkaWFuX2Jhc2UgPSByYWRpYW5zKHRpbWUgKiAyLjApO1xcclxcbiAgdmVjMyB1cGRhdGVfcG9zaXRvbiA9IHBvc2l0aW9uICsgdmVjMyhcXHJcXG4gICAgY29zKHJhZGlhbl9iYXNlICsgcmFkaWFuLngpICogY29zKHJhZGlhbl9iYXNlICsgcmFkaWFuLnkpICogcmFkaXVzLFxcclxcbiAgICBjb3MocmFkaWFuX2Jhc2UgKyByYWRpYW4ueCkgKiBzaW4ocmFkaWFuX2Jhc2UgKyByYWRpYW4ueSkgKiByYWRpdXMsXFxyXFxuICAgIHNpbihyYWRpYW5fYmFzZSArIHJhZGlhbi54KSAqIHJhZGl1c1xcclxcbiAgKSAqIGZvcmNlLng7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHVwZGF0ZV9wb3NpdG9uLCAxLjApO1xcclxcblxcclxcbiAgZ2xfUG9pbnRTaXplID0gKHNpemUgKyBmb3JjZS55KSAqIChhYnMoc2luKHJhZGlhbl9iYXNlICsgcmFkaWFuLnopKSkgKiAoc2l6ZSAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpICogbWluKHJlc29sdXRpb24ueCwgcmVzb2x1dGlvbi55KTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnNfcG9pbnRzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgc2l6ZTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2ZWMzIG47XFxyXFxuICBuLnh5ID0gZ2xfUG9pbnRDb29yZC54eSAqIDIuMCAtIDEuMDtcXHJcXG4gIG4ueiA9IDEuMCAtIGRvdChuLnh5LCBuLnh5KTtcXHJcXG4gIGlmIChuLnogPCAwLjApIGRpc2NhcmQ7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KDEuMCk7XFxyXFxufVxcclxcblwiO1xyXG52YXIgdnNfZmIgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMyIHZVdjtcXHJcXG5cXHJcXG52b2lkIG1haW4odm9pZCkge1xcclxcbiAgdlV2ID0gdXY7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnNfZmIgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcbnVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTI7XFxyXFxuXFxyXFxuY29uc3QgZmxvYXQgYmx1ciA9IDIwLjA7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMyIHZVdjtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2ZWM0IGNvbG9yID0gdmVjNCgwLjApO1xcclxcbiAgZm9yIChmbG9hdCB4ID0gMC4wOyB4IDwgYmx1cjsgeCsrKXtcXHJcXG4gICAgZm9yIChmbG9hdCB5ID0gMC4wOyB5IDwgYmx1cjsgeSsrKXtcXHJcXG4gICAgICBjb2xvciArPSB0ZXh0dXJlMkQodGV4dHVyZSwgdlV2IC0gKHZlYzIoeCwgeSkgLSB2ZWMyKGJsdXIgLyAyLjApKSAvIHJlc29sdXRpb24pO1xcclxcbiAgICB9XFxyXFxuICB9XFxyXFxuICB2ZWM0IGNvbG9yMiA9IGNvbG9yIC8gcG93KGJsdXIsIDIuMCk7XFxyXFxuICB2ZWM0IGNvbG9yMyA9IHRleHR1cmUyRCh0ZXh0dXJlMiwgdlV2KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IzLnJnYiwgZmxvb3IobGVuZ3RoKGNvbG9yMi5yZ2IpKSk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIHBvaW50cyA9IG51bGw7XHJcbiAgdmFyIGJnID0gbnVsbDtcclxuICB2YXIgbGlnaHQgPSBuZXcgVEhSRUUuSGVtaXNwaGVyZUxpZ2h0KDB4ZmZmZmZmZiwgMHhmZmZmZmZmLCAxKTtcclxuXHJcbiAgdmFyIHN1Yl9zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIHZhciBzdWJfY2FtZXJhID0gbmV3IEZvcmNlQ2FtZXJhKDQ1LCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMSwgMTAwMDApO1xyXG4gIHZhciByZW5kZXJfdGFyZ2V0ID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gIHZhciBmcmFtZWJ1ZmZlciA9IG51bGw7XHJcblxyXG4gIHZhciBzdWJfc2NlbmUyID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgdmFyIHN1Yl9jYW1lcmEyID0gbmV3IEZvcmNlQ2FtZXJhKDQ1LCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMSwgMTAwMDApO1xyXG4gIHZhciBzdWJfbGlnaHQgPSBuZXcgVEhSRUUuSGVtaXNwaGVyZUxpZ2h0KDB4MDAwMDAwLCAweDQ0NDQ0NCwgMSk7XHJcbiAgdmFyIHJlbmRlcl90YXJnZXQyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gIHZhciBiZ19mYiA9IG51bGw7XHJcbiAgdmFyIG9ial9mYiA9IG51bGw7XHJcblxyXG4gIHZhciBmb3JjZSA9IG5ldyBGb3JjZTIoKTtcclxuXHJcbiAgdmFyIGNyZWF0ZVBvaW50c0ZvckNyb3NzRmFkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICB2YXIgdmVydGljZXNfYmFzZSA9IFtdO1xyXG4gICAgdmFyIHJhZGlhbnNfYmFzZSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSArKykge1xyXG4gICAgICB2YXIgeCA9IDA7XHJcbiAgICAgIHZhciB5ID0gMDtcclxuICAgICAgdmFyIHogPSAwO1xyXG4gICAgICB2ZXJ0aWNlc19iYXNlLnB1c2goeCwgeSwgeik7XHJcbiAgICAgIHZhciByMSA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICB2YXIgcjIgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHIzID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgIHJhZGlhbnNfYmFzZS5wdXNoKHIxLCByMiwgcjMpO1xyXG4gICAgfVxyXG4gICAgdmFyIHZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlc19iYXNlKTtcclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHZlcnRpY2VzLCAzKSk7XHJcbiAgICB2YXIgcmFkaWFucyA9IG5ldyBGbG9hdDMyQXJyYXkocmFkaWFuc19iYXNlKTtcclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncmFkaWFuJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShyYWRpYW5zLCAzKSk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLjBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc29sdXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICd2MicsXHJcbiAgICAgICAgICB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNpemU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAyOC4wXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JjZToge1xyXG4gICAgICAgICAgdHlwZTogJ3YyJyxcclxuICAgICAgICAgIHZhbHVlOiBmb3JjZS52ZWxvY2l0eSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHZzX3BvaW50cyxcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGZzX3BvaW50cyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxyXG4gICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVCYWNrZ3JvdW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMTAwMCwgMzIsIDMyKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlLFxyXG4gICAgICBtYXA6IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCkubG9hZCgnaW1nL2hvbGUvYmFja2dyb3VuZC5qcGcnKSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZU9iamVjdEluRnJhbWVidWZmZXIgPSBmdW5jdGlvbihyYWRpdXMsIGRldGFpbCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeShyYWRpdXMsIGRldGFpbCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZSxcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmcsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH1cclxuXHJcbiAgdmFyIGNyZWF0ZVBsYW5lRm9yRnJhbWVidWZmZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeV9iYXNlID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMiwgMik7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIGdlb21ldHJ5LmZyb21HZW9tZXRyeShnZW9tZXRyeV9iYXNlKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0ZXh0dXJlOiB7XHJcbiAgICAgICAgICB0eXBlOiAndCcsXHJcbiAgICAgICAgICB2YWx1ZTogcmVuZGVyX3RhcmdldCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRleHR1cmUyOiB7XHJcbiAgICAgICAgICB0eXBlOiAndCcsXHJcbiAgICAgICAgICB2YWx1ZTogcmVuZGVyX3RhcmdldDIsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiB2c19mYixcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGZzX2ZiLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJ2JnLXdoaXRlJztcclxuICAgICAgZm9yY2UuYW5jaG9yLnNldCgxLCAwKTtcclxuXHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoMTAwMCwgMzAwLCAwKTtcclxuICAgICAgc3ViX2NhbWVyYTIuZm9yY2UubG9vay5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICBvYmpfZmIgPSBjcmVhdGVPYmplY3RJbkZyYW1lYnVmZmVyKDYwLCAyKTtcclxuICAgICAgc3ViX3NjZW5lMi5hZGQob2JqX2ZiKTtcclxuICAgICAgc3ViX3NjZW5lMi5hZGQoc3ViX2xpZ2h0KTtcclxuXHJcbiAgICAgIHBvaW50cyA9IGNyZWF0ZVBvaW50c0ZvckNyb3NzRmFkZSgpO1xyXG4gICAgICBzdWJfc2NlbmUuYWRkKHBvaW50cyk7XHJcbiAgICAgIHN1Yl9jYW1lcmEucG9zaXRpb24uc2V0KDAsIDAsIDMwMDApO1xyXG4gICAgICBzdWJfY2FtZXJhLmxvb2tBdCgwLCAwLCAwKTtcclxuXHJcbiAgICAgIGZyYW1lYnVmZmVyID0gY3JlYXRlUGxhbmVGb3JGcmFtZWJ1ZmZlcigpO1xyXG4gICAgICBzY2VuZS5hZGQoZnJhbWVidWZmZXIpO1xyXG4gICAgICBiZyA9IGNyZWF0ZUJhY2tncm91bmQoKTtcclxuICAgICAgc2NlbmUuYWRkKGJnKTtcclxuICAgICAgc2NlbmUuYWRkKGxpZ2h0KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoMTAwMCwgLTMwMCwgMCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICcnO1xyXG5cclxuICAgICAgb2JqX2ZiLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgb2JqX2ZiLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc3ViX3NjZW5lMi5yZW1vdmUob2JqX2ZiKTtcclxuICAgICAgc3ViX3NjZW5lMi5yZW1vdmUoc3ViX2xpZ2h0KTtcclxuXHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHN1Yl9zY2VuZS5yZW1vdmUocG9pbnRzKTtcclxuXHJcbiAgICAgIGZyYW1lYnVmZmVyLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgZnJhbWVidWZmZXIubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoZnJhbWVidWZmZXIpO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGxpZ2h0KTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKSB7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlKys7XHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuICAgICAgYmcucm90YXRpb24ueSA9IHBvaW50cy5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlIC8gMjAwO1xyXG4gICAgICBvYmpfZmIucm90YXRpb24ueSA9IHBvaW50cy5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlIC8gMjAwO1xyXG4gICAgICBmb3JjZS5hcHBseUhvb2soMCwgMC4wNik7XHJcbiAgICAgIGZvcmNlLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBmb3JjZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5sb29rLmFuY2hvci55ID0gTWF0aC5zaW4ocG9pbnRzLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUgLyAxMDApICogMTAwO1xyXG4gICAgICBjYW1lcmEuZm9yY2UubG9vay5hcHBseUhvb2soMCwgMC4yKTtcclxuICAgICAgY2FtZXJhLmZvcmNlLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVMb29rKCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLnBvc2l0aW9uLmFwcGx5SG9vaygwLCAwLjEpO1xyXG4gICAgICBzdWJfY2FtZXJhMi5mb3JjZS5wb3NpdGlvbi5hcHBseURyYWcoMC4yKTtcclxuICAgICAgc3ViX2NhbWVyYTIuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgc3ViX2NhbWVyYTIudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgc3ViX2NhbWVyYTIuZm9yY2UubG9vay5hcHBseUhvb2soMCwgMC4yKTtcclxuICAgICAgc3ViX2NhbWVyYTIuZm9yY2UubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgc3ViX2NhbWVyYTIuZm9yY2UubG9vay51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBzdWJfY2FtZXJhMi51cGRhdGVMb29rKCk7XHJcbiAgICAgIHJlbmRlcmVyLnJlbmRlcihzdWJfc2NlbmUyLCBzdWJfY2FtZXJhMiwgcmVuZGVyX3RhcmdldDIpO1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIoc3ViX3NjZW5lLCBzdWJfY2FtZXJhLCByZW5kZXJfdGFyZ2V0KTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgZm9yY2UuYW5jaG9yLnNldCgyLCA0MCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoNjAwLCAtMzAwLCAwKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMSwgMCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoMTAwMCwgMzAwLCAwKTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3JjZS5hbmNob3Iuc2V0KDEsIDApO1xyXG4gICAgICBzdWJfY2FtZXJhMi5mb3JjZS5wb3NpdGlvbi5hbmNob3Iuc2V0KDEwMDAsIDMwMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgcmVzaXplV2luZG93OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHJlbmRlcl90YXJnZXQuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgICAgcmVuZGVyX3RhcmdldDIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgICAgc3ViX2NhbWVyYS5yZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLnVuaWZvcm1zLnJlc29sdXRpb24udmFsdWUuc2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgICBmcmFtZWJ1ZmZlci5tYXRlcmlhbC51bmlmb3Jtcy5yZXNvbHV0aW9uLnZhbHVlLnNldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbW92ZXInKTtcclxudmFyIFBvaW50cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRzLmpzJyk7XHJcblxyXG52YXIgdnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgY3VzdG9tQ29sb3I7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHZlcnRleE9wYWNpdHk7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHNpemU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZDb2xvciA9IGN1c3RvbUNvbG9yO1xcclxcbiAgZk9wYWNpdHkgPSB2ZXJ0ZXhPcGFjaXR5O1xcclxcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG4gIGdsX1BvaW50U2l6ZSA9IHNpemUgKiAoMzAwLjAgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXHJcXG59XFxyXFxuXCI7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciBtb3ZlcnNfbnVtID0gMjAwMDA7XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBjb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgb3BhY2l0aWVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBncmF2aXR5ID0gbmV3IFRIUkVFLlZlY3RvcjMoMS41LCAwLCAwKTtcclxuICB2YXIgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICB2YXIgaXNfdG91Y2hlZCA9IGZhbHNlO1xyXG5cclxuICB2YXIgdXBkYXRlTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkge1xyXG4gICAgICAgIG1vdmVyLnRpbWUrKztcclxuICAgICAgICBtb3Zlci5hcHBseUZvcmNlKGdyYXZpdHkpO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgaWYgKG1vdmVyLmEgPCAwLjgpIHtcclxuICAgICAgICAgIG1vdmVyLmEgKz0gMC4wMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vdmVyLnZlbG9jaXR5LnggPiAxMDAwKSB7XHJcbiAgICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgIG1vdmVyLnRpbWUgPSAwO1xyXG4gICAgICAgICAgbW92ZXIuYSA9IDAuMDtcclxuICAgICAgICAgIG1vdmVyLmluYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnZlbG9jaXR5Lnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIudmVsb2NpdHkuejtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY3RpdmF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gZ3Jhdml0eS54ICogMTYpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZCA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDEyMCkgKiAzKTtcclxuICAgICAgICB2YXIgcmFuZ2UgPSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgyLCAxMjgpKSAvIE1hdGgubG9nKDEyOCkgKiAxNjAgKyA2MDtcclxuICAgICAgICB2YXIgeSA9IE1hdGguc2luKHJhZCkgKiByYW5nZTtcclxuICAgICAgICB2YXIgeiA9IE1hdGguY29zKHJhZCkgKiByYW5nZTtcclxuICAgICAgICB2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoLTEwMDAsIHksIHopO1xyXG4gICAgICAgIHZlY3Rvci5hZGQocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgICBtb3Zlci5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIG1vdmVyLmluaXQodmVjdG9yKTtcclxuICAgICAgICBtb3Zlci5hID0gMDtcclxuICAgICAgICBtb3Zlci5zaXplID0gVXRpbC5nZXRSYW5kb21JbnQoNSwgNjApO1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgaWYgKGNvdW50ID49IE1hdGgucG93KGdyYXZpdHkueCAqIDMsIGdyYXZpdHkueCAqIDAuNCkpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHVwZGF0ZVBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcG9pbnRzLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVRleHR1cmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIHZhciBncmFkID0gbnVsbDtcclxuICAgIHZhciB0ZXh0dXJlID0gbnVsbDtcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSAyNTY7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gMjU2O1xyXG4gICAgZ3JhZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudCgxMjgsIDEyOCwgMjAsIDEyOCwgMTI4LCAxMjgpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC4yLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC41LCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLjAsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDApJyk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcclxuICAgIGN0eC5hcmMoMTI4LCAxMjgsIDEyOCwgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXMpO1xyXG4gICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdGV4dHVyZTtcclxuICB9O1xyXG5cclxuICB2YXIgY2hhbmdlR3Jhdml0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGlzX3RvdWNoZWQpIHtcclxuICAgICAgaWYgKGdyYXZpdHkueCA8IDYpIGdyYXZpdHkueCArPSAwLjAyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGdyYXZpdHkueCA+IDEuNSkgZ3Jhdml0eS54IC09IDAuMTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc19udW07IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG5ldyBNb3ZlcigpO1xyXG4gICAgICAgIHZhciBoID0gVXRpbC5nZXRSYW5kb21JbnQoNjAsIDIxMCk7XHJcbiAgICAgICAgdmFyIHMgPSBVdGlsLmdldFJhbmRvbUludCgzMCwgOTApO1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyBoICsgJywgJyArIHMgKyAnJSwgNTAlKScpO1xyXG5cclxuICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKFV0aWwuZ2V0UmFuZG9tSW50KC0xMDAsIDEwMCksIDAsIDApKTtcclxuICAgICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIudmVsb2NpdHkueTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnZlbG9jaXR5Lno7XHJcbiAgICAgICAgY29sb3IudG9BcnJheShjb2xvcnMsIGkgKiAzKTtcclxuICAgICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgICAgfVxyXG4gICAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgICAgc2NlbmU6IHNjZW5lLFxyXG4gICAgICAgIHZzOiB2cyxcclxuICAgICAgICBmczogZnMsXHJcbiAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXHJcbiAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgICAgc2l6ZXM6IHNpemVzLFxyXG4gICAgICAgIHRleHR1cmU6IGNyZWF0ZVRleHR1cmUoKSxcclxuICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xyXG4gICAgICB9KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci5zZXQoODAwLCAwLCAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMub2JqKTtcclxuICAgICAgbW92ZXJzID0gW107XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGNoYW5nZUdyYXZpdHkoKTtcclxuICAgICAgYWN0aXZhdGVNb3ZlcigpO1xyXG4gICAgICB1cGRhdGVNb3ZlcigpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDA4KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rQXRDZW50ZXIoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgaXNfdG91Y2hlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci56ID0gdmVjdG9yX21vdXNlX21vdmUueCAqIDEyMDtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci55ID0gdmVjdG9yX21vdXNlX21vdmUueSAqIC0xMjA7XHJcbiAgICAgIC8vY2FtZXJhLmxvb2tBdENlbnRlcigpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueiA9IDA7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueSA9IDA7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcblxyXG52YXIgUG9pbnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludHMuanMnKTtcclxudmFyIHZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGN1c3RvbUNvbG9yO1xcclxcbmF0dHJpYnV0ZSBmbG9hdCB2ZXJ0ZXhPcGFjaXR5O1xcclxcbmF0dHJpYnV0ZSBmbG9hdCBzaXplO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2Q29sb3IgPSBjdXN0b21Db2xvcjtcXHJcXG4gIGZPcGFjaXR5ID0gdmVydGV4T3BhY2l0eTtcXHJcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxuICBnbF9Qb2ludFNpemUgPSBzaXplICogKDMwMC4wIC8gbGVuZ3RoKG12UG9zaXRpb24ueHl6KSk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gdmVjMyBjb2xvcjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yICogdkNvbG9yLCBmT3BhY2l0eSk7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSBnbF9GcmFnQ29sb3IgKiB0ZXh0dXJlMkQodGV4dHVyZSwgZ2xfUG9pbnRDb29yZCk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICB2YXIgaW1hZ2VfdmVydGljZXMgPSBbXTtcclxuICB2YXIgbW92ZXJzID0gW107XHJcbiAgdmFyIHBvc2l0aW9ucyA9IG51bGw7XHJcbiAgdmFyIGNvbG9ycyA9IG51bGw7XHJcbiAgdmFyIG9wYWNpdGllcyA9IG51bGw7XHJcbiAgdmFyIHNpemVzID0gbnVsbDtcclxuICB2YXIgbGVuZ3RoX3NpZGUgPSA0MDA7XHJcbiAgdmFyIHBvaW50cyA9IG5ldyBQb2ludHMoKTtcclxuICB2YXIgY3JlYXRlZF9wb2ludHMgPSBmYWxzZTtcclxuXHJcbiAgdmFyIGxvYWRJbWFnZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICBpbWFnZS5zcmMgPSAnLi9pbWcvaW1hZ2VfZGF0YS9lbGVwaGFudC5wbmcnO1xyXG4gICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIHZhciBnZXRJbWFnZURhdGEgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIGNhbnZhcy53aWR0aCA9IGxlbmd0aF9zaWRlO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IGxlbmd0aF9zaWRlO1xyXG4gICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCk7XHJcbiAgICB2YXIgaW1hZ2VfZGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgbGVuZ3RoX3NpZGUsIGxlbmd0aF9zaWRlKTtcclxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgbGVuZ3RoX3NpZGU7IHkrKykge1xyXG4gICAgICBpZiAoeSAlIDMgPiAwKSBjb250aW51ZTtcclxuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBsZW5ndGhfc2lkZTsgeCsrKSB7XHJcbiAgICAgICAgaWYgKHggJSAzID4gMCkgY29udGludWU7XHJcbiAgICAgICAgaWYoaW1hZ2VfZGF0YS5kYXRhWyh4ICsgeSAqIGxlbmd0aF9zaWRlKSAqIDRdID4gMCkge1xyXG4gICAgICAgICAgaW1hZ2VfdmVydGljZXMucHVzaCgwLCAoeSAtIGxlbmd0aF9zaWRlIC8gMikgKiAtMSwgKHggLSBsZW5ndGhfc2lkZS8gMikgKiAtMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIGJ1aWxkUG9pbnRzID0gZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgIHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMpO1xyXG4gICAgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShpbWFnZV92ZXJ0aWNlcy5sZW5ndGgpO1xyXG4gICAgb3BhY2l0aWVzID0gbmV3IEZsb2F0MzJBcnJheShpbWFnZV92ZXJ0aWNlcy5sZW5ndGggLyAzKTtcclxuICAgIHNpemVzID0gbmV3IEZsb2F0MzJBcnJheShpbWFnZV92ZXJ0aWNlcy5sZW5ndGggLyAzKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VfdmVydGljZXMubGVuZ3RoIC8gMzsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG5ldyBNb3ZlcigpO1xyXG4gICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaHNsKCcgKyAoaW1hZ2VfdmVydGljZXNbaSAqIDMgKyAyXSArIGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMV0gKyBsZW5ndGhfc2lkZSkgLyA1XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArICcsIDYwJSwgODAlKScpO1xyXG4gICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKGltYWdlX3ZlcnRpY2VzW2kgKiAzXSwgaW1hZ2VfdmVydGljZXNbaSAqIDMgKyAxXSwgaW1hZ2VfdmVydGljZXNbaSAqIDMgKyAyXSkpO1xyXG4gICAgICBtb3Zlci5pc19hY3RpdmF0ZSA9IHRydWU7XHJcbiAgICAgIG1vdmVycy5wdXNoKG1vdmVyKTtcclxuICAgICAgY29sb3IudG9BcnJheShjb2xvcnMsIGkgKiAzKTtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gMTtcclxuICAgICAgc2l6ZXNbaV0gPSAxMjtcclxuICAgIH1cclxuICAgIHBvaW50cy5pbml0KHtcclxuICAgICAgc2NlbmU6IHNjZW5lLFxyXG4gICAgICB2czogdnMsXHJcbiAgICAgIGZzOiBmcyxcclxuICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXHJcbiAgICAgIGNvbG9yczogY29sb3JzLFxyXG4gICAgICBvcGFjaXRpZXM6IG9wYWNpdGllcyxcclxuICAgICAgc2l6ZXM6IHNpemVzLFxyXG4gICAgICB0ZXh0dXJlOiBjcmVhdGVUZXh0dXJlKCksXHJcbiAgICAgIGJsZW5kaW5nOiBUSFJFRS5Ob3JtYWxCbGVuZGluZ1xyXG4gICAgfSk7XHJcbiAgICBjcmVhdGVkX3BvaW50cyA9IHRydWU7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGFwcGx5Rm9yY2VUb1BvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICB2YXIgcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICB2YXIgcmFkMiA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICB2YXIgc2NhbGFyID0gVXRpbC5nZXRSYW5kb21JbnQoNDAsIDgwKTtcclxuICAgICAgbW92ZXIuaXNfYWN0aXZhdGUgPSBmYWxzZTtcclxuICAgICAgbW92ZXIuYXBwbHlGb3JjZShVdGlsLmdldFBvbGFyQ29vcmQocmFkMSwgcmFkMiwgc2NhbGFyKSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgIGlmIChtb3Zlci5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgPCAxKSB7XHJcbiAgICAgICAgbW92ZXIuaXNfYWN0aXZhdGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmF0ZSkge1xyXG4gICAgICAgIG1vdmVyLmFwcGx5SG9vaygwLCAwLjE4KTtcclxuICAgICAgICBtb3Zlci5hcHBseURyYWcoMC4yNik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMDM1KTtcclxuICAgICAgfVxyXG4gICAgICBtb3Zlci51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBtb3Zlci52ZWxvY2l0eS5zdWIocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci52ZWxvY2l0eS54IC0gcG9pbnRzLnZlbG9jaXR5Lng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIudmVsb2NpdHkueSAtIHBvaW50cy52ZWxvY2l0eS54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnZlbG9jaXR5LnogLSBwb2ludHMudmVsb2NpdHkueDtcclxuICAgICAgbW92ZXIuc2l6ZSA9IE1hdGgubG9nKFV0aWwuZ2V0UmFuZG9tSW50KDEsIDEyOCkpIC8gTWF0aC5sb2coMTI4KSAqIE1hdGguc3FydChkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoKTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVUZXh0dXJlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB2YXIgZ3JhZCA9IG51bGw7XHJcbiAgICB2YXIgdGV4dHVyZSA9IG51bGw7XHJcblxyXG4gICAgY2FudmFzLndpZHRoID0gMjAwO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IDIwMDtcclxuICAgIGdyYWQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoMTAwLCAxMDAsIDIwLCAxMDAsIDEwMCwgMTAwKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuMiwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMSknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuNSwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMS4wLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwKScpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgICBjdHguYXJjKDEwMCwgMTAwLCAxMDAsIDAsIE1hdGguUEkgLyAxODAsIHRydWUpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuXHJcbiAgICB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzKTtcclxuICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRleHR1cmU7XHJcbiAgfTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgbG9hZEltYWdlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdldEltYWdlRGF0YSgpO1xyXG4gICAgICAgIGJ1aWxkUG9pbnRzKHNjZW5lKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGNhbWVyYS5zZXRQb2xhckNvb3JkKDAsIDAsIDE0MDApO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBwb2ludHMuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocG9pbnRzLm9iaik7XHJcbiAgICAgIGltYWdlX3ZlcnRpY2VzID0gW107XHJcbiAgICAgIG1vdmVycyA9IFtdO1xyXG4gICAgICBjYW1lcmEucmFuZ2UgPSAxMDAwO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBpZiAoY3JlYXRlZF9wb2ludHMpIHtcclxuICAgICAgICB1cGRhdGVNb3ZlcigpO1xyXG4gICAgICAgIHBvaW50cy51cGRhdGVQb2ludHMoKTtcclxuICAgICAgfVxyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rQXRDZW50ZXIoKTtcclxuXHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIGFwcGx5Rm9yY2VUb1BvaW50cygpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIGNhbWVyYS5mb3JjZS5wb3NpdGlvbi5hbmNob3IueiA9IHZlY3Rvcl9tb3VzZV9tb3ZlLnggKiAxMDAwO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYW5jaG9yLnkgPSB2ZWN0b3JfbW91c2VfbW92ZS55ICogLTEwMDA7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpIHtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci56ID0gMDtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFuY2hvci55ID0gMDtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG5cclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcbnZhciB2cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIG1hdDQgbV9tYXRyaXg7XFxyXFxuXFxyXFxuZmxvYXQgaW52ZXJzZV8xXzAoZmxvYXQgbSkge1xcbiAgcmV0dXJuIDEuMCAvIG07XFxufVxcblxcbm1hdDIgaW52ZXJzZV8xXzAobWF0MiBtKSB7XFxuICByZXR1cm4gbWF0MihtWzFdWzFdLC1tWzBdWzFdLFxcbiAgICAgICAgICAgICAtbVsxXVswXSwgbVswXVswXSkgLyAobVswXVswXSptWzFdWzFdIC0gbVswXVsxXSptWzFdWzBdKTtcXG59XFxuXFxubWF0MyBpbnZlcnNlXzFfMChtYXQzIG0pIHtcXG4gIGZsb2F0IGEwMCA9IG1bMF1bMF0sIGEwMSA9IG1bMF1bMV0sIGEwMiA9IG1bMF1bMl07XFxuICBmbG9hdCBhMTAgPSBtWzFdWzBdLCBhMTEgPSBtWzFdWzFdLCBhMTIgPSBtWzFdWzJdO1xcbiAgZmxvYXQgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXTtcXG5cXG4gIGZsb2F0IGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMTtcXG4gIGZsb2F0IGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjA7XFxuICBmbG9hdCBiMjEgPSBhMjEgKiBhMTAgLSBhMTEgKiBhMjA7XFxuXFxuICBmbG9hdCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XFxuXFxuICByZXR1cm4gbWF0MyhiMDEsICgtYTIyICogYTAxICsgYTAyICogYTIxKSwgKGExMiAqIGEwMSAtIGEwMiAqIGExMSksXFxuICAgICAgICAgICAgICBiMTEsIChhMjIgKiBhMDAgLSBhMDIgKiBhMjApLCAoLWExMiAqIGEwMCArIGEwMiAqIGExMCksXFxuICAgICAgICAgICAgICBiMjEsICgtYTIxICogYTAwICsgYTAxICogYTIwKSwgKGExMSAqIGEwMCAtIGEwMSAqIGExMCkpIC8gZGV0O1xcbn1cXG5cXG5tYXQ0IGludmVyc2VfMV8wKG1hdDQgbSkge1xcbiAgZmxvYXRcXG4gICAgICBhMDAgPSBtWzBdWzBdLCBhMDEgPSBtWzBdWzFdLCBhMDIgPSBtWzBdWzJdLCBhMDMgPSBtWzBdWzNdLFxcbiAgICAgIGExMCA9IG1bMV1bMF0sIGExMSA9IG1bMV1bMV0sIGExMiA9IG1bMV1bMl0sIGExMyA9IG1bMV1bM10sXFxuICAgICAgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXSwgYTIzID0gbVsyXVszXSxcXG4gICAgICBhMzAgPSBtWzNdWzBdLCBhMzEgPSBtWzNdWzFdLCBhMzIgPSBtWzNdWzJdLCBhMzMgPSBtWzNdWzNdLFxcblxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcXG4gICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxcbiAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXFxuICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcXG4gICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxcbiAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXFxuICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyLFxcblxcbiAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcXG5cXG4gIHJldHVybiBtYXQ0KFxcbiAgICAgIGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSxcXG4gICAgICBhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDksXFxuICAgICAgYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzLFxcbiAgICAgIGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMyxcXG4gICAgICBhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcsXFxuICAgICAgYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3LFxcbiAgICAgIGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSxcXG4gICAgICBhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEsXFxuICAgICAgYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2LFxcbiAgICAgIGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNixcXG4gICAgICBhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDAsXFxuICAgICAgYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwLFxcbiAgICAgIGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNixcXG4gICAgICBhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYsXFxuICAgICAgYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwLFxcbiAgICAgIGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgLyBkZXQ7XFxufVxcblxcblxcblxcclxcbnZvaWQgbWFpbih2b2lkKSB7XFxyXFxuICBtX21hdHJpeCA9IGludmVyc2VfMV8wKG1vZGVsTWF0cml4KTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcbnVuaWZvcm0gZmxvYXQgdGltZTI7XFxyXFxudW5pZm9ybSBmbG9hdCBhY2NlbGVyYXRpb247XFxyXFxudW5pZm9ybSB2ZWMyIHJlc29sdXRpb247XFxyXFxuXFxyXFxudmFyeWluZyBtYXQ0IG1fbWF0cml4O1xcclxcblxcclxcbi8vIGNvbnN0IHZlYzMgY1BvcyA9IHZlYzMoMC4wLCAwLjAsIDEwLjApO1xcclxcbmNvbnN0IGZsb2F0IHRhcmdldERlcHRoID0gMy41O1xcclxcbmNvbnN0IHZlYzMgbGlnaHREaXIgPSB2ZWMzKDAuNTc3LCAtMC41NzcsIDAuNTc3KTtcXHJcXG5cXHJcXG52ZWMzIGhzdjJyZ2JfMV8wKHZlYzMgYyl7XFxyXFxuICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XFxyXFxuICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XFxyXFxuICByZXR1cm4gYy56ICogbWl4KEsueHh4LCBjbGFtcChwIC0gSy54eHgsIDAuMCwgMS4wKSwgYy55KTtcXHJcXG59XFxyXFxuXFxuXFxuLy9cXG4vLyBEZXNjcmlwdGlvbiA6IEFycmF5IGFuZCB0ZXh0dXJlbGVzcyBHTFNMIDJELzNELzREIHNpbXBsZXhcXG4vLyAgICAgICAgICAgICAgIG5vaXNlIGZ1bmN0aW9ucy5cXG4vLyAgICAgIEF1dGhvciA6IElhbiBNY0V3YW4sIEFzaGltYSBBcnRzLlxcbi8vICBNYWludGFpbmVyIDogaWptXFxuLy8gICAgIExhc3Rtb2QgOiAyMDExMDgyMiAoaWptKVxcbi8vICAgICBMaWNlbnNlIDogQ29weXJpZ2h0IChDKSAyMDExIEFzaGltYSBBcnRzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxcbi8vICAgICAgICAgICAgICAgRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlLlxcbi8vICAgICAgICAgICAgICAgaHR0cHM6Ly9naXRodWIuY29tL2FzaGltYS93ZWJnbC1ub2lzZVxcbi8vXFxuXFxudmVjMyBtb2QyODlfNF8xKHZlYzMgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBtb2QyODlfNF8xKHZlYzQgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBwZXJtdXRlXzRfMih2ZWM0IHgpIHtcXG4gICAgIHJldHVybiBtb2QyODlfNF8xKCgoeCozNC4wKSsxLjApKngpO1xcbn1cXG5cXG52ZWM0IHRheWxvckludlNxcnRfNF8zKHZlYzQgcilcXG57XFxuICByZXR1cm4gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiByO1xcbn1cXG5cXG5mbG9hdCBzbm9pc2VfNF80KHZlYzMgdilcXG4gIHtcXG4gIGNvbnN0IHZlYzIgIEMgPSB2ZWMyKDEuMC82LjAsIDEuMC8zLjApIDtcXG4gIGNvbnN0IHZlYzQgIERfNF81ID0gdmVjNCgwLjAsIDAuNSwgMS4wLCAyLjApO1xcblxcbi8vIEZpcnN0IGNvcm5lclxcbiAgdmVjMyBpICA9IGZsb29yKHYgKyBkb3QodiwgQy55eXkpICk7XFxuICB2ZWMzIHgwID0gICB2IC0gaSArIGRvdChpLCBDLnh4eCkgO1xcblxcbi8vIE90aGVyIGNvcm5lcnNcXG4gIHZlYzMgZ180XzYgPSBzdGVwKHgwLnl6eCwgeDAueHl6KTtcXG4gIHZlYzMgbCA9IDEuMCAtIGdfNF82O1xcbiAgdmVjMyBpMSA9IG1pbiggZ180XzYueHl6LCBsLnp4eSApO1xcbiAgdmVjMyBpMiA9IG1heCggZ180XzYueHl6LCBsLnp4eSApO1xcblxcbiAgLy8gICB4MCA9IHgwIC0gMC4wICsgMC4wICogQy54eHg7XFxuICAvLyAgIHgxID0geDAgLSBpMSAgKyAxLjAgKiBDLnh4eDtcXG4gIC8vICAgeDIgPSB4MCAtIGkyICArIDIuMCAqIEMueHh4O1xcbiAgLy8gICB4MyA9IHgwIC0gMS4wICsgMy4wICogQy54eHg7XFxuICB2ZWMzIHgxID0geDAgLSBpMSArIEMueHh4O1xcbiAgdmVjMyB4MiA9IHgwIC0gaTIgKyBDLnl5eTsgLy8gMi4wKkMueCA9IDEvMyA9IEMueVxcbiAgdmVjMyB4MyA9IHgwIC0gRF80XzUueXl5OyAgICAgIC8vIC0xLjArMy4wKkMueCA9IC0wLjUgPSAtRC55XFxuXFxuLy8gUGVybXV0YXRpb25zXFxuICBpID0gbW9kMjg5XzRfMShpKTtcXG4gIHZlYzQgcCA9IHBlcm11dGVfNF8yKCBwZXJtdXRlXzRfMiggcGVybXV0ZV80XzIoXFxuICAgICAgICAgICAgIGkueiArIHZlYzQoMC4wLCBpMS56LCBpMi56LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS55ICsgdmVjNCgwLjAsIGkxLnksIGkyLnksIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnggKyB2ZWM0KDAuMCwgaTEueCwgaTIueCwgMS4wICkpO1xcblxcbi8vIEdyYWRpZW50czogN3g3IHBvaW50cyBvdmVyIGEgc3F1YXJlLCBtYXBwZWQgb250byBhbiBvY3RhaGVkcm9uLlxcbi8vIFRoZSByaW5nIHNpemUgMTcqMTcgPSAyODkgaXMgY2xvc2UgdG8gYSBtdWx0aXBsZSBvZiA0OSAoNDkqNiA9IDI5NClcXG4gIGZsb2F0IG5fID0gMC4xNDI4NTcxNDI4NTc7IC8vIDEuMC83LjBcXG4gIHZlYzMgIG5zID0gbl8gKiBEXzRfNS53eXogLSBEXzRfNS54eng7XFxuXFxuICB2ZWM0IGogPSBwIC0gNDkuMCAqIGZsb29yKHAgKiBucy56ICogbnMueik7ICAvLyAgbW9kKHAsNyo3KVxcblxcbiAgdmVjNCB4XyA9IGZsb29yKGogKiBucy56KTtcXG4gIHZlYzQgeV8gPSBmbG9vcihqIC0gNy4wICogeF8gKTsgICAgLy8gbW9kKGosTilcXG5cXG4gIHZlYzQgeCA9IHhfICpucy54ICsgbnMueXl5eTtcXG4gIHZlYzQgeSA9IHlfICpucy54ICsgbnMueXl5eTtcXG4gIHZlYzQgaCA9IDEuMCAtIGFicyh4KSAtIGFicyh5KTtcXG5cXG4gIHZlYzQgYjAgPSB2ZWM0KCB4Lnh5LCB5Lnh5ICk7XFxuICB2ZWM0IGIxID0gdmVjNCggeC56dywgeS56dyApO1xcblxcbiAgLy92ZWM0IHMwID0gdmVjNChsZXNzVGhhbihiMCwwLjApKSoyLjAgLSAxLjA7XFxuICAvL3ZlYzQgczEgPSB2ZWM0KGxlc3NUaGFuKGIxLDAuMCkpKjIuMCAtIDEuMDtcXG4gIHZlYzQgczAgPSBmbG9vcihiMCkqMi4wICsgMS4wO1xcbiAgdmVjNCBzMSA9IGZsb29yKGIxKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHNoID0gLXN0ZXAoaCwgdmVjNCgwLjApKTtcXG5cXG4gIHZlYzQgYTAgPSBiMC54enl3ICsgczAueHp5dypzaC54eHl5IDtcXG4gIHZlYzQgYTFfNF83ID0gYjEueHp5dyArIHMxLnh6eXcqc2guenp3dyA7XFxuXFxuICB2ZWMzIHAwXzRfOCA9IHZlYzMoYTAueHksaC54KTtcXG4gIHZlYzMgcDEgPSB2ZWMzKGEwLnp3LGgueSk7XFxuICB2ZWMzIHAyID0gdmVjMyhhMV80XzcueHksaC56KTtcXG4gIHZlYzMgcDMgPSB2ZWMzKGExXzRfNy56dyxoLncpO1xcblxcbi8vTm9ybWFsaXNlIGdyYWRpZW50c1xcbiAgdmVjNCBub3JtID0gdGF5bG9ySW52U3FydF80XzModmVjNChkb3QocDBfNF84LHAwXzRfOCksIGRvdChwMSxwMSksIGRvdChwMiwgcDIpLCBkb3QocDMscDMpKSk7XFxuICBwMF80XzggKj0gbm9ybS54O1xcbiAgcDEgKj0gbm9ybS55O1xcbiAgcDIgKj0gbm9ybS56O1xcbiAgcDMgKj0gbm9ybS53O1xcblxcbi8vIE1peCBmaW5hbCBub2lzZSB2YWx1ZVxcbiAgdmVjNCBtID0gbWF4KDAuNiAtIHZlYzQoZG90KHgwLHgwKSwgZG90KHgxLHgxKSwgZG90KHgyLHgyKSwgZG90KHgzLHgzKSksIDAuMCk7XFxuICBtID0gbSAqIG07XFxuICByZXR1cm4gNDIuMCAqIGRvdCggbSptLCB2ZWM0KCBkb3QocDBfNF84LHgwKSwgZG90KHAxLHgxKSxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvdChwMix4MiksIGRvdChwMyx4MykgKSApO1xcbiAgfVxcblxcblxcblxcbnZlYzMgcm90YXRlXzJfOSh2ZWMzIHAsIGZsb2F0IHJhZGlhbl94LCBmbG9hdCByYWRpYW5feSwgZmxvYXQgcmFkaWFuX3opIHtcXHJcXG4gIG1hdDMgbXggPSBtYXQzKFxcclxcbiAgICAxLjAsIDAuMCwgMC4wLFxcclxcbiAgICAwLjAsIGNvcyhyYWRpYW5feCksIC1zaW4ocmFkaWFuX3gpLFxcclxcbiAgICAwLjAsIHNpbihyYWRpYW5feCksIGNvcyhyYWRpYW5feClcXHJcXG4gICk7XFxyXFxuICBtYXQzIG15ID0gbWF0MyhcXHJcXG4gICAgY29zKHJhZGlhbl95KSwgMC4wLCBzaW4ocmFkaWFuX3kpLFxcclxcbiAgICAwLjAsIDEuMCwgMC4wLFxcclxcbiAgICAtc2luKHJhZGlhbl95KSwgMC4wLCBjb3MocmFkaWFuX3kpXFxyXFxuICApO1xcclxcbiAgbWF0MyBteiA9IG1hdDMoXFxyXFxuICAgIGNvcyhyYWRpYW5feiksIC1zaW4ocmFkaWFuX3opLCAwLjAsXFxyXFxuICAgIHNpbihyYWRpYW5feiksIGNvcyhyYWRpYW5feiksIDAuMCxcXHJcXG4gICAgMC4wLCAwLjAsIDEuMFxcclxcbiAgKTtcXHJcXG4gIHJldHVybiBteCAqIG15ICogbXogKiBwO1xcclxcbn1cXHJcXG5cXG5cXG5mbG9hdCBkQm94XzNfMTAodmVjMyBwLCB2ZWMzIHNpemUpIHtcXHJcXG4gIHJldHVybiBsZW5ndGgobWF4KGFicyhwKSAtIHNpemUsIDAuMCkpO1xcclxcbn1cXHJcXG5cXG5cXG5cXHJcXG5mbG9hdCBnZXROb2lzZSh2ZWMzIHApIHtcXHJcXG4gIHJldHVybiBzbm9pc2VfNF80KHAgKiAoMC40ICsgYWNjZWxlcmF0aW9uICogMC4xKSArIHRpbWUgLyAxMDAuMCk7XFxyXFxufVxcclxcblxcclxcbnZlYzMgZ2V0Um90YXRlKHZlYzMgcCkge1xcclxcbiAgcmV0dXJuIHJvdGF0ZV8yXzkocCwgcmFkaWFucyh0aW1lMiksIHJhZGlhbnModGltZTIgKiAyLjApLCByYWRpYW5zKHRpbWUyKSk7XFxyXFxufVxcclxcblxcclxcbmZsb2F0IGRpc3RhbmNlRnVuYyh2ZWMzIHApIHtcXHJcXG4gIHZlYzQgcDEgPSBtX21hdHJpeCAqIHZlYzQocCwgMS4wKTtcXHJcXG4gIGZsb2F0IG4xID0gZ2V0Tm9pc2UocDEueHl6KTtcXHJcXG4gIHZlYzMgcDIgPSBnZXRSb3RhdGUocDEueHl6KTtcXHJcXG4gIGZsb2F0IGQxID0gZEJveF8zXzEwKHAyLCB2ZWMzKDAuOCAtIG1pbihhY2NlbGVyYXRpb24sIDAuOCkpKSAtIDAuMjtcXHJcXG4gIGZsb2F0IGQyID0gZEJveF8zXzEwKHAyLCB2ZWMzKDEuMCkpIC0gbjE7XFxyXFxuICBmbG9hdCBkMyA9IGRCb3hfM18xMChwMiwgdmVjMygwLjUgKyBhY2NlbGVyYXRpb24gKiAwLjQpKSAtIG4xO1xcclxcbiAgcmV0dXJuIG1pbihtYXgoZDEsIC1kMiksIGQzKTtcXHJcXG59XFxyXFxuXFxyXFxuZmxvYXQgZGlzdGFuY2VGdW5jRm9yRmlsbCh2ZWMzIHApIHtcXHJcXG4gIHZlYzQgcDEgPSBtX21hdHJpeCAqIHZlYzQocCwgMS4wKTtcXHJcXG4gIGZsb2F0IG4gPSBnZXROb2lzZShwMS54eXopO1xcclxcbiAgdmVjMyBwMiA9IGdldFJvdGF0ZShwMS54eXopO1xcclxcbiAgcmV0dXJuIGRCb3hfM18xMChwMiwgdmVjMygwLjUgKyBhY2NlbGVyYXRpb24gKiAwLjQpKSAtIG47XFxyXFxufVxcclxcblxcclxcbnZlYzMgZ2V0Tm9ybWFsKHZlYzMgcCkge1xcclxcbiAgY29uc3QgZmxvYXQgZCA9IDAuMTtcXHJcXG4gIHJldHVybiBub3JtYWxpemUodmVjMyhcXHJcXG4gICAgZGlzdGFuY2VGdW5jKHAgKyB2ZWMzKGQsIDAuMCwgMC4wKSkgLSBkaXN0YW5jZUZ1bmMocCArIHZlYzMoLWQsIDAuMCwgMC4wKSksXFxyXFxuICAgIGRpc3RhbmNlRnVuYyhwICsgdmVjMygwLjAsIGQsIDAuMCkpIC0gZGlzdGFuY2VGdW5jKHAgKyB2ZWMzKDAuMCwgLWQsIDAuMCkpLFxcclxcbiAgICBkaXN0YW5jZUZ1bmMocCArIHZlYzMoMC4wLCAwLjAsIGQpKSAtIGRpc3RhbmNlRnVuYyhwICsgdmVjMygwLjAsIDAuMCwgLWQpKVxcclxcbiAgKSk7XFxyXFxufVxcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZlYzIgcCA9IChnbF9GcmFnQ29vcmQueHkgKiAyLjAgLSByZXNvbHV0aW9uKSAvIG1pbihyZXNvbHV0aW9uLngsIHJlc29sdXRpb24ueSk7XFxyXFxuXFxyXFxuICB2ZWMzIGNEaXIgPSBub3JtYWxpemUoY2FtZXJhUG9zaXRpb24gKiAtMS4wKTtcXHJcXG4gIHZlYzMgY1VwICA9IHZlYzMoMC4wLCAxLjAsIDAuMCk7XFxyXFxuICB2ZWMzIGNTaWRlID0gY3Jvc3MoY0RpciwgY1VwKTtcXHJcXG5cXHJcXG4gIHZlYzMgcmF5ID0gbm9ybWFsaXplKGNTaWRlICogcC54ICsgY1VwICogcC55ICsgY0RpciAqIHRhcmdldERlcHRoKTtcXHJcXG5cXHJcXG4gIGZsb2F0IGRpc3RhbmNlID0gMC4wO1xcclxcbiAgZmxvYXQgckxlbiA9IDAuMDtcXHJcXG4gIHZlYzMgclBvcyA9IGNhbWVyYVBvc2l0aW9uO1xcclxcbiAgZm9yKGludCBpID0gMDsgaSA8IDY0OyBpKyspe1xcclxcbiAgICBkaXN0YW5jZSA9IGRpc3RhbmNlRnVuYyhyUG9zKTtcXHJcXG4gICAgckxlbiArPSBkaXN0YW5jZTtcXHJcXG4gICAgclBvcyA9IGNhbWVyYVBvc2l0aW9uICsgcmF5ICogckxlbiAqIDAuMjtcXHJcXG4gIH1cXHJcXG5cXHJcXG4gIHZlYzMgbm9ybWFsID0gZ2V0Tm9ybWFsKHJQb3MpO1xcclxcbiAgaWYoYWJzKGRpc3RhbmNlKSA8IDAuNSl7XFxyXFxuICAgIGlmIChkaXN0YW5jZUZ1bmNGb3JGaWxsKHJQb3MpID4gMC41KSB7XFxyXFxuICAgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNChoc3YycmdiXzFfMCh2ZWMzKGRvdChub3JtYWwsIGNVcCkgKiAwLjggKyB0aW1lIC8gNDAwLjAsIDAuMiwgZG90KG5vcm1hbCwgY1VwKSAqIDAuOCArIDAuMSkpLCAxLjApO1xcclxcbiAgICB9IGVsc2Uge1xcclxcbiAgICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoaHN2MnJnYl8xXzAodmVjMyhkb3Qobm9ybWFsLCBjVXApICogMC4xICsgdGltZSAvIDQwMC4wLCAwLjgsIGRvdChub3JtYWwsIGNVcCkgKiAwLjIgKyAwLjgpKSwgMS4wKTtcXHJcXG4gICAgfVxcclxcbiAgfSBlbHNlIHtcXHJcXG4gICAgZ2xfRnJhZ0NvbG9yID0gdmVjNCgwLjApO1xcclxcbiAgfVxcclxcbn1cXHJcXG5cIjtcclxudmFyIHZzX2JnID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG51bmlmb3JtIGZsb2F0IGFjY2VsZXJhdGlvbjtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdlBvc2l0aW9uO1xcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBtYXQ0IGludmVydE1hdHJpeDtcXHJcXG5cXHJcXG4vL1xcbi8vIERlc2NyaXB0aW9uIDogQXJyYXkgYW5kIHRleHR1cmVsZXNzIEdMU0wgMkQvM0QvNEQgc2ltcGxleFxcbi8vICAgICAgICAgICAgICAgbm9pc2UgZnVuY3Rpb25zLlxcbi8vICAgICAgQXV0aG9yIDogSWFuIE1jRXdhbiwgQXNoaW1hIEFydHMuXFxuLy8gIE1haW50YWluZXIgOiBpam1cXG4vLyAgICAgTGFzdG1vZCA6IDIwMTEwODIyIChpam0pXFxuLy8gICAgIExpY2Vuc2UgOiBDb3B5cmlnaHQgKEMpIDIwMTEgQXNoaW1hIEFydHMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXFxuLy8gICAgICAgICAgICAgICBEaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUuXFxuLy8gICAgICAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vYXNoaW1hL3dlYmdsLW5vaXNlXFxuLy9cXG5cXG52ZWMzIG1vZDI4OV8zXzAodmVjMyB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IG1vZDI4OV8zXzAodmVjNCB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IHBlcm11dGVfM18xKHZlYzQgeCkge1xcbiAgICAgcmV0dXJuIG1vZDI4OV8zXzAoKCh4KjM0LjApKzEuMCkqeCk7XFxufVxcblxcbnZlYzQgdGF5bG9ySW52U3FydF8zXzIodmVjNCByKVxcbntcXG4gIHJldHVybiAxLjc5Mjg0MjkxNDAwMTU5IC0gMC44NTM3MzQ3MjA5NTMxNCAqIHI7XFxufVxcblxcbmZsb2F0IHNub2lzZV8zXzModmVjMyB2KVxcbiAge1xcbiAgY29uc3QgdmVjMiAgQyA9IHZlYzIoMS4wLzYuMCwgMS4wLzMuMCkgO1xcbiAgY29uc3QgdmVjNCAgRF8zXzQgPSB2ZWM0KDAuMCwgMC41LCAxLjAsIDIuMCk7XFxuXFxuLy8gRmlyc3QgY29ybmVyXFxuICB2ZWMzIGkgID0gZmxvb3IodiArIGRvdCh2LCBDLnl5eSkgKTtcXG4gIHZlYzMgeDAgPSAgIHYgLSBpICsgZG90KGksIEMueHh4KSA7XFxuXFxuLy8gT3RoZXIgY29ybmVyc1xcbiAgdmVjMyBnXzNfNSA9IHN0ZXAoeDAueXp4LCB4MC54eXopO1xcbiAgdmVjMyBsID0gMS4wIC0gZ18zXzU7XFxuICB2ZWMzIGkxID0gbWluKCBnXzNfNS54eXosIGwuenh5ICk7XFxuICB2ZWMzIGkyID0gbWF4KCBnXzNfNS54eXosIGwuenh5ICk7XFxuXFxuICAvLyAgIHgwID0geDAgLSAwLjAgKyAwLjAgKiBDLnh4eDtcXG4gIC8vICAgeDEgPSB4MCAtIGkxICArIDEuMCAqIEMueHh4O1xcbiAgLy8gICB4MiA9IHgwIC0gaTIgICsgMi4wICogQy54eHg7XFxuICAvLyAgIHgzID0geDAgLSAxLjAgKyAzLjAgKiBDLnh4eDtcXG4gIHZlYzMgeDEgPSB4MCAtIGkxICsgQy54eHg7XFxuICB2ZWMzIHgyID0geDAgLSBpMiArIEMueXl5OyAvLyAyLjAqQy54ID0gMS8zID0gQy55XFxuICB2ZWMzIHgzID0geDAgLSBEXzNfNC55eXk7ICAgICAgLy8gLTEuMCszLjAqQy54ID0gLTAuNSA9IC1ELnlcXG5cXG4vLyBQZXJtdXRhdGlvbnNcXG4gIGkgPSBtb2QyODlfM18wKGkpO1xcbiAgdmVjNCBwID0gcGVybXV0ZV8zXzEoIHBlcm11dGVfM18xKCBwZXJtdXRlXzNfMShcXG4gICAgICAgICAgICAgaS56ICsgdmVjNCgwLjAsIGkxLnosIGkyLnosIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnkgKyB2ZWM0KDAuMCwgaTEueSwgaTIueSwgMS4wICkpXFxuICAgICAgICAgICArIGkueCArIHZlYzQoMC4wLCBpMS54LCBpMi54LCAxLjAgKSk7XFxuXFxuLy8gR3JhZGllbnRzOiA3eDcgcG9pbnRzIG92ZXIgYSBzcXVhcmUsIG1hcHBlZCBvbnRvIGFuIG9jdGFoZWRyb24uXFxuLy8gVGhlIHJpbmcgc2l6ZSAxNyoxNyA9IDI4OSBpcyBjbG9zZSB0byBhIG11bHRpcGxlIG9mIDQ5ICg0OSo2ID0gMjk0KVxcbiAgZmxvYXQgbl8gPSAwLjE0Mjg1NzE0Mjg1NzsgLy8gMS4wLzcuMFxcbiAgdmVjMyAgbnMgPSBuXyAqIERfM180Lnd5eiAtIERfM180Lnh6eDtcXG5cXG4gIHZlYzQgaiA9IHAgLSA0OS4wICogZmxvb3IocCAqIG5zLnogKiBucy56KTsgIC8vICBtb2QocCw3KjcpXFxuXFxuICB2ZWM0IHhfID0gZmxvb3IoaiAqIG5zLnopO1xcbiAgdmVjNCB5XyA9IGZsb29yKGogLSA3LjAgKiB4XyApOyAgICAvLyBtb2QoaixOKVxcblxcbiAgdmVjNCB4ID0geF8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCB5ID0geV8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCBoID0gMS4wIC0gYWJzKHgpIC0gYWJzKHkpO1xcblxcbiAgdmVjNCBiMCA9IHZlYzQoIHgueHksIHkueHkgKTtcXG4gIHZlYzQgYjEgPSB2ZWM0KCB4Lnp3LCB5Lnp3ICk7XFxuXFxuICAvL3ZlYzQgczAgPSB2ZWM0KGxlc3NUaGFuKGIwLDAuMCkpKjIuMCAtIDEuMDtcXG4gIC8vdmVjNCBzMSA9IHZlYzQobGVzc1RoYW4oYjEsMC4wKSkqMi4wIC0gMS4wO1xcbiAgdmVjNCBzMCA9IGZsb29yKGIwKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHMxID0gZmxvb3IoYjEpKjIuMCArIDEuMDtcXG4gIHZlYzQgc2ggPSAtc3RlcChoLCB2ZWM0KDAuMCkpO1xcblxcbiAgdmVjNCBhMCA9IGIwLnh6eXcgKyBzMC54enl3KnNoLnh4eXkgO1xcbiAgdmVjNCBhMV8zXzYgPSBiMS54enl3ICsgczEueHp5dypzaC56end3IDtcXG5cXG4gIHZlYzMgcDBfM183ID0gdmVjMyhhMC54eSxoLngpO1xcbiAgdmVjMyBwMSA9IHZlYzMoYTAuencsaC55KTtcXG4gIHZlYzMgcDIgPSB2ZWMzKGExXzNfNi54eSxoLnopO1xcbiAgdmVjMyBwMyA9IHZlYzMoYTFfM182Lnp3LGgudyk7XFxuXFxuLy9Ob3JtYWxpc2UgZ3JhZGllbnRzXFxuICB2ZWM0IG5vcm0gPSB0YXlsb3JJbnZTcXJ0XzNfMih2ZWM0KGRvdChwMF8zXzcscDBfM183KSwgZG90KHAxLHAxKSwgZG90KHAyLCBwMiksIGRvdChwMyxwMykpKTtcXG4gIHAwXzNfNyAqPSBub3JtLng7XFxuICBwMSAqPSBub3JtLnk7XFxuICBwMiAqPSBub3JtLno7XFxuICBwMyAqPSBub3JtLnc7XFxuXFxuLy8gTWl4IGZpbmFsIG5vaXNlIHZhbHVlXFxuICB2ZWM0IG0gPSBtYXgoMC42IC0gdmVjNChkb3QoeDAseDApLCBkb3QoeDEseDEpLCBkb3QoeDIseDIpLCBkb3QoeDMseDMpKSwgMC4wKTtcXG4gIG0gPSBtICogbTtcXG4gIHJldHVybiA0Mi4wICogZG90KCBtKm0sIHZlYzQoIGRvdChwMF8zXzcseDApLCBkb3QocDEseDEpLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90KHAyLHgyKSwgZG90KHAzLHgzKSApICk7XFxuICB9XFxuXFxuXFxuXFxudmVjMyBoc3YycmdiXzFfOCh2ZWMzIGMpe1xcclxcbiAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xcclxcbiAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xcclxcbiAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XFxyXFxufVxcclxcblxcblxcbmZsb2F0IGludmVyc2VfNF85KGZsb2F0IG0pIHtcXG4gIHJldHVybiAxLjAgLyBtO1xcbn1cXG5cXG5tYXQyIGludmVyc2VfNF85KG1hdDIgbSkge1xcbiAgcmV0dXJuIG1hdDIobVsxXVsxXSwtbVswXVsxXSxcXG4gICAgICAgICAgICAgLW1bMV1bMF0sIG1bMF1bMF0pIC8gKG1bMF1bMF0qbVsxXVsxXSAtIG1bMF1bMV0qbVsxXVswXSk7XFxufVxcblxcbm1hdDMgaW52ZXJzZV80XzkobWF0MyBtKSB7XFxuICBmbG9hdCBhMDAgPSBtWzBdWzBdLCBhMDEgPSBtWzBdWzFdLCBhMDIgPSBtWzBdWzJdO1xcbiAgZmxvYXQgYTEwID0gbVsxXVswXSwgYTExID0gbVsxXVsxXSwgYTEyID0gbVsxXVsyXTtcXG4gIGZsb2F0IGEyMCA9IG1bMl1bMF0sIGEyMSA9IG1bMl1bMV0sIGEyMiA9IG1bMl1bMl07XFxuXFxuICBmbG9hdCBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjE7XFxuICBmbG9hdCBiMTEgPSAtYTIyICogYTEwICsgYTEyICogYTIwO1xcbiAgZmxvYXQgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwO1xcblxcbiAgZmxvYXQgZGV0ID0gYTAwICogYjAxICsgYTAxICogYjExICsgYTAyICogYjIxO1xcblxcbiAgcmV0dXJuIG1hdDMoYjAxLCAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSksIChhMTIgKiBhMDEgLSBhMDIgKiBhMTEpLFxcbiAgICAgICAgICAgICAgYjExLCAoYTIyICogYTAwIC0gYTAyICogYTIwKSwgKC1hMTIgKiBhMDAgKyBhMDIgKiBhMTApLFxcbiAgICAgICAgICAgICAgYjIxLCAoLWEyMSAqIGEwMCArIGEwMSAqIGEyMCksIChhMTEgKiBhMDAgLSBhMDEgKiBhMTApKSAvIGRldDtcXG59XFxuXFxubWF0NCBpbnZlcnNlXzRfOShtYXQ0IG0pIHtcXG4gIGZsb2F0XFxuICAgICAgYTAwID0gbVswXVswXSwgYTAxID0gbVswXVsxXSwgYTAyID0gbVswXVsyXSwgYTAzID0gbVswXVszXSxcXG4gICAgICBhMTAgPSBtWzFdWzBdLCBhMTEgPSBtWzFdWzFdLCBhMTIgPSBtWzFdWzJdLCBhMTMgPSBtWzFdWzNdLFxcbiAgICAgIGEyMCA9IG1bMl1bMF0sIGEyMSA9IG1bMl1bMV0sIGEyMiA9IG1bMl1bMl0sIGEyMyA9IG1bMl1bM10sXFxuICAgICAgYTMwID0gbVszXVswXSwgYTMxID0gbVszXVsxXSwgYTMyID0gbVszXVsyXSwgYTMzID0gbVszXVszXSxcXG5cXG4gICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsXFxuICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxcbiAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcXG4gICAgICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXFxuICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxcbiAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcXG4gICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsXFxuICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxcbiAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcXG4gICAgICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXFxuICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxcbiAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMixcXG5cXG4gICAgICBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XFxuXFxuICByZXR1cm4gbWF0NChcXG4gICAgICBhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDksXFxuICAgICAgYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5LFxcbiAgICAgIGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMyxcXG4gICAgICBhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMsXFxuICAgICAgYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3LFxcbiAgICAgIGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNyxcXG4gICAgICBhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEsXFxuICAgICAgYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxLFxcbiAgICAgIGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNixcXG4gICAgICBhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYsXFxuICAgICAgYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwLFxcbiAgICAgIGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCxcXG4gICAgICBhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYsXFxuICAgICAgYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2LFxcbiAgICAgIGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCxcXG4gICAgICBhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApIC8gZGV0O1xcbn1cXG5cXG5cXG52ZWMzIHJvdGF0ZV8yXzEwKHZlYzMgcCwgZmxvYXQgcmFkaWFuX3gsIGZsb2F0IHJhZGlhbl95LCBmbG9hdCByYWRpYW5feikge1xcclxcbiAgbWF0MyBteCA9IG1hdDMoXFxyXFxuICAgIDEuMCwgMC4wLCAwLjAsXFxyXFxuICAgIDAuMCwgY29zKHJhZGlhbl94KSwgLXNpbihyYWRpYW5feCksXFxyXFxuICAgIDAuMCwgc2luKHJhZGlhbl94KSwgY29zKHJhZGlhbl94KVxcclxcbiAgKTtcXHJcXG4gIG1hdDMgbXkgPSBtYXQzKFxcclxcbiAgICBjb3MocmFkaWFuX3kpLCAwLjAsIHNpbihyYWRpYW5feSksXFxyXFxuICAgIDAuMCwgMS4wLCAwLjAsXFxyXFxuICAgIC1zaW4ocmFkaWFuX3kpLCAwLjAsIGNvcyhyYWRpYW5feSlcXHJcXG4gICk7XFxyXFxuICBtYXQzIG16ID0gbWF0MyhcXHJcXG4gICAgY29zKHJhZGlhbl96KSwgLXNpbihyYWRpYW5feiksIDAuMCxcXHJcXG4gICAgc2luKHJhZGlhbl96KSwgY29zKHJhZGlhbl96KSwgMC4wLFxcclxcbiAgICAwLjAsIDAuMCwgMS4wXFxyXFxuICApO1xcclxcbiAgcmV0dXJuIG14ICogbXkgKiBteiAqIHA7XFxyXFxufVxcclxcblxcblxcblxcclxcbnZlYzMgZ2V0Um90YXRlKHZlYzMgcCkge1xcclxcbiAgcmV0dXJuIHJvdGF0ZV8yXzEwKHAsIHJhZGlhbnModGltZSAvIDYuMCksIHJhZGlhbnModGltZSAvIDcuMCksIHJhZGlhbnModGltZSAvIDguMCkpO1xcclxcbn1cXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBmbG9hdCB1cGRhdGVUaW1lID0gdGltZSAvIDQwMC4wO1xcclxcbiAgdmVjMyBwX3JvdGF0ZSA9IGdldFJvdGF0ZShwb3NpdGlvbik7XFxyXFxuICBmbG9hdCBub2lzZSA9IHNub2lzZV8zXzModmVjMyhwX3JvdGF0ZSAvIDEyLjEgKyB1cGRhdGVUaW1lICogMC41KSk7XFxyXFxuICB2ZWMzIHBfbm9pc2UgPSBwX3JvdGF0ZSArIHBfcm90YXRlICogbm9pc2UgLyAyMC4wICogKG1pbihhY2NlbGVyYXRpb24sIDYuMCkgKyAxLjApO1xcclxcblxcclxcbiAgdlBvc2l0aW9uID0gcF9ub2lzZTtcXHJcXG4gIHZDb2xvciA9IGhzdjJyZ2JfMV84KHZlYzModXBkYXRlVGltZSArIHBvc2l0aW9uLnkgLyA0MDAuMCwgMC4wNSArIG1pbihhY2NlbGVyYXRpb24gLyAxMC4wLCAwLjI1KSwgMS4wKSk7XFxyXFxuICBpbnZlcnRNYXRyaXggPSBpbnZlcnNlXzRfOShtb2RlbE1hdHJpeCk7XFxyXFxuXFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBfbm9pc2UsIDEuMCk7XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnNfYmcgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcbnVuaWZvcm0gZmxvYXQgYWNjZWxlcmF0aW9uO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2UG9zaXRpb247XFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIG1hdDQgaW52ZXJ0TWF0cml4O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZlYzMgbm9ybWFsID0gbm9ybWFsaXplKGNyb3NzKGRGZHgodlBvc2l0aW9uKSwgZEZkeSh2UG9zaXRpb24pKSk7XFxyXFxuICB2ZWMzIGludl9saWdodCA9IG5vcm1hbGl6ZShpbnZlcnRNYXRyaXggKiB2ZWM0KDAuNywgLTAuNywgMC43LCAxLjApKS54eXo7XFxyXFxuICBmbG9hdCBkaWZmID0gKGRvdChub3JtYWwsIGludl9saWdodCkgKyAxLjApIC8gNC4wICsgMC40O1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCh2Q29sb3IgKiBkaWZmLCAxLjApO1xcclxcbn1cXHJcXG5cIjtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEpO1xyXG4gIH07XHJcbiAgdmFyIHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcclxuICB2YXIgaW50ZXJzZWN0cyA9IG51bGw7XHJcbiAgdmFyIGN1YmVfZm9yY2UgPSBuZXcgRm9yY2UzKCk7XHJcbiAgdmFyIGN1YmVfZm9yY2UyID0gbmV3IEZvcmNlMygpO1xyXG4gIHZhciB2YWN0b3JfcmF5Y2FzdCA9IG51bGw7XHJcbiAgY3ViZV9mb3JjZS5tYXNzID0gMS40O1xyXG5cclxuICB2YXIgY3JlYXRlUGxhbmVGb3JSYXltYXJjaGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkoNi4wLCA2LjApO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICB0aW1lOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGltZTI6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWNjZWxlcmF0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzb2x1dGlvbjoge1xyXG4gICAgICAgICAgdHlwZTogJ3YyJyxcclxuICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiB2cyxcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGZzLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICBtZXNoLm5hbWUgPSAnTWV0YWxDdWJlJztcclxuICAgIHJldHVybiBtZXNoO1xyXG4gIH07XHJcbiAgdmFyIGNyZWF0ZUJhY2tncm91bmQgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnlfYmFzZSA9IG5ldyBUSFJFRS5PY3RhaGVkcm9uR2VvbWV0cnkoMzAsIDQpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICBnZW9tZXRyeS5mcm9tR2VvbWV0cnkoZ2VvbWV0cnlfYmFzZSk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWNjZWxlcmF0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogdnNfYmcsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBmc19iZyxcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmcsXHJcbiAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlXHJcbiAgICB9KTtcclxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIG1lc2gubmFtZSA9ICdCYWNrZ3JvdW5kJztcclxuICAgIHJldHVybiBtZXNoO1xyXG4gIH07XHJcblxyXG4gIHZhciBtb3ZlTWV0YWxDdWJlID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICBpZiAoY3ViZV9mb3JjZS5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgPiAwLjEgfHwgIXZlY3RvcikgcmV0dXJuO1xyXG4gICAgcmF5Y2FzdGVyLnNldEZyb21DYW1lcmEodmVjdG9yLCBjYW1lcmEpO1xyXG4gICAgaW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKHNjZW5lLmNoaWxkcmVuKVswXTtcclxuICAgIGlmKGludGVyc2VjdHMgJiYgaW50ZXJzZWN0cy5vYmplY3QubmFtZSA9PSAnTWV0YWxDdWJlJykge1xyXG4gICAgICBjdWJlX2ZvcmNlLmFuY2hvci5jb3B5KFV0aWwuZ2V0UG9sYXJDb29yZChcclxuICAgICAgICBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgtMjAsIDIwKSksXHJcbiAgICAgICAgVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSksXHJcbiAgICAgICAgVXRpbC5nZXRSYW5kb21JbnQoMzAsIDkwKSAvIDEwXHJcbiAgICAgICkpO1xyXG4gICAgICBjdWJlX2ZvcmNlMi5hcHBseUZvcmNlKG5ldyBUSFJFRS5WZWN0b3IzKDEsIDAsIDApKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgcGxhbmUgPSBjcmVhdGVQbGFuZUZvclJheW1hcmNoaW5nKCk7XHJcbiAgdmFyIGJnID0gY3JlYXRlQmFja2dyb3VuZCgpO1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBzY2VuZS5hZGQocGxhbmUpO1xyXG4gICAgICBzY2VuZS5hZGQoYmcpO1xyXG4gICAgICBjYW1lcmEuc2V0UG9sYXJDb29yZCgwLCBVdGlsLmdldFJhZGlhbig5MCksIDI0KTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcGxhbmUuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwbGFuZS5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwbGFuZSk7XHJcbiAgICAgIGJnLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgYmcubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoYmcpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBtb3ZlTWV0YWxDdWJlKHNjZW5lLCBjYW1lcmEsIHZhY3Rvcl9yYXljYXN0KTtcclxuICAgICAgY3ViZV9mb3JjZS5hcHBseUhvb2soMCwgMC4xMik7XHJcbiAgICAgIGN1YmVfZm9yY2UuYXBwbHlEcmFnKDAuMDEpO1xyXG4gICAgICBjdWJlX2ZvcmNlLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGN1YmVfZm9yY2UyLmFwcGx5SG9vaygwLCAwLjAwNSk7XHJcbiAgICAgIGN1YmVfZm9yY2UyLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjdWJlX2ZvcmNlMi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBwbGFuZS5wb3NpdGlvbi5jb3B5KGN1YmVfZm9yY2UudmVsb2NpdHkpO1xyXG4gICAgICBwbGFuZS5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlKys7XHJcbiAgICAgIHBsYW5lLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUyLnZhbHVlICs9IDEgKyBNYXRoLmZsb29yKGN1YmVfZm9yY2UuYWNjZWxlcmF0aW9uLmxlbmd0aCgpICogNCk7XHJcbiAgICAgIHBsYW5lLm1hdGVyaWFsLnVuaWZvcm1zLmFjY2VsZXJhdGlvbi52YWx1ZSA9IGN1YmVfZm9yY2UuYWNjZWxlcmF0aW9uLmxlbmd0aCgpO1xyXG4gICAgICBiZy5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlKys7XHJcbiAgICAgIGJnLm1hdGVyaWFsLnVuaWZvcm1zLmFjY2VsZXJhdGlvbi52YWx1ZSA9IGN1YmVfZm9yY2UyLnZlbG9jaXR5Lmxlbmd0aCgpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24uYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgY2FtZXJhLmZvcmNlLnBvc2l0aW9uLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjYW1lcmEuZm9yY2UucG9zaXRpb24udXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rQXRDZW50ZXIoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuXHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgdmFjdG9yX3JheWNhc3QgPSB2ZWN0b3JfbW91c2VfbW92ZTtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgfSxcclxuICAgIG1vdXNlT3V0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB9LFxyXG4gICAgcmVzaXplV2luZG93OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHBsYW5lLm1hdGVyaWFsLnVuaWZvcm1zLnJlc29sdXRpb24udmFsdWUuc2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIl19
