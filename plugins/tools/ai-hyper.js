// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/ai-hyper.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .aihyper

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} Halo`,
      m
    )
  }

  try {
    let url = `${global.APIs.faa}/faa/ai-hyper?text=${encodeURIComponent(text)}`
    let res = await fetch(url)
    let json = await res.json()

    if (!json.status) throw 'Gagal mengambil jawaban.'

    conn.reply(m.chat, json.result.trim(), m)
  } catch {
    conn.reply(m.chat, 'Terjadi kesalahan saat mengambil data.', m)
  }
}

handler.command = ['aihyper']
handler.premium = true

export default handler
handler.category = 'Tools'
handler.description = 'Ai-hyper'

