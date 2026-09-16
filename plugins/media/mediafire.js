// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/mediafire.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: mediafire→mediafire2, mf→mf2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .mediafire2, .mf2

import scraper from '@zenaveline/scraper'

let handler = async (m, { conn, text }) => {
  if (!text) throw `Contoh:\n.mediafire https://www.mediafire.com/file/xxxxx`

  await m.react('🕒')

  try {
    const res = await scraper.mediafiredl(text)

    const caption = `*\`MediaFire Downloader\`*

*Name :* ${res.filename || res.name}
*Size :* ${res.size}
*Mime :* ${res.mime || res.ext || '-'}`

    await conn.sendFile(
      m.chat,
      res.link || res.url,
      res.filename || res.name,
      caption,
      m
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw 'Gagal mengambil file MediaFire.'
  }
}

handler.command = ['mediafire2', 'mf2']

export default handler
handler.category = 'Media'
handler.description = 'Mediafire'

