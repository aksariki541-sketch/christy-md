// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/tiktok.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tt, .tiktok, .ttimg, .tiktokimg, .ttslide

/**
 * Fitur   : TikTok Downloader (Video + Slide/Photo)
 * Type    : Plugin ESM - All in One
 * Command : .tt .tiktok .ttimg .tiktokimg .ttslide
 *
 * API dipisah per jenis media:
 *   FOTO  : Kyzzz  -> Zelora -> Tikwm
 *   VIDEO : Zelora -> Tikwm
 */

import { proto, generateWAMessageFromContent, generateWAMessageContent } from '../../lib/baileys.js'
import { createDecipheriv, scryptSync } from 'node:crypto'

/* ────────────────── KONFIG (endpoint terenkripsi) ────────────────── */

/**
 * Endpoint & apikey disimpan sebagai blob AES-256-GCM, bukan teks polos.
 * Urutan ENC: 0=kyzzz url, 1=kyzzz apikey, 2=zelora url, 3=tikwm url
 *
 * Mau ganti endpoint? jalankan: node enc-tool.js "url-baru"
 * Mau kunci sendiri? set TT_KEY di .env lalu enkripsi ulang pakai TT_KEY yg sama.
 */
const ENC = [
  'A0V222pvOvCQ8q/6QOZ8DGCdMacPC5n7AUcqqP1OBNs/3Fb8+CJ+93NxOX1KsHkJTLbjyTreV3Jemr/HR+zMQ9+LeDqPdn8V/geLNsq26j5ehgCwrw==',
  'rcDYsILsO0a8i6iy2w/9TKQPJEOphJFnHpv/PbvunXUSxKHaKCkTnhex9n3PvzgDXojq7aZ7X00=',
  'RXFrXUH9yzuvYWEuLvVteAZXH8b3wyp4k6JIopQNY5OKVaLzoyF+8i0i7o4AlW4g8xebFhZNqiYgepAu4r8inU0OOq2jOG8yK0jLRljDofAQi1slKNqUqvOMuvzFGw==',
  'frBUdb5uGZcNzV9rSnMG4MPeHNw2A+DhAcrWfuecy93h9nRUk4QLwoRFZ0433mDdVAO1Wx4M3dD6PjDRtns9rsIUMC3t9g=='
]

const _s = [0x39, 0x3b, 0x30, 0x6b, 0x3f, 0x35, 0x2b, 0x6a, 0x38, 0x3e, 0x2a, 0x6b, 0x3d, 0x34, 0x2e]
const _pass = () => process.env.TT_KEY || Buffer.from(_s.map(b => b ^ 0x5a)).toString('utf8')

function dec(i) {
  try {
    const buf = Buffer.from(ENC[i], 'base64')
    const key = scryptSync(_pass(), buf.subarray(0, 16), 32)
    const d = createDecipheriv('aes-256-gcm', key, buf.subarray(16, 28))
    d.setAuthTag(buf.subarray(28, 44))
    return d.update(buf.subarray(44), undefined, 'utf8') + d.final('utf8')
  } catch {
    console.error('[tiktok] Gagal membuka konfigurasi API — cek TT_KEY di .env')
    return ''
  }
}

// dibuka sekali saat plugin dimuat, lalu tersimpan di memori saja
const CFG = {
  kyzzUrl: process.env.TT_KYZZ_URL || dec(0),
  kyzzKey: process.env.TT_KYZZ_KEY || dec(1),
  zelora: process.env.TT_ZELORA_URL || dec(2),
  tikwm: process.env.TT_TIKWM_URL || dec(3)
}

const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'

const REGEX_TT = /(https?:\/\/(?:vt|vm|www|m)\.tiktok\.com\/[^\s]+|https?:\/\/(?:www\.)?tiktok\.com\/@[\w.-]+\/(?:video|photo)\/\d+)/i

/* ────────────────── UTIL ────────────────── */

// Ambil JSON dengan aman (kadang API balas HTML / halaman Cloudflare)
async function getJson(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { 'User-Agent': UA, accept: 'application/json', ...(opts.headers || {}) }
  })
  const raw = await res.text()
  if (/^\s*</.test(raw)) throw new Error('server balas HTML (diblokir / rate limit)')
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('respon bukan JSON valid')
  }
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// Bentuk standar yang dipakai handler
function shape(o) {
  const images = (o.images || []).filter(Boolean)
  const uniqueId = o.username || 'user'
  return {
    source: o.source,
    type: images.length ? 'image' : 'video',
    id: o.id || '',
    title: (o.title || '').replace(/\s+/g, ' ').trim(),
    author: o.author || uniqueId || '-',
    username: uniqueId,
    images,
    video: o.video || null,
    audio: o.audio || null,
    music: o.music || '-',
    stats: {
      play: o.play || 0,
      like: o.like || 0,
      comment: o.comment || 0,
      share: o.share || 0
    },
    permalink: `https://www.tiktok.com/@${uniqueId}/video/${o.id || ''}`
  }
}

