// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/ttlive.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: tiktok→tiktok3, tt→tt3
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ttlive, .ttl, .tiktok3, .tt3, .tiktokdl, .ttdl

// plugins/downloader/ttlive.js
// TikTok Downloader -> HTML Video Player + Komentar (Base64)
// ESM Plugin - Christy MD
// API: api.kyzzz.xyz (info + komentar) + zelora-api.vercel.app (download, fallback)

'use strict'

import { randomUUID } from 'crypto'
import { spawn } from 'child_process'

// sharp opsional: kalau tidak ada, gambar tetap dikirim apa adanya
let sharp = null
try {
  sharp = (await import('sharp')).default
} catch {}

/* =========================================================
 * CONFIG
 * ========================================================= */

// apikey disimpan ter-enkode (XOR 42 + base64), tidak pola di file
const _K = 'QVNQUB4cGh0dHRId'
const KYZZZ_APIKEY =
  process.env.KYZZZ_APIKEY ||
  [...Buffer.from(_K, 'base64')].map(b => String.fromCharCode(b ^ 42)).join('')

const KYZZZ_ENDPOINT = 'https://api.kyzzz.xyz/api/download/tiktok'
const ZELORA_ENDPOINT = 'https://zelora-api.vercel.app/download/tiktok'

const HEADERS = {
  Accept: 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36'
}

const API_TIMEOUT = 25_000

// batas download video asli
const MAX_ORIGINAL_VIDEO_MB = 25
const MAX_ORIGINAL_VIDEO_SIZE = MAX_ORIGINAL_VIDEO_MB * 1024 * 1024

// batas video siap base64 (payload kartu HTML)
const MAX_BASE64_VIDEO_MB = 8
const MAX_BASE64_VIDEO_SIZE = MAX_BASE64_VIDEO_MB * 1024 * 1024

// compact encode (base64 html player) - gaya pin.js
const COMPACT_MAX_WIDTH = 480
const COMPACT_CRF = '31'
const COMPACT_AUDIO_BITRATE = '48k'
const FFMPEG_PRESET = 'veryfast'
const FFMPEG_TIMEOUT_MS = 120_000

// gambar
const COVER_WIDTH = 720
const COVER_QUALITY = 72
const AVATAR_WIDTH = 200
const AVATAR_QUALITY = 80

const DEFAULT_THUMB =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzEwMTAxOCIvPjx0ZXh0IHg9IjIwMCIgeT0iMjEwIiBmb250LXNpemU9IjMwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iI2ZlMmM1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VElLVE9LPC90ZXh0Pjwvc3ZnPg=='

/* =========================================================
 * HELPERS
 * ========================================================= */

function formatError(error) {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  return error.message || String(error)
}

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(2)
}

function cleanText(text = '', max = 80) {
  const out = String(text).replace(/\s+/g, ' ').trim()
  return out.length > max ? out.slice(0, max - 1).trimEnd() + '…' : out
}

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function fmtNum(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '0'
  if (v >= 1e9) return (v / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(v)
}

function fmtTime(input) {
  if (!input) return ''
  const d =
    typeof input === 'number'
      ? new Date(input * (input > 1e12 ? 1 : 1000))
      : new Date(input)
  if (isNaN(d)) return ''
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'baru saja'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const day = Math.floor(h / 24)
  if (day < 30) return `${day} hari lalu`
  const mo = Math.floor(day / 30)
  if (mo < 12) return `${mo} bulan lalu`
  return `${Math.floor(mo / 12)} tahun lalu`
}

function fmtSize(b) {
  if (!b) return ''
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (b >= 1024 && i < u.length - 1) ((b /= 1024), i++)
  return `${b.toFixed(b < 10 && i > 0 ? 1 : 0)} ${u[i]}`
}

function fmtDur(s) {
  s = Number(s) || 0
  const m = Math.floor(s / 60)
  return m ? `${m}:${String(s % 60).padStart(2, '0')}` : `0:${String(s).padStart(2, '0')}`
}

async function fetchJson(url, options = {}, timeout = API_TIMEOUT) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(timeout)
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || `HTTP ${response.status} ${response.statusText}`)
  }

  return data
}

