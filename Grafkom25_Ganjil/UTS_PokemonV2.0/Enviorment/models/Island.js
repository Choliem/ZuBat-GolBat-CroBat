// Import SceneObject dari folder yang sama
import { SceneObject } from "./SceneObject.js";

export const Island = {
  _getIslandHeight: function (x, z, islandRadius, scale) {
    let dist = Math.sqrt(x * x + z * z);
    let normalizedDist = dist / islandRadius;
    if (normalizedDist > 1.0) return -scale;

    let heightFactor = Math.cos(normalizedDist * Math.PI * 0.5);
    heightFactor = Math.pow(heightFactor, 1.5);

    let noise = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.3;
    noise += Math.sin(x * 0.03 + 100) * Math.cos(z * 0.03 + 100) * 0.15;

    let maxHeight = 200;
    let height = -scale + heightFactor * maxHeight + noise * maxHeight * 0.2;
    return height;
  },

  createGeometry: function (scale, gridSize, islandRadius, texture_repeat) {
    var island_vertices = [];
    var island_faces = [];

    const getHeight = (x, z) => this._getIslandHeight(x, z, islandRadius, scale);

    for (let row = 0; row <= gridSize; row++) {
      for (let col = 0; col <= gridSize; col++) {
        let x = -scale + (col / gridSize) * (2 * scale);
        let z = -scale + (row / gridSize) * (2 * scale);
        let y = getHeight(x, z);
        let u = (col / gridSize) * texture_repeat;
        let v = (row / gridSize) * texture_repeat;
        island_vertices.push(x, y, z, u, v);
      }
    }

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        let topLeft = row * (gridSize + 1) + col;
        let topRight = topLeft + 1;
        let bottomLeft = (row + 1) * (gridSize + 1) + col;
        let bottomRight = bottomLeft + 1;
        island_faces.push(topLeft, bottomLeft, topRight);
        island_faces.push(topRight, bottomLeft, bottomRight);
      }
    }
    return { vertices: island_vertices, faces: island_faces, getIslandHeight_func: getHeight };
  },

  createSceneObject: function (GL, attribs, texture, scale, gridSize, islandRadius, texture_repeat) {
    var geom = this.createGeometry(scale, gridSize, islandRadius, texture_repeat);
    var sceneObj = new SceneObject(GL, geom.vertices, geom.faces, attribs, "POS_UV", texture);
    return {
      sceneObject: sceneObj,
      getIslandHeight_func: geom.getIslandHeight_func,
    };
  },
};
