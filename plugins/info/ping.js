// plugins/info/ping.js
// PING LIVE — server inspector (kirim sekali, animasi di kartu)
// ESM Plugin - Christy MD
//
// PERBAIKAN (versi fixed):
//  1. BUG UTAMA: script kartu memakai .firstChild (node teks kosong) -> TypeError
//     "Cannot set properties of undefined (setting 'width')". Seluruh JS mati,
//     semua nilai mandek di "—", bar tidak pernah terisi, uptime tidak jalan.
//     -> diganti .querySelector('i') + null-guard di semua akses DOM.
//  2. Logo dibaca dengan readFileSync di top-level: kalau file tidak ada / path
//     salah, SELURUH plugin gagal di-import (bot bisa gagal load semua plugin).
//     -> dibungkus try/catch + beberapa kandidat path + fallback SVG inline.
//  3. Masking IP menghasilkan "192xxxx" (tidak bermakna) -> jadi "192.168.x.x".
//  4. Persen disk dihitung dari used/total (abaikan reserved block) -> pakai
//     kolom Capacity dari df, dan fs.statfsSync sebagai jalan utama (tanpa
//     spawn proses, jalan juga di Windows).
//  5. m.react/m.reply dipanggil langsung -> TypeError kalau method tidak ada.
//     -> diguard dengan typeof === 'function'.
//  6. Kalau renderer mengeblok <script>, kartu tampil kosong semua ("—").
//     -> nilai statis (uptime, %, lebar bar, jam) sudah ditanam di HTML;
//        JS hanya menganimasikan & menambah detik hidup.
//  7. Label durasi rancu ("2h" untuk hari vs "j" untuk jam) -> hari/jam/mnt/dtk.
//  8. Minor: heapTotal dan swap tidak pernah ditampilkan, hostname/IP tidak
//     aman, nilai numerik tidak di-escape.

'use strict'

import os from 'os'
import fs from 'fs'
import { execFileSync } from 'child_process'
import { randomUUID } from 'crypto'

/* ──────────────────────────────  LOGO  ────────────────────────────── */

