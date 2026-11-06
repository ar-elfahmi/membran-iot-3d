import * as THREE from 'three';
import { createLabel } from '../ui/labels.js';

export function createSdp31(config) {
  const group = new THREE.Group();
  const { id, name, desc, pins, colors, segments, material } = config;
  group.name = id;
  group.userData = { id, name, desc, pins: [...pins] };
  group.userData.ports = Object.fromEntries(Object.entries(config.electricalPorts).map(([port, position]) => [port, new THREE.Vector3(...position)]));
  group.position.set(...config.position);
  group.rotation.set(...config.rotation);
  const addMesh = (geometry, color, position, parent = group) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, ...material }));
    mesh.position.set(...position);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  for (const [part, color] of [[config.board, colors.pcb], [config.chip, colors.chip]]) {
    addMesh(new THREE.BoxGeometry(...part.size), color, part.position);
  }
  pins.forEach((pin, index) => {
    const position = [...config.header.start];
    position[0] += index * config.header.pitch;
    addMesh(new THREE.BoxGeometry(...config.header.size), colors.pin, position).name = pin;
  });

  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = config.legend.canvas;
  const context = canvas.getContext('2d');
  context.font = config.legend.font;
  context.fillStyle = colors.ink;
  context.textAlign = 'center';
  pins.forEach((pin, index) => context.fillText(pin, ...config.legend.pinTextAt[index]));
  config.ports.forEach((port, index) => context.fillText(port.name, ...config.legend.portTextAt[index]));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const legend = new THREE.Mesh(new THREE.PlaneGeometry(...config.legend.size), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
  legend.rotation.x = -Math.PI / 2;
  legend.position.set(...config.legend.position);
  group.add(legend);

  for (const port of config.ports) {
    addMesh(new THREE.CylinderGeometry(config.nozzle.radius, config.nozzle.radius, config.nozzle.height, segments), colors.metal, port.position);
    const opening = [...port.position];
    opening[1] += config.nozzle.boreOffset;
    addMesh(new THREE.CylinderGeometry(config.nozzle.boreRadius, config.nozzle.boreRadius, config.nozzle.boreHeight, segments), colors.chip, opening);
    // Selang dan tee ikut sensor tetapi bukan badan perangkat pada pemeriksaan layout.
    const connection = new THREE.Group();
    connection.userData.layoutAttachment = true;
    connection.userData.gasLayer = true;
    group.add(connection);
    const teePosition = new THREE.Vector3(...port.connection.position);
    const tee = addMesh(new THREE.CylinderGeometry(config.tube.teeRadius, config.tube.teeRadius, config.tube.teeLength, segments), colors.metal, teePosition.toArray(), connection);
    tee.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...port.connection.tangent).normalize());
    const branchPosition = teePosition.clone().add(new THREE.Vector3(...config.tube.branchOffset));
    addMesh(new THREE.CylinderGeometry(config.tube.branchRadius, config.tube.branchRadius, config.tube.branchLength, segments), colors.metal, branchPosition.toArray(), connection);
    const start = new THREE.Vector3(...port.position);
    start.y += config.nozzle.height / 2;
    const end = teePosition.clone().add(new THREE.Vector3(...config.tube.endOffset));
    const curve = new THREE.CatmullRomCurve3([start, ...port.via.map((point) => new THREE.Vector3(...point)), end]);
    const geometry = new THREE.TubeGeometry(curve, config.tube.segments, config.tube.radius, config.tube.radialSegments, false);
    const hose = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: port.color, roughness: config.tube.roughness, transparent: true, opacity: config.tube.opacity, depthWrite: false }));
    hose.userData = { curve, pressureHose: true, port: port.name };
    connection.add(hose);
    // Garis mengikuti normal frame TubeGeometry sehingga tetap melekat di permukaan.
    const stripe = geometry.parameters.path.getSpacedPoints(config.tube.segments).map((point, i) => point.addScaledVector(geometry.normals[i], config.tube.radius));
    connection.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(stripe), config.tube.segments, config.tube.stripeRadius, config.tube.radialSegments, false), new THREE.MeshStandardMaterial({ color: config.tube.stripeColor, roughness: config.tube.roughness })));
  }
  const label = createLabel(name, 'component-label');
  label.element.title = desc;
  label.position.set(...config.labelOffset);
  group.add(label);
  return group;
}
