(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Util = require('./modules/util');
var debounce = require('./modules/debounce');
var Camera = require('./modules/camera');

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

  camera = new Camera();
  camera.init(window.innerWidth, window.innerHeight);
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
  running = new sketch.obj(scene, camera);
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
  renderer.render(scene, camera.obj);
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

},{"./modules/camera":2,"./modules/debounce":3,"./modules/util":10,"./sketches":11}],2:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var Camera = function() {
    this.rad1_base = Util.getRadian(10);
    this.rad1 = this.rad1_base;
    this.rad2 = Util.getRadian(0);
    this.look = new Force3();
    this.rotate_rad1_base = 0;
    this.rotate_rad1 = 0;
    this.rotate_rad2_base = 0;
    this.rotate_rad2 = 0;
    this.range = 1000;
    this.obj;
    Force3.call(this);
  };
  Camera.prototype = Object.create(Force3.prototype);
  Camera.prototype.constructor = Camera;
  Camera.prototype.init = function(width, height) {
    this.obj = new THREE.PerspectiveCamera(35, width / height, 1, 10000);
    this.obj.up.set(0, 1, 0);
    this.position = this.obj.position;
    this.setPositionSpherical();
    this.velocity.copy(this.anchor);
    this.lookAtCenter();
  };
  Camera.prototype.reset = function() {
    this.setPositionSpherical();
    this.lookAtCenter();
  };
  Camera.prototype.resize = function(width, height) {
    this.obj.aspect = width / height;
    this.obj.updateProjectionMatrix();
  };
  Camera.prototype.setPositionSpherical = function() {
    var vector = Util.getSpherical(this.rad1, this.rad2, this.range);
    this.anchor.copy(vector);
  };
  Camera.prototype.lookAtCenter = function() {
    this.obj.lookAt({
      x: 0,
      y: 0,
      z: 0
    });
  };
  return Camera;
};

module.exports = exports();

},{"../modules/force3":5,"../modules/util":10}],3:[function(require,module,exports){
module.exports = function(object, eventType, callback){
  var timer;

  object.addEventListener(eventType, function(event) {
    clearTimeout(timer);
    timer = setTimeout(function(){
      callback(event);
    }, 500);
  }, false);
};

},{}],4:[function(require,module,exports){
var Util = require('../modules/util');

var exports = function(){
  var Force2 = function() {
    this.position = new THREE.Vector2();
    this.velocity = new THREE.Vector2();
    this.acceleration = new THREE.Vector2();
    this.anchor = new THREE.Vector2();
    this.mass = 1;
  };
  
  Force2.prototype.updatePosition = function() {
    this.position.copy(this.velocity);
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

},{"../modules/util":10}],5:[function(require,module,exports){
var Util = require('../modules/util');

var exports = function(){
  var Force = function() {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.anchor = new THREE.Vector3();
    this.mass = 1;
  };
  
  Force.prototype.updatePosition = function() {
    this.position.copy(this.velocity);
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

},{"../modules/util":10}],6:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var HemiLight = function() {
    this.rad1 = Util.getRadian(0);
    this.rad2 = Util.getRadian(0);
    this.range = 1000;
    this.hex1 = 0xffffff;
    this.hex2 = 0x333333;
    this.intensity = 1;
    this.obj;
    Force3.call(this);
  };
  HemiLight.prototype = Object.create(Force3.prototype);
  HemiLight.prototype.constructor = HemiLight;
  HemiLight.prototype.init = function(hex1, hex2, intensity) {
    if (hex1) this.hex1 = hex1;
    if (hex2) this.hex2 = hex2;
    if (intensity) this.intensity = intensity;
    this.obj = new THREE.HemisphereLight(this.hex1, this.hex2, this.intensity);
    this.position = this.obj.position;
    this.setPositionSpherical();
  };
  HemiLight.prototype.setPositionSpherical = function() {
    var points = Util.getSpherical(this.rad1, this.rad2, this.range);
    this.position.copy(points);
  };
  return HemiLight;
};

module.exports = exports();

},{"../modules/force3":5,"../modules/util":10}],7:[function(require,module,exports){
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
    this.position = vector.clone();
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

},{"../modules/force3":5,"../modules/util":10}],8:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var PointLight = function() {
    this.rad1 = Util.getRadian(0);
    this.rad2 = Util.getRadian(0);
    this.range = 200;
    this.hex = 0xffffff;
    this.intensity = 1;
    this.distance = 2000;
    this.decay = 1;
    this.obj;
    Force3.call(this);
  };
  PointLight.prototype = Object.create(Force3.prototype);
  PointLight.prototype.constructor = PointLight;
  PointLight.prototype.init = function(hex, distance) {
    if (hex) this.hex = hex;
    if (distance) this.distance = distance;
    this.obj = new THREE.PointLight(this.hex, this.intensity, this.distance, this.decay);
    this.position = this.obj.position;
    this.setPositionSpherical();
  };
  PointLight.prototype.setPositionSpherical = function() {
    var points = Util.getSpherical(this.rad1, this.rad2, this.range);
    this.position.copy(points);
  };
  return PointLight;
};

module.exports = exports();

},{"../modules/force3":5,"../modules/util":10}],9:[function(require,module,exports){
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
    this.position = this.obj.position;
  };
  Points.prototype.updatePoints = function() {
    this.obj.geometry.attributes.position.needsUpdate = true;
    this.obj.geometry.attributes.vertexOpacity.needsUpdate = true;
    this.obj.geometry.attributes.size.needsUpdate = true;
    this.obj.geometry.attributes.customColor.needsUpdate = true;
  };
  return Points;
};

