/*
 * ZubatWing.js - Ultimate Edition
 *
 * IMPROVEMENTS:
 * 1. ✅ Extends Node (scene graph compatible)
 * 2. ✅ Separated geometry generation into logical parts
 * 3. ✅ Modular bone & membrane generation
 * 4. ✅ Better Bezier curve handling
 * 5. ✅ Dual-sided membrane (outer blue, inner pink)
 * 6. ✅ Options pattern for flexibility
 * 7. ✅ Animation-ready (localMatrix dapat di-update setiap frame)
 *
 * ARCHITECTURE:
 *   ZubatWing (Node) [Single SceneObject dengan combined geometry]
 *   ├─ Top Bone (tube mesh)
 *   ├─ Mid Bone (tube mesh)
 *   ├─ Connector Bone (tube mesh)
 *   └─ Membrane (dual-sided mesh)
 *
 * ANIMATION SUPPORT:
 *   Wing dirancang untuk di-animate via localMatrix rebuilding:
 *   - Flapping: rotateY(flapAngle)
 *   - Folding: rotateZ(foldAngle)
 *   - Extending: scale(stretchFactor, 1, 1)
 */

import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";

export class ZubatWing extends Node {
  /**
   * Constructor - Buat complete wing geometry.
   *
   * @param {WebGLRenderingContext} GL - WebGL context
   * @param {Object} attribs - Attribute locations
   * @param {Object} options - Wing shape parameters
   */
  constructor(GL, attribs, options = {}) {
    super();

    // Merge dengan defaults
    const opts = { ...ZubatWing.DEFAULT_OPTIONS, ...options };

    // 1. Generate all wing parts
    const wingData = this._generateWingGeometry(opts);

    // 2. Buat SceneObject dari combined geometry
    const sceneObj = new SceneObject(
      GL,
      wingData.vertices,
      wingData.faces,
      attribs
    );
    this.setGeometry(sceneObj);
  }

