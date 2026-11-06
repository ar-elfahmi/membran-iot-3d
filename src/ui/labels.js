import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { labelConfig } from '../config.js';
import { getComponentBox } from './layout.js';

export function createLabel(text, className) {
  const element = document.createElement('div');
  element.className = className;
  element.textContent = text;
  return new CSS2DObject(element);
}

export function createLabelUpdater(scene, camera, devices) {
  const labels = [];
  const boxes = devices.map((owner) => ({ owner, box: getComponentBox(owner) }));
  scene.traverse((label) => {
    if (!label.isCSS2DObject) return;
    let owner = label.parent;
    while (owner && !owner.userData.id) owner = owner.parent;
    const zone = label.element.classList.contains('zone-label');
    label.userData.priority = labelConfig.priority[zone ? 'zone' : owner?.userData.id] ?? labelConfig.priority.default;
    labels.push({ label, owner, zone });
  });
  let frame = 0;
  return () => {
    if (frame++ % labelConfig.throttleFrames) return;
    const cameraPosition = camera.getWorldPosition(new THREE.Vector3());
    const entries = labels.map((entry) => {
      const position = entry.label.getWorldPosition(new THREE.Vector3());
      return { ...entry, position, distance: cameraPosition.distanceTo(position) };
    }).sort((a, b) => b.label.userData.priority - a.label.userData.priority || a.distance - b.distance);
    const accepted = [];
    for (const { label, owner, zone, position, distance } of entries) {
      let visible = true;
      for (let node = label; node; node = node.parent) visible &&= node.visible;
      if (!visible) continue;
      const projected = position.clone().project(camera);
      const rect = label.element.getBoundingClientRect();
      let opacity = THREE.MathUtils.lerp(1, labelConfig.farOpacity, THREE.MathUtils.smoothstep(distance, labelConfig.farStart, labelConfig.farEnd));
      if (zone) opacity *= labelConfig.zoneOpacity;
      else {
        const ray = new THREE.Ray(cameraPosition, position.clone().sub(cameraPosition).normalize());
        if (boxes.some(({ owner: other, box }) => {
          if (other === owner || !other.visible) return false;
          const hit = ray.intersectBox(box, new THREE.Vector3());
          return hit && hit.distanceTo(cameraPosition) < distance;
        })) opacity *= labelConfig.occludedOpacity;
      }
      const gap = labelConfig.gap;
      const overlaps = accepted.some((other) => rect.left < other.right + gap && rect.right + gap > other.left && rect.top < other.bottom + gap && rect.bottom + gap > other.top);
      if (projected.z < -1 || projected.z > 1 || overlaps || !rect.width || !rect.height) opacity = 0;
      label.element.style.opacity = String(opacity);
      label.element.setAttribute('aria-hidden', String(opacity === 0));
      if (opacity > 0) accepted.push(rect);
    }
  };
}
