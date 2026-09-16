// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/ping.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: pinglive→pinglive2, ping→ping2, speed→speed2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .pinglive2, .ping2, .speed2

// plugins/info/ping.js
// PING LIVE — server inspector (kirim sekali, animasi di kartu)
// ESM Plugin - Christy MD

'use strict'

import os from 'os'
import fs from 'fs'
import { execSync } from 'child_process'
import { randomUUID } from 'crypto'

const BANNER =
  'https://c.termai.cc/a199/0Dw0j.jpg'

/* =========================================================
 * HELPERS
 * ========================================================= */

function formatSize(bytes = 0) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let v = Math.max(0, Number(bytes) || 0)

  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }

  return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`
}

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getDisk() {
  try {
    const out = execSync('df -kP /', { timeout: 3000 })
      .toString()
      .trim()
      .split('\n')

    const row = out
      .slice(1)
      .map(line => line.trim().split(/\s+/))[0]

    if (!row || row.length < 3) return null

    const total = +row[1] * 1024
    const used = +row[2] * 1024
    if (!total) return null

    return {
      total,
      used,
      free: total - used,
      percent: +((used / total) * 100).toFixed(1)
    }
  } catch {
    return null
  }
}

function getSwap() {
  try {
    const file = fs.readFileSync('/proc/meminfo', 'utf8')
    const total =
      +(file.match(/^SwapTotal:\s+(\d+)/m) || [0, 0])[1] * 1024
    const free =
      +(file.match(/^SwapFree:\s+(\d+)/m) || [0, 0])[1] * 1024

    if (!total) return null

    const used = total - free
    return {
      total,
      used,
      free,
      percent: +((used / total) * 100).toFixed(1)
    }
  } catch {
    return null
  }
}

function getNetwork() {
  const interfaces = os.networkInterfaces()
  let primary = ''

  for (const addrs of Object.values(interfaces)) {
    for (const addr of addrs || []) {
      const family = String(addr.family)
      if (
        !addr.internal &&
        (family === 'IPv4' || family === '4') &&
        !primary
      ) {
        primary = addr.address
      }
    }
  }

  return primary || '-'
}

function getCpuModel() {
  return (os.cpus()[0]?.model || 'Unknown CPU')
    .replace(/\(R\)|\(TM\)|CPU|@.*$/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/* =========================================================
 * COLLECT
 * ========================================================= */

function collect(conn) {
  const cores = os.cpus().length || 1
  const load = os.loadavg()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const heap = process.memoryUsage()
  const isBun = typeof Bun !== 'undefined'
  const disk = getDisk()
  const swap = getSwap()

  const cpuPercent = Math.min(
    99.9,
    +((load[0] / cores) * 100).toFixed(1)
  )
  const ramPercent = +((usedMem / totalMem) * 100).toFixed(1)

  let botName =
    conn?.user?.name ||
    global.namebot ||
    global.botname ||
    'Christy MD'

  return {
    botName: String(botName),
    cpu: cpuPercent,
    ram: ramPercent,
    disk: disk ? disk.percent : 0,
    cpuModel: getCpuModel(),
    cores,
    load: load.map(n => n.toFixed(2)).join(' / '),
    osType: `${os.type()} ${os.release()}`,
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    memUsed: formatSize(usedMem),
    memTotal: formatSize(totalMem),
    memFree: formatSize(freeMem),
    heapUsed: formatSize(heap.heapUsed),
    heapTotal: formatSize(heap.heapTotal),
    rss: formatSize(heap.rss),
    diskTxt: disk
      ? `${formatSize(disk.used)} / ${formatSize(disk.total)}`
      : '-',
    diskFree: disk ? formatSize(disk.free) : '-',
    swapTxt: swap
      ? `${formatSize(swap.used)} / ${formatSize(swap.total)} (${swap.percent}%)`
      : 'tidak ada',
    net: getNetwork(),
    runtime: isBun
      ? `Bun ${Bun.version}`
      : `Node ${process.version}`,
    engine: isBun
      ? 'JavaScriptCore'
      : `V8 ${process.versions.v8 || '-'}`,
    pid: process.pid,
    botUpSec: Math.floor(process.uptime()),
    sysUpSec: Math.floor(os.uptime()),
    at: Date.now()
  }
}

/* =========================================================
 * HTML CARD
 * ========================================================= */

function buildHtml(d) {
  const DATA = JSON.stringify({
    cpu: d.cpu,
    ram: d.ram,
    disk: d.disk,
    botUpSec: d.botUpSec,
    sysUpSec: d.sysUpSec,
    at: d.at,
    speed: d.speed
  }).replace(/</g, '\\u003c')

  const bot = escapeHtml(d.botName)
  const cpuModel = escapeHtml(d.cpuModel)
  const osType = escapeHtml(d.osType)
  const arch = escapeHtml(d.arch)
  const hostname = escapeHtml(d.hostname)
  const platform = escapeHtml(d.platform)
  const memUsed = escapeHtml(d.memUsed)
  const memTotal = escapeHtml(d.memTotal)
  const memFree = escapeHtml(d.memFree)
  const heapUsed = escapeHtml(d.heapUsed)
  const rss = escapeHtml(d.rss)
  const diskTxt = escapeHtml(d.diskTxt)
  const diskFree = escapeHtml(d.diskFree)
  const swapTxt = escapeHtml(d.swapTxt)
  const net = escapeHtml(d.net)
  const runtime = escapeHtml(d.runtime)
  const engine = escapeHtml(d.engine)
  const load = escapeHtml(d.load)
  const speed = Number(d.speed) || 0

  return `<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
