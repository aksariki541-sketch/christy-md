// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/internet/internet-kbbi.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .kbbi

import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(m.chat, '*Example :* .kbbi Anu', m)
  }

  let url = `${global.APIs.faa}/faa/kbbi?q=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.result) return

  let hasil = `
${json.result.kata}

${json.result.keterangan}
`.trim()

  conn.reply(m.chat, hasil, m)
}

handler.command = ['kbbi']

export default handler
handler.category = 'Tools'
handler.description = 'Internet-kbbi'

