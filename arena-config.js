/* ╔═══════════════════════════════════════════════════════════════╗
   ║ ARENA CONFIG — v3.5 NO-ORBIT FIX ║
   ╚═══════════════════════════════════════════════════════════════╝ */

export const CONFIG = {
  arena: {
    radius: 8,
    gravity: -60,
    friction: 0.05,
    restitution: 0.42,
    shrinkAfter: 12,
    shrinkTo: 4.8,
  },
  camera: { fov: 58, orbitRadius: 24, orbitSpeed: 0.0042, orbitBob: 2.5, height: 14 },
  round: { winSlowMo: 0.12, winDuration: 4, introDuration: 3200 },
  orb: {
    radius: 0.58,
    mass: 6.2,
    linearDamping: 0.06,
    angularDamping: 0.98,
    angularFactor: 0,
    shape: 'sphere',
    baseSpeed: 18.0,     // era 13.5 — più spinta
    buffSpeed: 22.0,     // era 16.0
    heavySpeed: 15.0,    // era 11.0
    dashPower: 32,
    buffDashPow: 36,
    heavyDashPower: 30,
    dashCooldown: 0.55,
    dashRandExtra: 0.15,
    noEdgeDash: 7.95,    // era 7.8
    edgeAvoidFrom: 7.95, // era 7.6 — <— FIX PRINCIPALE
  },

  spawns: [ [-4.8, 0], [4.8, 0] ],

  players: [
    { name: 'ILLUSORE', color: 0xdd44ff, power: 'mirage', cd: 4.2 },
    { name: 'BATTERIO', color: 0x66ff99, power: 'hive', cd: 4.2 },
  ],

  powers: {
    mirage: {
      label: '🟣 PHASE WALK',
      color: '#dd44ff',
      cloneOpacity: 0.22,
      cloneDistance: 4.5,
      onFire(o, ctx) {
        const { THREE, scene, burst, showEvent, doFlash, cameraShake, effects, orbs } = ctx;
        showEvent(this.label, this.color);
        doFlash('#ff88ff', 0.28);
        cameraShake(0.25);

        const safeClonePos = (centerPos) => {
          const angle = Math.random() * Math.PI * 2;
          const dist = 4.5;
          const x = centerPos.x + Math.cos(angle) * dist;
          const z = centerPos.z + Math.sin(angle) * dist;
          const len = Math.sqrt(x*x + z*z);
          const maxR = 6.5;
          if (len > maxR) {
            const s = maxR / len;
            return new THREE.Vector3(x * s, centerPos.y, z * s);
          }
          return new THREE.Vector3(x, centerPos.y, z);
        };

        if (!o.clone) {
          const mat = new THREE.MeshStandardMaterial({ color: 0xdd44ff, emissive: 0xdd44ff, transparent: true, opacity: this.cloneOpacity });
          o.clone = new THREE.Mesh(new THREE.SphereGeometry(0.58, 24, 24), mat);
          o.clone.position.copy(safeClonePos(o.body.position));
          scene.add(o.clone);
          o.passiveTimer = 0;
        }

        if(!o.intangible){
          const pos = o.body.position.clone();
          const near = orbs.filter(x=>x.alive&&x!==o&&pos.distanceTo(x.body.position)<2.5);
          near.forEach(e=>{ e.stun=0.35; });
          burst(o.body.position, 0xdd44ff, 15, 5);
        }

        o.intangible = true;
        o.mesh.material.opacity = 0.35;
        o.mesh.material.transparent = true;
        burst(o.body.position, 0xdd44ff, 22, 7);

        effects.push({ update(dt){
          o.intangibleTime = (o.intangibleTime||0)+dt;
          if(o.intangibleTime >= 1.2){
            o.mesh.material.opacity = 1;
            o.intangible = false;
            o.intangibleTime = 0;
            o.buff = 1.2;
            setTimeout(()=>{ o.buff=1; }, 1000);
            return false;
          }
          return true;
        }});

        if(!o.miragePassive){
          o.miragePassive = true;
          effects.push({ update(dt){
            if(!o.alive) return false;
            o.passiveTimer += dt;
            if(o.passiveTimer >= 4.0){
              o.passiveTimer = 0;
              if(o.clone){
                const tmp = o.body.position.clone();
                o.body.position.copy(o.clone.position);
                o.clone.position.copy(tmp);
                o.body.velocity.scale(0.8, o.body.velocity);
                burst(o.body.position, 0xaa00ff, 14, 5);
                o.clone.position.copy(safeClonePos(o.body.position));
              }
            return true;
          }});
        }
      }
    },

    hive: {
      label: '🦠 ABSORB SWARM',
      color: '#66ff99',
      maxMinions: 6,
      minionRadius: 0.22,
      minionMass: 0.45,
      minionLife: 18,
      minionSpeed: 8.5,
      onFire(o, ctx) {
        const { spawnMinion, minions, showEvent, burst, scene, world, effects, orbs } = ctx;
        showEvent(this.label, this.color);

        if(!o.hivePassive){
          o.hivePassive = true;
          o.hiveTimer = 0;
          effects.push({ update(dt){
            if(!o.alive) return false;
            o.hiveTimer += dt;
            const mine = minions.filter(m=>m.alive&&m.owner===o);
            if(o.hiveTimer >= 3.5 && mine.length < 6){
              o.hiveTimer = 0;
              spawnMinion(o,{ minionRadius:0.22, minionMass:0.45, minionLife:18, minionSpeed:8.5 });
              burst(o.body.position, 0x66ff99, 8, 3);
            }
            return true;
          }});
        }

        const mine = minions.filter(m=>m.alive&&m.owner===o);
        const c = mine.length;
        if(c===0) return;
        mine.forEach(m=>{ m.alive=false; scene.remove(m.mesh); try{world.removeBody(m.body)}catch(e){} burst(m.body.position,0x66ff99,10,4); });

        const gain = Math.sqrt(c);
        o.scale = Math.min(1.5, (o.scale||1) + 0.04*gain);
        o.mesh.scale.setScalar(o.scale);
        o.body.mass += 0.25*gain;
        o.body.updateMassProperties();

        const pos = o.body.position.clone();
        const targets = orbs.filter(x=>x.alive&&x!==o&&pos.distanceTo(x.body.position)<3.5);
        targets.forEach(t=>{
          const dir = t.body.position.clone().vsub(pos).unit();
          dir.scale(22, dir);
          t.body.velocity.vadd(dir, t.body.velocity);
        });
        burst(o.body.position, 0x66ff99, 22 + c*2, 7);

        o.buff = 1.1;
        setTimeout(()=>{ o.buff=1; }, 2000);
      }
    },
  },

  visual: {
    bgColor: 0x020008, fogColor: 0x12001c, fogDensity: 0.024,
    floorColor: 0x140018, floorEmissive: 0xaa00ff, floorEmissiveInt: 0.32,
    rimColor: 0xdd00ff, dangerColor: 0xff0044,
    vortex1Color: 0xcc44ff, vortex2Color: 0x8800aa,
    starCount: 5000, starSize: 0.38,
  },
};