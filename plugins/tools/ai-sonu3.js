// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/ai-sonu3.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .sonu3

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) throw `Masukkan prompt!\nContoh: ${usedPrefix + command} A woman running`
m.reply('Sedang memproses, mohon tunggu...')
try {
let res = await fetch(`https://omegatech-api.dixonomega.tech/api/ai/sonu3?action=full&prompt=${encodeURIComponent(text)}`)
let json = await res.json()
if (!json.success) throw 'Gagal mengambil data dari API'
let { title, tags, duration, thumbnail, url, lyrics, source, attribution } = json
let caption = `*SONU 3 AI MUSIC*\n\n`
caption += `*Title:* ${title}\n`
caption += `*Tags:* ${tags}\n`
caption += `*Duration:* ${duration} seconds\n`
caption += `*Source:* ${source}\n`
caption += `*Attribution:* ${attribution}\n\n`
caption += `*Lyrics:*\n${lyrics}`
await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: caption }, { quoted: m })
await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m })
} catch (e) {
throw 'Terjadi kesalahan sistem'
}
}

handler.command = ['sonu3']

handler.category = 'Tools'
handler.description = 'Sonu3'

export default handler