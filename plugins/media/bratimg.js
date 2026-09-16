// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/bratimg.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bratimg

import { sticker } from '../../lib/nakano/sticker.js'

let handler = async (m, { conn, text }) => {
  if (m.quoted && m.quoted.text) text = m.quoted.text || 'hai'
  else if (!text && !m.quoted) return m.reply('reply / masukan teks')

  try {
    await m.react('🕒')

    const url = `https://aqul-brat.hf.space?text=${encodeURIComponent(text)}`
    const pack = global.stickpack || global.namebot || 'Sticker Pack'
    const author = global.stickauth || global.author || 'Bot'
    let stiker = await sticker(false, url, pack, author)

    if (stiker) {
      await conn.sendFile(m.chat, stiker, '', '', global.fstatus)
      await m.react('✅')
    } else {
      await m.react('❌')
    }
  } catch (e) {
    await m.react('❌')
    throw e
  }
}

handler.command = ['bratimg']
handler.group = false

export default handler
handler.category = 'Media'
handler.description = 'Bratimg'

