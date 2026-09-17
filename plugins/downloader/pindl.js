// plugins/downloader/pin.js
// Pinterest Search -> HTML Gallery / Video Player (Base64) + Save to Gallery
// ESM Plugin - Christy MD
// API: api.nexray.eu.cc (ElrayyXml)

'use strict'

import { randomUUID } from 'crypto'
import { spawn } from 'child_process'
import sharp from 'sharp'

/* =========================================================
 * CONFIG
 * ========================================================= */

const API_BASE = 'https://api.nexray.eu.cc'

const ENDPOINT_IMAGE = `${API_BASE}/search/pinterest`
const ENDPOINT_VIDEO = `${API_BASE}/search/pinterestvideo`

// API cadangan, dipakai otomatis kalau nexray error/down
const FALLBACK_ENDPOINT = 'https://api.siputzx.my.id/api/s/pinterest'

// API cadangan ke-2 (AxlyChann) + endpoint download via link pin.it
const AXLY_BASE = 'https://axlyapi.qzz.io'
const AXLY_SEARCH_IMAGE = `${AXLY_BASE}/search/pinterest`
const AXLY_SEARCH_VIDEO = `${AXLY_BASE}/search/pinterest/video`
const AXLY_DOWNLOAD = `${AXLY_BASE}/download/pinterest`

const HEADERS = {
  Accept: 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36'
}

const MAX_HTML_IMAGES = 5

// true  = kirim juga foto/video biasa (pasti bisa simpan ke galeri)
// false = murni HTML/base64 saja (tanpa pengiriman ganda)
const SEND_PLAIN_MEDIA = false
const SEND_DELAY_MS = 1200

const MAX_ORIGINAL_IMAGE_MB = 15
const MAX_ORIGINAL_IMAGE_SIZE = MAX_ORIGINAL_IMAGE_MB * 1024 * 1024

const HTML_IMAGE_WIDTH = 720
const HTML_IMAGE_QUALITY = 72

const MAX_ORIGINAL_VIDEO_MB = 80
const MAX_ORIGINAL_VIDEO_SIZE = MAX_ORIGINAL_VIDEO_MB * 1024 * 1024

const MAX_FINAL_VIDEO_MB = 24
const MAX_FINAL_VIDEO_SIZE = MAX_FINAL_VIDEO_MB * 1024 * 1024

const MAX_BASE64_VIDEO_MB = 8
const MAX_BASE64_VIDEO_SIZE = MAX_BASE64_VIDEO_MB * 1024 * 1024

const MAX_VIDEO_ATTEMPTS = 3

// batas waktu proses FFmpeg (hindari hang selamanya)
const FFMPEG_TIMEOUT_MS = 180000

const VIDEO_VARIANTS = ['720p', '480p', 'expMp4']

const FFMPEG_VIDEO_CODEC = 'libx264'
const FFMPEG_PRESET = 'veryfast'

// normal encode (plain media)
const FFMPEG_CRF = '27'
const FFMPEG_MAX_WIDTH = 720
const FFMPEG_AUDIO_CODEC = 'aac'
const FFMPEG_AUDIO_BITRATE = '96k'

// compact encode (base64 html player)
const COMPACT_CRF = '31'
const COMPACT_MAX_WIDTH = 480
const COMPACT_AUDIO_BITRATE = '48k'

const DEFAULT_THUMB =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhMGQxMiIvPjx0ZXh0IHg9IjIwMCIgeT0iMjEwIiBmb250LXNpemU9IjM0IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UElOVEVSRVNUPS90ZXh0Pjwvc3ZnPg=='

/* =========================================================
 * HELPERS
 * ========================================================= */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function formatError(error) {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  return error.message || String(error)
}

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(2)
}

function formatDuration(ms = 0) {
  const total = Math.round(Number(ms) / 1000)
  if (!Number.isFinite(total) || total <= 0) return '0:00'
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function cleanText(text = '', max = 80) {
  const value = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!value) return ''
  return value.length > max ? value.slice(0, max - 1).trimEnd() + '…' : value
}

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function safeJs(text = '') {
  return JSON.stringify(String(text || '')).replace(/</g, '\\u003c')
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `HTTP ${response.status} ${response.statusText}`
    )
  }

  return data
}

async function downloadWithLimit(url, maxBytes) {
  if (!url) throw new Error('URL kosong')

  const controller = new AbortController()
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36'
    },
    signal: controller.signal
  })

  if (!response.ok) {
    throw new Error(`Download gagal (${response.status})`)
  }

  const contentLength = Number(response.headers.get('content-length') || 0)
  if (contentLength > maxBytes) {
    throw new Error(`File terlalu besar. Maksimal ${mb(maxBytes)} MB`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('Response body kosong')

  const chunks = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.length
      if (total > maxBytes) {
        controller.abort()
        throw new Error(`File terlalu besar. Maksimal ${mb(maxBytes)} MB`)
      }
      chunks.push(Buffer.from(value))
    }
  } finally {
    try { reader.releaseLock() } catch {}
  }

  const buffer = Buffer.concat(chunks)
  if (!buffer.length) throw new Error('Buffer kosong')

  return buffer
}

/* =========================================================
 * PINTEREST API
 * ========================================================= */

