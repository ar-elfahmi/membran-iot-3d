import * as THREE from 'three';
import { layout } from '../config.js';

// Box3 badan perangkat, terpisah dari anak ber-ID sendiri serta jalur pipa/selang.
// CSS2D label tidak memiliki geometri; keterbacaannya diperiksa melalui browser.
export function checkLayoutOverlap(components) {
  const boxes = components.map((component) => {
    component.updateWorldMatrix(true, true);
    const box = new THREE.Box3();
    const visit = (node) => {
      if (node !== component && (node.userData.id || node.userData.layoutAttachment)) return;
      if (node.isMesh) {
        node.geometry.computeBoundingBox();
        box.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld));
      }
      node.children.forEach(visit);
    };
    visit(component);
    return { id: component.userData.id, box };
  });
  const overlaps = [];
  const contacts = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.id === b.id || !a.box.intersectsBox(b.box)) continue;
      const pair = [a.id, b.id];
      if (layout.contacts.some((contact) => pair.every((id) => contact.includes(id)))) {
        contacts.push(pair);
      } else {
        overlaps.push(pair);
        console.warn('[layout] Bounding box berpotongan:', ...pair);
      }
    }
  }
  return { checked: boxes.length, overlaps, contacts };
}
