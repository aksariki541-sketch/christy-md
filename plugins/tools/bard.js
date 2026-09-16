// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/bard.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bard

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} Apa itu bot wa`,
      m
    )
  }

  try {
    let url = `${global.APIs.faa}/faa/bard-google?query=${encodeURIComponent(text)}`
    let res = await fetch(url)
    let json = await res.json()

    if (!json.status) throw 'Gagal mengambil jawaban.'

    conn.reply(m.chat, json.result.trim(), m)
  } catch (e) {
    conn.reply(m.chat, 'Terjadi kesalahan saat mengambil data.', m)
  }
}

handler.command = ['bard']

export default handler
handler.category = 'Tools'
handler.description = 'Bard'

