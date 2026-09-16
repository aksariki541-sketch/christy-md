// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/brat.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: brat→brat2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .brat2

import { bratGen } from 'brat-canvas'
import { sticker } from '../../lib/nakano/sticker.js'

let handler = async (m, { conn, text }) => {
  if (m.quoted && m.quoted.text) text = m.quoted.text || 'hai'
  else if (!text && !m.quoted) return m.reply('reply / masukan teks')

  try {
    await m.react('🕜')
    const { buffer } = await bratGen(text)
    const stiker = await sticker(Buffer.from(buffer), false, global.stickpack || global.namebot || 'Sticker Pack', global.stickauth || global.author || 'Bot')

    if (stiker) {
      await conn.sendFile(m.chat, stiker, '', '', m)
      await m.react('✅')
    } else {
      await m.react('❌')
    }
  } catch (e) {
    await m.react('❌')
    throw e
  }
}

handler.command = ['brat2']
handler.group = false

export default handler
handler.category = 'Media'
handler.description = 'Brat'

