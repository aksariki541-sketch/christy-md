// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/tafsirmimpi.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .mimpi2

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} Senang`,
      m
    )
  }

  try {
    let api = `${global.APIs.faa}/faa/tafsir-mimpi?mimpi=${encodeURIComponent(text)}`
    let res = await fetch(api)
    let json = await res.json()

    if (!json.status) throw 'API error'

    let hasil = `Tafsir mimpi: *${json.mimpi}*\n\n${json.result}`

    conn.reply(m.chat, hasil, m)
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Gagal mengambil tafsir mimpi.', m)
  }
}

handler.command = ['mimpi2']

export default handler
handler.category = 'Fun'
handler.description = 'Tafsirmimpi'

