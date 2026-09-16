// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/image/img2img.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: editimg→editimg3
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .editimg3, .img2img

import scraper from '@zenaveline/scraper'

let handler = async (m, { conn, text }) => {
  const q = m.quoted || m
  const mime = q.mimetype || ''

  if (!/image/.test(mime)) {
    throw `Reply gambar dengan caption:

.editimg <prompt>`
  }

  if (!text) throw 'Masukkan prompt.'

  await m.react('🕒')

  try {
    const buffer = await q.download()
    const result = await scraper.nanobanana(buffer, text)

    if (result.status !== 'success' || !result.image_url) {
      throw 'Gagal mengedit gambar.'
    }

    await conn.sendFile(
      m.chat,
      result.image_url,
      'edit.webp',
      '',
      m
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw String(e?.message || e)
  }
}

handler.command = ['editimg3', 'img2img']

export default handler
handler.category = 'Fun'
handler.description = 'Img2img'

