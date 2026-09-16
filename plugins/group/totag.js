// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/totag.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .totag, .tag

const handler = async (m, { conn, participants }) => {
 if (!m.quoted) throw '🍀 Reply pesan'

 let users = participants
 .map(v => v.id)
 .filter(v => v !== conn.user.jid)

 await conn.sendMessage(m.chat, {
 forward: m.quoted.fakeObj,
 mentions: users
 })
}

handler.command = ['totag', 'tag']
handler.admin = true
handler.group = true

handler.category = 'Group'
handler.description = 'Totag'

export default handler