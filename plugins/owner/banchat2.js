// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/banchat2.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .banchat2

let handler = async (m, { text }) => {
  if (!text) return m.reply('Masukkan ID grup.\nContoh:\n.banchat2 1203630xxxxx@g.us')

  let id = text.trim()

  if (!id.endsWith('@g.us'))
    return m.reply('ID grup tidak valid.\nFormat: 12036xxxxx@g.us')

  if (!global.db.data.chats[id])
    global.db.data.chats[id] = {}

  global.db.data.chats[id].isBanned = true

  m.reply(`✅ Grup berhasil dibanned:\n${id}`)
}

handler.command = ['banchat2']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Banchat2'

