// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/main/afk-afk.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: afk→afk2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .afk2

var handler = async (m, { text }) => {
    let user = global.db.data.users[m.sender]
    user.afk = + new Date
    user.afkReason = text
    m.reply(`${conn.getName(m.sender)} is now AFK${text ? ': ' + text : ''}`)
  }
  handler.command = ['afk2']
  
  export default handler
handler.category = 'Main'
handler.description = 'Afk-afk'

