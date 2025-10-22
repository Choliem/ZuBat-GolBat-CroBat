// Import SceneObject dari folder yang sama
import { SceneObject } from "./SceneObject.js";

export const Trees = {
  // --- FUNGSI HELPER GEOMETRI ---
  _createCylinderGeometry: function (radius, height, segments, color, yOffset = 0) {
    let vertices = [];
    let faces = [];
    let angleStep = (Math.PI * 2) / segments;
    let halfHeight = height / 2;

    let topCenterIndex = 0;
    let bottomCenterIndex = 1;
    vertices.push(0, halfHeight + yOffset, 0, ...color, 0.5, 0.5); // Top center
    vertices.push(0, -halfHeight + yOffset, 0, ...color, 0.5, 0.5); // Bottom center

    let currentVertex = 2;

    for (let i = 0; i <= segments; i++) {
      let angle = i * angleStep;
      let x = Math.cos(angle) * radius;
      let z = Math.sin(angle) * radius;

      vertices.push(x, halfHeight + yOffset, z, ...color, 0, 0);
      vertices.push(x, -halfHeight + yOffset, z, ...color, 0, 0);

      if (i > 0) {
        let topIdx = currentVertex;
        let bottomIdx = currentVertex + 1;
        let prevTopIdx = currentVertex - 2;
        let prevBottomIdx = currentVertex - 1;

        faces.push(prevTopIdx, prevBottomIdx, bottomIdx);
        faces.push(prevTopIdx, bottomIdx, topIdx);
        faces.push(topCenterIndex, prevTopIdx, topIdx);
        faces.push(bottomCenterIndex, bottomIdx, prevBottomIdx);
      }
      currentVertex += 2;
    }
    return { vertices, faces };
  },

  _createConeGeometry: function (radius, height, segments, color, yOffset = 0) {
    let vertices = [];
    let faces = [];
    let angleStep = (Math.PI * 2) / segments;
    let halfHeight = height / 2;

    let apexIndex = 0;
    let bottomCenterIndex = 1;
    vertices.push(0, halfHeight + yOffset, 0, ...color, 0.5, 0.5); // Apex
    vertices.push(0, -halfHeight + yOffset, 0, ...color, 0.5, 0.5); // Bottom center

    let currentVertex = 2;

    for (let i = 0; i <= segments; i++) {
      let angle = i * angleStep;
      let x = Math.cos(angle) * radius;
      let z = Math.sin(angle) * radius;

      vertices.push(x, -halfHeight + yOffset, z, ...color, 0, 0);

      if (i > 0) {
        let bottomIdx = currentVertex;
        let prevBottomIdx = currentVertex - 1;

        faces.push(apexIndex, prevBottomIdx, bottomIdx);
        faces.push(bottomCenterIndex, bottomIdx, prevBottomIdx);
      }
      currentVertex++;
    }
    return { vertices, faces };
  },
  // --- AKHIR FUNGSI HELPER ---

  createGeometry: function (islandRadius, getIslandHeight, waterLevel) {
    var tree_vertices = [];
    var tree_faces = [];

    const TRUNK_COLOR = [0.25, 0.15, 0.05];
    const LEAF_COLOR = [0.0, 0.2, 0.05];
    const SEGMENTS = 8;

    let treeCount = 0;
    let validTreePositions = [];

    for (let i = 0; i < 200; i++) {
      let angle = Math.random() * Math.PI * 2;
      let radius = Math.sqrt(Math.random()) * islandRadius * 0.95;
      let treeX = Math.cos(angle) * radius;
      let treeZ = Math.sin(angle) * radius;
      let treeY = getIslandHeight(treeX, treeZ);

      if (treeY > waterLevel + 10) {
        let trunkHeight = 90 + Math.random() * 60;
        let trunkRadius = 12 + Math.random() * 6;

        let base_y = treeY;
        let current_offset = tree_vertices.length / 8;

        validTreePositions.push({
          x: treeX,
          z: treeZ,
          baseY: base_y,
          trunkHeight: trunkHeight,
          trunkRadius: trunkRadius,
          leafBottomY: base_y + trunkHeight + Math.random() * 75 * 0.4 - 75 / 2,
        });

        // 1. Buat Batang (Cylinder)
        let trunkGeom = this._createCylinderGeometry(trunkRadius, trunkHeight, SEGMENTS, TRUNK_COLOR);
        for (let v = 0; v < trunkGeom.vertices.length; v += 8) {
          trunkGeom.vertices[v + 0] += treeX;
          trunkGeom.vertices[v + 1] += base_y + trunkHeight / 2;
          trunkGeom.vertices[v + 2] += treeZ;
        }
        tree_vertices.push(...trunkGeom.vertices);
        trunkGeom.faces.forEach((face) => tree_faces.push(face + current_offset));

        base_y += trunkHeight;
        current_offset = tree_vertices.length / 8;

        // 2. Buat Daun (Cones)
        let stackCount = Math.random() < 0.5 ? 2 : 3;
        let leafRadius = 60 + Math.random() * 30;
        let leafHeight = 75 + Math.random() * 30;

        for (let s = 0; s < stackCount; s++) {
          let currentRadius = leafRadius * (1.0 - (s / stackCount) * 0.5);
          let currentHeight = leafHeight * (1.0 - (s / stackCount) * 0.3);
          let y_pos = base_y + s * leafHeight * 0.4 - currentHeight / 2;

          let coneGeom = this._createConeGeometry(currentRadius, currentHeight, SEGMENTS, LEAF_COLOR);
          for (let v = 0; v < coneGeom.vertices.length; v += 8) {
            coneGeom.vertices[v + 0] += treeX;
            coneGeom.vertices[v + 1] += y_pos + currentHeight / 2;
            coneGeom.vertices[v + 2] += treeZ;
          }
          tree_vertices.push(...coneGeom.vertices);
          coneGeom.faces.forEach((face) => tree_faces.push(face + current_offset));
          current_offset = tree_vertices.length / 8;
        }
        treeCount++;
      }
    }
    console.log("Generated " + treeCount + " 3D trees.");
    return { vertices: tree_vertices, faces: tree_faces, validTreePositions: validTreePositions };
  },

  createSceneObject: function (GL, attribs, islandRadius, getIslandHeight, waterLevel) {
    var geom = this.createGeometry(islandRadius, getIslandHeight, waterLevel);

    var sceneObj = new SceneObject(
      GL,
      geom.vertices,
      geom.faces,
      attribs,
      "POS_COL_UV" // Layout: Posisi, Warna, dan UV
    );
    return {
      sceneObject: sceneObj,
      validTreePositions: geom.validTreePositions,
    };
  },
};
