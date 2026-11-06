import * as THREE from 'three';
import { createLabel } from '../ui/labels.js';

// Sumbu port lokal X; penempatan mengikuti bagian lurus kurva pipa.
export function createSolenoidValve(config) {
  const group = new THREE.Group();
  const { id, name, desc, pins, colors, material, segments } = config;
  group.name = id;
  group.userData = { id, name, desc, pins: [...pins], state: 'open' };
  group.userData.ports = Object.fromEntries(Object.entries(config.electricalPorts).map(([port, position]) => [port, new THREE.Vector3(...position)]));
  const add = (geometry, color, position) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, ...material }));
    mesh.position.set(...position);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  };
  add(new THREE.BoxGeometry(...config.body.size), colors.brass, config.body.position);
  for (const position of config.port.positions) {
    add(new THREE.CylinderGeometry(config.port.radius, config.port.radius, config.port.length, segments), colors.brass, position).rotation.z = Math.PI / 2;
  }
  add(new THREE.CylinderGeometry(config.coil.radius, config.coil.radius, config.coil.length, segments), colors.dark, config.coil.position);
  config.terminals.positions.forEach((position, index) => {
    add(new THREE.BoxGeometry(...config.terminals.size), colors.pin, position).name = pins[index];
  });
  for (const position of config.bolts.positions) {
    add(new THREE.CylinderGeometry(config.bolts.radius, config.bolts.radius, config.bolts.length, segments), colors.metal, position);
  }
  const led = add(new THREE.SphereGeometry(config.led.radius, segments, segments), colors.open, config.led.position);
  led.material.emissiveIntensity = config.led.intensity;
  group.userData.statusLed = led;
  group.setOpen = (open) => {
    if (typeof open !== 'boolean') throw new TypeError('setOpen memerlukan boolean.');
    group.userData.state = open ? 'open' : 'closed';
    led.material.color.set(open ? colors.open : colors.closed);
    led.material.emissive.copy(led.material.color);
  };
  group.setOpen(true);
  const label = createLabel(name, 'component-label');
  label.position.set(...config.labelOffset);
  label.element.title = desc;
  group.add(label);
  return group;
}
