// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/bypass.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bypass

import scraper from '@zenaveline/scraper'

let handler = async (m, { text }) => {
  if (!text) throw `Contoh:\n.bypass https://sfl.gl/ntCx0RF`

  try {
    const result = await scraper.bypasstools(text)

    await m.reply(
`*\`Bypass Shortlink\`*

*• Input :* ${text}
*• Result :* ${result}`
    )
  } catch (e) {
    console.error(e)
    throw 'Gagal melakukan bypass shortlink.'
  }
}

handler.command = ['bypass']

export default handler
handler.category = 'Tools'
handler.description = 'Bypass'

