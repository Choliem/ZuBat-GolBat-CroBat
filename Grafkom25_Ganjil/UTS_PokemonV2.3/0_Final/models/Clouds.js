// models/Clouds.js

import { SceneObject } from "./SceneObject.js";

export const Clouds = {
  // --- FUNGSI HELPER GEOMETRI (Sama) ---
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

  // --- FUNGSI UTAMA (UPDATED DENGAN TEMPLATES) ---
  createGeometry: function (numClouds, skyRadius, skyHeight) {
    var combined_vertices = [];
    var combined_faces = [];
    let current_offset = 0;

    const CLOUD_COLOR = [0.3, 0.3, 0.45]; // Warna malam
    const SPHERE_SEGMENTS = 10; // Gumpalan halus

    // --- DEFINISI 3 TEMPLATE AWAN (Sama) ---
    const cloudTemplate1 = [
      { x: -90, y: 0, z: 5, r: 50 },
      { x: -40, y: 0, z: -5, r: 50 },
      { x: 10, y: 0, z: 0, r: 50 },
      { x: 60, y: 0, z: 5, r: 50 },
      { x: -70, y: 40, z: -3, r: 50 },
      { x: -10, y: 45, z: 3, r: 50 },
      { x: 40, y: 40, z: 0, r: 50 }
    ];
    const cloudTemplate2 = [
      { x: -40, y: 0, z: 0, r: 50 },
      { x: 10, y: 0, z: 5, r: 50 },
      { x: 60, y: 0, z: -3, r: 50 },
      { x: -20, y: 40, z: 2, r: 50 },
      { x: 30, y: 40, z: -2, r: 50 }
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
      { x: 80, y: 35, z: 0, r: 50 }
    ];
    const allTemplates = [cloudTemplate1, cloudTemplate2, cloudTemplate3];
    // --- AKHIR DEFINISI TEMPLATE ---


    for (let i = 0; i < numClouds; i++) {
      // 1. Tentukan posisi pusat & skala untuk KESELURUHAN awan ini
      let cloudX = (Math.random() - 0.5) * 2 * skyRadius;
      let cloudZ = (Math.random() - 0.5) * 2 * skyRadius;
      let cloudY = skyHeight + (Math.random() - 0.5) * 400; // Ketinggian dasar
      
      let cloudMainScale = 1.5 + Math.random() * 1.0; // Skala 0.8x s/d 1.8x
      
      // --- KODE ROTASI DIHAPUS DARI SINI ---

      // 2. Pilih salah satu template secara bergiliran
      const template = allTemplates[i % allTemplates.length];

      // 3. Buat setiap gumpalan bola dari template yang dipilih
      for (const clump of template) {
        
        // 4. Terapkan skala acak ke radius & posisi gumpalan
        let clumpRadius = clump.r * cloudMainScale;
        let cX = clump.x * cloudMainScale;
        let cY = clump.y * cloudMainScale;
        let cZ = clump.z * cloudMainScale;

        // 5. --- KODE ROTASI (rotatedX, rotatedZ) DIHAPUS DARI SINI ---

        // 6. Buat geometri bola
        let sphereGeom = this._createSphereGeometry(
          clumpRadius,
          SPHERE_SEGMENTS,
          SPHERE_SEGMENTS,
          CLOUD_COLOR, 
          0 
        );

        // 7. Pindahkan vertex ke posisi final (Posisi Dunia + Posisi Gumpalan)
        for (let v = 0; v < sphereGeom.vertices.length; v += 8) {
          // --- GANTI `rotatedX` dan `rotatedZ` MENJADI `cX` dan `cZ` ---
          sphereGeom.vertices[v + 0] += cloudX + cX; 
          sphereGeom.vertices[v + 1] += cloudY + cY;
          sphereGeom.vertices[v + 2] += cloudZ + cZ;
        }

        // 8. Gabungkan ke data utama
        combined_vertices.push(...sphereGeom.vertices);
        sphereGeom.faces.forEach((face) => combined_faces.push(face + current_offset));
        current_offset = combined_vertices.length / 8; 
      }
    }
    console.log("Generated " + numClouds + " clouds from 3 templates (no rotation).");
    return { vertices: combined_vertices, faces: combined_faces };
  },

  createSceneObject: function (GL, attribs, numClouds, skyRadius, skyHeight) {
    var geom = this.createGeometry(numClouds, skyRadius, skyHeight);

    var sceneObj = new SceneObject(
      GL,
      geom.vertices,
      geom.faces,
      attribs,
      "POS_COL_UV" 
    );
    return sceneObj;
  },
};