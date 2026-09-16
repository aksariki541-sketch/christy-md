// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anu/_antimedia.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : (listener/customPrefix)
// Catatan    : handler.before/all -> handler.onMessage

let handler = m => m

handler.onMessage = async function (m, { isBotAdmin, isAdmin }) {
  let chat = global.db.data.chats[m.chat]

  if (!chat?.antiMedia) return
  if (!m.isGroup) return
  if (!isBotAdmin) return
  if (isAdmin) return

  const media =
    m.message?.imageMessage ||
    m.message?.videoMessage ||
    m.message?.audioMessage ||
    m.message?.stickerMessage ||
    m.message?.documentMessage

  if (!media) return

  await this.sendMessage(m.chat, {
    delete: m.key
  })

  await m.reply('❏ Media tidak diperbolehkan di grup ini')
}

export default handler
handler.category = 'Tools'
handler.description = 'Antimedia'

