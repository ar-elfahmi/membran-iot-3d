export const palette = {
  background: '#151719', floor: '#1c2023', grid: '#30363b', gridCenter: '#424b51',
  text: '#f1f3f4', muted: '#b6c0c7', labelBackground: '#22272b',
  sensing: '#62a9ba', controller: '#bac5cc', actuation: '#c6a477',
  membrane: '#7bac95', communication: '#8aadc2', light: '#ffffff',
  cables: { power: '#e54848', control: '#f28c28', communication: '#39a85b', data: '#368ce7', gnd: '#111111' },
};

export const ui = {
  title: 'Smart Mixed-Matrix Membrane Gas Separation System',
  subtitle: 'Model 3D interaktif · Tata letak awal sistem IoT',
  instructions: 'Klik / tap: detail · Seret: putar · Scroll / cubit: zoom · Esc: tutup',
  scope: 'Slice 7 · Eksplorasi komponen',
  canvasLabel: 'Tata letak 3D sistem membran. Gunakan mouse atau sentuhan untuk memutar dan memperbesar.',
  layerPanel: {
    title: 'Layer tampilan', open: 'Buka panel layer', close: 'Ciutkan panel layer',
    gasOnly: 'Hanya jalur gas', all: 'Semua',
    options: [
      { id: 'gas', label: 'Pipa gas', active: true },
      { id: 'power', label: 'Daya (Power)', active: true },
      { id: 'control', label: 'Kontrol', active: true },
      { id: 'communication', label: 'Komunikasi', active: true },
      { id: 'data', label: 'Data', active: true },
      { id: 'gnd', label: 'GND', active: false },
      { id: 'labels', label: 'Label komponen', active: true },
      { id: 'zones', label: 'Batas zona', active: true },
    ],
  },
};

export const sceneConfig = {
  camera: { fov: 43, near: 0.1, far: 180, position: [3, 24, 22], target: [3, 0, 0], fitWidth: 43, narrowFitWidth: 54, narrowAspect: 1, fitDepth: 31 },
  controls: { dampingFactor: 0.07, minDistance: 10, maxDistance: 90, maxPolarAngle: Math.PI / 2.15 },
  renderer: { maxPixelRatio: 2, exposure: 1.15 },
  floor: { size: 56, y: -0.02, roughness: 0.95 },
  grid: { size: 44, divisions: 44, y: 0 },
  light: { ambient: 1.6, directional: 3.2, position: [-8, 18, 10], shadowMapSize: 2048, shadowExtent: 22, shadowFar: 60, normalBias: 0.04, bias: -0.0001, radius: 4 },
  placeholder: { size: [2.7, 0.8, 1.55], labelOffset: [0, 1.1, 0], roughness: 0.65, metalness: 0.08 },
};

// Posisi dunia [x, y, z]; z negatif = atas diagram. Sensor inline mengikuti kurva.
export const components = [
  { id: 'sdp31', name: 'SDP31', desc: 'Sensor tekanan diferensial: P1 ke inlet (High Pressure), P2 ke retentate (Low Pressure).', position: [0, 0.4, 3.7], rotation: [0, Math.PI, 0], category: 'sensing', pins: ['VIN', 'GND', 'SDA', 'SCL'] },
  { id: 'powerSupply', name: 'Power Supply', desc: 'Adaptor 12V DC dengan regulator 5V dan 3.3V.', position: [-5.5, 0.5, -0.5], category: 'controller', pins: ['12V', '5V', '3.3V', 'GND'] },
  { id: 'flowSensor', name: 'Flow Sensor', desc: 'Sensor I2C pada permeate CO2 untuk mengukur aliran sebagai dasar perhitungan fluks.', category: 'sensing', pins: ['VIN', 'GND', 'SDA', 'SCL'] },
  { id: 'esp32', name: 'ESP32', desc: 'Pengendali pembacaan sensor I2C dan aktuator.', position: [0, 0.4, -0.5], category: 'controller', pins: ['VIN', '3V3', 'GND', 'GPIO21 / SDA', 'GPIO22 / SCL', 'EN', 'BOOT'] },
  { id: 'hbridge', name: 'H-BRIDGE DRIVER', desc: 'Driver empat kanal: tiga solenoid valve dan satu pompa vakum.', category: 'actuation', pins: ['VIN', 'GND', 'IN1', 'IN2', 'IN3', 'IN4', 'OUT1 / Valve 1', 'OUT2 / Valve 2', 'OUT3 / Valve 3', 'OUT4 / Pump'] },
  { id: 'valve1', name: 'Solenoid Valve 1', desc: 'Katup inlet setelah Flow Meter In.', category: 'actuation', pins: ['+', '−'] },
  { id: 'valve2', name: 'Solenoid Valve 2', desc: 'Katup permeate setelah Flow Sensor, sebelum pompa vakum.', category: 'actuation', pins: ['+', '−'] },
  { id: 'valve3', name: 'Solenoid Valve 3', desc: 'Katup retentate sebelum Flow Meter Out.', category: 'actuation', pins: ['+', '−'] },
  { id: 'pump', name: 'Pump / Blower', desc: 'Pompa vakum pada permeate setelah Solenoid Valve 2.', category: 'actuation', pins: ['M+', 'M−'] },
  { id: 'wifiModule', name: 'Wi-Fi / Bluetooth', label: 'Wi-Fi /\nBluetooth', desc: 'Antarmuka komunikasi nirkabel.', position: [-3.5, 0.4, -4.6], category: 'communication', pins: [], electricalPorts: { UART: [1.125, 0.35, 0], NETWORK: [0, 1.8, 0] } },
  { id: 'mqttBroker', name: 'MQTT Broker', label: 'MQTT\nBroker', desc: 'Perantara pesan MQTT.', position: [-7, 0.4, -10], category: 'communication', pins: [] },
  { id: 'cloud', name: 'Cloud Platform', label: 'Cloud\nPlatform', desc: 'Platform penyimpanan dan pengolahan data.', position: [1, 0.4, -10], category: 'communication', pins: [] },
  { id: 'phone', name: 'Ponsel', desc: 'Antarmuka pemantauan melalui ponsel.', position: [9, 0.4, -10], category: 'communication', pins: [] },
  { id: 'laptop', name: 'Laptop', desc: 'Antarmuka visualisasi melalui laptop.', position: [17, 0.4, -10], category: 'communication', pins: [] },
];

