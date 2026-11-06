import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { components, palette, sceneConfig as config, ui, zones } from './config.js';
import { createPlaceholder } from './components/placeholder.js';
import { createLabel } from './ui/labels.js';

for (const key of ['background', 'text', 'muted', 'labelBackground']) {
  document.documentElement.style.setProperty(`--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, palette[key]);
}
for (const id of ['title', 'subtitle', 'instructions', 'scope']) document.getElementById(id).textContent = ui[id];

const viewport = document.getElementById('viewport');
const scene = new THREE.Scene();
scene.background = new THREE.Color(palette.background);
const camera = new THREE.PerspectiveCamera(config.camera.fov, 1, config.camera.near, config.camera.far);
camera.position.set(...config.camera.position);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, config.renderer.maxPixelRatio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = config.renderer.exposure;
renderer.domElement.tabIndex = 0;
renderer.domElement.setAttribute('aria-label', ui.canvasLabel);
viewport.appendChild(renderer.domElement);

const labels = new CSS2DRenderer();
Object.assign(labels.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
viewport.appendChild(labels.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(...config.camera.target);
controls.enableDamping = true;
Object.assign(controls, config.controls);
controls.listenToKeyEvents(renderer.domElement);

scene.add(new THREE.AmbientLight(palette.light, config.light.ambient));
const light = new THREE.DirectionalLight(palette.light, config.light.directional);
light.position.set(...config.light.position);
light.castShadow = true;
light.shadow.mapSize.setScalar(config.light.shadowMapSize);
Object.assign(light.shadow.camera, { left: -config.light.shadowExtent, right: config.light.shadowExtent, top: config.light.shadowExtent, bottom: -config.light.shadowExtent, far: config.light.shadowFar });
light.shadow.normalBias = config.light.normalBias;
light.shadow.bias = config.light.bias;
light.shadow.radius = config.light.radius;
scene.add(light);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(config.floor.size, config.floor.size),
  new THREE.MeshStandardMaterial({ color: palette.floor, roughness: config.floor.roughness }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = config.floor.y;
floor.receiveShadow = true;
scene.add(floor);
const grid = new THREE.GridHelper(config.grid.size, config.grid.divisions, palette.gridCenter, palette.grid);
grid.position.y = config.grid.y;
scene.add(grid);
components.forEach((component) => scene.add(createPlaceholder(component)));
zones.forEach((zone) => {
  const label = createLabel(zone.name, 'zone-label');
  label.position.set(...zone.position);
  scene.add(label);
});

function resize() {
  const { width, height } = viewport.getBoundingClientRect();
  if (!width || !height) return;
  camera.aspect = width / height;
  // Zoom adaptif mempertahankan orientasi dan posisi OrbitControls saat resize.
  const distance = new THREE.Vector3(...config.camera.position).distanceTo(new THREE.Vector3(...config.camera.target));
  const viewHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  camera.zoom = Math.min(1, viewHeight * camera.aspect / config.camera.fitWidth, viewHeight / config.camera.fitDepth);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  labels.setSize(width, height);
}
window.addEventListener('resize', resize);
resize();
document.getElementById('status').hidden = true;
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
  labels.render(scene, camera);
});
