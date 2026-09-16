// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/setthumbmenu.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setthumbmenu

import fs from 'fs'

let handler = async (m, { usedPrefix, command }) => {
  try {
    const quoted = m.quoted || m
    const mime = quoted?.mimetype || ''

    if (!mime.startsWith('image/')) {
      return m.reply(`Reply gambar dulu!\nContoh: reply foto lalu ketik *${usedPrefix + command}*`)
    }

    const buffer = await quoted.download()
    fs.writeFileSync('./media/ryo.jpg', buffer) // simpan ke file thumbnail menu (Christy MD)
    global.thumb = buffer

    m.reply('✅ Thumbnail menu berhasil diupdate!')
  } catch (e) {
    console.error(e)
    m.reply('Error: ' + e.message)
  }
}

handler.command = ['setthumbmenu']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Setthumbmenu'

