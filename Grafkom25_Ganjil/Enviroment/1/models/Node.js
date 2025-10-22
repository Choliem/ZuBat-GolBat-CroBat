/*
 * ===================================================================
 * Node.js - Otak dari Scene Graph
 * ===================================================================
 *
 * KRITERIA 5: PENJELASAN ALGORITMA SCENE GRAPH
 *
 * FILOSOFI:
 * - Sebuah 'Node' adalah unit dasar dalam adegan.
 * - Node bisa memiliki GEOMETRI (via setGeometry).
 * - Node bisa memiliki ANAK (via add).
 * - Transformasi bersifat HIERARKIS:
 * MatrixAnak = MatrixInduk * MatrixLokalAnak
 */
export class Node {
  constructor() {
    this.childs = []; // Array untuk menyimpan anak-anak
    this.localMatrix = LIBS.get_I4(); // Transformasi node ini (relatif ke parent)
    this.sceneObject = null; // Geometri untuk digambar (optional)
  }

  /**
   * Menambahkan child node ke node ini.
   * @param {Node} child - Node yang akan dijadikan anak
   */
  add(child) {
    this.childs.push(child);
  }

  /**
   * Menetapkan geometri yang akan digambar oleh node ini.
   * @param {SceneObject} sceneObject - Objek geometri yang akan di-render
   */
  setGeometry(sceneObject) {
    this.sceneObject = sceneObject;
  }

  /**
   * KRITERIA 5: Fungsi draw REKURSIF (Inti dari Scene Graph)
   *
   * ALGORITMA:
   * 1. Hitung matriks final = parentMatrix * localMatrix
   * 2. Render geometri sendiri (jika ada) dengan matriks final
   * 3. Rekursif: Panggil draw() semua children dengan matriks final sebagai parent mereka
   *
   * @param {Array} parentMatrix - Matriks transformasi dari parent
   * @param {WebGLUniformLocation} _Mmatrix - Uniform location untuk model matrix
   */
  draw(parentMatrix, _Mmatrix) {
    // 1. Hitung matriks final (Parent * Lokal)
    //    (Urutan di LIBS.multiply dibalik: Lokal * Parent)
    var finalMatrix = LIBS.multiply(this.localMatrix, parentMatrix);

    // 2. Gambar geometri node ini (jika ada)
    if (this.sceneObject) {
      this.sceneObject.draw(finalMatrix, _Mmatrix);
    }

    // 3. Panggil draw() untuk semua anak (rekursif)
    //    Matriks final ini menjadi 'parentMatrix' untuk anak-anaknya.
    for (var child of this.childs) {
      child.draw(finalMatrix, _Mmatrix);
    }
  }
}