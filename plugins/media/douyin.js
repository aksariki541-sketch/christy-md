// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/douyin.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .douyin

// Douyin downloader 
// API : https://api-faa.my.id
import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
 if (!args[0]) {
 return m.reply('Masukkan link Douyin!\n\nContoh:\n.douyin https://v.douyin.com/xxxxx')
 }

 try {
 let url = encodeURIComponent(args[0])
 let api = `https://api-faa.my.id/faa/douyin-down?url=${url}`

 let res = await fetch(api)
 let json = await res.json()

 if (!json.status || !json.result) {
 throw 'Gagal mengambil data Douyin'
 }

 let data = json.result
 let title = data.title || '-'
 let thumbnail = data.thumbnail
 let medias = data.medias || []

 let video = medias.find(v => v.type === 'video')

 if (!video?.url) {
 return m.reply('Video tidak ditemukan')
 }

 let caption = `
✨ *DOUYIN DOWNLOADER*

📌 *Judul:* ${title}
`.trim()

 let thumbBuffer = null
 if (thumbnail) {
 let t = await fetch(thumbnail)
 thumbBuffer = await t.buffer()
 }

 await conn.sendMessage(m.chat, {
 video: { url: video.url },
 caption,
 jpegThumbnail: thumbBuffer
 }, { quoted: m })

 } catch (e) {
 console.error(e)
 m.reply('Terjadi kesalahan saat mengambil video')
 }
}

handler.command = ['douyin']
handler.category = 'Media'
handler.description = 'Douyin'

export default handler