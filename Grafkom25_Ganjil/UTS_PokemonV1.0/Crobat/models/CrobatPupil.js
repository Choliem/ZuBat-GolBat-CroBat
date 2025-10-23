// models/CrobatPupil.js
import { SceneObject } from "./SceneObject.js";

export class CrobatPupil extends SceneObject {
  constructor(GL, attribs) {
    let vertices = [], faces = [];
    const RED = [1.0, 0.0, 0.0];
    const RADIUS = 0.04;
    const SEGMENTS = 16;
    
    vertices.push(0, 0, 0, ...RED, 0, 0, 1);

    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = (i * 2 * Math.PI) / SEGMENTS;
      const x = RADIUS * Math.cos(angle);
      const y = RADIUS * Math.sin(angle);
      vertices.push(x, y, 0, ...RED, 0, 0, 1);
    }

    for (let i = 0; i < SEGMENTS; i++) {
      faces.push(0, i + 1, i + 2);
    }
    
    super(GL, vertices, faces, attribs);
  }
}