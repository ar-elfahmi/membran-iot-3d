import * as THREE from 'three';
import { createLabel } from '../ui/labels.js';

export function createTemperatureSensor(config, colors, material, segments) {
  const group = new THREE.Group();
  const { id, name, desc, pins } = config;
  group.name = id;
  group.userData = { id, name, desc, pins: [...pins] };
  group.position.set(...config.position);
  const metal = new THREE.MeshStandardMaterial({ color: colors.metal, ...material });
  const probe = new THREE.Mesh(new THREE.CylinderGeometry(config.probeRadius, config.probeRadius, config.probeLength, segments), metal);
  probe.position.set(...config.probePosition);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(config.collarRadius, config.collarRadius, config.collarLength, segments), metal);
  collar.position.set(...config.collarPosition);
  const head = new THREE.Mesh(new THREE.BoxGeometry(...config.headSize), new THREE.MeshStandardMaterial({ color: colors.seal, ...material }));
  head.position.set(...config.headPosition);
  probe.castShadow = collar.castShadow = head.castShadow = true;
  const label = createLabel(name, 'component-label');
  label.position.set(...config.labelOffset);
  label.element.title = desc;
  group.add(probe, collar, head, label);
  return group;
}