html,body{width:100%;background:transparent}
body{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:#eef4ff;
  padding:10px 8px 14px;
  overflow-y:auto;
  -webkit-font-smoothing:antialiased;
}
#app{
  max-width:430px;
  margin:0 auto;
  position:relative;
}
.bg{
  position:absolute;inset:-20px;
  background:
    radial-gradient(ellipse at 20% 0%,rgba(99,102,241,.35),transparent 50%),
    radial-gradient(ellipse at 90% 10%,rgba(236,72,153,.22),transparent 45%),
    radial-gradient(ellipse at 50% 100%,rgba(34,211,238,.18),transparent 50%),
    linear-gradient(165deg,#070b16 0%,#0b1224 45%,#060914 100%);
  border-radius:28px;
  z-index:0;
  filter:blur(0);
}
.shell{position:relative;z-index:1;padding:4px}
.hdr{
  display:flex;gap:12px;align-items:center;
  padding:14px 14px 12px;
  border-radius:20px;
  background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.03));
  border:1px solid rgba(255,255,255,.12);
  box-shadow:0 12px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08);
  backdrop-filter:blur(12px);
  margin-bottom:10px;
}
.avatar{
  width:58px;height:58px;border-radius:16px;object-fit:cover;flex-shrink:0;
  border:1.5px solid rgba(167,139,250,.55);
  box-shadow:0 0 0 3px rgba(99,102,241,.15), 0 8px 20px rgba(99,102,241,.25);
  background:#111827;
}
.hdr-txt{min-width:0;flex:1}
.hdr h1{
  font:800 17px/1.15 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  letter-spacing:.2px;
  background:linear-gradient(90deg,#fff,#c4b5fd 50%,#67e8f9);
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
.live{
  display:inline-flex;align-items:center;gap:6px;
  margin-top:5px;
  font:700 10px/1 monospace;
  color:#86efac;
  letter-spacing:.6px;
  text-transform:uppercase;
}
.dot{
  width:8px;height:8px;border-radius:50%;
  background:#4ade80;
  box-shadow:0 0 0 0 rgba(74,222,128,.7);
  animation:pulse 1.6s ease-out infinite;
}
@keyframes pulse{
  0%{box-shadow:0 0 0 0 rgba(74,222,128,.55)}
  70%{box-shadow:0 0 0 10px rgba(74,222,128,0)}
  100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}
}
.badge{
  display:inline-flex;align-items:center;gap:4px;
  margin-left:auto;
  padding:6px 10px;
  border-radius:999px;
  background:linear-gradient(135deg,rgba(99,102,241,.35),rgba(236,72,153,.25));
  border:1px solid rgba(196,181,253,.35);
  font:800 11px/1 monospace;
  color:#f5f3ff;
  white-space:nowrap;
  box-shadow:0 4px 16px rgba(99,102,241,.25);
}
.badge span{opacity:.7;font-weight:600;font-size:9px}

.up{
  position:relative;
  border-radius:18px;
  padding:14px 14px 12px;
  margin-bottom:10px;
  background:
    linear-gradient(160deg,rgba(16,185,129,.14),rgba(6,95,70,.08) 60%,rgba(255,255,255,.03));
  border:1px solid rgba(52,211,153,.28);
  overflow:hidden;
}
.up::before{
  content:"";position:absolute;top:-40%;right:-10%;width:140px;height:140px;
  background:radial-gradient(circle,rgba(52,211,153,.25),transparent 70%);
  pointer-events:none;
}
.up-label{
  font:800 9px/1 monospace;letter-spacing:1.8px;color:#6ee7b7;text-transform:uppercase;
}
.up-main{
  margin-top:6px;
  font:900 22px/1.1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  color:#ecfdf5;
  font-variant-numeric:tabular-nums;
  letter-spacing:.3px;
  text-shadow:0 0 24px rgba(52,211,153,.35);
}
.up-sub{
  margin-top:6px;
  font:600 11px/1.3 monospace;
  color:#a7f3d0;
  opacity:.85;
}
.up-row{
  display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px;
}
.chip{
  display:inline-flex;align-items:center;gap:5px;
  padding:5px 9px;border-radius:999px;
  background:rgba(0,0,0,.25);
  border:1px solid rgba(255,255,255,.08);
  font:700 10px/1 monospace;color:#d1fae5;
}

.gauges{display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
.gauge{
  border-radius:16px;
  padding:12px 13px 11px;
  background:rgba(255,255,255,.045);
  border:1px solid rgba(255,255,255,.09);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
}
.gl{
  display:flex;justify-content:space-between;align-items:baseline;
  margin-bottom:8px;gap:8px;
}
.gl b{
  font:800 11px/1 monospace;letter-spacing:1.2px;color:#a5b4fc;text-transform:uppercase;
}
.gl span{
  font:800 13px/1 monospace;color:#f8fafc;font-variant-numeric:tabular-nums;
}
.bar{
  height:11px;border-radius:999px;
  background:rgba(0,0,0,.45);
  overflow:hidden;
  border:1px solid rgba(255,255,255,.06);
  position:relative;
}
.bar i{
  display:block;height:100%;width:0%;
  border-radius:999px;
  background:linear-gradient(90deg,#6366f1,#22d3ee 55%,#a78bfa);
  box-shadow:0 0 14px rgba(34,211,238,.45);
  transition:width 1.5s cubic-bezier(.22,1,.36,1);
  position:relative;
}
.bar i::after{
  content:"";position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);
  animation:sheen 2.8s ease-in-out infinite;
}
@keyframes sheen{
  0%{transform:translateX(-120%)}
  50%,100%{transform:translateX(120%)}
}
.bar.warn i{
  background:linear-gradient(90deg,#f59e0b,#fb923c);
  box-shadow:0 0 14px rgba(251,146,60,.45);
}
.bar.crit i{
  background:linear-gradient(90deg,#ef4444,#f43f5e 60%,#fb7185);
  box-shadow:0 0 14px rgba(244,63,94,.5);
}
.meta{
  margin-top:6px;
  font:600 10px/1.2 monospace;color:#94a3b8;
}

.grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin-bottom:10px;
}
.cell{
  border-radius:14px;
  padding:10px 11px;
  background:linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
  border:1px solid rgba(255,255,255,.08);
  min-width:0;
}
.cell.wide{grid-column:1/-1}
.cell i{
  display:block;
  font:800 8px/1 monospace;
  font-style:normal;
  letter-spacing:1.3px;
  color:#818cf8;
  text-transform:uppercase;
  margin-bottom:5px;
}
.cell b{
  display:block;
  font:700 11.5px/1.35 monospace;
  color:#e2e8f0;
  word-break:break-word;
}
.cell b.accent{color:#c4b5fd}

.ft{
  display:flex;justify-content:space-between;align-items:center;gap:8px;
  padding:4px 6px 2px;
  font:600 9.5px/1.3 monospace;
  color:#64748b;
}
.ft b{
  color:#94a3b8;
  animation:glow 2.4s ease-in-out infinite;
}
@keyframes glow{
  0%,100%{opacity:.55}
  50%{opacity:1}
}
.ring{
  display:inline-block;width:6px;height:6px;border-radius:50%;
  background:#67e8f9;margin-right:5px;
  box-shadow:0 0 8px #67e8f9;
}
</style>
<div id="app">
  <div class="bg"></div>
  <div class="shell">
    <div class="hdr">
      <img class="avatar" src="${BANNER}" alt="" onerror="this.style.display='none'">
      <div class="hdr-txt">
        <h1>SERVER LIVE</h1>
        <div class="live"><span class="dot"></span>Realtime monitor</div>
      </div>
      <div class="badge" id="spd">${speed}<span> ms</span></div>
    </div>

    <div class="up">
      <div class="up-label">Bot uptime · ticking live</div>
      <div class="up-main" id="up">—</div>
      <div class="up-sub" id="sys">system: —</div>
      <div class="up-row">
        <span class="chip"><span class="ring"></span><span id="age">diperbarui 0 dtk lalu</span></span>
        <span class="chip" id="host">${hostname}</span>
      </div>
    </div>

    <div class="gauges">
      <div class="gauge">
        <div class="gl"><b>CPU load</b><span id="cv">—</span></div>
        <div class="bar" id="cb"><i></i></div>
        <div class="meta">${d.cores} cores · load ${load}</div>
      </div>
      <div class="gauge">
        <div class="gl"><b>Memory</b><span id="rv">—</span></div>
        <div class="bar" id="rb"><i></i></div>
        <div class="meta">${memUsed} used · ${memFree} free · ${memTotal} total</div>
      </div>
      <div class="gauge">
        <div class="gl"><b>Disk /</b><span id="dv">—</span></div>
        <div class="bar" id="db"><i></i></div>
        <div class="meta">${diskTxt} · free ${diskFree}</div>
      </div>
    </div>

    <div class="grid">
      <div class="cell"><i>OS</i><b>${osType}</b></div>
      <div class="cell"><i>Platform</i><b>${platform} · ${arch}</b></div>
      <div class="cell wide"><i>CPU</i><b class="accent">${cpuModel}</b></div>
      <div class="cell"><i>Heap / RSS</i><b>${heapUsed} / ${rss}</b></div>
      <div class="cell"><i>Swap</i><b>${swapTxt}</b></div>
      <div class="cell"><i>IP primer</i><b>${net}</b></div>
      <div class="cell"><i>PID</i><b>${d.pid}</b></div>
      <div class="cell wide"><i>Runtime</i><b>${runtime} · ${engine}</b></div>
    </div>

    <div class="ft">
      <span id="clock">—</span>
      <b>${bot}</b>
    </div>
  </div>
</div>
<script>
(function(){
  var D=${DATA};
  function $(id){return document.getElementById(id)}
  function clamp(n,lo,hi){return Math.max(lo,Math.min(hi,n))}
  function fmt(sec){
    sec=Math.max(0,Math.floor(sec));
    var d=Math.floor(sec/86400),h=Math.floor(sec%86400/3600),m=Math.floor(sec%3600/60),s=sec%60;
    var out=[];
    if(d) out.push(d+'h');
    if(h||d) out.push(h+'j');
    if(m||h||d) out.push(m+'m');
    out.push(s+'s');
    return out.join(' ');
  }
  function tone(el,val,soft,hard){
    el.className='bar';
    if(val>=hard) el.className='bar crit';
    else if(val>=soft) el.className='bar warn';
  }
  function paint(cpu,ram,disk){
    cpu=+cpu; ram=+ram; disk=+disk;
    $('cb').firstChild.style.width=cpu+'%';
    $('rb').firstChild.style.width=ram+'%';
    $('db').firstChild.style.width=disk+'%';
    $('cv').textContent=cpu.toFixed(1)+'%';
    $('rv').textContent=ram.toFixed(1)+'%';
    $('dv').textContent=disk.toFixed(1)+'%';
    tone($('cb'),cpu,70,88);
    tone($('rb'),ram,75,90);
    tone($('db'),disk,80,92);
  }
  function tick(){
    var el=Math.floor((Date.now()-D.at)/1000);
    $('up').textContent=fmt(D.botUpSec+el);
    $('sys').textContent='system · '+fmt(D.sysUpSec+el);
    $('age').textContent='diperbarui '+el+' dtk lalu';
    try{
      $('clock').textContent=new Date().toLocaleString('id-ID',{hour12:false});
    }catch(e){
      $('clock').textContent=new Date().toISOString().slice(0,19).replace('T',' ');
    }
  }
  function breathe(){
    function n(v,amp,lo,hi){
      return clamp(v+(Math.random()*2-1)*amp, lo, hi);
    }
    paint(n(D.cpu,2.8,1,99.5), n(D.ram,1.4,1,99.5), n(D.disk,0.5,0.5,99.5));
  }
  paint(0,0,0);
  setTimeout(function(){ breathe(); }, 280);
  setInterval(breathe, 2000);
  setInterval(tick, 1000);
  tick();
})();
</script>`
}

/* =========================================================
 * SEND RICH CARD
 * ========================================================= */

async function sendLiveCard(conn, chat, html, quoted) {
  const responseId = randomUUID()

  const unifiedData = {
    response_id: responseId,
    sections: [
      {
        view_model: {
          __typename: 'GenAISingleLayoutViewModel',
          primitive: {
            __typename: 'GenAIaeacdsnwHtmlPrimitive',
            payload: html,
            trusted_sources: []
          }
        }
      }
    ]
  }

  await conn.relayMessage(
    chat,
    {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {
          messageDisclaimerText: '',
          botResponseId: responseId
        }
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [
              {
                messageType: 2,
                messageText: '📡 SERVER LIVE'
              }
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify(unifiedData)
              ).toString('base64')
            },
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedAiBotMessageInfo: {
                botJid: '867051314767696@bot'
              },
              forwardOrigin: 4
            }
          }
        }
      }
    },
    {
      messageId: responseId,
      ...(quoted ? { quoted } : {})
    }
  )
}

/* =========================================================
 * HANDLER
 * ========================================================= */

const handler = async (m, { conn }) => {
  const start = Date.now()
  await m.react('📡').catch(() => {})

  try {
    const d = collect(conn)
    d.speed = Date.now() - start

    const html = buildHtml(d)
    await sendLiveCard(conn, m.chat, html, m)

    await m.react('✅').catch(() => {})
  } catch (error) {
    console.error('[PING LIVE]', error)
    await m.react('❌').catch(() => {})

    try {
      const d = collect(conn)
      d.speed = Date.now() - start

      await m.reply(
        `📡 *SERVER LIVE*\n\n` +
          `⚡ Speed : ${d.speed} ms\n` +
          `🧠 CPU : ${d.cpu}% · ${d.cores} core\n` +
          `💾 RAM : ${d.ram}% (${d.memUsed}/${d.memTotal})\n` +
          `🗄 Disk : ${d.disk}% (${d.diskTxt})\n` +
          `⏱ Bot up : ${Math.floor(d.botUpSec / 60)}m ${d.botUpSec % 60}s\n` +
          `🖥 ${d.runtime} · ${d.engine}\n\n` +
          `_Kartu HTML gagal dikirim, fallback text._`
      )
    } catch (e) {
      await m.reply(
        '⚠️ Gagal kirim ping live: ' + (error?.message || error)
      )
    }
  }
}

handler.command = ['pinglive2', 'ping2', 'speed2']

export default handler
handler.category = 'Main'
handler.description = 'Ping'