export const zones = [
  { name: 'Communication', category: 'communication', regions: [['mqttBroker', 'cloud', 'phone', 'laptop']] },
  { name: 'Sensing', category: 'sensing', regions: [['membrane', 'pressureSensor', 'tempSensor'], ['flowSensor']] },
  { name: 'Controller', category: 'controller', regions: [['powerSupply', 'esp32', 'sdp31', 'wifiModule']] },
  { name: 'Actuation', category: 'actuation', regions: [['hbridge'], ['valve1'], ['valve2'], ['valve3'], ['pump']] },
];

export const labelConfig = {
  throttleFrames: 8, gap: 5, farStart: 48, farEnd: 90, farOpacity: 0.35, occludedOpacity: 0.18,
  zoneFontSize: 12, zoneColor: '#e0e7eb', zoneOpacity: 1, zoneScreenGap: 10,
  priority: { zone: 100, membrane: 90, esp32: 80, sdp31: 80, valve1: 80, valve2: 80, valve3: 80, pump: 80, default: 40 },
};

export const layout = {
  devHosts: ['localhost', '127.0.0.1', '[::1]'],
  // Kontak mekanis yang disengaja; pipa/selang ditandai layoutAttachment.
  contacts: [['membrane', 'pressureSensor'], ['membrane', 'tempSensor']],
  zone: { padding: [0.22, 0, 0.22], y: 0.04, color: '#80909a', opacity: 0.25, dashSize: 0.28, gapSize: 0.2, labelOffset: [-0.25, 0.05, -0.45] },
};

export const powerSupply = {
  segments: 24, material: { roughness: 0.8, metalness: 0.12 },
  colors: { body: '#111518', pcb: '#246443', metal: '#b9c5cc', inductor: '#8d7442' },
  adapter: { size: [2.1, 0.85, 2.1], position: [0, 0, 0] },
  regulator: { size: [1.65, 0.14, 2.1], position: [2.35, -0.25, 0] },
  capacitors: { radius: 0.23, height: 0.55, positions: [[1.9, 0.095, -0.45], [2.8, 0.095, -0.45]] },
  inductor: { radius: 0.3, height: 0.28, position: [2.35, -0.04, 0.28] },
  labels: [
    { text: '12V DC IN', position: [0, 0.95, 0] },
    { text: '5V', position: [1.65, 0.4, 0.85] },
    { text: '3.3V', position: [3, 0.4, 0.85] },
  ],
  electricalPorts: { '12V': [0.7, 0.425, -0.8], '5V': [1.9, -0.18, 1.05], '3.3V': [2.8, -0.18, 1.05], GND: [2.35, -0.18, 1.05] },
};

