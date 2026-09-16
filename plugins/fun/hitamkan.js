// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/image/hitamkan.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .hitamkan

import scraper from '@zenaveline/scraper'

let handler = async (m, { conn }) => {
  const q = m.quoted || m
  const mime = q.mimetype || ''

  if (!/image/.test(mime)) {
    throw 'Reply gambar dengan caption:\n.hitamkan'
  }

  await m.react('🕒')

  try {
    const buffer = await q.download()

    const result = await scraper.nanobanana(
      buffer,
      'hitamkan kulit karakter ini tanpa mengubah wajah dan warna rambutnya yang dihitamkan cuma kulitnya saja, untuk warna kulitnya wajib hitam legam ("#000000")'
    )

    if (result.status !== 'success' || !result.image_url) {
      throw 'Gagal mengedit gambar.'
    }

    await conn.sendFile(
      m.chat,
      result.image_url,
      'hitamkan.jpg',
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

handler.command = ['hitamkan']

export default handler
handler.category = 'Fun'
handler.description = 'Hitamkan'

