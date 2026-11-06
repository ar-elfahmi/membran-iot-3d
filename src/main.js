import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { components, membrane, palette, sceneConfig as config, ui, zones, sensing, controller, communication, actuation, layout, powerSupply, cables } from './config.js';
import { createMembraneModule } from './components/membrane.js';
import { createPipe } from './components/pipes.js';
import { createFlowMeter } from './components/flowMeter.js';
import { createPressureSensor } from './components/pressureSensor.js';
import { createTemperatureSensor } from './components/temperatureSensor.js';
import { createSdp31 } from './components/sdp31.js';
import { createFlowSensor } from './components/flowSensor.js';
import { createEsp32 } from './components/esp32.js';
import { createSolenoidValve } from './components/solenoidValve.js';
import { createPump } from './components/pump.js';
import { createHBridge } from './components/hbridge.js';
import { createPowerSupply } from './components/powerSupply.js';
import { createCables, getPortWorld, checkCableClearance, layers } from './components/cables.js';
import { createWifiModule, createMqttBroker, createCloud, createPhone, createLaptop } from './components/comms.js';
import { createLabel } from './ui/labels.js';
import { checkLayoutOverlap, getComponentBox } from './ui/layout.js';
import { createLayerPanel } from './ui/layerPanel.js';
import { createLegend } from './ui/legend.js';

for (const key of ['background', 'text', 'muted', 'labelBackground', 'floor', 'grid']) {
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
const commFactories = { wifiModule: createWifiModule, mqttBroker: createMqttBroker, cloud: createCloud, phone: createPhone, laptop: createLaptop };
for (const component of components) {
  if (component.id === 'powerSupply') scene.add(createPowerSupply({ ...powerSupply, ...component }));
  else if (component.id === 'hbridge') scene.add(createHBridge({ ...actuation, ...actuation.hbridge, ...component }));
  else if (component.id === 'esp32') scene.add(createEsp32({ ...controller, ...component }));
  else if (commFactories[component.id]) scene.add(commFactories[component.id]({ ...communication, ...component }));
}
const membraneUnit = createMembraneModule(membrane);
const pipes = new Map();
const inlineActuators = [...actuation.valves.map((valve) => ({ ...actuation.valve, ...valve })), actuation.pump];
for (const route of membrane.routes) {
  const color = membrane.colors[route.color];
  const gaps = [
    ...inlineActuators.map((item) => ({ ...item, span: item.portSpan ?? item.port?.span })),
    ...membrane.flowMeter.meters.map((item) => ({ ...item, span: membrane.flowMeter.length })),
    { id: 'flowSensor', ...sensing.flowSensor, span: Math.max(...sensing.flowSensor.collarPositions.map((point) => Math.abs(point[0]))) * 2 + sensing.flowSensor.collarLength },
  ].filter((item) => item.route === route.id);
  const pipe = createPipe(route.points, color, membrane.pipe.radius, { gaps, flangeAt: route.flangeAt });
  pipe.name = route.id;
  Object.assign(pipe.userData, { id: route.id, name: route.name, desc: route.desc, pins: [] });
  pipe.userData.layoutAttachment = true;
  pipes.set(route.id, pipe);
  const { curve } = pipe.userData;
  for (const item of inlineActuators.filter((item) => item.route === route.id)) {
    const component = components.find((entry) => entry.id === item.id);
    const factory = item.id === 'pump' ? createPump : createSolenoidValve;
    const device = factory({ ...actuation, ...item, ...component });
    device.position.copy(curve.getPointAt(item.at));
    device.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), curve.getTangentAt(item.at));
    Object.assign(device.userData, { layoutInline: item.layoutInline, route: route.id, at: item.at });
    pipe.add(device);
  }
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

const flowConfig = { ...sensing, ...sensing.flowSensor, ...components.find((component) => component.id === 'flowSensor') };
const flowSensor = createFlowSensor(flowConfig);
const permeate = pipes.get(flowConfig.route);
flowSensor.position.copy(permeate.userData.curve.getPointAt(flowConfig.at));
flowSensor.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), permeate.userData.curve.getTangentAt(flowConfig.at));
permeate.add(flowSensor);

