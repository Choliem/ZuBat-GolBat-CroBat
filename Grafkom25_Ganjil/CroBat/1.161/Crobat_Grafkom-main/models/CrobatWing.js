/*
 * models/CrobatWing.js - Improvement V3
 * - Warna: Tulang & Membran Belakang = Ungu, Membran Depan = Biru Muda.
 * - Struktur: Tulang melapisi seluruh tepi atas membran.
 */
import { SceneObject } from "./SceneObject.js";

export class CrobatWing extends SceneObject {
  constructor(GL, _position, _color, _normal) {
    super(GL, _position, _color, _normal);

    // =========================================================================
    // == PARAMETER SAYAP CROBAT ==
    // =========================================================================

    // --- Warna ---
    const OUTER_COLOR = [0.5, 0.8, 0.9];
    const INNER_COLOR = [0.37, 0.23, 0.5];
    const BONE_COLOR = INNER_COLOR; // Tulang = Ungu

    // --- Detail & Bentuk ---
    const TOTAL_POINTS = 50;
    const TUBE_SEGMENTS = 8;
    const MEMBRANE_THICKNESS = 0.02;

    const BONE_THICKNESS_PROFILE = [0.08, 0.06, 0.04]; // [pangkal, tengah, ujung]

    // --- Kurva Tulang Atas (Bézier "S" Shape) ---
    // Ini adalah centerline untuk TULANG
    const TOP_BONE_CURVE = [
      {
        startPoint: [-1.6, -0.8, 0.0],
        startHandle: [1.0, 2.0, 0.0],
        endPoint: [3.0, 3.0, -0.2],
        endHandle: [1.0, -0.5, 0.0],
      },
      {
        startPoint: [3.0, 3.0, -0.2],
        startHandle: [-1.0, 0.5, 0.0],
        endPoint: [7.0, 2.5, -0.5], // <-- Ujung Sayap
        endHandle: [-2.0, -1.0, 0.0],
      },
    ];

    // --- IMPROVEMENT: Kurva Tepi Atas Membran ---
    // Sedikit di bawah TOP_BONE_CURVE
    const MEMBRANE_TOP_OFFSET = BONE_THICKNESS_PROFILE[0] * 0.5; // Offset berdasarkan ketebalan tulang pangkal
    const MEMBRANE_TOP_CURVE = TOP_BONE_CURVE.map((segment) => ({
      startPoint: [
        segment.startPoint[0],
        segment.startPoint[1] - MEMBRANE_TOP_OFFSET,
        segment.startPoint[2],
      ],
      startHandle: segment.startHandle, // Handle bisa sama
      endPoint: [
        segment.endPoint[0],
        segment.endPoint[1] - MEMBRANE_TOP_OFFSET,
        segment.endPoint[2],
      ],
      endHandle: segment.endHandle, // Handle bisa sama
    }));

    // --- Titik Kunci Tepi Bawah ---
    const BTM_P0 = [-1, -1, 0.0];
    const BTM_P1_HOOK = [1.5, -1.5, -0.1];
    const BTM_P2_SCALLOP = [4.5, -0.5, -0.3];
    const WING_TIP_POINT = TOP_BONE_CURVE[1].endPoint; // Harus sama dengan ujung tulang

    // --- Kurva Tepi Bawah (Bézier) ---
    const BOTTOM_CURVE_SEGMENTS = [
      {
        startPoint: BTM_P0,
        startHandle: [0.5, -0.5, 0.0],
        endHandle: [0.2, 0.3, 0.0],
        endPoint: BTM_P1_HOOK,
      },
      {
        startPoint: BTM_P1_HOOK,
        startHandle: [1.0, 0.8, 0.0],
        endHandle: [-1.0, 0.5, -0.1],
        endPoint: BTM_P2_SCALLOP,
      },
      {
        startPoint: BTM_P2_SCALLOP,
        startHandle: [1.0, 0.8, -0.1],
        endHandle: [-0.5, -0.5, 0.0],
        endPoint: WING_TIP_POINT,
      },
    ];

    // ======================== PEMBUATAN MESH =========================

    // 1. Buat Centerline Tulang Atas
    const topBoneCenterline = this._generateBezierCenterline(
      TOP_BONE_CURVE.map((p) => this._getBezierControlPoints(p)),
      TOTAL_POINTS
    );

    // 2. Buat Centerline Tepi Atas Membran (BARU)
    const membraneTopCenterline = this._generateBezierCenterline(
      MEMBRANE_TOP_CURVE.map((p) => this._getBezierControlPoints(p)),
      TOTAL_POINTS
    );

    // 3. Buat Centerline Tepi Bawah Membran
    const bottomMembraneCenterline = this._generateBezierCenterline(
      BOTTOM_CURVE_SEGMENTS.map((p) => this._getBezierControlPoints(p)),
      TOTAL_POINTS
    );

    // 4. Buat Tulang (menggunakan centerline tulang)
    this._generateTube(
      topBoneCenterline,
      TUBE_SEGMENTS,
      BONE_THICKNESS_PROFILE,
      BONE_COLOR
    );

    // 5. Buat Membran Dua Lapis (menggunakan centerline membran)
    this._generateDoubleSidedMembrane(
      membraneTopCenterline, // <-- Pakai centerline membran atas
      bottomMembraneCenterline,
      OUTER_COLOR, // Warna belakang = ungu
      INNER_COLOR, // Warna depan = biru muda
      MEMBRANE_THICKNESS
    );

    // 6. Setup SceneObject
    this.setup();
  }

