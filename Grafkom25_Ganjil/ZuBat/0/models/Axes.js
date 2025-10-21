/*
 * ===================================================================
 * Axes.js - Objek Debug (Sumbu X, Y, Z)
 * ===================================================================
 *
 * Ini adalah 'Node' khusus untuk debugging.
 * Meng-override method 'draw' standar untuk memanggil 'drawLines'
 * dari SceneObject-nya.
 */
import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";

export class Axes extends Node {
  constructor(GL, attribs) {
    super(); // Panggil constructor Node

    // Data geometri (X=Merah, Y=Hijau, Z=Biru)
    // Format: [Pos, Col, Norm (dummy)]
    const vertices = [
      -20,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0, // X-axis
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

    // Buat SceneObject (tanpa 'faces')
    const sceneObj = new SceneObject(GL, vertices, [], attribs);

    // Simpan scene object-nya
    this.setGeometry(sceneObj);
  }

  /**
   * Override method 'draw' dari Node.
   * Memaksa SceneObject untuk di-render sebagai 'GL.LINES'.
   */
  draw(parentMatrix, _Mmatrix) {
    var finalMatrix = LIBS.multiply(this.localMatrix, parentMatrix);

    if (this.sceneObject) {
      // Panggil method 'drawLines' khusus dari SceneObject
      this.sceneObject.drawLines(finalMatrix, _Mmatrix);
    }
  }
}