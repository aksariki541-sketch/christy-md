// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/bratcolor.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bratcolor

/**
 * Feature : Brat Color 
 * Type.   :  Plugin ESM 
 * API    : https://brat.siputzx.my.id
 * source : https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I
 * Author : Riki 
 **/

import axios from 'axios'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

const colorMap = {
  putih: '#ffffff',
  hitam: '#000000',
  merah: '#ff0000',
  hijau: '#00ff00',
  biru: '#0000ff',
  kuning: '#ffff00',
  ungu: '#800080',
  pink: '#ff69b4',
  abu: '#808080',
  orange: '#ffa500'
}

let handler = async (m, { conn, text }) => {
  if (!text) {
    let warnaList = Object.keys(colorMap).map(v => `- ${v}`).join('\n')
    return m.reply(`⚠️ Contoh penggunaan:\n.bratcolor halo riki | merah | biru\n\n🎨 List warna yg bisa dipakai:\n${warnaList}`)
  }

  let [teks, background, color] = text.split('|').map(v => v.trim())
  if (!teks) return m.reply('⚠️ Masukkan teks!')

  background = colorMap[background?.toLowerCase()] || background || '#ffffff'
  color = colorMap[color?.toLowerCase()] || color || '#000000'

  try {
    let url = `https://brat.siputzx.my.id/image?text=${encodeURIComponent(teks)}&background=${encodeURIComponent(background)}&color=${encodeURIComponent(color)}&emojiStyle=apple`

    let { data } = await axios.get(url, { responseType: 'arraybuffer' })
    let stiker = new Sticker(data, {
      pack: 'ᴍɪᴋᴜ yᴀᴍᴀᴅᴀ - ᴍᴅ',
      author: 'ʙy ʀɪᴋɪ',
      type: StickerTypes.FULL,
      quality: 80
    })

    await conn.sendFile(m.chat, await stiker.build(), 'brat.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal generate brat color!')
  }
}

handler.command = ['bratcolor']

export default handler;
handler.category = 'Media'
handler.description = 'Bratcolor'

