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

 ❏ *PEMBUAT SC YANG GANTENG HILMAN*

❏ Al 
❏ irsan
❏ sanur 
❏ via 
❏ nesta
❏ rachel
❏ Nana
❏ mommy Kyu
❏ Ham
❏ han
❏ Renz 
❏ Rin
❏ Kano
❏ kaizen
❏ fahri
❏ gara
❏ hilman
❏ raynold
❏ Zynn
❏ Lynx
❏ Fikri 
❏ Ryu 

❏ ShirokamiRyzen (Penyedia Base Nao MD)
❏ ItsLiaaa (Penyedia Baileys)

❏ Penyedia Layanan API
❏ Penyedia Server/VPS

❏ Contributor
❏ Tester

❏ Riki (owenr Christy MD)

❏ Semua Supporter
❏ Semua User Christy MD
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