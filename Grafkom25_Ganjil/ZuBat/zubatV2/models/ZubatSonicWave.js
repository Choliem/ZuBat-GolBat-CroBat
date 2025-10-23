/*
 * ===================================================================
 * KRITERIA 1: ZubatSonicWave
 * ===================================================================
 *
 * KRITERIA 2 & 5: JENIS OBJEK (GABUNGAN TORUS/CINCIN)
 *
 * ALGORITMA:
 * 1. Membuat beberapa (numRings) mesh "Torus" (donat) tipis.
 * 2. Setiap torus dibuat pada jarak 'ringSpacing' dan
 * radiusnya membesar sebesar 'radiusGrowth'.
 * 3. Semua data vertex dan face dari semua torus digabungkan
 * menjadi satu SceneObject yang efisien.
 */

import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";

export class ZubatSonicWave extends Node {
  constructor(GL, attribs, options = {}) {
    super();
    const opts = { ...ZubatSonicWave.DEFAULT_OPTIONS, ...options };

    // 1. Generate gabungan geometri
    const allRingsData = this._generateAllRings(opts);

    // 2. Buat satu SceneObject dari data gabungan
    const sceneObj = new SceneObject(
      GL,
      allRingsData.vertices,
      allRingsData.faces,
      attribs
    );

    // 3. Attach ke Node
    this.setGeometry(sceneObj);
  }

  /**
   * KRITERIA 3 & 4: Default options untuk parameter
   */
  static DEFAULT_OPTIONS = {
    numRings: 5, // Jumlah cincin
    ringSpacing: 0.8, // Jarak antar cincin (di sumbu Z)
    baseRadius: 0.8, // Radius cincin pertama
    radiusGrowth: 0.4, // Pertambahan radius per cincin
    tubeThickness: 0.03, // Ketebalan tabung cincin
    mainSegments: 32, // Resolusi cincin utama (seberapa bulat)
    tubeSegments: 8, // Resolusi tabung (seberapa halus)
    color: [0.5, 0.8, 1.0], // KRITERIA 3: Warna gelombang
  };

  /**
   * ALGORITMA: Gabungkan beberapa geometri Torus
   */
  _generateAllRings(opts) {
    const allVertices = [];
    const allFaces = [];
    let vertexOffset = 0; // Offset untuk menggabungkan index face

    for (let i = 0; i < opts.numRings; i++) {
      const currentRadius = opts.baseRadius + i * opts.radiusGrowth;
      const currentZ = i * opts.ringSpacing;

      // Generate data untuk 1 torus
      const torusData = this._generateTorus(currentRadius, currentZ, opts);

      // Gabungkan vertices
      allVertices.push(...torusData.vertices);

      // Gabungkan faces (dengan offset)
      for (let f = 0; f < torusData.faces.length; f++) {
        allFaces.push(torusData.faces[f] + vertexOffset);
      }

      // Update offset untuk set berikutnya
      vertexOffset += torusData.vertices.length / 9; // 9 float (pos,col,norm) per vertex
    }
    return { vertices: allVertices, faces: allFaces };
  }

  /**
   * ALGORITMA: Generate geometry 1 Torus (Cincin)
   */
  _generateTorus(radius, zOffset, opts) {
    const vertices = [];
    const faces = [];
    const { tubeThickness, mainSegments, tubeSegments, color } = opts;

    // --- VERTEX GENERATION ---
    for (let i = 0; i <= mainSegments; i++) {
      const mainAngle = (i / mainSegments) * 2 * Math.PI;
      const cosMain = Math.cos(mainAngle);
      const sinMain = Math.sin(mainAngle);

      const centerX = cosMain * radius;
      const centerY = sinMain * radius;

      const normal = [cosMain, sinMain, 0];
      const binormal = [0, 0, 1]; // Sumbu Z lokal

      for (let j = 0; j <= tubeSegments; j++) {
        const tubeAngle = (j / tubeSegments) * 2 * Math.PI;
        const cosTube = Math.cos(tubeAngle);
        const sinTube = Math.sin(tubeAngle);

        // Posisi vertex
        const v_x =
          centerX +
          (normal[0] * cosTube + binormal[0] * sinTube) * tubeThickness;
        const v_y =
          centerY +
          (normal[1] * cosTube + binormal[1] * sinTube) * tubeThickness;
        // Terapkan Z-Offset untuk cincin ini
        const v_z =
          zOffset +
          (normal[2] * cosTube + binormal[2] * sinTube) * tubeThickness;

        // Normal vertex
        const v_n_x = normal[0] * cosTube + binormal[0] * sinTube;
        const v_n_y = normal[1] * cosTube + binormal[1] * sinTube;
        const v_n_z = normal[2] * cosTube + binormal[2] * sinTube;

        vertices.push(v_x, v_y, v_z);
        vertices.push(...color);
        vertices.push(v_n_x, v_n_y, v_n_z);
      }
    }

    // --- FACE GENERATION (Standard Strip) ---
    for (let i = 0; i < mainSegments; i++) {
      for (let j = 0; j < tubeSegments; j++) {
        const first = i * (tubeSegments + 1) + j;
        const second = first + tubeSegments + 1;

        faces.push(first, second, first + 1);
        faces.push(second, second + 1, first + 1);
      }
    }
    return { vertices, faces };
  }
}