export const cables = {
  colors: palette.cables, baseHeight: 0.12, radius: 0.035, radialSegments: 6,
  roughness: 0.9, metalness: 0, bendRadius: 0.18, sampleStep: 0.07,
  laneSpacing: 0.085, exitClearance: 0.12,
  crossingClearance: 0.2, bridgeRun: 0.32, clearance: 0.025, maxDetour: 2,
  aliases: { solenoidValve1: 'valve1', solenoidValve2: 'valve2', solenoidValve3: 'valve3' },
  network: { height: 4.8, bend: 1.1, dashSize: 0.22, gapSize: 0.16, segments: 96 },
  connections: [
    { id: 'power-driver', from: 'powerSupply.12V', to: 'hbridge.VIN', type: 'power', via: [[-4.8, -3.25], [3.3, -3.25]] },
    { id: 'power-esp32', from: 'powerSupply.5V', to: 'esp32.VIN', type: 'power' },
    { id: 'power-sdp31', from: 'powerSupply.3.3V', to: 'sdp31.VIN', type: 'power', via: [[-2.1, 2.25], [0.75, 2.25]] },
    { id: 'power-flow', from: 'powerSupply.3.3V', to: 'flowSensor.VIN', type: 'power', via: [[-2.1, 2.08], [2, 2.08], [2, 5.5], [5.65, 5.5], [5.65, 3.65, 7.1]] },
    { id: 'gnd-esp32', from: 'powerSupply.GND', to: 'esp32.GND', type: 'gnd' },
    { id: 'gnd-driver', from: 'powerSupply.GND', to: 'hbridge.GND', type: 'gnd', via: [[-2.1, -3.335], [3.7, -3.335]] },
    { id: 'gnd-sdp31', from: 'powerSupply.GND', to: 'sdp31.GND', type: 'gnd', via: [[-2.1, 2.335], [0.25, 2.335]] },
    { id: 'gnd-flow', from: 'powerSupply.GND', to: 'flowSensor.GND', type: 'gnd', via: [[-2.1, 2.165], [2.085, 2.165], [2.085, 5.585], [5.735, 5.585], [5.735, 3.65, 7.185]] },
    { id: 'i2c-sda', from: 'esp32.GPIO21_SDA', to: 'sdp31.SDA', type: 'data', height: 1.12, via: [[1.53, 2.42], [-0.25, 2.42]] },
    { id: 'i2c-scl', from: 'esp32.GPIO22_SCL', to: 'sdp31.SCL', type: 'data', height: 1.12, via: [[1.615, 2.505], [-0.75, 2.505]] },
    { id: 'i2c-sda-flow', from: 'sdp31.SDA', to: 'flowSensor.SDA', type: 'data', via: [[2.17, 2.335], [2.17, 5.67], [5.82, 5.67], [5.82, 3.65, 7.27]] },
    { id: 'i2c-scl-flow', from: 'sdp31.SCL', to: 'flowSensor.SCL', type: 'data', via: [[2.255, 2.42], [2.255, 5.755], [5.905, 5.755], [5.905, 3.65, 7.355]] },
    ...[1, 2, 3, 4].map((channel) => ({ id: `ctrl-in${channel}`, from: 'esp32.GPIO_CTRL', to: `hbridge.IN${channel}`, type: 'control', height: 1.12,
      lane: channel - 1, via: [[1.7 + (channel - 1) * 0.085, -3.25 - (channel - 1) * 0.085], [4.1 + (channel - 1) * 0.4, -3.25 - (channel - 1) * 0.085]] })),
    { id: 'ctrl-valve1', from: 'hbridge.OUT1', to: 'solenoidValve1.COIL+', type: 'control', via: [[3.25, 2.8], [-5.4, 2.8], [-5.4, 6.8]] },
    { id: 'ctrl-valve2', from: 'hbridge.OUT2', to: 'solenoidValve2.COIL+', type: 'control', via: [[3.95, 2.885], [9.6, 2.885], [9.6, 5.7]] },
    { id: 'ctrl-valve3', from: 'hbridge.OUT3', to: 'solenoidValve3.COIL+', type: 'control', underPipes: ['permeatePipe'], via: [[4.65, 2.97], [4.65, 8.9]] },
    { id: 'ctrl-pump', from: 'hbridge.OUT4', to: 'pump.M+', type: 'control', via: [[5.35, 3.055], [13, 3.055], [13, 5.2]] },
    { id: 'uart-wifi', from: 'esp32.TX', to: 'wifiModule.UART', type: 'communication', via: [[-1.9, -3.3], [-1.9, -4.6]] },
    { id: 'net-mqtt', from: 'wifiModule.NETWORK', to: 'mqttBroker.NETWORK', type: 'communication', wireless: true },
    { id: 'net-cloud', from: 'mqttBroker.NETWORK', to: 'cloud.NETWORK', type: 'communication', wireless: true },
    { id: 'net-phone', from: 'cloud.NETWORK', to: 'phone.NETWORK', type: 'communication', wireless: true },
    { id: 'net-laptop', from: 'cloud.NETWORK', to: 'laptop.NETWORK', type: 'communication', wireless: true, bend: -2.2 },
  ],
};

