// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/tools-cap.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .caption, .cap

import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn, text, usedPrefix, command }) => {
 try {
 if (!text) {
 return m.reply(
 `Contoh:\n` +
 `${usedPrefix + command} teksnya\n` +
 `${usedPrefix + command} aku ganteng 😎`
 )
 }

 await m.react('🖼️')

 let q = m.quoted ? m.quoted : m
 let mime = (q.msg || q).mimetype || ''
 if (!mime) return m.reply('Reply gambar atau kirim gambar dengan caption')

 let media = await q.download()

 // 🔥 upload ke uguu
 let form = new FormData()
 form.append('files[]', media, 'image.jpg')

 let res = await axios.post('https://uguu.se/upload.php', form, {
 headers: form.getHeaders()
 })

 let url = res.data.files[0].url

 // encode text
 let teks = encodeURIComponent(text)

 // API Popcat
 let api = `https://api.popcat.xyz/v2/caption?image=${encodeURIComponent(url)}&text=${teks}&bottom=false&dark=true&fontsize=30`

 await conn.sendFile(m.chat, api, 'caption.png', '✨ Done', m)

 } catch (e) {
 console.error(e)
 m.reply('❌ Error bang')
 }
}

handler.command = ['caption', 'cap']

handler.category = 'Tools'
handler.description = 'Cap'

export default handler