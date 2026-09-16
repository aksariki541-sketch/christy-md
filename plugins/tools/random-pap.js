// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/internet/random-pap.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .pap

/*
 * .pap — Random PAP
 * FIX: API nexadev mengembalikan JPEG langsung (bukan JSON)
 *      dulu di-parse .json() → SyntaxError JFIF
 */

'use strict'

// pakai global fetch (Node 18+) — fallback node-fetch kalau perlu
const fetchFn = globalThis.fetch
  ? globalThis.fetch.bind(globalThis)
  : (...args) => import('node-fetch').then(({ default: f }) => f(...args))

const PAP_API = 'https://api.nexadev.my.id/api/random/pap'

function pickImageUrl(json) {
  if (!json || typeof json !== 'object') return null
  return (
    json.result?.url ||
    json.result?.image ||
    json.result?.img ||
    json.data?.url ||
    json.data?.image ||
    json.url ||
    json.image ||
    (typeof json.result === 'string' && /^https?:\/\//i.test(json.result)
      ? json.result
      : null) ||
    (typeof json.data === 'string' && /^https?:\/\//i.test(json.data)
      ? json.data
      : null) ||
    null
  )
}

let handler = async (m, { conn }) => {
  try {
    await m.react('📸').catch(() => {})

    const res = await fetchFn(PAP_API, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'image/*,application/json,*/*'
      },
      redirect: 'follow'
    })

    if (!res.ok) {
      throw new Error(`API error HTTP ${res.status}`)
    }

    const ctype = (res.headers.get('content-type') || '').toLowerCase()
    const buf = Buffer.from(await res.arrayBuffer())

    // ---- kasus utama: API kirim JPEG/PNG langsung ----
    if (
      ctype.includes('image/') ||
      buf[0] === 0xff && buf[1] === 0xd8 || // jpeg
      buf[0] === 0x89 && buf[1] === 0x50 // png
    ) {
      await conn.sendMessage(
        m.chat,
        {
          image: buf,
          caption: '📸 *Random PAP*'
        },
        { quoted: m }
      )
      await m.react('✅').catch(() => {})
      return
    }

    // ---- fallback: kalau suatu saat API balik JSON ----
    let json
    try {
      json = JSON.parse(buf.toString('utf8'))
    } catch {
      throw new Error(
        'Response bukan gambar/JSON valid (mungkin API down).'
      )
    }

    if (json.status === false) {
      throw new Error(json.message || 'Gagal mengambil PAP.')
    }

    const image = pickImageUrl(json)
    if (!image) throw new Error('URL gambar tidak ditemukan di response.')

    // image bisa string URL atau buffer base64
    if (typeof image === 'string' && /^https?:\/\//i.test(image)) {
      await conn.sendMessage(
        m.chat,
        {
          image: { url: image },
          caption: '📸 *Random PAP*'
        },
        { quoted: m }
      )
    } else if (typeof image === 'string' && image.startsWith('data:image')) {
      const b64 = image.split(',')[1] || ''
      await conn.sendMessage(
        m.chat,
        {
          image: Buffer.from(b64, 'base64'),
          caption: '📸 *Random PAP*'
        },
        { quoted: m }
      )
    } else {
      throw new Error('Format gambar tidak dikenali.')
    }

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[PAP]', e)
    await m.react('❌').catch(() => {})
    await m.reply(`❌ ${e?.message || e}`)
  }
}

handler.command = ['pap']

export default handler
handler.category = 'Tools'
handler.description = 'Random-pap'

