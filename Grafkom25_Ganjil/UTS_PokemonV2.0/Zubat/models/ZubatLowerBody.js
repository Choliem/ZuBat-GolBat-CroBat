/*
 * ===================================================================
 * KRITERIA 1: Badan Bawah Zubat (dengan Kaki)
 * ===================================================================
 *
 * KRITERIA 2 & 5: JENIS OBJEK (DEFORMED SPHERE)
 *
 * ALGORITMA:
 * 1. Membuat mesh bola (sphere).
 * 2. Vertex yang berada di area "kaki" (y < 0 && z < 0) akan
 * dideformasi/ditarik posisinya menuju 'legTargets'
 * untuk mensimulasikan bentuk kaki yang runcing.
 */

import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";

export class ZubatLowerBody extends Node {
  constructor(GL, attribs, options = {}) {
    super();
    const opts = { ...ZubatLowerBody.DEFAULT_OPTIONS, ...options };
    const bodyData = this._generateBodyGeometry(opts);
    const sceneObj = new SceneObject(
      GL,
      bodyData.vertices,
      bodyData.faces,
      attribs
    );
    this.setGeometry(sceneObj);
    this._applyBodyTransformation(opts);
  }

  /**
   * KRITERIA 3 & 4: Default options untuk parameter
   */
  static DEFAULT_OPTIONS = {
    scaleFactor: 2.5,
    radius: 1.0,
    latBands: 50, // Resolusi Vertikal
    longBands: 50, // Resolusi Horizontal
    bodyColor: [0.35, 0.55, 0.95], // KRITERIA 3: Warna Biru

    // KRITERIA 3 & 4: Parameter Deformasi Kaki
    // Titik target (jauh) untuk menarik vertex
    legTargets: {
      left: [-0.4, -10.5, -4.3],
      right: [0.4, -10.5, -4.3],
    },
    // Titik pusat "pangkal" kaki di permukaan bola
    legBaseCenters: {
      left: { x: -0.25, y: -0.4, z: -0.8 },
      right: { x: 0.25, y: -0.4, z: -0.8 },
    },
    legPullRadius: 0.2, // Radius area yang ditarik
    legPullSharpness: 3.0, // Ketajaman tarikan (makin >1 makin runcing)
  };

  /**
   * ALGORITMA: Generate body geometry (Deformed Sphere)
   */
  _generateBodyGeometry(opts) {
    const vertices = [];
    const faces = [];
    const {
      radius,
      latBands,
      longBands,
      bodyColor,
      legTargets,
      legBaseCenters,
      legPullRadius,
      legPullSharpness,
    } = opts;

    // --- VERTEX GENERATION ---
    for (let latNumber = 0; latNumber <= latBands; latNumber++) {
      const theta = (latNumber * Math.PI) / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let longNumber = 0; longNumber <= longBands; longNumber++) {
        const phi = (longNumber * 2 * Math.PI) / longBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        // 1. Hitung Posisi Sphere (Bola)
        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        let final_x = x,
          final_y = y,
          final_z = z;
        // Normal tetap menggunakan normal bola asli untuk shading mulus
        let final_nx = x,
          final_ny = y,
          final_nz = z;

        // 2. Deformasi jika di area Kaki
        if (y < 0 && z < 0) {
          let distFromBase, target, baseCenter;

          // Tentukan kaki kiri atau kanan
          if (x < 0) {
            target = legTargets.left;
            baseCenter = legBaseCenters.left;
          } else {
            target = legTargets.right;
            baseCenter = legBaseCenters.right;
          }

          // Hitung jarak dari pusat pangkal kaki
          distFromBase = Math.sqrt(
            Math.pow(x - baseCenter.x, 2) +
              Math.pow(y - baseCenter.y, 2) +
              Math.pow(z - baseCenter.z, 2)
          );

          // Jika vertex berada dalam radius tarikan
          if (distFromBase < legPullRadius) {
            // Hitung 'pullAmount' (0.0 di tepi, 1.0 di pusat)
            let pullFactor = 1.0 - distFromBase / legPullRadius;
            let pullAmount = Math.pow(pullFactor, legPullSharpness);

            // Interpolasi posisi vertex ke arah 'target'
            final_x = x * (1.0 - pullAmount) + target[0] * pullAmount;
            final_y = y * (1.0 - pullAmount) + target[1] * pullAmount;
            final_z = z * (1.0 - pullAmount) + target[2] * pullAmount;
          }
        }

        const len = Math.sqrt(
          final_nx * final_nx + final_ny * final_ny + final_nz * final_nz
        );

        vertices.push(radius * final_x, radius * final_y, radius * final_z);
        vertices.push(...bodyColor);
        vertices.push(final_nx / len, final_ny / len, final_nz / len);
      }
    }

    // --- FACE GENERATION (Standard Sphere) ---
    for (let i = 0; i < latBands; i++) {
      for (let j = 0; j < longBands; j++) {
        const first = i * (longBands + 1) + j;
        const second = first + longBands + 1;
        faces.push(first, second, first + 1);
        faces.push(second, second + 1, first + 1);
      }
    }
    return { vertices, faces };
  }

  /**
   * Terapkan transformasi lokal ke badan bawah (hanya skala)
   */
  _applyBodyTransformation(opts) {
    const { scaleFactor } = opts;
    const scaleMatrix = LIBS.get_I4();
    LIBS.scale(
      scaleMatrix,
      0.8 * scaleFactor,
      0.8 * scaleFactor,
      0.85 * scaleFactor
    );
    this.localMatrix = scaleMatrix;
  }
}