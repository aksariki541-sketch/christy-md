// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/animebratvid.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .animebratvid, .bratanimevid, .bratanimvid

import { sticker } from '../../lib/nakano/sticker.js'

let handler = async (m, { conn, args, command }) => {
  const text = args.join(' ') || (m.quoted && m.quoted.text)
  if (!text) return m.reply(`✨ Masukin teks dong!\nContoh: .${command} halo ArdikaOfc`)

  try {
    const url = `https://exsalapi.my.id/api/maker/anime-brat/vid?text=${encodeURIComponent(text)}&apikey=freepublic`
    let stiker = await sticker(false, url, global.stickpack, global.stickauth)

    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('yahh error')
  }
}

handler.command = ['animebratvid', 'bratanimevid', 'bratanimvid']

export default handler
handler.category = 'Media'
handler.description = 'Animebratvid'

