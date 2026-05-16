/* ╔══════════════════════════════════════════════════════════╗
   ║          BLACKHOLE ARENA — DUEL CONFIG                  ║
   ╚══════════════════════════════════════════════════════════╝ */

export const CONFIG = {

  /* ──────────────────────────────────────────
     ARENA
  ────────────────────────────────────────── */
  arena: {
    radius:        8,
    gravity:      -30,
    friction:      0.035,
    restitution:   0.82,
  },

  /* ──────────────────────────────────────────
     CAMERA
  ────────────────────────────────────────── */
  camera: {
    orbitRadius:   24,
    orbitSpeed:    0.0042,
    orbitBob:      2.5,
    height:        14,
    fov:           58,
  },

  /* ──────────────────────────────────────────
     ROUND
  ────────────────────────────────────────── */
  round: {
    bestOf:        5,
    winSlowMo:     0.12,
    winDuration:   5,
    introDuration: 3200,
  },

  /* ──────────────────────────────────────────
     ORB
  ────────────────────────────────────────── */
  orb: {
    radius:          0.58,
    mass:            3,

    linearDamping:   0.055,

    baseSpeed:       7.2,
    heavySpeed:      4.4,

    dashPower:       17,
    heavyDashPower:  10,

    dashCooldown:    1.15,
    dashRandExtra:   0.7,

    noEdgeDash:      6.0,
    edgeAvoidFrom:   4.6,
  },

  /* ──────────────────────────────────────────
     SPAWNS
  ────────────────────────────────────────── */
  spawns: [
    [-4.8, 0],
    [ 4.8, 0],
  ],

  /* ──────────────────────────────────────────
     DUELISTS
  ────────────────────────────────────────── */
  players: [

    /* ─────────────────────────────
       MIRAGE — ILLUSIONIST
    ───────────────────────────── */
    {
      name:  'MIRAGE',
      color: 0xdd44ff,
      power: 'illusion',
      cd:    3.2,

      ai: {
        aggression: 0.45,
        trickster:  1.0,
        edgeFear:   0.65,
      }
    },

    /* ─────────────────────────────
       HIVE — BACTERIA
    ───────────────────────────── */
    {
      name:  'HIVE',
      color: 0x66ff99,
      power: 'hive',
      cd:    4.8,

      ai: {
        aggression: 0.85,
        trickster:  0.1,
        edgeFear:   0.25,
      }
    },

  ],

  /* ──────────────────────────────────────────
     POWERS
  ────────────────────────────────────────── */
  powers: {

    /* ═══════════════════════════════
       🟣 MIRAGE
    ═══════════════════════════════ */
    illusion: {

      label: '🟣 MIRAGE SHIFT',
      color: '#dd44ff',

      /* clone */
      cloneOpacity:      0.22,
      cloneDistance:     2.8,
      cloneMoveLag:      0.08,

      /* swap */
      swapCooldown:      3,
      swapChance:        0.55,

      swapFlash:         '#ff88ff',
      swapShake:         0.4,

      /* fake physics */
      fakeCollisionPush: 0,

      /* trampoline mode */
      prismDuration:     1.8,
      prismCooldown:     6,

      prismBounceForce:  28,
      prismPushY:        1.1,

      prismMass:         9,

      prismScaleX:       1.8,
      prismScaleY:       0.9,
      prismScaleZ:       1.8,

      /* mobility */
      speedBoost:        1.2,
    },

    /* ═══════════════════════════════
       🦠 HIVE
    ═══════════════════════════════ */
    hive: {

      label: '🦠 HIVE MASS',
      color: '#66ff99',

      /* spawn */
      maxMinions:        7,
      spawnCooldown:     3.5,

      minionRadius:      0.24,
      minionMass:        0.55,

      minionLife:        22,
      minionSpeed:       8.5,

      minionPushForce:   0.45,

      /* absorb */
      absorbCooldown:    8,

      absorbScaleGain:   0.08,
      absorbMassGain:    0.4,

      maxScale:          2.2,

      /* drawbacks */
      heavySlowFactor:   0.72,
      heavyDashFactor:   0.62,

      /* visuals */
      absorbFlash:       '#99ffcc',
      absorbShake:       0.8,
    },

  },

  /* ──────────────────────────────────────────
     VISUAL
  ────────────────────────────────────────── */
  visual: {

    bgColor:            0x020008,

    fogColor:           0x12001c,
    fogDensity:         0.024,

    floorColor:         0x140018,
    floorEmissive:      0xaa00ff,
    floorEmissiveInt:   0.32,

    rimColor:           0xdd00ff,
    dangerColor:        0xff0044,

    vortex1Color:       0xdd44ff,
    vortex2Color:       0x7700aa,

    starCount:          5000,
    starSize:           0.38,

    /* duel mood */
    pulseArena:         true,
    pulseSpeed:         1.8,

    /* cinematic */
    hitFlashIntensity:  0.8,
    edgeGlow:           1.3,

    /* mirage visuals */
    cloneGlow:          1.4,
    cloneTrailOpacity:  0.16,

    /* hive visuals */
    hiveCoreGlow:       1.6,
    minionGlow:         0.7,
  },

};