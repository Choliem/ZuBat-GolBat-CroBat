import { SceneObject } from "./SceneObject.js";

export const Water = {
  createGeometry: function (scale) {
    let waterLevel = -scale + 5;
    var water_vertex = [-scale * 1.5, waterLevel, -scale * 1.5, 0, 0, -scale * 1.5, waterLevel, scale * 1.5, 0, 3, scale * 1.5, waterLevel, scale * 1.5, 3, 3, scale * 1.5, waterLevel, -scale * 1.5, 3, 0];
    var water_faces = [0, 1, 2, 0, 2, 3];
    return { vertices: water_vertex, faces: water_faces, waterLevel: waterLevel };
  },

  createSceneObject: function (GL, attribs, texture, scale) {
    var geom = this.createGeometry(scale);
    var sceneObj = new SceneObject(GL, geom.vertices, geom.faces, attribs, "POS_UV", texture);
    return {
      sceneObject: sceneObj,
      waterLevel: geom.waterLevel,
    };
  },
};
