import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";

// 1. Ubah menjadi 'extends Node'
export class Axes extends Node {
  constructor(GL, attribs) {
    super(); // Panggil constructor Node

    // Data geometri tetap sama
    const vertices = [
      -20,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0, // X-axis (pos, color, normal)
      20,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      -20,
      0,
      0,
      1,
      0,
      0,
      0,
      0, // Y-axis
      0,
      20,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      -20,
      0,
      0,
      1,
      0,
      0,
      0, // Z-axis
      0,
      0,
      20,
      0,
      0,
      1,
      0,
      0,
      0,
    ];

    // (Anda bisa tambahkan geometri arrowhead di sini jika mau)

    // 2. Buat SceneObject (menggunakan 'vertices' tapi tanpa 'faces')
    const sceneObj = new SceneObject(GL, vertices, [], attribs);

    // 3. Simpan scene object-nya
    this.setGeometry(sceneObj);
  }

  // 4. Ubah 'render' menjadi 'draw' (overriding Node.draw)
  draw(parentMatrix, _Mmatrix) {
    // Hitung matriks final
    var finalMatrix = LIBS.multiply(this.localMatrix, parentMatrix);

    // Panggil metode drawLines khusus dari SceneObject
    if (this.sceneObject) {
      // Kita perlu cara untuk memberitahu SceneObject agar render sebagai LINES
      // Mari kita modifikasi SceneObject.draw() sedikit ATAU
      // gunakan metode drawLines() yang sudah ada di SceneObject

      // Versi simple: panggil drawLines yang sudah ada
      this.sceneObject.drawLines(finalMatrix, _Mmatrix, this.attribs);
    }
  }
}