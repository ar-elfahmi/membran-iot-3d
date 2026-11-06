import * as THREE from 'three';
import { createLabel } from '../ui/labels.js';

export function createMembraneModule(config) {
  const group = new THREE.Group();
  const { id, name, desc, pins, colors, segments } = config;
  group.name = id;
  group.userData = { id, name, desc, pins: [...pins] };
  group.position.set(...config.position);
  const metal = new THREE.MeshStandardMaterial({ color: colors.metal, ...config.material });

  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = config.fiber.textureSize;
  const context = canvas.getContext('2d');
  context.fillStyle = colors.fiber;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = colors.fiberLine;
  // U membentang keliling silinder; garis V mengikuti panjang hollow fiber.
  for (let x = 0; x < canvas.width; x += config.fiber.stripeSpacing) {
    context.fillRect(x, 0, config.fiber.stripeWidth, canvas.height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const fiber = new THREE.Mesh(
    new THREE.CylinderGeometry(config.fiber.radius, config.fiber.radius, config.fiber.length, segments),
    new THREE.MeshStandardMaterial({ map: texture, roughness: config.fiber.roughness }),
  );
  fiber.rotation.z = Math.PI / 2;
  fiber.castShadow = true;
  group.add(fiber);

  const housing = new THREE.Mesh(
    new THREE.CylinderGeometry(config.housing.radius, config.housing.radius, config.housing.length, segments, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: colors.housing, transparent: true, opacity: config.housing.opacity,
      roughness: config.housing.roughness, metalness: config.housing.metalness,
      transmission: 0, depthWrite: false, side: THREE.DoubleSide,
    }),
  );
  housing.rotation.z = Math.PI / 2;
  group.add(housing);

  for (const position of config.endCaps.positions) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(config.endCaps.radius, config.endCaps.radius, config.endCaps.length, segments), metal);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(...position);
    cap.castShadow = true;
    group.add(cap);
    for (const offset of config.flange.offsets) {
      const flange = new THREE.Mesh(new THREE.TorusGeometry(config.flange.radius, config.flange.tube, 12, segments), metal);
      flange.rotation.y = Math.PI / 2;
      flange.position.set(position[0] + offset, position[1], position[2]);
      flange.castShadow = true;
      group.add(flange);
    }
  }

  for (const port of config.ports) {
    const connector = new THREE.Mesh(
      new THREE.CylinderGeometry(port.radius, port.radius, port.length, segments),
      new THREE.MeshStandardMaterial({ color: colors[port.color], ...config.material }),
    );
    connector.position.set(...port.position);
    connector.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...port.direction));
    connector.userData = { id: port.id, name: port.name, desc: port.desc, pins: [] };
    connector.castShadow = true;
    group.add(connector);
  }
  const label = createLabel(config.label.text, 'component-label membrane-label');
  label.position.set(...config.label.position);
  label.element.title = desc;
  group.add(label);
  return group;
}
