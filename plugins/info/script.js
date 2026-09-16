// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/script.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: sc→sc2, script→script2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .sc2, .script2

import fs from 'fs'

let handler = async (m, { conn }) => {
  await conn.sendMessage(
    m.chat,
    {
      orderText: `Hai kak! 👋

❏ Script *Christy MD* tersedia di channel berikut.

✿ *\`Channel\`* :
https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I`,
      thumbnail: fs.readFileSync('./media/thumbnail.jpg')
    },
    { quoted: m }
  )
}

handler.command = ['sc2', 'script2']

export default handler
handler.category = 'Main'
handler.description = 'Script'

