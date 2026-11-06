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
- Referensi: docs/diagram-sistem.jpg, docs/diagram-logika.png, docs/Raw_Data_LLM.docx

## Catatan diagram
Diagram dibuat AI dan ada label yang rusak (contoh: "MND", "Apom Failure", pin yang
tidak konsisten). Ikuti struktur dan alur secara umum, jangan menyalin pin dan teks
yang tidak masuk akal.

## Progres slice
- Slice 0 selesai: struktur ES modules, importmap Three.js 0.170.0, OrbitControls.
- Slice 1 selesai: scene dasar, grid, pencahayaan dan soft shadow, kamera responsif, 18 placeholder berlabel, overlay judul.
