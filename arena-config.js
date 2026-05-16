/* ╔═══════════════════════════════════════════════════════════════╗
   ║ ARENA CONFIG — ILLUSORE vs BATTERIO ║
   ╚═══════════════════════════════════════════════════════════════╝ */

export const CONFIG = {
  arena: { radius:8, gravity:-30, friction:0.035, restitution:0.82 },
  camera: { fov:58, orbitRadius:24, orbitSpeed:0.0042, orbitBob:2.5, height:14 },
  round: { winSlowMo:0.12, winDuration:5, introDuration:3200 },
  orb: { radius:0.58, mass:3, linearDamping:0.055, baseSpeed:7.2, buffSpeed:12, heavySpeed:4.4, dashPower:17, buffDashPow:22, heavyDashPower:10, dashCooldown:1.15, dashRandExtra:0.7, noEdgeDash:6.0, edgeAvoidFrom:4.6 },

  spawns: [ [-4.8,0], [4.8,0] ],

  players: [
    { name:'ILLUSORE', color:0xdd44ff, power:'mirage', cd:3.0 },
    { name:'BATTERIO', color:0x66ff99, power:'hive', cd:3.4 },
  ],

  powers: {
    explosion: {
      label:'💥 EXPLOSION', color:'#ff3355', pushForce:18, maxForce:26, pushY:0.4, minionForce:22,
      onFire(o,ctx){ const {showEvent,doFlash,cameraShake,burst,scene,THREE,orbs,minions}=ctx; showEvent(this.label,this.color); doFlash('#ff3355',0.55); cameraShake(0.8); burst(o.body.position.clone(),ctx.CONFIG.players[o.id].color,50,12); const sw=new THREE.Mesh(new THREE.TorusGeometry(0.3,0.14,8,40),new THREE.MeshBasicMaterial({color:0xff3300,transparent:true,opacity:0.95})); sw.rotation.x=Math.PI/2; sw.position.copy(o.body.position); scene.add(sw); let swL=0.45; ctx.effects.push({update(dt){swL-=dt;if(swL<=0){scene.remove(sw);return false;}const s=1+(0.45-swL)*44;sw.scale.set(s,s,s);sw.material.opacity=swL*2;return true;}}); orbs.forEach(t=>{if(!t.alive||t===o)return;const dx=t.body.position.x-o.body.position.x,dz=t.body.position.z-o.body.position.z;let d=Math.hypot(dx,dz);if(d<0.1)d=0.1;const f=Math.min(this.maxForce,this.pushForce/d);t.body.velocity.x+=(dx/d)*f;t.body.velocity.z+=(dz/d)*f;t.body.velocity.y+=this.pushY+Math.random()*0.5;}); minions.forEach(mn=>{if(!mn.alive)return;const dx=mn.body.position.x-o.body.position.x,dz=mn.body.position.z-o.body.position.z;let d=Math.hypot(dx,dz);if(d<0.1)d=0.1;mn.body.velocity.x+=(dx/d)*this.minionForce;mn.body.velocity.z+=(dz/d)*this.minionForce;}); }
    },
    minion: {
      label:'🤖 MINION', color:'#3388ff', maxMinions:3, minionRadius:0.28, minionMass:0.8, minionLife:20, minionSpeed:9,
      onFire(o,ctx){ const {showEvent,spawnMinion,minions}=ctx; showEvent(this.label,this.color); const mine=minions.filter(m=>m.alive&&m.owner===o); if(mine.length<this.maxMinions){spawnMinion(o,{minionRadius:this.minionRadius,minionMass:this.minionMass,minionLife:this.minionLife,minionSpeed:this.minionSpeed});} }
    },
    ghost: {
      label:'👻 GHOST RUSH', color:'#33ff88', invisDur:4, buffDur:4,
      onFire(o,ctx){ ctx.showEvent(this.label,this.color); o.invis=this.invisDur; o.buff=this.buffDur; }
    },
    blackhole: {
      label:'🕳️ BLACKHOLE', color:'#dd44ff', duration:2.2, pullForce:30, pullFalloff:10, centerBias:0.25,
      onFire(o,ctx){ const {showEvent,doFlash,cameraShake,scene,THREE,orbs,minions,effects}=ctx; showEvent(this.label,this.color); doFlash('#dd44ff',0.38); cameraShake(0.5); const bhPos=new THREE.Vector3(o.body.position.x*(1-this.centerBias),1.5,o.body.position.z*(1-this.centerBias)); const bh=new THREE.Mesh(new THREE.SphereGeometry(0.45,24,24),new THREE.MeshBasicMaterial({color:0x000000})); bh.position.copy(bhPos); scene.add(bh); const r1=new THREE.Mesh(new THREE.TorusGeometry(1,0.09,8,40),new THREE.MeshBasicMaterial({color:0xcc44ff,transparent:true,opacity:0.85})); r1.rotation.x=Math.PI/2; bh.add(r1); const r2=new THREE.Mesh(new THREE.TorusGeometry(1.7,0.05,8,40),new THREE.MeshBasicMaterial({color:0x8800aa,transparent:true,opacity:0.5})); r2.rotation.x=Math.PI/2; bh.add(r2); const pl=new THREE.PointLight(0xcc00ff,3.5,10); bh.add(pl); let life=this.duration; const pf=this.pullForce,pfalloff=this.pullFalloff; effects.push({update(dt){life-=dt;if(life<=0){scene.remove(bh);return false;}bh.rotation.y+=dt*3.5;r1.rotation.z+=dt*5;r2.rotation.z-=dt*3;[...orbs,...minions].forEach(t=>{if(!t.alive)return;const dx=bhPos.x-t.body.position.x,dz=bhPos.z-t.body.position.z,dist=Math.max(0.6,Math.hypot(dx,dz)),f=(pfalloff/dist)*dt;t.body.velocity.x+=(dx/dist)*f*pf;t.body.velocity.z+=(dz/dist)*f*pf;});return true;}}); }
    },
    mirage: {
      label:'🟣 MIRAGE SHIFT', color:'#dd44ff', cloneOpacity:0.22, swapChance:0.65, cloneDistance:2.8,
      onFire(o,ctx){ const {THREE,scene,burst,showEvent,doFlash,cameraShake,orbs,effects}=ctx; showEvent(this.label,this.color); doFlash('#ff88ff',.32); cameraShake(.35); if(!o.clone){const mat=new THREE.MeshStandardMaterial({color:0xdd44ff,emissive:0xdd44ff,transparent:true,opacity:this.cloneOpacity}); o.clone=new THREE.Mesh(new THREE.SphereGeometry(0.58,24,24),mat); o.clone.position.copy(o.body.position); o.clone.position.x+=this.cloneDistance; scene.add(o.clone);} if(Math.random()<this.swapChance){const tmp=o.body.position.clone(); o.body.position.copy(o.clone.position); o.body.velocity.set(0,0,0); o.clone.position.copy(tmp); burst(o.body.position,0xdd44ff,18,6);}else{const tri=new THREE.Mesh(new THREE.ConeGeometry(0.9,1.2,3),new THREE.MeshBasicMaterial({color:0xff66ff})); tri.rotation.x=Math.PI; tri.position.copy(o.clone.position); scene.add(tri); let life=1.6; effects.push({update(dt){life-=dt; if(life<=0){scene.remove(tri);return false;} tri.rotation.y+=dt*6; orbs.forEach(t=>{if(!t.alive||t===o)return; const dx=t.body.position.x-tri.position.x,dz=t.body.position.z-tri.position.z,d=Math.hypot(dx,dz); if(d<1){t.body.velocity.x+=dx/(d||1)*18; t.body.velocity.z+=dz/(d||1)*18; t.body.velocity.y+=2; burst(t.body.position,0xff66ff,15,5); scene.remove(tri); life=0;}}); return true;}});} o.buff=1.2; }
    },
    hive: {
      label:'🦠 HIVE MASS', color:'#66ff99', maxMinions:7, minionRadius:0.22, minionMass:0.45, minionLife:18, minionSpeed:8, absorbScaleGain:0.09, absorbMassGain:0.35, maxScale:2.1,
      onFire(o,ctx){ const {spawnMinion,minions,showEvent,burst,scene,world}=ctx; showEvent(this.label,this.color); const mine=minions.filter(m=>m.alive&&m.owner===o); if(mine.length<this.maxMinions && Math.random()<0.72){ spawnMinion(o,{minionRadius:this.minionRadius,minionMass:this.minionMass,minionLife:this.minionLife,minionSpeed:this.minionSpeed}); burst(o.body.position,0x66ff99,10,4); } else{ const c=Math.min(3,mine.length); if(c<=0)return; for(let i=0;i<c;i++){const m=mine[i]; m.alive=false; scene.remove(m.mesh); try{world.removeBody(m.body)}catch(e){} burst(m.body.position,0x66ff99,12,5);} o.scale=(o.scale||1)+this.absorbScaleGain*c; o.scale=Math.min(this.maxScale,o.scale); o.mesh.scale.setScalar(o.scale); o.body.mass+=this.absorbMassGain*c; o.body.updateMassProperties(); burst(o.body.position,0x66ff99,28,8); if(o.scale>1.3)o.buff=-1; } }
    },
  },

  visual: { bgColor:0x020008, fogColor:0x12001c, fogDensity:0.024, floorColor:0x140018, floorEmissive:0xaa00ff, floorEmissiveInt:0.32, rimColor:0xdd00ff, dangerColor:0xff0044, vortex1Color:0xcc44ff, vortex2Color:0x8800aa, starCount:5000, starSize:0.38 },
};