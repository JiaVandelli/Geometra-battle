/* ╔══════════════════════════════════════════════════════════╗
   ║              ARENA CONFIG — MODIFICA QUI                ║
   ║  Questo file controlla tutto il gameplay e lo stile.    ║
   ║  Il resto del codice NON va toccato.                    ║
   ╚══════════════════════════════════════════════════════════╝ */

export const CONFIG = {

  /* ──────────────────────────────────────────
     ARENA
  ────────────────────────────────────────── */
  arena: {
    radius:       8,       // raggio del ring circolare
    gravity:     -28,      // forza di gravità (più negativo = cade prima)
    friction:     0.04,
    restitution:  0.78,    // quanto rimbalzano (0=no rimbalzo, 1=perfetto)
  },

  /* ──────────────────────────────────────────
     CAMERA
     (questi valori vengono usati dal loop,
      puoi cambiarli senza toccare arena-core)
  ────────────────────────────────────────── */
  camera: {
    orbitRadius:  26,      // distanza dal centro
    orbitSpeed:   0.0038,  // velocità orbita (più alto = più veloce)
    orbitBob:     3,       // oscillazione verticale
    height:       15,      // altezza base camera
    fov:          60,
  },

  /* ──────────────────────────────────────────
     ROUND
  ────────────────────────────────────────── */
  round: {
    winSlowMo:    0.18,    // slow-motion alla vittoria
    winDuration:  4.2,     // secondi prima del prossimo round
    introDuration:2800,    // ms prima che scompaia l'intro
  },

  /* ──────────────────────────────────────────
     ORB FISICA
  ────────────────────────────────────────── */
  orb: {
    radius:       0.55,    // dimensione sfera
    mass:         3,
    linearDamping:0.06,    // attrito aria (0=scivolano, 1=si fermano subito)
    baseSpeed:    6,       // velocità normale
    buffSpeed:    11,      // velocità con buff attivo
    dashPower:    15,      // forza del dash
    buffDashPow:  20,      // forza dash con buff
    dashCooldown: 1.3,     // secondi tra un dash e l'altro
    dashRandExtra:1.0,     // variazione random del cooldown dash
    noEdgeDash:   5.8,     // se radiale > questo valore, non dasher (evita autoelim)
    edgeAvoidFrom:4.5,     // da questa distanza dal centro inizia l'avoidance
  },

  /* ──────────────────────────────────────────
     SPAWN POSITIONS  (x, z)
     Aggiungi/rimuovi posizioni per cambiare
     il numero di giocatori!
  ────────────────────────────────────────── */
  spawns: [
    [-5,  5],
    [ 5, -5],
    [-5, -5],
    [ 5,  5],
  ],

  /* ──────────────────────────────────────────
     GIOCATORI
     Ogni oggetto = un orb. Puoi:
     - cambiare name, color
     - cambiare power (vedi sezione POWERS)
     - cambiare cd (cooldown in secondi)
  ────────────────────────────────────────── */
  players: [
    { name:'ROSSO', color:0xff3355, power:'explosion', cd:4  },
    { name:'BLU',   color:0x3388ff, power:'minion',    cd:3  },
    { name:'VERDE', color:0x33ff88, power:'ghost',     cd:5  },
    { name:'VIOLA', color:0xdd44ff, power:'blackhole', cd:7  },
  ],

  /* ──────────────────────────────────────────
     POWERS — parametri per ogni abilità
     Cambia solo i numeri, non le chiavi!
  ────────────────────────────────────────── */
  powers: {

    explosion: {
      label:       '💥 EXPLOSION',
      color:       '#ff3355',
      pushForce:   18,     // forza orizzontale sulle sfere colpite
      maxForce:    26,     // cap massimo della forza
      pushY:       0.4,    // forza verticale (bassa = scvolano fuori, alta = saltano)
      minionForce: 22,     // forza sui minion
      shakeIntensity: 0.8,
      flashColor:  '#ff3355',
      particleCount: 50,
    },

    minion: {
      label:       '🤖 MINION',
      color:       '#3388ff',
      maxMinions:  3,      // massimo minion contemporanei per BLU
      minionLife:  20,     // secondi prima che il minion scompaia
      minionSpeed: 9,      // velocità AI minion
      minionMass:  0.8,
    },

    ghost: {
      label:       '👻 GHOST RUSH',
      color:       '#33ff88',
      invisDur:    4,      // secondi di invisibilità
      buffDur:     4,      // secondi di velocità aumentata
    },

    blackhole: {
      label:       '🕳️ BLACKHOLE',
      color:       '#dd44ff',
      duration:    2.2,    // secondi in cui attira
      pullForce:   30,     // forza di attrazione (su dt)
      pullFalloff: 10,     // divisore distanza (più alto = meno forza a distanza)
      centerBias:  0.25,   // quanto il BH spawna vicino al centro (0=su VIOLA, 1=al centro)
      shakeIntensity: 0.5,
      flashColor:  '#dd44ff',
    },

  },

  /* ──────────────────────────────────────────
     VISUAL — colori e stile arena
  ────────────────────────────────────────── */
  visual: {
    floorColor:       0x180022,
    floorEmissive:    0x7700ff,
    floorEmissiveInt: 0.28,
    rimColor:         0xcc00ff,
    dangerColor:      0xff0044,
    vortex1Color:     0xcc44ff,
    vortex2Color:     0x8800aa,
    fogColor:         0x160024,
    fogDensity:       0.022,
    bgColor:          0x020008,
    starCount:        4000,
    starSize:         0.32,
  },

};
