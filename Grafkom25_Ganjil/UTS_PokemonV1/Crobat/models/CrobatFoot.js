// models/CrobatFoot.js
import { SceneObject } from "./SceneObject.js";

// =========================================================================
// === FUNGSI HELPER (DIPINDAHKAN KE LUAR CLASS) ===
// =========================================================================

function createPalm(radius, height, color, vertices, faces) {
  const segments = 12;
  // Gunakan array 'vertices' lokal, bukan 'this.vertices'
  const baseIndex = vertices.length / 9;

  vertices.push(0, height, 0, ...color, 0, 1, 0);

  for (let i = 0; i <= segments; i++) {
    const angle = (i * 2 * Math.PI) / segments;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    vertices.push(x, 0, z, ...color, 0, -1, 0);
  }

  for (let i = 0; i < segments; i++) {
    // Gunakan array 'faces' lokal, bukan 'this.faces'
    faces.push(baseIndex, baseIndex + i + 1, baseIndex + i + 2);
  }
}

// ===================================================================
// GANTI FUNGSI LAMA ANDA DENGAN YANG INI
// ===================================================================
function createToe(position, rotationZ, height, radius, color, vertices, faces) {
  const segments = 10;
  const baseIndex = vertices.length / 9;

  for (let j = 0; j <= segments; j++) {
    const y_ratio = j / segments;
    const y = y_ratio * height;

    // === PERUBAHAN UNTUK UJUNG TUMPUL ===
    // Menggunakan kurva cosinus (bukan garis lurus) untuk tapering.
    // Ini akan membuat pangkalnya tebal dan ujungnya lebih membulat (tumpul).
    const taper = Math.cos(y_ratio * (Math.PI / 2));
    const currentRadius = radius * taper;
    // ===================================

    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      let x = currentRadius * Math.cos(angle);
      let z = currentRadius * Math.sin(angle);

      const rotatedX = x * Math.cos(rotationZ) - y * Math.sin(rotationZ);
      const rotatedY = x * Math.sin(rotationZ) + y * Math.cos(rotationZ);

      const finalX = rotatedX + position[0];
      const finalY = rotatedY + position[1];
      const finalZ = z + position[2];

      vertices.push(finalX, finalY, finalZ, ...color, 0, 0, 1);
    }
  }

  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < segments; i++) {
      const first = baseIndex + j * (segments + 1) + i;
      const second = first + segments + 1;
      faces.push(first, second, first + 1);
      faces.push(second, second + 1, first + 1);
    }
  }
}
// ===================================================================

// =========================================================================
// === CLASS UTAMA ===
// =========================================================================

export class CrobatFoot extends SceneObject {
  constructor(GL, attribs) { // <-- 1. Ubah signature
    // 2. Buat array lokal
    let vertices = [];
    let faces = [];

    const FOOT_COLOR = [0.37, 0.23, 0.9];

    // STEP 1: Buat Pangkal Kaki (Palm)
    const palmRadius = 0;
    const palmHeight = 0.15;
    // 3. Panggil helper (tanpa 'this') dan berikan array
    createPalm(palmRadius, palmHeight, FOOT_COLOR, vertices, faces);

    // STEP 2: Definisikan Tiga Jari Kaki
    const toeData = [
      // Jari Kiri
      { pos: [-0.12, -0.05, 0], rotZ: 0.5, height: 0.4, radius: 0.1 },
      // Jari Tengah
      { pos: [0, 0, 0], rotZ: 0, height: 0.6, radius: 0.13 },
      // Jari Kanan
      { pos: [0.12, -0.05, 0], rotZ: -0.5, height: 0.4, radius: 0.1 },
    ];

    for (const data of toeData) {
      // 3. Panggil helper (tanpa 'this') dan berikan array
      createToe(
        data.pos,
        data.rotZ,
        data.height,
        data.radius,
        FOOT_COLOR,
        vertices,
        faces
      );
    }

    // 4. Panggil super() di AKHIR dengan array yang sudah terisi
    super(GL, vertices, faces, attribs);

    // 5. Hapus this.setup()
  }
}