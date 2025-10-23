import { SceneObject } from "./SceneObject.js";

export const Spiders = {
  _createSphereGeometry: function (radius, latSegments, longSegments, color, yOffset = 0) {
    let vertices = [];
    let faces = [];

    vertices.push(0, radius + yOffset, 0, ...color, 0.5, 1.0); // Top pole
    vertices.push(0, -radius + yOffset, 0, ...color, 0.5, 0.0); // Bottom pole

    const PI = Math.PI;
    const TWO_PI = Math.PI * 2;

    for (let i = 1; i < latSegments; i++) {
      const theta = PI * (i / latSegments);
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let j = 0; j <= longSegments; j++) {
        const phi = TWO_PI * (j / longSegments);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = radius * sinTheta * cosPhi;
        const y = radius * cosTheta;
        const z = radius * sinTheta * sinPhi;
        const u = j / longSegments;
        const v = 1 - i / latSegments;

        vertices.push(x, y + yOffset, z, ...color, u, v);
      }
    }

    let vertexIndexOffset = 2;

    for (let j = 0; j < longSegments; j++) {
      faces.push(0, vertexIndexOffset + j + 1, vertexIndexOffset + j);
    }

    for (let i = 0; i < latSegments - 2; i++) {
      for (let j = 0; j < longSegments; j++) {
        const a = vertexIndexOffset + i * (longSegments + 1) + j;
        const b = vertexIndexOffset + i * (longSegments + 1) + j + 1;
        const c = vertexIndexOffset + (i + 1) * (longSegments + 1) + j + 1;
        const d = vertexIndexOffset + (i + 1) * (longSegments + 1) + j;

        faces.push(a, d, c);
        faces.push(a, c, b);
      }
    }

    const lastRingStart = vertexIndexOffset + (latSegments - 1 - 1) * (longSegments + 1);
    const bottomPoleIndex = 1;

    for (let j = 0; j < longSegments; j++) {
      faces.push(bottomPoleIndex, lastRingStart + j, lastRingStart + j + 1);
    }

    return { vertices, faces };
  },

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

  _createSpiderGeometry: function (headRadius, bodyRadius, legLength, legRadius, color, translationX, translationY, translationZ) {
    let spider_vertices = [];
    let spider_faces = [];
    let current_offset = 0;
    const SPIDER_SEGMENTS = 8;
    const PI = Math.PI;

    // 1. Badan (Sphere)
    let bodyGeom = this._createSphereGeometry(bodyRadius, SPIDER_SEGMENTS, SPIDER_SEGMENTS, color, 0);
    for (let v = 0; v < bodyGeom.vertices.length; v += 8) {
      bodyGeom.vertices[v + 0] += translationX;
      bodyGeom.vertices[v + 1] += translationY;
      bodyGeom.vertices[v + 2] += translationZ;
    }
    spider_vertices.push(...bodyGeom.vertices);
    bodyGeom.faces.forEach((face) => spider_faces.push(face + current_offset));
    current_offset = spider_vertices.length / 8;

    // 2. Kepala (Sphere)
    let headGeom = this._createSphereGeometry(headRadius, SPIDER_SEGMENTS, SPIDER_SEGMENTS, color, 0);
    for (let v = 0; v < headGeom.vertices.length; v += 8) {
      headGeom.vertices[v + 0] += translationX;
      headGeom.vertices[v + 1] += translationY - bodyRadius * 0.9 - headRadius * 0.5;
      headGeom.vertices[v + 2] += translationZ;
    }
    spider_vertices.push(...headGeom.vertices);
    headGeom.faces.forEach((face) => spider_faces.push(face + current_offset));
    current_offset = spider_vertices.length / 8;

    // 3. Kaki (8 Silinder)
    const legPositions = [
      { x: bodyRadius * 0.6, side: 1, zOffset: 0.5 },
      { x: bodyRadius * 0.2, side: 1, zOffset: 0.2 },
      { x: -bodyRadius * 0.2, side: 1, zOffset: -0.2 },
      { x: -bodyRadius * 0.6, side: 1, zOffset: -0.5 },
      { x: bodyRadius * 0.6, side: -1, zOffset: 0.5 },
      { x: bodyRadius * 0.2, side: -1, zOffset: 0.2 },
      { x: -bodyRadius * 0.2, side: -1, zOffset: -0.2 },
      { x: -bodyRadius * 0.6, side: -1, zOffset: -0.5 },
    ];

    for (let leg of legPositions) {
      let side = leg.side;
      let legStartX = translationX + leg.x;
      let legStartY = translationY + bodyRadius * 0.1;
      let legStartZ = translationZ + bodyRadius * 0.8 * side;

      let legGeom = this._createCylinderGeometry(legRadius, legLength, SPIDER_SEGMENTS / 2, color, legLength / 2);

      for (let v = 0; v < legGeom.vertices.length; v += 8) {
        let lx = legGeom.vertices[v + 0];
        let ly = legGeom.vertices[v + 1] - legLength / 2;
        let lz = legGeom.vertices[v + 2];
        let rotAngleZ_out = (PI / 2) * -side;
        let r1x = lx * Math.cos(rotAngleZ_out) - ly * Math.sin(rotAngleZ_out);
        let r1y = lx * Math.sin(rotAngleZ_out) + ly * Math.cos(rotAngleZ_out);
        let r1z = lz;
        let rotAngleX_down = PI / 4;
        let r2x = r1x;
        let r2y = r1y * Math.cos(rotAngleX_down) - r1z * Math.sin(rotAngleX_down);
        let r2z = r1y * Math.sin(rotAngleX_down) + r1z * Math.cos(rotAngleX_down);
        let spreadAngle = (leg.x / bodyRadius) * (PI / 6);
        let r3x = r2x * Math.cos(spreadAngle) + r2z * Math.sin(spreadAngle);
        let r3y = r2y;
        let r3z = -r2x * Math.sin(spreadAngle) + r2z * Math.cos(spreadAngle);
        legGeom.vertices[v + 0] = r3x + legStartX;
        legGeom.vertices[v + 1] = r3y + legStartY;
        legGeom.vertices[v + 2] = r3z + legStartZ;
      }

      spider_vertices.push(...legGeom.vertices);
      legGeom.faces.forEach((face) => spider_faces.push(face + current_offset));
      current_offset = spider_vertices.length / 8;
    }

    return { vertices: spider_vertices, faces: spider_faces };
  },

  createGeometry: function (validTreePositions) {
    var spider_vertices = [];
    var spider_faces = [];
    var spider_web_vertices = [];
    var spider_web_faces = [];

    const SPIDER_COLOR = [0.9, 0.95, 1.0];
    const WEB_COLOR = [0.8, 0.8, 0.8];
    const smallHeadRadius = 5;
    const smallBodyRadius = 8;
    const smallLegLength = 20;
    const smallLegRadius = 1;

    let spiderCount = 0;
    const spidersToCreate = 50;

    for (let i = 0; i < spidersToCreate; i++) {
      if (validTreePositions.length === 0) break;

      let treeIndex = Math.floor(Math.random() * validTreePositions.length);
      let tree = validTreePositions[treeIndex];

      let webAttachX = tree.x + (Math.random() - 0.5) * tree.trunkRadius * 3;
      let webAttachZ = tree.z + (Math.random() - 0.5) * tree.trunkRadius * 3;
      let webAttachY = tree.baseY + tree.trunkHeight + Math.random() * 50;

      let hangDepth = Math.random() * 60 + 30;
      let spiderY = webAttachY - hangDepth;

      let spiderOffsetX = (Math.random() - 0.5) * 10;
      let spiderOffsetZ = (Math.random() - 0.5) * 10;

      let spiderGeom = this._createSpiderGeometry(smallHeadRadius, smallBodyRadius, smallLegLength, smallLegRadius, SPIDER_COLOR, webAttachX + spiderOffsetX, spiderY, webAttachZ + spiderOffsetZ);

      let spider_offset = spider_vertices.length / 8;
      spider_vertices.push(...spiderGeom.vertices);
      spiderGeom.faces.forEach((face) => spider_faces.push(face + spider_offset));

      spiderCount++;

      let web_current_offset = spider_web_vertices.length / 8;
      spider_web_vertices.push(webAttachX, webAttachY, webAttachZ, ...WEB_COLOR, 0, 0);
      spider_web_vertices.push(webAttachX + spiderOffsetX, spiderY, webAttachZ + spiderOffsetZ, ...WEB_COLOR, 0, 0);
      spider_web_faces.push(web_current_offset, web_current_offset + 1);
    }
    console.log("Generated " + spiderCount + " small spiders hanging from trees.");

    return {
      spider_vertices: spider_vertices,
      spider_faces: spider_faces,
      web_vertices: spider_web_vertices,
      web_faces: spider_web_faces,
    };
  },

  createSceneObjects: function (GL, attribs, validTreePositions) {
    var geom = this.createGeometry(validTreePositions);

    var spiderObj = new SceneObject(GL, geom.spider_vertices, geom.spider_faces, attribs, "POS_COL_UV");

    var webObj = new SceneObject(GL, geom.web_vertices, geom.web_faces, attribs, "POS_COL_UV_LINES", null, GL.LINES);

    return { spiderObj, webObj };
  },
};
