/*
 * GolbatTooth.js
 */
import { SceneObject } from "../SceneObject.js";
import { Node } from "../Node.js"; // <-- Impor Node

// (Fungsi generatePyramid tetap sama di sini...)
function generatePyramid(color) {
  var vertices = [];
  var faces = [0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2];
  var points = [
    [0.0, 1.0, 0.0],
    [-0.5, 0.0, 0.5],
    [0.5, 0.0, 0.5],
    [0.0, 0.0, -0.5],
  ];
  var normals = [
    [0.0, 0.447, 0.894],
    [-0.894, 0.447, 0.0],
    [0.894, 0.447, 0.0],
    [0.0, -1.0, 0.0],
  ];
  var face_normals = [normals[0], normals[1], normals[2], normals[3]];
  for (var i = 0; i < faces.length; i++) {
    var point_index = faces[i];
    var point = points[point_index];
    var normal_index = Math.floor(i / 3);
    var normal = face_normals[normal_index];
    vertices.push(point[0], point[1], point[2]);
    vertices.push(color[0], color[1], color[2]);
    vertices.push(normal[0], normal[1], normal[2]);
  }
  return { vertices: vertices, faces: faces };
}

// export class GolbatTooth { // <-- LAMA
export class GolbatTooth extends Node {
  // <-- BARU
  constructor(GL, attribs) {
    super(); // <-- Panggil konstruktor Node

    var toothColor = [1.0, 1.0, 1.0];
    var toothPyramid = generatePyramid(toothColor);
    var sceneObj = new SceneObject(GL, toothPyramid.vertices, toothPyramid.faces, attribs, "POS_COL_NORM");
    this.setGeometry(sceneObj);
  }
}
