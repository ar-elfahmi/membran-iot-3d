import * as THREE from 'three';
import { createLabel } from '../ui/labels.js';

// Sumbu aliran lokal X; main menempatkan dan mengorientasikan group pada kurva.
export function createFlowSensor(config) {
  const group = new THREE.Group();
  const { id, name, desc, pins, colors, material, segments } = config;
  group.name = id;
  group.userData = { id, name, desc, pins: [...pins] };
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(config.radius, config.radius, config.length, segments),
    new THREE.MeshPhysicalMaterial({ color: colors.clear, transparent: true, opacity: config.opacity, depthWrite: false, ...material }),
  );
  body.rotation.z = Math.PI / 2;
  group.add(body);
  for (const position of config.collarPositions) {
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(config.collarRadius, config.collarRadius, config.collarLength, segments), new THREE.MeshStandardMaterial({ color: colors.metal, ...material }));
    collar.rotation.z = Math.PI / 2;
    collar.position.set(...position);
    collar.castShadow = true;
    group.add(collar);
  }
  for (const [part, color] of [[config.board, colors.pcb], [config.chip, colors.chip], [config.connector, colors.connector]]) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...part.size), new THREE.MeshStandardMaterial({ color, ...material }));
    mesh.position.set(...part.position);
    mesh.castShadow = true;
    group.add(mesh);
  }
  pins.forEach((pin, index) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...config.pin.size), new THREE.MeshStandardMaterial({ color: colors.pin, ...material }));
    mesh.position.set(...config.pin.start);
    mesh.position.x += index * config.pin.pitch;
    mesh.name = pin;
    group.add(mesh);
  });
  const label = createLabel(name, 'component-label');
  label.element.title = `${desc} · ${pins.join(', ')}`;
  label.position.set(...config.labelOffset);
  group.add(label);
  return group;
}
