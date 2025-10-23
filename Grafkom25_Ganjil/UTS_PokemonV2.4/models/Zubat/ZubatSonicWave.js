import { Node } from "../Node.js";
import { SceneObject } from "../SceneObject.js";

export class ZubatSonicWave extends Node {
  constructor(GL, attribs, options = {}) {
    super();
    const opts = { ...ZubatSonicWave.DEFAULT_OPTIONS, ...options };

    // 1. Generate gabungan geometri
    const allRingsData = this._generateAllRings(opts);

    // 2. Buat satu SceneObject dari data gabungan
    // --- PERBAIKAN LAYOUT ---
    // Gunakan layout 'POS_COL_NORM' agar sesuai dengan shader
    const sceneObj = new SceneObject(
      GL,
      allRingsData.vertices,
      allRingsData.faces,
      attribs,
      "POS_COL_NORM" // <-- Ubah layout ke POS_COL_NORM
    );
    // --- AKHIR PERBAIKAN ---

    // 3. Attach ke Node
    this.setGeometry(sceneObj);
  }

  /**
   * KRITERIA 3 & 4: Default options untuk parameter
   */
  static DEFAULT_OPTIONS = {
    numRings: 1, // Default hanya 1 ring untuk animasi partikel
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
      // Stride sekarang 9 (Pos 3 + Col 3 + Norm 3)
      vertexOffset += torusData.vertices.length / 9;
    }
    return { vertices: allVertices, faces: allFaces };
  }

  /**
   * ALGORITMA: Generate geometry 1 Torus (Cincin)
   * Sekarang juga menghasilkan Normal
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

      const tangent = [-sinMain, cosMain, 0]; // Tangent cincin utama
      const normalRing = [cosMain, sinMain, 0]; // Normal cincin utama (keluar dari pusat torus)
      const binormalRing = [0, 0, 1]; // Binormal cincin utama (sumbu Z lokal)

      for (let j = 0; j <= tubeSegments; j++) {
        const tubeAngle = (j / tubeSegments) * 2 * Math.PI;
        const cosTube = Math.cos(tubeAngle);
        const sinTube = Math.sin(tubeAngle);

        // Hitung normal vertex (menunjuk keluar dari permukaan tabung)
        const v_n_x = normalRing[0] * cosTube + binormalRing[0] * sinTube;
        const v_n_y = normalRing[1] * cosTube + binormalRing[1] * sinTube;
        const v_n_z = normalRing[2] * cosTube + binormalRing[2] * sinTube;

        // Posisi vertex = titik pusat + normal * ketebalan
        const v_x = centerX + v_n_x * tubeThickness;
        const v_y = centerY + v_n_y * tubeThickness;
        const v_z = zOffset + v_n_z * tubeThickness; // Terapkan Z-Offset

        vertices.push(v_x, v_y, v_z);
        vertices.push(...color);
        vertices.push(v_n_x, v_n_y, v_n_z); // Tambahkan normal
      }
    }

    // --- FACE GENERATION (Standard Strip) ---
    for (let i = 0; i < mainSegments; i++) {
      for (let j = 0; j < tubeSegments; j++) {
        const first = i * (tubeSegments + 1) + j;
        const second = first + tubeSegments + 1;

        // Pastikan urutan CCW (Counter Clock Wise)
        faces.push(first, second, first + 1);
        faces.push(second, second + 1, first + 1);
      }
    }
    return { vertices, faces };
  }
}
