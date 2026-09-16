// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/q.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .q

let handler = async (m, { conn }) => {
  try {
    if (!m.quoted) {
      return m.reply('Reply pesan yang mau diambil JSON-nya')
    }

    let json = m.quoted?.msg || m.quoted?.message || m.quoted
    let result = JSON.stringify(json, null, 2)

    if (result.length > 4000) {
      return conn.sendFile(
        m.chat,
        Buffer.from(result),
        'message.json',
        '📦 JSON terlalu panjang, dikirim sebagai file',
        m
      )
    }

    m.reply(`📦 *QUOTED MESSAGE JSON*\n\n\`\`\`json\n${result}\n\`\`\``)

  } catch (e) {
    m.reply('❌ Error:\n' + e.message)
  }
}

handler.command = ['q']

handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Q'

