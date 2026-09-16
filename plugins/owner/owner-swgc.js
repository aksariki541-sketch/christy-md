// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/owner-swgc.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .swgroup

import * as baileys from '../../lib/baileys.js'
import crypto from 'node:crypto'
import { PassThrough } from 'stream'
import ffmpeg from 'fluent-ffmpeg'

let handler = async (m, { conn, text }) => {
 const groups = Object.keys(conn.chats)
 .filter(v => v.endsWith('@g.us'))

 if (!text) {
 let list = []

 for (let i = 0; i < groups.length; i++) {
 const jid = groups[i]

 try {
 const meta = await conn.groupMetadata(jid)
 list.push(`${i + 1}. ${meta.subject}`)
 } catch {
 list.push(`${i + 1}. ${jid}`)
 }
 }

 return m.reply(`
📢 LIST GRUP

${list.join('\n')}

Contoh:
.swgc 1|Halo semua

Reply gambar/video/audio:
.swgc 1
`.trim())
 }

 const parts = text.split('|')
 const nomor = Number(parts[0]?.trim()) - 1

 if (isNaN(nomor) || !groups[nomor]) {
 throw 'Nomor grup tidak valid'
 }

 const target = groups[nomor]

 const quoted = m.quoted || m
 const mime = quoted?.mimetype || ''

 const caption =
 parts.slice(1).join('|').trim() ||
 quoted?.caption ||
 ''

 if (/image|video|audio/.test(mime)) {
 const buffer = await quoted.download().catch(() => null)

 if (!buffer) throw 'Gagal download media'

 let content = {}

 if (/image/.test(mime)) {
 content = {
 image: buffer,
 caption
 }
 } else if (/video/.test(mime)) {
 content = {
 video: buffer,
 caption
 }
 } else if (/audio/.test(mime)) {
 const vn = await toVN(buffer)

 content = {
 audio: vn,
 ptt: true,
 mimetype: 'audio/ogg; codecs=opus'
 }
 }

 await groupStatus(conn, target, content)

 return m.reply('✅ Status grup berhasil dikirim')
 }

 if (!caption) {
 throw `
Contoh:
.swgc 1|Halo semua

Atau reply media:
.swgc 1
`.trim()
 }

 await groupStatus(conn, target, {
 text: caption
 })

 m.reply('✅ Status grup berhasil dikirim')
}

async function groupStatus(conn, jid, content) {
 const inside = await baileys.generateWAMessageContent(content, {
 upload: conn.waUploadToServer
 })

 const secret = crypto.randomBytes(32)

 const msg = baileys.generateWAMessageFromContent(
 jid,
 {
 messageContextInfo: {
 messageSecret: secret
 },
 groupStatusMessageV2: {
 message: {
 ...inside,
 messageContextInfo: {
 messageSecret: secret
 }
 }
 }
 },
 {}
 )

 await conn.relayMessage(
 jid,
 msg.message,
 {
 messageId: msg.key.id
 }
 )

 return msg
}

async function toVN(buffer) {
 return new Promise((resolve, reject) => {
 const input = new PassThrough()
 const output = new PassThrough()
 const chunks = []

 input.end(buffer)

 ffmpeg(input)
 .noVideo()
 .audioCodec('libopus')
 .format('ogg')
 .on('error', reject)
 .on('end', () => resolve(Buffer.concat(chunks)))
 .pipe(output)

 output.on('data', chunk => chunks.push(chunk))
 })
}

handler.command = ['swgroup']

handler.owner = true

handler.category = 'Owner'
handler.description = 'Swgc'

export default handler