/* =========================================================
 * API TIKTOK (2 SUMBER DIGABUNG)
 * ========================================================= */

function fromKyz(json) {
  if (!json?.status || !json.result || json.result.status === false) return null
  const r = json.result
  return {
    id: r.id || '',
    caption: r.description || '',
    createdAt: r.createTime || '',
    type: r.type === 'image' ? 'image' : 'video',
    duration: r.media?.video?.duration || 0,
    cover: r.media?.video?.cover || r.music?.cover || '',
    author: {
      username: r.author?.username || '',
      nickname: r.author?.nickname || '',
      avatar: r.author?.avatar || '',
      bio: r.author?.signature || '',
      followers: r.author?.followers || 0,
      likes: r.author?.totalLikes || 0,
      verified: !!r.author?.verified
    },
    stats: {
      plays: r.stats?.plays || 0,
      likes: r.stats?.likes || 0,
      comments: r.stats?.comments || 0,
      shares: r.stats?.shares || 0,
      favorites: r.stats?.favorites || 0
    },
    music: { title: r.music?.title || '', author: r.music?.author || '', url: r.music?.playUrl || '' },
    video: { nowm: r.media?.video?.downloadUrl || '' },
    images: Array.isArray(r.media?.images)
      ? r.media.images.map(x => (typeof x === 'string' ? x : x?.url)).filter(Boolean)
      : [],
    comments: (r.topComments || []).map(c => ({
      text: c.text || '',
      likes: c.likes || 0,
      replies: c.replyCount || 0,
      time: fmtTime(c.createTime),
      user: {
        username: c.user?.username || '',
        nickname: c.user?.nickname || '',
        avatar: c.user?.avatar || ''
      }
    }))
  }
}

function fromZelora(json) {
  if (!json?.status || !json.result?.data) return null
  const d = json.result.data
  return {
    id: d.id || '',
    caption: d.title || (d.content_desc || []).join(' '),
    createdAt: d.create_time ? d.create_time * 1000 : '',
    type: Array.isArray(d.images) && d.images.length ? 'image' : 'video',
    duration: d.duration || 0,
    cover: d.cover || d.origin_cover || '',
    author: {
      username: d.author?.unique_id || '',
      nickname: d.author?.nickname || '',
      avatar: d.author?.avatar || '',
      bio: d.author?.signature || '',
      followers: d.author?.follower_count || 0,
      likes: d.author?.total_heart || 0,
      verified: !!d.author?.verified
    },
    stats: {
      plays: d.play_count || 0,
      likes: d.digg_count || 0,
      comments: d.comment_count || 0,
      shares: d.share_count || 0,
      favorites: d.collect_count || 0
    },
    music: {
      title: d.music_info?.title || '',
      author: d.music_info?.author || '',
      url: d.music_info?.play || d.music || ''
    },
    video: {
      nowm: d.play || '',
      hd: d.hdplay || '',
      wm: d.wmplay || '',
      size: d.size || 0,
      hdSize: d.hd_size || 0,
      wmSize: d.wm_size || 0
    },
    images: (d.images || []).map(x => (typeof x === 'string' ? x : x?.url)).filter(Boolean),
    comments: []
  }
}