const FALLBACK_LOGO =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#6366f1"/>
          <stop offset="1" stop-color="#22d3ee"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="#0b1224"/>
      <rect x="8" y="8" width="104" height="104" rx="22"
            fill="none" stroke="url(#g)" stroke-width="4"/>
      <text x="60" y="78" text-anchor="middle"
            font-family="monospace" font-size="58" font-weight="700"
            fill="url(#g)">C</text>
    </svg>`
  )

function loadLogo() {
  const here = import.meta.url

  const candidates = [
    '../../media/christy-logo.jpg',
    '../../media/christy-logo.png',
    '../media/christy-logo.jpg',
    './media/christy-logo.jpg',
    '../../src/media/christy-logo.jpg'
  ]

  for (const rel of candidates) {
    try {
      const url = new URL(rel, here)

      if (!fs.existsSync(url)) continue

      const buf = fs.readFileSync(url)

      if (!buf?.length) continue

      const mime = rel.endsWith('.png')
        ? 'image/png'
        : rel.endsWith('.webp')
          ? 'image/webp'
          : 'image/jpeg'

      return `data:${mime};base64,` + buf.toString('base64')
    } catch {
      /* lanjut ke kandidat berikutnya */
    }
  }

  return FALLBACK_LOGO
}

// Jangan diletakkan di top-level tanpa guard: kegagalan baca file
// tidak boleh membuat plugin gagal di-import.
let BANNER = FALLBACK_LOGO
try {
  BANNER = loadLogo()
} catch {
  BANNER = FALLBACK_LOGO
}

/* ─────────────────────────────  HELPER  ───────────────────────────── */

function formatSize(bytes = 0) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
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

// dipakai di sisi server (nilai awal) — klien punya salinan sendiri
function formatUptime(sec = 0) {
  sec = Math.max(0, Math.floor(Number(sec) || 0))

  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60

  const out = []

  if (d) out.push(d + ' hari')
  if (h || d) out.push(h + ' jam')
  if (m || h || d) out.push(m + ' mnt')

  out.push(s + ' dtk')

  return out.join(' ')
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 0))

/* ────────────────────────────  SAMPLER  ───────────────────────────── */

function getDisk() {
  // 1) statfs: tanpa spawn proses, jalan di Linux/macOS/Windows
  try {
    if (typeof fs.statfsSync === 'function') {
      const st = fs.statfsSync(process.platform === 'win32' ? 'C:' : '/')

      const total = Number(st.blocks) * Number(st.bsize)
      const free = Number(st.bavail) * Number(st.bsize)
      const used = Math.max(0, total - Number(st.bfree) * Number(st.bsize))

      if (total > 0) {
        return {
          total,
          used,
          free: Math.max(0, free),
          percent: +clamp((used / total) * 100, 0, 100).toFixed(1)
        }
      }
    }
  } catch {
    /* fallthrough ke df */
  }

  // 2) df -kP (POSIX, tidak wrap)
  try {
    const out = execFileSync('df', ['-kP', '/'], {
      timeout: 3000,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    })
      .trim()
      .split('\n')

    if (out.length < 2) return null

    const row = out[out.length - 1].trim().split(/\s+/)

    if (row.length < 4) return null

    const total = +row[1] * 1024
    const used = +row[2] * 1024
    const avail = +row[3] * 1024

    if (!total) return null

    // kolom capacity (mis. "42%") lebih akurat dari used/total
    const cap = row[4] && /%$/.test(row[4]) ? parseFloat(row[4]) : null

    const percent = +clamp(
      cap !== null && !Number.isNaN(cap) ? cap : (used / total) * 100,
      0,
      100
    ).toFixed(1)

    return {
      total,
      used,
      free: Math.max(0, Number.isFinite(avail) ? avail : total - used),
      percent
    }
  } catch {
    return null
  }
}

function getSwap() {
  // Linux
  try {
    const file = fs.readFileSync('/proc/meminfo', 'utf8')

    const total = +(file.match(/^SwapTotal:\s+(\d+)/m) || [0, 0])[1] * 1024
    const free = +(file.match(/^SwapFree:\s+(\d+)/m) || [0, 0])[1] * 1024

    if (total > 0) {
      const used = Math.max(0, total - free)

      return {
        total,
        used,
        free,
        percent: +clamp((used / total) * 100, 0, 100).toFixed(1)
      }
    }
  } catch {
    /* bukan Linux atau /proc tidak tersedia */
  }

  // macOS
  try {
    const out = execFileSync('sysctl', ['-n', 'vm.swapusage'], {
      timeout: 2000,
      encoding: 'utf8'
    })

    const nums = out.match(/([\d.]+)\s*M/gi)

    if (nums && nums.length >= 2) {
      const total = parseFloat(nums[0]) * 1024 * 1024
      const used = parseFloat(nums[1]) * 1024 * 1024

      if (total > 0) {
        return {
          total,
          used,
          free: Math.max(0, total - used),
          percent: +clamp((used / total) * 100, 0, 100).toFixed(1)
        }
      }
    }
  } catch {
    /* tidak ada swap / perintah tidak ada */
  }

  return null
}

function getNetwork() {
  const interfaces = os.networkInterfaces()

  let fallback = ''

  for (const addrs of Object.values(interfaces || {})) {
    for (const addr of addrs || []) {
      const family = String(addr.family).toLowerCase()

      if (addr.internal) continue
      if (family !== 'ipv4' && family !== '4') continue

      if (String(addr.address).startsWith('169.254.')) continue

      if (!fallback) fallback = addr.address

      // utamakan interface fisik/ethernet
      const name = String(addr.cidr || '')

      if (/^(eth|ens|enp|eno|wlan|wlp)/i.test(name)) return addr.address
    }
  }

  return fallback || '-'
}

function getMaskedNetwork() {
  const ip = getNetwork()

  if (!ip || ip === '-') return '-'

  // IPv4: 192.168.1.10 -> 192.168.x.x
  if (ip.includes('.')) {
    const p = ip.split('.')

    if (p.length === 4) return `${p[0]}.${p[1]}.x.x`
  }

  // IPv6: cuma tampilkan prefix
  if (ip.includes(':')) return ip.split(':').slice(0, 3).join(':') + '::xxxx'

  return ip.slice(0, 3) + 'xxxx'
}

function getCpuModel() {
  return (os.cpus()[0]?.model || 'Unknown CPU')
    .replace(/\(R\)|\(TM\)|CPU|@.*$/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function collect(conn) {
  const cpus = os.cpus() || []
  const cores = cpus.length || 1
  const load = os.loadavg()

  const totalMem = os.totalmem() || 1
  const freeMem = os.freemem()
  const usedMem = Math.max(0, totalMem - freeMem)

  const heap = process.memoryUsage()

  const isBun = typeof Bun !== 'undefined'

  const disk = getDisk()
  const swap = getSwap()

  const cpuPercent = +clamp((load[0] / cores) * 100, 0, 99.9).toFixed(1)

  const ramPercent = +clamp((usedMem / totalMem) * 100, 0, 100).toFixed(1)

  let botName =
    conn?.user?.name ||
    global.namebot ||
    global.botname ||
    'Christy MD'

  let clockTxt = '-'

  try {
    clockTxt = new Date().toLocaleString('id-ID', { hour12: false })
  } catch {
    clockTxt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  }

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

    net: getMaskedNetwork(),

    runtime: isBun
      ? `Bun ${Bun?.version || '-'}`
      : `Node ${process.version}`,

    engine: isBun
      ? 'JavaScriptCore'
      : `V8 ${process.versions?.v8 || '-'}`,

    pid: process.pid,

    botUpSec: Math.floor(process.uptime()),
    sysUpSec: Math.floor(os.uptime()),

    botUpTxt: formatUptime(Math.floor(process.uptime())),
    sysUpTxt: formatUptime(Math.floor(os.uptime())),
    clockTxt,

    at: Date.now()
  }
}

/* ────────────────────────────  UI KARTU  ───────────────────────────── */

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
  const heapTotal = escapeHtml(d.heapTotal)
  const rss = escapeHtml(d.rss)

  const diskTxt = escapeHtml(d.diskTxt)
  const diskFree = escapeHtml(d.diskFree)

  const swapTxt = escapeHtml(d.swapTxt)

  const net = escapeHtml(d.net)

  const runtime = escapeHtml(d.runtime)
  const engine = escapeHtml(d.engine)

  const load = escapeHtml(d.load)

  const speed = escapeHtml(Number(d.speed) || 0)
  const cores = escapeHtml(d.cores)
  const pid = escapeHtml(d.pid)

  // nilai awal ditanam supaya kartu tetap berisi walau <script> diblokir
  const cpuTxt = escapeHtml(Number(d.cpu || 0).toFixed(1) + '%')
  const ramTxt = escapeHtml(Number(d.ram || 0).toFixed(1) + '%')
  const diskPct = escapeHtml(Number(d.disk || 0).toFixed(1) + '%')

  const bar = pct =>
    `style="width:${escapeHtml(clamp(pct, 0, 100).toFixed(1))}%"`

  return `<style>
