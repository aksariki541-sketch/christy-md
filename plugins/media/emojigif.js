// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/emojigif.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .emojigif

import { sticker } from '../../lib/nakano/sticker.js'

let handler = async (m, { conn, args }) => {
  const text = args.join(' ') || (m.quoted && m.quoted.text)
  if (!text) return m.reply(`Masukin emoji dong!\nContoh: .emojigif 😋`)

  try {
    const url = `https://api-faa.my.id/faa/emojigerak?emoji=${encodeURIComponent(text)}`
    let stiker = await sticker(false, url, 'Christy MD', 'By Riki')

    await conn.sendFile(m.chat, stiker, 'emoji.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('yahh error :(')
  }
}

handler.command = ['emojigif']

export default handler
handler.category = 'Media'
handler.description = 'Emojigif'

