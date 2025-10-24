/*
 * ZubatEar.js - Updated to extend Node
 * IMPROVEMENT: Now compatible with scene graph hierarchy
 */
import { Node } from "./Node.js";
import { SceneObject } from "./SceneObject.js";

export class ZubatEar extends Node {
  constructor(GL, attribs, segments = 20, rings = 10, bluntness = 0.3) {
    super(); // Call Node constructor

    // --- PARAMETER BENTUK TELINGA ---
    const outerEarColor = [0.35, 0.55, 0.95];
    const innerEarColor = [0.9, 0.45, 0.6];
    const height = 2.0;
    const maxWidth = 1.5;
    const thickness = 1.0;
    const curveAmount = -0.5;
    const tipWidth = maxWidth * bluntness;

    // --- PARAMETER RONGGA DALAM TELINGA ---
    const cavityTarget = [0.0, 1.0, -0.1];
    const cavityRimSharpness = 2.0;

    // --- Generate Geometry ---
    const vertices = [];
    const faces = [];

    for (let j = 0; j <= rings; j++) {
      const t = j / rings;
      const y = t * height;

      let widthProfile;
      if (t < 0.5) {
        widthProfile = Math.sin(t * Math.PI);
      } else {
        const upper_t = (t - 0.5) * 2;
        const targetWidthRatio = tipWidth / maxWidth;
        widthProfile = (1.0 - upper_t) * 1.0 + upper_t * targetWidthRatio;
      }
      const currentWidth = widthProfile * maxWidth;

      const curveProfile = Math.sin(t * (Math.PI / 2));
      const currentCurve = curveProfile * curveAmount;

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;

        let x = (Math.cos(angle) * currentWidth) / 2;
        let z = (Math.sin(angle) * thickness) / 2;
        z += currentCurve;

        let final_x = x,
          final_y = y,
          final_z = z;
        let finalColor = outerEarColor;
        let normal;

        if (Math.sin(angle) > 0) {
          let pullAmount = Math.pow(Math.sin(angle), cavityRimSharpness);
          pullAmount *= widthProfile;

          if (pullAmount > 0.1) {
            finalColor = innerEarColor;
          }

          final_x = x * (0.9 - pullAmount) + cavityTarget[0] * pullAmount;
          final_y = y * (0.9 - pullAmount) + cavityTarget[1] * pullAmount;
          final_z = z * (0.0 - pullAmount) + cavityTarget[2] * pullAmount;
        }

        if (finalColor === innerEarColor) {
          normal = [
            final_x - cavityTarget[0],
            final_y - cavityTarget[1],
            final_z - cavityTarget[2],
          ];
        } else {
          const tangentY = Math.sin(t * Math.PI) * 0.5;
          normal = [Math.cos(angle) * widthProfile, tangentY, Math.sin(angle)];
          if (curveAmount > 0) {
            normal[2] -= curveProfile;
          }
        }

        vertices.push(final_x, final_y, final_z, ...finalColor);
        const len =
          Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2) || 1;
        vertices.push(normal[0] / len, normal[1] / len, normal[2] / len);
      }
    }

    for (let j = 0; j < rings; j++) {
      for (let i = 0; i < segments; i++) {
        const idx1 = j * (segments + 1) + i;
        const idx2 = (j + 1) * (segments + 1) + i;
        faces.push(idx1, idx2, idx1 + 1);
        faces.push(idx2, idx2 + 1, idx1 + 1);
      }
    }

    // Create SceneObject and attach to this Node
    const sceneObj = new SceneObject(GL, vertices, faces, attribs);
    this.setGeometry(sceneObj);
  }
}
