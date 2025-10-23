/*
 * ===================================================================
 * KRITERIA 1: Sayap Zubat
 * ===================================================================
 *
 * KRITERIA 2 & 5: JENIS OBJEK (OBJEK BERBASIS KURVA)
 *
 * ALGORITMA:
 * 1. Mendefinisikan 2 set Kurva Bézier orde 3 (topBoneCurve, midBoneCurve)
 * sebagai kerangka utama sayap.
 * 2. Menghasilkan jalur/path 3D (centerline) dari kurva-kurva tersebut
 * via _generateBezierPath.
 * 3. Membuat "tulang" dengan menghasilkan mesh tabung (tube) di sepanjang
 * jalur/path tersebut via _generateTube.
 * 4. Membuat "membran" dua sisi (luar biru, dalam pink) dengan
 * menghubungkan vertex antara path tulang atas dan tulang tengah
 * via _generateMembrane.
 */

import { Node } from "../Node.js";
import { SceneObject } from "../SceneObject.js";

export class ZubatWing extends Node {
  constructor(GL, attribs, options = {}) {
    super();
    const opts = { ...ZubatWing.DEFAULT_OPTIONS, ...options };
    // 1. Generate semua bagian sayap (tulang & membran)
    const wingData = this._generateWingGeometry(opts);
    // 2. Buat satu SceneObject gabungan
    const sceneObj = new SceneObject(
      GL,
      wingData.vertices,
      wingData.faces,
      attribs,
      "POS_COL_NORM"
    );
    this.setGeometry(sceneObj);
  }

  /**
   * KRITERIA 3 & 4: Default options untuk parameter
   */
  static DEFAULT_OPTIONS = {
    // KRITERIA 3: Parameter Warna
    boneColor: [0.45, 0.65, 1.0], // Biru muda
    innerMembraneColor: [0.9, 0.45, 0.6], // Biru (Dalam)
    outerMembraneColor: [0.35, 0.55, 0.95], // Pink (Luar)

    // KRITERIA 3: Parameter Ketebalan
    // [pangkal, tengah, ujung]
    boneThickness: {
      top: [0.15, 0.12, 0.08],
      mid: [0.08, 0.07, 0.05],
      connector: 0.09,
    },

    // KRITERIA 3: Parameter Resolusi
    segmentsPerPart: 15, // Titik per segmen kurva
    tubeSegments: 12, // Resolusi keliling tabung tulang
    membraneThickness: 0.05,

    // KRITERIA 2 & 3: Definisi Kurva Bézier Tulang Atas
    // (startPoint, startHandle, endPoint, endHandle)
    topBoneCurve: [
      {
        startPoint: [0.0, 0.0, -1.2],
        startHandle: [0.8, 1.8, 0.0],
        endPoint: [7.2, 3.2, 3.4],
        endHandle: [-1.3, 0.0, 0.4],
      },
      {
        startPoint: [7.2, 3.2, 3.4],
        startHandle: [1.2, 0.8, -0.2],
        endPoint: [9.0, -3.0, 2.0],
        endHandle: [-0.5, 0.7, 0.2],
      },
    ],

    // KRITERIA 2 & 3: Definisi Kurva Bézier Tulang Tengah
    midBoneCurve: [
      {
        startPoint: [0.0, 0.0, -1.2],
        startHandle: [1.0, 0.1, 0.0],
        endPoint: [3.0, -1.0, -3.0],
        endHandle: [0.0, 0.8, 0.2],
      },
      {
        startPoint: [3.0, -1.0, -3.0],
        startHandle: [15.0, 1.0, -15.0],
        endPoint: [9.0, -3.0, 2.0],
        endHandle: [5.0, -1.0, -4.2],
      },
    ],
  };

