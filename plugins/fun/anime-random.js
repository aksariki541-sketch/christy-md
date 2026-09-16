// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anime/anime-random.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .animerandom

import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
 try {
 let res = await fetch('https://lance-frank-asta.onrender.com/api/anime-random')
 let data = await res.json()

 if (!data.status) throw `❌ Gagal ambil data anime.`

 let info = data.random
 let caption = `🎌 *Anime Random*

🆔 ID: ${info.ID}
👤 Nama: ${info.name}
🎬 Movie: ${info.movie}`

 await conn.sendFile(m.chat, info.imgAnime, 'anime.jpg', caption, m)
 } catch (e) {
 console.error(e)
 throw `❌ Error mengambil data Anime!`
 }
}

handler.command = ['animerandom']
handler.category = 'Fun'
handler.description = 'Random'

export default handler