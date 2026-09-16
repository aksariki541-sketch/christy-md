// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/search/webton.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .webtoonsearch

import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await m.react('✨')

    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} lookism`)
    }

    try {
        const url = `${global.APIs.deline}/search/webtoon?q=${encodeURIComponent(text)}`
        const { data } = await axios.get(url)

        if (!data.status || !data.result.original.length) {
            throw 'Webtoon tidak ditemukan'
        }

        const w = data.result.original[0]

        const img = await axios.get(w.image, {
            responseType: 'arraybuffer',
            headers: {
                Referer: 'https://www.webtoons.com/'
            }
        })

        const caption = `📚 *${w.title}*
👤 Author: ${w.author}
👁️ ${w.viewCount}
🔗 ${w.link}`

        await conn.sendFile(m.chat, img.data, 'webtoon.jpg', caption, m)

    } catch (e) {
        console.error(e)
        m.reply('Gagal mencari Webtoon.')
    }
}

handler.command = ['webtoonsearch']

export default handler
handler.category = 'Tools'
handler.description = 'Webton'