  /**
   * ALGORITMA: Gabungkan semua geometri (tulang + membran)
   */
  _generateWingGeometry(opts) {
    const allVertices = [];
    const allFaces = [];
    let vertexOffset = 0; // Offset untuk menggabungkan index face

    // Helper untuk menggabungkan data
    const appendPart = (partData) => {
      allVertices.push(...partData.vertices);
      for (let i = 0; i < partData.faces.length; i++) {
        allFaces.push(partData.faces[i] + vertexOffset);
      }
      vertexOffset += partData.vertices.length / 9; // 9 floats per vertex
    };

    // 1. Generate Tulang Atas (dari kurva)
    const topBonePath = this._generateBezierPath(
      opts.topBoneCurve,
      opts.segmentsPerPart
    );
    const topBoneData = this._generateTube(
      topBonePath,
      opts.tubeSegments,
      opts.boneThickness.top,
      opts.boneColor
    );
    appendPart(topBoneData);

    // 2. Generate Tulang Tengah (dari kurva)
    const midBonePath = this._generateBezierPath(
      opts.midBoneCurve,
      opts.segmentsPerPart
    );
    const midBoneData = this._generateTube(
      midBonePath,
      opts.tubeSegments,
      opts.boneThickness.mid,
      opts.boneColor
    );
    appendPart(midBoneData);

    // 3. Generate Tulang Penghubung (lurus)
    const connectorPath = [
      opts.topBoneCurve[0].endPoint,
      opts.midBoneCurve[0].endPoint,
    ];
    const connectorData = this._generateTube(
      connectorPath,
      opts.tubeSegments,
      opts.boneThickness.connector,
      opts.boneColor
    );
    appendPart(connectorData);

    // 4. Generate Membran (di antara 2 path kurva)
    const membraneData = this._generateMembrane(
      topBonePath,
      midBonePath,
      opts.innerMembraneColor, // Biru (Luar)
      opts.outerMembraneColor, // Pink (Dalam)
      opts.membraneThickness
    );
    appendPart(membraneData);

    return { vertices: allVertices, faces: allFaces };
  }

  // --- Fungsi Helper Kurva Bézier ---

  _generateBezierPath(curveSegments, segmentsPerPart) {
    const path = [];
    for (let i = 0; i < curveSegments.length; i++) {
      const segment = curveSegments[i];
      const controlPoints = this._getBezierControlPoints(segment);
      const start = i === 0 ? 0 : 1; // Hindari duplikat titik
      for (let j = start; j <= segmentsPerPart; j++) {
        const t = j / segmentsPerPart;
        path.push(this._evaluateBezier(controlPoints, t));
      }
    }
    return path;
  }

  _getBezierControlPoints(curveDef) {
    const p0 = curveDef.startPoint;
    const p3 = curveDef.endPoint;
    const p1 = [
      p0[0] + curveDef.startHandle[0],
      p0[1] + curveDef.startHandle[1],
      p0[2] + curveDef.startHandle[2],
    ];
    const p2 = [
      p3[0] + curveDef.endHandle[0],
      p3[1] + curveDef.endHandle[1],
      p3[2] + curveDef.endHandle[2],
    ];
    return [p0, p1, p2, p3];
  }

  _evaluateBezier(controlPoints, t) {
    const [p0, p1, p2, p3] = controlPoints;
    const mt = 1 - t;
    const c0 = mt * mt * mt;
    const c1 = 3 * mt * mt * t;
    const c2 = 3 * mt * t * t;
    const c3 = t * t * t;
    return [
      c0 * p0[0] + c1 * p1[0] + c2 * p2[0] + c3 * p3[0],
      c0 * p0[1] + c1 * p1[1] + c2 * p2[1] + c3 * p3[1],
      c0 * p0[2] + c1 * p1[2] + c2 * p2[2] + c3 * p3[2],
    ];
  }

  // --- Fungsi Helper Geometri ---

