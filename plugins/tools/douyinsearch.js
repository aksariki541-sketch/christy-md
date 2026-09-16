// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/search/douyinsearch.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .douyinsearch

import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await m.react('✨')

    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} beautiful dance`)
    }

    try {
        const url = `${global.APIs.deline}/search/douyin?q=${encodeURIComponent(text)}`
        const { data } = await axios.get(url)

        if (!data.status) throw 'API error'

        await conn.sendFile(
            m.chat,
            data.video,
            'douyin.mp4',
            data.caption,
            m
        )

    } catch (e) {
        console.error(e)
        m.reply('Gagal mencari video Douyin.')
    }
}

handler.command = ['douyinsearch']

export default handler
handler.category = 'Tools'
handler.description = 'Douyinsearch'

