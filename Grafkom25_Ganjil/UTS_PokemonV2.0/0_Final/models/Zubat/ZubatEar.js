/*
 * ===================================================================
 * KRITERIA 1: Telinga Zubat
 * ===================================================================
 *
 * KRITERIA 2 & 5: JENIS OBJEK (DEFORMED PARAMETRIC SURFACE)
 *
 * ALGORITMA:
 * 1. Membuat 'cincin' (rings) vertex dari bawah ke atas.
 * 2. Bentuk setiap cincin dikontrol secara parametrik oleh:
 * - 'widthProfile': Mengatur lebar (melebar di tengah, menyempit di ujung)
 * - 'curveProfile': Membuat telinga melengkung ke belakang
 * 3. Vertex di sisi dalam (sin(angle) > 0) ditarik (deformasi)
 * menuju 'cavityTarget' untuk membuat rongga telinga.
 * 4. Warna diubah menjadi 'innerColor' di dalam rongga.
 */

import { Node } from "../Node.js";
import { SceneObject } from "../SceneObject.js";

export class ZubatEar extends Node {
  constructor(GL, attribs, options = {}) {
    super();
    const opts = { ...ZubatEar.DEFAULT_OPTIONS, ...options };
    const earData = this._generateEarGeometry(opts);
    const sceneObj = new SceneObject(GL, earData.vertices, earData.faces, attribs, "POS_COL_NORM");
    this.setGeometry(sceneObj);
  }

  /**
   * KRITERIA 3 & 4: Default options untuk parameter
   */
  static DEFAULT_OPTIONS = {
    // Dimensi
    height: 2.0,
    maxWidth: 1.5,
    thickness: 1.0,

    // KRITERIA 4: Kontrol Bentuk
    curveAmount: -0.5, // >0 melengkung ke depan, <0 ke belakang
    bluntness: 0.3, // 0.0 = lancip, 1.0 = rata di ujung

    // KRITERIA 3: Resolusi
    segments: 20, // Resolusi keliling
    rings: 10, // Resolusi tinggi

    // KRITERIA 3: Warna
    outerColor: [0.35, 0.55, 0.95], // Biru (Luar)
    innerColor: [0.9, 0.45, 0.6], // Pink (Dalam)

    // KRITERIA 3 & 4: Parameter Rongga (Cavity)
    cavityTarget: [0.0, 1.0, -0.1], // Titik target tarikan
    cavityRimSharpness: 2.0, // Ketajaman tepi rongga (>1 lebih tajam)
  };

  /**
   * ALGORITMA: Generate ear geometry (Deformed Parametric Surface)
   */
  _generateEarGeometry(opts) {
    const vertices = [];
    const faces = [];
    const { height, maxWidth, thickness, curveAmount, bluntness, segments, rings, outerColor, innerColor, cavityTarget, cavityRimSharpness } = opts;

    // Hitung lebar ujung (tip) berdasarkan 'bluntness'
    const tipWidth = maxWidth * bluntness;

    // --- VERTEX GENERATION ---
    for (let j = 0; j <= rings; j++) {
      const t = j / rings; // Normalisasi tinggi (0.0 = pangkal, 1.0 = ujung)
      const y = t * height;

      // 1. Tentukan Lebar (Width Profile)
      let widthProfile;
      if (t < 0.5) {
        // Bagian bawah: membesar
        widthProfile = Math.sin(t * Math.PI);
      } else {
        // Bagian atas: mengecil ke 'tipWidth'
        const upper_t = (t - 0.5) * 2;
        const targetWidthRatio = tipWidth / maxWidth;
        widthProfile = (1.0 - upper_t) * 1.0 + upper_t * targetWidthRatio;
      }
      const currentWidth = widthProfile * maxWidth;

      // 2. Tentukan Kelengkungan (Curve Profile)
      const curveProfile = Math.sin(t * (Math.PI / 2));
      const currentCurve = curveProfile * curveAmount;

      // Generate 1 Cincin (Ring)
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;

        // Posisi dasar elips
        let x = (Math.cos(angle) * currentWidth) / 2;
        let z = (Math.sin(angle) * thickness) / 2;
        z += currentCurve; // Terapkan lengkungan

        let final_x = x,
          final_y = y,
          final_z = z;
        let finalColor = outerColor; // Default warna biru
        let normal;

        // 3. Deformasi Rongga (Hanya sisi dalam)
        if (Math.sin(angle) > 0) {
          // Hitung kekuatan tarikan
          let pullAmount = Math.pow(Math.sin(angle), cavityRimSharpness);
          pullAmount *= widthProfile; // Tarikan lebih kuat di bagian lebar

          if (pullAmount > 0.1) {
            finalColor = innerColor; // Ganti warna jadi pink
          }

          // Interpolasi posisi vertex ke 'cavityTarget'
          final_x = x * (0.9 - pullAmount) + cavityTarget[0] * pullAmount;
          final_y = y * (0.9 - pullAmount) + cavityTarget[1] * pullAmount;
          final_z = z * (0.0 - pullAmount) + cavityTarget[2] * pullAmount;
        }

        // 4. Kalkulasi Normal
        if (finalColor === innerColor) {
          // Normal Sisi Dalam: Menghadap ke pusat rongga
          normal = [final_x - cavityTarget[0], final_y - cavityTarget[1], final_z - cavityTarget[2]];
        } else {
          // Normal Sisi Luar: Perkiraan tegak lurus permukaan
          const tangentY = Math.sin(t * Math.PI) * 0.5;
          normal = [Math.cos(angle) * widthProfile, tangentY, Math.sin(angle)];
          if (curveAmount > 0) {
            normal[2] -= curveProfile;
          }
        }

        vertices.push(final_x, final_y, final_z);
        vertices.push(...finalColor);

        const len = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2) || 1;
        vertices.push(normal[0] / len, normal[1] / len, normal[2] / len);
      }
    }

    // --- FACE GENERATION (Standard Strip) ---
    for (let j = 0; j < rings; j++) {
      for (let i = 0; i < segments; i++) {
        const idx1 = j * (segments + 1) + i;
        const idx2 = (j + 1) * (segments + 1) + i;
        faces.push(idx1, idx2, idx1 + 1);
        faces.push(idx2, idx2 + 1, idx1 + 1);
      }
    }

    return { vertices, faces };
  }
}
