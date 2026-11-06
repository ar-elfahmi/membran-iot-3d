import * as THREE from 'three';
import { createLabel } from '../ui/labels.js';

export function createPump(config) {
  const group = new THREE.Group();
  const { id, name, desc, pins, colors, material, segments } = config;
  group.name = id;
  group.userData = { id, name, desc, pins: [...pins], state: 'running' };
  group.userData.ports = Object.fromEntries(Object.entries(config.electricalPorts).map(([port, position]) => [port, new THREE.Vector3(...position)]));
  const add = (geometry, color, position, parent = group) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, ...material }));
    mesh.position.set(...position);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const volute = add(new THREE.CylinderGeometry(config.volute.radius, config.volute.radius, config.volute.depth, segments), colors.pump, config.volute.position);
  volute.rotation.x = Math.PI / 2;
  Object.assign(volute.material, { transparent: true, opacity: config.volute.opacity, depthWrite: false });
  const motor = add(new THREE.CylinderGeometry(config.motor.radius, config.motor.radius, config.motor.length, segments), colors.dark, config.motor.position);
  motor.rotation.x = Math.PI / 2;
  add(new THREE.BoxGeometry(...config.base.size), colors.metal, config.base.position);
  add(new THREE.CylinderGeometry(config.inlet.radius, config.inlet.radius, config.inlet.length, segments), colors.metal, config.inlet.position).rotation.z = Math.PI / 2;
  // Keluar tangensial dari volute, lalu elbow kembali ke sumbu sambungan X.
  const outletCurve = new THREE.CatmullRomCurve3(config.outlet.points.map((point) => new THREE.Vector3(...point)));
  add(new THREE.TubeGeometry(outletCurve, config.outlet.segments, config.outlet.radius, segments, false), colors.pump, [0, 0, 0]);

  const rotor = new THREE.Group();
  rotor.position.set(...config.rotor.position);
  const hub = add(new THREE.CylinderGeometry(config.rotor.hubRadius, config.rotor.hubRadius, config.rotor.depth, segments), colors.rotor, [0, 0, 0], rotor);
  hub.rotation.x = Math.PI / 2;
  for (let index = 0; index < config.rotor.blades; index++) {
    const angle = index * Math.PI * 2 / config.rotor.blades;
    const blade = add(new THREE.BoxGeometry(...config.rotor.bladeSize), colors.rotor, [Math.cos(angle) * config.rotor.bladeRadius, Math.sin(angle) * config.rotor.bladeRadius, 0], rotor);
    blade.rotation.z = angle + config.rotor.bladeAngle;
  }
  group.add(rotor);
  group.userData.rotor = rotor;
  const led = add(new THREE.SphereGeometry(config.led.radius, segments, segments), colors.open, config.led.position);
  led.material.emissiveIntensity = config.led.intensity;
  group.userData.statusLed = led;
  group.setRunning = (running) => {
    if (typeof running !== 'boolean') throw new TypeError('setRunning memerlukan boolean.');
    group.userData.state = running ? 'running' : 'stopped';
    led.material.color.set(running ? colors.open : colors.closed);
    led.material.emissive.copy(led.material.color);
  };
  group.setRunning(true);
  const label = createLabel(name, 'component-label');
  label.position.set(...config.labelOffset);
  label.element.title = desc;
  group.add(label);
  return group;
}
