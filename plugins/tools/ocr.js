// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/ocr.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ocr

/**
 * OCR Image (Optical Character Recognition)
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Riki
 * Channel : https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I
 * Note : install dulu npm install ocr-space-api-wrapper
 */

import { ocrSpace } from 'ocr-space-api-wrapper'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime) {
    return m.reply('❌ Reply gambar.')
  }

  if (!/image\/(png|jpe?g)/i.test(mime)) {
    return m.reply('❌ Hanya png/jpg/jpeg.')
  }

  try {
    let media = await q.download()

    let base64 = `data:${mime};base64,${media.toString('base64')}`

    let result = await ocrSpace(base64, {
      apiKey: 'helloworld',
      language: 'eng'
    })

    let text = result?.ParsedResults?.[0]?.ParsedText

    if (!text) {
      return m.reply('❌ Teks tidak ditemukan.')
    }

    let teks = `
— ocr result —

❀ hasil scan :
${text.trim()}
`

    await conn.sendMessage(m.chat, {
      text: teks
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('❌ Gagal melakukan OCR.')
  }
}

handler.command = ['ocr']

export default handler
handler.category = 'Tools'
handler.description = 'Ocr'

