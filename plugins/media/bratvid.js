// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/bratvid.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bratvid

import { sticker } from '../../lib/nakano/sticker.js'

let handler = async (m, { conn, args }) => {
  const text = args.join(' ') || (m.quoted && m.quoted.text)
  if (!text) return m.reply(`✨ Masukin teks dong!\nContoh: .bratvid halo riki`)

  try {
    const url = `https://brat.siputzx.my.id/gif?text=${encodeURIComponent(text)}`
    let stiker = await sticker(false, url, 'Sticker', 'ᴍɪᴋᴜ yᴀᴍᴀᴅᴀ - ᴍᴅ')

    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('yahh error')
  }
}

handler.command = ['bratvid']

export default handler
handler.category = 'Media'
handler.description = 'Bratvid'

