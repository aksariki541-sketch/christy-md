// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/promote.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .opromote

import { areJidsSameUser } from '../../lib/baileys.js'
let handler = async (m, { conn, participants }) => {
 let users = m.mentionedJid.filter(u => !areJidsSameUser(u, conn.user.id))
 let promoteUser = []
 for (let user of users)
 if (user.endsWith('@s.whatsapp.net') && !(participants.find(v => areJidsSameUser(v.id, user)) || { admin: true }).admin) {
 const res = await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
 await delay(1 * 1000)
 }
 m.reply('Succes')

}
handler.command = ['opromote']

handler.owner = true
handler.group = true
handler.botAdmin = true

handler.category = 'Owner'
handler.description = 'Promote'

export default handler

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))