import { ui } from '../config.js';

export function createLayerPanel(targets) {
  const config = ui.layerPanel;
  const panel = document.createElement('aside');
  panel.id = 'layer-panel';
  panel.className = 'scene-panel';
  panel.setAttribute('aria-label', config.title);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'layer-toggle';
  toggle.setAttribute('aria-controls', 'layer-panel-body');
  // Ikon layer tetap dikenali saat panel diciutkan pada layar kecil.
  toggle.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></svg>';
  const title = document.createElement('span');
  title.textContent = config.title;
  toggle.appendChild(title);

  const body = document.createElement('div');
  body.id = 'layer-panel-body';
  const inputs = new Map();
  const setVisible = (id, visible) => {
    for (const object of targets[id]) {
      if (id === 'labels' && object.userData.forceVisible) object.userData.beforeHighlightVisible = visible;
      object.visible = visible || (id === 'labels' && !!object.userData.forceVisible);
    }
  };
  for (const { id, label, active } of config.options) {
    const row = document.createElement('label');
    row.className = 'layer-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = id;
    input.checked = active;
    input.addEventListener('change', () => setVisible(id, input.checked));
    row.append(input, document.createTextNode(label));
    body.appendChild(row);
    inputs.set(id, input);
    setVisible(id, active);
  }

  const presets = document.createElement('div');
  presets.className = 'layer-presets';
  for (const [label, gasOnly] of [[config.gasOnly, true], [config.all, false]]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      for (const [id, input] of inputs) {
        input.checked = !gasOnly || id === 'gas';
        setVisible(id, input.checked);
      }
    });
    presets.appendChild(button);
  }
  body.appendChild(presets);
  const setExpanded = (expanded) => {
    body.hidden = !expanded;
    panel.classList.toggle('is-collapsed', !expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? config.close : config.open);
    toggle.title = expanded ? config.close : config.open;
  };
  toggle.addEventListener('click', () => setExpanded(body.hidden));
  panel.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setExpanded(false);
    toggle.focus();
  });
  const mobile = window.matchMedia('(max-width: 600px)');
  setExpanded(!mobile.matches);
  mobile.addEventListener('change', (event) => setExpanded(!event.matches));
  panel.append(toggle, body);
  document.body.appendChild(panel);
  return {
    collapse: () => setExpanded(false),
  };
}
