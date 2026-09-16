// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/jadwalbola.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .jadwalbola, .bola

let handler = async (m) => {
  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/information/jadwalbola`
    )
    const data = await res.json()

    if (!data?.status || !data.result?.length) {
      await m.react('❌')
      return m.reply('❌ Jadwal bola tidak ditemukan.')
    }

    const caption = `   *Jadwal Bola*

${data.result.map((v, i) => `${i + 1}. ${v}`).join('\n')}`

    await m.react('✅')
    m.reply(caption)
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.command = ['jadwalbola', 'bola']

export default handler
handler.category = 'Main'
handler.description = 'Jadwalbola'

