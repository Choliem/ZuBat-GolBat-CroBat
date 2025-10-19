/*
 * GolbatWing.js
 * Desain baru untuk Golbat:
 * - Tepi Atas: Kurva Bezier (mulus)
 * - Tepi Bawah: Garis lurus antar titik (angular)
 * - Tetap menggunakan membran dua sisi.
 */
import { SceneObject } from "./SceneObject.js";
import { Node } from "./Node.js";

export class GolbatWing extends Node {
  constructor(GL, attribs) {
    super(); // Panggil konstruktor Node

    // =========================================================================
    // == PARAMETER SAYAP GOLBAT ==
    // =========================================================================

    // --- Warna ---
    const OUTER_COLOR = [60 / 255, 60 / 255, 124 / 255]; // Biru
    const INNER_COLOR = [170 / 255, 120 / 255, 200 / 255]; // Ungu
    const BONE_COLOR = [40 / 255, 40 / 255, 80 / 255]; // Tulang (lebih gelap)

    // --- Detail & Bentuk ---
    const TOTAL_POINTS = 30; // Jumlah titik di sepanjang tepi (mempengaruhi kehalusan)
    const TUBE_SEGMENTS = 8;
    const MEMBRANE_THICKNESS = 0.02;

    const BONE_THICKNESS = {
      top: [0.08, 0.05, 0.03], // [pangkal, tengah, ujung]
    };

    // --- Kurva Tulang Atas (Bézier) ---
    // Definisikan sebagai 2 bagian yang menyambung
    const TOP_BONE_CURVE = [
      {
        startPoint: [0.0, 0.0, 0.0],
        startHandle: [3, -0.5, -0.6],
        endPoint: [2.0, 1.3, -0.6],
        endHandle: [-0.6, 0.0, -0.1],
      },
      {
        startPoint: [2.0, 1.3, -0.6],
        startHandle: [1.5, 0.1, -0.4],
        endPoint: [8.5, 1.5, -1.1],
        endHandle: [-1.0, 0.5, 0.1],
      },
    ];

    // --- Titik Tepi Bawah (Linear) ---
    // Cukup definisikan titik-titik tajamnya
    const BOTTOM_EDGE_POINTS = [
      [0.0, -0.5, 0.0], // 1. Pangkal
      [2.0, -2, -0.6], // 2. Cekungan 1
      [3.0, -1.0, -0.9], // 3. Puncak antara
      [4.8, -1.2, -1.0], // 4. Cekungan 2
      [5.5, 0.9, -1.1], // 5. Ujung (koordinat sama dengan ujung atas)
    ];

    // Array untuk data geometri gabungan
    this.vertices = [];
    this.faces = [];

    // ======================== PEMBUATAN MESH =========================

    // 1. Buat Centerline Atas (dari Bezier)
    const topCenterline = this._generateBezierCenterline(
      TOP_BONE_CURVE.map((p) => this._getBezierControlPoints(p)),
      TOTAL_POINTS
    );

    // 2. Buat Centerline Bawah (dari Titik Linear)
    const bottomCenterline = this._generateLinearCenterline(
      BOTTOM_EDGE_POINTS,
      TOTAL_POINTS
    );

    // 3. Buat Tulang (HANYA di tepi atas)
    this._generateTube(
      topCenterline,
      TUBE_SEGMENTS,
      BONE_THICKNESS.top,
      BONE_COLOR
    );

    // 4. Buat Membran Dua Lapis
    this._generateDoubleSidedMembrane(
      topCenterline,
      bottomCenterline,
      OUTER_COLOR,
      INNER_COLOR,
      MEMBRANE_THICKNESS
    );

    // 5. Buat SceneObject
    const sceneObj = new SceneObject(GL, this.vertices, this.faces, attribs);
    this.setGeometry(sceneObj); // Set geometri untuk Node ini
  }

  // ======================== FUNGSI HELPER BARU =========================

  /**
   * Menghasilkan titik-titik di sepanjang serangkaian kurva Bezier.
   * Disederhanakan: mengalokasikan titik secara merata per segmen kurva.
   */
  _generateBezierCenterline(bezierSegmentsCPs, totalPoints) {
    const centerline = [];
    const numSegments = bezierSegmentsCPs.length;
    if (numSegments === 0) return [];

    const pointsPerSegment = Math.floor((totalPoints - 1) / numSegments);
    let pointsRemaining = (totalPoints - 1) % numSegments;

    centerline.push([...bezierSegmentsCPs[0][0]]); // Tambahkan titik awal

    for (let i = 0; i < numSegments; i++) {
      const controlPoints = bezierSegmentsCPs[i];
      let numPointsInThisSegment = pointsPerSegment;
      if (pointsRemaining > 0) {
        numPointsInThisSegment++;
        pointsRemaining--;
      }

      for (let j = 1; j <= numPointsInThisSegment; j++) {
        const t = j / numPointsInThisSegment;
        centerline.push(this._getPointOnBezierCurve(controlPoints, t));
      }
    }
    return centerline;
  }

