// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/upstik.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .upstik, .stickch

import { downloadContentFromMessage } from '../../lib/baileys.js'

const CH_ID = '120363403952337689@newsletter'

async function streamToBuffer(stream) {
 let buffer = Buffer.from([])

 for await (const chunk of stream) {
 buffer = Buffer.concat([buffer, chunk])
 }

 return buffer
}

let handler = async (m, { conn }) => {

 const quoted =
 m.message?.extendedTextMessage
 ?.contextInfo
 ?.quotedMessage

 if (!quoted?.stickerMessage) {
 return m.reply('❌ Reply sticker!')
 }

 try {

 const stream = await downloadContentFromMessage(
 quoted.stickerMessage,
 'sticker'
 )

 const buffer = await streamToBuffer(stream)

 await conn.sendMessage(
 CH_ID,
 {
 sticker: buffer
 },
 {
 quoted: {
 key: {
 remoteJid: 'status@broadcast',
 fromMe: false,
 id: 'Halo'
 },
 message: {
 conversation: '\u200e'
 }
 }
 }
 )

 m.reply('✅ Sticker berhasil dikirim ke channel!')

 } catch (e) {

 console.error(e)

 m.reply(
 `❌ Error\n\n${e.message || e}`
 )
 }
}

handler.command = ['upstik', 'stickch']
handler.owner = true

handler.category = 'Owner'
handler.description = 'Upstik'

export default handler