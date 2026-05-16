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

  powers: {

  mirage: {
    label:'🟣 MIRAGE SHIFT',
    color:'#dd44ff',
    cloneOpacity:0.22,
    swapChance:0.65,
    cloneDistance:2.8,
    onFire(o, ctx){
      const {THREE,scene,burst,showEvent,doFlash,cameraShake,orbs,effects}=ctx;
      showEvent(this.label,this.color); doFlash('#ff88ff',.32); cameraShake(.35);
      if(!o.clone){
        const mat=new THREE.MeshStandardMaterial({color:0xdd44ff,emissive:0xdd44ff,transparent:true,opacity:this.cloneOpacity});
        o.clone=new THREE.Mesh(new THREE.SphereGeometry(0.58,24,24),mat);
        o.clone.position.copy(o.body.position); o.clone.position.x+=this.cloneDistance; scene.add(o.clone);
      }
      if(Math.random()<this.swapChance){
        const tmp=o.body.position.clone(); o.body.position.copy(o.clone.position); o.body.velocity.set(0,0,0); o.clone.position.copy(tmp); burst(o.body.position,0xdd44ff,18,6);
      }else{
        const tri=new THREE.Mesh(new THREE.ConeGeometry(0.9,1.2,3),new THREE.MeshBasicMaterial({color:0xff66ff})); tri.rotation.x=Math.PI; tri.position.copy(o.clone.position); scene.add(tri); let life=1.6;
        effects.push({update(dt){life-=dt; if(life<=0){scene.remove(tri);return false;} tri.rotation.y+=dt*6; orbs.forEach(t=>{if(!t.alive||t===o)return; const dx=t.body.position.x-tri.position.x,dz=t.body.position.z-tri.position.z,d=Math.hypot(dx,dz); if(d<1){t.body.velocity.x+=dx/(d||1)*18; t.body.velocity.z+=dz/(d||1)*18; t.body.velocity.y+=2; burst(t.body.position,0xff66ff,15,5); scene.remove(tri); life=0;}}); return true;}});
      }
      o.buff=1.2;
    }
  },

  hive: {
    label:'🦠 HIVE MASS',
    color:'#66ff99',
    maxMinions:7, minionRadius:0.22, minionMass:0.45, minionLife:18, minionSpeed:8,
    absorbScaleGain:0.09, absorbMassGain:0.35, maxScale:2.1,
    onFire(o, ctx){
      const {spawnMinion,minions,showEvent,burst,scene,world}=ctx; showEvent(this.label,this.color);
      const mine=minions.filter(m=>m.alive&&m.owner===o);
      if(mine.length<this.maxMinions && Math.random()<0.72){ spawnMinion(o,{minionRadius:this.minionRadius,minionMass:this.minionMass,minionLife:this.minionLife,minionSpeed:this.minionSpeed}); burst(o.body.position,0x66ff99,10,4); }
      else{ const c=Math.min(3,mine.length); if(c<=0)return; for(let i=0;i<c;i++){const m=mine[i]; m.alive=false; scene.remove(m.mesh); try{world.removeBody(m.body)}catch(e){} burst(m.body.position,0x66ff99,12,5);} o.scale=(o.scale||1)+this.absorbScaleGain*c; o.scale=Math.min(this.maxScale,o.scale); o.mesh.scale.setScalar(o.scale); o.body.mass+=this.absorbMassGain*c; o.body.updateMassProperties(); burst(o.body.position,0x66ff99,28,8); if(o.scale>1.3)o.buff=-1; }
    }
  },

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
