// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/webtozip.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .webtozip, .wzip

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} google.com
${usedPrefix + command} https://example.com`)
  }

  await m.react('🕒')

  try {
    const res = await fetch(
      `${global.APIs.nexray}/tools/webtozip?url=${encodeURIComponent(text)}`
    )
    const data = await res.json()

    if (!data?.status) {
      await m.react('❌')
      return m.reply('❌ Gagal mengambil website.')
    }

    const r = data.result

    const caption = `   *Web To ZIP*

✿ URL : ${r.url}
✿ Total File : ${r.copiedFilesAmount}
✿ Error : ${r.error.text}
✿ Code : ${r.error.code}`

    await conn.sendMessage(
      m.chat,
      {
        document: { url: r.downloadUrl },
        mimetype: 'application/zip',
        fileName: 'website.zip',
        caption
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.command = ['webtozip', 'wzip']

export default handler
handler.category = 'Tools'
handler.description = 'Webtozip'