export const sensing = {
  segments: 24,
  material: { roughness: 0.5, metalness: 0.15 },
  colors: { pcb: '#163f30', chip: '#171c20', metal: '#b9c5cc', pin: '#d8bb6c', clear: '#c8e7ef', connector: '#e1dfd5', ink: '#edf6f2' },
  sdp31: {
    board: { size: [2.8, 0.14, 2], position: [0, 0, 0] },
    chip: { size: [0.75, 0.25, 0.7], position: [0, 0.19, 0.15] },
    ports: [
      { name: 'P1', position: [-0.65, 0.37, -0.45], route: 'inletPipe', at: 0.97, color: '#F0A030',
        via: [[0.65, 1.35, 5.1], [-4.25, 1.85, 5.7], [-4.25, 1.85, 7.15]] },
      { name: 'P2', position: [0.65, 0.37, -0.45], route: 'retentatePipe', at: 0.15, color: '#38BDF8',
        via: [[-0.65, 1.35, 5.1], [-0.65, 2.8, 6.3], [-0.65, 2.8, 8.3], [2.65, 1.65, 9.35]] },
    ],
    nozzle: { radius: 0.15, boreRadius: 0.075, height: 0.6, boreHeight: 0.015, boreOffset: 0.305 },
    header: { size: [0.14, 0.55, 0.14], start: [-0.75, 0.24, 0.83], pitch: 0.5 },
    legend: { canvas: [512, 384], font: 'bold 28px Arial', size: [2.8, 2], position: [0, 0.075, 0], portTextAt: [[137, 60], [375, 60]], pinTextAt: [[119, 320], [210, 320], [302, 320], [393, 320]] },
    labelOffset: [0, 0.95, 0],
    electricalPorts: { VIN: [-0.75, 0.515, 0.83], GND: [-0.25, 0.515, 0.83], SDA: [0.25, 0.515, 0.83], SCL: [0.75, 0.515, 0.83] },
    tube: { radius: cables.radius * 2, roughness: 0.24, opacity: 0.7, stripeColor: '#ffffff', stripeRadius: 0.009, segments: 80, radialSegments: 8, teeRadius: 0.21, teeLength: 0.4, branchRadius: 0.1, branchLength: 0.4, branchOffset: [0, 0.2, 0], endOffset: [0, 0.4, 0] },
  },
  flowSensor: {
    route: 'permeatePipe', at: 0.3, layoutInline: true,
    radius: 0.34, length: 1.15, opacity: 0.4,
    collarRadius: 0.25, collarLength: 0.18, collarPositions: [[-0.58, 0, 0], [0.58, 0, 0]],
    board: { size: [0.8, 0.12, 0.56], position: [0, 0.42, 0] },
    chip: { size: [0.27, 0.12, 0.27], position: [0, 0.54, 0] },
    connector: { size: [0.42, 0.25, 0.22], position: [0, 0.6, 0.34] },
    pin: { size: [0.045, 0.12, 0.1], start: [-0.135, 0.6, 0.49], pitch: 0.09 },
    labelOffset: [0, 1.1, 0],
    electricalPorts: { VIN: [-0.135, 0.66, 0.54], GND: [-0.045, 0.66, 0.54], SDA: [0.045, 0.66, 0.54], SCL: [0.135, 0.66, 0.54] },
  },
};

export const controller = {
  segments: 24,
  colors: { pcb: '#181d22', silver: '#aab8c3', black: '#0d1114', gold: '#d6ba71', button: '#7e8b94', led: '#35db83', logo: '#243039' },
  material: { roughness: 0.45, metalness: 0.4 },
  board: { size: [2.65, 0.14, 4.6], position: [0, 0, 0] },
  shield: { size: [1.72, 0.28, 1.65], position: [0, 0.23, -0.45] },
  logo: { text: 'ESP32', canvas: [256, 256], font: 'bold 48px Arial', position: [0, 0.378, -0.45], size: [1.5, 1.45], textAt: [128, 135] },
  antenna: { size: [1.7, 0.04, 0.78], position: [0, 0.1, -1.75], radius: 0.025, tubularSegments: 1, radialSegments: 6,
    points: [[-0.7, 0.14, -1.5], [-0.7, 0.14, -2.02], [-0.35, 0.14, -2.02], [-0.35, 0.14, -1.57], [0, 0.14, -1.57], [0, 0.14, -2.02], [0.35, 0.14, -2.02], [0.35, 0.14, -1.57], [0.7, 0.14, -1.57]] },
  header: { count: 15, sides: [-1.13, 1.13], startZ: -1.88, pitch: 0.27, y: 0.22, socketSize: [0.26, 0.25, 0.22], pinSize: [0.075, 0.65, 0.075] },
  usb: { size: [0.65, 0.3, 0.5], position: [0, 0.22, 2.2], openingSize: [0.48, 0.14, 0.015], openingPosition: [0, 0.22, 2.46] },
  buttons: { size: [0.36, 0.18, 0.38], positions: [[-0.7, 0.2, 1.65], [0.7, 0.2, 1.65]], labels: ['EN', 'BOOT'],
    legend: { canvas: [256, 64], font: 'bold 28px Arial', size: [1.9, 0.45], position: [0, 0.075, 1.2], textAt: [[36, 43], [220, 43]] } },
  statusLed: { radius: 0.09, position: [-0.7, 0.19, 0.8], intensity: 1.6 },
  labelOffset: [0, 0.95, 0],
  electricalPorts: { VIN: [-1.13, 0.545, 1.9], '3V3': [-1.13, 0.545, 1.63], GND: [-1.13, 0.545, 1.36], GPIO21_SDA: [1.13, 0.545, 0.82], GPIO22_SCL: [1.13, 0.545, 0.55], GPIO_CTRL: [1.13, 0.545, -0.8], TX: [-1.13, 0.545, -1.88] },
};

