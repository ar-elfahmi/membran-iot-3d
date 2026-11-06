import { legend } from '../config.js';

export function createLegend() {
  const panel = document.createElement('aside');
  panel.id = 'scene-legend';
  panel.className = 'scene-panel';
  panel.setAttribute('aria-label', legend.title);
  const details = document.createElement('details');
  details.open = !legend.collapsed;
  const summary = document.createElement('summary');
  summary.textContent = legend.title;
  const content = document.createElement('div');
  content.className = 'legend-groups';
  for (const group of legend.groups) {
    const section = document.createElement('section');
    const heading = document.createElement('h2');
    heading.textContent = group.title;
    const list = document.createElement('ul');
    for (const { label, color, type } of group.items) {
      const item = document.createElement('li');
      const swatch = document.createElement('span');
      swatch.className = `legend-swatch ${type}`;
      swatch.style.setProperty('--swatch-color', color);
      swatch.setAttribute('aria-hidden', 'true');
      item.append(swatch, document.createTextNode(label));
      list.appendChild(item);
    }
    section.append(heading, list);
    content.appendChild(section);
  }
  details.append(summary, content);
  panel.appendChild(details);
  document.body.appendChild(panel);
  return panel;
}