module.exports = exports();

},{"../modules/force3":5,"../modules/util":10}],10:[function(require,module,exports){
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
  getSpherical: function(rad1, rad2, r) {
    var x = Math.cos(rad1) * Math.cos(rad2) * r;
    var z = Math.cos(rad1) * Math.sin(rad2) * r;
    var y = Math.sin(rad1) * r;
    return new THREE.Vector3(x, y, z);
  }
};

module.exports = exports;

},{}],11:[function(require,module,exports){
module.exports = [
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

},{"./sketches/comet":12,"./sketches/distort":13,"./sketches/fire_ball":14,"./sketches/gallery":15,"./sketches/hole":16,"./sketches/hyper_space":17,"./sketches/image_data":18,"./sketches/metal_cube":19}],12:[function(require,module,exports){
var Util = require('../modules/util');
var Force2 = require('../modules/force2');
var Mover = require('../modules/mover');
var Points = require('../modules/points.js');
var HemiLight = require('../modules/hemiLight');
var PointLight = require('../modules/pointLight');

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
  var hemi_light = new HemiLight();
  var comet_light1 = new PointLight();
  var comet_light2 = new PointLight();
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
        mover.updatePosition();
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
      positions[i * 3 + 0] = mover.position.x - points.position.x;
      positions[i * 3 + 1] = mover.position.y - points.position.y;
      positions[i * 3 + 2] = mover.position.z - points.position.z;
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
        var vector = Util.getSpherical(rad1, rad2, range);
        var force = Util.getSpherical(rad1, rad2, range / 20);
        var h = Util.getRandomInt(comet_color_h - color_diff, comet_color_h + color_diff) - plus_acceleration / 1.5;
        var s = Util.getRandomInt(60, 80);
        vector.add(points.position);
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
    return Util.getSpherical(points.rad1, points.rad2, 350);
  };

  var rotateCometColor = function() {
    var radius = comet_radius * 0.8;
    comet_light1.obj.position.copy(Util.getSpherical(Util.getRadian(0),  Util.getRadian(0), radius).add(points.position));
    comet_light2.obj.position.copy(Util.getSpherical(Util.getRadian(180), Util.getRadian(0), radius).add(points.position));
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
    comet_scale.updatePosition();
    comet.scale.set(1 + comet_scale.position.x, 1 + comet_scale.position.x, 1 + comet_scale.position.x);
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
        positions[i * 3 + 0] = mover.position.x;
        positions[i * 3 + 1] = mover.position.y;
        positions[i * 3 + 2] = mover.position.z;
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
      hemi_light.init(
        new THREE.Color('hsl(' + (comet_color_h - color_diff) + ', 50%, 60%)').getHex(),
        new THREE.Color('hsl(' + (comet_color_h + color_diff) + ', 50%, 60%)').getHex()
      );
      scene.add(hemi_light.obj);
      comet_light1.init(new THREE.Color('hsl(' + (comet_color_h - color_diff) + ', 60%, 50%)'));
      scene.add(comet_light1.obj);
      comet_light2.init(new THREE.Color('hsl(' + (comet_color_h + color_diff) + ', 60%, 50%)'));
      scene.add(comet_light2.obj);
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
      scene.remove(hemi_light.obj);
      scene.remove(comet_light1.obj);
      scene.remove(comet_light2.obj);
      movers = [];
    },
    render: function(scene, camera) {
      accelerateComet();
      points.velocity = rotateComet();
      if (track_points === true) {
        camera.anchor.copy(
          points.velocity.clone().add(
            points.velocity.clone().sub(points.position)
            .normalize().multiplyScalar(-400)
          )
        );
        camera.anchor.y += points.position.y * 2;
        camera.look.anchor.copy(points.position);
      }
      points.updatePosition();
      comet.position.copy(points.position);
      hemi_light.obj.color.setHSL((comet_color_h - color_diff - plus_acceleration / 1.5) / 360, 0.5, 0.6);
      hemi_light.obj.groundColor.setHSL((comet_color_h + color_diff - plus_acceleration / 1.5) / 360, 0.5, 0.6);
      comet_light1.obj.position.copy(points.velocity);
      comet_light1.obj.color.setHSL((comet_color_h - color_diff - plus_acceleration / 1.5) / 360, 0.5, 0.6);
      comet_light2.obj.position.copy(points.velocity);
      comet_light2.obj.color.setHSL((comet_color_h + color_diff - plus_acceleration / 1.5) / 360, 0.5, 0.6);
      activateMover();
      updateMover();
      camera.applyHook(0, 0.025);
      camera.applyDrag(0.2);
      camera.updateVelocity();
      camera.updatePosition();
      camera.look.applyHook(0, 0.2);
      camera.look.applyDrag(0.4);
      camera.look.updateVelocity();
      camera.look.updatePosition();
      camera.obj.lookAt(camera.look.position);
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
          camera.anchor.set(1200, 1200, 0);
          camera.look.anchor.set(0, 0, 0);
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

},{"../modules/force2":4,"../modules/hemiLight":6,"../modules/mover":7,"../modules/pointLight":8,"../modules/points.js":9,"../modules/util":10}],13:[function(require,module,exports){
var Util = require('../modules/util');
var Camera = require('../modules/camera');
var Force2 = require('../modules/force2');

var vs = "#define GLSLIFY 1\nuniform float time;\r\nuniform float radius;\r\nuniform float distort;\r\n\r\nvarying vec3 vColor;\r\n\r\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2_1(vec4 x) {\n     return mod289_2_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_2_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_2_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_2_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_2_5;\n  vec3 i1 = min( g_2_5.xyz, l.zxy );\n  vec3 i2 = max( g_2_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_2_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2_0(i);\n  vec4 p = permute_2_1( permute_2_1( permute_2_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_2_4.wyz - D_2_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_2_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_2_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_2_6.xy,h.z);\n  vec3 p3 = vec3(a1_2_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_2_2(vec4(dot(p0_2_7,p0_2_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_2_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_2_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 hsv2rgb_1_8(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n\r\nvoid main() {\r\n  float updateTime = time / 1000.0;\r\n  float noise = snoise_2_3(vec3(position / 400.1 + updateTime * 5.0));\r\n  vec4 mvPosition = modelViewMatrix * vec4(position * (noise * pow(distort, 2.0) + radius), 1.0);\r\n  vec3 light = vec3(0.5);\r\n  light += (dot(vec3(0.0, 1.0, 0.0), normal) + 1.0) / 2.0 * vec3(1.0) * 0.5;\r\n\r\n  vColor = hsv2rgb_1_8(vec3(noise * distort * 0.3 + updateTime, 0.2, 1.0)) * light;\r\n\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nvarying vec3 vColor;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(vColor, 1.0);\r\n}\r\n";
var vs_pp = "#define GLSLIFY 1\nvarying vec2 vUv;\r\n\r\nvoid main(void) {\r\n  vUv = uv;\r\n  gl_Position = vec4(position, 1.0);\r\n}\r\n";
var fs_pp = "#define GLSLIFY 1\nuniform float time;\r\nuniform vec2 resolution;\r\nuniform float acceleration;\r\nuniform sampler2D texture;\r\n\r\nconst float blur = 16.0;\r\n\r\nvarying vec2 vUv;\r\n\r\nfloat random2_1_0(vec2 c){\r\n    return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);\r\n}\r\n\n\n\r\nvec2 diffUv(float v, float diff) {\r\n  return vUv + (vec2(v, 0.0) * diff + vec2(v * 2.0, 0.0)) / resolution;\r\n}\r\n\r\nfloat randomNoise(vec2 p) {\r\n  return (random2_1_0(p - vec2(sin(time))) * 2.0 - 1.0) * max(length(acceleration), 0.05);\r\n}\r\n\r\nvoid main() {\r\n  float diff = 300.0 * length(acceleration);\r\n  vec2 uv_r = diffUv(0.0, diff);\r\n  vec2 uv_g = diffUv(1.0, diff);\r\n  vec2 uv_b = diffUv(-1.0, diff);\r\n  float r = texture2D(texture, uv_r).r + randomNoise(uv_r);\r\n  float g = texture2D(texture, uv_g).g + randomNoise(uv_g);\r\n  float b = texture2D(texture, uv_b).b + randomNoise(uv_b);\r\n  gl_FragColor = vec4(r, g, b, 1.0);\r\n}\r\n";

var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };
  var sphere = null;
  var bg = null;
  var light = new THREE.HemisphereLight(0xffffff, 0x666666, 1);
  var sub_scene = new THREE.Scene();
  var sub_camera = new Camera();
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
      uniforms: {
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
      },
      vertexShader: vs,
      fragmentShader: fs,
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
      sub_camera.init(window.innerWidth, window.innerHeight);
      document.body.className = 'bg-white';
      sphere = createSphere();
      sub_scene.add(sphere);
      bg = createBackground();
      sub_scene.add(bg);
      sub_scene.add(sub_light);
      sub_camera.anchor.set(1800, 1800, 0);
      sub_camera.look.anchor.set(0, 0, 0);

      framebuffer = createPlaneForPostProcess();
      scene.add(framebuffer);
      scene.add(light);
      camera.anchor.set(1800, 1800, 0);
      camera.look.anchor.set(0, 0, 0);
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
      force.updatePosition();
      // console.log(force.acceleration.length());
      sphere.material.uniforms.time.value += time_unit;
      sphere.material.uniforms.radius.value = force.position.x;
      sphere.material.uniforms.distort.value = force.position.x / 2 - 0.1;
      sub_camera.applyHook(0, 0.025);
      sub_camera.applyDrag(0.2);
      sub_camera.updateVelocity();
      sub_camera.updatePosition();
      sub_camera.look.applyHook(0, 0.2);
      sub_camera.look.applyDrag(0.4);
      sub_camera.look.updateVelocity();
      sub_camera.look.updatePosition();
      sub_camera.obj.lookAt(sub_camera.look.position);

      framebuffer.material.uniforms.time.value += time_unit;
      framebuffer.material.uniforms.acceleration.value = force.acceleration.length();
      camera.applyHook(0, 0.025);
      camera.applyDrag(0.2);
      camera.updateVelocity();
      camera.updatePosition();
      camera.look.applyHook(0, 0.2);
      camera.look.applyDrag(0.4);
      camera.look.updateVelocity();
      camera.look.updatePosition();
      camera.obj.lookAt(camera.look.position);

      renderer.render(sub_scene, sub_camera.obj, render_target);
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

},{"../modules/camera":2,"../modules/force2":4,"../modules/util":10}],14:[function(require,module,exports){
var Util = require('../modules/util');
var Mover = require('../modules/mover');
var Points = require('../modules/points.js');
var Light = require('../modules/pointLight');

var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };
  var movers_num = 10000;
  var movers = [];
  var points = new Points();
  var light = new Light();
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
        mover.updatePosition();
        mover.position.sub(points.position);
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
      positions[i * 3 + 0] = mover.position.x - points.position.x;
      positions[i * 3 + 1] = mover.position.y - points.position.x;
      positions[i * 3 + 2] = mover.position.z - points.position.x;
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
        var force = Util.getSpherical(rad1, rad2, range);
        vector.add(points.position);
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
    points.updatePosition();
    light.obj.position.copy(points.velocity);
  };

  var movePoints = function(vector) {
    var y = vector.y * document.body.clientHeight / 3;
    var z = vector.x * document.body.clientWidth / -3;
    points.anchor.y = y;
    points.anchor.z = z;
    light.anchor.y = y;
    light.anchor.z = z;
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
        positions[i * 3 + 0] = mover.position.x;
        positions[i * 3 + 1] = mover.position.y;
        positions[i * 3 + 2] = mover.position.z;
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
      light.init(0xff6600, 1800);
      scene.add(light.obj);
      bg = createBackground();
      scene.add(bg);
      camera.rad1_base = Util.getRadian(25);
      camera.rad1 = camera.rad1_base;
      camera.rad2 = Util.getRadian(0);
      camera.setPositionSpherical();
    },
    remove: function(scene) {
      points.geometry.dispose();
      points.material.dispose();
      scene.remove(points.obj);
      scene.remove(light.obj);
      bg.geometry.dispose();
      bg.material.dispose();
      scene.remove(bg);
      movers = [];
    },
    render: function(scene, camera) {
      points.applyHook(0, 0.08);
      points.applyDrag(0.2);
      points.updateVelocity();
      points.updatePosition();
      light.applyHook(0, 0.08);
      light.applyDrag(0.2);
      light.updateVelocity();
      light.updatePosition();
      activateMover();
      updateMover();
      camera.applyHook(0, 0.004);
      camera.applyDrag(0.1);
      camera.updateVelocity();
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
      light.anchor.set(0, 0, 0);
    },
    mouseOut: function(scene, camera) {
      this.touchEnd(scene, camera)
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/mover":7,"../modules/pointLight":8,"../modules/points.js":9,"../modules/util":10}],15:[function(require,module,exports){
var Util = require('../modules/util');
var HemiLight = require('../modules/hemiLight');
var Force3 = require('../modules/force3');

var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };
  var images = [];
  var images_num = 300;
  var hemi_light = new HemiLight();
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
    this.position = this.obj.position;
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
      image.anchor.copy(vector);
      scene.add(image.obj);
      images.push(image);
    }
  };

  var pickImage = function(scene, camera, vector) {
    if (get_near) return;
    var intersects = null;
    raycaster.setFromCamera(vector, camera.obj);
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
    camera.anchor.set(Math.cos(image.rad) * 780, image.position.y, Math.sin(image.rad) * 780);
    camera.look.anchor.copy(image.position);
    resetPickImage();
  };

  var resetPickImage = function() {
    document.body.classList.remove('is-pointed');
    picked_id = -1;
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      initImages(scene);
      hemi_light.init(0xffffff, 0xffffff);
      scene.add(hemi_light.obj);
      camera.anchor.set(0, 0, 0);
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
      scene.remove(hemi_light.obj);
      images = [];
      get_near = false;
      document.body.classList.remove('is-pointed');
    },
    render: function(scene, camera) {
      for (var i = 0; i < images_num; i++) {
        images[i].applyHook(0, 0.14);
        images[i].applyDrag(0.4);
        images[i].updateVelocity();
        images[i].updatePosition();
        images[i].obj.lookAt({
          x: 0,
          y: images[i].position.y,
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
      camera.applyHook(0, 0.08);
      camera.applyDrag(0.4);
      camera.updateVelocity();
      camera.updatePosition();
      if (get_near === false) {
        camera.look.anchor.copy(Util.getSpherical(camera.rotate_rad1, camera.rotate_rad2, 1000));
      }
      camera.look.applyHook(0, 0.08);
      camera.look.applyDrag(0.4);
      camera.look.updateVelocity();
      camera.look.updatePosition();
      camera.obj.lookAt(camera.look.position);
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
        camera.anchor.set(0, 0, 0);
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

},{"../modules/force3":5,"../modules/hemiLight":6,"../modules/util":10}],16:[function(require,module,exports){
var Util = require('../modules/util');
var Camera = require('../modules/camera');

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
  var sub_camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  var render_target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
  var framebuffer = null;

  var sub_scene2 = new THREE.Scene();
  var sub_camera2 = new Camera();
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

      sub_camera2.init(window.innerWidth, window.innerHeight);
      sub_camera2.anchor.set(1000, 300, 0);
      sub_camera2.look.anchor.set(0, 0, 0);
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
      camera.anchor.set(1000, -300, 0);
      camera.look.anchor.set(0, 0, 0);
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
      force.updatePosition();
      camera.applyHook(0, 0.025);
      camera.applyDrag(0.2);
      camera.updateVelocity();
      camera.updatePosition();
      camera.look.anchor.y = Math.sin(points.material.uniforms.time.value / 100) * 100;
      camera.look.applyHook(0, 0.2);
      camera.look.applyDrag(0.4);
      camera.look.updateVelocity();
      camera.look.updatePosition();
      camera.obj.lookAt(camera.look.position);
      sub_camera2.applyHook(0, 0.1);
      sub_camera2.applyDrag(0.2);
      sub_camera2.updateVelocity();
      sub_camera2.updatePosition();
      sub_camera2.look.applyHook(0, 0.2);
      sub_camera2.look.applyDrag(0.4);
      sub_camera2.look.updateVelocity();
      sub_camera2.look.updatePosition();
      sub_camera2.obj.lookAt(sub_camera2.look.position);
      renderer.render(sub_scene2, sub_camera2.obj, render_target2);
      renderer.render(sub_scene, sub_camera, render_target);
    },
    touchStart: function(scene, camera, vector) {
      force.anchor.set(2, 40);
      sub_camera2.anchor.set(600, -300, 0);
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      force.anchor.set(1, 0);
      sub_camera2.anchor.set(1000, 300, 0);
    },
    mouseOut: function(scene, camera) {
      force.anchor.set(1, 0);
      sub_camera2.anchor.set(1000, 300, 0);
    },
    resizeWindow: function(scene, camera) {
      render_target.setSize(window.innerWidth, window.innerHeight);
      render_target2.setSize(window.innerWidth, window.innerHeight);
      sub_camera.aspect = window.innerWidth / window.innerHeight;
      sub_camera.updateProjectionMatrix();
      sub_camera2.resize(window.innerWidth, window.innerHeight);
      points.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
      framebuffer.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/camera":2,"../modules/force2":4,"../modules/util":10}],17:[function(require,module,exports){
var Util = require('../modules/util');
var Mover = require('../modules/mover');
var Points = require('../modules/points.js');
var Light = require('../modules/pointLight');

var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

var exports = function(){
  var Sketch = function(scene, camera) {
    this.init(scene, camera);
  };
  var movers_num = 20000;
  var movers = [];
  var points = new Points();
  var light = new Light();
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
        mover.updatePosition();
        if (mover.a < 0.8) {
          mover.a += 0.02;
        }
        if (mover.position.x > 1000) {
          mover.init(new THREE.Vector3(0, 0, 0));
          mover.time = 0;
          mover.a = 0.0;
          mover.inactivate();
        }
      }
      positions[i * 3 + 0] = mover.position.x;
      positions[i * 3 + 1] = mover.position.y;
      positions[i * 3 + 2] = mover.position.z;
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
        vector.add(points.position);
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
    points.updatePosition();
    light.obj.position.copy(points.velocity);
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
        positions[i * 3 + 0] = mover.position.x;
        positions[i * 3 + 1] = mover.position.y;
        positions[i * 3 + 2] = mover.position.z;
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
      light.init();
      scene.add(light.obj);
      camera.anchor = new THREE.Vector3(800, 0, 0);
    },
    remove: function(scene) {
      points.geometry.dispose();
      points.material.dispose();
      scene.remove(points.obj);
      scene.remove(light.obj);
      movers = [];
    },
    render: function(scene, camera) {
      changeGravity();
      activateMover();
      updateMover();
      camera.applyHook(0, 0.008);
      camera.applyDrag(0.1);
      camera.updateVelocity();
      camera.updatePosition();
      camera.lookAtCenter();
    },
    touchStart: function(scene, camera, vector) {
      is_touched = true;
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      camera.anchor.z = vector_mouse_move.x * 120;
      camera.anchor.y = vector_mouse_move.y * -120;
      //camera.lookAtCenter();
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      camera.anchor.z = 0;
      camera.anchor.y = 0;
      is_touched = false;
    },
    mouseOut: function(scene, camera) {
      this.touchEnd(scene, camera)
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/mover":7,"../modules/pointLight":8,"../modules/points.js":9,"../modules/util":10}],18:[function(require,module,exports){
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
      mover.applyForce(Util.getSpherical(rad1, rad2, scalar));
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
      mover.updatePosition();
      mover.position.sub(points.position);
      positions[i * 3 + 0] = mover.position.x - points.position.x;
      positions[i * 3 + 1] = mover.position.y - points.position.x;
      positions[i * 3 + 2] = mover.position.z - points.position.x;
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
      camera.range = 1400;
      camera.rad1_base = Util.getRadian(0);
      camera.rad1 = camera.rad1_base;
      camera.rad2 = Util.getRadian(0);
      camera.setPositionSpherical();
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
      camera.applyHook(0, 0.025);
      camera.applyDrag(0.2);
      camera.updateVelocity();
      camera.updatePosition();
      camera.lookAtCenter();

    },
    touchStart: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      applyForceToPoints();
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      camera.anchor.z = vector_mouse_move.x * 1000;
      camera.anchor.y = vector_mouse_move.y * -1000;
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      camera.anchor.z = 0;
      camera.anchor.y = 0;
    },
    mouseOut: function(scene, camera) {
      this.touchEnd(scene, camera)
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/mover":7,"../modules/points.js":9,"../modules/util":10}],19:[function(require,module,exports){
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
    raycaster.setFromCamera(vector, camera.obj);
    intersects = raycaster.intersectObjects(scene.children)[0];
    if(intersects && intersects.object.name == 'MetalCube') {
      cube_force.anchor.copy(Util.getSpherical(
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

      camera.range = 24;
      camera.rad1_base = Util.getRadian(0);
      camera.rad1 = camera.rad1_base;
      camera.rad2 = Util.getRadian(90);
      camera.setPositionSpherical();
    },
    remove: function(scene, camera) {
      plane.geometry.dispose();
      plane.material.dispose();
      scene.remove(plane);
      bg.geometry.dispose();
      bg.material.dispose();
      scene.remove(bg);
      camera.range = 1000;
    },
    render: function(scene, camera) {
      moveMetalCube(scene, camera, vactor_raycast);
      cube_force.applyHook(0, 0.12);
      cube_force.applyDrag(0.01);
      cube_force.updateVelocity();
      cube_force.updatePosition();
      cube_force2.applyHook(0, 0.005);
      cube_force2.applyDrag(0.2);
      cube_force2.updateVelocity();
      cube_force2.updatePosition();
      plane.position.copy(cube_force.position);
      plane.material.uniforms.time.value++;
      plane.material.uniforms.time2.value += 1 + Math.floor(cube_force.acceleration.length() * 4);
      plane.material.uniforms.acceleration.value = cube_force.acceleration.length();
      plane.lookAt(camera.obj.position);
      bg.material.uniforms.time.value++;
      bg.material.uniforms.acceleration.value = cube_force2.position.length();
      camera.setPositionSpherical();
      camera.applyHook(0, 0.025);
      camera.applyDrag(0.2);
      camera.updateVelocity();
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

},{"../modules/force3":5,"../modules/util":10}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2NhbWVyYS5qcyIsInNyYy9qcy9tb2R1bGVzL2RlYm91bmNlLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UyLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UzLmpzIiwic3JjL2pzL21vZHVsZXMvaGVtaUxpZ2h0LmpzIiwic3JjL2pzL21vZHVsZXMvbW92ZXIuanMiLCJzcmMvanMvbW9kdWxlcy9wb2ludExpZ2h0LmpzIiwic3JjL2pzL21vZHVsZXMvcG9pbnRzLmpzIiwic3JjL2pzL21vZHVsZXMvdXRpbC5qcyIsInNyYy9qcy9za2V0Y2hlcy5qcyIsInNyYy9qcy9za2V0Y2hlcy9jb21ldC5qcyIsInNyYy9qcy9za2V0Y2hlcy9kaXN0b3J0LmpzIiwic3JjL2pzL3NrZXRjaGVzL2ZpcmVfYmFsbC5qcyIsInNyYy9qcy9za2V0Y2hlcy9nYWxsZXJ5LmpzIiwic3JjL2pzL3NrZXRjaGVzL2hvbGUuanMiLCJzcmMvanMvc2tldGNoZXMvaHlwZXJfc3BhY2UuanMiLCJzcmMvanMvc2tldGNoZXMvaW1hZ2VfZGF0YS5qcyIsInNyYy9qcy9za2V0Y2hlcy9tZXRhbF9jdWJlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9kZWJvdW5jZScpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NhbWVyYScpO1xyXG5cclxudmFyIHZlY3Rvcl9tb3VzZV9kb3duID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxudmFyIHZlY3Rvcl9tb3VzZV9tb3ZlID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxudmFyIHZlY3Rvcl9tb3VzZV9lbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xyXG5cclxudmFyIGNhbnZhcyA9IG51bGw7XHJcbnZhciByZW5kZXJlciA9IG51bGw7XHJcbnZhciBzY2VuZSA9IG51bGw7XHJcbnZhciBjYW1lcmEgPSBudWxsO1xyXG5cclxudmFyIHJ1bm5pbmcgPSBudWxsO1xyXG52YXIgc2tldGNoZXMgPSByZXF1aXJlKCcuL3NrZXRjaGVzJyk7XHJcbnZhciBza2V0Y2hfaWQgPSAwO1xyXG5cclxudmFyIG1ldGFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ldGEnKTtcclxudmFyIGJ0bl90b2dnbGVfbWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4tc3dpdGNoLW1lbnUnKTtcclxudmFyIG1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVudScpO1xyXG52YXIgc2VsZWN0X3NrZXRjaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3Qtc2tldGNoJyk7XHJcbnZhciBza2V0Y2hfdGl0bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2tldGNoLXRpdGxlJyk7XHJcbnZhciBza2V0Y2hfZGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5za2V0Y2gtZGF0ZScpO1xyXG52YXIgc2tldGNoX2Rlc2NyaXB0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNrZXRjaC1kZXNjcmlwdGlvbicpO1xyXG5cclxudmFyIGluaXRUaHJlZSA9IGZ1bmN0aW9uKCkge1xyXG4gIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcclxuICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcclxuICAgIGFudGlhbGlhczogdHJ1ZSxcclxuICAgIHRvbmVNYXBwaW5nOiBUSFJFRS5Ob1RvbmVNYXBwaW5nLFxyXG4gIH0pO1xyXG4gIGlmICghcmVuZGVyZXIpIHtcclxuICAgIGFsZXJ0KCdUaHJlZS5qc+OBruWIneacn+WMluOBq+WkseaVl+OBl+OBvuOBl+OBn+OAgicpO1xyXG4gIH1cclxuICByZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gIGNhbnZhcy5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcclxuICByZW5kZXJlci5zZXRDbGVhckNvbG9yKDB4MDAwMDAwLCAxLjApO1xyXG5cclxuICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG5cclxuICBjYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XHJcbiAgY2FtZXJhLmluaXQod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbn07XHJcblxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gIHNldFNrZXRjaElkKCk7XHJcbiAgYnVpbGRNZW51KCk7XHJcbiAgaW5pdFRocmVlKCk7XHJcbiAgc3RhcnRSdW5Ta2V0Y2goc2tldGNoZXNbc2tldGNoZXMubGVuZ3RoIC0gc2tldGNoX2lkXSk7XHJcbiAgcmVuZGVybG9vcCgpO1xyXG4gIHNldEV2ZW50KCk7XHJcbiAgZGVib3VuY2Uod2luZG93LCAncmVzaXplJywgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgcmVzaXplUmVuZGVyZXIoKTtcclxuICB9KTtcclxufTtcclxuXHJcbnZhciBnZXRQYXJhbWV0ZXJCeU5hbWUgPSBmdW5jdGlvbihuYW1lKSB7XHJcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCBcIlxcXFxbXCIpLnJlcGxhY2UoL1tcXF1dLywgXCJcXFxcXVwiKTtcclxuICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKFwiW1xcXFw/Jl1cIiArIG5hbWUgKyBcIj0oW14mI10qKVwiKTtcclxuICB2YXIgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uc2VhcmNoKTtcclxuICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/IFwiXCIgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgXCIgXCIpKTtcclxufTtcclxuXHJcbnZhciBzZXRTa2V0Y2hJZCA9IGZ1bmN0aW9uKCkge1xyXG4gIHNrZXRjaF9pZCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnc2tldGNoX2lkJyk7XHJcbiAgaWYgKHNrZXRjaF9pZCA9PSBudWxsIHx8IHNrZXRjaF9pZCA+IHNrZXRjaGVzLmxlbmd0aCB8fCBza2V0Y2hfaWQgPCAxKSB7XHJcbiAgICBza2V0Y2hfaWQgPSBza2V0Y2hlcy5sZW5ndGg7XHJcbiAgfVxyXG59O1xyXG5cclxudmFyIGJ1aWxkTWVudSA9IGZ1bmN0aW9uKCkge1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2tldGNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBza2V0Y2ggPSBza2V0Y2hlc1tpXTtcclxuICAgIHZhciBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgZG9tLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcsIGkpO1xyXG4gICAgZG9tLmlubmVySFRNTCA9ICc8c3Bhbj4nICsgc2tldGNoLm5hbWUgKyAnPC9zcGFuPic7XHJcbiAgICBkb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgc3dpdGNoU2tldGNoKHNrZXRjaGVzW3RoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JyldKTtcclxuICAgIH0pO1xyXG4gICAgc2VsZWN0X3NrZXRjaC5hcHBlbmRDaGlsZChkb20pO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciBzdGFydFJ1blNrZXRjaCA9IGZ1bmN0aW9uKHNrZXRjaCkge1xyXG4gIHJ1bm5pbmcgPSBuZXcgc2tldGNoLm9iaihzY2VuZSwgY2FtZXJhKTtcclxuICBza2V0Y2hfdGl0bGUuaW5uZXJIVE1MID0gc2tldGNoLm5hbWU7XHJcbiAgc2tldGNoX2RhdGUuaW5uZXJIVE1MID0gKHNrZXRjaC51cGRhdGUubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdwb3N0ZWQ6ICcgKyBza2V0Y2gucG9zdGVkICsgJyAvIHVwZGF0ZTogJyArIHNrZXRjaC51cGRhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdwb3N0ZWQ6ICcgKyBza2V0Y2gucG9zdGVkO1xyXG4gIHNrZXRjaF9kZXNjcmlwdGlvbi5pbm5lckhUTUwgPSBza2V0Y2guZGVzY3JpcHRpb247XHJcbn07XHJcblxyXG52YXIgc3dpdGNoU2tldGNoID0gZnVuY3Rpb24oc2tldGNoKSB7XHJcbiAgcnVubmluZy5yZW1vdmUoc2NlbmUsIGNhbWVyYSk7XHJcbiAgc3RhcnRSdW5Ta2V0Y2goc2tldGNoKTtcclxuICBzd2l0Y2hNZW51KCk7XHJcbn07XHJcblxyXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgcmVuZGVyZXIuY2xlYXIoKTtcclxuICBydW5uaW5nLnJlbmRlcihzY2VuZSwgY2FtZXJhLCByZW5kZXJlcik7XHJcbiAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEub2JqKTtcclxufTtcclxuXHJcbnZhciByZW5kZXJsb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcmxvb3ApO1xyXG4gIHJlbmRlcigpO1xyXG59O1xyXG5cclxudmFyIHJlc2l6ZVJlbmRlcmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICBjYW1lcmEucmVzaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gIHJlc2l6ZVdpbmRvdygpO1xyXG59O1xyXG5cclxudmFyIHNldEV2ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hTdGFydChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZLCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaE1vdmUoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoRW5kKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaFN0YXJ0KGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZLCB0cnVlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoTW92ZShldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSwgdHJ1ZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoRW5kKGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFksIHRydWUpO1xyXG4gIH0pO1xyXG5cclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgbW91c2VPdXQoKTtcclxuICB9KTtcclxuXHJcbiAgYnRuX3RvZ2dsZV9tZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBzd2l0Y2hNZW51KCk7XHJcbiAgfSk7XHJcbn07XHJcblxyXG52YXIgdHJhbnNmb3JtVmVjdG9yMmQgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICB2ZWN0b3IueCA9ICh2ZWN0b3IueCAvIHdpbmRvdy5pbm5lcldpZHRoKSAqIDIgLSAxO1xyXG4gIHZlY3Rvci55ID0gLSAodmVjdG9yLnkgLyB3aW5kb3cuaW5uZXJIZWlnaHQpICogMiArIDE7XHJcbn07XHJcblxyXG52YXIgdG91Y2hTdGFydCA9IGZ1bmN0aW9uKHgsIHksIHRvdWNoX2V2ZW50KSB7XHJcbiAgdmVjdG9yX21vdXNlX2Rvd24uc2V0KHgsIHkpO1xyXG4gIHRyYW5zZm9ybVZlY3RvcjJkKHZlY3Rvcl9tb3VzZV9kb3duKTtcclxuICBpZiAocnVubmluZy50b3VjaFN0YXJ0KSBydW5uaW5nLnRvdWNoU3RhcnQoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24pO1xyXG59O1xyXG5cclxudmFyIHRvdWNoTW92ZSA9IGZ1bmN0aW9uKHgsIHksIHRvdWNoX2V2ZW50KSB7XHJcbiAgdmVjdG9yX21vdXNlX21vdmUuc2V0KHgsIHkpO1xyXG4gIHRyYW5zZm9ybVZlY3RvcjJkKHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxuICBpZiAocnVubmluZy50b3VjaE1vdmUpIHJ1bm5pbmcudG91Y2hNb3ZlKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSk7XHJcbn07XHJcblxyXG52YXIgdG91Y2hFbmQgPSBmdW5jdGlvbih4LCB5LCB0b3VjaF9ldmVudCkge1xyXG4gIHZlY3Rvcl9tb3VzZV9lbmQuc2V0KHgsIHkpO1xyXG4gIGlmIChydW5uaW5nLnRvdWNoRW5kKSBydW5uaW5nLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpO1xyXG59O1xyXG5cclxudmFyIG1vdXNlT3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmVjdG9yX21vdXNlX2VuZC5zZXQoMCwgMCk7XHJcbiAgaWYgKHJ1bm5pbmcubW91c2VPdXQpIHJ1bm5pbmcubW91c2VPdXQoc2NlbmUsIGNhbWVyYSk7XHJcbn07XHJcblxyXG52YXIgc3dpdGNoTWVudSA9IGZ1bmN0aW9uKCkge1xyXG4gIGJ0bl90b2dnbGVfbWVudS5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKTtcclxuICBtZW51LmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScpO1xyXG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcG9pbnRlZCcpO1xyXG59O1xyXG5cclxudmFyIHJlc2l6ZVdpbmRvdyA9IGZ1bmN0aW9uKCkge1xyXG4gIGlmIChydW5uaW5nLnJlc2l6ZVdpbmRvdykgcnVubmluZy5yZXNpemVXaW5kb3coc2NlbmUsIGNhbWVyYSk7XHJcbn07XHJcblxyXG5cclxuaW5pdCgpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgQ2FtZXJhID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJhZDFfYmFzZSA9IFV0aWwuZ2V0UmFkaWFuKDEwKTtcclxuICAgIHRoaXMucmFkMSA9IHRoaXMucmFkMV9iYXNlO1xyXG4gICAgdGhpcy5yYWQyID0gVXRpbC5nZXRSYWRpYW4oMCk7XHJcbiAgICB0aGlzLmxvb2sgPSBuZXcgRm9yY2UzKCk7XHJcbiAgICB0aGlzLnJvdGF0ZV9yYWQxX2Jhc2UgPSAwO1xyXG4gICAgdGhpcy5yb3RhdGVfcmFkMSA9IDA7XHJcbiAgICB0aGlzLnJvdGF0ZV9yYWQyX2Jhc2UgPSAwO1xyXG4gICAgdGhpcy5yb3RhdGVfcmFkMiA9IDA7XHJcbiAgICB0aGlzLnJhbmdlID0gMTAwMDtcclxuICAgIHRoaXMub2JqO1xyXG4gICAgRm9yY2UzLmNhbGwodGhpcyk7XHJcbiAgfTtcclxuICBDYW1lcmEucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBDYW1lcmEucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2FtZXJhO1xyXG4gIENhbWVyYS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDM1LCB3aWR0aCAvIGhlaWdodCwgMSwgMTAwMDApO1xyXG4gICAgdGhpcy5vYmoudXAuc2V0KDAsIDEsIDApO1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMub2JqLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvblNwaGVyaWNhbCgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eS5jb3B5KHRoaXMuYW5jaG9yKTtcclxuICAgIHRoaXMubG9va0F0Q2VudGVyKCk7XHJcbiAgfTtcclxuICBDYW1lcmEucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNldFBvc2l0aW9uU3BoZXJpY2FsKCk7XHJcbiAgICB0aGlzLmxvb2tBdENlbnRlcigpO1xyXG4gIH07XHJcbiAgQ2FtZXJhLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICB0aGlzLm9iai5hc3BlY3QgPSB3aWR0aCAvIGhlaWdodDtcclxuICAgIHRoaXMub2JqLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcclxuICB9O1xyXG4gIENhbWVyYS5wcm90b3R5cGUuc2V0UG9zaXRpb25TcGhlcmljYWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB2ZWN0b3IgPSBVdGlsLmdldFNwaGVyaWNhbCh0aGlzLnJhZDEsIHRoaXMucmFkMiwgdGhpcy5yYW5nZSk7XHJcbiAgICB0aGlzLmFuY2hvci5jb3B5KHZlY3Rvcik7XHJcbiAgfTtcclxuICBDYW1lcmEucHJvdG90eXBlLmxvb2tBdENlbnRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5vYmoubG9va0F0KHtcclxuICAgICAgeDogMCxcclxuICAgICAgeTogMCxcclxuICAgICAgejogMFxyXG4gICAgfSk7XHJcbiAgfTtcclxuICByZXR1cm4gQ2FtZXJhO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBldmVudFR5cGUsIGNhbGxiYWNrKXtcclxuICB2YXIgdGltZXI7XHJcblxyXG4gIG9iamVjdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgY2FsbGJhY2soZXZlbnQpO1xyXG4gICAgfSwgNTAwKTtcclxuICB9LCBmYWxzZSk7XHJcbn07XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIEZvcmNlMiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICAgIHRoaXMubWFzcyA9IDE7XHJcbiAgfTtcclxuICBcclxuICBGb3JjZTIucHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkodGhpcy52ZWxvY2l0eSk7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLnVwZGF0ZVZlbG9jaXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbi5kaXZpZGVTY2FsYXIodGhpcy5tYXNzKTtcclxuICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcclxuICB9O1xyXG4gIEZvcmNlMi5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHZlY3Rvcik7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5RnJpY3Rpb24gPSBmdW5jdGlvbihtdSwgbm9ybWFsKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xyXG4gICAgaWYgKCFub3JtYWwpIG5vcm1hbCA9IDE7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSk7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKG11KTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5RHJhZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIoLTEpO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcih0aGlzLmFjY2VsZXJhdGlvbi5sZW5ndGgoKSAqIHZhbHVlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5SG9vayA9IGZ1bmN0aW9uKHJlc3RfbGVuZ3RoLCBrKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLnZlbG9jaXR5LmNsb25lKCkuc3ViKHRoaXMuYW5jaG9yKTtcclxuICAgIHZhciBkaXN0YW5jZSA9IGZvcmNlLmxlbmd0aCgpIC0gcmVzdF9sZW5ndGg7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xICogayAqIGRpc3RhbmNlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIEZvcmNlMjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBGb3JjZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIHRoaXMubWFzcyA9IDE7XHJcbiAgfTtcclxuICBcclxuICBGb3JjZS5wcm90b3R5cGUudXBkYXRlUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucG9zaXRpb24uY29weSh0aGlzLnZlbG9jaXR5KTtcclxuICB9O1xyXG4gIEZvcmNlLnByb3RvdHlwZS51cGRhdGVWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uZGl2aWRlU2NhbGFyKHRoaXMubWFzcyk7XHJcbiAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHZlY3Rvcik7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlGcmljdGlvbiA9IGZ1bmN0aW9uKG11LCBub3JtYWwpIHtcclxuICAgIHZhciBmb3JjZSA9IHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCk7XHJcbiAgICBpZiAoIW5vcm1hbCkgbm9ybWFsID0gMTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIobXUpO1xyXG4gICAgdGhpcy5hcHBseUZvcmNlKGZvcmNlKTtcclxuICB9O1xyXG4gIEZvcmNlLnByb3RvdHlwZS5hcHBseURyYWcgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIodGhpcy5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgKiB2YWx1ZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcbiAgRm9yY2UucHJvdG90eXBlLmFwcGx5SG9vayA9IGZ1bmN0aW9uKHJlc3RfbGVuZ3RoLCBrKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLnZlbG9jaXR5LmNsb25lKCkuc3ViKHRoaXMuYW5jaG9yKTtcclxuICAgIHZhciBkaXN0YW5jZSA9IGZvcmNlLmxlbmd0aCgpIC0gcmVzdF9sZW5ndGg7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xICogayAqIGRpc3RhbmNlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIEZvcmNlO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBIZW1pTGlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucmFkMSA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgdGhpcy5yYWQyID0gVXRpbC5nZXRSYWRpYW4oMCk7XHJcbiAgICB0aGlzLnJhbmdlID0gMTAwMDtcclxuICAgIHRoaXMuaGV4MSA9IDB4ZmZmZmZmO1xyXG4gICAgdGhpcy5oZXgyID0gMHgzMzMzMzM7XHJcbiAgICB0aGlzLmludGVuc2l0eSA9IDE7XHJcbiAgICB0aGlzLm9iajtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgSGVtaUxpZ2h0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgSGVtaUxpZ2h0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlbWlMaWdodDtcclxuICBIZW1pTGlnaHQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihoZXgxLCBoZXgyLCBpbnRlbnNpdHkpIHtcclxuICAgIGlmIChoZXgxKSB0aGlzLmhleDEgPSBoZXgxO1xyXG4gICAgaWYgKGhleDIpIHRoaXMuaGV4MiA9IGhleDI7XHJcbiAgICBpZiAoaW50ZW5zaXR5KSB0aGlzLmludGVuc2l0eSA9IGludGVuc2l0eTtcclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCh0aGlzLmhleDEsIHRoaXMuaGV4MiwgdGhpcy5pbnRlbnNpdHkpO1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMub2JqLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvblNwaGVyaWNhbCgpO1xyXG4gIH07XHJcbiAgSGVtaUxpZ2h0LnByb3RvdHlwZS5zZXRQb3NpdGlvblNwaGVyaWNhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHBvaW50cyA9IFV0aWwuZ2V0U3BoZXJpY2FsKHRoaXMucmFkMSwgdGhpcy5yYWQyLCB0aGlzLnJhbmdlKTtcclxuICAgIHRoaXMucG9zaXRpb24uY29weShwb2ludHMpO1xyXG4gIH07XHJcbiAgcmV0dXJuIEhlbWlMaWdodDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2l6ZSA9IDA7XHJcbiAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgdGhpcy5pc19hY3RpdmUgPSBmYWxzZTtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgTW92ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBNb3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNb3ZlcjtcclxuICBNb3Zlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgdGhpcy5hbmNob3IgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLnNldCgwLCAwLCAwKTtcclxuICAgIHRoaXMudGltZSA9IDA7XHJcbiAgfTtcclxuICBNb3Zlci5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuaXNfYWN0aXZlID0gdHJ1ZTtcclxuICB9O1xyXG4gIE1vdmVyLnByb3RvdHlwZS5pbmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmlzX2FjdGl2ZSA9IGZhbHNlO1xyXG4gIH07XHJcbiAgcmV0dXJuIE1vdmVyO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBQb2ludExpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJhZDEgPSBVdGlsLmdldFJhZGlhbigwKTtcclxuICAgIHRoaXMucmFkMiA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgdGhpcy5yYW5nZSA9IDIwMDtcclxuICAgIHRoaXMuaGV4ID0gMHhmZmZmZmY7XHJcbiAgICB0aGlzLmludGVuc2l0eSA9IDE7XHJcbiAgICB0aGlzLmRpc3RhbmNlID0gMjAwMDtcclxuICAgIHRoaXMuZGVjYXkgPSAxO1xyXG4gICAgdGhpcy5vYmo7XHJcbiAgICBGb3JjZTMuY2FsbCh0aGlzKTtcclxuICB9O1xyXG4gIFBvaW50TGlnaHQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBQb2ludExpZ2h0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvaW50TGlnaHQ7XHJcbiAgUG9pbnRMaWdodC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGhleCwgZGlzdGFuY2UpIHtcclxuICAgIGlmIChoZXgpIHRoaXMuaGV4ID0gaGV4O1xyXG4gICAgaWYgKGRpc3RhbmNlKSB0aGlzLmRpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICB0aGlzLm9iaiA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KHRoaXMuaGV4LCB0aGlzLmludGVuc2l0eSwgdGhpcy5kaXN0YW5jZSwgdGhpcy5kZWNheSk7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5vYmoucG9zaXRpb247XHJcbiAgICB0aGlzLnNldFBvc2l0aW9uU3BoZXJpY2FsKCk7XHJcbiAgfTtcclxuICBQb2ludExpZ2h0LnByb3RvdHlwZS5zZXRQb3NpdGlvblNwaGVyaWNhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHBvaW50cyA9IFV0aWwuZ2V0U3BoZXJpY2FsKHRoaXMucmFkMSwgdGhpcy5yYWQyLCB0aGlzLnJhbmdlKTtcclxuICAgIHRoaXMucG9zaXRpb24uY29weShwb2ludHMpO1xyXG4gIH07XHJcbiAgcmV0dXJuIFBvaW50TGlnaHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgdGhpcy5tYXRlcmlhbCA9IG51bGw7XHJcbiAgICB0aGlzLm9iaiA9IG51bGw7XHJcbiAgICBGb3JjZTMuY2FsbCh0aGlzKTtcclxuICB9O1xyXG4gIFBvaW50cy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEZvcmNlMy5wcm90b3R5cGUpO1xyXG4gIFBvaW50cy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQb2ludHM7XHJcbiAgUG9pbnRzLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocGFyYW0pIHtcclxuICAgIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIGNvbG9yOiB7IHR5cGU6ICdjJywgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcigweGZmZmZmZikgfSxcclxuICAgICAgICB0ZXh0dXJlOiB7IHR5cGU6ICd0JywgdmFsdWU6IHBhcmFtLnRleHR1cmUgfVxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHBhcmFtLnZzLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogcGFyYW0uZnMsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxyXG4gICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcclxuICAgICAgYmxlbmRpbmc6IHBhcmFtLmJsZW5kaW5nXHJcbiAgICB9KTtcclxuICAgIHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocGFyYW0ucG9zaXRpb25zLCAzKSk7XHJcbiAgICB0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnY3VzdG9tQ29sb3InLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBhcmFtLmNvbG9ycywgMykpO1xyXG4gICAgdGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3ZlcnRleE9wYWNpdHknLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBhcmFtLm9wYWNpdGllcywgMSkpO1xyXG4gICAgdGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3NpemUnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBhcmFtLnNpemVzLCAxKSk7XHJcbiAgICB0aGlzLm9iaiA9IG5ldyBUSFJFRS5Qb2ludHModGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgICBwYXJhbS5zY2VuZS5hZGQodGhpcy5vYmopO1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMub2JqLnBvc2l0aW9uO1xyXG4gIH07XHJcbiAgUG9pbnRzLnByb3RvdHlwZS51cGRhdGVQb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMub2JqLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24ubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5vYmouZ2VvbWV0cnkuYXR0cmlidXRlcy52ZXJ0ZXhPcGFjaXR5Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMub2JqLmdlb21ldHJ5LmF0dHJpYnV0ZXMuc2l6ZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB0aGlzLm9iai5nZW9tZXRyeS5hdHRyaWJ1dGVzLmN1c3RvbUNvbG9yLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICB9O1xyXG4gIHJldHVybiBQb2ludHM7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIGV4cG9ydHMgPSB7XHJcbiAgZ2V0UmFuZG9tSW50OiBmdW5jdGlvbihtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xyXG4gIH0sXHJcbiAgZ2V0RGVncmVlOiBmdW5jdGlvbihyYWRpYW4pIHtcclxuICAgIHJldHVybiByYWRpYW4gLyBNYXRoLlBJICogMTgwO1xyXG4gIH0sXHJcbiAgZ2V0UmFkaWFuOiBmdW5jdGlvbihkZWdyZWVzKSB7XHJcbiAgICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XHJcbiAgfSxcclxuICBnZXRTcGhlcmljYWw6IGZ1bmN0aW9uKHJhZDEsIHJhZDIsIHIpIHtcclxuICAgIHZhciB4ID0gTWF0aC5jb3MocmFkMSkgKiBNYXRoLmNvcyhyYWQyKSAqIHI7XHJcbiAgICB2YXIgeiA9IE1hdGguY29zKHJhZDEpICogTWF0aC5zaW4ocmFkMikgKiByO1xyXG4gICAgdmFyIHkgPSBNYXRoLnNpbihyYWQxKSAqIHI7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoeCwgeSwgeik7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFtcclxuICB7XHJcbiAgICBuYW1lOiAnaG9sZScsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvaG9sZScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNi41LjEwJyxcclxuICAgIHVwZGF0ZTogJycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ3N0dWR5IG9mIFBvc3QgRWZmZWN0IHRoYXQgdXNlZCBUSFJFRS5XZWJHTFJlbmRlclRhcmdldC4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ21ldGFsIGN1YmUnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL21ldGFsX2N1YmUnKSxcclxuICAgIHBvc3RlZDogJzIwMTYuNC4yMScsXHJcbiAgICB1cGRhdGU6ICcnLFxyXG4gICAgZGVzY3JpcHRpb246ICdzdHVkeSBvZiByYXltYXJjaGluZyB1c2luZyB0aHJlZS5qcy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2Rpc3RvcnQnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2Rpc3RvcnQnKSxcclxuICAgIHBvc3RlZDogJzIwMTYuMi4yMycsXHJcbiAgICB1cGRhdGU6ICcyMDE2LjUuMTAnLFxyXG4gICAgZGVzY3JpcHRpb246ICd1c2luZyB0aGUgc2ltcGxleCBub2lzZSwgZGlzdG9ydCB0aGUgc3BoZXJlLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnaW1hZ2UgZGF0YScsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvaW1hZ2VfZGF0YScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMi45JyxcclxuICAgIHVwZGF0ZTogJzIwMTUuMTIuMTInLFxyXG4gICAgZGVzY3JpcHRpb246ICdQb2ludHMgYmFzZWQgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELmdldEltYWdlRGF0YSgpJyxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6ICdnYWxsZXJ5JyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9nYWxsZXJ5JyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjEyLjInLFxyXG4gICAgdXBkYXRlOiAnMjAxNS4xMi45JyxcclxuICAgIGRlc2NyaXB0aW9uOiAnaW1hZ2UgZ2FsbGVyeSBvbiAzZC4gdGVzdGVkIHRoYXQgcGlja2VkIG9iamVjdCBhbmQgbW92aW5nIGNhbWVyYS4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2NvbWV0JyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9jb21ldCcpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMS4yNCcsXHJcbiAgICB1cGRhdGU6ICcyMDE2LjEuOCcsXHJcbiAgICBkZXNjcmlwdGlvbjogJ2NhbWVyYSB0byB0cmFjayB0aGUgbW92aW5nIHBvaW50cy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2h5cGVyIHNwYWNlJyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9oeXBlcl9zcGFjZScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMS4xMicsXHJcbiAgICB1cGRhdGU6ICcnLFxyXG4gICAgZGVzY3JpcHRpb246ICdhZGQgbGl0dGxlIGNoYW5nZSBhYm91dCBjYW1lcmEgYW5nbGUgYW5kIHBhcnRpY2xlIGNvbnRyb2xlcy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2ZpcmUgYmFsbCcsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvZmlyZV9iYWxsJyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjExLjEyJyxcclxuICAgIHVwZGF0ZTogJycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ3Rlc3Qgb2Ygc2ltcGxlIHBoeXNpY3MgYW5kIGFkZGl0aXZlIGJsZW5kaW5nLicsXHJcbiAgfVxyXG5dO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTInKTtcclxudmFyIE1vdmVyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9tb3ZlcicpO1xyXG52YXIgUG9pbnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludHMuanMnKTtcclxudmFyIEhlbWlMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvaGVtaUxpZ2h0Jyk7XHJcbnZhciBQb2ludExpZ2h0ID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludExpZ2h0Jyk7XHJcblxyXG52YXIgdnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgY3VzdG9tQ29sb3I7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHZlcnRleE9wYWNpdHk7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHNpemU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZDb2xvciA9IGN1c3RvbUNvbG9yO1xcclxcbiAgZk9wYWNpdHkgPSB2ZXJ0ZXhPcGFjaXR5O1xcclxcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG4gIGdsX1BvaW50U2l6ZSA9IHNpemUgKiAoMzAwLjAgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXHJcXG59XFxyXFxuXCI7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciBtb3ZlcnNfbnVtID0gMTAwMDA7XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBtb3Zlcl9hY3RpdmF0ZV9jb3VudCA9IDI7XHJcbiAgdmFyIHBvaW50cyA9IG5ldyBQb2ludHMoKTtcclxuICB2YXIgaGVtaV9saWdodCA9IG5ldyBIZW1pTGlnaHQoKTtcclxuICB2YXIgY29tZXRfbGlnaHQxID0gbmV3IFBvaW50TGlnaHQoKTtcclxuICB2YXIgY29tZXRfbGlnaHQyID0gbmV3IFBvaW50TGlnaHQoKTtcclxuICB2YXIgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIGNvbWV0ID0gbnVsbDtcclxuICB2YXIgY29tZXRfcmFkaXVzID0gMzA7XHJcbiAgdmFyIGNvbWV0X3NjYWxlID0gbmV3IEZvcmNlMigpO1xyXG4gIHZhciBjb21ldF9jb2xvcl9oID0gMTQwO1xyXG4gIHZhciBjb2xvcl9kaWZmID0gNDU7XHJcbiAgdmFyIHBsYW5ldCA9IG51bGw7XHJcbiAgdmFyIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGxhc3RfdGltZV9wbHVzX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICB2YXIgbGFzdF90aW1lX2JvdW5jZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGxhc3RfdGltZV90b3VjaCA9IERhdGUubm93KCk7XHJcbiAgdmFyIHBsdXNfYWNjZWxlcmF0aW9uID0gMDtcclxuICB2YXIgaXNfdG91Y2hlZCA9IGZhbHNlO1xyXG4gIHZhciBpc19wbHVzX2FjdGl2YXRlID0gZmFsc2U7XHJcbiAgdmFyIHRyYWNrX3BvaW50cyA9IHRydWU7XHJcblxyXG4gIHZhciB1cGRhdGVNb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICB2YXIgcG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZlKSB7XHJcbiAgICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgbW92ZXIudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgICBpZiAobW92ZXIudGltZSA+IDEwKSB7XHJcbiAgICAgICAgICBtb3Zlci5zaXplIC09IDI7XHJcbiAgICAgICAgICAvL21vdmVyLmEgLT0gMC4wNDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vdmVyLnNpemUgPD0gMCkge1xyXG4gICAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XHJcbiAgICAgICAgICBtb3Zlci50aW1lID0gMDtcclxuICAgICAgICAgIG1vdmVyLmEgPSAwLjA7XHJcbiAgICAgICAgICBtb3Zlci5pbmFjdGl2YXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIucG9zaXRpb24ueCAtIHBvaW50cy5wb3NpdGlvbi54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnBvc2l0aW9uLnkgLSBwb2ludHMucG9zaXRpb24ueTtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci5wb3NpdGlvbi56IC0gcG9pbnRzLnBvc2l0aW9uLno7XHJcbiAgICAgIGNvbG9yc1tpICogMyArIDBdID0gbW92ZXIuY29sb3IucjtcclxuICAgICAgY29sb3JzW2kgKiAzICsgMV0gPSBtb3Zlci5jb2xvci5nO1xyXG4gICAgICBjb2xvcnNbaSAqIDMgKyAyXSA9IG1vdmVyLmNvbG9yLmI7XHJcbiAgICAgIG9wYWNpdGllc1tpXSA9IG1vdmVyLmE7XHJcbiAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgIH1cclxuICAgIHBvaW50cy51cGRhdGVQb2ludHMoKTtcclxuICB9O1xyXG5cclxuICB2YXIgYWN0aXZhdGVNb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvdW50ID0gMDtcclxuICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgaWYgKG5vdyAtIGxhc3RfdGltZV9hY3RpdmF0ZSA+IDEwKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIGNvbnRpbnVlO1xyXG4gICAgICAgIHZhciByYWQxID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgICAgdmFyIHJhZDIgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgICB2YXIgcmFuZ2UgPSBVdGlsLmdldFJhbmRvbUludCgxLCAzMCk7XHJcbiAgICAgICAgdmFyIHZlY3RvciA9IFV0aWwuZ2V0U3BoZXJpY2FsKHJhZDEsIHJhZDIsIHJhbmdlKTtcclxuICAgICAgICB2YXIgZm9yY2UgPSBVdGlsLmdldFNwaGVyaWNhbChyYWQxLCByYWQyLCByYW5nZSAvIDIwKTtcclxuICAgICAgICB2YXIgaCA9IFV0aWwuZ2V0UmFuZG9tSW50KGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmLCBjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZikgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNTtcclxuICAgICAgICB2YXIgcyA9IFV0aWwuZ2V0UmFuZG9tSW50KDYwLCA4MCk7XHJcbiAgICAgICAgdmVjdG9yLmFkZChwb2ludHMucG9zaXRpb24pO1xyXG4gICAgICAgIG1vdmVyLmFjdGl2YXRlKCk7XHJcbiAgICAgICAgbW92ZXIuaW5pdCh2ZWN0b3IpO1xyXG4gICAgICAgIG1vdmVyLmNvbG9yLnNldEhTTChoIC8gMzYwLCBzIC8gMTAwLCAwLjcpO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gICAgICAgIG1vdmVyLmEgPSAxO1xyXG4gICAgICAgIG1vdmVyLnNpemUgPSAyNTtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgIGlmIChjb3VudCA+PSBtb3Zlcl9hY3RpdmF0ZV9jb3VudCkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgcm90YXRlQ29tZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbWV0LnJvdGF0aW9uLnggKz0gMC4wMyArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwMDtcclxuICAgIGNvbWV0LnJvdGF0aW9uLnkgKz0gMC4wMSArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwMDtcclxuICAgIGNvbWV0LnJvdGF0aW9uLnogKz0gMC4wMSArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwMDtcclxuICAgIHBvaW50cy5yYWQxX2Jhc2UgKz0gVXRpbC5nZXRSYWRpYW4oLjYpO1xyXG4gICAgcG9pbnRzLnJhZDEgPSBVdGlsLmdldFJhZGlhbihNYXRoLnNpbihwb2ludHMucmFkMV9iYXNlKSAqIDQ1ICsgcGx1c19hY2NlbGVyYXRpb24gLyAxMDApO1xyXG4gICAgcG9pbnRzLnJhZDIgKz0gVXRpbC5nZXRSYWRpYW4oMC44ICsgcGx1c19hY2NlbGVyYXRpb24gLyAxMDApO1xyXG4gICAgcG9pbnRzLnJhZDMgKz0gMC4wMTtcclxuICAgIHJldHVybiBVdGlsLmdldFNwaGVyaWNhbChwb2ludHMucmFkMSwgcG9pbnRzLnJhZDIsIDM1MCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIHJvdGF0ZUNvbWV0Q29sb3IgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciByYWRpdXMgPSBjb21ldF9yYWRpdXMgKiAwLjg7XHJcbiAgICBjb21ldF9saWdodDEub2JqLnBvc2l0aW9uLmNvcHkoVXRpbC5nZXRTcGhlcmljYWwoVXRpbC5nZXRSYWRpYW4oMCksICBVdGlsLmdldFJhZGlhbigwKSwgcmFkaXVzKS5hZGQocG9pbnRzLnBvc2l0aW9uKSk7XHJcbiAgICBjb21ldF9saWdodDIub2JqLnBvc2l0aW9uLmNvcHkoVXRpbC5nZXRTcGhlcmljYWwoVXRpbC5nZXRSYWRpYW4oMTgwKSwgVXRpbC5nZXRSYWRpYW4oMCksIHJhZGl1cykuYWRkKHBvaW50cy5wb3NpdGlvbikpO1xyXG4gIH07XHJcblxyXG4gIHZhciBib3VuY2VDb21ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKERhdGUubm93KCkgLSBsYXN0X3RpbWVfYm91bmNlID4gMTAwMCAtIHBsdXNfYWNjZWxlcmF0aW9uICogMykge1xyXG4gICAgICBjb21ldF9zY2FsZS5hcHBseUZvcmNlKG5ldyBUSFJFRS5WZWN0b3IyKDAuMDggKyBwbHVzX2FjY2VsZXJhdGlvbiAvIDUwMDAsIDApKTtcclxuICAgICAgbGFzdF90aW1lX2JvdW5jZSA9IERhdGUubm93KCk7XHJcbiAgICAgIGlzX3BsdXNfYWN0aXZhdGUgPSB0cnVlO1xyXG4gICAgICBsYXN0X3RpbWVfcGx1c19hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgICBpZiAoaXNfcGx1c19hY3RpdmF0ZSAmJiBEYXRlLm5vdygpIC0gbGFzdF90aW1lX3BsdXNfYWN0aXZhdGUgPCA1MDApIHtcclxuICAgICAgbW92ZXJfYWN0aXZhdGVfY291bnQgPSA2ICsgTWF0aC5mbG9vcihwbHVzX2FjY2VsZXJhdGlvbiAvIDQwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1vdmVyX2FjdGl2YXRlX2NvdW50ID0gMSArIE1hdGguZmxvb3IocGx1c19hY2NlbGVyYXRpb24gLyA0MCk7XHJcbiAgICB9XHJcbiAgICBjb21ldF9zY2FsZS5hcHBseUhvb2soMCwgMC4xKTtcclxuICAgIGNvbWV0X3NjYWxlLmFwcGx5RHJhZygwLjEyKTtcclxuICAgIGNvbWV0X3NjYWxlLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICBjb21ldF9zY2FsZS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgY29tZXQuc2NhbGUuc2V0KDEgKyBjb21ldF9zY2FsZS5wb3NpdGlvbi54LCAxICsgY29tZXRfc2NhbGUucG9zaXRpb24ueCwgMSArIGNvbWV0X3NjYWxlLnBvc2l0aW9uLngpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVUZXh0dXJlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB2YXIgZ3JhZCA9IG51bGw7XHJcbiAgICB2YXIgdGV4dHVyZSA9IG51bGw7XHJcblxyXG4gICAgY2FudmFzLndpZHRoID0gMjAwO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IDIwMDtcclxuICAgIGdyYWQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoMTAwLCAxMDAsIDIwLCAxMDAsIDEwMCwgMTAwKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuOSwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMSknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEuMCwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMCknKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xyXG4gICAgY3R4LmFyYygxMDAsIDEwMCwgMTAwLCAwLCBNYXRoLlBJIC8gMTgwLCB0cnVlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVDb21tZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBiYXNlX2dlb21ldHJ5ID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeShjb21ldF9yYWRpdXMsIDIpO1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBjb2xvcjogbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIGNvbWV0X2NvbG9yX2ggKyAnLCAxMDAlLCAxMDAlKScpLFxyXG4gICAgICBzaGFkaW5nOiBUSFJFRS5GbGF0U2hhZGluZ1xyXG4gICAgfSk7XHJcbiAgICB2YXIgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShiYXNlX2dlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aCAqIDMpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiYXNlX2dlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogM10gPSBiYXNlX2dlb21ldHJ5LnZlcnRpY2VzW2ldLng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gYmFzZV9nZW9tZXRyeS52ZXJ0aWNlc1tpXS55O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IGJhc2VfZ2VvbWV0cnkudmVydGljZXNbaV0uejtcclxuICAgIH1cclxuICAgIHZhciBpbmRpY2VzID0gbmV3IFVpbnQzMkFycmF5KGJhc2VfZ2VvbWV0cnkuZmFjZXMubGVuZ3RoICogMyk7XHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGJhc2VfZ2VvbWV0cnkuZmFjZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgaW5kaWNlc1tqICogM10gPSBiYXNlX2dlb21ldHJ5LmZhY2VzW2pdLmE7XHJcbiAgICAgIGluZGljZXNbaiAqIDMgKyAxXSA9IGJhc2VfZ2VvbWV0cnkuZmFjZXNbal0uYjtcclxuICAgICAgaW5kaWNlc1tqICogMyArIDJdID0gYmFzZV9nZW9tZXRyeS5mYWNlc1tqXS5jO1xyXG4gICAgfVxyXG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocG9zaXRpb25zLCAzKSk7XHJcbiAgICBnZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uLmR5bmFtaWMgPSB0cnVlO1xyXG4gICAgZ2VvbWV0cnkuc2V0SW5kZXgobmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShpbmRpY2VzLCAxKSk7XHJcbiAgICBnZW9tZXRyeS5pbmRleC5keW5hbWljID0gdHJ1ZTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVQbGFuZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5PY3RhaGVkcm9uR2VvbWV0cnkoMjUwLCA0KTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIGNvbG9yOiAweDIyMjIyMixcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmdcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGFjY2VsZXJhdGVDb21ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGlzX3RvdWNoZWQgJiYgcGx1c19hY2NlbGVyYXRpb24gPCAyMDApIHtcclxuICAgICAgcGx1c19hY2NlbGVyYXRpb24gKz0gMTtcclxuICAgIH0gZWxzZSBpZihwbHVzX2FjY2VsZXJhdGlvbiA+IDApIHtcclxuICAgICAgcGx1c19hY2NlbGVyYXRpb24gLT0gMTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBjb21ldCA9IGNyZWF0ZUNvbW1ldCgpO1xyXG4gICAgICBzY2VuZS5hZGQoY29tZXQpO1xyXG4gICAgICBwbGFuZXQgPSBjcmVhdGVQbGFuZXQoKTtcclxuICAgICAgc2NlbmUuYWRkKHBsYW5ldCk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzX251bTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XHJcbiAgICAgICAgdmFyIGggPSBVdGlsLmdldFJhbmRvbUludChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZiwgY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYpO1xyXG4gICAgICAgIHZhciBzID0gVXRpbC5nZXRSYW5kb21JbnQoNjAsIDgwKTtcclxuICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKFV0aWwuZ2V0UmFuZG9tSW50KC0xMDAsIDEwMCksIDAsIDApKTtcclxuICAgICAgICBtb3Zlci5jb2xvciA9IG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyBoICsgJywgJyArIHMgKyAnJSwgNzAlKScpO1xyXG4gICAgICAgIG1vdmVycy5wdXNoKG1vdmVyKTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnBvc2l0aW9uLng7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci5wb3NpdGlvbi55O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIucG9zaXRpb24uejtcclxuICAgICAgICBjb2xvcnNbaSAqIDMgKyAwXSA9IG1vdmVyLmNvbG9yLnI7XHJcbiAgICAgICAgY29sb3JzW2kgKiAzICsgMV0gPSBtb3Zlci5jb2xvci5nO1xyXG4gICAgICAgIGNvbG9yc1tpICogMyArIDJdID0gbW92ZXIuY29sb3IuYjtcclxuICAgICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgICAgfVxyXG4gICAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgICAgc2NlbmU6IHNjZW5lLFxyXG4gICAgICAgIHZzOiB2cyxcclxuICAgICAgICBmczogZnMsXHJcbiAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXHJcbiAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgICAgc2l6ZXM6IHNpemVzLFxyXG4gICAgICAgIHRleHR1cmU6IGNyZWF0ZVRleHR1cmUoKSxcclxuICAgICAgICBibGVuZGluZzogVEhSRUUuTm9ybWFsQmxlbmRpbmdcclxuICAgICAgfSk7XHJcbiAgICAgIHBvaW50cy5yYWQxID0gMDtcclxuICAgICAgcG9pbnRzLnJhZDFfYmFzZSA9IDA7XHJcbiAgICAgIHBvaW50cy5yYWQyID0gMDtcclxuICAgICAgcG9pbnRzLnJhZDMgPSAwO1xyXG4gICAgICBoZW1pX2xpZ2h0LmluaXQoXHJcbiAgICAgICAgbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZikgKyAnLCA1MCUsIDYwJSknKS5nZXRIZXgoKSxcclxuICAgICAgICBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgKGNvbWV0X2NvbG9yX2ggKyBjb2xvcl9kaWZmKSArICcsIDUwJSwgNjAlKScpLmdldEhleCgpXHJcbiAgICAgICk7XHJcbiAgICAgIHNjZW5lLmFkZChoZW1pX2xpZ2h0Lm9iaik7XHJcbiAgICAgIGNvbWV0X2xpZ2h0MS5pbml0KG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyAoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYpICsgJywgNjAlLCA1MCUpJykpO1xyXG4gICAgICBzY2VuZS5hZGQoY29tZXRfbGlnaHQxLm9iaik7XHJcbiAgICAgIGNvbWV0X2xpZ2h0Mi5pbml0KG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyAoY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYpICsgJywgNjAlLCA1MCUpJykpO1xyXG4gICAgICBzY2VuZS5hZGQoY29tZXRfbGlnaHQyLm9iaik7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IgPSBuZXcgVEhSRUUuVmVjdG9yMygxNTAwLCAwLCAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIGNvbWV0Lmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgY29tZXQubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoY29tZXQpO1xyXG4gICAgICBwbGFuZXQuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwbGFuZXQubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocGxhbmV0KTtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoaGVtaV9saWdodC5vYmopO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoY29tZXRfbGlnaHQxLm9iaik7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShjb21ldF9saWdodDIub2JqKTtcclxuICAgICAgbW92ZXJzID0gW107XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGFjY2VsZXJhdGVDb21ldCgpO1xyXG4gICAgICBwb2ludHMudmVsb2NpdHkgPSByb3RhdGVDb21ldCgpO1xyXG4gICAgICBpZiAodHJhY2tfcG9pbnRzID09PSB0cnVlKSB7XHJcbiAgICAgICAgY2FtZXJhLmFuY2hvci5jb3B5KFxyXG4gICAgICAgICAgcG9pbnRzLnZlbG9jaXR5LmNsb25lKCkuYWRkKFxyXG4gICAgICAgICAgICBwb2ludHMudmVsb2NpdHkuY2xvbmUoKS5zdWIocG9pbnRzLnBvc2l0aW9uKVxyXG4gICAgICAgICAgICAubm9ybWFsaXplKCkubXVsdGlwbHlTY2FsYXIoLTQwMClcclxuICAgICAgICAgIClcclxuICAgICAgICApO1xyXG4gICAgICAgIGNhbWVyYS5hbmNob3IueSArPSBwb2ludHMucG9zaXRpb24ueSAqIDI7XHJcbiAgICAgICAgY2FtZXJhLmxvb2suYW5jaG9yLmNvcHkocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgfVxyXG4gICAgICBwb2ludHMudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY29tZXQucG9zaXRpb24uY29weShwb2ludHMucG9zaXRpb24pO1xyXG4gICAgICBoZW1pX2xpZ2h0Lm9iai5jb2xvci5zZXRIU0woKGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmIC0gcGx1c19hY2NlbGVyYXRpb24gLyAxLjUpIC8gMzYwLCAwLjUsIDAuNik7XHJcbiAgICAgIGhlbWlfbGlnaHQub2JqLmdyb3VuZENvbG9yLnNldEhTTCgoY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNSkgLyAzNjAsIDAuNSwgMC42KTtcclxuICAgICAgY29tZXRfbGlnaHQxLm9iai5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgIGNvbWV0X2xpZ2h0MS5vYmouY29sb3Iuc2V0SFNMKChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZiAtIHBsdXNfYWNjZWxlcmF0aW9uIC8gMS41KSAvIDM2MCwgMC41LCAwLjYpO1xyXG4gICAgICBjb21ldF9saWdodDIub2JqLnBvc2l0aW9uLmNvcHkocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgY29tZXRfbGlnaHQyLm9iai5jb2xvci5zZXRIU0woKGNvbWV0X2NvbG9yX2ggKyBjb2xvcl9kaWZmIC0gcGx1c19hY2NlbGVyYXRpb24gLyAxLjUpIC8gMzYwLCAwLjUsIDAuNik7XHJcbiAgICAgIGFjdGl2YXRlTW92ZXIoKTtcclxuICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgY2FtZXJhLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9vay5hcHBseUhvb2soMCwgMC4yKTtcclxuICAgICAgY2FtZXJhLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5vYmoubG9va0F0KGNhbWVyYS5sb29rLnBvc2l0aW9uKTtcclxuICAgICAgcm90YXRlQ29tZXRDb2xvcigpO1xyXG4gICAgICBib3VuY2VDb21ldCgpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBpc190b3VjaGVkID0gdHJ1ZTtcclxuICAgICAgbGFzdF90aW1lX3RvdWNoID0gRGF0ZS5ub3coKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICAgICAgaWYgKERhdGUubm93KCkgLSBsYXN0X3RpbWVfdG91Y2ggPCAxMDApIHtcclxuICAgICAgICBpZiAodHJhY2tfcG9pbnRzID09PSB0cnVlKSB7XHJcbiAgICAgICAgICBjYW1lcmEuYW5jaG9yLnNldCgxMjAwLCAxMjAwLCAwKTtcclxuICAgICAgICAgIGNhbWVyYS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgICAgICB0cmFja19wb2ludHMgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdHJhY2tfcG9pbnRzID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9jYW1lcmEnKTtcclxudmFyIEZvcmNlMiA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UyJyk7XHJcblxyXG52YXIgdnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcbnVuaWZvcm0gZmxvYXQgcmFkaXVzO1xcclxcbnVuaWZvcm0gZmxvYXQgZGlzdG9ydDtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcblxcclxcbi8vXFxuLy8gRGVzY3JpcHRpb24gOiBBcnJheSBhbmQgdGV4dHVyZWxlc3MgR0xTTCAyRC8zRC80RCBzaW1wbGV4XFxuLy8gICAgICAgICAgICAgICBub2lzZSBmdW5jdGlvbnMuXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzJfMCh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgbW9kMjg5XzJfMCh2ZWM0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV8yXzEodmVjNCB4KSB7XFxuICAgICByZXR1cm4gbW9kMjg5XzJfMCgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxudmVjNCB0YXlsb3JJbnZTcXJ0XzJfMih2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzJfMyh2ZWMzIHYpXFxuICB7XFxuICBjb25zdCB2ZWMyICBDID0gdmVjMigxLjAvNi4wLCAxLjAvMy4wKSA7XFxuICBjb25zdCB2ZWM0ICBEXzJfNCA9IHZlYzQoMC4wLCAwLjUsIDEuMCwgMi4wKTtcXG5cXG4vLyBGaXJzdCBjb3JuZXJcXG4gIHZlYzMgaSAgPSBmbG9vcih2ICsgZG90KHYsIEMueXl5KSApO1xcbiAgdmVjMyB4MCA9ICAgdiAtIGkgKyBkb3QoaSwgQy54eHgpIDtcXG5cXG4vLyBPdGhlciBjb3JuZXJzXFxuICB2ZWMzIGdfMl81ID0gc3RlcCh4MC55engsIHgwLnh5eik7XFxuICB2ZWMzIGwgPSAxLjAgLSBnXzJfNTtcXG4gIHZlYzMgaTEgPSBtaW4oIGdfMl81Lnh5eiwgbC56eHkgKTtcXG4gIHZlYzMgaTIgPSBtYXgoIGdfMl81Lnh5eiwgbC56eHkgKTtcXG5cXG4gIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcbiAgLy8gICB4MSA9IHgwIC0gaTEgICsgMS4wICogQy54eHg7XFxuICAvLyAgIHgyID0geDAgLSBpMiAgKyAyLjAgKiBDLnh4eDtcXG4gIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcbiAgdmVjMyB4MSA9IHgwIC0gaTEgKyBDLnh4eDtcXG4gIHZlYzMgeDIgPSB4MCAtIGkyICsgQy55eXk7IC8vIDIuMCpDLnggPSAxLzMgPSBDLnlcXG4gIHZlYzMgeDMgPSB4MCAtIERfMl80Lnl5eTsgICAgICAvLyAtMS4wKzMuMCpDLnggPSAtMC41ID0gLUQueVxcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV8yXzAoaSk7XFxuICB2ZWM0IHAgPSBwZXJtdXRlXzJfMSggcGVybXV0ZV8yXzEoIHBlcm11dGVfMl8xKFxcbiAgICAgICAgICAgICBpLnogKyB2ZWM0KDAuMCwgaTEueiwgaTIueiwgMS4wICkpXFxuICAgICAgICAgICArIGkueSArIHZlYzQoMC4wLCBpMS55LCBpMi55LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS54ICsgdmVjNCgwLjAsIGkxLngsIGkyLngsIDEuMCApKTtcXG5cXG4vLyBHcmFkaWVudHM6IDd4NyBwb2ludHMgb3ZlciBhIHNxdWFyZSwgbWFwcGVkIG9udG8gYW4gb2N0YWhlZHJvbi5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDkgKDQ5KjYgPSAyOTQpXFxuICBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyAvLyAxLjAvNy4wXFxuICB2ZWMzICBucyA9IG5fICogRF8yXzQud3l6IC0gRF8yXzQueHp4O1xcblxcbiAgdmVjNCBqID0gcCAtIDQ5LjAgKiBmbG9vcihwICogbnMueiAqIG5zLnopOyAgLy8gIG1vZChwLDcqNylcXG5cXG4gIHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7XFxuICB2ZWM0IHlfID0gZmxvb3IoaiAtIDcuMCAqIHhfICk7ICAgIC8vIG1vZChqLE4pXFxuXFxuICB2ZWM0IHggPSB4XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXFxuICB2ZWM0IGIwID0gdmVjNCggeC54eSwgeS54eSApO1xcbiAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cXG4gIC8vdmVjNCBzMCA9IHZlYzQobGVzc1RoYW4oYjAsMC4wKSkqMi4wIC0gMS4wO1xcbiAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuICB2ZWM0IHMwID0gZmxvb3IoYjApKjIuMCArIDEuMDtcXG4gIHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wO1xcbiAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXFxuICB2ZWM0IGEwID0gYjAueHp5dyArIHMwLnh6eXcqc2gueHh5eSA7XFxuICB2ZWM0IGExXzJfNiA9IGIxLnh6eXcgKyBzMS54enl3KnNoLnp6d3cgO1xcblxcbiAgdmVjMyBwMF8yXzcgPSB2ZWMzKGEwLnh5LGgueCk7XFxuICB2ZWMzIHAxID0gdmVjMyhhMC56dyxoLnkpO1xcbiAgdmVjMyBwMiA9IHZlYzMoYTFfMl82Lnh5LGgueik7XFxuICB2ZWMzIHAzID0gdmVjMyhhMV8yXzYuencsaC53KTtcXG5cXG4vL05vcm1hbGlzZSBncmFkaWVudHNcXG4gIHZlYzQgbm9ybSA9IHRheWxvckludlNxcnRfMl8yKHZlYzQoZG90KHAwXzJfNyxwMF8yXzcpLCBkb3QocDEscDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLHAzKSkpO1xcbiAgcDBfMl83ICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG5cXG4vLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG4gIHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApO1xcbiAgbSA9IG0gKiBtO1xcbiAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwXzJfNyx4MCksIGRvdChwMSx4MSksXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3QocDIseDIpLCBkb3QocDMseDMpICkgKTtcXG4gIH1cXG5cXG5cXG5cXG52ZWMzIGhzdjJyZ2JfMV84KHZlYzMgYyl7XFxyXFxuICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XFxyXFxuICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XFxyXFxuICByZXR1cm4gYy56ICogbWl4KEsueHh4LCBjbGFtcChwIC0gSy54eHgsIDAuMCwgMS4wKSwgYy55KTtcXHJcXG59XFxyXFxuXFxuXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZmxvYXQgdXBkYXRlVGltZSA9IHRpbWUgLyAxMDAwLjA7XFxyXFxuICBmbG9hdCBub2lzZSA9IHNub2lzZV8yXzModmVjMyhwb3NpdGlvbiAvIDQwMC4xICsgdXBkYXRlVGltZSAqIDUuMCkpO1xcclxcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiAqIChub2lzZSAqIHBvdyhkaXN0b3J0LCAyLjApICsgcmFkaXVzKSwgMS4wKTtcXHJcXG4gIHZlYzMgbGlnaHQgPSB2ZWMzKDAuNSk7XFxyXFxuICBsaWdodCArPSAoZG90KHZlYzMoMC4wLCAxLjAsIDAuMCksIG5vcm1hbCkgKyAxLjApIC8gMi4wICogdmVjMygxLjApICogMC41O1xcclxcblxcclxcbiAgdkNvbG9yID0gaHN2MnJnYl8xXzgodmVjMyhub2lzZSAqIGRpc3RvcnQgKiAwLjMgKyB1cGRhdGVUaW1lLCAwLjIsIDEuMCkpICogbGlnaHQ7XFxyXFxuXFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCh2Q29sb3IsIDEuMCk7XFxyXFxufVxcclxcblwiO1xyXG52YXIgdnNfcHAgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMyIHZVdjtcXHJcXG5cXHJcXG52b2lkIG1haW4odm9pZCkge1xcclxcbiAgdlV2ID0gdXY7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnNfcHAgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcbnVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcclxcbnVuaWZvcm0gZmxvYXQgYWNjZWxlcmF0aW9uO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxuXFxyXFxuY29uc3QgZmxvYXQgYmx1ciA9IDE2LjA7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMyIHZVdjtcXHJcXG5cXHJcXG5mbG9hdCByYW5kb20yXzFfMCh2ZWMyIGMpe1xcclxcbiAgICByZXR1cm4gZnJhY3Qoc2luKGRvdChjLnh5ICx2ZWMyKDEyLjk4OTgsNzguMjMzKSkpICogNDM3NTguNTQ1Myk7XFxyXFxufVxcclxcblxcblxcblxcclxcbnZlYzIgZGlmZlV2KGZsb2F0IHYsIGZsb2F0IGRpZmYpIHtcXHJcXG4gIHJldHVybiB2VXYgKyAodmVjMih2LCAwLjApICogZGlmZiArIHZlYzIodiAqIDIuMCwgMC4wKSkgLyByZXNvbHV0aW9uO1xcclxcbn1cXHJcXG5cXHJcXG5mbG9hdCByYW5kb21Ob2lzZSh2ZWMyIHApIHtcXHJcXG4gIHJldHVybiAocmFuZG9tMl8xXzAocCAtIHZlYzIoc2luKHRpbWUpKSkgKiAyLjAgLSAxLjApICogbWF4KGxlbmd0aChhY2NlbGVyYXRpb24pLCAwLjA1KTtcXHJcXG59XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZmxvYXQgZGlmZiA9IDMwMC4wICogbGVuZ3RoKGFjY2VsZXJhdGlvbik7XFxyXFxuICB2ZWMyIHV2X3IgPSBkaWZmVXYoMC4wLCBkaWZmKTtcXHJcXG4gIHZlYzIgdXZfZyA9IGRpZmZVdigxLjAsIGRpZmYpO1xcclxcbiAgdmVjMiB1dl9iID0gZGlmZlV2KC0xLjAsIGRpZmYpO1xcclxcbiAgZmxvYXQgciA9IHRleHR1cmUyRCh0ZXh0dXJlLCB1dl9yKS5yICsgcmFuZG9tTm9pc2UodXZfcik7XFxyXFxuICBmbG9hdCBnID0gdGV4dHVyZTJEKHRleHR1cmUsIHV2X2cpLmcgKyByYW5kb21Ob2lzZSh1dl9nKTtcXHJcXG4gIGZsb2F0IGIgPSB0ZXh0dXJlMkQodGV4dHVyZSwgdXZfYikuYiArIHJhbmRvbU5vaXNlKHV2X2IpO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChyLCBnLCBiLCAxLjApO1xcclxcbn1cXHJcXG5cIjtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEpO1xyXG4gIH07XHJcbiAgdmFyIHNwaGVyZSA9IG51bGw7XHJcbiAgdmFyIGJnID0gbnVsbDtcclxuICB2YXIgbGlnaHQgPSBuZXcgVEhSRUUuSGVtaXNwaGVyZUxpZ2h0KDB4ZmZmZmZmLCAweDY2NjY2NiwgMSk7XHJcbiAgdmFyIHN1Yl9zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIHZhciBzdWJfY2FtZXJhID0gbmV3IENhbWVyYSgpO1xyXG4gIHZhciBzdWJfbGlnaHQgPSBuZXcgVEhSRUUuSGVtaXNwaGVyZUxpZ2h0KDB4ZmZmZmZmLCAweDY2NjY2NiwgMSk7XHJcbiAgdmFyIGZvcmNlID0gbmV3IEZvcmNlMigpO1xyXG4gIHZhciB0aW1lX3VuaXQgPSAxO1xyXG4gIHZhciByZW5kZXJfdGFyZ2V0ID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQsIHtcclxuICAgIG1hZ0ZpbHRlcjogVEhSRUUuTmVhcmVzdEZpbHRlcixcclxuICAgIG1pbkZpbHRlcjogVEhSRUUuTmVhcmVzdEZpbHRlcixcclxuICAgIHdyYXBTOiBUSFJFRS5DbGFtcFRvRWRnZVdyYXBwaW5nLFxyXG4gICAgd3JhcFQ6IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmdcclxuICB9KVxyXG4gIHZhciBmcmFtZWJ1ZmZlciA9IG51bGw7XHJcblxyXG4gIHZhciBjcmVhdGVTcGhlcmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgZ2VvbWV0cnkuZnJvbUdlb21ldHJ5KG5ldyBUSFJFRS5PY3RhaGVkcm9uR2VvbWV0cnkoMjAwLCA1KSk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmFkaXVzOiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMS4wXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkaXN0b3J0OiB7XHJcbiAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICB2YWx1ZTogMC40XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHZzLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogZnMsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVCYWNrZ3JvdW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMTgwMCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVBsYW5lRm9yUG9zdFByb2Nlc3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeV9iYXNlID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMiwgMik7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIGdlb21ldHJ5LmZyb21HZW9tZXRyeShnZW9tZXRyeV9iYXNlKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY2NlbGVyYXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0ZXh0dXJlOiB7XHJcbiAgICAgICAgICB0eXBlOiAndCcsXHJcbiAgICAgICAgICB2YWx1ZTogcmVuZGVyX3RhcmdldCxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHZzX3BwLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogZnNfcHAsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH1cclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgc3ViX2NhbWVyYS5pbml0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICdiZy13aGl0ZSc7XHJcbiAgICAgIHNwaGVyZSA9IGNyZWF0ZVNwaGVyZSgpO1xyXG4gICAgICBzdWJfc2NlbmUuYWRkKHNwaGVyZSk7XHJcbiAgICAgIGJnID0gY3JlYXRlQmFja2dyb3VuZCgpO1xyXG4gICAgICBzdWJfc2NlbmUuYWRkKGJnKTtcclxuICAgICAgc3ViX3NjZW5lLmFkZChzdWJfbGlnaHQpO1xyXG4gICAgICBzdWJfY2FtZXJhLmFuY2hvci5zZXQoMTgwMCwgMTgwMCwgMCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEubG9vay5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG5cclxuICAgICAgZnJhbWVidWZmZXIgPSBjcmVhdGVQbGFuZUZvclBvc3RQcm9jZXNzKCk7XHJcbiAgICAgIHNjZW5lLmFkZChmcmFtZWJ1ZmZlcik7XHJcbiAgICAgIHNjZW5lLmFkZChsaWdodCk7XHJcbiAgICAgIGNhbWVyYS5hbmNob3Iuc2V0KDE4MDAsIDE4MDAsIDApO1xyXG4gICAgICBjYW1lcmEubG9vay5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICBmb3JjZS5hbmNob3Iuc2V0KDEsIDApO1xyXG4gICAgICBmb3JjZS5hbmNob3Iuc2V0KDEsIDApO1xyXG4gICAgICBmb3JjZS52ZWxvY2l0eS5zZXQoMSwgMCk7XHJcbiAgICAgIGZvcmNlLmsgPSAwLjA0NTtcclxuICAgICAgZm9yY2UuZCA9IDAuMTY7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICcnO1xyXG4gICAgICBzcGhlcmUuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBzcGhlcmUubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzdWJfc2NlbmUucmVtb3ZlKHNwaGVyZSk7XHJcbiAgICAgIGJnLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgYmcubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzdWJfc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgICAgc3ViX3NjZW5lLnJlbW92ZShzdWJfbGlnaHQpO1xyXG4gICAgICBmcmFtZWJ1ZmZlci5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGZyYW1lYnVmZmVyKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGxpZ2h0KTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKSB7XHJcbiAgICAgIGZvcmNlLmFwcGx5SG9vaygwLCBmb3JjZS5rKTtcclxuICAgICAgZm9yY2UuYXBwbHlEcmFnKGZvcmNlLmQpO1xyXG4gICAgICBmb3JjZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBmb3JjZS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICAvLyBjb25zb2xlLmxvZyhmb3JjZS5hY2NlbGVyYXRpb24ubGVuZ3RoKCkpO1xyXG4gICAgICBzcGhlcmUubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSArPSB0aW1lX3VuaXQ7XHJcbiAgICAgIHNwaGVyZS5tYXRlcmlhbC51bmlmb3Jtcy5yYWRpdXMudmFsdWUgPSBmb3JjZS5wb3NpdGlvbi54O1xyXG4gICAgICBzcGhlcmUubWF0ZXJpYWwudW5pZm9ybXMuZGlzdG9ydC52YWx1ZSA9IGZvcmNlLnBvc2l0aW9uLnggLyAyIC0gMC4xO1xyXG4gICAgICBzdWJfY2FtZXJhLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIHN1Yl9jYW1lcmEuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIHN1Yl9jYW1lcmEudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgc3ViX2NhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBzdWJfY2FtZXJhLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIHN1Yl9jYW1lcmEubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgc3ViX2NhbWVyYS5sb29rLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEubG9vay51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBzdWJfY2FtZXJhLm9iai5sb29rQXQoc3ViX2NhbWVyYS5sb29rLnBvc2l0aW9uKTtcclxuXHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUgKz0gdGltZV91bml0O1xyXG4gICAgICBmcmFtZWJ1ZmZlci5tYXRlcmlhbC51bmlmb3Jtcy5hY2NlbGVyYXRpb24udmFsdWUgPSBmb3JjZS5hY2NlbGVyYXRpb24ubGVuZ3RoKCk7XHJcbiAgICAgIGNhbWVyYS5hcHBseUhvb2soMCwgMC4wMjUpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIGNhbWVyYS5sb29rLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBjYW1lcmEubG9vay51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEubG9vay51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEub2JqLmxvb2tBdChjYW1lcmEubG9vay5wb3NpdGlvbik7XHJcblxyXG4gICAgICByZW5kZXJlci5yZW5kZXIoc3ViX3NjZW5lLCBzdWJfY2FtZXJhLm9iaiwgcmVuZGVyX3RhcmdldCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIGlmIChmb3JjZS5hbmNob3IueCA8IDMpIHtcclxuICAgICAgICBmb3JjZS5rICs9IDAuMDA1O1xyXG4gICAgICAgIGZvcmNlLmQgLT0gMC4wMjtcclxuICAgICAgICBmb3JjZS5hbmNob3IueCArPSAwLjg7XHJcbiAgICAgICAgdGltZV91bml0ICs9IDAuNDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3JjZS5rID0gMC4wNTtcclxuICAgICAgICBmb3JjZS5kID0gMC4xNjtcclxuICAgICAgICBmb3JjZS5hbmNob3IueCA9IDEuMDtcclxuICAgICAgICB0aW1lX3VuaXQgPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIGlzX3RvdWNoZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpIHtcclxuICAgICAgaXNfdG91Y2hlZCA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIG1vdXNlT3V0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHRoaXMudG91Y2hFbmQoc2NlbmUsIGNhbWVyYSlcclxuICAgIH0sXHJcbiAgICByZXNpemVXaW5kb3c6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcmVuZGVyX3RhcmdldC5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgICBzdWJfY2FtZXJhLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgICAgZnJhbWVidWZmZXIubWF0ZXJpYWwudW5pZm9ybXMucmVzb2x1dGlvbi52YWx1ZS5zZXQod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcbnZhciBQb2ludHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50cy5qcycpO1xyXG52YXIgTGlnaHQgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50TGlnaHQnKTtcclxuXHJcbnZhciB2cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyBjdXN0b21Db2xvcjtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgdmVydGV4T3BhY2l0eTtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgc2l6ZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdkNvbG9yID0gY3VzdG9tQ29sb3I7XFxyXFxuICBmT3BhY2l0eSA9IHZlcnRleE9wYWNpdHk7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbiAgZ2xfUG9pbnRTaXplID0gc2l6ZSAqICgzMDAuMCAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpO1xcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciBmcyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIHZlYzMgY29sb3I7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciAqIHZDb2xvciwgZk9wYWNpdHkpO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gZ2xfRnJhZ0NvbG9yICogdGV4dHVyZTJEKHRleHR1cmUsIGdsX1BvaW50Q29vcmQpO1xcclxcbn1cXHJcXG5cIjtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgdGhpcy5pbml0KHNjZW5lLCBjYW1lcmEpO1xyXG4gIH07XHJcbiAgdmFyIG1vdmVyc19udW0gPSAxMDAwMDtcclxuICB2YXIgbW92ZXJzID0gW107XHJcbiAgdmFyIHBvaW50cyA9IG5ldyBQb2ludHMoKTtcclxuICB2YXIgbGlnaHQgPSBuZXcgTGlnaHQoKTtcclxuICB2YXIgYmcgPSBudWxsO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIHNpemVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgZ3Jhdml0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAuMSwgMCk7XHJcbiAgdmFyIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGlzX2RyYWdlZCA9IGZhbHNlO1xyXG5cclxuICB2YXIgdXBkYXRlTW92ZXIgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIHtcclxuICAgICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlGb3JjZShncmF2aXR5KTtcclxuICAgICAgICBtb3Zlci5hcHBseURyYWcoMC4wMSk7XHJcbiAgICAgICAgbW92ZXIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgICBtb3Zlci51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICAgIG1vdmVyLnBvc2l0aW9uLnN1Yihwb2ludHMucG9zaXRpb24pO1xyXG4gICAgICAgIGlmIChtb3Zlci50aW1lID4gNTApIHtcclxuICAgICAgICAgIG1vdmVyLnNpemUgLT0gMC43O1xyXG4gICAgICAgICAgbW92ZXIuYSAtPSAwLjAwOTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vdmVyLmEgPD0gMCkge1xyXG4gICAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XHJcbiAgICAgICAgICBtb3Zlci50aW1lID0gMDtcclxuICAgICAgICAgIG1vdmVyLmEgPSAwLjA7XHJcbiAgICAgICAgICBtb3Zlci5pbmFjdGl2YXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIucG9zaXRpb24ueCAtIHBvaW50cy5wb3NpdGlvbi54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnBvc2l0aW9uLnkgLSBwb2ludHMucG9zaXRpb24ueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci5wb3NpdGlvbi56IC0gcG9pbnRzLnBvc2l0aW9uLng7XHJcbiAgICAgIG9wYWNpdGllc1tpXSA9IG1vdmVyLmE7XHJcbiAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgIH1cclxuICAgIHBvaW50cy51cGRhdGVQb2ludHMoKTtcclxuICB9O1xyXG5cclxuICB2YXIgYWN0aXZhdGVNb3ZlciA9ICBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb3VudCA9IDA7XHJcbiAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGlmIChub3cgLSBsYXN0X3RpbWVfYWN0aXZhdGUgPiAxMCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgICBpZiAobW92ZXIuaXNfYWN0aXZlKSBjb250aW51ZTtcclxuICAgICAgICB2YXIgcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKE1hdGgubG9nKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDI1NikpIC8gTWF0aC5sb2coMjU2KSAqIDI2MCk7XHJcbiAgICAgICAgdmFyIHJhZDIgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgICB2YXIgcmFuZ2UgPSAoMS0gTWF0aC5sb2coVXRpbC5nZXRSYW5kb21JbnQoMzIsIDI1NikpIC8gTWF0aC5sb2coMjU2KSkgKiAxMjtcclxuICAgICAgICB2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgICAgICB2YXIgZm9yY2UgPSBVdGlsLmdldFNwaGVyaWNhbChyYWQxLCByYWQyLCByYW5nZSk7XHJcbiAgICAgICAgdmVjdG9yLmFkZChwb2ludHMucG9zaXRpb24pO1xyXG4gICAgICAgIG1vdmVyLmFjdGl2YXRlKCk7XHJcbiAgICAgICAgbW92ZXIuaW5pdCh2ZWN0b3IpO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gICAgICAgIG1vdmVyLmEgPSAwLjI7XHJcbiAgICAgICAgbW92ZXIuc2l6ZSA9IE1hdGgucG93KDEyIC0gcmFuZ2UsIDIpICogVXRpbC5nZXRSYW5kb21JbnQoMSwgMjQpIC8gMTA7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgICBpZiAoY291bnQgPj0gNikgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgdXBkYXRlUG9pbnRzID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgcG9pbnRzLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICBwb2ludHMudXBkYXRlUG9zaXRpb24oKTtcclxuICAgIGxpZ2h0Lm9iai5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIG1vdmVQb2ludHMgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHZhciB5ID0gdmVjdG9yLnkgKiBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodCAvIDM7XHJcbiAgICB2YXIgeiA9IHZlY3Rvci54ICogZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCAvIC0zO1xyXG4gICAgcG9pbnRzLmFuY2hvci55ID0geTtcclxuICAgIHBvaW50cy5hbmNob3IueiA9IHo7XHJcbiAgICBsaWdodC5hbmNob3IueSA9IHk7XHJcbiAgICBsaWdodC5hbmNob3IueiA9IHo7XHJcbiAgfVxyXG5cclxuICB2YXIgY3JlYXRlVGV4dHVyZSA9ICBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIHZhciBncmFkID0gbnVsbDtcclxuICAgIHZhciB0ZXh0dXJlID0gbnVsbDtcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSAyMDA7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gMjAwO1xyXG4gICAgZ3JhZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudCgxMDAsIDEwMCwgMjAsIDEwMCwgMTAwLCAxMDApO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC4yLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC41LCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLjAsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDApJyk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcclxuICAgIGN0eC5hcmMoMTAwLCAxMDAsIDEwMCwgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXMpO1xyXG4gICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdGV4dHVyZTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZCA9ICBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5PY3RhaGVkcm9uR2VvbWV0cnkoMTUwMCwgMyk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBjb2xvcjogMHhmZmZmZmYsXHJcbiAgICAgIHNoYWRpbmc6IFRIUkVFLkZsYXRTaGFkaW5nLFxyXG4gICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc19udW07IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG5ldyBNb3ZlcigpO1xyXG4gICAgICAgIHZhciBoID0gVXRpbC5nZXRSYW5kb21JbnQoMCwgNDUpO1xyXG4gICAgICAgIHZhciBzID0gVXRpbC5nZXRSYW5kb21JbnQoNjAsIDkwKTtcclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgaCArICcsICcgKyBzICsgJyUsIDUwJSknKTtcclxuXHJcbiAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhVdGlsLmdldFJhbmRvbUludCgtMTAwLCAxMDApLCAwLCAwKSk7XHJcbiAgICAgICAgbW92ZXJzLnB1c2gobW92ZXIpO1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIucG9zaXRpb24ueDtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci5wb3NpdGlvbi56O1xyXG4gICAgICAgIGNvbG9yLnRvQXJyYXkoY29sb3JzLCBpICogMyk7XHJcbiAgICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICAgIH1cclxuICAgICAgcG9pbnRzLmluaXQoe1xyXG4gICAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgICB2czogdnMsXHJcbiAgICAgICAgZnM6IGZzLFxyXG4gICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICAgIGNvbG9yczogY29sb3JzLFxyXG4gICAgICAgIG9wYWNpdGllczogb3BhY2l0aWVzLFxyXG4gICAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgICB0ZXh0dXJlOiBjcmVhdGVUZXh0dXJlKCksXHJcbiAgICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcclxuICAgICAgfSk7XHJcbiAgICAgIGxpZ2h0LmluaXQoMHhmZjY2MDAsIDE4MDApO1xyXG4gICAgICBzY2VuZS5hZGQobGlnaHQub2JqKTtcclxuICAgICAgYmcgPSBjcmVhdGVCYWNrZ3JvdW5kKCk7XHJcbiAgICAgIHNjZW5lLmFkZChiZyk7XHJcbiAgICAgIGNhbWVyYS5yYWQxX2Jhc2UgPSBVdGlsLmdldFJhZGlhbigyNSk7XHJcbiAgICAgIGNhbWVyYS5yYWQxID0gY2FtZXJhLnJhZDFfYmFzZTtcclxuICAgICAgY2FtZXJhLnJhZDIgPSBVdGlsLmdldFJhZGlhbigwKTtcclxuICAgICAgY2FtZXJhLnNldFBvc2l0aW9uU3BoZXJpY2FsKCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBwb2ludHMuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocG9pbnRzLm9iaik7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShsaWdodC5vYmopO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgICAgbW92ZXJzID0gW107XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHBvaW50cy5hcHBseUhvb2soMCwgMC4wOCk7XHJcbiAgICAgIHBvaW50cy5hcHBseURyYWcoMC4yKTtcclxuICAgICAgcG9pbnRzLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIHBvaW50cy51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBsaWdodC5hcHBseUhvb2soMCwgMC4wOCk7XHJcbiAgICAgIGxpZ2h0LmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBsaWdodC51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBsaWdodC51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBhY3RpdmF0ZU1vdmVyKCk7XHJcbiAgICAgIHVwZGF0ZU1vdmVyKCk7XHJcbiAgICAgIGNhbWVyYS5hcHBseUhvb2soMCwgMC4wMDQpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlEcmFnKDAuMSk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmxvb2tBdENlbnRlcigpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBtb3ZlUG9pbnRzKHZlY3Rvcik7XHJcbiAgICAgIGlzX2RyYWdlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgaWYgKGlzX2RyYWdlZCkge1xyXG4gICAgICAgIG1vdmVQb2ludHModmVjdG9yX21vdXNlX21vdmUpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBpc19kcmFnZWQgPSBmYWxzZTtcclxuICAgICAgcG9pbnRzLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIGxpZ2h0LmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgdGhpcy50b3VjaEVuZChzY2VuZSwgY2FtZXJhKVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEhlbWlMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvaGVtaUxpZ2h0Jyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuICB2YXIgaW1hZ2VzID0gW107XHJcbiAgdmFyIGltYWdlc19udW0gPSAzMDA7XHJcbiAgdmFyIGhlbWlfbGlnaHQgPSBuZXcgSGVtaUxpZ2h0KCk7XHJcbiAgdmFyIHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcclxuICB2YXIgcGlja2VkX2lkID0gLTE7XHJcbiAgdmFyIHBpY2tlZF9pbmRleCA9IC0xO1xyXG4gIHZhciBpc19jbGlja2VkID0gZmFsc2U7XHJcbiAgdmFyIGlzX2RyYWdlZCA9IGZhbHNlO1xyXG4gIHZhciBnZXRfbmVhciA9IGZhbHNlO1xyXG5cclxuICB2YXIgSW1hZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucmFkID0gMDtcclxuICAgIHRoaXMub2JqID0gbnVsbDtcclxuICAgIHRoaXMuaXNfZW50ZXJlZCA9IGZhbHNlO1xyXG4gICAgRm9yY2UzLmNhbGwodGhpcyk7XHJcbiAgfTtcclxuICB2YXIgaW1hZ2VfZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgxMDAsIDEwMCk7XHJcbiAgSW1hZ2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBJbWFnZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJbWFnZTtcclxuICBJbWFnZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdmFyIGltYWdlX21hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcclxuICAgICAgbWFwOiBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpLmxvYWQoJ2ltZy9nYWxsZXJ5L2ltYWdlMCcgKyBVdGlsLmdldFJhbmRvbUludCgxLCA5KSArICcuanBnJylcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLk1lc2goaW1hZ2VfZ2VvbWV0cnksIGltYWdlX21hdGVyaWFsKTtcclxuICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLm9iai5wb3NpdGlvbjtcclxuICAgIHRoaXMudmVsb2NpdHkgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gdmVjdG9yLmNsb25lKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbi5zZXQoMCwgMCwgMCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGluaXRJbWFnZXMgPSBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZXNfbnVtOyBpKyspIHtcclxuICAgICAgdmFyIGltYWdlID0gbnVsbDtcclxuICAgICAgdmFyIHJhZCA9IFV0aWwuZ2V0UmFkaWFuKGkgJSA0NSAqIDggKyAxODApO1xyXG4gICAgICB2YXIgcmFkaXVzID0gMTAwMDtcclxuICAgICAgdmFyIHggPSBNYXRoLmNvcyhyYWQpICogcmFkaXVzO1xyXG4gICAgICB2YXIgeSA9IGkgKiA1IC0gaW1hZ2VzX251bSAqIDIuNTtcclxuICAgICAgdmFyIHogPSBNYXRoLnNpbihyYWQpICogcmFkaXVzO1xyXG4gICAgICB2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoeCwgeSwgeik7XHJcbiAgICAgIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgIGltYWdlLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoKSk7XHJcbiAgICAgIGltYWdlLnJhZCA9IHJhZDtcclxuICAgICAgaW1hZ2UuYW5jaG9yLmNvcHkodmVjdG9yKTtcclxuICAgICAgc2NlbmUuYWRkKGltYWdlLm9iaik7XHJcbiAgICAgIGltYWdlcy5wdXNoKGltYWdlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgcGlja0ltYWdlID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICBpZiAoZ2V0X25lYXIpIHJldHVybjtcclxuICAgIHZhciBpbnRlcnNlY3RzID0gbnVsbDtcclxuICAgIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKHZlY3RvciwgY2FtZXJhLm9iaik7XHJcbiAgICBpbnRlcnNlY3RzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoc2NlbmUuY2hpbGRyZW4pO1xyXG4gICAgaWYgKGludGVyc2VjdHMubGVuZ3RoID4gMCAmJiBpc19kcmFnZWQgPT0gZmFsc2UpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdpcy1wb2ludGVkJyk7XHJcbiAgICAgIHBpY2tlZF9pZCA9IGludGVyc2VjdHNbMF0ub2JqZWN0LmlkO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVzZXRQaWNrSW1hZ2UoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgZ2V0TmVhckltYWdlID0gZnVuY3Rpb24oY2FtZXJhLCBpbWFnZSkge1xyXG4gICAgZ2V0X25lYXIgPSB0cnVlO1xyXG4gICAgY2FtZXJhLmFuY2hvci5zZXQoTWF0aC5jb3MoaW1hZ2UucmFkKSAqIDc4MCwgaW1hZ2UucG9zaXRpb24ueSwgTWF0aC5zaW4oaW1hZ2UucmFkKSAqIDc4MCk7XHJcbiAgICBjYW1lcmEubG9vay5hbmNob3IuY29weShpbWFnZS5wb3NpdGlvbik7XHJcbiAgICByZXNldFBpY2tJbWFnZSgpO1xyXG4gIH07XHJcblxyXG4gIHZhciByZXNldFBpY2tJbWFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb2ludGVkJyk7XHJcbiAgICBwaWNrZWRfaWQgPSAtMTtcclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBpbml0SW1hZ2VzKHNjZW5lKTtcclxuICAgICAgaGVtaV9saWdodC5pbml0KDB4ZmZmZmZmLCAweGZmZmZmZik7XHJcbiAgICAgIHNjZW5lLmFkZChoZW1pX2xpZ2h0Lm9iaik7XHJcbiAgICAgIGNhbWVyYS5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICBjYW1lcmEucm90YXRlX3JhZDEgPSBVdGlsLmdldFJhZGlhbigtMzUpO1xyXG4gICAgICBjYW1lcmEucm90YXRlX3JhZDFfYmFzZSA9IGNhbWVyYS5yb3RhdGVfcmFkMTtcclxuICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQyID0gVXRpbC5nZXRSYWRpYW4oMTgwKTtcclxuICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQyX2Jhc2UgPSBjYW1lcmEucm90YXRlX3JhZDI7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBpbWFnZV9nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgc2NlbmUucmVtb3ZlKGltYWdlc1tpXS5vYmopO1xyXG4gICAgICB9O1xyXG4gICAgICBzY2VuZS5yZW1vdmUoaGVtaV9saWdodC5vYmopO1xyXG4gICAgICBpbWFnZXMgPSBbXTtcclxuICAgICAgZ2V0X25lYXIgPSBmYWxzZTtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb2ludGVkJyk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VzX251bTsgaSsrKSB7XHJcbiAgICAgICAgaW1hZ2VzW2ldLmFwcGx5SG9vaygwLCAwLjE0KTtcclxuICAgICAgICBpbWFnZXNbaV0uYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgICAgaW1hZ2VzW2ldLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgaW1hZ2VzW2ldLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgaW1hZ2VzW2ldLm9iai5sb29rQXQoe1xyXG4gICAgICAgICAgeDogMCxcclxuICAgICAgICAgIHk6IGltYWdlc1tpXS5wb3NpdGlvbi55LFxyXG4gICAgICAgICAgejogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChpbWFnZXNbaV0ub2JqLmlkID09IHBpY2tlZF9pZCAmJiBpc19kcmFnZWQgPT0gZmFsc2UgJiYgZ2V0X25lYXIgPT0gZmFsc2UpIHtcclxuICAgICAgICAgIGlmIChpc19jbGlja2VkID09IHRydWUpIHtcclxuICAgICAgICAgICAgcGlja2VkX2luZGV4ID0gaTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGltYWdlc1tpXS5vYmoubWF0ZXJpYWwuY29sb3Iuc2V0KDB4YWFhYWFhKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaW1hZ2VzW2ldLm9iai5tYXRlcmlhbC5jb2xvci5zZXQoMHhmZmZmZmYpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjYW1lcmEuYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgaWYgKGdldF9uZWFyID09PSBmYWxzZSkge1xyXG4gICAgICAgIGNhbWVyYS5sb29rLmFuY2hvci5jb3B5KFV0aWwuZ2V0U3BoZXJpY2FsKGNhbWVyYS5yb3RhdGVfcmFkMSwgY2FtZXJhLnJvdGF0ZV9yYWQyLCAxMDAwKSk7XHJcbiAgICAgIH1cclxuICAgICAgY2FtZXJhLmxvb2suYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBjYW1lcmEubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLmxvb2sudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLm9iai5sb29rQXQoY2FtZXJhLmxvb2sucG9zaXRpb24pO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBwaWNrSW1hZ2Uoc2NlbmUsIGNhbWVyYSwgdmVjdG9yKTtcclxuICAgICAgaXNfY2xpY2tlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgcGlja0ltYWdlKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxuICAgICAgaWYgKGlzX2NsaWNrZWQgJiYgdmVjdG9yX21vdXNlX2Rvd24uY2xvbmUoKS5zdWIodmVjdG9yX21vdXNlX21vdmUpLmxlbmd0aCgpID4gMC4wMSkge1xyXG4gICAgICAgIGlzX2NsaWNrZWQgPSBmYWxzZTtcclxuICAgICAgICBpc19kcmFnZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc19kcmFnZWQgPT0gdHJ1ZSAmJiBnZXRfbmVhciA9PSBmYWxzZSkge1xyXG4gICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMSA9IGNhbWVyYS5yb3RhdGVfcmFkMV9iYXNlICsgVXRpbC5nZXRSYWRpYW4oKHZlY3Rvcl9tb3VzZV9kb3duLnkgLSB2ZWN0b3JfbW91c2VfbW92ZS55KSAqIDUwKTtcclxuICAgICAgICBjYW1lcmEucm90YXRlX3JhZDIgPSBjYW1lcmEucm90YXRlX3JhZDJfYmFzZSArIFV0aWwuZ2V0UmFkaWFuKCh2ZWN0b3JfbW91c2VfZG93bi54IC0gdmVjdG9yX21vdXNlX21vdmUueCkgKiA1MCk7XHJcbiAgICAgICAgaWYgKGNhbWVyYS5yb3RhdGVfcmFkMSA8IFV0aWwuZ2V0UmFkaWFuKC01MCkpIHtcclxuICAgICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKC01MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjYW1lcmEucm90YXRlX3JhZDEgPiBVdGlsLmdldFJhZGlhbig1MCkpIHtcclxuICAgICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIHJlc2V0UGlja0ltYWdlKCk7XHJcbiAgICAgIGlmIChnZXRfbmVhcikge1xyXG4gICAgICAgIGNhbWVyYS5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICAgIHBpY2tlZF9pbmRleCA9IC0xO1xyXG4gICAgICAgIGdldF9uZWFyID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSBpZiAoaXNfY2xpY2tlZCAmJiBwaWNrZWRfaW5kZXggPiAtMSkge1xyXG4gICAgICAgIGdldE5lYXJJbWFnZShjYW1lcmEsIGltYWdlc1twaWNrZWRfaW5kZXhdKTtcclxuICAgICAgfSBlbHNlIGlmIChpc19kcmFnZWQpIHtcclxuICAgICAgICBjYW1lcmEucm90YXRlX3JhZDFfYmFzZSA9IGNhbWVyYS5yb3RhdGVfcmFkMTtcclxuICAgICAgICBjYW1lcmEucm90YXRlX3JhZDJfYmFzZSA9IGNhbWVyYS5yb3RhdGVfcmFkMjtcclxuICAgICAgfVxyXG4gICAgICBpc19jbGlja2VkID0gZmFsc2U7XHJcbiAgICAgIGlzX2RyYWdlZCA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIG1vdXNlT3V0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgdGhpcy50b3VjaEVuZChzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpXHJcbiAgICB9XHJcbiAgfTtcclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBDYW1lcmEgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2NhbWVyYScpO1xyXG5cclxudmFyIEZvcmNlMiA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UyJyk7XHJcbi8vIHZhciB2cyA9IGdsc2xpZnkoJy4uLy4uL2dsc2wvaG9sZS52cycpO1xyXG4vLyB2YXIgZnMgPSBnbHNsaWZ5KCcuLi8uLi9nbHNsL2hvbGUuZnMnKTtcclxudmFyIHZzX3BvaW50cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyByYWRpYW47XFxyXFxuXFxyXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcbnVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcclxcbnVuaWZvcm0gZmxvYXQgc2l6ZTtcXHJcXG51bmlmb3JtIHZlYzIgZm9yY2U7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZmxvYXQgcmFkaXVzID0gbWF4KG1pbihyZXNvbHV0aW9uLngsIHJlc29sdXRpb24ueSksIDYwMC4wKSAqIGNvcyhyYWRpYW5zKHRpbWUgKiAyLjApICsgcmFkaWFuLnopO1xcclxcbiAgZmxvYXQgcmFkaWFuX2Jhc2UgPSByYWRpYW5zKHRpbWUgKiAyLjApO1xcclxcbiAgdmVjMyB1cGRhdGVfcG9zaXRvbiA9IHBvc2l0aW9uICsgdmVjMyhcXHJcXG4gICAgY29zKHJhZGlhbl9iYXNlICsgcmFkaWFuLngpICogY29zKHJhZGlhbl9iYXNlICsgcmFkaWFuLnkpICogcmFkaXVzLFxcclxcbiAgICBjb3MocmFkaWFuX2Jhc2UgKyByYWRpYW4ueCkgKiBzaW4ocmFkaWFuX2Jhc2UgKyByYWRpYW4ueSkgKiByYWRpdXMsXFxyXFxuICAgIHNpbihyYWRpYW5fYmFzZSArIHJhZGlhbi54KSAqIHJhZGl1c1xcclxcbiAgKSAqIGZvcmNlLng7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHVwZGF0ZV9wb3NpdG9uLCAxLjApO1xcclxcblxcclxcbiAgZ2xfUG9pbnRTaXplID0gKHNpemUgKyBmb3JjZS55KSAqIChhYnMoc2luKHJhZGlhbl9iYXNlICsgcmFkaWFuLnopKSkgKiAoc2l6ZSAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpICogbWluKHJlc29sdXRpb24ueCwgcmVzb2x1dGlvbi55KTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnNfcG9pbnRzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgc2l6ZTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2ZWMzIG47XFxyXFxuICBuLnh5ID0gZ2xfUG9pbnRDb29yZC54eSAqIDIuMCAtIDEuMDtcXHJcXG4gIG4ueiA9IDEuMCAtIGRvdChuLnh5LCBuLnh5KTtcXHJcXG4gIGlmIChuLnogPCAwLjApIGRpc2NhcmQ7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KDEuMCk7XFxyXFxufVxcclxcblwiO1xyXG52YXIgdnNfZmIgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMyIHZVdjtcXHJcXG5cXHJcXG52b2lkIG1haW4odm9pZCkge1xcclxcbiAgdlV2ID0gdXY7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnNfZmIgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcbnVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTI7XFxyXFxuXFxyXFxuY29uc3QgZmxvYXQgYmx1ciA9IDIwLjA7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMyIHZVdjtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2ZWM0IGNvbG9yID0gdmVjNCgwLjApO1xcclxcbiAgZm9yIChmbG9hdCB4ID0gMC4wOyB4IDwgYmx1cjsgeCsrKXtcXHJcXG4gICAgZm9yIChmbG9hdCB5ID0gMC4wOyB5IDwgYmx1cjsgeSsrKXtcXHJcXG4gICAgICBjb2xvciArPSB0ZXh0dXJlMkQodGV4dHVyZSwgdlV2IC0gKHZlYzIoeCwgeSkgLSB2ZWMyKGJsdXIgLyAyLjApKSAvIHJlc29sdXRpb24pO1xcclxcbiAgICB9XFxyXFxuICB9XFxyXFxuICB2ZWM0IGNvbG9yMiA9IGNvbG9yIC8gcG93KGJsdXIsIDIuMCk7XFxyXFxuICB2ZWM0IGNvbG9yMyA9IHRleHR1cmUyRCh0ZXh0dXJlMiwgdlV2KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IzLnJnYiwgZmxvb3IobGVuZ3RoKGNvbG9yMi5yZ2IpKSk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIHBvaW50cyA9IG51bGw7XHJcbiAgdmFyIGJnID0gbnVsbDtcclxuICB2YXIgbGlnaHQgPSBuZXcgVEhSRUUuSGVtaXNwaGVyZUxpZ2h0KDB4ZmZmZmZmZiwgMHhmZmZmZmZmLCAxKTtcclxuXHJcbiAgdmFyIHN1Yl9zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG4gIHZhciBzdWJfY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMSwgMTAwMDApO1xyXG4gIHZhciByZW5kZXJfdGFyZ2V0ID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gIHZhciBmcmFtZWJ1ZmZlciA9IG51bGw7XHJcblxyXG4gIHZhciBzdWJfc2NlbmUyID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgdmFyIHN1Yl9jYW1lcmEyID0gbmV3IENhbWVyYSgpO1xyXG4gIHZhciBzdWJfbGlnaHQgPSBuZXcgVEhSRUUuSGVtaXNwaGVyZUxpZ2h0KDB4MDAwMDAwLCAweDQ0NDQ0NCwgMSk7XHJcbiAgdmFyIHJlbmRlcl90YXJnZXQyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gIHZhciBiZ19mYiA9IG51bGw7XHJcbiAgdmFyIG9ial9mYiA9IG51bGw7XHJcblxyXG4gIHZhciBmb3JjZSA9IG5ldyBGb3JjZTIoKTtcclxuXHJcbiAgdmFyIGNyZWF0ZVBvaW50c0ZvckNyb3NzRmFkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICB2YXIgdmVydGljZXNfYmFzZSA9IFtdO1xyXG4gICAgdmFyIHJhZGlhbnNfYmFzZSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSArKykge1xyXG4gICAgICB2YXIgeCA9IDA7XHJcbiAgICAgIHZhciB5ID0gMDtcclxuICAgICAgdmFyIHogPSAwO1xyXG4gICAgICB2ZXJ0aWNlc19iYXNlLnB1c2goeCwgeSwgeik7XHJcbiAgICAgIHZhciByMSA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICB2YXIgcjIgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHIzID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgIHJhZGlhbnNfYmFzZS5wdXNoKHIxLCByMiwgcjMpO1xyXG4gICAgfVxyXG4gICAgdmFyIHZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlc19iYXNlKTtcclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHZlcnRpY2VzLCAzKSk7XHJcbiAgICB2YXIgcmFkaWFucyA9IG5ldyBGbG9hdDMyQXJyYXkocmFkaWFuc19iYXNlKTtcclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncmFkaWFuJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShyYWRpYW5zLCAzKSk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwLjBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc29sdXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICd2MicsXHJcbiAgICAgICAgICB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNpemU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAyOC4wXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JjZToge1xyXG4gICAgICAgICAgdHlwZTogJ3YyJyxcclxuICAgICAgICAgIHZhbHVlOiBmb3JjZS52ZWxvY2l0eSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHZzX3BvaW50cyxcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGZzX3BvaW50cyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxyXG4gICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLlBvaW50cyhnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVCYWNrZ3JvdW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMTAwMCwgMzIsIDMyKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlLFxyXG4gICAgICBtYXA6IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCkubG9hZCgnaW1nL2hvbGUvYmFja2dyb3VuZC5qcGcnKSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZU9iamVjdEluRnJhbWVidWZmZXIgPSBmdW5jdGlvbihyYWRpdXMsIGRldGFpbCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeShyYWRpdXMsIGRldGFpbCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZSxcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmcsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH1cclxuXHJcbiAgdmFyIGNyZWF0ZVBsYW5lRm9yRnJhbWVidWZmZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeV9iYXNlID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMiwgMik7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIGdlb21ldHJ5LmZyb21HZW9tZXRyeShnZW9tZXRyeV9iYXNlKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0ZXh0dXJlOiB7XHJcbiAgICAgICAgICB0eXBlOiAndCcsXHJcbiAgICAgICAgICB2YWx1ZTogcmVuZGVyX3RhcmdldCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRleHR1cmUyOiB7XHJcbiAgICAgICAgICB0eXBlOiAndCcsXHJcbiAgICAgICAgICB2YWx1ZTogcmVuZGVyX3RhcmdldDIsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiB2c19mYixcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGZzX2ZiLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJ2JnLXdoaXRlJztcclxuICAgICAgZm9yY2UuYW5jaG9yLnNldCgxLCAwKTtcclxuXHJcbiAgICAgIHN1Yl9jYW1lcmEyLmluaXQod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmFuY2hvci5zZXQoMTAwMCwgMzAwLCAwKTtcclxuICAgICAgc3ViX2NhbWVyYTIubG9vay5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICBvYmpfZmIgPSBjcmVhdGVPYmplY3RJbkZyYW1lYnVmZmVyKDYwLCAyKTtcclxuICAgICAgc3ViX3NjZW5lMi5hZGQob2JqX2ZiKTtcclxuICAgICAgc3ViX3NjZW5lMi5hZGQoc3ViX2xpZ2h0KTtcclxuXHJcbiAgICAgIHBvaW50cyA9IGNyZWF0ZVBvaW50c0ZvckNyb3NzRmFkZSgpO1xyXG4gICAgICBzdWJfc2NlbmUuYWRkKHBvaW50cyk7XHJcbiAgICAgIHN1Yl9jYW1lcmEucG9zaXRpb24uc2V0KDAsIDAsIDMwMDApO1xyXG4gICAgICBzdWJfY2FtZXJhLmxvb2tBdCgwLCAwLCAwKTtcclxuXHJcbiAgICAgIGZyYW1lYnVmZmVyID0gY3JlYXRlUGxhbmVGb3JGcmFtZWJ1ZmZlcigpO1xyXG4gICAgICBzY2VuZS5hZGQoZnJhbWVidWZmZXIpO1xyXG4gICAgICBiZyA9IGNyZWF0ZUJhY2tncm91bmQoKTtcclxuICAgICAgc2NlbmUuYWRkKGJnKTtcclxuICAgICAgc2NlbmUuYWRkKGxpZ2h0KTtcclxuICAgICAgY2FtZXJhLmFuY2hvci5zZXQoMTAwMCwgLTMwMCwgMCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICcnO1xyXG5cclxuICAgICAgb2JqX2ZiLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgb2JqX2ZiLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc3ViX3NjZW5lMi5yZW1vdmUob2JqX2ZiKTtcclxuICAgICAgc3ViX3NjZW5lMi5yZW1vdmUoc3ViX2xpZ2h0KTtcclxuXHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHN1Yl9zY2VuZS5yZW1vdmUocG9pbnRzKTtcclxuXHJcbiAgICAgIGZyYW1lYnVmZmVyLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgZnJhbWVidWZmZXIubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoZnJhbWVidWZmZXIpO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGxpZ2h0KTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyKSB7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlKys7XHJcbiAgICAgIGZyYW1lYnVmZmVyLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuICAgICAgYmcucm90YXRpb24ueSA9IHBvaW50cy5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlIC8gMjAwO1xyXG4gICAgICBvYmpfZmIucm90YXRpb24ueSA9IHBvaW50cy5tYXRlcmlhbC51bmlmb3Jtcy50aW1lLnZhbHVlIC8gMjAwO1xyXG4gICAgICBmb3JjZS5hcHBseUhvb2soMCwgMC4wNik7XHJcbiAgICAgIGZvcmNlLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBmb3JjZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBmb3JjZS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgY2FtZXJhLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLmFuY2hvci55ID0gTWF0aC5zaW4ocG9pbnRzLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUgLyAxMDApICogMTAwO1xyXG4gICAgICBjYW1lcmEubG9vay5hcHBseUhvb2soMCwgMC4yKTtcclxuICAgICAgY2FtZXJhLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5vYmoubG9va0F0KGNhbWVyYS5sb29rLnBvc2l0aW9uKTtcclxuICAgICAgc3ViX2NhbWVyYTIuYXBwbHlIb29rKDAsIDAuMSk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBzdWJfY2FtZXJhMi51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBzdWJfY2FtZXJhMi51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBzdWJfY2FtZXJhMi5sb29rLmFwcGx5SG9vaygwLCAwLjIpO1xyXG4gICAgICBzdWJfY2FtZXJhMi5sb29rLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBzdWJfY2FtZXJhMi5sb29rLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmxvb2sudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgc3ViX2NhbWVyYTIub2JqLmxvb2tBdChzdWJfY2FtZXJhMi5sb29rLnBvc2l0aW9uKTtcclxuICAgICAgcmVuZGVyZXIucmVuZGVyKHN1Yl9zY2VuZTIsIHN1Yl9jYW1lcmEyLm9iaiwgcmVuZGVyX3RhcmdldDIpO1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIoc3ViX3NjZW5lLCBzdWJfY2FtZXJhLCByZW5kZXJfdGFyZ2V0KTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgZm9yY2UuYW5jaG9yLnNldCgyLCA0MCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmFuY2hvci5zZXQoNjAwLCAtMzAwLCAwKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMSwgMCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLmFuY2hvci5zZXQoMTAwMCwgMzAwLCAwKTtcclxuICAgIH0sXHJcbiAgICBtb3VzZU91dDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3JjZS5hbmNob3Iuc2V0KDEsIDApO1xyXG4gICAgICBzdWJfY2FtZXJhMi5hbmNob3Iuc2V0KDEwMDAsIDMwMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgcmVzaXplV2luZG93OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHJlbmRlcl90YXJnZXQuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgICAgcmVuZGVyX3RhcmdldDIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgICAgc3ViX2NhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgc3ViX2NhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcbiAgICAgIHN1Yl9jYW1lcmEyLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLnVuaWZvcm1zLnJlc29sdXRpb24udmFsdWUuc2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgICBmcmFtZWJ1ZmZlci5tYXRlcmlhbC51bmlmb3Jtcy5yZXNvbHV0aW9uLnZhbHVlLnNldCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbW92ZXInKTtcclxudmFyIFBvaW50cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRzLmpzJyk7XHJcbnZhciBMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRMaWdodCcpO1xyXG5cclxudmFyIHZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGN1c3RvbUNvbG9yO1xcclxcbmF0dHJpYnV0ZSBmbG9hdCB2ZXJ0ZXhPcGFjaXR5O1xcclxcbmF0dHJpYnV0ZSBmbG9hdCBzaXplO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2Q29sb3IgPSBjdXN0b21Db2xvcjtcXHJcXG4gIGZPcGFjaXR5ID0gdmVydGV4T3BhY2l0eTtcXHJcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxuICBnbF9Qb2ludFNpemUgPSBzaXplICogKDMwMC4wIC8gbGVuZ3RoKG12UG9zaXRpb24ueHl6KSk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gdmVjMyBjb2xvcjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yICogdkNvbG9yLCBmT3BhY2l0eSk7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSBnbF9GcmFnQ29sb3IgKiB0ZXh0dXJlMkQodGV4dHVyZSwgZ2xfUG9pbnRDb29yZCk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuICB2YXIgbW92ZXJzX251bSA9IDIwMDAwO1xyXG4gIHZhciBtb3ZlcnMgPSBbXTtcclxuICB2YXIgcG9pbnRzID0gbmV3IFBvaW50cygpO1xyXG4gIHZhciBsaWdodCA9IG5ldyBMaWdodCgpO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIHNpemVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgZ3Jhdml0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKDEuNSwgMCwgMCk7XHJcbiAgdmFyIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIHtcclxuICAgICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlGb3JjZShncmF2aXR5KTtcclxuICAgICAgICBtb3Zlci5hcHBseURyYWcoMC4xKTtcclxuICAgICAgICBtb3Zlci51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgaWYgKG1vdmVyLmEgPCAwLjgpIHtcclxuICAgICAgICAgIG1vdmVyLmEgKz0gMC4wMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vdmVyLnBvc2l0aW9uLnggPiAxMDAwKSB7XHJcbiAgICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgIG1vdmVyLnRpbWUgPSAwO1xyXG4gICAgICAgICAgbW92ZXIuYSA9IDAuMDtcclxuICAgICAgICAgIG1vdmVyLmluYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci5wb3NpdGlvbi54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnBvc2l0aW9uLnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIucG9zaXRpb24uejtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY3RpdmF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gZ3Jhdml0eS54ICogMTYpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZCA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDEyMCkgKiAzKTtcclxuICAgICAgICB2YXIgcmFuZ2UgPSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgyLCAxMjgpKSAvIE1hdGgubG9nKDEyOCkgKiAxNjAgKyA2MDtcclxuICAgICAgICB2YXIgeSA9IE1hdGguc2luKHJhZCkgKiByYW5nZTtcclxuICAgICAgICB2YXIgeiA9IE1hdGguY29zKHJhZCkgKiByYW5nZTtcclxuICAgICAgICB2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoLTEwMDAsIHksIHopO1xyXG4gICAgICAgIHZlY3Rvci5hZGQocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgICBtb3Zlci5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIG1vdmVyLmluaXQodmVjdG9yKTtcclxuICAgICAgICBtb3Zlci5hID0gMDtcclxuICAgICAgICBtb3Zlci5zaXplID0gVXRpbC5nZXRSYW5kb21JbnQoNSwgNjApO1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgaWYgKGNvdW50ID49IE1hdGgucG93KGdyYXZpdHkueCAqIDMsIGdyYXZpdHkueCAqIDAuNCkpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHVwZGF0ZVBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcG9pbnRzLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICBwb2ludHMudXBkYXRlUG9zaXRpb24oKTtcclxuICAgIGxpZ2h0Lm9iai5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVRleHR1cmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIHZhciBncmFkID0gbnVsbDtcclxuICAgIHZhciB0ZXh0dXJlID0gbnVsbDtcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSAyMDA7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gMjAwO1xyXG4gICAgZ3JhZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudCgxMDAsIDEwMCwgMjAsIDEwMCwgMTAwLCAxMDApO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC4yLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC41LCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLjAsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDApJyk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcclxuICAgIGN0eC5hcmMoMTAwLCAxMDAsIDEwMCwgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXMpO1xyXG4gICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdGV4dHVyZTtcclxuICB9O1xyXG5cclxuICB2YXIgY2hhbmdlR3Jhdml0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGlzX3RvdWNoZWQpIHtcclxuICAgICAgaWYgKGdyYXZpdHkueCA8IDYpIGdyYXZpdHkueCArPSAwLjAyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGdyYXZpdHkueCA+IDEuNSkgZ3Jhdml0eS54IC09IDAuMTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc19udW07IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG5ldyBNb3ZlcigpO1xyXG4gICAgICAgIHZhciBoID0gVXRpbC5nZXRSYW5kb21JbnQoNjAsIDIxMCk7XHJcbiAgICAgICAgdmFyIHMgPSBVdGlsLmdldFJhbmRvbUludCgzMCwgOTApO1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyBoICsgJywgJyArIHMgKyAnJSwgNTAlKScpO1xyXG5cclxuICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKFV0aWwuZ2V0UmFuZG9tSW50KC0xMDAsIDEwMCksIDAsIDApKTtcclxuICAgICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci5wb3NpdGlvbi54O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIucG9zaXRpb24ueTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnBvc2l0aW9uLno7XHJcbiAgICAgICAgY29sb3IudG9BcnJheShjb2xvcnMsIGkgKiAzKTtcclxuICAgICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgICAgfVxyXG4gICAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgICAgc2NlbmU6IHNjZW5lLFxyXG4gICAgICAgIHZzOiB2cyxcclxuICAgICAgICBmczogZnMsXHJcbiAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXHJcbiAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgICAgc2l6ZXM6IHNpemVzLFxyXG4gICAgICAgIHRleHR1cmU6IGNyZWF0ZVRleHR1cmUoKSxcclxuICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xyXG4gICAgICB9KTtcclxuICAgICAgbGlnaHQuaW5pdCgpO1xyXG4gICAgICBzY2VuZS5hZGQobGlnaHQub2JqKTtcclxuICAgICAgY2FtZXJhLmFuY2hvciA9IG5ldyBUSFJFRS5WZWN0b3IzKDgwMCwgMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBwb2ludHMuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocG9pbnRzLm9iaik7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShsaWdodC5vYmopO1xyXG4gICAgICBtb3ZlcnMgPSBbXTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgY2hhbmdlR3Jhdml0eSgpO1xyXG4gICAgICBhY3RpdmF0ZU1vdmVyKCk7XHJcbiAgICAgIHVwZGF0ZU1vdmVyKCk7XHJcbiAgICAgIGNhbWVyYS5hcHBseUhvb2soMCwgMC4wMDgpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlEcmFnKDAuMSk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmxvb2tBdENlbnRlcigpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBpc190b3VjaGVkID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBjYW1lcmEuYW5jaG9yLnogPSB2ZWN0b3JfbW91c2VfbW92ZS54ICogMTIwO1xyXG4gICAgICBjYW1lcmEuYW5jaG9yLnkgPSB2ZWN0b3JfbW91c2VfbW92ZS55ICogLTEyMDtcclxuICAgICAgLy9jYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpIHtcclxuICAgICAgY2FtZXJhLmFuY2hvci56ID0gMDtcclxuICAgICAgY2FtZXJhLmFuY2hvci55ID0gMDtcclxuICAgICAgaXNfdG91Y2hlZCA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIG1vdXNlT3V0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHRoaXMudG91Y2hFbmQoc2NlbmUsIGNhbWVyYSlcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbW92ZXInKTtcclxuXHJcbnZhciBQb2ludHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50cy5qcycpO1xyXG52YXIgdnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgY3VzdG9tQ29sb3I7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHZlcnRleE9wYWNpdHk7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHNpemU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZDb2xvciA9IGN1c3RvbUNvbG9yO1xcclxcbiAgZk9wYWNpdHkgPSB2ZXJ0ZXhPcGFjaXR5O1xcclxcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG4gIGdsX1BvaW50U2l6ZSA9IHNpemUgKiAoMzAwLjAgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXHJcXG59XFxyXFxuXCI7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIHRoaXMuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICB9O1xyXG4gIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gIHZhciBpbWFnZV92ZXJ0aWNlcyA9IFtdO1xyXG4gIHZhciBtb3ZlcnMgPSBbXTtcclxuICB2YXIgcG9zaXRpb25zID0gbnVsbDtcclxuICB2YXIgY29sb3JzID0gbnVsbDtcclxuICB2YXIgb3BhY2l0aWVzID0gbnVsbDtcclxuICB2YXIgc2l6ZXMgPSBudWxsO1xyXG4gIHZhciBsZW5ndGhfc2lkZSA9IDQwMDtcclxuICB2YXIgcG9pbnRzID0gbmV3IFBvaW50cygpO1xyXG4gIHZhciBjcmVhdGVkX3BvaW50cyA9IGZhbHNlO1xyXG5cclxuICB2YXIgbG9hZEltYWdlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgIGltYWdlLnNyYyA9ICcuL2ltZy9pbWFnZV9kYXRhL2VsZXBoYW50LnBuZyc7XHJcbiAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgdmFyIGdldEltYWdlRGF0YSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgY2FudmFzLndpZHRoID0gbGVuZ3RoX3NpZGU7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gbGVuZ3RoX3NpZGU7XHJcbiAgICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcclxuICAgIHZhciBpbWFnZV9kYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBsZW5ndGhfc2lkZSwgbGVuZ3RoX3NpZGUpO1xyXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBsZW5ndGhfc2lkZTsgeSsrKSB7XHJcbiAgICAgIGlmICh5ICUgMyA+IDApIGNvbnRpbnVlO1xyXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IGxlbmd0aF9zaWRlOyB4KyspIHtcclxuICAgICAgICBpZiAoeCAlIDMgPiAwKSBjb250aW51ZTtcclxuICAgICAgICBpZihpbWFnZV9kYXRhLmRhdGFbKHggKyB5ICogbGVuZ3RoX3NpZGUpICogNF0gPiAwKSB7XHJcbiAgICAgICAgICBpbWFnZV92ZXJ0aWNlcy5wdXNoKDAsICh5IC0gbGVuZ3RoX3NpZGUgLyAyKSAqIC0xLCAoeCAtIGxlbmd0aF9zaWRlLyAyKSAqIC0xKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgYnVpbGRQb2ludHMgPSBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShpbWFnZV92ZXJ0aWNlcyk7XHJcbiAgICBjb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KGltYWdlX3ZlcnRpY2VzLmxlbmd0aCk7XHJcbiAgICBvcGFjaXRpZXMgPSBuZXcgRmxvYXQzMkFycmF5KGltYWdlX3ZlcnRpY2VzLmxlbmd0aCAvIDMpO1xyXG4gICAgc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KGltYWdlX3ZlcnRpY2VzLmxlbmd0aCAvIDMpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZV92ZXJ0aWNlcy5sZW5ndGggLyAzOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XHJcbiAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoc2woJyArIChpbWFnZV92ZXJ0aWNlc1tpICogMyArIDJdICsgaW1hZ2VfdmVydGljZXNbaSAqIDMgKyAxXSArIGxlbmd0aF9zaWRlKSAvIDVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJywgNjAlLCA4MCUpJyk7XHJcbiAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoaW1hZ2VfdmVydGljZXNbaSAqIDNdLCBpbWFnZV92ZXJ0aWNlc1tpICogMyArIDFdLCBpbWFnZV92ZXJ0aWNlc1tpICogMyArIDJdKSk7XHJcbiAgICAgIG1vdmVyLmlzX2FjdGl2YXRlID0gdHJ1ZTtcclxuICAgICAgbW92ZXJzLnB1c2gobW92ZXIpO1xyXG4gICAgICBjb2xvci50b0FycmF5KGNvbG9ycywgaSAqIDMpO1xyXG4gICAgICBvcGFjaXRpZXNbaV0gPSAxO1xyXG4gICAgICBzaXplc1tpXSA9IDEyO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLmluaXQoe1xyXG4gICAgICBzY2VuZTogc2NlbmUsXHJcbiAgICAgIHZzOiB2cyxcclxuICAgICAgZnM6IGZzLFxyXG4gICAgICBwb3NpdGlvbnM6IHBvc2l0aW9ucyxcclxuICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgIG9wYWNpdGllczogb3BhY2l0aWVzLFxyXG4gICAgICBzaXplczogc2l6ZXMsXHJcbiAgICAgIHRleHR1cmU6IGNyZWF0ZVRleHR1cmUoKSxcclxuICAgICAgYmxlbmRpbmc6IFRIUkVFLk5vcm1hbEJsZW5kaW5nXHJcbiAgICB9KTtcclxuICAgIGNyZWF0ZWRfcG9pbnRzID0gdHJ1ZTtcclxuICB9O1xyXG5cclxuICB2YXIgYXBwbHlGb3JjZVRvUG9pbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgIHZhciByYWQxID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgIHZhciByYWQyID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgIHZhciBzY2FsYXIgPSBVdGlsLmdldFJhbmRvbUludCg0MCwgODApO1xyXG4gICAgICBtb3Zlci5pc19hY3RpdmF0ZSA9IGZhbHNlO1xyXG4gICAgICBtb3Zlci5hcHBseUZvcmNlKFV0aWwuZ2V0U3BoZXJpY2FsKHJhZDEsIHJhZDIsIHNjYWxhcikpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciB1cGRhdGVNb3ZlciA9ICBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICBpZiAobW92ZXIuYWNjZWxlcmF0aW9uLmxlbmd0aCgpIDwgMSkge1xyXG4gICAgICAgIG1vdmVyLmlzX2FjdGl2YXRlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZhdGUpIHtcclxuICAgICAgICBtb3Zlci5hcHBseUhvb2soMCwgMC4xOCk7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMjYpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG1vdmVyLmFwcGx5RHJhZygwLjAzNSk7XHJcbiAgICAgIH1cclxuICAgICAgbW92ZXIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgbW92ZXIudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgbW92ZXIucG9zaXRpb24uc3ViKHBvaW50cy5wb3NpdGlvbik7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIucG9zaXRpb24ueCAtIHBvaW50cy5wb3NpdGlvbi54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnBvc2l0aW9uLnkgLSBwb2ludHMucG9zaXRpb24ueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci5wb3NpdGlvbi56IC0gcG9pbnRzLnBvc2l0aW9uLng7XHJcbiAgICAgIG1vdmVyLnNpemUgPSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgxLCAxMjgpKSAvIE1hdGgubG9nKDEyOCkgKiBNYXRoLnNxcnQoZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCk7XHJcbiAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgIH1cclxuICAgIHBvaW50cy51cGRhdGVQb2ludHMoKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlVGV4dHVyZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgdmFyIGdyYWQgPSBudWxsO1xyXG4gICAgdmFyIHRleHR1cmUgPSBudWxsO1xyXG5cclxuICAgIGNhbnZhcy53aWR0aCA9IDIwMDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSAyMDA7XHJcbiAgICBncmFkID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KDEwMCwgMTAwLCAyMCwgMTAwLCAxMDAsIDEwMCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjIsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjUsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEuMCwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMCknKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xyXG4gICAgY3R4LmFyYygxMDAsIDEwMCwgMTAwLCAwLCBNYXRoLlBJIC8gMTgwLCB0cnVlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGxvYWRJbWFnZShmdW5jdGlvbigpIHtcclxuICAgICAgICBnZXRJbWFnZURhdGEoKTtcclxuICAgICAgICBidWlsZFBvaW50cyhzY2VuZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBjYW1lcmEucmFuZ2UgPSAxNDAwO1xyXG4gICAgICBjYW1lcmEucmFkMV9iYXNlID0gVXRpbC5nZXRSYWRpYW4oMCk7XHJcbiAgICAgIGNhbWVyYS5yYWQxID0gY2FtZXJhLnJhZDFfYmFzZTtcclxuICAgICAgY2FtZXJhLnJhZDIgPSBVdGlsLmdldFJhZGlhbigwKTtcclxuICAgICAgY2FtZXJhLnNldFBvc2l0aW9uU3BoZXJpY2FsKCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMub2JqKTtcclxuICAgICAgaW1hZ2VfdmVydGljZXMgPSBbXTtcclxuICAgICAgbW92ZXJzID0gW107XHJcbiAgICAgIGNhbWVyYS5yYW5nZSA9IDEwMDA7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGlmIChjcmVhdGVkX3BvaW50cykge1xyXG4gICAgICAgIHVwZGF0ZU1vdmVyKCk7XHJcbiAgICAgICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbWVyYS5hcHBseUhvb2soMCwgMC4wMjUpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmxvb2tBdENlbnRlcigpO1xyXG5cclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgYXBwbHlGb3JjZVRvUG9pbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgY2FtZXJhLmFuY2hvci56ID0gdmVjdG9yX21vdXNlX21vdmUueCAqIDEwMDA7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IueSA9IHZlY3Rvcl9tb3VzZV9tb3ZlLnkgKiAtMTAwMDtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgICBjYW1lcmEuYW5jaG9yLnogPSAwO1xyXG4gICAgICBjYW1lcmEuYW5jaG9yLnkgPSAwO1xyXG4gICAgfSxcclxuICAgIG1vdXNlT3V0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHRoaXMudG91Y2hFbmQoc2NlbmUsIGNhbWVyYSlcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcblxyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxudmFyIHZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgbWF0NCBtX21hdHJpeDtcXHJcXG5cXHJcXG5mbG9hdCBpbnZlcnNlXzFfMChmbG9hdCBtKSB7XFxuICByZXR1cm4gMS4wIC8gbTtcXG59XFxuXFxubWF0MiBpbnZlcnNlXzFfMChtYXQyIG0pIHtcXG4gIHJldHVybiBtYXQyKG1bMV1bMV0sLW1bMF1bMV0sXFxuICAgICAgICAgICAgIC1tWzFdWzBdLCBtWzBdWzBdKSAvIChtWzBdWzBdKm1bMV1bMV0gLSBtWzBdWzFdKm1bMV1bMF0pO1xcbn1cXG5cXG5tYXQzIGludmVyc2VfMV8wKG1hdDMgbSkge1xcbiAgZmxvYXQgYTAwID0gbVswXVswXSwgYTAxID0gbVswXVsxXSwgYTAyID0gbVswXVsyXTtcXG4gIGZsb2F0IGExMCA9IG1bMV1bMF0sIGExMSA9IG1bMV1bMV0sIGExMiA9IG1bMV1bMl07XFxuICBmbG9hdCBhMjAgPSBtWzJdWzBdLCBhMjEgPSBtWzJdWzFdLCBhMjIgPSBtWzJdWzJdO1xcblxcbiAgZmxvYXQgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxO1xcbiAgZmxvYXQgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMDtcXG4gIGZsb2F0IGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMDtcXG5cXG4gIGZsb2F0IGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcXG5cXG4gIHJldHVybiBtYXQzKGIwMSwgKC1hMjIgKiBhMDEgKyBhMDIgKiBhMjEpLCAoYTEyICogYTAxIC0gYTAyICogYTExKSxcXG4gICAgICAgICAgICAgIGIxMSwgKGEyMiAqIGEwMCAtIGEwMiAqIGEyMCksICgtYTEyICogYTAwICsgYTAyICogYTEwKSxcXG4gICAgICAgICAgICAgIGIyMSwgKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApLCAoYTExICogYTAwIC0gYTAxICogYTEwKSkgLyBkZXQ7XFxufVxcblxcbm1hdDQgaW52ZXJzZV8xXzAobWF0NCBtKSB7XFxuICBmbG9hdFxcbiAgICAgIGEwMCA9IG1bMF1bMF0sIGEwMSA9IG1bMF1bMV0sIGEwMiA9IG1bMF1bMl0sIGEwMyA9IG1bMF1bM10sXFxuICAgICAgYTEwID0gbVsxXVswXSwgYTExID0gbVsxXVsxXSwgYTEyID0gbVsxXVsyXSwgYTEzID0gbVsxXVszXSxcXG4gICAgICBhMjAgPSBtWzJdWzBdLCBhMjEgPSBtWzJdWzFdLCBhMjIgPSBtWzJdWzJdLCBhMjMgPSBtWzJdWzNdLFxcbiAgICAgIGEzMCA9IG1bM11bMF0sIGEzMSA9IG1bM11bMV0sIGEzMiA9IG1bM11bMl0sIGEzMyA9IG1bM11bM10sXFxuXFxuICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxcbiAgICAgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcXG4gICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXFxuICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxcbiAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSxcXG4gICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXFxuICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxcbiAgICAgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcXG4gICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXFxuICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxcbiAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSxcXG4gICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzIsXFxuXFxuICAgICAgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xcblxcbiAgcmV0dXJuIG1hdDQoXFxuICAgICAgYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5LFxcbiAgICAgIGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSxcXG4gICAgICBhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMsXFxuICAgICAgYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzLFxcbiAgICAgIGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNyxcXG4gICAgICBhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcsXFxuICAgICAgYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxLFxcbiAgICAgIGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSxcXG4gICAgICBhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYsXFxuICAgICAgYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2LFxcbiAgICAgIGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCxcXG4gICAgICBhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDAsXFxuICAgICAgYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2LFxcbiAgICAgIGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNixcXG4gICAgICBhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDAsXFxuICAgICAgYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwKSAvIGRldDtcXG59XFxuXFxuXFxuXFxyXFxudm9pZCBtYWluKHZvaWQpIHtcXHJcXG4gIG1fbWF0cml4ID0gaW52ZXJzZV8xXzAobW9kZWxNYXRyaXgpO1xcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciBmcyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxyXFxudW5pZm9ybSBmbG9hdCB0aW1lMjtcXHJcXG51bmlmb3JtIGZsb2F0IGFjY2VsZXJhdGlvbjtcXHJcXG51bmlmb3JtIHZlYzIgcmVzb2x1dGlvbjtcXHJcXG5cXHJcXG52YXJ5aW5nIG1hdDQgbV9tYXRyaXg7XFxyXFxuXFxyXFxuLy8gY29uc3QgdmVjMyBjUG9zID0gdmVjMygwLjAsIDAuMCwgMTAuMCk7XFxyXFxuY29uc3QgZmxvYXQgdGFyZ2V0RGVwdGggPSAzLjU7XFxyXFxuY29uc3QgdmVjMyBsaWdodERpciA9IHZlYzMoMC41NzcsIC0wLjU3NywgMC41NzcpO1xcclxcblxcclxcbnZlYzMgaHN2MnJnYl8xXzAodmVjMyBjKXtcXHJcXG4gIHZlYzQgSyA9IHZlYzQoMS4wLCAyLjAgLyAzLjAsIDEuMCAvIDMuMCwgMy4wKTtcXHJcXG4gIHZlYzMgcCA9IGFicyhmcmFjdChjLnh4eCArIEsueHl6KSAqIDYuMCAtIEsud3d3KTtcXHJcXG4gIHJldHVybiBjLnogKiBtaXgoSy54eHgsIGNsYW1wKHAgLSBLLnh4eCwgMC4wLCAxLjApLCBjLnkpO1xcclxcbn1cXHJcXG5cXG5cXG4vL1xcbi8vIERlc2NyaXB0aW9uIDogQXJyYXkgYW5kIHRleHR1cmVsZXNzIEdMU0wgMkQvM0QvNEQgc2ltcGxleFxcbi8vICAgICAgICAgICAgICAgbm9pc2UgZnVuY3Rpb25zLlxcbi8vICAgICAgQXV0aG9yIDogSWFuIE1jRXdhbiwgQXNoaW1hIEFydHMuXFxuLy8gIE1haW50YWluZXIgOiBpam1cXG4vLyAgICAgTGFzdG1vZCA6IDIwMTEwODIyIChpam0pXFxuLy8gICAgIExpY2Vuc2UgOiBDb3B5cmlnaHQgKEMpIDIwMTEgQXNoaW1hIEFydHMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXFxuLy8gICAgICAgICAgICAgICBEaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUuXFxuLy8gICAgICAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vYXNoaW1hL3dlYmdsLW5vaXNlXFxuLy9cXG5cXG52ZWMzIG1vZDI4OV80XzEodmVjMyB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IG1vZDI4OV80XzEodmVjNCB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IHBlcm11dGVfNF8yKHZlYzQgeCkge1xcbiAgICAgcmV0dXJuIG1vZDI4OV80XzEoKCh4KjM0LjApKzEuMCkqeCk7XFxufVxcblxcbnZlYzQgdGF5bG9ySW52U3FydF80XzModmVjNCByKVxcbntcXG4gIHJldHVybiAxLjc5Mjg0MjkxNDAwMTU5IC0gMC44NTM3MzQ3MjA5NTMxNCAqIHI7XFxufVxcblxcbmZsb2F0IHNub2lzZV80XzQodmVjMyB2KVxcbiAge1xcbiAgY29uc3QgdmVjMiAgQyA9IHZlYzIoMS4wLzYuMCwgMS4wLzMuMCkgO1xcbiAgY29uc3QgdmVjNCAgRF80XzUgPSB2ZWM0KDAuMCwgMC41LCAxLjAsIDIuMCk7XFxuXFxuLy8gRmlyc3QgY29ybmVyXFxuICB2ZWMzIGkgID0gZmxvb3IodiArIGRvdCh2LCBDLnl5eSkgKTtcXG4gIHZlYzMgeDAgPSAgIHYgLSBpICsgZG90KGksIEMueHh4KSA7XFxuXFxuLy8gT3RoZXIgY29ybmVyc1xcbiAgdmVjMyBnXzRfNiA9IHN0ZXAoeDAueXp4LCB4MC54eXopO1xcbiAgdmVjMyBsID0gMS4wIC0gZ180XzY7XFxuICB2ZWMzIGkxID0gbWluKCBnXzRfNi54eXosIGwuenh5ICk7XFxuICB2ZWMzIGkyID0gbWF4KCBnXzRfNi54eXosIGwuenh5ICk7XFxuXFxuICAvLyAgIHgwID0geDAgLSAwLjAgKyAwLjAgKiBDLnh4eDtcXG4gIC8vICAgeDEgPSB4MCAtIGkxICArIDEuMCAqIEMueHh4O1xcbiAgLy8gICB4MiA9IHgwIC0gaTIgICsgMi4wICogQy54eHg7XFxuICAvLyAgIHgzID0geDAgLSAxLjAgKyAzLjAgKiBDLnh4eDtcXG4gIHZlYzMgeDEgPSB4MCAtIGkxICsgQy54eHg7XFxuICB2ZWMzIHgyID0geDAgLSBpMiArIEMueXl5OyAvLyAyLjAqQy54ID0gMS8zID0gQy55XFxuICB2ZWMzIHgzID0geDAgLSBEXzRfNS55eXk7ICAgICAgLy8gLTEuMCszLjAqQy54ID0gLTAuNSA9IC1ELnlcXG5cXG4vLyBQZXJtdXRhdGlvbnNcXG4gIGkgPSBtb2QyODlfNF8xKGkpO1xcbiAgdmVjNCBwID0gcGVybXV0ZV80XzIoIHBlcm11dGVfNF8yKCBwZXJtdXRlXzRfMihcXG4gICAgICAgICAgICAgaS56ICsgdmVjNCgwLjAsIGkxLnosIGkyLnosIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnkgKyB2ZWM0KDAuMCwgaTEueSwgaTIueSwgMS4wICkpXFxuICAgICAgICAgICArIGkueCArIHZlYzQoMC4wLCBpMS54LCBpMi54LCAxLjAgKSk7XFxuXFxuLy8gR3JhZGllbnRzOiA3eDcgcG9pbnRzIG92ZXIgYSBzcXVhcmUsIG1hcHBlZCBvbnRvIGFuIG9jdGFoZWRyb24uXFxuLy8gVGhlIHJpbmcgc2l6ZSAxNyoxNyA9IDI4OSBpcyBjbG9zZSB0byBhIG11bHRpcGxlIG9mIDQ5ICg0OSo2ID0gMjk0KVxcbiAgZmxvYXQgbl8gPSAwLjE0Mjg1NzE0Mjg1NzsgLy8gMS4wLzcuMFxcbiAgdmVjMyAgbnMgPSBuXyAqIERfNF81Lnd5eiAtIERfNF81Lnh6eDtcXG5cXG4gIHZlYzQgaiA9IHAgLSA0OS4wICogZmxvb3IocCAqIG5zLnogKiBucy56KTsgIC8vICBtb2QocCw3KjcpXFxuXFxuICB2ZWM0IHhfID0gZmxvb3IoaiAqIG5zLnopO1xcbiAgdmVjNCB5XyA9IGZsb29yKGogLSA3LjAgKiB4XyApOyAgICAvLyBtb2QoaixOKVxcblxcbiAgdmVjNCB4ID0geF8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCB5ID0geV8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCBoID0gMS4wIC0gYWJzKHgpIC0gYWJzKHkpO1xcblxcbiAgdmVjNCBiMCA9IHZlYzQoIHgueHksIHkueHkgKTtcXG4gIHZlYzQgYjEgPSB2ZWM0KCB4Lnp3LCB5Lnp3ICk7XFxuXFxuICAvL3ZlYzQgczAgPSB2ZWM0KGxlc3NUaGFuKGIwLDAuMCkpKjIuMCAtIDEuMDtcXG4gIC8vdmVjNCBzMSA9IHZlYzQobGVzc1RoYW4oYjEsMC4wKSkqMi4wIC0gMS4wO1xcbiAgdmVjNCBzMCA9IGZsb29yKGIwKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHMxID0gZmxvb3IoYjEpKjIuMCArIDEuMDtcXG4gIHZlYzQgc2ggPSAtc3RlcChoLCB2ZWM0KDAuMCkpO1xcblxcbiAgdmVjNCBhMCA9IGIwLnh6eXcgKyBzMC54enl3KnNoLnh4eXkgO1xcbiAgdmVjNCBhMV80XzcgPSBiMS54enl3ICsgczEueHp5dypzaC56end3IDtcXG5cXG4gIHZlYzMgcDBfNF84ID0gdmVjMyhhMC54eSxoLngpO1xcbiAgdmVjMyBwMSA9IHZlYzMoYTAuencsaC55KTtcXG4gIHZlYzMgcDIgPSB2ZWMzKGExXzRfNy54eSxoLnopO1xcbiAgdmVjMyBwMyA9IHZlYzMoYTFfNF83Lnp3LGgudyk7XFxuXFxuLy9Ob3JtYWxpc2UgZ3JhZGllbnRzXFxuICB2ZWM0IG5vcm0gPSB0YXlsb3JJbnZTcXJ0XzRfMyh2ZWM0KGRvdChwMF80XzgscDBfNF84KSwgZG90KHAxLHAxKSwgZG90KHAyLCBwMiksIGRvdChwMyxwMykpKTtcXG4gIHAwXzRfOCAqPSBub3JtLng7XFxuICBwMSAqPSBub3JtLnk7XFxuICBwMiAqPSBub3JtLno7XFxuICBwMyAqPSBub3JtLnc7XFxuXFxuLy8gTWl4IGZpbmFsIG5vaXNlIHZhbHVlXFxuICB2ZWM0IG0gPSBtYXgoMC42IC0gdmVjNChkb3QoeDAseDApLCBkb3QoeDEseDEpLCBkb3QoeDIseDIpLCBkb3QoeDMseDMpKSwgMC4wKTtcXG4gIG0gPSBtICogbTtcXG4gIHJldHVybiA0Mi4wICogZG90KCBtKm0sIHZlYzQoIGRvdChwMF80XzgseDApLCBkb3QocDEseDEpLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90KHAyLHgyKSwgZG90KHAzLHgzKSApICk7XFxuICB9XFxuXFxuXFxuXFxudmVjMyByb3RhdGVfMl85KHZlYzMgcCwgZmxvYXQgcmFkaWFuX3gsIGZsb2F0IHJhZGlhbl95LCBmbG9hdCByYWRpYW5feikge1xcclxcbiAgbWF0MyBteCA9IG1hdDMoXFxyXFxuICAgIDEuMCwgMC4wLCAwLjAsXFxyXFxuICAgIDAuMCwgY29zKHJhZGlhbl94KSwgLXNpbihyYWRpYW5feCksXFxyXFxuICAgIDAuMCwgc2luKHJhZGlhbl94KSwgY29zKHJhZGlhbl94KVxcclxcbiAgKTtcXHJcXG4gIG1hdDMgbXkgPSBtYXQzKFxcclxcbiAgICBjb3MocmFkaWFuX3kpLCAwLjAsIHNpbihyYWRpYW5feSksXFxyXFxuICAgIDAuMCwgMS4wLCAwLjAsXFxyXFxuICAgIC1zaW4ocmFkaWFuX3kpLCAwLjAsIGNvcyhyYWRpYW5feSlcXHJcXG4gICk7XFxyXFxuICBtYXQzIG16ID0gbWF0MyhcXHJcXG4gICAgY29zKHJhZGlhbl96KSwgLXNpbihyYWRpYW5feiksIDAuMCxcXHJcXG4gICAgc2luKHJhZGlhbl96KSwgY29zKHJhZGlhbl96KSwgMC4wLFxcclxcbiAgICAwLjAsIDAuMCwgMS4wXFxyXFxuICApO1xcclxcbiAgcmV0dXJuIG14ICogbXkgKiBteiAqIHA7XFxyXFxufVxcclxcblxcblxcbmZsb2F0IGRCb3hfM18xMCh2ZWMzIHAsIHZlYzMgc2l6ZSkge1xcclxcbiAgcmV0dXJuIGxlbmd0aChtYXgoYWJzKHApIC0gc2l6ZSwgMC4wKSk7XFxyXFxufVxcclxcblxcblxcblxcclxcbmZsb2F0IGdldE5vaXNlKHZlYzMgcCkge1xcclxcbiAgcmV0dXJuIHNub2lzZV80XzQocCAqICgwLjQgKyBhY2NlbGVyYXRpb24gKiAwLjEpICsgdGltZSAvIDEwMC4wKTtcXHJcXG59XFxyXFxuXFxyXFxudmVjMyBnZXRSb3RhdGUodmVjMyBwKSB7XFxyXFxuICByZXR1cm4gcm90YXRlXzJfOShwLCByYWRpYW5zKHRpbWUyKSwgcmFkaWFucyh0aW1lMiAqIDIuMCksIHJhZGlhbnModGltZTIpKTtcXHJcXG59XFxyXFxuXFxyXFxuZmxvYXQgZGlzdGFuY2VGdW5jKHZlYzMgcCkge1xcclxcbiAgdmVjNCBwMSA9IG1fbWF0cml4ICogdmVjNChwLCAxLjApO1xcclxcbiAgZmxvYXQgbjEgPSBnZXROb2lzZShwMS54eXopO1xcclxcbiAgdmVjMyBwMiA9IGdldFJvdGF0ZShwMS54eXopO1xcclxcbiAgZmxvYXQgZDEgPSBkQm94XzNfMTAocDIsIHZlYzMoMC44IC0gbWluKGFjY2VsZXJhdGlvbiwgMC44KSkpIC0gMC4yO1xcclxcbiAgZmxvYXQgZDIgPSBkQm94XzNfMTAocDIsIHZlYzMoMS4wKSkgLSBuMTtcXHJcXG4gIGZsb2F0IGQzID0gZEJveF8zXzEwKHAyLCB2ZWMzKDAuNSArIGFjY2VsZXJhdGlvbiAqIDAuNCkpIC0gbjE7XFxyXFxuICByZXR1cm4gbWluKG1heChkMSwgLWQyKSwgZDMpO1xcclxcbn1cXHJcXG5cXHJcXG5mbG9hdCBkaXN0YW5jZUZ1bmNGb3JGaWxsKHZlYzMgcCkge1xcclxcbiAgdmVjNCBwMSA9IG1fbWF0cml4ICogdmVjNChwLCAxLjApO1xcclxcbiAgZmxvYXQgbiA9IGdldE5vaXNlKHAxLnh5eik7XFxyXFxuICB2ZWMzIHAyID0gZ2V0Um90YXRlKHAxLnh5eik7XFxyXFxuICByZXR1cm4gZEJveF8zXzEwKHAyLCB2ZWMzKDAuNSArIGFjY2VsZXJhdGlvbiAqIDAuNCkpIC0gbjtcXHJcXG59XFxyXFxuXFxyXFxudmVjMyBnZXROb3JtYWwodmVjMyBwKSB7XFxyXFxuICBjb25zdCBmbG9hdCBkID0gMC4xO1xcclxcbiAgcmV0dXJuIG5vcm1hbGl6ZSh2ZWMzKFxcclxcbiAgICBkaXN0YW5jZUZ1bmMocCArIHZlYzMoZCwgMC4wLCAwLjApKSAtIGRpc3RhbmNlRnVuYyhwICsgdmVjMygtZCwgMC4wLCAwLjApKSxcXHJcXG4gICAgZGlzdGFuY2VGdW5jKHAgKyB2ZWMzKDAuMCwgZCwgMC4wKSkgLSBkaXN0YW5jZUZ1bmMocCArIHZlYzMoMC4wLCAtZCwgMC4wKSksXFxyXFxuICAgIGRpc3RhbmNlRnVuYyhwICsgdmVjMygwLjAsIDAuMCwgZCkpIC0gZGlzdGFuY2VGdW5jKHAgKyB2ZWMzKDAuMCwgMC4wLCAtZCkpXFxyXFxuICApKTtcXHJcXG59XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdmVjMiBwID0gKGdsX0ZyYWdDb29yZC54eSAqIDIuMCAtIHJlc29sdXRpb24pIC8gbWluKHJlc29sdXRpb24ueCwgcmVzb2x1dGlvbi55KTtcXHJcXG5cXHJcXG4gIHZlYzMgY0RpciA9IG5vcm1hbGl6ZShjYW1lcmFQb3NpdGlvbiAqIC0xLjApO1xcclxcbiAgdmVjMyBjVXAgID0gdmVjMygwLjAsIDEuMCwgMC4wKTtcXHJcXG4gIHZlYzMgY1NpZGUgPSBjcm9zcyhjRGlyLCBjVXApO1xcclxcblxcclxcbiAgdmVjMyByYXkgPSBub3JtYWxpemUoY1NpZGUgKiBwLnggKyBjVXAgKiBwLnkgKyBjRGlyICogdGFyZ2V0RGVwdGgpO1xcclxcblxcclxcbiAgZmxvYXQgZGlzdGFuY2UgPSAwLjA7XFxyXFxuICBmbG9hdCByTGVuID0gMC4wO1xcclxcbiAgdmVjMyByUG9zID0gY2FtZXJhUG9zaXRpb247XFxyXFxuICBmb3IoaW50IGkgPSAwOyBpIDwgNjQ7IGkrKyl7XFxyXFxuICAgIGRpc3RhbmNlID0gZGlzdGFuY2VGdW5jKHJQb3MpO1xcclxcbiAgICByTGVuICs9IGRpc3RhbmNlO1xcclxcbiAgICByUG9zID0gY2FtZXJhUG9zaXRpb24gKyByYXkgKiByTGVuICogMC4yO1xcclxcbiAgfVxcclxcblxcclxcbiAgdmVjMyBub3JtYWwgPSBnZXROb3JtYWwoclBvcyk7XFxyXFxuICBpZihhYnMoZGlzdGFuY2UpIDwgMC41KXtcXHJcXG4gICAgaWYgKGRpc3RhbmNlRnVuY0ZvckZpbGwoclBvcykgPiAwLjUpIHtcXHJcXG4gICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGhzdjJyZ2JfMV8wKHZlYzMoZG90KG5vcm1hbCwgY1VwKSAqIDAuOCArIHRpbWUgLyA0MDAuMCwgMC4yLCBkb3Qobm9ybWFsLCBjVXApICogMC44ICsgMC4xKSksIDEuMCk7XFxyXFxuICAgIH0gZWxzZSB7XFxyXFxuICAgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNChoc3YycmdiXzFfMCh2ZWMzKGRvdChub3JtYWwsIGNVcCkgKiAwLjEgKyB0aW1lIC8gNDAwLjAsIDAuOCwgZG90KG5vcm1hbCwgY1VwKSAqIDAuMiArIDAuOCkpLCAxLjApO1xcclxcbiAgICB9XFxyXFxuICB9IGVsc2Uge1xcclxcbiAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KDAuMCk7XFxyXFxuICB9XFxyXFxufVxcclxcblwiO1xyXG52YXIgdnNfYmcgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcbnVuaWZvcm0gZmxvYXQgYWNjZWxlcmF0aW9uO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2UG9zaXRpb247XFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIG1hdDQgaW52ZXJ0TWF0cml4O1xcclxcblxcclxcbi8vXFxuLy8gRGVzY3JpcHRpb24gOiBBcnJheSBhbmQgdGV4dHVyZWxlc3MgR0xTTCAyRC8zRC80RCBzaW1wbGV4XFxuLy8gICAgICAgICAgICAgICBub2lzZSBmdW5jdGlvbnMuXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzNfMCh2ZWMzIHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgbW9kMjg5XzNfMCh2ZWM0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV8zXzEodmVjNCB4KSB7XFxuICAgICByZXR1cm4gbW9kMjg5XzNfMCgoKHgqMzQuMCkrMS4wKSp4KTtcXG59XFxuXFxudmVjNCB0YXlsb3JJbnZTcXJ0XzNfMih2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzNfMyh2ZWMzIHYpXFxuICB7XFxuICBjb25zdCB2ZWMyICBDID0gdmVjMigxLjAvNi4wLCAxLjAvMy4wKSA7XFxuICBjb25zdCB2ZWM0ICBEXzNfNCA9IHZlYzQoMC4wLCAwLjUsIDEuMCwgMi4wKTtcXG5cXG4vLyBGaXJzdCBjb3JuZXJcXG4gIHZlYzMgaSAgPSBmbG9vcih2ICsgZG90KHYsIEMueXl5KSApO1xcbiAgdmVjMyB4MCA9ICAgdiAtIGkgKyBkb3QoaSwgQy54eHgpIDtcXG5cXG4vLyBPdGhlciBjb3JuZXJzXFxuICB2ZWMzIGdfM181ID0gc3RlcCh4MC55engsIHgwLnh5eik7XFxuICB2ZWMzIGwgPSAxLjAgLSBnXzNfNTtcXG4gIHZlYzMgaTEgPSBtaW4oIGdfM181Lnh5eiwgbC56eHkgKTtcXG4gIHZlYzMgaTIgPSBtYXgoIGdfM181Lnh5eiwgbC56eHkgKTtcXG5cXG4gIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcbiAgLy8gICB4MSA9IHgwIC0gaTEgICsgMS4wICogQy54eHg7XFxuICAvLyAgIHgyID0geDAgLSBpMiAgKyAyLjAgKiBDLnh4eDtcXG4gIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcbiAgdmVjMyB4MSA9IHgwIC0gaTEgKyBDLnh4eDtcXG4gIHZlYzMgeDIgPSB4MCAtIGkyICsgQy55eXk7IC8vIDIuMCpDLnggPSAxLzMgPSBDLnlcXG4gIHZlYzMgeDMgPSB4MCAtIERfM180Lnl5eTsgICAgICAvLyAtMS4wKzMuMCpDLnggPSAtMC41ID0gLUQueVxcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV8zXzAoaSk7XFxuICB2ZWM0IHAgPSBwZXJtdXRlXzNfMSggcGVybXV0ZV8zXzEoIHBlcm11dGVfM18xKFxcbiAgICAgICAgICAgICBpLnogKyB2ZWM0KDAuMCwgaTEueiwgaTIueiwgMS4wICkpXFxuICAgICAgICAgICArIGkueSArIHZlYzQoMC4wLCBpMS55LCBpMi55LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS54ICsgdmVjNCgwLjAsIGkxLngsIGkyLngsIDEuMCApKTtcXG5cXG4vLyBHcmFkaWVudHM6IDd4NyBwb2ludHMgb3ZlciBhIHNxdWFyZSwgbWFwcGVkIG9udG8gYW4gb2N0YWhlZHJvbi5cXG4vLyBUaGUgcmluZyBzaXplIDE3KjE3ID0gMjg5IGlzIGNsb3NlIHRvIGEgbXVsdGlwbGUgb2YgNDkgKDQ5KjYgPSAyOTQpXFxuICBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyAvLyAxLjAvNy4wXFxuICB2ZWMzICBucyA9IG5fICogRF8zXzQud3l6IC0gRF8zXzQueHp4O1xcblxcbiAgdmVjNCBqID0gcCAtIDQ5LjAgKiBmbG9vcihwICogbnMueiAqIG5zLnopOyAgLy8gIG1vZChwLDcqNylcXG5cXG4gIHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7XFxuICB2ZWM0IHlfID0gZmxvb3IoaiAtIDcuMCAqIHhfICk7ICAgIC8vIG1vZChqLE4pXFxuXFxuICB2ZWM0IHggPSB4XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXFxuICB2ZWM0IGIwID0gdmVjNCggeC54eSwgeS54eSApO1xcbiAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cXG4gIC8vdmVjNCBzMCA9IHZlYzQobGVzc1RoYW4oYjAsMC4wKSkqMi4wIC0gMS4wO1xcbiAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuICB2ZWM0IHMwID0gZmxvb3IoYjApKjIuMCArIDEuMDtcXG4gIHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wO1xcbiAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXFxuICB2ZWM0IGEwID0gYjAueHp5dyArIHMwLnh6eXcqc2gueHh5eSA7XFxuICB2ZWM0IGExXzNfNiA9IGIxLnh6eXcgKyBzMS54enl3KnNoLnp6d3cgO1xcblxcbiAgdmVjMyBwMF8zXzcgPSB2ZWMzKGEwLnh5LGgueCk7XFxuICB2ZWMzIHAxID0gdmVjMyhhMC56dyxoLnkpO1xcbiAgdmVjMyBwMiA9IHZlYzMoYTFfM182Lnh5LGgueik7XFxuICB2ZWMzIHAzID0gdmVjMyhhMV8zXzYuencsaC53KTtcXG5cXG4vL05vcm1hbGlzZSBncmFkaWVudHNcXG4gIHZlYzQgbm9ybSA9IHRheWxvckludlNxcnRfM18yKHZlYzQoZG90KHAwXzNfNyxwMF8zXzcpLCBkb3QocDEscDEpLCBkb3QocDIsIHAyKSwgZG90KHAzLHAzKSkpO1xcbiAgcDBfM183ICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG5cXG4vLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG4gIHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApO1xcbiAgbSA9IG0gKiBtO1xcbiAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwXzNfNyx4MCksIGRvdChwMSx4MSksXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3QocDIseDIpLCBkb3QocDMseDMpICkgKTtcXG4gIH1cXG5cXG5cXG5cXG52ZWMzIGhzdjJyZ2JfMV84KHZlYzMgYyl7XFxyXFxuICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XFxyXFxuICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XFxyXFxuICByZXR1cm4gYy56ICogbWl4KEsueHh4LCBjbGFtcChwIC0gSy54eHgsIDAuMCwgMS4wKSwgYy55KTtcXHJcXG59XFxyXFxuXFxuXFxuZmxvYXQgaW52ZXJzZV80XzkoZmxvYXQgbSkge1xcbiAgcmV0dXJuIDEuMCAvIG07XFxufVxcblxcbm1hdDIgaW52ZXJzZV80XzkobWF0MiBtKSB7XFxuICByZXR1cm4gbWF0MihtWzFdWzFdLC1tWzBdWzFdLFxcbiAgICAgICAgICAgICAtbVsxXVswXSwgbVswXVswXSkgLyAobVswXVswXSptWzFdWzFdIC0gbVswXVsxXSptWzFdWzBdKTtcXG59XFxuXFxubWF0MyBpbnZlcnNlXzRfOShtYXQzIG0pIHtcXG4gIGZsb2F0IGEwMCA9IG1bMF1bMF0sIGEwMSA9IG1bMF1bMV0sIGEwMiA9IG1bMF1bMl07XFxuICBmbG9hdCBhMTAgPSBtWzFdWzBdLCBhMTEgPSBtWzFdWzFdLCBhMTIgPSBtWzFdWzJdO1xcbiAgZmxvYXQgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXTtcXG5cXG4gIGZsb2F0IGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMTtcXG4gIGZsb2F0IGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjA7XFxuICBmbG9hdCBiMjEgPSBhMjEgKiBhMTAgLSBhMTEgKiBhMjA7XFxuXFxuICBmbG9hdCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XFxuXFxuICByZXR1cm4gbWF0MyhiMDEsICgtYTIyICogYTAxICsgYTAyICogYTIxKSwgKGExMiAqIGEwMSAtIGEwMiAqIGExMSksXFxuICAgICAgICAgICAgICBiMTEsIChhMjIgKiBhMDAgLSBhMDIgKiBhMjApLCAoLWExMiAqIGEwMCArIGEwMiAqIGExMCksXFxuICAgICAgICAgICAgICBiMjEsICgtYTIxICogYTAwICsgYTAxICogYTIwKSwgKGExMSAqIGEwMCAtIGEwMSAqIGExMCkpIC8gZGV0O1xcbn1cXG5cXG5tYXQ0IGludmVyc2VfNF85KG1hdDQgbSkge1xcbiAgZmxvYXRcXG4gICAgICBhMDAgPSBtWzBdWzBdLCBhMDEgPSBtWzBdWzFdLCBhMDIgPSBtWzBdWzJdLCBhMDMgPSBtWzBdWzNdLFxcbiAgICAgIGExMCA9IG1bMV1bMF0sIGExMSA9IG1bMV1bMV0sIGExMiA9IG1bMV1bMl0sIGExMyA9IG1bMV1bM10sXFxuICAgICAgYTIwID0gbVsyXVswXSwgYTIxID0gbVsyXVsxXSwgYTIyID0gbVsyXVsyXSwgYTIzID0gbVsyXVszXSxcXG4gICAgICBhMzAgPSBtWzNdWzBdLCBhMzEgPSBtWzNdWzFdLCBhMzIgPSBtWzNdWzJdLCBhMzMgPSBtWzNdWzNdLFxcblxcbiAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcXG4gICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXFxuICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxcbiAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcXG4gICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXFxuICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxcbiAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcXG4gICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXFxuICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxcbiAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcXG4gICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXFxuICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyLFxcblxcbiAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcXG5cXG4gIHJldHVybiBtYXQ0KFxcbiAgICAgIGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSxcXG4gICAgICBhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDksXFxuICAgICAgYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzLFxcbiAgICAgIGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMyxcXG4gICAgICBhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcsXFxuICAgICAgYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3LFxcbiAgICAgIGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSxcXG4gICAgICBhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEsXFxuICAgICAgYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2LFxcbiAgICAgIGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNixcXG4gICAgICBhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDAsXFxuICAgICAgYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwLFxcbiAgICAgIGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNixcXG4gICAgICBhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYsXFxuICAgICAgYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwLFxcbiAgICAgIGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgLyBkZXQ7XFxufVxcblxcblxcbnZlYzMgcm90YXRlXzJfMTAodmVjMyBwLCBmbG9hdCByYWRpYW5feCwgZmxvYXQgcmFkaWFuX3ksIGZsb2F0IHJhZGlhbl96KSB7XFxyXFxuICBtYXQzIG14ID0gbWF0MyhcXHJcXG4gICAgMS4wLCAwLjAsIDAuMCxcXHJcXG4gICAgMC4wLCBjb3MocmFkaWFuX3gpLCAtc2luKHJhZGlhbl94KSxcXHJcXG4gICAgMC4wLCBzaW4ocmFkaWFuX3gpLCBjb3MocmFkaWFuX3gpXFxyXFxuICApO1xcclxcbiAgbWF0MyBteSA9IG1hdDMoXFxyXFxuICAgIGNvcyhyYWRpYW5feSksIDAuMCwgc2luKHJhZGlhbl95KSxcXHJcXG4gICAgMC4wLCAxLjAsIDAuMCxcXHJcXG4gICAgLXNpbihyYWRpYW5feSksIDAuMCwgY29zKHJhZGlhbl95KVxcclxcbiAgKTtcXHJcXG4gIG1hdDMgbXogPSBtYXQzKFxcclxcbiAgICBjb3MocmFkaWFuX3opLCAtc2luKHJhZGlhbl96KSwgMC4wLFxcclxcbiAgICBzaW4ocmFkaWFuX3opLCBjb3MocmFkaWFuX3opLCAwLjAsXFxyXFxuICAgIDAuMCwgMC4wLCAxLjBcXHJcXG4gICk7XFxyXFxuICByZXR1cm4gbXggKiBteSAqIG16ICogcDtcXHJcXG59XFxyXFxuXFxuXFxuXFxyXFxudmVjMyBnZXRSb3RhdGUodmVjMyBwKSB7XFxyXFxuICByZXR1cm4gcm90YXRlXzJfMTAocCwgcmFkaWFucyh0aW1lIC8gNi4wKSwgcmFkaWFucyh0aW1lIC8gNy4wKSwgcmFkaWFucyh0aW1lIC8gOC4wKSk7XFxyXFxufVxcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGZsb2F0IHVwZGF0ZVRpbWUgPSB0aW1lIC8gNDAwLjA7XFxyXFxuICB2ZWMzIHBfcm90YXRlID0gZ2V0Um90YXRlKHBvc2l0aW9uKTtcXHJcXG4gIGZsb2F0IG5vaXNlID0gc25vaXNlXzNfMyh2ZWMzKHBfcm90YXRlIC8gMTIuMSArIHVwZGF0ZVRpbWUgKiAwLjUpKTtcXHJcXG4gIHZlYzMgcF9ub2lzZSA9IHBfcm90YXRlICsgcF9yb3RhdGUgKiBub2lzZSAvIDIwLjAgKiAobWluKGFjY2VsZXJhdGlvbiwgNi4wKSArIDEuMCk7XFxyXFxuXFxyXFxuICB2UG9zaXRpb24gPSBwX25vaXNlO1xcclxcbiAgdkNvbG9yID0gaHN2MnJnYl8xXzgodmVjMyh1cGRhdGVUaW1lICsgcG9zaXRpb24ueSAvIDQwMC4wLCAwLjA1ICsgbWluKGFjY2VsZXJhdGlvbiAvIDEwLjAsIDAuMjUpLCAxLjApKTtcXHJcXG4gIGludmVydE1hdHJpeCA9IGludmVyc2VfNF85KG1vZGVsTWF0cml4KTtcXHJcXG5cXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocF9ub2lzZSwgMS4wKTtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciBmc19iZyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxyXFxudW5pZm9ybSBmbG9hdCBhY2NlbGVyYXRpb247XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZQb3NpdGlvbjtcXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgbWF0NCBpbnZlcnRNYXRyaXg7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdmVjMyBub3JtYWwgPSBub3JtYWxpemUoY3Jvc3MoZEZkeCh2UG9zaXRpb24pLCBkRmR5KHZQb3NpdGlvbikpKTtcXHJcXG4gIHZlYzMgaW52X2xpZ2h0ID0gbm9ybWFsaXplKGludmVydE1hdHJpeCAqIHZlYzQoMC43LCAtMC43LCAwLjcsIDEuMCkpLnh5ejtcXHJcXG4gIGZsb2F0IGRpZmYgPSAoZG90KG5vcm1hbCwgaW52X2xpZ2h0KSArIDEuMCkgLyA0LjAgKyAwLjQ7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZDb2xvciAqIGRpZmYsIDEuMCk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICB0aGlzLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgfTtcclxuICB2YXIgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xyXG4gIHZhciBpbnRlcnNlY3RzID0gbnVsbDtcclxuICB2YXIgY3ViZV9mb3JjZSA9IG5ldyBGb3JjZTMoKTtcclxuICB2YXIgY3ViZV9mb3JjZTIgPSBuZXcgRm9yY2UzKCk7XHJcbiAgdmFyIHZhY3Rvcl9yYXljYXN0ID0gbnVsbDtcclxuICBjdWJlX2ZvcmNlLm1hc3MgPSAxLjQ7XHJcblxyXG4gIHZhciBjcmVhdGVQbGFuZUZvclJheW1hcmNoaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeSg2LjAsIDYuMCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aW1lMjoge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY2NlbGVyYXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICB0eXBlOiAndjInLFxyXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHZzLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogZnMsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlXHJcbiAgICB9KTtcclxuICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICAgIG1lc2gubmFtZSA9ICdNZXRhbEN1YmUnO1xyXG4gICAgcmV0dXJuIG1lc2g7XHJcbiAgfTtcclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZCA9ICBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW9tZXRyeV9iYXNlID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeSgzMCwgNCk7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIGdlb21ldHJ5LmZyb21HZW9tZXRyeShnZW9tZXRyeV9iYXNlKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY2NlbGVyYXRpb246IHtcclxuICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgIHZhbHVlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiB2c19iZyxcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGZzX2JnLFxyXG4gICAgICBzaGFkaW5nOiBUSFJFRS5GbGF0U2hhZGluZyxcclxuICAgICAgc2lkZTogVEhSRUUuQmFja1NpZGVcclxuICAgIH0pO1xyXG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gICAgbWVzaC5uYW1lID0gJ0JhY2tncm91bmQnO1xyXG4gICAgcmV0dXJuIG1lc2g7XHJcbiAgfTtcclxuXHJcbiAgdmFyIG1vdmVNZXRhbEN1YmUgPSBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgIGlmIChjdWJlX2ZvcmNlLmFjY2VsZXJhdGlvbi5sZW5ndGgoKSA+IDAuMSB8fCAhdmVjdG9yKSByZXR1cm47XHJcbiAgICByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYSh2ZWN0b3IsIGNhbWVyYS5vYmopO1xyXG4gICAgaW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKHNjZW5lLmNoaWxkcmVuKVswXTtcclxuICAgIGlmKGludGVyc2VjdHMgJiYgaW50ZXJzZWN0cy5vYmplY3QubmFtZSA9PSAnTWV0YWxDdWJlJykge1xyXG4gICAgICBjdWJlX2ZvcmNlLmFuY2hvci5jb3B5KFV0aWwuZ2V0U3BoZXJpY2FsKFxyXG4gICAgICAgIFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KC0yMCwgMjApKSxcclxuICAgICAgICBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKSxcclxuICAgICAgICBVdGlsLmdldFJhbmRvbUludCgzMCwgOTApIC8gMTBcclxuICAgICAgKSk7XHJcbiAgICAgIGN1YmVfZm9yY2UyLmFwcGx5Rm9yY2UobmV3IFRIUkVFLlZlY3RvcjMoMSwgMCwgMCkpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciBwbGFuZSA9IGNyZWF0ZVBsYW5lRm9yUmF5bWFyY2hpbmcoKTtcclxuICB2YXIgYmcgPSBjcmVhdGVCYWNrZ3JvdW5kKCk7XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHNjZW5lLmFkZChwbGFuZSk7XHJcbiAgICAgIHNjZW5lLmFkZChiZyk7XHJcblxyXG4gICAgICBjYW1lcmEucmFuZ2UgPSAyNDtcclxuICAgICAgY2FtZXJhLnJhZDFfYmFzZSA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgICBjYW1lcmEucmFkMSA9IGNhbWVyYS5yYWQxX2Jhc2U7XHJcbiAgICAgIGNhbWVyYS5yYWQyID0gVXRpbC5nZXRSYWRpYW4oOTApO1xyXG4gICAgICBjYW1lcmEuc2V0UG9zaXRpb25TcGhlcmljYWwoKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcGxhbmUuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwbGFuZS5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwbGFuZSk7XHJcbiAgICAgIGJnLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgYmcubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoYmcpO1xyXG4gICAgICBjYW1lcmEucmFuZ2UgPSAxMDAwO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBtb3ZlTWV0YWxDdWJlKHNjZW5lLCBjYW1lcmEsIHZhY3Rvcl9yYXljYXN0KTtcclxuICAgICAgY3ViZV9mb3JjZS5hcHBseUhvb2soMCwgMC4xMik7XHJcbiAgICAgIGN1YmVfZm9yY2UuYXBwbHlEcmFnKDAuMDEpO1xyXG4gICAgICBjdWJlX2ZvcmNlLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGN1YmVfZm9yY2UudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY3ViZV9mb3JjZTIuYXBwbHlIb29rKDAsIDAuMDA1KTtcclxuICAgICAgY3ViZV9mb3JjZTIuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGN1YmVfZm9yY2UyLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGN1YmVfZm9yY2UyLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIHBsYW5lLnBvc2l0aW9uLmNvcHkoY3ViZV9mb3JjZS5wb3NpdGlvbik7XHJcbiAgICAgIHBsYW5lLm1hdGVyaWFsLnVuaWZvcm1zLnRpbWUudmFsdWUrKztcclxuICAgICAgcGxhbmUubWF0ZXJpYWwudW5pZm9ybXMudGltZTIudmFsdWUgKz0gMSArIE1hdGguZmxvb3IoY3ViZV9mb3JjZS5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgKiA0KTtcclxuICAgICAgcGxhbmUubWF0ZXJpYWwudW5pZm9ybXMuYWNjZWxlcmF0aW9uLnZhbHVlID0gY3ViZV9mb3JjZS5hY2NlbGVyYXRpb24ubGVuZ3RoKCk7XHJcbiAgICAgIHBsYW5lLmxvb2tBdChjYW1lcmEub2JqLnBvc2l0aW9uKTtcclxuICAgICAgYmcubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSsrO1xyXG4gICAgICBiZy5tYXRlcmlhbC51bmlmb3Jtcy5hY2NlbGVyYXRpb24udmFsdWUgPSBjdWJlX2ZvcmNlMi5wb3NpdGlvbi5sZW5ndGgoKTtcclxuICAgICAgY2FtZXJhLnNldFBvc2l0aW9uU3BoZXJpY2FsKCk7XHJcbiAgICAgIGNhbWVyYS5hcHBseUhvb2soMCwgMC4wMjUpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmxvb2tBdENlbnRlcigpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG5cclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICB2YWN0b3JfcmF5Y2FzdCA9IHZlY3Rvcl9tb3VzZV9tb3ZlO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICB9LFxyXG4gICAgbW91c2VPdXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgIH0sXHJcbiAgICByZXNpemVXaW5kb3c6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcGxhbmUubWF0ZXJpYWwudW5pZm9ybXMucmVzb2x1dGlvbi52YWx1ZS5zZXQod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iXX0=
