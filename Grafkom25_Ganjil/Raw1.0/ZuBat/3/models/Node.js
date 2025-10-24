/*
 * Node.js
 * Kelas dasar untuk hierarki Scene Graph.
 * Setiap objek dalam adegan akan mewarisi dari ini.
 *
 * FILOSOFI:
 * - Node bisa punya GEOMETRI (via setGeometry) atau hanya jadi TRANSFORMATION NODE
 * - Node bisa punya CHILDREN (via add) yang akan mewarisi transformasi parent
 * - Transformasi bersifat HIERARKIS: childMatrix = parentMatrix × localMatrix
 */
import { LIBS } from "../libs.js";
export class Node {
  constructor() {
    this.childs = []; // Array untuk menyimpan anak-anak
    this.localMatrix = LIBS.get_I4(); // Transformasi lokal node ini (relatif ke parent)
    this.sceneObject = null; // Geometri untuk digambar (optional)
  }

  /**
   * Menambahkan child node ke node ini.
   * Child akan mewarisi transformasi dari parent saat draw().
   *
   * @param {Node} child - Node yang akan dijadikan anak
   */
  add(child) {
    this.childs.push(child);
  }

  /**
   * Menetapkan geometri yang akan digambar oleh node ini.
   * Node tanpa geometri hanya berfungsi sebagai transformation node.
   *
   * @param {SceneObject} sceneObject - Objek geometri yang akan di-render
   */
  setGeometry(sceneObject) {
    this.sceneObject = sceneObject;
  }

  /**
   * Fungsi draw REKURSIF - Inti dari scene graph traversal.
   *
   * Algoritma:
   * 1. Hitung matriks final = parentMatrix × localMatrix
   * 2. Render geometri sendiri (jika ada) dengan matriks final
   * 3. Rekursif: Panggil draw() semua children dengan matriks final sebagai parent mereka
   *
   * @param {Array} parentMatrix - Matriks transformasi dari parent (4x4 matrix array)
   * @param {WebGLUniformLocation} _Mmatrix - Uniform location untuk model matrix
   */
  draw(parentMatrix, _Mmatrix) {
    // 1. Hitung matriks final saya
    //    Matriks saya = Matriks Lokal Saya * Matriks Induk
    //    Order penting: localMatrix dikalikan SETELAH parentMatrix
    var finalMatrix = LIBS.multiply(this.localMatrix, parentMatrix);

    // 2. Gambar geometri saya sendiri (jika saya memilikinya)
    if (this.sceneObject) {
      this.sceneObject.draw(finalMatrix, _Mmatrix);
    }

    // 3. Perintahkan semua anak saya untuk menggambar
    //    Mereka akan menggunakan matriks SAYA sebagai matriks induk MEREKA
    //    Ini menciptakan chain transformasi: Root → Parent → Child → Grandchild...
    for (var child of this.childs) {
      child.draw(finalMatrix, _Mmatrix);
    }
  }
}