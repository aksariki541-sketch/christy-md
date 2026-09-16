// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/unbanchat2.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .unbanchat2

let handler = async (m, { text }) => {
  if (!text)
    return m.reply('Masukkan ID grup.\nContoh:\n.unbanchat2 1203630xxxxx@g.us')

  let id = text.trim()

  if (!id.endsWith('@g.us'))
    return m.reply('ID grup tidak valid.\nFormat: 12036xxxxx@g.us')

  if (!global.db.data.chats[id])
    global.db.data.chats[id] = {}

  global.db.data.chats[id].isBanned = false

  m.reply(`✅ Grup berhasil di-unban:\n${id}`)
}

handler.command = ['unbanchat2']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Unbanchat2'