  // ======================== FUNGSI HELPER (DARI GOLBAT) =========================
  // (Fungsi-fungsi ini tidak berubah dari versi GolbatWing sebelumnya)

  _generateBezierCenterline(bezierSegmentsCPs, totalPoints) {
    const centerline = [];
    if (bezierSegmentsCPs.length === 0) return [];
    let totalLength = 0;
    const segmentLengths = bezierSegmentsCPs.map((cp) => {
      let length = 0;
      let p0 = cp[0];
      for (let i = 1; i <= 10; i++) {
        let p1 = this._getPointOnBezierCurve(cp, i / 10);
        length += this._vectorLength(this._subtractVectors(p1, p0));
        p0 = p1;
      }
      return length;
    });
    totalLength = segmentLengths.reduce((sum, len) => sum + len, 0);
    centerline.push([...bezierSegmentsCPs[0][0]]);
    let pointsAllocated = 1;
    for (let i = 0; i < bezierSegmentsCPs.length; i++) {
      const controlPoints = bezierSegmentsCPs[i];
      let numPointsInThisSegment;
      if (totalLength > 1e-6) {
        const proportion = segmentLengths[i] / totalLength;
        numPointsInThisSegment = Math.round(proportion * (totalPoints - 1));
      } else {
        numPointsInThisSegment = Math.round(
          (totalPoints - 1) / bezierSegmentsCPs.length
        );
      }
      if (i === bezierSegmentsCPs.length - 1) {
        numPointsInThisSegment = totalPoints - pointsAllocated;
      }
      numPointsInThisSegment = Math.max(0, numPointsInThisSegment);
      for (let j = 1; j <= numPointsInThisSegment; j++) {
        const t = j / numPointsInThisSegment;
        centerline.push(this._getPointOnBezierCurve(controlPoints, t));
      }
      pointsAllocated += numPointsInThisSegment;
    }
    if (centerline.length > totalPoints) centerline.length = totalPoints;
    while (centerline.length < totalPoints)
      centerline.push([...bezierSegmentsCPs[bezierSegmentsCPs.length - 1][3]]);
    return centerline;
  }
  _vectorLength(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }
  _generateDoubleSidedMembrane(
    centerline1,
    centerline2,
    outerColor,
    innerColor,
    thickness
  ) {
    if (centerline1.length !== centerline2.length) {
      console.error("Membrane centerlines must have the same length.");
      return;
    }
    const baseVertexIndexOuter = Math.floor(this.vertices.length / 9);
    const numPoints = centerline1.length;
    const halfThickness = thickness / 2.0;
    for (let i = 0; i < numPoints; i++) {
      const p1 = centerline1[i];
      const p2 = centerline2[i];
      const vecMembrane = this._subtractVectors(p1, p2);
      let vecForward =
        i < numPoints - 1
          ? this._subtractVectors(centerline1[i + 1], p1)
          : this._subtractVectors(p1, centerline1[i - 1]);
      let normal = this._normalizeVector(
        this._crossProduct(vecMembrane, vecForward)
      );
      // PENENTUAN ARAH NORMAL (Depan/Belakang) - Asumsi Z negatif adalah depan
      if (normal[2] > 0) {
        normal = this._scaleVector(normal, -1.0);
      } // Pastikan normal mengarah ke Z negatif (depan)

      const frontNormal = normal; // Sisi depan (biru muda)
      const backNormal = this._scaleVector(normal, -1.0); // Sisi belakang (ungu)

      const frontOffset = this._scaleVector(frontNormal, halfThickness);
      const p1_front = this._addVectors(p1, frontOffset);
      this.vertices.push(
        p1_front[0],
        p1_front[1],
        p1_front[2],
        ...innerColor,
        ...frontNormal
      ); // WARNA INNER (BIRU)
      const p2_front = this._addVectors(p2, frontOffset);
      this.vertices.push(
        p2_front[0],
        p2_front[1],
        p2_front[2],
        ...innerColor,
        ...frontNormal
      ); // WARNA INNER (BIRU)

      const backOffset = this._scaleVector(backNormal, halfThickness);
      const p1_back = this._addVectors(p1, backOffset);
      this.vertices.push(
        p1_back[0],
        p1_back[1],
        p1_back[2],
        ...outerColor,
        ...backNormal
      ); // WARNA OUTER (UNGU)
      const p2_back = this._addVectors(p2, backOffset);
      this.vertices.push(
        p2_back[0],
        p2_back[1],
        p2_back[2],
        ...outerColor,
        ...backNormal
      ); // WARNA OUTER (UNGU)
    }
    const numVerticesPerStrip = 4; // front_p1, front_p2, back_p1, back_p2
    for (let i = 0; i < numPoints - 1; i++) {
      const base = baseVertexIndexOuter + i * numVerticesPerStrip;
      const ftl = base + 0;
      const fbl = base + 1; // Front Top/Bottom Left
      const btl = base + 2;
      const bbl = base + 3; // Back Top/Bottom Left
      const ftr = ftl + numVerticesPerStrip;
      const fbr = fbl + numVerticesPerStrip; // Front Top/Bottom Right
      const btr = btl + numVerticesPerStrip;
      const bbr = bbl + numVerticesPerStrip; // Back Top/Bottom Right

      // Faces Depan (Biru Muda) - CCW dilihat dari depan
      this.faces.push(ftl, fbl, ftr);
      this.faces.push(fbl, fbr, ftr);
      // Faces Belakang (Ungu) - CCW dilihat dari belakang
      this.faces.push(btl, btr, bbl);
      this.faces.push(bbl, btr, bbr);
    }
  }
  _getBezierControlPoints(curvePart) {
    const p0 = curvePart.startPoint;
    const p3 = curvePart.endPoint;
    const p1 = [
      p0[0] + curvePart.startHandle[0],
      p0[1] + curvePart.startHandle[1],
      p0[2] + curvePart.startHandle[2],
    ];
    const p2 = [
      p3[0] + curvePart.endHandle[0],
      p3[1] + curvePart.endHandle[1],
      p3[2] + curvePart.endHandle[2],
    ];
    return [p0, p1, p2, p3];
  }
  _getPointOnBezierCurve(controlPoints, t) {
    const [p0, p1, p2, p3] = controlPoints;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    const c0 = mt2 * mt;
    const c1 = 3 * mt2 * t;
    const c2 = 3 * mt * t2;
    const c3 = t2 * t;
    const x = c0 * p0[0] + c1 * p1[0] + c2 * p2[0] + c3 * p3[0];
    const y = c0 * p0[1] + c1 * p1[1] + c2 * p2[1] + c3 * p3[1];
    const z = c0 * p0[2] + c1 * p1[2] + c2 * p2[2] + c3 * p3[2];
    return [x, y, z];
  }
  _subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }
  _addVectors(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }
  _scaleVector(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
  }
  _normalizeVector(v) {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return len > 1e-6 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
  }
  _crossProduct(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }
  _generateTube(path, tubeSegments, thicknessProfile, color) {
    if (path.length < 2) return;
    const baseVertexIndex = Math.floor(this.vertices.length / 9);
    const vertexCount = path.length;
    for (let i = 0; i < vertexCount; i++) {
      const point = path[i];
      const t = vertexCount > 1 ? i / (vertexCount - 1) : 0;
      let currentThickness;
      if (Array.isArray(thicknessProfile)) {
        if (t < 0.5)
          currentThickness =
            thicknessProfile[0] * (1.0 - t * 2.0) +
            thicknessProfile[1] * (t * 2.0);
        else
          currentThickness =
            thicknessProfile[1] * (1.0 - (t - 0.5) * 2.0) +
            thicknessProfile[2] * ((t - 0.5) * 2.0);
      } else {
        currentThickness = thicknessProfile;
      }
      let tangent;
      if (i === 0) tangent = this._subtractVectors(path[1], point);
      else if (i === vertexCount - 1)
        tangent = this._subtractVectors(point, path[i - 1]);
      else
        tangent = this._normalizeVector(
          this._addVectors(
            this._subtractVectors(path[i + 1], point),
            this._subtractVectors(point, path[i - 1])
          )
        );
      tangent = this._normalizeVector(tangent);
      const upApprox = Math.abs(tangent[1]) > 0.99 ? [1, 0, 0] : [0, 1, 0];
      const normal = this._normalizeVector(
        this._crossProduct(tangent, upApprox)
      );
      const binormal = this._normalizeVector(
        this._crossProduct(tangent, normal)
      );
      for (let j = 0; j <= tubeSegments; j++) {
        const angle = (j / tubeSegments) * 2 * Math.PI;
        const offset = this._addVectors(
          this._scaleVector(normal, Math.cos(angle) * currentThickness),
          this._scaleVector(binormal, Math.sin(angle) * currentThickness)
        );
        const vertexPos = this._addVectors(point, offset);
        const vertexNormal = this._normalizeVector(offset);
        this.vertices.push(
          vertexPos[0],
          vertexPos[1],
          vertexPos[2],
          ...color,
          vertexNormal[0],
          vertexNormal[1],
          vertexNormal[2]
        );
      }
    }
    for (let i = 0; i < vertexCount - 1; i++) {
      for (let j = 0; j < tubeSegments; j++) {
        const idx1 = baseVertexIndex + i * (tubeSegments + 1) + j;
        const idx2 = baseVertexIndex + (i + 1) * (tubeSegments + 1) + j;
        const idx3 = idx1 + 1;
        const idx4 = idx2 + 1;
        this.faces.push(idx1, idx2, idx3);
        this.faces.push(idx2, idx4, idx3);
      }
    }
  }
}
