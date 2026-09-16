// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/group-pinpesan.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .pinpesan

let handler = async (m, { conn }) => {
 if (!m.quoted) throw 'Balas pesan yang ingin dipin!'

 await conn.sendMessage(m.chat, {
 pin: {
 remoteJid: m.quoted.chat,
 fromMe: false,
 id: m.quoted.id,
 participant: m.quoted.sender
 },
 type: 1
 })

 m.reply('📌 Pesan berhasil dipin.')
}

handler.command = ['pinpesan']

handler.group = true
handler.admin = true
handler.botAdmin = true

handler.category = 'Group'
handler.description = 'Pinpesan'

export default handler