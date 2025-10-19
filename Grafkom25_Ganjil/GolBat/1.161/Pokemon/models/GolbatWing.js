/*
 * GolbatWing.js
 * Versi modifikasi: Tepi atas Bezier, Tepi bawah MULTI-Bezier (cekung).
 * Membran dibuat DUA LAPIS (luar dan dalam) dengan warna berbeda. (Versi Lengkap FINAL)
 */
import { SceneObject } from "./SceneObject.js"; // Pastikan path ini benar
import { Node } from "./Node.js"; // Pastikan path ini benar

export class GolbatWing extends Node {
  constructor(GL, attribs) {
    super(); // Panggil konstruktor Node

    // =========================================================================
    // == PARAMETER SAYAP ==
    // =========================================================================

    // --- Warna ---
    const OUTER_COLOR = [60 / 255, 60 / 255, 124 / 255]; // Warna luar (Kulit Golbat)
    const INNER_COLOR = [170 / 255, 120 / 255, 200 / 255]; // Warna dalam (Pink/Ungu)
    const BONE_COLOR = [40 / 255, 40 / 255, 80 / 255]; // Warna tulang

    // --- Detail & Bentuk ---
    const TOTAL_POINTS = 26; // Total titik di sepanjang tepi atas/bawah (harus sama!)
    const TUBE_SEGMENTS = 6; // Jumlah segmen melingkar untuk tulang (tabung)
    const MEMBRANE_THICKNESS = 0.02; // Ketebalan membran (kecil saja, atau 0.0 jika Z-fighting)

    const BONE_THICKNESS = {
      top: [0.08, 0.05, 0.03], // Tulang lebih tipis [pangkal, tengah, ujung]
      bottom: [0.06, 0.04, 0.02], // Tulang lebih tipis [pangkal, tengah, ujung]
    };

    // --- Kurva Tulang Atas (Bezier - Gunakan hasil fine-tuning terakhir Anda) ---
    const topBoneCurveParts = [
      // Array of parts
      {
        // Part 1
        startPoint: [0.0, 0.0, 0.0],
        startHandle: [0.2, 1.8, -0.2],
        endPoint: [1.2, 1.3, -0.6],
        endHandle: [-0.6, 0.0, -0.1],
      },
      {
        // Part 2
        startPoint: [1.2, 1.3, -0.6],
        startHandle: [1.5, 0.1, -0.4],
        endPoint: [5.5, 0.9, -1.1],
        endHandle: [-1.0, -0.2, 0.1],
      },
    ];

    // --- Kurva Tepi Bawah (MULTI-Bezier - SESUAIKAN HANDLE UNTUK LEKUKAN!) ---
    // Definisikan sebagai serangkaian segmen yang menyambung
    const bottomBoneSegments = [
      {
        // Segmen 1: Pangkal ke Lekukan 1
        startPoint: [0.0, 0.0, 0.0],
        startHandle: [0.4, -0.8, -0.3], // Handle keluar ke bawah
        endPoint: [1.0, -1.7, -0.6], // Titik lekukan 1
        endHandle: [-0.3, 0.3, 0.05], // Handle masuk (pengaruh lekukan ke dalam)
      },
      {
        // Segmen 2: Lekukan 1 ke Puncak Antara
        startPoint: [1.0, -1.7, -0.6], // Sama dengan endPoint segmen 1
        startHandle: [0.4, -0.4, -0.2], // Handle keluar (melanjutkan lekukan ke dalam)
        endPoint: [2.5, -1.0, -0.9], // Titik puncak antara
        endHandle: [-0.5, 0.2, -0.1], // Handle masuk
      },
      {
        // Segmen 3: Puncak Antara ke Lekukan 2
        startPoint: [2.5, -1.0, -0.9], // Sama dengan endPoint segmen 2
        startHandle: [0.6, -0.3, -0.1], // Handle keluar ke bawah lagi
        endPoint: [3.8, -1.4, -1.0], // Titik lekukan 2
        endHandle: [-0.3, 0.4, 0.0], // Handle masuk mengarah ke atas
      },
      {
        // Segmen 4: Lekukan 2 ke Ujung
        startPoint: [3.8, -1.4, -1.0], // Sama dengan endPoint segmen 3
        startHandle: [0.8, 0.6, 0.0], // Handle keluar mengarah ke ujung
        endPoint: [5.5, 0.9, -1.1], // Ujung (sama dengan ujung atas)
        endHandle: [-0.8, 0.0, 0.2], // Handle masuk
      },
    ];

    // Array untuk data geometri gabungan (langsung diisi oleh fungsi helper)
    this.vertices = [];
    this.faces = [];

    // ======================== PEMBUATAN MESH =========================

    // 1. Buat Centerline Atas (dari Bezier parts)
    const topCenterline = this._generateCenterline(
      topBoneCurveParts.map((p) => this._getBezierControlPoints(p)),
      TOTAL_POINTS // Total titik yang diinginkan
    );

    // 2. Buat Centerline Bawah (dari Bezier segments)
    const bottomCenterline = this._generateCenterline(
      bottomBoneSegments.map((p) => this._getBezierControlPoints(p)),
      TOTAL_POINTS // Jumlah titik HARUS SAMA dengan atas
    );

    // 3. Buat Tulang (Tabung Tipis)
    this._generateTube(topCenterline, TUBE_SEGMENTS, BONE_THICKNESS.top, BONE_COLOR);
    this._generateTube(bottomCenterline, TUBE_SEGMENTS, BONE_THICKNESS.bottom, BONE_COLOR);

    // 4. Buat Membran Dua Lapis
    this._generateDoubleSidedMembrane(topCenterline, bottomCenterline, OUTER_COLOR, INNER_COLOR, MEMBRANE_THICKNESS);

    // 5. Buat SceneObject
    // Menggunakan constructor SceneObject yang sudah dimodifikasi (GL, vertices, faces, attribs)
    const sceneObj = new SceneObject(GL, this.vertices, this.faces, attribs);
    this.setGeometry(sceneObj); // Set geometri untuk Node ini

    // Atur matriks lokal (posisi/rotasi/skala) di main.js
  }