*{
  box-sizing:border-box;
  margin:0;
  padding:0;
  -webkit-tap-highlight-color:transparent;
  user-select:none;
  -webkit-user-select:none
}

html,body{
  width:100%;
  background:transparent
}

body{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:#eef4ff;
  padding:10px 8px 14px;
  overflow-y:auto;
  -webkit-font-smoothing:antialiased
}

#app{
  max-width:430px;
  margin:0 auto;
  position:relative
}

.bg{
  position:absolute;
  inset:-20px;
  background:
    radial-gradient(
      ellipse at 20% 0%,
      rgba(99,102,241,.35),
      transparent 50%
    ),
    radial-gradient(
      ellipse at 90% 10%,
      rgba(236,72,153,.22),
      transparent 45%
    ),
    radial-gradient(
      ellipse at 50% 100%,
      rgba(34,211,238,.18),
      transparent 50%
    ),
    linear-gradient(
      165deg,
      #070b16 0%,
      #0b1224 45%,
      #060914 100%
    );
  border-radius:28px;
  z-index:0
}

.shell{
  position:relative;
  z-index:1;
  padding:4px
}

.hdr{
  display:flex;
  gap:12px;
  align-items:center;
  padding:14px 14px 12px;
  border-radius:20px;
  background:
    linear-gradient(
      145deg,
      rgba(255,255,255,.08),
      rgba(255,255,255,.03)
    );
  border:1px solid rgba(255,255,255,.12);
  box-shadow:
    0 12px 40px rgba(0,0,0,.35),
    inset 0 1px 0 rgba(255,255,255,.08);
  backdrop-filter:blur(12px);
  margin-bottom:10px
}

