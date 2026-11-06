import * as THREE from 'three';
import { palette, sceneConfig } from '../config.js';
import { createLabel } from '../ui/labels.js';

// Satu komponen generik selama tahap placeholder; belum ada model perangkat.
export function createPlaceholder(component) {
  const group = new THREE.Group();
  const { size, labelOffset, roughness, metalness } = sceneConfig.placeholder;
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color: palette[component.category], roughness, metalness }),
  );
  box.castShadow = true;
  box.receiveShadow = true;
  group.name = component.id;
  group.userData = { id: component.id, name: component.name, desc: component.desc, pins: [...component.pins] };
  group.position.set(...component.position);
  const label = createLabel(component.name, 'component-label');
  label.element.title = component.desc;
  label.position.set(...labelOffset);
  group.add(box, label);
  return group;
}
