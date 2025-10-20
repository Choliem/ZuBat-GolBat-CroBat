// models/CrobatEar.js

import { SceneObject } from "./SceneObject.js";

export class CrobatEar extends SceneObject {
  constructor(GL, _position, _color, _normal) {
    super(GL, _position, _color, _normal);

    const EAR_COLOR = [0.37, 0.23, 0.5];
    const segments = 20;
    const height = 2.5;
    const radius = 0.8;
    const bendAmount = 0.4;

    for (let j = 0; j <= segments; j++) {
      const y_ratio = j / segments;
      const y = y_ratio * height;

      // =========================================================
      // FORMULA BARU UNTUK UJUNG YANG LEBIH RUNCING
      // Kita menggunakan Math.pow() untuk membuat kurva pengecilan
      // yang tetap tebal di awal tapi menajam drastis di akhir.
      // Anda bisa menaikkan angka '3' menjadi '4' atau '5' untuk ujung yang lebih tajam lagi.
      const taper = 1.0 - Math.pow(y_ratio, 3);
      const currentRadius = radius * taper;
      // =========================================================

      for (let i = 0; i <= segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;
        const x = currentRadius * Math.cos(angle);
        let z = currentRadius * Math.sin(angle);
        
        z -= bendAmount * y * y_ratio;
        
        const nx = Math.cos(angle);
        const ny = radius / height;
        const nz = Math.sin(angle);
        
        this.vertices.push(x, y, z, ...EAR_COLOR, nx, ny, nz);
      }
    }

    // Loop untuk faces (tidak berubah)
    for (let j = 0; j < segments; j++) {
      for (let i = 0; i < segments; i++) {
        const first = (j * (segments + 1)) + i;
        const second = first + segments + 1;
        this.faces.push(first, second, first + 1);
        this.faces.push(second, second + 1, first + 1);
      }
    }

    this.setup();
  }
}