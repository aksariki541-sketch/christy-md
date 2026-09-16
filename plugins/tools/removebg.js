// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/removebg.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bg

import { pixelcutRemove, removalAi } from '../../lib/nakano/scrape/removebg.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ''

  if (!mime.startsWith('image/')) {
    throw `Reply / kirim gambar dengan caption ${usedPrefix + command}`
  }

  await m.react('✨')

  let media = await q.download()
  if (!media) throw 'Gagal mengambil gambar'

  if (media.length > 5 * 1024 * 1024) {
    throw 'Ukuran gambar terlalu besar (max 5MB)'
  }

  let result

  try {
    result = await pixelcutRemove(media)
  } catch {
    try {
      result = await removalAi(media)
    } catch {
      throw 'Gagal remove background, coba lagi nanti'
    }
  }

  await conn.sendMessage(
    m.chat,
    {
      image: result
    },
    { quoted: m }
  )

  await m.react('✅')
}

handler.command = ['bg']

export default handler
handler.category = 'Tools'
handler.description = 'Removebg'

