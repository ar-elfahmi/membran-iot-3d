import * as THREE from 'three';
import { getComponentBox } from '../ui/layout.js';

export const layers = Object.fromEntries(['power', 'control', 'communication', 'data', 'gnd'].map((type) => {
  const group = new THREE.Group();
  group.name = `cables-${type}`;
  group.userData.layer = type;
  return [type, group];
}));

let devices = new Map(), settings, routes = [];
const endpoint = (reference) => {
  const separator = reference.indexOf('.');
  if (separator < 1) throw new Error(`Referensi port tidak valid: ${reference}`);
  const id = reference.slice(0, separator);
  return [settings.aliases[id] ?? id, reference.slice(separator + 1)];
};

export function getPortWorld(componentId, portName) {
  const component = devices.get(settings?.aliases[componentId] ?? componentId);
  const port = component?.userData.ports?.[portName];
  if (!port?.isVector3) throw new Error(`Port tidak ditemukan: ${componentId}.${portName}`);
  component.updateWorldMatrix(true, false);
  return component.localToWorld(port.clone());
}

// Fillet kuadratik membatasi tikungan di dalam segmen, tanpa overshoot CatmullRom.
function rounded(points, radius) {
  const path = new THREE.CurvePath();
  const distinct = points.filter((point, i) => i === 0 || point.distanceToSquared(points[i - 1]) > 1e-10);
  const clean = distinct.filter((point, i) => {
    if (i === 0 || i === distinct.length - 1) return true;
    const before = point.clone().sub(distinct[i - 1]), after = distinct[i + 1].clone().sub(point);
    return before.dot(after) < 0 || before.cross(after).lengthSq() > 1e-12;
  });
  let previous = clean[0];
  for (let i = 1; i < clean.length - 1; i++) {
    const point = clean[i], next = clean[i + 1];
    const length = Math.min(radius, point.distanceTo(clean[i - 1]) / 2, point.distanceTo(next) / 2);
    const before = point.clone().add(clean[i - 1].clone().sub(point).setLength(length));
    const after = point.clone().add(next.clone().sub(point).setLength(length));
    path.add(new THREE.LineCurve3(previous, before));
    path.add(new THREE.QuadraticBezierCurve3(before, point, after));
    previous = after;
  }
  path.add(new THREE.LineCurve3(previous, clean.at(-1)));
  return path;
}

function exitPoints(reference, lane) {
  const [id, port] = endpoint(reference);
  const position = getPortWorld(id, port);
  const box = getComponentBox(devices.get(id));
  const clearance = settings.exitClearance + lane;
  const raised = position.clone();
  raised.y = Math.max(position.y, box.max.y + settings.exitClearance);
  const faces = [
    { distance: Math.abs(position.x - box.min.x), axis: 'x', value: box.min.x - clearance },
    { distance: Math.abs(position.x - box.max.x), axis: 'x', value: box.max.x + clearance },
    { distance: Math.abs(position.z - box.min.z), axis: 'z', value: box.min.z - clearance },
    { distance: Math.abs(position.z - box.max.z), axis: 'z', value: box.max.z + clearance },
  ].sort((a, b) => a.distance - b.distance);
  // Port pada muka samping keluar langsung; header atas diangkat sebelum turun.
  if (faces[0].distance <= settings.radius + settings.clearance) raised.y = position.y;
  const exit = raised.clone();
  exit[faces[0].axis] = faces[0].value;
  const floor = exit.clone();
  floor.y = settings.baseHeight;
  return [position, raised, exit, floor];
}

