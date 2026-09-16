// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/uguu.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .uguu

import { uguu } from '../../lib/nakano/scrape/uguu.js'

let handler = async (m) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!mime) return m.reply('Reply media')

  await m.reply('wait')

  try {
    const buffer = await q.download()

    const ext = mime.split('/')[1]?.split(';')[0] || 'bin'
    const filename =
      q.fileName ||
      `file.${ext}`

    const { url } = await uguu(buffer, filename, mime)

    await m.reply(url)
  } catch (e) {
    console.error(e)
    m.reply(`Gagal upload\n\n${e.message}`)
  }
}

handler.command = ['uguu']

export default handler
handler.category = 'Tools'
handler.description = 'Uguu'

