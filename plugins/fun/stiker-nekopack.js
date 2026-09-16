// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/random/stiker-nekopack.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: 8ball→8ball2, wallpaper→wallpaper2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .smug, .woof, .gasm, .8ball2, .goose, .cuddle, .avatar, .slap, .v3, .pat, .gecg, .feed, .fox_girl, .lizard, .neko, .hug, .meow, .kiss, .wallpaper2, .tickle, .spank, .waifu, .lewd, .ngif

/* 
Fitur : Stiker nekopack
type : plugins esm
sumber : https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I

*/

import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, command }) => {
  
  let available = [
    'smug', 'woof', 'gasm', '8ball', 'goose', 'cuddle', 'avatar', 'slap',
    'v3', 'pat', 'gecg', 'feed', 'fox_girl', 'lizard', 'neko', 'hug',
    'meow', 'kiss', 'wallpaper', 'tickle', 'spank', 'waifu', 'lewd', 'ngif'
  ]

  if (!available.includes(command)) return m.reply('Kategori tidak tersedia.')

  let res = await fetch(`https://nekos.life/api/v2/img/${command}`)
  if (!res.ok) throw 'Gagal ambil gambar.'
  let data = await res.json()
  let url = data.url

  let stiker = new Sticker(url, {
    pack: 'Christy MD',
    author: 'ʙy ʀɪᴋɪ',
    type: 'full',
    categories: ['Anime'],
    id: command,
    quality: 70
  })

  let buffer = await stiker.toBuffer()
  await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
}

handler.command = ['smug', 'woof', 'gasm', '8ball2', 'goose', 'cuddle', 'avatar', 'slap', 'v3', 'pat', 'gecg', 'feed', 'fox_girl', 'lizard', 'neko', 'hug', 'meow', 'kiss', 'wallpaper2', 'tickle', 'spank', 'waifu', 'lewd', 'ngif']

export default handler
handler.category = 'Fun'
handler.description = 'Stiker-nekopack'

