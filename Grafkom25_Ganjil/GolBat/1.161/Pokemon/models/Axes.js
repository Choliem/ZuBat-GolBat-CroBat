/*
 * Axes.js
 */
import { SceneObject } from "./SceneObject.js";

export class Axes {
  constructor(GL, attribs) {
    this.GL = GL;
    this.attribs = attribs;

    var vertices = [-3, 0, 0, 1, 0, 0, 3, 0, 0, 1, 0, 0, 0, -3, 0, 0, 1, 0, 0, 3, 0, 0, 1, 0, 0, 0, -3, 0, 0, 1, 0, 0, 3, 0, 0, 1, 0];
    this.sceneObject = new SceneObject(GL, vertices, [], attribs);
    this.sceneObject.vertexCount = 6; // 6 titik untuk 3 garis
  }

  draw(parentMatrix, _Mmatrix) {
    this.sceneObject.drawLines(parentMatrix, _Mmatrix);
  }
}
