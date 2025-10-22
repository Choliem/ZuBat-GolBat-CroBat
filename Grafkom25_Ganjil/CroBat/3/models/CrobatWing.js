/*
 * models/CrobatWing.js - Refactored for SceneObject
 *
 * PERBAIKAN: Semua fungsi helper (_generateBezierCenterline, _generateTube,
 * _subtractVectors, dll.) telah dipindahkan ke luar dari class body
 * untuk menghindari error 'must call super constructor before using 'this''.
 */
import { SceneObject } from "./SceneObject.js";

// =========================================================================
// === HELPER FUNCTIONS (MOVED OUTSIDE THE CLASS) ===
// === 'this' dihapus dari semua pemanggilan fungsi ini. ===
// =========================================================================

function _generateBezierCenterline(bezierSegmentsCPs, totalPoints) {
  const centerline = [];
  if (bezierSegmentsCPs.length === 0) return [];
  let totalLength = 0;
  const segmentLengths = bezierSegmentsCPs.map((cp) => {
    let length = 0;
    let p0 = cp[0];
    for (let i = 1; i <= 10; i++) {
      let p1 = _getPointOnBezierCurve(cp, i / 10);
      length += _vectorLength(_subtractVectors(p1, p0));
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
      centerline.push(_getPointOnBezierCurve(controlPoints, t));
    }
    pointsAllocated += numPointsInThisSegment;
  }
  if (centerline.length > totalPoints) centerline.length = totalPoints;
  while (centerline.length < totalPoints)
    centerline.push([...bezierSegmentsCPs[bezierSegmentsCPs.length - 1][3]]);
  return centerline;
}

function _vectorLength(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function _generateDoubleSidedMembrane(
  centerline1,
  centerline2,
  outerColor,
  innerColor,
  thickness,
  vertices, // <-- Argumen baru
  faces // <-- Argumen baru
) {
  if (centerline1.length !== centerline2.length) {
    console.error("Membrane centerlines must have the same length.");
    return;
  }
  const baseVertexIndexOuter = Math.floor(vertices.length / 9);
  const numPoints = centerline1.length;
  const halfThickness = thickness / 2.0;

  for (let i = 0; i < numPoints; i++) {
    const p1 = centerline1[i];
    const p2 = centerline2[i];
    const vecMembrane = _subtractVectors(p1, p2);
    let vecForward =
      i < numPoints - 1
        ? _subtractVectors(centerline1[i + 1], p1)
        : _subtractVectors(p1, centerline1[i - 1]);
    let normal = _normalizeVector(_crossProduct(vecMembrane, vecForward));
    if (normal[2] > 0) {
      normal = _scaleVector(normal, -1.0);
    }
    const frontNormal = normal;
    const backNormal = _scaleVector(normal, -1.0);
    const frontOffset = _scaleVector(frontNormal, halfThickness);
    const p1_front = _addVectors(p1, frontOffset);

    vertices.push(
      p1_front[0], p1_front[1], p1_front[2], ...innerColor, ...frontNormal
    );
    const p2_front = _addVectors(p2, frontOffset);
    vertices.push(
      p2_front[0], p2_front[1], p2_front[2], ...innerColor, ...frontNormal
    );
    const backOffset = _scaleVector(backNormal, halfThickness);
    const p1_back = _addVectors(p1, backOffset);
    vertices.push(
      p1_back[0], p1_back[1], p1_back[2], ...outerColor, ...backNormal
    );
    const p2_back = _addVectors(p2, backOffset);
    vertices.push(
      p2_back[0], p2_back[1], p2_back[2], ...outerColor, ...backNormal
    );
  }
  const numVerticesPerStrip = 4;
  for (let i = 0; i < numPoints - 1; i++) {
    const base = baseVertexIndexOuter + i * numVerticesPerStrip;
    const ftl = base + 0; const fbl = base + 1;
    const btl = base + 2; const bbl = base + 3;
    const ftr = ftl + numVerticesPerStrip; const fbr = fbl + numVerticesPerStrip;
    const btr = btl + numVerticesPerStrip; const bbr = bbl + numVerticesPerStrip;

    faces.push(ftl, fbl, ftr);
    faces.push(fbl, fbr, ftr);
    faces.push(btl, btr, bbl);
    faces.push(bbl, btr, bbr);
  }
}

function _getBezierControlPoints(curvePart) {
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

function _getPointOnBezierCurve(controlPoints, t) {
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

function _subtractVectors(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function _addVectors(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function _scaleVector(v, s) {
  return [v[0] * s, v[1] * s, v[2] * s];
}

function _normalizeVector(v) {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return len > 1e-6 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
}

function _crossProduct(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function _generateTube(
  path,
  tubeSegments,
  thicknessProfile,
  color,
  vertices, // <-- Argumen baru
  faces // <-- Argumen baru
) {
  if (path.length < 2) return;

  const baseVertexIndex = Math.floor(vertices.length / 9);
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
    if (i === 0) tangent = _subtractVectors(path[1], point);
    else if (i === vertexCount - 1)
      tangent = _subtractVectors(point, path[i - 1]);
    else
      tangent = _normalizeVector(
        _addVectors(
          _subtractVectors(path[i + 1], point),
          _subtractVectors(point, path[i - 1])
        )
      );
    tangent = _normalizeVector(tangent);
    const upApprox = Math.abs(tangent[1]) > 0.99 ? [1, 0, 0] : [0, 1, 0];
    const normal = _normalizeVector(_crossProduct(tangent, upApprox));
    const binormal = _normalizeVector(_crossProduct(tangent, normal));
    for (let j = 0; j <= tubeSegments; j++) {
      const angle = (j / tubeSegments) * 2 * Math.PI;
      const offset = _addVectors(
        _scaleVector(normal, Math.cos(angle) * currentThickness),
        _scaleVector(binormal, Math.sin(angle) * currentThickness)
      );
      const vertexPos = _addVectors(point, offset);
      const vertexNormal = _normalizeVector(offset);

      vertices.push(
        vertexPos[0], vertexPos[1], vertexPos[2],
        ...color,
        vertexNormal[0], vertexNormal[1], vertexNormal[2]
      );
    }
  }
  for (let i = 0; i < vertexCount - 1; i++) {
    for (let j = 0; j < tubeSegments; j++) {
      const idx1 = baseVertexIndex + i * (tubeSegments + 1) + j;
      const idx2 = baseVertexIndex + (i + 1) * (tubeSegments + 1) + j;
      const idx3 = idx1 + 1;
      const idx4 = idx2 + 1;

      faces.push(idx1, idx2, idx3);
      faces.push(idx2, idx4, idx3);
    }
  }
}

// =========================================================================
// === KELAS UTAMA CROBAT WING ===
// =========================================================================

export class CrobatWing extends SceneObject {
  constructor(GL, attribs) {
    // 1. Buat geometri DULU
    let vertices = [];
    let faces = [];

    // =========================================================================
    // == PARAMETER SAYAP CROBAT (Tidak berubah) ==
    // =========================================================================
    const OUTER_COLOR = [0.5, 0.8, 0.9];
    const INNER_COLOR = [0.37, 0.23, 0.5];
    const BONE_COLOR = INNER_COLOR;
    const TOTAL_POINTS = 50;
    const TUBE_SEGMENTS = 8;
    const MEMBRANE_THICKNESS = 0.02;
    const BONE_THICKNESS_PROFILE = [0.08, 0.06, 0.04];
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
        endPoint: [7.0, 2.5, -0.5],
        endHandle: [-2.0, -1.0, 0.0],
      },
    ];
    const MEMBRANE_TOP_OFFSET = BONE_THICKNESS_PROFILE[0] * 0.5;
    const MEMBRANE_TOP_CURVE = TOP_BONE_CURVE.map((segment) => ({
      startPoint: [
        segment.startPoint[0],
        segment.startPoint[1] - MEMBRANE_TOP_OFFSET,
        segment.startPoint[2],
      ],
      startHandle: segment.startHandle,
      endPoint: [
        segment.endPoint[0],
        segment.endPoint[1] - MEMBRANE_TOP_OFFSET,
        segment.endPoint[2],
      ],
      endHandle: segment.endHandle,
    }));
    const BTM_P0 = [-1, -1, 0.0];
    const BTM_P1_HOOK = [1.5, -1.5, -0.1];
    const BTM_P2_SCALLOP = [4.5, -0.5, -0.3];
    const WING_TIP_POINT = TOP_BONE_CURVE[1].endPoint;
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
    
    // !! PERBAIKAN: Hapus 'this.' dari semua pemanggilan !!
    const topBoneCenterline = _generateBezierCenterline(
      TOP_BONE_CURVE.map((p) => _getBezierControlPoints(p)),
      TOTAL_POINTS
    );
    const membraneTopCenterline = _generateBezierCenterline(
      MEMBRANE_TOP_CURVE.map((p) => _getBezierControlPoints(p)),
      TOTAL_POINTS
    );
    const bottomMembraneCenterline = _generateBezierCenterline(
      BOTTOM_CURVE_SEGMENTS.map((p) => _getBezierControlPoints(p)),
      TOTAL_POINTS
    );

    // Kirim 'vertices' dan 'faces' ke fungsi helper
    _generateTube(
      topBoneCenterline,
      TUBE_SEGMENTS,
      BONE_THICKNESS_PROFILE,
      BONE_COLOR,
      vertices,
      faces
    );
    _generateDoubleSidedMembrane(
      membraneTopCenterline,
      bottomMembraneCenterline,
      OUTER_COLOR,
      INNER_COLOR,
      MEMBRANE_THICKNESS,
      vertices,
      faces
    );

    // 2. Panggil super() di AKHIR (Sekarang aman)
    super(GL, vertices, faces, attribs);
  }
}