export function createCables(config, components, pipes) {
  settings = config;
  devices = new Map(components.map((component) => [component.userData.id, component]));
  routes = [];
  Object.values(layers).forEach((group) => group.clear());
  const pipePoints = [];
  for (const pipe of pipes.values()) {
    pipe.updateWorldMatrix(true, false);
    const curve = pipe.userData.curve;
    const count = Math.ceil(curve.getLength() / config.sampleStep);
    for (let i = 0; i <= count; i++) pipePoints.push(pipe.localToWorld(curve.getPointAt(i / count)));
  }
  const ids = new Set();
  for (const [index, connection] of config.connections.entries()) {
    const { id, from, to, type, wireless } = connection;
    if (!id || ids.has(id) || !layers[type]) throw new Error(`Koneksi kabel tidak valid: ${id}`);
    ids.add(id);
    if (connection.via?.some((point) => !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite))) throw new Error(`Via tidak valid: ${id}`);
    let curve, cable;
    if (wireless) {
      const start = getPortWorld(...endpoint(from)), end = getPortWorld(...endpoint(to));
      const middle = start.clone().lerp(end, 0.5);
      middle.y = config.network.height;
      middle.z += connection.bend ?? config.network.bend;
      curve = new THREE.CatmullRomCurve3([start, middle, end]);
      cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(config.network.segments)), new THREE.LineDashedMaterial({ color: config.colors[type], dashSize: config.network.dashSize, gapSize: config.network.gapSize }));
      cable.computeLineDistances();
    } else {
      const lane = (index % 4) * config.laneSpacing;
      const start = exitPoints(from, lane), end = exitPoints(to, lane);
      const via = connection.via ?? [[start[3].x, config.laneZ - lane], [end[3].x, config.laneZ - lane]];
      const floor = [start[3], ...via.map(([x, z]) => new THREE.Vector3(x, config.baseHeight, z)), end[3]];
      const bridged = [];
      for (let i = 1; i < floor.length; i++) {
        const count = Math.max(1, Math.ceil(floor[i - 1].distanceTo(floor[i]) / config.sampleStep));
        for (let j = i === 1 ? 0 : 1; j <= count; j++) {
          const point = floor[i - 1].clone().lerp(floor[i], j / count);
          for (const pipePoint of pipePoints) {
            const distance = Math.hypot(point.x - pipePoint.x, point.z - pipePoint.z);
            const inner = config.pipeRadius + config.radius + config.bridgeClearance;
            const t = THREE.MathUtils.clamp((distance - inner) / config.bridgeRun, 0, 1);
            const height = pipePoint.y + inner;
            point.y = Math.max(point.y, config.baseHeight + (height - config.baseHeight) * (1 - t * t * (3 - 2 * t)));
          }
          bridged.push(point);
        }
      }
      curve = rounded([...start.slice(0, -1), ...bridged, ...end.slice(0, -1).reverse()], config.bendRadius);
      cable = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.ceil(curve.getLength() / config.sampleStep), config.radius, config.radialSegments, false), new THREE.MeshStandardMaterial({ color: config.colors[type], roughness: config.roughness, metalness: config.metalness }));
    }
    cable.name = id;
    cable.userData = { ...connection, curve };
    layers[type].add(cable);
    routes.push(cable);
  }
  const group = new THREE.Group();
  group.name = 'cables';
  group.userData.layoutAttachment = true;
  group.add(...Object.values(layers));
  return group;
}

export function checkCableClearance() {
  const boxes = [...devices].map(([id, component]) => ({ id, box: getComponentBox(component).expandByScalar(settings.radius + settings.clearance) }));
  const collisions = [];
  for (const cable of routes) {
    const { curve, from, to } = cable.userData;
    const ends = [endpoint(from)[0], endpoint(to)[0]];
    const samples = curve.getSpacedPoints(Math.ceil(curve.getLength() / settings.sampleStep));
    for (const { id, box } of boxes) {
      if (ends.includes(id)) continue;
      const hit = samples.find((point) => box.containsPoint(point));
      if (!hit) continue;
      const collision = { cable: cable.name, component: id, point: hit.toArray() };
      collisions.push(collision);
      console.warn('[cables] Kabel bersinggungan:', collision);
    }
  }
  return { checked: routes.length, collisions };
}
