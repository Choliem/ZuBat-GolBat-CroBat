// models/CrobatEyeYellow.js
import { SceneObject } from "./SceneObject.js";

export class CrobatEyeYellow extends SceneObject {
  constructor(GL, _position, _color, _normal) {
    super(GL, _position, _color, _normal);

    const YELLOW_COLOR = [1.0, 1.0, 0.0];
    const SEGMENTS = 32;
    const RADIUS_X = 0.15; // Sedikit lebih kecil
    const RADIUS_Y = 0.08;
    const ROTATION_ANGLE = 0.35; // 20 derajat

    this.vertices.push(0, 0, 0, ...YELLOW_COLOR, 0, 0, 1);

    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = (i * 2 * Math.PI) / SEGMENTS;
      const x = RADIUS_X * Math.cos(angle);
      const y = RADIUS_Y * Math.sin(angle);
      
      const cosA = Math.cos(ROTATION_ANGLE);
      const sinA = Math.sin(ROTATION_ANGLE);
      const rotatedX = x * cosA - y * sinA;
      const rotatedY = x * sinA + y * cosA;

      this.vertices.push(rotatedX, rotatedY, 0, ...YELLOW_COLOR, 0, 0, 1);
    }

    for (let i = 0; i < SEGMENTS; i++) {
      this.faces.push(0, i + 1, i + 2);
    }

    this.setup();
  }
}