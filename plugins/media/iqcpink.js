// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/maker/iqcpink.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .iqc3, .iqcpink

import scraper from '@zenaveline/scraper'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} Halo Riki`)
  }

  await m.react('🕒')

  try {
    const time = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    const buffer = await scraper['iqc-pinkmode'](
      text,
      time,
      null
    )

    await conn.sendFile(
      m.chat,
      buffer,
      'iqcpink.png',
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

handler.command = ['iqc3', 'iqcpink']

export default handler
handler.category = 'Media'
handler.description = 'Iqcpink'