.avatar{
  width:58px;
  height:58px;
  border-radius:16px;
  object-fit:cover;
  flex-shrink:0;
  border:1.5px solid rgba(167,139,250,.55);
  box-shadow:
    0 0 0 3px rgba(99,102,241,.15),
    0 8px 20px rgba(99,102,241,.25);
  background:#111827
}

.hdr-txt{
  min-width:0;
  flex:1
}

.hdr h1{
  font:800 17px/1.15 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  letter-spacing:.2px;
  background:
    linear-gradient(
      90deg,
      #fff,
      #c4b5fd 50%,
      #c084fc
    );
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent
}

.live{
  display:inline-flex;
  align-items:center;
  gap:6px;
  margin-top:5px;
  font:700 10px/1 monospace;
  color:#86efac;
  letter-spacing:.6px;
  text-transform:uppercase
}

.dot{
  width:8px;
  height:8px;
  border-radius:50%;
  background:#4ade80;
  box-shadow:
    0 0 0 0 rgba(74,222,128,.7);
  animation:pulse 1.6s ease-out infinite
}

@keyframes pulse{
  0%{
    box-shadow:0 0 0 0 rgba(74,222,128,.55)
  }

  70%{
    box-shadow:0 0 0 10px rgba(74,222,128,0)
  }

  100%{
    box-shadow:0 0 0 0 rgba(74,222,128,0)
  }
}

.badge{
  display:inline-flex;
  align-items:center;
  gap:4px;
  margin-left:auto;
  padding:6px 10px;
  border-radius:999px;
  background:
    linear-gradient(
      135deg,
      rgba(99,102,241,.35),
      rgba(236,72,153,.25)
    );
  border:1px solid rgba(196,181,253,.35);
  font:800 11px/1 monospace;
  color:#f5f3ff;
  white-space:nowrap;
  box-shadow:0 4px 16px rgba(99,102,241,.25)
}

.badge span{
  opacity:.7;
  font-weight:600;
  font-size:9px
}

.up{
  position:relative;
  border-radius:18px;
  padding:14px 14px 12px;
  margin-bottom:10px;
  background:
    linear-gradient(
      160deg,
      rgba(16,185,129,.14),
      rgba(6,95,70,.08) 60%,
      rgba(255,255,255,.03)
    );
  border:1px solid rgba(52,211,153,.28);
  overflow:hidden
}

.up::before{
  content:"";
  position:absolute;
  top:-40%;
  right:-10%;
  width:140px;
  height:140px;
  background:
    radial-gradient(
      circle,
      rgba(52,211,153,.25),
      transparent 70%
    );
  pointer-events:none
}

.up-label{
  font:800 9px/1 monospace;
  letter-spacing:1.8px;
  color:#6ee7b7;
  text-transform:uppercase
}

.up-main{
  margin-top:6px;
  font:900 22px/1.1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  color:#ecfdf5;
  font-variant-numeric:tabular-nums;
  letter-spacing:.3px;
  text-shadow:0 0 24px rgba(52,211,153,.35)
}

.up-sub{
  margin-top:6px;
  font:600 11px/1.3 monospace;
  color:#a7f3d0;
  opacity:.85
}

.up-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:8px;
  margin-top:10px
}

.chip{
  display:inline-flex;
  align-items:center;
  gap:5px;
  padding:5px 9px;
  border-radius:999px;
  background:rgba(0,0,0,.25);
  border:1px solid rgba(255,255,255,.08);
  font:700 10px/1 monospace;
  color:#d1fae5;
  max-width:60%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap
}

