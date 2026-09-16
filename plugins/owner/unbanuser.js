// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/unbanuser.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: user→user3
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .user3

let handler = async (m, { conn, text }) => {
    if (!text) throw 'Who wants to be unbanned? Provide the user\'s phone number.'
    let who
    if (m.isGroup) {
        if (!m.mentionedJid) throw 'No user mentioned to unban.'
        who = m.mentionedJid[0]
    } else {
        // Check if the input is a valid phone number
        let phoneNumber = text.replace(/[^0-9]/g, '') // Remove non-numeric characters
        who = phoneNumber + '@s.whatsapp.net'
    }
    let users = global.db.data.users
    if (users[who]) {
        users[who].banned = false
        users[who].banReason = ''
        conn.reply(m.chat, 'Done!', m)
    } else {
        throw 'User not found.'
    }
}
handler.command = ['user3']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Unbanuser'

