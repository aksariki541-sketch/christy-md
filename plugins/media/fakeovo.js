// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/maker/fakeovo.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .fakeovo

import scraper from '@zenaveline/scraper'

let handler = async (m, { conn, text }) => {
  const amount = text.trim() || '5000002828'

  await m.react('🕒')

  try {
    const buffer = await scraper['fake-ovo'](amount)

    await conn.sendFile(
      m.chat,
      buffer,
      'fake-ovo.png',
      '',
      m
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw String(e?.message || e)
  }
}

handler.command = ['fakeovo']

export default handler
handler.category = 'Media'
handler.description = 'Fakeovo'

