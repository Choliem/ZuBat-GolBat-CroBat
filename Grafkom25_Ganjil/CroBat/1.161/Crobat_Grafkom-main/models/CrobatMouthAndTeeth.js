// models/CrobatMouthAndTeeth.js
import { SceneObject } from "./SceneObject.js";

export class CrobatMouthAndTeeth extends SceneObject {
  constructor(GL, _position, _color, _normal) {
    super(GL, _position, _color, _normal);

    const MOUTH_COLOR = [0.95, 0.95, 0.95]; // Putih
    const LINE_COLOR = [0.1, 0.1, 0.1];     // Hitam untuk gigi

    const MOUTH_WIDTH = 1.6;
    const MOUTH_HEIGHT = 1.3;
    const SEGMENTS = 16;

    // === STEP 1: Buat Kurva Bezier untuk Mulut ===
    // Titik kontrol Bezier Quadratic
    const P0 = [-MOUTH_WIDTH / 2, 0];      // Kiri bawah
    const P1 = [0, MOUTH_HEIGHT * 0.7];    // Puncak (sedikit lebih rendah → lebih tumpul)
    const P2 = [MOUTH_WIDTH / 2, 0];       // Kanan bawah

    // Titik pusat untuk triangle fan
    this.vertices.push(0, 0, 0, ...MOUTH_COLOR, 0, 0, 1);

    // Sampling titik-titik di sepanjang kurva Bezier
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const x = (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0];
      const y = (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1];
      this.vertices.push(x, y, 0, ...MOUTH_COLOR, 0, 0, 1);
    }

    // Faces: triangulasi dari pusat ke kurva
    for (let i = 0; i < SEGMENTS; i++) {
      this.faces.push(0, i + 1, i + 2);
    }

    // === STEP 2: Buat Gigi Hitam (Tetap sama) ===
    const LINE_WIDTH = 0.03;
    const LINE_HEIGHT = 0.25;
    const positions = [-0.15, 0.15]; // Posisi gigi kiri & kanan
    const zOffset = 0.01;

    for (const posX of positions) {
      const baseIndex = this.vertices.length / 9;
      this.vertices.push(
        -LINE_WIDTH / 2 + posX, 0, zOffset, ...LINE_COLOR, 0, 0, 1,
         LINE_WIDTH / 2 + posX, 0, zOffset, ...LINE_COLOR, 0, 0, 1,
         LINE_WIDTH / 2 + posX, LINE_HEIGHT, zOffset, ...LINE_COLOR, 0, 0, 1,
        -LINE_WIDTH / 2 + posX, LINE_HEIGHT, zOffset, ...LINE_COLOR, 0, 0, 1
      );
      this.faces.push(
        baseIndex, baseIndex + 1, baseIndex + 2,
        baseIndex, baseIndex + 2, baseIndex + 3
      );
    }

    this.setup();
  }
}