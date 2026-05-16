export const CONFIG = {
  arena:{radius:8,gravity:-30,friction:0.035,restitution:0.82},
  camera:{orbitRadius:24,orbitSpeed:0.0042,orbitBob:2.5,height:14,fov:58},
  round:{bestOf:5,winSlowMo:0.12,winDuration:5,introDuration:3200},
  orb:{radius:0.58,mass:3,linearDamping:0.055,baseSpeed:7.2,heavySpeed:4.4,dashPower:17,heavyDashPower:10,dashCooldown:1.15,dashRandExtra:0.7,noEdgeDash:6,edgeAvoidFrom:4.6},
  spawns:[[-4.8,0],[4.8,0]],
  players:[
    {name:'MIRAGE',color:0xdd44ff,power:'illusion',cd:3.2},
    {name:'HIVE',color:0x66ff99,power:'hive',cd:4.8},
  ],
  powers:{
    illusion:{
      label:'🟣 MIRAGE SHIFT',color:'#dd44ff',
      cloneOpacity:0.22,cloneDistance:2.8,swapChance:0.55,
      onFire:(o,ctx)=>{
        const {showEvent,doFlash,cameraShake,burst,scene,THREE}=ctx;
        showEvent('🟣 MIRAGE SHIFT','#dd44ff');
        doFlash('#ff88ff',.35); cameraShake(.4);
        if(!o.clone){
          const mat=new THREE.MeshStandardMaterial({color:0xdd44ff,emissive:0xdd44ff,transparent:true,opacity:0.22});
          o.clone=new THREE.Mesh(new THREE.SphereGeometry(0.58,24,24),mat);
          o.clone.position.copy(o.body.position); o.clone.position.x+=2;
          scene.add(o.clone);
        }
        if(Math.random()<0.55){
          const tmp=o.body.position.clone();
          o.body.position.copy(o.clone.position);
          o.clone.position.copy(tmp);
          burst(o.body.position,0xdd44ff,20,6);
        }
        o.buff=1.2;
      }
    },
    hive:{
      label:'🦠 HIVE MASS',color:'#66ff99',
      maxMinions:7,minionRadius:0.24,minionMass:0.55,minionLife:22,minionSpeed:8.5,
      absorbScaleGain:0.08,absorbMassGain:0.4,maxScale:2.2,
      onFire:(o,ctx)=>{
        const {showEvent,spawnMinion,minions,scene,world,burst}=ctx;
        showEvent('🦠 HIVE MASS','#66ff99');
        const mine=minions.filter(m=>m.alive&&m.owner===o);
        if(mine.length<7){
          spawnMinion(o,{minionRadius:0.24,minionMass:0.55,minionLife:22,minionSpeed:8.5});
        }else if((o.scale||1)<2.2){
          mine.slice(0,2).forEach(m=>{m.alive=false;scene.remove(m.mesh);world.removeBody(m.body);});
          o.scale=(o.scale||1)+0.08; o.mesh.scale.setScalar(o.scale);
          o.body.mass+=0.4; o.body.updateMassProperties();
          burst(o.body.position,0x66ff99,30,8);
        }
      }
    },
  },
  visual:{bgColor:0x020008,fogColor:0x12001c,fogDensity:0.024,floorColor:0x140018,floorEmissive:0xaa00ff,floorEmissiveInt:0.32,rimColor:0xdd00ff,dangerColor:0xff0044,starCount:5000,starSize:0.38}
};