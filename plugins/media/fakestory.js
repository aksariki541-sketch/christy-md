// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/maker/fakestory.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .fakestory

import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let username = ''
    let caption = ''

    if (args.length) {
        const raw = args.join(' ')
        if (raw.includes('|')) {
            const [u, c] = raw.split('|')
            username = u.trim()
            caption = c.trim()
        }
    } else {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} username|caption`)
    }

    if (!username || !caption) {
        return m.reply(`Format salah!
${usedPrefix + command} username|caption`)
    }

    const nama = m.pushName || 'User'
    const avatar = await conn.profilePictureUrl(m.sender, 'image')
        .catch(() => 'https://files.catbox.moe/nwvkbt.png')

    const url = `${global.APIs.deline}/maker/fakestory?username=${encodeURIComponent(username)}&caption=${encodeURIComponent(caption)}&avatar=${encodeURIComponent(avatar)}`

    try {
        const { data } = await axios.get(url, { responseType: 'arraybuffer' })
        await conn.sendFile(m.chat, data, 'fakestory.jpg', `Fake Story by ${nama}`, m)
    } catch (e) {
        console.error(e)
        return m.reply('Gagal membuat Fake Story.')
    }
}

handler.command = ['fakestory']

export default handler
handler.category = 'Media'
handler.description = 'Fakestory'

