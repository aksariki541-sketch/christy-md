// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/random/ppcp.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ppcp, .ppcouple

import axios from 'axios'

let handler = async (m, { conn }) => {
    try {
        const url = `${global.APIs.deline}/random/ppcouple`

        const { data } = await axios.get(url)

        if (!data.status) throw 'API error'

        const { cowo, cewe } = data.result

        await conn.sendFile(m.chat, cowo, 'cowo.jpg', '👦 PP Couple Cowo', m)
        await conn.sendFile(m.chat, cewe, 'cewe.jpg', '👧 PP Couple Cewe', m)

    } catch (e) {
        console.error(e)
        m.reply('Gagal mengambil PP couple.')
    }
}

handler.command = ['ppcp', 'ppcouple']

export default handler
handler.category = 'Fun'
handler.description = 'Ppcp'

