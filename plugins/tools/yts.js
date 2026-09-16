// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/search/yts.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .yts, .youtubesearch

/*
creator : riki 
Christy MD
follow my channel https://
*/

import yts from 'yt-search'

let handler = async (m, { text, conn, usedPrefix, command }) => {
 if (!text) throw `Masukkan judul!

Contoh:
${usedPrefix + command} dj 30 detik`

 let search = await yts(text)
 let videos = search.videos.slice(0, 10)

 if (!videos.length) throw 'Video tidak ditemukan.'

 let caption = `✨ *YouTube Search*\n`
 caption += `Query: ${text}\n\n`

 for (let i = 0; i < videos.length; i++) {
 let v = videos[i]
 caption += `*${i + 1}. ${v.title}*\n`
 caption += `⏱ ${v.timestamp} | 🍓 ${v.views.toLocaleString()}\n`
 caption += `📎 ${v.url}\n\n`
 }

 const { prepareWAMessageMedia } = await import('../../lib/baileys.js')

 const urlB = videos[0].url
 const img = videos[0].thumbnail

 const { imageMessage: image } = await prepareWAMessageMedia({
 image: { url: img }
 }, {
 upload: conn.waUploadToServer,
 mediaTypeOverride: 'thumbnail-link'
 })

 image.width = 1280
 image.height = 720

 const thumb = Buffer.from(await (await fetch(img)).arrayBuffer())

 await conn.sendMessage(m.chat, {
 text: caption,
 linkPreview: {
 'matched-text': urlB,
 title: "YouTube Search",
 description: text,
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

handler.command = ['yts', 'youtubesearch']
handler.category = 'Tools'
handler.description = 'Yts'

export default handler