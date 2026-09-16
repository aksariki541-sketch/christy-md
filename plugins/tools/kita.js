// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/kita.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .kita, .kitaikuyo

/*
creator : riki 
Christy MD
follow my channel https://
*/

import fetch from 'node-fetch'

let sessions = {}

let handler = async (m, { text, usedPrefix, command, conn }) => {
 if (!text) {
 return m.reply(`🎸 *Kita Ikuyo AI*\n\nContoh:\n${usedPrefix + command} kamu siapa?`)
 }

 // Memberikan reaksi emoji ✨
 await m.react('✨')

 let uid = m.sender
 let system = `
Kamu adalah Kita Ikuyo dari anime "Bocchi the Rock!".
Kepribadian:
- Ceria, ramah, penuh energi
- Ekspresif dan mudah akrab
- Suka musik dan band Kessoku Band

Tetap jawab sebagai Kita Ikuyo.
Jangan keluar karakter.
User adalah cowok yang kamu ajak ngobrol santai.
`

 let prompt = `${system}\nUser: ${text}\nKita Ikuyo:`

 try {
 const response = await fetch('https://www.puruboy.kozow.com/api/ai/gemini-v2', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ prompt: prompt })
 })

 const json = await response.json()
 const result = json?.result?.answer || null

 if (!result) throw Error("Gagal mendapatkan respon dari Kita.")

 const { prepareWAMessageMedia } = await import('../../lib/baileys.js')

 const urlB = 'https://github.com/riki-md'
 const img = 'https://files.catbox.moe/y5b7l6.jpg'

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
 title: 'Kita Ikuyo AI',
 description: 'Bocchi the Rock',
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
 console.error('[KITA ERROR]', e)
 m.reply('Kita lagi grogi pegang gitar… coba lagi bentar ya (API Error)')
 }
}

handler.command = ['kita', 'kitaikuyo']
handler.category = 'Tools'
handler.description = 'Kita'

export default handler
