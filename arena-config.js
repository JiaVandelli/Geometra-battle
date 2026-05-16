/* ╔═══════════════════════════════════════════════════════════════╗
   ║               ARENA CONFIG — MODIFICA SOLO QUI               ║
   ║  Il core engine (battle.html) non va mai toccato.            ║
   ║  Ogni power ha onFire(o, ctx) — scrivi la logica lì dentro.  ║
   ╚═══════════════════════════════════════════════════════════════╝ */

export const CONFIG = {

  /* ─── FISICA ARENA ─────────────────────────────────────────── */
  arena: {
    radius:      8,       // raggio ring circolare
    gravity:    -30,      // più negativo = cade prima
    friction:    0.035,
    restitution: 0.82,    // rimbalzo (0–1)
  },

  /* ─── CAMERA ────────────────────────────────────────────────── */
  camera: {
    fov:          58,
    orbitRadius:  24,
    orbitSpeed:   0.0042, // rad/frame (a 60fps)
    orbitBob:     2.5,    // oscillazione verticale
    height:       14,
  },

  /* ─── ROUND ─────────────────────────────────────────────────── */
  round: {
    winSlowMo:     0.12,  // slow-motion alla vittoria
    winDuration:   5,     // secondi prima del round successivo
    introDuration: 3200,  // ms prima che sparisca l'intro
  },

  /* ─── ORB FISICA ─────────────────────────────────────────────── */
  orb: {
    radius:         0.58,
    mass:           3,
    linearDamping:  0.055,
    baseSpeed:      7.2,
    buffSpeed:      12,
    heavySpeed:     4.4,    // velocità se scale > 1.3 (power HIVE)
    dashPower:      17,
    buffDashPow:    22,
    heavyDashPower: 10,
    dashCooldown:   1.15,
    dashRandExtra:  0.7,
    noEdgeDash:     6.0,    // no dash se radiale > questo
    edgeAvoidFrom:  4.6,    // avoidance attiva da qui
  },

  /* ─── SPAWN POSITIONS ───────────────────────────────────────── */
  /*  Aggiungi coppie [x, z] per più giocatori.
      Stai nella circonferenza (|x|²+|z|² < radius²).          */
  spawns: [
  [-4.8, 0],
  [ 4.8, 0],
],

  /* ─── GIOCATORI ─────────────────────────────────────────────── */
  /*  name    → etichetta UI
      color   → colore esadecimale 0xRRGGBB
      power   → chiave in CONFIG.powers
      cd      → cooldown in secondi                              */
  players: [
  { 
    name:'ILLUSORE', 
    color:0xdd44ff, 
    power:'mirage', 
    cd:3.0 
  },

  { 
    name:'BATTERIO', 
    color:0x66ff99, 
    power:'hive', 
    cd:3.4 
  },
],

  /* ─── POWERS ────────────────────────────────────────────────── */
  /*  Ogni power DEVE avere:
        label   → testo UI  (emoji + nome)
        color   → colore testo evento
        onFire  → function(o, ctx) — logica eseguita all'attivazione

      ctx contiene:
        THREE, CANNON, scene, world, camera
        orbs, minions, particles, effects
        showEvent(text, color)
        doFlash(color, intensity)
        cameraShake(strength)
        burst(pos, color, count, force)
        spawnMinion(owner, cfg)
        hex(colorInt)
        CONFIG                                                     */
  powers: {

    /* ── EXPLOSION: spinge tutti via in modo radiale ── */
    explosion: {
      label:       '💥 EXPLOSION',
      color:       '#ff3355',
      pushForce:   18,
      maxForce:    26,
      pushY:       0.4,
      minionForce: 22,
      onFire(o, ctx) {
        const { showEvent, doFlash, cameraShake, burst, scene, THREE, orbs, minions } = ctx;
        showEvent(this.label, this.color);
        doFlash('#ff3355', 0.55);
        cameraShake(0.8);
        burst(o.body.position.clone(), ctx.CONFIG.players[o.id].color, 50, 12);

        /* shockwave ring */
        const sw = new THREE.Mesh(
          new THREE.TorusGeometry(0.3, 0.14, 8, 40),
          new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0.95 })
        );
        sw.rotation.x = Math.PI / 2;
        sw.position.copy(o.body.position);
        scene.add(sw);
        let swL = 0.45;
        ctx.effects.push({ update(dt) {
          swL -= dt;
          if (swL <= 0) { scene.remove(sw); return false; }
          const s = 1 + (0.45 - swL) * 44;
          sw.scale.set(s, s, s);
          sw.material.opacity = swL * 2;
          return true;
        }});

        /* radial push */
        orbs.forEach(t => {
          if (!t.alive || t === o) return;
          const dx = t.body.position.x - o.body.position.x;
          const dz = t.body.position.z - o.body.position.z;
          let d = Math.hypot(dx, dz); if (d < 0.1) d = 0.1;
          const f = Math.min(this.maxForce, this.pushForce / d);
          t.body.velocity.x += (dx / d) * f;
          t.body.velocity.z += (dz / d) * f;
          t.body.velocity.y += this.pushY + Math.random() * 0.5;
        });
        minions.forEach(mn => {
          if (!mn.alive) return;
          const dx = mn.body.position.x - o.body.position.x;
          const dz = mn.body.position.z - o.body.position.z;
          let d = Math.hypot(dx, dz); if (d < 0.1) d = 0.1;
          mn.body.velocity.x += (dx / d) * this.minionForce;
          mn.body.velocity.z += (dz / d) * this.minionForce;
        });
      }
    },

    /* ── MINION: spawna un alleato che insegue i nemici ── */
    minion: {
      label:       '🤖 MINION',
      color:       '#3388ff',
      maxMinions:  3,
      minionRadius:0.28,
      minionMass:  0.8,
      minionLife:  20,
      minionSpeed: 9,
      onFire(o, ctx) {
        const { showEvent, spawnMinion, minions } = ctx;
        showEvent(this.label, this.color);
        const mine = minions.filter(m => m.alive && m.owner === o);
        if (mine.length < this.maxMinions) {
          spawnMinion(o, {
            minionRadius: this.minionRadius,
            minionMass:   this.minionMass,
            minionLife:   this.minionLife,
            minionSpeed:  this.minionSpeed,
          });
        }
      }
    },

    /* ── GHOST: invisibile + veloce ── */
    ghost: {
      label:    '👻 GHOST RUSH',
      color:    '#33ff88',
      invisDur: 4,
      buffDur:  4,
      onFire(o, ctx) {
        ctx.showEvent(this.label, this.color);
        o.invis = this.invisDur;
        o.buff  = this.buffDur;
      }
    },

    /* ── BLACKHOLE: punto di gravità che risucchia tutti ── */
    blackhole: {
      label:       '🕳️ BLACKHOLE',
      color:       '#dd44ff',
      duration:    2.2,
      pullForce:   30,
      pullFalloff: 10,
      centerBias:  0.25,  // 0 = spawna su VIOLA, 1 = al centro
      onFire(o, ctx) {
        const { showEvent, doFlash, cameraShake, scene, THREE, orbs, minions, effects } = ctx;
        showEvent(this.label, this.color);
        doFlash('#dd44ff', 0.38);
        cameraShake(0.5);

        const bhPos = new THREE.Vector3(
          o.body.position.x * (1 - this.centerBias),
          1.5,
          o.body.position.z * (1 - this.centerBias)
        );

        const bh = new THREE.Mesh(
          new THREE.SphereGeometry(0.45, 24, 24),
          new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        bh.position.copy(bhPos);
        scene.add(bh);

        const r1 = new THREE.Mesh(
          new THREE.TorusGeometry(1, 0.09, 8, 40),
          new THREE.MeshBasicMaterial({ color: 0xcc44ff, transparent: true, opacity: 0.85 })
        );
        r1.rotation.x = Math.PI / 2;
        bh.add(r1);

        const r2 = new THREE.Mesh(
          new THREE.TorusGeometry(1.7, 0.05, 8, 40),
          new THREE.MeshBasicMaterial({ color: 0x8800aa, transparent: true, opacity: 0.5 })
        );
        r2.rotation.x = Math.PI / 2;
        bh.add(r2);

        const pl = new THREE.PointLight(0xcc00ff, 3.5, 10);
        bh.add(pl);

        let life = this.duration;
        const pf = this.pullForce, pfalloff = this.pullFalloff;

        effects.push({ update(dt) {
          life -= dt;
          if (life <= 0) { scene.remove(bh); return false; }
          bh.rotation.y += dt * 3.5;
          r1.rotation.z += dt * 5;
          r2.rotation.z -= dt * 3;
          ;[...orbs, ...minions].forEach(t => {
            if (!t.alive) return;
            const dx = bhPos.x - t.body.position.x;
            const dz = bhPos.z - t.body.position.z;
            const dist = Math.max(0.6, Math.hypot(dx, dz));
            const f = (pfalloff / dist) * dt;
            t.body.velocity.x += (dx / dist) * f * pf;
            t.body.velocity.z += (dz / dist) * f * pf;
          });
          return true;
        }});
      }
    },

    /* ════════════════════════════════════════════════════════════
       POTERI EXTRA — decommenta o aggiungine di nuovi

       ── MIRAGE SHIFT: swap + clone fantasma ──
    mirage: {
      label: '🟣 MIRAGE SHIFT', color: '#dd44ff',
      cloneOpacity: 0.22, swapChance: 0.55,
      onFire(o, ctx) {
        const { showEvent, doFlash, cameraShake, burst, scene, THREE } = ctx;
        showEvent(this.label, this.color);
        doFlash('#ff88ff', 0.35); cameraShake(0.4);
        if (!o.clone) {
          const mat = new THREE.MeshStandardMaterial({ color:0xdd44ff, emissive:0xdd44ff, transparent:true, opacity:this.cloneOpacity });
          o.clone = new THREE.Mesh(new THREE.SphereGeometry(0.58,24,24), mat);
          o.clone.position.copy(o.body.position);
          o.clone.position.x += 2.8;
          scene.add(o.clone);
        }
        if (Math.random() < this.swapChance) {
          const tmp = o.body.position.clone();
          o.body.position.copy(o.clone.position);
          o.body.velocity.set(0,0,0);
          o.clone.position.copy(tmp);
          burst(o.body.position, 0xdd44ff, 20, 6);
        }
        o.buff = 1.2;
      }
    },

       ── HIVE MASS: spawna minion, oppure li assorbe per ingrandirsi ──
    hive: {
      label: '🦠 HIVE MASS', color: '#66ff99',
      maxMinions:7, minionRadius:0.24, minionMass:0.55, minionLife:22, minionSpeed:8.5,
      absorbScaleGain:0.08, absorbMassGain:0.4, maxScale:2.2,
      onFire(o, ctx) {
        const { showEvent, spawnMinion, minions, scene, world, burst } = ctx;
        showEvent(this.label, this.color);
        const mine = minions.filter(m => m.alive && m.owner === o);
        if (mine.length < this.maxMinions) {
          spawnMinion(o, { minionRadius:this.minionRadius, minionMass:this.minionMass, minionLife:this.minionLife, minionSpeed:this.minionSpeed });
        } else if ((o.scale||1) < this.maxScale) {
          mine.slice(0,2).forEach(m => { m.alive=false; scene.remove(m.mesh); world.removeBody(m.body); });
          o.scale = (o.scale||1) + this.absorbScaleGain;
          o.mesh.scale.setScalar(o.scale);
          o.body.mass += this.absorbMassGain;
          o.body.updateMassProperties();
          burst(o.body.position, 0x66ff99, 30, 8);
        }
      }
    },

    ════════════════════════════════════════════════════════════ */
  },

  /* ─── VISUAL ────────────────────────────────────────────────── */
  visual: {
    bgColor:          0x020008,
    fogColor:         0x12001c,
    fogDensity:       0.024,
    floorColor:       0x140018,
    floorEmissive:    0xaa00ff,
    floorEmissiveInt: 0.32,
    rimColor:         0xdd00ff,
    dangerColor:      0xff0044,
    vortex1Color:     0xcc44ff,
    vortex2Color:     0x8800aa,
    starCount:        5000,
    starSize:         0.38,
  },

};
