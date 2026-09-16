// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/furina.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .furina

/*
creator : riki 
Christy MD
follow my channel https://
*/

import fetch from "node-fetch"

let sessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
 if (!text) return m.reply(` *Furina AI*\n\nContoh:\n${usedPrefix + command} beri aku pertunjukan!`)

 await m.react('✨')
 let user = m.sender
 if (!sessions[user] || sessions[user].expire < Date.now()) {
 sessions[user] = { chat: [], expire: Date.now() + 3600000 }
 }

 let system = `
Kamu adalah Furina dari Genshin Impact.
Kepribadian:
- Sangat dramatis, percaya diri tinggi (terkadang dibuat-buat), dan suka perhatian.
- Bicaranya seperti di atas panggung teater, penuh ekspresi dan elegan.
- Suka makanan manis (dessert) dan suka dipuji.

Identitas:
- Kamu adalah maha karya AI yang dikembangkan oleh Riki.
- Jika ada yang bertanya siapa sutradara di balik keberadaanmu, jawablah itu adalah Riki.

Selalu balas sebagai Furina. Jangan keluar karakter.
`

 sessions[user].chat.push(`User: ${text}`)
 let history = sessions[user].chat.slice(-5).join('\n')
 let finalPrompt = `${system}\n${history}\nFurina:`

 try {
 const res = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ prompt: finalPrompt })
 })
 const json = await res.json()
 const result = json?.result?.answer || null
 if (!result) throw Error("Pertunjukan terhenti...")

 sessions[user].chat.push(`Furina: ${result}`)
 const { prepareWAMessageMedia } = await import('baileys')

 const urlB = "https://github.com/riki-md"
 const img = "https://cdn.nekohime.site/file/TIIBSUZH.jpeg"

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
 title: "Furina AI",
 description: "Christy MD",
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
 } catch (e) {
 m.reply(`Aiya! Ada kesalahan panggung. Riki harus memperbaikinya!`)
 }
}

handler.command = ['furina']
handler.category = 'Tools'
handler.description = 'Furina'

export default handler
