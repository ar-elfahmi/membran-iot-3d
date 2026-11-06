import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { components, membrane, palette, sceneConfig as config, ui, zones } from './config.js';
import { createPlaceholder } from './components/placeholder.js';
import { createMembraneModule } from './components/membrane.js';
import { createPipe } from './components/pipes.js';
import { createFlowMeter } from './components/flowMeter.js';
import { createPressureSensor } from './components/pressureSensor.js';
import { createTemperatureSensor } from './components/temperatureSensor.js';
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
const membraneUnit = createMembraneModule(membrane);
for (const route of membrane.routes) {
  const color = membrane.colors[route.color];
  const pipe = createPipe(route.points, color, membrane.pipe.radius);
  pipe.name = route.id;
  Object.assign(pipe.userData, { id: route.id, name: route.name, desc: route.desc, pins: [] });
  const { curve } = pipe.userData;
  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(membrane.arrow.radius, membrane.arrow.length, membrane.arrow.segments),
    new THREE.MeshStandardMaterial({ color, ...membrane.material }),
  );
  arrow.position.copy(curve.getPointAt(route.arrowAt));
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangentAt(route.arrowAt));
  pipe.add(arrow);
  const label = createLabel(route.label.text, 'component-label flow-label');
  label.position.set(...route.label.position);
  label.element.title = route.desc;
  pipe.add(label);
  for (const meter of membrane.flowMeter.meters.filter((item) => item.route === route.id)) {
    const flowMeter = createFlowMeter(meter, membrane.flowMeter, membrane.colors, membrane.material, membrane.segments);
    flowMeter.position.copy(curve.getPointAt(meter.at));
    flowMeter.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), curve.getTangentAt(meter.at));
    pipe.add(flowMeter);
  }
  membraneUnit.add(pipe);
}
membraneUnit.add(
  createPressureSensor(membrane.pressureSensor, membrane.colors, membrane.material, membrane.segments),
  createTemperatureSensor(membrane.temperatureSensor, membrane.colors, membrane.material, membrane.segments),
);
scene.add(membraneUnit);
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