  // ======================== FUNGSI HELPER =========================

  // --- Fungsi _generateCenterline DIMODIFIKASI ---
  _generateCenterline(bezierSegmentsCPs, totalPoints) {
    if (bezierSegmentsCPs.length === 0 || totalPoints < 2) return [];

    const centerline = [];
    const numSegments = bezierSegmentsCPs.length;

    // Hitung perkiraan panjang setiap segmen (chord length approximation)
    const segmentLengths = bezierSegmentsCPs.map((cp) => {
      const p0 = cp[0];
      const p3 = cp[3];
      const dx = p3[0] - p0[0];
      const dy = p3[1] - p0[1];
      const dz = p3[2] - p0[2];
      return Math.sqrt(dx * dx + dy * dy + dz * dz); // Panjang garis lurus antar endpoint
    });
    const totalCurveLength = segmentLengths.reduce((sum, len) => sum + len, 0);

    if (totalCurveLength < 1e-6) {
      // Jika panjang total ~0
      for (let i = 0; i < totalPoints; ++i) centerline.push([...bezierSegmentsCPs[0][0]]);
      return centerline;
    }

    // Alokasikan jumlah titik per segmen secara proporsional
    let pointsAllocated = 0;
    const pointsPerSegment = segmentLengths.map((len, i) => {
      if (i === numSegments - 1) {
        // Segmen terakhir ambil sisa
        return Math.max(1, totalPoints - 1 - pointsAllocated); // Minimal 1 titik (-1 karena titik awal sudah dihitung)
      }
      const proportion = len / totalCurveLength;
      // Alokasi titik (-1 karena titik akhir bersama)
      const num = Math.max(1, Math.round(proportion * (totalPoints - 1)));
      pointsAllocated += num;
      return num;
    });

    // Koreksi jika alokasi total tidak pas (karena pembulatan)
    let currentTotalAllocated = pointsPerSegment.reduce((sum, num) => sum + num, 0);
    let diff = totalPoints - 1 - currentTotalAllocated;
    let k = 0;
    while (diff !== 0) {
      if (diff > 0) {
        // Kurang alokasi, tambahkan ke segmen terpanjang dulu (approx)
        let longestIdx = segmentLengths.indexOf(Math.max(...segmentLengths)); // Cari indeks segmen terpanjang
        pointsPerSegment[longestIdx]++;
        diff--;
      } else {
        // Kelebihan alokasi, kurangi dari segmen terpendek (yang > 1) dulu
        let shortestIdx = -1;
        let minLen = Infinity;
        for (let segIdx = 0; segIdx < numSegments; ++segIdx) {
          if (pointsPerSegment[segIdx] > 1 && segmentLengths[segIdx] < minLen) {
            minLen = segmentLengths[segIdx];
            shortestIdx = segIdx;
          }
        }
        if (shortestIdx !== -1) {
          pointsPerSegment[shortestIdx]--;
          diff++;
        } else {
          // Jika semua segmen hanya punya 1 titik, paksa kurangi dari yg terakhir > 1
          for (let segIdx = numSegments - 1; segIdx >= 0; --segIdx) {
            if (pointsPerSegment[segIdx] > 1) {
              pointsPerSegment[segIdx]--;
              diff++;
              break;
            }
          }
        }
      }
      // Safety break
      if (k++ > totalPoints) {
        console.error("Allocation correction loop failed");
        break;
      }
    }

    // Generate titik untuk setiap segmen
    centerline.push([...bezierSegmentsCPs[0][0]]); // Titik awal selalu masuk
    for (let i = 0; i < numSegments; i++) {
      const controlPoints = bezierSegmentsCPs[i];
      const numPointsInThisSegment = pointsPerSegment[i];
      // Mulai dari j=1 karena titik awal sudah ditambahkan (atau titik akhir segmen sebelumnya)
      for (let j = 1; j <= numPointsInThisSegment; j++) {
        const t = j / numPointsInThisSegment;
        centerline.push(this._getPointOnBezierCurve(controlPoints, t));
      }
    }
    // Pastikan jumlah titik pas di akhir (jarang diperlukan tapi sbg pengaman)
    if (centerline.length > totalPoints) centerline.length = totalPoints;
    while (centerline.length < totalPoints) centerline.push([...bezierSegmentsCPs[numSegments - 1][3]]);

    return centerline;
  }

