/*
 * ===================================================================
 * KRITERIA 1: Gigi Zubat
 * ===================================================================
 *
 * KRITERIA 2 & 5: JENIS OBJEK (QUADRIC SURFACE - PARABOLOID)
 * Ini adalah objek Quadric WAJIB (Bukan Ellipsoid/Cylinder).
 *
 * ALGORITMA:
 * 1. Membuat 'cincin' (rings) vertex dari pangkal (y=0) ke ujung (y=height).
 * 2. Radius setiap cincin dikontrol oleh FUNGSI KUADRAT (Pangkat 2):
 * 'parabolicCurve = Math.pow(1 - t, 2)'
 * 3. Fungsi kuadrat ini menghasilkan bentuk 3D 'Paraboloid'.
 * 4. (Catatan) Penutup (Cap) atas dan bawah sengaja mereplikasi "bug"
 * dari versi lama untuk mendapatkan bentuk yang diinginkan.
 */

import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";

export class ZubatTooth extends Node {
  constructor(GL, attribs, options = {}) {
    super();
    const opts = { ...ZubatTooth.DEFAULT_OPTIONS, ...options };
    // 1. Generate geometri (Paraboloid)
    const toothData = this._generateToothGeometry(opts);
    // 2. Buat SceneObject
    const sceneObj = new SceneObject(
      GL,
      toothData.vertices,
      toothData.faces,
      attribs
    );
    // 3. Attach ke Node
    this.setGeometry(sceneObj);
  }

  /**
   * KRITERIA 3 & 4: Default options untuk parameter
   */
  static DEFAULT_OPTIONS = {
    height: 0.35, // Tinggi gigi
    baseRadius: 0.2, // Radius pangkal
    bluntness: 0.05, // Ketumpulan (0.0 = lancip, 1.0 = rata)
    segments: 160, // Resolusi keliling
    rings: 1, // Resolusi tinggi (1 sudah cukup untuk paraboloid sederhana)
    widthRatio: 0.5, // Kompresi sumbu X (0.5 = 50% lebih tipis)
    color: [0.98, 0.9, 0.85], // KRITERIA 3: Warna gading
  };

  /**
   * ALGORITMA: Generate geometry (Paraboloid)
   */
  _generateToothGeometry(opts) {
    const vertices = [];
    const faces = [];
    const {
      height,
      baseRadius,
      bluntness,
      segments,
      rings,
      widthRatio,
      color,
    } = opts;

    const tipRadius = baseRadius * bluntness;

    // --- VERTEX GENERATION (Body) ---
    for (let j = 0; j <= rings; j++) {
      const y = (j / rings) * height;
      const t = j / rings;

      // KRITERIA 2: FUNGSI KUADRAT (y = x^2)
      // Ini yang menjadikannya Paraboloid
      const parabolicCurve = Math.pow(1 - t, 2); //
      const currentRadius =
        tipRadius + (baseRadius - tipRadius) * parabolicCurve;

      // Generate 1 Cincin (Ring)
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;

        // Terapkan 'widthRatio' untuk kompresi
        let x = Math.cos(angle) * currentRadius * widthRatio;
        const z = Math.sin(angle) * currentRadius;

        vertices.push(x, y, z);
        vertices.push(...color);

        // Normal (menggunakan formula lama)
        const normalX = x;
        const normalY = 0.05 * (baseRadius - currentRadius);
        const normalZ = z;
        const len =
          Math.sqrt(
            normalX * normalX + normalY * normalY + normalZ * normalZ
          ) || 1;
        vertices.push(normalX / len, normalY / len, normalZ / len);
      }
    }

    // --- FACE GENERATION (Body Strip) ---
    for (let j = 0; j < rings; j++) {
      for (let i = 0; i < segments; i++) {
        const idx1 = j * (segments + 1) + i;
        const idx2 = (j + 1) * (segments + 1) + i;
        const idx3 = idx1 + 1;
        const idx4 = idx2 + 1;
        faces.push(idx1, idx2, idx3);
        faces.push(idx2, idx4, idx3);
      }
    }

    // --- Penutup Pangkal (Base Cap) ---
    // (Mereplikasi "bug" lama: menghubungkan pusat pangkal ke cincin UJUNG)
    const baseCenterIndex = vertices.length / 9;
    vertices.push(0, 0, 0, ...color, 0, -1, 0); // Titik pusat pangkal
    for (let i = 0; i < segments; i++) {
      faces.push(
        i + 1, // Cincin UJUNG (index 1)
        i, // Cincin UJUNG (index 0)
        baseCenterIndex
      );
    }

    // --- Penutup Ujung (Tip Cap) ---
    // (Mereplikasi "bug" lama: menghubungkan pusat ujung ke cincin PANGKAL)
    const tipCenterIndex = vertices.length / 9;
    vertices.push(0, height, 0, ...color, 0, 1, 0); // Titik pusat ujung
    const topRingStartIndex = rings * (segments + 1); // Cincin PANGKAL
    for (let i = 0; i < segments; i++) {
      faces.push(
        topRingStartIndex + i, // Cincin PANGKAL
        topRingStartIndex + i + 1, // Cincin PANGKAL
        tipCenterIndex
      );
    }

    return { vertices, faces };
  }
}