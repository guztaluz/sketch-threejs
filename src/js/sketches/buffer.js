var Util = require('../modules/util');
var Mover = require('../modules/mover');
var HemiLight = require('../modules/hemiLight');
var glslify = require('glslify');
var vs = glslify('../sketches/points.vs');
var fs = glslify('../sketches/points.fs');

var exports = function(){
  var Sketch = function() {};

  Sketch.prototype = {
    init: function(scene, camera) {
      var light = new HemiLight();
      light.init();
      scene.add(light.obj);
      var geometry = new THREE.BoxGeometry(100, 100, 100);
      var buffer_geometry = new THREE.InstancedBufferGeometry();
      buffer_geometry.fromGeometry(geometry);
      var material = new THREE.MeshPhongMaterial({
        color: 0xffffff
      });
      var mesh = new THREE.Mesh(buffer_geometry, material);
      scene.add(mesh);
      console.log(mesh);
    },
    remove: function(scene) {
      
    },
    render: function(scene, camera) {
      camera.applyHook(0, 0.025);
      camera.applyDrag(0.2);
      camera.updateVelocity();
      camera.updatePosition();
      camera.lookAtCenter();
    }
  };

  return Sketch;
};

module.exports = exports();
