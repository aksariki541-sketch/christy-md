// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/autosticker.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .autosticker
// Catatan    : handler.before/all -> handler.onMessage

import { sticker, addExif } from '../../lib/nakano/sticker.js'

let handler = async (m, { conn, args, usedPrefix, command, isAdmin }) => {
    if (!m.isGroup) return m.reply('Hanya bisa di grup!')
    if (!isAdmin) return m.reply('Hanya admin yang bisa pakai!')

    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {}

    if (args[0] === 'on') {
        chat.autoSticker = true
        m.reply('✅ Auto-Sticker aktif!')
    } else if (args[0] === 'off') {
        chat.autoSticker = false
        m.reply('❌ Auto-Sticker mati!')
    } else {
        m.reply(`Contoh: *${usedPrefix + command} on* atau *off*`)
    }
}

handler.onMessage = async function (m, { conn }) {
    if (!m.isGroup || m.fromMe || m.isBaileys) return 
    
    let chat = global.db.data.chats[m.chat]
    if (!chat?.autoSticker) return 

    let mime = (m.msg || m).mimetype || ''
    if (!mime) return

    if (/image|video|gif/.test(mime)) {
        if (/video/.test(mime) && (m.msg || m).seconds > 10) return 
        
        try {
            // Menggunakan fungsi download dari simple.js milik conn
            let img = await m.download?.()
            if (!img) return
            
            let stiker = false
            if (/image/.test(mime)) {
                stiker = await addExif(img, global.stickpack, global.stickauth)
            } else if (/video|gif/.test(mime)) {
                stiker = await sticker(img, false, global.stickpack, global.stickauth)
            }

            if (stiker) {
                await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
            }
        } catch (e) {
            console.error('AutoSticker Error:', e)
        }
    }
}

handler.command = ['autosticker']
handler.group = true

export default handler
handler.category = 'Group'
handler.description = 'Autosticker'

