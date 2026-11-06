import * as THREE from 'three';
import { createLabel } from '../ui/labels.js';

export function createFlowMeter(config, style, colors, material, segments) {
  const group = new THREE.Group();
  const { id, name, desc, pins } = config;
  group.name = id;
  group.userData = { id, name, desc, pins: [...pins] };
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(style.radius, style.radius, style.length, segments),
    new THREE.MeshStandardMaterial({ color: colors.metal, ...material }),
  );
  body.rotation.z = Math.PI / 2;
  const display = new THREE.Mesh(new THREE.BoxGeometry(...style.displaySize), new THREE.MeshStandardMaterial({ color: colors.display, ...material }));
  display.position.set(...style.displayPosition);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(...style.screenSize), new THREE.MeshBasicMaterial({ color: colors.displayText }));
  screen.position.set(...style.screenPosition);
  body.castShadow = display.castShadow = true;
  const label = createLabel(name, 'component-label');
  label.element.title = desc;
  label.position.set(...style.labelOffset);
  group.add(body, display, screen, label);
  return group;
}
