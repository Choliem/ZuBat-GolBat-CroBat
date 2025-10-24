// models/CrobatSclera.js
import { SceneObject } from "./SceneObject.js";

export class CrobatSclera extends SceneObject {
  constructor(GL, attribs) {
    let vertices = [], faces = [];
    const YELLOW = [1.0, 1.0, 0.0];
    const RADIUS = 0.16;
    const SEGMENTS = 16;

    vertices.push(0, 0, 0, ...YELLOW, 0, 0, 1);

    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = Math.PI + (i * Math.PI) / SEGMENTS;
      const x = RADIUS * Math.cos(angle);
      const y = RADIUS * Math.sin(angle);
      vertices.push(x, y, 0, ...YELLOW, 0, 0, 1);
    }

    for (let i = 0; i < SEGMENTS; i++) {
      faces.push(0, i + 1, i + 2);
    }
    
    super(GL, vertices, faces, attribs);
  }
}