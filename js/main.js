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
  var sketch_id = getParameterByName('sketch_id');
  if (sketch_id == null || sketch_id > sketches.length || sketch_id < 1) sketch_id = sketches.length;
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

},{"./modules/camera":2,"./modules/debounce":3,"./modules/util":9,"./sketches":10}],2:[function(require,module,exports){
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

},{"../modules/force3":4,"../modules/util":9}],3:[function(require,module,exports){
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

},{"../modules/util":9}],5:[function(require,module,exports){
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
  HemiLight.prototype.init = function(hex1, hex2) {
    if (hex1) this.hex1 = hex1;
    if (hex2) this.hex2 = hex2;
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

},{"../modules/force3":4,"../modules/util":9}],6:[function(require,module,exports){
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

},{"../modules/force3":4,"../modules/util":9}],7:[function(require,module,exports){
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

},{"../modules/force3":4,"../modules/util":9}],8:[function(require,module,exports){
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
  };
  return Points;
};

module.exports = exports();

},{"../modules/force3":4,"../modules/util":9}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
module.exports = [
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
    update: '2015.12.12',
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

},{"./sketches/comet":11,"./sketches/fire_ball":12,"./sketches/gallery":13,"./sketches/hyper_space":14,"./sketches/image_data":15}],11:[function(require,module,exports){
var Util = require('../modules/util');
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
  var comet_color_h = 150;
  var planet = null;
  var last_time_activate = Date.now();
  var plus_acceleration = 0;
  var is_touched = false;

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
        vector.add(points.position);
        mover.activate();
        mover.init(vector);
        mover.applyForce(force);
        mover.a = 1;
        mover.size = 25;
        count++;
        if (count >= 5) break;
      }
      last_time_activate = Date.now();
    }
  };

  var rotateComet = function() {
    comet.rotation.x += 0.03 + plus_acceleration / 1000;
    comet.rotation.y += 0.01 + plus_acceleration / 1000;
    comet.rotation.z += 0.01 + plus_acceleration / 1000;
    points.rad1_base += Util.getRadian(0.4);
    points.rad1 = Util.getRadian(Math.sin(points.rad1_base) * 30 + plus_acceleration / 100);
    points.rad2 += Util.getRadian(0.8 + plus_acceleration / 100);
    points.rad3 += 0.01;
    return Util.getSpherical(points.rad1, points.rad2, 400);
  };

  var rotateCometColor = function() {
    var radius = comet_radius * 0.8;
    comet_light1.obj.position.copy(Util.getSpherical(Util.getRadian(0),  Util.getRadian(0), radius).add(points.position));
    comet_light2.obj.position.copy(Util.getSpherical(Util.getRadian(180), Util.getRadian(0), radius).add(points.position));
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
        var h = Util.getRandomInt(comet_color_h - 60, comet_color_h + 60);
        var s = Util.getRandomInt(60, 80);
        var color = new THREE.Color('hsl(' + h + ', ' + s + '%, 70%)');
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
        blending: THREE.NormalBlending
      });
      points.rad1 = 0;
      points.rad1_base = 0;
      points.rad2 = 0;
      points.rad3 = 0;
      hemi_light.init(
        new THREE.Color('hsl(' + (comet_color_h - 60) + ', 50%, 60%)').getHex(),
        new THREE.Color('hsl(' + (comet_color_h + 60) + ', 50%, 60%)').getHex()
      );
      scene.add(hemi_light.obj);
      comet_light1.init(new THREE.Color('hsl(' + (comet_color_h - 60) + ', 60%, 50%)'));
      scene.add(comet_light1.obj);
      comet_light2.init(new THREE.Color('hsl(' + (comet_color_h + 60) + ', 60%, 50%)'));
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
      camera.anchor.copy(
        points.velocity.clone().add(
          points.velocity.clone().sub(points.position)
          .normalize().multiplyScalar(-400)
        )
      );
      camera.anchor.y += points.position.y * 2;
      points.updatePosition();
      comet.position.copy(points.position);
      comet_light1.obj.position.copy(points.velocity);
      comet_light2.obj.position.copy(points.velocity);
      activateMover();
      updateMover();
      camera.applyHook(0, 0.025);
      camera.applyDrag(0.2);
      camera.updateVelocity();
      camera.updatePosition();
      camera.lookAtCenter();
      camera.obj.lookAt(points.position);
      rotateCometColor();
    },
    touchStart: function(scene, camera, vector) {
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

},{"../modules/hemiLight":5,"../modules/mover":6,"../modules/pointLight":7,"../modules/points.js":8,"../modules/util":9}],12:[function(require,module,exports){
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

},{"../modules/mover":6,"../modules/pointLight":7,"../modules/points.js":8,"../modules/util":9}],13:[function(require,module,exports){
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

},{"../modules/force3":4,"../modules/hemiLight":5,"../modules/util":9}],14:[function(require,module,exports){
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

},{"../modules/mover":6,"../modules/pointLight":7,"../modules/points.js":8,"../modules/util":9}],15:[function(require,module,exports){
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
      // mover.applyHook(0, 0.004);
      // mover.applyDrag(0.115);
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
      mover.size = Util.getRandomInt(12, 60)
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

},{"../modules/mover":6,"../modules/points.js":8,"../modules/util":9}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2NhbWVyYS5qcyIsInNyYy9qcy9tb2R1bGVzL2RlYm91bmNlLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UzLmpzIiwic3JjL2pzL21vZHVsZXMvaGVtaUxpZ2h0LmpzIiwic3JjL2pzL21vZHVsZXMvbW92ZXIuanMiLCJzcmMvanMvbW9kdWxlcy9wb2ludExpZ2h0LmpzIiwic3JjL2pzL21vZHVsZXMvcG9pbnRzLmpzIiwic3JjL2pzL21vZHVsZXMvdXRpbC5qcyIsInNyYy9qcy9za2V0Y2hlcy5qcyIsInNyYy9qcy9za2V0Y2hlcy9jb21ldC5qcyIsInNyYy9qcy9za2V0Y2hlcy9maXJlX2JhbGwuanMiLCJzcmMvanMvc2tldGNoZXMvZ2FsbGVyeS5qcyIsInNyYy9qcy9za2V0Y2hlcy9oeXBlcl9zcGFjZS5qcyIsInNyYy9qcy9za2V0Y2hlcy9pbWFnZV9kYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9kZWJvdW5jZScpO1xyXG52YXIgQ2FtZXJhID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NhbWVyYScpO1xyXG5cclxudmFyIGJvZHlfd2lkdGggPSBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoO1xyXG52YXIgYm9keV9oZWlnaHQgPSBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodDtcclxudmFyIHZlY3Rvcl9tb3VzZV9kb3duID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxudmFyIHZlY3Rvcl9tb3VzZV9tb3ZlID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxudmFyIHZlY3Rvcl9tb3VzZV9lbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xyXG5cclxudmFyIGNhbnZhcyA9IG51bGw7XHJcbnZhciByZW5kZXJlciA9IG51bGw7XHJcbnZhciBzY2VuZSA9IG51bGw7XHJcbnZhciBjYW1lcmEgPSBudWxsO1xyXG5cclxudmFyIHJ1bm5pbmcgPSBudWxsO1xyXG52YXIgc2tldGNoZXMgPSByZXF1aXJlKCcuL3NrZXRjaGVzJyk7XHJcblxyXG52YXIgYnRuX3RvZ2dsZV9tZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi1zd2l0Y2gtbWVudScpO1xyXG52YXIgbWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZW51Jyk7XHJcbnZhciBzZWxlY3Rfc2tldGNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlbGVjdC1za2V0Y2gnKTtcclxudmFyIHNrZXRjaF90aXRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5za2V0Y2gtdGl0bGUnKTtcclxudmFyIHNrZXRjaF9kYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNrZXRjaC1kYXRlJyk7XHJcbnZhciBza2V0Y2hfZGVzY3JpcHRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2tldGNoLWRlc2NyaXB0aW9uJyk7XHJcblxyXG52YXIgaW5pdFRocmVlID0gZnVuY3Rpb24oKSB7XHJcbiAgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xyXG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xyXG4gICAgYW50aWFsaWFzOiB0cnVlXHJcbiAgfSk7XHJcbiAgaWYgKCFyZW5kZXJlcikge1xyXG4gICAgYWxlcnQoJ1RocmVlLmpz44Gu5Yid5pyf5YyW44Gr5aSx5pWX44GX44G+44GX44Gf44CCJyk7XHJcbiAgfVxyXG4gIHJlbmRlcmVyLnNldFNpemUoYm9keV93aWR0aCwgYm9keV9oZWlnaHQpO1xyXG4gIGNhbnZhcy5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcclxuICByZW5kZXJlci5zZXRDbGVhckNvbG9yKDB4MTExMTExLCAxLjApO1xyXG5cclxuICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG5cclxuICBjYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XHJcbiAgY2FtZXJhLmluaXQoYm9keV93aWR0aCwgYm9keV9oZWlnaHQpO1xyXG59O1xyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgc2tldGNoX2lkID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdza2V0Y2hfaWQnKTtcclxuICBpZiAoc2tldGNoX2lkID09IG51bGwgfHwgc2tldGNoX2lkID4gc2tldGNoZXMubGVuZ3RoIHx8IHNrZXRjaF9pZCA8IDEpIHNrZXRjaF9pZCA9IHNrZXRjaGVzLmxlbmd0aDtcclxuICBidWlsZE1lbnUoKTtcclxuICBpbml0VGhyZWUoKTtcclxuICBzdGFydFJ1blNrZXRjaChza2V0Y2hlc1tza2V0Y2hlcy5sZW5ndGggLSBza2V0Y2hfaWRdKTtcclxuICByZW5kZXJsb29wKCk7XHJcbiAgc2V0RXZlbnQoKTtcclxuICBkZWJvdW5jZSh3aW5kb3csICdyZXNpemUnLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICByZXNpemVSZW5kZXJlcigpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudmFyIGdldFBhcmFtZXRlckJ5TmFtZSA9IGZ1bmN0aW9uKG5hbWUpIHtcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sIFwiXFxcXFtcIikucmVwbGFjZSgvW1xcXV0vLCBcIlxcXFxdXCIpO1xyXG4gIHZhciByZWdleCA9IG5ldyBSZWdFeHAoXCJbXFxcXD8mXVwiICsgbmFtZSArIFwiPShbXiYjXSopXCIpO1xyXG4gIHZhciByZXN1bHRzID0gcmVnZXguZXhlYyhsb2NhdGlvbi5zZWFyY2gpO1xyXG4gIHJldHVybiByZXN1bHRzID09PSBudWxsID8gXCJcIiA6IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xyXG59O1xyXG5cclxudmFyIGJ1aWxkTWVudSA9IGZ1bmN0aW9uKCkge1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2tldGNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBza2V0Y2ggPSBza2V0Y2hlc1tpXTtcclxuICAgIHZhciBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgZG9tLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcsIGkpO1xyXG4gICAgZG9tLmlubmVySFRNTCA9ICc8c3Bhbj4nICsgc2tldGNoLm5hbWUgKyAnPC9zcGFuPic7XHJcbiAgICBkb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgc3dpdGNoU2tldGNoKHNrZXRjaGVzW3RoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JyldKTtcclxuICAgIH0pO1xyXG4gICAgc2VsZWN0X3NrZXRjaC5hcHBlbmRDaGlsZChkb20pO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciBzdGFydFJ1blNrZXRjaCA9IGZ1bmN0aW9uKHNrZXRjaCkge1xyXG4gIHJ1bm5pbmcgPSBuZXcgc2tldGNoLm9iajtcclxuICBydW5uaW5nLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgc2tldGNoX3RpdGxlLmlubmVySFRNTCA9IHNrZXRjaC5uYW1lO1xyXG4gIHNrZXRjaF9kYXRlLmlubmVySFRNTCA9IChza2V0Y2gudXBkYXRlLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPyAncG9zdGVkOiAnICsgc2tldGNoLnBvc3RlZCArICcgLyB1cGRhdGU6ICcgKyBza2V0Y2gudXBkYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiAncG9zdGVkOiAnICsgc2tldGNoLnBvc3RlZDtcclxuICBza2V0Y2hfZGVzY3JpcHRpb24uaW5uZXJIVE1MID0gc2tldGNoLmRlc2NyaXB0aW9uO1xyXG59O1xyXG5cclxudmFyIHN3aXRjaFNrZXRjaCA9IGZ1bmN0aW9uKHNrZXRjaCkge1xyXG4gIHJ1bm5pbmcucmVtb3ZlKHNjZW5lLCBjYW1lcmEpO1xyXG4gIHN0YXJ0UnVuU2tldGNoKHNrZXRjaCk7XHJcbiAgc3dpdGNoTWVudSgpO1xyXG59O1xyXG5cclxudmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gIHJlbmRlcmVyLmNsZWFyKCk7XHJcbiAgcnVubmluZy5yZW5kZXIoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX21vdmUpO1xyXG4gIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhLm9iaik7XHJcbn07XHJcblxyXG52YXIgcmVuZGVybG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJsb29wKTtcclxuICByZW5kZXIoKTtcclxufTtcclxuXHJcbnZhciByZXNpemVSZW5kZXJlciA9IGZ1bmN0aW9uKCkge1xyXG4gIGJvZHlfd2lkdGggID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aDtcclxuICBib2R5X2hlaWdodCA9IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0O1xyXG4gIHJlbmRlcmVyLnNldFNpemUoYm9keV93aWR0aCwgYm9keV9oZWlnaHQpO1xyXG4gIGNhbWVyYS5yZXNpemUoYm9keV93aWR0aCwgYm9keV9oZWlnaHQpO1xyXG59O1xyXG5cclxudmFyIHNldEV2ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hTdGFydChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZLCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaE1vdmUoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoRW5kKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaFN0YXJ0KGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZLCB0cnVlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoTW92ZShldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSwgdHJ1ZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoRW5kKGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFksIHRydWUpO1xyXG4gIH0pO1xyXG5cclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hFbmQoMCwgMCwgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBidG5fdG9nZ2xlX21lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHN3aXRjaE1lbnUoKTtcclxuICB9KTtcclxufTtcclxuXHJcbnZhciB0cmFuc2Zvcm1WZWN0b3IyZCA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gIHZlY3Rvci54ID0gKHZlY3Rvci54IC8gYm9keV93aWR0aCkgKiAyIC0gMTtcclxuICB2ZWN0b3IueSA9IC0gKHZlY3Rvci55IC8gYm9keV9oZWlnaHQpICogMiArIDE7XHJcbn07XHJcblxyXG52YXIgdG91Y2hTdGFydCA9IGZ1bmN0aW9uKHgsIHksIHRvdWNoX2V2ZW50KSB7XHJcbiAgdmVjdG9yX21vdXNlX2Rvd24uc2V0KHgsIHkpO1xyXG4gIHRyYW5zZm9ybVZlY3RvcjJkKHZlY3Rvcl9tb3VzZV9kb3duKTtcclxuICBpZiAocnVubmluZy50b3VjaFN0YXJ0KSBydW5uaW5nLnRvdWNoU3RhcnQoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24pO1xyXG59O1xyXG5cclxudmFyIHRvdWNoTW92ZSA9IGZ1bmN0aW9uKHgsIHksIHRvdWNoX2V2ZW50KSB7XHJcbiAgdmVjdG9yX21vdXNlX21vdmUuc2V0KHgsIHkpO1xyXG4gIHRyYW5zZm9ybVZlY3RvcjJkKHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxuICBpZiAocnVubmluZy50b3VjaE1vdmUpIHJ1bm5pbmcudG91Y2hNb3ZlKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSk7XHJcbn07XHJcblxyXG52YXIgdG91Y2hFbmQgPSBmdW5jdGlvbih4LCB5LCB0b3VjaF9ldmVudCkge1xyXG4gIHZlY3Rvcl9tb3VzZV9lbmQuc2V0KHgsIHkpO1xyXG4gIGlmIChydW5uaW5nLnRvdWNoRW5kKSBydW5uaW5nLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpO1xyXG59O1xyXG5cclxudmFyIHN3aXRjaE1lbnUgPSBmdW5jdGlvbigpIHtcclxuICBidG5fdG9nZ2xlX21lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJyk7XHJcbiAgbWVudS5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKTtcclxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBvaW50ZWQnKTtcclxufTtcclxuXHJcbmluaXQoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIENhbWVyYSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5yYWQxX2Jhc2UgPSBVdGlsLmdldFJhZGlhbigxMCk7XHJcbiAgICB0aGlzLnJhZDEgPSB0aGlzLnJhZDFfYmFzZTtcclxuICAgIHRoaXMucmFkMiA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgdGhpcy5sb29rID0gbmV3IEZvcmNlMygpO1xyXG4gICAgdGhpcy5yb3RhdGVfcmFkMV9iYXNlID0gMDtcclxuICAgIHRoaXMucm90YXRlX3JhZDEgPSAwO1xyXG4gICAgdGhpcy5yb3RhdGVfcmFkMl9iYXNlID0gMDtcclxuICAgIHRoaXMucm90YXRlX3JhZDIgPSAwO1xyXG4gICAgdGhpcy5yYW5nZSA9IDEwMDA7XHJcbiAgICB0aGlzLm9iajtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgQ2FtZXJhLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgQ2FtZXJhLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENhbWVyYTtcclxuICBDYW1lcmEucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICB0aGlzLm9iaiA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgzNSwgd2lkdGggLyBoZWlnaHQsIDEsIDEwMDAwKTtcclxuICAgIHRoaXMub2JqLnVwLnNldCgwLCAxLCAwKTtcclxuICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLm9iai5wb3NpdGlvbjtcclxuICAgIHRoaXMuc2V0UG9zaXRpb25TcGhlcmljYWwoKTtcclxuICAgIHRoaXMudmVsb2NpdHkuY29weSh0aGlzLmFuY2hvcik7XHJcbiAgICB0aGlzLmxvb2tBdENlbnRlcigpO1xyXG4gIH07XHJcbiAgQ2FtZXJhLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvblNwaGVyaWNhbCgpO1xyXG4gICAgdGhpcy5sb29rQXRDZW50ZXIoKTtcclxuICB9O1xyXG4gIENhbWVyYS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xyXG4gICAgdGhpcy5vYmouYXNwZWN0ID0gd2lkdGggLyBoZWlnaHQ7XHJcbiAgICB0aGlzLm9iai51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcbiAgfTtcclxuICBDYW1lcmEucHJvdG90eXBlLnNldFBvc2l0aW9uU3BoZXJpY2FsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdmVjdG9yID0gVXRpbC5nZXRTcGhlcmljYWwodGhpcy5yYWQxLCB0aGlzLnJhZDIsIHRoaXMucmFuZ2UpO1xyXG4gICAgdGhpcy5hbmNob3IuY29weSh2ZWN0b3IpO1xyXG4gIH07XHJcbiAgQ2FtZXJhLnByb3RvdHlwZS5sb29rQXRDZW50ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMub2JqLmxvb2tBdCh7XHJcbiAgICAgIHg6IDAsXHJcbiAgICAgIHk6IDAsXHJcbiAgICAgIHo6IDBcclxuICAgIH0pO1xyXG4gIH07XHJcbiAgcmV0dXJuIENhbWVyYTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgZXZlbnRUeXBlLCBjYWxsYmFjayl7XHJcbiAgdmFyIHRpbWVyO1xyXG5cclxuICBvYmplY3QuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xyXG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgIGNhbGxiYWNrKGV2ZW50KTtcclxuICAgIH0sIDUwMCk7XHJcbiAgfSwgZmFsc2UpO1xyXG59O1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBGb3JjZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIHRoaXMubWFzcyA9IDE7XHJcbiAgfTtcclxuICBcclxuICBGb3JjZS5wcm90b3R5cGUudXBkYXRlUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucG9zaXRpb24uY29weSh0aGlzLnZlbG9jaXR5KTtcclxuICB9O1xyXG4gIEZvcmNlLnByb3RvdHlwZS51cGRhdGVWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uZGl2aWRlU2NhbGFyKHRoaXMubWFzcyk7XHJcbiAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlGb3JjZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uYWRkKHZlY3Rvcik7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlGcmljdGlvbiA9IGZ1bmN0aW9uKG11LCBub3JtYWwpIHtcclxuICAgIHZhciBmb3JjZSA9IHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCk7XHJcbiAgICBpZiAoIW5vcm1hbCkgbm9ybWFsID0gMTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIobXUpO1xyXG4gICAgdGhpcy5hcHBseUZvcmNlKGZvcmNlKTtcclxuICB9O1xyXG4gIEZvcmNlLnByb3RvdHlwZS5hcHBseURyYWcgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIodGhpcy5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgKiB2YWx1ZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcbiAgRm9yY2UucHJvdG90eXBlLmFwcGx5SG9vayA9IGZ1bmN0aW9uKHJlc3RfbGVuZ3RoLCBrKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLnZlbG9jaXR5LmNsb25lKCkuc3ViKHRoaXMuYW5jaG9yKTtcclxuICAgIHZhciBkaXN0YW5jZSA9IGZvcmNlLmxlbmd0aCgpIC0gcmVzdF9sZW5ndGg7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xICogayAqIGRpc3RhbmNlKTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIEZvcmNlO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBIZW1pTGlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucmFkMSA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgdGhpcy5yYWQyID0gVXRpbC5nZXRSYWRpYW4oMCk7XHJcbiAgICB0aGlzLnJhbmdlID0gMTAwMDtcclxuICAgIHRoaXMuaGV4MSA9IDB4ZmZmZmZmO1xyXG4gICAgdGhpcy5oZXgyID0gMHgzMzMzMzM7XHJcbiAgICB0aGlzLmludGVuc2l0eSA9IDE7XHJcbiAgICB0aGlzLm9iajtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgSGVtaUxpZ2h0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgSGVtaUxpZ2h0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhlbWlMaWdodDtcclxuICBIZW1pTGlnaHQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihoZXgxLCBoZXgyKSB7XHJcbiAgICBpZiAoaGV4MSkgdGhpcy5oZXgxID0gaGV4MTtcclxuICAgIGlmIChoZXgyKSB0aGlzLmhleDIgPSBoZXgyO1xyXG4gICAgdGhpcy5vYmogPSBuZXcgVEhSRUUuSGVtaXNwaGVyZUxpZ2h0KHRoaXMuaGV4MSwgdGhpcy5oZXgyLCB0aGlzLmludGVuc2l0eSk7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5vYmoucG9zaXRpb247XHJcbiAgICB0aGlzLnNldFBvc2l0aW9uU3BoZXJpY2FsKCk7XHJcbiAgfTtcclxuICBIZW1pTGlnaHQucHJvdG90eXBlLnNldFBvc2l0aW9uU3BoZXJpY2FsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcG9pbnRzID0gVXRpbC5nZXRTcGhlcmljYWwodGhpcy5yYWQxLCB0aGlzLnJhZDIsIHRoaXMucmFuZ2UpO1xyXG4gICAgdGhpcy5wb3NpdGlvbi5jb3B5KHBvaW50cyk7XHJcbiAgfTtcclxuICByZXR1cm4gSGVtaUxpZ2h0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBNb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zaXplID0gMDtcclxuICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICB0aGlzLmlzX2FjdGl2ZSA9IGZhbHNlO1xyXG4gICAgRm9yY2UzLmNhbGwodGhpcyk7XHJcbiAgfTtcclxuICBNb3Zlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEZvcmNlMy5wcm90b3R5cGUpO1xyXG4gIE1vdmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1vdmVyO1xyXG4gIE1vdmVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gdmVjdG9yLmNsb25lKCk7XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gdmVjdG9yLmNsb25lKCk7XHJcbiAgICB0aGlzLmFuY2hvciA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uc2V0KDAsIDAsIDApO1xyXG4gICAgdGhpcy50aW1lID0gMDtcclxuICB9O1xyXG4gIE1vdmVyLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5pc19hY3RpdmUgPSB0cnVlO1xyXG4gIH07XHJcbiAgTW92ZXIucHJvdG90eXBlLmluYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuaXNfYWN0aXZlID0gZmFsc2U7XHJcbiAgfTtcclxuICByZXR1cm4gTW92ZXI7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFBvaW50TGlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucmFkMSA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgdGhpcy5yYWQyID0gVXRpbC5nZXRSYWRpYW4oMCk7XHJcbiAgICB0aGlzLnJhbmdlID0gMjAwO1xyXG4gICAgdGhpcy5oZXggPSAweGZmZmZmZjtcclxuICAgIHRoaXMuaW50ZW5zaXR5ID0gMTtcclxuICAgIHRoaXMuZGlzdGFuY2UgPSAyMDAwO1xyXG4gICAgdGhpcy5kZWNheSA9IDE7XHJcbiAgICB0aGlzLm9iajtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgUG9pbnRMaWdodC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEZvcmNlMy5wcm90b3R5cGUpO1xyXG4gIFBvaW50TGlnaHQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUG9pbnRMaWdodDtcclxuICBQb2ludExpZ2h0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oaGV4LCBkaXN0YW5jZSkge1xyXG4gICAgaWYgKGhleCkgdGhpcy5oZXggPSBoZXg7XHJcbiAgICBpZiAoZGlzdGFuY2UpIHRoaXMuZGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLlBvaW50TGlnaHQodGhpcy5oZXgsIHRoaXMuaW50ZW5zaXR5LCB0aGlzLmRpc3RhbmNlLCB0aGlzLmRlY2F5KTtcclxuICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLm9iai5wb3NpdGlvbjtcclxuICAgIHRoaXMuc2V0UG9zaXRpb25TcGhlcmljYWwoKTtcclxuICB9O1xyXG4gIFBvaW50TGlnaHQucHJvdG90eXBlLnNldFBvc2l0aW9uU3BoZXJpY2FsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcG9pbnRzID0gVXRpbC5nZXRTcGhlcmljYWwodGhpcy5yYWQxLCB0aGlzLnJhZDIsIHRoaXMucmFuZ2UpO1xyXG4gICAgdGhpcy5wb3NpdGlvbi5jb3B5KHBvaW50cyk7XHJcbiAgfTtcclxuICByZXR1cm4gUG9pbnRMaWdodDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgUG9pbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICB0aGlzLm1hdGVyaWFsID0gbnVsbDtcclxuICAgIHRoaXMub2JqID0gbnVsbDtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgUG9pbnRzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgUG9pbnRzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvaW50cztcclxuICBQb2ludHMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihwYXJhbSkge1xyXG4gICAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgY29sb3I6IHsgdHlwZTogJ2MnLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKDB4ZmZmZmZmKSB9LFxyXG4gICAgICAgIHRleHR1cmU6IHsgdHlwZTogJ3QnLCB2YWx1ZTogcGFyYW0udGV4dHVyZSB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHZlcnRleFNoYWRlcjogcGFyYW0udnMsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBwYXJhbS5mcyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxyXG4gICAgICBibGVuZGluZzogcGFyYW0uYmxlbmRpbmdcclxuICAgIH0pO1xyXG4gICAgdGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwYXJhbS5wb3NpdGlvbnMsIDMpKTtcclxuICAgIHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdjdXN0b21Db2xvcicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocGFyYW0uY29sb3JzLCAzKSk7XHJcbiAgICB0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgndmVydGV4T3BhY2l0eScsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocGFyYW0ub3BhY2l0aWVzLCAxKSk7XHJcbiAgICB0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnc2l6ZScsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocGFyYW0uc2l6ZXMsIDEpKTtcclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLlBvaW50cyh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICAgIHBhcmFtLnNjZW5lLmFkZCh0aGlzLm9iaik7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5vYmoucG9zaXRpb247XHJcbiAgfTtcclxuICBQb2ludHMucHJvdG90eXBlLnVwZGF0ZVBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5vYmouZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB0aGlzLm9iai5nZW9tZXRyeS5hdHRyaWJ1dGVzLnZlcnRleE9wYWNpdHkubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5vYmouZ2VvbWV0cnkuYXR0cmlidXRlcy5zaXplLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICB9O1xyXG4gIHJldHVybiBQb2ludHM7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIGV4cG9ydHMgPSB7XHJcbiAgZ2V0UmFuZG9tSW50OiBmdW5jdGlvbihtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xyXG4gIH0sXHJcbiAgZ2V0RGVncmVlOiBmdW5jdGlvbihyYWRpYW4pIHtcclxuICAgIHJldHVybiByYWRpYW4gLyBNYXRoLlBJICogMTgwO1xyXG4gIH0sXHJcbiAgZ2V0UmFkaWFuOiBmdW5jdGlvbihkZWdyZWVzKSB7XHJcbiAgICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XHJcbiAgfSxcclxuICBnZXRTcGhlcmljYWw6IGZ1bmN0aW9uKHJhZDEsIHJhZDIsIHIpIHtcclxuICAgIHZhciB4ID0gTWF0aC5jb3MocmFkMSkgKiBNYXRoLmNvcyhyYWQyKSAqIHI7XHJcbiAgICB2YXIgeiA9IE1hdGguY29zKHJhZDEpICogTWF0aC5zaW4ocmFkMikgKiByO1xyXG4gICAgdmFyIHkgPSBNYXRoLnNpbihyYWQxKSAqIHI7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoeCwgeSwgeik7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFtcclxuICB7XHJcbiAgICBuYW1lOiAnaW1hZ2UgZGF0YScsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvaW1hZ2VfZGF0YScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMi45JyxcclxuICAgIHVwZGF0ZTogJzIwMTUuMTIuMTInLFxyXG4gICAgZGVzY3JpcHRpb246ICdQb2ludHMgYmFzZWQgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELmdldEltYWdlRGF0YSgpJyxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6ICdnYWxsZXJ5JyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9nYWxsZXJ5JyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjEyLjInLFxyXG4gICAgdXBkYXRlOiAnMjAxNS4xMi45JyxcclxuICAgIGRlc2NyaXB0aW9uOiAnaW1hZ2UgZ2FsbGVyeSBvbiAzZC4gdGVzdGVkIHRoYXQgcGlja2VkIG9iamVjdCBhbmQgbW92aW5nIGNhbWVyYS4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2NvbWV0JyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9jb21ldCcpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMS4yNCcsXHJcbiAgICB1cGRhdGU6ICcyMDE1LjEyLjEyJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnY2FtZXJhIHRvIHRyYWNrIHRoZSBtb3ZpbmcgcG9pbnRzLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnaHlwZXIgc3BhY2UnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2h5cGVyX3NwYWNlJyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjExLjEyJyxcclxuICAgIHVwZGF0ZTogJycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ2FkZCBsaXR0bGUgY2hhbmdlIGFib3V0IGNhbWVyYSBhbmdsZSBhbmQgcGFydGljbGUgY29udHJvbGVzLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnZmlyZSBiYWxsJyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9maXJlX2JhbGwnKSxcclxuICAgIHBvc3RlZDogJzIwMTUuMTEuMTInLFxyXG4gICAgdXBkYXRlOiAnJyxcclxuICAgIGRlc2NyaXB0aW9uOiAndGVzdCBvZiBzaW1wbGUgcGh5c2ljcyBhbmQgYWRkaXRpdmUgYmxlbmRpbmcuJyxcclxuICB9XHJcbl07XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbW92ZXInKTtcclxudmFyIFBvaW50cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRzLmpzJyk7XHJcbnZhciBIZW1pTGlnaHQgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2hlbWlMaWdodCcpO1xyXG52YXIgUG9pbnRMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRMaWdodCcpO1xyXG5cclxudmFyIHZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGN1c3RvbUNvbG9yO1xcclxcbmF0dHJpYnV0ZSBmbG9hdCB2ZXJ0ZXhPcGFjaXR5O1xcclxcbmF0dHJpYnV0ZSBmbG9hdCBzaXplO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2Q29sb3IgPSBjdXN0b21Db2xvcjtcXHJcXG4gIGZPcGFjaXR5ID0gdmVydGV4T3BhY2l0eTtcXHJcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxuICBnbF9Qb2ludFNpemUgPSBzaXplICogKDMwMC4wIC8gbGVuZ3RoKG12UG9zaXRpb24ueHl6KSk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gdmVjMyBjb2xvcjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yICogdkNvbG9yLCBmT3BhY2l0eSk7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSBnbF9GcmFnQ29sb3IgKiB0ZXh0dXJlMkQodGV4dHVyZSwgZ2xfUG9pbnRDb29yZCk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbigpIHt9O1xyXG4gIHZhciBtb3ZlcnNfbnVtID0gMTAwMDA7XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIGhlbWlfbGlnaHQgPSBuZXcgSGVtaUxpZ2h0KCk7XHJcbiAgdmFyIGNvbWV0X2xpZ2h0MSA9IG5ldyBQb2ludExpZ2h0KCk7XHJcbiAgdmFyIGNvbWV0X2xpZ2h0MiA9IG5ldyBQb2ludExpZ2h0KCk7XHJcbiAgdmFyIHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBjb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgb3BhY2l0aWVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBjb21ldCA9IG51bGw7XHJcbiAgdmFyIGNvbWV0X3JhZGl1cyA9IDMwO1xyXG4gIHZhciBjb21ldF9jb2xvcl9oID0gMTUwO1xyXG4gIHZhciBwbGFuZXQgPSBudWxsO1xyXG4gIHZhciBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gIHZhciBwbHVzX2FjY2VsZXJhdGlvbiA9IDA7XHJcbiAgdmFyIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgIHZhciBwb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIHtcclxuICAgICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMSk7XHJcbiAgICAgICAgbW92ZXIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgICBtb3Zlci51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICAgIGlmIChtb3Zlci50aW1lID4gMTApIHtcclxuICAgICAgICAgIG1vdmVyLnNpemUgLT0gMjtcclxuICAgICAgICAgIC8vbW92ZXIuYSAtPSAwLjA0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobW92ZXIuc2l6ZSA8PSAwKSB7XHJcbiAgICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgIG1vdmVyLnRpbWUgPSAwO1xyXG4gICAgICAgICAgbW92ZXIuYSA9IDAuMDtcclxuICAgICAgICAgIG1vdmVyLmluYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci5wb3NpdGlvbi54IC0gcG9pbnRzLnBvc2l0aW9uLng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIucG9zaXRpb24ueSAtIHBvaW50cy5wb3NpdGlvbi55O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnBvc2l0aW9uLnogLSBwb2ludHMucG9zaXRpb24uejtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY3RpdmF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gMTApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZDEgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgICB2YXIgcmFkMiA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICAgIHZhciByYW5nZSA9IFV0aWwuZ2V0UmFuZG9tSW50KDEsIDMwKTtcclxuICAgICAgICB2YXIgdmVjdG9yID0gVXRpbC5nZXRTcGhlcmljYWwocmFkMSwgcmFkMiwgcmFuZ2UpO1xyXG4gICAgICAgIHZhciBmb3JjZSA9IFV0aWwuZ2V0U3BoZXJpY2FsKHJhZDEsIHJhZDIsIHJhbmdlIC8gMjApO1xyXG4gICAgICAgIHZlY3Rvci5hZGQocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgICBtb3Zlci5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIG1vdmVyLmluaXQodmVjdG9yKTtcclxuICAgICAgICBtb3Zlci5hcHBseUZvcmNlKGZvcmNlKTtcclxuICAgICAgICBtb3Zlci5hID0gMTtcclxuICAgICAgICBtb3Zlci5zaXplID0gMjU7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgICBpZiAoY291bnQgPj0gNSkgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgcm90YXRlQ29tZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbWV0LnJvdGF0aW9uLnggKz0gMC4wMyArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwMDtcclxuICAgIGNvbWV0LnJvdGF0aW9uLnkgKz0gMC4wMSArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwMDtcclxuICAgIGNvbWV0LnJvdGF0aW9uLnogKz0gMC4wMSArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwMDtcclxuICAgIHBvaW50cy5yYWQxX2Jhc2UgKz0gVXRpbC5nZXRSYWRpYW4oMC40KTtcclxuICAgIHBvaW50cy5yYWQxID0gVXRpbC5nZXRSYWRpYW4oTWF0aC5zaW4ocG9pbnRzLnJhZDFfYmFzZSkgKiAzMCArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwKTtcclxuICAgIHBvaW50cy5yYWQyICs9IFV0aWwuZ2V0UmFkaWFuKDAuOCArIHBsdXNfYWNjZWxlcmF0aW9uIC8gMTAwKTtcclxuICAgIHBvaW50cy5yYWQzICs9IDAuMDE7XHJcbiAgICByZXR1cm4gVXRpbC5nZXRTcGhlcmljYWwocG9pbnRzLnJhZDEsIHBvaW50cy5yYWQyLCA0MDApO1xyXG4gIH07XHJcblxyXG4gIHZhciByb3RhdGVDb21ldENvbG9yID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcmFkaXVzID0gY29tZXRfcmFkaXVzICogMC44O1xyXG4gICAgY29tZXRfbGlnaHQxLm9iai5wb3NpdGlvbi5jb3B5KFV0aWwuZ2V0U3BoZXJpY2FsKFV0aWwuZ2V0UmFkaWFuKDApLCAgVXRpbC5nZXRSYWRpYW4oMCksIHJhZGl1cykuYWRkKHBvaW50cy5wb3NpdGlvbikpO1xyXG4gICAgY29tZXRfbGlnaHQyLm9iai5wb3NpdGlvbi5jb3B5KFV0aWwuZ2V0U3BoZXJpY2FsKFV0aWwuZ2V0UmFkaWFuKDE4MCksIFV0aWwuZ2V0UmFkaWFuKDApLCByYWRpdXMpLmFkZChwb2ludHMucG9zaXRpb24pKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlVGV4dHVyZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgdmFyIGdyYWQgPSBudWxsO1xyXG4gICAgdmFyIHRleHR1cmUgPSBudWxsO1xyXG5cclxuICAgIGNhbnZhcy53aWR0aCA9IDIwMDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSAyMDA7XHJcbiAgICBncmFkID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KDEwMCwgMTAwLCAyMCwgMTAwLCAxMDAsIDEwMCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjksICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLjAsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDApJyk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcclxuICAgIGN0eC5hcmMoMTAwLCAxMDAsIDEwMCwgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgXHJcbiAgICB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzKTtcclxuICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRleHR1cmU7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZUNvbW1ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGJhc2VfZ2VvbWV0cnkgPSBuZXcgVEhSRUUuT2N0YWhlZHJvbkdlb21ldHJ5KGNvbWV0X3JhZGl1cywgMik7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIGNvbG9yOiBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgY29tZXRfY29sb3JfaCArICcsIDEwMCUsIDEwMCUpJyksXHJcbiAgICAgIHNoYWRpbmc6IFRIUkVFLkZsYXRTaGFkaW5nXHJcbiAgICB9KTtcclxuICAgIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KGJhc2VfZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoICogMyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJhc2VfZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzXSA9IGJhc2VfZ2VvbWV0cnkudmVydGljZXNbaV0ueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBiYXNlX2dlb21ldHJ5LnZlcnRpY2VzW2ldLnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gYmFzZV9nZW9tZXRyeS52ZXJ0aWNlc1tpXS56O1xyXG4gICAgfVxyXG4gICAgdmFyIGluZGljZXMgPSBuZXcgVWludDMyQXJyYXkoYmFzZV9nZW9tZXRyeS5mYWNlcy5sZW5ndGggKiAzKTtcclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgYmFzZV9nZW9tZXRyeS5mYWNlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICBpbmRpY2VzW2ogKiAzXSA9IGJhc2VfZ2VvbWV0cnkuZmFjZXNbal0uYTtcclxuICAgICAgaW5kaWNlc1tqICogMyArIDFdID0gYmFzZV9nZW9tZXRyeS5mYWNlc1tqXS5iO1xyXG4gICAgICBpbmRpY2VzW2ogKiAzICsgMl0gPSBiYXNlX2dlb21ldHJ5LmZhY2VzW2pdLmM7XHJcbiAgICB9XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbnMsIDMpKTtcclxuICAgIGdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24uZHluYW1pYyA9IHRydWU7XHJcbiAgICBnZW9tZXRyeS5zZXRJbmRleChuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKGluZGljZXMsIDEpKTtcclxuICAgIGdlb21ldHJ5LmluZGV4LmR5bmFtaWMgPSB0cnVlO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVBsYW5ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeSgyNTAsIDQpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgY29sb3I6IDB4MjIyMjIyLFxyXG4gICAgICBzaGFkaW5nOiBUSFJFRS5GbGF0U2hhZGluZ1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgYWNjZWxlcmF0ZUNvbWV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoaXNfdG91Y2hlZCAmJiBwbHVzX2FjY2VsZXJhdGlvbiA8IDIwMCkge1xyXG4gICAgICBwbHVzX2FjY2VsZXJhdGlvbiArPSAxO1xyXG4gICAgfSBlbHNlIGlmKHBsdXNfYWNjZWxlcmF0aW9uID4gMCkge1xyXG4gICAgICBwbHVzX2FjY2VsZXJhdGlvbiAtPSAxO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGNvbWV0ID0gY3JlYXRlQ29tbWV0KCk7XHJcbiAgICAgIHNjZW5lLmFkZChjb21ldCk7XHJcbiAgICAgIHBsYW5ldCA9IGNyZWF0ZVBsYW5ldCgpO1xyXG4gICAgICBzY2VuZS5hZGQocGxhbmV0KTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnNfbnVtOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgICB2YXIgaCA9IFV0aWwuZ2V0UmFuZG9tSW50KGNvbWV0X2NvbG9yX2ggLSA2MCwgY29tZXRfY29sb3JfaCArIDYwKTtcclxuICAgICAgICB2YXIgcyA9IFV0aWwuZ2V0UmFuZG9tSW50KDYwLCA4MCk7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIGggKyAnLCAnICsgcyArICclLCA3MCUpJyk7XHJcbiAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhVdGlsLmdldFJhbmRvbUludCgtMTAwLCAxMDApLCAwLCAwKSk7XHJcbiAgICAgICAgbW92ZXJzLnB1c2gobW92ZXIpO1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIucG9zaXRpb24ueDtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci5wb3NpdGlvbi56O1xyXG4gICAgICAgIGNvbG9yLnRvQXJyYXkoY29sb3JzLCBpICogMyk7XHJcbiAgICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICAgIH1cclxuICAgICAgcG9pbnRzLmluaXQoe1xyXG4gICAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgICB2czogdnMsXHJcbiAgICAgICAgZnM6IGZzLFxyXG4gICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICAgIGNvbG9yczogY29sb3JzLFxyXG4gICAgICAgIG9wYWNpdGllczogb3BhY2l0aWVzLFxyXG4gICAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgICB0ZXh0dXJlOiBjcmVhdGVUZXh0dXJlKCksXHJcbiAgICAgICAgYmxlbmRpbmc6IFRIUkVFLk5vcm1hbEJsZW5kaW5nXHJcbiAgICAgIH0pO1xyXG4gICAgICBwb2ludHMucmFkMSA9IDA7XHJcbiAgICAgIHBvaW50cy5yYWQxX2Jhc2UgPSAwO1xyXG4gICAgICBwb2ludHMucmFkMiA9IDA7XHJcbiAgICAgIHBvaW50cy5yYWQzID0gMDtcclxuICAgICAgaGVtaV9saWdodC5pbml0KFxyXG4gICAgICAgIG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyAoY29tZXRfY29sb3JfaCAtIDYwKSArICcsIDUwJSwgNjAlKScpLmdldEhleCgpLFxyXG4gICAgICAgIG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyAoY29tZXRfY29sb3JfaCArIDYwKSArICcsIDUwJSwgNjAlKScpLmdldEhleCgpXHJcbiAgICAgICk7XHJcbiAgICAgIHNjZW5lLmFkZChoZW1pX2xpZ2h0Lm9iaik7XHJcbiAgICAgIGNvbWV0X2xpZ2h0MS5pbml0KG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyAoY29tZXRfY29sb3JfaCAtIDYwKSArICcsIDYwJSwgNTAlKScpKTtcclxuICAgICAgc2NlbmUuYWRkKGNvbWV0X2xpZ2h0MS5vYmopO1xyXG4gICAgICBjb21ldF9saWdodDIuaW5pdChuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgKGNvbWV0X2NvbG9yX2ggKyA2MCkgKyAnLCA2MCUsIDUwJSknKSk7XHJcbiAgICAgIHNjZW5lLmFkZChjb21ldF9saWdodDIub2JqKTtcclxuICAgICAgY2FtZXJhLmFuY2hvciA9IG5ldyBUSFJFRS5WZWN0b3IzKDE1MDAsIDAsIDApO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgY29tZXQuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBjb21ldC5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShjb21ldCk7XHJcbiAgICAgIHBsYW5ldC5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBsYW5ldC5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwbGFuZXQpO1xyXG4gICAgICBwb2ludHMuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocG9pbnRzLm9iaik7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShoZW1pX2xpZ2h0Lm9iaik7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShjb21ldF9saWdodDEub2JqKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGNvbWV0X2xpZ2h0Mi5vYmopO1xyXG4gICAgICBtb3ZlcnMgPSBbXTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgYWNjZWxlcmF0ZUNvbWV0KCk7XHJcbiAgICAgIHBvaW50cy52ZWxvY2l0eSA9IHJvdGF0ZUNvbWV0KCk7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IuY29weShcclxuICAgICAgICBwb2ludHMudmVsb2NpdHkuY2xvbmUoKS5hZGQoXHJcbiAgICAgICAgICBwb2ludHMudmVsb2NpdHkuY2xvbmUoKS5zdWIocG9pbnRzLnBvc2l0aW9uKVxyXG4gICAgICAgICAgLm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKC00MDApXHJcbiAgICAgICAgKVxyXG4gICAgICApO1xyXG4gICAgICBjYW1lcmEuYW5jaG9yLnkgKz0gcG9pbnRzLnBvc2l0aW9uLnkgKiAyO1xyXG4gICAgICBwb2ludHMudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY29tZXQucG9zaXRpb24uY29weShwb2ludHMucG9zaXRpb24pO1xyXG4gICAgICBjb21ldF9saWdodDEub2JqLnBvc2l0aW9uLmNvcHkocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgY29tZXRfbGlnaHQyLm9iai5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgICAgIGFjdGl2YXRlTW92ZXIoKTtcclxuICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgY2FtZXJhLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcbiAgICAgIGNhbWVyYS5vYmoubG9va0F0KHBvaW50cy5wb3NpdGlvbik7XHJcbiAgICAgIHJvdGF0ZUNvbWV0Q29sb3IoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgaXNfdG91Y2hlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgICBpc190b3VjaGVkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcbnZhciBQb2ludHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50cy5qcycpO1xyXG52YXIgTGlnaHQgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50TGlnaHQnKTtcclxuXHJcbnZhciB2cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyBjdXN0b21Db2xvcjtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgdmVydGV4T3BhY2l0eTtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgc2l6ZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdkNvbG9yID0gY3VzdG9tQ29sb3I7XFxyXFxuICBmT3BhY2l0eSA9IHZlcnRleE9wYWNpdHk7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbiAgZ2xfUG9pbnRTaXplID0gc2l6ZSAqICgzMDAuMCAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpO1xcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciBmcyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIHZlYzMgY29sb3I7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciAqIHZDb2xvciwgZk9wYWNpdHkpO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gZ2xfRnJhZ0NvbG9yICogdGV4dHVyZTJEKHRleHR1cmUsIGdsX1BvaW50Q29vcmQpO1xcclxcbn1cXHJcXG5cIjtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oKSB7fTtcclxuICB2YXIgbW92ZXJzX251bSA9IDEwMDAwO1xyXG4gIHZhciBtb3ZlcnMgPSBbXTtcclxuICB2YXIgcG9pbnRzID0gbmV3IFBvaW50cygpO1xyXG4gIHZhciBsaWdodCA9IG5ldyBMaWdodCgpO1xyXG4gIHZhciBiZyA9IG51bGw7XHJcbiAgdmFyIHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBjb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgb3BhY2l0aWVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBncmF2aXR5ID0gbmV3IFRIUkVFLlZlY3RvcjMoMCwgMC4xLCAwKTtcclxuICB2YXIgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICB2YXIgaXNfZHJhZ2VkID0gZmFsc2U7XHJcblxyXG4gIHZhciB1cGRhdGVNb3ZlciA9ICBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkge1xyXG4gICAgICAgIG1vdmVyLnRpbWUrKztcclxuICAgICAgICBtb3Zlci5hcHBseUZvcmNlKGdyYXZpdHkpO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5RHJhZygwLjAxKTtcclxuICAgICAgICBtb3Zlci51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgbW92ZXIucG9zaXRpb24uc3ViKHBvaW50cy5wb3NpdGlvbik7XHJcbiAgICAgICAgaWYgKG1vdmVyLnRpbWUgPiA1MCkge1xyXG4gICAgICAgICAgbW92ZXIuc2l6ZSAtPSAwLjc7XHJcbiAgICAgICAgICBtb3Zlci5hIC09IDAuMDA5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobW92ZXIuYSA8PSAwKSB7XHJcbiAgICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgIG1vdmVyLnRpbWUgPSAwO1xyXG4gICAgICAgICAgbW92ZXIuYSA9IDAuMDtcclxuICAgICAgICAgIG1vdmVyLmluYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci5wb3NpdGlvbi54IC0gcG9pbnRzLnBvc2l0aW9uLng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIucG9zaXRpb24ueSAtIHBvaW50cy5wb3NpdGlvbi54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnBvc2l0aW9uLnogLSBwb2ludHMucG9zaXRpb24ueDtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY3RpdmF0ZU1vdmVyID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvdW50ID0gMDtcclxuICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgaWYgKG5vdyAtIGxhc3RfdGltZV9hY3RpdmF0ZSA+IDEwKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIGNvbnRpbnVlO1xyXG4gICAgICAgIHZhciByYWQxID0gVXRpbC5nZXRSYWRpYW4oTWF0aC5sb2coVXRpbC5nZXRSYW5kb21JbnQoMCwgMjU2KSkgLyBNYXRoLmxvZygyNTYpICogMjYwKTtcclxuICAgICAgICB2YXIgcmFkMiA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICAgIHZhciByYW5nZSA9ICgxLSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgzMiwgMjU2KSkgLyBNYXRoLmxvZygyNTYpKSAqIDEyO1xyXG4gICAgICAgIHZhciB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgICAgIHZhciBmb3JjZSA9IFV0aWwuZ2V0U3BoZXJpY2FsKHJhZDEsIHJhZDIsIHJhbmdlKTtcclxuICAgICAgICB2ZWN0b3IuYWRkKHBvaW50cy5wb3NpdGlvbik7XHJcbiAgICAgICAgbW92ZXIuYWN0aXZhdGUoKTtcclxuICAgICAgICBtb3Zlci5pbml0KHZlY3Rvcik7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgICAgICAgbW92ZXIuYSA9IDAuMjtcclxuICAgICAgICBtb3Zlci5zaXplID0gTWF0aC5wb3coMTIgLSByYW5nZSwgMikgKiBVdGlsLmdldFJhbmRvbUludCgxLCAyNCkgLyAxMDtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgIGlmIChjb3VudCA+PSA2KSBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciB1cGRhdGVQb2ludHMgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICBwb2ludHMudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgIHBvaW50cy51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgbGlnaHQub2JqLnBvc2l0aW9uLmNvcHkocG9pbnRzLnZlbG9jaXR5KTtcclxuICB9O1xyXG5cclxuICB2YXIgbW92ZVBvaW50cyA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdmFyIHkgPSB2ZWN0b3IueSAqIGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0IC8gMztcclxuICAgIHZhciB6ID0gdmVjdG9yLnggKiBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoIC8gLTM7XHJcbiAgICBwb2ludHMuYW5jaG9yLnkgPSB5O1xyXG4gICAgcG9pbnRzLmFuY2hvci56ID0gejtcclxuICAgIGxpZ2h0LmFuY2hvci55ID0geTtcclxuICAgIGxpZ2h0LmFuY2hvci56ID0gejtcclxuICB9XHJcblxyXG4gIHZhciBjcmVhdGVUZXh0dXJlID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgdmFyIGdyYWQgPSBudWxsO1xyXG4gICAgdmFyIHRleHR1cmUgPSBudWxsO1xyXG5cclxuICAgIGNhbnZhcy53aWR0aCA9IDIwMDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSAyMDA7XHJcbiAgICBncmFkID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KDEwMCwgMTAwLCAyMCwgMTAwLCAxMDAsIDEwMCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjIsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjUsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEuMCwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMCknKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xyXG4gICAgY3R4LmFyYygxMDAsIDEwMCwgMTAwLCAwLCBNYXRoLlBJIC8gMTgwLCB0cnVlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgICBcclxuICAgIHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShjYW52YXMpO1xyXG4gICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xyXG4gICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICByZXR1cm4gdGV4dHVyZTtcclxuICB9O1xyXG4gIFxyXG4gIHZhciBjcmVhdGVCYWNrZ3JvdW5kID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeSgxNTAwLCAzKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIGNvbG9yOiAweGZmZmZmZixcclxuICAgICAgc2hhZGluZzogVEhSRUUuRmxhdFNoYWRpbmcsXHJcbiAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzX251bTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XHJcbiAgICAgICAgdmFyIGggPSBVdGlsLmdldFJhbmRvbUludCgwLCA0NSk7XHJcbiAgICAgICAgdmFyIHMgPSBVdGlsLmdldFJhbmRvbUludCg2MCwgOTApO1xyXG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyBoICsgJywgJyArIHMgKyAnJSwgNTAlKScpO1xyXG5cclxuICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKFV0aWwuZ2V0UmFuZG9tSW50KC0xMDAsIDEwMCksIDAsIDApKTtcclxuICAgICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci5wb3NpdGlvbi54O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIucG9zaXRpb24ueTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnBvc2l0aW9uLno7XHJcbiAgICAgICAgY29sb3IudG9BcnJheShjb2xvcnMsIGkgKiAzKTtcclxuICAgICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgICAgfVxyXG4gICAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgICAgc2NlbmU6IHNjZW5lLFxyXG4gICAgICAgIHZzOiB2cyxcclxuICAgICAgICBmczogZnMsXHJcbiAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXHJcbiAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgICAgc2l6ZXM6IHNpemVzLFxyXG4gICAgICAgIHRleHR1cmU6IGNyZWF0ZVRleHR1cmUoKSxcclxuICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZ1xyXG4gICAgICB9KTtcclxuICAgICAgbGlnaHQuaW5pdCgweGZmNjYwMCwgMTgwMCk7XHJcbiAgICAgIHNjZW5lLmFkZChsaWdodC5vYmopO1xyXG4gICAgICBiZyA9IGNyZWF0ZUJhY2tncm91bmQoKTtcclxuICAgICAgc2NlbmUuYWRkKGJnKTtcclxuICAgICAgY2FtZXJhLnJhZDFfYmFzZSA9IFV0aWwuZ2V0UmFkaWFuKDI1KTtcclxuICAgICAgY2FtZXJhLnJhZDEgPSBjYW1lcmEucmFkMV9iYXNlO1xyXG4gICAgICBjYW1lcmEucmFkMiA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgICBjYW1lcmEuc2V0UG9zaXRpb25TcGhlcmljYWwoKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMub2JqKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGxpZ2h0Lm9iaik7XHJcbiAgICAgIGJnLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgYmcubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUoYmcpO1xyXG4gICAgICBtb3ZlcnMgPSBbXTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcG9pbnRzLmFwcGx5SG9vaygwLCAwLjA4KTtcclxuICAgICAgcG9pbnRzLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBwb2ludHMudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgcG9pbnRzLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGxpZ2h0LmFwcGx5SG9vaygwLCAwLjA4KTtcclxuICAgICAgbGlnaHQuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGxpZ2h0LnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGxpZ2h0LnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGFjdGl2YXRlTW92ZXIoKTtcclxuICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgY2FtZXJhLmFwcGx5SG9vaygwLCAwLjAwNCk7XHJcbiAgICAgIGNhbWVyYS5hcHBseURyYWcoMC4xKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIG1vdmVQb2ludHModmVjdG9yKTtcclxuICAgICAgaXNfZHJhZ2VkID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBpZiAoaXNfZHJhZ2VkKSB7XHJcbiAgICAgICAgbW92ZVBvaW50cyh2ZWN0b3JfbW91c2VfbW92ZSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIGlzX2RyYWdlZCA9IGZhbHNlO1xyXG4gICAgICBwb2ludHMuYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgbGlnaHQuYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBIZW1pTGlnaHQgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2hlbWlMaWdodCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oKSB7fTtcclxuICB2YXIgaW1hZ2VzID0gW107XHJcbiAgdmFyIGltYWdlc19udW0gPSAzMDA7XHJcbiAgdmFyIGhlbWlfbGlnaHQgPSBuZXcgSGVtaUxpZ2h0KCk7XHJcbiAgdmFyIHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcclxuICB2YXIgcGlja2VkX2lkID0gLTE7XHJcbiAgdmFyIHBpY2tlZF9pbmRleCA9IC0xO1xyXG4gIHZhciBpc19jbGlja2VkID0gZmFsc2U7XHJcbiAgdmFyIGlzX2RyYWdlZCA9IGZhbHNlO1xyXG4gIHZhciBnZXRfbmVhciA9IGZhbHNlOyBcclxuXHJcbiAgdmFyIEltYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJhZCA9IDA7XHJcbiAgICB0aGlzLm9iaiA9IG51bGw7XHJcbiAgICB0aGlzLmlzX2VudGVyZWQgPSBmYWxzZTtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgdmFyIGltYWdlX2dlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMTAwLCAxMDApO1xyXG4gIEltYWdlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgSW1hZ2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSW1hZ2U7XHJcbiAgSW1hZ2UucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHZhciBpbWFnZV9tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXHJcbiAgICAgIG1hcDogbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKS5sb2FkKCdpbWcvZ2FsbGVyeS9pbWFnZTAnICsgVXRpbC5nZXRSYW5kb21JbnQoMSwgOSkgKyAnLmpwZycpXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLm9iaiA9IG5ldyBUSFJFRS5NZXNoKGltYWdlX2dlb21ldHJ5LCBpbWFnZV9tYXRlcmlhbCk7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5vYmoucG9zaXRpb247XHJcbiAgICB0aGlzLnZlbG9jaXR5ID0gdmVjdG9yLmNsb25lKCk7XHJcbiAgICB0aGlzLmFuY2hvciA9IHZlY3Rvci5jbG9uZSgpO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uc2V0KDAsIDAsIDApO1xyXG4gIH07XHJcblxyXG4gIHZhciBpbml0SW1hZ2VzID0gZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VzX251bTsgaSsrKSB7XHJcbiAgICAgIHZhciBpbWFnZSA9IG51bGw7XHJcbiAgICAgIHZhciByYWQgPSBVdGlsLmdldFJhZGlhbihpICUgNDUgKiA4ICsgMTgwKTtcclxuICAgICAgdmFyIHJhZGl1cyA9IDEwMDA7XHJcbiAgICAgIHZhciB4ID0gTWF0aC5jb3MocmFkKSAqIHJhZGl1cztcclxuICAgICAgdmFyIHkgPSBpICogNSAtIGltYWdlc19udW0gKiAyLjU7XHJcbiAgICAgIHZhciB6ID0gTWF0aC5zaW4ocmFkKSAqIHJhZGl1cztcclxuICAgICAgdmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKHgsIHksIHopO1xyXG4gICAgICBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICBpbWFnZS5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKCkpO1xyXG4gICAgICBpbWFnZS5yYWQgPSByYWQ7XHJcbiAgICAgIGltYWdlLmFuY2hvci5jb3B5KHZlY3Rvcik7XHJcbiAgICAgIHNjZW5lLmFkZChpbWFnZS5vYmopO1xyXG4gICAgICBpbWFnZXMucHVzaChpbWFnZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHBpY2tJbWFnZSA9IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgaWYgKGdldF9uZWFyKSByZXR1cm47XHJcbiAgICB2YXIgaW50ZXJzZWN0cyA9IG51bGw7XHJcbiAgICByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYSh2ZWN0b3IsIGNhbWVyYS5vYmopO1xyXG4gICAgaW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKHNjZW5lLmNoaWxkcmVuKTtcclxuICAgIGlmIChpbnRlcnNlY3RzLmxlbmd0aCA+IDAgJiYgaXNfZHJhZ2VkID09IGZhbHNlKSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnaXMtcG9pbnRlZCcpO1xyXG4gICAgICBwaWNrZWRfaWQgPSBpbnRlcnNlY3RzWzBdLm9iamVjdC5pZDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlc2V0UGlja0ltYWdlKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIGdldE5lYXJJbWFnZSA9IGZ1bmN0aW9uKGNhbWVyYSwgaW1hZ2UpIHtcclxuICAgIGdldF9uZWFyID0gdHJ1ZTtcclxuICAgIGNhbWVyYS5hbmNob3Iuc2V0KE1hdGguY29zKGltYWdlLnJhZCkgKiA3ODAsIGltYWdlLnBvc2l0aW9uLnksIE1hdGguc2luKGltYWdlLnJhZCkgKiA3ODApO1xyXG4gICAgY2FtZXJhLmxvb2suYW5jaG9yLmNvcHkoaW1hZ2UucG9zaXRpb24pO1xyXG4gICAgcmVzZXRQaWNrSW1hZ2UoKTtcclxuICB9O1xyXG5cclxuICB2YXIgcmVzZXRQaWNrSW1hZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcG9pbnRlZCcpO1xyXG4gICAgcGlja2VkX2lkID0gLTE7XHJcbiAgfTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgaW5pdEltYWdlcyhzY2VuZSk7XHJcbiAgICAgIGhlbWlfbGlnaHQuaW5pdCgweGZmZmZmZiwgMHhmZmZmZmYpO1xyXG4gICAgICBzY2VuZS5hZGQoaGVtaV9saWdodC5vYmopO1xyXG4gICAgICBjYW1lcmEuYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxID0gVXRpbC5nZXRSYWRpYW4oLTM1KTtcclxuICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxX2Jhc2UgPSBjYW1lcmEucm90YXRlX3JhZDE7XHJcbiAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMiA9IFV0aWwuZ2V0UmFkaWFuKDE4MCk7XHJcbiAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMl9iYXNlID0gY2FtZXJhLnJvdGF0ZV9yYWQyO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgaW1hZ2VfZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHNjZW5lLnJlbW92ZShpbWFnZXNbaV0ub2JqKTtcclxuICAgICAgfTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGhlbWlfbGlnaHQub2JqKTtcclxuICAgICAgaW1hZ2VzID0gW107XHJcbiAgICAgIGdldF9uZWFyID0gZmFsc2U7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcG9pbnRlZCcpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlc19udW07IGkrKykge1xyXG4gICAgICAgIGltYWdlc1tpXS5hcHBseUhvb2soMCwgMC4xNCk7XHJcbiAgICAgICAgaW1hZ2VzW2ldLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICAgIGltYWdlc1tpXS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICAgIGltYWdlc1tpXS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICAgIGltYWdlc1tpXS5vYmoubG9va0F0KHtcclxuICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICB5OiBpbWFnZXNbaV0ucG9zaXRpb24ueSxcclxuICAgICAgICAgIHo6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoaW1hZ2VzW2ldLm9iai5pZCA9PSBwaWNrZWRfaWQgJiYgaXNfZHJhZ2VkID09IGZhbHNlICYmIGdldF9uZWFyID09IGZhbHNlKSB7XHJcbiAgICAgICAgICBpZiAoaXNfY2xpY2tlZCA9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHBpY2tlZF9pbmRleCA9IGk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbWFnZXNbaV0ub2JqLm1hdGVyaWFsLmNvbG9yLnNldCgweGFhYWFhYSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGltYWdlc1tpXS5vYmoubWF0ZXJpYWwuY29sb3Iuc2V0KDB4ZmZmZmZmKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY2FtZXJhLmFwcGx5SG9vaygwLCAwLjA4KTtcclxuICAgICAgY2FtZXJhLmFwcGx5RHJhZygwLjQpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGlmIChnZXRfbmVhciA9PT0gZmFsc2UpIHtcclxuICAgICAgICBjYW1lcmEubG9vay5hbmNob3IuY29weShVdGlsLmdldFNwaGVyaWNhbChjYW1lcmEucm90YXRlX3JhZDEsIGNhbWVyYS5yb3RhdGVfcmFkMiwgMTAwMCkpO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbWVyYS5sb29rLmFwcGx5SG9vaygwLCAwLjA4KTtcclxuICAgICAgY2FtZXJhLmxvb2suYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5vYmoubG9va0F0KGNhbWVyYS5sb29rLnBvc2l0aW9uKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgcGlja0ltYWdlKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcik7XHJcbiAgICAgIGlzX2NsaWNrZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIHBpY2tJbWFnZShzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfbW92ZSk7XHJcbiAgICAgIGlmIChpc19jbGlja2VkICYmIHZlY3Rvcl9tb3VzZV9kb3duLmNsb25lKCkuc3ViKHZlY3Rvcl9tb3VzZV9tb3ZlKS5sZW5ndGgoKSA+IDAuMDEpIHtcclxuICAgICAgICBpc19jbGlja2VkID0gZmFsc2U7XHJcbiAgICAgICAgaXNfZHJhZ2VkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNfZHJhZ2VkID09IHRydWUgJiYgZ2V0X25lYXIgPT0gZmFsc2UpIHtcclxuICAgICAgICBjYW1lcmEucm90YXRlX3JhZDEgPSBjYW1lcmEucm90YXRlX3JhZDFfYmFzZSArIFV0aWwuZ2V0UmFkaWFuKCh2ZWN0b3JfbW91c2VfZG93bi55IC0gdmVjdG9yX21vdXNlX21vdmUueSkgKiA1MCk7XHJcbiAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQyID0gY2FtZXJhLnJvdGF0ZV9yYWQyX2Jhc2UgKyBVdGlsLmdldFJhZGlhbigodmVjdG9yX21vdXNlX2Rvd24ueCAtIHZlY3Rvcl9tb3VzZV9tb3ZlLngpICogNTApO1xyXG4gICAgICAgIGlmIChjYW1lcmEucm90YXRlX3JhZDEgPCBVdGlsLmdldFJhZGlhbigtNTApKSB7XHJcbiAgICAgICAgICBjYW1lcmEucm90YXRlX3JhZDEgPSBVdGlsLmdldFJhZGlhbigtNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2FtZXJhLnJvdGF0ZV9yYWQxID4gVXRpbC5nZXRSYWRpYW4oNTApKSB7XHJcbiAgICAgICAgICBjYW1lcmEucm90YXRlX3JhZDEgPSBVdGlsLmdldFJhZGlhbig1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICByZXNldFBpY2tJbWFnZSgpO1xyXG4gICAgICBpZiAoZ2V0X25lYXIpIHtcclxuICAgICAgICBjYW1lcmEuYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgICBwaWNrZWRfaW5kZXggPSAtMTtcclxuICAgICAgICBnZXRfbmVhciA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2UgaWYgKGlzX2NsaWNrZWQgJiYgcGlja2VkX2luZGV4ID4gLTEpIHtcclxuICAgICAgICBnZXROZWFySW1hZ2UoY2FtZXJhLCBpbWFnZXNbcGlja2VkX2luZGV4XSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoaXNfZHJhZ2VkKSB7XHJcbiAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQxX2Jhc2UgPSBjYW1lcmEucm90YXRlX3JhZDE7XHJcbiAgICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQyX2Jhc2UgPSBjYW1lcmEucm90YXRlX3JhZDI7XHJcbiAgICAgIH1cclxuICAgICAgaXNfY2xpY2tlZCA9IGZhbHNlO1xyXG4gICAgICBpc19kcmFnZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIE1vdmVyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9tb3ZlcicpO1xyXG52YXIgUG9pbnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludHMuanMnKTtcclxudmFyIExpZ2h0ID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludExpZ2h0Jyk7XHJcblxyXG52YXIgdnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgY3VzdG9tQ29sb3I7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHZlcnRleE9wYWNpdHk7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHNpemU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZDb2xvciA9IGN1c3RvbUNvbG9yO1xcclxcbiAgZk9wYWNpdHkgPSB2ZXJ0ZXhPcGFjaXR5O1xcclxcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG4gIGdsX1BvaW50U2l6ZSA9IHNpemUgKiAoMzAwLjAgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXHJcXG59XFxyXFxuXCI7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKCkge307XHJcbiAgdmFyIG1vdmVyc19udW0gPSAyMDAwMDtcclxuICB2YXIgbW92ZXJzID0gW107XHJcbiAgdmFyIHBvaW50cyA9IG5ldyBQb2ludHMoKTtcclxuICB2YXIgbGlnaHQgPSBuZXcgTGlnaHQoKTtcclxuICB2YXIgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIGdyYXZpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMygxLjUsIDAsIDApO1xyXG4gIHZhciBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gIHZhciBpc190b3VjaGVkID0gZmFsc2U7XHJcblxyXG4gIHZhciB1cGRhdGVNb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZlKSB7XHJcbiAgICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoZ3Jhdml0eSk7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMSk7XHJcbiAgICAgICAgbW92ZXIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgICBtb3Zlci51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICAgIGlmIChtb3Zlci5hIDwgMC44KSB7XHJcbiAgICAgICAgICBtb3Zlci5hICs9IDAuMDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtb3Zlci5wb3NpdGlvbi54ID4gMTAwMCkge1xyXG4gICAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XHJcbiAgICAgICAgICBtb3Zlci50aW1lID0gMDtcclxuICAgICAgICAgIG1vdmVyLmEgPSAwLjA7XHJcbiAgICAgICAgICBtb3Zlci5pbmFjdGl2YXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIucG9zaXRpb24ueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci5wb3NpdGlvbi55O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnBvc2l0aW9uLno7XHJcbiAgICAgIG9wYWNpdGllc1tpXSA9IG1vdmVyLmE7XHJcbiAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgIH1cclxuICAgIHBvaW50cy51cGRhdGVQb2ludHMoKTtcclxuICB9O1xyXG5cclxuICB2YXIgYWN0aXZhdGVNb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvdW50ID0gMDtcclxuICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgaWYgKG5vdyAtIGxhc3RfdGltZV9hY3RpdmF0ZSA+IGdyYXZpdHkueCAqIDE2KSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIGNvbnRpbnVlO1xyXG4gICAgICAgIHZhciByYWQgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAxMjApICogMyk7XHJcbiAgICAgICAgdmFyIHJhbmdlID0gTWF0aC5sb2coVXRpbC5nZXRSYW5kb21JbnQoMiwgMTI4KSkgLyBNYXRoLmxvZygxMjgpICogMTYwICsgNjA7XHJcbiAgICAgICAgdmFyIHkgPSBNYXRoLnNpbihyYWQpICogcmFuZ2U7XHJcbiAgICAgICAgdmFyIHogPSBNYXRoLmNvcyhyYWQpICogcmFuZ2U7XHJcbiAgICAgICAgdmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKC0xMDAwLCB5LCB6KTtcclxuICAgICAgICB2ZWN0b3IuYWRkKHBvaW50cy5wb3NpdGlvbik7XHJcbiAgICAgICAgbW92ZXIuYWN0aXZhdGUoKTtcclxuICAgICAgICBtb3Zlci5pbml0KHZlY3Rvcik7XHJcbiAgICAgICAgbW92ZXIuYSA9IDA7XHJcbiAgICAgICAgbW92ZXIuc2l6ZSA9IFV0aWwuZ2V0UmFuZG9tSW50KDUsIDYwKTtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgIGlmIChjb3VudCA+PSBNYXRoLnBvdyhncmF2aXR5LnggKiAzLCBncmF2aXR5LnggKiAwLjQpKSBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciB1cGRhdGVQb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHBvaW50cy51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgcG9pbnRzLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICBsaWdodC5vYmoucG9zaXRpb24uY29weShwb2ludHMudmVsb2NpdHkpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVUZXh0dXJlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB2YXIgZ3JhZCA9IG51bGw7XHJcbiAgICB2YXIgdGV4dHVyZSA9IG51bGw7XHJcblxyXG4gICAgY2FudmFzLndpZHRoID0gMjAwO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IDIwMDtcclxuICAgIGdyYWQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoMTAwLCAxMDAsIDIwLCAxMDAsIDEwMCwgMTAwKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuMiwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMSknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuNSwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMS4wLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwKScpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgICBjdHguYXJjKDEwMCwgMTAwLCAxMDAsIDAsIE1hdGguUEkgLyAxODAsIHRydWUpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICAgIFxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcblxyXG4gIHZhciBjaGFuZ2VHcmF2aXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoaXNfdG91Y2hlZCkge1xyXG4gICAgICBpZiAoZ3Jhdml0eS54IDwgNikgZ3Jhdml0eS54ICs9IDAuMDI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoZ3Jhdml0eS54ID4gMS41KSBncmF2aXR5LnggLT0gMC4xO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzX251bTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XHJcbiAgICAgICAgdmFyIGggPSBVdGlsLmdldFJhbmRvbUludCg2MCwgMjEwKTtcclxuICAgICAgICB2YXIgcyA9IFV0aWwuZ2V0UmFuZG9tSW50KDMwLCA5MCk7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIGggKyAnLCAnICsgcyArICclLCA1MCUpJyk7XHJcblxyXG4gICAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoVXRpbC5nZXRSYW5kb21JbnQoLTEwMCwgMTAwKSwgMCwgMCkpO1xyXG4gICAgICAgIG1vdmVycy5wdXNoKG1vdmVyKTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnBvc2l0aW9uLng7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci5wb3NpdGlvbi55O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIucG9zaXRpb24uejtcclxuICAgICAgICBjb2xvci50b0FycmF5KGNvbG9ycywgaSAqIDMpO1xyXG4gICAgICAgIG9wYWNpdGllc1tpXSA9IG1vdmVyLmE7XHJcbiAgICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgICB9XHJcbiAgICAgIHBvaW50cy5pbml0KHtcclxuICAgICAgICBzY2VuZTogc2NlbmUsXHJcbiAgICAgICAgdnM6IHZzLFxyXG4gICAgICAgIGZzOiBmcyxcclxuICAgICAgICBwb3NpdGlvbnM6IHBvc2l0aW9ucyxcclxuICAgICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgICBvcGFjaXRpZXM6IG9wYWNpdGllcyxcclxuICAgICAgICBzaXplczogc2l6ZXMsXHJcbiAgICAgICAgdGV4dHVyZTogY3JlYXRlVGV4dHVyZSgpLFxyXG4gICAgICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXHJcbiAgICAgIH0pO1xyXG4gICAgICBsaWdodC5pbml0KCk7XHJcbiAgICAgIHNjZW5lLmFkZChsaWdodC5vYmopO1xyXG4gICAgICBjYW1lcmEuYW5jaG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoODAwLCAwLCAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMub2JqKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGxpZ2h0Lm9iaik7XHJcbiAgICAgIG1vdmVycyA9IFtdO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBjaGFuZ2VHcmF2aXR5KCk7XHJcbiAgICAgIGFjdGl2YXRlTW92ZXIoKTtcclxuICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgY2FtZXJhLmFwcGx5SG9vaygwLCAwLjAwOCk7XHJcbiAgICAgIGNhbWVyYS5hcHBseURyYWcoMC4xKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IueiA9IHZlY3Rvcl9tb3VzZV9tb3ZlLnggKiAxMjA7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IueSA9IHZlY3Rvcl9tb3VzZV9tb3ZlLnkgKiAtMTIwO1xyXG4gICAgICAvL2NhbWVyYS5sb29rQXRDZW50ZXIoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgICBjYW1lcmEuYW5jaG9yLnogPSAwO1xyXG4gICAgICBjYW1lcmEuYW5jaG9yLnkgPSAwO1xyXG4gICAgICBpc190b3VjaGVkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcblxyXG52YXIgUG9pbnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludHMuanMnKTtcclxudmFyIHZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGN1c3RvbUNvbG9yO1xcclxcbmF0dHJpYnV0ZSBmbG9hdCB2ZXJ0ZXhPcGFjaXR5O1xcclxcbmF0dHJpYnV0ZSBmbG9hdCBzaXplO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2Q29sb3IgPSBjdXN0b21Db2xvcjtcXHJcXG4gIGZPcGFjaXR5ID0gdmVydGV4T3BhY2l0eTtcXHJcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxuICBnbF9Qb2ludFNpemUgPSBzaXplICogKDMwMC4wIC8gbGVuZ3RoKG12UG9zaXRpb24ueHl6KSk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gdmVjMyBjb2xvcjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yICogdkNvbG9yLCBmT3BhY2l0eSk7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSBnbF9GcmFnQ29sb3IgKiB0ZXh0dXJlMkQodGV4dHVyZSwgZ2xfUG9pbnRDb29yZCk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbigpIHt9O1xyXG4gIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gIHZhciBpbWFnZV92ZXJ0aWNlcyA9IFtdO1xyXG4gIHZhciBtb3ZlcnMgPSBbXTtcclxuICB2YXIgcG9zaXRpb25zID0gbnVsbDtcclxuICB2YXIgY29sb3JzID0gbnVsbDtcclxuICB2YXIgb3BhY2l0aWVzID0gbnVsbDtcclxuICB2YXIgc2l6ZXMgPSBudWxsO1xyXG4gIHZhciBsZW5ndGhfc2lkZSA9IDQwMDtcclxuICB2YXIgcG9pbnRzID0gbmV3IFBvaW50cygpO1xyXG4gIHZhciBjcmVhdGVkX3BvaW50cyA9IGZhbHNlO1xyXG5cclxuICB2YXIgbG9hZEltYWdlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgIGltYWdlLnNyYyA9ICcuL2ltZy9pbWFnZV9kYXRhL2VsZXBoYW50LnBuZyc7XHJcbiAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgdmFyIGdldEltYWdlRGF0YSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgY2FudmFzLndpZHRoID0gbGVuZ3RoX3NpZGU7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gbGVuZ3RoX3NpZGU7XHJcbiAgICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcclxuICAgIHZhciBpbWFnZV9kYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBsZW5ndGhfc2lkZSwgbGVuZ3RoX3NpZGUpO1xyXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBsZW5ndGhfc2lkZTsgeSsrKSB7XHJcbiAgICAgIGlmICh5ICUgMyA+IDApIGNvbnRpbnVlO1xyXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IGxlbmd0aF9zaWRlOyB4KyspIHtcclxuICAgICAgICBpZiAoeCAlIDMgPiAwKSBjb250aW51ZTtcclxuICAgICAgICBpZihpbWFnZV9kYXRhLmRhdGFbKHggKyB5ICogbGVuZ3RoX3NpZGUpICogNF0gPiAwKSB7XHJcbiAgICAgICAgICBpbWFnZV92ZXJ0aWNlcy5wdXNoKDAsICh5IC0gbGVuZ3RoX3NpZGUgLyAyKSAqIC0xLCAoeCAtIGxlbmd0aF9zaWRlLyAyKSAqIC0xKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgYnVpbGRQb2ludHMgPSBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShpbWFnZV92ZXJ0aWNlcyk7XHJcbiAgICBjb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KGltYWdlX3ZlcnRpY2VzLmxlbmd0aCk7XHJcbiAgICBvcGFjaXRpZXMgPSBuZXcgRmxvYXQzMkFycmF5KGltYWdlX3ZlcnRpY2VzLmxlbmd0aCAvIDMpO1xyXG4gICAgc2l6ZXMgPSBuZXcgRmxvYXQzMkFycmF5KGltYWdlX3ZlcnRpY2VzLmxlbmd0aCAvIDMpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZV92ZXJ0aWNlcy5sZW5ndGggLyAzOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbmV3IE1vdmVyKCk7XHJcbiAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoc2woJyArIChpbWFnZV92ZXJ0aWNlc1tpICogMyArIDJdICsgaW1hZ2VfdmVydGljZXNbaSAqIDMgKyAxXSArIGxlbmd0aF9zaWRlKSAvIDVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJywgNjAlLCA4MCUpJyk7XHJcbiAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoaW1hZ2VfdmVydGljZXNbaSAqIDNdLCBpbWFnZV92ZXJ0aWNlc1tpICogMyArIDFdLCBpbWFnZV92ZXJ0aWNlc1tpICogMyArIDJdKSk7XHJcbiAgICAgIG1vdmVyLmlzX2FjdGl2YXRlID0gdHJ1ZTtcclxuICAgICAgbW92ZXJzLnB1c2gobW92ZXIpO1xyXG4gICAgICBjb2xvci50b0FycmF5KGNvbG9ycywgaSAqIDMpO1xyXG4gICAgICBvcGFjaXRpZXNbaV0gPSAxO1xyXG4gICAgICBzaXplc1tpXSA9IDEyO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLmluaXQoe1xyXG4gICAgICBzY2VuZTogc2NlbmUsXHJcbiAgICAgIHZzOiB2cyxcclxuICAgICAgZnM6IGZzLFxyXG4gICAgICBwb3NpdGlvbnM6IHBvc2l0aW9ucyxcclxuICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgIG9wYWNpdGllczogb3BhY2l0aWVzLFxyXG4gICAgICBzaXplczogc2l6ZXMsXHJcbiAgICAgIHRleHR1cmU6IGNyZWF0ZVRleHR1cmUoKSxcclxuICAgICAgYmxlbmRpbmc6IFRIUkVFLk5vcm1hbEJsZW5kaW5nXHJcbiAgICB9KTtcclxuICAgIGNyZWF0ZWRfcG9pbnRzID0gdHJ1ZTtcclxuICB9O1xyXG5cclxuICB2YXIgYXBwbHlGb3JjZVRvUG9pbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgIHZhciByYWQxID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgIHZhciByYWQyID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgIHZhciBzY2FsYXIgPSBVdGlsLmdldFJhbmRvbUludCg0MCwgODApO1xyXG4gICAgICBtb3Zlci5pc19hY3RpdmF0ZSA9IGZhbHNlO1xyXG4gICAgICBtb3Zlci5hcHBseUZvcmNlKFV0aWwuZ2V0U3BoZXJpY2FsKHJhZDEsIHJhZDIsIHNjYWxhcikpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciB1cGRhdGVNb3ZlciA9ICBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICAvLyBtb3Zlci5hcHBseUhvb2soMCwgMC4wMDQpO1xyXG4gICAgICAvLyBtb3Zlci5hcHBseURyYWcoMC4xMTUpO1xyXG4gICAgICBpZiAobW92ZXIuYWNjZWxlcmF0aW9uLmxlbmd0aCgpIDwgMSkge1xyXG4gICAgICAgIG1vdmVyLmlzX2FjdGl2YXRlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZhdGUpIHtcclxuICAgICAgICBtb3Zlci5hcHBseUhvb2soMCwgMC4xOCk7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMjYpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG1vdmVyLmFwcGx5RHJhZygwLjAzNSk7XHJcbiAgICAgIH1cclxuICAgICAgbW92ZXIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgbW92ZXIudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgbW92ZXIucG9zaXRpb24uc3ViKHBvaW50cy5wb3NpdGlvbik7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIucG9zaXRpb24ueCAtIHBvaW50cy5wb3NpdGlvbi54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnBvc2l0aW9uLnkgLSBwb2ludHMucG9zaXRpb24ueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci5wb3NpdGlvbi56IC0gcG9pbnRzLnBvc2l0aW9uLng7XHJcbiAgICAgIG1vdmVyLnNpemUgPSBVdGlsLmdldFJhbmRvbUludCgxMiwgNjApXHJcbiAgICAgIHNpemVzW2ldID0gbW92ZXIuc2l6ZTtcclxuICAgIH1cclxuICAgIHBvaW50cy51cGRhdGVQb2ludHMoKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlVGV4dHVyZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgdmFyIGdyYWQgPSBudWxsO1xyXG4gICAgdmFyIHRleHR1cmUgPSBudWxsO1xyXG5cclxuICAgIGNhbnZhcy53aWR0aCA9IDIwMDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSAyMDA7XHJcbiAgICBncmFkID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KDEwMCwgMTAwLCAyMCwgMTAwLCAxMDAsIDEwMCk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjIsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgwLjUsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDEuMCwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMCknKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xyXG4gICAgY3R4LmFyYygxMDAsIDEwMCwgMTAwLCAwLCBNYXRoLlBJIC8gMTgwLCB0cnVlKTtcclxuICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGxvYWRJbWFnZShmdW5jdGlvbigpIHtcclxuICAgICAgICBnZXRJbWFnZURhdGEoKTtcclxuICAgICAgICBidWlsZFBvaW50cyhzY2VuZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBjYW1lcmEucmFuZ2UgPSAxNDAwO1xyXG4gICAgICBjYW1lcmEucmFkMV9iYXNlID0gVXRpbC5nZXRSYWRpYW4oMCk7XHJcbiAgICAgIGNhbWVyYS5yYWQxID0gY2FtZXJhLnJhZDFfYmFzZTtcclxuICAgICAgY2FtZXJhLnJhZDIgPSBVdGlsLmdldFJhZGlhbigwKTtcclxuICAgICAgY2FtZXJhLnNldFBvc2l0aW9uU3BoZXJpY2FsKCk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIHBvaW50cy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBvaW50cy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwb2ludHMub2JqKTtcclxuICAgICAgaW1hZ2VfdmVydGljZXMgPSBbXTtcclxuICAgICAgbW92ZXJzID0gW107XHJcbiAgICAgIGNhbWVyYS5yYW5nZSA9IDEwMDA7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGlmIChjcmVhdGVkX3BvaW50cykge1xyXG4gICAgICAgIHVwZGF0ZU1vdmVyKCk7XHJcbiAgICAgICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbWVyYS5hcHBseUhvb2soMCwgMC4wMjUpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLmxvb2tBdENlbnRlcigpO1xyXG5cclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgYXBwbHlGb3JjZVRvUG9pbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgY2FtZXJhLmFuY2hvci56ID0gdmVjdG9yX21vdXNlX21vdmUueCAqIDEwMDA7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IueSA9IHZlY3Rvcl9tb3VzZV9tb3ZlLnkgKiAtMTAwMDtcclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2VuZCkge1xyXG4gICAgICBjYW1lcmEuYW5jaG9yLnogPSAwO1xyXG4gICAgICBjYW1lcmEuYW5jaG9yLnkgPSAwO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIl19
