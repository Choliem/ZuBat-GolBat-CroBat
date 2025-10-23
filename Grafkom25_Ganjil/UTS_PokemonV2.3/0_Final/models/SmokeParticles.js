// models/SmokeParticles.js

import { SceneObject } from "./SceneObject.js";
import { Node } from "./Node.js";

export const SmokeParticles = {
  // Properti untuk menyimpan data sistem
  globalSmokeRootNode: null,
  particleData: [],
  smokeParticleGeom: null,

  // Konstanta
  PARTICLE_MAX_LIFE: 8000, // Hidup 8 detik
  PARTICLE_FADE_START_TIME: 0.7, // Mulai menghilang di 70% sisa hidup
  LERP: (a, b, t) => a + (b - a) * t, // Helper LERP

  /**
   * (Pribadi) Membuat tekstur asap secara dinamis
   */
  _createSmokeTexture: function (GL) {
    var texture = GL.createTexture();
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 64;
    canvas.height = 64;

    var gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(200, 200, 200, 1.0)");
    gradient.addColorStop(0.5, "rgba(180, 180, 180, 0.5)");
    gradient.addColorStop(1, "rgba(150, 150, 150, 0.0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    GL.bindTexture(GL.TEXTURE_2D, texture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, canvas);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.generateMipmap(GL.TEXTURE_2D);
    GL.bindTexture(GL.TEXTURE_2D, null);
    return texture;
  },

  /**
   * (Pribadi) Membuat geometri quad untuk satu partikel
   */
  _createSmokeGeometry: function (GL, attribs, texture) {
    const particleSize = 100;
    const smokeVertices = [
      -particleSize, -particleSize, 0, 0, 0,
       particleSize, -particleSize, 0, 1, 0,
       particleSize,  particleSize, 0, 1, 1,
      -particleSize,  particleSize, 0, 0, 1,
    ];
    const smokeFaces = [0, 1, 2, 0, 2, 3];

    return new SceneObject(
      GL,
      smokeVertices,
      smokeFaces,
      attribs,
      "POS_UV", // Penting: Layout ini menggunakan tekstur & non-lit
      texture,
      GL.TRIANGLES
    );
  },

  /**
   * (Pribadi) Me-reset status partikel (saat mati / awal)
   */
  _resetParticle: function (particle) {
    const { baseX, baseY, baseZ, craterRadius } = particle.baseInfo;

    particle.life = Math.random() * this.PARTICLE_MAX_LIFE;
    particle.maxLife = this.PARTICLE_MAX_LIFE * (0.8 + Math.random() * 0.4);

    let angle = Math.random() * Math.PI * 2;
    let radius = Math.random() * craterRadius;
    particle.startX = baseX + Math.cos(angle) * radius;
    particle.startY = baseY;
    particle.startZ = baseZ + Math.sin(angle) * radius;

    particle.velocityY = 40 + Math.random() * 20;
    particle.velocityX = (Math.random() - 0.5) * 15;
    particle.velocityZ = (Math.random() - 0.5) * 15;

    particle.baseScale = 1.0 + Math.random() * 0.8;
  },

  /**
   * (Publik) Inisialisasi seluruh sistem partikel.
   * craterInfos adalah array: [{ pos: {x,y,z}, radius, count }, ...]
   */
  init: function (GL, attribs, craterInfos) {
    // 1. Buat aset bersama (tekstur dan geometri)
    const smokeTexture = this._createSmokeTexture(GL);
    this.smokeParticleGeom = this._createSmokeGeometry(GL, attribs, smokeTexture);

    // 2. Siapkan data dan node induk
    this.globalSmokeRootNode = new Node();
    this.particleData = [];

    // 3. Buat partikel untuk setiap kawah
    for (const info of craterInfos) {
      const { pos, radius, count } = info;
      
      for (let i = 0; i < count; i++) {
        let node = new Node();
        node.setGeometry(this.smokeParticleGeom); // Bagikan geometri
        this.globalSmokeRootNode.add(node);

        let particleState = {
          node: node,
          baseInfo: { // Info statis
            baseX: pos.x,
            baseY: pos.y,
            baseZ: pos.z,
            craterRadius: radius,
          },
        };
        this._resetParticle(particleState); // Panggil reset awal
        this.particleData.push(particleState);
      }
    }

    // Kembalikan node induk agar bisa digambar di main.js
    return this.globalSmokeRootNode;
  },

  /**
   * (Publik) Dipanggil setiap frame dari animate() di main.js
   */
  update: function (dt, THETA, PHI) {
    if (!this.particleData) return; // Belum siap

    for (const particle of this.particleData) {
      particle.life += dt;

      // 1. Reset jika partikel "mati"
      if (particle.life > particle.maxLife) {
        this._resetParticle(particle);
        particle.life = 0;
      }

      let progress = particle.life / particle.maxLife;

      // 2. Hitung Posisi
      let timeInSeconds = particle.life / 1000.0;
      let posX = particle.startX + particle.velocityX * timeInSeconds;
      let posY = particle.startY + particle.velocityY * timeInSeconds;
      let posZ = particle.startZ + particle.velocityZ * timeInSeconds;

      // 3. Hitung Skala (Fade-out)
      let currentScale = particle.baseScale;
      if (progress > this.PARTICLE_FADE_START_TIME) {
        let fadeProgress =
          (progress - this.PARTICLE_FADE_START_TIME) /
          (1.0 - this.PARTICLE_FADE_START_TIME);
        currentScale = this.LERP(particle.baseScale, 0.0, fadeProgress);
      }

      // 4. Terapkan Matriks (Translasi + Billboarding + Skala)
      let m = particle.node.localMatrix;
      LIBS.set_I4(m);
      LIBS.translateX(m, posX);
      LIBS.translateY(m, posY);
      LIBS.translateZ(m, posZ);
      
      // Billboarding
      LIBS.rotateY(m, THETA);
      LIBS.rotateX(m, PHI);
      
      LIBS.scale(m, currentScale, currentScale, currentScale);
    }
  },
};