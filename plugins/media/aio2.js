// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/aio2.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .aio2

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} https://vt.tiktok.com/xxxx`,
      m
    )
  }

  try {
    let api = `${global.APIs.faa}/faa/aio?url=${encodeURIComponent(text)}`
    let res = await fetch(api)
    let json = await res.json()

    if (!json.status) throw 'Gagal mengambil data.'

    let data = json.result
    let videoUrl = data.download_url

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: data.title || 'Video berhasil diunduh'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Gagal mengambil video.', m)
  }
}

handler.command = ['aio2']

export default handler
handler.category = 'Media'
handler.description = 'Aio2'

