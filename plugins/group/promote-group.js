// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/promote.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: promote→promote2, demote→demote2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .promote2, .demote2

let handler = async (m, { conn, participants, command }) => {
    if (!m.isGroup) throw 'Fitur ini hanya untuk grup!'

    let who = m.mentionedJid?.[0] || m.quoted?.sender
    if (!who) throw `Tag atau reply member yang ingin di${command}!`

    let user = participants.find(v => v.id === who)
    if (!user) throw 'Member tidak ditemukan!'

    if (command === 'promote') {
        if (user.admin) throw 'Dia sudah menjadi admin!'
        await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
        m.reply(`✅ Berhasil mempromosikan @${who.split('@')[0]} menjadi admin.`, null, {
            mentions: [who]
        })
    }

    if (command === 'demote') {
        if (!user.admin) throw 'Dia bukan admin!'
        await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
        m.reply(`✅ Berhasil menurunkan @${who.split('@')[0]} dari admin.`, null, {
            mentions: [who]
        })
    }
}

handler.command = ['promote2', 'demote2']

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
handler.category = 'Group'
handler.description = 'Promote'

