// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/totalfitur.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .totalfitur

let handler = async (m, { conn }) => {
  try {
    const totalPlugin = Object.keys(global.plugins).length

    const totalFitur = Object.values(global.plugins)
      .filter(v => v.help && v.tags && !v.disabled)
      .flatMap(v => v.help)
      .length

    const text = `*\`Total Fitur\`*

✿ Total Plugin : ${totalPlugin}
✿ Total Fitur : ${totalFitur}`

    await conn.sendMessage(
      m.chat,
      { text },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    m.reply('Terjadi error.')
  }
}

handler.command = ['totalfitur']

export default handler
handler.category = 'Main'
handler.description = 'Totalfitur'