async function searchNexrayImages(query) {
  const data = await fetchJson(
    `${ENDPOINT_IMAGE}?q=${encodeURIComponent(query)}`,
    { headers: HEADERS }
  )

  if (!data?.status || !Array.isArray(data.result)) {
    throw new Error('Respons API Pinterest tidak valid')
  }

  const seen = new Set()
  return data.result.filter(pin => {
    if (!pin?.images_url || seen.has(pin.id)) return false
    seen.add(pin.id)
    return true
  })
}

async function searchNexrayVideos(query) {
  const data = await fetchJson(
    `${ENDPOINT_VIDEO}?q=${encodeURIComponent(query)}`,
    { headers: HEADERS }
  )

  if (!data?.status || !Array.isArray(data.result)) {
    throw new Error('Respons API Pinterest tidak valid')
  }

  const seen = new Set()
  return data.result.filter(pin => {
    if (!pin?.video_url || seen.has(pin.id)) return false
    seen.add(pin.id)
    return true
  })
}

/* ---------------------------------------------------------
 * FALLBACK 2 (axlyapi.qzz.io - AxlyChann)
 * - image : result.data[]   (image_url, author, board, likes)
 * - video : result.videos[] (video_url MP4 langsung, "18.7s")
 * - download : /download/pinterest?url= (pin.it / pinterest.com)
 * --------------------------------------------------------- */

function parseDurationMs(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  const match = String(value || '').match(/^([\d.]+)\s*s$/i)
  if (match) return Math.round(parseFloat(match[1]) * 1000)

  return 0
}

function normalizeAxlyImages(raw = []) {
  const seen = new Set()

  return raw
    .filter(pin => pin?.image_url && pin?.id && !seen.has(pin.id))
    .map(pin => {
      seen.add(pin.id)
      return {
        ...pin,
        images_url: pin.image_url,
        thumbnail: pin.image_url,
        grid_title: pin.title || '',
        pinner: {
          full_name: pin.author?.full_name || pin.author?.username || '',
          username: pin.author?.username || ''
        },
        board: { name: pin.board?.name || '' },
        reaction_counts: { 1: Number(pin.likes) || 0 }
      }
    })
}

function normalizeAxlyVideos(raw = []) {
  const seen = new Set()

  return raw
    .filter(pin => pin?.video_url && pin?.id && !seen.has(pin.id))
    .map(pin => {
      seen.add(pin.id)
      return {
        ...pin,
        title: pin.title || '',
        description: '',
        thumbnail: pin.thumbnail || '',
        board: '',
        url: pin.link || '',
        duration: parseDurationMs(pin.duration)
      }
    })
}

async function searchAxlyImages(query) {
  const data = await fetchJson(
    `${AXLY_SEARCH_IMAGE}?q=${encodeURIComponent(query)}&limit=20`,
    { headers: HEADERS }
  )

  if (!data?.status || !Array.isArray(data.result?.data)) {
    throw new Error('Respons API Axly Pinterest tidak valid')
  }

  return normalizeAxlyImages(data.result.data)
}

async function searchAxlyVideos(query) {
  const data = await fetchJson(
    `${AXLY_SEARCH_VIDEO}?q=${encodeURIComponent(query)}&limit=20`,
    { headers: HEADERS }
  )

  if (!data?.status || !Array.isArray(data.result?.videos)) {
    throw new Error('Respons API Axly Pinterest tidak valid')
  }

  return normalizeAxlyVideos(data.result.videos)
}

/* ---------------------------------------------------------
 * FALLBACK 3 (api.siputzx.my.id)
 * Struktur mirip nexray, tapi:
 * - gambar -> URL ada di `image_url` (bukan `images_url`)
 * - video  -> `video_url` bisa berupa MP4 langsung
 * --------------------------------------------------------- */

function normalizeFallbackPins(raw = []) {
  const seen = new Set()

  return raw
    .filter(pin => {
      const media = pin?.image_url || pin?.images_url || pin?.video_url
      if (!media || !pin?.id || seen.has(pin.id)) return false
      seen.add(pin.id)
      return true
    })
    .map(pin => ({
      ...pin,
      images_url: pin.image_url || pin.images_url || '',
      thumbnail: pin.image_url || pin.thumbnail || '',
      video_url: pin.video_url || '',
      board:
        typeof pin.board === 'string'
          ? pin.board
          : pin.board?.name || '',
      duration: Number(pin.duration) || 0
    }))
}

async function searchFallback(query) {
  const data = await fetchJson(
    `${FALLBACK_ENDPOINT}?query=${encodeURIComponent(query)}`,
    { headers: HEADERS }
  )

  if (!data?.status || !Array.isArray(data.data)) {
    throw new Error('Respons API fallback Pinterest tidak valid')
  }

  return normalizeFallbackPins(data.data)
}

/* ---------------------------------------------------------
 * SEARCH GABUNGAN: nexray -> axly -> siputzx
 * Kalau satu provider error/hasil kosong, lanjut ke berikutnya
 * --------------------------------------------------------- */

async function searchWithProviders(label, providers) {
  const errors = []

  for (const { name, run } of providers) {
    try {
      const result = await run()

      if (result.length) {
        return result
      }

      errors.push(`${name}: kosong`)
      console.log(`[${label}] ${name}: hasil kosong, coba provider lain`)
    } catch (error) {
      errors.push(`${name}: ${formatError(error)}`)
      console.log(`[${label}] ${name} gagal: ${formatError(error)}`)
    }
  }

  throw new Error(
    `Semua sumber Pinterest gagal atau tidak menemukan hasil ` +
      `(${errors.join(' | ')})`
  )
}

