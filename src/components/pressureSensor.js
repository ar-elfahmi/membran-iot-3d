import * as THREE from 'three';
import { createLabel } from '../ui/labels.js';

export function createPressureSensor(config, colors, material, segments) {
  const group = new THREE.Group();
  const { id, name, desc, pins } = config;
  group.name = id;
  group.userData = { id, name, desc, pins: [...pins] };
  group.position.set(...config.position);
  const metal = new THREE.MeshStandardMaterial({ color: colors.metal, ...material });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(config.stemRadius, config.stemRadius, config.stemLength, segments), metal);
  stem.position.set(...config.stemPosition);
  const gauge = new THREE.Mesh(new THREE.CylinderGeometry(config.gaugeRadius, config.gaugeRadius, config.gaugeDepth, segments), metal);
  gauge.rotation.x = Math.PI / 2;
  gauge.position.set(...config.gaugePosition);
  const face = new THREE.Mesh(
    new THREE.CylinderGeometry(config.faceRadius, config.faceRadius, config.faceDepth, segments),
    new THREE.MeshBasicMaterial({ color: colors.dial }),
  );
  face.rotation.x = Math.PI / 2;
  face.position.set(...config.facePosition);
  const ink = new THREE.MeshBasicMaterial({ color: colors.seal });
  for (let index = 0; index < config.tickCount; index++) {
    const angle = config.tickStart + index * config.tickSweep / (config.tickCount - 1);
    const tick = new THREE.Mesh(new THREE.BoxGeometry(...config.tickSize), ink);
    tick.position.set(config.gaugePosition[0] + Math.sin(angle) * config.tickRadius, config.gaugePosition[1] + Math.cos(angle) * config.tickRadius, config.tickZ);
    tick.rotation.z = -angle;
    group.add(tick);
  }
  const needle = new THREE.Mesh(new THREE.BoxGeometry(...config.needleSize), new THREE.MeshBasicMaterial({ color: colors.needle }));
  needle.position.set(...config.needlePosition);
  needle.rotation.z = config.needleAngle;
  stem.castShadow = gauge.castShadow = true;
  const label = createLabel(name, 'component-label');
  label.position.set(...config.labelOffset);
  label.element.title = desc;
  group.add(stem, gauge, face, needle, label);
  return group;
}
