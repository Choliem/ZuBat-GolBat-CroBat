// models/CrobatEar.js
import { SceneObject } from "./SceneObject.js";

export class CrobatEar extends SceneObject {
  constructor(GL, attribs) {
    // 1. Buat geometri DULU
    let vertices = [];
    let faces = [];
    const EAR_COLOR = [0.37, 0.23, 0.5];
    const segments = 20;
    const height = 2.5;
    const radius = 0.8;
    const bendAmount = 0.4;

    for (let j = 0; j <= segments; j++) {
      const y_ratio = j / segments;
      const y = y_ratio * height;
      
      const taper = 1.0 - Math.pow(y_ratio, 3);
      const currentRadius = radius * taper;

      for (let i = 0; i <= segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;
        const x = currentRadius * Math.cos(angle);
        let z = currentRadius * Math.sin(angle);

        z -= bendAmount * y * y_ratio;

        const nx = Math.cos(angle);
        const ny = radius / height;
        const nz = Math.sin(angle);

        vertices.push(x, y, z, ...EAR_COLOR, nx, ny, nz);
      }
    }

    for (let j = 0; j < segments; j++) {
      for (let i = 0; i < segments; i++) {
        const first = j * (segments + 1) + i;
        const second = first + segments + 1;
        faces.push(first, second, first + 1);
        faces.push(second, second + 1, first + 1);
      }
    }

    // 2. Panggil super() di AKHIR
    super(GL, vertices, faces, attribs);
  }
}