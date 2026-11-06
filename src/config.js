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
  scope: 'Slice 0–1 · Placeholder komponen',
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
  { id: 'membrane', name: 'Modul membran', desc: 'Modul pemisahan gas mixed-matrix membrane.', position: [0, 0.4, 7], category: 'membrane', pins: [] },
  { id: 'sdp31', name: 'SDP31', desc: 'Sensor tekanan diferensial.', position: [-10, 0.4, -1], category: 'sensing', pins: [] },
  { id: 'flowSensor', name: 'Flow Sensor', desc: 'Sensor aliran gas.', position: [-6, 0.4, -1], category: 'sensing', pins: [] },
  { id: 'pressureSensor', name: 'Pressure Sensor', desc: 'Sensor tekanan pada modul membran.', position: [-10, 0.4, 3], category: 'sensing', pins: [] },
  { id: 'tempSensor', name: 'Temperature Sensor', desc: 'Sensor suhu gas.', position: [-6, 0.4, 3], category: 'sensing', pins: [] },
  { id: 'flowMeterIn', name: 'Flow Meter In', desc: 'Pengukur aliran masuk.', position: [-4, 0.4, 7], category: 'membrane', pins: [] },
  { id: 'flowMeterOut', name: 'Flow Meter Out', desc: 'Pengukur aliran keluar.', position: [4, 0.4, 7], category: 'membrane', pins: [] },
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
  { name: 'Membran', position: [0, 0, 10] },
];