const sdpConfig = { ...sensing, ...sensing.sdp31, ...components.find((component) => component.id === 'sdp31') };
scene.updateMatrixWorld(true);
sdpConfig.ports = sdpConfig.ports.map((port) => {
  const pipe = pipes.get(port.route);
  const origin = new THREE.Vector3(...sdpConfig.position);
  return {
    ...port,
    via: port.via.map((point) => new THREE.Vector3(...point).sub(origin).toArray()),
    connection: {
      position: pipe.localToWorld(pipe.userData.curve.getPointAt(port.at)).sub(origin).toArray(),
      tangent: pipe.userData.curve.getTangentAt(port.at).transformDirection(pipe.matrixWorld).toArray(),
    },
  };
});
scene.add(createSdp31(sdpConfig));
const devices = [];
scene.traverse((object) => {
  if (object.isGroup && object.userData.id && !object.userData.layoutAttachment) devices.push(object);
});
scene.add(createCables({ ...cables, pipeRadius: membrane.pipe.radius }, devices, pipes));
const zoneObjects = [];
zones.forEach((zone) => {
  const box = new THREE.Box3();
  for (const device of devices) {
    if (components.some((component) => component.id === device.userData.id && component.category === zone.category)) box.union(getComponentBox(device));
  }
  if (box.isEmpty()) return;
  box.expandByVector(new THREE.Vector3(...layout.zone.padding));
  const y = layout.zone.y;
  const border = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(box.min.x, y, box.min.z), new THREE.Vector3(box.max.x, y, box.min.z),
      new THREE.Vector3(box.max.x, y, box.max.z), new THREE.Vector3(box.min.x, y, box.max.z),
      new THREE.Vector3(box.min.x, y, box.min.z),
    ]),
    new THREE.LineDashedMaterial({ color: layout.zone.color, transparent: true, opacity: layout.zone.opacity, dashSize: layout.zone.dashSize, gapSize: layout.zone.gapSize }),
  );
  border.name = zone.category;
  border.computeLineDistances();
  scene.add(border);
  const label = createLabel(zone.name, 'zone-label');
  label.center.set(0, 1);
  label.position.set(box.min.x, y, box.min.z).add(new THREE.Vector3(...(zone.labelOffset ?? layout.zone.labelOffset)));
  scene.add(label);
  zoneObjects.push(border, label);
});

const componentLabels = [];
scene.traverse((object) => {
  if (object.isCSS2DObject && object.element.classList.contains('component-label')) componentLabels.push(object);
});
createLayerPanel({
  ...Object.fromEntries(Object.entries(layers).map(([id, group]) => [id, [group]])),
  // Mesh pipa, flange dan panah saja; perangkat inline mempertahankan visibilitasnya.
  gas: [...pipes.values()].flatMap((pipe) => pipe.children.filter((object) => object.isMesh)),
  labels: componentLabels,
  zones: zoneObjects,
});
createLegend();

if (layout.devHosts.includes(window.location.hostname)) {
  window.checkLayoutOverlap = () => checkLayoutOverlap(devices);
  window.getPortWorld = getPortWorld;
  window.checkCableClearance = checkCableClearance;
  console.info('[layout]', JSON.stringify(window.checkLayoutOverlap()));
  console.info('[cables]', JSON.stringify(window.checkCableClearance()));
}

function resize() {
  const { width, height } = viewport.getBoundingClientRect();
  if (!width || !height) return;
  camera.aspect = width / height;
  // Zoom adaptif mempertahankan orientasi dan posisi OrbitControls saat resize.
  const distance = new THREE.Vector3(...config.camera.position).distanceTo(new THREE.Vector3(...config.camera.target));
  const viewHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const fitWidth = camera.aspect < config.camera.narrowAspect ? config.camera.narrowFitWidth : config.camera.fitWidth;
  camera.zoom = Math.min(1, viewHeight * camera.aspect / fitWidth, viewHeight / config.camera.fitDepth);
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