export const actuation = {
  segments: 24,
  material: { roughness: 0.4, metalness: 0.55 },
  colors: { brass: '#b59a4b', metal: '#b4c0c7', dark: '#171c22', pcb: '#243c69', terminal: '#337cc1', pin: '#d7ba73', open: '#35db83', closed: '#e54848', pump: '#7b939e', rotor: '#9aadb8' },
  valve: {
    body: { size: [0.78, 0.55, 0.65], position: [0, 0, 0] },
    port: { radius: 0.22, length: 0.3, positions: [[-0.54, 0, 0], [0.54, 0, 0]], span: 1.38 },
    coil: { radius: 0.33, length: 0.65, position: [0, 0.6, 0] },
    terminals: { size: [0.1, 0.23, 0.13], positions: [[-0.16, 1.04, 0], [0.16, 1.04, 0]] },
    bolts: { radius: 0.065, length: 0.06, positions: [[-0.27, 0.3, -0.22], [0.27, 0.3, -0.22], [-0.27, 0.3, 0.22], [0.27, 0.3, 0.22]] },
    led: { radius: 0.075, position: [0, 0.75, 0.32], intensity: 1.5 },
    labelOffset: [0, 1.6, 0],
    electricalPorts: { 'COIL+': [-0.16, 1.155, 0], 'COIL-': [0.16, 1.155, 0] },
  },
  valves: [
    { id: 'valve1', route: 'inletPipe', at: 0.82, layoutInline: true, labelOffset: [0, 1.6, 0] },
    { id: 'valve2', route: 'permeatePipe', at: 0.55, layoutInline: true },
    { id: 'valve3', route: 'retentatePipe', at: 0.4, layoutInline: true, labelOffset: [0, 1.6, 0] },
  ],
  pump: {
    id: 'pump', route: 'permeatePipe', at: 0.83, layoutInline: true,
    volute: { radius: 0.63, depth: 0.45, position: [-0.3, 0, 0], opacity: 0.4 },
    inlet: { radius: 0.22, length: 0.3, position: [-0.95, 0, 0] },
    outlet: { radius: 0.2, points: [[-0.3, 0.55, 0], [0.35, 0.55, 0], [0.75, 0, 0], [1.1, 0, 0]], segments: 48 },
    motor: { radius: 0.44, length: 0.8, position: [-0.3, 0, -0.625] },
    base: { size: [1.4, 0.16, 1.3], position: [-0.3, -0.71, -0.3] },
    rotor: { position: [-0.3, 0, 0], hubRadius: 0.16, depth: 0.34, bladeSize: [0.43, 0.13, 0.24], bladeRadius: 0.32, blades: 6, bladeAngle: Math.PI / 5 },
    portSpan: 2.2,
    led: { radius: 0.085, position: [-0.3, 0.48, -0.625], intensity: 1.5 },
    labelOffset: [-0.3, 1.05, -0.3],
    electricalPorts: { 'M+': [-0.5, 0.2, -1.025], 'M-': [-0.1, 0.2, -1.025] },
  },
  hbridge: {
    position: [4.3, 0.4, -0.5],
    board: { size: [3, 0.16, 4.6], position: [0, 0, 0] },
    heatsinks: { size: [0.78, 0.45, 1.25], positions: [[-0.65, 0.305, -0.3], [0.65, 0.305, -0.3]], fins: 4, finSize: [0.08, 0.3, 1.25], finStart: -0.3, finPitch: 0.2, finY: 0.375 },
    outputs: { size: [0.6, 0.42, 0.65], start: [-1.05, 0.29, 1.6], pitch: 0.7, screwRadius: 0.1, screwDepth: 0.04, screwY: 0.23 },
    header: { size: [0.09, 0.55, 0.09], start: [-1, 0.28, -1.9], pitch: 0.4 },
    labelOffset: [0, 0.95, 0.6],
    electricalPorts: { VIN: [-1, 0.555, -1.9], GND: [-0.6, 0.555, -1.9], IN1: [-0.2, 0.555, -1.9], IN2: [0.2, 0.555, -1.9], IN3: [0.6, 0.555, -1.9], IN4: [1, 0.555, -1.9], OUT1: [-1.05, 0.52, 1.6], OUT2: [-0.35, 0.52, 1.6], OUT3: [0.35, 0.52, 1.6], OUT4: [1.05, 0.52, 1.6] },
  },
};

