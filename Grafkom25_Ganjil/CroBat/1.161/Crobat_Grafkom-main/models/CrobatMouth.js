// models/CrobatMouth.js

import { SceneObject } from "./SceneObject.js";

export class CrobatMouth extends SceneObject {
  constructor(GL, _position, _color, _normal) {
    super(GL, _position, _color, _normal);

    const MOUTH_COLOR = [0.1, 0.1, 0.1]; // Abu-abu gelap
    const WIDTH = 1.3, HEIGHT = 0.5, SEGMENTS = 16;

    this.vertices.push(0, 0, 0, ...MOUTH_COLOR, 0, 0, 1);

    for (let i = 0; i <= SEGMENTS; i++) {
        const angle = (i * Math.PI) / SEGMENTS;
        const x = (WIDTH / 2) * Math.cos(angle);
        const y = HEIGHT * Math.sin(angle);
        this.vertices.push(x, y, 0, ...MOUTH_COLOR, 0, 0, 1);
    }

    for (let i = 0; i < SEGMENTS; i++) {
        this.faces.push(0, i + 1, i + 2);
    }
    
    this.setup();
  }
}