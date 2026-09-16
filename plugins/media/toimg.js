// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/toimg.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: toimage→toimage2, toimg→toimg2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .toimage2, .toimg2

import sharp from 'sharp'

let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted) {
    return m.reply(`Reply sticker dengan command *${usedPrefix + command}*`)
  }

  let q = m.quoted
  let mime = q.mimetype || ''

  if (!/image\/webp/.test(mime)) {
    return m.reply('Itu bukan sticker')
  }

  try {
    let media = await q.download()

    let img = await sharp(media)
      .png({ quality: 100 })
      .toBuffer()

    await conn.sendFile(
      m.chat,
      img,
      'image.png',
      null,
      m
    )

  } catch (e) {
    console.error(e)
    m.reply('Gagal convert sticker ke image')
  }
}

handler.command = ['toimage2', 'toimg2']


export default handler
handler.category = 'Media'
handler.description = 'Toimg'