.gauges{
  display:flex;
  flex-direction:column;
  gap:8px;
  margin-bottom:10px
}

.gauge{
  border-radius:16px;
  padding:12px 13px 11px;
  background:rgba(255,255,255,.045);
  border:1px solid rgba(255,255,255,.09);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05)
}

.gl{
  display:flex;
  justify-content:space-between;
  align-items:baseline;
  margin-bottom:8px;
  gap:8px
}

.gl b{
  font:800 11px/1 monospace;
  letter-spacing:1.2px;
  color:#a5b4fc;
  text-transform:uppercase
}

.gl span{
  font:800 13px/1 monospace;
  color:#f8fafc;
  font-variant-numeric:tabular-nums
}

.bar{
  height:11px;
  border-radius:999px;
  background:rgba(0,0,0,.45);
  overflow:hidden;
  border:1px solid rgba(255,255,255,.06);
  position:relative
}

.bar i{
  display:block;
  height:100%;
  width:0%;
  border-radius:999px;
  background:
    linear-gradient(
      90deg,
      #6366f1,
      #22d3ee 55%,
      #a78bfa
    );
  box-shadow:0 0 14px rgba(34,211,238,.45);
  transition:
    width 1.5s cubic-bezier(.22,1,.36,1);
  position:relative
}

.bar i::after{
  content:"";
  position:absolute;
  inset:0;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,.35),
      transparent
    );
  animation:sheen 2.8s ease-in-out infinite
}

@keyframes sheen{
  0%{
    transform:translateX(-120%)
  }

  50%,100%{
    transform:translateX(120%)
  }
}

.bar.warn i{
  background:
    linear-gradient(
      90deg,
      #f59e0b,
      #fb923c
    );
  box-shadow:0 0 14px rgba(251,146,60,.45)
}

.bar.crit i{
  background:
    linear-gradient(
      90deg,
      #ef4444,
      #f43f5e 60%,
      #fb7185
    );
  box-shadow:0 0 14px rgba(244,63,94,.5)
}

.meta{
  margin-top:6px;
  font:600 10px/1.2 monospace;
  color:#94a3b8
}

.grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin-bottom:10px
}

.cell{
  border-radius:14px;
  padding:10px 11px;
  background:
    linear-gradient(
      160deg,
      rgba(255,255,255,.06),
      rgba(255,255,255,.02)
    );
  border:1px solid rgba(255,255,255,.08);
  min-width:0
}

.cell.wide{
  grid-column:1/-1
}

.cell i{
  display:block;
  font:800 8px/1 monospace;
  font-style:normal;
  letter-spacing:1.3px;
  color:#818cf8;
  text-transform:uppercase;
  margin-bottom:5px
}

.cell b{
  display:block;
  font:700 11.5px/1.35 monospace;
  color:#e2e8f0;
  word-break:break-word
}

.cell b.accent{
  color:#c4b5fd
}

.ft{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:8px;
  padding:4px 6px 2px;
  font:600 9.5px/1.3 monospace;
  color:#64748b
}

.ft b{
  color:#94a3b8;
  animation:glow 2.4s ease-in-out infinite
}

@keyframes glow{
  0%,100%{
    opacity:.55
  }

  50%{
    opacity:1
  }
}

.ring{
  display:inline-block;
  width:6px;
  height:6px;
  border-radius:50%;
  background:#c084fc;
  margin-right:5px;
  box-shadow:0 0 8px #c084fc
}
</style>

