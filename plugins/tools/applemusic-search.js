// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/search/applemusic.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .applemusicsearch

import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await m.react('✨')

    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} cinta untuk starla`)
    }

    try {
        const url = `${global.APIs.deline}/search/applemusic?q=${encodeURIComponent(text)}`
        const { data } = await axios.get(url)

        if (!data.status || !data.result.length) {
            throw 'Lagu tidak ditemukan'
        }

        const list = data.result.slice(0, 5)

        let caption = `🍎 *Apple Music Search*\n\n`

        for (let i = 0; i < list.length; i++) {
            let v = list[i]
            caption += `${i + 1}. *${v.title}*\n`
            caption += `👤 ${v.artist.name}\n`
            caption += `🎵 ${v.song}\n`
            caption += `🔗 ${v.artist.url}\n\n`
        }

        m.reply(caption.trim())

    } catch (e) {
        console.error(e)
        m.reply('Gagal mencari di Apple Music.')
    }
}

handler.command = ['applemusicsearch']

export default handler
handler.category = 'Tools'
handler.description = 'Applemusic'

