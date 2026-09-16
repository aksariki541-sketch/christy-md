// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/ytmp4v3.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ytmp4v3

import scraper from '@zenaveline/scraper'

const yt = new scraper.savetube()

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ`)
  }

  await m.react('🕒')

  try {
    const res = await yt.download(text, '720')

    if (!res.status) {
      throw res.msg || res.error || 'Gagal mengunduh video.'
    }

    const caption = `*Title:* ${res.title}
*Format:* ${res.format}
*Duration:* ${res.duration} detik`

    await conn.sendFile(
      m.chat,
      res.dl,
      `${res.title}.mp4`,
      caption,
      m
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw String(e?.message || e)
  }
}

handler.command = ['ytmp4v3']

export default handler
handler.category = 'Media'
handler.description = 'Ytmp4v3'

