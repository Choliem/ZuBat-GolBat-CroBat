// models/CrobatEar.js

import { SceneObject } from "./SceneObject.js";

export class CrobatEar extends SceneObject {
  constructor(GL, _position, _color, _normal, earColor) {
    super(GL, _position, _color, _normal);

    const segments = 20;
    const height = 2.5;
    const radius = 0.8;
    const bendAmount = 0.4;

    for (let j = 0; j <= segments; j++) {
      const y_ratio = j / segments;
      const y = y_ratio * height;

      // Geometri (dari file Anda)
      // Taper (meruncing)
      const taper = 1.0 - Math.pow(y_ratio, 3);
      const currentRadius = radius * taper;

      // Bend (bengkok)
      const bend = bendAmount * height * y_ratio * y_ratio;

      // =========================================================
      // KALKULASI NORMAL (IMPROVEMENT)
      // Kita hitung turunan (derivative) untuk mendapatkan tangent & bitangent

      // Turunan dari Taper
      // r(y_ratio) = radius * (1 - y_ratio^3)
      // r'(y_ratio) = radius * (-3 * y_ratio^2)
      const deriv_taper = radius * (-3 * Math.pow(y_ratio, 2));

      // Turunan dari Bend
      // f(y_ratio) = bendAmount * height * y_ratio^2
      // f'(y_ratio) = bendAmount * height * 2 * y_ratio
      const deriv_bend = bendAmount * height * 2 * y_ratio;
      // =========================================================

      for (let i = 0; i <= segments; i++) {
        const angle_ratio = i / segments;
        const angle = angle_ratio * 2 * Math.PI;
        const cos_a = Math.cos(angle);
        const sin_a = Math.sin(angle);

        // Kalkulasi Posisi Vertex
        const x = currentRadius * cos_a;
        const z = currentRadius * sin_a - bend;

        // =========================================================
        // KALKULASI NORMAL (IMPROVEMENT LANJUTAN)

        // 1. Tangent (sepanjang sudut 'angle')
        // Turunan parsial dari (x, y, z) terhadap 'angle'
        const tx = -currentRadius * sin_a;
        const ty = 0;
        const tz = currentRadius * cos_a;
        const tangent = [tx, ty, tz];

        // 2. Bitangent (sepanjang 'y_ratio')
        // Turunan parsial dari (x, y, z) terhadap 'y_ratio'
        const bx = deriv_taper * cos_a;
        const by = height / segments; // Perubahan y per segmen
        const bz = deriv_taper * sin_a - deriv_bend / segments; // Perubahan z per segmen
        const bitangent = [bx, by, bz];

        // 3. Normal (Cross product: Tangent x Bitangent)
        const nx = tangent[1] * bitangent[2] - tangent[2] * bitangent[1];
        const ny = tangent[2] * bitangent[0] - tangent[0] * bitangent[2];
        const nz = tangent[0] * bitangent[1] - tangent[1] * bitangent[0];

        // Normalisasi
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        // =========================================================

        this.vertices.push(x, y, z, ...earColor, nx / len, ny / len, nz / len);
      }
    }

    // Loop untuk faces (tidak berubah)
    for (let j = 0; j < segments; j++) {
      for (let i = 0; i < segments; i++) {
        const first = j * (segments + 1) + i;
        const second = first + segments + 1;
        this.faces.push(first, second, first + 1);
        this.faces.push(second, second + 1, first + 1);
      }
    }

    this.setup();
  }
}