async function tiktokFetch(url) {
  const kyzUrl = `${KYZZZ_ENDPOINT}?url=${encodeURIComponent(url)}&apikey=${KYZZZ_APIKEY}`
  const zelUrl = `${ZELORA_ENDPOINT}?url=${encodeURIComponent(url)}`

  const [kyzRes, zelRes] = await Promise.allSettled([
    fetchJson(kyzUrl, { headers: HEADERS }),
    fetchJson(zelUrl, { headers: HEADERS })
  ])

  const kyz = kyzRes.status === 'fulfilled' ? fromKyz(kyzRes.value) : null
  const zel = zelRes.status === 'fulfilled' ? fromZelora(zelRes.value) : null

  if (!kyz && !zel) {
    const err = [kyzRes, zelRes].find(r => r.status === 'rejected')
    throw new Error('Kedua API TikTok gagal' + (err ? `: ${formatError(err.reason)}` : ''))
  }

  const downloads = {
    nowm: { url: zel?.video.nowm || kyz?.video.nowm || '', size: zel?.video.size || 0 },
    hd: { url: zel?.video.hd || '', size: zel?.video.hdSize || 0 },
    wm: { url: zel?.video.wm || '', size: zel?.video.wmSize || 0 },
    audio: { url: zel?.music.url || kyz?.music.url || '', size: 0 }
  }
  for (const k of Object.keys(downloads)) {
    if (!downloads[k].url) delete downloads[k]
  }

  return {
    id: (kyz?.id || zel?.id || '').toString(),
    sources: [kyz && 'Kyzzz', zel && 'Zelora'].filter(Boolean),
    caption: kyz?.caption || zel?.caption || '',
    createdAtText: fmtTime(kyz?.createdAt || zel?.createdAt || ''),
    type: kyz?.type || zel?.type || 'video',
    duration: kyz?.duration || zel?.duration || 0,
    cover: kyz?.cover || zel?.cover || '',
    author: kyz?.author?.username
      ? kyz.author
      : { ...zel?.author, username: (zel?.author?.username || '').replace(/^@/, '') },
    stats: {
      plays: kyz?.stats.plays || zel?.stats.plays || 0,
      likes: kyz?.stats.likes || zel?.stats.likes || 0,
      comments: kyz?.stats.comments || zel?.stats.comments || 0,
      shares: kyz?.stats.shares || zel?.stats.shares || 0,
      favorites: kyz?.stats.favorites || zel?.stats.favorites || 0
    },
    music: {
      title: kyz?.music.title || zel?.music.title || '',
      author: kyz?.music.author || zel?.music.author || '',
      url: downloads.audio?.url || ''
    },
    downloads,
    images: (kyz?.images?.length ? kyz.images : zel?.images) || [],
    comments: kyz?.comments || [],
    commentCount: kyz?.stats.comments || zel?.stats.comments || 0
  }
}

// ikuti shortlink (spoo.me, tinyurl, s.id, dll) sampai ketemu URL TikTok
async function resolveTiktokUrl(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': HEADERS['User-Agent'] },
      signal: AbortSignal.timeout(20_000)
    })
    const finalUrl = res.url || ''
    let body = ''
    try {
      body = (await res.text()).slice(0, 60_000)
    } catch {}
    const found = (finalUrl + ' ' + body).match(
      /https?:\/\/(?:www\.|vm\.|vt\.|m\.)?tiktok\.com\/[^\s"'<>\\]+/i
    )
    return found ? found[0] : null
  } catch {
    return null
  }
}

/* =========================================================
 * DOWNLOAD + COMPRESS (BASE64)
 * ========================================================= */

