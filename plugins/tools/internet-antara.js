// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/internet/internet-antara.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .antara

import axios from 'axios'

let handler = async (m, { conn }) => {
  await m.react('✨')

  try {
    const { data } = await axios.get(
      `${global.APIs.deline}/berita/antara`
    )

    if (!data.status || !data.data.length) {
      throw 'Berita tidak ditemukan'
    }

    const list = data.data.slice(0, 10)

    let caption = `✨ *Berita Terbaru ANTARA*\n\n`

    for (let i = 0; i < list.length; i++) {
      let berita = list[i]
      caption += `${i + 1}. *${berita.title}*\n`
      caption += `📂 ${berita.category}\n`
      caption += `🔗 ${berita.link}\n\n`
    }

    m.reply(caption.trim())

  } catch {
    m.reply('Gagal mengambil berita.')
  }
}

handler.command = ['antara']

export default handler
handler.category = 'Tools'
handler.description = 'Internet-antara'

