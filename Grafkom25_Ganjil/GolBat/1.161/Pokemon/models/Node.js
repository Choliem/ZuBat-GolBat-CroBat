/*
 * Node.js
 * Kelas dasar untuk hierarki Scene Graph.
 * Setiap objek dalam adegan akan mewarisi dari ini.
 */
export class Node {
  constructor() {
    this.childs = [];
    this.localMatrix = LIBS.get_I4();
    this.sceneObject = null; // Geometri untuk digambar (jika ada)
  }

  // Metode untuk menambahkan anak ke node ini
  add(child) {
    this.childs.push(child);
  }

  // Menetapkan geometri yang akan digambar oleh node ini
  setGeometry(sceneObject) {
    this.sceneObject = sceneObject;
  }

  // Fungsi draw REKURSIF
  draw(parentMatrix, _Mmatrix) {
    // 1. Hitung matriks final saya
    // Matriks saya = Matriks Induk * Matriks Lokal Saya
    var finalMatrix = LIBS.multiply(this.localMatrix, parentMatrix);

    // 2. Gambar geometri saya sendiri (jika saya memilikinya)
    if (this.sceneObject) {
      this.sceneObject.draw(finalMatrix, _Mmatrix);
    }

    // 3. Perintahkan semua anak saya untuk menggambar
    //    Mereka akan menggunakan matriks SAYA sebagai matriks induk MEREKA
    for (var child of this.childs) {
      child.draw(finalMatrix, _Mmatrix);
    }
  }
}
