/* ╔═══════════════════════════════════════════════════════════════╗
   ║ ARENA CONFIG — ILLUSORE vs BATTERIO v2.1 BALANCED ║
   ╚═══════════════════════════════════════════════════════════════╝ */

export const CONFIG = {
  arena: { radius: 8, gravity: -60, friction: 0.12, restitution: 0.38 },
  camera: { fov: 58, orbitRadius: 24, orbitSpeed: 0.0042, orbitBob: 2.5, height: 14 },
  round: { winSlowMo: 0.12, winDuration: 5, introDuration: 3200 },
  orb: { radius: 0.58, mass: 6.5, linearDamping: 0.20, baseSpeed: 6.5, buffSpeed: 10.5, heavySpeed: 6.5, dashPower: 14, buffDashPow: 18, heavyDashPower: 14, dashCooldown: 1.15, dashRandExtra: 0.7, noEdgeDash: 6.0, edgeAvoidFrom: 4.6 },

  spawns: [ [-4.8, 0], [4.8, 0] ],

  players: [
    { name: 'ILLUSORE', color: 0xdd44ff, power: 'mirage', cd: 5.0 },
    { name: 'BATTERIO', color: 0x66ff99, power: 'hive', cd: 4.5 },
  ],

  powers: {
    mirage: {
      label: '🟣 PHASE WALK',
      color: '#dd44ff',
      cloneOpacity: 0.18,
      cloneDistance: 3.2,
      onFire(o, ctx) {
        const { THREE, scene, burst, showEvent, doFlash, cameraShake, effects } = ctx;
        showEvent(this.label, this.color);
        doFlash('#ff88ff', 0.28);
        cameraShake(0.25);

        if (!o.clone) {
          const mat = new THREE.MeshStandardMaterial({ color: 0xdd44ff, emissive: 0xdd44ff, transparent: true, opacity: this.cloneOpacity });
          o.clone = new THREE.Mesh(new THREE.SphereGeometry(0.58, 24, 24), mat);
          o.clone.position.copy(o.body.position).x += this.cloneDistance;
          scene.add(o.clone);
          o.passiveTimer = 0;
        }

        // INTANGIBILE (fix: non tocca il pavimento)
        o.intangible = true;
        o.mesh.material.opacity = 0.35;
        o.mesh.material.transparent = true;
        burst(o.body.position, 0xdd44ff, 22, 7);
        o.buff = 1.35;

        effects.push({ update(dt){
          o.intangibleTime = (o.intangibleTime||0)+dt;
          if(o.intangibleTime >= 1.2){
            o.mesh.material.opacity = 1;
            o.intangible = false;
            o.intangibleTime = 0;
            return false;
          }
          return true;
        }});

        // PASSIVO: swap ogni 4s
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
                o.body.velocity.set(0,0,0);
                burst(o.body.position, 0xaa00ff, 14, 5);
                o.buff = 1.15;
              }
            }
            if(o.clone) o.clone.position.lerp(o.body.position, 0.02);
            return true;
          }});
        }
      }
    },

    hive: {
      label: '🦠 ABSORB SWARM',
      color: '#66ff99',
      maxMinions: 6, // era 7, troppo
      minionRadius: 0.22,
      minionMass: 0.45,
      minionLife: 18,
      minionSpeed: 8.5,
      onFire(o, ctx) {
        const { spawnMinion, minions, showEvent, burst, scene, world, effects } = ctx;
        showEvent(this.label, this.color);

        // PASSIVO: spawna 1 ogni 3.5s
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

        // ATTIVA: assorbi
        const mine = minions.filter(m=>m.alive&&m.owner===o);
        const c = mine.length;
        if(c===0) return;
        mine.forEach(m=>{ m.alive=false; scene.remove(m.mesh); try{world.removeBody(m.body)}catch(e){} burst(m.body.position,0x66ff99,10,4); });
        
        o.scale = Math.min(1.7, (o.scale||1) + 0.06*c); // era 1.9 +0.07, troppo
        o.mesh.scale.setScalar(o.scale);
        o.body.mass += 0.35*c; // era 0.5, adesso p=mv più umano
        o.body.updateMassProperties();
        burst(o.body.position, 0x66ff99, 22 + c*2, 7);
        o.buff = 1.1;
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