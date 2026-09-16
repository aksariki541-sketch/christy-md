// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/internet/gimg.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .gimg

import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(m.chat, '*Example :* .gimg Christy MD', m)
  }

  let url = `${global.APIs.faa}/faa/google-image?query=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.result?.length) return

  for (let img of json.result.slice(0, 5)) {
    await conn.sendFile(m.chat, img, 'image.jpg', '', m)
  }
}

handler.command = ['gimg']

export default handler
handler.category = 'Tools'
handler.description = 'Gimg'

