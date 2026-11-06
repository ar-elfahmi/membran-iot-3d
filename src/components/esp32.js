import * as THREE from 'three';
import { createLabel } from '../ui/labels.js';

export function createEsp32(config) {
  const group = new THREE.Group();
  const { id, name, desc, pins, colors, material } = config;
  group.name = id;
  group.userData = { id, name, desc, pins: [...pins] };
  group.userData.ports = Object.fromEntries(Object.entries(config.electricalPorts).map(([port, position]) => [port, new THREE.Vector3(...position)]));
  group.position.set(...config.position);
  const box = (size, position, color) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color, ...material }));
    mesh.position.set(...position);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  };
  box(config.board.size, config.board.position, colors.pcb);
  box(config.shield.size, config.shield.position, colors.silver);
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = config.logo.canvas;
  const context = canvas.getContext('2d');
  context.fillStyle = colors.silver;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = colors.logo;
  context.font = config.logo.font;
  context.textAlign = 'center';
  context.fillText(config.logo.text, ...config.logo.textAt);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(...config.logo.size), new THREE.MeshBasicMaterial({ map: texture }));
  logo.rotation.x = -Math.PI / 2;
  logo.position.set(...config.logo.position);
  group.add(logo);

  box(config.antenna.size, config.antenna.position, colors.black);
  const traceMaterial = new THREE.MeshStandardMaterial({ color: colors.gold, ...material });
  config.antenna.points.slice(1).forEach((point, index) => {
    const curve = new THREE.LineCurve3(new THREE.Vector3(...config.antenna.points[index]), new THREE.Vector3(...point));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, config.antenna.tubularSegments, config.antenna.radius, config.antenna.radialSegments, false), traceMaterial));
  });
  for (const x of config.header.sides) {
    for (let index = 0; index < config.header.count; index++) {
      const position = [x, config.header.y, config.header.startZ + index * config.header.pitch];
      box(config.header.socketSize, position, colors.black);
      box(config.header.pinSize, position, colors.gold);
    }
  }
  box(config.usb.size, config.usb.position, colors.silver);
  box(config.usb.openingSize, config.usb.openingPosition, colors.black);
  config.buttons.positions.forEach((position, index) => {
    box(config.buttons.size, position, colors.button).name = config.buttons.labels[index];
  });
  const buttonCanvas = document.createElement('canvas');
  [buttonCanvas.width, buttonCanvas.height] = config.buttons.legend.canvas;
  const buttonContext = buttonCanvas.getContext('2d');
  buttonContext.font = config.buttons.legend.font;
  buttonContext.fillStyle = colors.silver;
  buttonContext.textAlign = 'center';
  config.buttons.labels.forEach((text, index) => buttonContext.fillText(text, ...config.buttons.legend.textAt[index]));
  const buttonTexture = new THREE.CanvasTexture(buttonCanvas);
  buttonTexture.colorSpace = THREE.SRGBColorSpace;
  const buttonLegend = new THREE.Mesh(new THREE.PlaneGeometry(...config.buttons.legend.size), new THREE.MeshBasicMaterial({ map: buttonTexture, transparent: true }));
  buttonLegend.rotation.x = -Math.PI / 2;
  buttonLegend.position.set(...config.buttons.legend.position);
  group.add(buttonLegend);
  const led = new THREE.Mesh(new THREE.SphereGeometry(config.statusLed.radius, config.segments, config.segments), new THREE.MeshStandardMaterial({ color: colors.led, emissive: colors.led, emissiveIntensity: config.statusLed.intensity }));
  led.position.set(...config.statusLed.position);
  group.add(led);
  group.userData.statusLed = led;
  const label = createLabel(name, 'component-label');
  label.element.title = `${desc} · ${pins.join(', ')}`;
  label.position.set(...config.labelOffset);
  group.add(label);
  return group;
}
