// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/gptprompt.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .gptprompt

import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      '*Example :* .gptprompt Seolah kamu Christy MD | Halo',
      m
    )
  }

  let [prompt, isi] = text.split('|').map(v => v.trim())
  if (!prompt || !isi) {
    return conn.reply(
      m.chat,
      '*Example :* .gptprompt Seolah kamu Christy MD | Halo',
      m
    )
  }

  let url = `${global.APIs.faa}/faa/gpt-promt?prompt=${encodeURIComponent(prompt)}&text=${encodeURIComponent(isi)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status) return

  conn.reply(m.chat, json.result.trim(), m)
}

handler.command = ['gptprompt']

export default handler
handler.category = 'Tools'
handler.description = 'Gptprompt'

