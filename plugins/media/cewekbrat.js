// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/maker/cewekbrat.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cewekbrat

import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} Halo riki`)
    }

    const url = `${global.APIs.deline}/maker/cewekbrat?text=${encodeURIComponent(text)}`

    try {
        const { data } = await axios.get(url, { responseType: 'arraybuffer' })
        await conn.sendFile(m.chat, data, 'cewekbrat.jpg', '', m)
    } catch (e) {
        console.error(e)
        m.reply('Gagal membuat gambar cewek brat.')
    }
}

handler.command = ['cewekbrat']

export default handler
handler.category = 'Media'
handler.description = 'Cewekbrat'

