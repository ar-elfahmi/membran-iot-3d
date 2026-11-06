import * as THREE from 'three';
import { components, sensing, membrane as gasConfig, explode as config, interactionUI as text } from '../config.js';

export function createExplode({ devices, membrane, cables, pipes, onChange }) {
  const entries = devices.filter((device) => device !== membrane).map((device) => {
    const category = components.find((item) => item.id === device.userData.id)?.category ?? 'sensing';
    const origin = device.position.clone();
    const world = device.getWorldPosition(new THREE.Vector3());
    const destination = device.parent.worldToLocal(world.add(new THREE.Vector3(...config.offsets[category])));
    return { object: device, origin, offset: destination.sub(origin) };
  });
  entries.push({ object: membrane.userData.housing, origin: membrane.userData.housing.position.clone(), offset: new THREE.Vector3(...config.offsets.housing) });
  const offsets = new Map(entries.filter(({ object }) => object.userData.id).map(({ object, offset }) => [object.userData.id, offset]));
  const zero = new THREE.Vector3();
  const tubes = [];
  const anchored = [];
  const pipeSections = new Map();
  const rememberTube = (mesh, start, end) => {
    tubes.push({ mesh, start, end, original: mesh.geometry.attributes.position.array.slice() });
  };
  for (const pipe of pipes.values()) {
    const sections = [];
    const arrow = pipe.children.find((object) => object.geometry?.type === 'ConeGeometry');
    const at = gasConfig.routes.find((route) => route.id === pipe.name).arrowAt;
    for (const mesh of pipe.children.filter((object) => object.userData.pipeSpan)) {
      const { from, to } = mesh.userData.pipeSpan;
      const start = pipe.userData.gaps.find((gap) => gap.to === from);
      const end = pipe.userData.gaps.find((gap) => gap.from === to);
      const startOffset = offsets.get(start?.id) ?? zero, endOffset = offsets.get(end?.id) ?? zero;
      rememberTube(mesh, startOffset, endOffset);
      sections.push({ from, to, startOffset, endOffset });
      if (arrow && at >= from && at <= to) {
        const t = (at - from) / (to - from);
        anchored.push({ object: arrow, origin: arrow.position.clone(), offset: startOffset.clone().lerp(endOffset, t * t * (3 - 2 * t)) });
      }
    }
    pipeSections.set(pipe.name, sections);
  }
  const sensor = devices.find((device) => device.userData.id === 'sdp31');
  for (const connection of sensor.children.filter((object) => object.userData.gasLayer)) {
    const hose = connection.children.find((object) => object.userData.pressureHose);
    const port = sensing.sdp31.ports.find((port) => port.name === hose.userData.port);
    const section = pipeSections.get(port.route).find(({ from, to }) => port.at >= from && port.at <= to);
    const t = (port.at - section.from) / (section.to - section.from);
    const pipeShift = section.startOffset.clone().lerp(section.endOffset, t * t * (3 - 2 * t));
    pipeShift.applyMatrix3(new THREE.Matrix3().setFromMatrix4(pipes.get(port.route).matrixWorld));
    const sensorShift = offsets.get('sdp31').clone().applyMatrix3(new THREE.Matrix3().setFromMatrix4(sensor.parent.matrixWorld));
    const shift = pipeShift.sub(sensorShift).applyMatrix3(new THREE.Matrix3().setFromMatrix4(sensor.matrixWorld).invert());
    for (const mesh of connection.children) {
      if (mesh.geometry.type === 'TubeGeometry') rememberTube(mesh, zero, shift);
      else anchored.push({ object: mesh, origin: mesh.position.clone(), offset: shift });
    }
  }
  const section = document.createElement('section');
  section.className = 'explode-controls';
  const label = document.createElement('label');
  label.htmlFor = 'explode-slider';
  label.textContent = text.explode;
  const output = document.createElement('output');
  output.htmlFor = 'explode-slider';
  output.textContent = '0%';
  const slider = document.createElement('input');
  slider.id = 'explode-slider';
  slider.type = 'range'; slider.min = '0'; slider.max = '100'; slider.value = '0';
  const hint = document.createElement('p');
  hint.id = 'explode-hint';
  hint.textContent = text.explodeHint;
  hint.hidden = true;
  slider.setAttribute('aria-describedby', hint.id);
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.textContent = text.reassemble;
  let target = 0, current = 0, suspended = false, lastTime = performance.now();
  const change = () => {
    target = Number(slider.value) / 100;
    output.value = `${slider.value}%`;
  };
  slider.addEventListener('input', change);
  reset.addEventListener('click', () => { slider.value = '0'; change(); });
  label.appendChild(output);
  section.append(label, slider, reset, hint);
  document.getElementById('layer-panel-body').appendChild(section);
  return {
    update(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      if (current === target) return;
      current = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? target : THREE.MathUtils.lerp(current, target, 1 - Math.exp(-config.speed * dt));
      if (Math.abs(current - target) < config.epsilon) current = target;
      for (const { object, origin, offset } of entries) object.position.copy(origin).addScaledVector(offset, current);
      for (const { object, origin, offset } of anchored) object.position.copy(origin).addScaledVector(offset, current);
      // Geser tiap ring TubeGeometry; ujung tepat mengikuti port, bentuk asli pulih di 0.
      for (const { mesh, start, end, original } of tubes) {
        const geometry = mesh.geometry;
        const { tubularSegments, radialSegments } = geometry.parameters;
        const position = geometry.attributes.position;
        for (let ring = 0; ring <= tubularSegments; ring++) {
          const t = ring / tubularSegments;
          const eased = t * t * (3 - 2 * t);
          const offset = start.clone().lerp(end, eased).multiplyScalar(current);
          for (let side = 0; side <= radialSegments; side++) {
            const index = ring * (radialSegments + 1) + side;
            position.setXYZ(index, original[index * 3] + offset.x, original[index * 3 + 1] + offset.y, original[index * 3 + 2] + offset.z);
          }
        }
        position.needsUpdate = true;
        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();
        geometry.computeBoundingBox();
      }
      const exploded = current > 0;
      if (exploded !== suspended) {
        suspended = exploded;
        cables.visible = !exploded;
        hint.hidden = !exploded;
      }
      onChange();
    },
  };
}