  /**
   * Menghasilkan titik-titik di sepanjang serangkaian garis lurus (dari array titik).
   * Mengalokasikan titik secara proporsional berdasarkan panjang setiap garis.
   */
  _generateLinearCenterline(points, totalPoints) {
    const centerline = [];
    if (points.length < 2) return [];

    const segmentLengths = [];
    let totalLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const len = Math.sqrt(
        (p1[0] - p0[0]) ** 2 + (p1[1] - p0[1]) ** 2 + (p1[2] - p0[2]) ** 2
      );
      segmentLengths.push(len);
      totalLength += len;
    }

    if (totalLength < 1e-6) {
      for (let i = 0; i < totalPoints; i++) centerline.push([...points[0]]);
      return centerline;
    }

    centerline.push([...points[0]]); // Tambahkan titik awal
    let pointsAllocated = 1;

    for (let i = 0; i < segmentLengths.length; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const proportion = segmentLengths[i] / totalLength;

      let numPointsInThisSegment;
      if (i === segmentLengths.length - 1) {
        numPointsInThisSegment = totalPoints - pointsAllocated;
      } else {
        numPointsInThisSegment = Math.round(proportion * (totalPoints - 1));
      }
      numPointsInThisSegment = Math.max(0, numPointsInThisSegment);

      for (let j = 1; j <= numPointsInThisSegment; j++) {
        const t = j / numPointsInThisSegment;
        const x = p0[0] * (1 - t) + p1[0] * t;
        const y = p0[1] * (1 - t) + p1[1] * t;
        const z = p0[2] * (1 - t) + p1[2] * t;
        centerline.push([x, y, z]);
      }
      pointsAllocated += numPointsInThisSegment;
    }
    // Pastikan jumlah titik pas
    while (centerline.length < totalPoints)
      centerline.push([...points[points.length - 1]]);
    if (centerline.length > totalPoints) centerline.length = totalPoints;

    return centerline;
  }

  // ======================== FUNGSI HELPER (DARI FILE ZUBAT/GOLBAT LAMA) =========================
  // (Fungsi-fungsi ini disalin dari file GolbatWing.js Anda sebelumnya, tidak ada perubahan)

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
      if (normal[2] > 0) {
        normal = this._scaleVector(normal, -1.0);
      }
      const outerOffset = this._scaleVector(normal, halfThickness);
      const p1_outer = this._addVectors(p1, outerOffset);
      this.vertices.push(
        p1_outer[0],
        p1_outer[1],
        p1_outer[2],
        ...outerColor,
        ...normal
      );
      const p2_outer = this._addVectors(p2, outerOffset);
      this.vertices.push(
        p2_outer[0],
        p2_outer[1],
        p2_outer[2],
        ...outerColor,
        ...normal
      );
    }
    const baseVertexIndexInner = Math.floor(this.vertices.length / 9);
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
      if (normal[2] > 0) {
        normal = this._scaleVector(normal, -1.0);
      }
      const innerNormal = this._scaleVector(normal, -1.0);
      const innerOffset = this._scaleVector(innerNormal, halfThickness);
      const p1_inner = this._addVectors(p1, innerOffset);
      this.vertices.push(
        p1_inner[0],
        p1_inner[1],
        p1_inner[2],
        ...innerColor,
        ...innerNormal
      );
      const p2_inner = this._addVectors(p2, innerOffset);
      this.vertices.push(
        p2_inner[0],
        p2_inner[1],
        p2_inner[2],
        ...innerColor,
        ...innerNormal
      );
    }
    for (let i = 0; i < numPoints - 1; i++) {
      const otl = baseVertexIndexOuter + i * 2 + 0;
      const obl = baseVertexIndexOuter + i * 2 + 1;
      const otr = otl + 2;
      const obr = obl + 2;
      this.faces.push(otl, obl, otr);
      this.faces.push(obl, obr, otr);
      const itl = baseVertexIndexInner + i * 2 + 0;
      const ibl = baseVertexIndexInner + i * 2 + 1;
      const itr = itl + 2;
      const ibr = ibl + 2;
      this.faces.push(itl, itr, ibl);
      this.faces.push(ibl, itr, ibr);
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