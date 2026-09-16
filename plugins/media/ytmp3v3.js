// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/ytmp3v3.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ytmp3v3

import scraper from '@zenaveline/scraper'

const yt = new scraper.savetube()

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ`)
  }

  await m.react('🕒')

  try {
    const res = await yt.download(text, 'mp3')

    if (!res.status) {
      throw res.msg || res.error || 'Gagal mengunduh audio.'
    }

    const caption = `*Title:* ${res.title}
*Format:* MP3
*Duration:* ${res.duration} detik`

    await conn.sendFile(
      m.chat,
      res.thumb,
      'thumbnail.jpg',
      caption,
      m
    )

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: res.dl },
        mimetype: 'audio/mpeg',
        fileName: `${res.title}.mp3`
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw String(e?.message || e)
  }
}

handler.command = ['ytmp3v3']

export default handler
handler.category = 'Media'
handler.description = 'Ytmp3v3'

