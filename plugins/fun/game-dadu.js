// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/game/game-dadu.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: dadu→dadu2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .dadu2

/*
wa.me/6282285357346
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
ini wm gw cok jan di hapus
*/

import { createSticker } from "wa-sticker-formatter"

const packname = "Kurumi MD"
const author = "Kurumi MD"

let handler = async (m, { conn }) => {
  await m.reply(wait)

  let diceImage = rollDice()
  let stiker = await createSticker(diceImage, {
    pack: packname,
    author: author
  })

  await conn.sendFile(m.chat, stiker, "dadu.webp", "", m)
}

handler.command = ['dadu2']
export default handler

function rollDice() {
  return "https://www.random.org/dice/dice" + (Math.floor(Math.random() * 6) + 1) + ".png"
}
handler.category = 'Fun'
handler.description = 'Game-dadu'

