// Anda bisa menyimpan ini di file terpisah, misal: primitive.js
// Lalu import di file utama.

var LIBS = LIBS || {}; // Pastikan LIBS sudah ada

LIBS.createSphere = function (radius, segments) {
  const vertices = [];
  const faces = [];
  // ... Logika untuk membuat vertex bola
  // Ini adalah latihan yang bagus untuk tugas grafika!
  // Tapi untuk cepat, kita bisa pakai data yang sudah jadi.

  // Contoh data vertex bola sederhana (icosahedron)
  const t = (1.0 + Math.sqrt(5.0)) / 2.0;
  // ... (data vertex & faces untuk bola)

  // Untuk sementara, kita bisa pakai kubus dan di-scale agar mirip bola
  const vertex = [-1, -1, -1, 1, 0, 1, 1, -1, -1, 1, 0, 1, 1, 1, -1, 1, 0, 1, -1, 1, -1, 1, 0, 1, -1, -1, 1, 1, 0, 1, 1, -1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, -1, 1, 1, 1, 0, 1];
  const face = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 0, 3, 7, 0, 4, 7, 1, 2, 6, 1, 5, 6, 3, 2, 6, 3, 7, 6, 0, 1, 5, 0, 4, 5];
  return { vertex: vertex, face: face };
};

LIBS.createCube = function () {
  const vertex = [-1, -1, -1, 0.5, 0, 0.5, 1, -1, -1, 0.5, 0, 0.5, 1, 1, -1, 0.5, 0, 0.5, -1, 1, -1, 0.5, 0, 0.5, -1, -1, 1, 0.5, 0, 0.5, 1, -1, 1, 0.5, 0, 0.5, 1, 1, 1, 0.5, 0, 0.5, -1, 1, 1, 0.5, 0, 0.5];
  const face = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 0, 3, 7, 0, 4, 7, 1, 2, 6, 1, 5, 6, 3, 2, 6, 3, 7, 6, 0, 1, 5, 0, 4, 5];
  return { vertex: vertex, face: face };
};

// Tambahkan fungsi untuk kerucut (cone) jika diperlukan