export const communication = {
  electricalPorts: { NETWORK: [0, 1.8, 0] },
  segments: 24,
  colors: { case: '#698ca4', rack: '#334652', silver: '#a3b4c0', dark: '#101d28', screen: '#eaf2f6', ink: '#173342', muted: '#506b7a', accent: '#207b99', green: '#57d699', cloud: '#dcecf4' },
  material: { roughness: 0.55, metalness: 0.18 },
  labelOffset: [0, 3.3, 0],
  wifi: { size: [2.25, 0.7, 1.5], position: [0, 0.35, 0], mastRadius: 0.06, mastLength: 0.7, mastPosition: [0, 1.05, 0],
    tipRadius: 0.13, tipPosition: [0, 1.45, 0], arcs: [0.45, 0.75, 1.05], arcTube: 0.035, arcRadialSegments: 8, arcAngle: Math.PI / 1.5, arcRotation: Math.PI / 6, arcPosition: [0, 1.45, 0] },
  mqtt: { size: [2, 2.4, 1.45], position: [0, 1.2, 0], bays: [0.5, 1.2, 1.9], baySize: [1.65, 0.43, 0.08], bayZ: 0.76,
    ledRadius: 0.075, ledX: 0.57, ledZ: 0.83, ledColors: ['#57d699', '#70bfee', '#dfbd6c'], ledIntensity: 1.1 },
  cloud: { spheres: [
    { radius: 0.85, position: [-1, 1.2, 0] }, { radius: 1.05, position: [-0.25, 1.6, 0] },
    { radius: 0.8, position: [0.85, 1.35, 0] }, { radius: 0.7, position: [-0.4, 0.95, 0.35] },
    { radius: 0.7, position: [0.55, 1, 0.35] }, { radius: 0.65, position: [1.25, 1.1, 0] },
  ] },
  phone: { size: [1.5, 2.9, 0.22], radius: 0.16, curveSegments: 4, position: [0, 1.45, 0],
    screenSize: [1.26, 2.48], screenPosition: [0, 1.5, 0.122], speakerSize: [0.36, 0.035, 0.025], speakerPosition: [0, 2.76, 0.125] },
  laptop: { baseSize: [3.5, 0.16, 2.1], basePosition: [0, 0.12, 0.35], screenSize: [3.5, 2.1, 0.16], screenPosition: [0, 0.2, -0.7], screenAngle: -Math.PI / 10,
    panelPosition: [0, 1.05, 0], displaySize: [3.13, 1.76], displayPosition: [0, 1.05, 0.09],
    keyboardSize: [2.85, 0.025, 0.7], keyboardPosition: [0, 0.215, 0.16], touchpadSize: [0.75, 0.025, 0.43], touchpadPosition: [0, 0.215, 0.9] },
  dashboard: {
    canvasSize: [512, 640], font: 'Arial', title: 'Membran IoT', demo: 'DEMO · Data simulasi', status: 'Sistem normal',
    metrics: [{ label: 'Delta P', value: '12.4 Pa' }, { label: 'Aliran CO2', value: '2.8 L/min' }, { label: 'Suhu gas', value: '25.0 °C' }],
    chartTitle: 'Tren aliran CO2', chartValues: [0.55, 0.49, 0.59, 0.53, 0.68, 0.62, 0.7, 0.66, 0.78],
    padding: 30, titleY: 52, demoY: 84, statusY: 125, rowY: 187, rowHeight: 76, valueX: 280,
    chartTitleY: 444, chart: [30, 476, 452, 112], titleFont: 34, bodyFont: 23, valueFont: 28, smallFont: 20, chartLineWidth: 5,
  },
};

