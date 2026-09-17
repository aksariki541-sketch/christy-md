/**
 * =============================================================
 *  NAME       : GAME HILL CLIMB RACING 2D  (FIXED / OPTIMIZED)
 *  AUTHOR     : Mommy Kyuu
 *  CHANNEL    : https://whatsapp.com/channel/0029VbDO8tI2phHLTSN2ed0U
 *  TELEGRAM   : @kyuugaprawan
 * =============================================================
 *  FIX NOTE (Arena.ai):
 *  - Tampilan: sky + matahari, gunung parallax, awan, pohon,
 *    rumah/ramp/batu, koin spin + glow, mobil detail + bayangan,
 *    partikel, screen-shake, speed-lines, fuel bar, speedometer.
 *  - PERF (anti-lag): SEMUA objek di pre-render jadi sprite saat
 *    load (gunung, awan, pohon, rumah, ramp, batu, koin 6 frame,
 *    bensin, roda, bodi mobil, api, glow, vignette) -> tiap frame
 *    hanya drawImage. Terrain: titik tiap 6px, buffer Float32Array
 *    reuse (nol alokasi), kamera integer-snap, speckle dikurangi,
 *    partikel max 130 + sprite dot. Fisika fixed-timestep 60Hz.
 *  - Rintangan direnggangkan: ramp/batu yang terlalu dekat rumah
 *    atau satu sama lain otomatis dilewati (rampOK/rockOK).
 *  - Bug diperbaiki: double event, localStorage spam, NaN best,
 *    decor double-draw, roundRect crash, audio bocor, arrow scroll,
 *    canvas kosong, memory-leak, optional-chaining, nested <body>.
 * =============================================================
 */