<div id="app">
  <div class="bg"></div>

  <div class="shell">

    <div class="hdr">
      <img
        class="avatar"
        src="${BANNER}"
        alt=""
        onerror="this.style.display='none'"
      >

      <div class="hdr-txt">
        <h1>SERVER LIVE</h1>

        <div class="live">
          <span class="dot"></span>
          Realtime monitor
        </div>
      </div>

      <div class="badge" id="spd">
        ${speed}<span> ms</span>
      </div>
    </div>

    <div class="up">
      <div class="up-label">
        Bot uptime · ticking live
      </div>

      <div class="up-main" id="up">
        ${escapeHtml(d.botUpTxt)}
      </div>

      <div class="up-sub" id="sys">
        system · ${escapeHtml(d.sysUpTxt)}
      </div>

      <div class="up-row">
        <span class="chip">
          <span class="ring"></span>
          <span id="age">
            diperbarui 0 dtk lalu
          </span>
        </span>

        <span class="chip" id="host">
          ${hostname}
        </span>
      </div>
    </div>

    <div class="gauges">

      <div class="gauge">
        <div class="gl">
          <b>CPU load</b>
          <span id="cv">${cpuTxt}</span>
        </div>

        <div class="bar" id="cb">
          <i ${bar(d.cpu)}></i>
        </div>

        <div class="meta">
          ${cores} cores · load ${load}
        </div>
      </div>

      <div class="gauge">
        <div class="gl">
          <b>Memory</b>
          <span id="rv">${ramTxt}</span>
        </div>

        <div class="bar" id="rb">
          <i ${bar(d.ram)}></i>
        </div>

        <div class="meta">
          ${memUsed} used · ${memFree} free · ${memTotal} total
        </div>
      </div>

      <div class="gauge">
        <div class="gl">
          <b>Disk /</b>
          <span id="dv">${diskPct}</span>
        </div>

        <div class="bar" id="db">
          <i ${bar(d.disk)}></i>
        </div>

        <div class="meta">
          ${diskTxt} · free ${diskFree}
        </div>
      </div>

    </div>

    <div class="grid">

      <div class="cell">
        <i>OS</i>
        <b>${osType}</b>
      </div>

      <div class="cell">
        <i>Platform</i>
        <b>${platform} · ${arch}</b>
      </div>

      <div class="cell wide">
        <i>CPU</i>
        <b class="accent">${cpuModel}</b>
      </div>

      <div class="cell">
        <i>Heap</i>
        <b>${heapUsed} / ${heapTotal}</b>
      </div>

      <div class="cell">
        <i>RSS</i>
        <b>${rss}</b>
      </div>

      <div class="cell">
        <i>Swap</i>
        <b>${swapTxt}</b>
      </div>

      <div class="cell">
        <i>IP primer</i>
        <b>${net}</b>
      </div>

      <div class="cell">
        <i>PID</i>
        <b>${pid}</b>
      </div>

      <div class="cell wide">
        <i>Runtime</i>
        <b>${runtime} · ${engine}</b>
      </div>

    </div>

    <div class="ft">
      <span id="clock">${escapeHtml(d.clockTxt)}</span>
      <b>${bot}</b>
    </div>

  </div>
</div>