/* ────────────────── SUMBER FOTO ────────────────── */

// Kyzzz — paling bagus untuk slideshow/photo mode
async function kyzzScrape(url) {
  const json = await getJson(`${CFG.kyzzUrl}?url=${encodeURIComponent(url)}&apikey=${CFG.kyzzKey}`)
  if (!json?.status) throw new Error(json?.error || json?.message || 'gagal')
  const r = json.result || {}
  const media = r.media || {}
  const photos = (media.photos || []).filter(Boolean)
  const vid = media.video || {}

  return shape({
    source: 'Kyzzz',
    id: r.id,
    title: r.description,
    author: r.author?.nickname,
    username: r.author?.username,
    images: photos,
    // catatan: link video kyzzz sering butuh header khusus, jadi tidak diandalkan
    video: vid.directStreamUrl || vid.downloadUrl || null,
    audio: r.music?.playUrl || null,
    music: r.music?.title,
    play: r.stats?.plays,
    like: r.stats?.likes,
    comment: r.stats?.comments,
    share: r.stats?.shares
  })
}

/* ────────────────── SUMBER VIDEO / UMUM ────────────────── */

// Zelora — andalan untuk video (format ala tikwm)
async function zeloraScrape(url) {
  const json = await getJson(CFG.zelora + encodeURIComponent(url))
  if (json?.status === false) throw new Error(json?.message || 'gagal')
  const d = json?.result?.data || json?.result || json?.data
  if (!d) throw new Error('data kosong')
  return fromTikwmLike(d, 'Zelora')
}

// Tikwm langsung
async function tikwmScrape(url) {
  const json = await getJson(`${CFG.tikwm}?url=${encodeURIComponent(url)}&hd=1`)
  if (!json?.data) throw new Error(json?.msg || 'data kosong')
  return fromTikwmLike(json.data, 'Tikwm')
}

// Normalisasi respon bergaya tikwm (Zelora / Tikwm)
function fromTikwmLike(d, source) {
  let images = []
  if (Array.isArray(d.images) && d.images.length) {
    images = d.images.map(i => (typeof i === 'string' ? i : i?.url || i?.display_image?.url_list?.[0]))
  } else {
    const posts = d.image_post_info?.images || d.imagePost?.images || d.photos || []
    images = posts.map(i => (typeof i === 'string' ? i : i?.display_image?.url_list?.[0] || i?.url_list?.[0] || i?.url))
  }

  const out = shape({
    source,
    id: d.id || d.video_id,
    title: d.title || d.desc || d.caption,
    author: d.author?.nickname || (typeof d.author === 'string' ? d.author : null),
    username: d.author?.unique_id || d.username || d.unique_id,
    images: images.filter(Boolean),
    video: d.hdplay || d.play || d.wmplay || d.hd || d.nowatermark || null,
    audio: d.music || d.music_info?.play || d.audio || null,
    music: d.music_info?.title || d.music_title,
    play: d.play_count,
    like: d.digg_count || d.like_count,
    comment: d.comment_count,
    share: d.share_count
  })

  if (!out.video && !out.images.length) throw new Error('media tidak lengkap')
  return out
}

/* ────────────────── ROUTER API ────────────────── */

const SOURCES = {
  // slideshow: kyzzz duluan, dia paling stabil baca photo mode
  photo: [kyzzScrape, zeloraScrape, tikwmScrape],
  // video: kyzzz sering nolak video, jadi tidak dipakai di sini
  video: [zeloraScrape, tikwmScrape]
}

async function tiktokScrape(url, kind = 'video') {
  const errors = []
  for (const fn of SOURCES[kind]) {
    try {
      const res = await fn(url)
      if (res) {
        console.log(`[tiktok] ${kind} via ${res.source}`)
        return res
      }
    } catch (e) {
      errors.push(`${fn.name.replace('Scrape', '')}: ${e.message}`)
    }
  }
  throw new Error(`Semua API ${kind} gagal → ${errors.join(' | ')}`)
}

// Pencarian by keyword (tikwm feed search)
async function tiktokSearch(query) {
  const json = await getJson(`${CFG.tikwm}feed/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Referer: new URL(CFG.tikwm).origin + '/' },
    body: new URLSearchParams({ keywords: query, count: '10', cursor: '0', HD: '1' })
  })
  const list = json?.data?.videos || []
  return list.map(v => ({
    title: v.title,
    author: v.author?.nickname,
    url: `https://www.tiktok.com/@${v.author?.unique_id}/video/${v.video_id}`
  }))
}

/* ────────────────── PENGIRIM PESAN ────────────────── */

async function createImage(url, conn) {
  const { imageMessage } = await generateWAMessageContent(
    { image: { url } },
    { upload: conn.waUploadToServer }
  )
  return imageMessage
}

