import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createLabel } from '../ui/labels.js';

function device(config) {
  const group = new THREE.Group();
  const { id, name, desc, pins } = config;
  group.name = id;
  group.userData = { id, name, desc, pins: [...pins] };
  group.position.set(...config.position);
  const label = createLabel(config.label ?? name, 'component-label');
  label.element.style.whiteSpace = 'pre-line';
  label.element.title = desc;
  label.position.set(...config.labelOffset);
  group.add(label);
  return group;
}

function mesh(parent, geometry, color, position, material) {
  const part = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, ...material }));
  part.position.set(...position);
  part.castShadow = true;
  parent.add(part);
  return part;
}

function box(parent, size, position, color, material) {
  return mesh(parent, new THREE.BoxGeometry(...size), color, position, material);
}

function screen(parent, size, position, config) {
  const canvas = document.createElement('canvas');
  const { dashboard: ui, colors } = config;
  [canvas.width, canvas.height] = ui.canvasSize;
  const context = canvas.getContext('2d');
  context.fillStyle = colors.screen;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const text = (value, x, y, size, color) => {
    context.font = `${size}px ${ui.font}`;
    context.fillStyle = color;
    context.fillText(value, x, y);
  };
  text(ui.title, ui.padding, ui.titleY, ui.titleFont, colors.ink);
  text(ui.demo, ui.padding, ui.demoY, ui.smallFont, colors.muted);
  text(ui.status, ui.padding, ui.statusY, ui.bodyFont, colors.accent);
  ui.metrics.forEach((metric, index) => {
    const y = ui.rowY + index * ui.rowHeight;
    text(metric.label, ui.padding, y, ui.bodyFont, colors.muted);
    text(metric.value, ui.valueX, y, ui.valueFont, colors.ink);
  });
  text(ui.chartTitle, ui.padding, ui.chartTitleY, ui.bodyFont, colors.ink);
  const [x, y, width, height] = ui.chart;
  context.strokeStyle = colors.accent;
  context.lineWidth = ui.chartLineWidth;
  context.beginPath();
  ui.chartValues.forEach((value, index) => {
    const point = [x + index * width / (ui.chartValues.length - 1), y + (1 - value) * height];
    if (index === 0) context.moveTo(...point);
    else context.lineTo(...point);
  });
  context.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const display = new THREE.Mesh(new THREE.PlaneGeometry(...size), new THREE.MeshBasicMaterial({ map: texture }));
  display.position.set(...position);
  parent.add(display);
  return { canvas, texture };
}

export function createWifiModule(config) {
  const group = device(config);
  const { wifi: style, colors, material, segments } = config;
  box(group, style.size, style.position, colors.case, material);
  mesh(group, new THREE.CylinderGeometry(style.mastRadius, style.mastRadius, style.mastLength, segments), colors.silver, style.mastPosition, material);
  mesh(group, new THREE.SphereGeometry(style.tipRadius, segments, segments), colors.green, style.tipPosition, material);
  for (const radius of style.arcs) {
    const arc = mesh(group, new THREE.TorusGeometry(radius, style.arcTube, style.arcRadialSegments, segments, style.arcAngle), colors.green, style.arcPosition, material);
    arc.rotation.z = style.arcRotation;
  }
  return group;
}

export function createMqttBroker(config) {
  const group = device(config);
  const { mqtt: style, colors, material, segments } = config;
  box(group, style.size, style.position, colors.rack, material);
  style.bays.forEach((y, index) => {
    box(group, style.baySize, [0, y, style.bayZ], colors.dark, material);
    mesh(group, new THREE.SphereGeometry(style.ledRadius, segments, segments), style.ledColors[index], [style.ledX, y, style.ledZ], { ...material, emissive: style.ledColors[index], emissiveIntensity: style.ledIntensity });
  });
  return group;
}

export function createCloud(config) {
  const group = device(config);
  for (const sphere of config.cloud.spheres) {
    mesh(group, new THREE.SphereGeometry(sphere.radius, config.segments, config.segments), config.colors.cloud, sphere.position, config.material);
  }
  return group;
}

export function createPhone(config) {
  const group = device(config);
  const { phone: style, colors, material } = config;
  const geometry = new RoundedBoxGeometry(...style.size, style.curveSegments, style.radius);
  mesh(group, geometry, colors.dark, style.position, material);
  box(group, style.speakerSize, style.speakerPosition, colors.silver, material);
  const display = screen(group, style.screenSize, style.screenPosition, config);
  group.userData.screenCanvas = display.canvas;
  group.userData.screenTexture = display.texture;
  return group;
}

export function createLaptop(config) {
  const group = device(config);
  const { laptop: style, colors, material } = config;
  box(group, style.baseSize, style.basePosition, colors.silver, material);
  box(group, style.keyboardSize, style.keyboardPosition, colors.dark, material);
  box(group, style.touchpadSize, style.touchpadPosition, colors.case, material);
  const lid = new THREE.Group();
  lid.position.set(...style.screenPosition);
  lid.rotation.x = style.screenAngle;
  group.add(lid);
  box(lid, style.screenSize, style.panelPosition, colors.dark, material);
  const display = screen(lid, style.displaySize, style.displayPosition, config);
  group.userData.screenCanvas = display.canvas;
  group.userData.screenTexture = display.texture;
  return group;
}
