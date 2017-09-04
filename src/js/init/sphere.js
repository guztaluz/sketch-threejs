import FlatShell from '../modules/sketch/sphere/FlatShell';
import FlatShellCore from '../modules/sketch/sphere/FlatShellCore';
import Spark from '../modules/sketch/sphere/Spark';
import SparkCore from '../modules/sketch/sphere/SparkCore';
import Beam from '../modules/sketch/sphere/Beam';

const debounce = require('js-util/debounce');

export default function() {
  const resolution = {
    x: 0,
    y: 0
  };
  const canvas = document.getElementById('canvas-webgl');
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
    alpha: true,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 10000);
  const clock = new THREE.Clock();

  const vectorTouchStart = new THREE.Vector2();
  const vectorTouchMove = new THREE.Vector2();
  const vectorTouchEnd = new THREE.Vector2();

  const CAMERA_SIZE_X = 640;
  const CAMERA_SIZE_Y = 480;

  let isDrag = false;

  //
  // process for this sketch.
  //

  const flatShell = new FlatShell();
  const flatShellCore = new FlatShellCore();
  const spark = new Spark();
  const sparkCore = new SparkCore();
  const beam = new Beam();

  //
  // common process
  //
  const render = () => {
    const time = clock.getDelta();
    flatShell.render(time);
    flatShellCore.render(time);
    spark.render(time);
    sparkCore.render(time);
    beam.render(time);
    renderer.render(scene, camera);
  };
  const renderLoop = () => {
    render();
    requestAnimationFrame(renderLoop);
  };
  const resizeCamera = () => {
    const x = Math.min((resolution.x / resolution.y) / (CAMERA_SIZE_X / CAMERA_SIZE_Y), 1.0) * CAMERA_SIZE_X;
    const y = Math.min((resolution.y / resolution.x) / (CAMERA_SIZE_Y / CAMERA_SIZE_X), 1.0) * CAMERA_SIZE_Y;
    camera.left   = x * -0.5;
    camera.right  = x *  0.5;
    camera.top    = y *  0.5;
    camera.bottom = y * -0.5;
    camera.updateProjectionMatrix();
  };
  const resizeWindow = () => {
    resolution.x = document.body.clientWidth;
    resolution.y = window.innerHeight;
    canvas.width = resolution.x;
    canvas.height = resolution.y;
    resizeCamera();
    renderer.setSize(resolution.x, resolution.y);
  };
  const touchStart = (isTouched) => {
    isDrag = true;
  };
  const touchMove = (isTouched) => {
    if (isDrag) {}
  };
  const touchEnd = (isTouched) => {
    isDrag = false;
  };
  const on = () => {
    window.addEventListener('resize', debounce(resizeWindow), 1000);
    canvas.addEventListener('mousedown', (event) => {
      event.preventDefault();
      vectorTouchStart.set(event.clientX, event.clientY);
      touchStart(false);
    });
    document.addEventListener('mousemove', (event) => {
      event.preventDefault();
      vectorTouchMove.set(event.clientX, event.clientY);
      touchMove(false);
    });
    document.addEventListener('mouseup', (event) => {
      event.preventDefault();
      vectorTouchEnd.set(event.clientX, event.clientY);
      touchEnd(false);
    });
    canvas.addEventListener('touchstart', (event) => {
      event.preventDefault();
      vectorTouchStart.set(event.touches[0].clientX, event.touches[0].clientY);
      touchStart(event.touches[0].clientX, event.touches[0].clientY, true);
    });
    canvas.addEventListener('touchmove', (event) => {
      event.preventDefault();
      vectorTouchMove.set(event.touches[0].clientX, event.touches[0].clientY);
      touchMove(true);
    });
    canvas.addEventListener('touchend', (event) => {
      event.preventDefault();
      vectorTouchEnd.set(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
      touchEnd(true);
    });
  };

  const init = () => {
    on();
    resizeWindow();

    renderer.setClearColor(0xffffff, 1.0);
    camera.position.set(0, 100, 1000);
    camera.lookAt(new THREE.Vector3());

    // scene.add(flatShell.obj);
    // scene.add(flatShellCore.obj);
    // scene.add(spark.obj);
    // scene.add(sparkCore.obj);
    scene.add(beam.obj);

    renderLoop();
  }
  init();
}
