// models/crobat/CrobatFactory.js

import { Node } from "../Node.js";
import { CrobatBody } from "./CrobatBody.js";
import { CrobatEar } from "./CrobatEar.js";
import { CrobatMouthAndTeeth } from "./CrobatMouthAndTeeth.js";
import { CrobatWing } from "./CrobatWing.js";
import { CrobatEyelid } from "./CrobatEyelid.js";
import { CrobatSclera } from "./CrobatSclera.js";
import { CrobatPupil } from "./CrobatPupil.js";
import { CrobatFoot } from "./CrobatFoot.js";

/**
 * Fungsi helper untuk membangun Scene Graph Crobat.
 */
export function createCrobatSceneGraph(GL, attribs) {
  const rootNode = new Node();
  const bodyNode = new Node();
  rootNode.add(bodyNode);
  const leftEyeNode = new Node();
  const leftEyelidNode = new Node();
  const leftScleraNode = new Node();
  const leftPupilNode = new Node();
  bodyNode.add(leftEyeNode);
  leftEyeNode.add(leftEyelidNode);
  leftEyeNode.add(leftScleraNode);
  leftEyeNode.add(leftPupilNode);
  const rightEyeNode = new Node();
  const rightEyelidNode = new Node();
  const rightScleraNode = new Node();
  const rightPupilNode = new Node();
  bodyNode.add(rightEyeNode);
  rightEyeNode.add(rightEyelidNode);
  rightEyeNode.add(rightScleraNode);
  rightEyeNode.add(rightPupilNode);
  const leftEarNode = new Node();
  const rightEarNode = new Node();
  bodyNode.add(leftEarNode);
  bodyNode.add(rightEarNode);
  const mouthNode = new Node();
  bodyNode.add(mouthNode);
  const upperLeftWingNode = new Node();
  const upperRightWingNode = new Node();
  const lowerLeftWingNode = new Node();
  const lowerRightWingNode = new Node();
  bodyNode.add(upperLeftWingNode);
  bodyNode.add(upperRightWingNode);
  bodyNode.add(lowerLeftWingNode);
  bodyNode.add(lowerRightWingNode);
  const leftFootNode = new Node();
  const rightFootNode = new Node();
  bodyNode.add(leftFootNode);
  bodyNode.add(rightFootNode);

  bodyNode.setGeometry(new CrobatBody(GL, attribs, 1.5, 100, 100));
  leftEyelidNode.setGeometry(new CrobatEyelid(GL, attribs));
  leftScleraNode.setGeometry(new CrobatSclera(GL, attribs));
  leftPupilNode.setGeometry(new CrobatPupil(GL, attribs));
  rightEyelidNode.setGeometry(new CrobatEyelid(GL, attribs));
  rightScleraNode.setGeometry(new CrobatSclera(GL, attribs));
  rightPupilNode.setGeometry(new CrobatPupil(GL, attribs));
  leftEarNode.setGeometry(new CrobatEar(GL, attribs));
  rightEarNode.setGeometry(new CrobatEar(GL, attribs));
  mouthNode.setGeometry(new CrobatMouthAndTeeth(GL, attribs));
  upperLeftWingNode.setGeometry(new CrobatWing(GL, attribs));
  upperRightWingNode.setGeometry(new CrobatWing(GL, attribs));
  lowerLeftWingNode.setGeometry(new CrobatWing(GL, attribs));
  lowerRightWingNode.setGeometry(new CrobatWing(GL, attribs));
  leftFootNode.setGeometry(new CrobatFoot(GL, attribs));
  rightFootNode.setGeometry(new CrobatFoot(GL, attribs));

  LIBS.scale(bodyNode.localMatrix, 0.84, 0.93, 0.8);
  LIBS.rotateX(bodyNode.localMatrix, 0.3);
  LIBS.translateX(leftEyeNode.localMatrix, -0.55);
  LIBS.translateY(leftEyeNode.localMatrix, 0.55);
  LIBS.translateZ(leftEyeNode.localMatrix, 1.2825);
  LIBS.rotateX(leftEyeNode.localMatrix, -0.2);
  LIBS.rotateY(leftEyeNode.localMatrix, -0.5);
  LIBS.rotateZ(leftEyeNode.localMatrix, -0.35);
  LIBS.scale(leftEyelidNode.localMatrix, -1.3, 1.3, 1.0);
  LIBS.rotateZ(leftEyelidNode.localMatrix, 0);
  LIBS.translateZ(leftEyelidNode.localMatrix, 0);
  LIBS.scale(leftScleraNode.localMatrix, 1.3, 1.3, 1.0);
  LIBS.scale(leftPupilNode.localMatrix, 1.3, 1.3, 1.0);
  LIBS.translateZ(leftPupilNode.localMatrix, 0.02);
  LIBS.translateX(rightEyeNode.localMatrix, 0.55);
  LIBS.translateY(rightEyeNode.localMatrix, 0.55);
  LIBS.translateZ(rightEyeNode.localMatrix, 1.2825);
  LIBS.rotateX(rightEyeNode.localMatrix, -0.2);
  LIBS.rotateY(rightEyeNode.localMatrix, 0.5);
  LIBS.rotateZ(rightEyeNode.localMatrix, 0.35);
  LIBS.scale(rightEyelidNode.localMatrix, 1.3, 1.3, 1.0);
  LIBS.rotateZ(rightEyelidNode.localMatrix, 0);
  LIBS.translateZ(rightEyelidNode.localMatrix, 0.01);
  LIBS.scale(rightScleraNode.localMatrix, 1.3, 1.3, 1.0);
  LIBS.scale(rightPupilNode.localMatrix, 1.3, 1.3, 1.0);
  LIBS.translateZ(rightPupilNode.localMatrix, 0.02);
  LIBS.scale(leftEarNode.localMatrix, 0.4, 0.8, 0.4);
  LIBS.rotateX(leftEarNode.localMatrix, -0.3);
  LIBS.rotateZ(leftEarNode.localMatrix, 0.25);
  LIBS.translateX(leftEarNode.localMatrix, -0.45);
  LIBS.translateY(leftEarNode.localMatrix, 0.75);
  LIBS.scale(rightEarNode.localMatrix, 0.4, 0.8, 0.4);
  LIBS.rotateX(rightEarNode.localMatrix, -0.3);
  LIBS.rotateZ(rightEarNode.localMatrix, -0.25);
  LIBS.translateX(rightEarNode.localMatrix, 0.45);
  LIBS.translateY(rightEarNode.localMatrix, 0.75);
  LIBS.rotateX(mouthNode.localMatrix, -0.275);
  LIBS.translateY(mouthNode.localMatrix, -0.5);
  LIBS.translateZ(mouthNode.localMatrix, 1.2953);
  LIBS.scale(leftFootNode.localMatrix, 0.96, 0.96, 0.96);
  LIBS.rotateX(leftFootNode.localMatrix, 3.9);
  LIBS.rotateY(leftFootNode.localMatrix, 0.3);
  LIBS.translateX(leftFootNode.localMatrix, -0.4);
  LIBS.translateY(leftFootNode.localMatrix, 1.5);
  LIBS.translateZ(leftFootNode.localMatrix, -0.53);
  LIBS.scale(rightFootNode.localMatrix, 0.96, 0.96, 0.96);
  LIBS.rotateX(rightFootNode.localMatrix, 3.9);
  LIBS.rotateY(rightFootNode.localMatrix, -0.3);
  LIBS.translateX(rightFootNode.localMatrix, 0.4);
  LIBS.translateY(rightFootNode.localMatrix, 1.5);
  LIBS.translateZ(rightFootNode.localMatrix, -0.53);

  return {
    root: rootNode,
    wings: {
      upperLeft: upperLeftWingNode,
      upperRight: upperRightWingNode,
      lowerLeft: lowerLeftWingNode,
      lowerRight: lowerRightWingNode,
    },
  };
}