  // --- Fungsi _generateDoubleSidedMembrane (Kembali Aktif) ---
  _generateDoubleSidedMembrane(centerline1, centerline2, outerColor, innerColor, thickness) {
    if (centerline1.length !== centerline2.length) {
      console.error("Membrane centerlines must have the same length.");
      return;
    }

    const baseVertexIndexOuter = Math.floor(this.vertices.length / 9); // Indeks awal lapis luar
    const numPoints = centerline1.length;
    const halfThickness = thickness / 2.0;

    // --- Buat Vertex Lapis Luar ---
    for (let i = 0; i < numPoints; i++) {
      const p1 = centerline1[i]; // Atas
      const p2 = centerline2[i]; // Bawah

      // Hitung normal
      const vecMembrane = this._subtractVectors(p1, p2);
      let vecForward = i < numPoints - 1 ? this._subtractVectors(centerline1[i + 1], p1) : this._subtractVectors(p1, centerline1[i - 1]);
      let normal = this._normalizeVector(this._crossProduct(vecMembrane, vecForward));
      if (normal[2] > 0) {
        normal = this._scaleVector(normal, -1.0);
      } // Pastikan menghadap keluar (Z negatif)

      const outerOffset = this._scaleVector(normal, halfThickness);

      // Tambahkan vertex atas dan bawah untuk lapis luar
      const p1_outer = this._addVectors(p1, outerOffset);
      this.vertices.push(p1_outer[0], p1_outer[1], p1_outer[2], ...outerColor, ...normal);
      const p2_outer = this._addVectors(p2, outerOffset);
      this.vertices.push(p2_outer[0], p2_outer[1], p2_outer[2], ...outerColor, ...normal);
    }

    const baseVertexIndexInner = Math.floor(this.vertices.length / 9); // Indeks awal lapis dalam

    // --- Buat Vertex Lapis Dalam ---
    for (let i = 0; i < numPoints; i++) {
      const p1 = centerline1[i]; // Atas
      const p2 = centerline2[i]; // Bawah

      // Hitung normal (sama seperti luar, tapi dibalik)
      const vecMembrane = this._subtractVectors(p1, p2);
      let vecForward = i < numPoints - 1 ? this._subtractVectors(centerline1[i + 1], p1) : this._subtractVectors(p1, centerline1[i - 1]);
      let normal = this._normalizeVector(this._crossProduct(vecMembrane, vecForward));
      if (normal[2] > 0) {
        normal = this._scaleVector(normal, -1.0);
      }
      const innerNormal = this._scaleVector(normal, -1.0); // Normal dibalik
      const innerOffset = this._scaleVector(innerNormal, halfThickness);

      // Tambahkan vertex atas dan bawah untuk lapis dalam
      const p1_inner = this._addVectors(p1, innerOffset);
      this.vertices.push(p1_inner[0], p1_inner[1], p1_inner[2], ...innerColor, ...innerNormal);
      const p2_inner = this._addVectors(p2, innerOffset);
      this.vertices.push(p2_inner[0], p2_inner[1], p2_inner[2], ...innerColor, ...innerNormal);
    }

    // --- Buat Faces ---
    for (let i = 0; i < numPoints - 1; i++) {
      // Indeks Lapis Luar
      const otl = baseVertexIndexOuter + i * 2 + 0; // Outer Top Left
      const obl = baseVertexIndexOuter + i * 2 + 1; // Outer Bottom Left
      const otr = otl + 2; // Outer Top Right
      const obr = obl + 2; // Outer Bottom Right

      // Faces Luar (CCW dari luar)
      this.faces.push(otl, obl, otr);
      this.faces.push(obl, obr, otr);

      // Indeks Lapis Dalam
      const itl = baseVertexIndexInner + i * 2 + 0; // Inner Top Left
      const ibl = baseVertexIndexInner + i * 2 + 1; // Inner Bottom Left
      const itr = itl + 2; // Inner Top Right
      const ibr = ibl + 2; // Inner Bottom Right

      // --- Faces Dalam (CCW dari dalam -> CW dari luar) ---
      this.faces.push(itl, itr, ibl); // Dibalik urutannya
      this.faces.push(ibl, itr, ibr); // Dibalik urutannya
    }
  }