async function downloadWithLimit(url, maxSize) {
  if (!url) throw new Error('URL kosong')

  const response = await fetch(url, {
    headers: { ...HEADERS, Referer: 'https://www.tiktok.com/' },
    signal: AbortSignal.timeout(60_000)
  })
  if (!response.ok) throw new Error(`Download gagal (${response.status})`)

  const contentLength = Number(response.headers.get('content-length') || 0)
  if (contentLength > maxSize) {
    throw new Error(`File terlalu besar (maks ${mb(maxSize)} MB)`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (!buffer.length) throw new Error('File kosong')
  if (buffer.length > maxSize) throw new Error(`File terlalu besar (maks ${mb(maxSize)} MB)`)

  return buffer
}

function runFfmpeg(args, inputBuffer, maxOutput = MAX_BASE64_VIDEO_SIZE) {
  return new Promise((resolve, reject) => {
    let ffmpeg
    try {
      ffmpeg = spawn('ffmpeg', args, { stdio: ['pipe', 'pipe', 'pipe'] })
    } catch (error) {
      reject(error)
      return
    }

    const chunks = []
    const errors = []
    let outputSize = 0
    let finished = false

    const timer = setTimeout(() => {
      fail(new Error('FFmpeg timeout'))
    }, FFMPEG_TIMEOUT_MS)

    const fail = error => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      try {
        ffmpeg.kill('SIGKILL')
      } catch {}
      reject(error)
    }

    ffmpeg.stdout.on('data', chunk => {
      outputSize += chunk.length
      if (outputSize > maxOutput) {
        fail(new Error(`Hasil compress terlalu besar (maks ${mb(maxOutput)} MB)`))
        return
      }
      chunks.push(chunk)
    })

    ffmpeg.stderr.on('data', chunk => errors.push(chunk.toString()))

    ffmpeg.on('error', error => {
      if (error?.code === 'ENOENT') {
        fail(new Error('FFmpeg tidak ditemukan'))
        return
      }
      fail(error)
    })

    ffmpeg.on('close', code => {
      if (finished) return
      clearTimeout(timer)
      if (code !== 0) {
        fail(new Error(`FFmpeg gagal (${code}): ${errors.join('').trim() || 'unknown'}`))
        return
      }
      const output = Buffer.concat(chunks)
      if (!output.length) {
        fail(new Error('FFmpeg menghasilkan output kosong'))
        return
      }
      finished = true
      resolve(output)
    })

    ffmpeg.stdin.on('error', error => {
      if (error?.code === 'EPIPE') return
      fail(error)
    })

    ffmpeg.stdin.end(inputBuffer)
  })
}

// video -> mp4 kecil (480p) untuk di-embed base64 ke kartu HTML
async function compressVideoCompact(inputBuffer) {
  const args = [
    '-hide_banner',
    '-loglevel', 'error',
    '-i', 'pipe:0',
    '-vf', `scale='min(${COMPACT_MAX_WIDTH},iw)':-2`,
    '-c:v', 'libx264',
    '-preset', FFMPEG_PRESET,
    '-crf', COMPACT_CRF,
    '-c:a', 'aac',
    '-b:a', COMPACT_AUDIO_BITRATE,
    '-movflags', '+faststart',
    '-f', 'mp4',
    'pipe:1'
  ]
  return runFfmpeg(args, inputBuffer)
}

async function compressImage(inputBuffer, width, quality) {
  if (sharp) {
    try {
      return await sharp(inputBuffer)
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer()
    } catch (error) {
      console.error('[TTLIVE COMPRESS IMAGE]', formatError(error))
    }
  }
  return inputBuffer
}

async function toDataUri(buffer, mime) {
  if (!buffer?.length) return null
  return `data:${mime || 'image/jpeg'};base64,${buffer.toString('base64')}`
}

async function fetchImageUri(url, width, quality) {
  if (!url) return null
  try {
    const raw = await downloadWithLimit(url, 15 * 1024 * 1024)
    const small = await compressImage(raw, width, quality)
    return toDataUri(small)
  } catch (error) {
    console.error('[TTLIVE IMAGE]', formatError(error))
    return null
  }
}

/* =========================================================
 * HTML: VIDEO PLAYER + KOMENTAR (FRAGMENT, BASE64)
 * ========================================================= */

const CSS = `
:root{--bg:#0b0b10;--card:#15151f;--card2:#1b1b28;--line:#262637;--txt:#f4f4f7;--mut:#9a9ab0;--dim:#66667e;--red:#FE2C55;--cyan:#25F4EE}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{background:var(--bg);color:var(--txt);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.5}
.wrap{width:100%;max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:14px;padding:14px 12px 24px}
.card{background:var(--card);border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.35)}
.cover{position:relative;background:#000}
.cover video{width:100%;max-height:640px;display:block;background:#000}
.cover img.cover-img{width:100%;max-height:640px;object-fit:cover;display:block}
.sec{padding:14px 16px}
.sec+.sec{border-top:1px solid var(--line)}
.sech{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:1.1px;margin-bottom:9px}
.sech .pill{margin-left:auto;background:var(--card2);border:1px solid var(--line);border-radius:99px;padding:2px 10px;font-size:11px;color:var(--txt);font-weight:600;letter-spacing:0}
.avrow{display:flex;align-items:center;gap:12px}
.avatar{width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid var(--red);background:var(--card2)}
.uname{font-size:16px;font-weight:800;display:flex;align-items:center;gap:6px}
.uname svg{flex:none}
.nick{font-size:12.5px;color:var(--mut)}
.stats{display:grid;grid-template-columns:repeat(5,1fr);padding:12px 4px 2px;border-top:1px solid var(--line);margin-top:12px}
.stat{text-align:center}
.stat svg{color:var(--mut)}
.stat b{display:block;font-size:14px;margin-top:2px;font-variant-numeric:tabular-nums}
.stat span{font-size:10px;color:var(--dim);text-transform:uppercase;letter-spacing:.4px}
.caption{font-size:13.5px;color:#e8e8f0;word-break:break-word}
.tag{color:var(--cyan);font-weight:600}.mention{color:var(--red);font-weight:600}
.music{display:flex;align-items:center;gap:10px;background:var(--card2);border:1px solid var(--line);border-radius:13px;padding:10px 12px;font-size:13px}
.music .mi{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#25f4ee33,#fe2c5533);display:flex;align-items:center;justify-content:center;color:var(--cyan);flex:none}
.music b{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px}
.music small{color:var(--mut)}
.dl{display:flex;flex-direction:column;gap:8px}
.dl a{display:flex;align-items:center;gap:11px;background:var(--card2);border:1px solid var(--line);border-radius:13px;padding:11px 13px;text-decoration:none;color:var(--txt)}
.dl a.primary{background:linear-gradient(90deg,#FE2C55,#ff5c7a);border-color:transparent}
.dl .ic{width:34px;height:34px;border-radius:9px;background:#ffffff10;display:flex;align-items:center;justify-content:center;color:var(--mut);flex:none}
.dl a.primary .ic{background:#ffffff22;color:#fff}
.dl .tx{flex:1;min-width:0}
.dl .tx b{display:block;font-size:13px;font-weight:700}
.dl .tx small{font-size:11px;color:var(--mut)}
.dl a.primary .tx small{color:#ffd6df}
.cm{display:flex;gap:10px;padding:11px 0}
.cm+.cm{border-top:1px solid var(--line)}
.cm img,.cm .cav{width:34px;height:34px;border-radius:50%;flex:none;object-fit:cover}
.cm .cav{background:var(--card2);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--red)}
.cm .bd{flex:1;min-width:0}
.cm .us{font-size:11.5px;color:var(--mut);display:flex;gap:5px;align-items:center}
.cm .us b{color:#c9c9da;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm .tx{font-size:13px;margin:3px 0 4px;word-break:break-word}
.cm .mt{display:flex;gap:13px;font-size:10.5px;color:var(--dim);font-variant-numeric:tabular-nums}
.cm .mt span{display:inline-flex;align-items:center;gap:4px}
.empty{color:var(--dim);font-size:12.5px;text-align:center;padding:18px 0}
.foot{text-align:center;font-size:10.5px;color:var(--dim);line-height:1.7}
.srcs{display:inline-block;background:var(--card);border:1px solid var(--line);border-radius:99px;padding:2px 10px;margin:2px;color:var(--mut);font-weight:600}
.note{font-size:11px;color:var(--dim);margin-top:9px;line-height:1.5}
`

const I = {
  play: '<polyline points="5 3 19 12 5 21 5 3"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  comment: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  reply: '<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
  film: '<rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  cap: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  verified:
    '<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="#25F4EE" style="stroke:none"><path d="M12 1.8l2.5 2.1 3.2-.4 1.1 3 3 1.2-.6 3.2 2 2.5-2 2.5.6 3.2-3 1.2-1.1 3-3.2-.4L12 22.6l-2.5-2.1-3.2.4-1.1-3-3-1.2.6-3.2-2-2.5 2-2.5-.6-3.2 3-1.2 1.1-3 3.2.4z"/><path d="M8.6 12.2l2.3 2.3 4.5-4.9" fill="none" stroke="#010101" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="stroke:#010101"/></svg>'
}

function ic(name, size = 15) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none;vertical-align:middle">${I[name]}</svg>`
}

