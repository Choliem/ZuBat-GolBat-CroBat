// models/Zubat/ZubatFactory.js

import { Node } from "../Node.js";
import { ZubatLowerBody } from "./ZubatLowerBody.js";
import { ZubatUpperBody } from "./ZubatUpperBody.js";
import { ZubatEar } from "./ZubatEar.js";
import { ZubatWing } from "./ZubatWing.js";

/**
 * Fungsi helper untuk membangun Scene Graph Zubat.
 */
export function createZubatSceneGraph(GL, attribs) {
  const zubatModel = new Node();

  const zubatUpperBody = new ZubatUpperBody(GL, attribs, {
    scaleFactor: 2.5,
    latBands: 50,
    longBands: 50,
    attachTeeth: true,
    teethOptions: { segments: 160, rings: 1, bluntness: 0.2 },
  });
  const zubatLowerBody = new ZubatLowerBody(GL, attribs, {
    scaleFactor: 2.5,
    latBands: 50,
    longBands: 50,
  });
  zubatModel.add(zubatUpperBody);
  zubatModel.add(zubatLowerBody);

  const leftEar = new ZubatEar(GL, attribs, {
    segments: 20,
    rings: 10,
    bluntness: 0.3,
  });
  LIBS.translateY(leftEar.localMatrix, 4.3);
  LIBS.translateX(leftEar.localMatrix, -1.5);
  LIBS.translateZ(leftEar.localMatrix, 1.1);
  LIBS.rotateZ(leftEar.localMatrix, 3.5);
  LIBS.rotateY(leftEar.localMatrix, -0.2);

  const rightEar = new ZubatEar(GL, attribs, {
    segments: 20,
    rings: 10,
    bluntness: 0.3,
  });
  LIBS.translateY(rightEar.localMatrix, 4.3);
  LIBS.translateX(rightEar.localMatrix, 1.5);
  LIBS.translateZ(rightEar.localMatrix, 1.1);
  LIBS.rotateZ(rightEar.localMatrix, -3.5);
  LIBS.rotateY(rightEar.localMatrix, 0.2);

  zubatModel.add(leftEar);
  zubatModel.add(rightEar);

  const leftWing = new ZubatWing(GL, attribs);
  LIBS.translateY(leftWing.localMatrix, 0.0);
  LIBS.translateX(leftWing.localMatrix, 1.1);
  LIBS.rotateZ(leftWing.localMatrix, 0.4);
  LIBS.rotateY(leftWing.localMatrix, 0.2);

  const rightWing = new ZubatWing(GL, attribs);
  LIBS.scale(rightWing.localMatrix, -1, 1, 1);
  LIBS.translateY(rightWing.localMatrix, 0.0);
  LIBS.translateX(rightWing.localMatrix, 1.2);
  LIBS.rotateZ(rightWing.localMatrix, -0.4);
  LIBS.rotateY(rightWing.localMatrix, -0.2);

  zubatModel.add(leftWing);
  zubatModel.add(rightWing);

  return {
    root: zubatModel,
    wings: {
      left: leftWing,
      right: rightWing,
    },
  };
}
