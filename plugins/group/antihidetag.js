// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/antihidetag.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .antihidetag
// Catatan    : handler.before/all -> handler.onMessage

let handler = async (m, { conn, args, usedPrefix, command, isAdmin }) => {
    if (!m.isGroup) return m.reply('Hanya bisa di grup!')
    if (!isAdmin) return m.reply('Hanya admin yang bisa pakai!')

    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {}

    if (!args[0]) return m.reply(`Contoh: *${usedPrefix + command} on* atau *off*`)

    if (args[0] === 'on') {
        chat.antiHidetag = true
        m.reply('✅ Anti-Hidetag aktif!')
    } else if (args[0] === 'off') {
        chat.antiHidetag = false
        m.reply('❌ Anti-Hidetag mati!')
    }
}

handler.onMessage = async function (m, { conn, isBotAdmin, participants }) {
    if (!m.isGroup || !isBotAdmin || m.fromMe) return 
    
    let chat = global.db.data.chats[m.chat]
    if (!chat || !chat.antiHidetag) return 

    const groupSize = participants.length
    const mentioned = m.msg?.contextInfo?.mentionedJid || []

    if (mentioned.length >= groupSize || (mentioned.length > 10 && !m.isAdmin)) {
        try {
            await conn.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.sender
                }
            })
        } catch (e) {
            console.error(e)
        }
    }
}

handler.command = ['antihidetag']
handler.group = true
handler.admin = true

export default handler
handler.category = 'Group'
handler.description = 'Antihidetag'

