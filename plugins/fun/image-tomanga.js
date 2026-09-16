// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/image/image-tomanga.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: manga→manga2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tomanga, .manga2

import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/image/.test(mime)) {
        return m.reply(`Reply gambar dengan caption\n${usedPrefix + command}`)
    }

    try {
        await m.reply('⏳ Processing...')

        const buffer = await q.download()
        if (!buffer) throw new Error('Gagal download gambar')

        const form = new FormData()
        form.append('image', buffer, {
            filename: 'image.jpg',
            contentType: mime
        })

        const url = 'https://api.theresav.biz.id/image/tomanga?apikey=qKdov&style=Ubah+foto+menjadi+ilustrasi+manga+Jepang+hitam+putih'

        const res = await axios.post(url, form, {
            headers: form.getHeaders(),
            responseType: 'arraybuffer'
        })

        const result = Buffer.from(res.data)

        if (!result || result.length < 1000) {
            throw new Error('Hasil gambar tidak valid')
        }

        await conn.sendMessage(m.chat, {
            image: result,
            caption: '📚 Done convert manga'
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        await m.reply(`❌ Error: ${e.message}`)
    }
}

handler.command = ['tomanga', 'manga2']

export default handler
handler.category = 'Fun'
handler.description = 'Image-tomanga'