const htmlPayload = `<style>
* { -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { background: #020617; background-image: radial-gradient(circle at 15% 10%, rgba(56,189,248,0.14), transparent 45%), radial-gradient(circle at 85% 90%, rgba(250,204,21,0.08), transparent 45%); font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #fff; touch-action: none; overflow-x: hidden; min-height: 100vh; }
.game-container { width: 100%; max-width: 480px; margin: auto; padding: 12px 12px 20px; }
.card-wrapper { background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.14); border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08); position: relative; }
.header-bar { padding: 14px 16px 8px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.2) 100%); }
.brand-sub { font-size: 9px; letter-spacing: 2px; color: #7dd3fc; font-weight: 800; text-transform: uppercase; display: flex; align-items: center; gap: 5px; opacity: 0.9; }
.brand-title { font-size: 21px; font-weight: 900; color: #f8fafc; letter-spacing: -0.5px; display: flex; align-items: center; gap: 7px; text-shadow: 0 2px 12px rgba(0,0,0,0.6); margin-top: 2px; }
.score-group { display: flex; align-items: center; gap: 10px; }
.coins-pill { font-size: 12px; color: #fcd34d; font-weight: 800; background: rgba(250,204,21,0.12); border: 1px solid rgba(250,204,21,0.35); border-radius: 999px; padding: 4px 10px; white-space: nowrap; }
.stat-box { text-align: right; }
.score-val { font-size: 22px; font-weight: 900; color: #facc15; text-shadow: 0 0 16px rgba(250,204,21,0.55); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; line-height: 1; }
.best-val { font-size: 10px; color: #94a3b8; font-weight: 700; margin-top: 3px; letter-spacing: 0.5px; }
.fuel-strip { display: flex; align-items: center; gap: 8px; padding: 2px 16px 10px; }
.fuel-label { font-size: 10px; font-weight: 800; color: #cbd5e1; letter-spacing: 1px; white-space: nowrap; }
.fuel-track { flex: 1; height: 10px; background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; overflow: hidden; }
.fuel-fill { height: 100%; width: 100%; border-radius: 999px; background: linear-gradient(90deg, #22c55e, #a3e635); box-shadow: 0 0 10px rgba(34,197,94,0.7); transition: width 0.15s linear; }
.fuel-fill.mid { background: linear-gradient(90deg, #eab308, #fde047); box-shadow: 0 0 10px rgba(234,179,8,0.7); }
.fuel-fill.low { background: linear-gradient(90deg, #ef4444, #f87171); box-shadow: 0 0 10px rgba(239,68,68,0.8); animation: fuelPulse 0.6s ease-in-out infinite alternate; }
@keyframes fuelPulse { from { filter: brightness(0.85); } to { filter: brightness(1.25); } }
.canvas-wrapper { position: relative; margin: 0 12px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.16); box-shadow: inset 0 0 40px rgba(0,0,0,0.35), 0 6px 20px rgba(0,0,0,0.4); aspect-ratio: 16 / 9; background: #38bdf8; }
canvas#game { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; }
.hud-badge { position: absolute; top: 8px; left: 8px; z-index: 5; font-size: 11px; font-weight: 800; font-family: ui-monospace, monospace; color: #e0f2fe; background: rgba(2,6,23,0.55); border: 1px solid rgba(255,255,255,0.18); border-radius: 999px; padding: 4px 10px; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); pointer-events: none; }
.record-badge { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); z-index: 5; font-size: 10px; font-weight: 900; letter-spacing: 1px; color: #0f172a; background: linear-gradient(180deg, #fde047, #f59e0b); border-radius: 999px; padding: 4px 12px; box-shadow: 0 4px 14px rgba(250,204,21,0.6); pointer-events: none; animation: recordPop 0.5s ease infinite alternate; white-space: nowrap; }
.record-badge.hidden { display: none; }
@keyframes recordPop { from { transform: translateX(-50%) scale(1); } to { transform: translateX(-50%) scale(1.06); } }
.controls-bar { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; background: rgba(15, 23, 42, 0.9); }
.ctrl-btn { border: 1px solid rgba(255,255,255,0.22); color: #fff; padding: 16px 0 14px; border-radius: 16px; font-size: 15px; font-weight: 900; text-align: center; cursor: pointer; transition: transform 0.08s ease, box-shadow 0.12s ease, filter 0.12s ease; box-shadow: 0 8px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; letter-spacing: 0.8px; touch-action: none; }
.ctrl-btn .row { display: flex; align-items: center; gap: 8px; }
.ctrl-btn .hint { font-size: 9px; font-weight: 700; opacity: 0.65; letter-spacing: 1.5px; }
.ctrl-btn:active, .ctrl-btn.active { transform: translateY(3px) scale(0.97); filter: brightness(1.25); }
.ctrl-btn.brake { background: linear-gradient(180deg, #f87171 0%, #dc2626 55%, #991b1b 100%); box-shadow: 0 8px 22px rgba(239,68,68,0.35), inset 0 1px 0 rgba(255,255,255,0.3); }
.ctrl-btn.brake:active, .ctrl-btn.brake.active { box-shadow: 0 2px 8px rgba(239,68,68,0.5), 0 0 18px rgba(239,68,68,0.6); }
.ctrl-btn.gas { background: linear-gradient(180deg, #4ade80 0%, #16a34a 55%, #14532d 100%); box-shadow: 0 8px 22px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.3); }
.ctrl-btn.gas:active, .ctrl-btn.gas.active { box-shadow: 0 2px 8px rgba(34,197,94,0.5), 0 0 18px rgba(34,197,94,0.6); }
.footer-tip { text-align: center; font-size: 10px; color: #64748b; font-weight: 600; padding: 0 12px 12px; letter-spacing: 0.3px; }
.overlay { position: absolute; inset: 0; background: rgba(2, 6, 23, 0.80); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px; z-index: 10; padding: 18px; text-align: center; animation: overlayIn 0.25s ease; overflow-y: auto; }
.overlay.hidden { display: none !important; }
@keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
.overlay > * { animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
.overlay > *:nth-child(2) { animation-delay: 0.05s; } .overlay > *:nth-child(3) { animation-delay: 0.1s; } .overlay > *:nth-child(4) { animation-delay: 0.15s; }
@keyframes popIn { from { opacity: 0; transform: translateY(14px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
.title-main { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(180deg, #fef08a, #facc15 60%, #f59e0b); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 3px 12px rgba(250,204,21,0.4)); }
.title-main.red { background: linear-gradient(180deg, #fecaca, #ef4444 60%, #b91c1c); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 3px 12px rgba(239,68,68,0.45)); }
.subtitle-main { font-size: 12px; color: #cbd5e1; font-weight: 600; max-width: 300px; line-height: 1.5; }
.stats-card { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14); border-radius: 16px; padding: 10px 8px; width: 100%; max-width: 300px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 2px 0; }
.stats-card.duo { grid-template-columns: repeat(2, 1fr); }
.stat-item { text-align: center; }
.stat-lbl { font-size: 9px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
.stat-val { font-size: 16px; color: #f8fafc; font-weight: 900; margin-top: 2px; }
.new-record-tag { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: #0f172a; background: linear-gradient(90deg, #fde047, #fbbf24, #fde047); background-size: 200% 100%; animation: shineMove 1.2s linear infinite; border-radius: 999px; padding: 5px 14px; }
.new-record-tag.hidden { display: none; }
@keyframes shineMove { from { background-position: 200% 0; } to { background-position: -200% 0; } }
.btn-action { position: relative; overflow: hidden; background: linear-gradient(180deg, #fef08a 0%, #facc15 45%, #eab308 100%); color: #0f172a; border: none; border-bottom: 4px solid #a16207; font-size: 15px; font-weight: 900; padding: 13px 38px; border-radius: 999px; cursor: pointer; box-shadow: 0 10px 26px rgba(250,204,21,0.45); transition: transform 0.1s ease, box-shadow 0.12s ease; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; font-family: inherit; }
.btn-action:hover { transform: translateY(-1px) scale(1.02); box-shadow: 0 14px 30px rgba(250,204,21,0.55); }
.btn-action:active { transform: translateY(2px) scale(0.97); border-bottom-width: 1px; }
.btn-action::after { content: ""; position: absolute; top: 0; left: -80%; width: 55%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent); transform: skewX(-20deg); animation: btnShine 2.6s ease-in-out infinite; }
@keyframes btnShine { 0% { left: -80%; } 55%, 100% { left: 140%; } }
.sound-toggle { position: absolute; top: 8px; right: 8px; background: rgba(2,6,23,0.55); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 50%; width: 32px; height: 32px; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 12; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); transition: transform 0.1s ease; font-family: inherit; }
.sound-toggle:active { transform: scale(0.88); }
.tips-row { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; max-width: 300px; }
.tip-chip { font-size: 9px; font-weight: 700; color: #a5b4fc; background: rgba(99,102,241,0.14); border: 1px solid rgba(129,140,248,0.35); border-radius: 999px; padding: 3px 9px; }
@media (max-width: 360px) { .brand-title { font-size: 18px; } .score-val { font-size: 19px; } .title-main { font-size: 20px; } .ctrl-btn { font-size: 13px; padding: 13px 0 11px; } }
</style>

<div class="game-container">
  <div class="card-wrapper">
    <div class="header-bar">
      <div>
        <div class="brand-sub">HIRARA ARCADE 2D</div>
        <div class="brand-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#facc15"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4h14v4z"/></svg>
          HILL CLIMB
        </div>
      </div>
      <div class="score-group">
        <div id="coins" class="coins-pill">🪙 0</div>
        <div class="stat-box">
          <div id="score" class="score-val">0m</div>
          <div id="best" class="best-val">BEST 0m</div>
        </div>
      </div>
    </div>
    <div class="fuel-strip">
      <div class="fuel-label">⛽ FUEL</div>
      <div class="fuel-track"><div id="fuelFill" class="fuel-fill"></div></div>
    </div>
    <div class="canvas-wrapper">
      <canvas id="game"></canvas>
      <div id="speedBadge" class="hud-badge">0 km/h</div>
      <div id="recordBadge" class="record-badge hidden">★ NEW RECORD</div>
      <div id="startOverlay" class="overlay">
        <h1 class="title-main">HILL CLIMB RACING</h1>
        <div class="subtitle-main">Taklukkan bukit, ramp &amp; rumah! Jaga keseimbangan agar tidak terbalik.</div>
        <div class="stats-card duo">
          <div class="stat-item">
            <div class="stat-lbl">Record</div>
            <div id="startBest" class="stat-val" style="color: #facc15;">0m</div>
          </div>
          <div class="stat-item">
            <div class="stat-lbl">Kontrol</div>
            <div class="stat-val" style="font-size: 12px; margin-top: 4px;">Pedal / ← →</div>
          </div>
        </div>
        <button id="btnStart" class="btn-action" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          Start Drive
        </button>
        <div class="tips-row">
          <span class="tip-chip">🪙 Koin = poin</span>
          <span class="tip-chip">⛽ Ambil bensin</span>
          <span class="tip-chip">⚠️ Jangan terbalik</span>
        </div>
      </div>
      <div id="gameOverOverlay" class="overlay hidden">
        <h1 id="gameOverTitle" class="title-main red">CRASHED!</h1>
        <div id="newRecordTag" class="new-record-tag hidden">★ NEW RECORD ★</div>
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-lbl">Jarak</div>
            <div id="finalScore" class="stat-val" style="color: #60a5fa;">0m</div>
          </div>
          <div class="stat-item">
            <div class="stat-lbl">Koin</div>
            <div id="finalCoins" class="stat-val" style="color: #f59e0b;">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-lbl">Best</div>
            <div id="finalBest" class="stat-val" style="color: #facc15;">0m</div>
          </div>
        </div>
        <button id="btnRetry" class="btn-action" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
          Retry
        </button>
      </div>
      <button id="btnSound" class="sound-toggle" type="button" title="Mute/Unmute">🔊</button>
    </div>
    <div class="controls-bar">
      <div id="btnBrake" class="ctrl-btn brake">
        <div class="row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          BRAKE
        </div>
        <div class="hint">◀ TAHAN</div>
      </div>
      <div id="btnGas" class="ctrl-btn gas">
        <div class="row">
          GAS
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </div>
        <div class="hint">TAHAN ▶</div>
      </div>
    </div>
    <div class="footer-tip">Tahan GAS untuk maju &amp; salto belakang • BRAKE untuk mundur &amp; salto depan</div>
  </div>
</div>
<script>
(function() {
'use strict';
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (typeof r === 'undefined') r = 4;
    if (typeof r === 'number') r = Math.min(r, w / 2, h / 2);
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}
var c = document.getElementById('game');
if (!c) return;
var ctx = c.getContext('2d');
function $(id) { return document.getElementById(id); }
var scoreEl = $('score'), coinsEl = $('coins'), bestEl = $('best');
var startBestEl = $('startBest'), finalScoreEl = $('finalScore'), finalCoinsEl = $('finalCoins');
var finalBestEl = $('finalBest'), gameOverTitle = $('gameOverTitle');
var startOverlay = $('startOverlay'), gameOverOverlay = $('gameOverOverlay');
var btnStart = $('btnStart'), btnRetry = $('btnRetry');
var btnBrake = $('btnBrake'), btnGas = $('btnGas'), btnSound = $('btnSound');
var fuelFill = $('fuelFill'), speedBadge = $('speedBadge'), recordBadge = $('recordBadge');
var newRecordTag = $('newRecordTag');
var W = 480, H = 270, STEP = 1 / 60;
var skyGrad = null;
function fitCanvas() {
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = Math.round(W * dpr);
  c.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, '#7dd3fc');
  skyGrad.addColorStop(0.55, '#38bdf8');
  skyGrad.addColorStop(1, '#bae6fd');
}
fitCanvas();
window.addEventListener('resize', fitCanvas);
window.addEventListener('orientationchange', function() { setTimeout(fitCanvas, 200); });
/* ===== SPRITE PRE-RENDER (optimasi: lukis 1x saat load, drawImage tiap frame) ===== */
var SPR = {};
var PTS = new Float32Array(512);
var dotCache = {};
function makeSprite(w, h, fn, ss) {
  var s = ss || 2;
  var cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.round(w * s));
  cv.height = Math.max(1, Math.round(h * s));
  var g = cv.getContext('2d');
  g.scale(s, s);
  fn(g, w, h);
  return cv;
}
function dotSprite(color) {
  var d = dotCache[color];
  if (!d) {
    d = makeSprite(20, 20, function(g) {
      g.fillStyle = color;
      g.beginPath(); g.arc(10, 10, 9.5, 0, 6.2832); g.fill();
    }, 1);
    dotCache[color] = d;
  }
  return d;
}
function buildSprites() {
  var i, x, a;
  SPR.vig = makeSprite(W, H, function(g) {
    var v = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    v.addColorStop(0, 'rgba(2,6,23,0)');
    v.addColorStop(1, 'rgba(2,6,23,0.28)');
    g.fillStyle = v;
    g.fillRect(0, 0, W, H);
  }, 1);
  SPR.mFarY = 110;
  SPR.mNearY = 140;
  SPR.mFar = makeSprite(960, 160, function(g) {
    g.fillStyle = 'rgba(147,180,220,0.85)';
    g.beginPath(); g.moveTo(0, 160);
    for (x = 0; x <= 960; x += 8) g.lineTo(x, 40 + 22 * Math.sin(6.2832 * 2 * x / 960) + 8 * Math.sin(6.2832 * 5 * x / 960 + 1.3));
    g.lineTo(960, 160); g.closePath(); g.fill();
  }, 1);
  SPR.mNear = makeSprite(960, 130, function(g) {
    g.fillStyle = 'rgba(110,152,120,0.9)';
    g.beginPath(); g.moveTo(0, 130);
    for (x = 0; x <= 960; x += 8) g.lineTo(x, 35 + 18 * Math.sin(6.2832 * 3 * x / 960 + 0.6) + 6 * Math.sin(6.2832 * 7 * x / 960 + 2.1));
    g.lineTo(960, 130); g.closePath(); g.fill();
  }, 1);
  SPR.sunGlow = makeSprite(128, 128, function(g) {
    var gl = g.createRadialGradient(64, 64, 8, 64, 64, 64);
    gl.addColorStop(0, 'rgba(254,240,138,0.9)');
    gl.addColorStop(0.35, 'rgba(253,224,71,0.35)');
    gl.addColorStop(1, 'rgba(253,224,71,0)');
    g.fillStyle = gl;
    g.fillRect(0, 0, 128, 128);
  }, 1);
  SPR.cloud = [];
  var cox = [0, 7, -5], coy = [0, 3, -2];
  for (i = 0; i < 3; i++) {
    SPR.cloud.push(makeSprite(72, 44, (function(v) {
      return function(g) {
        var ox = cox[v], oy = coy[v];
        g.fillStyle = 'rgba(255,255,255,0.92)';
        g.beginPath();
        g.arc(20 + ox, 22 + oy, 13, 0, 6.2832);
        g.arc(32 + ox, 17 + oy, 17, 0, 6.2832);
        g.arc(46 + ox, 22 + oy, 12, 0, 6.2832);
        g.arc(33 + ox, 27 + oy, 14, 0, 6.2832);
        g.fill();
        g.fillStyle = 'rgba(186,230,253,0.55)';
        g.beginPath(); g.ellipse(32 + ox, 29 + oy, 20, 6, 0, 0, 6.2832); g.fill();
      };
    })(i), 1));
  }
  SPR.pine = makeSprite(36, 42, function(g) {
    g.fillStyle = 'rgba(2,6,23,0.18)';
    g.beginPath(); g.ellipse(18, 37, 9, 3, 0, 0, 6.2832); g.fill();
    g.fillStyle = '#78350f';
    g.fillRect(16, 26, 4, 10);
    g.fillStyle = '#15803d';
    for (var t = 0; t < 3; t++) {
      var w = 14 - t * 4, y0 = 28 - t * 7;
      g.beginPath(); g.moveTo(18 - w / 2, y0); g.lineTo(18, y0 - 9); g.lineTo(18 + w / 2, y0); g.closePath(); g.fill();
    }
  });
  SPR.bush = makeSprite(30, 18, function(g) {
    g.fillStyle = '#16a34a';
    g.beginPath();
    g.arc(10, 12, 5, 0, 6.2832);
    g.arc(16, 9, 6.5, 0, 6.2832);
    g.arc(22, 12, 4.5, 0, 6.2832);
    g.fill();
    g.fillStyle = '#4ade80';
    g.beginPath(); g.arc(14, 8, 2.5, 0, 6.2832); g.fill();
  });
  SPR.house = makeSprite(72, 64, function(g) {
    g.fillStyle = 'rgba(2,6,23,0.2)';
    g.beginPath(); g.ellipse(34, 55, 30, 4, 0, 0, 6.2832); g.fill();
    var wall = g.createLinearGradient(0, 28, 0, 54);
    wall.addColorStop(0, '#fef3c7'); wall.addColorStop(1, '#fcd34d');
    g.fillStyle = wall;
    g.fillRect(8, 28, 52, 26);
    g.strokeStyle = '#92400e'; g.lineWidth = 1.5; g.strokeRect(8, 28, 52, 26);
    g.fillStyle = '#7c2d12';
    g.fillRect(48, 16, 7, 14);
    var roof = g.createLinearGradient(0, 4, 0, 30);
    roof.addColorStop(0, '#ef4444'); roof.addColorStop(1, '#991b1b');
    g.fillStyle = roof;
    g.beginPath();
    g.moveTo(3, 29); g.lineTo(34, 4); g.lineTo(65, 29);
    g.closePath(); g.fill();
    g.strokeStyle = '#7f1d1d'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = '#fef08a';
    g.fillRect(15, 36, 11, 10);
    g.strokeStyle = '#92400e'; g.lineWidth = 1; g.strokeRect(15, 36, 11, 10);
    g.beginPath(); g.moveTo(20.5, 36); g.lineTo(20.5, 46); g.stroke();
    g.fillStyle = '#78350f';
    g.fillRect(34, 38, 13, 16);
    g.fillStyle = '#fbbf24';
    g.beginPath(); g.arc(36.5, 46, 1.4, 0, 6.2832); g.fill();
  });
  SPR.ramp = makeSprite(60, 38, function(g) {
    g.fillStyle = 'rgba(2,6,23,0.2)';
    g.beginPath(); g.ellipse(28, 32, 26, 3.5, 0, 0, 6.2832); g.fill();
    var gr = g.createLinearGradient(6, 0, 51, 0);
    gr.addColorStop(0, '#f59e0b'); gr.addColorStop(1, '#b45309');
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(6, 31); g.lineTo(51, 3); g.lineTo(51, 31);
    g.closePath(); g.fill();
    g.strokeStyle = '#78350f'; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = 'rgba(120,53,15,0.55)'; g.lineWidth = 1;
    g.beginPath();
    g.moveTo(12, 27); g.lineTo(51, 27);
    g.moveTo(20, 22); g.lineTo(51, 22);
    g.moveTo(30, 17); g.lineTo(51, 17);
    g.stroke();
    g.save();
    g.beginPath();
    g.moveTo(6, 31); g.lineTo(51, 3); g.lineTo(51, 10); g.lineTo(6, 31);
    g.closePath(); g.clip();
    g.fillStyle = '#fef08a';
    for (var q = 0; q < 4; q++) g.fillRect(8 + q * 12, 2, 6, 30);
    g.restore();
  });
  SPR.rock = makeSprite(26, 16, function(g) {
    var rg = g.createLinearGradient(0, 0, 0, 14);
    rg.addColorStop(0, '#cbd5e1'); rg.addColorStop(0.5, '#94a3b8'); rg.addColorStop(1, '#475569');
    g.fillStyle = rg;
    g.beginPath(); g.arc(13, 13, 11, Math.PI, 0); g.closePath(); g.fill();
    g.strokeStyle = '#334155'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.beginPath(); g.arc(9, 7, 3, 0, 6.2832); g.fill();
  });
  SPR.coin = [];
  for (i = 0; i < 6; i++) {
    SPR.coin.push(makeSprite(28, 28, (function(f) {
      return function(g) {
        var scX = 0.3 + 0.7 * (f / 5);
        g.fillStyle = 'rgba(250,204,21,0.28)';
        g.beginPath(); g.arc(14, 14, 12, 0, 6.2832); g.fill();
        g.save();
        g.translate(14, 14); g.scale(scX, 1);
        var cg = g.createLinearGradient(-7, -7, 7, 7);
        cg.addColorStop(0, '#fef08a'); cg.addColorStop(0.55, '#facc15'); cg.addColorStop(1, '#ca8a04');
        g.fillStyle = cg;
        g.beginPath(); g.arc(0, 0, 7.5, 0, 6.2832); g.fill();
        g.strokeStyle = '#a16207'; g.lineWidth = 1.6; g.stroke();
        g.fillStyle = '#a16207';
        g.font = 'bold 9px Arial';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('$', 0, 0.5);
        g.restore();
        if (f >= 4) {
          g.fillStyle = 'rgba(255,255,255,0.9)';
          g.beginPath(); g.arc(11, 11, 1.4, 0, 6.2832); g.fill();
        }
      };
    })(i)));
  }
  SPR.fuel = makeSprite(36, 40, function(g) {
    g.fillStyle = 'rgba(34,197,94,0.3)';
    g.beginPath(); g.arc(18, 20, 13, 0, 6.2832); g.fill();
    g.fillStyle = '#0f172a';
    g.fillRect(15, 7, 6, 4);
    var fg = g.createLinearGradient(10, 0, 26, 0);
    fg.addColorStop(0, '#f87171'); fg.addColorStop(0.5, '#dc2626'); fg.addColorStop(1, '#991b1b');
    g.fillStyle = fg;
    g.beginPath();
    if (g.roundRect) g.roundRect(10, 10, 16, 20, 3); else g.rect(10, 10, 16, 20);
    g.fill();
    g.strokeStyle = '#450a0a'; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = '#fecaca';
    g.fillRect(10, 13, 16, 3);
    g.fillStyle = '#fff';
    g.font = 'bold 7px Arial';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('FUEL', 18, 23);
  });
  SPR.wheel = makeSprite(30, 30, function(g) {
    var tg = g.createRadialGradient(15, 15, 4, 15, 15, 10);
    tg.addColorStop(0, '#334155'); tg.addColorStop(0.75, '#0f172a'); tg.addColorStop(1, '#020617');
    g.fillStyle = tg;
    g.beginPath(); g.arc(15, 15, 10, 0, 6.2832); g.fill();
    g.fillStyle = '#1e293b';
    for (a = 0; a < 8; a++) {
      g.save();
      g.translate(15, 15); g.rotate(a * Math.PI / 4);
      g.fillRect(-1.4, -10.5, 2.8, 3.4);
      g.fillRect(-1.4, 7.1, 2.8, 3.4);
      g.restore();
    }
    var rim = g.createLinearGradient(9, 9, 21, 21);
    rim.addColorStop(0, '#f1f5f9'); rim.addColorStop(1, '#94a3b8');
    g.fillStyle = rim;
    g.beginPath(); g.arc(15, 15, 5.5, 0, 6.2832); g.fill();
    g.strokeStyle = '#475569'; g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(10, 15); g.lineTo(20, 15);
    g.moveTo(15, 10); g.lineTo(15, 20);
    g.stroke();
    g.fillStyle = '#facc15';
    g.beginPath(); g.arc(15, 15, 2.2, 0, 6.2832); g.fill();
    g.strokeStyle = '#a16207'; g.lineWidth = 1; g.stroke();
  });
  SPR.carBody = makeSprite(92, 38, function(g) {
    g.fillStyle = '#0f172a';
    g.beginPath(); g.arc(7, 27, 5, 0, 6.2832); g.fill();
    g.fillStyle = '#475569';
    g.beginPath(); g.arc(7, 27, 2.4, 0, 6.2832); g.fill();
    var bd = g.createLinearGradient(0, 16, 0, 32);
    bd.addColorStop(0, '#f87171'); bd.addColorStop(0.45, '#dc2626'); bd.addColorStop(1, '#991b1b');
    g.fillStyle = bd;
    g.beginPath();
    if (g.roundRect) g.roundRect(9, 17, 42, 14, 4); else g.rect(9, 17, 42, 14);
    g.fill();
    g.strokeStyle = '#450a0a'; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.4)';
    g.fillRect(12, 18.5, 36, 2.2);
    g.fillStyle = '#facc15';
    g.fillRect(12, 24.5, 36, 3);
    g.strokeStyle = '#a16207'; g.lineWidth = 0.7;
    g.strokeRect(12, 24.5, 36, 3);
    g.strokeStyle = '#1e293b'; g.lineWidth = 2.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(16, 17); g.lineTo(22, 6); g.lineTo(39, 6); g.lineTo(45, 17); g.stroke();
    g.fillStyle = 'rgba(186,230,253,0.75)';
    g.beginPath();
    g.moveTo(23.5, 7.5); g.lineTo(37, 7.5); g.lineTo(42.5, 16.5); g.lineTo(23.5, 16.5);
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(15,23,42,0.5)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = '#2563eb';
    g.beginPath();
    if (g.roundRect) g.roundRect(26, 10.5, 8, 6.5, 2); else g.rect(26, 10.5, 8, 6.5);
    g.fill();
    g.fillStyle = '#ef4444';
    g.beginPath(); g.arc(30, 7, 5, 0, 6.2832); g.fill();
    g.strokeStyle = '#7f1d1d'; g.lineWidth = 1; g.stroke();
    g.fillStyle = '#facc15';
    g.fillRect(25, 5.5, 10, 2);
    g.fillStyle = '#0f172a';
    g.fillRect(30.5, 5.5, 4, 3);
    var bm = g.createLinearGradient(51, 26, 86, 26);
    bm.addColorStop(0, 'rgba(254,240,138,0.4)');
    bm.addColorStop(1, 'rgba(254,240,138,0)');
    g.fillStyle = bm;
    g.beginPath(); g.moveTo(51, 22); g.lineTo(88, 13); g.lineTo(88, 35); g.lineTo(51, 28); g.closePath(); g.fill();
    g.fillStyle = '#fef08a';
    g.beginPath(); g.arc(51, 24.5, 3.6, 0, 6.2832); g.fill();
    g.strokeStyle = '#a16207'; g.lineWidth = 1; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.beginPath(); g.arc(50, 23.5, 1.2, 0, 6.2832); g.fill();
  });
  SPR.flame = makeSprite(22, 12, function(g) {
    var fm = g.createLinearGradient(21, 0, 0, 0);
    fm.addColorStop(0, 'rgba(254,240,138,0.95)');
    fm.addColorStop(0.5, 'rgba(251,146,60,0.8)');
    fm.addColorStop(1, 'rgba(239,68,68,0)');
    g.fillStyle = fm;
    g.beginPath(); g.moveTo(21, 2.5); g.lineTo(1, 6); g.lineTo(21, 9.5); g.closePath(); g.fill();
  }, 1);
  SPR.puff = makeSprite(24, 24, function(g) {
    var pf = g.createRadialGradient(12, 12, 1, 12, 12, 12);
    pf.addColorStop(0, 'rgba(165,175,190,0.85)');
    pf.addColorStop(0.6, 'rgba(165,175,190,0.4)');
    pf.addColorStop(1, 'rgba(165,175,190,0)');
    g.fillStyle = pf;
    g.fillRect(0, 0, 24, 24);
  }, 1);
}
var audioCtx = null, masterGain = null;
var engineOsc = null, engineOsc2 = null, engineGain = null, engineFilter = null;
var isMuted = false;
function initAudio() {
  if (!audioCtx) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = isMuted ? 0 : 0.9;
      masterGain.connect(audioCtx.destination);
    } catch (e) { audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    try { audioCtx.resume(); } catch (e) {}
  }
}
function startEngine() {
  if (isMuted || !audioCtx || !masterGain || engineOsc) return;
  try {
    engineFilter = audioCtx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.value = 900;
    engineGain = audioCtx.createGain();
    engineGain.gain.value = 0.0;
    engineOsc = audioCtx.createOscillator();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.value = 65;
    engineOsc2 = audioCtx.createOscillator();
    engineOsc2.type = 'square';
    engineOsc2.frequency.value = 33;
    engineOsc.connect(engineFilter);
    engineOsc2.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(masterGain);
    engineOsc.start();
    engineOsc2.start();
    engineGain.gain.setTargetAtTime(0.05, audioCtx.currentTime, 0.2);
  } catch (e) { engineOsc = null; }
}
function updateEngine(speedRatio, isGas) {
  if (!engineOsc || !audioCtx || isMuted) return;
  try {
    var f = 55 + clamp(speedRatio, 0, 1.4) * 150 + (isGas ? 55 : 0);
    var g = isGas ? 0.09 : 0.045;
    engineOsc.frequency.setTargetAtTime(f, audioCtx.currentTime, 0.08);
    engineOsc2.frequency.setTargetAtTime(f * 0.5, audioCtx.currentTime, 0.08);
    engineGain.gain.setTargetAtTime(g, audioCtx.currentTime, 0.08);
    engineFilter.frequency.setTargetAtTime(isGas ? 1400 : 800, audioCtx.currentTime, 0.1);
  } catch (e) {}
}
function stopEngine() {
  if (!engineOsc || !audioCtx) { engineOsc = null; return; }
  try {
    var o1 = engineOsc, o2 = engineOsc2, g = engineGain;
    engineOsc = null; engineOsc2 = null; engineGain = null; engineFilter = null;
    g.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.08);
    var t = audioCtx.currentTime + 0.35;
    try { o1.stop(t); } catch (e) {}
    try { if (o2) o2.stop(t); } catch (e) {}
  } catch (e) {}
}
function tone(freqA, freqB, dur, type, vol, delay) {
  if (isMuted || !audioCtx || !masterGain) return;
  try {
    var t0 = audioCtx.currentTime + (delay || 0);
    var o = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freqA, t0);
    if (freqB && freqB !== freqA) o.frequency.exponentialRampToValueAtTime(Math.max(1, freqB), t0 + dur);
    g.gain.setValueAtTime(vol || 0.15, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(masterGain);
    o.start(t0); o.stop(t0 + dur + 0.02);
  } catch (e) {}
}
function sfx(name) {
  if (isMuted) return;
  initAudio();
  if (!audioCtx) return;
  if (name === 'coin') { tone(988, 988, 0.07, 'sine', 0.16, 0); tone(1319, 1319, 0.12, 'sine', 0.16, 0.07); }
  else if (name === 'fuel') { tone(330, 880, 0.22, 'triangle', 0.2, 0); }
  else if (name === 'crash') {
    tone(200, 38, 0.45, 'sawtooth', 0.3, 0);
    tone(120, 30, 0.5, 'square', 0.18, 0.03);
  }
  else if (name === 'land') { tone(140, 70, 0.12, 'sine', 0.22, 0); }
  else if (name === 'click') { tone(660, 880, 0.08, 'triangle', 0.14, 0); }
  else if (name === 'record') { tone(523, 523, 0.1, 'triangle', 0.18, 0); tone(659, 659, 0.1, 'triangle', 0.18, 0.1); tone(784, 784, 0.18, 'triangle', 0.2, 0.2); }
  else if (name === 'lowfuel') { tone(440, 440, 0.09, 'square', 0.08, 0); }
}
function loadBest() {
  var best = 0;
  try { var a = parseInt(localStorage.getItem('hcr_best_v2'), 10); if (!isNaN(a) && a > best) best = a; } catch (e) {}
  try { var b = parseInt(sessionStorage.getItem('hcr_best_v2'), 10); if (!isNaN(b) && b > best) best = b; } catch (e) {}
  try { var o = parseInt(localStorage.getItem('hcr_best'), 10); if (!isNaN(o) && o > best) best = o; } catch (e) {}
  return best;
}
var bestSaveT = 0;
function saveBest(v, force) {
  var now = Date.now();
  if (!force && now - bestSaveT < 2000) return;
  bestSaveT = now;
  var val = String(Math.floor(v));
  try { localStorage.setItem('hcr_best_v2', val); } catch (e) {}
  try { sessionStorage.setItem('hcr_best_v2', val); } catch (e) {}
}
var state = 'menu';
var chassis = { x: 100, y: 140, vx: 0, vy: 0, angle: 0, vAngle: 0 };
var wheelF = { x: 120, y: 150, rot: 0 };
var wheelR = { x: 80, y: 150, rot: 0 };
var suspF = 0, suspR = 0, suspVF = 0, suspVR = 0;
var fuel = 100, distance = 0, coins = 0;
var items = [], particles = [], floatTexts = [], clouds = [];
var gas = false, brake = false;
var cameraX = -50, cameraY = 0, lastCamX = -50;
var trauma = 0, timeSec = 0;
var best = loadBest(), bestAtStart = best, recordShown = false;
var rafId = null, lastT = 0, acc = 0;
var fuelEmptyT = 0, overTimer = null, lowFuelBeepT = 0;
var lastScore = -1, lastCoins = -1, lastBest = -1, lastFuel = -1, lastSpeed = -1;
function houseC(hi) { return hi * 850 + 715; }
function rampC(ri) { return ri * 550 + 402.5; }
function rockC(ki) { return ki * 320 + 212; }
function rampOK(ri) {
  var rc = rampC(ri);
  var hi = Math.round((rc - 715) / 850);
  for (var d = -1; d <= 1; d++) {
    if (Math.abs(rc - houseC(hi + d)) < 100) return false;
  }
  return true;
}
function rockOK(ki) {
  var cc = rockC(ki);
  var hi = Math.round((cc - 715) / 850);
  for (var d = -1; d <= 1; d++) {
    if (Math.abs(cc - houseC(hi + d)) < 75) return false;
  }
  var ri = Math.round((cc - 402.5) / 550);
  for (var e = -1; e <= 1; e++) {
    if (rampOK(ri + e) && Math.abs(cc - rampC(ri + e)) < 60) return false;
  }
  return true;
}
function getTerrainHeight(px) {
  if (px < 90) return 190;
  var h = 190 + Math.sin(px * 0.005) * 34 + Math.sin(px * 0.013) * 15 + Math.sin(px * 0.031) * 5;
  var hi = Math.floor(px / 850);
  var hs = hi * 850 + 680;
  if (px >= hs && px <= hs + 70) {
    var p = (px - hs) / 70;
    h -= Math.sin(p * Math.PI) * 34;
  }
  var ri = Math.floor(px / 550);
  var rs = ri * 550 + 380;
  if (rampOK(ri) && px >= rs && px <= rs + 45) {
    var q = (px - rs) / 45;
    h -= Math.sin(q * Math.PI) * 27;
  }
  var ki = Math.floor(px / 320);
  var ks = ki * 320 + 200;
  if (rockOK(ki) && px >= ks && px <= ks + 24) {
    var r = (px - ks) / 24;
    h -= Math.sin(r * Math.PI) * 14;
  }
  return h;
}
function getSlope(px) {
  var dx = 8;
  return Math.atan2(getTerrainHeight(px + dx) - getTerrainHeight(px - dx), dx * 2);
}
function populateItems(x0, x1) {
  var x = x0;
  var guard = 0;
  while (x < x1 && guard < 60) {
    guard++;
    x += 130 + hash(x * 0.77) * 150;
    if (x < 240 || x > x1) continue;
    var type = hash(x * 1.71) < 0.22 ? 'fuel' : 'coin';
    items.push({ x: x, y: getTerrainHeight(x) - 26, type: type, collected: false, phase: hash(x * 3.13) * 6.28 });
  }
}
function pruneItems() {
  if (items.length < 250) return;
  var kept = [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    if (!it.collected && it.x > cameraX - 200) kept.push(it);
  }
  items = kept;
}
function addFloat(text, x, y, color) {
  if (floatTexts.length > 12) floatTexts.shift();
  floatTexts.push({ text: text, x: x, y: y, alpha: 1, color: color || '#facc15' });
}
function spawnP(x, y, vx, vy, r, life, color, grav) {
  if (particles.length > 130) particles.shift();
  particles.push({ x: x, y: y, vx: vx, vy: vy, r: r, maxR: r, life: life, maxLife: life, color: color, grav: grav || 0 });
}
function burst(x, y, n, colors, speed, r, life, grav) {
  for (var i = 0; i < n; i++) {
    var a = Math.random() * Math.PI * 2;
    var s = speed * (0.4 + Math.random() * 0.9);
    spawnP(x, y, Math.cos(a) * s, Math.sin(a) * s - speed * 0.35, r * (0.7 + Math.random() * 0.6), life * (0.7 + Math.random() * 0.6), colors[i % colors.length], grav);
  }
}
function initClouds() {
  clouds = [];
  for (var i = 0; i < 9; i++) {
    clouds.push({ x: hash(i * 7.3) * (W + 160) - 80, y: 14 + hash(i * 3.1) * 70, s: 0.55 + hash(i * 5.7) * 0.9, v: 4 + hash(i * 9.2) * 9, depth: 0.5 + hash(i * 4.4) * 0.8, sp: i % 3 });
  }
}
function initGame() {
  var sh = getTerrainHeight(100);
  chassis.x = 100; chassis.y = sh - 20; chassis.vx = 0; chassis.vy = 0; chassis.angle = 0; chassis.vAngle = 0;
  wheelF.x = 122; wheelF.y = sh - 9; wheelF.rot = 0;
  wheelR.x = 78; wheelR.y = sh - 9; wheelR.rot = 0;
  suspF = 0; suspR = 0; suspVF = 0; suspVR = 0;
  fuel = 100; distance = 0; coins = 0;
  particles = []; floatTexts = [];
  gas = false; brake = false;
  fuelEmptyT = 0; trauma = 0; acc = 0;
  bestAtStart = best; recordShown = false;
  cameraX = chassis.x - 150; cameraY = chassis.y - 165; lastCamX = cameraX;
  items = [];
  populateItems(240, 2600);
  if (btnBrake) btnBrake.classList.remove('active');
  if (btnGas) btnGas.classList.remove('active');
  if (recordBadge) recordBadge.classList.add('hidden');
  lastScore = -1; lastCoins = -1; lastBest = -1; lastFuel = -1; lastSpeed = -1;
  updateHUD(true);
}
function triggerGameOver(reason) {
  if (state !== 'playing') return;
  state = 'over';
  stopEngine();
  sfx('crash');
  trauma = 1;
  burst(chassis.x, chassis.y, 22, ['#f97316', '#facc15', '#78716c', '#ef4444'], 3.4, 3.2, 0.9, 5);
  if (navigator.vibrate) { try { navigator.vibrate([60, 40, 80]); } catch (e) {} }
  if (Math.floor(distance) > best) { best = Math.floor(distance); }
  saveBest(best, true);
  if (gameOverTitle) gameOverTitle.textContent = reason;
  if (finalScoreEl) finalScoreEl.textContent = Math.floor(distance) + 'm';
  if (finalCoinsEl) finalCoinsEl.textContent = String(coins);
  if (finalBestEl) finalBestEl.textContent = Math.floor(best) + 'm';
  if (newRecordTag) {
    if (Math.floor(distance) > bestAtStart && Math.floor(distance) > 0) newRecordTag.classList.remove('hidden');
    else newRecordTag.classList.add('hidden');
  }
  if (overTimer) { clearTimeout(overTimer); overTimer = null; }
  overTimer = setTimeout(function() {
    if (state === 'over' && gameOverOverlay) gameOverOverlay.classList.remove('hidden');
  }, 650);
}
function physicsStep() {
  if (gas && fuel > 0) fuel -= 0.052;
  else fuel -= 0.0085;
  if (fuel < 0) fuel = 0;
  if (fuel <= 0) {
    fuelEmptyT += STEP;
    if (fuelEmptyT > 1.2 && Math.abs(chassis.vx) < 0.35 && Math.abs(chassis.vy) < 0.6) {
      triggerGameOver('OUT OF FUEL!');
      return;
    }
  } else { fuelEmptyT = 0; }
  if (fuel < 25 && fuel > 0) {
    lowFuelBeepT += STEP;
    if (lowFuelBeepT > 1.4) { lowFuelBeepT = 0; sfx('lowfuel'); }
  }
  chassis.vy += 0.28;
  chassis.vAngle *= 0.94;
  var groundedF = (wheelF.y + 10) >= getTerrainHeight(wheelF.x) - 3;
  var groundedR = (wheelR.y + 10) >= getTerrainHeight(wheelR.x) - 3;
  var grounded = groundedF || groundedR;
  var power = 0.148;
  if (gas && fuel > 0) {
    chassis.vx += Math.cos(chassis.angle) * power;
    chassis.vy += Math.sin(chassis.angle) * power;
    chassis.vAngle += grounded ? 0.0042 : 0.0085;
    wheelF.rot += Math.max(0.1, chassis.vx * 0.16);
    wheelR.rot += Math.max(0.1, chassis.vx * 0.16);
  } else {
    wheelF.rot += chassis.vx * 0.1;
    wheelR.rot += chassis.vx * 0.1;
  }
  if (brake) {
    chassis.vx -= Math.cos(chassis.angle) * power * 0.6;
    chassis.vAngle -= grounded ? 0.006 : 0.009;
    wheelF.rot += chassis.vx * 0.06;
    wheelR.rot += chassis.vx * 0.06;
  }
  if (!gas && !brake) chassis.vx *= 0.999;
  chassis.vx = clamp(chassis.vx, -3.4, 7.2);
  chassis.x += chassis.vx;
  chassis.y += chassis.vy;
  chassis.angle += chassis.vAngle;
  if (chassis.x < 45) { chassis.x = 45; chassis.vx = Math.max(0, chassis.vx); }
  var cosA = Math.cos(chassis.angle), sinA = Math.sin(chassis.angle);
  var k = 0.26, damp = 0.74;
  suspVF += (-suspF) * k; suspVF *= damp; suspF += suspVF;
  suspVR += (-suspR) * k; suspVR *= damp; suspR += suspVR;
  wheelF.x = chassis.x + cosA * 21 - sinA * (10 + suspF);
  wheelF.y = chassis.y + sinA * 21 + cosA * (10 + suspF);
  wheelR.x = chassis.x - cosA * 21 - sinA * (10 + suspR);
  wheelR.y = chassis.y - sinA * 21 + cosA * (10 + suspR);
  var vyBefore = chassis.vy;
  var hitF = false, hitR = false;
  var thF = getTerrainHeight(wheelF.x);
  if (wheelF.y + 10 > thF) {
    var ovF = (wheelF.y + 10) - thF;
    chassis.y -= ovF * 0.62;
    suspF -= ovF * 0.42; suspVF -= ovF * 0.3;
    chassis.vy *= 0.18;
    chassis.vx *= 0.986;
    chassis.vAngle += (getSlope(wheelF.x) - chassis.angle) * 0.085;
    hitF = true;
  }
  var thR = getTerrainHeight(wheelR.x);
  if (wheelR.y + 10 > thR) {
    var ovR = (wheelR.y + 10) - thR;
    chassis.y -= ovR * 0.62;
    suspR -= ovR * 0.42; suspVR -= ovR * 0.3;
    chassis.vy *= 0.18;
    chassis.vx *= 0.986;
    chassis.vAngle += (getSlope(wheelR.x) - chassis.angle) * 0.085;
    hitR = true;
  }
  suspF = clamp(suspF, -6, 6);
  suspR = clamp(suspR, -6, 6);
  wheelF.x = chassis.x + cosA * 21 - sinA * (10 + suspF);
  wheelF.y = chassis.y + sinA * 21 + cosA * (10 + suspF);
  wheelR.x = chassis.x - cosA * 21 - sinA * (10 + suspR);
  wheelR.y = chassis.y - sinA * 21 + cosA * (10 + suspR);
  if ((hitF || hitR) && vyBefore > 4.2) {
    var imp = clamp(vyBefore, 0, 11);
    burst(chassis.x, getTerrainHeight(chassis.x) - 2, Math.floor(imp * 1.6), ['#d6c39a', '#a8a29e', '#e7e5e4'], 1.8, 2.6, 0.6, 4);
    trauma = clamp(trauma + imp * 0.055, 0, 0.8);
    if (imp > 5.5) sfx('land');
  }
  var ex = chassis.x - cosA * 24 + sinA * 5;
  var ey = chassis.y - sinA * 24 - cosA * 5;
  if (gas && fuel > 0) {
    if (Math.random() < 0.85) spawnP(ex, ey, -cosA * 2.2 + (Math.random() - 0.5), -sinA * 2.2 - 0.6 + (Math.random() - 0.5), 2.2 + Math.random() * 1.6, 0.5 + Math.random() * 0.3, 'rgba(148,163,184,0.75)', -1.5);
    if (Math.random() < 0.5) spawnP(ex, ey, -cosA * 1.4, -sinA * 1.4, 2.6, 0.18, '#fb923c', 0);
  } else if (Math.abs(chassis.vx) > 0.4 && (hitF || hitR) && Math.random() < 0.25) {
    spawnP(wheelR.x, wheelR.y + 8, -chassis.vx * 0.4 + (Math.random() - 0.5), -0.8 - Math.random(), 2 + Math.random() * 1.5, 0.5, 'rgba(214,195,154,0.7)', 3);
  }
  if ((hitF || hitR) && Math.abs(chassis.vx) > 3.4 && Math.random() < 0.55) {
    spawnP(wheelR.x - 6, wheelR.y + 7, -chassis.vx * 0.55, -1 - Math.random() * 1.2, 2.2, 0.55, 'rgba(214,195,154,0.8)', 4);
  }
  var norm = Math.abs(Math.atan2(Math.sin(chassis.angle), Math.cos(chassis.angle)));
  var headX = chassis.x + sinA * 15;
  var headY = chassis.y - cosA * 15;
  if (norm > 2.15 && headY > getTerrainHeight(headX) - 3) {
    triggerGameOver('CRASHED!');
    return;
  }
  if (chassis.y > getTerrainHeight(chassis.x) + 160) {
    triggerGameOver('CRASHED!');
    return;
  }
  distance = Math.max(distance, (chassis.x - 100) / 10);
  if (distance > best) {
    best = Math.floor(distance);
    saveBest(best, false);
    if (!recordShown && bestAtStart > 0 && distance > bestAtStart) {
      recordShown = true;
      if (recordBadge) recordBadge.classList.remove('hidden');
      sfx('record');
      addFloat('NEW RECORD!', chassis.x, chassis.y - 34, '#fde047');
    }
  }
  var i, it;
  for (i = 0; i < items.length; i++) {
    it = items[i];
    if (it.collected) continue;
    var dx = chassis.x - it.x, dy = chassis.y - it.y;
    if (dx * dx + dy * dy < 30 * 30) {
      it.collected = true;
      if (it.type === 'coin') {
        coins += 10;
        sfx('coin');
        addFloat('+10', it.x, it.y - 8, '#facc15');
        burst(it.x, it.y, 8, ['#facc15', '#fde047', '#fff7ed'], 2, 2.2, 0.5, 3);
      } else {
        fuel = Math.min(100, fuel + 45);
        sfx('fuel');
        addFloat('+FUEL', it.x, it.y - 8, '#4ade80');
        burst(it.x, it.y, 10, ['#4ade80', '#22c55e', '#bbf7d0'], 2, 2.4, 0.55, 2);
      }
    }
  }
  var needX = chassis.x + 1700;
  var lastX = items.length ? items[items.length - 1].x : chassis.x;
  if (lastX < needX) populateItems(Math.max(lastX + 100, chassis.x + 300), needX + 600);
  pruneItems();
  updateEngine(Math.abs(chassis.vx) / 6, gas);
}
function visualUpdate(ft) {
  var f = ft * 60;
  var i, p;
  for (i = particles.length - 1; i >= 0; i--) {
    p = particles[i];
    p.vy += (p.grav || 0) * ft * 3;
    p.x += p.vx * f * 0.9;
    p.y += p.vy * f * 0.9;
    p.life -= ft;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
  }
  for (i = floatTexts.length - 1; i >= 0; i--) {
    var t = floatTexts[i];
    t.y -= 34 * ft;
    t.alpha -= 1.5 * ft;
    if (t.alpha <= 0) floatTexts.splice(i, 1);
  }
  var camDx = cameraX - lastCamX;
  lastCamX = cameraX;
  for (i = 0; i < clouds.length; i++) {
    var cl = clouds[i];
    cl.x -= (cl.v * ft + camDx * 0.12 * cl.depth);
    if (cl.x < -90) cl.x = W + 90;
    else if (cl.x > W + 90) cl.x = -90;
  }
  if (trauma > 0) trauma = Math.max(0, trauma - ft * 1.6);
}
function updateCamera(ft) {
  var lookAhead = clamp(chassis.vx * 9, -20, 46);
  var tx = chassis.x - 150 + lookAhead;
  var ty = chassis.y - 165;
  var kx = Math.min(1, ft * 5.5);
  var ky = Math.min(1, ft * 4.2);
  cameraX += (tx - cameraX) * kx;
  cameraY += (ty - cameraY) * ky;
}
function updateMenuCam(ft) {
  var tx = 100 - 150 + Math.sin(timeSec * 0.4) * 22;
  var ty = getTerrainHeight(140) - 165 + Math.sin(timeSec * 0.55) * 5;
  cameraX += (tx - cameraX) * Math.min(1, ft * 2);
  cameraY += (ty - cameraY) * Math.min(1, ft * 2);
}
function drawSpring(x1, y1, x2, y2) {
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  var dx = x2 - x1, dy = y2 - y1;
  var steps = 6;
  var nx = -dy * 0.22, ny = dx * 0.22;
  for (var i = 1; i < steps; i++) {
    var tt = i / steps;
    var side = (i % 2 === 0) ? 1 : -1;
    ctx.lineTo(x1 + dx * tt + nx * side, y1 + dy * tt + ny * side);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
function drawCloud(x, y, s, v) {
  ctx.drawImage(SPR.cloud[v % 3], x - 14 * s, y - 22 * s, 64 * s, 39 * s);
}
function drawPine(x, baseY, s) {
  ctx.drawImage(SPR.pine, x - 18 * s, baseY - 36 * s, 36 * s, 42 * s);
}
function drawBush(x, baseY, s) {
  ctx.drawImage(SPR.bush, x - 15 * s, baseY - 15 * s, 30 * s, 18 * s);
}
function drawHouse(hs) {
  var th = getTerrainHeight(hs + 35);
  var bx = hs + 10, by = th + 6;
  ctx.drawImage(SPR.house, bx - 8, by - 28, 72, 64);
  for (var s = 0; s < 3; s++) {
    var ph = ((timeSec * 0.5 + s * 0.33 + hs * 0.01) % 1);
    var pr = 2 + ph * 3.5;
    ctx.globalAlpha = 0.55 * (1 - ph);
    var pwx = bx + 43 + Math.sin(ph * 5 + hs) * 3, pwy = by - 14 - ph * 16;
    ctx.drawImage(SPR.puff, pwx - pr, pwy - pr, pr * 2, pr * 2);
  }
  ctx.globalAlpha = 1;
}
function drawRamp(rs) {
  var th = getTerrainHeight(rs + 22);
  ctx.drawImage(SPR.ramp, rs - 6, th - 16, 60, 38);
}
function drawRock(rs) {
  var th = getTerrainHeight(rs + 12);
  ctx.drawImage(SPR.rock, rs - 1, th - 8, 26, 16);
}
function drawBoard(bx) {
  if (bx < 300) return;
  var th = getTerrainHeight(bx);
  var m = Math.max(0, Math.round((bx - 100) / 10));
  ctx.fillStyle = '#78350f';
  ctx.fillRect(bx - 1.5, th - 30, 3, 30);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.roundRect(bx - 22, th - 48, 44, 19, 5); ctx.fill();
  ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(m + 'm', bx, th - 38);
}
function drawWheel(w) {
  ctx.fillStyle = 'rgba(2,6,23,0.35)';
  ctx.beginPath(); ctx.arc(w.x + 1.5, w.y + 2, 10, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(w.x, w.y);
  ctx.rotate(w.rot);
  ctx.drawImage(SPR.wheel, -15, -15, 30, 30);
  ctx.restore();
}
function drawCar() {
  var cosA = Math.cos(chassis.angle), sinA = Math.sin(chassis.angle);
  var gy = getTerrainHeight(chassis.x);
  var hAbove = clamp(gy - chassis.y, 0, 130);
  var shA = 0.34 * (1 - hAbove / 150);
  var shR = 27 * (1 - hAbove / 220);
  if (shA > 0.02) {
    ctx.fillStyle = 'rgba(2,6,23,' + shA.toFixed(2) + ')';
    ctx.beginPath(); ctx.ellipse(chassis.x, gy + 4, shR, 5, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(chassis.x - cosA * 17, chassis.y - sinA * 17); ctx.lineTo(wheelR.x, wheelR.y);
  ctx.moveTo(chassis.x + cosA * 17, chassis.y + sinA * 17); ctx.lineTo(wheelF.x, wheelF.y);
  ctx.stroke();
  drawSpring(chassis.x - cosA * 18, chassis.y - sinA * 18, wheelR.x, wheelR.y);
  drawSpring(chassis.x + cosA * 18, chassis.y + sinA * 18, wheelF.x, wheelF.y);
  drawWheel(wheelR);
  drawWheel(wheelF);
  ctx.save();
  ctx.translate(chassis.x, chassis.y);
  ctx.rotate(chassis.angle);
  if (gas && fuel > 0 && state === 'playing') {
    var fl = 8 + Math.random() * 7;
    ctx.drawImage(SPR.flame, -24 - fl, -3.5, fl, 9);
  }
  ctx.drawImage(SPR.carBody, -30, -26, 92, 38);
  ctx.restore();
}
function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);
  var sunX = W - 78, sunY = 50;
  ctx.drawImage(SPR.sunGlow, sunX - 64, sunY - 64, 128, 128);
  ctx.save();
  ctx.translate(sunX, sunY);
  ctx.rotate(timeSec * 0.15);
  ctx.strokeStyle = 'rgba(254,240,138,0.7)';
  ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  for (var ri = 0; ri < 8; ri++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(0, -27); ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = '#fef08a';
  ctx.beginPath(); ctx.arc(sunX, sunY, 17, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fde047';
  ctx.beginPath(); ctx.arc(sunX, sunY, 13, 0, Math.PI * 2); ctx.fill();
  var mOff1 = ((cameraX * 0.15) % 960 + 960) % 960;
  ctx.drawImage(SPR.mFar, -mOff1, SPR.mFarY, 960, 160);
  ctx.drawImage(SPR.mFar, -mOff1 + 960, SPR.mFarY, 960, 160);
  var mOff2 = ((cameraX * 0.32) % 960 + 960) % 960;
  ctx.drawImage(SPR.mNear, -mOff2, SPR.mNearY, 960, 130);
  ctx.drawImage(SPR.mNear, -mOff2 + 960, SPR.mNearY, 960, 130);
  var ci;
  for (ci = 0; ci < clouds.length; ci++) drawCloud(clouds[ci].x, clouds[ci].y, clouds[ci].s, clouds[ci].sp);
  var shX = 0, shY = 0;
  if (trauma > 0) {
    var sh = trauma * trauma * 9;
    shX = (Math.random() - 0.5) * 2 * sh;
    shY = (Math.random() - 0.5) * 2 * sh;
  }
  var camX = Math.round(cameraX + shX), camY = Math.round(cameraY + shY);
  ctx.save();
  ctx.translate(-camX, -camY);
  var botY = camY + H + 60;
  var sx, wx;
  var nPts = 0;
  for (sx = -24; sx <= W + 24; sx += 6) {
    wx = camX + sx;
    PTS[nPts++] = wx;
    PTS[nPts++] = getTerrainHeight(wx);
  }
  var dirt = ctx.createLinearGradient(0, camY + H * 0.3, 0, botY);
  dirt.addColorStop(0, '#a16207');
  dirt.addColorStop(0.25, '#854d0e');
  dirt.addColorStop(1, '#451a03');
  ctx.fillStyle = dirt;
  ctx.beginPath();
  ctx.moveTo(PTS[0], botY);
  for (var pi = 0; pi < nPts; pi += 2) ctx.lineTo(PTS[pi], PTS[pi + 1]);
  ctx.lineTo(PTS[nPts - 2], botY);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(69,26,3,0.5)';
  for (sx = -24; sx <= W + 24; sx += 34) {
    var dwx = camX + sx + (hash(Math.floor((camX + sx) / 34)) - 0.5) * 14;
    var dwy = getTerrainHeight(dwx) + 16 + hash(dwx * 0.31) * 46;
    ctx.beginPath(); ctx.arc(dwx, dwy, 1.6 + hash(dwx * 0.77) * 2.2, 0, Math.PI * 2); ctx.fill();
  }
  var grass = ctx.createLinearGradient(0, camY + H * 0.3, 0, camY + H * 0.3 + 12);
  grass.addColorStop(0, '#4ade80');
  grass.addColorStop(1, '#15803d');
  ctx.fillStyle = grass;
  ctx.beginPath();
  for (var gi = 0; gi < nPts; gi += 2) {
    if (gi === 0) ctx.moveTo(PTS[gi], PTS[gi + 1]);
    else ctx.lineTo(PTS[gi], PTS[gi + 1]);
  }
  for (var gj = nPts - 2; gj >= 0; gj -= 2) ctx.lineTo(PTS[gj], PTS[gj + 1] + 10);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (var hi2 = 0; hi2 < nPts; hi2 += 2) {
    if (hi2 === 0) ctx.moveTo(PTS[hi2], PTS[hi2 + 1]);
    else ctx.lineTo(PTS[hi2], PTS[hi2 + 1]);
  }
  ctx.stroke();
  var k0 = Math.floor((camX - 60) / 110), k1 = Math.floor((camX + W + 60) / 110);
  for (var k = k0; k <= k1; k++) {
    if (k < 1) continue;
    var r1 = hash(k * 12.7);
    if (r1 < 0.35) continue;
    var tx = k * 110 + (hash(k * 3.3) - 0.5) * 60;
    var ty2 = getTerrainHeight(tx);
    if (r1 > 0.72) drawPine(tx, ty2 + 2, 0.7 + hash(k * 7.1) * 0.6);
    else drawBush(tx, ty2 + 2, 0.7 + hash(k * 5.9) * 0.7);
  }
  var h0 = Math.floor((camX - 80) / 850), h1 = Math.floor((camX + W + 80) / 850);
  for (var hh = h0; hh <= h1; hh++) {
    var hs = hh * 850 + 680;
    if (hs > 150) drawHouse(hs);
  }
  var r0 = Math.floor((camX - 60) / 550), r1b = Math.floor((camX + W + 60) / 550);
  for (var rr = r0; rr <= r1b; rr++) {
    var rs = rr * 550 + 380;
    if (rs > 150 && rampOK(rr)) drawRamp(rs);
  }
  var o0 = Math.floor((camX - 40) / 320), o1 = Math.floor((camX + W + 40) / 320);
  for (var oo = o0; oo <= o1; oo++) {
    var os = oo * 320 + 200;
    if (os > 150 && rockOK(oo)) drawRock(os);
  }
  var b0 = Math.floor((camX - 40) / 500), b1 = Math.floor((camX + W + 40) / 500);
  for (var bb = b0; bb <= b1; bb++) drawBoard(bb * 500);
  var ii, it;
  for (ii = 0; ii < items.length; ii++) {
    it = items[ii];
    if (it.collected) continue;
    if (it.x < camX - 24 || it.x > camX + W + 24) continue;
    var bob = Math.sin(timeSec * 3 + it.phase) * 3;
    var iy = it.y + bob;
    if (it.type === 'coin') {
      var spin = Math.abs(Math.sin(timeSec * 4 + it.phase));
      var cfi = Math.min(5, Math.floor(spin * 6));
      ctx.drawImage(SPR.coin[cfi], it.x - 14, iy - 14, 28, 28);
    } else {
      var pulse = 1 + Math.sin(timeSec * 5 + it.phase) * 0.08;
      var fw2 = 36 * pulse, fh2 = 40 * pulse;
      ctx.drawImage(SPR.fuel, it.x - fw2 / 2, iy - fh2 / 2, fw2, fh2);
    }
  }
  var pi2, p;
  for (pi2 = 0; pi2 < particles.length; pi2++) {
    p = particles[pi2];
    var a = clamp(p.life / p.maxLife, 0, 1);
    if (a <= 0) continue;
    var pr2 = p.r * (0.5 + 0.5 * a) + 0.6;
    ctx.globalAlpha = a;
    ctx.drawImage(dotSprite(p.color), p.x - pr2, p.y - pr2, pr2 * 2, pr2 * 2);
  }
  ctx.globalAlpha = 1;
  drawCar();
  ctx.textAlign = 'center';
  for (var fi = 0; fi < floatTexts.length; fi++) {
    var ft = floatTexts[fi];
    ctx.globalAlpha = clamp(ft.alpha, 0, 1);
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(2,6,23,0.7)';
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  var spd = Math.abs(chassis.vx);
  if (state === 'playing' && spd > 4.4) {
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2; ctx.lineCap = 'round';
    var lines = Math.min(6, Math.floor(spd));
    for (var sl = 0; sl < lines; sl++) {
      var ly3 = hash(sl * 91.7 + Math.floor(timeSec * 18)) * H;
      var lx3 = hash(sl * 57.3 + Math.floor(timeSec * 18)) * W;
      var len = 26 + spd * 7;
      ctx.beginPath(); ctx.moveTo(lx3, ly3); ctx.lineTo(lx3 - len, ly3); ctx.stroke();
    }
  }
  ctx.drawImage(SPR.vig, 0, 0, W, H);
}
function updateHUD(force) {
  var d = Math.floor(distance), b = Math.floor(best);
  if (force || d !== lastScore) { lastScore = d; if (scoreEl) scoreEl.textContent = d + 'm'; }
  if (force || coins !== lastCoins) { lastCoins = coins; if (coinsEl) coinsEl.textContent = '🪙 ' + coins; }
  if (force || b !== lastBest) {
    lastBest = b;
    if (bestEl) bestEl.textContent = 'BEST ' + b + 'm';
    if (startBestEl) startBestEl.textContent = b + 'm';
  }
  var f = Math.round(fuel);
  if (force || f !== lastFuel) {
    lastFuel = f;
    if (fuelFill) {
      fuelFill.style.width = clamp(fuel, 0, 100).toFixed(1) + '%';
      fuelFill.classList.remove('low', 'mid');
      if (fuel < 25) fuelFill.classList.add('low');
      else if (fuel < 50) fuelFill.classList.add('mid');
    }
  }
  var kmh = Math.round(Math.abs(chassis.vx) * 60 * 0.12);
  if (force || kmh !== lastSpeed) { lastSpeed = kmh; if (speedBadge) speedBadge.textContent = kmh + ' km/h'; }
}
function frame(t) {
  rafId = requestAnimationFrame(frame);
  var ft;
  if (!lastT) { lastT = t; ft = STEP; }
  else {
    ft = (t - lastT) / 1000;
    lastT = t;
    if (ft > 0.1) ft = 0.1;
    if (ft <= 0) return;
  }
  if (document.hidden) return;
  timeSec += ft;
  if (state === 'playing') {
    acc += ft;
    var n = 0;
    while (acc >= STEP && n < 4 && state === 'playing') { physicsStep(); acc -= STEP; n++; }
    if (n === 4) acc = 0;
    visualUpdate(ft);
    updateCamera(ft);
  } else if (state === 'menu') {
    updateMenuCam(ft);
    visualUpdate(ft);
  } else {
    visualUpdate(ft);
    updateCamera(ft);
  }
  draw();
  updateHUD(false);
}
function bindHold(el, set) {
  if (!el) return;
  var active = false;
  function on(e) {
    initAudio();
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    if (active) return;
    active = true;
    try { el.classList.add('active'); } catch (err) {}
    set(true);
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (err2) {} }
  }
  function off(e) {
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }
    if (!active) return;
    active = false;
    try { el.classList.remove('active'); } catch (err) {}
    set(false);
  }
  el.addEventListener('pointerdown', on);
  el.addEventListener('pointerup', off);
  el.addEventListener('pointercancel', off);
  el.addEventListener('lostpointercapture', off);
  el.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('pointerup', function() { if (active) off(null); });
}
bindHold(btnBrake, function(v) { brake = v; });
bindHold(btnGas, function(v) { gas = v; });
var GAME_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '];
document.addEventListener('keydown', function(e) {
  var k = e.key;
  if (GAME_KEYS.indexOf(k) !== -1) e.preventDefault();
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') { brake = true; if (btnBrake) btnBrake.classList.add('active'); }
  if (k === 'ArrowRight' || k === 'd' || k === 'D' || k === 'ArrowUp' || k === 'w' || k === 'W') { gas = true; if (btnGas) btnGas.classList.add('active'); }
  if ((k === ' ' || k === 'Enter')) {
    if (state === 'menu' && btnStart) btnStart.click();
    else if (state === 'over' && gameOverOverlay && !gameOverOverlay.classList.contains('hidden') && btnRetry) btnRetry.click();
  }
  if ((k === 'r' || k === 'R') && state === 'over' && btnRetry) btnRetry.click();
});
document.addEventListener('keyup', function(e) {
  var k = e.key;
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') { brake = false; if (btnBrake) btnBrake.classList.remove('active'); }
  if (k === 'ArrowRight' || k === 'd' || k === 'D' || k === 'ArrowUp' || k === 'w' || k === 'W') { gas = false; if (btnGas) btnGas.classList.remove('active'); }
});
window.addEventListener('blur', function() {
  gas = false; brake = false;
  if (btnBrake) btnBrake.classList.remove('active');
  if (btnGas) btnGas.classList.remove('active');
});
document.addEventListener('visibilitychange', function() { lastT = 0; acc = 0; });
function startGame() {
  initAudio();
  sfx('click');
  if (overTimer) { clearTimeout(overTimer); overTimer = null; }
  if (startOverlay) startOverlay.classList.add('hidden');
  if (gameOverOverlay) gameOverOverlay.classList.add('hidden');
  initGame();
  state = 'playing';
  startEngine();
}
if (btnStart) btnStart.addEventListener('click', startGame);
if (btnRetry) btnRetry.addEventListener('click', startGame);
if (btnSound) btnSound.addEventListener('click', function(e) {
  e.stopPropagation();
  initAudio();
  isMuted = !isMuted;
  btnSound.textContent = isMuted ? '🔇' : '🔊';
  try { if (masterGain && audioCtx) masterGain.gain.setTargetAtTime(isMuted ? 0 : 0.9, audioCtx.currentTime, 0.03); } catch (err) {}
  if (isMuted) stopEngine();
  else if (state === 'playing') startEngine();
});
document.addEventListener('touchmove', function(e) { if (e.cancelable) e.preventDefault(); }, { passive: false });
bestEl.textContent = 'BEST ' + Math.floor(best) + 'm';
startBestEl.textContent = Math.floor(best) + 'm';
buildSprites();
initClouds();
initGame();
state = 'menu';
if (rafId) cancelAnimationFrame(rafId);
rafId = requestAnimationFrame(frame);
})();
</script>`;

