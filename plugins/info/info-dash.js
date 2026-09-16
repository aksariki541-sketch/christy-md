// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/main/info-dash.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .dashboard

let handler = async (m, { conn }) => {
  let stats = Object.entries(db.data.stats).map(([key, val]) => {
    let help = plugins[key]?.help
    let name = Array.isArray(help) ? help.join(', ') : help || key
    if (/exec/.test(name)) return null // kasih null biar bisa di filter
    return { name, ...val }
  }).filter(v => v) // buang null hasil exec

  stats = stats.sort((a, b) => b.total - a.total)

  let handlers = stats.slice(0, 100).map(({ name, total }) => {
    return `乂 *Command* : *${name}*\n• *Global HIT* : ${total}`
  }).join`\n\n` || 'Belum ada statistik penggunaan.'

  await conn.relayMessage(m.chat, {
    extendedTextMessage: {
      text: handlers,
      contextInfo: {
        externalAdReplyOffOffOff: {
          title: '',
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true,
          thumbnailUrl: 'https://telegra.ph/file/c43ee155efc11b774bee3.jpg',
          sourceUrl: ''
        }
      },
      mentions: [m.sender]
    }
  }, {})
}

handler.command = ['dashboard']

export default handler
handler.category = 'Main'
handler.description = 'Info-dash'