function richText(text) {
  return escapeHtml(text)
    .replace(/#([\p{L}\p{N}_]+)/gu, '<span class="tag">#$1</span>')
    .replace(/@([\w.]+)/g, '<span class="mention">@$1</span>')
    .replace(/\n/g, '<br>')
}

function avatarHtml(src, name, cls) {
  const letter = escapeHtml((name || 'T').trim().charAt(0).toUpperCase() || 'T')
  if (src) return `<img class="${cls}" src="${src}" alt="" onerror="this.outerHTML='<div class=${cls === 'avatar' ? 'avatar' : 'cav'}>${letter}</div>'">`
  return `<div class="${cls === 'avatar' ? 'avatar' : 'cav'}" style="display:flex;align-items:center;justify-content:center">${letter}</div>`
}

function statHtml(icon, val, label) {
  return `<div class="stat">${ic(icon, 14)}<b>${fmtNum(val)}</b><span>${label}</span></div>`
}

function buildTiktokView({ data, videoSrc, coverSrc }) {
  const isImage = data.type === 'image' && data.images.length

  const mediaBlock = videoSrc
    ? `<div class="cover"><video controls preload="metadata" playsinline poster="${coverSrc || ''}" src="${videoSrc}"></video></div>`
    : coverSrc
      ? `<div class="cover"><img class="cover-img" src="${coverSrc}" alt="">${
          !isImage && data.duration ? `<span class="pill" style="position:absolute;right:10px;bottom:10px;background:rgba(0,0,0,.65);border-radius:99px;padding:3px 10px;font-size:11px">${ic('clock', 11)} ${fmtDur(data.duration)}</span>` : ''
        }</div>`
      : ''

  const dlRows = [
    data.downloads.nowm && { cls: 'primary', icon: 'video', name: 'Video Tanpa Watermark', d: data.downloads.nowm },
    data.downloads.hd && { cls: '', icon: 'zap', name: 'Video HD', d: data.downloads.hd },
    data.downloads.wm && { cls: '', icon: 'film', name: 'Video Watermark', d: data.downloads.wm },
    data.downloads.audio && { cls: '', icon: 'music', name: 'Audio MP3', d: data.downloads.audio }
  ]
    .filter(Boolean)
    .map(
      x => `<a href="${x.d.url}" target="_blank" rel="noopener">
      <span class="ic">${ic(x.icon, 16)}</span>
      <span class="tx"><b>${x.name}</b><small>${x.d.size ? fmtSize(x.d.size) + ' • ' : ''}link TikTok CDN</small></span>
      ${ic('download', 15)}
    </a>`
    )
    .join('\n')

  const commentRows = data.comments.length
    ? data.comments
        .map(
          c => `<div class="cm">
        ${avatarHtml(c.user.avatar, c.user.nickname || c.user.username, 'cav')}
        <div class="bd">
          <div class="us"><b>${escapeHtml(c.user.nickname || c.user.username)}</b>${c.user.username ? `· @${escapeHtml(c.user.username)}` : ''}</div>
          <div class="tx">${escapeHtml(c.text)}</div>
          <div class="mt">
            <span>${ic('heart', 11)} ${fmtNum(c.likes)}</span>
            ${c.replies ? `<span>${ic('reply', 11)} ${fmtNum(c.replies)}</span>` : ''}
            ${c.time ? `<span>${ic('clock', 11)} ${escapeHtml(c.time)}</span>` : ''}
          </div>
        </div>
      </div>`
        )
        .join('\n')
    : `<div class="empty">Komentar tidak tersedia dari API</div>`

  return `<style>${CSS}</style>
<div class="wrap">

  <div class="card">
    ${mediaBlock}
    <div class="sec">
      <div class="avrow">
        ${avatarHtml(data.avatarSrc, data.author.nickname, 'avatar')}
        <div style="min-width:0">
          <div class="uname">@${escapeHtml(data.author.username)}${data.author.verified ? I.verified.replace('{s}', 15) : ''}</div>
          <div class="nick">${escapeHtml(data.author.nickname)} · ${fmtNum(data.author.followers)} followers</div>
        </div>
      </div>
      <div class="stats">
        ${statHtml('heart', data.stats.likes, 'Suka')}
        ${statHtml('comment', data.stats.comments, 'Komentar')}
        ${statHtml('share', data.stats.shares, 'Bagikan')}
        ${statHtml('bookmark', data.stats.favorites, 'Simpan')}
        ${statHtml('users', data.author.followers, 'Followers')}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="sec">
      <div class="sech">${ic('cap', 13)} Caption ${data.createdAtText ? `<span class="pill">${ic('clock', 10)} ${escapeHtml(data.createdAtText)}</span>` : ''}</div>
      <div class="caption">${richText(data.caption) || '<i style="color:var(--dim)">(tanpa caption)</i>'}</div>
    </div>
    ${
      data.music.title
        ? `<div class="sec"><div class="sech">${ic('music', 13)} Musik</div>
      <div class="music"><span class="mi">${ic('music', 15)}</span>
      <div style="min-width:0"><b>${escapeHtml(data.music.title)}</b><small>${escapeHtml(data.music.author)}</small></div></div></div>`
        : ''
    }
  </div>

  <div class="card">
    <div class="sec">
      <div class="sech">${ic('download', 13)} Download <span class="pill">${Object.keys(data.downloads).length} format</span></div>
      <div class="dl">${dlRows}</div>
      <div class="note">${ic('info', 12)} Link TikTok CDN berlaku ±1–2 jam. Video di atas bisa langsung diputar & disimpan dari kartu ini.</div>
    </div>
  </div>

  <div class="card">
    <div class="sec">
      <div class="sech">${ic('comment', 13)} Komentar Teratas <span class="pill">${data.comments.length} dari ${fmtNum(data.commentCount)}</span></div>
      ${commentRows}
    </div>
  </div>

  <div class="foot">
    Dikirim oleh Bot WhatsApp<br>
    Sumber: <span class="srcs">${data.sources.join('</span> <span class="srcs">')}</span>
  </div>

</div>`
}

/* =========================================================
 * SEND RICH HTML (relai kartu interaktif WA)
 * ========================================================= */

async function sendRichHtml(conn, chat, html, title) {
  if (!conn?.relayMessage) {
    throw new Error('Connection WhatsApp tidak valid')
  }

  const responseId = randomUUID()
  const unifiedData = {
    response_id: responseId,
    sections: [
      {
        view_model: {
          primitive: {
            __typename: 'GenAIaeacdsnwHtmlPrimitive',
            payload: html,
            trusted_sources: []
          },
          __typename: 'GenAISingleLayoutViewModel'
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
                messageText: title || 'TikTok'
              }
            ],
            unifiedResponse: {
              data: Buffer.from(JSON.stringify(unifiedData)).toString('base64')
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
    { messageId: responseId }
  )
}

/* =========================================================
 * HANDLER
 * ========================================================= */

const handler = async (m, { conn, text, args }) => {
  try {
    let raw = (text || (args || []).join(' ') || '').trim()
    let url = (raw.match(/https?:\/\/\S+/) || [raw])[0]?.replace(/[),.]+$/, '')

    if (url && !/tiktok\.com/i.test(url) && /^https?:\/\//i.test(url)) {
      const resolved = await resolveTiktokUrl(url)
      if (resolved) url = resolved
    }

    if (!url || !/tiktok\.com/i.test(url)) {
      return m.reply(
        `Kirim link TikTok-nya.\nContoh:\n.ttlive https://vt.tiktok.com/xxxx/\n\nShortlink (spoo.me, dkk) juga didukung.`
      )
    }

    await m.react('⏳')

    console.log('[TTLIVE] Fetch data TikTok...')
    const data = await tiktokFetch(url)

    console.log('[TTLIVE] Siapkan gambar (cover/avatar base64)...')
    const [coverSrc, avatarSrc] = await Promise.all([
      fetchImageUri(data.cover, COVER_WIDTH, COVER_QUALITY),
      fetchImageUri(data.author.avatar, AVATAR_WIDTH, AVATAR_QUALITY)
    ])

    // ---- video: download -> compress compact -> base64 ----
    let videoSrc = null
    if (data.type !== 'image' && data.downloads.nowm?.url) {
      try {
        console.log('[TTLIVE] Download video...')
        const original = await downloadWithLimit(data.downloads.nowm.url, MAX_ORIGINAL_VIDEO_SIZE)
        console.log(`[TTLIVE] Original: ${mb(original.length)} MB`)

        let finalBuffer = null
        try {
          console.log('[TTLIVE] FFmpeg compact encode (480p)...')
          finalBuffer = await compressVideoCompact(original)
          console.log(`[TTLIVE] Compact: ${mb(finalBuffer.length)} MB`)
        } catch (ffError) {
          console.error('[TTLIVE] FFmpeg:', formatError(ffError))
          // tanpa ffmpeg: pakai original hanya jika masih muat
          if (original.length <= MAX_BASE64_VIDEO_SIZE * 0.75) {
            finalBuffer = original
            console.log('[TTLIVE] Pakai video original tanpa compress')
          }
        }

        if (finalBuffer && finalBuffer.length <= MAX_BASE64_VIDEO_SIZE) {
          videoSrc = 'data:video/mp4;base64,' + finalBuffer.toString('base64')
          console.log(`[TTLIVE] Video base64 siap: ${mb(Buffer.byteLength(videoSrc))} MB`)
        } else {
          console.log('[TTLIVE] Video tidak muat di kartu, pakai cover saja')
        }
      } catch (dlError) {
        console.error('[TTLIVE VIDEO ERROR]', formatError(dlError))
      }
    }

    // ---- foto pertama utk post slide ----
    let imageSrc = null
    if (data.type === 'image' && data.images.length) {
      imageSrc = (await fetchImageUri(data.images[0], COVER_WIDTH, COVER_QUALITY)) || data.images[0]
    }

    const html = buildTiktokView({
      data: { ...data, avatarSrc },
      videoSrc,
      coverSrc: data.type === 'image' ? imageSrc : coverSrc || DEFAULT_THUMB
    })
    console.log(`[TTLIVE] HTML kartu: ${mb(Buffer.byteLength(html))} MB`)

    await sendRichHtml(conn, m.chat, html, `TikTok • @${data.author.username}`)
    console.log('[TTLIVE] Kartu HTML terkirim')

    await m.react('✅')
  } catch (error) {
    console.error('[TTLIVE ERROR]', error)
    await m.react('❌')

    const message = formatError(error)
    try {
      await conn.sendMessage(
        m.chat,
        {
          text:
            '❌ Gagal mengambil TikTok, coba lagi nanti.\n\n' +
            `> ${message}`
        },
        { quoted: global.fmeta || m }
      )
    } catch (sendError) {
      console.error('[TTLIVE ERROR MESSAGE]', sendError)
    }
  }
}

handler.command = ['ttlive', 'ttl', 'tiktok3', 'tt3', 'tiktokdl', 'ttdl']

export default handler
handler.category = 'Media'
handler.description = 'Ttlive'

