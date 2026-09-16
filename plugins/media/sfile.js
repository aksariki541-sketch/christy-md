// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/sfile.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: sfile→sfile2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .sfile2, .sfiledl

import { sfileSearch, sfileDownload } from '../../lib/nakano/scrape/sfile.js'

let handler = async (m, { conn, text, command }) => {
  if (!text) throw 'Masukkan query atau link!'

  if (command === 'sfile') {
    const results = await sfileSearch(text)

    if (!results.length) throw 'File tidak ditemukan'

    let msg = '🔎 Hasil pencarian:\n\n'

    results.slice(0, 10).forEach((v, i) => {
      msg += `${i + 1}. ${v.title}\n`
      msg += `📦 ${v.size}\n`
      msg += `🔗 ${v.link}\n\n`
    })

    m.reply(msg)
  }

  if (command === 'sfiledl') {
    if (!text.includes('sfile.co')) throw 'Link tidak valid'

    const { metadata, download } = await sfileDownload(text, true)

    const caption = `📄 Nama: ${metadata.filename}
📦 Tipe: ${metadata.mimetype}
⬇️ Download: ${metadata.download_count}
👤 Author: ${metadata.author_name}`

    await conn.sendFile(m.chat, download, metadata.filename, caption, m)
  }
}

handler.command = ['sfile2', 'sfiledl']

export default handler
handler.category = 'Media'
handler.description = 'Sfile'