  // --- Fungsi helper lain ---
  _getBezierControlPoints(curvePart) {
    const p0 = curvePart.startPoint;
    const p3 = curvePart.endPoint;
    const p1 = [p0[0] + curvePart.startHandle[0], p0[1] + curvePart.startHandle[1], p0[2] + curvePart.startHandle[2]];
    const p2 = [p3[0] + curvePart.endHandle[0], p3[1] + curvePart.endHandle[1], p3[2] + curvePart.endHandle[2]];
    return [p0, p1, p2, p3];
  }
  _getPointOnBezierCurve(controlPoints, t) {
    const [p0, p1, p2, p3] = controlPoints;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    const c0 = mt2 * mt;
    const c1 = 3 * mt2 * t;
    const c2 = 3 * mt * t2;
    const c3 = t2 * t;
    const x = c0 * p0[0] + c1 * p1[0] + c2 * p2[0] + c3 * p3[0];
    const y = c0 * p0[1] + c1 * p1[1] + c2 * p2[1] + c3 * p3[1];
    const z = c0 * p0[2] + c1 * p1[2] + c2 * p2[2] + c3 * p3[2];
    return [x, y, z];
  }
  _subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }
  _addVectors(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }
  _scaleVector(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
  }
  _normalizeVector(v) {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return len > 1e-6 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
  }
  _crossProduct(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  _generateTube(path, tubeSegments, thicknessProfile, color) {
    if (path.length < 2) return;
    const baseVertexIndex = Math.floor(this.vertices.length / 9);
    const vertexCount = path.length;
    for (let i = 0; i < vertexCount; i++) {
      const point = path[i];
      const t = vertexCount > 1 ? i / (vertexCount - 1) : 0;
      let currentThickness;
      if (Array.isArray(thicknessProfile)) {
        if (t < 0.5) currentThickness = thicknessProfile[0] * (1.0 - t * 2.0) + thicknessProfile[1] * (t * 2.0);
        else currentThickness = thicknessProfile[1] * (1.0 - (t - 0.5) * 2.0) + thicknessProfile[2] * ((t - 0.5) * 2.0);
      } else {
        currentThickness = thicknessProfile;
      }
      let tangent;
      if (i === 0) tangent = this._subtractVectors(path[1], point);
      else if (i === vertexCount - 1) tangent = this._subtractVectors(point, path[i - 1]);
      else tangent = this._normalizeVector(this._addVectors(this._subtractVectors(path[i + 1], point), this._subtractVectors(point, path[i - 1])));
      tangent = this._normalizeVector(tangent);
      const upApprox = Math.abs(tangent[1]) > 0.99 ? [1, 0, 0] : [0, 1, 0];
      const normal = this._normalizeVector(this._crossProduct(tangent, upApprox));
      const binormal = this._normalizeVector(this._crossProduct(tangent, normal));
      for (let j = 0; j <= tubeSegments; j++) {
        const angle = (j / tubeSegments) * 2 * Math.PI;
        const offset = this._addVectors(this._scaleVector(normal, Math.cos(angle) * currentThickness), this._scaleVector(binormal, Math.sin(angle) * currentThickness));
        const vertexPos = this._addVectors(point, offset);
        const vertexNormal = this._normalizeVector(offset);
        this.vertices.push(vertexPos[0], vertexPos[1], vertexPos[2], ...color, vertexNormal[0], vertexNormal[1], vertexNormal[2]);
      }
    }
    for (let i = 0; i < vertexCount - 1; i++) {
      for (let j = 0; j < tubeSegments; j++) {
        const idx1 = baseVertexIndex + i * (tubeSegments + 1) + j;
        const idx2 = baseVertexIndex + (i + 1) * (tubeSegments + 1) + j;
        const idx3 = idx1 + 1;
        const idx4 = idx2 + 1;
        this.faces.push(idx1, idx2, idx3);
        this.faces.push(idx2, idx4, idx3);
      }
    }
  }
} // Akhir kelas GolbatWing
