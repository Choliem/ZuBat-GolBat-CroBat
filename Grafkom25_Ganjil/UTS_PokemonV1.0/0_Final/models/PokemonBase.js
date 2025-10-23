// models/PokemonBase.js

import { SceneObject } from "./SceneObject.js";

export const PokemonBase = {
  // ===================================================================
  // FUNGSI HELPER GEOMETRI (TETAP SAMA)
  // ===================================================================
  _createConeGeometry: function (radius, height, segments, color, yOffset = 0) {
    // ... (Kode _createConeGeometry TIDAK BERUBAH dari jawaban sebelumnya) ...
    let vertices = [];
    let faces = [];
    let angleStep = (Math.PI * 2) / segments;
    let halfHeight = height / 2;
    let apexIndex = 0;
    let bottomCenterIndex = 1;
    vertices.push(0, yOffset + halfHeight, 0, ...color, 0.5, 0.5); // Apex
    vertices.push(0, yOffset - halfHeight, 0, ...color, 0.5, 0.5); // Bottom center
    let currentVertex = 2;
    for (let i = 0; i <= segments; i++) {
      let angle = i * angleStep;
      let x = Math.cos(angle) * radius;
      let z = Math.sin(angle) * radius;
      vertices.push(x, yOffset - halfHeight, z, ...color, 0, 0);
      if (i > 0) {
        let bottomIdx = currentVertex;
        let prevBottomIdx = currentVertex - 1;
        faces.push(apexIndex, prevBottomIdx, bottomIdx);
        faces.push(bottomCenterIndex, bottomIdx, prevBottomIdx);
      }
      currentVertex++;
    }
    return { vertices, faces };
  },

  _createOctagonalTop: function (radius, height, color, yOffset) {
    // ... (Kode _createOctagonalTop TIDAK BERUBAH dari jawaban sebelumnya) ...
    let vertices = [];
    let faces = [];
    const segments = 8;
    const angleStep = (Math.PI * 2) / segments;
    vertices.push(0, yOffset + height / 2, 0, ...color, 0.5, 0.5);
    let topCenterIndex = 0;
    vertices.push(0, yOffset - height / 2, 0, ...color, 0.5, 0.5);
    let bottomCenterIndex = 1;
    let currentVertexOffset = 2;
    for (let i = 0; i <= segments; i++) {
      let angle = i * angleStep;
      let x = Math.cos(angle) * radius;
      let z = Math.sin(angle) * radius;
      vertices.push(x, yOffset + height / 2, z, ...color, 0, 0); // Top ring
      vertices.push(x, yOffset - height / 2, z, ...color, 0, 0); // Bottom ring
      if (i > 0) {
        let topCurrent = currentVertexOffset;
        let bottomCurrent = currentVertexOffset + 1;
        let topPrev = currentVertexOffset - 2;
        let bottomPrev = currentVertexOffset - 1;
        faces.push(topCenterIndex, topPrev, topCurrent);
        faces.push(topPrev, bottomPrev, bottomCurrent);
        faces.push(topPrev, bottomCurrent, topCurrent);
        faces.push(bottomCenterIndex, bottomCurrent, bottomPrev);
      }
      currentVertexOffset += 2;
    }
    return { vertices, faces };
  },

  // ===================================================================
  // FUNGSI _createSpikes YANG DIPERBARUI UNTUK INNER SPIKES
  // ===================================================================
  _createSpikes: function (baseRadius, initialSpikeHeight, numSpikesOuter, color, yOffset) {
    let vertices = [];
    let faces = [];
    let currentVertexOffset = 0;

    // --- Parameter Cincin Duri ---
    const rings = [
      // Ring 1 (Paling Luar) - Paling tipis
      { placementRadius: baseRadius * 0.85, numSpikes: numSpikesOuter, height: initialSpikeHeight, spikeRadiusFactor: 0.1, angleOffset: 0 },
      // Ring 2 (Tengah) - Sedang
      { placementRadius: baseRadius * 0.45, numSpikes: numSpikesOuter / 2, height: initialSpikeHeight * 1.4, spikeRadiusFactor: 0.44, angleOffset: Math.PI / numSpikesOuter }, // <-- Radius lebih besar
      // Ring 3 (Paling Dalam) - Paling tebal
      { placementRadius: baseRadius * 0.1, numSpikes: 1, height: initialSpikeHeight * 1.7, spikeRadiusFactor: 0.55, angleOffset: 0 }, // <-- Radius paling besar
    ];

    for (const ring of rings) {
      const angleStep = (Math.PI * 2) / ring.numSpikes;
      const spikeRadius = baseRadius * ring.spikeRadiusFactor;

      for (let i = 0; i < ring.numSpikes; i++) {
        let angle = i * angleStep + ring.angleOffset; // Tambahkan offset sudut

        // Posisi XZ untuk spike ini
        let spikeX = Math.cos(angle) * ring.placementRadius;
        let spikeZ = Math.sin(angle) * ring.placementRadius;

        // 1. Buat geometri kerucut
        let coneGeom = this._createConeGeometry(spikeRadius, ring.height, 8, color, 0);

        // 2. Transformasi vertex kerucut
        for (let v = 0; v < coneGeom.vertices.length; v += 8) {
          // Stride = 8 (pos 3 + col 3 + uv 2)
          let x = coneGeom.vertices[v + 0];
          let y = coneGeom.vertices[v + 1];
          let z = coneGeom.vertices[v + 2];

          coneGeom.vertices[v + 0] = x + spikeX;
          coneGeom.vertices[v + 1] = -y + yOffset - ring.height / 2; // Balik dan posisikan
          coneGeom.vertices[v + 2] = z + spikeZ;
        }

        // 3. Tambahkan faces (dengan winding order terbalik)
        for (let f = 0; f < coneGeom.faces.length; f += 3) {
          faces.push(coneGeom.faces[f + 0] + currentVertexOffset);
          faces.push(coneGeom.faces[f + 2] + currentVertexOffset); // Balik
          faces.push(coneGeom.faces[f + 1] + currentVertexOffset); // Balik
        }

        // 4. Tambahkan vertices
        vertices.push(...coneGeom.vertices);

        // 5. Update offset
        currentVertexOffset = vertices.length / 8; // Stride = 8
      }
    }
    return { vertices, faces };
  },
  // ===================================================================
  // AKHIR FUNGSI YANG DIPERBARUI
  // ===================================================================

  createGeometry: function (baseRadius, baseHeight, spikeHeight, numSpikesOuter, baseColor, spikeColor, yPosition) {
    let combined_vertices = [];
    let combined_faces = [];
    let current_offset = 0;

    // 1. Buat Octagonal Top
    let topGeom = this._createOctagonalTop(baseRadius, baseHeight, baseColor, yPosition);
    combined_vertices.push(...topGeom.vertices);
    combined_faces.push(...topGeom.faces);
    current_offset = combined_vertices.length / 8;

    // 2. Buat Spikes (Kerucut) - Sekarang dengan multiple rings
    let spikeYBase = yPosition - baseHeight / 2;
    let spikesGeom = this._createSpikes(baseRadius, spikeHeight, numSpikesOuter, spikeColor, spikeYBase);

    spikesGeom.faces.forEach((faceIdx) => combined_faces.push(faceIdx + current_offset));
    combined_vertices.push(...spikesGeom.vertices);

    return { vertices: combined_vertices, faces: combined_faces };
  },

  // Parameter numSpikes diubah menjadi numSpikesOuter
  createSceneObject: function (GL, attribs, baseRadius, baseHeight, spikeHeight, numSpikesOuter, baseColor, spikeColor, yPosition) {
    // Parameter numSpikes diubah menjadi numSpikesOuter saat memanggil createGeometry
    const geom = this.createGeometry(baseRadius, baseHeight, spikeHeight, numSpikesOuter, baseColor, spikeColor, yPosition);

    return new SceneObject(
      GL,
      geom.vertices,
      geom.faces,
      attribs,
      "POS_COL_UV" // Layout: Position, Color, (dummy) UV
    );
  },
};