// Koordinat lokal seluruh unit terhadap position; jalur pipa berurutan searah aliran.
export const membrane = {
  id: 'membrane', name: 'Modul Gas Separation Membrane',
  desc: 'Bundel hollow fiber memisahkan Raw Biomass Gas menjadi permeate kaya CO2 dan retentate kaya N2.', pins: [],
  position: [0, 1.25, 7.5], segments: 48,
  colors: {
    housing: '#c1dce0', fiber: '#b1a596', fiberLine: '#756c60', metal: '#a7b1b8',
    seal: '#4b555b', display: '#16282e', displayText: '#aee8d5', dial: '#f0ede3', needle: '#bc493a',
    inlet: '#b7ad62', permeate: '#45bf81', retentate: '#529fe0',
  },
  material: { roughness: 0.42, metalness: 0.45 },
  housing: { radius: 0.86, length: 6, opacity: 0.35, roughness: 0.18, metalness: 0.04 },
  fiber: { radius: 0.62, length: 5.9, textureSize: [128, 256], stripeSpacing: 8, stripeWidth: 2, roughness: 0.9 },
  endCaps: { positions: [[-3.1, 0, 0], [3.1, 0, 0]], radius: 0.9, length: 0.28 },
  flange: { radius: 0.88, tube: 0.1, offsets: [-0.19, 0.19] },
  ports: [
    { id: 'inletPort', name: 'Port inlet', desc: 'Port inlet menyalurkan Raw Biomass Gas ke bundel membran.', position: [-3.56, 0, 0], direction: [1, 0, 0], radius: 0.22, length: 0.64, color: 'inlet' },
    { id: 'permeatePort', name: 'Port CO2-rich permeate', desc: 'Port permeate mengeluarkan gas kaya CO2 dari modul.', position: [3.1, 0.97, 0], direction: [0, 1, 0], radius: 0.2, length: 0.86, color: 'permeate' },
    { id: 'retentatePort', name: 'Port N2-rich retentate', desc: 'Port retentate mengeluarkan gas kaya N2 dari sisi depan modul.', position: [3.1, -0.18, 0.97], direction: [0, 0, 1], radius: 0.2, length: 0.86, color: 'retentate' },
  ],
  label: { text: 'GAS SEPARATION MEMBRANE MODULE', position: [0, 1.1, 1.1] },
  pipe: { radius: 0.14, tubularSegments: 96, radialSegments: 12, roughness: 0.55, metalness: 0.15, bendRadius: 0.35,
    flange: { radius: 0.27, tube: 0.07, radialSegments: 8, tubularSegments: 24 } },
  arrow: { radius: 0.3, length: 0.65, segments: 16 },
  routes: [
    { id: 'inletPipe', name: 'Pipa Raw Biomass Gas', desc: 'Pipa inlet membawa campuran CO2, N2, dan impurities menuju membran.', color: 'inlet',
      points: [[-11, 0, 0], [-8, 0, 0], [-5, 0, 0], [-3.88, 0, 0]], arrowAt: 0.18,
      flangeAt: 0, label: { text: 'RAW BIOMASS GAS (CO2/N2/impurities)', position: [-8.7, -0.2, 3] } },
    { id: 'permeatePipe', name: 'Pipa CO2-rich permeate', desc: 'Pipa permeate menyalurkan hasil pemisahan kaya CO2 ke outlet.', color: 'permeate',
      points: [[3.1, 1.4, 0], [3.1, 2, 0], [4.6, 2, -0.65], [7, 2, -0.65], [17, 2, -0.65]], arrowAt: 0.98,
      flangeAt: 1, label: { text: 'CO2-RICH PERMEATE', position: [16.6, 1.3, 1.2] } },
    { id: 'retentatePipe', name: 'Pipa N2-rich retentate', desc: 'Pipa retentate menyalurkan hasil pemisahan kaya N2 ke outlet.', color: 'retentate',
      points: [[3.1, -0.18, 1.4], [3.1, -0.18, 2], [4.6, -0.18, 2.4], [7, -0.18, 2.4], [10.5, -0.18, 2.4]], arrowAt: 0.85,
      flangeAt: 1, label: { text: 'N2-RICH RETENTATE', position: [8.5, -0.2, 4.2] } },
  ],
  flowMeter: {
    radius: 0.32, length: 0.85, displaySize: [0.85, 0.48, 0.56], displayPosition: [0, 0.46, 0],
    screenSize: [0.65, 0.28, 0.02], screenPosition: [0, 0.46, 0.29], labelOffset: [0, 1.1, 0],
    meters: [
      { id: 'flowMeterIn', name: 'Flow Meter In', desc: 'Flow Meter In mengukur laju aliran campuran gas sebelum masuk membran.', pins: [], route: 'inletPipe', at: 0.35, layoutInline: true },
      { id: 'flowMeterOut', name: 'Flow Meter Out', desc: 'Flow Meter Out mengukur laju aliran N2-rich retentate setelah pemisahan.', pins: [], route: 'retentatePipe', at: 0.73, layoutInline: true, labelOffset: [0.7, 1.1, 0.5] },
    ],
  },
  pressureSensor: {
    id: 'pressureSensor', name: 'Pressure Sensor', desc: 'Pressure Sensor memantau tekanan gas di dalam housing membran.', pins: [],
    position: [-1.55, 0.7, 0], stemRadius: 0.1, stemLength: 0.65, stemPosition: [0, 0.15, 0],
    gaugeRadius: 0.44, gaugeDepth: 0.2, gaugePosition: [0, 0.85, 0], faceRadius: 0.36, faceDepth: 0.02, facePosition: [0, 0.85, 0.11],
    tickCount: 9, tickSweep: Math.PI * 1.5, tickStart: -Math.PI * 0.75,
    tickRadius: 0.28, tickSize: [0.025, 0.07, 0.015], tickZ: 0.13,
    needleSize: [0.035, 0.29, 0.025], needlePosition: [0.08, 0.94, 0.145], needleAngle: -Math.PI / 4,
    labelOffset: [-0.5, 1.7, 0],
  },
  temperatureSensor: {
    id: 'tempSensor', name: 'Temperature Sensor', desc: 'Probe Temperature Sensor mengukur suhu gas di dalam bundel membran.', pins: [],
    position: [1.1, 0.55, 0], probeRadius: 0.055, probeLength: 1.1, probePosition: [0, 0.2, 0],
    collarRadius: 0.15, collarLength: 0.18, collarPosition: [0, 0.35, 0],
    headSize: [0.42, 0.34, 0.32], headPosition: [0, 0.92, 0], labelOffset: [0.8, 1.8, 0],
  },
};

export const legend = {
  title: 'Legenda warna', collapsed: true,
  groups: [
    { title: 'Kabel', items: [
      { label: 'Daya (Power supply)', color: cables.colors.power, type: 'cable' },
      { label: 'Kontrol (Control)', color: cables.colors.control, type: 'cable' },
      { label: 'Komunikasi (Communication)', color: cables.colors.communication, type: 'cable' },
      { label: 'Data', color: cables.colors.data, type: 'cable' },
      { label: 'GND', color: cables.colors.gnd, type: 'cable ground' },
    ] },
    { title: 'Selang tekanan', items: [
      { label: 'Tekanan tinggi (High)', color: sensing.sdp31.ports.find((port) => port.name === 'P1').color, type: 'hose' },
      { label: 'Tekanan rendah (Low)', color: sensing.sdp31.ports.find((port) => port.name === 'P2').color, type: 'hose' },
    ] },
    { title: 'Aliran gas', items: [
      { label: 'Inlet', color: membrane.colors.inlet, type: 'gas' },
      { label: 'CO2-rich permeate', color: membrane.colors.permeate, type: 'gas' },
      { label: 'N2-rich retentate', color: membrane.colors.retentate, type: 'gas' },
    ] },
  ],
};

