import * as THREE from 'three';
import { createLabel } from '../ui/labels.js';

export function createHBridge(config) {
  const group = new THREE.Group();
  const { id, name, desc, pins, colors, material, segments } = config;
  group.name = id;
  group.position.set(...config.position);
  group.userData = { id, name, desc, pins: [...pins] };
  group.userData.ports = Object.fromEntries(Object.entries(config.electricalPorts).map(([port, position]) => [port, new THREE.Vector3(...position)]));
  const add = (geometry, color, position) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, ...material }));
    mesh.position.set(...position);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  };
  add(new THREE.BoxGeometry(...config.board.size), colors.pcb, config.board.position);
  for (const position of config.heatsinks.positions) {
    const sink = add(new THREE.BoxGeometry(...config.heatsinks.size), colors.dark, position);
    for (let index = 0; index < config.heatsinks.fins; index++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(...config.heatsinks.finSize), sink.material);
      fin.position.set(config.heatsinks.finStart + index * config.heatsinks.finPitch, config.heatsinks.finY, 0);
      fin.castShadow = true;
      sink.add(fin);
    }
  }
  pins.filter((pin) => pin.startsWith('OUT')).forEach((pin, index) => {
    const position = [...config.outputs.start];
    position[0] += index * config.outputs.pitch;
    const terminal = add(new THREE.BoxGeometry(...config.outputs.size), colors.terminal, position);
    terminal.name = pin;
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(config.outputs.screwRadius, config.outputs.screwRadius, config.outputs.screwDepth, segments), new THREE.MeshStandardMaterial({ color: colors.metal, ...material }));
    screw.position.y = config.outputs.screwY;
    terminal.add(screw);
  });
  pins.filter((pin) => !pin.startsWith('OUT')).forEach((pin, index) => {
    const position = [...config.header.start];
    position[0] += index * config.header.pitch;
    add(new THREE.BoxGeometry(...config.header.size), colors.pin, position).name = pin;
  });
  const label = createLabel(name, 'component-label');
  label.position.set(...config.labelOffset);
  label.element.title = `${desc} · ${pins.join(', ')}`;
  group.add(label);
  return group;
}