async function sendCarousel(conn, m, res) {
  const cards = []
  for (const img of res.images.slice(0, 10)) {
    cards.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: res.title || 'TikTok Slide'
      }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({
        text: 'ᴍɪᴋᴜ yᴀᴍᴀᴅᴀ - ᴍᴅ'
      }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: res.author,
        hasMediaAttachment: true,
        imageMessage: await createImage(img, conn)
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: 'Buka TikTok',
              url: res.permalink
            })
          }
        ]
      })
    })
  }

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({
            text:
`✨ *TIKTOK PHOTO*

Judul: ${res.title || '-'}
Uploader: ${res.author}
Total: ${res.images.length}${res.images.length > 10 ? ' (ditampilkan 10)' : ''}`
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: 'Slide Viewer' }),
          header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
        })
      }
    }
  }, { quoted: m })

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

// WhatsApp tidak kuat album raksasa -> pecah tiap 10 foto
async function sendAlbum(conn, m, res, caption) {
  const groups = chunk(res.images, 10)
  for (let g = 0; g < groups.length; g++) {
    try {
      await conn.sendMessage(
        m.chat,
        {
          album: groups[g].map((img, i) => ({
            image: { url: img },
            caption: g === 0 && i === 0 ? caption : ''
          }))
        },
        { quoted: m }
      )
    } catch (e) {
      console.log('[tiktok] album gagal, kirim satuan:', e?.message || e)
      for (let i = 0; i < groups[g].length; i++) {
        await conn.sendMessage(
          m.chat,
          { image: { url: groups[g][i] }, caption: g === 0 && i === 0 ? caption : '' },
          { quoted: m }
        )
      }
    }
  }
}

/* ────────────────── HANDLER ────────────────── */

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const isImgMode = /^(ttimg|tiktokimg|ttslide)$/i.test(command)

  const input = (m.quoted?.text || text || '').trim()
  if (!input) {
    return m.reply(
      `Contoh:\n` +
      `${usedPrefix + command} https://vt.tiktok.com/xxxx` +
      (isImgMode ? '' : `\n${usedPrefix + command} Christy MD edit`)
    )
  }

  await m.react('✨')

  try {
    let url = REGEX_TT.exec(input)?.[0]

    if (!url) {
      if (/^https?:\/\//i.test(input)) throw '❌ Link TikTok tidak valid.'
      let results = []
      try {
        results = await tiktokSearch(input)
      } catch {
        throw '❌ Pencarian sedang tidak tersedia. Kirim link TikTok-nya langsung ya.'
      }
      if (!results.length) throw '❌ Hasil pencarian tidak ditemukan.'
      url = results[0].url
    }

    // tentukan API mana yang dipakai duluan
    let kind = isImgMode || /\/photo\//i.test(url) ? 'photo' : 'video'
    let res = await tiktokScrape(url, kind)

    // salah tebak? pindah ke rantai API yang sesuai
    if (kind === 'video' && res.type === 'image') {
      try {
        res = await tiktokScrape(url, 'photo')
      } catch { /* pakai hasil sebelumnya */ }
    } else if (kind === 'photo' && res.type === 'video') {
      try {
        res = await tiktokScrape(url, 'video')
      } catch { /* pakai hasil sebelumnya */ }
    }

    const shortTitle = res.title.length > 80 ? res.title.slice(0, 80) + '...' : (res.title || '-')
    const caption = `*\`TikTok Downloader\`*

✿ *\`Judul\`* : ${shortTitle}
✿ *\`Uploader\`* : ${res.author}
✿ *\`Musik\`* : ${res.music}
✿ *\`Like\`* : ${res.stats.like.toLocaleString('id-ID')}  ✿ *\`Views\`* : ${res.stats.play.toLocaleString('id-ID')}`

    /* ── SLIDESHOW / FOTO ── */
    if (res.type === 'image') {
      if (isImgMode) {
        try {
          await sendCarousel(conn, m, res)
        } catch (e) {
          console.log('[tiktok] carousel gagal, kirim album:', e?.message || e)
          await sendAlbum(conn, m, res, caption)
        }
      } else {
        await sendAlbum(conn, m, res, caption)
      }

      if (res.audio) {
        await conn.sendMessage(
          m.chat,
          { audio: { url: res.audio }, mimetype: 'audio/mpeg' },
          { quoted: m }
        )
      }

      return await m.react('✅')
    }

    /* ── VIDEO ── */
    if (isImgMode) throw '❌ Post ini bukan slideshow foto, gunakan .tt untuk video.'

    if (!res.video) throw '❌ Media tidak ditemukan.'

    await conn.sendMessage(
      m.chat,
      { video: { url: res.video }, caption, mimetype: 'video/mp4' },
      { quoted: m }
    )

    if (res.audio) {
      await conn.sendMessage(
        m.chat,
        { audio: { url: res.audio }, mimetype: 'audio/mpeg' },
        { quoted: m }
      )
    }

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    throw String(e?.message || e)
  }
}

handler.command = ['tt', 'tiktok', 'ttimg', 'tiktokimg', 'ttslide']

export default handler
handler.category = 'Media'
handler.description = 'Tiktok'

