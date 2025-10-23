import { SceneObject } from "./SceneObject.js";

export const Volcano = {
  _createVolcanoWithCrater: function (
    baseRadius, // Radius alas gunung
    height, // Ketinggian total
    segments, // Jumlah sisi
    topRadius, // Radius kawah di atas
    craterDepth, // Kedalaman kawah (dihitung dari puncak)
    bottomColor, // Warna batu
    rimColor, // Warna tepi kawah (agak lava)
    craterBottomColor // Warna dasar kawah (lava cerah)
  ) {
    let vertices = [];
    let faces = [];
    let angleStep = (Math.PI * 2) / segments;
    let halfHeight = height / 2;
    let yOffset = 0; // pusat Y ada di 0

    // --- DEKLARASI VERTEX PUSAT ---

    // [0] PUSAT ALAS (Bottom Center) - Warna Batu
    // Format: X, Y, Z, R, G, B, U, V
    vertices.push(0, -halfHeight + yOffset, 0, ...bottomColor, 0.5, 0.5);
    const bottomCenterIndex = 0;

    // [1] PUSAT DASAR Kawah (Crater Bottom) - Warna Lava Cerah
    let craterBottomY = halfHeight + yOffset - craterDepth;
    vertices.push(0, craterBottomY, 0, ...craterBottomColor, 0.5, 0.5);
    const craterBottomIndex = 1;

    let currentVertex = 2; // Indeks vertex untuk cincin dimulai dari 2

    // --- LOOP MEMBUAT CINCIN VERTEX ---
    for (let i = 0; i <= segments; i++) {
      let angle = i * angleStep;

      // Koordinat untuk cincin alas
      let x_base = Math.cos(angle) * baseRadius;
      let z_base = Math.sin(angle) * baseRadius;

      // Koordinat cincin puncak (tepi kawah)
      let x_top = Math.cos(angle) * topRadius;
      let z_top = Math.sin(angle) * topRadius;

      // Vertex Cincin Alas (Batu)
      vertices.push(x_base, -halfHeight + yOffset, z_base, ...bottomColor, 0, 0);

      // Vertex Cincin Tepi Kawah (Rim) - Warna Tepi
      vertices.push(x_top, halfHeight + yOffset, z_top, ...rimColor, 1, 1);

      // --- MEMBUAT FACES SETELAH 2 SET VERTEX DIBUAT ---
      if (i > 0) {
        // Ambil indeks dari 4 vertex yang relevan
        let baseIdx = currentVertex; // Alas saat ini
        let rimIdx = currentVertex + 1; // Tepi saat ini
        let prevBaseIdx = currentVertex - 2; // Alas sebelumnya
        let prevRimIdx = currentVertex - 1; // Tepi sebelumnya

        // 1. Face Lereng Luar (Quad: prevBase -> base -> rim -> prevRim)
        faces.push(prevBaseIdx, baseIdx, rimIdx);
        faces.push(prevBaseIdx, rimIdx, prevRimIdx);

        // 2. Face Alas Bawah (Triangle: bottomCenter -> base -> prevBase)
        // (Membuat alas gunung tetap tertutup)
        faces.push(bottomCenterIndex, baseIdx, prevBaseIdx);

        // 3. Face Lereng Kawah Dalam (Triangle: craterBottom -> prevRim -> rim)
        // (Membuat kawah cekung ke dalam)
        faces.push(craterBottomIndex, prevRimIdx, rimIdx);
      }
      currentVertex += 2; // Tambah 2 vertex (bawah dan atas) per iterasi
    }
    return { vertices, faces };
  },
  createGeometry: function (baseRadius, height, segments) {
    const VOLCANO_COLOR = [0.2, 0.15, 0.15]; // Batu abu-abu gelap
    const RIM_COLOR = [0.8, 0.2, 0.0]; // Tepi oranye gelap (sedikit lava)
    const LAVA_COLOR = [1.0, 0.5, 0.0]; // Lava cerah di dasar kawah

    // --- Parameter Baru untuk Kawah ---
    // Atur seberapa lebar "potongan" di atas
    const topRadius = baseRadius * 0.25; // 60% dari radius alas

    // Atur seberapa dalam kawahnya
    const craterDepth = height * 0.4; // 40% dari ketinggian total

    // Panggil helper baru
    var geom = this._createVolcanoWithCrater(baseRadius, height, segments, topRadius, craterDepth, VOLCANO_COLOR, RIM_COLOR, LAVA_COLOR);

    return { vertices: geom.vertices, faces: geom.faces };
  },
  createSceneObject: function (GL, attribs, baseRadius, height, segments) {
    var geom = this.createGeometry(baseRadius, height, segments);

    // Gunakan layout "POS_COL_UV" (menggunakan vertex color dan mengabaikan tekstur)
    var sceneObj = new SceneObject(GL, geom.vertices, geom.faces, attribs, "POS_COL_UV");
    return sceneObj;
  },
};
