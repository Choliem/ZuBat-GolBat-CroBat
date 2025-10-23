export class Node {
  constructor() {
    this.childs = [];
    this.localMatrix = LIBS.get_I4();
    this.worldMatrix = LIBS.get_I4();
    this.sceneObject = null;
  }

  add(child) {
    this.childs.push(child);
  }

  setGeometry(sceneObject) {
    this.sceneObject = sceneObject;
  }

  /**
   * Fungsi draw REKURSIF
   * @param {Array} parentMatrix - Matriks transformasi dari parent
   * @param {Object} uniforms - Kumpulan LOKASI uniform shader
   */
  draw(parentMatrix, uniforms) {
    // 1. Hitung matriks final (Parent * Lokal)
    var finalMatrix = LIBS.multiply(this.localMatrix, parentMatrix);

    // 2. Gambar geometri node ini (jika ada)
    if (this.sceneObject) {
      // PERBAIKAN: Kirim seluruh object 'uniforms'
      this.sceneObject.draw(finalMatrix, uniforms);
    }

    // 3. Panggil draw() untuk semua anak (rekursif)
    for (var child of this.childs) {
      child.draw(finalMatrix, uniforms);
    }
  }
  updateWorldMatrix(parentWorldMatrix) {
    // 1. Hitung world matrix node ini
    if (this.localMatrix) {
      this.worldMatrix = LIBS.multiply(parentWorldMatrix, this.localMatrix);
    } else {
      // Fallback jika tidak ada local matrix
      this.worldMatrix = parentWorldMatrix;
    }

    // 2. Panggil update secara rekursif untuk semua children
    if (this.children) {
      for (let child of this.children) {
        child.updateWorldMatrix(this.worldMatrix);
      }
    }
  }
}