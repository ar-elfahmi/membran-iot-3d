export const palette = {
  background: '#151719', floor: '#1c2023', grid: '#30363b', gridCenter: '#424b51',
  text: '#f1f3f4', muted: '#b6c0c7', labelBackground: '#22272b',
  sensing: '#62a9ba', controller: '#bac5cc', actuation: '#c6a477',
  membrane: '#7bac95', communication: '#8aadc2', light: '#ffffff',
  cables: { power: '#e54848', control: '#f28c28', communication: '#39a85b', data: '#368ce7', ground: '#111111' },
};

export const ui = {
  title: 'Smart Mixed-Matrix Membrane Gas Separation System',
  subtitle: 'Model 3D interaktif · Tata letak awal sistem IoT',
  instructions: 'Seret: putar · Scroll / cubit: zoom · Klik kanan: geser',
  scope: 'Slice 2 · Modul membran dan aliran gas',
  canvasLabel: 'Tata letak 3D sistem membran. Gunakan mouse atau sentuhan untuk memutar dan memperbesar.',
};

export const sceneConfig = {
  camera: { fov: 43, near: 0.1, far: 180, position: [0, 25, 23], target: [0, 0, 0], fitWidth: 32, fitDepth: 27 },
  controls: { dampingFactor: 0.07, minDistance: 10, maxDistance: 90, maxPolarAngle: Math.PI / 2.15 },
  renderer: { maxPixelRatio: 2, exposure: 1.15 },
  floor: { size: 56, y: -0.02, roughness: 0.95 },
  grid: { size: 44, divisions: 44, y: 0 },
  light: { ambient: 1.6, directional: 3.2, position: [-8, 18, 10], shadowMapSize: 2048, shadowExtent: 22, shadowFar: 60, normalBias: 0.04, bias: -0.0001, radius: 4 },
  placeholder: { size: [2.7, 0.8, 1.55], labelOffset: [0, 1.1, 0], roughness: 0.65, metalness: 0.08 },
};

// Posisi sementara [x, y, z]; z negatif = atas diagram. Pin belum ditentukan.
export const components = [
  { id: 'sdp31', name: 'SDP31', desc: 'Sensor tekanan diferensial.', position: [-10, 0.4, -1], category: 'sensing', pins: [] },
  { id: 'flowSensor', name: 'Flow Sensor', desc: 'Sensor aliran gas.', position: [-6, 0.4, -1], category: 'sensing', pins: [] },
  { id: 'esp32', name: 'ESP32', desc: 'Pengendali pembacaan sensor dan aktuator.', position: [0, 0.4, 0], category: 'controller', pins: [] },
  { id: 'hbridge', name: 'H-Bridge', desc: 'Driver kendali aktuator.', position: [5, 0.4, -1], category: 'actuation', pins: [] },
  { id: 'valve1', name: 'Solenoid Valve 1', desc: 'Katup solenoid pertama.', position: [9, 0.4, -2], category: 'actuation', pins: [] },
  { id: 'valve2', name: 'Solenoid Valve 2', desc: 'Katup solenoid kedua.', position: [9, 0.4, 1], category: 'actuation', pins: [] },
  { id: 'valve3', name: 'Solenoid Valve 3', desc: 'Katup solenoid ketiga.', position: [9, 0.4, 4], category: 'actuation', pins: [] },
  { id: 'pump', name: 'Pump / Blower', desc: 'Pompa penggerak aliran gas.', position: [5, 0.4, 3], category: 'actuation', pins: [] },
  { id: 'wifiModule', name: 'Wi-Fi / Bluetooth', desc: 'Antarmuka komunikasi nirkabel.', position: [-8, 0.4, -7], category: 'communication', pins: [] },
  { id: 'mqttBroker', name: 'MQTT Broker', desc: 'Perantara pesan MQTT.', position: [-4, 0.4, -7], category: 'communication', pins: [] },
  { id: 'cloud', name: 'Cloud Platform', desc: 'Platform penyimpanan dan pengolahan data.', position: [0, 0.4, -7], category: 'communication', pins: [] },
  { id: 'phone', name: 'Ponsel', desc: 'Antarmuka pemantauan melalui ponsel.', position: [4, 0.4, -7], category: 'communication', pins: [] },
  { id: 'laptop', name: 'Laptop', desc: 'Antarmuka visualisasi melalui laptop.', position: [8, 0.4, -7], category: 'communication', pins: [] },
];

export const zones = [
  { name: 'Communication', position: [0, 0, -12] },
  { name: 'Sensing', position: [-8, 0, -4] },
  { name: 'Controller', position: [0, 0, -3] },
  { name: 'Actuation', position: [7, 0, -5] },
];

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
  label: { text: 'GAS SEPARATION MEMBRANE MODULE', position: [0, -0.9, 4.7] },
  pipe: { radius: 0.14, tubularSegments: 96, radialSegments: 12, roughness: 0.55, metalness: 0.15 },
  arrow: { radius: 0.3, length: 0.65, segments: 16 },
  routes: [
    { id: 'inletPipe', name: 'Pipa Raw Biomass Gas', desc: 'Pipa inlet membawa campuran CO2, N2, dan impurities menuju membran.', color: 'inlet',
      points: [[-11, 0, 0], [-8, 0, 0], [-5, 0, 0], [-3.88, 0, 0]], arrowAt: 0.18,
      label: { text: 'RAW BIOMASS GAS (CO2/N2/impurities)', position: [-8.7, -0.2, 3] } },
    { id: 'permeatePipe', name: 'Pipa CO2-rich permeate', desc: 'Pipa permeate menyalurkan hasil pemisahan kaya CO2 ke outlet.', color: 'permeate',
      points: [[3.1, 1.4, 0], [3.1, 2, 0], [4.6, 2, -0.65], [7, 2, -0.65], [10.5, 2, -0.65]], arrowAt: 0.83,
      label: { text: 'CO2-RICH PERMEATE', position: [9, 1.3, -0.4] } },
    { id: 'retentatePipe', name: 'Pipa N2-rich retentate', desc: 'Pipa retentate menyalurkan hasil pemisahan kaya N2 ke outlet.', color: 'retentate',
      points: [[3.1, -0.18, 1.4], [3.1, -0.18, 2], [4.6, -0.18, 2.4], [7, -0.18, 2.4], [10.5, -0.18, 2.4]], arrowAt: 0.85,
      label: { text: 'N2-RICH RETENTATE', position: [8.5, -0.2, 4.2] } },
  ],
  flowMeter: {
    radius: 0.32, length: 0.85, displaySize: [0.85, 0.48, 0.56], displayPosition: [0, 0.46, 0],
    screenSize: [0.65, 0.28, 0.02], screenPosition: [0, 0.46, 0.29], labelOffset: [0, 1.1, 0],
    meters: [
      { id: 'flowMeterIn', name: 'Flow Meter In', desc: 'Flow Meter In mengukur laju aliran campuran gas sebelum masuk membran.', pins: [], route: 'inletPipe', at: 0.6 },
      { id: 'flowMeterOut', name: 'Flow Meter Out', desc: 'Flow Meter Out mengukur laju aliran N2-rich retentate setelah pemisahan.', pins: [], route: 'retentatePipe', at: 0.6 },
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
