// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/banuser.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: user→user2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .user2

let handler = async (m, { conn, text }) => {
    if (!text) throw 'Who wants to be banned? Provide the user\'s phone number and reason.'
    let parts = text.split(' ')
    let phoneNumber = parts[0].replace(/[^0-9]/g, '') // Remove non-numeric characters
    let reason = parts.slice(1).join(' ') || '' // Join the remaining parts as the reason, or set to empty string if not provided

    let who = phoneNumber + '@s.whatsapp.net'
    let users = global.db.data.users

    if (users[who]) {
        users[who].banned = true
        users[who].banReason = reason // Set the ban reason for the user
        conn.reply(m.chat, `Banned user\n\n${reason ? 'Reason: ' + reason : 'No reason'}`, m)
    } else {
        throw 'User not found.'
    }
}

handler.command = ['user2']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Banuser'