async function searchPinImages(query) {
  return searchWithProviders('PIN IMAGE', [
    { name: 'nexray', run: () => searchNexrayImages(query) },
    { name: 'axly', run: () => searchAxlyImages(query) },
    { name: 'siputzx', run: () => searchFallback(query) }
  ])
}

async function searchPinVideos(query) {
  return searchWithProviders('PIN VIDEO', [
    { name: 'nexray', run: () => searchNexrayVideos(query) },
    { name: 'axly', run: () => searchAxlyVideos(query) },
    {
      name: 'siputzx',
      run: async () => (await searchFallback(query)).filter(p => p.video_url)
    }
  ])
}

/* ---------------------------------------------------------
 * DOWNLOAD VIA LINK (pin.it / pinterest.com/pin/...)
 * --------------------------------------------------------- */

function extractPinUrl(text = '') {
  const match = String(text).match(
    /https?:\/\/(?:www\.)?(?:pin\.it|pinterest\.com)\/\S+/i
  )
  return match?.[0] || null
}

// media_urls dari Axly berupa proxy savepinmedia -> ambil URL aslinya
function extractRealMediaUrls(mediaUrls = []) {
  const real = []

  for (const url of mediaUrls) {
    if (!url) continue

    let realUrl = url
    try {
      const parsed = new URL(url)
      const id = parsed.searchParams.get('id')
      if (id) realUrl = id
    } catch {}

    if (!real.includes(realUrl)) real.push(realUrl)
  }

  // prioritaskan mp4 non-hevc (biasanya 720p) di urutan depan
  return real.sort((a, b) => {
    const score = u => {
      if (/hevc/i.test(u)) return 2
      if (/\.mp4/i.test(u)) return 0
      return 1
    }
    return score(a) - score(b)
  })
}

async function downloadPinByUrl(url) {
  const data = await fetchJson(
    `${AXLY_DOWNLOAD}?url=${encodeURIComponent(url)}`,
    { headers: HEADERS }
  )

  if (!data?.status || !data.result?.type || !data.result?.media_urls?.length) {
    throw new Error(
      data?.message || 'Media dari link Pinterest tidak ditemukan'
    )
  }

  return {
    type: data.result.type,
    urls: extractRealMediaUrls(data.result.media_urls),
    originalUrl: url
  }
}

function withRetry(fn, label, retry = 3) {
  return async (...args) => {
    let lastError

    for (let attempt = 1; attempt <= retry; attempt++) {
      try {
        return await fn(...args)
      } catch (error) {
        lastError = error
        console.log(`[${label}] Retry ${attempt}/${retry}: ${formatError(error)}`)
        if (attempt < retry) await sleep(1500)
      }
    }

    throw lastError || new Error(`${label} gagal`)
  }
}

// retry rendah karena 1x search sudah mencoba 2 provider
const searchPinImagesRetry = withRetry(searchPinImages, 'PIN IMAGE', 2)
const searchPinVideosRetry = withRetry(searchPinVideos, 'PIN VIDEO', 2)

/* =========================================================
 * VIDEO: MP4 LANGSUNG / FFmpeg HLS
 * ========================================================= */

function buildDirectCandidates(videoUrl = '') {
  const match = String(videoUrl).match(
    /https:\/\/v1\.pinimg\.com\/videos\/([a-z]+)\/hls\/([0-9a-f]{2})\/([0-9a-f]{2})\/([0-9a-f]{2})\/([0-9a-f]+)\.m3u8/
  )

  if (!match) return []

  const [, cluster, a, b, c, hash] = match

  return VIDEO_VARIANTS.map(
    variant =>
      `https://v1.pinimg.com/videos/${cluster}/${variant}/${a}/${b}/${c}/${hash}.mp4`
  )
}

async function probeVideoUrl(url) {
  try {
    const response = await fetch(url, {
      headers: { Range: 'bytes=0-63' }
    })
    const ok = response.status === 200 || response.status === 206
    const total = Number(
      (response.headers.get('content-range') || '').split('/')[1] ||
        response.headers.get('content-length') ||
        0
    )
    try { response.body?.cancel() } catch {}
    return ok && total > 1024
  } catch {
    return false
  }
}

function buildEncodeArgs({ maxWidth, crf, audioBitrate }, input, isPipeInput) {
  const scale = `scale=min(${maxWidth}\\,iw):-2`
  const args = ['-hide_banner', '-loglevel', 'error']

  if (isPipeInput) {
    args.push('-i', 'pipe:0')
  } else {
    args.push('-i', input)
  }

  args.push(
    '-c:v', FFMPEG_VIDEO_CODEC,
    '-preset', FFMPEG_PRESET,
    '-crf', crf,
    '-vf', scale,
    '-c:a', FFMPEG_AUDIO_CODEC,
    '-b:a', audioBitrate,
    // output selalu pipe:1 -> MP4 muxer butuh fragmented mode (non-seekable)
    '-movflags', '+frag_keyframe+empty_moov+default_base_moof',
    '-f', 'mp4',
    'pipe:1'
  )

  return args
}

