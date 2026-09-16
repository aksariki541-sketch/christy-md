// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/bratanime.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bratanime

import { createSticker, StickerTypes } from 'wa-sticker-formatter'

let handler = async (m, { conn, text }) => {
  try {
    if (!text) throw `Masukkan teks\nContoh: .bratanime halo riki`

    const url = `https://api.nexray.web.id/maker/bratanime?text=${encodeURIComponent(text)}`
    
    const res = await fetch(url)
    const buffer = Buffer.from(await res.arrayBuffer())

    const stickerBuffer = await createSticker(buffer, {
      type: StickerTypes.FULL,
      pack: 'ᴍɪᴋᴜ yᴀᴍᴀᴅᴀ - ᴍᴅ',
      author: 'ʙy ʀɪᴋɪ',
      categories: ['✨'],
      id: '.',
      quality: 70,
      background: null
    })

    await conn.sendFile(m.chat, stickerBuffer, 'sticker.webp', '', m)

  } catch (e) {
    console.error(e)
    m.reply('Terjadi kesalahan saat membuat sticker')
  }
}

handler.command = ['bratanime']

export default handler
handler.category = 'Media'
handler.description = 'Bratanime'

