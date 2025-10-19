/*
 * Axes.js
 */
import { SceneObject } from "./SceneObject.js";

export class Axes {
  constructor(GL, attribs) {
    this.GL = GL;
    this.attribs = attribs;

    var vertices = [-30, 0, 0, 10, 0, 0, 30, 0, 0, 10, 0, 0, 0, -30, 0, 0, 10, 0, 0, 30, 0, 0, 10, 0, 0, 0, -30, 0, 0, 10, 0, 0, 30, 0, 0, 10, 0];
    this.sceneObject = new SceneObject(GL, vertices, [], attribs);
    this.sceneObject.vertexCount = 6; // 6 titik untuk 3 garis
  }

  draw(parentMatrix, _Mmatrix) {
    this.sceneObject.drawLines(parentMatrix, _Mmatrix);
  }
}