  /**
   * Default options untuk wing shape.
   */
  static DEFAULT_OPTIONS = {
    // Colors
    boneColor: [0.45, 0.65, 1.0], // Light blue bones
    outerMembraneColor: [0.35, 0.55, 0.95], // Blue outer
    innerMembraneColor: [0.9, 0.45, 0.6], // Pink inner

    // Bone thickness profiles [base, middle, tip]
    boneThickness: {
      top: [0.15, 0.12, 0.08],
      mid: [0.08, 0.07, 0.05],
      connector: 0.09,
    },

    // Mesh resolution
    segmentsPerPart: 15, // Points per bone segment
    tubeSegments: 12, // Circumference resolution
    membraneThickness: 0.05,

    // Top bone curve (main wing bone)
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

    // Mid bone curve (secondary wing bone)
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
   * Generate complete wing geometry (bones + membrane).
   * Combines semua parts dalam satu vertices/faces array.
   *
   * @param {Object} opts - Shape parameters
   * @returns {Object} { vertices: Array, faces: Array }
   */
  _generateWingGeometry(opts) {
    const allVertices = [];
    const allFaces = [];
    let vertexOffset = 0; // Track vertex count untuk face indexing

    // Helper untuk append geometry part
    const appendPart = (partData) => {
      allVertices.push(...partData.vertices);

      // Adjust face indices dengan offset
      for (let i = 0; i < partData.faces.length; i++) {
        allFaces.push(partData.faces[i] + vertexOffset);
      }

      vertexOffset += partData.vertices.length / 9; // 9 floats per vertex
    };

    // 1. Generate top bone (main wing structure)
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

    // 2. Generate mid bone (secondary support)
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

    // 3. Generate connector bone (links top & mid at elbow)
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

    // 4. Generate membrane (stretched between top & mid bones)
    const membraneData = this._generateMembrane(
      topBonePath,
      midBonePath,
      opts.outerMembraneColor,
      opts.innerMembraneColor,
      opts.membraneThickness
    );
    appendPart(membraneData);

    return { vertices: allVertices, faces: allFaces };
  }

  /**
   * Generate path dari Bezier curve segments.
   *
   * @param {Array} curveSegments - Array of curve definitions
   * @param {Number} segmentsPerPart - Points per segment
   * @returns {Array} Array of [x,y,z] points
   */
  _generateBezierPath(curveSegments, segmentsPerPart) {
    const path = [];

    for (let i = 0; i < curveSegments.length; i++) {
      const segment = curveSegments[i];
      const controlPoints = this._getBezierControlPoints(segment);

      // Skip first point if not first segment (avoid duplicate)
      const start = i === 0 ? 0 : 1;

      for (let j = start; j <= segmentsPerPart; j++) {
        const t = j / segmentsPerPart;
        path.push(this._evaluateBezier(controlPoints, t));
      }
    }

    return path;
  }

  /**
   * Convert curve definition to Bezier control points.
   */
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

  /**
   * Evaluate cubic Bezier curve at parameter t.
   */
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

  /**
   * Generate tube mesh along path (untuk bones).
   *
   * @param {Array} path - Array of [x,y,z] points
   * @param {Number} tubeSegments - Circumference resolution
   * @param {Number|Array} thickness - Constant or [base, mid, tip]
   * @param {Array} color - RGB color [r,g,b]
   * @returns {Object} { vertices: Array, faces: Array }
   */
  _generateTube(path, tubeSegments, thickness, color) {
    const vertices = [];
    const faces = [];

    if (path.length < 2) return { vertices, faces };

    const baseVertexIndex = 0;

    // Generate rings of vertices along path
    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      const t = path.length > 1 ? i / (path.length - 1) : 0;

      // Calculate current thickness
      let currentThickness;
      if (Array.isArray(thickness)) {
        // Interpolate thickness profile
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

      // Calculate tangent vector
      let tangent;
      if (i === 0) {
        tangent = this._subtract(path[1], point);
      } else if (i === path.length - 1) {
        tangent = this._subtract(point, path[i - 1]);
      } else {
        tangent = this._subtract(path[i + 1], path[i - 1]);
      }
      tangent = this._normalize(tangent);

      // Calculate perpendicular vectors (Frenet frame)
      const up = Math.abs(tangent[1]) > 0.99 ? [1, 0, 0] : [0, 1, 0];
      const normal = this._normalize(this._cross(tangent, up));
      const binormal = this._normalize(this._cross(tangent, normal));

      // Generate ring
      for (let j = 0; j <= tubeSegments; j++) {
        const angle = (j / tubeSegments) * 2 * Math.PI;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // Position on circle
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

    // Generate faces
    for (let i = 0; i < path.length - 1; i++) {
      for (let j = 0; j < tubeSegments; j++) {
        const idx1 = baseVertexIndex + i * (tubeSegments + 1) + j;
        const idx2 = baseVertexIndex + (i + 1) * (tubeSegments + 1) + j;

        faces.push(idx1, idx2, idx1 + 1);
        faces.push(idx2, idx2 + 1, idx1 + 1);
      }
    }

    return { vertices, faces };
  }

  /**
   * Generate dual-sided membrane stretched between two paths.
   *
   * @param {Array} path1 - Top bone path
   * @param {Array} path2 - Mid bone path
   * @param {Array} outerColor - Outer side color
   * @param {Array} innerColor - Inner side color
   * @param {Number} thickness - Membrane thickness
   * @returns {Object} { vertices: Array, faces: Array }
   */
  _generateMembrane(path1, path2, outerColor, innerColor, thickness) {
    const vertices = [];
    const faces = [];

    if (path1.length !== path2.length) {
      console.warn("Membrane paths must have same length");
      return { vertices, faces };
    }

    const halfThickness = thickness / 2.0;
    const baseVertexIndex = 0;

    // Generate dual-sided vertices
    for (let i = 0; i < path1.length; i++) {
      const p1 = path1[i];
      const p2 = path2[i];

      // Calculate normal (perpendicular to membrane surface)
      const vecMembrane = this._subtract(p1, p2);
      const vecForward =
        i < path1.length - 1
          ? this._subtract(path1[i + 1], p1)
          : this._subtract(p1, path1[i - 1]);

      let normal = this._normalize(this._cross(vecMembrane, vecForward));

      // Ensure normal points outward (negative Z)
      if (normal[2] > 0) {
        normal = this._scale(normal, -1);
      }

      const outerOffset = this._scale(normal, halfThickness);
      const innerOffset = this._scale(normal, -halfThickness);

      // Outer side (blue)
      vertices.push(...this._add(p1, outerOffset), ...outerColor, ...normal);
      vertices.push(...this._add(p2, outerOffset), ...outerColor, ...normal);

      // Inner side (pink)
      const innerNormal = this._scale(normal, -1);
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

      // Outer side faces
      const otl = baseIdx + 0; // Outer top left
      const obl = baseIdx + 1; // Outer bottom left
      const otr = baseIdx + 4; // Outer top right
      const obr = baseIdx + 5; // Outer bottom right

      faces.push(otl, obl, otr);
      faces.push(obl, obr, otr);

      // Inner side faces (reversed winding)
      const itl = baseIdx + 2; // Inner top left
      const ibl = baseIdx + 3; // Inner bottom left
      const itr = baseIdx + 6; // Inner top right
      const ibr = baseIdx + 7; // Inner bottom right

      faces.push(itl, itr, ibl);
      faces.push(ibl, itr, ibr);
    }

    return { vertices, faces };
  }

  // ==================== VECTOR MATH HELPERS ====================

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
