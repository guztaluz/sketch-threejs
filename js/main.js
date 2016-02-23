(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Util = require('./modules/util');
var debounce = require('./modules/debounce');
var Camera = require('./modules/camera');

var body_width = document.body.clientWidth;
var body_height = document.body.clientHeight;
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
    antialias: true
  });
  if (!renderer) {
    alert('Three.jsの初期化に失敗しました。');
  }
  renderer.setSize(body_width, body_height);
  canvas.appendChild(renderer.domElement);
  renderer.setClearColor(0x111111, 1.0);

  scene = new THREE.Scene();

  camera = new Camera();
  camera.init(body_width, body_height);
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
  running = new sketch.obj;
  running.init(scene, camera);
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
  running.render(scene, camera, vector_mouse_move);
  renderer.render(scene, camera.obj);
};

var renderloop = function() {
  var now = Date.now();
  requestAnimationFrame(renderloop);
  render();
};

var resizeRenderer = function() {
  body_width  = document.body.clientWidth;
  body_height = document.body.clientHeight;
  renderer.setSize(body_width, body_height);
  camera.resize(body_width, body_height);
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
    touchEnd(0, 0, false);
  });

  btn_toggle_menu.addEventListener('click', function(event) {
    event.preventDefault();
    switchMenu();
  });
};

