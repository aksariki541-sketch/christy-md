// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/pastebin.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .pastebin

import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) throw `⚠️ Masukkan link Pastebin!\n\nContoh:\n.pastebin https://pastebin.com/kwLd6w7N`

  try {
    let url = `https://api.princetechn.com/api/download/pastebin?apikey=prince&url=${encodeURIComponent(text)}`
    let res = await fetch(url)
    let data = await res.json()

    if (!data.success) throw `❌ Gagal mengambil data dari Pastebin.`

    let hasil = data.result || 'Tidak ada hasil.'
    await conn.reply(m.chat, hasil, m)
  } catch (e) {
    console.error(e)
    throw `❌ Error mengambil data Pastebin!`
  }
}

handler.command = ['pastebin']

export default handler
handler.category = 'Tools'
handler.description = 'Pastebin'

