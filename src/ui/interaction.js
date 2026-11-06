import * as THREE from 'three';
import { interaction as config } from '../config.js';

export function createInteraction({ camera, canvas, devices, motion, panel, onSelect }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const owners = new Map();
  const materials = new Map();
  const labels = new Map();
  for (const device of devices) {
    const ownedMaterials = new Set(), ownedLabels = [];
    const visit = (node) => {
      if (node !== device && (devices.includes(node) || node.userData.layoutAttachment)) return;
      if (node.isMesh) {
        owners.set(node, device);
        // Salinan material menjaga highlight tetap lokal; LED status tetap memakai material asli.
        const clone = (material) => {
          if (material === device.userData.statusLed?.material) return material;
          const copy = material.clone();
          ownedMaterials.add({ material: copy, color: copy.color?.clone(), emissive: copy.emissive?.clone(), intensity: copy.emissiveIntensity });
          return copy;
        };
        if (node !== device.userData.statusLed) node.material = Array.isArray(node.material) ? node.material.map(clone) : clone(node.material);
      }
      if (node.isCSS2DObject) ownedLabels.push(node);
      node.children.forEach(visit);
    };
    visit(device);
    materials.set(device, ownedMaterials);
    labels.set(device, ownedLabels);
  }
  const meshes = [...owners.keys()];
  let hovered = null, selected = null, down = null, pending = null, lastHit = 0, clickReady = false;
  const activePointers = new Set();
  const paint = (device) => {
    if (!device) return;
    const strength = device === selected ? config.selectedStrength : device === hovered ? config.hoverStrength : 0;
    for (const { material, color, emissive, intensity } of materials.get(device)) {
      if (emissive) {
        material.emissive.copy(emissive).lerp(new THREE.Color(config.highlight), strength);
        material.emissiveIntensity = strength ? Math.max(1, intensity) : intensity;
      } else if (color) material.color.copy(color).lerp(new THREE.Color(config.highlight), strength);
    }
    for (const label of labels.get(device)) {
      label.userData.forceLabel = strength > 0;
      label.element.classList.toggle('is-highlighted', strength > 0);
      // Layer label yang dimatikan tetap dipulihkan setelah hover/selection.
      if (strength && !label.userData.forceVisible) {
        label.userData.beforeHighlightVisible = label.visible;
        label.userData.forceVisible = true;
      }
      if (strength) label.visible = true;
      else if (label.userData.forceVisible) {
        label.visible = label.userData.beforeHighlightVisible;
        label.userData.forceVisible = false;
      }
    }
  };
  const hover = (device) => {
    if (hovered === device) return;
    const previous = hovered;
    hovered = device;
    paint(previous); paint(hovered);
    canvas.style.cursor = hovered ? 'pointer' : '';
  };
  const hit = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    camera.updateMatrixWorld();
    raycaster.setFromCamera(pointer, camera);
    const intersection = raycaster.intersectObjects(meshes, false).find(({ object }) => {
      for (let node = object; node; node = node.parent) if (!node.visible) return false;
      return true;
    });
    return owners.get(intersection?.object) ?? null;
  };
  const select = (device) => {
    const previous = selected;
    selected = device;
    paint(previous); paint(selected);
    if (device) {
      panel.show(device);
      onSelect();
      // Panel mengubah area canvas; hitung framing setelah ResizeObserver.
      requestAnimationFrame(() => { if (selected === device) motion.focus(device); });
    } else {
      motion.cancel();
      panel.close();
    }
  };
  canvas.addEventListener('pointerdown', (event) => {
    clickReady = false;
    activePointers.add(event.pointerId);
    if (activePointers.size > 1) { down = null; return; }
    if (event.button === 0) down = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    hover(null);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) >= config.clickDistance) down.moved = true;
    if (!activePointers.size && event.pointerType !== 'touch') pending = { clientX: event.clientX, clientY: event.clientY };
  });
  canvas.addEventListener('pointerup', (event) => {
    activePointers.delete(event.pointerId);
    const click = down && down.id === event.pointerId && !down.moved && Math.hypot(event.clientX - down.x, event.clientY - down.y) < config.clickDistance;
    down = null;
    clickReady = click;
  });
  // Tunggu click native agar perubahan layout panel tidak menerima ghost click sentuh.
  canvas.addEventListener('click', (event) => {
    if (clickReady) select(hit(event));
    clickReady = false;
  });
  canvas.addEventListener('pointercancel', (event) => { activePointers.delete(event.pointerId); down = null; pending = null; hover(null); });
  canvas.addEventListener('pointerleave', () => { pending = null; hover(null); });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    select(null); hover(null); pending = null;
  });
  return {
    select,
    update(now) {
      if (!pending || activePointers.size || now - lastHit < config.hoverInterval) return;
      lastHit = now;
      hover(hit(pending));
    },
  };
}
