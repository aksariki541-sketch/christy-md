// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/internet/pinvideo.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .pinterestvideo, .pinvid

/**
 🍀 Plugins Pinterest Video
 
 * CR Ponta Sensei
 * CH https://
 * WEB https://api.codeteam.web.id
 
**/

import fetch from 'node-fetch'
import { exec } from 'child_process'
import fs from 'fs'
import { promisify } from 'util'

const execAsync = promisify(exec)

let handler = async (m, { conn, text, usedPrefix, command }) => {
 if (!text) {
 return m.reply(`⚠️ *Contoh penggunaan:*\n${usedPrefix + command} [query]\n\n*Contoh:*\n${usedPrefix + command} anime\n${usedPrefix + command} landscape video\n${usedPrefix + command} cooking tutorial`)
 }
 
 try {
 conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } });
 
 const query = `${text} video`
 const apiUrl = `https://api.codeteam.web.id/api/v1/pinterest-search?query=${encodeURIComponent(query)}`
 
 const response = await fetch(apiUrl)
 const result = await response.json()
 
 if (!result.status === 'success' || !result.data || result.data.length === 0) {
 return m.reply('❌ *Tidak ditemukan video!* Coba dengan query lain.')
 }
 
 const videoItems = result.data.filter(item => 
 item.videoUrl && 
 item.videoUrl.includes('.m3u8') && 
 item.videoUrl !== 'gak ada'
 )
 
 if (videoItems.length === 0) {
 return m.reply('❌ *Video tidak ditemukan!* Tidak ada video .m3u8 dalam hasil pencarian.')
 }
 
 const randomVideo = videoItems[Math.floor(Math.random() * videoItems.length)]
 
 const tempDir = './tmp'
 if (!fs.existsSync(tempDir)) {
 fs.mkdirSync(tempDir, { recursive: true })
 }
 
 const timestamp = Date.now()
 const outputPath = `${tempDir}/pinvid_${timestamp}.mp4`
 
 const m3u8Url = randomVideo.videoUrl
 
 try {
 const ffmpegCmd = `ffmpeg -y -loglevel error -i "${m3u8Url}" -c copy -bsf:a aac_adtstoasc "${outputPath}"`
 await execAsync(ffmpegCmd)
 
 if (!fs.existsSync(outputPath)) {
 throw new Error('Video gagal diunduh')
 }
 
 const caption = `📌 *PINTEREST VIDEO*\n\n` +
 `*Judul:* ${randomVideo.title || 'Tidak ada judul'}\n` +
 `*Uploader:* ${randomVideo.pinner || 'Tidak diketahui'}\n` +
 `*Username:* ${randomVideo.pinnerUsername || 'Tidak diketahui'}\n` +
 `*Board:* ${randomVideo.boardName || 'Tidak diketahui'}\n` +
 `*ID:* ${randomVideo.id}\n\n` +
 `_Query: ${text}_`
 
 await conn.sendMessage(m.chat, {
 video: fs.readFileSync(outputPath),
 caption: caption,
 fileName: `pinvid_${timestamp}.mp4`,
 mimetype: 'video/mp4'
 }, { quoted: m })
 
 fs.unlinkSync(outputPath)
 
 } catch (ffmpegError) {
 console.error('FFmpeg error:', ffmpegError)
 
 const fallbackCaption = `🎬 *VIDEO DETAILS*\n\n` +
 `*Judul:* ${randomVideo.title || 'Tidak ada judul'}\n` +
 `*Uploader:* ${randomVideo.pinner || 'Tidak diketahui'}\n` +
 `*Username:* ${randomVideo.pinnerUsername || 'Tidak diketahui'}\n` +
 `*Board:* ${randomVideo.boardName || 'Tidak diketahui'}\n` +
 `*Video URL:* ${m3u8Url}\n` +
 `*Image:* ${randomVideo.imageUrl}\n` +
 `*ID:* ${randomVideo.id}\n\n` +
 `_Gagal mengonversi video, berikut detailnya_`
 
 conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
 await conn.sendMessage(m.chat, {
 text: fallbackCaption
 }, { quoted: m })
 
 }
 
 } catch (error) {
 console.error('Error:', error)
 m.reply('❌ *Terjadi kesalahan!* Gagal memproses permintaan. Silakan coba lagi nanti.')
 }
}

handler.command = ['pinterestvideo', 'pinvid']
handler.category = 'Tools'
handler.description = 'Pinvideo'

export default handler