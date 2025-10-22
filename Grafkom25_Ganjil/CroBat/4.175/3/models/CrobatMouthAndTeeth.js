// models/CrobatMouthAndTeeth.js
import { SceneObject } from "./SceneObject.js";

// =========================================================================
// === FUNGSI HELPER (DIPINDAHKAN KE LUAR CLASS) ===
// =========================================================================

/**
 * Membuat mesh mulut/outline yang melengkung (cembung).
 */
function createMouthShape(
  vertices,
  faces,
  width,
  height,
  segments,
  color,
  zOffset,
  curveAmount
) {
  const baseIndex = vertices.length / 9;

  // Titik kontrol Bezier Quadratic
  const P0 = [-width / 2, 0];
  const P1 = [0, height * 0.7];
  const P2 = [width / 2, 0];

  // Titik pusat untuk triangle fan (dibuat cembung)
  // !!! PERBAIKAN: diubah dari -curveAmount menjadi +curveAmount !!!
  const centerZ = +curveAmount + zOffset; 
  vertices.push(0, 0, centerZ, ...color, 0, 0, 1);

  // Sampling titik-titik di sepanjang kurva Bezier
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0];
    const y = (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1];

    // --- INI PERUBAHANNYA ---
    // !!! PERBAIKAN: diubah dari -curveAmount menjadi +curveAmount !!!
    // Membuat mesh melengkung seperti parabola (CEMBUNG).
    const z = +curveAmount * 4.0 * (t * (1.0 - t)) + zOffset;
    // -------------------------

    vertices.push(x, y, z, ...color, 0, 0, 1);
  }

  // Faces: triangulasi dari pusat ke kurva
  for (let i = 0; i < segments; i++) {
    faces.push(baseIndex, baseIndex + i + 1, baseIndex + i + 2);
  }
}

/**
 * Membuat mesh untuk gigi.
 */
function createTeeth(vertices, faces, color, zOffset) {
  const LINE_WIDTH = 0.03;
  const LINE_HEIGHT = 0.25;
  const positions = [-0.15, 0.15]; 

  for (const posX of positions) {
    const baseIndex = vertices.length / 9;
    vertices.push(
      -LINE_WIDTH / 2 + posX, 0, zOffset, ...color, 0, 0, 1,
       LINE_WIDTH / 2 + posX, 0, zOffset, ...color, 0, 0, 1,
       LINE_WIDTH / 2 + posX, LINE_HEIGHT, zOffset, ...color, 0, 0, 1,
      -LINE_WIDTH / 2 + posX, LINE_HEIGHT, zOffset, ...color, 0, 0, 1
    );
    faces.push(
      baseIndex, baseIndex + 1, baseIndex + 2,
      baseIndex, baseIndex + 2, baseIndex + 3
    );
  }
}

// =========================================================================
// === CLASS UTAMA ===
// =========================================================================

export class CrobatMouthAndTeeth extends SceneObject {
  constructor(GL, attribs) {
    let vertices = [];
    let faces = [];

    const MOUTH_COLOR = [0.95, 0.95, 0.95]; 
    const OUTLINE_COLOR = [0.15, 0.1, 0.2]; 
    const TEETH_COLOR = [0.1, 0.1, 0.1]; 

    const MOUTH_WIDTH = 1.6;
    const MOUTH_HEIGHT = 1.3;
    const OUTLINE_OFFSET = 0.05; 
    const SEGMENTS = 16;
    // Nilai ini tetap positif, logika di dalam createMouthShape yang diubah
    const CURVE_AMOUNT = 0.3; 

    // Urutan Z (dari belakang ke depan)
    const Z_OUTLINE = 0.0;
    const Z_MOUTH = 0.01; // Tepat di depan outline
    const Z_TEETH = 0.02; // Tepat di depan mulut

    // STEP 1: Buat Outline (Besar, di belakang, bengkok)
    createMouthShape(
      vertices,
      faces,
      MOUTH_WIDTH + OUTLINE_OFFSET, 
      MOUTH_HEIGHT + OUTLINE_OFFSET, 
      SEGMENTS,
      OUTLINE_COLOR,
      Z_OUTLINE,
      CURVE_AMOUNT
    );

    // STEP 2: Buat Mulut Putih (Normal, di tengah, bengkok)
    createMouthShape(
      vertices,
      faces,
      MOUTH_WIDTH,
      MOUTH_HEIGHT,
      SEGMENTS,
      MOUTH_COLOR,
      Z_MOUTH,
      CURVE_AMOUNT
    );

    // STEP 3: Buat Gigi (Kecil, di depan, datar)
    // Gigi dibuat paling depan sehingga menonjol keluar dari mulut yg cembung
    createTeeth(vertices, faces, TEETH_COLOR, Z_TEETH + CURVE_AMOUNT);

    // 4. Panggil super() di AKHIR
    super(GL, vertices, faces, attribs);
  }
}