# Proyek: Smart Mixed-Matrix Membrane Gas Separation System (IoT) - 3D Interaktif

## Tujuan
Model 3D interaktif di web untuk pameran produk. Mudah dikustomisasi.

## Aturan teknis
- Three.js via CDN (importmap), ES modules, TANPA build tool.
- Struktur: index.html, src/main.js, src/config.js, src/components/*.js, src/ui/*.js, src/data/*.js
- Satu file per komponen 3D. Setiap komponen mengekspor fungsi create...() yang
  mengembalikan THREE.Group dengan userData {id, name, desc, pins}.
- Semua warna, posisi, ukuran, label, dan ambang batas ada di src/config.js.
- Gunakan bentuk primitif (silinder, kotak, torus). Jangan mengunduh model eksternal.
- Warna kabel mengikuti legenda diagram: merah=daya, jingga=warna/kontrol,
  hijau=komunikasi, biru=data, hitam=GND.
- Bahasa label UI: Indonesia dengan istilah teknis Inggris seperti di diagram.

## Cara kerja
- Kerjakan HANYA slice yang diminta. Jangan menyentuh file di luar cakupan slice.
- Jangan menulis ulang file yang tidak perlu diubah. Edit seperlunya.
- Setelah selesai, tulis ringkasan singkat: file yang diubah dan cara mengujinya.
- Referensi diagram sistem: docs/engineering-system-diagram.jpg (disebut docs/diagram-sistem.jpg pada brief).
- Referensi diagram logika: docs/gerbang-logika.jpg (disebut docs/diagram-logika.png pada brief).
- Referensi data: docs/Raw Data LLM.docx.

## Catatan diagram
Diagram dibuat AI dan ada label yang rusak (contoh: "MND", "Apom Failure", pin yang
tidak konsisten). Ikuti struktur dan alur secara umum, jangan menyalin pin dan teks
yang tidak masuk akal.

## Progres slice
- Slice 0 selesai: struktur ES modules, importmap Three.js 0.170.0, OrbitControls.
- Slice 1 selesai: scene dasar, grid, pencahayaan dan soft shadow, kamera responsif, 18 placeholder berlabel, overlay judul.
- Slice 2 selesai: housing membran transparan dengan bundel hollow fiber, end cap/flange dan tiga port, pipa berkurva dengan label/panah statis, flow meter inline, Pressure Sensor dan Temperature Sensor di atas housing. Kurva pipa tersedia di userData.curve untuk Slice 8.
- Slice 3 selesai: breakout SDP31 dengan P1/P2, header I2C dan selang tekanan berwarna ke tee inlet/retentate; Flow Sensor I2C inline pada kurva permeate CO2. Konfigurasi di sensing.
- Slice 4 selesai: ESP32 dengan statusLed, Wi-Fi/Bluetooth, MQTT Broker, Cloud, ponsel dan laptop. Dashboard dummy bertanda DEMO; screenCanvas dan screenTexture tersedia untuk Slice 9. Konfigurasi di controller dan communication. Actuation tetap placeholder; tanpa kabel listrik atau animasi baru.
- Tata letak: Actuation bergeser ke kanan, Communication direnggangkan. Di localhost/127.0.0.1/[::1], checkLayoutOverlap() berjalan otomatis dan dapat diulang dari console; memeriksa Box3 badan perangkat, mengecualikan jalur pipa/selang dan melaporkan kontak mekanis yang disengaja secara terpisah. Label CSS2D diperiksa secara visual.
