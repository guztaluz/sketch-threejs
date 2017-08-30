import FlatShell from '../modules/sketch/sphere/FlatShell';

const debounce = require('js-util/debounce');

export default function() {
  const resolution = {
    x: 0,
    y: 0
  };
  const canvas = document.getElementById('canvas-webgl');
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    canvas: canvas,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 10000);
  const clock = new THREE.Clock();

  const vectorTouchStart = new THREE.Vector2();
  const vectorTouchMove = new THREE.Vector2();
  const vectorTouchEnd = new THREE.Vector2();

  const CAMERA_SIZE = 300;

  let isDrag = false;

  //
  // process for this sketch.
  //

  const flatShell = new FlatShell();

  scene.add(flatShell.obj);

  //
  // common process
  //
  const render = () => {
    renderer.render(scene, camera);
  };
  const renderLoop = () => {
    render();
    requestAnimationFrame(renderLoop);
  };
  const resizeWindow = () => {
    resolution.x = document.body.clientWidth;
    resolution.y = window.innerHeight;
    canvas.width = resolution.x;
    canvas.height = resolution.y;

    const cameraSizeX = (resolution.x / resolution.y > 1) ? CAMERA_SIZE : resolution.x / resolution.y * CAMERA_SIZE;
    const cameraSizeY = (resolution.y / resolution.x > 1) ? CAMERA_SIZE : resolution.y / resolution.x * CAMERA_SIZE;
    camera.left = -cameraSizeX;
    camera.right = cameraSizeX;
    camera.top = cameraSizeY;
    camera.bottom = -cameraSizeY;
    camera.updateProjectionMatrix();

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

    renderer.setClearColor(0xeeeeee, 1.0);
    camera.position.set(0, 0, 100);
    camera.lookAt(new THREE.Vector3());

    renderLoop();
  }
  init();
}