<script>
(function(){

  var D=${DATA};

  function $(id){
    return document.getElementById(id)
  }

  // PERBAIKAN: pakai <i> beneran, bukan firstChild (node teks whitespace)
  function fill(id){
    var el=$(id)

    if(!el) return null

    return el.querySelector('i')||el.firstElementChild
  }

  function clamp(n,lo,hi){
    n=+n

    if(!isFinite(n)) n=0

    return Math.max(
      lo,
      Math.min(hi,n)
    )
  }

  function fmt(sec){

    sec=Math.max(
      0,
      Math.floor(sec||0)
    )

    var d=Math.floor(sec/86400)
    var h=Math.floor((sec%86400)/3600)
    var m=Math.floor((sec%3600)/60)
    var s=sec%60

    var out=[]

    if(d) out.push(d+' hari')
    if(h||d) out.push(h+' jam')
    if(m||h||d) out.push(m+' mnt')

    out.push(s+' dtk')

    return out.join(' ')
  }

  function tone(el,val,soft,hard){

    if(!el) return

    el.className='bar'

    if(val>=hard){
      el.className='bar crit'
    }else if(val>=soft){
      el.className='bar warn'
    }
  }

  function paint(cpu,ram,disk,animate){

    cpu=clamp(cpu,0,100)
    ram=clamp(ram,0,100)
    disk=clamp(disk,0,100)

    var cb=fill('cb')
    var rb=fill('rb')
    var db=fill('db')

    var bars=[
      [cb,cpu],
      [rb,ram],
      [db,disk]
    ]

    for(var i=0;i<bars.length;i++){

      var el=bars[i][0]
      var v=bars[i][1]

      if(!el) continue

      if(animate===false){
        // reset tanpa animasi supaya transisi tetap terasa saat mulai
        el.style.transition='none'
      }else{
        el.style.transition=''
      }

      el.style.width=v+'%'
    }

    if(animate!==false){
      // paksa reflow agar transisi jalan setelah reset
      if(cb) void cb.offsetWidth
    }

    var cv=$('cv')
    var rv=$('rv')
    var dv=$('dv')

    if(cv) cv.textContent=cpu.toFixed(1)+'%'
    if(rv) rv.textContent=ram.toFixed(1)+'%'
    if(dv) dv.textContent=disk.toFixed(1)+'%'

    tone($('cb'),cpu,70,88)
    tone($('rb'),ram,75,90)
    tone($('db'),disk,80,92)
  }

  function tick(){

    var el=Math.floor(
      (Date.now()-D.at)/1000
    )

    var up=$('up')
    var sys=$('sys')
    var age=$('age')

    if(up){
      up.textContent=fmt(D.botUpSec+el)
    }

    if(sys){
      sys.textContent=
        'system · '+fmt(D.sysUpSec+el)
    }

    if(age){
      age.textContent=
        'diperbarui '+el+' dtk lalu'
    }

    var clock=$('clock')

    if(clock){

      try{

        clock.textContent=
          new Date().toLocaleString(
            'id-ID',
            {
              hour12:false
            }
          )

      }catch(e){

        clock.textContent=
          new Date()
            .toISOString()
            .slice(0,19)
            .replace('T',' ')

      }
    }
  }

  function breathe(){

    function n(v,amp,lo,hi){

      return clamp(
        v+(Math.random()*2-1)*amp,
        lo,
        hi
      )
    }

    paint(
      n(D.cpu,1.5,0.5,99.5),
      n(D.ram,0.8,0.5,99.5),
      n(D.disk,0.2,0.2,99.5)
    )
  }

  // mulai dari 0 lalu animasikan ke nilai asli
  paint(0,0,0,false)

  setTimeout(
    function(){
      breathe()
    },
    280
  )

  setInterval(
    breathe,
    2000
  )

  setInterval(
    tick,
    1000
  )

  tick()

})()
</script>`
}

/* ────────────────────────────  PENGIRIM  ───────────────────────────── */

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

/* ─────────────────────────────  HANDLER  ───────────────────────────── */

// jangan biarkan .react/.reply yang tidak ada menjatuhkan handler
const safe = async fn => {
  try {
    if (typeof fn !== 'function') return
    await fn()
  } catch {
    /* abaikan */
  }
}

const handler = async (m, { conn }) => {
  const start = Date.now()

  await safe(() => m?.react?.('📡'))

  try {
    const d = collect(conn)

    d.speed = Date.now() - start

    const html = buildHtml(d)

    await sendLiveCard(conn, m.chat, html, m)

    await safe(() => m?.react?.('✅'))

  } catch (error) {
    console.error('[PING LIVE]', error)

    await safe(() => m?.react?.('❌'))

    try {
      const d = collect(conn)

      d.speed = Date.now() - start

      await safe(() =>
        m?.reply?.(
          `📡 *SERVER LIVE*\n\n` +
          `⚡ Speed : ${d.speed} ms\n` +
          `🧠 CPU : ${d.cpu}% · ${d.cores} core\n` +
          `💾 RAM : ${d.ram}% (${d.memUsed}/${d.memTotal})\n` +
          `🗄 Disk : ${d.disk}% (${d.diskTxt})\n` +
          `⏱ Bot up : ${formatUptime(d.botUpSec)}\n` +
          `🖥 ${d.runtime} · ${d.engine}\n\n` +
          `_Kartu HTML gagal dikirim, fallback text._`
        )
      )

    } catch (e) {
      await safe(() =>
        m?.reply?.(
          '⚠️ Gagal kirim ping live: ' +
          (error?.message || error)
        )
      )
    }
  }
}

handler.help = ['ping', 'p', 'cekspeed']
handler.tags = ['info']
handler.command = /^(ping|p|cekspeed)$/i

export default handler