const handler = async (m, { conn, sock }) => {
	const client = conn || sock;

	await client.relayMessage(
		m.chat,
		{
			messageContextInfo: {
				deviceListMetadata: {},
				deviceListMetadataVersion: 2,
				botMetadata: {
					messageDisclaimerText: "",
					botResponseId: "hillclimb-" + Date.now(),
					verificationMetadata: {
						proofs: [
							{
								version: 1,
								useCase: 1,
								signature: "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YeN55YRyad2+ZA==",
								certificateChain: [
									"TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg",
									"TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZLXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYbNBkuLoZnQAq4j8yRekrQ=="
								]
							}
						]
					}
				}
			},
			botForwardedMessage: {
				message: {
					richResponseMessage: {
						messageType: 1,
						submessages: [
							{
								messageType: 2,
								messageText: "Hill Climb Racing"
							}
						],
						unifiedResponse: {
							data: Buffer.from(JSON.stringify({
								"response_id": "hillclimb-" + Date.now(),
								"sections": [
									{
										"view_model": {
											"primitive": {
												"__typename": "GenAIaeacdsnwHtmlPrimitive",
												"payload": htmlPayload,
												"trusted_sources": [
													"hirara.dev"
												]
											},
											"__typename": "GenAISingleLayoutViewModel"
										}
									}
								]
							})).toString('base64')
						},
						contextInfo: {
							forwardingScore: 1,
							isForwarded: true,
							forwardedAiBotMessageInfo: {
								botJid: "867051314767696@bot"
							},
							forwardOrigin: 4
						}
					}
				}
			}
		},
		{}
	);
};

handler.help = ['hillclimb', 'hillclimbracing', 'hcr'];
handler.tags = ['game'];
handler.category = 'game';
handler.description = 'Main game Hill Climb Racing 2D physics interaktif via Hirara Rich Message (fixed: visual HD + smooth 60fps)';
handler.command = ['hillclimb', 'hillclimbracing', 'hcr', 'hillclimbgame'];

export default handler;