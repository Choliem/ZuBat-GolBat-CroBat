// models/CrobatEyelid.js
import { SceneObject } from "../SceneObject.js";

export class CrobatEyelid extends SceneObject {
  constructor(GL, attribs) {
    let vertices = [],
      faces = [];
    const BLACK = [0.0, 0.0, 0.0];

    const WIDTH = 0.17;
    const THICKNESS = 0.02;
    const ANGLE_HEIGHT = 0.04;

    const p1 = [-WIDTH, 0, 0];
    const p2 = [WIDTH, 0, 0];
    const p3 = [WIDTH, THICKNESS + ANGLE_HEIGHT, 0];
    const p4 = [-WIDTH, THICKNESS, 0];

    vertices.push(...p1, ...BLACK, 0, 0, 1);
    vertices.push(...p2, ...BLACK, 0, 0, 1);
    vertices.push(...p3, ...BLACK, 0, 0, 1);
    vertices.push(...p4, ...BLACK, 0, 0, 1);

    faces.push(0, 1, 2);
    faces.push(0, 2, 3);

    super(GL, vertices, faces, attribs, "POS_COL_NORM");
  }
}
