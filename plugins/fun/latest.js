// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anime/latest.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .animelatest, .latestanime

import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
 try {
 const res = await fetch('https://api.sansekai.my.id/api/anime/latest')
 const data = await res.json()

 if (!data.length) throw 'Anime tidak ditemukan.'

 let teks = `🎌 *ANIME TERBARU*\n\n`

 data.forEach((anime, i) => {
 teks += `*${i + 1}. ${anime.judul}*\n`
 teks += `📺 Episode : ${anime.lastch}\n`
 teks += `🕒 Update : ${anime.lastup}\n`
 teks += `🔗 Link : https://sansekai.my.id/anime/${anime.url}\n\n`
 })

 await conn.sendFile(
 m.chat,
 data[0].cover,
 'anime.jpg',
 teks,
 m
 )

 } catch (e) {
 m.reply('❌ Gagal mengambil data anime terbaru')
 }
}

handler.command = ['animelatest', 'latestanime']
handler.category = 'Fun'
handler.description = 'Latest'

export default handler