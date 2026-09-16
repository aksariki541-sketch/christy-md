// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/brathd.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .brathd

import scraper from '@zenaveline/scraper'
import { sticker } from '../../lib/nakano/sticker.js'

let handler = async (m, { conn, text }) => {
  if (m.quoted?.text) text = m.quoted.text
  if (!text) return m.reply('Reply / masukan teks')

  try {
    await m.react('🕜')

    const buffer = await scraper.brat({
      text,
      theme: 'white',
      blur: 0
    })

    const stiker = await sticker(
      buffer,
      false,
      global.stickpack || global.namebot || 'Sticker Pack',
      global.stickauth || global.author || 'Bot'
    )

    if (!stiker) throw new Error('Gagal membuat sticker.')

    await conn.sendFile(m.chat, stiker, 'brathd.webp', '', m)
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    throw e
  }
}

handler.command = ['brathd']
handler.group = false

export default handler
handler.category = 'Media'
handler.description = 'Brathd'

