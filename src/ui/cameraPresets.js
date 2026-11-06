import * as THREE from 'three';
import { cameraPresets, interaction, interactionUI } from '../config.js';
import { getComponentBox } from './layout.js';

export function createCameraMotion(camera, controls) {
  let tween = null;
  const cancel = () => { tween = null; };
  controls.addEventListener('start', cancel);
  const flyTo = (position, target) => {
    // Hentikan sisa damping sebelum mengambil titik awal tween.
    const damping = controls.enableDamping;
    controls.enableDamping = false;
    controls.update();
    controls.enableDamping = damping;
    tween = {
      start: performance.now(), from: camera.position.clone(), fromTarget: controls.target.clone(),
      position: new THREE.Vector3(...position), target: new THREE.Vector3(...target),
    };
  };
  return {
    flyTo, cancel,
    focus(device) {
      const box = getComponentBox(device);
      const target = box.getCenter(new THREE.Vector3());
      const size = Math.max(interaction.focus.minSize, box.getSize(new THREE.Vector3()).length());
      const halfFov = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / camera.zoom);
      const distance = Math.max(controls.minDistance, size * interaction.focus.padding / (2 * Math.tan(halfFov) * Math.min(1, camera.aspect)));
      const position = new THREE.Vector3(...interaction.focus.direction).normalize().multiplyScalar(distance).add(target);
      flyTo(position.toArray(), target.toArray());
    },
    update(now) {
      if (!tween) return;
      const t = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : Math.min(1, (now - tween.start) / interaction.duration);
      const eased = t * t * (3 - 2 * t);
      camera.position.lerpVectors(tween.from, tween.position, eased);
      controls.target.lerpVectors(tween.fromTarget, tween.target, eased);
      if (t === 1) tween = null;
    },
  };
}

export function createCameraPresets(motion, onPreset) {
  const bar = document.createElement('nav');
  bar.id = 'camera-presets';
  bar.className = 'scene-panel';
  bar.setAttribute('aria-label', interactionUI.camera);
  const buttons = [];
  const activate = (preset) => {
    onPreset();
    motion.flyTo(preset.position, preset.target);
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.preset === preset.id));
  };
  for (const preset of cameraPresets) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = preset.label;
    button.dataset.preset = preset.id;
    button.setAttribute('aria-pressed', String(preset === cameraPresets[0]));
    button.addEventListener('click', () => activate(preset));
    bar.appendChild(button);
    buttons.push(button);
  }
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.textContent = interactionUI.reset;
  reset.addEventListener('click', () => activate(cameraPresets[0]));
  bar.appendChild(reset);
  document.body.appendChild(bar);
  return { clear: () => buttons.forEach((button) => button.setAttribute('aria-pressed', 'false')) };
}
