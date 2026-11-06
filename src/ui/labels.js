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
    const boxes = devices.map((owner) => ({ owner, box: getComponentBox(owner) }));
    const viewport = document.getElementById('viewport').getBoundingClientRect();
    const screenBox = (box) => {
      const points = [];
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        const point = new THREE.Vector3(x, y, z).project(camera);
        points.push({ x: viewport.left + (point.x + 1) * viewport.width / 2, y: viewport.top + (1 - point.y) * viewport.height / 2 });
      }
      return { left: Math.min(...points.map((p) => p.x)), right: Math.max(...points.map((p) => p.x)), top: Math.min(...points.map((p) => p.y)), bottom: Math.max(...points.map((p) => p.y)) };
    };
    const deviceRects = boxes.map(({ box }) => screenBox(box));
    const zoneRects = [];
    for (const { label, zone } of labels) {
      if (!zone || !label.userData.border) continue;
      // Sudut kiri atas kotak di layar, label berjangkar di atas sisi luarnya.
      const borderBox = new THREE.Box3().setFromObject(label.userData.border);
      const rect = screenBox(borderBox);
      const members = boxes.flatMap(({ owner }, index) => label.userData.regionIds.includes(owner.userData.id) ? [deviceRects[index]] : []);
      let bottom = Math.min(rect.top, ...members.map((member) => member.top)) - labelConfig.zoneScreenGap;
      const width = label.element.offsetWidth, height = label.element.offsetHeight;
      const left = rect.left - width - labelConfig.zoneScreenGap;
      // Jauhkan juga dari perangkat zona tetangga tanpa masuk ke dalam kotak zona.
      const obstacles = [...deviceRects, ...zoneRects];
      for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles.find((other) => left < other.right && left + width > other.left && bottom - height < other.bottom && bottom > other.top);
        if (!obstacle) break;
        bottom = obstacle.top - labelConfig.zoneScreenGap;
      }
      zoneRects.push({ left, right: left + width, top: bottom - height, bottom });
      const depth = borderBox.getCenter(new THREE.Vector3()).project(camera).z;
      label.position.copy(new THREE.Vector3(
        (left - viewport.left) / viewport.width * 2 - 1,
        1 - (bottom - viewport.top) / viewport.height * 2,
        depth,
      ).unproject(camera));
    }
    const cameraPosition = camera.getWorldPosition(new THREE.Vector3());
    const entries = labels.map((entry) => {
      const position = entry.label.getWorldPosition(new THREE.Vector3());
      return { ...entry, position, distance: cameraPosition.distanceTo(position) };
    }).sort((a, b) => Number(!!b.label.userData.forceLabel) - Number(!!a.label.userData.forceLabel) || b.label.userData.priority - a.label.userData.priority || a.distance - b.distance);
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
      if (zone && deviceRects.some((other) => rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top)) opacity = 0;
      if (label.userData.forceLabel && projected.z >= -1 && projected.z <= 1) opacity = 1;
      label.element.style.opacity = String(opacity);
      label.element.setAttribute('aria-hidden', String(opacity === 0));
      if (opacity > 0) accepted.push(rect);
    }
  };
}
