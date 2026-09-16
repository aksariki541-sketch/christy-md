// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/maker/faketweet.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .faketweet

import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} name|username|comment|verified

Contoh:
${usedPrefix + command} riki|anu|halo riki|true`)
    }

    let [name, username, comment, verified] = text.split('|')

    if (!name || !username || !comment) {
        return m.reply(`Format salah!
${usedPrefix + command} name|username|comment|verified`)
    }

    verified = (verified || 'false').trim().toLowerCase()

    const avatar = await conn.profilePictureUrl(m.sender, 'image')
        .catch(() => `${global.APIs.deline}/Eu3BVf3K4x.jpg`)

    const url = `${global.APIs.deline}/maker/faketweet?name=${encodeURIComponent(name.trim())}&username=${encodeURIComponent(username.trim())}&comment=${encodeURIComponent(comment.trim())}&avatar=${encodeURIComponent(avatar)}&verified=${verified}`

    try {
        const { data } = await axios.get(url, { responseType: 'arraybuffer' })
        await conn.sendFile(m.chat, data, 'faketweet.jpg', '', m)
    } catch (e) {
        console.error(e)
        m.reply('Gagal membuat fake tweet.')
    }
}

handler.command = ['faketweet']

export default handler
handler.category = 'Media'
handler.description = 'Faketweet'

