// File: models/CrobatBody.js
import { SceneObject } from "./SceneObject.js";

export class CrobatBody extends SceneObject {
  constructor(GL, attribs, radius = 1.0, segments = 30, rings = 30) {
    // 1. Buat geometri DULU
    let vertices = [];
    let faces = [];
    const BODY_COLOR = [0.37, 0.23, 0.5];

    // Loop untuk menghasilkan vertices bola yang mulus
    for (let j = 0; j <= rings; j++) {
      const phi = (j * Math.PI) / rings;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      for (let i = 0; i <= segments; i++) {
        const theta = (i * 2 * Math.PI) / segments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        const x = radius * cosTheta * sinPhi;
        const y = radius * cosPhi;
        const z = radius * sinTheta * sinPhi;

        const nx = x / radius;
        const ny = y / radius;
        const nz = z / radius;

        vertices.push(x, y, z, ...BODY_COLOR, nx, ny, nz);
      }
    }

    // Loop untuk menghasilkan faces (indices)
    for (let j = 0; j < rings; j++) {
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