function runFfmpeg(args, inputBuffer) {
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

    const watchdog = setTimeout(() => {
      fail(
        new Error(
          `FFmpeg timeout setelah ${FFMPEG_TIMEOUT_MS / 1000} detik, proses dibatalkan`
        )
      )
    }, FFMPEG_TIMEOUT_MS)

    const fail = error => {
      if (finished) return
      finished = true
      clearTimeout(watchdog)
      try { ffmpeg.kill('SIGKILL') } catch {}
      reject(error)
    }

    ffmpeg.stdout.on('data', chunk => {
      outputSize += chunk.length
      chunks.push(chunk)
    })

    ffmpeg.stderr.on('data', chunk => {
      errors.push(chunk.toString())
    })

    ffmpeg.on('error', error => {
      if (error?.code === 'ENOENT') {
        fail(
          new Error(
            'FFmpeg tidak ditemukan. Install FFmpeg terlebih dahulu.'
          )
        )
        return
      }
      fail(error)
    })

    ffmpeg.on('close', code => {
      if (finished) return
      if (code !== 0) {
        fail(
          new Error(
            code === null
              ? 'FFmpeg crash/dihentikan tanpa pesan error'
              : `FFmpeg gagal (${code}): ${errors.join('').trim() || 'unknown error'}`
          )
        )
        return
      }
      const output = Buffer.concat(chunks)
      if (!output.length) {
        fail(new Error('FFmpeg menghasilkan video kosong'))
        return
      }
      finished = true
      clearTimeout(watchdog)
      resolve(output)
    })

    ffmpeg.stdin.on('error', error => {
      if (error?.code === 'EPIPE') return
      fail(error)
    })

    if (inputBuffer) {
      ffmpeg.stdin.end(inputBuffer)
    } else {
      ffmpeg.stdin.end()
    }
  })
}

async function hlsToMp4(m3u8Url) {
  if (!m3u8Url) throw new Error('URL m3u8 kosong')
  return runFfmpeg(
    buildEncodeArgs(
      {
        maxWidth: FFMPEG_MAX_WIDTH,
        crf: FFMPEG_CRF,
        audioBitrate: FFMPEG_AUDIO_BITRATE
      },
      m3u8Url,
      false
    ),
    null
  )
}

async function compressVideo(inputBuffer) {
  if (!Buffer.isBuffer(inputBuffer) || !inputBuffer.length) {
    throw new Error('Input video buffer kosong')
  }
  return runFfmpeg(
    buildEncodeArgs(
      {
        maxWidth: FFMPEG_MAX_WIDTH,
        crf: FFMPEG_CRF,
        audioBitrate: FFMPEG_AUDIO_BITRATE
      },
      'pipe:0',
      true
    ),
    inputBuffer
  )
}

async function compressVideoCompact(inputBuffer) {
  if (!Buffer.isBuffer(inputBuffer) || !inputBuffer.length) {
    throw new Error('Input video buffer kosong')
  }
  return runFfmpeg(
    buildEncodeArgs(
      {
        maxWidth: COMPACT_MAX_WIDTH,
        crf: COMPACT_CRF,
        audioBitrate: COMPACT_AUDIO_BITRATE
      },
      'pipe:0',
      true
    ),
    inputBuffer
  )
}

async function resolveVideo(video) {
  const directUrls = []

  // video_url bisa sudah berupa MP4 langsung (contoh: hasil fallback)
  if (/\.mp4(\?|$)/i.test(String(video.video_url || ''))) {
    directUrls.push(video.video_url)
  }

  // atau ubah pola m3u8 -> kandidat MP4
  directUrls.push(...buildDirectCandidates(video.video_url))

  for (const url of directUrls) {
    if (!(await probeVideoUrl(url))) continue

    console.log(`[PIN] Direct MP4: ${url}`)
    try {
      const buffer = await downloadWithLimit(url, MAX_ORIGINAL_VIDEO_SIZE)
      return { buffer, via: 'direct' }
    } catch (error) {
      console.log(`[PIN] Direct MP4 gagal: ${formatError(error)}`)
    }
  }

  console.log('[PIN] Fallback FFmpeg HLS -> MP4')
  return {
    buffer: await hlsToMp4(video.video_url),
    via: 'ffmpeg'
  }
}

/* =========================================================
 * IMAGE COMPRESS (BASE64)
 * ========================================================= */

async function compressImage(inputBuffer) {
  if (!Buffer.isBuffer(inputBuffer) || !inputBuffer.length) {
    throw new Error('Input image buffer kosong')
  }

  return sharp(inputBuffer)
    .resize({ width: HTML_IMAGE_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: HTML_IMAGE_QUALITY })
    .toBuffer()
}

