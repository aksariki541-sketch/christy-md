// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anime/bluearchive.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bluearchive

import fetch from 'node-fetch'

let handler = async (m, { conn, command }) => {
 try {
 const res = await fetch('https://api.siputzx.my.id/api/r/blue-archive')
 const buffer = await res.buffer()

 await conn.sendMessage(m.chat, {
 image: buffer,
 caption: `Waifu Random Blue Archive\n\nKlik tombol di bawah untuk waifu baru`,
 footer: 'Christy MD',

 nativeFlow: [
 {
 text: 'Next Waifu',
 id: `.${command}`
 }
 ]

 }, { quoted: m })
 
 } catch (err) {
 console.error(err)
 m.reply('Gagal memuat waifu')
 }
}

handler.command = ['bluearchive']
handler.category = 'Fun'
handler.description = 'Bluearchive'

export default handler