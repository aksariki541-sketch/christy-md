// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/donasi.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .donasi

let handler = async (m, { conn }) => {
 const { prepareWAMessageMedia } = await import('../../lib/baileys.js')

 const urlB = "https://github.com/riki-md"
 const img = "https://files.catbox.moe/0pdxsl.jpg"

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

 let text = `
*SUPPORT BOT Christy MD* 🤍

Jika bot ini bermanfaat untukmu,
kamu bisa memberikan dukungan lewat donasi ✨

https://saweria.co/riki
`

 await conn.sendMessage(m.chat, {
 text: `${urlB}${invisible}\n\n${text}`,
 linkPreview: {
 'matched-text': urlB,
 title: "Dukung Christy MD",
 description: "Saweria - riki",
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
}
handler.command = ['donasi']

handler.category = 'Main'
handler.description = 'Donasi'

export default handler