export const interaction = {
  hoverInterval: 60, clickDistance: 5, duration: 600,
  highlight: '#9bd8ed', hoverStrength: 0.16, selectedStrength: 0.38,
  focus: { direction: [0.25, 1, 1], padding: 1.6, minSize: 3.5 },
};

export const cameraPresets = [
  { id: 'overview', label: 'Ikhtisar', position: [...sceneConfig.camera.position], target: [...sceneConfig.camera.target] },
  { id: 'gas', label: 'Jalur gas', position: [5, 17, 24], target: [4, 1.5, 8] },
  { id: 'control', label: 'Klaster kontrol', position: [0, 14, 13], target: [0, 0.7, 0] },
  { id: 'communication', label: 'Komunikasi', position: [6, 15, 5], target: [5, 1, -9] },
];

export const explode = {
  speed: 9, epsilon: 0.0001,
  offsets: {
    communication: [0, 5, 0], controller: [-1.5, 3.5, -1], sensing: [0, 1.8, 0],
    actuation: [0, 2, 0], housing: [0, 4, 0],
  },
};

export const interactionUI = {
  panel: 'Informasi komponen', close: 'Tutup', connections: 'Koneksi', pins: 'Tabel pin',
  pin: 'Pin', endpoint: 'Terhubung ke', specs: 'Spesifikasi',
  emptySpecs: 'Belum diisi.', emptyConnections: 'Tidak ada koneksi kabel pada konfigurasi.',
  emptyPins: 'Port listrik belum didefinisikan.', unconnected: '—',
  previous: 'Komponen terhubung sebelumnya', next: 'Komponen terhubung berikutnya',
  choose: 'Pilih komponen', reset: 'Reset', camera: 'Preset kamera',
  explode: 'Explode', reassemble: 'Rakit kembali',
  explodeHint: 'Kabel disembunyikan selama explode; pipa dan selang mengikuti sambungan.',
  demo: 'Kontrol visual lokal · LED dan status saja',
  states: { open: 'Terbuka', closed: 'Tertutup', running: 'Berjalan', stopped: 'Berhenti' },
  actions: { open: 'Tutup', closed: 'Buka', running: 'Berhenti', stopped: 'Jalan' },
};

// Isi specs dengan data yang sudah diverifikasi; jangan ambil angka dari geometri model.
export const info = {
  sdp31: { desc: 'Sensor tekanan diferensial; P1 membaca inlet dan P2 membaca retentate.', specs: [] },
  powerSupply: { desc: 'Adaptor dan regulator menyediakan daya untuk klaster kontrol dan sensor.', specs: [] },
  flowSensor: { desc: 'Sensor I2C mengukur aliran pada jalur permeate.', specs: [] },
  esp32: { desc: 'Pengendali pembacaan sensor dan antarmuka aktuator.', specs: [] },
  hbridge: { desc: 'Driver untuk tiga solenoid valve dan pompa vakum.', specs: [] },
  valve1: { desc: 'Katup inlet setelah Flow Meter In.', specs: [] },
  valve2: { desc: 'Katup permeate setelah Flow Sensor dan sebelum pompa.', specs: [] },
  valve3: { desc: 'Katup retentate sebelum Flow Meter Out.', specs: [] },
  pump: { desc: 'Pompa vakum pada jalur permeate setelah Solenoid Valve 2.', specs: [] },
  wifiModule: { desc: 'Antarmuka komunikasi nirkabel klaster kontrol.', specs: [] },
  mqttBroker: { desc: 'Perantara pesan MQTT antara perangkat dan Cloud Platform.', specs: [] },
  cloud: { desc: 'Platform penyimpanan dan pengolahan data sistem.', specs: [] },
  phone: { desc: 'Antarmuka pemantauan sistem melalui ponsel.', specs: [] },
  laptop: { desc: 'Antarmuka visualisasi sistem melalui laptop.', specs: [] },
  membrane: { desc: 'Bundel hollow fiber memisahkan campuran gas menjadi permeate kaya CO2 dan retentate kaya N2.', specs: [] },
  flowMeterIn: { desc: 'Pengukur laju aliran campuran gas sebelum masuk membran.', specs: [] },
  flowMeterOut: { desc: 'Pengukur laju aliran retentate setelah pemisahan.', specs: [] },
  pressureSensor: { desc: 'Pengukur tekanan gas di dalam housing membran.', specs: [] },
  tempSensor: { desc: 'Probe pengukur suhu gas di dalam modul membran.', specs: [] },
};
