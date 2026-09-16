// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/leavegc.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .out, .leavegc

let handler = async (m, { conn, args, command }) => {
	let group = m.chat
 await m.reply('Sayonara , , ! (≧ω≦)ゞ', m.chat) 
 await conn.groupLeave(group)
 }
handler.command = ['out', 'leavegc']

handler.rowner = true

handler.category = 'Owner'
handler.description = 'Leavegc'

export default handler