// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/epsilon.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .epsilon

import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(m.chat, '*Example :* .epsilon Apa itu chatbot', m)
  }

  let url = `${global.APIs.faa}/faa/epsilon-ai?text=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.result?.length) return

  let hasil = json.result.slice(0, 5).map((v, i) => `
${i + 1}. ${v.title}
Penulis: ${v.authors}
Tahun: ${v.year}
Link: ${v.url}

${v.abstract.slice(0, 300)}...
`.trim()).join('\n\n')

  conn.reply(m.chat, hasil, m)
}

handler.command = ['epsilon']

export default handler
handler.category = 'Tools'
handler.description = 'Epsilon'

