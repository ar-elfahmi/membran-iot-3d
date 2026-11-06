import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export function createLabel(text, className) {
  const element = document.createElement('div');
  element.className = className;
  element.textContent = text;
  return new CSS2DObject(element);
}
