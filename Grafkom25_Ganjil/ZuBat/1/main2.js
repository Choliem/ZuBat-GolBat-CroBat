// main.js (excerpt)

import { SceneObject } from "./models/SceneObject.js";
import { ZubatLowerBody } from "./models/ZubatLowerBody.js";
import { ZubatUpperBody } from "./models/ZubatUpperBody.js";
import { ZubatTooth } from "./models/ZubatTooth.js";
import { ZubatEar } from "./models/ZubatEar.js";
import { ZubatWing } from "./models/ZubatWing.js";

// 1. Subclass SceneObject sebagai root node
class ZubatRoot extends SceneObject {
  constructor(GL, position, color, normal) {
    super(GL, position, color, normal);
    // kosong—root tidak punya mesh
    this.childs = [];
  }
  setup() {} // override: tidak perlu buffer
  render(GL, _Mmatrix, parentMatrix) {
    // reset modelMatrix setiap frame
    this.modelMatrix = LIBS.get_I4();
    // floating animation
    const f = Math.sin(Date.now() / 300) * 0.5;
    LIBS.translateY(this.modelMatrix, f);
    // combine dengan parent
    const Mroot = LIBS.multiply(parentMatrix, this.modelMatrix);
    // render semua child
    for (const c of this.childs) {
      c.render(GL, _Mmatrix, Mroot);
    }
  }
}

function main() {
  // … shader + camera setup sama seperti biasa …

  // 2. Instansiasi root dan body parts
  const zubatRoot = new ZubatRoot(GL, _position, _color, _normal);

  const lower = new ZubatLowerBody(GL, _position, _color, _normal, 2.5, 40, 40);
  const upper = new ZubatUpperBody(GL, _position, _color, _normal, 2.5, 40, 40);

  const earL = new ZubatEar(GL, _position, _color, _normal, 16, 8, 0.3);
  const earR = new ZubatEar(GL, _position, _color, _normal, 16, 8, 0.3);
  const toothUL = new ZubatTooth(GL, _position, _color, _normal, 32, 1, 0.0);
  const toothUR = new ZubatTooth(GL, _position, _color, _normal, 32, 1, 0.0);
  const wingL = new ZubatWing(GL, _position, _color, _normal);
  const wingR = new ZubatWing(GL, _position, _color, _normal);

  // 3. Atur POSITION_MATRIX lokal setiap part
  // LowerBody di origin
  // UpperBody di origin
  // Ears, teeth, wings dengan matrix lokal masing-masing
  {
    const M = (earL.modelMatrix = LIBS.get_I4());
    LIBS.translateY(M, 4.3);
    LIBS.translateX(M, -1.5);
    LIBS.translateZ(M, 1.1);
    LIBS.rotateZ(M, 3.5);
    earL.setup();
    zubatRoot.childs.push(earL);
  }
  {
    const M = (earR.modelMatrix = LIBS.get_I4());
    LIBS.translateY(M, 4.3);
    LIBS.translateX(M, 1.5);
    LIBS.translateZ(M, 1.1);
    LIBS.rotateZ(M, -3.5);
    earR.setup();
    zubatRoot.childs.push(earR);
  }
  {
    const M = (toothUL.modelMatrix = LIBS.get_I4());
    LIBS.translateY(M, 1.25);
    LIBS.translateX(M, -0.5);
    LIBS.translateZ(M, 1.7);
    LIBS.rotateZ(M, 0.2);
    toothUL.setup();
    zubatRoot.childs.push(toothUL);
  }
  {
    const M = (toothUR.modelMatrix = LIBS.get_I4());
    LIBS.translateY(M, 1.25);
    LIBS.translateX(M, 0.5);
    LIBS.translateZ(M, 1.7);
    LIBS.rotateZ(M, -0.2);
    toothUR.setup();
    zubatRoot.childs.push(toothUR);
  }
  {
    wingL.setup();
    zubatRoot.childs.push(wingL);
  }
  {
    wingR.modelMatrix = LIBS.get_I4();
    LIBS.scale(wingR.modelMatrix, -1, 1, 1);
    wingR.setup();
    zubatRoot.childs.push(wingR);
  }
  lower.setup();
  zubatRoot.childs.push(lower);

  upper.setup();
  zubatRoot.childs.push(upper);

  // 4. Render loop: panggil hanya root
  const render = () => {
    // camera + lighting same as before…
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

    const WORLD = LIBS.get_I4(); // identity world
    zubatRoot.render(GL, _Mmatrix, WORLD);

    // update wing flapping (lokal di wing MOVE_MATRIX)
    wingL.modelMatrix = LIBS.get_I4();
    const flap = Math.sin(Date.now() / 100) * 0.1;
    LIBS.rotateZ(wingL.modelMatrix, 0.4 + flap);

    wingR.modelMatrix = LIBS.get_I4();
    LIBS.scale(wingR.modelMatrix, -1, 1, 1);
    LIBS.rotateZ(wingR.modelMatrix, -0.4 - flap);

    requestAnimationFrame(render);
  };
  render();
}
main();
