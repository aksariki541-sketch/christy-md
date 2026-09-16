// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/game/catur.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .catur, .chess, .gamecatur, .catur2d

const htmlPayload = `<style>
* { -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; box-sizing: border-box; }
body { margin: 0; background: #070a12; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #fff; touch-action: manipulation; overflow-x: hidden; }

.game-container { width: 100%; max-width: 440px; margin: auto; padding: 8px; }
.card-wrapper { background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6); position: relative; }

/* Header */
.header-bar { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.5) 100%); }
.brand-sub { font-size: 8.5px; letter-spacing: 1.5px; color: #94a3b8; font-weight: 800; text-transform: uppercase; display: flex; align-items: center; gap: 4px; }
.brand-title { font-size: 17px; font-weight: 900; color: #f8fafc; letter-spacing: -0.5px; display: flex; align-items: center; gap: 6px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
.header-actions { display: flex; align-items: center; gap: 8px; }
.icon-btn { background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.18); color: #f8fafc; border-radius: 10px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
.icon-btn:active { transform: scale(0.92); background: rgba(51, 65, 85, 0.9); }

/* Control & Mode toolbar */
.toolbar { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: rgba(0,0,0,0.25); border-bottom: 1px solid rgba(255,255,255,0.08); gap: 6px; }
.mode-switch { display: flex; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 2px; gap: 2px; }
.mode-btn { background: transparent; border: none; color: #94a3b8; font-size: 10px; font-weight: 800; padding: 5px 9px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s; }
.mode-btn.active { background: #3b82f6; color: #fff; box-shadow: 0 2px 8px rgba(59,130,246,0.5); }
.diff-select { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.12); color: #facc15; font-size: 10px; font-weight: 800; border-radius: 8px; padding: 4px 6px; outline: none; cursor: pointer; }

.action-tools { display: flex; gap: 5px; }
.tool-btn { background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.15); color: #f8fafc; border-radius: 8px; padding: 5px 8px; font-size: 10px; font-weight: 800; display: flex; align-items: center; gap: 4px; cursor: pointer; transition: all 0.15s; }
.tool-btn:active { transform: scale(0.92); }

/* Player bars */
.player-bar { padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.6); }
.player-info { display: flex; align-items: center; gap: 7px; }
.player-avatar { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; }
.avatar-b { background: #0f172a; border: 1.5px solid #64748b; color: #f8fafc; }
.avatar-w { background: #f8fafc; border: 1.5px solid #e2e8f0; color: #0f172a; }
.player-name { font-size: 11px; font-weight: 800; letter-spacing: 0.2px; display: flex; align-items: center; gap: 5px; }
.turn-badge { font-size: 8.5px; font-weight: 900; padding: 2px 6px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.turn-badge.active { background: #22c55e; color: #052e16; animation: pulseGlow 1.5s infinite; }
.turn-badge.waiting { background: rgba(255,255,255,0.1); color: #94a3b8; }
.captured-tray { display: flex; align-items: center; gap: 2px; min-height: 18px; font-size: 9px; font-weight: 800; color: #facc15; }
.captured-list { display: flex; align-items: center; flex-wrap: wrap; gap: 1px; max-width: 140px; }
.cap-mini { width: 14px; height: 14px; display: inline-block; }

/* Chess Board */
.board-wrapper { position: relative; width: 100%; aspect-ratio: 1 / 1; padding: 6px; background: rgba(0,0,0,0.35); }
.chess-board { width: 100%; height: 100%; display: grid; grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(8, 1fr); border-radius: 12px; overflow: hidden; border: 2px solid rgba(255,255,255,0.18); box-shadow: inset 0 0 20px rgba(0,0,0,0.6); position: relative; }
.square { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background-color 0.12s; }
.square.theme-dark { background-color: #698a4e; }
.square.theme-light { background-color: #ebecd0; }

.square.selected { background-color: rgba(250, 204, 21, 0.75) !important; }
.square.last-from, .square.last-to { background-color: rgba(202, 138, 4, 0.55) !important; }
.square.in-check { background-color: rgba(239, 68, 68, 0.85) !important; animation: checkPulse 1s infinite alternate; }

.coord-file, .coord-rank { position: absolute; font-size: 8px; font-weight: 900; line-height: 1; pointer-events: none; opacity: 0.65; }
.coord-file { bottom: 2px; right: 2px; }
.coord-rank { top: 2px; left: 2px; }
.square.theme-light .coord-file, .square.theme-light .coord-rank { color: #698a4e; }
.square.theme-dark .coord-file, .square.theme-dark .coord-rank { color: #ebecd0; }

/* Hints / Legal moves */
.move-dot { width: 30%; height: 30%; background: rgba(34, 197, 94, 0.7); border-radius: 50%; pointer-events: none; box-shadow: 0 0 8px rgba(34,197,94,0.6); }
.capture-ring { width: 85%; height: 85%; border: 3.5px solid rgba(239, 68, 68, 0.85); border-radius: 50%; pointer-events: none; box-shadow: 0 0 8px rgba(239,68,68,0.5); }

/* Pieces */
.piece { width: 90%; height: 90%; display: flex; align-items: center; justify-content: center; pointer-events: none; transition: transform 0.1s ease; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4)); }
.cp-svg { width: 100%; height: 100%; display: block; }

/* Footer status & move history */
.status-footer { padding: 8px 12px; background: rgba(15, 23, 42, 0.7); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 700; color: #cbd5e1; }
.history-chip { background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(255,255,255,0.12); padding: 3px 8px; border-radius: 8px; font-family: monospace; font-size: 11px; color: #facc15; font-weight: 800; }
.game-msg { display: flex; align-items: center; gap: 5px; font-size: 10.5px; }

/* Watermark Footer */
.wm-footer { padding: 6px 12px 8px; background: rgba(7, 10, 18, 0.95); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: center; align-items: center; gap: 6px; font-size: 9.5px; font-weight: 900; letter-spacing: 1px; color: #64748b; text-transform: uppercase; }
.wm-text { color: #facc15; letter-spacing: 1.2px; font-weight: 900; text-shadow: 0 0 10px rgba(250,204,21,0.3); }

/* Overlays / Modals */
.modal-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.93); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; z-index: 50; padding: 20px; text-align: center; border-radius: 20px; animation: modalFade 0.2s ease; }
.modal-overlay.hidden { display: none !important; }
.modal-title { font-size: 22px; font-weight: 900; color: #facc15; letter-spacing: -0.5px; margin: 0; display: flex; align-items: center; gap: 8px; }
.modal-desc { font-size: 12px; color: #cbd5e1; font-weight: 600; max-width: 260px; line-height: 1.4; }

.promo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 8px 0; width: 100%; max-width: 280px; }
.promo-btn { background: rgba(30, 41, 59, 0.9); border: 2px solid rgba(255,255,255,0.2); border-radius: 14px; padding: 10px 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; gap: 4px; }
.promo-btn:active { transform: scale(0.92); border-color: #facc15; background: rgba(250,204,21,0.15); }
.promo-lbl { font-size: 9px; font-weight: 900; color: #cbd5e1; }

.btn-primary { background: linear-gradient(180deg, #fde047 0%, #eab308 100%); color: #0f172a; border: none; font-size: 13px; font-weight: 900; padding: 10px 24px; border-radius: 24px; cursor: pointer; box-shadow: 0 6px 20px rgba(250,204,21,0.35); text-transform: uppercase; letter-spacing: 0.6px; display: flex; align-items: center; gap: 6px; }
.btn-primary:active { transform: scale(0.95); }

@keyframes modalFade { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 6px rgba(34,197,94,0.6); } 50% { box-shadow: 0 0 14px rgba(34,197,94,0.9); } }
@keyframes checkPulse { 0% { background-color: rgba(239, 68, 68, 0.7); } 100% { background-color: rgba(220, 38, 38, 0.95); } }
</style>

<body>
<div class="game-container">
 <div class="card-wrapper">
 <div class="header-bar">
 <div>
 <div class="brand-sub">
 <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
 HIRARA ARCADE 2D
 </div>
 <div class="brand-title">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="#facc15"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
 CHESS MASTER
 </div>
 </div>
 <div class="header-actions">
 <button id="btnSound" class="icon-btn" type="button" title="Audio">
 <svg id="iconSoundOn" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
 <svg id="iconSoundOff" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
 </button>
 </div>
 </div>

 <div class="toolbar">
 <div class="mode-switch">
 <button id="btnModeAI" class="mode-btn active" type="button">
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h.01M16 16h.01"/></svg>
 VS AI
 </button>
 <button id="btnMode2P" class="mode-btn" type="button">
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
 2 PLAYERS
 </button>
 </div>

 <select id="diffSelect" class="diff-select" title="Tingkat Kesulitan AI">
 <option value="1">EASY</option>
 <option value="2" selected>MEDIUM</option>
 <option value="3">HARD</option>
 </select>

 <div class="action-tools">
 <button id="btnFlip" class="tool-btn" type="button" title="Balik Papan">
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
 FLIP
 </button>
 <button id="btnUndo" class="tool-btn" type="button" title="Undo Langkah">
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
 UNDO
 </button>
 <button id="btnRestart" class="tool-btn" type="button" title="Reset Permainan">
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
 RESET
 </button>
 </div>
 </div>

 <div class="player-bar">
 <div class="player-info">
 <div id="topAvatar" class="player-avatar avatar-b">
 <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/></svg>
 </div>
 <div>
 <div id="topPlayerName" class="player-name">
 BLACK
 </div>
 <div id="topThinking" style="font-size: 8px; color: #38bdf8; display:none;">THINKING...</div>
 </div>
 <div id="topTurnBadge" class="turn-badge waiting">WAITING</div>
 </div>
 <div class="captured-tray">
 <div id="topCapAdv"></div>
 <div id="topCapturedList" class="captured-list"></div>
 </div>
 </div>

 <div class="board-wrapper">
 <div id="chessBoard" class="chess-board"></div>

 <div id="promoModal" class="modal-overlay hidden">
 <h2 class="modal-title">
 <svg width="22" height="22" viewBox="0 0 24 24" fill="#facc15"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/></svg>
 PROMOTION
 </h2>
 <div class="modal-desc">Pilih bidak promosi pion:</div>
 <div class="promo-grid">
 <button class="promo-btn" data-promo="Q" type="button">
 <div id="promoIconQ" style="width:36px; height:36px;"></div>
 <div class="promo-lbl">QUEEN</div>
 </button>
 <button class="promo-btn" data-promo="R" type="button">
 <div id="promoIconR" style="width:36px; height:36px;"></div>
 <div class="promo-lbl">ROOK</div>
 </button>
 <button class="promo-btn" data-promo="B" type="button">
 <div id="promoIconB" style="width:36px; height:36px;"></div>
 <div class="promo-lbl">BISHOP</div>
 </button>
 <button class="promo-btn" data-promo="N" type="button">
 <div id="promoIconN" style="width:36px; height:36px;"></div>
 <div class="promo-lbl">KNIGHT</div>
 </button>
 </div>
 </div>

 <div id="gameOverModal" class="modal-overlay hidden">
 <h2 id="modalGameOverTitle" class="modal-title">
 <svg width="24" height="24" viewBox="0 0 24 24" fill="#facc15"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
 CHECKMATE!
 </h2>
 <div id="modalGameOverDesc" class="modal-desc">White Wins by Checkmate!</div>
 <button id="btnPlayAgain" class="btn-primary" type="button">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
 PLAY AGAIN
 </button>
 </div>
 </div>

 <div class="player-bar">
 <div class="player-info">
 <div id="botAvatar" class="player-avatar avatar-w">
 <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/></svg>
 </div>
 <div>
 <div id="botPlayerName" class="player-name">
 WHITE
 </div>
 </div>
 <div id="botTurnBadge" class="turn-badge active">TURN</div>
 </div>
 <div class="captured-tray">
 <div id="botCapAdv"></div>
 <div id="botCapturedList" class="captured-list"></div>
 </div>
 </div>

 <div class="status-footer">
 <div id="gameMsg" class="game-msg">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
 <span id="statusTxt">Your turn</span>
 </div>
 <div id="lastMoveChip" class="history-chip">-</div>
 </div>

 <div id="wmContainer" class="wm-footer">
 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
 <span id="wmAnchor"></span>
 </div>
 </div>
</div>

<script>
(function() {
 var _0xwm = [117,110,23,101,126,124,126,23,121,118,124,118,121,120,23,122,126,124,98];
 function _d(arr, k) { return arr.map(function(c) { return String.fromCharCode(c ^ k); }).join(''); }
 var _wmStr = _d(_0xwm, 0x37);
 
 var wmEl = document.getElementById('wmAnchor');
 if (wmEl) {
 wmEl.textContent = _wmStr;
 wmEl.className = 'wm-text';
 }

 var audioCtx = null;
 var isMuted = false;

 function initAudio() {
 if (!audioCtx) {
 var AudioContextClass = window.AudioContext || window.webkitAudioContext;
 if (AudioContextClass) audioCtx = new AudioContextClass();
 }
 if (audioCtx && audioCtx.state === 'suspended') {
 audioCtx.resume();
 }
 }

 function playSound(type) {
 if (isMuted) return;
 initAudio();
 if (!audioCtx) return;
 var t = audioCtx.currentTime;

 try {
 if (type === 'move') {
 var osc = audioCtx.createOscillator();
 var gain = audioCtx.createGain();
 osc.type = 'triangle';
 osc.frequency.setValueAtTime(140, t);
 osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
 gain.gain.setValueAtTime(0.3, t);
 gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
 osc.connect(gain); gain.connect(audioCtx.destination);
 osc.start(t); osc.stop(t + 0.08);
 } else if (type === 'capture') {
 var osc = audioCtx.createOscillator();
 var gain = audioCtx.createGain();
 osc.type = 'sawtooth';
 osc.frequency.setValueAtTime(260, t);
 osc.frequency.exponentialRampToValueAtTime(60, t + 0.14);
 gain.gain.setValueAtTime(0.4, t);
 gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
 osc.connect(gain); gain.connect(audioCtx.destination);
 osc.start(t); osc.stop(t + 0.14);
 } else if (type === 'check') {
 var osc = audioCtx.createOscillator();
 var gain = audioCtx.createGain();
 osc.type = 'sine';
 osc.frequency.setValueAtTime(587.33, t);
 osc.frequency.setValueAtTime(880, t + 0.1);
 gain.gain.setValueAtTime(0.3, t);
 gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
 osc.connect(gain); gain.connect(audioCtx.destination);
 osc.start(t); osc.stop(t + 0.35);
 } else if (type === 'castle') {
 var osc1 = audioCtx.createOscillator();
 var gain1 = audioCtx.createGain();
 osc1.type = 'triangle';
 osc1.frequency.setValueAtTime(160, t);
 osc1.frequency.exponentialRampToValueAtTime(60, t + 0.08);
 gain1.gain.setValueAtTime(0.25, t);
 gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
 osc1.connect(gain1); gain1.connect(audioCtx.destination);
 osc1.start(t); osc1.stop(t + 0.08);

 var osc2 = audioCtx.createOscillator();
 var gain2 = audioCtx.createGain();
 osc2.type = 'triangle';
 osc2.frequency.setValueAtTime(200, t + 0.1);
 osc2.frequency.exponentialRampToValueAtTime(80, t + 0.18);
 gain2.gain.setValueAtTime(0.25, t + 0.1);
 gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
 osc2.connect(gain2); gain2.connect(audioCtx.destination);
 osc2.start(t + 0.1); osc2.stop(t + 0.18);
 } else if (type === 'win') {
 var notes = [523.25, 659.25, 783.99, 1046.50];
 notes.forEach(function(freq, idx) {
 var osc = audioCtx.createOscillator();
 var gain = audioCtx.createGain();
 osc.type = 'sine';
 osc.frequency.setValueAtTime(freq, t + idx * 0.1);
 gain.gain.setValueAtTime(0.25, t + idx * 0.1);
 gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.1 + 0.3);
 osc.connect(gain); gain.connect(audioCtx.destination);
 osc.start(t + idx * 0.1); osc.stop(t + idx * 0.1 + 0.3);
 });
 }
 } catch(e) {}
 }

 var pieceSVGs = {
 wP: '<svg viewBox="0 0 45 45" class="cp-svg"><g fill="#ffffff" stroke="#1e293b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 9a4 4 0 1 0 0 8 4 4 0 1 0 0-8z"/><path d="M12 35c2-2 4-3 5.5-5 1.5-2 2-4 2-8h6c0 4 .5 6 2 8 1.5 2 3.5 3 5.5 5H12z"/><path d="M11 39h23v-4H11v4z"/><path d="M12 35h21"/></g></svg>',
 wN: '<svg viewBox="0 0 45 45" class="cp-svg"><g fill="#ffffff" stroke="#1e293b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-4.04 0-3-1 0-.71 5.48-4.5 5.5l-1.5-1c-.5-1.5 2-3.5 1-4.5s-2-2-1.5-3.5c1-1.5 2.5-1.2 3.5-1.5 1.5-.5 3-2 3-3.5s0-4 3-4c4.5 0 7 2.5 10 2z"/><circle cx="15.5" cy="15.5" r="1.5" fill="#1e293b"/><circle cx="21" cy="9" r="1" fill="#1e293b"/></g></svg>',
 wB: '<svg viewBox="0 0 45 45" class="cp-svg"><g fill="#ffffff" stroke="#1e293b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.5"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5m-3-2.5h6"/></g></svg>',
 wR: '<svg viewBox="0 0 45 45" class="cp-svg"><g fill="#ffffff" stroke="#1e293b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3"/><path d="M14 17v12h17V17H14z"/><path d="M14 29l-3 3h23l-3-3H14z"/><path d="M14 17h17"/></g></svg>',
 wQ: '<svg viewBox="0 0 45 45" class="cp-svg"><g fill="#ffffff" stroke="#1e293b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="7.5" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L14 11v14L7 14l2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0m-21.5 3.5c3.5-1 17.5-1 21 0m-21 3.5c3.5-1 17.5-1 21 0"/></g></svg>',
 wK: '<svg viewBox="0 0 45 45" class="cp-svg"><g fill="#ffffff" stroke="#1e293b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7z"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></svg>',

 bP: '<svg viewBox="0 0 45 45" class="cp-svg"><g fill="#0f172a" stroke="#e2e8f0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 9a4 4 0 1 0 0 8 4 4 0 1 0 0-8z"/><path d="M12 35c2-2 4-3 5.5-5 1.5-2 2-4 2-8h6c0 4 .5 6 2 8 1.5 2 3.5 3 5.5 5H12z"/><path d="M11 39h23v-4H11v4z"/><path d="M12 35h21" stroke="#94a3b8"/></g></svg>',
 bN: '<svg viewBox="0 0 45 45" class="cp-svg"><g fill="#0f172a" stroke="#e2e8f0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-4.04 0-3-1 0-.71 5.48-4.5 5.5l-1.5-1c-.5-1.5 2-3.5 1-4.5s-2-2-1.5-3.5c1-1.5 2.5-1.2 3.5-1.5 1.5-.5 3-2 3-3.5s0-4 3-4c4.5 0 7 2.5 10 2z"/><circle cx="15.5" cy="15.5" r="1.5" fill="#38bdf8"/><circle cx="21" cy="9" r="1" fill="#38bdf8"/></g></svg>',
 bB: '<svg viewBox="0 0 45 45" class="cp-svg"><g fill="#0f172a" stroke="#e2e8f0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.5"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5m-3-2.5h6" stroke="#94a3b8"/></g></svg>',
 bR: '<svg viewBox="0 0 45 45" class="cp-svg"><g fill="#0f172a" stroke="#e2e8f0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3"/><path d="M14 17v12h17V17H14z"/><path d="M14 29l-3 3h23l-3-3H14z"/><path d="M14 17h17" stroke="#94a3b8"/></g></svg>',
 bQ: '<svg viewBox="0 0 45 45" class="cp-svg"><g fill="#0f172a" stroke="#e2e8f0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="7.5" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L14 11v14L7 14l2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0m-21.5 3.5c3.5-1 17.5-1 21 0m-21 3.5c3.5-1 17.5-1 21 0" stroke="#94a3b8"/></g></svg>',
 bK: '<svg viewBox="0 0 45 45" class="cp-svg"><g fill="#0f172a" stroke="#e2e8f0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7z"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#94a3b8"/></g></svg>'
 };

 ['Q','R','B','N'].forEach(function(p) {
 var el = document.getElementById('promoIcon' + p);
 if (el) el.innerHTML = pieceSVGs['w' + p];
 });

 var PIECE_VALUES = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

 var PST = {
 P: [
 [ 0, 0, 0, 0, 0, 0, 0, 0],
 [50, 50, 50, 50, 50, 50, 50, 50],
 [10, 10, 20, 30, 30, 20, 10, 10],
 [ 5, 5, 10, 25, 25, 10, 5, 5],
 [ 0, 0, 0, 20, 20, 0, 0, 0],
 [ 5, -5,-10, 0, 0,-10, -5, 5],
 [ 5, 10, 10,-20,-20, 10, 10, 5],
 [ 0, 0, 0, 0, 0, 0, 0, 0]
 ],
 N: [
 [-50,-40,-30,-30,-30,-30,-40,-50],
 [-40,-20, 0, 0, 0, 0,-20,-40],
 [-30, 0, 10, 15, 15, 10, 0,-30],
 [-30, 5, 15, 20, 20, 15, 5,-30],
 [-30, 0, 15, 20, 20, 15, 0,-30],
 [-30, 5, 10, 15, 15, 10, 5,-30],
 [-40,-20, 0, 5, 5, 0,-20,-40],
 [-50,-40,-30,-30,-30,-30,-40,-50]
 ],
 B: [
 [-20,-10,-10,-10,-10,-10,-10,-20],
 [-10, 0, 0, 0, 0, 0, 0,-10],
 [-10, 0, 5, 10, 10, 5, 0,-10],
 [-10, 5, 5, 10, 10, 5, 5,-10],
 [-10, 0, 10, 10, 10, 10, 0,-10],
 [-10, 10, 10, 10, 10, 10, 10,-10],
 [-10, 5, 0, 0, 0, 0, 5,-10],
 [-20,-10,-10,-10,-10,-10,-10,-20]
 ],
 R: [
 [ 0, 0, 0, 0, 0, 0, 0, 0],
 [ 5, 10, 10, 10, 10, 10, 10, 5],
 [ -5, 0, 0, 0, 0, 0, 0, -5],
 [ -5, 0, 0, 0, 0, 0, 0, -5],
 [ -5, 0, 0, 0, 0, 0, 0, -5],
 [ -5, 0, 0, 0, 0, 0, 0, -5],
 [ -5, 0, 0, 0, 0, 0, 0, -5],
 [ 0, 0, 0, 5, 5, 0, 0, 0]
 ],
 Q: [
 [-20,-10,-10, -5, -5,-10,-10,-20],
 [-10, 0, 0, 0, 0, 0, 0,-10],
 [-10, 0, 5, 5, 5, 5, 0,-10],
 [ -5, 0, 5, 5, 5, 5, 0, -5],
 [ 0, 0, 5, 5, 5, 5, 0, -5],
 [-10, 5, 5, 5, 5, 5, 0,-10],
 [-10, 0, 5, 0, 0, 0, 0,-10],
 [-20,-10,-10, -5, -5,-10,-10,-20]
 ],
 K: [
 [-30,-40,-40,-50,-50,-40,-40,-30],
 [-30,-40,-40,-50,-50,-40,-40,-30],
 [-30,-40,-40,-50,-50,-40,-40,-30],
 [-30,-40,-40,-50,-50,-40,-40,-30],
 [-20,-30,-30,-40,-40,-30,-30,-20],
 [-10,-20,-20,-20,-20,-20,-20,-10],
 [ 20, 20, 0, 0, 0, 0, 20, 20],
 [ 20, 30, 10, 0, 0, 10, 30, 20]
 ]
 };

 function ChessGame() {
 this.reset();
 }

 ChessGame.prototype.reset = function() {
 this.board = [
 ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
 ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
 [null, null, null, null, null, null, null, null],
 [null, null, null, null, null, null, null, null],
 [null, null, null, null, null, null, null, null],
 [null, null, null, null, null, null, null, null],
 ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
 ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
 ];
 this.turn = 'w';
 this.castling = { wK: true, wQ: true, bK: true, bQ: true };
 this.enPassant = null;
 this.halfMoves = 0;
 this.history = [];
 this.captured = { w: [], b: [] };
 };

 ChessGame.prototype.findKing = function(color) {
 var target = color + 'K';
 for (var r = 0; r < 8; r++) {
 for (var c = 0; c < 8; c++) {
 if (this.board[r][c] === target) return { r: r, c: c };
 }
 }
 return null;
 };

 ChessGame.prototype.isSquareAttacked = function(r, c, byColor) {
 var pawnDir = byColor === 'w' ? 1 : -1;
 var pr = r + pawnDir;
 if (pr >= 0 && pr < 8) {
 if (c - 1 >= 0 && this.board[pr][c - 1] === byColor + 'P') return true;
 if (c + 1 < 8 && this.board[pr][c + 1] === byColor + 'P') return true;
 }

 var kMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
 for (var i = 0; i < kMoves.length; i++) {
 var nr = r + kMoves[i][0], nc = c + kMoves[i][1];
 if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
 if (this.board[nr][nc] === byColor + 'N') return true;
 }
 }

 var kingMoves = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
 for (var i = 0; i < kingMoves.length; i++) {
 var nr = r + kingMoves[i][0], nc = c + kingMoves[i][1];
 if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
 if (this.board[nr][nc] === byColor + 'K') return true;
 }
 }

 var straightDirs = [[-1,0],[1,0],[0,-1],[0,1]];
 for (var i = 0; i < straightDirs.length; i++) {
 var dr = straightDirs[i][0], dc = straightDirs[i][1];
 var nr = r + dr, nc = c + dc;
 while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
 var p = this.board[nr][nc];
 if (p) {
 if (p === byColor + 'R' || p === byColor + 'Q') return true;
 break;
 }
 nr += dr; nc += dc;
 }
 }

 var diagDirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
 for (var i = 0; i < diagDirs.length; i++) {
 var dr = diagDirs[i][0], dc = diagDirs[i][1];
 var nr = r + dr, nc = c + dc;
 while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
 var p = this.board[nr][nc];
 if (p) {
 if (p === byColor + 'B' || p === byColor + 'Q') return true;
 break;
 }
 nr += dr; nc += dc;
 }
 }

 return false;
 };

 ChessGame.prototype.isKingInCheck = function(color) {
 var king = this.findKing(color);
 if (!king) return false;
 var enemyColor = color === 'w' ? 'b' : 'w';
 return this.isSquareAttacked(king.r, king.c, enemyColor);
 };

 ChessGame.prototype.getPseudoMoves = function(color) {
 var moves = [];
 var enemyColor = color === 'w' ? 'b' : 'w';

 for (var r = 0; r < 8; r++) {
 for (var c = 0; c < 8; c++) {
 var p = this.board[r][c];
 if (!p || p[0] !== color) continue;
 var type = p[1];

 if (type === 'P') {
 var dir = color === 'w' ? -1 : 1;
 var startRow = color === 'w' ? 6 : 1;
 var promoRow = color === 'w' ? 0 : 7;

 var nextR = r + dir;
 if (nextR >= 0 && nextR < 8 && !this.board[nextR][c]) {
 if (nextR === promoRow) {
 ['Q', 'R', 'B', 'N'].forEach(function(promo) {
 moves.push({ from: { r: r, c: c }, to: { r: nextR, c: c }, promo: promo });
 });
 } else {
 moves.push({ from: { r: r, c: c }, to: { r: nextR, c: c } });
 var next2R = r + dir * 2;
 if (r === startRow && !this.board[next2R][c]) {
 moves.push({ from: { r: r, c: c }, to: { r: next2R, c: c }, isDoublePawn: true });
 }
 }
 }

 var dcs = [-1, 1];
 for (var i = 0; i < dcs.length; i++) {
 var capC = c + dcs[i];
 if (capC >= 0 && capC < 8 && nextR >= 0 && nextR < 8) {
 var target = this.board[nextR][capC];
 if (target && target[0] === enemyColor) {
 if (nextR === promoRow) {
 ['Q', 'R', 'B', 'N'].forEach(function(promo) {
 moves.push({ from: { r: r, c: c }, to: { r: nextR, c: capC }, promo: promo, capture: target });
 });
 } else {
 moves.push({ from: { r: r, c: c }, to: { r: nextR, c: capC }, capture: target });
 }
 } else if (this.enPassant && this.enPassant.r === nextR && this.enPassant.c === capC) {
 moves.push({ from: { r: r, c: c }, to: { r: nextR, c: capC }, isEnPassant: true, capture: enemyColor + 'P' });
 }
 }
 }
 } else if (type === 'N') {
 var jumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
 for (var i = 0; i < jumps.length; i++) {
 var nr = r + jumps[i][0], nc = c + jumps[i][1];
 if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
 var target = this.board[nr][nc];
 if (!target) moves.push({ from: { r: r, c: c }, to: { r: nr, c: nc } });
 else if (target[0] === enemyColor) moves.push({ from: { r: r, c: c }, to: { r: nr, c: nc }, capture: target });
 }
 }
 } else if (type === 'B' || type === 'R' || type === 'Q') {
 var dirs = [];
 if (type === 'B' || type === 'Q') dirs.push([-1,-1],[-1,1],[1,-1],[1,1]);
 if (type === 'R' || type === 'Q') dirs.push([-1,0],[1,0],[0,-1],[0,1]);

 for (var i = 0; i < dirs.length; i++) {
 var dr = dirs[i][0], dc = dirs[i][1];
 var nr = r + dr, nc = c + dc;
 while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
 var target = this.board[nr][nc];
 if (!target) {
 moves.push({ from: { r: r, c: c }, to: { r: nr, c: nc } });
 } else {
 if (target[0] === enemyColor) moves.push({ from: { r: r, c: c }, to: { r: nr, c: nc }, capture: target });
 break;
 }
 nr += dr; nc += dc;
 }
 }
 } else if (type === 'K') {
 var kingMoves = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
 for (var i = 0; i < kingMoves.length; i++) {
 var nr = r + kingMoves[i][0], nc = c + kingMoves[i][1];
 if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
 var target = this.board[nr][nc];
 if (!target) moves.push({ from: { r: r, c: c }, to: { r: nr, c: nc } });
 else if (target[0] === enemyColor) moves.push({ from: { r: r, c: c }, to: { r: nr, c: nc }, capture: target });
 }
 }

 if (color === 'w' && r === 7 && c === 4) {
 if (this.castling.wK && !this.board[7][5] && !this.board[7][6] && this.board[7][7] === 'wR') {
 if (!this.isSquareAttacked(7, 4, 'b') && !this.isSquareAttacked(7, 5, 'b') && !this.isSquareAttacked(7, 6, 'b')) {
 moves.push({ from: { r: 7, c: 4 }, to: { r: 7, c: 6 }, isCastleK: true });
 }
 }
 if (this.castling.wQ && !this.board[7][3] && !this.board[7][2] && !this.board[7][1] && this.board[7][0] === 'wR') {
 if (!this.isSquareAttacked(7, 4, 'b') && !this.isSquareAttacked(7, 3, 'b') && !this.isSquareAttacked(7, 2, 'b')) {
 moves.push({ from: { r: 7, c: 4 }, to: { r: 7, c: 2 }, isCastleQ: true });
 }
 }
 } else if (color === 'b' && r === 0 && c === 4) {
 if (this.castling.bK && !this.board[0][5] && !this.board[0][6] && this.board[0][7] === 'bR') {
 if (!this.isSquareAttacked(0, 4, 'w') && !this.isSquareAttacked(0, 5, 'w') && !this.isSquareAttacked(0, 6, 'w')) {
 moves.push({ from: { r: 0, c: 4 }, to: { r: 0, c: 6 }, isCastleK: true });
 }
 }
 if (this.castling.bQ && !this.board[0][3] && !this.board[0][2] && !this.board[0][1] && this.board[0][0] === 'bR') {
 if (!this.isSquareAttacked(0, 4, 'w') && !this.isSquareAttacked(0, 3, 'w') && !this.isSquareAttacked(0, 2, 'w')) {
 moves.push({ from: { r: 0, c: 4 }, to: { r: 0, c: 2 }, isCastleQ: true });
 }
 }
 }
 }
 }
 }
 return moves;
 };

 ChessGame.prototype.getLegalMoves = function(color) {
 var self = this;
 var targetColor = color || this.turn;
 var pseudo = this.getPseudoMoves(targetColor);
 return pseudo.filter(function(m) { return self.makeMove(m, true); });
 };

 ChessGame.prototype.makeMove = function(move, testOnly) {
 var from = move.from, to = move.to, promo = move.promo, isDoublePawn = move.isDoublePawn, isEnPassant = move.isEnPassant, isCastleK = move.isCastleK, isCastleQ = move.isCastleQ;
 var piece = this.board[from.r][from.c];
 if (!piece) return false;
 var color = piece[0];

 var prevPieceTo = this.board[to.r][to.c];
 var prevCastling = { wK: this.castling.wK, wQ: this.castling.wQ, bK: this.castling.bK, bQ: this.castling.bQ };
 var prevEnPassant = this.enPassant ? { r: this.enPassant.r, c: this.enPassant.c } : null;
 var prevHalfMoves = this.halfMoves;
 var epPawnRow = null, epPawnCol = null, epPiece = null;

 this.board[from.r][from.c] = null;
 var placedPiece = piece;
 if (promo) placedPiece = color + promo;
 this.board[to.r][to.c] = placedPiece;

 if (isEnPassant) {
 epPawnRow = color === 'w' ? to.r + 1 : to.r - 1;
 epPawnCol = to.c;
 epPiece = this.board[epPawnRow][epPawnCol];
 this.board[epPawnRow][epPawnCol] = null;
 }

 if (isCastleK) {
 if (color === 'w') { this.board[7][7] = null; this.board[7][5] = 'wR'; }
 else { this.board[0][7] = null; this.board[0][5] = 'bR'; }
 }

 if (isCastleQ) {
 if (color === 'w') { this.board[7][0] = null; this.board[7][3] = 'wR'; }
 else { this.board[0][0] = null; this.board[0][3] = 'bR'; }
 }

 var inCheck = this.isKingInCheck(color);

 if (testOnly || inCheck) {
 this.board[from.r][from.c] = piece;
 this.board[to.r][to.c] = prevPieceTo;
 if (isEnPassant) this.board[epPawnRow][epPawnCol] = epPiece;
 if (isCastleK) {
 if (color === 'w') { this.board[7][7] = 'wR'; this.board[7][5] = null; }
 else { this.board[0][7] = 'bR'; this.board[0][5] = null; }
 }
 if (isCastleQ) {
 if (color === 'w') { this.board[7][0] = 'wR'; this.board[7][3] = null; }
 else { this.board[0][0] = 'bR'; this.board[0][3] = null; }
 }
 this.castling = prevCastling;
 this.enPassant = prevEnPassant;
 return !inCheck;
 }

 if (piece === 'wK') { this.castling.wK = false; this.castling.wQ = false; }
 if (piece === 'bK') { this.castling.bK = false; this.castling.bQ = false; }
 if (piece === 'wR' && from.r === 7 && from.c === 7) this.castling.wK = false;
 if (piece === 'wR' && from.r === 7 && from.c === 0) this.castling.wQ = false;
 if (piece === 'bR' && from.r === 0 && from.c === 7) this.castling.bK = false;
 if (piece === 'bR' && from.r === 0 && from.c === 0) this.castling.bQ = false;

 if (isDoublePawn) {
 this.enPassant = { r: (from.r + to.r) / 2, c: from.c };
 } else {
 this.enPassant = null;
 }

 if (prevPieceTo) {
 var capColor = prevPieceTo[0];
 this.captured[capColor].push(prevPieceTo);
 this.halfMoves = 0;
 } else if (isEnPassant) {
 this.captured[color === 'w' ? 'b' : 'w'].push(epPiece);
 this.halfMoves = 0;
 } else if (piece[1] === 'P') {
 this.halfMoves = 0;
 } else {
 this.halfMoves++;
 }

 var enemy = color === 'w' ? 'b' : 'w';
 this.turn = enemy;
 this.history.push({
 move: move,
 piece: piece,
 capturedPiece: prevPieceTo || (isEnPassant ? epPiece : null),
 prevCastling: prevCastling,
 prevEnPassant: prevEnPassant,
 prevHalfMoves: prevHalfMoves
 });

 return true;
 };

 ChessGame.prototype.undo = function() {
 if (!this.history.length) return false;
 var last = this.history.pop();
 var move = last.move, piece = last.piece, capturedPiece = last.capturedPiece, prevCastling = last.prevCastling, prevEnPassant = last.prevEnPassant, prevHalfMoves = last.prevHalfMoves;
 var from = move.from, to = move.to, isEnPassant = move.isEnPassant, isCastleK = move.isCastleK, isCastleQ = move.isCastleQ;
 var color = piece[0];

 this.board[from.r][from.c] = piece;
 this.board[to.r][to.c] = null;

 if (capturedPiece) {
 if (isEnPassant) {
 var epPawnRow = color === 'w' ? to.r + 1 : to.r - 1;
 this.board[epPawnRow][to.c] = capturedPiece;
 var capColor = capturedPiece[0];
 var idx = this.captured[capColor].lastIndexOf(capturedPiece);
 if (idx !== -1) this.captured[capColor].splice(idx, 1);
 } else {
 this.board[to.r][to.c] = capturedPiece;
 var capColor = capturedPiece[0];
 var idx = this.captured[capColor].lastIndexOf(capturedPiece);
 if (idx !== -1) this.captured[capColor].splice(idx, 1);
 }
 }

 if (isCastleK) {
 if (color === 'w') { this.board[7][7] = 'wR'; this.board[7][5] = null; }
 else { this.board[0][7] = 'bR'; this.board[0][5] = null; }
 }
 if (isCastleQ) {
 if (color === 'w') { this.board[7][0] = 'wR'; this.board[7][3] = null; }
 else { this.board[0][0] = 'bR'; this.board[0][3] = null; }
 }

 this.castling = prevCastling;
 this.enPassant = prevEnPassant;
 this.halfMoves = prevHalfMoves;
 this.turn = color;
 return true;
 };

 ChessGame.prototype.getStatus = function() {
 var legal = this.getLegalMoves(this.turn);
 var inCheck = this.isKingInCheck(this.turn);
 if (legal.length === 0) {
 if (inCheck) return { status: 'checkmate', winner: this.turn === 'w' ? 'b' : 'w' };
 else return { status: 'stalemate', winner: null };
 }
 if (this.halfMoves >= 100) return { status: 'draw_50moves', winner: null };
 return { status: inCheck ? 'check' : 'active', winner: null };
 };

 function evaluateBoard(game) {
 var score = 0;
 for (var r = 0; r < 8; r++) {
 for (var c = 0; c < 8; c++) {
 var p = game.board[r][c];
 if (!p) continue;
 var color = p[0];
 var type = p[1];
 var val = PIECE_VALUES[type] || 0;
 var posVal = 0;
 if (PST[type]) {
 posVal = color === 'w' ? PST[type][r][c] : PST[type][7 - r][c];
 }
 var total = val + posVal;
 score += color === 'w' ? total : -total;
 }
 }
 return score;
 }

 function minimax(game, depth, alpha, beta, isMaximizing) {
 var status = game.getStatus();
 if (status.status === 'checkmate') {
 return isMaximizing ? -100000 + depth : 100000 - depth;
 }
 if (status.status === 'stalemate' || status.status === 'draw_50moves') return 0;
 if (depth === 0) return evaluateBoard(game);

 var moves = game.getLegalMoves(isMaximizing ? 'w' : 'b');
 if (moves.length === 0) return 0;

 moves.sort(function(a, b) {
 var aCap = a.capture ? PIECE_VALUES[a.capture[1]] || 50 : 0;
 var bCap = b.capture ? PIECE_VALUES[b.capture[1]] || 50 : 0;
 return bCap - aCap;
 });

 if (isMaximizing) {
 var maxEval = -Infinity;
 for (var i = 0; i < moves.length; i++) {
 game.makeMove(moves[i]);
 var evalVal = minimax(game, depth - 1, alpha, beta, false);
 game.undo();
 maxEval = Math.max(maxEval, evalVal);
 alpha = Math.max(alpha, evalVal);
 if (beta <= alpha) break;
 }
 return maxEval;
 } else {
 var minEval = Infinity;
 for (var i = 0; i < moves.length; i++) {
 game.makeMove(moves[i]);
 var evalVal = minimax(game, depth - 1, alpha, beta, true);
 game.undo();
 minEval = Math.min(minEval, evalVal);
 beta = Math.min(beta, evalVal);
 if (beta <= alpha) break;
 }
 return minEval;
 }
 }

 function getBestMove(game, depth) {
 var searchDepth = depth || 2;
 var isWhite = game.turn === 'w';
 var moves = game.getLegalMoves(game.turn);
 if (!moves.length) return null;

 moves.sort(function(a, b) {
 var aCap = a.capture ? PIECE_VALUES[a.capture[1]] || 50 : 0;
 var bCap = b.capture ? PIECE_VALUES[b.capture[1]] || 50 : 0;
 return bCap - aCap;
 });

 var bestMoves = [];
 var bestVal = isWhite ? -Infinity : Infinity;

 for (var i = 0; i < moves.length; i++) {
 var move = moves[i];
 game.makeMove(move);
 var val = minimax(game, searchDepth - 1, -Infinity, Infinity, !isWhite);
 if (searchDepth === 1) val += (Math.random() * 40 - 20);
 game.undo();

 if (isWhite) {
 if (val > bestVal) {
 bestVal = val;
 bestMoves = [move];
 } else if (val === bestVal) {
 bestMoves.push(move);
 }
 } else {
 if (val < bestVal) {
 bestVal = val;
 bestMoves = [move];
 } else if (val === bestVal) {
 bestMoves.push(move);
 }
 }
 }

 return bestMoves[Math.floor(Math.random() * bestMoves.length)] || moves[0];
 }

 var FILES = ['a','b','c','d','e','f','g','h'];
 function formatNotation(move, piece) {
 if (move.isCastleK) return 'O-O';
 if (move.isCastleQ) return 'O-O-O';
 var type = piece[1];
 var toStr = FILES[move.to.c] + (8 - move.to.r);
 var pieceChar = type === 'P' ? '' : type;
 var cap = move.capture ? 'x' : '';
 var promo = move.promo ? '=' + move.promo : '';
 return pieceChar + (type === 'P' && move.capture ? FILES[move.from.c] : '') + cap + toStr + promo;
 }

 var game = new ChessGame();
 var gameMode = 'ai';
 var aiDifficulty = 2;
 var isFlipped = false;
 var selectedSquare = null;
 var legalMovesForSelected = [];
 var pendingPromoMove = null;
 var isAiThinking = false;

 var chessBoardEl = document.getElementById('chessBoard');
 var btnSound = document.getElementById('btnSound');
 var iconSoundOn = document.getElementById('iconSoundOn');
 var iconSoundOff = document.getElementById('iconSoundOff');
 var btnModeAI = document.getElementById('btnModeAI');
 var btnMode2P = document.getElementById('btnMode2P');
 var diffSelect = document.getElementById('diffSelect');
 var btnFlip = document.getElementById('btnFlip');
 var btnUndo = document.getElementById('btnUndo');
 var btnRestart = document.getElementById('btnRestart');
 var topPlayerName = document.getElementById('topPlayerName');
 var botPlayerName = document.getElementById('botPlayerName');
 var topTurnBadge = document.getElementById('topTurnBadge');
 var botTurnBadge = document.getElementById('botTurnBadge');
 var topThinking = document.getElementById('topThinking');
 var topCapturedList = document.getElementById('topCapturedList');
 var botCapturedList = document.getElementById('botCapturedList');
 var topCapAdv = document.getElementById('topCapAdv');
 var botCapAdv = document.getElementById('botCapAdv');
 var statusTxt = document.getElementById('statusTxt');
 var lastMoveChip = document.getElementById('lastMoveChip');
 var promoModal = document.getElementById('promoModal');
 var gameOverModal = document.getElementById('gameOverModal');
 var modalGameOverTitle = document.getElementById('modalGameOverTitle');
 var modalGameOverDesc = document.getElementById('modalGameOverDesc');
 var btnPlayAgain = document.getElementById('btnPlayAgain');

 function renderBoard() {
 chessBoardEl.innerHTML = '';
 var status = game.getStatus();
 var kingInCheck = status.status === 'check' || status.status === 'checkmate';
 var checkedKingCoord = kingInCheck ? game.findKing(game.turn) : null;
 var lastHist = game.history[game.history.length - 1];
 var lastMove = lastHist ? lastHist.move : null;

 for (var rowIdx = 0; rowIdx < 8; rowIdx++) {
 for (var colIdx = 0; colIdx < 8; colIdx++) {
 var r = isFlipped ? 7 - rowIdx : rowIdx;
 var c = isFlipped ? 7 - colIdx : colIdx;
 var piece = game.board[r][c];

 var sq = document.createElement('div');
 var isDark = (r + c) % 2 === 1;
 sq.className = 'square ' + (isDark ? 'theme-dark' : 'theme-light');
 sq.dataset.r = r;
 sq.dataset.c = c;

 if (lastMove) {
 if (lastMove.from.r === r && lastMove.from.c === c) sq.classList.add('last-from');
 if (lastMove.to.r === r && lastMove.to.c === c) sq.classList.add('last-to');
 }

 if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
 sq.classList.add('selected');
 }

 if (checkedKingCoord && checkedKingCoord.r === r && checkedKingCoord.c === c) {
 sq.classList.add('in-check');
 }

 if (colIdx === 7) {
 var rankLbl = document.createElement('span');
 rankLbl.className = 'coord-rank';
 rankLbl.textContent = 8 - r;
 sq.appendChild(rankLbl);
 }
 if (rowIdx === 7) {
 var fileLbl = document.createElement('span');
 fileLbl.className = 'coord-file';
 fileLbl.textContent = FILES[c];
 sq.appendChild(fileLbl);
 }

 var legalDest = null;
 for (var k = 0; k < legalMovesForSelected.length; k++) {
 if (legalMovesForSelected[k].to.r === r && legalMovesForSelected[k].to.c === c) {
 legalDest = legalMovesForSelected[k];
 break;
 }
 }

 if (legalDest) {
 var hint = document.createElement('div');
 hint.className = (piece || legalDest.isEnPassant) ? 'capture-ring' : 'move-dot';
 sq.appendChild(hint);
 }

 if (piece) {
 var pEl = document.createElement('div');
 pEl.className = 'piece';
 pEl.innerHTML = pieceSVGs[piece] || '';
 sq.appendChild(pEl);
 }

 (function(row, col) {
 sq.addEventListener('click', function() { onSquareClick(row, col); });
 })(r, c);

 chessBoardEl.appendChild(sq);
 }
 }

 updateUIStatus(status);
 }

 function updateUIStatus(status) {
 var isWhiteTurn = game.turn === 'w';

 if (isWhiteTurn) {
 botTurnBadge.className = 'turn-badge active';
 botTurnBadge.textContent = 'TURN';
 topTurnBadge.className = 'turn-badge waiting';
 topTurnBadge.textContent = 'WAITING';
 } else {
 topTurnBadge.className = 'turn-badge active';
 topTurnBadge.textContent = 'TURN';
 botTurnBadge.className = 'turn-badge waiting';
 botTurnBadge.textContent = 'WAITING';
 }

 if (gameMode === 'ai') {
 topPlayerName.textContent = 'AI BOT [' + (aiDifficulty === 1 ? 'EASY' : (aiDifficulty === 2 ? 'MED' : 'HARD')) + ']';
 botPlayerName.textContent = 'YOU (WHITE)';
 topThinking.style.display = isAiThinking ? 'block' : 'none';
 } else {
 topPlayerName.textContent = 'BLACK PLAYER';
 botPlayerName.textContent = 'WHITE PLAYER';
 topThinking.style.display = 'none';
 }

 var wScore = 0, bScore = 0;
 topCapturedList.innerHTML = '';
 botCapturedList.innerHTML = '';

 game.captured.w.forEach(function(p) {
 wScore += PIECE_VALUES[p[1]] || 0;
 var span = document.createElement('span');
 span.className = 'cap-mini';
 span.innerHTML = pieceSVGs[p] || '';
 topCapturedList.appendChild(span);
 });

 game.captured.b.forEach(function(p) {
 bScore += PIECE_VALUES[p[1]] || 0;
 var span = document.createElement('span');
 span.className = 'cap-mini';
 span.innerHTML = pieceSVGs[p] || '';
 botCapturedList.appendChild(span);
 });

 var diff = Math.floor((bScore - wScore) / 100);
 botCapAdv.textContent = diff > 0 ? '+' + diff : '';
 topCapAdv.textContent = diff < 0 ? '+' + (-diff) : '';

 var lastHist = game.history[game.history.length - 1];
 if (lastHist) {
 lastMoveChip.textContent = formatNotation(lastHist.move, lastHist.piece);
 } else {
 lastMoveChip.textContent = '-';
 }

 if (status.status === 'checkmate') {
 var winnerName = status.winner === 'w' ? 'WHITE' : 'BLACK';
 statusTxt.textContent = 'Checkmate! ' + winnerName + ' Wins!';
 showGameOver('CHECKMATE!', winnerName + ' WINS THE GAME!');
 playSound('win');
 } else if (status.status === 'stalemate') {
 statusTxt.textContent = 'Stalemate! Game Draw.';
 showGameOver('STALEMATE!', 'Draw by Stalemate (No legal moves).');
 } else if (status.status === 'draw_50moves') {
 statusTxt.textContent = 'Draw by 50-move rule.';
 showGameOver('DRAW!', '50 moves without capture or pawn push.');
 } else if (status.status === 'check') {
 statusTxt.textContent = (isWhiteTurn ? 'White' : 'Black') + ' King is in CHECK!';
 } else {
 statusTxt.textContent = (isWhiteTurn ? 'White' : 'Black') + "'s Turn";
 }
 }

 function onSquareClick(r, c) {
 if (isAiThinking) return;
 var status = game.getStatus();
 if (status.status === 'checkmate' || status.status === 'stalemate' || status.status === 'draw_50moves') return;

 if (gameMode === 'ai' && game.turn === 'b') return;

 var clickedPiece = game.board[r][c];
 var isOwnPiece = clickedPiece && clickedPiece[0] === game.turn;

 if (isOwnPiece) {
 selectedSquare = { r: r, c: c };
 legalMovesForSelected = game.getLegalMoves(game.turn).filter(function(m) {
 return m.from.r === r && m.from.c === c;
 });
 renderBoard();
 return;
 }

 if (selectedSquare) {
 var chosenMove = null;
 for (var i = 0; i < legalMovesForSelected.length; i++) {
 if (legalMovesForSelected[i].to.r === r && legalMovesForSelected[i].to.c === c) {
 chosenMove = legalMovesForSelected[i];
 break;
 }
 }

 if (chosenMove) {
 var piece = game.board[selectedSquare.r][selectedSquare.c];
 if (piece && piece[1] === 'P' && (r === 0 || r === 7)) {
 pendingPromoMove = chosenMove;
 showPromotionModal();
 return;
 }

 executeMove(chosenMove);
 } else {
 selectedSquare = null;
 legalMovesForSelected = [];
 renderBoard();
 }
 }
 }

 function executeMove(move) {
 var isCap = !!move.capture;
 var isCastle = move.isCastleK || move.isCastleQ;

 game.makeMove(move);
 selectedSquare = null;
 legalMovesForSelected = [];

 var newStatus = game.getStatus();
 if (newStatus.status === 'check' || newStatus.status === 'checkmate') {
 playSound('check');
 } else if (isCastle) {
 playSound('castle');
 } else if (isCap) {
 playSound('capture');
 } else {
 playSound('move');
 }

 renderBoard();

 if (gameMode === 'ai' && game.turn === 'b' && newStatus.status !== 'checkmate' && newStatus.status !== 'stalemate') {
 isAiThinking = true;
 topThinking.style.display = 'block';
 setTimeout(function() {
 var bestMove = getBestMove(game, aiDifficulty);
 if (bestMove) {
 var aiCap = !!bestMove.capture;
 var aiCastle = bestMove.isCastleK || bestMove.isCastleQ;
 game.makeMove(bestMove);
 var aiStatus = game.getStatus();
 if (aiStatus.status === 'check' || aiStatus.status === 'checkmate') {
 playSound('check');
 } else if (aiCastle) {
 playSound('castle');
 } else if (aiCap) {
 playSound('capture');
 } else {
 playSound('move');
 }
 }
 isAiThinking = false;
 renderBoard();
 }, 250);
 }
 }

 function showPromotionModal() {
 promoModal.classList.remove('hidden');
 }

 function hidePromotionModal() {
 promoModal.classList.add('hidden');
 pendingPromoMove = null;
 }

 function showGameOver(title, desc) {
 modalGameOverTitle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="#facc15"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg> ' + title;
 modalGameOverDesc.textContent = desc;
 gameOverModal.classList.remove('hidden');
 }

 function hideGameOver() {
 gameOverModal.classList.add('hidden');
 }

 var promoBtns = document.querySelectorAll('.promo-btn');
 for (var i = 0; i < promoBtns.length; i++) {
 (function(btn) {
 btn.addEventListener('click', function() {
 var promoType = btn.getAttribute('data-promo');
 if (pendingPromoMove) {
 pendingPromoMove.promo = promoType;
 var mv = {
 from: pendingPromoMove.from,
 to: pendingPromoMove.to,
 promo: promoType,
 capture: pendingPromoMove.capture,
 isEnPassant: pendingPromoMove.isEnPassant
 };
 hidePromotionModal();
 executeMove(mv);
 }
 });
 })(promoBtns[i]);
 }

 btnSound.addEventListener('click', function() {
 isMuted = !isMuted;
 iconSoundOn.style.display = isMuted ? 'none' : 'block';
 iconSoundOff.style.display = isMuted ? 'block' : 'none';
 });

 btnModeAI.addEventListener('click', function() {
 gameMode = 'ai';
 btnModeAI.classList.add('active');
 btnMode2P.classList.remove('active');
 diffSelect.style.display = 'block';
 game.reset();
 selectedSquare = null;
 legalMovesForSelected = [];
 hideGameOver();
 renderBoard();
 });

 btnMode2P.addEventListener('click', function() {
 gameMode = '2p';
 btnMode2P.classList.add('active');
 btnModeAI.classList.remove('active');
 diffSelect.style.display = 'none';
 game.reset();
 selectedSquare = null;
 legalMovesForSelected = [];
 hideGameOver();
 renderBoard();
 });

 diffSelect.addEventListener('change', function(e) {
 aiDifficulty = parseInt(e.target.value, 10) || 2;
 });

 btnFlip.addEventListener('click', function() {
 isFlipped = !isFlipped;
 renderBoard();
 });

 btnUndo.addEventListener('click', function() {
 if (isAiThinking) return;
 if (gameMode === 'ai') {
 game.undo();
 game.undo();
 } else {
 game.undo();
 }
 selectedSquare = null;
 legalMovesForSelected = [];
 hideGameOver();
 hidePromotionModal();
 renderBoard();
 });

 btnRestart.addEventListener('click', function() {
 game.reset();
 selectedSquare = null;
 legalMovesForSelected = [];
 hideGameOver();
 hidePromotionModal();
 renderBoard();
 });

 btnPlayAgain.addEventListener('click', function() {
 game.reset();
 selectedSquare = null;
 legalMovesForSelected = [];
 hideGameOver();
 renderBoard();
 });

 renderBoard();
})();
</script></body>`;

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
					botResponseId: "chess-" + Date.now(),
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
								messageText: "Chess Master 2D"
							}
						],
						unifiedResponse: {
							data: Buffer.from(JSON.stringify({
								"response_id": "chess-" + Date.now(),
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

handler.category = 'game';
handler.description = 'Main game Catur 2D Interaktif (Vs AI / 2 Player) via Hirara Rich Message';
handler.command = ['catur', 'chess', 'gamecatur', 'catur2d'];

handler.category = 'Fun'
handler.description = 'Catur'

export default handler;
