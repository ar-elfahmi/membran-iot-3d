import * as THREE from 'three';
import { createLabel } from '../ui/labels.js';

export function createPowerSupply(config) {
  const group = new THREE.Group();
  const { id, name, desc, pins, colors, material, segments } = config;
  group.name = id;
  group.position.set(...config.position);
  group.userData = { id, name, desc, pins: [...pins], ports: Object.fromEntries(Object.entries(config.electricalPorts).map(([port, position]) => [port, new THREE.Vector3(...position)])) };
  const add = (geometry, color, position) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, ...material }));
    mesh.position.set(...position);
    mesh.castShadow = true;
    group.add(mesh);
  };
  add(new THREE.BoxGeometry(...config.adapter.size), colors.body, config.adapter.position);
  add(new THREE.BoxGeometry(...config.regulator.size), colors.pcb, config.regulator.position);
  for (const position of config.capacitors.positions) {
    add(new THREE.CylinderGeometry(config.capacitors.radius, config.capacitors.radius, config.capacitors.height, segments), colors.metal, position);
  }
  add(new THREE.CylinderGeometry(config.inductor.radius, config.inductor.radius, config.inductor.height, segments), colors.inductor, config.inductor.position);
  for (const item of config.labels) {
    const label = createLabel(item.text, 'component-label');
    label.position.set(...item.position);
    label.element.title = desc;
    group.add(label);
  }
  return group;
}
