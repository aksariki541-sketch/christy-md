// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/animebrat.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .animebrat

import { sticker } from '../../lib/nakano/sticker.js'

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Masukkan teks untuk stiker.')

  try {
    const url = `https://api.nexray.web.id/maker/bratanime?text=${encodeURIComponent(text)}`
    let stiker = await sticker(false, url, 'ᴍɪᴋᴜ yᴀᴍᴀᴅᴀ - ᴍᴅ', 'ʙy ʀɪᴋɪ')

    await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('Terjadi kesalahan saat membuat stiker.')
  }
}

handler.command = ['animebrat']

export default handler
handler.category = 'Media'
handler.description = 'Animebrat'