  _generateTube(path, tubeSegments, thickness, color) {
    const vertices = [];
    const faces = [];
    if (path.length < 2) return { vertices, faces };

    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      const t = path.length > 1 ? i / (path.length - 1) : 0;

      // Hitung ketebalan saat ini (interpolasi)
      let currentThickness;
      if (Array.isArray(thickness)) {
        if (t < 0.5) {
          currentThickness =
            thickness[0] + (thickness[1] - thickness[0]) * (t * 2);
        } else {
          currentThickness =
            thickness[1] + (thickness[2] - thickness[1]) * ((t - 0.5) * 2);
        }
      } else {
        currentThickness = thickness;
      }

      // Hitung frame (tangent, normal, binormal)
      let tangent;
      if (i === 0) {
        tangent = this._subtract(path[1], point);
      } else if (i === path.length - 1) {
        tangent = this._subtract(point, path[i - 1]);
      } else {
        tangent = this._subtract(path[i + 1], path[i - 1]);
      }
      tangent = this._normalize(tangent);
      const up = Math.abs(tangent[1]) > 0.99 ? [1, 0, 0] : [0, 1, 0];
      const normal = this._normalize(this._cross(tangent, up));
      const binormal = this._normalize(this._cross(tangent, normal));

      // Generate 1 cincin (ring)
      for (let j = 0; j <= tubeSegments; j++) {
        const angle = (j / tubeSegments) * 2 * Math.PI;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const offset = [
          normal[0] * cos * currentThickness +
            binormal[0] * sin * currentThickness,
          normal[1] * cos * currentThickness +
            binormal[1] * sin * currentThickness,
          normal[2] * cos * currentThickness +
            binormal[2] * sin * currentThickness,
        ];
        const vertex = this._add(point, offset);
        const vertexNormal = this._normalize(offset);
        vertices.push(...vertex, ...color, ...vertexNormal);
      }
    }

    // Generate faces (strip)
    for (let i = 0; i < path.length - 1; i++) {
      for (let j = 0; j < tubeSegments; j++) {
        const idx1 = i * (tubeSegments + 1) + j;
        const idx2 = (i + 1) * (tubeSegments + 1) + j;
        faces.push(idx1, idx2, idx1 + 1);
        faces.push(idx2, idx2 + 1, idx1 + 1);
      }
    }
    return { vertices, faces };
  }

  /**
   * ALGORITMA: Generate membran 2 sisi (Luar & Dalam)
   */
  _generateMembrane(path1, path2, outerColor, innerColor, thickness) {
    const vertices = [];
    const faces = [];
    if (path1.length !== path2.length) {
      console.warn("Membrane paths must have same length");
      return { vertices, faces };
    }
    const halfThickness = thickness / 2.0;

    for (let i = 0; i < path1.length; i++) {
      const p1 = path1[i];
      const p2 = path2[i];

      // Kalkulasi Normal Permukaan (sudah diperbaiki)
      const vecMembrane = this._subtract(p2, p1); // <-- (p2, p1)
      const vecForward =
        i < path1.length - 1
          ? this._subtract(path1[i + 1], p1)
          : this._subtract(p1, path1[i - 1]);
      let normal = this._normalize(this._cross(vecMembrane, vecForward));

      const outerOffset = this._scale(normal, halfThickness);
      const innerOffset = this._scale(normal, -halfThickness);

      // 1. Vertex Sisi Luar (Biru)
      vertices.push(...this._add(p1, outerOffset), ...outerColor, ...normal);
      vertices.push(...this._add(p2, outerOffset), ...outerColor, ...normal);

      // 2. Vertex Sisi Dalam (Pink)
      const innerNormal = this._scale(normal, -1); // Normal dibalik
      vertices.push(
        ...this._add(p1, innerOffset),
        ...innerColor,
        ...innerNormal
      );
      vertices.push(
        ...this._add(p2, innerOffset),
        ...innerColor,
        ...innerNormal
      );
    }

    // Generate faces
    for (let i = 0; i < path1.length - 1; i++) {
      const baseIdx = i * 4;
      // Sisi Luar (Biru)
      const otl = baseIdx + 0,
        obl = baseIdx + 1,
        otr = baseIdx + 4,
        obr = baseIdx + 5;
      faces.push(otl, obl, otr);
      faces.push(obl, obr, otr);
      // Sisi Dalam (Pink) - urutan dibalik
      const itl = baseIdx + 2,
        ibl = baseIdx + 3,
        itr = baseIdx + 6,
        ibr = baseIdx + 7;
      faces.push(itl, itr, ibl);
      faces.push(ibl, itr, ibr);
    }
    return { vertices, faces };
  }

  // --- Vector Math Helpers ---
  _subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }
  _add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }
  _scale(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
  }
  _normalize(v) {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return len > 1e-6 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
  }
  _cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }
}
