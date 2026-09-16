// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/tagall.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .o-tagall

let handler = async (m, { conn, text, participants, isAdmin, isOwner }) => {
 let users = participants.map(u => u.id).filter(v => v !== conn.user.jid)
 m.reply(`${text ? `${text}\n` : ''}┌─「 Tag All 」\n` + users.map(v => '│◦❒ @' + v.replace(/@.+/, '')).join`\n` + '\n└────', null, {
 mentions: users
 })
}

handler.command = ['o-tagall']
handler.owner = true
handler.group = true

handler.category = 'Owner'
handler.description = 'Tagall'

export default handler
