// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anu/_getpp.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .getpp

import fetch from 'node-fetch'

let handler = async (m, { conn, command }) => {
    try {
        let who
        if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
        else who = m.quoted.sender ? m.quoted.sender : m.sender
        let pp = await conn.profilePictureUrl(who, 'image').catch((_) => "https://telegra.ph/file/24fa902ead26340f3df2c.png")
        conn.sendFile(m.chat, pp, "nih bang.png", 'Selesai....', m, { jpegThumbnail: await (await fetch(pp)).buffer() })
    } catch {
        let sender = m.sender
        let pp = await conn.profilePictureUrl(sender, 'image').catch((_) => "https://telegra.ph/file/24fa902ead26340f3df2c.png")
        conn.sendFile(m.chat, pp, 'ppsad.png', "Selesai....", m, { jpegThumbnail: await (await fetch(pp)).buffer() })
    }
}
handler.command = ['getpp']

export default handler
handler.category = 'Tools'
handler.description = 'Getpp'