async function getVideoThumb(url) {
  try {
    if (!url) return null

    const response = await fetch(url)
    if (!response.ok) return null

    const raw = Buffer.from(await response.arrayBuffer())
    if (!raw.length) return null

    return await sharp(raw)
      .resize({ width: 540, withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer()
  } catch (error) {
    console.error('[PIN THUMB ERROR]', formatError(error))
    return null
  }
}

/* =========================================================
 * HTML: GALLERY (IMAGES)
 * ========================================================= */

function createPinGallery({ query, items }) {
  const safeQuery = escapeHtml(cleanText(query, 40))
  const data = items.map((item, index) => ({
    i: index + 1,
    src: item.src,
    title: cleanText(item.title || safeQuery, 70),
    pinner: cleanText(item.pinner, 40),
    board: cleanText(item.board, 40),
    url: item.url || ''
  }))

  return `
<style>
:root {
  --ink: #ffffff;
  --muted: #b9b1b6;
  --red: #e60023;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  background: transparent;
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
}

.app {
  position: relative;
  width: 100%;
  max-width: 340px;
  border-radius: 18px;
  overflow: hidden;
  background: #1a0d12;
  box-shadow: 0 18px 40px rgba(0, 0, 0, .5);
}

.head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 10px;
}

.logo {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--red);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.head__text {
  min-width: 0;
  flex: 1;
}

.head__brand {
  font-size: 11px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--muted);
}

.head__query {
  font-size: 13px;
  font-weight: 600;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count {
  font-size: 11px;
  color: var(--muted);
  background: rgba(255,255,255,.08);
  border-radius: 20px;
  padding: 4px 10px;
  flex: none;
  font-variant-numeric: tabular-nums;
}

.stage {
  position: relative;
  margin: 0 14px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255,255,255,.06);
  min-height: 200px;
}

.stage img {
  width: 100%;
  max-height: 380px;
  object-fit: contain;
  display: block;
}

.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, .45);
  color: #fff;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.nav:active {
  transform: translateY(-50%) scale(.92);
}

.nav--prev { left: 8px; }
.nav--next { right: 8px; }

.meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px 4px;
}

.meta__names { min-width: 0; }

.meta__title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta__sub {
  font-size: 11px;
  color: var(--muted);
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.heart {
  width: 34px;
  height: 34px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
}

.heart svg { width: 19px; height: 19px; }

.heart.is-on { color: #ff5c8a; }
.heart.is-on svg { fill: currentColor; }

.save {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 12px 16px 0;
  padding: 12px;
  border-radius: 24px;
  background: var(--red);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.save:active { transform: scale(.97); }

.strip {
  display: flex;
  gap: 6px;
  padding: 14px 16px 4px;
  overflow-x: auto;
}

.strip::-webkit-scrollbar { display: none; }

.strip img {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  opacity: .45;
  border: 2px solid transparent;
  flex: none;
}

.strip img.is-active {
  opacity: 1;
  border-color: var(--red);
}

.note {
  padding: 10px 16px 16px;
  text-align: center;
  font-size: 10px;
  color: var(--muted);
  line-height: 1.6;
}
</style>

<div class="wrap">
  <div class="app">

    <div class="head">
      <div class="logo">P</div>
      <div class="head__text">
        <div class="head__brand">Pinterest</div>
        <div class="head__query">${safeQuery}</div>
      </div>
      <div class="count" id="count">1/${data.length}</div>
    </div>

    <div class="stage">
      <img id="photo" src="${data[0].src}" alt="pin">
      <button class="nav nav--prev" id="prev" type="button" aria-label="Sebelumnya">&#8249;</button>
      <button class="nav nav--next" id="next" type="button" aria-label="Berikutnya">&#8250;</button>
    </div>

    <div class="meta">
      <div class="meta__names">
        <div class="meta__title" id="title"></div>
        <div class="meta__sub" id="sub"></div>
      </div>
      <button class="heart" id="heart" type="button" aria-label="Suka">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.8 5.6a5.1 5.1 0 0 0-7.2 0L12 7.2l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2l1.6 1.6L12 21.6l7.2-7.2 1.6-1.6a5.1 5.1 0 0 0 0-7.2z"/>
        </svg>
      </button>
    </div>

    <a class="save" id="save" download="pinterest.jpg">
      &#11015; Simpan gambar
    </a>

    <div class="strip" id="strip"></div>

    <div class="note">
      Ketuk tombol merah untuk download gambar
    </div>

  </div>
</div>

<script>
(function () {
  'use strict'

  var DATA = ${JSON.stringify(data).replace(/</g, '\\u003c')}
  var index = 0

  var photo = document.getElementById('photo')
  var count = document.getElementById('count')
  var title = document.getElementById('title')
  var sub = document.getElementById('sub')
  var save = document.getElementById('save')
  var strip = document.getElementById('strip')
  var heart = document.getElementById('heart')

  if (!photo || !DATA.length) return

  DATA.forEach(function (item, i) {
    var thumb = document.createElement('img')
    thumb.src = item.src
    thumb.alt = 'thumb ' + (i + 1)
    thumb.addEventListener('click', function () {
      index = i
      render()
    })
    strip.appendChild(thumb)
  })

  function render() {
    var item = DATA[index]

    photo.src = item.src
    count.textContent = (index + 1) + '/' + DATA.length
    title.textContent = item.title
    sub.textContent =
      item.pinner && item.board
        ? item.pinner + ' • ' + item.board
        : item.pinner || item.board || ''

    save.href = item.src
    save.download = 'pinterest-' + item.i + '.jpg'

    var thumbs = strip.querySelectorAll('img')
    for (var t = 0; t < thumbs.length; t++) {
      thumbs[t].className = t === index ? 'is-active' : ''
    }
  }

  document.getElementById('prev').addEventListener('click', function () {
    index = (index - 1 + DATA.length) % DATA.length
    render()
  })

  document.getElementById('next').addEventListener('click', function () {
    index = (index + 1) % DATA.length
    render()
  })

  if (heart) {
    heart.addEventListener('click', function () {
      heart.classList.toggle('is-on')
    })
  }

  render()
})()
</script>
`
}

/* =========================================================
 * HTML: VIDEO PLAYER
 * ========================================================= */

function createVideoPlayer({ title, board, duration, videoSrc, posterSrc }) {
  const safeTitle = escapeHtml(title || 'Pinterest Video')
  const safeBoard = escapeHtml(board || 'Pinterest')
  const safeDuration = escapeHtml(duration || '0:00')
  const safePoster = posterSrc || DEFAULT_THUMB

  return `
<style>
:root {
  --ink: #ffffff;
  --muted: #b9b1b6;
  --red: #e60023;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  background: transparent;
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
}

.player {
  position: relative;
  width: 100%;
  max-width: 330px;
  border-radius: 18px;
  overflow: hidden;
  background: #1a0d12;
  box-shadow: 0 18px 40px rgba(0, 0, 0, .5);
}

.head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 12px;
}

.logo {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--red);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.head__text { min-width: 0; flex: 1; }

.head__brand {
  font-size: 9px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--muted);
}

.head__board {
  font-size: 12px;
  font-weight: 600;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

video {
  display: block;
  width: 100%;
  max-height: 420px;
  background: #000;
}

.info {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px 4px;
}

.info__names { min-width: 0; }

.info__title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info__sub {
  font-size: 11px;
  color: var(--muted);
  margin-top: 3px;
}

.save {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 12px 16px 0;
  padding: 12px;
  border-radius: 24px;
  background: var(--red);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.save:active { transform: scale(.97); }

.note {
  padding: 10px 16px 16px;
  text-align: center;
  font-size: 10px;
  color: var(--muted);
  line-height: 1.6;
}
</style>

<div class="wrap">
  <div class="player">

    <div class="head">
      <div class="logo">P</div>
      <div class="head__text">
        <div class="head__brand">Playing from Pinterest</div>
        <div class="head__board">${safeBoard}</div>
      </div>
    </div>

    <video
      id="vid"
      controls
      playsinline
      preload="metadata"
      poster="${safePoster}"
      src="${videoSrc}"
    ></video>

    <div class="info">
      <div class="info__names">
        <div class="info__title">${safeTitle}</div>
        <div class="info__sub">&#9201; ${safeDuration}</div>
      </div>
    </div>

    <a class="save" id="save" download="pinterest-video.mp4">
      &#11015; Simpan video
    </a>

    <div class="note">
      Ketuk tombol merah untuk download video
    </div>

  </div>
</div>

<script>
(function () {
  'use strict'

  var vid = document.getElementById('vid')
  var save = document.getElementById('save')

  if (!vid || !save) return

  save.addEventListener('click', function () {
    try {
      save.href = vid.currentSrc || vid.src
    } catch (e) {}
  })

  save.href = vid.src
})()
</script>
`
}

/* =========================================================
 * SEND RICH HTML (WA AI BOT VIEW)
 * ========================================================= */

async function sendRichHtml(conn, chat, html) {
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
                messageText: 'Pinterest'
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
 * CAPTION + PLAIN MEDIA
 * ========================================================= */

// pilih judul terbaik, skip judul kosong/"Tanpa Judul"
function pickPinTitle(pin = {}, query = '') {
  const candidates = [
    pin.grid_title,
    pin.title,
    pin.description,
    pin.seo_alt_text
  ]

  for (const value of candidates) {
    const text = cleanText(value, 70)
    if (text && !/^(tanpa judul|untitled|-)$/i.test(text)) {
      return text
    }
  }

  return cleanText(query, 60) || 'Pinterest'
}

function buildImageCaption(pin, query, index, total) {
  const title = pickPinTitle(pin, query)
  const pinner = cleanText(pin.pinner?.full_name || pin.pinner?.username, 40)
  const board = cleanText(pin.board?.name, 40)
  const reactions = Number(pin.reaction_counts?.['1'] || 0)

  return (
    `📌 *Pinterest — ${cleanText(query, 40)}* (${index}/${total})\n` +
    `🎨 ${title}\n` +
    (pinner ? `👤 ${pinner}\n` : '') +
    (board ? `💾 ${board}\n` : '') +
    (reactions ? `❤️ ${reactions.toLocaleString('id-ID')}\n` : '') +
    `\n> 📩 Simpan ke galeri: ketuk titik tiga → Simpan`
  )
}

function buildVideoCaption(video, query) {
  const title = pickPinTitle(video, query)
  const board = cleanText(
    typeof video.board === 'string' ? video.board : video.board?.name,
    40
  )

  return (
    `🎬 *Pinterest Video — ${cleanText(query, 40)}*\n` +
    `📝 ${title}\n` +
    `⏱️ ${formatDuration(video.duration)}\n` +
    (board ? `💾 ${board}\n` : '') +
    (video.url ? `🔗 ${video.url}\n` : '') +
    `\n> 📩 Video MP4 siap disimpan ke galeri`
  )
}

async function sendPlainImages(conn, m, query, pins) {
  let sent = 0

  for (const [index, pin] of pins.entries()) {
    try {
      console.log(`[PIN] Download image ${index + 1}/${pins.length}`)
      const buffer = await downloadWithLimit(pin.images_url, MAX_ORIGINAL_IMAGE_SIZE)

      await conn.sendMessage(
        m.chat,
        {
          image: buffer,
          caption: buildImageCaption(pin, query, index + 1, pins.length)
        },
        { quoted: global.fmeta || m }
      )

      sent++
      if (index < pins.length - 1) await sleep(SEND_DELAY_MS)
    } catch (error) {
      console.error(`[PIN IMAGE ${index + 1} ERROR]`, formatError(error))
    }
  }

  if (!sent) throw new Error('Semua gambar gagal diunduh')
  return sent
}

async function sendPlainVideo(conn, m, query, video, buffer) {
  const thumb = await getVideoThumb(video.thumbnail)

  await conn.sendMessage(
    m.chat,
    {
      video: buffer,
      mimetype: 'video/mp4',
      caption: buildVideoCaption(video, query),
      ...(thumb?.length ? { jpegThumbnail: thumb } : {})
    },
    { quoted: global.fmeta || m }
  )
}

/* =========================================================
 * DELIVER VIDEO (dipakai search & link langsung)
 * ========================================================= */

async function pickPlayableUrl(urls = []) {
  for (const url of urls) {
    if (/\.mp4(\?|$)/i.test(url) && (await probeVideoUrl(url))) {
      return url
    }
  }
  return urls.find(u => /\.m3u8/i.test(u)) || urls[0] || ''
}

async function deliverPinVideo(conn, m, query, video) {
  const playable = await resolveVideo(video)
  let buffer = playable.buffer
  console.log(`[PIN] Video via ${playable.via}: ${mb(buffer.length)} MB`)

  if (buffer.length > MAX_FINAL_VIDEO_SIZE) {
    console.log('[PIN] Video terlalu besar, compressing...')
    buffer = await compressVideo(buffer)
    console.log(`[PIN] Compressed: ${mb(buffer.length)} MB`)
  }

  if (buffer.length > MAX_FINAL_VIDEO_SIZE) {
    throw new Error(
      `Video tetap terlalu besar. Maksimal ${MAX_FINAL_VIDEO_MB} MB`
    )
  }

  // ---- HTML player (base64) ----
  let compact = buffer
  let b64Size = Math.ceil(buffer.length * 4 / 3)

  if (b64Size > MAX_BASE64_VIDEO_SIZE) {
    console.log('[PIN] Base64 terlalu besar, compact encode...')
    try {
      compact = await compressVideoCompact(buffer)
      b64Size = Math.ceil(compact.length * 4 / 3)
      console.log(`[PIN] Compact: ${mb(compact.length)} MB`)
    } catch (error) {
      console.log(`[PIN] Compact gagal: ${formatError(error)}`)
    }
  }

  if (b64Size <= MAX_BASE64_VIDEO_SIZE) {
    const thumb = await getVideoThumb(video.thumbnail)
    const html = createVideoPlayer({
      title: pickPinTitle(video, query),
      board: cleanText(
        typeof video.board === 'string' ? video.board : video.board?.name,
        40
      ),
      duration: video.duration ? formatDuration(video.duration) : '—',
      videoSrc: 'data:video/mp4;base64,' + compact.toString('base64'),
      posterSrc: thumb?.length
        ? 'data:image/jpeg;base64,' + thumb.toString('base64')
        : ''
    })

    console.log(`[PIN] HTML player: ${mb(Buffer.byteLength(html))} MB`)
    try {
      await sendRichHtml(conn, m.chat, html)
      console.log('[PIN] HTML player terkirim')
    } catch (error) {
      console.error('[PIN HTML PLAYER ERROR]', formatError(error))
    }
  } else {
    console.log(`[PIN] Base64 ${mb(b64Size)} MB > limit, skip HTML player`)
  }

  // ---- plain video (save to gallery) ----
  if (SEND_PLAIN_MEDIA) {
    await sendPlainVideo(conn, m, query, video, buffer)
  }
}

/* =========================================================
 * LINK LANGSUNG (pin.it / pinterest.com/pin/...)
 * ========================================================= */

async function sendDirectPin(conn, m, pinUrl) {
  console.log('[PIN] Direct link:', pinUrl)

  const pin = await downloadPinByUrl(pinUrl)
  console.log(`[PIN] Tipe: ${pin.type} | ${pin.urls.length} media URL`)

  if (pin.type === 'video') {
    const bestUrl = await pickPlayableUrl(pin.urls)
    if (!bestUrl) throw new Error('URL video tidak bisa diunduh')

    const video = {
      video_url: bestUrl,
      thumbnail: '',
      title: 'Pinterest Video',
      description: pin.originalUrl,
      board: '',
      duration: 0,
      url: pin.originalUrl
    }

    await deliverPinVideo(conn, m, 'pinterest', video)
    return
  }

  // ---- tipe image ----
  let buffer = null
  for (const url of pin.urls.filter(u => !/\.mp4|\.m3u8/i.test(u))) {
    try {
      buffer = await downloadWithLimit(url, MAX_ORIGINAL_IMAGE_SIZE)
      break
    } catch (error) {
      console.log(`[PIN] Download gambar gagal: ${formatError(error)}`)
    }
  }

  if (!buffer) throw new Error('Gambar dari link tidak bisa diunduh')

  const small = await compressImage(buffer)
  const html = createPinGallery({
    query: 'pinterest',
    items: [
      {
        src: 'data:image/jpeg;base64,' + small.toString('base64'),
        title: 'Pinterest',
        pinner: '',
        board: '',
        url: pin.originalUrl
      }
    ]
  })

  console.log(`[PIN] HTML gallery: ${mb(Buffer.byteLength(html))} MB`)
  try {
    await sendRichHtml(conn, m.chat, html)
    console.log('[PIN] HTML gallery terkirim')
  } catch (error) {
    console.error('[PIN HTML GALLERY ERROR]', formatError(error))
  }

  if (SEND_PLAIN_MEDIA) {
    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption: `📌 *Pinterest*\n🔗 ${pin.originalUrl}\n\n> 📩 Simpan ke galeri: ketuk titik tiga → Simpan`
      },
      { quoted: global.fmeta || m }
    )
  }
}

/* =========================================================
 * HANDLER
 * ========================================================= */

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const isVideo = /vid/i.test(command)

  if (!text?.trim()) {
    throw (
      `Contoh penggunaan:\n` +
      `${usedPrefix + command} ${isVideo ? 'mentahan' : 'desain poster'}\n` +
      `${usedPrefix + command} https://pin.it/6LnJhcDKE\n\n` +
      `💡 ${usedPrefix}pin <query/link> = galeri gambar (HTML)\n` +
      `💡 ${usedPrefix}pinvid <query/link> = video player (HTML)`
    )
  }

  const query = text.trim()
  const pinUrl = extractPinUrl(query)
  await m.react('🔍')

  try {
    // ---- mode link langsung (pin.it / pinterest.com/pin/...) ----
    if (pinUrl) {
      console.log('[PIN] Mode link langsung:', pinUrl)
      await sendDirectPin(conn, m, pinUrl)
      await m.react('✅')
      return
    }

    if (isVideo) {
      console.log('[PIN] Searching videos:', query)
      const videos = await searchPinVideosRetry(query)
      if (!videos.length) {
        throw new Error('Video Pinterest tidak ditemukan, coba kata kunci lain')
      }
      console.log(`[PIN] ${videos.length} video ditemukan`)

      let lastError = null
      let done = false

      for (const video of videos.slice(0, MAX_VIDEO_ATTEMPTS)) {
        try {
          await deliverPinVideo(conn, m, query, video)
          done = true
          break
        } catch (error) {
          lastError = error
          console.error('[PIN VIDEO ATTEMPT ERROR]', formatError(error))
        }
      }

      if (!done) {
        throw lastError || new Error('Tidak ada video yang bisa dikirim')
      }
    } else {
      console.log('[PIN] Searching images:', query)
      const pins = (await searchPinImagesRetry(query)).slice(0, MAX_HTML_IMAGES)
      if (!pins.length) {
        throw new Error('Gambar Pinterest tidak ditemukan, coba kata kunci lain')
      }
      console.log(`[PIN] ${pins.length} gambar ditemukan`)

      // ---- download + compress untuk HTML (base64) ----
      const items = []
      for (const [index, pin] of pins.entries()) {
        try {
          const original = await downloadWithLimit(
            pin.images_url,
            MAX_ORIGINAL_IMAGE_SIZE
          )
          const small = await compressImage(original)

          items.push({
            src: 'data:image/jpeg;base64,' + small.toString('base64'),
            title: pickPinTitle(pin, query),
            pinner: cleanText(
              pin.pinner?.full_name || pin.pinner?.username,
              40
            ),
            board: cleanText(pin.board?.name, 40),
            url: pin.pin || ''
          })

          console.log(
            `[PIN] Image ${index + 1}: ${mb(small.length)} MB (base64 ready)`
          )
        } catch (error) {
          console.error(`[PIN IMAGE ${index + 1} ERROR]`, formatError(error))
        }
      }

      if (!items.length) {
        throw new Error('Semua gambar gagal diunduh')
      }

      // ---- HTML gallery (base64) ----
      const html = createPinGallery({ query, items })
      console.log(`[PIN] HTML gallery: ${mb(Buffer.byteLength(html))} MB`)
      try {
        await sendRichHtml(conn, m.chat, html)
        console.log('[PIN] HTML gallery terkirim')
      } catch (error) {
        console.error('[PIN HTML GALLERY ERROR]', formatError(error))
      }

      // ---- plain images (save to gallery) ----
      if (SEND_PLAIN_MEDIA) {
        await sendPlainImages(conn, m, query, pins)
      }
    }

    await m.react('✅')
  } catch (error) {
    console.error('[PIN ERROR]', error)
    await m.react('❌')

    const message = formatError(error)
    try {
      await conn.sendMessage(
        m.chat,
        {
          text:
            '❌ Gagal mengambil Pinterest, coba lagi nanti.\n\n' +
            `> ${message}`
        },
        { quoted: global.fmeta || m }
      )
    } catch (sendError) {
      console.error('[PIN ERROR MESSAGE]', sendError)
    }
  }
}

handler.help = ['pin', 'pinvid']
handler.tags = ['downloader']
handler.command = /^(pin|pinterest|pinvid|pinvideo)$/i
handler.limit = true

export default handler
