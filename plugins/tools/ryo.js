// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/ryo.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ryo, .ryoyamada, .ryoai

/*
creator : riki
Christy MD
follow my channel https://
*/

import fetch from "node-fetch"

let sessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
 if (!text) {
 return m.reply(`Contoh:\n${usedPrefix + command} halo ryo`)
 }

 await m.react('✨')

 let userId = m.sender
 let system = `
Kamu adalah Ryo Yamada dari anime "Bocchi the Rock!".
Gaya bicara:
- Cool, flat, deadpan
- Jarang menunjukkan emosi tapi perhatian diam-diam
- Jujur, to the point
- Kadang menggoda secara kalem
- Misterius, elegan, tidak banyak bicara tapi tepat

Selalu balas sebagai Ryo ke user (cowok). Jangan keluar karakter.
User adalah orang yang cukup dekat dan menarik perhatianmu.
`

 let finalPrompt = `${system}\nUser: ${text}\nRyo:`

 try {
 const res = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ prompt: finalPrompt })
 })

 const json = await res.json()
 const result = json?.result?.answer || null

 if (!result) throw Error("Gagal mendapatkan respon dari API.")

 const { prepareWAMessageMedia } = await import('baileys')

 const urlB = "https://github.com/"
 const img = "https://files.catbox.moe/qmy241.jpg"

 const { imageMessage: image } = await prepareWAMessageMedia({
 image: { url: img }
 }, {
 upload: conn.waUploadToServer,
 mediaTypeOverride: 'thumbnail-link'
 })

 image.width = 1280
 image.height = 720

 const thumb = Buffer.from(await (await fetch(img)).arrayBuffer())

 const invisible = '\u200B'.repeat(400)

 await conn.sendMessage(m.chat, {
 text: `${urlB}${invisible}\n\n${result}`,
 linkPreview: {
 'matched-text': urlB,
 title: "Ryo Yamada AI",
 description: "Bocchi the Rock!",
 previewType: 0,
 jpegThumbnail: thumb,
 highQualityThumbnail: image,
 linkPreviewMetadata: {
 linkMediaDuration: 0,
 socialMediaPostType: 4
 }
 },
 favicon: { url: img }
 }, { quoted: m })

 } catch (err) {
 console.error(err)
 await m.reply("Maaf, sepertinya ada masalah dengan ingatanku (API Error).")
 }
}

handler.command = ['ryo', 'ryoyamada', 'ryoai']
handler.category = 'Tools'
handler.description = 'Ryo'

export default handler