var transformVector2d = function(vector) {
  vector.x = (vector.x / body_width) * 2 - 1;
  vector.y = - (vector.y / body_height) * 2 + 1;
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

var switchMenu = function() {
  btn_toggle_menu.classList.toggle('is-active');
  menu.classList.toggle('is-active');
  document.body.classList.remove('is-pointed');
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
    name: 'distort',
    obj: require('./sketches/distort'),
    posted: '2016.2.23',
    update: '',
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

},{"./sketches/comet":12,"./sketches/distort":13,"./sketches/fire_ball":14,"./sketches/gallery":15,"./sketches/hyper_space":16,"./sketches/image_data":17}],12:[function(require,module,exports){
var Util = require('../modules/util');
var Force2 = require('../modules/force2');
var Mover = require('../modules/mover');
var Points = require('../modules/points.js');
var HemiLight = require('../modules/hemiLight');
var PointLight = require('../modules/pointLight');

var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

var exports = function(){
  var Sketch = function() {};
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
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/force2":4,"../modules/hemiLight":6,"../modules/mover":7,"../modules/pointLight":8,"../modules/points.js":9,"../modules/util":10}],13:[function(require,module,exports){
var Util = require('../modules/util');
var Force2 = require('../modules/force2');
var HemiLight = require('../modules/hemiLight');

var vs = "#define GLSLIFY 1\nuniform float time;\r\nuniform float radius;\r\nuniform float distort;\r\n\r\nvarying vec3 vColor;\r\n\r\nuniform vec3 hemisphereLightDirection;\r\nuniform vec3 hemisphereLightSkyColor;\r\nuniform vec3 hemisphereLightGroundColor;\r\n\r\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2_1(vec4 x) {\n     return mod289_2_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_2_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_2_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_2_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_2_5;\n  vec3 i1 = min( g_2_5.xyz, l.zxy );\n  vec3 i2 = max( g_2_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_2_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2_0(i);\n  vec4 p = permute_2_1( permute_2_1( permute_2_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_2_4.wyz - D_2_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_2_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_2_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_2_6.xy,h.z);\n  vec3 p3 = vec3(a1_2_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_2_2(vec4(dot(p0_2_7,p0_2_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_2_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_2_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 hsv2rgb_1_8(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n\r\nvoid main() {\r\n  float updateTime = time / 1000.0;\r\n  float noise = snoise_2_3(vec3(position / 400.1 + updateTime * 5.0));\r\n  vec4 mvPosition = modelViewMatrix * vec4(position * (noise * pow(distort, 2.0) + radius), 1.0);\r\n  vec3 light = vec3(0.8);\r\n  light += dot(-hemisphereLightDirection, normal) * hemisphereLightSkyColor * 0.25;\r\n\r\n  vColor = hsv2rgb_1_8(vec3(noise * distort * 0.3 + updateTime, 0.2, 1.0)) * light;\r\n\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nvarying vec3 vColor;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(vColor, 1.0);\r\n}\r\n";

var exports = function(){
  var Sketch = function() {};
  var sphere = null;
  var bg = null;
  var light = new HemiLight();
  var force = new Force2();

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

  Sketch.prototype = {
    init: function(scene, camera) {
      sphere = createSphere();
      scene.add(sphere);
      bg = createBackground();
      scene.add(bg);
      light.init(0xffffff, 0x666666);
      scene.add(light.obj);
      camera.anchor.set(1800, 1800, 0);
      camera.look.anchor.set(0, 0, 0);
      force.anchor.set(1, 0);
      force.velocity.set(1, 0);
    },
    remove: function(scene) {
      sphere.geometry.dispose();
      sphere.material.dispose();
      scene.remove(sphere);
      bg.geometry.dispose();
      bg.material.dispose();
      scene.remove(bg);
      scene.remove(light.obj);
    },
    render: function(scene, camera) {
      force.applyHook(0, 0.06);
      force.applyDrag(0.12);
      force.updateVelocity();
      force.updatePosition();
      sphere.material.uniforms.time.value += 1;
      sphere.material.uniforms.radius.value = force.position.x;
      sphere.material.uniforms.distort.value = force.position.x / 2 - 0.1;
      camera.applyHook(0, 0.025);
      camera.applyDrag(0.2);
      camera.updateVelocity();
      camera.updatePosition();
      camera.look.applyHook(0, 0.2);
      camera.look.applyDrag(0.4);
      camera.look.updateVelocity();
      camera.look.updatePosition();
      camera.obj.lookAt(camera.look.position);
    },
    touchStart: function(scene, camera, vector) {
      if (force.anchor.x < 3) {
        force.anchor.x += 0.8;
      } else {
        force.anchor.x = 1.0;
      }
      is_touched = true;
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      is_touched = false;
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/force2":4,"../modules/hemiLight":6,"../modules/util":10}],14:[function(require,module,exports){
var Util = require('../modules/util');
var Mover = require('../modules/mover');
var Points = require('../modules/points.js');
var Light = require('../modules/pointLight');

var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

var exports = function(){
  var Sketch = function() {};
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
  var Sketch = function() {};
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
    }
  };
  return Sketch;
};

module.exports = exports();

},{"../modules/force3":5,"../modules/hemiLight":6,"../modules/util":10}],16:[function(require,module,exports){
var Util = require('../modules/util');
var Mover = require('../modules/mover');
var Points = require('../modules/points.js');
var Light = require('../modules/pointLight');

var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

var exports = function(){
  var Sketch = function() {};
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
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/mover":7,"../modules/pointLight":8,"../modules/points.js":9,"../modules/util":10}],17:[function(require,module,exports){
var Util = require('../modules/util');
var Mover = require('../modules/mover');

var Points = require('../modules/points.js');
var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

var exports = function(){
  var Sketch = function() {};
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
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/mover":7,"../modules/points.js":9,"../modules/util":10}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2NhbWVyYS5qcyIsInNyYy9qcy9tb2R1bGVzL2RlYm91bmNlLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UyLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UzLmpzIiwic3JjL2pzL21vZHVsZXMvaGVtaUxpZ2h0LmpzIiwic3JjL2pzL21vZHVsZXMvbW92ZXIuanMiLCJzcmMvanMvbW9kdWxlcy9wb2ludExpZ2h0LmpzIiwic3JjL2pzL21vZHVsZXMvcG9pbnRzLmpzIiwic3JjL2pzL21vZHVsZXMvdXRpbC5qcyIsInNyYy9qcy9za2V0Y2hlcy5qcyIsInNyYy9qcy9za2V0Y2hlcy9jb21ldC5qcyIsInNyYy9qcy9za2V0Y2hlcy9kaXN0b3J0LmpzIiwic3JjL2pzL3NrZXRjaGVzL2ZpcmVfYmFsbC5qcyIsInNyYy9qcy9za2V0Y2hlcy9nYWxsZXJ5LmpzIiwic3JjL2pzL3NrZXRjaGVzL2h5cGVyX3NwYWNlLmpzIiwic3JjL2pzL3NrZXRjaGVzL2ltYWdlX2RhdGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9kZWJvdW5jZScpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NhbWVyYScpO1xyXG5cclxudmFyIGJvZHlfd2lkdGggPSBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoO1xyXG52YXIgYm9keV9oZWlnaHQgPSBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodDtcclxudmFyIHZlY3Rvcl9tb3VzZV9kb3duID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxudmFyIHZlY3Rvcl9tb3VzZV9tb3ZlID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxudmFyIHZlY3Rvcl9tb3VzZV9lbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xyXG5cclxudmFyIGNhbnZhcyA9IG51bGw7XHJcbnZhciByZW5kZXJlciA9IG51bGw7XHJcbnZhciBzY2VuZSA9IG51bGw7XHJcbnZhciBjYW1lcmEgPSBudWxsO1xyXG5cclxudmFyIHJ1bm5pbmcgPSBudWxsO1xyXG52YXIgc2tldGNoZXMgPSByZXF1aXJlKCcuL3NrZXRjaGVzJyk7XHJcbnZhciBza2V0Y2hfaWQgPSAwO1xyXG5cclxudmFyIG1ldGFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ldGEnKTtcclxudmFyIGJ0bl90b2dnbGVfbWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4tc3dpdGNoLW1lbnUnKTtcclxudmFyIG1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVudScpO1xyXG52YXIgc2VsZWN0X3NrZXRjaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3Qtc2tldGNoJyk7XHJcbnZhciBza2V0Y2hfdGl0bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2tldGNoLXRpdGxlJyk7XHJcbnZhciBza2V0Y2hfZGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5za2V0Y2gtZGF0ZScpO1xyXG52YXIgc2tldGNoX2Rlc2NyaXB0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNrZXRjaC1kZXNjcmlwdGlvbicpO1xyXG5cclxudmFyIGluaXRUaHJlZSA9IGZ1bmN0aW9uKCkge1xyXG4gIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcclxuICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcclxuICAgIGFudGlhbGlhczogdHJ1ZVxyXG4gIH0pO1xyXG4gIGlmICghcmVuZGVyZXIpIHtcclxuICAgIGFsZXJ0KCdUaHJlZS5qc+OBruWIneacn+WMluOBq+WkseaVl+OBl+OBvuOBl+OBn+OAgicpO1xyXG4gIH1cclxuICByZW5kZXJlci5zZXRTaXplKGJvZHlfd2lkdGgsIGJvZHlfaGVpZ2h0KTtcclxuICBjYW52YXMuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XHJcbiAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigweDExMTExMSwgMS4wKTtcclxuXHJcbiAgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuXHJcbiAgY2FtZXJhID0gbmV3IENhbWVyYSgpO1xyXG4gIGNhbWVyYS5pbml0KGJvZHlfd2lkdGgsIGJvZHlfaGVpZ2h0KTtcclxufTtcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgc2V0U2tldGNoSWQoKTtcclxuICBidWlsZE1lbnUoKTtcclxuICBpbml0VGhyZWUoKTtcclxuICBzdGFydFJ1blNrZXRjaChza2V0Y2hlc1tza2V0Y2hlcy5sZW5ndGggLSBza2V0Y2hfaWRdKTtcclxuICByZW5kZXJsb29wKCk7XHJcbiAgc2V0RXZlbnQoKTtcclxuICBkZWJvdW5jZSh3aW5kb3csICdyZXNpemUnLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICByZXNpemVSZW5kZXJlcigpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudmFyIGdldFBhcmFtZXRlckJ5TmFtZSA9IGZ1bmN0aW9uKG5hbWUpIHtcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sIFwiXFxcXFtcIikucmVwbGFjZSgvW1xcXV0vLCBcIlxcXFxdXCIpO1xyXG4gIHZhciByZWdleCA9IG5ldyBSZWdFeHAoXCJbXFxcXD8mXVwiICsgbmFtZSArIFwiPShbXiYjXSopXCIpO1xyXG4gIHZhciByZXN1bHRzID0gcmVnZXguZXhlYyhsb2NhdGlvbi5zZWFyY2gpO1xyXG4gIHJldHVybiByZXN1bHRzID09PSBudWxsID8gXCJcIiA6IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xyXG59O1xyXG5cclxudmFyIHNldFNrZXRjaElkID0gZnVuY3Rpb24oKSB7XHJcbiAgc2tldGNoX2lkID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdza2V0Y2hfaWQnKTtcclxuICBpZiAoc2tldGNoX2lkID09IG51bGwgfHwgc2tldGNoX2lkID4gc2tldGNoZXMubGVuZ3RoIHx8IHNrZXRjaF9pZCA8IDEpIHtcclxuICAgIHNrZXRjaF9pZCA9IHNrZXRjaGVzLmxlbmd0aDtcclxuICB9XHJcbn07XHJcblxyXG52YXIgYnVpbGRNZW51ID0gZnVuY3Rpb24oKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBza2V0Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIHNrZXRjaCA9IHNrZXRjaGVzW2ldO1xyXG4gICAgdmFyIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcbiAgICBkb20uc2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JywgaSk7XHJcbiAgICBkb20uaW5uZXJIVE1MID0gJzxzcGFuPicgKyBza2V0Y2gubmFtZSArICc8L3NwYW4+JztcclxuICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBzd2l0Y2hTa2V0Y2goc2tldGNoZXNbdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnKV0pO1xyXG4gICAgfSk7XHJcbiAgICBzZWxlY3Rfc2tldGNoLmFwcGVuZENoaWxkKGRvbSk7XHJcbiAgfVxyXG59O1xyXG5cclxudmFyIHN0YXJ0UnVuU2tldGNoID0gZnVuY3Rpb24oc2tldGNoKSB7XHJcbiAgcnVubmluZyA9IG5ldyBza2V0Y2gub2JqO1xyXG4gIHJ1bm5pbmcuaW5pdChzY2VuZSwgY2FtZXJhKTtcclxuICBza2V0Y2hfdGl0bGUuaW5uZXJIVE1MID0gc2tldGNoLm5hbWU7XHJcbiAgc2tldGNoX2RhdGUuaW5uZXJIVE1MID0gKHNrZXRjaC51cGRhdGUubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdwb3N0ZWQ6ICcgKyBza2V0Y2gucG9zdGVkICsgJyAvIHVwZGF0ZTogJyArIHNrZXRjaC51cGRhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdwb3N0ZWQ6ICcgKyBza2V0Y2gucG9zdGVkO1xyXG4gIHNrZXRjaF9kZXNjcmlwdGlvbi5pbm5lckhUTUwgPSBza2V0Y2guZGVzY3JpcHRpb247XHJcbn07XHJcblxyXG52YXIgc3dpdGNoU2tldGNoID0gZnVuY3Rpb24oc2tldGNoKSB7XHJcbiAgcnVubmluZy5yZW1vdmUoc2NlbmUsIGNhbWVyYSk7XHJcbiAgc3RhcnRSdW5Ta2V0Y2goc2tldGNoKTtcclxuICBzd2l0Y2hNZW51KCk7XHJcbn07XHJcblxyXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgcmVuZGVyZXIuY2xlYXIoKTtcclxuICBydW5uaW5nLnJlbmRlcihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfbW92ZSk7XHJcbiAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEub2JqKTtcclxufTtcclxuXHJcbnZhciByZW5kZXJsb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcmxvb3ApO1xyXG4gIHJlbmRlcigpO1xyXG59O1xyXG5cclxudmFyIHJlc2l6ZVJlbmRlcmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgYm9keV93aWR0aCAgPSBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoO1xyXG4gIGJvZHlfaGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQ7XHJcbiAgcmVuZGVyZXIuc2V0U2l6ZShib2R5X3dpZHRoLCBib2R5X2hlaWdodCk7XHJcbiAgY2FtZXJhLnJlc2l6ZShib2R5X3dpZHRoLCBib2R5X2hlaWdodCk7XHJcbn07XHJcblxyXG52YXIgc2V0RXZlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaFN0YXJ0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoTW92ZShldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZLCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hFbmQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoU3RhcnQoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFksIHRydWUpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hNb3ZlKGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZLCB0cnVlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hFbmQoZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSwgdHJ1ZSk7XHJcbiAgfSk7XHJcblxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaEVuZCgwLCAwLCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIGJ0bl90b2dnbGVfbWVudS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgc3dpdGNoTWVudSgpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudmFyIHRyYW5zZm9ybVZlY3RvcjJkID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgdmVjdG9yLnggPSAodmVjdG9yLnggLyBib2R5X3dpZHRoKSAqIDIgLSAxO1xyXG4gIHZlY3Rvci55ID0gLSAodmVjdG9yLnkgLyBib2R5X2hlaWdodCkgKiAyICsgMTtcclxufTtcclxuXHJcbnZhciB0b3VjaFN0YXJ0ID0gZnVuY3Rpb24oeCwgeSwgdG91Y2hfZXZlbnQpIHtcclxuICB2ZWN0b3JfbW91c2VfZG93bi5zZXQoeCwgeSk7XHJcbiAgdHJhbnNmb3JtVmVjdG9yMmQodmVjdG9yX21vdXNlX2Rvd24pO1xyXG4gIGlmIChydW5uaW5nLnRvdWNoU3RhcnQpIHJ1bm5pbmcudG91Y2hTdGFydChzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93bik7XHJcbn07XHJcblxyXG52YXIgdG91Y2hNb3ZlID0gZnVuY3Rpb24oeCwgeSwgdG91Y2hfZXZlbnQpIHtcclxuICB2ZWN0b3JfbW91c2VfbW92ZS5zZXQoeCwgeSk7XHJcbiAgdHJhbnNmb3JtVmVjdG9yMmQodmVjdG9yX21vdXNlX21vdmUpO1xyXG4gIGlmIChydW5uaW5nLnRvdWNoTW92ZSkgcnVubmluZy50b3VjaE1vdmUoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxufTtcclxuXHJcbnZhciB0b3VjaEVuZCA9IGZ1bmN0aW9uKHgsIHksIHRvdWNoX2V2ZW50KSB7XHJcbiAgdmVjdG9yX21vdXNlX2VuZC5zZXQoeCwgeSk7XHJcbiAgaWYgKHJ1bm5pbmcudG91Y2hFbmQpIHJ1bm5pbmcudG91Y2hFbmQoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCk7XHJcbn07XHJcblxyXG52YXIgc3dpdGNoTWVudSA9IGZ1bmN0aW9uKCkge1xyXG4gIGJ0bl90b2dnbGVfbWVudS5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKTtcclxuICBtZW51LmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScpO1xyXG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcG9pbnRlZCcpO1xyXG59O1xyXG5cclxuaW5pdCgpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgQ2FtZXJhID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJhZDFfYmFzZSA9IFV0aWwuZ2V0UmFkaWFuKDEwKTtcclxuICAgIHRoaXMucmFkMSA9IHRoaXMucmFkMV9iYXNlO1xyXG4gICAgdGhpcy5yYWQyID0gVXRpbC5nZXRSYWRpYW4oMCk7XHJcbiAgICB0aGlzLmxvb2sgPSBuZXcgRm9yY2UzKCk7XHJcbiAgICB0aGlzLnJvdGF0ZV9yYWQxX2Jhc2UgPSAwO1xyXG4gICAgdGhpcy5yb3RhdGVfcmFkMSA9IDA7XHJcbiAgICB0aGlzLnJvdGF0ZV9yYWQyX2Jhc2UgPSAwO1xyXG4gICAgdGhpcy5yb3RhdGVfcmFkMiA9IDA7XHJcbiAgICB0aGlzLnJhbmdlID0gMTAwMDtcclxuICAgIHRoaXMub2JqO1xyXG4gICAgRm9yY2UzLmNhbGwodGhpcyk7XHJcbiAgfTtcclxuICBDYW1lcmEucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBDYW1lcmEucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2FtZXJhO1xyXG4gIENhbWVyYS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDM1LCB3aWR0aCAvIGhlaWdodCwgMSwgMTAwMDApO1xyXG4gICAgdGhpcy5vYmoudXAuc2V0KDAsIDEsIDApO1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMub2JqLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvblNwaGVyaWNhbCgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eS5jb3B5KHRoaXMuYW5jaG9yKTtcclxuICAgIHRoaXMubG9va0F0Q2VudGVyKCk7XHJcbiAgfTtcclxuICBDYW1lcmEucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNldFBvc2l0aW9uU3BoZXJpY2FsKCk7XHJcbiAgICB0aGlzLmxvb2tBdENlbnRlcigpO1xyXG4gIH07XHJcbiAgQ2FtZXJhLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICB0aGlzLm9iai5hc3BlY3QgPSB3aWR0aCAvIGhlaWdodDtcclxuICAgIHRoaXMub2JqLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcclxuICB9O1xyXG4gIENhbWVyYS5wcm90b3R5cGUuc2V0UG9zaXRpb25TcGhlcmljYWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB2ZWN0b3IgPSBVdGlsLmdldFNwaGVyaWNhbCh0aGlzLnJhZDEsIHRoaXMucmFkMiwgdGhpcy5yYW5nZSk7XHJcbiAgICB0aGlzLmFuY2hvci5jb3B5KHZlY3Rvcik7XHJcbiAgfTtcclxuICBDYW1lcmEucHJvdG90eXBlLmxvb2tBdENlbnRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5vYmoubG9va0F0KHtcclxuICAgICAgeDogMCxcclxuICAgICAgeTogMCxcclxuICAgICAgejogMFxyXG4gICAgfSk7XHJcbiAgfTtcclxuICByZXR1cm4gQ2FtZXJhO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBldmVudFR5cGUsIGNhbGxiYWNrKXtcclxuICB2YXIgdGltZXI7XHJcblxyXG4gIG9iamVjdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgY2FsbGJhY2soZXZlbnQpO1xyXG4gICAgfSwgNTAwKTtcclxuICB9LCBmYWxzZSk7XHJcbn07XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIEZvcmNlMiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuICAgIHRoaXMubWFzcyA9IDE7XHJcbiAgfTtcclxuICBcclxuICBGb3JjZTIucHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkodGhpcy52ZWxvY2l0eSk7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLnVwZGF0ZVZlbG9jaXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbi5kaXZpZGVTY2FsYXIodGhpcy5tYXNzKTtcclxuICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcclxuICB9O1xyXG4gIEZvcmNlMi5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHZlY3Rvcik7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5RnJpY3Rpb24gPSBmdW5jdGlvbihtdSwgbm9ybWFsKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xyXG4gICAgaWYgKCFub3JtYWwpIG5vcm1hbCA9IDE7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSk7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKG11KTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5RHJhZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIoLTEpO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcih0aGlzLmFjY2VsZXJhdGlvbi5sZW5ndGgoKSAqIHZhbHVlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5SG9vayA9IGZ1bmN0aW9uKHJlc3RfbGVuZ3RoLCBrKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLnZlbG9jaXR5LmNsb25lKCkuc3ViKHRoaXMuYW5jaG9yKTtcclxuICAgIHZhciBkaXN0YW5jZSA9IGZvcmNlLmxlbmd0aCgpIC0gcmVzdF9sZW5ndGg7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xICogayAqIGRpc3RhbmNlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIEZvcmNlMjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBGb3JjZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIHRoaXMubWFzcyA9IDE7XHJcbiAgfTtcclxuICBcclxuICBGb3JjZS5wcm90b3R5cGUudXBkYXRlUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucG9zaXRpb24uY29weSh0aGlzLnZlbG9jaXR5KTtcclxuICB9O1xyXG4gIEZvcmNlLnByb3RvdHlwZS51cGRhdGVWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uZGl2aWRlU2NhbGFyKHRoaXMubWFzcyk7XHJcbiAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHZlY3Rvcik7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlGcmljdGlvbiA9IGZ1bmN0aW9uKG11LCBub3JtYWwpIHtcclxuICAgIHZhciBmb3JjZSA9IHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCk7XHJcbiAgICBpZiAoIW5vcm1hbCkgbm9ybWFsID0gMTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIobXUpO1xyXG4gICAgdGhpcy5hcHBseUZvcmNlKGZvcmNlKTtcclxuICB9O1xyXG4gIEZvcmNlLnByb3RvdHlwZS5hcHBseURyYWcgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIodGhpcy5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgKiB2YWx1ZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcbiAgRm9yY2UucHJvdG90eXBlLmFwcGx5SG9vayA9IGZ1bmN0aW9uKHJlc3RfbGVuZ3RoLCBrKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLnZlbG9jaXR5LmNsb25lKCkuc3ViKHRoaXMuYW5jaG9yKTtcclxuICAgIHZhciBkaXN0YW5jZSA9IGZvcmNlLmxlbmd0aCgpIC0gcmVzdF9sZW5ndGg7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xICogayAqIGRpc3RhbmNlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIEZvcmNlO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBIZW1pTGlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucmFkMSA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgdGhpcy5yYWQyID0gVXRpbC5nZXRSYWRpYW4oMCk7XHJcbiAgICB0aGlzLnJhbmdlID0gMTAwMDtcclxuICAgIHRoaXMuaGV4MSA9IDB4ZmZmZmZmO1xyXG4gICAgdGhpcy5oZXgyID0gMHgzMzMzMzM7XHJcbiAgICB0aGlzLmludGVuc2l0eSA9IDE7XHJcbiAgICB0aGlzLm9iajtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgSGVtaUxpZ2h0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgSGVtaUxpZ2h0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlbWlMaWdodDtcclxuICBIZW1pTGlnaHQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihoZXgxLCBoZXgyLCBpbnRlbnNpdHkpIHtcclxuICAgIGlmIChoZXgxKSB0aGlzLmhleDEgPSBoZXgxO1xyXG4gICAgaWYgKGhleDIpIHRoaXMuaGV4MiA9IGhleDI7XHJcbiAgICBpZiAoaW50ZW5zaXR5KSB0aGlzLmludGVuc2l0eSA9IGludGVuc2l0eTtcclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCh0aGlzLmhleDEsIHRoaXMuaGV4MiwgdGhpcy5pbnRlbnNpdHkpO1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMub2JqLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvblNwaGVyaWNhbCgpO1xyXG4gIH07XHJcbiAgSGVtaUxpZ2h0LnByb3RvdHlwZS5zZXRQb3NpdGlvblNwaGVyaWNhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHBvaW50cyA9IFV0aWwuZ2V0U3BoZXJpY2FsKHRoaXMucmFkMSwgdGhpcy5yYWQyLCB0aGlzLnJhbmdlKTtcclxuICAgIHRoaXMucG9zaXRpb24uY29weShwb2ludHMpO1xyXG4gIH07XHJcbiAgcmV0dXJuIEhlbWlMaWdodDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2l6ZSA9IDA7XHJcbiAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgdGhpcy5pc19hY3RpdmUgPSBmYWxzZTtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgTW92ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBNb3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNb3ZlcjtcclxuICBNb3Zlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgdGhpcy5hbmNob3IgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLnNldCgwLCAwLCAwKTtcclxuICAgIHRoaXMudGltZSA9IDA7XHJcbiAgfTtcclxuICBNb3Zlci5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuaXNfYWN0aXZlID0gdHJ1ZTtcclxuICB9O1xyXG4gIE1vdmVyLnByb3RvdHlwZS5pbmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmlzX2FjdGl2ZSA9IGZhbHNlO1xyXG4gIH07XHJcbiAgcmV0dXJuIE1vdmVyO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBQb2ludExpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJhZDEgPSBVdGlsLmdldFJhZGlhbigwKTtcclxuICAgIHRoaXMucmFkMiA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgdGhpcy5yYW5nZSA9IDIwMDtcclxuICAgIHRoaXMuaGV4ID0gMHhmZmZmZmY7XHJcbiAgICB0aGlzLmludGVuc2l0eSA9IDE7XHJcbiAgICB0aGlzLmRpc3RhbmNlID0gMjAwMDtcclxuICAgIHRoaXMuZGVjYXkgPSAxO1xyXG4gICAgdGhpcy5vYmo7XHJcbiAgICBGb3JjZTMuY2FsbCh0aGlzKTtcclxuICB9O1xyXG4gIFBvaW50TGlnaHQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBQb2ludExpZ2h0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvaW50TGlnaHQ7XHJcbiAgUG9pbnRMaWdodC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGhleCwgZGlzdGFuY2UpIHtcclxuICAgIGlmIChoZXgpIHRoaXMuaGV4ID0gaGV4O1xyXG4gICAgaWYgKGRpc3RhbmNlKSB0aGlzLmRpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICB0aGlzLm9iaiA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KHRoaXMuaGV4LCB0aGlzLmludGVuc2l0eSwgdGhpcy5kaXN0YW5jZSwgdGhpcy5kZWNheSk7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5vYmoucG9zaXRpb247XHJcbiAgICB0aGlzLnNldFBvc2l0aW9uU3BoZXJpY2FsKCk7XHJcbiAgfTtcclxuICBQb2ludExpZ2h0LnByb3RvdHlwZS5zZXRQb3NpdGlvblNwaGVyaWNhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHBvaW50cyA9IFV0aWwuZ2V0U3BoZXJpY2FsKHRoaXMucmFkMSwgdGhpcy5yYWQyLCB0aGlzLnJhbmdlKTtcclxuICAgIHRoaXMucG9zaXRpb24uY29weShwb2ludHMpO1xyXG4gIH07XHJcbiAgcmV0dXJuIFBvaW50TGlnaHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgdGhpcy5tYXRlcmlhbCA9IG51bGw7XHJcbiAgICB0aGlzLm9iaiA9IG51bGw7XHJcbiAgICBGb3JjZTMuY2FsbCh0aGlzKTtcclxuICB9O1xyXG4gIFBvaW50cy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEZvcmNlMy5wcm90b3R5cGUpO1xyXG4gIFBvaW50cy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQb2ludHM7XHJcbiAgUG9pbnRzLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocGFyYW0pIHtcclxuICAgIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIGNvbG9yOiB7IHR5cGU6ICdjJywgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcigweGZmZmZmZikgfSxcclxuICAgICAgICB0ZXh0dXJlOiB7IHR5cGU6ICd0JywgdmFsdWU6IHBhcmFtLnRleHR1cmUgfVxyXG4gICAgICB9LFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHBhcmFtLnZzLFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogcGFyYW0uZnMsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxyXG4gICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcclxuICAgICAgYmxlbmRpbmc6IHBhcmFtLmJsZW5kaW5nXHJcbiAgICB9KTtcclxuICAgIHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocGFyYW0ucG9zaXRpb25zLCAzKSk7XHJcbiAgICB0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnY3VzdG9tQ29sb3InLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBhcmFtLmNvbG9ycywgMykpO1xyXG4gICAgdGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3ZlcnRleE9wYWNpdHknLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBhcmFtLm9wYWNpdGllcywgMSkpO1xyXG4gICAgdGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3NpemUnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBhcmFtLnNpemVzLCAxKSk7XHJcbiAgICB0aGlzLm9iaiA9IG5ldyBUSFJFRS5Qb2ludHModGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgICBwYXJhbS5zY2VuZS5hZGQodGhpcy5vYmopO1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMub2JqLnBvc2l0aW9uO1xyXG4gIH07XHJcbiAgUG9pbnRzLnByb3RvdHlwZS51cGRhdGVQb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMub2JqLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24ubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5vYmouZ2VvbWV0cnkuYXR0cmlidXRlcy52ZXJ0ZXhPcGFjaXR5Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMub2JqLmdlb21ldHJ5LmF0dHJpYnV0ZXMuc2l6ZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB0aGlzLm9iai5nZW9tZXRyeS5hdHRyaWJ1dGVzLmN1c3RvbUNvbG9yLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICB9O1xyXG4gIHJldHVybiBQb2ludHM7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIGV4cG9ydHMgPSB7XHJcbiAgZ2V0UmFuZG9tSW50OiBmdW5jdGlvbihtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xyXG4gIH0sXHJcbiAgZ2V0RGVncmVlOiBmdW5jdGlvbihyYWRpYW4pIHtcclxuICAgIHJldHVybiByYWRpYW4gLyBNYXRoLlBJICogMTgwO1xyXG4gIH0sXHJcbiAgZ2V0UmFkaWFuOiBmdW5jdGlvbihkZWdyZWVzKSB7XHJcbiAgICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XHJcbiAgfSxcclxuICBnZXRTcGhlcmljYWw6IGZ1bmN0aW9uKHJhZDEsIHJhZDIsIHIpIHtcclxuICAgIHZhciB4ID0gTWF0aC5jb3MocmFkMSkgKiBNYXRoLmNvcyhyYWQyKSAqIHI7XHJcbiAgICB2YXIgeiA9IE1hdGguY29zKHJhZDEpICogTWF0aC5zaW4ocmFkMikgKiByO1xyXG4gICAgdmFyIHkgPSBNYXRoLnNpbihyYWQxKSAqIHI7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoeCwgeSwgeik7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFtcclxuICB7XHJcbiAgICBuYW1lOiAnZGlzdG9ydCcsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvZGlzdG9ydCcpLFxyXG4gICAgcG9zdGVkOiAnMjAxNi4yLjIzJyxcclxuICAgIHVwZGF0ZTogJycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ3VzaW5nIHRoZSBzaW1wbGV4IG5vaXNlLCBkaXN0b3J0IHRoZSBzcGhlcmUuJyxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6ICdpbWFnZSBkYXRhJyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9pbWFnZV9kYXRhJyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjEyLjknLFxyXG4gICAgdXBkYXRlOiAnMjAxNS4xMi4xMicsXHJcbiAgICBkZXNjcmlwdGlvbjogJ1BvaW50cyBiYXNlZCBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQuZ2V0SW1hZ2VEYXRhKCknLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2dhbGxlcnknLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2dhbGxlcnknKSxcclxuICAgIHBvc3RlZDogJzIwMTUuMTIuMicsXHJcbiAgICB1cGRhdGU6ICcyMDE1LjEyLjknLFxyXG4gICAgZGVzY3JpcHRpb246ICdpbWFnZSBnYWxsZXJ5IG9uIDNkLiB0ZXN0ZWQgdGhhdCBwaWNrZWQgb2JqZWN0IGFuZCBtb3ZpbmcgY2FtZXJhLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnY29tZXQnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2NvbWV0JyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjExLjI0JyxcclxuICAgIHVwZGF0ZTogJzIwMTYuMS44JyxcclxuICAgIGRlc2NyaXB0aW9uOiAnY2FtZXJhIHRvIHRyYWNrIHRoZSBtb3ZpbmcgcG9pbnRzLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnaHlwZXIgc3BhY2UnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2h5cGVyX3NwYWNlJyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjExLjEyJyxcclxuICAgIHVwZGF0ZTogJycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ2FkZCBsaXR0bGUgY2hhbmdlIGFib3V0IGNhbWVyYSBhbmdsZSBhbmQgcGFydGljbGUgY29udHJvbGVzLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnZmlyZSBiYWxsJyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9maXJlX2JhbGwnKSxcclxuICAgIHBvc3RlZDogJzIwMTUuMTEuMTInLFxyXG4gICAgdXBkYXRlOiAnJyxcclxuICAgIGRlc2NyaXB0aW9uOiAndGVzdCBvZiBzaW1wbGUgcGh5c2ljcyBhbmQgYWRkaXRpdmUgYmxlbmRpbmcuJyxcclxuICB9XHJcbl07XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMicpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcbnZhciBQb2ludHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50cy5qcycpO1xyXG52YXIgSGVtaUxpZ2h0ID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9oZW1pTGlnaHQnKTtcclxudmFyIFBvaW50TGlnaHQgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50TGlnaHQnKTtcclxuXHJcbnZhciB2cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyBjdXN0b21Db2xvcjtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgdmVydGV4T3BhY2l0eTtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgc2l6ZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdkNvbG9yID0gY3VzdG9tQ29sb3I7XFxyXFxuICBmT3BhY2l0eSA9IHZlcnRleE9wYWNpdHk7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbiAgZ2xfUG9pbnRTaXplID0gc2l6ZSAqICgzMDAuMCAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpO1xcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciBmcyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIHZlYzMgY29sb3I7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciAqIHZDb2xvciwgZk9wYWNpdHkpO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gZ2xfRnJhZ0NvbG9yICogdGV4dHVyZTJEKHRleHR1cmUsIGdsX1BvaW50Q29vcmQpO1xcclxcbn1cXHJcXG5cIjtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oKSB7fTtcclxuICB2YXIgbW92ZXJzX251bSA9IDEwMDAwO1xyXG4gIHZhciBtb3ZlcnMgPSBbXTtcclxuICB2YXIgbW92ZXJfYWN0aXZhdGVfY291bnQgPSAyO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIGhlbWlfbGlnaHQgPSBuZXcgSGVtaUxpZ2h0KCk7XHJcbiAgdmFyIGNvbWV0X2xpZ2h0MSA9IG5ldyBQb2ludExpZ2h0KCk7XHJcbiAgdmFyIGNvbWV0X2xpZ2h0MiA9IG5ldyBQb2ludExpZ2h0KCk7XHJcbiAgdmFyIHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBjb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgb3BhY2l0aWVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBjb21ldCA9IG51bGw7XHJcbiAgdmFyIGNvbWV0X3JhZGl1cyA9IDMwO1xyXG4gIHZhciBjb21ldF9zY2FsZSA9IG5ldyBGb3JjZTIoKTtcclxuICB2YXIgY29tZXRfY29sb3JfaCA9IDE0MDtcclxuICB2YXIgY29sb3JfZGlmZiA9IDQ1O1xyXG4gIHZhciBwbGFuZXQgPSBudWxsO1xyXG4gIHZhciBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gIHZhciBsYXN0X3RpbWVfcGx1c19hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGxhc3RfdGltZV9ib3VuY2UgPSBEYXRlLm5vdygpO1xyXG4gIHZhciBsYXN0X3RpbWVfdG91Y2ggPSBEYXRlLm5vdygpO1xyXG4gIHZhciBwbHVzX2FjY2VsZXJhdGlvbiA9IDA7XHJcbiAgdmFyIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICB2YXIgaXNfcGx1c19hY3RpdmF0ZSA9IGZhbHNlO1xyXG4gIHZhciB0cmFja19wb2ludHMgPSB0cnVlO1xyXG5cclxuICB2YXIgdXBkYXRlTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgdmFyIHBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkge1xyXG4gICAgICAgIG1vdmVyLnRpbWUrKztcclxuICAgICAgICBtb3Zlci5hcHBseURyYWcoMC4xKTtcclxuICAgICAgICBtb3Zlci51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgaWYgKG1vdmVyLnRpbWUgPiAxMCkge1xyXG4gICAgICAgICAgbW92ZXIuc2l6ZSAtPSAyO1xyXG4gICAgICAgICAgLy9tb3Zlci5hIC09IDAuMDQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtb3Zlci5zaXplIDw9IDApIHtcclxuICAgICAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xyXG4gICAgICAgICAgbW92ZXIudGltZSA9IDA7XHJcbiAgICAgICAgICBtb3Zlci5hID0gMC4wO1xyXG4gICAgICAgICAgbW92ZXIuaW5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnBvc2l0aW9uLnggLSBwb2ludHMucG9zaXRpb24ueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci5wb3NpdGlvbi55IC0gcG9pbnRzLnBvc2l0aW9uLnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIucG9zaXRpb24ueiAtIHBvaW50cy5wb3NpdGlvbi56O1xyXG4gICAgICBjb2xvcnNbaSAqIDMgKyAwXSA9IG1vdmVyLmNvbG9yLnI7XHJcbiAgICAgIGNvbG9yc1tpICogMyArIDFdID0gbW92ZXIuY29sb3IuZztcclxuICAgICAgY29sb3JzW2kgKiAzICsgMl0gPSBtb3Zlci5jb2xvci5iO1xyXG4gICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICB9XHJcbiAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGFjdGl2YXRlTW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb3VudCA9IDA7XHJcbiAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGlmIChub3cgLSBsYXN0X3RpbWVfYWN0aXZhdGUgPiAxMCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgICBpZiAobW92ZXIuaXNfYWN0aXZlKSBjb250aW51ZTtcclxuICAgICAgICB2YXIgcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICAgIHZhciByYWQyID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgICAgdmFyIHJhbmdlID0gVXRpbC5nZXRSYW5kb21JbnQoMSwgMzApO1xyXG4gICAgICAgIHZhciB2ZWN0b3IgPSBVdGlsLmdldFNwaGVyaWNhbChyYWQxLCByYWQyLCByYW5nZSk7XHJcbiAgICAgICAgdmFyIGZvcmNlID0gVXRpbC5nZXRTcGhlcmljYWwocmFkMSwgcmFkMiwgcmFuZ2UgLyAyMCk7XHJcbiAgICAgICAgdmFyIGggPSBVdGlsLmdldFJhbmRvbUludChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZiwgY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYpIC0gcGx1c19hY2NlbGVyYXRpb24gLyAxLjU7XHJcbiAgICAgICAgdmFyIHMgPSBVdGlsLmdldFJhbmRvbUludCg2MCwgODApO1xyXG4gICAgICAgIHZlY3Rvci5hZGQocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgICBtb3Zlci5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIG1vdmVyLmluaXQodmVjdG9yKTtcclxuICAgICAgICBtb3Zlci5jb2xvci5zZXRIU0woaCAvIDM2MCwgcyAvIDEwMCwgMC43KTtcclxuICAgICAgICBtb3Zlci5hcHBseUZvcmNlKGZvcmNlKTtcclxuICAgICAgICBtb3Zlci5hID0gMTtcclxuICAgICAgICBtb3Zlci5zaXplID0gMjU7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgICBpZiAoY291bnQgPj0gbW92ZXJfYWN0aXZhdGVfY291bnQpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHJvdGF0ZUNvbWV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb21ldC5yb3RhdGlvbi54ICs9IDAuMDMgKyBwbHVzX2FjY2VsZXJhdGlvbiAvIDEwMDA7XHJcbiAgICBjb21ldC5yb3RhdGlvbi55ICs9IDAuMDEgKyBwbHVzX2FjY2VsZXJhdGlvbiAvIDEwMDA7XHJcbiAgICBjb21ldC5yb3RhdGlvbi56ICs9IDAuMDEgKyBwbHVzX2FjY2VsZXJhdGlvbiAvIDEwMDA7XHJcbiAgICBwb2ludHMucmFkMV9iYXNlICs9IFV0aWwuZ2V0UmFkaWFuKC42KTtcclxuICAgIHBvaW50cy5yYWQxID0gVXRpbC5nZXRSYWRpYW4oTWF0aC5zaW4ocG9pbnRzLnJhZDFfYmFzZSkgKiA0NSArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwKTtcclxuICAgIHBvaW50cy5yYWQyICs9IFV0aWwuZ2V0UmFkaWFuKDAuOCArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwKTtcclxuICAgIHBvaW50cy5yYWQzICs9IDAuMDE7XHJcbiAgICByZXR1cm4gVXRpbC5nZXRTcGhlcmljYWwocG9pbnRzLnJhZDEsIHBvaW50cy5yYWQyLCAzNTApO1xyXG4gIH07XHJcblxyXG4gIHZhciByb3RhdGVDb21ldENvbG9yID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcmFkaXVzID0gY29tZXRfcmFkaXVzICogMC44O1xyXG4gICAgY29tZXRfbGlnaHQxLm9iai5wb3NpdGlvbi5jb3B5KFV0aWwuZ2V0U3BoZXJpY2FsKFV0aWwuZ2V0UmFkaWFuKDApLCAgVXRpbC5nZXRSYWRpYW4oMCksIHJhZGl1cykuYWRkKHBvaW50cy5wb3NpdGlvbikpO1xyXG4gICAgY29tZXRfbGlnaHQyLm9iai5wb3NpdGlvbi5jb3B5KFV0aWwuZ2V0U3BoZXJpY2FsKFV0aWwuZ2V0UmFkaWFuKDE4MCksIFV0aWwuZ2V0UmFkaWFuKDApLCByYWRpdXMpLmFkZChwb2ludHMucG9zaXRpb24pKTtcclxuICB9O1xyXG5cclxuICB2YXIgYm91bmNlQ29tZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChEYXRlLm5vdygpIC0gbGFzdF90aW1lX2JvdW5jZSA+IDEwMDAgLSBwbHVzX2FjY2VsZXJhdGlvbiAqIDMpIHtcclxuICAgICAgY29tZXRfc2NhbGUuYXBwbHlGb3JjZShuZXcgVEhSRUUuVmVjdG9yMigwLjA4ICsgcGx1c19hY2NlbGVyYXRpb24gLyA1MDAwLCAwKSk7XHJcbiAgICAgIGxhc3RfdGltZV9ib3VuY2UgPSBEYXRlLm5vdygpO1xyXG4gICAgICBpc19wbHVzX2FjdGl2YXRlID0gdHJ1ZTtcclxuICAgICAgbGFzdF90aW1lX3BsdXNfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzX3BsdXNfYWN0aXZhdGUgJiYgRGF0ZS5ub3coKSAtIGxhc3RfdGltZV9wbHVzX2FjdGl2YXRlIDwgNTAwKSB7XHJcbiAgICAgIG1vdmVyX2FjdGl2YXRlX2NvdW50ID0gNiArIE1hdGguZmxvb3IocGx1c19hY2NlbGVyYXRpb24gLyA0MCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtb3Zlcl9hY3RpdmF0ZV9jb3VudCA9IDEgKyBNYXRoLmZsb29yKHBsdXNfYWNjZWxlcmF0aW9uIC8gNDApO1xyXG4gICAgfVxyXG4gICAgY29tZXRfc2NhbGUuYXBwbHlIb29rKDAsIDAuMSk7XHJcbiAgICBjb21ldF9zY2FsZS5hcHBseURyYWcoMC4xMik7XHJcbiAgICBjb21ldF9zY2FsZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgY29tZXRfc2NhbGUudXBkYXRlUG9zaXRpb24oKTtcclxuICAgIGNvbWV0LnNjYWxlLnNldCgxICsgY29tZXRfc2NhbGUucG9zaXRpb24ueCwgMSArIGNvbWV0X3NjYWxlLnBvc2l0aW9uLngsIDEgKyBjb21ldF9zY2FsZS5wb3NpdGlvbi54KTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlVGV4dHVyZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgdmFyIGdyYWQgPSBudWxsO1xyXG4gICAgdmFyIHRleHR1cmUgPSBudWxsO1xyXG5cclxuICAgIGNhbnZhcy53aWR0aCA9IDIwMDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSAyMDA7XHJcbiAgICBncmFkID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KDEwMCwgMTAwLCAyMCwgMTAwLCAxMDAsIDEwMCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjksICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLjAsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDApJyk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcclxuICAgIGN0eC5hcmMoMTAwLCAxMDAsIDEwMCwgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXMpO1xyXG4gICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdGV4dHVyZTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlQ29tbWV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgYmFzZV9nZW9tZXRyeSA9IG5ldyBUSFJFRS5PY3RhaGVkcm9uR2VvbWV0cnkoY29tZXRfcmFkaXVzLCAyKTtcclxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgY29sb3I6IG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyBjb21ldF9jb2xvcl9oICsgJywgMTAwJSwgMTAwJSknKSxcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmdcclxuICAgIH0pO1xyXG4gICAgdmFyIHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkoYmFzZV9nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGggKiAzKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmFzZV9nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDNdID0gYmFzZV9nZW9tZXRyeS52ZXJ0aWNlc1tpXS54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IGJhc2VfZ2VvbWV0cnkudmVydGljZXNbaV0ueTtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBiYXNlX2dlb21ldHJ5LnZlcnRpY2VzW2ldLno7XHJcbiAgICB9XHJcbiAgICB2YXIgaW5kaWNlcyA9IG5ldyBVaW50MzJBcnJheShiYXNlX2dlb21ldHJ5LmZhY2VzLmxlbmd0aCAqIDMpO1xyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBiYXNlX2dlb21ldHJ5LmZhY2VzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgIGluZGljZXNbaiAqIDNdID0gYmFzZV9nZW9tZXRyeS5mYWNlc1tqXS5hO1xyXG4gICAgICBpbmRpY2VzW2ogKiAzICsgMV0gPSBiYXNlX2dlb21ldHJ5LmZhY2VzW2pdLmI7XHJcbiAgICAgIGluZGljZXNbaiAqIDMgKyAyXSA9IGJhc2VfZ2VvbWV0cnkuZmFjZXNbal0uYztcclxuICAgIH1cclxuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9ucywgMykpO1xyXG4gICAgZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5keW5hbWljID0gdHJ1ZTtcclxuICAgIGdlb21ldHJ5LnNldEluZGV4KG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoaW5kaWNlcywgMSkpO1xyXG4gICAgZ2VvbWV0cnkuaW5kZXguZHluYW1pYyA9IHRydWU7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlUGxhbmV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuT2N0YWhlZHJvbkdlb21ldHJ5KDI1MCwgNCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBjb2xvcjogMHgyMjIyMjIsXHJcbiAgICAgIHNoYWRpbmc6IFRIUkVFLkZsYXRTaGFkaW5nXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY2NlbGVyYXRlQ29tZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChpc190b3VjaGVkICYmIHBsdXNfYWNjZWxlcmF0aW9uIDwgMjAwKSB7XHJcbiAgICAgIHBsdXNfYWNjZWxlcmF0aW9uICs9IDE7XHJcbiAgICB9IGVsc2UgaWYocGx1c19hY2NlbGVyYXRpb24gPiAwKSB7XHJcbiAgICAgIHBsdXNfYWNjZWxlcmF0aW9uIC09IDE7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgY29tZXQgPSBjcmVhdGVDb21tZXQoKTtcclxuICAgICAgc2NlbmUuYWRkKGNvbWV0KTtcclxuICAgICAgcGxhbmV0ID0gY3JlYXRlUGxhbmV0KCk7XHJcbiAgICAgIHNjZW5lLmFkZChwbGFuZXQpO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVyc19udW07IGkrKykge1xyXG4gICAgICAgIHZhciBtb3ZlciA9IG5ldyBNb3ZlcigpO1xyXG4gICAgICAgIHZhciBoID0gVXRpbC5nZXRSYW5kb21JbnQoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYsIGNvbWV0X2NvbG9yX2ggKyBjb2xvcl9kaWZmKTtcclxuICAgICAgICB2YXIgcyA9IFV0aWwuZ2V0UmFuZG9tSW50KDYwLCA4MCk7XHJcbiAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhVdGlsLmdldFJhbmRvbUludCgtMTAwLCAxMDApLCAwLCAwKSk7XHJcbiAgICAgICAgbW92ZXIuY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgaCArICcsICcgKyBzICsgJyUsIDcwJSknKTtcclxuICAgICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci5wb3NpdGlvbi54O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIucG9zaXRpb24ueTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnBvc2l0aW9uLno7XHJcbiAgICAgICAgY29sb3JzW2kgKiAzICsgMF0gPSBtb3Zlci5jb2xvci5yO1xyXG4gICAgICAgIGNvbG9yc1tpICogMyArIDFdID0gbW92ZXIuY29sb3IuZztcclxuICAgICAgICBjb2xvcnNbaSAqIDMgKyAyXSA9IG1vdmVyLmNvbG9yLmI7XHJcbiAgICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICAgIH1cclxuICAgICAgcG9pbnRzLmluaXQoe1xyXG4gICAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgICB2czogdnMsXHJcbiAgICAgICAgZnM6IGZzLFxyXG4gICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICAgIGNvbG9yczogY29sb3JzLFxyXG4gICAgICAgIG9wYWNpdGllczogb3BhY2l0aWVzLFxyXG4gICAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgICB0ZXh0dXJlOiBjcmVhdGVUZXh0dXJlKCksXHJcbiAgICAgICAgYmxlbmRpbmc6IFRIUkVFLk5vcm1hbEJsZW5kaW5nXHJcbiAgICAgIH0pO1xyXG4gICAgICBwb2ludHMucmFkMSA9IDA7XHJcbiAgICAgIHBvaW50cy5yYWQxX2Jhc2UgPSAwO1xyXG4gICAgICBwb2ludHMucmFkMiA9IDA7XHJcbiAgICAgIHBvaW50cy5yYWQzID0gMDtcclxuICAgICAgaGVtaV9saWdodC5pbml0KFxyXG4gICAgICAgIG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyAoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYpICsgJywgNTAlLCA2MCUpJykuZ2V0SGV4KCksXHJcbiAgICAgICAgbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIChjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZikgKyAnLCA1MCUsIDYwJSknKS5nZXRIZXgoKVxyXG4gICAgICApO1xyXG4gICAgICBzY2VuZS5hZGQoaGVtaV9saWdodC5vYmopO1xyXG4gICAgICBjb21ldF9saWdodDEuaW5pdChuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgKGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmKSArICcsIDYwJSwgNTAlKScpKTtcclxuICAgICAgc2NlbmUuYWRkKGNvbWV0X2xpZ2h0MS5vYmopO1xyXG4gICAgICBjb21ldF9saWdodDIuaW5pdChuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgKGNvbWV0X2NvbG9yX2ggKyBjb2xvcl9kaWZmKSArICcsIDYwJSwgNTAlKScpKTtcclxuICAgICAgc2NlbmUuYWRkKGNvbWV0X2xpZ2h0Mi5vYmopO1xyXG4gICAgICBjYW1lcmEuYW5jaG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoMTUwMCwgMCwgMCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBjb21ldC5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGNvbWV0Lm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGNvbWV0KTtcclxuICAgICAgcGxhbmV0Lmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcGxhbmV0Lm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBsYW5ldCk7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMub2JqKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGhlbWlfbGlnaHQub2JqKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGNvbWV0X2xpZ2h0MS5vYmopO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoY29tZXRfbGlnaHQyLm9iaik7XHJcbiAgICAgIG1vdmVycyA9IFtdO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBhY2NlbGVyYXRlQ29tZXQoKTtcclxuICAgICAgcG9pbnRzLnZlbG9jaXR5ID0gcm90YXRlQ29tZXQoKTtcclxuICAgICAgaWYgKHRyYWNrX3BvaW50cyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGNhbWVyYS5hbmNob3IuY29weShcclxuICAgICAgICAgIHBvaW50cy52ZWxvY2l0eS5jbG9uZSgpLmFkZChcclxuICAgICAgICAgICAgcG9pbnRzLnZlbG9jaXR5LmNsb25lKCkuc3ViKHBvaW50cy5wb3NpdGlvbilcclxuICAgICAgICAgICAgLm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKC00MDApXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjYW1lcmEuYW5jaG9yLnkgKz0gcG9pbnRzLnBvc2l0aW9uLnkgKiAyO1xyXG4gICAgICAgIGNhbWVyYS5sb29rLmFuY2hvci5jb3B5KHBvaW50cy5wb3NpdGlvbik7XHJcbiAgICAgIH1cclxuICAgICAgcG9pbnRzLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNvbWV0LnBvc2l0aW9uLmNvcHkocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgaGVtaV9saWdodC5vYmouY29sb3Iuc2V0SFNMKChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZiAtIHBsdXNfYWNjZWxlcmF0aW9uIC8gMS41KSAvIDM2MCwgMC41LCAwLjYpO1xyXG4gICAgICBoZW1pX2xpZ2h0Lm9iai5ncm91bmRDb2xvci5zZXRIU0woKGNvbWV0X2NvbG9yX2ggKyBjb2xvcl9kaWZmIC0gcGx1c19hY2NlbGVyYXRpb24gLyAxLjUpIC8gMzYwLCAwLjUsIDAuNik7XHJcbiAgICAgIGNvbWV0X2xpZ2h0MS5vYmoucG9zaXRpb24uY29weShwb2ludHMudmVsb2NpdHkpO1xyXG4gICAgICBjb21ldF9saWdodDEub2JqLmNvbG9yLnNldEhTTCgoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNSkgLyAzNjAsIDAuNSwgMC42KTtcclxuICAgICAgY29tZXRfbGlnaHQyLm9iai5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgIGNvbWV0X2xpZ2h0Mi5vYmouY29sb3Iuc2V0SFNMKChjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZiAtIHBsdXNfYWNjZWxlcmF0aW9uIC8gMS41KSAvIDM2MCwgMC41LCAwLjYpO1xyXG4gICAgICBhY3RpdmF0ZU1vdmVyKCk7XHJcbiAgICAgIHVwZGF0ZU1vdmVyKCk7XHJcbiAgICAgIGNhbWVyYS5hcHBseUhvb2soMCwgMC4wMjUpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmxvb2suYXBwbHlIb29rKDAsIDAuMik7XHJcbiAgICAgIGNhbWVyYS5sb29rLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBjYW1lcmEubG9vay51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEubG9vay51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEub2JqLmxvb2tBdChjYW1lcmEubG9vay5wb3NpdGlvbik7XHJcbiAgICAgIHJvdGF0ZUNvbWV0Q29sb3IoKTtcclxuICAgICAgYm91bmNlQ29tZXQoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgaXNfdG91Y2hlZCA9IHRydWU7XHJcbiAgICAgIGxhc3RfdGltZV90b3VjaCA9IERhdGUubm93KCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgICBpc190b3VjaGVkID0gZmFsc2U7XHJcbiAgICAgIGlmIChEYXRlLm5vdygpIC0gbGFzdF90aW1lX3RvdWNoIDwgMTAwKSB7XHJcbiAgICAgICAgaWYgKHRyYWNrX3BvaW50cyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgY2FtZXJhLmFuY2hvci5zZXQoMTIwMCwgMTIwMCwgMCk7XHJcbiAgICAgICAgICBjYW1lcmEubG9vay5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICAgICAgdHJhY2tfcG9pbnRzID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRyYWNrX3BvaW50cyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTInKTtcclxudmFyIEhlbWlMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvaGVtaUxpZ2h0Jyk7XHJcblxyXG52YXIgdnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSBmbG9hdCB0aW1lO1xcclxcbnVuaWZvcm0gZmxvYXQgcmFkaXVzO1xcclxcbnVuaWZvcm0gZmxvYXQgZGlzdG9ydDtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcblxcclxcbnVuaWZvcm0gdmVjMyBoZW1pc3BoZXJlTGlnaHREaXJlY3Rpb247XFxyXFxudW5pZm9ybSB2ZWMzIGhlbWlzcGhlcmVMaWdodFNreUNvbG9yO1xcclxcbnVuaWZvcm0gdmVjMyBoZW1pc3BoZXJlTGlnaHRHcm91bmRDb2xvcjtcXHJcXG5cXHJcXG4vL1xcbi8vIERlc2NyaXB0aW9uIDogQXJyYXkgYW5kIHRleHR1cmVsZXNzIEdMU0wgMkQvM0QvNEQgc2ltcGxleFxcbi8vICAgICAgICAgICAgICAgbm9pc2UgZnVuY3Rpb25zLlxcbi8vICAgICAgQXV0aG9yIDogSWFuIE1jRXdhbiwgQXNoaW1hIEFydHMuXFxuLy8gIE1haW50YWluZXIgOiBpam1cXG4vLyAgICAgTGFzdG1vZCA6IDIwMTEwODIyIChpam0pXFxuLy8gICAgIExpY2Vuc2UgOiBDb3B5cmlnaHQgKEMpIDIwMTEgQXNoaW1hIEFydHMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXFxuLy8gICAgICAgICAgICAgICBEaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUuXFxuLy8gICAgICAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vYXNoaW1hL3dlYmdsLW5vaXNlXFxuLy9cXG5cXG52ZWMzIG1vZDI4OV8yXzAodmVjMyB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IG1vZDI4OV8yXzAodmVjNCB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IHBlcm11dGVfMl8xKHZlYzQgeCkge1xcbiAgICAgcmV0dXJuIG1vZDI4OV8yXzAoKCh4KjM0LjApKzEuMCkqeCk7XFxufVxcblxcbnZlYzQgdGF5bG9ySW52U3FydF8yXzIodmVjNCByKVxcbntcXG4gIHJldHVybiAxLjc5Mjg0MjkxNDAwMTU5IC0gMC44NTM3MzQ3MjA5NTMxNCAqIHI7XFxufVxcblxcbmZsb2F0IHNub2lzZV8yXzModmVjMyB2KVxcbiAge1xcbiAgY29uc3QgdmVjMiAgQyA9IHZlYzIoMS4wLzYuMCwgMS4wLzMuMCkgO1xcbiAgY29uc3QgdmVjNCAgRF8yXzQgPSB2ZWM0KDAuMCwgMC41LCAxLjAsIDIuMCk7XFxuXFxuLy8gRmlyc3QgY29ybmVyXFxuICB2ZWMzIGkgID0gZmxvb3IodiArIGRvdCh2LCBDLnl5eSkgKTtcXG4gIHZlYzMgeDAgPSAgIHYgLSBpICsgZG90KGksIEMueHh4KSA7XFxuXFxuLy8gT3RoZXIgY29ybmVyc1xcbiAgdmVjMyBnXzJfNSA9IHN0ZXAoeDAueXp4LCB4MC54eXopO1xcbiAgdmVjMyBsID0gMS4wIC0gZ18yXzU7XFxuICB2ZWMzIGkxID0gbWluKCBnXzJfNS54eXosIGwuenh5ICk7XFxuICB2ZWMzIGkyID0gbWF4KCBnXzJfNS54eXosIGwuenh5ICk7XFxuXFxuICAvLyAgIHgwID0geDAgLSAwLjAgKyAwLjAgKiBDLnh4eDtcXG4gIC8vICAgeDEgPSB4MCAtIGkxICArIDEuMCAqIEMueHh4O1xcbiAgLy8gICB4MiA9IHgwIC0gaTIgICsgMi4wICogQy54eHg7XFxuICAvLyAgIHgzID0geDAgLSAxLjAgKyAzLjAgKiBDLnh4eDtcXG4gIHZlYzMgeDEgPSB4MCAtIGkxICsgQy54eHg7XFxuICB2ZWMzIHgyID0geDAgLSBpMiArIEMueXl5OyAvLyAyLjAqQy54ID0gMS8zID0gQy55XFxuICB2ZWMzIHgzID0geDAgLSBEXzJfNC55eXk7ICAgICAgLy8gLTEuMCszLjAqQy54ID0gLTAuNSA9IC1ELnlcXG5cXG4vLyBQZXJtdXRhdGlvbnNcXG4gIGkgPSBtb2QyODlfMl8wKGkpO1xcbiAgdmVjNCBwID0gcGVybXV0ZV8yXzEoIHBlcm11dGVfMl8xKCBwZXJtdXRlXzJfMShcXG4gICAgICAgICAgICAgaS56ICsgdmVjNCgwLjAsIGkxLnosIGkyLnosIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnkgKyB2ZWM0KDAuMCwgaTEueSwgaTIueSwgMS4wICkpXFxuICAgICAgICAgICArIGkueCArIHZlYzQoMC4wLCBpMS54LCBpMi54LCAxLjAgKSk7XFxuXFxuLy8gR3JhZGllbnRzOiA3eDcgcG9pbnRzIG92ZXIgYSBzcXVhcmUsIG1hcHBlZCBvbnRvIGFuIG9jdGFoZWRyb24uXFxuLy8gVGhlIHJpbmcgc2l6ZSAxNyoxNyA9IDI4OSBpcyBjbG9zZSB0byBhIG11bHRpcGxlIG9mIDQ5ICg0OSo2ID0gMjk0KVxcbiAgZmxvYXQgbl8gPSAwLjE0Mjg1NzE0Mjg1NzsgLy8gMS4wLzcuMFxcbiAgdmVjMyAgbnMgPSBuXyAqIERfMl80Lnd5eiAtIERfMl80Lnh6eDtcXG5cXG4gIHZlYzQgaiA9IHAgLSA0OS4wICogZmxvb3IocCAqIG5zLnogKiBucy56KTsgIC8vICBtb2QocCw3KjcpXFxuXFxuICB2ZWM0IHhfID0gZmxvb3IoaiAqIG5zLnopO1xcbiAgdmVjNCB5XyA9IGZsb29yKGogLSA3LjAgKiB4XyApOyAgICAvLyBtb2QoaixOKVxcblxcbiAgdmVjNCB4ID0geF8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCB5ID0geV8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCBoID0gMS4wIC0gYWJzKHgpIC0gYWJzKHkpO1xcblxcbiAgdmVjNCBiMCA9IHZlYzQoIHgueHksIHkueHkgKTtcXG4gIHZlYzQgYjEgPSB2ZWM0KCB4Lnp3LCB5Lnp3ICk7XFxuXFxuICAvL3ZlYzQgczAgPSB2ZWM0KGxlc3NUaGFuKGIwLDAuMCkpKjIuMCAtIDEuMDtcXG4gIC8vdmVjNCBzMSA9IHZlYzQobGVzc1RoYW4oYjEsMC4wKSkqMi4wIC0gMS4wO1xcbiAgdmVjNCBzMCA9IGZsb29yKGIwKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHMxID0gZmxvb3IoYjEpKjIuMCArIDEuMDtcXG4gIHZlYzQgc2ggPSAtc3RlcChoLCB2ZWM0KDAuMCkpO1xcblxcbiAgdmVjNCBhMCA9IGIwLnh6eXcgKyBzMC54enl3KnNoLnh4eXkgO1xcbiAgdmVjNCBhMV8yXzYgPSBiMS54enl3ICsgczEueHp5dypzaC56end3IDtcXG5cXG4gIHZlYzMgcDBfMl83ID0gdmVjMyhhMC54eSxoLngpO1xcbiAgdmVjMyBwMSA9IHZlYzMoYTAuencsaC55KTtcXG4gIHZlYzMgcDIgPSB2ZWMzKGExXzJfNi54eSxoLnopO1xcbiAgdmVjMyBwMyA9IHZlYzMoYTFfMl82Lnp3LGgudyk7XFxuXFxuLy9Ob3JtYWxpc2UgZ3JhZGllbnRzXFxuICB2ZWM0IG5vcm0gPSB0YXlsb3JJbnZTcXJ0XzJfMih2ZWM0KGRvdChwMF8yXzcscDBfMl83KSwgZG90KHAxLHAxKSwgZG90KHAyLCBwMiksIGRvdChwMyxwMykpKTtcXG4gIHAwXzJfNyAqPSBub3JtLng7XFxuICBwMSAqPSBub3JtLnk7XFxuICBwMiAqPSBub3JtLno7XFxuICBwMyAqPSBub3JtLnc7XFxuXFxuLy8gTWl4IGZpbmFsIG5vaXNlIHZhbHVlXFxuICB2ZWM0IG0gPSBtYXgoMC42IC0gdmVjNChkb3QoeDAseDApLCBkb3QoeDEseDEpLCBkb3QoeDIseDIpLCBkb3QoeDMseDMpKSwgMC4wKTtcXG4gIG0gPSBtICogbTtcXG4gIHJldHVybiA0Mi4wICogZG90KCBtKm0sIHZlYzQoIGRvdChwMF8yXzcseDApLCBkb3QocDEseDEpLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90KHAyLHgyKSwgZG90KHAzLHgzKSApICk7XFxuICB9XFxuXFxuXFxuXFxudmVjMyBoc3YycmdiXzFfOCh2ZWMzIGMpe1xcclxcbiAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xcclxcbiAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xcclxcbiAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XFxyXFxufVxcclxcblxcblxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGZsb2F0IHVwZGF0ZVRpbWUgPSB0aW1lIC8gMTAwMC4wO1xcclxcbiAgZmxvYXQgbm9pc2UgPSBzbm9pc2VfMl8zKHZlYzMocG9zaXRpb24gLyA0MDAuMSArIHVwZGF0ZVRpbWUgKiA1LjApKTtcXHJcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24gKiAobm9pc2UgKiBwb3coZGlzdG9ydCwgMi4wKSArIHJhZGl1cyksIDEuMCk7XFxyXFxuICB2ZWMzIGxpZ2h0ID0gdmVjMygwLjgpO1xcclxcbiAgbGlnaHQgKz0gZG90KC1oZW1pc3BoZXJlTGlnaHREaXJlY3Rpb24sIG5vcm1hbCkgKiBoZW1pc3BoZXJlTGlnaHRTa3lDb2xvciAqIDAuMjU7XFxyXFxuXFxyXFxuICB2Q29sb3IgPSBoc3YycmdiXzFfOCh2ZWMzKG5vaXNlICogZGlzdG9ydCAqIDAuMyArIHVwZGF0ZVRpbWUsIDAuMiwgMS4wKSkgKiBsaWdodDtcXHJcXG5cXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZDb2xvciwgMS4wKTtcXHJcXG59XFxyXFxuXCI7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKCkge307XHJcbiAgdmFyIHNwaGVyZSA9IG51bGw7XHJcbiAgdmFyIGJnID0gbnVsbDtcclxuICB2YXIgbGlnaHQgPSBuZXcgSGVtaUxpZ2h0KCk7XHJcbiAgdmFyIGZvcmNlID0gbmV3IEZvcmNlMigpO1xyXG5cclxuICB2YXIgY3JlYXRlU3BoZXJlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIGdlb21ldHJ5LmZyb21HZW9tZXRyeShuZXcgVEhSRUUuT2N0YWhlZHJvbkdlb21ldHJ5KDIwMCwgNSkpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IFRIUkVFLlVuaWZvcm1zVXRpbHMubWVyZ2UoW1xyXG4gICAgICAgIFRIUkVFLlVuaWZvcm1zTGliWydsaWdodHMnXSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0aW1lOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgcmFkaXVzOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgICAgdmFsdWU6IDEuMFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGRpc3RvcnQ6IHtcclxuICAgICAgICAgICAgdHlwZTogJ2YnLFxyXG4gICAgICAgICAgICB2YWx1ZTogMC40XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICBdKSxcclxuICAgICAgdmVydGV4U2hhZGVyOiB2cyxcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGZzLFxyXG4gICAgICBsaWdodHM6IHRydWUsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVCYWNrZ3JvdW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMTgwMCk7XHJcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgc3BoZXJlID0gY3JlYXRlU3BoZXJlKCk7XHJcbiAgICAgIHNjZW5lLmFkZChzcGhlcmUpO1xyXG4gICAgICBiZyA9IGNyZWF0ZUJhY2tncm91bmQoKTtcclxuICAgICAgc2NlbmUuYWRkKGJnKTtcclxuICAgICAgbGlnaHQuaW5pdCgweGZmZmZmZiwgMHg2NjY2NjYpO1xyXG4gICAgICBzY2VuZS5hZGQobGlnaHQub2JqKTtcclxuICAgICAgY2FtZXJhLmFuY2hvci5zZXQoMTgwMCwgMTgwMCwgMCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMSwgMCk7XHJcbiAgICAgIGZvcmNlLnZlbG9jaXR5LnNldCgxLCAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIHNwaGVyZS5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHNwaGVyZS5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShzcGhlcmUpO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGxpZ2h0Lm9iaik7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGZvcmNlLmFwcGx5SG9vaygwLCAwLjA2KTtcclxuICAgICAgZm9yY2UuYXBwbHlEcmFnKDAuMTIpO1xyXG4gICAgICBmb3JjZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBmb3JjZS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBzcGhlcmUubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSArPSAxO1xyXG4gICAgICBzcGhlcmUubWF0ZXJpYWwudW5pZm9ybXMucmFkaXVzLnZhbHVlID0gZm9yY2UucG9zaXRpb24ueDtcclxuICAgICAgc3BoZXJlLm1hdGVyaWFsLnVuaWZvcm1zLmRpc3RvcnQudmFsdWUgPSBmb3JjZS5wb3NpdGlvbi54IC8gMiAtIDAuMTtcclxuICAgICAgY2FtZXJhLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9vay5hcHBseUhvb2soMCwgMC4yKTtcclxuICAgICAgY2FtZXJhLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5vYmoubG9va0F0KGNhbWVyYS5sb29rLnBvc2l0aW9uKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgaWYgKGZvcmNlLmFuY2hvci54IDwgMykge1xyXG4gICAgICAgIGZvcmNlLmFuY2hvci54ICs9IDAuODtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3JjZS5hbmNob3IueCA9IDEuMDtcclxuICAgICAgfVxyXG4gICAgICBpc190b3VjaGVkID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbW92ZXInKTtcclxudmFyIFBvaW50cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRzLmpzJyk7XHJcbnZhciBMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRMaWdodCcpO1xyXG5cclxudmFyIHZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGN1c3RvbUNvbG9yO1xcclxcbmF0dHJpYnV0ZSBmbG9hdCB2ZXJ0ZXhPcGFjaXR5O1xcclxcbmF0dHJpYnV0ZSBmbG9hdCBzaXplO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2Q29sb3IgPSBjdXN0b21Db2xvcjtcXHJcXG4gIGZPcGFjaXR5ID0gdmVydGV4T3BhY2l0eTtcXHJcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxuICBnbF9Qb2ludFNpemUgPSBzaXplICogKDMwMC4wIC8gbGVuZ3RoKG12UG9zaXRpb24ueHl6KSk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gdmVjMyBjb2xvcjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yICogdkNvbG9yLCBmT3BhY2l0eSk7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSBnbF9GcmFnQ29sb3IgKiB0ZXh0dXJlMkQodGV4dHVyZSwgZ2xfUG9pbnRDb29yZCk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbigpIHt9O1xyXG4gIHZhciBtb3ZlcnNfbnVtID0gMTAwMDA7XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIGxpZ2h0ID0gbmV3IExpZ2h0KCk7XHJcbiAgdmFyIGJnID0gbnVsbDtcclxuICB2YXIgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIGdyYXZpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLjEsIDApO1xyXG4gIHZhciBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gIHZhciBpc19kcmFnZWQgPSBmYWxzZTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZlKSB7XHJcbiAgICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoZ3Jhdml0eSk7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMDEpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgbW92ZXIudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgICBtb3Zlci5wb3NpdGlvbi5zdWIocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgICBpZiAobW92ZXIudGltZSA+IDUwKSB7XHJcbiAgICAgICAgICBtb3Zlci5zaXplIC09IDAuNztcclxuICAgICAgICAgIG1vdmVyLmEgLT0gMC4wMDk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtb3Zlci5hIDw9IDApIHtcclxuICAgICAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xyXG4gICAgICAgICAgbW92ZXIudGltZSA9IDA7XHJcbiAgICAgICAgICBtb3Zlci5hID0gMC4wO1xyXG4gICAgICAgICAgbW92ZXIuaW5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnBvc2l0aW9uLnggLSBwb2ludHMucG9zaXRpb24ueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci5wb3NpdGlvbi55IC0gcG9pbnRzLnBvc2l0aW9uLng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIucG9zaXRpb24ueiAtIHBvaW50cy5wb3NpdGlvbi54O1xyXG4gICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICB9XHJcbiAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGFjdGl2YXRlTW92ZXIgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gMTApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZDEgPSBVdGlsLmdldFJhZGlhbihNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgwLCAyNTYpKSAvIE1hdGgubG9nKDI1NikgKiAyNjApO1xyXG4gICAgICAgIHZhciByYWQyID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgICAgdmFyIHJhbmdlID0gKDEtIE1hdGgubG9nKFV0aWwuZ2V0UmFuZG9tSW50KDMyLCAyNTYpKSAvIE1hdGgubG9nKDI1NikpICogMTI7XHJcbiAgICAgICAgdmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICAgICAgdmFyIGZvcmNlID0gVXRpbC5nZXRTcGhlcmljYWwocmFkMSwgcmFkMiwgcmFuZ2UpO1xyXG4gICAgICAgIHZlY3Rvci5hZGQocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgICBtb3Zlci5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIG1vdmVyLmluaXQodmVjdG9yKTtcclxuICAgICAgICBtb3Zlci5hcHBseUZvcmNlKGZvcmNlKTtcclxuICAgICAgICBtb3Zlci5hID0gMC4yO1xyXG4gICAgICAgIG1vdmVyLnNpemUgPSBNYXRoLnBvdygxMiAtIHJhbmdlLCAyKSAqIFV0aWwuZ2V0UmFuZG9tSW50KDEsIDI0KSAvIDEwO1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgaWYgKGNvdW50ID49IDYpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHVwZGF0ZVBvaW50cyA9ICBmdW5jdGlvbigpIHtcclxuICAgIHBvaW50cy51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgcG9pbnRzLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICBsaWdodC5vYmoucG9zaXRpb24uY29weShwb2ludHMudmVsb2NpdHkpO1xyXG4gIH07XHJcblxyXG4gIHZhciBtb3ZlUG9pbnRzID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgICB2YXIgeSA9IHZlY3Rvci55ICogZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgLyAzO1xyXG4gICAgdmFyIHogPSB2ZWN0b3IueCAqIGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggLyAtMztcclxuICAgIHBvaW50cy5hbmNob3IueSA9IHk7XHJcbiAgICBwb2ludHMuYW5jaG9yLnogPSB6O1xyXG4gICAgbGlnaHQuYW5jaG9yLnkgPSB5O1xyXG4gICAgbGlnaHQuYW5jaG9yLnogPSB6O1xyXG4gIH1cclxuXHJcbiAgdmFyIGNyZWF0ZVRleHR1cmUgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB2YXIgZ3JhZCA9IG51bGw7XHJcbiAgICB2YXIgdGV4dHVyZSA9IG51bGw7XHJcblxyXG4gICAgY2FudmFzLndpZHRoID0gMjAwO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IDIwMDtcclxuICAgIGdyYWQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoMTAwLCAxMDAsIDIwLCAxMDAsIDEwMCwgMTAwKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuMiwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMSknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuNSwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMS4wLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwKScpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgICBjdHguYXJjKDEwMCwgMTAwLCAxMDAsIDAsIE1hdGguUEkgLyAxODAsIHRydWUpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICAgIFxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcbiAgXHJcbiAgdmFyIGNyZWF0ZUJhY2tncm91bmQgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuT2N0YWhlZHJvbkdlb21ldHJ5KDE1MDAsIDMpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgY29sb3I6IDB4ZmZmZmZmLFxyXG4gICAgICBzaGFkaW5nOiBUSFJFRS5GbGF0U2hhZGluZyxcclxuICAgICAgc2lkZTogVEhSRUUuQmFja1NpZGVcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnNfbnVtOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgICB2YXIgaCA9IFV0aWwuZ2V0UmFuZG9tSW50KDAsIDQ1KTtcclxuICAgICAgICB2YXIgcyA9IFV0aWwuZ2V0UmFuZG9tSW50KDYwLCA5MCk7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIGggKyAnLCAnICsgcyArICclLCA1MCUpJyk7XHJcblxyXG4gICAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoVXRpbC5nZXRSYW5kb21JbnQoLTEwMCwgMTAwKSwgMCwgMCkpO1xyXG4gICAgICAgIG1vdmVycy5wdXNoKG1vdmVyKTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnBvc2l0aW9uLng7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci5wb3NpdGlvbi55O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIucG9zaXRpb24uejtcclxuICAgICAgICBjb2xvci50b0FycmF5KGNvbG9ycywgaSAqIDMpO1xyXG4gICAgICAgIG9wYWNpdGllc1tpXSA9IG1vdmVyLmE7XHJcbiAgICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgICB9XHJcbiAgICAgIHBvaW50cy5pbml0KHtcclxuICAgICAgICBzY2VuZTogc2NlbmUsXHJcbiAgICAgICAgdnM6IHZzLFxyXG4gICAgICAgIGZzOiBmcyxcclxuICAgICAgICBwb3NpdGlvbnM6IHBvc2l0aW9ucyxcclxuICAgICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgICBvcGFjaXRpZXM6IG9wYWNpdGllcyxcclxuICAgICAgICBzaXplczogc2l6ZXMsXHJcbiAgICAgICAgdGV4dHVyZTogY3JlYXRlVGV4dHVyZSgpLFxyXG4gICAgICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXHJcbiAgICAgIH0pO1xyXG4gICAgICBsaWdodC5pbml0KDB4ZmY2NjAwLCAxODAwKTtcclxuICAgICAgc2NlbmUuYWRkKGxpZ2h0Lm9iaik7XHJcbiAgICAgIGJnID0gY3JlYXRlQmFja2dyb3VuZCgpO1xyXG4gICAgICBzY2VuZS5hZGQoYmcpO1xyXG4gICAgICBjYW1lcmEucmFkMV9iYXNlID0gVXRpbC5nZXRSYWRpYW4oMjUpO1xyXG4gICAgICBjYW1lcmEucmFkMSA9IGNhbWVyYS5yYWQxX2Jhc2U7XHJcbiAgICAgIGNhbWVyYS5yYWQyID0gVXRpbC5nZXRSYWRpYW4oMCk7XHJcbiAgICAgIGNhbWVyYS5zZXRQb3NpdGlvblNwaGVyaWNhbCgpO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBzY2VuZS5yZW1vdmUobGlnaHQub2JqKTtcclxuICAgICAgYmcuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBiZy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShiZyk7XHJcbiAgICAgIG1vdmVycyA9IFtdO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBwb2ludHMuYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBwb2ludHMuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIHBvaW50cy51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBwb2ludHMudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgbGlnaHQuYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBsaWdodC5hcHBseURyYWcoMC4yKTtcclxuICAgICAgbGlnaHQudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgbGlnaHQudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgYWN0aXZhdGVNb3ZlcigpO1xyXG4gICAgICB1cGRhdGVNb3ZlcigpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlIb29rKDAsIDAuMDA0KTtcclxuICAgICAgY2FtZXJhLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rQXRDZW50ZXIoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgbW92ZVBvaW50cyh2ZWN0b3IpO1xyXG4gICAgICBpc19kcmFnZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIGlmIChpc19kcmFnZWQpIHtcclxuICAgICAgICBtb3ZlUG9pbnRzKHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgaXNfZHJhZ2VkID0gZmFsc2U7XHJcbiAgICAgIHBvaW50cy5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICBsaWdodC5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEhlbWlMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvaGVtaUxpZ2h0Jyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbigpIHt9O1xyXG4gIHZhciBpbWFnZXMgPSBbXTtcclxuICB2YXIgaW1hZ2VzX251bSA9IDMwMDtcclxuICB2YXIgaGVtaV9saWdodCA9IG5ldyBIZW1pTGlnaHQoKTtcclxuICB2YXIgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xyXG4gIHZhciBwaWNrZWRfaWQgPSAtMTtcclxuICB2YXIgcGlja2VkX2luZGV4ID0gLTE7XHJcbiAgdmFyIGlzX2NsaWNrZWQgPSBmYWxzZTtcclxuICB2YXIgaXNfZHJhZ2VkID0gZmFsc2U7XHJcbiAgdmFyIGdldF9uZWFyID0gZmFsc2U7IFxyXG5cclxuICB2YXIgSW1hZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucmFkID0gMDtcclxuICAgIHRoaXMub2JqID0gbnVsbDtcclxuICAgIHRoaXMuaXNfZW50ZXJlZCA9IGZhbHNlO1xyXG4gICAgRm9yY2UzLmNhbGwodGhpcyk7XHJcbiAgfTtcclxuICB2YXIgaW1hZ2VfZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgxMDAsIDEwMCk7XHJcbiAgSW1hZ2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBJbWFnZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJbWFnZTtcclxuICBJbWFnZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdmFyIGltYWdlX21hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcclxuICAgICAgbWFwOiBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpLmxvYWQoJ2ltZy9nYWxsZXJ5L2ltYWdlMCcgKyBVdGlsLmdldFJhbmRvbUludCgxLCA5KSArICcuanBnJylcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLk1lc2goaW1hZ2VfZ2VvbWV0cnksIGltYWdlX21hdGVyaWFsKTtcclxuICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLm9iai5wb3NpdGlvbjtcclxuICAgIHRoaXMudmVsb2NpdHkgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gdmVjdG9yLmNsb25lKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbi5zZXQoMCwgMCwgMCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGluaXRJbWFnZXMgPSBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZXNfbnVtOyBpKyspIHtcclxuICAgICAgdmFyIGltYWdlID0gbnVsbDtcclxuICAgICAgdmFyIHJhZCA9IFV0aWwuZ2V0UmFkaWFuKGkgJSA0NSAqIDggKyAxODApO1xyXG4gICAgICB2YXIgcmFkaXVzID0gMTAwMDtcclxuICAgICAgdmFyIHggPSBNYXRoLmNvcyhyYWQpICogcmFkaXVzO1xyXG4gICAgICB2YXIgeSA9IGkgKiA1IC0gaW1hZ2VzX251bSAqIDIuNTtcclxuICAgICAgdmFyIHogPSBNYXRoLnNpbihyYWQpICogcmFkaXVzO1xyXG4gICAgICB2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoeCwgeSwgeik7XHJcbiAgICAgIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgIGltYWdlLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoKSk7XHJcbiAgICAgIGltYWdlLnJhZCA9IHJhZDtcclxuICAgICAgaW1hZ2UuYW5jaG9yLmNvcHkodmVjdG9yKTtcclxuICAgICAgc2NlbmUuYWRkKGltYWdlLm9iaik7XHJcbiAgICAgIGltYWdlcy5wdXNoKGltYWdlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgcGlja0ltYWdlID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICBpZiAoZ2V0X25lYXIpIHJldHVybjtcclxuICAgIHZhciBpbnRlcnNlY3RzID0gbnVsbDtcclxuICAgIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKHZlY3RvciwgY2FtZXJhLm9iaik7XHJcbiAgICBpbnRlcnNlY3RzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoc2NlbmUuY2hpbGRyZW4pO1xyXG4gICAgaWYgKGludGVyc2VjdHMubGVuZ3RoID4gMCAmJiBpc19kcmFnZWQgPT0gZmFsc2UpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdpcy1wb2ludGVkJyk7XHJcbiAgICAgIHBpY2tlZF9pZCA9IGludGVyc2VjdHNbMF0ub2JqZWN0LmlkO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVzZXRQaWNrSW1hZ2UoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgZ2V0TmVhckltYWdlID0gZnVuY3Rpb24oY2FtZXJhLCBpbWFnZSkge1xyXG4gICAgZ2V0X25lYXIgPSB0cnVlO1xyXG4gICAgY2FtZXJhLmFuY2hvci5zZXQoTWF0aC5jb3MoaW1hZ2UucmFkKSAqIDc4MCwgaW1hZ2UucG9zaXRpb24ueSwgTWF0aC5zaW4oaW1hZ2UucmFkKSAqIDc4MCk7XHJcbiAgICBjYW1lcmEubG9vay5hbmNob3IuY29weShpbWFnZS5wb3NpdGlvbik7XHJcbiAgICByZXNldFBpY2tJbWFnZSgpO1xyXG4gIH07XHJcblxyXG4gIHZhciByZXNldFBpY2tJbWFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb2ludGVkJyk7XHJcbiAgICBwaWNrZWRfaWQgPSAtMTtcclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBpbml0SW1hZ2VzKHNjZW5lKTtcclxuICAgICAgaGVtaV9saWdodC5pbml0KDB4ZmZmZmZmLCAweGZmZmZmZik7XHJcbiAgICAgIHNjZW5lLmFkZChoZW1pX2xpZ2h0Lm9iaik7XHJcbiAgICAgIGNhbWVyYS5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICBjYW1lcmEucm90YXRlX3JhZDEgPSBVdGlsLmdldFJhZGlhbigtMzUpO1xyXG4gICAgICBjYW1lcmEucm90YXRlX3JhZDFfYmFzZSA9IGNhbWVyYS5yb3RhdGVfcmFkMTtcclxuICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQyID0gVXRpbC5nZXRSYWRpYW4oMTgwKTtcclxuICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQyX2Jhc2UgPSBjYW1lcmEucm90YXRlX3JhZDI7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBpbWFnZV9nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgc2NlbmUucmVtb3ZlKGltYWdlc1tpXS5vYmopO1xyXG4gICAgICB9O1xyXG4gICAgICBzY2VuZS5yZW1vdmUoaGVtaV9saWdodC5vYmopO1xyXG4gICAgICBpbWFnZXMgPSBbXTtcclxuICAgICAgZ2V0X25lYXIgPSBmYWxzZTtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb2ludGVkJyk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VzX251bTsgaSsrKSB7XHJcbiAgICAgICAgaW1hZ2VzW2ldLmFwcGx5SG9vaygwLCAwLjE0KTtcclxuICAgICAgICBpbWFnZXNbaV0uYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgICAgaW1hZ2VzW2ldLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgaW1hZ2VzW2ldLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgaW1hZ2VzW2ldLm9iai5sb29rQXQoe1xyXG4gICAgICAgICAgeDogMCxcclxuICAgICAgICAgIHk6IGltYWdlc1tpXS5wb3NpdGlvbi55LFxyXG4gICAgICAgICAgejogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChpbWFnZXNbaV0ub2JqLmlkID09IHBpY2tlZF9pZCAmJiBpc19kcmFnZWQgPT0gZmFsc2UgJiYgZ2V0X25lYXIgPT0gZmFsc2UpIHtcclxuICAgICAgICAgIGlmIChpc19jbGlja2VkID09IHRydWUpIHtcclxuICAgICAgICAgICAgcGlja2VkX2luZGV4ID0gaTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGltYWdlc1tpXS5vYmoubWF0ZXJpYWwuY29sb3Iuc2V0KDB4YWFhYWFhKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaW1hZ2VzW2ldLm9iai5tYXRlcmlhbC5jb2xvci5zZXQoMHhmZmZmZmYpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjYW1lcmEuYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgaWYgKGdldF9uZWFyID09PSBmYWxzZSkge1xyXG4gICAgICAgIGNhbWVyYS5sb29rLmFuY2hvci5jb3B5KFV0aWwuZ2V0U3BoZXJpY2FsKGNhbWVyYS5yb3RhdGVfcmFkMSwgY2FtZXJhLnJvdGF0ZV9yYWQyLCAxMDAwKSk7XHJcbiAgICAgIH1cclxuICAgICAgY2FtZXJhLmxvb2suYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBjYW1lcmEubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLmxvb2sudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLm9iai5sb29rQXQoY2FtZXJhLmxvb2sucG9zaXRpb24pO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBwaWNrSW1hZ2Uoc2NlbmUsIGNhbWVyYSwgdmVjdG9yKTtcclxuICAgICAgaXNfY2xpY2tlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgcGlja0ltYWdlKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxuICAgICAgaWYgKGlzX2NsaWNrZWQgJiYgdmVjdG9yX21vdXNlX2Rvd24uY2xvbmUoKS5zdWIodmVjdG9yX21vdXNlX21vdmUpLmxlbmd0aCgpID4gMC4wMSkge1xyXG4gICAgICAgIGlzX2NsaWNrZWQgPSBmYWxzZTtcclxuICAgICAgICBpc19kcmFnZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc19kcmFnZWQgPT0gdHJ1ZSAmJiBnZXRfbmVhciA9PSBmYWxzZSkge1xyXG4gICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMSA9IGNhbWVyYS5yb3RhdGVfcmFkMV9iYXNlICsgVXRpbC5nZXRSYWRpYW4oKHZlY3Rvcl9tb3VzZV9kb3duLnkgLSB2ZWN0b3JfbW91c2VfbW92ZS55KSAqIDUwKTtcclxuICAgICAgICBjYW1lcmEucm90YXRlX3JhZDIgPSBjYW1lcmEucm90YXRlX3JhZDJfYmFzZSArIFV0aWwuZ2V0UmFkaWFuKCh2ZWN0b3JfbW91c2VfZG93bi54IC0gdmVjdG9yX21vdXNlX21vdmUueCkgKiA1MCk7XHJcbiAgICAgICAgaWYgKGNhbWVyYS5yb3RhdGVfcmFkMSA8IFV0aWwuZ2V0UmFkaWFuKC01MCkpIHtcclxuICAgICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKC01MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjYW1lcmEucm90YXRlX3JhZDEgPiBVdGlsLmdldFJhZGlhbig1MCkpIHtcclxuICAgICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIHJlc2V0UGlja0ltYWdlKCk7XHJcbiAgICAgIGlmIChnZXRfbmVhcikge1xyXG4gICAgICAgIGNhbWVyYS5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICAgIHBpY2tlZF9pbmRleCA9IC0xO1xyXG4gICAgICAgIGdldF9uZWFyID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSBpZiAoaXNfY2xpY2tlZCAmJiBwaWNrZWRfaW5kZXggPiAtMSkge1xyXG4gICAgICAgIGdldE5lYXJJbWFnZShjYW1lcmEsIGltYWdlc1twaWNrZWRfaW5kZXhdKTtcclxuICAgICAgfSBlbHNlIGlmIChpc19kcmFnZWQpIHtcclxuICAgICAgICBjYW1lcmEucm90YXRlX3JhZDFfYmFzZSA9IGNhbWVyYS5yb3RhdGVfcmFkMTtcclxuICAgICAgICBjYW1lcmEucm90YXRlX3JhZDJfYmFzZSA9IGNhbWVyYS5yb3RhdGVfcmFkMjtcclxuICAgICAgfVxyXG4gICAgICBpc19jbGlja2VkID0gZmFsc2U7XHJcbiAgICAgIGlzX2RyYWdlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcbnZhciBQb2ludHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50cy5qcycpO1xyXG52YXIgTGlnaHQgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50TGlnaHQnKTtcclxuXHJcbnZhciB2cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyBjdXN0b21Db2xvcjtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgdmVydGV4T3BhY2l0eTtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgc2l6ZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdkNvbG9yID0gY3VzdG9tQ29sb3I7XFxyXFxuICBmT3BhY2l0eSA9IHZlcnRleE9wYWNpdHk7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbiAgZ2xfUG9pbnRTaXplID0gc2l6ZSAqICgzMDAuMCAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpO1xcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciBmcyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIHZlYzMgY29sb3I7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciAqIHZDb2xvciwgZk9wYWNpdHkpO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gZ2xfRnJhZ0NvbG9yICogdGV4dHVyZTJEKHRleHR1cmUsIGdsX1BvaW50Q29vcmQpO1xcclxcbn1cXHJcXG5cIjtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oKSB7fTtcclxuICB2YXIgbW92ZXJzX251bSA9IDIwMDAwO1xyXG4gIHZhciBtb3ZlcnMgPSBbXTtcclxuICB2YXIgcG9pbnRzID0gbmV3IFBvaW50cygpO1xyXG4gIHZhciBsaWdodCA9IG5ldyBMaWdodCgpO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIHNpemVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgZ3Jhdml0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKDEuNSwgMCwgMCk7XHJcbiAgdmFyIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIHtcclxuICAgICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlGb3JjZShncmF2aXR5KTtcclxuICAgICAgICBtb3Zlci5hcHBseURyYWcoMC4xKTtcclxuICAgICAgICBtb3Zlci51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgaWYgKG1vdmVyLmEgPCAwLjgpIHtcclxuICAgICAgICAgIG1vdmVyLmEgKz0gMC4wMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vdmVyLnBvc2l0aW9uLnggPiAxMDAwKSB7XHJcbiAgICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgIG1vdmVyLnRpbWUgPSAwO1xyXG4gICAgICAgICAgbW92ZXIuYSA9IDAuMDtcclxuICAgICAgICAgIG1vdmVyLmluYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci5wb3NpdGlvbi54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnBvc2l0aW9uLnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIucG9zaXRpb24uejtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY3RpdmF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gZ3Jhdml0eS54ICogMTYpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZCA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDEyMCkgKiAzKTtcclxuICAgICAgICB2YXIgcmFuZ2UgPSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgyLCAxMjgpKSAvIE1hdGgubG9nKDEyOCkgKiAxNjAgKyA2MDtcclxuICAgICAgICB2YXIgeSA9IE1hdGguc2luKHJhZCkgKiByYW5nZTtcclxuICAgICAgICB2YXIgeiA9IE1hdGguY29zKHJhZCkgKiByYW5nZTtcclxuICAgICAgICB2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoLTEwMDAsIHksIHopO1xyXG4gICAgICAgIHZlY3Rvci5hZGQocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgICBtb3Zlci5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIG1vdmVyLmluaXQodmVjdG9yKTtcclxuICAgICAgICBtb3Zlci5hID0gMDtcclxuICAgICAgICBtb3Zlci5zaXplID0gVXRpbC5nZXRSYW5kb21JbnQoNSwgNjApO1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgaWYgKGNvdW50ID49IE1hdGgucG93KGdyYXZpdHkueCAqIDMsIGdyYXZpdHkueCAqIDAuNCkpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHVwZGF0ZVBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcG9pbnRzLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICBwb2ludHMudXBkYXRlUG9zaXRpb24oKTtcclxuICAgIGxpZ2h0Lm9iai5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVRleHR1cmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIHZhciBncmFkID0gbnVsbDtcclxuICAgIHZhciB0ZXh0dXJlID0gbnVsbDtcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSAyMDA7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gMjAwO1xyXG4gICAgZ3JhZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudCgxMDAsIDEwMCwgMjAsIDEwMCwgMTAwLCAxMDApO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC4yLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC41LCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLjAsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDApJyk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcclxuICAgIGN0eC5hcmMoMTAwLCAxMDAsIDEwMCwgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgXHJcbiAgICB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzKTtcclxuICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRleHR1cmU7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNoYW5nZUdyYXZpdHkgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChpc190b3VjaGVkKSB7XHJcbiAgICAgIGlmIChncmF2aXR5LnggPCA2KSBncmF2aXR5LnggKz0gMC4wMjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChncmF2aXR5LnggPiAxLjUpIGdyYXZpdHkueCAtPSAwLjE7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnNfbnVtOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgICB2YXIgaCA9IFV0aWwuZ2V0UmFuZG9tSW50KDYwLCAyMTApO1xyXG4gICAgICAgIHZhciBzID0gVXRpbC5nZXRSYW5kb21JbnQoMzAsIDkwKTtcclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgaCArICcsICcgKyBzICsgJyUsIDUwJSknKTtcclxuXHJcbiAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhVdGlsLmdldFJhbmRvbUludCgtMTAwLCAxMDApLCAwLCAwKSk7XHJcbiAgICAgICAgbW92ZXJzLnB1c2gobW92ZXIpO1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIucG9zaXRpb24ueDtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci5wb3NpdGlvbi56O1xyXG4gICAgICAgIGNvbG9yLnRvQXJyYXkoY29sb3JzLCBpICogMyk7XHJcbiAgICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICAgIH1cclxuICAgICAgcG9pbnRzLmluaXQoe1xyXG4gICAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgICB2czogdnMsXHJcbiAgICAgICAgZnM6IGZzLFxyXG4gICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICAgIGNvbG9yczogY29sb3JzLFxyXG4gICAgICAgIG9wYWNpdGllczogb3BhY2l0aWVzLFxyXG4gICAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgICB0ZXh0dXJlOiBjcmVhdGVUZXh0dXJlKCksXHJcbiAgICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcclxuICAgICAgfSk7XHJcbiAgICAgIGxpZ2h0LmluaXQoKTtcclxuICAgICAgc2NlbmUuYWRkKGxpZ2h0Lm9iaik7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IgPSBuZXcgVEhSRUUuVmVjdG9yMyg4MDAsIDAsIDApO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBzY2VuZS5yZW1vdmUobGlnaHQub2JqKTtcclxuICAgICAgbW92ZXJzID0gW107XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGNoYW5nZUdyYXZpdHkoKTtcclxuICAgICAgYWN0aXZhdGVNb3ZlcigpO1xyXG4gICAgICB1cGRhdGVNb3ZlcigpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlIb29rKDAsIDAuMDA4KTtcclxuICAgICAgY2FtZXJhLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rQXRDZW50ZXIoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgaXNfdG91Y2hlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgY2FtZXJhLmFuY2hvci56ID0gdmVjdG9yX21vdXNlX21vdmUueCAqIDEyMDtcclxuICAgICAgY2FtZXJhLmFuY2hvci55ID0gdmVjdG9yX21vdXNlX21vdmUueSAqIC0xMjA7XHJcbiAgICAgIC8vY2FtZXJhLmxvb2tBdENlbnRlcigpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IueiA9IDA7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IueSA9IDA7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbW92ZXInKTtcclxuXHJcbnZhciBQb2ludHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50cy5qcycpO1xyXG52YXIgdnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgY3VzdG9tQ29sb3I7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHZlcnRleE9wYWNpdHk7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHNpemU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZDb2xvciA9IGN1c3RvbUNvbG9yO1xcclxcbiAgZk9wYWNpdHkgPSB2ZXJ0ZXhPcGFjaXR5O1xcclxcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG4gIGdsX1BvaW50U2l6ZSA9IHNpemUgKiAoMzAwLjAgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXHJcXG59XFxyXFxuXCI7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKCkge307XHJcbiAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgdmFyIGltYWdlX3ZlcnRpY2VzID0gW107XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBudWxsO1xyXG4gIHZhciBjb2xvcnMgPSBudWxsO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBudWxsO1xyXG4gIHZhciBzaXplcyA9IG51bGw7XHJcbiAgdmFyIGxlbmd0aF9zaWRlID0gNDAwO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIGNyZWF0ZWRfcG9pbnRzID0gZmFsc2U7XHJcblxyXG4gIHZhciBsb2FkSW1hZ2UgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgaW1hZ2Uuc3JjID0gJy4vaW1nL2ltYWdlX2RhdGEvZWxlcGhhbnQucG5nJztcclxuICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICB2YXIgZ2V0SW1hZ2VEYXRhID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjYW52YXMud2lkdGggPSBsZW5ndGhfc2lkZTtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBsZW5ndGhfc2lkZTtcclxuICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gICAgdmFyIGltYWdlX2RhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGxlbmd0aF9zaWRlLCBsZW5ndGhfc2lkZSk7XHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGxlbmd0aF9zaWRlOyB5KyspIHtcclxuICAgICAgaWYgKHkgJSAzID4gMCkgY29udGludWU7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgbGVuZ3RoX3NpZGU7IHgrKykge1xyXG4gICAgICAgIGlmICh4ICUgMyA+IDApIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmKGltYWdlX2RhdGEuZGF0YVsoeCArIHkgKiBsZW5ndGhfc2lkZSkgKiA0XSA+IDApIHtcclxuICAgICAgICAgIGltYWdlX3ZlcnRpY2VzLnB1c2goMCwgKHkgLSBsZW5ndGhfc2lkZSAvIDIpICogLTEsICh4IC0gbGVuZ3RoX3NpZGUvIDIpICogLTEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciBidWlsZFBvaW50cyA9IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KGltYWdlX3ZlcnRpY2VzKTtcclxuICAgIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoKTtcclxuICAgIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoIC8gMyk7XHJcbiAgICBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoIC8gMyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlX3ZlcnRpY2VzLmxlbmd0aCAvIDM7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2hzbCgnICsgKGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMl0gKyBpbWFnZV92ZXJ0aWNlc1tpICogMyArIDFdICsgbGVuZ3RoX3NpZGUpIC8gNVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnLCA2MCUsIDgwJSknKTtcclxuICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhpbWFnZV92ZXJ0aWNlc1tpICogM10sIGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMV0sIGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMl0pKTtcclxuICAgICAgbW92ZXIuaXNfYWN0aXZhdGUgPSB0cnVlO1xyXG4gICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgIGNvbG9yLnRvQXJyYXkoY29sb3JzLCBpICogMyk7XHJcbiAgICAgIG9wYWNpdGllc1tpXSA9IDE7XHJcbiAgICAgIHNpemVzW2ldID0gMTI7XHJcbiAgICB9XHJcbiAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgdnM6IHZzLFxyXG4gICAgICBmczogZnMsXHJcbiAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgdGV4dHVyZTogY3JlYXRlVGV4dHVyZSgpLFxyXG4gICAgICBibGVuZGluZzogVEhSRUUuTm9ybWFsQmxlbmRpbmdcclxuICAgIH0pO1xyXG4gICAgY3JlYXRlZF9wb2ludHMgPSB0cnVlO1xyXG4gIH07XHJcblxyXG4gIHZhciBhcHBseUZvcmNlVG9Qb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgdmFyIHJhZDEgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHJhZDIgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHNjYWxhciA9IFV0aWwuZ2V0UmFuZG9tSW50KDQwLCA4MCk7XHJcbiAgICAgIG1vdmVyLmlzX2FjdGl2YXRlID0gZmFsc2U7XHJcbiAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoVXRpbC5nZXRTcGhlcmljYWwocmFkMSwgcmFkMiwgc2NhbGFyKSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgIGlmIChtb3Zlci5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgPCAxKSB7XHJcbiAgICAgICAgbW92ZXIuaXNfYWN0aXZhdGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmF0ZSkge1xyXG4gICAgICAgIG1vdmVyLmFwcGx5SG9vaygwLCAwLjE4KTtcclxuICAgICAgICBtb3Zlci5hcHBseURyYWcoMC4yNik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMDM1KTtcclxuICAgICAgfVxyXG4gICAgICBtb3Zlci51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBtb3Zlci51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBtb3Zlci5wb3NpdGlvbi5zdWIocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci5wb3NpdGlvbi54IC0gcG9pbnRzLnBvc2l0aW9uLng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIucG9zaXRpb24ueSAtIHBvaW50cy5wb3NpdGlvbi54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnBvc2l0aW9uLnogLSBwb2ludHMucG9zaXRpb24ueDtcclxuICAgICAgbW92ZXIuc2l6ZSA9IE1hdGgubG9nKFV0aWwuZ2V0UmFuZG9tSW50KDEsIDEyOCkpIC8gTWF0aC5sb2coMTI4KSAqIE1hdGguc3FydChkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoKTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVUZXh0dXJlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB2YXIgZ3JhZCA9IG51bGw7XHJcbiAgICB2YXIgdGV4dHVyZSA9IG51bGw7XHJcblxyXG4gICAgY2FudmFzLndpZHRoID0gMjAwO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IDIwMDtcclxuICAgIGdyYWQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoMTAwLCAxMDAsIDIwLCAxMDAsIDEwMCwgMTAwKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuMiwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMSknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuNSwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMS4wLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwKScpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgICBjdHguYXJjKDEwMCwgMTAwLCAxMDAsIDAsIE1hdGguUEkgLyAxODAsIHRydWUpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuXHJcbiAgICB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzKTtcclxuICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRleHR1cmU7XHJcbiAgfTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgbG9hZEltYWdlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdldEltYWdlRGF0YSgpO1xyXG4gICAgICAgIGJ1aWxkUG9pbnRzKHNjZW5lKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGNhbWVyYS5yYW5nZSA9IDE0MDA7XHJcbiAgICAgIGNhbWVyYS5yYWQxX2Jhc2UgPSBVdGlsLmdldFJhZGlhbigwKTtcclxuICAgICAgY2FtZXJhLnJhZDEgPSBjYW1lcmEucmFkMV9iYXNlO1xyXG4gICAgICBjYW1lcmEucmFkMiA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgICBjYW1lcmEuc2V0UG9zaXRpb25TcGhlcmljYWwoKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBpbWFnZV92ZXJ0aWNlcyA9IFtdO1xyXG4gICAgICBtb3ZlcnMgPSBbXTtcclxuICAgICAgY2FtZXJhLnJhbmdlID0gMTAwMDtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgaWYgKGNyZWF0ZWRfcG9pbnRzKSB7XHJcbiAgICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgICAgIH1cclxuICAgICAgY2FtZXJhLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcblxyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBhcHBseUZvcmNlVG9Qb2ludHMoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBjYW1lcmEuYW5jaG9yLnogPSB2ZWN0b3JfbW91c2VfbW92ZS54ICogMTAwMDtcclxuICAgICAgY2FtZXJhLmFuY2hvci55ID0gdmVjdG9yX21vdXNlX21vdmUueSAqIC0xMDAwO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IueiA9IDA7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IueSA9IDA7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iXX0=
