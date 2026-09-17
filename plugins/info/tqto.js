// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/tqto.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tqto, .thanks, .credits

// gausah hapus credit mending tambahin aja nama lu di list

import fs from 'fs'
import { prepareWAMessageMedia } from '../../lib/baileys.js'
import path from 'path'
import { fileURLToPath } from 'url'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')


let handler = async (m, { conn }) => {
 const urlB = 'https://github.com/riki-md'

 const thumb = fs.readFileSync(ROOT + '/media/thumb.jpg')

 const { imageMessage: image } = await prepareWAMessageMedia({
 image: thumb
 }, {
 upload: conn.waUploadToServer,
 mediaTypeOverride: 'thumbnail-link'
 })

 image.width = 1280
 image.height = 720

 const teks = `

 ❏ *Owner* : Riki
❏ *Developer* : Riki
❏ *Nama Bot* : Christy MD

`.trim()

 await conn.sendMessage(m.chat, {
 text: `${urlB}\n\n${teks}`,
 linkPreview: {
 'matched-text': urlB,
 title: 'Christy MD',
 description: 'Christy MD',
 previewType: 0,
 jpegThumbnail: thumb,
 highQualityThumbnail: image,
 linkPreviewMetadata: {
 linkMediaDuration: 0,
 socialMediaPostType: 4
 }
 }
 }, { quoted: m })
}

handler.command = ['tqto', 'thanks', 'credits']

handler.category = 'Main'
handler.description = 'Tqto'

export default handler