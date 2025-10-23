import { SceneObject } from "./SceneObject.js";
import { Node } from "./Node.js";

export const Clouds = {
  // --- FUNGSI HELPER GEOMETRI (Sama) ---
  _createSphereGeometry: function (radius, latSegments, longSegments, color, yOffset = 0) {
    let vertices = [];
    let faces = [];
    vertices.push(0, radius + yOffset, 0, ...color, 0.5, 1.0);
    vertices.push(0, -radius + yOffset, 0, ...color, 0.5, 0.0);
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

  // --- FUNGSI UTAMA (DIGANTI TOTAL) ---
  createSceneObjects: function (GL, attribs, numClouds, skyRadius, skyHeight) {
    let cloudNodes = [];
    let cloudAnimData = [];

    const CLOUD_COLOR = [0.3, 0.3, 0.45];
    const SPHERE_SEGMENTS = 10;

    // --- PENGATURAN BATAS KECEPATAN ---
    // Ubah nilai ini sesuai keinginan Anda
    const MIN_CLOUD_SPEED = 0.05; // Batas bawah (misal: lebih lambat)
    const MAX_CLOUD_SPEED = 0.1; // Batas atas (misal: jauh lebih lambat dari 0.5)
    // --- AKHIR PENGATURAN ---

    // --- Definisi 3 Template Awan (Sama) ---
    const cloudTemplate1 = [
      { x: -90, y: 0, z: 5, r: 50 },
      { x: -40, y: 0, z: -5, r: 50 },
      { x: 10, y: 0, z: 0, r: 50 },
      { x: 60, y: 0, z: 5, r: 50 },
      { x: -70, y: 40, z: -3, r: 50 },
      { x: -10, y: 45, z: 3, r: 50 },
      { x: 40, y: 40, z: 0, r: 50 },
    ];
    const cloudTemplate2 = [
      { x: -40, y: 0, z: 0, r: 50 },
      { x: 10, y: 0, z: 5, r: 50 },
      { x: 60, y: 0, z: -3, r: 50 },
      { x: -20, y: 40, z: 2, r: 50 },
      { x: 30, y: 40, z: -2, r: 50 },
    ];
    const cloudTemplate3 = [
      { x: -100, y: 0, z: -2, r: 50 },
      { x: -50, y: 0, z: 3, r: 60 },
      { x: 0, y: 0, z: -5, r: 50 },
      { x: 50, y: 0, z: 0, r: 60 },
      { x: 100, y: 0, z: 5, r: 50 },
      { x: -80, y: 40, z: 0, r: 50 },
      { x: -20, y: 45, z: -4, r: 60 },
      { x: 30, y: 40, z: 4, r: 50 },
      { x: 80, y: 35, z: 0, r: 50 },
    ];
    const allTemplates = [cloudTemplate1, cloudTemplate2, cloudTemplate3];

    for (let i = 0; i < numClouds; i++) {
      // --- UNTUK SETIAP AWAN, BUAT GEOMETRI BARU ---
      let cloud_vertices = [];
      let cloud_faces = [];
      let current_offset = 0;

      let cloudX = (Math.random() - 0.5) * 2 * skyRadius;
      let cloudY = skyHeight + (Math.random() - 0.5) * 400;
      let cloudZ = (Math.random() - 0.5) * 2 * skyRadius;
      let cloudMainScale = 1.3 + Math.random() * 7.5;

      const template = allTemplates[i % allTemplates.length];

      for (const clump of template) {
        let clumpRadius = clump.r * cloudMainScale;
        let cX = clump.x * cloudMainScale;
        let cY = clump.y * cloudMainScale;
        let cZ = clump.z * cloudMainScale;

        let sphereGeom = this._createSphereGeometry(clumpRadius, SPHERE_SEGMENTS, SPHERE_SEGMENTS, CLOUD_COLOR, 0);

        for (let v = 0; v < sphereGeom.vertices.length; v += 8) {
          sphereGeom.vertices[v + 0] += cX;
          sphereGeom.vertices[v + 1] += cY;
          sphereGeom.vertices[v + 2] += cZ;
        }

        sphereGeom.faces.forEach((face) => cloud_faces.push(face + current_offset));
        cloud_vertices.push(...sphereGeom.vertices);
        current_offset = cloud_vertices.length / 8;
      }

      let cloudObj = new SceneObject(GL, cloud_vertices, cloud_faces, attribs, "POS_COL_UV");
      let cloudNode = new Node();
      cloudNode.setGeometry(cloudObj);

      cloudNode.localMatrix[12] = cloudX;
      cloudNode.localMatrix[13] = cloudY;
      cloudNode.localMatrix[14] = cloudZ;

      cloudNodes.push(cloudNode);

      // 7. Buat dan simpan data animasi acak
      let direction = Math.random() < 0.5 ? 1.0 : -1.0;

      // Formula: MIN + (RANDOM * (MAX - MIN))
      let speed = MIN_CLOUD_SPEED + Math.random() * (MAX_CLOUD_SPEED - MIN_CLOUD_SPEED);

      let startOffset = Math.random() * 10000;

      cloudAnimData.push({
        node: cloudNode,
        baseX: cloudX,
        baseY: cloudY,
        baseZ: cloudZ,
        speed: speed,
        direction: direction,
        startOffset: startOffset,
      });
    }

    console.log("Generated " + numClouds + " individual cloud objects.");

    return { cloudNodes: cloudNodes, cloudAnimData: cloudAnimData };
  },
};
