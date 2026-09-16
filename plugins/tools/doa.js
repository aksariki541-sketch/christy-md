// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/internet/doa.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .doa

import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) return

  let url = `${global.APIs.faa}/faa/doa?q=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.data?.length) return

  let hasil = json.data.map(d => `
${d.doa}

${d.ayat}

${d.latin}

${d.artinya}
`.trim()).join('\n\n')

  conn.reply(m.chat, hasil, m)
}

handler.command = ['doa']

export default handler
handler.category = 'Tools'
handler.description = 'Doa'

