import { cables, info, interactionUI as text, legend, zones } from '../config.js';

export function getConnections(device, devices) {
  const endpoint = (value) => {
    const dot = value.indexOf('.');
    const id = value.slice(0, dot);
    return { id: cables.aliases[id] ?? id, pin: value.slice(dot + 1) };
  };
  return cables.connections.flatMap((connection) => {
    const from = endpoint(connection.from), to = endpoint(connection.to);
    const local = from.id === device.userData.id ? from : to.id === device.userData.id ? to : null;
    if (!local) return [];
    const other = local === from ? to : from;
    const peer = devices.find((item) => item.userData.id === other.id);
    return peer ? [{ ...connection, peer, pin: local.pin, peerPin: other.pin }] : [];
  });
}

export function createInfoPanel(devices, onSelect, onClose) {
  const panel = document.createElement('aside');
  panel.id = 'info-panel';
  panel.className = 'scene-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', text.panel);
  const add = (parent, tag, content, className) => {
    const element = document.createElement(tag);
    if (content != null) element.textContent = content;
    if (className) element.className = className;
    parent.appendChild(element);
    return element;
  };
  const button = (parent, label, action) => {
    const element = add(parent, 'button', label);
    element.type = 'button';
    element.addEventListener('click', action);
    return element;
  };
  const header = add(panel, 'div', null, 'info-header');
  const title = add(header, 'h2');
  title.id = 'info-title';
  panel.setAttribute('aria-labelledby', title.id);
  const close = button(header, text.close, onClose);
  const content = add(panel, 'div', null, 'info-content');
  const render = (device) => {
    title.textContent = device.userData.name;
    content.replaceChildren();
    const zone = zones.find((item) => item.regions.some((ids) => ids.includes(device.userData.id)));
    add(content, 'p', zone?.name ?? zones.find((item) => item.category === 'sensing')?.name, 'info-zone');
    add(content, 'p', device.userData.desc);
    if (device.setOpen || device.setRunning) {
      add(content, 'p', text.demo, 'info-note');
      const state = add(content, 'p');
      state.setAttribute('role', 'status');
      const action = button(content, '', () => {
        if (device.setOpen) device.setOpen(device.userData.state !== 'open');
        else device.setRunning(device.userData.state !== 'running');
        updateState();
      });
      const updateState = () => {
        state.textContent = text.states[device.userData.state];
        action.textContent = text.actions[device.userData.state];
      };
      updateState();
    }
    add(content, 'h3', text.connections);
    const connections = getConnections(device, devices);
    if (!connections.length) add(content, 'p', text.emptyConnections, 'info-note');
    const list = add(content, 'ul', null, 'info-connections');
    for (const connection of connections) {
      const row = add(list, 'li');
      const link = button(row, connection.peer.userData.name, () => onSelect(connection.peer));
      const signal = legend.groups[0].items.find((item) => item.color === cables.colors[connection.type]);
      const swatch = add(link, 'span', null, 'legend-swatch cable');
      swatch.style.setProperty('--swatch-color', cables.colors[connection.type]);
      swatch.setAttribute('aria-hidden', 'true');
      add(row, 'span', `${signal?.label ?? connection.type} · ${connection.pin} → ${connection.peerPin}`, 'info-note');
    }
    const peers = [...new Set(connections.map((connection) => connection.peer))];
    const navigation = add(content, 'div', null, 'info-navigation');
    for (const [symbol, label, index] of [['←', text.previous, peers.length - 1], ['→', text.next, 0]]) {
      const arrow = button(navigation, symbol, () => onSelect(peers[index]));
      arrow.setAttribute('aria-label', label);
      arrow.title = peers[index]?.userData.name ?? label;
      arrow.disabled = !peers.length;
    }
    add(content, 'h3', text.pins);
    const ports = Object.keys(device.userData.ports ?? {});
    if (!ports.length) add(content, 'p', text.emptyPins, 'info-note');
    else {
      const table = add(content, 'table');
      const heading = add(add(table, 'thead'), 'tr');
      for (const label of [text.pin, text.endpoint]) add(heading, 'th', label).scope = 'col';
      const body = add(table, 'tbody');
      for (const pin of ports) {
        const row = add(body, 'tr');
        add(row, 'th', pin).scope = 'row';
        add(row, 'td', connections.filter((entry) => entry.pin === pin).map((entry) => `${entry.peer.userData.name} · ${entry.peerPin}`).join(', ') || text.unconnected);
      }
    }
    add(content, 'h3', text.specs);
    const specs = info[device.userData.id]?.specs ?? [];
    if (!specs.length) add(content, 'p', text.emptySpecs, 'info-note');
    else {
      const list = add(content, 'dl');
      for (const spec of specs) { add(list, 'dt', spec.label); add(list, 'dd', spec.value); }
    }
    panel.hidden = false;
    document.body.classList.add('has-selection');
    panel.scrollTop = 0;
    close.focus({ preventScroll: true });
  };
  // Pemilih native menyediakan jalur keyboard yang setara dengan klik scene.
  const chooser = document.createElement('select');
  chooser.id = 'component-picker';
  chooser.setAttribute('aria-label', text.choose);
  chooser.add(new Option(text.choose, ''));
  for (const device of devices) chooser.add(new Option(device.userData.name, device.userData.id));
  chooser.addEventListener('change', () => {
    const device = devices.find((item) => item.userData.id === chooser.value);
    if (device) onSelect(device);
    else onClose();
  });
  document.getElementById('layer-panel-body').appendChild(chooser);
  document.body.appendChild(panel);
  return {
    show(device) { chooser.value = device.userData.id; render(device); },
    close() {
      const hadFocus = panel.contains(document.activeElement);
      panel.hidden = true;
      chooser.value = '';
      document.body.classList.remove('has-selection');
      if (hadFocus) document.querySelector('#viewport canvas').focus({ preventScroll: true });
    },
  };
}
